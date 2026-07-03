import React from 'react';
import { Icon, Flag } from '../icons.jsx';
import { Orb, Waveform } from '../components/Orb.jsx';
import { useViewport, GradText, Card, LANGS } from '../components/shared.jsx';

export function Ask({ T, lang, onHome, onAnswer, onLang }) {
  const { w, h } = useViewport();
  const orbSize = Math.round(Math.min(w * 0.55, h * 0.32, 320));
  const wide = w >= 640;
  const L = LANGS.find((l) => l.code === lang) || LANGS[0];
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 'clamp(8px, 2vh, 24px)' }}>
        {wide && <Waveform bars={14} height={80} color={T.primarySoft} active />}
        <Orb theme={T} size={orbSize} state="listening" />
        {wide && <Waveform bars={14} height={80} color={T.primarySoft} active />}
      </div>

      <div style={{ textAlign: 'center', marginTop: 'clamp(20px, 4vh, 40px)' }}>
        <h2 className="screen-title" style={{ margin: 0 }}>
          <GradText gradient={T.textGrad}>Savolingizni ayting</GradText>
        </h2>
        <div className="screen-sub" style={{ color: T.inkSoft, maxWidth: 560, marginInline: 'auto', textWrap: 'pretty' }}>
          Mikrofonni bosing va bojxonaga oid savolingizni bemalol ayting.
        </div>
      </div>

      <button className="mic-btn" onClick={onAnswer} style={{
        background: T.primaryGrad,
        boxShadow: `0 24px 60px ${T.primary}66, inset 0 2px 0 rgba(255,255,255,.3), inset 0 -3px 0 rgba(0,0,0,.12), 0 0 0 10px ${T.primary}14, 0 0 0 20px ${T.primary}08`
      }}>
        <Icon.mic width={52} height={52} style={{ color: '#fff' }} />
      </button>

      <Card T={T} style={{ marginTop: 'auto', padding: 'clamp(18px, 3vw, 28px)', width: '100%', maxWidth: 760 }}>
        <div className="label" style={{ color: T.inkMute }}>Sizning savolingiz</div>
        <div className="transcript" style={{ color: T.ink }}>
          Telefon olib kirish uchun deklaratsiya kerakmi?
        </div>
        <div style={{ marginTop: 14 }}>
          <Waveform bars={wide ? 32 : 20} height={26} color={T.primary} active />
        </div>
      </Card>

      <div className="status" style={{ color: T.primary }}>
        <span style={{
          width: 10, height: 10, borderRadius: 10, background: T.primary,
          animation: 'orb-pulse-dot 1.2s ease-in-out infinite'
        }} />
        <span>Tinglanmoqda…</span>
      </div>
    </div>
  );
}
