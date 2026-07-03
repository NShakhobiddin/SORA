// Bojxonachi Sora — bilim bazasidan javob qidirish dvigateli (client-side)
//
// Foydalanuvchi savolini bazadagi savollar, savol variantlari, kalit
// so'zlar va bilim bo'laklariga solishtirib, eng mos huquqiy javobni
// qaytaradi. Serversiz, kalitsiz ishlaydi — barcha ma'lumot bazadan olinadi.

import QA from '../data/qa.json';
import KB from '../data/kb.json';
import PROHIBITED from '../data/prohibited.json';

// ── Matnni normallashtirish ─────────────────────────────────────
// O'zbek apostrof variantlarini (ʻ ' ' ` ‘ ’) bittaga keltiramiz,
// kichik harfga o'tkazamiz va faqat harf/raqamlarni qoldiramiz.
const APOS = /[ʻʼ‘’`´']/g;

export function normalize(s) {
  return (s || '')
    .toLowerCase()
    .replace(APOS, "'")
    .replace(/[^0-9a-zЀ-ӿ'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// "to'xtash so'zlari" — skorga hissa qo'shmaydigan keng tarqalgan so'zlar
const STOP = new Set([
  'va', 'yoki', 'uchun', 'bilan', 'ham', 'bu', 'shu', 'nima', 'qanday',
  'qancha', 'kerak', 'kerakmi', 'mumkin', 'mumkinmi', 'bo', 'boladi',
  'boladimi', 'men', 'meni', 'mening', 'siz', 'sizga', 'agar', 'the',
  'a', 'is', 'to', 'i', 'can', 'how', 'what', 'do', 'и', 'в', 'на', 'что',
  'как', 'ли', 'мне', 'я',
]);

function tokens(s) {
  return normalize(s)
    .split(' ')
    .filter((t) => t.length >= 2 && !STOP.has(t));
}

// ── Indeksni oldindan tayyorlash ────────────────────────────────
const QA_INDEX = QA.map((item) => {
  const keyPhrases = (item.kalit_sozlar || []).map(normalize).filter(Boolean);
  const questionText = [item.savol, ...(item.savol_variantlari || [])].join(' ');
  const tokenBag = new Set([
    ...tokens(questionText),
    ...keyPhrases.flatMap((p) => p.split(' ')),
    ...tokens(item.kategoriya),
  ]);
  return { item, keyPhrases, questionNorm: normalize(questionText), tokenBag };
});

// Qo'shimcha jadvallar (bilim bazasi, taqiqlangan tovarlar) uchun juda umumiy
// bojxona so'zlari — bular yolg'iz o'zi mos kelsa, aniq mavzuni bildirmaydi.
const DOMAIN_STOP = new Set([
  'olib', 'kirish', 'chiqish', 'kirsa', 'chiqsa', 'kiradi', 'chiqadi',
  'deklaratsiya', 'deklaratsiyalash', 'boj', 'bojxona', 'bojsiz', 'tovar',
  'tovarlar', 'norma', 'normasi', 'normalar', 'toʻlov', 'tolov', 'shaxsiy',
  'olibkirish', 'aeroport', 'chegara', 'qiymati', 'qiymat',
]);

const KB_INDEX = KB.map((item) => ({
  item,
  titleBag: new Set(tokens(item.sarlavha)),
  bodyBag: new Set([...tokens(item.matn), ...tokens(item.kategoriya)]),
}));

const PROHIBITED_INDEX = PROHIBITED.map((item) => ({
  item,
  titleBag: new Set(tokens(item.tovar)),
  bodyBag: new Set(tokens(item.cheklov_ruxsat_istisno)),
}));

// ── Skorlash ────────────────────────────────────────────────────
function scoreQA(entry, qNorm, qTokens) {
  let score = 0;
  // Kalit so'z iborasi to'liq savolda uchrasa — kuchli signal
  for (const kp of entry.keyPhrases) {
    if (!kp) continue;
    if (qNorm.includes(kp)) score += 6 + kp.split(' ').length * 2;
  }
  // Token kesishmasi
  for (const t of qTokens) {
    if (entry.tokenBag.has(t)) score += 2;
    // qisman moslik (raqamlar/o'zaklar): "telefon"~"telefonni"
    else if (t.length >= 4) {
      for (const bt of entry.tokenBag) {
        if (bt.length >= 4 && (bt.startsWith(t) || t.startsWith(bt))) { score += 1; break; }
      }
    }
  }
  return score;
}

// Qo'shimcha jadval yozuvini baholaydi. Faqat sarlavha/tovar nomida
// aniq (umumiy bo'lmagan) so'z mos kelsagina yozuvni nomzod deb hisoblaymiz —
// shu tarzda "olib kirish" kabi umumiy so'zlar noto'g'ri moslik bermaydi.
function scoreEntry(entry, qTokens) {
  let titleHit = false;
  let score = 0;
  for (const t of qTokens) {
    const significant = t.length >= 4 && !DOMAIN_STOP.has(t);
    if (entry.titleBag.has(t)) { score += 3; if (significant) titleHit = true; }
    else if (entry.bodyBag.has(t) && significant) score += 1;
  }
  return titleHit ? score : 0;
}

// ── Asosiy funksiya ─────────────────────────────────────────────
// Qaytaradi: { found, query, category, answer, legal, related[], kb[], prohibited[] }
export function answerQuestion(query) {
  const qNorm = normalize(query);
  const qTokens = [...new Set(tokens(query))];

  if (qTokens.length === 0) {
    return { found: false, query, reason: 'empty', suggestions: popularQuestions() };
  }

  const ranked = QA_INDEX
    .map((e) => ({ e, s: scoreQA(e, qNorm, qTokens) }))
    .sort((a, b) => b.s - a.s);

  const best = ranked[0];
  // Ishonch chegarasi: eng yaxshi natija juda past bo'lsa — "topilmadi"
  const MIN = 3;
  if (!best || best.s < MIN) {
    return { found: false, query, reason: 'no_match', suggestions: popularQuestions() };
  }

  const item = best.e.item;

  // Shu kategoriyadagi yoki keyingi eng yaqin savollar — bog'liq savollar
  const related = ranked
    .slice(1)
    .filter((r) => r.s >= Math.max(MIN, best.s * 0.35))
    .slice(0, 3)
    .map((r) => ({ id: r.e.item.id, savol: r.e.item.savol }));

  // Qo'shimcha kontekst: mos bilim bo'laklari (sarlavhada aniq moslik shart)
  const kb = KB_INDEX
    .map((e) => ({ e, s: scoreEntry(e, qTokens) }))
    .filter((r) => r.s >= 3)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2)
    .map((r) => r.e.item);

  // Taqiqlangan tovarlar jadvalidan mos yozuvlar (tovar nomida aniq moslik shart)
  const prohibited = PROHIBITED_INDEX
    .map((e) => ({ e, s: scoreEntry(e, qTokens) }))
    .filter((r) => r.s >= 3)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2)
    .map((r) => r.e.item);

  return {
    found: true,
    query,
    id: item.id,
    category: item.kategoriya,
    question: item.savol,
    answer: item.javob,
    legal: item.huquqiy_manba,
    related,
    kb,
    prohibited,
  };
}

// Savolni id bo'yicha to'g'ridan-to'g'ri olish (bog'liq savol chiplari uchun)
export function answerById(id) {
  const entry = QA.find((x) => x.id === id);
  if (!entry) return { found: false, reason: 'no_match', suggestions: popularQuestions() };
  return answerQuestion(entry.savol);
}

// Bosh sahifada/topilmaganda ko'rsatiladigan mashhur savollar
export function popularQuestions() {
  const ids = ['QA-001', 'QA-010', 'QA-014', 'QA-020', 'QA-006', 'QA-008'];
  const picked = ids.map((id) => QA.find((x) => x.id === id)).filter(Boolean);
  const list = picked.length ? picked : QA.slice(0, 6);
  return list.map((x) => ({ id: x.id, savol: x.savol }));
}

export const STATS = { qa: QA.length, kb: KB.length, prohibited: PROHIBITED.length };
