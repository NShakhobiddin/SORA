# SORA — Bojxonachi Sora veb-sayti

**TOSHKENT-AERO** ixtisoslashtirilgan bojxona kompleksi uchun ko‘p tilli bojxona ovozli yordamchisi veb-sayti (kiosk uslubida).

Multilingual customs voice-assistant website (kiosk-style) for the TOSHKENT-AERO specialized customs complex, built with React + Vite from the Claude Design handoff (`Sora Veb-sayt.html`).

## Screens

1. **Bosh sahifa (Home)** — brand lockup, animated particle-sphere orb with the customs emblem, rotating multilingual greeting, "Boshlash · Start" CTA.
2. **Tilni tanlang (Language)** — 8-language flag grid: O‘zbek, Русский, English, 中文, Türkçe, العربية, Français, Қазақша.
3. **Savol (Ask)** — listening orb with waveforms, mic button, live transcript card.
4. **Javob (Answer)** — speaking orb (success green), structured answer card (short answer / conditions / recommendation / legal basis), auto-returns home after 20 s.

The animated airport background (drifting photo, glow fields, light sweep, floating particles, flying plane) is shared across all screens. View and language selection persist in `localStorage`.

## Development

```bash
npm install
npm run dev       # start dev server
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

## Structure

```
index.html               entry HTML (fonts, meta)
public/assets/           airport photo, customs emblem, touch icon, flag SVGs
src/
  main.jsx               React entry point
  App.jsx                view router (home / lang / ask / answer) + kiosk auto-return
  theme.js               theme tokens (Cool Blue default; Premium Dark & Aurora Mesh available)
  styles.css             page scaffold, screen styles, all keyframe animations
  icons.jsx              inline SVG icon set + Flag badge component
  components/
    shared.jsx            useViewport, GradText, Card, language list
    Background.jsx         fixed animated airport background
    Orb.jsx                Fibonacci-lattice particle-sphere orb + Waveform
  screens/
    Home.jsx  Language.jsx  Ask.jsx  Answer.jsx
```
