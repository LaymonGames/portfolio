/**
 * ============================================================
 * LAYMON GAMES — PORTFOLIO JAVASCRIPT
 * Pure Vanilla JS · No Frameworks · Production Ready
 * Features: Smooth scroll, reveal animations, filtering, 
 *           mobile nav, back-to-top, active nav highlighting
 * ============================================================
 */

(function() {
  'use strict';

  // ===================== DOM ELEMENTS =====================

  // Navigation elements
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');
  const navLinks = document.querySelectorAll('.nav-link');

  // Hero particles container
  const heroParticles = document.getElementById('heroParticles');

  // Project filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  // Back to top button
  const backToTopBtn = document.getElementById('backToTop');

  // Footer year span
  const currentYearSpan = document.getElementById('currentYear');

  // ===================== UTILITY FUNCTIONS =====================

  /**
   * Throttle function for scroll events.
   * Limits how often a callback can fire during rapid scrolling.
   */
  function throttle(callback, delay) {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        callback.apply(this, args);
      }
    };
  }

  /**
   * Debounce function for resize events.
   * Delays execution until after user stops resizing.
   */
  function debounce(callback, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback.apply(this, args), delay);
    };
  }

  // ===================== HERO PARTICLES =====================

  /**
   * Creates floating particles in the hero section.
   * Uses requestAnimationFrame for smooth animation.
   */
  function createParticles() {
    const particleCount = window.innerWidth < 768 ? 15 : 30;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');

      // Random positioning and animation properties
      const left = Math.random() * 100;
      const size = Math.random() * 4 + 2;
      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 10;

      particle.style.left = `${left}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `-${delay}s`;

      heroParticles.appendChild(particle);
    }
  }

  // ===================== REVEAL ANIMATIONS =====================

  /**
   * Uses Intersection Observer to trigger reveal animations 
   * when elements enter the viewport.
   */
  function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              // Once revealed, stop observing for performance
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      revealElements.forEach((el) => observer.observe(el));
    } else {
      // Fallback for browsers without IntersectionObserver
      revealElements.forEach((el) => el.classList.add('visible'));
    }
  }

  // ===================== NAVIGATION =====================

  /**
   * Handles mobile navigation toggle.
   */
  function handleNavToggleClick() {
    const isOpen = navMenu.classList.contains('open');

    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  /**
   * Opens the mobile navigation menu.
   */
  function openMobileMenu() {
    navMenu.classList.add('open');
    navToggle.classList.add('active');
    navOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    navToggle.setAttribute('aria-expanded', 'true');

    // Focus first link for accessibility
    const firstLink = navMenu.querySelector('.nav-link');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 100);
    }
  }

  /**
   * Closes the mobile navigation menu.
   */
  function closeMobileMenu() {
    navMenu.classList.remove('open');
    navToggle.classList.remove('active');
    navOverlay.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
    navToggle.setAttribute('aria-expanded', 'false');

    // Return focus to toggle button
    navToggle.focus();
  }

  /**
   * Handles navigation link clicks.
   */
  function handleNavClick(e) {
    const href = e.currentTarget.getAttribute('href');

    if (href && href.startsWith('#')) {
      e.preventDefault();
      closeMobileMenu();

      // Smooth scroll to section
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const navHeight = navbar.offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }
  }

  /**
   * Closes mobile menu when clicking the overlay.
   */
  function handleOverlayClick() {
    closeMobileMenu();
  }

  // ===================== ACTIVE NAVIGATION HIGHLIGHTING =====================

  /**
   * Updates the active navigation link based on scroll position.
   * Uses Intersection Observer for accuracy.
   */
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    let currentSection = '';

    // Get all section positions
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - navbar.offsetHeight - 100;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionBottom) {
        currentSection = section.getAttribute('id');
      }
    });

    // Update active state on nav links
    navLinks.forEach((link) => {
      link.classList.remove('active');
      const targetSection = link.getAttribute('data-section');

      if (targetSection === currentSection) {
        link.classList.add('active');
      }
    });
  }

  // ===================== NAVBAR SCROLL EFFECTS =====================

  /**
   * Handles navbar styling on scroll.
   */
  function handleNavbarScroll() {
    if (window.pageYOffset > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // ===================== BACK TO TOP BUTTON =====================

  /**
   * Shows/hides the back-to-top button based on scroll position.
   */
  function handleBackToTopVisibility() {
    if (window.pageYOffset > 500) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  /**
   * Scrolls to the top of the page when back-to-top is clicked.
   */
  function handleBackToTopClick() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // ===================== PROJECT FILTERING =====================

  /**
   * Handles project category filtering.
   */
  function handleFilterClick(e) {
    const filter = e.currentTarget.getAttribute('data-filter');

    // Update active button state
    filterBtns.forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    e.currentTarget.classList.add('active');
    e.currentTarget.setAttribute('aria-selected', 'true');

    // Filter project cards with animation
    projectCards.forEach((card, index) => {
      const categories = card.getAttribute('data-project-category') || '';
      const shouldShow = filter === 'all' || categories.includes(filter);

      if (shouldShow) {
        card.classList.remove('hidden');
        // Staggered animation for visible cards
        card.style.transitionDelay = `${index * 0.05}s`;
      } else {
        card.classList.add('hidden');
        card.style.transitionDelay = '0s';
      }
    });

    // Re-trigger reveal animations on newly visible cards
    const visibleCards = document.querySelectorAll('.project-card:not(.hidden)');
    visibleCards.forEach((card) => {
      if (!card.classList.contains('visible')) {
        card.classList.add('visible');
      }
    });
  }

  // ===================== SCROLL EVENT HANDLER =====================

  /**
   * Throttled scroll event handler.
   * Updates navbar, active nav link, and back-to-top button visibility.
   */
  const onScroll = throttle(() => {
    handleNavbarScroll();
    updateActiveNavLink();
    handleBackToTopVisibility();
  }, 16); // ~60fps

  // ===================== KEYBOARD ACCESSIBILITY =====================

  /**
   * Handles keyboard navigation for accessibility.
   */
  function handleKeyDown(e) {
    // Close mobile menu on Escape key
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMobileMenu();
    }

    // Handle Tab key within mobile menu
    if (e.key === 'Tab') {
      const focusableElements = Array.from(navMenu.querySelectorAll('.nav-link'));
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // If Shift+Tab on first element, move to last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // If Tab on last element, move to first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  // ===================== FOOTER YEAR =====================

  /**
   * Sets the current year in the footer.
   */
  function setFooterYear() {
    if (currentYearSpan) {
      currentYearSpan.textContent = new Date().getFullYear();
    }
  }

  // ===================== INITIALIZE ALL FEATURES =====================

  /**
   * Initializes all features when DOM is ready.
   */
  function init() {
    // Set dynamic content
    setFooterYear();

    // Create hero particles
    createParticles();

    // Initialize reveal animations
    initRevealAnimations();

    // Event listeners for navigation links
    navLinks.forEach((link) => {
      link.addEventListener('click', handleNavClick);
    });

    // Hamburger toggle
    navToggle.addEventListener('click', handleNavToggleClick);

    // Overlay click to close menu
    navOverlay.addEventListener('click', handleOverlayClick);

    // Project filtering
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', handleFilterClick);
    });

    // Back to top button
    backToTopBtn.addEventListener('click', handleBackToTopClick);

    // Scroll events (throttled via requestAnimationFrame)
    window.addEventListener('scroll', onScroll, { passive: true });

    // Keyboard accessibility
    document.addEventListener('keydown', handleKeyDown);

    // Initial state checks
    handleNavbarScroll();
    updateActiveNavLink();
    handleBackToTopVisibility();
  }

  // ===================== START APPLICATION =====================

  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();