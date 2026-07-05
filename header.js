const header = document.getElementById('site-header');
const active = document.body.dataset.active || '';
const isNestedPage = window.location.pathname.includes('/resources/') || window.location.pathname.includes('/resource-tags/');
const basePath = isNestedPage ? '../' : '';
const navItems = [
  [basePath + 'index.html', 'Accueil', 'Accueil'],
  [basePath + 'notre-offre.html', 'Notre offre', 'Notre offre'],
  [basePath + 'formations.html', 'Formations', 'Formations'],
  [basePath + 'equipe-reseau.html', 'Équipe & réseau', 'Équipe & réseau'],
  [basePath + 'ressources.html', 'Ressources', 'Ressources']
];
header.innerHTML = `
<header class="nav" id="top">
  <div class="nav-inner">
    <a class="brand" href="${basePath}index.html" aria-label="CSE ZEN - Accueil">
      <img src="${basePath}assets/logo-cse-zen-panda.jpg" alt="CSE ZEN" class="brand-logo">
    </a>
    <button class="mobile-toggle" type="button" aria-expanded="false" aria-controls="main-menu" aria-label="Ouvrir le menu">☰</button>
    <nav class="main-menu" id="main-menu" aria-label="Navigation principale">
      ${navItems.map(([href,label,key]) => `<a href="${href}" class="${active === key ? 'is-active' : ''}">${label}</a>`).join('')}
      <a href="${basePath}contact.html" class="cta-nav ${active === 'Contact' ? 'is-active' : ''}">Prendre rendez-vous <span aria-hidden="true">→</span></a>
    </nav>
  </div>
</header>`;
