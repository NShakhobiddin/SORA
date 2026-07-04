// Bojxonachi Sora — huquqiy hujjatlar bazasidan javob qidirish (client-side)
//
// Baza tools/build_kb.py tomonidan data-src/ dagi rasmiy hujjatlardan
// (Bojxona kodeksi, VMQ-244/191/66/814/700, DBQ-2606, PF-104, PQ-4508 va
// taqiqlangan tovarlar jadvali) shakllantiriladi. Foydalanuvchi savoliga
// eng mos hujjat bo'lagi topilib, javob AYNAN o'sha matndan beriladi —
// hech narsa to'qib chiqarilmaydi.

import KB from '../data/kb.json';
import PROHIBITED from '../data/prohibited.json';

// ── Matnni normallashtirish ─────────────────────────────────────
// O'zbek apostrof variantlari (ʻ ʼ ' ' `) bittaga keltiriladi.
const APOS = /[ʻʼ‘’`´']/g;

export function normalize(s) {
  return (s || '')
    .toLowerCase()
    .replace(APOS, "'")
    .replace(/[^0-9a-zа-яё'\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// To'xtash so'zlari — mazmun tashimaydiganlar
const STOP = new Set([
  'va', 'yoki', 'uchun', 'bilan', 'ham', 'bu', 'shu', 'ushbu', 'mazkur',
  'nima', 'qanday', 'qancha', 'qachon', 'nechta', 'necha', 'kerak',
  'kerakmi', 'mumkin', 'mumkinmi', 'bo', "bo'lsa", "bo'ladi", "bo'ladimi",
  'boladi', 'boladimi', 'bolsa', 'men', 'meni', 'mening', 'menga', 'siz',
  'sizga', 'agar', 'yana', 'esa', 'edi', 'emas', 'haqida', 'togrisida',
  "to'g'risida", 'boyicha', "bo'yicha", 'the', 'a', 'is', 'to', 'i', 'can',
  'how', 'what', 'do', 'и', 'в', 'на', 'что', 'как', 'ли', 'мне', 'я', 'можно',
]);

// Konservativ o'zbekcha suffiks qisqartirish — "telefonni/telefonda/telefonlar"
// bir xil o'zakka kelishi uchun. O'zak kamida 4 belgi qoladi.
const SUFFIXES = [
  'larimizni', 'laringiz', 'larining', 'lariga', 'larida', 'laridan',
  'larini', 'larning', 'larni', 'larga', 'larda', 'lardan', 'lari', 'lar',
  'ning', 'imizni', 'ingiz', 'lariga', 'sining', 'sini', 'siga', 'sida',
  'sidan', 'si', 'ni', 'ga', 'da', 'dan', 'ini', 'iga', 'ida', 'idan', 'i',
];

function stem(t) {
  let s = t;
  let changed = true;
  let guard = 0;
  while (changed && guard < 3) {
    changed = false;
    guard += 1;
    for (const suf of SUFFIXES) {
      if (s.length - suf.length >= 4 && s.endsWith(suf)) {
        s = s.slice(0, -suf.length);
        changed = true;
        break;
      }
    }
  }
  return s;
}

function tokens(s) {
  return normalize(s)
    .split(/[\s-]+/)
    .filter((t) => t.length >= 2 && !STOP.has(t))
    .map(stem);
}

// So'zlashuv so'zlari → hujjat terminlariga kengaytirish
const SYNONYMS = {
  aeroport: ['havo', 'transport'],
  samolyot: ['havo', 'transport'],
  limit: ['norma', 'miqdoriy'],
  summa: ['norma', 'qiymat'],
  telefon: ['mobil', 'telefon'],
  smartfon: ['mobil', 'telefon'],
  ayfon: ['mobil', 'telefon'],
  iphone: ['mobil', 'telefon'],
  pul: ['valyuta', 'naqd'],
  dollar: ['valyuta', 'naqd', 'aqsh'],
  som: ['valyuta', 'naqd', 'milliy'],
  evro: ['valyuta', 'naqd'],
  aroq: ['alkogol', 'spirtli'],
  vino: ['alkogol', 'spirtli'],
  pivo: ['alkogol', 'pivo'],
  ichimlik: ['alkogol', 'spirtli'],
  sigaret: ['tamaki', 'sigaret'],
  sigareta: ['tamaki', 'sigaret'],
  chekish: ['tamaki'],
  nos: ['tamaki'],
  dori: ['dori'],
  oltin: ['zargarlik', 'qimmatbaho', 'oltin'],
  kumush: ['zargarlik', 'qimmatbaho', 'kumush'],
  taqinchoq: ['zargarlik', 'qimmatbaho'],
  mashina: ['transport', 'avtotransport'],
  avtomobil: ['transport', 'avtotransport'],
  it: ['hayvon'],
  mushuk: ['hayvon'],
  quroll: ['qurol'],
  miltiq: ['qurol'],
  pichoq: ['qurol', 'sovuq'],
  yolak: ["yo'lak"],
  koridor: ["yo'lak"],
  bagaj: ['bagaj', 'yuk'],
  chemodan: ['bagaj', 'yuk'],
  posilka: ['pochta', 'kuryerlik'],
};

function expand(qTokens) {
  const out = new Set(qTokens);
  for (const t of qTokens) {
    const syn = SYNONYMS[t];
    if (syn) syn.map(stem).forEach((x) => out.add(x));
  }
  return [...out];
}

// ── Indeks: har bo'lak uchun token chastotalari + IDF ───────────
const INDEX = KB.map((item) => {
  const titleTf = new Map();
  for (const t of tokens(item.sarlavha)) titleTf.set(t, (titleTf.get(t) || 0) + 1);
  const bodyTf = new Map();
  for (const t of tokens(item.matn)) bodyTf.set(t, (bodyTf.get(t) || 0) + 1);
  const len = Math.max(20, item.matn.length / 6); // taxminiy so'z soni
  return { item, titleTf, bodyTf, lenNorm: 1 / (1 + Math.log(1 + len / 80)) };
});

const DF = new Map();
for (const e of INDEX) {
  const seen = new Set([...e.titleTf.keys(), ...e.bodyTf.keys()]);
  for (const t of seen) DF.set(t, (DF.get(t) || 0) + 1);
}
const N_DOCS = INDEX.length;
// idf^1.5 — kam uchraydigan (aniq mavzuli) so'zlar ustunlik qiladi:
// "guruch" kabi tovar nomi "olib/kirish" kabi umumiy so'zlardan kuchli
const idf = (t) => Math.pow(Math.log(1 + N_DOCS / (1 + (DF.get(t) || 0))), 1.5);

const PROHIBITED_INDEX = PROHIBITED.map((item) => ({
  item,
  titleBag: new Set(tokens(item.tovar)),
  bodyBag: new Set(tokens(item.cheklov_ruxsat_istisno)),
}));

// Umumiy bojxona so'zlari — yolg'iz o'zi tovar jadvalini "ochmasin"
const DOMAIN_STOP = new Set(
  ['olib', 'kirish', 'chiqish', 'kir', 'chiq', 'deklaratsiya', 'boj',
    'bojxona', 'bojsiz', 'tovar', 'norma', 'normasi', 'miqdor', 'shaxs',
    'jismoniy', 'chegara', 'punkt', 'respublika', 'ozbekiston',
  ].map(stem),
);

function scoreChunk(entry, qTokens) {
  let score = 0;
  let hits = 0;
  let titleHits = 0;
  for (const t of qTokens) {
    const w = idf(t);
    const inTitle = entry.titleTf.get(t) || 0;
    const inBody = entry.bodyTf.get(t) || 0;
    if (inTitle || inBody) hits += 1;
    if (inTitle) {
      // sarlavha bonusi faqat aniq mavzuli (kam uchraydigan) so'zlarga —
      // "olib/kirish" kabi umumiy so'z sarlavhani sun'iy ko'tarmasin
      const rare = (DF.get(t) || 0) / N_DOCS < 0.28;
      score += w * (rare ? 2.2 : 1.0) * Math.min(2, inTitle);
      if (rare) titleHits += 1;
    }
    if (inBody) score += w * Math.min(2.5, inBody);
  }
  if (hits === 0) return { s: 0, hits: 0, titleHits: 0 };
  // kamida ikkita turli so'z mos kelsa ishonch ortadi
  const cover = hits / Math.max(2, qTokens.length);
  return { s: score * entry.lenNorm * (0.6 + 0.6 * cover), hits, titleHits };
}

function scoreProhibited(entry, qTokens) {
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
// Qaytadi: { found, query, category, title, answer, legal, url,
//            related[], kb[], prohibited[] }
export function answerQuestion(query) {
  const raw = [...new Set(tokens(query))];
  if (raw.length === 0) return { found: false, query, reason: 'empty' };
  const qTokens = expand(raw);

  const ranked = INDEX
    .map((e) => {
      const r = scoreChunk(e, qTokens);
      return { e, s: r.s, hits: r.hits, titleHits: r.titleHits };
    })
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s);

  const best = ranked[0];
  const MIN = 1.15;
  // Ishonch sharti: yetarli ball VA (kamida 2 xil so'z mosligi YOKI
  // sarlavhada kuchli moslik). Bitta tasodifiy so'z mosligi javob emas.
  const confident = best && best.s >= MIN &&
    (best.hits >= 2 || (best.titleHits >= 1 && best.s >= MIN * 1.6));
  if (!confident) return { found: false, query, reason: 'no_match' };

  const item = best.e.item;

  // Qo'shimcha: keyingi eng mos bo'laklar (boshqa sarlavhalardan)
  const extras = [];
  for (const r of ranked.slice(1)) {
    if (extras.length >= 2) break;
    if (r.s < Math.max(MIN, best.s * 0.45)) break;
    if (r.e.item.sarlavha.split(' (davomi')[0] === item.sarlavha.split(' (davomi')[0]) continue;
    extras.push(r.e.item);
  }

  // Tegishli bo'lak sarlavhalari — chip sifatida qayta so'rash uchun
  const related = extras.slice(0, 3).map((x) => ({ id: x.id, savol: x.sarlavha }));

  // Taqiqlangan/cheklangan tovarlar jadvalidan mos yozuvlar
  const prohibited = PROHIBITED_INDEX
    .map((e) => ({ e, s: scoreProhibited(e, qTokens) }))
    .filter((r) => r.s >= 3)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2)
    .map((r) => r.e.item);

  return {
    found: true,
    query,
    category: item.manba.split(',')[0],
    title: item.sarlavha,
    answer: item.matn,
    legal: `${item.sarlavha} · ${item.hujjat}`,
    url: item.url || '',
    related,
    kb: extras.slice(0, 2),
    prohibited,
  };
}

export const STATS = { kb: KB.length, prohibited: PROHIBITED.length };

// Sozlash/diagnostika uchun: savol bo'yicha eng yuqori ballar
export function debugScores(query, topN = 5) {
  const raw = [...new Set(tokens(query))];
  const qTokens = expand(raw);
  return {
    qTokens,
    top: INDEX
      .map((e) => ({ e, ...scoreChunk(e, qTokens) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, topN)
      .map((r) => ({
        id: r.e.item.id, sarlavha: r.e.item.sarlavha,
        s: +r.s.toFixed(2), hits: r.hits, titleHits: r.titleHits,
      })),
  };
}
