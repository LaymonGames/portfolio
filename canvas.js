/* ══════════════════════════════════════════════════════════════════
   LAYMON GAMES — canvas.js

   Hero backdrop: a slow field of gold and sage motes with a few thin
   links between them.  Nothing reacts to the pointer — the hero already
   has the mascot responding to it, and two pointer reactions read as
   noise.  Density is deliberately low so the field stays a texture
   rather than competing with the wordmark.

   One canvas, throttled, visibility-gated, and skipped entirely for
   reduced motion or small/low-power devices.
   ══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const cv = document.getElementById('field');
  if (!cv) return;

  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WEAK = (navigator.hardwareConcurrency || 8) <= 4;

  const GOLD = [216, 164, 60];
  const SAGE = [120, 184, 154];
  const LINK = 118;

  let W = 0, H = 0, dpr = 1, nodes = [];

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function build() {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    const r = cv.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';

    /* sparse: roughly one mote per 34,000 css px², capped hard */
    const area = W * H;
    const count = Math.round(clamp(area / (WEAK ? 48000 : 34000), 14, WEAK ? 40 : 62));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.13,
      vy: (Math.random() - 0.5) * 0.13,
      r: Math.random() * 1.3 + 0.45,
      warm: Math.random() > 0.82
    }));
  }

  const ctx = cv.getContext('2d', { alpha: true });

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;

    /* links */
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > LINK * LINK) continue;
        const k = 1 - Math.sqrt(d2) / LINK;
        ctx.strokeStyle = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${(k * 0.11).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    /* motes */
    for (const n of nodes) {
      n.vx *= 0.988; n.vy *= 0.988;
      n.x += n.vx; n.y += n.vy;
      if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
      if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;

      const c = n.warm ? GOLD : SAGE;
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${n.warm ? 0.55 : 0.22})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  build();

  /* one still frame is enough when motion is unwanted */
  if (REDUCED) { draw(); return; }

  let raf = 0, last = 0, onScreen = true, visible = !document.hidden;
  const fps = WEAK ? 24 : 34;
  const frame = ts => {
    raf = requestAnimationFrame(frame);
    if (!onScreen || !visible) return;
    if (ts - last < 1000 / fps) return;
    last = ts;
    draw();
  };
  raf = requestAnimationFrame(frame);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(e => { onScreen = e[0].isIntersecting; }, { threshold: 0 }).observe(cv);
  }
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { build(); draw(); }, 200);
  }, { passive: true });
})();