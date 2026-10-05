/* ══════════════════════════════════════════════════════════════════
   LAYMON GAMES — polish.js
   Pointer-driven only: no timers, no loops. One rAF per pointer burst.
   ══════════════════════════════════════════════════════════════════ */
(function () {
	'use strict';

	var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
	var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (!fine || reduce) return;

	/* ── pointer light on cards ── */
	var HOSTS = '.row, .feature, .skill, .term, .reach__mail';
	document.querySelectorAll(HOSTS).forEach(function (el) {
		if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
		el.classList.add('spot-host');
		var s = document.createElement('i');
		s.className = 'spot';
		s.setAttribute('aria-hidden', 'true');
		el.insertBefore(s, el.firstChild);
		var q = 0;
		el.addEventListener('pointermove', function (e) {
			if (q) return;
			q = requestAnimationFrame(function () {
				q = 0;
				var r = el.getBoundingClientRect();
				el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
				el.style.setProperty('--my', (e.clientY - r.top) + 'px');
			});
		}, { passive: true });
	});

	/* ── magnetic gold buttons ── */
	document.querySelectorAll('.btn--gold').forEach(function (b) {
		b.classList.add('is-magnet');
		b.addEventListener('pointermove', function (e) {
			var r = b.getBoundingClientRect();
			var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
			var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
			b.classList.add('is-pulled');
			b.style.setProperty('--tx', (dx * 10).toFixed(1) + 'px');
			b.style.setProperty('--ty', (dy * 8).toFixed(1) + 'px');
		}, { passive: true });
		b.addEventListener('pointerleave', function () {
			b.classList.remove('is-pulled');
			b.style.removeProperty('--tx');
			b.style.removeProperty('--ty');
		});
	});
})();
