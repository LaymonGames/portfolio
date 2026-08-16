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

function updateClock() {
	const now = new Date();
	const seconds = now.getSeconds();
	const minutes = now.getMinutes() + seconds / 60;
	const hours = (now.getHours() % 12) + minutes / 60;

	setHandAngle(secondHand, seconds * 6);
	setHandAngle(minuteHand, minutes * 6);
	setHandAngle(hourHand, hours * 30);
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

if (secondHand && minuteHand && hourHand) {
	updateClock();
	setInterval(updateClock, 1000);
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
