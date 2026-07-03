import React from 'react';
import { Icon } from '../icons.jsx';
import { Orb } from '../components/Orb.jsx';
import { useViewport, GradText, LANGS, LOGO_SRC } from '../components/shared.jsx';

export function Home({ T, onStart }) {
  const { w, h } = useViewport();
  const orbSize = Math.round(Math.min(w * 0.72, h * 0.42, 440));
  return (
    <div className="wpage">
      <div className="brand-lockup">
        <img
          className="brand-logo"
          src={LOGO_SRC}
          alt="Bojxona qo‘mitasi gerbi"
          style={{ filter: 'drop-shadow(0 10px 24px rgba(20,40,90,.28))' }} />
        <div className="brand-text">
          <div className="brand-kicker" style={{ color: T.inkMute }}>Bojxona qo‘mitasi</div>
          <div className="brand-name">
            <GradText gradient={T.textGrad} style={{ lineHeight: 1.05 }}>«TOSHKENT-AERO»</GradText>
          </div>
          <div className="brand-sub" style={{ color: T.inkSoft }}>ixtisoslashtirilgan bojxona kompleksi</div>
        </div>
      </div>

      <div className="home-kicker" style={{ color: T.inkMute }}>Bojxona yordamchisi · Customs assistant</div>
      <h1 className="home-wordmark">
        <GradText gradient="linear-gradient(135deg, #1E1B4B 0%, #3730A3 28%, #4F46E5 58%, #6366F1 80%, #818CF8 100%)" style={{ lineHeight: 0.9 }}>SORA</GradText>
      </h1>

      <div style={{ margin: 'clamp(16px, 3vh, 36px) 0' }}>
        <Orb theme={T} size={orbSize} state="idle" logo={LOGO_SRC} />
      </div>

      <Greeting T={T} />

      <button className="cta" onClick={onStart} style={{
        background: T.primaryGrad,
        boxShadow: `0 20px 52px ${T.primary}55, inset 0 1px 0 rgba(255,255,255,.25), inset 0 -2px 0 rgba(0,0,0,.1)`
      }}>
        <span style={{ flex: 1, textAlign: 'center' }}>Boshlash · Start</span>
        <span className="cta-arrow">
          <Icon.arrowRight width={22} height={22} style={{ color: '#fff' }} />
        </span>
      </button>

      <div className="hint" style={{ color: T.inkMute }}>
        <Icon.touch width={20} height={20} style={{ color: T.inkMute }} />
        <span>Ekranga teging · Touch to begin</span>
      </div>
    </div>
  );
}

function Greeting({ T }) {
  const total = LANGS.length;
  const cycleDur = 28;
  const slotDur = cycleDur / total;
  return (
    <div style={{ width: '100%', maxWidth: 760, marginInline: 'auto', marginBottom: 'clamp(16px, 3vh, 30px)' }}>
      <div className="greet-stage">
        {LANGS.map((l, i) =>
          <div key={l.code} style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0,
            animation: `greet-cycle ${cycleDur}s ease-in-out ${i * slotDur}s infinite`,
            willChange: 'opacity, transform'
          }}>
            <span className="greet-word" style={{
              backgroundImage: T.textGrad,
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              color: 'transparent', WebkitTextFillColor: 'transparent'
            }}>{l.greeting}</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 12 }}>
        {LANGS.map((l, i) =>
          <span key={l.code} style={{
            width: 8, height: 8, borderRadius: 8,
            background: T.primarySoft, opacity: .35,
            animation: `greet-dot ${cycleDur}s ease-in-out ${i * slotDur}s infinite`
          }} />
        )}
      </div>
    </div>
  );
}
