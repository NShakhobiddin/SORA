import React from 'react';

// ── Fixed animated background (airport photo + fx) ──
const PARTICLES = (() => {
  let s = 42;
  const rand = (a, b) => { s = s * 16807 % 2147483647; return a + s / 2147483647 * (b - a); };
  const arr = [];
  for (let i = 0; i < 14; i++) {
    const floatUp = i % 2 === 0;
    const size = Math.round(rand(4, 11));
    arr.push(floatUp ? {
      x: rand(4, 94).toFixed(1), y: rand(55, 104).toFixed(1), size, glow: size * 2,
      anim: `particleFloat ${rand(14, 26).toFixed(1)}s linear ${rand(0, 18).toFixed(1)}s infinite`
    } : {
      x: rand(4, 94).toFixed(1), y: rand(6, 90).toFixed(1), size, glow: size * 2,
      anim: `particleTwinkle ${rand(3, 7).toFixed(1)}s ease-in-out ${rand(0, 6).toFixed(1)}s infinite`
    });
  }
  return arr;
})();

export function Background({ T }) {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0, background: T.bg }}>
      <img
        src="/assets/bg-airport.png" alt=""
        style={{
          position: 'absolute', left: 0, top: 0, width: '100%', height: '100%',
          objectFit: 'cover', transformOrigin: '50% 45%',
          animation: 'bgDrift 36s ease-in-out infinite alternate',
          opacity: 0.9
        }} />
      <div style={{
        position: 'absolute', left: '50%', top: '38%', width: '80vmax', height: '80vmax',
        transform: 'translate(-50%,-50%)', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,.7) 0%, rgba(255,255,255,0) 65%)',
        animation: 'glowBreath 9s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', left: '4%', top: '4%', width: '34vmax', height: '34vmax', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,.26) 0%, rgba(167,139,250,0) 68%)',
        animation: 'globeGlow 11s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', right: '2%', bottom: '2%', width: '40vmax', height: '40vmax', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(96,165,250,.28) 0%, rgba(96,165,250,0) 68%)',
        animation: 'globeGlow 11s ease-in-out infinite', animationDelay: '5.5s'
      }} />
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, bottom: 0, width: '38%',
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.5) 50%, rgba(255,255,255,0) 100%)',
          animation: 'lightSweep 14s ease-in-out infinite'
        }} />
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: '14%', height: 0,
        animation: 'planeFlyXW 26s linear infinite'
      }}>
        <svg width="72" height="72" viewBox="0 0 24 24" fill="rgba(255,255,255,.92)"
          style={{ filter: 'drop-shadow(0 6px 18px rgba(30,64,175,.25))', animation: 'planeFlyY 26s ease-in-out infinite' }}>
          <path d="M21.5 15.5v-2l-8.5-5V3a1.5 1.5 0 0 0-3 0v5.5l-8.5 5v2l8.5-2.5v5.5L7.5 20v1.5l4.5-1 4.5 1V20L14 18.5V13l7.5 2.5z"></path>
        </svg>
      </div>
      {PARTICLES.map((p, i) =>
        <div key={i} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,.95) 0%, rgba(147,197,253,.5) 60%, rgba(147,197,253,0) 100%)',
          boxShadow: `0 0 ${p.glow}px rgba(96,165,250,.7)`,
          animation: p.anim
        }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: T.bgMesh }} />
    </div>
  );
}
