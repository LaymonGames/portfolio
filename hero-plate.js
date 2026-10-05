/* ══════════════════════════════════════════════════════════════════
   LAYMON GAMES — hero-plate.js
   Positions the cinematic plate against the mascot.

   This is a measurement, not a calculation, and that is the whole point.

   The plate's face is a `vw` clamp; the fruit is `min(21vw, 27vh)` inside a grid
   hero whose padding changes at two breakpoints. There is no ratio between them,
   so any CSS expression that tries to relate the two is fitting a curve to two
   different scales. I tried three times and each was out:

     · a derived formula from the hero's height, the fruit's height fraction and
       the plate's own height — 180px out, the plate landed entirely ABOVE the
       fruit (plate top 31px against a fruit top of 273px)
     · "the hero's 46% line", which I assumed was the mascot's centre — 130px
       out, because below 900px the hero has its own padding block and the fruit
       does not sit on that line at all
     · a clamp fitted to measured needs at five widths — still 115px out at
       820px, because the ideal correction is not monotonic in width

   The relationship is real but it depends on the live layout, so it is read off
   the live layout. `getBoundingClientRect` on two elements, one subtraction, one
   custom property.

   What it encodes: the plate's top edge is placed `--plate-above` of the plate's
   own height ABOVE the fruit's crown. At 38% the word stands two-thirds clear of
   the crown and its lower third passes behind the body, and because it is also
   wider than the fruit it runs past the silhouette on both axes — which is what
   makes it read as behind the fruit rather than printed inside it.

   Everything here is a read plus a single property write, so there is no layout
   thrash: the rects are read together, then the property is set.
   ══════════════════════════════════════════════════════════════════ */
(() => {
	'use strict';

	const hero = document.querySelector('.hero');
	const plate = document.querySelector('.hero__plate');
	const mascot = document.querySelector('.mascot');
	if (!hero || !plate || !mascot) return;

	/* the fraction of the plate's height that sits above the fruit's crown.
	   0.64 after two rounds of "higher": 0.38 put a third of the word above the
	   crown, 0.48 put half, and this puts roughly two thirds, so the word reads
	   as a band the fruit stands in front of rather than as a caption under it.
	   The clamp below still keeps it inside the hero and clear of the h1. */
	const ABOVE = 0.64;

	let queued = false;

	function place() {
		/* one read pass */
		const h = hero.getBoundingClientRect();
		const m = mascot.getBoundingClientRect();
		const p = plate.getBoundingClientRect();
		if (!h.height || !m.height || !p.height) return;

		/* fruit top relative to the hero's top, then lifted by the overlap */
		const fruitTop = m.top - h.top;
		const top = Math.round(fruitTop - p.height * ABOVE);

		/* keep it inside the hero, and keep it clear of the kicker/h1 below:
		   the plate is decorative and must never run over the real wordmark */
		const title = hero.querySelector('.hero__title');
		const ceiling = title ? (title.getBoundingClientRect().top - h.top) - p.height : Infinity;
		const clamped = Math.max(0, Math.min(top, ceiling));

		plate.style.setProperty('--plate-top', clamped + 'px');
	}

	function schedule() {
		if (queued) return;
		queued = true;
		requestAnimationFrame(() => { queued = false; place(); });
	}

	/* The measurement depends on four things that all land after this script
	   runs: the webfont (which sets the h1's and the plate's box), the mascot's
	   own responsive box, the scroll-linked depth on this very hero, and a
	   window resize. Re-measuring on each is cheap and the alternative is a
	   plate that is correctly placed only if the fonts happened to be cached. */
	schedule();
	window.addEventListener('resize', schedule, { passive: true });
	window.addEventListener('orientationchange', schedule);
	window.addEventListener('load', schedule);
	document.addEventListener('lg:lang', schedule);
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
	/* the contact shadow is written on the mascot's first painted frame, which is
	   also when its box is final for the layout in play */
	if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(mascot);

	/* sizes only settle once; a couple of later passes cost nothing and cover the
	   lazy webfont swap and any late image that moves the flow */
	setTimeout(schedule, 400);
	setTimeout(schedule, 1600);
})();
