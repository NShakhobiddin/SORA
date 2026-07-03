import React from 'react';
import { themes } from './theme.js';
import { Background } from './components/Background.jsx';
import { Home } from './screens/Home.jsx';
import { Language } from './screens/Language.jsx';
import { Ask } from './screens/Ask.jsx';
import { Answer } from './screens/Answer.jsx';
import { answerQuestion } from './lib/search.js';

const AUTO_HOME_MS = 30_000; // answer screen returns home after 30s (kiosk mode)

export default function App() {
  const T = themes.cool;
  const [view, setViewRaw] = React.useState(() => localStorage.getItem('sora-web-view') || 'home');
  const [lang, setLangRaw] = React.useState(() => localStorage.getItem('sora-web-lang') || 'uz');
  const [result, setResult] = React.useState(null); // { found, answer, legal, related, ... }

  const go = (v) => { setViewRaw(v); localStorage.setItem('sora-web-view', v); window.scrollTo(0, 0); };
  const pickLang = (c) => { setLangRaw(c); localStorage.setItem('sora-web-lang', c); go('ask'); };

  // Savolni bilim bazasida qidirib, javob ekraniga o'tamiz
  const ask = (query) => {
    const q = (query || '').trim();
    if (!q) return;
    setResult(answerQuestion(q));
    go('answer');
  };

  React.useEffect(() => {
    if (view !== 'answer') return;
    const t = setTimeout(() => go('home'), AUTO_HOME_MS);
    return () => clearTimeout(t);
  }, [view]);

  // Sahifa qayta ochilganda 'answer' saqlangan bo'lsa-yu, natija yo'q bo'lsa — savolga qaytamiz
  React.useEffect(() => {
    if (view === 'answer' && !result) go('ask');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <React.Fragment>
      <Background T={T} />
      <div key={view} className="view-fade" style={{ position: 'relative', zIndex: 1, color: T.ink }}>
        {view === 'home' && <Home T={T} onStart={() => go('lang')} />}
        {view === 'lang' && <Language T={T} selected={lang} onPick={pickLang} onHome={() => go('home')} />}
        {view === 'ask' && <Ask T={T} lang={lang} onHome={() => go('home')} onAsk={ask} onLang={() => go('lang')} />}
        {view === 'answer' && <Answer T={T} result={result} onBack={() => go('ask')} onHome={() => go('home')} onAsk={ask} />}
      </div>
    </React.Fragment>
  );
}
