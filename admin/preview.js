/* Aperçu en direct dans l'espace d'édition (Decap CMS).
   Principe : on récupère le vrai modèle de la page (le même que celui utilisé par GitHub pour construire le site),
   on le remplit avec le contenu en cours de saisie, et on affiche le résultat avec la feuille de style du site.
   Ainsi l'aperçu reste fidèle à toutes les pages sans code spécifique. */
(function () {
  var CMS = window.CMS;
  var h = window.h;
  var createClass = window.createClass;

  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap');
  CMS.registerPreviewStyle('/style.css');
  CMS.registerPreviewStyle('/admin/preview.css');

  // Où lire les modèles : la branche que l'interface modifie (lue dans config.yml)
  var BRANCH = 'main';
  var BASE = null;
  function base() {
    if (BASE) return Promise.resolve(BASE);
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      BASE = '/';
      return Promise.resolve(BASE);
    }
    return fetch('/admin/config.yml', { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (t) {
      var m = t.match(/^\s*branch:\s*([\w.\/-]+)/m);
      if (m) BRANCH = m[1];
      BASE = 'https://raw.githubusercontent.com/CSE-ZEN/CSE-ZEN/' + BRANCH + '/';
      return BASE;
    });
  }

  var cache = {};
  function getFile(path) {
    if (!cache[path]) {
      cache[path] = base().then(function (b) {
        return fetch(b + path + (b === '/' ? '' : '?t=' + Math.floor(Date.now() / 60000)), { cache: 'no-store' }).then(function (r) {
          if (!r.ok) throw new Error('Modèle introuvable : ' + path);
          return r.text();
        });
      });
    }
    return cache[path];
  }

  function stripFrontMatter(src) {
    return src.indexOf('---\n') === 0 ? src.slice(src.indexOf('\n---\n', 4) + 5) : src;
  }

  function md(s) {
    return window.marked.parse(String(s == null ? '' : s));
  }

  var engine = null;
  function liquid() {
    if (engine) return engine;
    engine = new window.liquidjs.Liquid({
      jekyllInclude: true,
      dynamicPartials: false,
      strictFilters: false,
      strictVariables: false,
      fs: {
        readFile: function (file) { return getFile('_includes/' + file.replace(/^.*_includes\//, '')); },
        readFileSync: function () { throw new Error('sync'); },
        exists: function () { return Promise.resolve(true); },
        existsSync: function () { return true; },
        contains: function () { return true; },
        resolve: function (root, file) { return file; },
        fallback: function () { return undefined; }
      },
      root: ['_includes/'],
      extname: ''
    });
    engine.registerFilter('markdownify', md);
    engine.registerFilter('cgi_escape', function (s) { return encodeURIComponent(String(s == null ? '' : s)); });
    engine.registerFilter('uri_escape', function (s) { return encodeURI(String(s == null ? '' : s)); });
    engine.registerFilter('xml_escape', function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); });
    engine.registerFilter('date_to_rfc822', function (d) { return new Date(d).toUTCString(); });
    engine.registerFilter('where_exp', function (a) { return a || []; });
    return engine;
  }

  // Les chemins relatifs (assets/…, ../assets/…) deviennent absolus pour l'aperçu
  function fixUrls(html) {
    return html
      .replace(/(src|href)="(?!https?:|\/|#|mailto:|tel:|data:)(?:\.\.\/)*([^"]*)"/g, '$1="/$2"')
      .replace(/url\((['"]?)(?!https?:|\/|data:)(?:\.\.\/)*([^'")]+)\1\)/g, "url($1/$2$1)");
  }

  function extractMain(html) {
    var m = html.match(/<main[^>]*>([\s\S]*)<\/main>/i);
    return m ? m[1] : html;
  }

  var Preview = function (templatePath, buildContext) {
    return createClass({
      getInitialState: function () { return { html: '<p class="cz-preview-wait">Chargement de l\'aperçu…</p>' }; },
      componentDidMount: function () { this.update(); },
      componentDidUpdate: function (prev) { if (prev.entry !== this.props.entry) this.schedule(); },
      componentWillUnmount: function () { clearTimeout(this.t); this.dead = true; },
      schedule: function () {
        var self = this; clearTimeout(this.t);
        this.t = setTimeout(function () { self.update(); }, 250);
      },
      update: function () {
        var self = this;
        var ctx = buildContext(this.props);
        getFile(typeof templatePath === 'function' ? templatePath(this.props) : templatePath).then(function (src) {
          return liquid().parseAndRender(stripFrontMatter(src), ctx);
        }).then(function (out) {
          if (!self.dead) self.setState({ html: fixUrls(extractMain(out)) });
        }).catch(function (e) {
          if (!self.dead) self.setState({ html: '<p class="cz-preview-wait">Aperçu indisponible pour le moment (' + String(e.message || e) + '). Le site, lui, n\'est pas concerné.</p>' });
        });
      },
      render: function () {
        return h('main', { dangerouslySetInnerHTML: { __html: this.state.html } });
      }
    });
  };

  function siteWith(dataPatch) {
    return { url: location.origin, data: dataPatch, articles: [] };
  }

  // Page d'accueil
  CMS.registerPreviewTemplate('accueil', Preview('index.html', function (props) {
    var data = props.entry.get('data').toJS();
    return { site: siteWith({ accueil: data }), page: { url: '/index.html' } };
  }));

  // Pages fixes : la liste vient de config.yml (fichier _data/pages/<nom>.yml ↔ page HTML)
  var PAGES = {
    notre_offre: 'notre-offre.html', formations: 'formations.html', communication: 'communication.html',
    solutions_digitales: 'solutions-digitales.html', pole_avocats: 'pole-avocats.html', pole_comptabilite: 'pole-comptabilite.html',
    assistance: 'assistance-cse.html', equipe_reseau: 'equipe-reseau.html', ressources: 'ressources.html',
    guides: 'resources/index.html', contact: 'contact.html', cookies: 'cookie-policy.html'
  };
  Object.keys(PAGES).forEach(function (name) {
    CMS.registerPreviewTemplate(name, Preview(PAGES[name], function (props) {
      var pages = {}; pages[name] = props.entry.get('data').toJS();
      return { site: siteWith({ pages: pages }), page: { url: '/' + PAGES[name] } };
    }));
  });

  // Articles
  CMS.registerPreviewTemplate('articles', Preview('_layouts/article.html', function (props) {
    var data = props.entry.get('data').toJS();
    var body = data.body || '';
    delete data.body;
    var html = md(body).replace(/<h2>([\s\S]*?)<\/h2>/g, function (m, t, i) {
      var id = t.replace(/<[^>]+>/g, '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return '<h2 id="' + id + '">' + t + '</h2>';
    });
    data.url = '/resources/' + (props.entry.get('slug') || 'nouvel-article') + '.html';
    data.content = html;
    return { site: siteWith({}), page: data, content: html };
  }));


  // Bouton « Préparer le post LinkedIn » pour l'équipe CSE ZEN
  var LINKEDIN_PAGE = 'https://www.linkedin.com/company/cselegal/admin/page-posts/published/?share=true';
  var LinkedInShare = createClass({
    getInitialState: function () { return { msg: '' }; },
    go: function () {
      var self = this;
      var entry = this.props.entry;
      var slug = entry && entry.get('slug');
      var data = entry ? entry.get('data') : null;
      if (!slug || (entry.get('newRecord'))) {
        this.setState({ msg: "Publiez d'abord l'article sur le site, puis revenez ici." });
        return;
      }
      var url = 'https://www.cse-zen.com/resources/' + slug + '.html';
      var texte = (data && (data.get('texte_linkedin') || data.get('description') || data.get('title'))) || '';
      var post = texte + '\n\n' + url;
      var done = function () {
        self.setState({ msg: "Texte et lien copiés. Dans LinkedIn, cliquez dans le post et collez-les (Ctrl+V). L'aperçu de l'article s'affiche tout seul." });
        window.open(LINKEDIN_PAGE, '_blank', 'noopener');
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(post).then(done, function () { self.setState({ msg: 'Copiez ce texte : ' + post }); window.open(LINKEDIN_PAGE, '_blank', 'noopener'); });
      } else {
        this.setState({ msg: 'Copiez ce texte : ' + post }); window.open(LINKEDIN_PAGE, '_blank', 'noopener');
      }
    },
    render: function () {
      return h('div', { className: this.props.classNameWrapper, style: { padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' } },
        h('button', { type: 'button', onClick: this.go, style: { background: '#0A66C2', color: '#fff', border: 0, borderRadius: '8px', padding: '11px 18px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' } }, 'Préparer le post sur la page LinkedIn de CSE ZEN'),
        this.state.msg ? h('span', { style: { fontSize: '13px', color: '#1B2036', lineHeight: 1.5 } }, this.state.msg) : null
      );
    }
  });
  CMS.registerWidget('linkedin-share', LinkedInShare, function () { return null; });

  // Blocs spéciaux dans le texte des articles
  CMS.registerEditorComponent({
    id: 'encadre',
    label: 'Encadré',
    fields: [{ name: 'texte', label: "Texte de l'encadré", widget: 'text' }],
    pattern: /^<aside>([\s\S]*?)<\/aside>$/m,
    fromBlock: function (m) { return { texte: m[1] }; },
    toBlock: function (o) { return '<aside>' + (o.texte || '').replace(/\n+/g, ' ') + '</aside>'; },
    toPreview: function (o) { return '<aside>' + (o.texte || '') + '</aside>'; }
  });
  CMS.registerEditorComponent({
    id: 'lien-externe',
    label: 'Lien mis en avant',
    fields: [
      { name: 'texte', label: 'Texte du lien', widget: 'string' },
      { name: 'url', label: 'Adresse (https://…)', widget: 'string' }
    ],
    pattern: /^<div class="external-note"><a href="([^"]*)" target="_blank" rel="noopener">([\s\S]*?)<\/a><\/div>$/m,
    fromBlock: function (m) { return { url: m[1], texte: m[2] }; },
    toBlock: function (o) { return '<div class="external-note"><a href="' + (o.url || '') + '" target="_blank" rel="noopener">' + (o.texte || '') + '</a></div>'; },
    toPreview: function (o) { return '<div class="external-note"><a href="' + (o.url || '') + '">' + (o.texte || '') + '</a></div>'; }
  });
})();
