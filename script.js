const secondHand = document.querySelector('.second-hand');
const minuteHand = document.querySelector('.minute-hand');
const hourHand = document.querySelector('.hour-hand');
const lemonHead = document.querySelector('.lemon-head');
const year = document.querySelector('#year');

const totalLemonFrames = 46;
let currentLemonFrameIndex = 1;
let targetLemonFrameIndex = 1;

function setHandAngle(hand, angle) {
	if (hand) {
		hand.style.setProperty('--rotation-angle', `${angle}deg`);
	}
}

/* Smooth sweeping clock — replaces the 1-second tick.
   Falls back to ticking for prefers-reduced-motion users. */
const clockSmooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateClock() {
  const now = new Date();
  const seconds = now.getSeconds() + (clockSmooth ? now.getMilliseconds() / 1000 : 0);
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;
  // The hand wrapper naturally points to 3 o'clock (90°) at 0° rotation,
  // so subtract 90° to align 0° with 12 o'clock.
  setHandAngle(secondHand, seconds * 6 - 90);
  setHandAngle(minuteHand, minutes * 6 - 90);
  setHandAngle(hourHand, hours * 30 - 90);
}

if (secondHand && minuteHand && hourHand) {
  updateClock();
  if (clockSmooth) {
    const sweepClock = () => {
      updateClock();
      requestAnimationFrame(sweepClock);
    };
    requestAnimationFrame(sweepClock);
  } else {
    setInterval(updateClock, 1000);
  }
}

function setLemonHeadTarget(clientX) {
	if (!lemonHead) return;
	const width = window.innerWidth || 1;
	const ratio = Math.min(Math.max(clientX / width, 0), 1);
	targetLemonFrameIndex = Math.round(ratio * (totalLemonFrames - 1)) + 1;
}

function updateLemonHeadFrame() {
	if (!lemonHead) return;

	const delta = targetLemonFrameIndex - currentLemonFrameIndex;
	if (Math.abs(delta) > 0.01) {
		currentLemonFrameIndex += delta * 0.22;
		const frameIndex = Math.max(1, Math.min(totalLemonFrames, Math.round(currentLemonFrameIndex)));
		const frameNumber = String(frameIndex).padStart(3, '0');
		const nextSrc = `frames/frame_${frameNumber}.png`;
		if (!lemonHead.src.endsWith(nextSrc)) {
			lemonHead.src = nextSrc;
		}
	}

	requestAnimationFrame(updateLemonHeadFrame);
}

if (lemonHead) {
	document.addEventListener('pointermove', (event) => {
		setLemonHeadTarget(event.clientX);
	});

	window.addEventListener('resize', () => {
		setLemonHeadTarget(window.innerWidth / 2);
	});

	setLemonHeadTarget(window.innerWidth / 2);
	requestAnimationFrame(updateLemonHeadFrame);
}

if (year) {
	year.textContent = new Date().getFullYear();
}

const navToggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('#mobile-nav');

function closeMobileNav() {
	if (!navToggle || !mobileNav) return;
	navToggle.setAttribute('aria-expanded', 'false');
	mobileNav.hidden = true;
}

function openMobileNav() {
	if (!navToggle || !mobileNav) return;
	navToggle.setAttribute('aria-expanded', 'true');
	mobileNav.hidden = false;
}

if (navToggle && mobileNav) {
	navToggle.addEventListener('click', () => {
		const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
		if (isOpen) {
			closeMobileNav();
		} else {
			openMobileNav();
		}
	});

	mobileNav.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', closeMobileNav);
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			closeMobileNav();
			navToggle.focus();
		}
	});

	document.addEventListener('click', (event) => {
		const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
		if (!isOpen) return;
		if (event.target === navToggle || navToggle.contains(event.target)) return;
		if (mobileNav.contains(event.target)) return;
		closeMobileNav();
	});

	window.addEventListener('resize', () => {
		if (window.innerWidth > 980) {
			closeMobileNav();
		}
	});
}


const navLinks = Array.from(document.querySelectorAll('.site-header .nav a'));
const sections = Array.from(document.querySelectorAll('main section[id]'));

