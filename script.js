
// Mobile menu
const toggle = document.querySelector('.mobile-toggle');
const menu = document.querySelector('.main-menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.textContent = open ? '✕' : '☰';
  });
  // close menu when a link is tapped (mobile)
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
  }));
}

// Sticky header shrink on scroll
const nav = document.querySelector('.nav');
const onScroll = () => {
  if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal-on-scroll — subtle, elegant, never gadget-y
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  // Auto-tag the obvious candidates so HTML stays light
  const autoTargets = [
    '.section-header',
    '.pole-tile',
    '.offer-band',
    '.card',
    '.feature',
    '.person',
    '.article-card',
    '.formation-card',
    '.brand-card',
    '.partner-card',
    '.stat-strip',
    '.villa-band',
    '.contact-box'
  ];
  document.querySelectorAll(autoTargets.join(',')).forEach((el, i) => {
    el.classList.add('reveal');
    // stagger in row groups
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(c => c.matches(autoTargets.join(',')));
      const idx = siblings.indexOf(el);
      if (idx >= 0 && idx < 4) el.setAttribute('data-d', String(idx));
    }
    io.observe(el);
  });

  // Manual reveals
  document.querySelectorAll('.reveal:not(.is-visible)').forEach(el => io.observe(el));
}

// Resource library filters (ressources.html) — client-side, no reload
const filterBar = document.querySelector('.resource-filters');
const resourceGrid = document.getElementById('resource-grid');
if (filterBar && resourceGrid) {
  const pills = filterBar.querySelectorAll('.filter-pill');
  const cards = resourceGrid.querySelectorAll('.article-card');

  const applyFilter = (filter) => {
    cards.forEach(card => {
      const match = filter === 'all' || card.getAttribute('data-cat') === filter;
      card.classList.toggle('is-hidden', !match);
    });
  };

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      applyFilter(pill.getAttribute('data-filter'));
    });
  });
}

// Very subtle parallax on hero copper glow (no animation if reduced motion)
if (!prefersReduced) {
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const y = Math.min(window.scrollY, 600);
      hero.style.setProperty('--hero-shift', (y * 0.06) + 'px');
    }, { passive: true });
  }
}
