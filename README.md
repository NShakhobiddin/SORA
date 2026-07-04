# SORA — Bojxonachi Sora veb-sayti

**TOSHKENT-AERO** ixtisoslashtirilgan bojxona kompleksi uchun ko‘p tilli bojxona ovozli yordamchisi veb-sayti (kiosk uslubida).

Multilingual customs voice-assistant website (kiosk-style) for the TOSHKENT-AERO specialized customs complex, built with React + Vite from the Claude Design handoff (`Sora Veb-sayt.html`).

## Mobil ilova (PWA)

Sayt **PWA** sifatida ishlaydi — telefon brauzerida ochib, "Bosh ekranga qo'shish"
(Add to Home Screen) orqali ilova kabi o'rnatish mumkin. O'rnatilgach to'liq ekranda,
manzil satrisiz, mobil ilovadek ochiladi va **oflayn** ham ishlaydi.

- `web/public/manifest.webmanifest` — ilova nomi, ikonkalar, `display: standalone`
- `web/public/sw.js` — service worker (network-first: onlaynda doim yangi versiya,
  oflaynda keshdan; "eski nusxa" muammosisiz)
- `web/public/icon-*.png`, `apple-touch-icon.png` — ilova ikonkalari (logotipdan)

Mobil uchun qo'shimcha: notch xavfsiz zonasi, sahifa cho'zilib yangilanmasligi,
iOS'da fokusda zoom bo'lmasligi.

## Bilim bazasi va AI javoblar

Sayt **rasmiy huquqiy hujjatlar bazasi** ustida ishlaydigan, brauzer ichidagi
(serversiz) qidiruv/AI dvigateliga ega. Baza `data-src/` dagi hujjatlardan
avtomatik shakllantiriladi va javob AYNAN hujjat matnidan beriladi —
hech narsa to'qib chiqarilmaydi.