function updateActiveNav() {
	const scrollY = window.scrollY + 120;
	let activeId = 'top';
	for (const section of sections) {
		if (section.offsetTop <= scrollY) activeId = section.id;
	}
	navLinks.forEach((link) => {
		const target = link.getAttribute('href');
		if (target === `#${activeId}` || (activeId === 'top' && target === '#top')) {
			link.setAttribute('aria-current', 'page');
		} else {
			link.removeAttribute('aria-current');
		}
	});
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('resize', updateActiveNav);
updateActiveNav();


/* ---------------------------------------------------------
   Deterministic section navigation
   The fixed header must not change where the browser lands on
   different devices/browsers. Calculate the target from the
   element's actual rendered position every time.
--------------------------------------------------------- */
const allSectionLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
const HEADER_GAP = 10;

function getHeaderOffset() {
	const header = document.querySelector('.site-header');
	if (!header) return 0;
	return Math.max(0, header.getBoundingClientRect().height);
}

function scrollToSectionId(id, behavior = 'smooth') {
	const section = document.getElementById(id);
	if (!section) return;

	/*
		Use the actual visible content inside the section rather than the
		outer section box. The panel sections have intentional top padding,
		so scrolling to the section element itself makes the browser stop
		above the heading/content.
	*/
	const contentTarget =
		section.querySelector(':scope > .section-content') ||
		section.querySelector(':scope > .process-inner') ||
		section.querySelector(':scope > .contact-frame') ||
		section;

	const targetTop = contentTarget.getBoundingClientRect().top + window.scrollY;
	const destination = Math.max(0, targetTop - getHeaderOffset() - HEADER_GAP);

	window.scrollTo({
		top: destination,
		behavior
	});

	if (history.replaceState) {
		history.replaceState(null, '', `#${id}`);
	}
}

allSectionLinks.forEach((link) => {
	link.addEventListener('click', (event) => {
		const href = link.getAttribute('href');
		if (!href || href === '#' || !href.startsWith('#')) return;

		const id = href.slice(1);
		if (!document.getElementById(id)) return;

		event.preventDefault();
		closeMobileNav();
		scrollToSectionId(id);
	});
});

/* =========================================================
   UPGRADE PACK — header state, card spotlight, scroll reveals
   ========================================================= */
const upgradeReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Header depth on scroll ---------- */
const siteHeader = document.querySelector('.site-header');
function updateHeaderState() {
  if (!siteHeader) return;
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
}
window.addEventListener('scroll', updateHeaderState, { passive: true });
updateHeaderState();

/* ---------- Cursor spotlight on cards ---------- */
if (window.matchMedia('(hover: hover)').matches) {
  document
    .querySelectorAll('.skill-card, .small-work, .work-main, .contact-channel')
    .forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      });
    });
}

/* ---------- Scroll reveals ---------- */
const revealSelector = [
  '.about-identity',
  '.section-heading-row',
  '.copy-column',
  '.skill-card',
  '.work-main',
  '.small-work',
  '.process-step',
  '.contact-frame',
].join(',');

const revealTargets = Array.from(document.querySelectorAll(revealSelector));

if (!upgradeReducedMotion && 'IntersectionObserver' in window && revealTargets.length) {
  revealTargets.forEach((el) => {
    const parent = el.parentElement;
    const siblings = parent
      ? Array.from(parent.children).filter((child) => child.matches(revealSelector))
      : [];
    const siblingIndex = siblings.indexOf(el);
    if (siblingIndex > 0) {
      el.style.setProperty('--reveal-delay', `${Math.min(siblingIndex * 90, 420)}ms`);
    }
    el.classList.add('reveal');
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-visible');
        revealObserver.unobserve(el);
        /* Release the reveal classes once the entrance finishes so the
           original fast hover transitions take over again. */
        window.setTimeout(() => {
          el.classList.remove('reveal', 'is-visible');
          el.style.removeProperty('--reveal-delay');
        }, 1500);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));
}

/* ── Click-to-copy email: the whole card is the button ── */
const copyEmailBtn = document.querySelector('.contact-channel-copy');

if (copyEmailBtn) {
  const copyEmailText = copyEmailBtn.querySelector('.copy-email-text');
  const originalLabel  = copyEmailText ? copyEmailText.textContent.trim() : '';
  let copyResetTimeout = null;

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  copyEmailBtn.addEventListener('click', async () => {
    const email = copyEmailBtn.dataset.email;
    if (!email) return;
    try {
      await copyToClipboard(email);
    } catch (_) {
      return;
    }

    copyEmailBtn.classList.add('is-copied');
    copyEmailBtn.setAttribute('aria-label', 'Email copied to clipboard');
    if (copyEmailText) copyEmailText.textContent = 'Copied!';

    window.clearTimeout(copyResetTimeout);
    copyResetTimeout = window.setTimeout(() => {
      copyEmailBtn.classList.remove('is-copied');
      copyEmailBtn.setAttribute('aria-label', 'Copy email address');
      if (copyEmailText) copyEmailText.textContent = originalLabel;
    }, 2000);
  });
}

/* ---------------------------------------------------------
   Skills interactions
--------------------------------------------------------- */
const artGalleryImages = [
	{ src: 'assets/young mike3.gif', alt: 'Art preview 1' },
	{ src: 'assets/screenshot_2.webp', alt: 'Art preview 2' },
	{ src: 'assets/screenshot_3.webp', alt: 'Art preview 2' },
	{ src: 'assets/screenshot.webp', alt: 'Art preview 2' },
	{ src: 'assets/old mike4.png', alt: 'Art preview 3' }
];

const skillCards = Array.from(document.querySelectorAll('[data-skill-action]'));
const artModal = document.querySelector('#skill-art-modal');
const wipModal = document.querySelector('#wip-modal');
const aiModal = document.querySelector('#skill-ai-modal');
const artGalleryTrack = document.querySelector('#art-gallery-track');

const artGallery = document.querySelector('.art-gallery');

