// Inline SVG icons + premium flag badges (refined fidelity)

import touchIconUrl from './assets/touch-icon.png';
import flagUz from './assets/flags/uz.svg';
import flagRu from './assets/flags/ru.svg';
import flagEn from './assets/flags/en.svg';
import flagCn from './assets/flags/cn.svg';
import flagTr from './assets/flags/tr.svg';
import flagAr from './assets/flags/ar.svg';
import flagFr from './assets/flags/fr.svg';
import flagKz from './assets/flags/kz.svg';

const FLAG_SRC = {
  uz: flagUz, ru: flagRu, en: flagEn, cn: flagCn,
  tr: flagTr, ar: flagAr, fr: flagFr, kz: flagKz,
};

export const Icon = {
  chat: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M20 12c0 4.4-3.6 8-8 8-1.2 0-2.4-.3-3.4-.8L4 20l1-4-.4-.6C3.6 14 3 13 3 12c0-4.4 3.6-8 8-8s9 3.6 9 8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity=".12"/>
      <path d="M7.5 12.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  info: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity=".12"/>
      <path d="M12 11v6M12 7.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  bulb: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity=".12"/>
      <path d="M9 14a3.5 3.5 0 116 0c0 1-1 1.5-1 2.5h-4c0-1-1-1.5-1-2.5zM10.5 19h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  scale: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity=".12"/>
      <path d="M12 6v13M7 19h10M6 11l2.5-4 2.5 4a2.5 2.5 0 11-5 0zm7 0l2.5-4 2.5 4a2.5 2.5 0 11-5 0z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  mic: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor"/>
      <path d="M5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  micOutline: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  speaker: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/>
      <path d="M16 8c1.5 1 2.5 2.5 2.5 4s-1 3-2.5 4M18.5 5.5c2.5 1.5 4 4 4 6.5s-1.5 5-4 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  home: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  ),
  arrowLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M15 5l-7 7 7 7M8 12h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  arrowRight: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M9 5l7 7-7 7M16 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevDown: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  touch: ({ width = 24, height = 24, style = {}, ...rest }) => (
    <span
      {...rest}
      style={{
        display: 'inline-block',
        width, height,
        color: style.color || 'currentColor',
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url("${touchIconUrl}")`,
        maskImage: `url("${touchIconUrl}")`,
        WebkitMaskSize: 'contain', maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        verticalAlign: 'middle',
      }}
    />
  ),
  clock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// Real flag SVGs rendered as <img>, framed with rounded corners +
// premium shadow + subtle glass highlight to match the rest of the design.
export function Flag({ code, size = 120 }) {
  const w = size, h = size * 0.66;
  const R = Math.max(8, size * 0.14);
  return (
    <div style={{
      width: w, height: h, borderRadius: R, overflow: 'hidden',
      display: 'block', flex: 'none', position: 'relative',
      background: '#fff',
      boxShadow: '0 8px 24px rgba(15,30,60,.18), 0 2px 6px rgba(15,30,60,.10), inset 0 0 0 1px rgba(255,255,255,.55), inset 0 -1px 0 rgba(0,0,0,.08)',
    }}>
      <img src={FLAG_SRC[code]} alt=""
           style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}/>
      {/* glass highlight */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(255,255,255,.30) 0%, rgba(255,255,255,.10) 38%, rgba(255,255,255,0) 62%, rgba(0,0,0,.10) 100%)',
      }}/>
    </div>
  );
}
