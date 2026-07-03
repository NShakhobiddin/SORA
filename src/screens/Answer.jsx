import React from 'react';
import { Icon } from '../icons.jsx';
import { Orb, Waveform } from '../components/Orb.jsx';
import { useViewport, Card } from '../components/shared.jsx';

export function Answer({ T, onBack, onHome, onAsk }) {
  const { w, h } = useViewport();
  const orbSize = Math.round(Math.min(w * 0.4, h * 0.22, 200));
  const wide = w >= 640;
  return (
    <div className="wpage" style={{ alignItems: 'stretch' }}>
      <div className="topbar" style={{ alignItems: 'center' }}>
        <Card T={T} className="icon-btn" onClick={onBack} style={{ cursor: 'pointer' }}>
          <Icon.arrowLeft width={22} height={22} style={{ color: T.ink }} />
        </Card>
        <div style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 600, letterSpacing: '-0.02em', color: T.ink }}>Javob</div>
        <Card T={T} className="icon-btn">
          <Icon.speaker width={22} height={22} style={{ color: T.primary }} />
        </Card>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: 'clamp(8px, 2vh, 20px) 0' }}>
        {wide && <Waveform bars={10} height={50} color={T.success} active />}
        <Orb theme={T} size={orbSize} state="speaking" success />
        {wide && <Waveform bars={10} height={50} color={T.success} active />}
      </div>

      <Card T={T} style={{ padding: 'clamp(20px, 3.5vw, 36px)', display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.5vh, 24px)', maxWidth: 860, width: '100%', marginInline: 'auto', textAlign: 'left' }}>
        <AnswerSection T={T}
          icon={<Icon.check width={26} height={26} style={{ color: T.success }} />}
          iconBg={`${T.success}22`} iconColor={T.success}
          title="Qisqa javob"
          body={<>Mobil qurilmalarni olib kirishda <b>belgilangan tartibda deklaratsiya</b> talab qilinishi mumkin.</>} />
        <div style={{ height: 1, background: T.border }} />
        <AnswerSection T={T}
          icon={<Icon.info width={26} height={26} style={{ color: T.primary }} />}
          iconBg={`${T.primary}22`} iconColor={T.primary}
          title="Muhim shartlar"
          body={
            <ul style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Qurilma shaxsiy foydalanish uchun bo‘lsa.</li>
              <li>Miqdor tijorat maqsadida bo‘lmasa.</li>
              <li>Bojxona qonunchiligiga zid bo‘lmasa.</li>
            </ul>
          } />
        <div style={{ height: 1, background: T.border }} />
        <AnswerSection T={T}
          icon={<Icon.bulb width={26} height={26} style={{ color: '#EAB308' }} />}
          iconBg={'#EAB30822'} iconColor="#B48A06"
          title="Tavsiya"
          body={<>Agar deklaratsiya talab qilinsa, <b>“qizil” yo‘lakdan</b> o‘ting va bojxona xodimiga murojaat qiling.</>} />
        <div style={{ height: 1, background: T.border }} />
        <AnswerSection T={T}
          icon={<Icon.scale width={26} height={26} style={{ color: T.inkSoft }} />}
          iconBg={`${T.inkSoft}1E`} iconColor={T.inkSoft}
          title="Huquqiy asos"
          body={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(14px, 2.2vw, 19px)' }}>VMQ 778-son qaror · O‘zR BK 23-modda</span>} />
      </Card>

      <div className="actions">
        <button className="action-btn" onClick={onAsk} style={{
          background: T.card, border: `1px solid ${T.borderStrong}`, color: T.ink
        }}>
          <Icon.micOutline width={22} height={22} style={{ color: T.ink }} />
          Yana savol berish
        </button>
        <button className="action-btn" onClick={onHome} style={{
          background: T.primaryGrad, border: 'none', color: '#fff',
          boxShadow: `0 14px 32px ${T.primary}44`
        }}>
          <Icon.home width={22} height={22} style={{ color: '#fff' }} />
          Bosh sahifa
        </button>
      </div>

      <div className="hint" style={{ color: T.inkMute, justifyContent: 'center' }}>
        <Icon.clock width={18} height={18} style={{ color: T.inkMute }} />
        20 soniyadan keyin bosh sahifaga qaytadi
      </div>
    </div>
  );
}

function AnswerSection({ T, icon, iconBg, iconColor, title, body }) {
  return (
    <div style={{ display: 'flex', gap: 'clamp(12px, 2vw, 18px)', alignItems: 'flex-start' }}>
      <div style={{
        width: 'clamp(40px, 6vw, 52px)', height: 'clamp(40px, 6vw, 52px)',
        borderRadius: 14, background: iconBg,
        display: 'grid', placeItems: 'center', flex: 'none'
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 'clamp(16px, 2.6vw, 21px)', fontWeight: 700, color: iconColor, letterSpacing: '-0.01em', marginBottom: 5 }}>
          {title}:
        </div>
        <div style={{ fontSize: 'clamp(15px, 2.5vw, 20px)', fontWeight: 400, lineHeight: 1.45, color: T.inkSoft, textWrap: 'pretty' }}>
          {body}
        </div>
      </div>
    </div>
  );
}
