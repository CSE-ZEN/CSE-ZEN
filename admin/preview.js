/* Aperçu en direct dans l'espace d'édition (Decap CMS).
   Reprend la structure HTML de index.html et la feuille de style du site. */
(function () {
  var CMS = window.CMS;
  var h = window.h;

  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap');
  CMS.registerPreviewStyle('/style.css');

  function get(entry, path) {
    var v = entry.getIn(['data'].concat(path));
    return v && v.toJS ? v.toJS() : v;
  }

  // "Agissez en toute *sérénité*" → texte avec <em>
  function titre(t) {
    return String(t || '').split('*').map(function (part, i) {
      return i % 2 === 1 ? h('em', { key: i }, part) : part;
    });
  }

  var arrow = h('span', { className: 'arr', 'aria-hidden': 'true' }, '→');

  var docIcon = h('svg', { viewBox: '0 0 24 24', width: 24, height: 24, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('path', { d: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' }),
    h('path', { d: 'M14 3v5h5' }),
    h('path', { d: 'M13 15.5 19.5 9a1.4 1.4 0 0 1 2 2L15 17.5 12 18l.5-3Z' }),
    h('path', { d: 'M8 12h3M8 16h2' })
  );

  function AccueilPreview(props) {
    var e = props.entry;
    var b = get(e, ['bandeau']) || {};
    var pi = get(e, ['poles_intro']) || {};
    var poles = get(e, ['poles']) || [];
    var m = get(e, ['methode']) || {};
    var q = get(e, ['qui_sommes_nous']) || {};
    var ct = get(e, ['contact']) || {};

    return h('main', {},
      h('section', { className: 'hero' },
        h('div', { className: 'container hero-grid' },
          h('div', {},
            h('span', { className: 'thread' }),
            h('div', { className: 'eyebrow' }, b.surtitre),
            h('h1', {}, titre(b.titre)),
            h('p', { className: 'lede' }, b.texte),
            h('div', { className: 'actions' },
              h('a', { className: 'btn btn-primary' }, b.bouton_principal, ' ', arrow),
              h('a', { className: 'btn btn-secondary' }, b.bouton_secondaire)
            )
          ),
          h('div', { className: 'hero-aside' },
            h('div', { className: 'hero-card logo-card' },
              h('img', { src: '/assets/logo-cse-zen.jpg', alt: 'CSE ZEN', width: 340, height: 170 })
            ),
            h('div', { className: 'hero-card' },
              h('div', { className: 'hero-stats' },
                (b.chiffres || []).map(function (c, i) {
                  return h('div', { className: 'hero-stat', key: i }, h('strong', {}, c.valeur), h('span', {}, c.libelle));
                })
              )
            )
          )
        )
      ),

      h('section', { className: 'section' },
        h('div', { className: 'container' },
          h('div', { className: 'section-header' },
            h('span', { className: 'thread center' }),
            h('div', { className: 'kicker' }, pi.surtitre),
            h('h2', { className: 'section-title' }, titre(pi.titre)),
            h('p', { className: 'section-desc' }, pi.texte)
          ),
          h('div', { className: 'poles-grid' },
            poles.map(function (p, i) {
              return h('a', { className: 'pole-tile pole-tile-' + (i + 1), key: i },
                h('div', { className: 'pole-top' },
                  h('span', { className: 'pole-bar', 'aria-hidden': 'true' }),
                  h('span', { className: 'pole-icon', 'aria-hidden': 'true' }, p.icone === 'document' ? docIcon : p.icone)
                ),
                h('div', { className: 'pole-body' },
                  h('h3', {}, p.titre),
                  h('p', {}, p.sous_titre),
                  h('span', { className: 'pole-cta' }, p.bouton, ' ', arrow)
                )
              );
            })
          )
        )
      ),

      h('section', { className: 'section section-dark' },
        h('div', { className: 'container' },
          h('div', { className: 'section-header' },
            h('span', { className: 'thread center' }),
            h('div', { className: 'eyebrow' }, m.surtitre),
            h('h2', { className: 'section-title' }, titre(m.titre)),
            h('p', { className: 'section-desc' }, m.texte)
          ),
          h('div', { className: 'grid-3' },
            (m.cartes || []).map(function (k, i) {
              return h('div', { className: 'card method-card', key: i },
                h('span', { className: 'method-num' }, (i < 9 ? '0' : '') + (i + 1)),
                h('h3', {}, k.titre),
                h('p', {}, k.texte)
              );
            })
          )
        )
      ),

      h('section', { className: 'section section-ivoire' },
        h('div', { className: 'container grid-2' },
          h('div', {},
            h('span', { className: 'thread' }),
            h('div', { className: 'kicker' }, q.surtitre),
            h('h2', { className: 'section-title' }, q.titre),
            h('p', { className: 'section-desc' }, q.texte)
          ),
          h('div', { className: 'feature-list' },
            (q.points || []).map(function (f, i) {
              return h('div', { className: 'feature', key: i }, h('strong', {}, f.titre), f.texte);
            })
          )
        )
      ),

      h('section', { className: 'section section-dark' },
        h('div', { className: 'container' },
          h('div', { className: 'contact-box' },
            h('h2', {}, ct.titre),
            h('p', {}, ct.texte),
            h('div', { className: 'actions' },
              h('a', { className: 'btn btn-primary' }, ct.bouton),
              h('a', { className: 'btn btn-secondary' }, 'contact@cse-zen.com')
            )
          )
        )
      )
    );
  }

  CMS.registerPreviewTemplate('accueil', AccueilPreview);
})();
