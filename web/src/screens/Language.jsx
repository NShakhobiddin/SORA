import React from 'react';
import { Icon, Flag } from '../icons.jsx';
import { useViewport, GradText, Card, LANGS } from '../components/shared.jsx';

export function Language({ T, selected, onPick, onHome }) {
  const { w } = useViewport();
  const flagSize = Math.round(Math.min(96, Math.max(64, w * 0.14)));
  return (
    <div className="wpage">
      <div className="topbar">
        <span />
        <Card T={T} className="pill" onClick={onHome} style={{ cursor: 'pointer', color: T.inkSoft }}>
          <Icon.home width={20} height={20} style={{ color: T.inkSoft }} />
          <span>Bosh sahifa</span>
        </Card>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vh, 44px)' }}>
        <h1 className="screen-title">
          <GradText gradient={T.textGrad}>Tilni tanlang</GradText>
        </h1>
        <div className="screen-sub" style={{ color: T.inkSoft }}>
          Choose your language · Выберите язык · 选择语言
        </div>
        <div style={{ margin: '20px auto 0', width: 90, height: 5, borderRadius: 6, background: T.primaryGrad }} />
      </div>

      <div className="lang-grid">
        {LANGS.map((l) => {
          const isSel = l.code === selected;
          return (
            <Card key={l.code} T={T} className="lang-card" onClick={() => onPick(l.code)} style={{
              borderColor: isSel ? T.primary : T.border,
              background: isSel ? T.primaryGrad : T.card,
              color: isSel ? '#fff' : T.ink,
              boxShadow: isSel
                ? `0 16px 44px ${T.primary}55, inset 0 1px 0 rgba(255,255,255,.25)` : undefined,
              transform: isSel ? 'translateY(-3px)' : 'none'
            }}>
              {isSel &&
                <div className="lang-check">
                  <Icon.check width={20} height={20} style={{ color: T.primary }} />
                </div>
              }
              <Flag code={l.code} size={flagSize} />
              <div className="lang-name">{l.name}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
