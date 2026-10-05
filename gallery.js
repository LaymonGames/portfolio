/* ══════════════════════════════════════════════════════════════════
   LAYMON GAMES — gallery.js

   Two jobs, both about making the project section answer questions instead
   of just looking tidy.

   1  THE ART GALLERY, as a real keyboard gallery.
      The old one built a 2×2 grid of <figure><img> and rebuilt it on every
      language switch. Nothing in it could be focused, so the Art card opened
      a dialog you could only look at. This one is one slide at a time with a
      tablist rail: ← → move, Home/End jump, 1-4 select, and every slide is a
      focusable button that reports its position. It is built here, in JS,
      from the same four assets the archive already uses, and its alt text is
      the existing ui.artPreviewAlt string.

      The dialog it lives in is marked [data-i18n-skip] on the way in, because
      i18n.js.fill() replaces the textContent of any [data-i18n] element it
      finds and would otherwise delete the slides it did not build.

   2  WHERE A PROJECT ROW GOES.
      The rows already carried the destination inside their own translated
      aria-label ("Open Something's Off on itch.io"). Nothing was added to the
      copy — the destination is read back out of those labels and put on the
      row where a sighted pointer user can see it on hover.
   ══════════════════════════════════════════════════════════════════ */
(function () {
	'use strict';

	var I18N = window.LaymonI18n;
	var t = function (k, p) { return I18N ? I18N.t(k, p) : k; };

	/* ─────────────── 1. THE GALLERY ─────────────── */
	(function gallery() {
		var host = document.getElementById('galStage');
		var rail = document.getElementById('galRail');
		var live = document.getElementById('galLive');
		var win = document.getElementById('mArt');
		if (!host || !rail) return;

		/* tell i18n.js to keep its hands off this subtree */
		var box = win || host.closest('.modal');
		if (box) box.setAttribute('data-i18n-skip', '');

		/* Every image the project already ships. Alt text comes from the
		   supplied ui.artPreviewAlt string; no captions are invented. */
		var ITEMS = [
			{ src: 'assets/parallox.webp', w: 1920, h: 1080, pos: 'center 42%' },
			{ src: 'assets/off.webp', w: 1920, h: 1080, pos: 'center 45%' },
			{ src: 'assets/cursed.webp', w: 1880, h: 1057, pos: 'center 50%' },
			{ src: 'assets/off_remastered.webp', w: 616, h: 371, pos: 'center 45%' }
		];

		var index = 0;
		var slides = [];
		var thumbs = [];

		function altFor(i) {
			return String(t('ui.artPreviewAlt', { n: i + 1 }));
		}

		function build() {
			host.innerHTML = '';
			rail.innerHTML = '';
			slides = [];
			thumbs = [];

			ITEMS.forEach(function (item, i) {
				/* one slide per asset; only the live one is exposed to the
				   accessibility tree, so a screen reader is not read four
				   images when one is on screen */
				var fig = document.createElement('figure');
				fig.className = 'gal__slide';
				fig.id = 'galSlide' + i;
				fig.setAttribute('role', 'tabpanel');
				fig.setAttribute('aria-label', t('ui.artSlideAria', { i: i + 1, total: ITEMS.length }));
				fig.hidden = true;

				var img = document.createElement('img');
				img.src = item.src;
				img.alt = altFor(i);
				img.width = item.w;
				img.height = item.h;
				img.loading = 'lazy';
				img.decoding = 'async';
				img.style.objectPosition = item.pos;
				fig.appendChild(img);

				var count = document.createElement('span');
				count.className = 'gal__count';
				count.setAttribute('aria-hidden', 'true');
				count.textContent = t('ui.artOf', { i: i + 1, total: ITEMS.length });
				fig.appendChild(count);

				host.appendChild(fig);
				slides.push(fig);

				var b = document.createElement('button');
				b.type = 'button';
				b.className = 'gal__thumb';
				b.setAttribute('role', 'tab');
				b.setAttribute('aria-controls', 'galSlide' + i);
				b.setAttribute('aria-selected', 'false');
				b.setAttribute('aria-label', t('ui.artOpenAria', { i: i + 1, name: altFor(i) }));
				b.tabIndex = -1;
				var ti = document.createElement('img');
				ti.src = item.src;
				ti.alt = '';
				ti.width = item.w;
				ti.height = item.h;
				ti.loading = 'lazy';
				ti.decoding = 'async';
				ti.style.objectPosition = item.pos;
				b.appendChild(ti);
				b.addEventListener('click', function () { show(i, true); });
				rail.appendChild(b);
				thumbs.push(b);
			});

			rail.setAttribute('role', 'tablist');
			show(Math.min(index, ITEMS.length - 1), false);
		}

		function show(next, focusThumb) {
			if (!thumbs.length) return;
			index = (next + thumbs.length) % thumbs.length;
			slides.forEach(function (s, i) {
				var on = i === index;
				s.hidden = !on;
				s.classList.toggle('is-live', on);
			});
			thumbs.forEach(function (b, i) {
				var on = i === index;
				b.setAttribute('aria-selected', on ? 'true' : 'false');
				b.tabIndex = on ? 0 : -1;
			});
			if (focusThumb) {
				/* stealing focus is the point here: the reader asked for slide
				   4 with the digit 4 and should land on it */
				thumbs[index].focus({ preventScroll: true });
			}
			if (live) live.textContent = t('ui.artSlideAria', { i: index + 1, total: thumbs.length });
		}

		/* arrows, Home/End and the digits. Scoped to the dialog, and it does
		   not swallow Tab or Escape — the modal owns those. */
		document.addEventListener('keydown', function (e) {
			if (!box || box.hidden) return;
			if (e.altKey || e.ctrlKey || e.metaKey) return;
			var k = e.key;
			var handled = true;
			if (k === 'ArrowRight' || k === 'ArrowDown') show(index + 1, false);
			else if (k === 'ArrowLeft' || k === 'ArrowUp') show(index - 1, false);
			else if (k === 'Home') show(0, false);
			else if (k === 'End') show(thumbs.length - 1, false);
			else if (/^[1-9]$/.test(k)) {
				var n = parseInt(k, 10) - 1;
				if (n < thumbs.length) show(n, false);
				else handled = false;
			} else handled = false;
			if (handled) e.preventDefault();
		});

		build();

		/* copy is language-specific, so the rail is rebuilt on a switch. The
		   direction change is handled in CSS with logical properties. */
		document.addEventListener('lg:lang', function () {
			var keep = index;
			index = keep;
			build();
		});
	})();

	/* ─────────────── 2. WHERE A ROW GOES ─────────────── */
	(function destinations() {
		/* The destination is already written into each row's aria-label. Pull
		   the tail of it — the part after the last " on " / " على " — and hang
		   it on the arrow so a pointer user sees where the row goes before
		   committing to the click. Nothing is added to the supplied copy:
		   this only reads back out of it. If a label carries no recognisable
		   destination, nothing is written — a wrong guess is worse than no
		   caption at all.

		   It has to run AFTER i18n has painted, because i18n.js is what writes
		   aria-label in the first place. Running once at load found only the
		   one row whose English label was already hard-coded in the markup. */
		function paint() {
			/* The connector differs per language, and JavaScript regular
			   expressions have no greedy alternation — so the last occurrence
			   has to be found by position rather than by pattern. That matters:
			   the Arabic label for one project is
			     "فتح Cursed Arcade على صفحة Laymon Games على itch.io"
			   and a first-match regex returned "صفحة Laymon Games على itch.io"
			   as the destination. */
			var CONNECTORS = [' on ', ' على '];
			function destination(label) {
				var best = -1, after = 0;
				for (var i = 0; i < CONNECTORS.length; i++) {
					var at = label.lastIndexOf(CONNECTORS[i]);
					if (at > best) { best = at; after = at + CONNECTORS[i].length; }
				}
				if (best < 0) return '';
				return label.slice(after).replace(/[.\u3002\s]+$/, '');
			}

			var rows = document.querySelectorAll('.archive .row[data-i18n-attr]');
			Array.prototype.forEach.call(rows, function (el) {
				var label = el.getAttribute('aria-label') || '';
				var dest = destination(label);
				var go = el.querySelector('.row__go');
				if (!go) return;
				if (!dest || dest.length > 24 || /[<>]/.test(dest)) { go.removeAttribute('data-go'); return; }
				go.setAttribute('data-go', dest);
			});
		}
		paint();
		document.addEventListener('lg:lang', paint);
	})();
})();
