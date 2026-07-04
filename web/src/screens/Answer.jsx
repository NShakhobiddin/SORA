import React from 'react';
import { Icon } from '../icons.jsx';
import { Orb, Waveform } from '../components/Orb.jsx';
import { useViewport, Card } from '../components/shared.jsx';

const TTS = typeof window !== 'undefined' ? window.speechSynthesis : null;
const TTS_LANG = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US', tr: 'tr-TR', ar: 'ar-SA', fr: 'fr-FR', kz: 'kk-KZ', cn: 'zh-CN' };

// Javob matnini ovoz uchun tayyorlaydi (bo'limlar tabiiy o'qilishi uchun)
function speechText(result) {
  if (!result || !result.found) {
    return "Kechirasiz, bu savolga bazadan aniq javob topilmadi. Savolni boshqacharoq ifodalab ko'ring.";
  }
  const parts = [result.answer];
  if (result.important) parts.push(`Muhim: ${result.important}`);
  parts.push(`Huquqiy asos: ${result.legal || result.category}.`);
  return parts.join(' ').replace(/\s+—\s+/g, ' — ').replace(/\n+/g, '. ');
}

export function Answer({ T, lang, result, onBack, onHome, onAsk }) {
  const { w, h } = useViewport();
  const orbSize = Math.round(Math.min(w * 0.4, h * 0.22, 200));
  const wide = w >= 640;
  const found = result && result.found;
  const accent = found ? T.success : T.primary;

  const [speaking, setSpeaking] = React.useState(false);

  const speak = React.useCallback(() => {
    if (!TTS) return;
    try {
      TTS.cancel();
      const u = new SpeechSynthesisUtterance(speechText(result));
      u.lang = TTS_LANG[lang] || 'uz-UZ';
      u.rate = 0.98; u.pitch = 1;
      // Tanlangan tilga mos ovoz bo'lsa — tanlaymiz (himoyalangan)
      try {
        const voices = TTS.getVoices ? TTS.getVoices() : [];
        const pref = (u.lang || '').slice(0, 2);
        const match = voices.find((v) => v && typeof v.lang === 'string' && v.lang.toLowerCase().startsWith(pref));
        if (match) u.voice = match;
      } catch { /* ovoz tanlashda xato bo'lsa — standart ovoz bilan davom etamiz */ }
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      TTS.speak(u);
    } catch {
      setSpeaking(false);
    }
  }, [result, lang]);

  const toggleSpeak = () => {
    if (!TTS) return;
    if (speaking) { TTS.cancel(); setSpeaking(false); }
    else speak();
  };

  // Javob paydo bo'lganda uni avtomatik ovoz bilan o'qib beramiz
  React.useEffect(() => {
    if (!TTS || !result) return;
    const start = () => speak();
    // ovozlar hali yuklanmagan bo'lsa, kutamiz
    if (TTS.getVoices && TTS.getVoices().length === 0) {
      const t = setTimeout(start, 250);
      return () => { clearTimeout(t); TTS.cancel(); setSpeaking(false); };
    }
    start();
    return () => { TTS.cancel(); setSpeaking(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  return (
    <div className="wpage" style={{ alignItems: 'stretch' }}>
      <div className="topbar" style={{ alignItems: 'center' }}>
        <Card T={T} className="icon-btn" onClick={onBack} style={{ cursor: 'pointer' }}>
          <Icon.arrowLeft width={22} height={22} style={{ color: T.ink }} />
        </Card>
        <div style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 600, letterSpacing: '-0.02em', color: T.ink }}>Javob</div>
        <Card T={T} className="icon-btn" onClick={toggleSpeak}
          style={{ cursor: TTS ? 'pointer' : 'default', opacity: TTS ? 1 : 0.5,
                   boxShadow: speaking ? `0 0 0 3px ${accent}55` : undefined }}
          title={TTS ? (speaking ? "To'xtatish" : 'Ovoz bilan tinglash') : 'Ovoz qo‘llab-quvvatlanmaydi'}>
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

      {found ? <FoundCard T={T} result={result} /> : <NotFoundCard T={T} />}

      {/* Bog'liq savollar */}
      {found && result.related && result.related.length > 0 &&
        <div style={{ maxWidth: 860, width: '100%', marginInline: 'auto', marginTop: 'clamp(16px, 3vh, 24px)', textAlign: 'left' }}>
          <div className="label" style={{ color: T.inkMute, marginBottom: 10 }}>
            {result.source === 'qa' ? "O'xshash savollar" : "Tegishli bo'limlar"}
          </div>
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
        body={
          <div style={{ whiteSpace: 'pre-line' }}>
            {result.title && <b style={{ display: 'block', marginBottom: 6, color: T.ink }}>{result.title}</b>}
            {result.answer}
          </div>
        } />

      {result.important &&
        <>
          <div style={{ height: 1, background: T.border }} />
          <Section T={T}
            icon={<Icon.info width={26} height={26} style={{ color: T.primary }} />}
            iconBg={`${T.primary}22`} iconColor={T.primary}
            title="Muhim qism (hujjatdan)"
            body={<div style={{ whiteSpace: 'pre-line' }}>{result.important}</div>} />
        </>
      }

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
                  <div key={k.id} style={{ whiteSpace: 'pre-line' }}>
                    <b>{k.sarlavha}.</b> {k.matn.length > 500 ? k.matn.slice(0, 500) + '…' : k.matn}
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

function NotFoundCard({ T }) {
  return (
    <Card T={T} style={{ padding: 'clamp(20px, 3.5vw, 36px)', display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2.5vh, 22px)', maxWidth: 860, width: '100%', marginInline: 'auto', textAlign: 'left' }}>
      <Section T={T}
        icon={<Icon.info width={26} height={26} style={{ color: T.primary }} />}
        iconBg={`${T.primary}22`} iconColor={T.primary}
        title="Aniq javob topilmadi"
        body="Kechirasiz, bu savolga bazadan aniq javob topilmadi. Iltimos, savolni boshqacharoq — aniqroq so'zlar bilan ifodalab qayta bering." />
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
