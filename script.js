/* ══════════════════════════════════════════════════════════════════
   LAYMON GAMES — script.js

   Modules
     1  language switch          6  progress + scroll spy
     2  navigation               7  copy email
     3  reveal system            8  modals
     4  terminal typer           9  art gallery
     5  custom cursor           10  misc
   Everything is progressive: with JavaScript off the page still reads
   top to bottom, and nothing is required to reach the content.
   ══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var I18N = window.LaymonI18n;
  var t = function (k, p) { return I18N ? I18N.t(k, p) : k; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────── 1. LANGUAGE SWITCH ─────────────── */
  (function lang() {
    var label = $('[data-lang-switch-label]');
    function paint() {
      var ar = I18N && I18N.get() === 'ar';
      if (label) label.textContent = ar ? 'English' : 'العربية';
      document.title = document.getElementById('page-title')
        ? document.getElementById('page-title').textContent
        : document.title;
    }
    $$('[data-lang-switch]').forEach(function (btn) {
      btn.addEventListener('click', function () { I18N.toggle(); });
    });
    document.addEventListener('lg:lang', paint);
    paint();
  })();

  /* ─────────────── 2. NAVIGATION ─────────────── */
  (function nav() {
    var bar = $('#nav');
    var burger = $('.burger');
    var links = $('#navLinks');
    if (!bar) return;

    function setOpen(open) {
      bar.classList.toggle('is-open', open);
      if (burger) burger.setAttribute('aria-expanded', String(open));
    }
    if (burger) {
      burger.addEventListener('click', function () {
        setOpen(burger.getAttribute('aria-expanded') !== 'true');
      });
    }
    /* the drawer only exists on the pages that have one */
    if (links) {
      links.addEventListener('click', function (e) {
        if (e.target.closest('a')) setOpen(false);
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (!bar.classList.contains('is-open')) return;
      if (!bar.contains(e.target)) setOpen(false);
    });

    /* scroll spy */
    var targets = $$('#navLinks a').map(function (a) {
      return { link: a, section: document.querySelector(a.getAttribute('href')) };
    }).filter(function (x) { return x.section; });

    function spy() {
      var line = window.scrollY + (window.innerHeight * 0.34);
      var current = null;
      targets.forEach(function (x) {
        if (x.section.offsetTop <= line) current = x;
      });
      targets.forEach(function (x) {
        x.link.classList.toggle('is-current', x === current);
      });
      bar.classList.toggle('is-stuck', window.scrollY > 8);
    }

    /* progress + spy share one rAF-throttled listener */
    var bar2 = $('#progressBar');
    var hero = $('#home');
    var cue = $('.hero__cue');
    var queued = false;
    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        spy();
        if (bar2) {
          var max = document.documentElement.scrollHeight - window.innerHeight;
          bar2.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
        }
        /* the current on the progress bar only exists once reading starts */
        document.documentElement.classList.toggle('has-scrolled', window.scrollY > 8);
        if (hero && cue) cue.style.opacity = window.scrollY > 120 ? '0' : '1';
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    /* onScroll rather than spy, so a reload that restores a scroll offset
       still gets the stuck bar, the progress width and has-scrolled */
    onScroll();
  })();

  /* ─────────────── 3. REVEAL SYSTEM ─────────────── */
  (function reveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (REDUCED || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = el.parentElement
          ? Array.prototype.filter.call(el.parentElement.children, function (c) {
            return c.hasAttribute && c.hasAttribute('data-reveal');
          })
          : [];
        var idx = siblings.indexOf(el);
        if (idx > 0) el.style.setProperty('--d', (idx * 70) + 'ms');

        /* the process rail draws its rail and its dots in sequence, so the
           steps need their own index */
        if (el.hasAttribute('data-reveal') && el.getAttribute('data-reveal') === 'flow') {
          $$(':scope > *', el).forEach(function (child, n) {
            child.style.setProperty('--i', n);
          });
        }
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ─────────────── 4. TERMINAL TYPER ─────────────── */
  (function terminal() {
    var out = $('#termOut');
    if (!out) return;

    /* A GDScript excerpt. Code, not copy: no prose, no claims. */
    var LINES = [
      [['k', 'func '], ['f', '_ready'], ['k', '() -> '], ['n', 'void'], ['k', ':']],
      [['', '\tvar '], ['k', 'world'], ['k', ': '], ['n', 'ParalloxWorld'], ['k', ' = '], ['f', 'ParalloxWorld'], ['k', '.new()']],
      [['', '\t'], ['f', 'world'], ['k', '.'], ['f', 'load_cast'], ['k', '(self, '], ['s', '"villain"'], ['k', ')']],
      [['', '\t'], ['f', 'world'], ['k', '.'], ['f', 'set_perspective'], ['k', '('], ['n', 'PLAYER'], ['k', ')']],
      [['', '']],
      [['k', 'func '], ['f', '_process'], ['k', '(d: '], ['n', 'float'], ['k', ') -> '], ['n', 'void'], ['k', ':']],
      [['', '\tif '], ['f', 'hero'], ['k', '.'], ['f', 'is_player_side'], ['k', ':']],
      [['', '\t\t'], ['f', 'world'], ['k', '.'], ['f', 'shift_perspective'], ['k', '()']],
      [['', '']],
      [['k', 'func '], ['f', '_input'], ['k', '(e: '], ['n', 'InputEvent'], ['k', ') -> '], ['n', 'void'], ['k', ':']],
      [['', '\tif '], ['f', 'e'], ['k', '.'], ['f', 'is_action_pressed'], ['k', '('], ['s', '"interact"'], ['k', ')']],
      [['', '\t\t'], ['f', 'interact'], ['k', '()']]
    ];

    var esc = function (s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
    var plain = function (line) {
      return line.map(function (p) { return p[1]; }).join('');
    };
    var toHtml = function (line) {
      return line.map(function (p) {
        return p[0] ? '<span class="' + p[0] + '">' + esc(p[1]) + '</span>' : esc(p[1]);
      }).join('');
    };
    var full = function () { return LINES.map(toHtml).join('\n'); };

    function dump() {
      out.classList.remove('is-typing');
      out.innerHTML = full();
    }

    function type() {
      if (REDUCED) { dump(); return; }
      out.classList.add('is-typing');
      var li = 0, ci = 0, buf = [];

      function step() {
        if (li >= LINES.length) {
          /* leave the finished listing clean: no caret, no scrollbar jump */
          out.classList.remove('is-typing');
          out.innerHTML = full();
          out.scrollTop = 0;
          return;
        }
        var line = LINES[li];
        var fullLine = plain(line);
        ci++;
        if (ci >= fullLine.length) {
          buf.push(toHtml(line));
          li++; ci = 0;
          out.innerHTML = buf.join('\n') + '<span class="caret"></span>';
          out.scrollTop = out.scrollHeight;
          setTimeout(step, 110);
          return;
        }
        /* build the partial line by walking the parts */
        var used = 0, html = '';
        for (var i = 0; i < line.length; i++) {
          var part = line[i];
          var chars = Math.max(0, Math.min(part[1].length, ci - used));
          used += part[1].length;
          if (!chars) break;
          var text = esc(part[1].slice(0, chars));
          html += part[0] ? '<span class="' + part[0] + '">' + text + '</span>' : text;
        }
        out.innerHTML = buf.join('\n') + html + '<span class="caret"></span>';
        out.scrollTop = out.scrollHeight;
        setTimeout(step, fullLine.length > 34 ? 7 : 22);
      }
      setTimeout(step, 220);
    }

    if (!('IntersectionObserver' in window)) { dump(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.disconnect();
        type();
      });
    }, { threshold: 0.3 });
    io.observe(out);
  })();

  /* ─────────────── 5. CUSTOM CURSOR ─────────────── */
  (function cursor() {
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine || REDUCED) return;

    var el = document.createElement('div');
    el.className = 'cursor';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<span class="cursor__ring"></span><span class="cursor__dot"></span>';
    document.body.appendChild(el);

    var ring = $('.cursor__ring', el);
    var dot = $('.cursor__dot', el);
    var x = window.innerWidth / 2, y = window.innerHeight / 2;
    var rx = x, ry = y;

    document.documentElement.classList.add('has-cursor');
    el.classList.add('is-hidden');

    window.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY;
      el.classList.remove('is-hidden');
      dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      var over = !!(e.target.closest && e.target.closest('a,button,[role="button"],input,textarea,select'));
      el.classList.toggle('is-link', over);
    }, { passive: true });

    document.addEventListener('mouseleave', function () { el.classList.add('is-hidden'); });
    document.addEventListener('mouseenter', function () { el.classList.remove('is-hidden'); });

    (function follow() {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0)';
      requestAnimationFrame(follow);
    })();
  })();

  /* ─────────────── 6a. PROGRESS ─────────────── */
  /* handled inside the nav module, which already listens to scroll */

  /* ─────────────── 7. COPY EMAIL ─────────────── */
  (function copyMail() {
    $$('[data-copy]').forEach(function (btn) {
      var state = $('[data-copy-state]', btn);
      var timer = null;

      function flash() {
        if (!state) return;
        /* the class is what motion.css animates; it is dropped again when
           the announcement clears, so the state always resets */
        btn.classList.add('is-copied');
        state.textContent = t('ui.copied');
        clearTimeout(timer);
        timer = setTimeout(function () {
          state.textContent = '';
          btn.classList.remove('is-copied');
        }, 1900);
      }
      function fallback(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-200px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
      }

      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(flash, function () { fallback(text); flash(); });
        } else {
          fallback(text);
          flash();
        }
      });
    });
  })();

  /* ─────────────── 8. MODALS ─────────────── */
  (function modals() {
    var open = null;
    var lastFocus = null;

    function show(id) {
      var box = document.getElementById(id);
      if (!box) return;
      lastFocus = document.activeElement;
      box.hidden = false;
      open = box;
      document.body.style.overflow = 'hidden';
      var first = $('[data-modal-close]', box);
      if (first) first.focus();
    }
    function hide() {
      if (!open) return;
      open.hidden = true;
      open = null;
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest && e.target.closest('[data-modal-open]');
      if (trigger) { show(trigger.getAttribute('data-modal-open')); return; }
      if (!open) return;
      if (e.target.closest('[data-modal-close]') || e.target === open) hide();
    });
    document.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') { hide(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])', open)
        .filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  })();

  /* ─────────────── 9. ART GALLERY ─────────────── */
  /* Moved to gallery.js. The old version rebuilt plain <figure>/<img> nodes on
     every language change, which is fine to look at and impossible to drive
     from a keyboard. gallery.js owns #artGallery now: one slide on screen,
     every slide a real button, arrows / Home / End / digits as shortcuts. */

  /* ─────────────── 9b. THE COPY CUE'S SUCCESS LABEL ─────────────── */
  /* The email tile's cue swaps its own text on .is-copied via
     `content: attr(data-copied)`. A CSS `content` value cannot be translated, so
     the label is written from the dictionary on load and on every switch —
     otherwise the confirmation would be the only English string on an Arabic
     page, and it is the one string the reader most needs to understand. */
  (function copyCue() {
    function paint() {
      $$('[data-copied]').forEach(function (el) {
        el.setAttribute('data-copied', t('ui.copied'));
      });
    }
    paint();
    document.addEventListener('lg:lang', paint);
  })();

  /* ─────────────── 10. MISC ─────────────── */
  (function misc() {
    var year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());

    /* the language button label is language-specific, not i18n copy, and the
       copy confirmation has to be cleared so it cannot survive a switch */
    document.addEventListener('lg:lang', function () {
      var copy = $('[data-copy] [data-copy-state]');
      if (copy) copy.textContent = '';
    });
  })();
})();