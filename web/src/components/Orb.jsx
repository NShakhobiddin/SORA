import React from 'react';

// Bojxonachi Sora — particle sphere orb
// 3D sphere made of glowing dots distributed via Fibonacci lattice,
// rotated each frame in JS; size/opacity vary by Z (depth) for true 3D feel.

// ── Particle sphere ──────────────────────────────────────────────
// Distributes `count` points on a unit sphere with the Fibonacci-spiral
// formula (golden angle ≈ 137.508°), so they are evenly spaced with no
// clumping at the poles. Each frame we apply two rotation matrices
// (yaw + slow nod), project to 2D with a tiny perspective divide, and
// drive each <circle>'s cx / cy / r / opacity directly via DOM attrs
// (faster than React re-renders for ~200 particles × 60fps).

export function Orb({ size = 360, theme, state = 'idle', success = false, count = 220, logo = null }) {
  const T = theme;
  const stops = success
    ? ['#064E3B', T.success, T.successSoft, '#DCFCE7']
    : T.orbStops;
  const halo = success ? T.successSoft : T.orbHalo;
  const core = success ? T.success : T.orbCore;

  const svgRef = React.useRef(null);
  const uid = React.useId().replace(/:/g, '');

  // Pre-compute sphere points
  const points = React.useMemo(() => {
    const arr = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      arr.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
    }
    return arr;
  }, [count]);

  // Animation loop — rotate + project each particle
  React.useEffect(() => {
    let raf;
    const t0 = performance.now();
    const radius = size * 0.42;
    const cx = size / 2, cy = size / 2;
    const speed = state === 'speaking' ? 0.55 : state === 'listening' ? 0.42 : 0.28;
    const wobble = state === 'idle' ? 0.12 : 0.22;

    const tick = (now) => {
      const t = (now - t0) / 1000;
      const ay = t * speed;
      const ax = Math.sin(t * 0.4) * wobble;
      const cosY = Math.cos(ay), sinY = Math.sin(ay);
      const cosX = Math.cos(ax), sinX = Math.sin(ax);
      // breath: subtle radius pulse on speaking / listening
      const breath = 1 + (state === 'speaking' ? 0.04 : state === 'listening' ? 0.025 : 0.01) *
        Math.sin(t * (state === 'speaking' ? 4 : 2));
      const svg = svgRef.current;
      if (!svg) return;
      const dots = svg.querySelectorAll('circle.pt');
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        // rotate around Y, then X
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y1 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        const persp = 1 / (1 - z2 * 0.32);
        const px = cx + x1 * radius * persp * breath;
        const py = cy + y1 * radius * persp * breath;
        const depth = (z2 + 1) * 0.5; // 0 (back) .. 1 (front)
        const op = 0.18 + depth * 0.95;
        const rr = (0.6 + depth * 1.6) * (size / 200);
        const d = dots[i];
        if (!d) continue;
        d.setAttribute('cx', px);
        d.setAttribute('cy', py);
        d.setAttribute('r', rr);
        d.setAttribute('opacity', Math.min(1, op));
        d.setAttribute('fill', depth > 0.55 ? `url(#${uid}-bright)` : `url(#${uid}-dim)`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [points, size, state, uid]);

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      {/* far outer glow */}
      <div style={{
        position: 'absolute', inset: -size * 0.28, borderRadius: '50%',
        background: `radial-gradient(circle, ${halo}55 0%, ${halo}15 35%, transparent 65%)`,
        filter: 'blur(28px)',
        animation: 'orb-glow 5s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      {/* inner soft core */}
      <div style={{
        position: 'absolute', inset: size * 0.18, borderRadius: '50%',
        background: `radial-gradient(circle, ${core}cc 0%, ${stops[2]}55 45%, transparent 70%)`,
        filter: 'blur(14px)',
        animation: `orb-glow${state === 'speaking' ? '-s' : ''} ${state === 'idle' ? 4 : 2.4}s ease-in-out infinite`,
        pointerEvents: 'none'
      }} />
      {/* logo suspended inside the sphere — sits under the particle layer so
          front dots pass over it, giving a true "inside the orb" depth feel */}
      {logo &&
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          width: size * 0.42, height: size * 0.42,
          transform: 'translate(-50%,-50%)',
          animation: 'orb-logo 5s ease-in-out infinite',
          pointerEvents: 'none'
        }}>
          {/* soft light pocket behind the emblem */}
          <div style={{
            position: 'absolute', inset: '-18%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,.85) 0%, rgba(255,255,255,.25) 55%, transparent 75%)',
            filter: 'blur(10px)'
          }} />
          <img src={logo} alt="" style={{
            position: 'relative', width: '100%', height: '100%', objectFit: 'contain',
            filter: `drop-shadow(0 10px 26px ${core}66)`,
            opacity: 0.96
          }} />
        </div>
      }
      {/* particle SVG */}
      <svg ref={svgRef} width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'relative', overflow: 'visible', strokeWidth: '0px' }}>
        <defs>
          <radialGradient id={`${uid}-bright`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="40%" stopColor={stops[2]} stopOpacity="1" />
            <stop offset="100%" stopColor={stops[1]} stopOpacity="0.85" />
          </radialGradient>
          <radialGradient id={`${uid}-dim`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor={stops[1]} stopOpacity="0.9" />
            <stop offset="100%" stopColor={stops[0]} stopOpacity="0.6" />
          </radialGradient>
          <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={size * 0.004} result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g filter={`url(#${uid}-glow)`}>
          {points.map((_, i) =>
            <circle key={i} className="pt" cx={size / 2} cy={size / 2} r="1" fill={`url(#${uid}-bright)`} />
          )}
        </g>
      </svg>
      {/* expanding listening rings */}
      {state === 'listening' &&
        <>
          {[0, 1.2, 2.4].map((d, i) =>
            <div key={i} style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `2px solid ${halo}`,
              animation: `orb-ring 3.6s ease-out ${d}s infinite`,
              pointerEvents: 'none'
            }} />
          )}
        </>
      }
    </div>
  );
}

// Live waveform bars next to orb (listening / speaking)
export function Waveform({ bars = 24, height = 80, color = '#3B82F6', active = true }) {
  const arr = Array.from({ length: bars });
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, height }}>
      {arr.map((_, i) => {
        const d = Math.abs(i - bars / 2) / (bars / 2);
        const h = (1 - d * 0.7) * height;
        return (
          <span key={i} style={{
            display: 'block', width: 3, height: h, background: color, borderRadius: 3,
            opacity: 0.85, transformOrigin: 'center',
            animation: active ? `wave-bar ${0.6 + (i % 5) * 0.12}s ease-in-out ${i * 0.04}s infinite` : 'none'
          }} />
        );
      })}
    </div>
  );
}
