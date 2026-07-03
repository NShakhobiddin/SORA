import React from 'react';
import { Icon } from '../icons.jsx';
import { Orb, Waveform } from '../components/Orb.jsx';
import { useViewport, Card } from '../components/shared.jsx';

export function Answer({ T, result, onBack, onHome, onAsk }) {
  const { w, h } = useViewport();
  const orbSize = Math.round(Math.min(w * 0.4, h * 0.22, 200));
  const wide = w >= 640;
  const found = result && result.found;
  const accent = found ? T.success : T.primary;

  return (
    <div className="wpage" style={{ alignItems: 'stretch' }}>
      <div className="topbar" style={{ alignItems: 'center' }}>
        <Card T={T} className="icon-btn" onClick={onBack} style={{ cursor: 'pointer' }}>
          <Icon.arrowLeft width={22} height={22} style={{ color: T.ink }} />
        </Card>
        <div style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 600, letterSpacing: '-0.02em', color: T.ink }}>Javob</div>
        <Card T={T} className="icon-btn">
          <Icon.speaker width={22} height={22} style={{ color: accent }} />
        </Card>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: 'clamp(8px, 2vh, 20px) 0' }}>
        {wide && <Waveform bars={10} height={50} color={accent} active />}
        <Orb theme={T} size={orbSize} state="speaking" success={found} />
        {wide && <Waveform bars={10} height={50} color={accent} active />}
      </div>

      {/* Foydalanuvchi savoli */}
      {result && result.query &&
        <div style={{ maxWidth: 860, width: '100%', marginInline: 'auto', marginBottom: 14, textAlign: 'left' }}>
          <div className="label" style={{ color: T.inkMute }}>Sizning savolingiz</div>
          <div style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 600, color: T.ink, letterSpacing: '-0.01em', textWrap: 'pretty' }}>
            {result.query}
          </div>
        </div>
      }

      {found ? <FoundCard T={T} result={result} /> : <NotFoundCard T={T} result={result} onAsk={onAsk} />}

      {/* Bog'liq savollar */}
      {found && result.related && result.related.length > 0 &&
        <div style={{ maxWidth: 860, width: '100%', marginInline: 'auto', marginTop: 'clamp(16px, 3vh, 24px)', textAlign: 'left' }}>
          <div className="label" style={{ color: T.inkMute, marginBottom: 10 }}>Tegishli savollar</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {result.related.map((r) => (
              <button key={r.id} onClick={() => onAsk(r.savol)} style={{
                appearance: 'none', cursor: 'pointer',
                background: T.card, border: `1px solid ${T.borderStrong}`, color: T.inkSoft,
                borderRadius: 999, padding: 'clamp(9px, 1.4vh, 12px) clamp(14px, 2.2vw, 20px)',
                fontSize: 'clamp(13px, 2vw, 17px)', fontWeight: 500, fontFamily: 'var(--font-display)', textAlign: 'left',
              }}>{r.savol}</button>
            ))}
          </div>
        </div>
      }

      <div className="actions">
        <button className="action-btn" onClick={onBack} style={{
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
        30 soniyadan keyin bosh sahifaga qaytadi
      </div>
    </div>
  );
}

function FoundCard({ T, result }) {
  return (
    <Card T={T} style={{ padding: 'clamp(20px, 3.5vw, 36px)', display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.5vh, 24px)', maxWidth: 860, width: '100%', marginInline: 'auto', textAlign: 'left' }}>
      {result.category &&
        <span style={{
          alignSelf: 'flex-start', fontSize: 'clamp(12px, 1.9vw, 15px)', fontWeight: 600,
          color: T.primary, background: `${T.primary}14`, borderRadius: 999,
          padding: '6px 14px', letterSpacing: '0.02em',
        }}>{result.category}</span>
      }

      <Section T={T}
        icon={<Icon.check width={26} height={26} style={{ color: T.success }} />}
        iconBg={`${T.success}22`} iconColor={T.success}
        title="Javob"
        body={result.answer} />

      {/* Taqiqlangan/cheklangan tovarlar jadvalidan qo'shimcha */}
      {result.prohibited && result.prohibited.length > 0 &&
        <>
          <div style={{ height: 1, background: T.border }} />
          <Section T={T}
            icon={<Icon.info width={26} height={26} style={{ color: T.primary }} />}
            iconBg={`${T.primary}22`} iconColor={T.primary}
            title="Cheklov va normalar"
            body={
              <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.prohibited.map((p, i) => (
                  <li key={i}>
                    <b>{p.tovar}</b> — <i>{p.holati}.</i> {p.cheklov_ruxsat_istisno}
                  </li>
                ))}
              </ul>
            } />
        </>
      }

      {/* Bilim bazasidan qo'shimcha izoh */}
      {result.kb && result.kb.length > 0 &&
        <>
          <div style={{ height: 1, background: T.border }} />
          <Section T={T}
            icon={<Icon.bulb width={26} height={26} style={{ color: '#EAB308' }} />}
            iconBg={'#EAB30822'} iconColor="#B48A06"
            title="Qo'shimcha"
            body={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.kb.map((k) => (
                  <div key={k.id}>
                    <b>{k.sarlavha}.</b> {k.matn}
                  </div>
                ))}
              </div>
            } />
        </>
      }

      {result.legal &&
        <>
          <div style={{ height: 1, background: T.border }} />
          <Section T={T}
            icon={<Icon.scale width={26} height={26} style={{ color: T.inkSoft }} />}
            iconBg={`${T.inkSoft}1E`} iconColor={T.inkSoft}
            title="Huquqiy asos"
            body={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(14px, 2.2vw, 19px)' }}>{result.legal}</span>} />
        </>
      }
    </Card>
  );
}

function NotFoundCard({ T, result, onAsk }) {
  const suggestions = (result && result.suggestions) || [];
  return (
    <Card T={T} style={{ padding: 'clamp(20px, 3.5vw, 36px)', display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2.5vh, 22px)', maxWidth: 860, width: '100%', marginInline: 'auto', textAlign: 'left' }}>
      <Section T={T}
        icon={<Icon.info width={26} height={26} style={{ color: T.primary }} />}
        iconBg={`${T.primary}22`} iconColor={T.primary}
        title="Aniq javob topilmadi"
        body="Kechirasiz, bu savolga bazadan aniq javob topilmadi. Savolni boshqacharoq ifodalang yoki quyidagi ko'p so'raladigan savollardan birini tanlang." />
      {suggestions.length > 0 &&
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {suggestions.map((s) => (
            <button key={s.id} onClick={() => onAsk(s.savol)} style={{
              appearance: 'none', cursor: 'pointer',
              background: T.card, border: `1px solid ${T.borderStrong}`, color: T.inkSoft,
              borderRadius: 999, padding: 'clamp(9px, 1.4vh, 12px) clamp(14px, 2.2vw, 20px)',
              fontSize: 'clamp(13px, 2vw, 17px)', fontWeight: 500, fontFamily: 'var(--font-display)', textAlign: 'left',
            }}>{s.savol}</button>
          ))}
        </div>
      }
    </Card>
  );
}

function Section({ T, icon, iconBg, iconColor, title, body }) {
  return (
    <div style={{ display: 'flex', gap: 'clamp(12px, 2vw, 18px)', alignItems: 'flex-start' }}>
      <div style={{
        width: 'clamp(40px, 6vw, 52px)', height: 'clamp(40px, 6vw, 52px)',
        borderRadius: 14, background: iconBg,
        display: 'grid', placeItems: 'center', flex: 'none'
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
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
