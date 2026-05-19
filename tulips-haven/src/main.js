/* ============================================================
   TULIPS HAVENS LTD — main.js
   Vanilla JS — No dependencies
   ============================================================ */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── 1. Navigation ──
function initNav() {
  const nav         = $('#nav');
  const burger      = $('#burger');
  const mobileMenu  = $('#mobileMenu');
  const mobileLinks = $$('.mobile-link');

  if (!nav || !burger || !mobileMenu) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger.addEventListener('click', () => {
    const isOpen = burger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', e => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !burger.contains(e.target)
    ) {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ── 2. Scroll Reveal ──
// Only non-hero .reveal elements animate in on scroll.
// Hero content is always visible via CSS — no JS needed there.
function initReveal() {
  // Exclude hero children — they're always visible via CSS
  const elements = $$('.reveal:not(.hero .reveal)');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px' }
  );

  elements.forEach(el => observer.observe(el));

  // Safety net: force-reveal anything already in the viewport after 1.5s
  setTimeout(() => {
    elements.forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('visible');
      }
    });
  }, 1500);
}

// ── 3. Active nav link highlighting ──
function initActiveNav() {
  const sections = $$('section[id]');
  const links    = $$('.nav__links a');
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(link => {
            link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--gold-bright)' : '';
          });
        }
      });
    },
    { threshold: 0.45 }
  );

  sections.forEach(s => observer.observe(s));
}

// ── 4. Card tilt (desktop only) ──
function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;
  const cards = $$('.stay-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transition = 'transform 0.1s ease';
      card.style.transform  = `translateY(-6px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      card.style.transform  = '';
    });
  });
}

// ── 5. Stat counters ──
function initCounters() {
  const stats = $$('.stat__num');
  if (!stats.length) return;

  const animateCounter = (el) => {
    const text   = el.textContent.trim();
    const suffix = text.replace(/[\d.]/g, '');
    const num    = parseFloat(text.replace(/[^\d.]/g, ''));
    if (isNaN(num)) return;

    const dur   = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / dur, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${Math.round(ease * num)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach(el => observer.observe(el));
}

// ── 6. Contact form ──
function initForm() {
  const form    = $('#contactForm');
  const success = $('#formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name  = $('#name').value.trim();
    const email = $('#email').value.trim();

    if (!name || !email) {
      const btn = form.querySelector('.btn');
      btn.style.animation = 'shake 0.4s ease';
      setTimeout(() => (btn.style.animation = ''), 500);
      return;
    }

    const btn = form.querySelector('.btn');
    btn.textContent = 'Sending…';
    btn.disabled    = true;

    setTimeout(() => {
      form.reset();
      btn.textContent = 'Send Enquiry 🌷';
      btn.disabled    = false;
      if (success) {
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 5000);
      }
    }, 1200);
  });
}

// ── 7. Parallax orbs ──
function initParallaxOrbs() {
  const orbs = $$('.hero__orb');
  if (!orbs.length) return;

  window.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    orbs.forEach((orb, i) => {
      orb.style.transform = `translate(${dx * (i + 1) * 14}px, ${dy * (i + 1) * 14}px)`;
    });
  }, { passive: true });
}

// ── 8. Cursor glow (desktop only) ──
function initCursorGlow() {
  if (window.innerWidth < 768) return;

  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position:      'fixed',
    width:         '300px',
    height:        '300px',
    borderRadius:  '50%',
    background:    'radial-gradient(circle, rgba(212,146,42,0.06), transparent 70%)',
    pointerEvents: 'none',
    transform:     'translate(-50%, -50%)',
    zIndex:        '999',
    top:           '-999px',
    left:          '-999px',
  });
  document.body.appendChild(glow);

  window.addEventListener('mousemove', e => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top  = `${e.clientY}px`;
  }, { passive: true });
}

// ── 9. Inject keyframes ──
function injectKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60%  { transform: translateX(-6px); }
      40%, 80%  { transform: translateX(6px); }
    }
  `;
  document.head.appendChild(style);
}

// ── Bootstrap ──
document.addEventListener('DOMContentLoaded', () => {
  injectKeyframes();
  initReveal();
  initNav();
  initActiveNav();
  initCardTilt();
  initCounters();
  initForm();
  initParallaxOrbs();
  initCursorGlow();

  console.log('%c🌷 Tulips Havens Ltd', 'color: #f0c040; font-size: 18px; font-weight: bold;');
  console.log('%cStays & Retreats — Where every stay blooms.', 'color: #9a8870; font-size: 12px;');
});