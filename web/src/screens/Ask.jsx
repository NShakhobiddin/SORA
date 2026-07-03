import React from 'react';
import { Icon, Flag } from '../icons.jsx';
import { Orb, Waveform } from '../components/Orb.jsx';
import { useViewport, GradText, Card, LANGS } from '../components/shared.jsx';

// Web Speech API (Chrome/Edge) — mavjud bo'lsa ovozli savol
const SR = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

const SR_LANG = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US', tr: 'tr-TR', ar: 'ar-SA', fr: 'fr-FR', kz: 'kk-KZ', cn: 'zh-CN' };

export function Ask({ T, lang, onHome, onAsk, onLang }) {
  const { w, h } = useViewport();
  const orbSize = Math.round(Math.min(w * 0.5, h * 0.28, 300));
  const wide = w >= 640;
  const L = LANGS.find((l) => l.code === lang) || LANGS[0];

  const [text, setText] = React.useState('');
  const [listening, setListening] = React.useState(false);
  const recRef = React.useRef(null);

  const submit = (q) => {
    const val = (q ?? text).trim();
    if (val) onAsk(val);
  };

  const toggleVoice = () => {
    if (!SR) { submit(); return; } // ovoz yo'q — matnni yuboramiz
    if (listening) { recRef.current && recRef.current.stop(); return; }
    const rec = new SR();
    rec.lang = SR_LANG[lang] || 'uz-UZ';
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = '';
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += chunk;
        else interim += chunk;
      }
      setText((finalText + interim).trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      const val = finalText.trim();
      if (val) onAsk(val);
    };
    recRef.current = rec;
    setListening(true);
    try { rec.start(); } catch { setListening(false); }
  };

  React.useEffect(() => () => { recRef.current && recRef.current.stop(); }, []);

  return (
    <div className="wpage">
      <div className="topbar">
        <Card T={T} className="pill" onClick={onLang} style={{ cursor: 'pointer' }}>
          <Flag code={L.code} size={30} />
          <span>{L.name}</span>
          <Icon.chevDown width={16} height={16} style={{ color: T.inkSoft }} />
        </Card>
        <Card T={T} className="pill" onClick={onHome} style={{ cursor: 'pointer', color: T.inkSoft }}>
          <Icon.home width={20} height={20} style={{ color: T.inkSoft }} />
          <span>Bosh sahifa</span>
        </Card>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 'clamp(4px, 1.5vh, 16px)' }}>
        {wide && <Waveform bars={12} height={64} color={T.primarySoft} active={listening} />}
        <Orb theme={T} size={orbSize} state={listening ? 'listening' : 'idle'} />
        {wide && <Waveform bars={12} height={64} color={T.primarySoft} active={listening} />}
      </div>

      <div style={{ textAlign: 'center', marginTop: 'clamp(14px, 3vh, 28px)' }}>
        <h2 className="screen-title" style={{ margin: 0 }}>
          <GradText gradient={T.textGrad}>Savolingizni bering</GradText>
        </h2>
        <div className="screen-sub" style={{ color: T.inkSoft, maxWidth: 620, marginInline: 'auto', textWrap: 'pretty' }}>
          Bojxonaga oid savolingizni yozing{SR ? ' yoki mikrofon orqali ayting' : ''}.
        </div>
      </div>

      {/* Savol kiritish maydoni */}
      <Card T={T} style={{ marginTop: 'clamp(18px, 3vh, 30px)', padding: 'clamp(10px, 1.6vw, 16px)', width: '100%', maxWidth: 760, display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          placeholder="Masalan: Telefon olib kirish uchun deklaratsiya kerakmi?"
          aria-label="Savol"
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            color: T.ink, fontFamily: 'var(--font-display)',
            fontSize: 'clamp(16px, 2.6vw, 22px)', fontWeight: 500,
            padding: 'clamp(10px, 1.6vh, 16px) clamp(8px, 1.4vw, 14px)', minWidth: 0,
          }}
        />
        <button
          onClick={toggleVoice}
          aria-label={SR ? 'Ovozli savol' : 'Savol berish'}
          style={{
            appearance: 'none', border: 'none', cursor: 'pointer', flex: 'none',
            width: 'clamp(52px, 8vw, 64px)', height: 'clamp(52px, 8vw, 64px)', borderRadius: 16,
            background: T.primaryGrad, display: 'grid', placeItems: 'center',
            boxShadow: `0 12px 30px ${T.primary}55, inset 0 2px 0 rgba(255,255,255,.3)`,
          }}
        >
          {SR
            ? <Icon.mic width={26} height={26} style={{ color: '#fff' }} />
            : <Icon.arrowRight width={26} height={26} style={{ color: '#fff' }} />}
        </button>
      </Card>

      <button
        onClick={() => submit()}
        style={{
          appearance: 'none', border: 'none', cursor: 'pointer', marginTop: 14,
          background: 'transparent', color: T.primary, fontWeight: 600,
          fontSize: 'clamp(15px, 2.2vw, 19px)', display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-display)',
        }}
      >
        <Icon.chat width={20} height={20} style={{ color: T.primary }} />
        Javob olish
      </button>

      {listening &&
        <div className="status" style={{ color: T.primary }}>
          <span style={{ width: 10, height: 10, borderRadius: 10, background: T.primary, animation: 'orb-pulse-dot 1.2s ease-in-out infinite' }} />
          <span>Tinglanmoqda…</span>
        </div>
      }
    </div>
  );
}
