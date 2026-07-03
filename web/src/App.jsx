import React from 'react';
import { themes } from './theme.js';
import { Background } from './components/Background.jsx';
import { Home } from './screens/Home.jsx';
import { Language } from './screens/Language.jsx';
import { Ask } from './screens/Ask.jsx';
import { Answer } from './screens/Answer.jsx';

const AUTO_HOME_MS = 20_000; // answer screen returns home after 20s (kiosk mode)

export default function App() {
  const T = themes.cool;
  const [view, setViewRaw] = React.useState(() => localStorage.getItem('sora-web-view') || 'home');
  const [lang, setLangRaw] = React.useState(() => localStorage.getItem('sora-web-lang') || 'uz');
  const go = (v) => { setViewRaw(v); localStorage.setItem('sora-web-view', v); window.scrollTo(0, 0); };
  const pickLang = (c) => { setLangRaw(c); localStorage.setItem('sora-web-lang', c); go('ask'); };

  React.useEffect(() => {
    if (view !== 'answer') return;
    const t = setTimeout(() => go('home'), AUTO_HOME_MS);
    return () => clearTimeout(t);
  }, [view]);

  return (
    <React.Fragment>
      <Background T={T} />
      <div key={view} className="view-fade" style={{ position: 'relative', zIndex: 1, color: T.ink }}>
        {view === 'home' && <Home T={T} onStart={() => go('lang')} />}
        {view === 'lang' && <Language T={T} selected={lang} onPick={pickLang} onHome={() => go('home')} />}
        {view === 'ask' && <Ask T={T} lang={lang} onHome={() => go('home')} onAnswer={() => go('answer')} onLang={() => go('lang')} />}
        {view === 'answer' && <Answer T={T} onBack={() => go('ask')} onHome={() => go('home')} onAsk={() => go('ask')} />}
      </div>
    </React.Fragment>
  );
}
