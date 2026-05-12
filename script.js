(function () {
  const html = document.documentElement;
  const toggleBtn = document.querySelector('.theme-toggle');
  const menuBtn = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  // ---- Theme ----
  const saved = localStorage.getItem('blog-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = saved || (prefersDark ? 'dark' : 'light');
  html.setAttribute('data-theme', current);

  function switchTheme() {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('blog-theme', next);
  }

  toggleBtn.addEventListener('click', switchTheme);

  // ---- Mobile menu ----
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ---- Scroll reveal ----
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // ---- Reading progress bar ----
  const progressBar = document.getElementById('progressBar');
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });

  // ---- Back to top ----
  const backToTop = document.getElementById('backToTop');
  function toggleBackToTop() {
    if (window.scrollY > window.innerHeight) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- Clock ----
  const clockTime = document.getElementById('clockTime');
  const clockDate = document.getElementById('clockDate');
  const weekNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function updateClock() {
    const now = new Date();
    clockTime.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
    clockDate.textContent =
      now.getFullYear() + '年' +
      (now.getMonth() + 1) + '月' +
      now.getDate() + '日 ' +
      weekNames[now.getDay()];
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ---- Corgi Widget ----
  const corgiBtn = document.getElementById('corgiBtn');
  const widgetPanel = document.getElementById('widgetPanel');
  let panelOpen = false;

  corgiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panelOpen = !panelOpen;
    widgetPanel.classList.toggle('open', panelOpen);
  });

  document.addEventListener('click', (e) => {
    if (panelOpen && !e.target.closest('.corgi-widget')) {
      panelOpen = false;
      widgetPanel.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (panelOpen) {
        panelOpen = false;
        widgetPanel.classList.remove('open');
      }
      closeModal();
    }
  });

  // Panel theme toggle
  document.getElementById('panelThemeToggle').addEventListener('click', (e) => {
    e.stopPropagation();
    switchTheme();
  });

  // Panel back to top
  document.getElementById('panelTop').addEventListener('click', (e) => {
    e.stopPropagation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    panelOpen = false;
    widgetPanel.classList.remove('open');
  });

  // ---- Load & render posts ----
  const postsContainer = document.getElementById('postsContainer');

  function renderPosts(posts) {
    posts.forEach((post) => {
      const charCount = post.summary.length;
      const minutes = Math.max(1, Math.round(charCount / 400));

      const article = document.createElement('article');
      article.className = 'post-card reveal';
      article.dataset.slug = post.slug;
      article.dataset.title = post.title;
      article.innerHTML =
        '<div class="accent-bar"></div>' +
        '<div class="post-card-meta">' +
          '<span class="tag ' + post.tagClass + '">' + post.tag + '</span>' +
          '<time datetime="' + post.date + '">' + post.date + '</time>' +
          '<span class="read-time">约 ' + minutes + ' 分钟阅读</span>' +
        '</div>' +
        '<h3><a href="#post/' + post.slug + '" class="post-link">' + post.title + '</a></h3>' +
        '<p>' + post.summary + '</p>';

      postsContainer.appendChild(article);
      observer.observe(article);

      // Click handler for the entire card
      article.addEventListener('click', function (e) {
        e.preventDefault();
        openPost(post.slug, post.title);
      });
    });
  }

  fetch('posts.json')
    .then((res) => res.json())
    .then((posts) => {
      var hash = window.location.hash;
      renderPosts(posts);

      // Check if there's a hash route on load
      if (hash && hash.startsWith('#post/')) {
        var slugFromHash = hash.replace('#post/', '');
        var match = posts.find(function (p) { return p.slug === slugFromHash; });
        if (match) {
          openPost(match.slug, match.title);
        }
      }
    })
    .catch(function () {
      postsContainer.innerHTML = '<p style="text-align:center;color:var(--text-muted)">文章加载失败，请刷新重试。</p>';
    });

  // ---- Hash change listener ----
  window.addEventListener('hashchange', function () {
    var hash = window.location.hash;
    if (hash && hash.startsWith('#post/')) {
      var slug = hash.replace('#post/', '');
      fetch('posts.json')
        .then(function (res) { return res.json(); })
        .then(function (posts) {
          var match = posts.find(function (p) { return p.slug === slug; });
          if (match) {
            openPost(match.slug, match.title);
          }
        });
    }
  });

  // ---- Article Modal ----
  var modalOverlay = document.getElementById('modalOverlay');
  var modalContent = document.getElementById('modalContent');
  var modalClose = document.getElementById('modalClose');
  var currentSlug = null;

  function openPost(slug, title) {
    currentSlug = slug;
    window.location.hash = 'post/' + slug;
    modalContent.innerHTML =
      '<div class="modal-loading">加载中...</div>';
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    var isDark = html.getAttribute('data-theme') === 'dark';
    // Strip frontmatter: split by --- and take everything after the second ---
    fetch('posts/' + slug + '.md')
      .then(function (res) { return res.text(); })
      .then(function (raw) {
        var parts = raw.split('---');
        var body = parts.length >= 3 ? parts.slice(2).join('---') : raw;
        modalContent.innerHTML =
          '<article class="post-detail">' +
            '<h1 class="post-detail-title">' + title + '</h1>' +
            '<div class="post-detail-body">' + marked.parse(body) + '</div>' +
          '</article>';
        // Apply syntax highlighting classes
        modalContent.querySelectorAll('pre code').forEach(function (block) {
          block.classList.add('code-block');
        });
      })
      .catch(function () {
        modalContent.innerHTML =
          '<p style="text-align:center;color:var(--text-muted);padding:40px 0;">文章加载失败。</p>';
      });
  }

  function closeModal() {
    if (modalOverlay.classList.contains('open')) {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
      currentSlug = null;
      // Remove hash only if it's a post hash
      if (window.location.hash.startsWith('#post/')) {
        history.replaceState(null, '', window.location.pathname);
      }
    }
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
})();
