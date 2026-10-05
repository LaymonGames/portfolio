/* ══════════════════════════════════════════════════════════════════
   LAYMON GAMES — motion.js

   Scroll-linked depth, and nothing else.

   This file writes two custom properties and does no layout maths of its
   own: --hp on the hero (0 at the top of the hero, 1 once it has scrolled
   away) and --sp on the three sections that own depth layers (+1 when the
   section sits a full viewport below centre, -1 when it is above). Every
   millimetre of movement, every direction and every easing lives in
   motion.css, so the depth can be retuned without opening a line of JS.

   Depth is switched off entirely for reduced motion and for touch
   pointers, where vertical translate reads as jitter rather than parallax
   and the reveal system already carries the motion.
   ══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var root = document.documentElement;
  var hero = document.getElementById('home');
  if (!hero) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  /* Depth needs a real pointer and room to read as parallax. */
  var fine = window.matchMedia('(min-width:901px) and (hover:hover) and (pointer:fine)');

  /* Sections that own depth layers, by id — the markup stays the single
     source of truth for what exists. */
  var DEPTH = ['about', 'skills', 'projects'];

  var layers = [];
  var heroH = 1;
  var hpLast = -1;
  var queued = false;
  var live = false;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function measure() {
    heroH = hero.offsetHeight || 1;
    var y = window.pageYOffset;
    layers = [];
    for (var i = 0; i < DEPTH.length; i++) {
      var el = document.getElementById(DEPTH[i]);
      if (!el) continue;
      var r = el.getBoundingClientRect();
      layers.push({ el: el, top: r.top + y, h: r.height || 1, last: null });
    }
  }

  function paint() {
    var vh = window.innerHeight || 1;
    var y = window.pageYOffset;

    var hp = Math.round(clamp(y / heroH, 0, 1) * 1000) / 1000;
    if (hp !== hpLast) {
      hpLast = hp;
      hero.style.setProperty('--hp', String(hp));
    }

    for (var i = 0; i < layers.length; i++) {
      var L = layers[i];
      var sp = (vh * 0.5 - (L.top + L.h * 0.5 - y)) / vh;
      sp = Math.round(clamp(sp, -1.4, 1.4) * 1000) / 1000;
      /* One write per layer, and none at all once a section is far enough
         away to be pinned at the clamp. */
      if (sp === L.last) continue;
      L.last = sp;
      L.el.style.setProperty('--sp', String(sp));
    }
  }

  function clear() {
    hero.style.removeProperty('--hp');
    hpLast = -1;
    for (var i = 0; i < layers.length; i++) {
      layers[i].el.style.removeProperty('--sp');
      layers[i].last = null;
    }
  }

  function apply() {
    if (live) { measure(); paint(); } else { clear(); }
  }

  function setLive(on) {
    if (live === on) return;
    live = on;
    root.classList.toggle('has-depth', on);
    apply();
  }

  /* One rAF per scroll burst, never a permanent loop. */
  function onScroll() {
    if (queued || !live) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; paint(); });
  }

  var resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(apply, 140);
  }

  /* Watching either query means a mid-session change of preference or of
     input device cannot leave a half-applied layer behind. */
  function onQuery() { setLive(!reduce.matches && fine.matches); }
  function listen(q, fn) {
    if (q.addEventListener) q.addEventListener('change', fn);
    else if (q.addListener) q.addListener(fn);   /* Safari < 14 */
  }
  listen(reduce, onQuery);
  listen(fine, onQuery);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', onResize);
  /* Web fonts settle, lazy images load, and a reload can restore a scroll
     offset — all of which move the boxes the depth was measured against. */
  window.addEventListener('load', onResize);
  /* Arabic runs taller than English, so the ratios need re-measuring when
     the direction and the text change together. */
  document.addEventListener('lg:lang', onResize);

  setLive(!reduce.matches && fine.matches);
})();