**Manba hujjatlar** (`data-src/`): Bojxona kodeksi, VMQ-244 (tovar normalari),
VMQ-191 (dori vositalari), VMQ-66 (valyuta), VMQ-814 (yashil-qizil yo'laklar),
DBQ-2606 (yo'lovchi deklaratsiyasi), PF-104 (zargarlik), PQ-4508 (shaxsiy
ehtiyoj tovarlari), VMQ-700 (bojxona tartib-taomillari) + taqiqlangan/cheklangan
tovarlar jadvali (Excel).

Qo'shimcha: `passenger_questions_answers_vector.xlsx` — hujjatlar asosida
tayyorlangan **1000 ta yo'lovchi savol-javobi** (savol, javob, muhim iqtibos,
huquqiy asos, kalit so'zlar).

- `tools/build_kb.py` — hujjatlarni o'qib bazani yaratadi: kodeks *moddalar*
  bo'yicha, qarorlar *bandlar/ilovalar* bo'yicha bo'linadi, jadvallar matnga
  aylantiriladi; savol-javob Excel'i qa.json ga aylantiriladi.
  Ishga tushirish: `python3 tools/build_kb.py`
  (talab: `pip install python-docx openpyxl`)
- `web/src/data/qa.json` — 1000 ta tayyor savol-javob (asosiy javob qatlami)
- `web/src/data/kb.json` — 372 ta hujjat bo'lagi (zaxira qatlam + kontekst)
- `web/src/data/prohibited.json` — 32 ta taqiqlangan/cheklangan tovar (Excel'dan)
- `web/src/lib/search.js` — qidiruv dvigateli: avval 1000 savol-javobdan
  qidiradi, kuchli moslik bo'lmasa hujjat bo'laklaridan; o'zbekcha
  normalizatsiya (apostrof variantlari, ot/fe'l suffiks qisqartirish),
  sinonimlar (telefon→mobil, dollar→valyuta, aroq→alkogol...),
  IDF-vaznli skorlash, ishonch chegarasi

Savol berish: matn yozib **Enter/Javob olish** yoki **mikrofon** tugmasi (Chrome/Edge'da
Web Speech API orqali ovozli savol). Javob ekranida javob **ovoz bilan o'qib beriladi**
(text-to-speech) — dinamik tugma orqali qayta tinglash yoki to'xtatish mumkin.
Barcha ma'lumot ilovaga jamlanadi — internet yoki API kalit talab qilinmaydi.

**Bazani yangilash:** `data-src/` ga yangi/yangilangan hujjatni qo'ying,
`python3 tools/build_kb.py` ni ishga tushiring, so'ng `npm run build:pages`
qilib commit-push qiling.

> Kelajakdagi kengaytma: haqiqiy generativ LLM (masalan Claude API) ni qo'shish uchun
> maxfiy API kalitni saqlaydigan kichik backend (serverless funksiya) kerak bo'ladi;
> `search.js` topgan bo'laklarni LLM ga kontekst sifatida berish mumkin (RAG).

## Screens

1. **Bosh sahifa (Home)** — brand lockup, animated particle-sphere orb with the customs emblem, rotating multilingual greeting, "Boshlash · Start" CTA.
2. **Tilni tanlang (Language)** — 8-language flag grid: O‘zbek, Русский, English, 中文, Türkçe, العربية, Français, Қазақша.
3. **Savol (Ask)** — listening orb with waveforms, mic button, live transcript card.
4. **Javob (Answer)** — speaking orb (success green), structured answer card (short answer / conditions / recommendation / legal basis), auto-returns home after 20 s.

The animated airport background (drifting photo, glow fields, light sweep, floating particles, flying plane) is shared across all screens. View and language selection persist in `localStorage`.

## Saytni ochish · How to run

**1. Onlayn (GitHub Pages):** <https://nshakhobiddin.github.io/SORA/> — repo ildizidagi `index.html` tayyor build, Pages uni to‘g‘ridan-to‘g‘ri ko‘rsatadi. Har push'dan keyin sayt avtomatik yangilanadi.

**2. O‘rnatishsiz, oflayn:** [`sora-standalone.html`](./sora-standalone.html) (yoki `index.html`) faylini yuklab oling va ikki marta bosib oching — barcha rasm va kodlar bitta faylning ichida, server kerak emas.

*Online: the URL above. Offline: download `sora-standalone.html` and double-click it — everything is embedded in one file.*

**3. Dasturchi rejimi · Development** (manba kod `web/` papkasida):

```bash
npm install
npm run dev            # start dev server (http://localhost:5173)
npm run build          # production build → dist/ (works from any URL path)
npm run build:single   # self-contained single file → sora-standalone.html
npm run build:pages    # rebuild the root index.html served by GitHub Pages
npm run preview        # serve the production build locally
```

> Muhim: kod o‘zgartirilgandan keyin `npm run build:pages` ni ishga tushiring va yangilangan `index.html` + `sora-standalone.html` ni commit qiling — GitHub Pages aynan shu fayllarni ko‘rsatadi.

## Structure

```
index.html               BUILT site served by GitHub Pages (generated by build:pages)
sora-standalone.html     same build, kept as a download-and-open copy
web/
  index.html             dev entry HTML (fonts, meta)
  src/
    main.jsx             React entry point
    App.jsx              view router (home / lang / ask / answer) + kiosk auto-return
    theme.js             theme tokens (Cool Blue default; Premium Dark & Aurora Mesh available)
    styles.css           page scaffold, screen styles, all keyframe animations
    icons.jsx            inline SVG icon set + Flag badge component
    assets/              airport photo, customs emblem, touch icon, flag SVGs
    components/
      shared.jsx          useViewport, GradText, Card, language list
      Background.jsx      fixed animated airport background
      Orb.jsx             Fibonacci-lattice particle-sphere orb + Waveform
    screens/
      Home.jsx  Language.jsx  Ask.jsx  Answer.jsx
```