function enableArtGalleryMouseDrag() {
	if (!artGallery) return;

	let isDragging = false;
	let startX = 0;
	let startScrollLeft = 0;
	let moved = false;

	artGallery.addEventListener('pointerdown', (event) => {
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		if (event.target.closest('button, a')) return;
		isDragging = true;
		moved = false;
		startX = event.clientX;
		startScrollLeft = artGallery.scrollLeft;
		artGallery.classList.add('is-dragging');
		artGallery.setPointerCapture?.(event.pointerId);
	});

	artGallery.addEventListener('pointermove', (event) => {
		if (!isDragging) return;
		const deltaX = event.clientX - startX;
		if (Math.abs(deltaX) > 4) moved = true;
		artGallery.scrollLeft = startScrollLeft - deltaX;
		event.preventDefault();
	});

	const stopDragging = (event) => {
		if (!isDragging) return;
		isDragging = false;
		artGallery.classList.remove('is-dragging');
		try {
			artGallery.releasePointerCapture?.(event.pointerId);
		} catch (_) {
			// Pointer capture may already have been released.
		}
	};

	artGallery.addEventListener('pointerup', stopDragging);
	artGallery.addEventListener('pointercancel', stopDragging);
	artGallery.addEventListener('lostpointercapture', stopDragging);
	artGallery.addEventListener('click', (event) => {
		if (!moved) return;
		event.preventDefault();
		event.stopPropagation();
		moved = false;
	});
}

enableArtGalleryMouseDrag();

function renderArtGallery() {
	if (!artGalleryTrack) return;

	artGalleryTrack.innerHTML = '';
	artGalleryTrack.style.setProperty('--art-count', Math.max(1, artGalleryImages.length));

	artGalleryImages.forEach((image, index) => {
		const slide = document.createElement('div');
		slide.className = 'art-gallery-slide';
		slide.setAttribute('role', 'group');
		slide.setAttribute('aria-label', `Artwork ${index + 1} of ${artGalleryImages.length}`);

		const img = document.createElement('img');
		img.className = 'art-gallery-image';
		img.src = image.src;
		img.alt = image.alt;
		img.loading = 'lazy';
		img.addEventListener('error', () => {
			slide.innerHTML = '';
			const fallback = document.createElement('div');
			fallback.className = 'art-gallery-fallback';
			fallback.textContent = `Add image: ${image.src}`;
			slide.appendChild(fallback);
		}, { once: true });

		slide.appendChild(img);
		artGalleryTrack.appendChild(slide);
	});
}

function openSkillModal(modal) {
	if (!modal) return;
	modal.hidden = false;
	modal.setAttribute('aria-hidden', 'false');
	document.body.classList.add('skill-modal-open');
	if (modal === artModal) renderArtGallery();
	const closeButton = modal.querySelector('.skill-modal-close');
	if (closeButton) closeButton.focus();
}

function closeSkillModal(modal) {
	if (!modal) return;
	modal.hidden = true;
	modal.setAttribute('aria-hidden', 'true');
	if (!document.querySelector('.skill-modal:not([hidden])')) {
		document.body.classList.remove('skill-modal-open');
	}
}

function handleSkillAction(card) {
	const action = card.dataset.skillAction;

	if (action === 'projects') {
		scrollToSectionId('work');
		return;
	}

	if (action === 'art') {
		openSkillModal(artModal);
		return;
	}

	if (action === 'audio') {
		window.location.href = 'https://soundcloud.com/laymon-games';
		return;
	}

	if (action === 'video') {
		window.location.href = 'https://www.youtube.com/@AymensCorner';
		return;
	}

	if (action === 'ai') {
		openSkillModal(aiModal);
	}
}

skillCards.forEach((card) => {
	card.addEventListener('click', () => handleSkillAction(card));
	card.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleSkillAction(card);
		}
	});
});

document.querySelectorAll('[data-modal-close]').forEach((closeTrigger) => {
	closeTrigger.addEventListener('click', () => {
		closeSkillModal(closeTrigger.closest('.skill-modal'));
	});
});

/* ---------------------------------------------------------
   Project card links
--------------------------------------------------------- */
const projectCards = Array.from(document.querySelectorAll('[data-itch-url]'));

projectCards.forEach((card) => {
	const url = card.dataset.itchUrl;
	if (!url) return;

	card.addEventListener('click', (event) => {
		if (event.target.closest('a')) return;
		window.location.href = url;
	});

	card.addEventListener('keydown', (event) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		if (event.target !== card) return;
		event.preventDefault();
		window.location.href = url;
	});
});

// WIP project cards — show "under development" popup instead of navigating
const wipCards = Array.from(document.querySelectorAll('[data-wip]'));

wipCards.forEach((card) => {
	card.addEventListener('click', (event) => {
		if (event.target.closest('a')) return;
		openSkillModal(wipModal);
	});

	card.addEventListener('keydown', (event) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		if (event.target !== card) return;
		event.preventDefault();
		openSkillModal(wipModal);
	});
});

document.addEventListener('keydown', (event) => {
	if (event.key !== 'Escape') return;
	document.querySelectorAll('.skill-modal:not([hidden])').forEach((modal) => closeSkillModal(modal));
});
