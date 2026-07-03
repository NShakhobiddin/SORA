import React from 'react';

export function useViewport() {
  const [v, setV] = React.useState({ w: window.innerWidth, h: window.innerHeight });
  React.useEffect(() => {
    const on = () => setV({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return v;
}

export function GradText({ children, gradient, style }) {
  return (
    <span style={{
      backgroundImage: gradient,
      WebkitBackgroundClip: 'text', backgroundClip: 'text',
      color: 'transparent', WebkitTextFillColor: 'transparent',
      display: 'inline-block', lineHeight: 1.15, ...style
    }}>{children}</span>
  );
}

export function Card({ T, style, children, onClick, className }) {
  return (
    <div className={className} onClick={onClick} style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 24,
      boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 16px 44px rgba(20,40,90,.07), 0 2px 6px rgba(20,40,90,.04)',
      ...style
    }}>{children}</div>
  );
}

export const LANGS = [
  { code: 'uz', name: 'O‘zbek', greeting: 'Mendan so‘rang' },
  { code: 'ru', name: 'Русский', greeting: 'Спросите меня' },
  { code: 'en', name: 'English', greeting: 'Ask me' },
  { code: 'cn', name: '中文', greeting: '问我' },
  { code: 'tr', name: 'Türkçe', greeting: 'Bana sorun' },
  { code: 'ar', name: 'العربية', greeting: 'اسألني' },
  { code: 'fr', name: 'Français', greeting: 'Demandez-moi' },
  { code: 'kz', name: 'Қазақша', greeting: 'Менен сұраңыз' },
];

export const LOGO_SRC = '/assets/logo-aeroinfo.png';
