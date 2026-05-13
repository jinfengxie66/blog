(function () {
  const html = document.documentElement;
  const toggleBtn = document.querySelector('.theme-toggle');
  const menuBtn = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  // ---- Marked + Highlight.js setup ----
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (e) { /* fall through */ }
        }
        return code;
      },
    });
  }

  // ---- Theme ----
  var hljsLight = document.getElementById('hljs-light');
  var hljsDark = document.getElementById('hljs-dark');

  function syncHljsTheme(theme) {
    if (!hljsLight || !hljsDark) return;
    hljsLight.disabled = theme === 'dark';
    hljsDark.disabled = theme === 'light';
  }

  var saved = localStorage.getItem('blog-theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var current = saved || (prefersDark ? 'dark' : 'light');
  html.setAttribute('data-theme', current);
  syncHljsTheme(current);

  function switchTheme() {
    var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('blog-theme', next);
    syncHljsTheme(next);
  }

  toggleBtn.addEventListener('click', switchTheme);

  // ---- Mobile menu ----
  menuBtn.addEventListener('click', function () {
    menuBtn.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      menuBtn.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ---- Scroll reveal ----
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });

  // ---- Reading progress bar ----
  var progressBar = document.getElementById('progressBar');
  function updateProgress() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });

  // ---- Back to top ----
  var backToTop = document.getElementById('backToTop');
  function toggleBackToTop() {
    if (window.scrollY > window.innerHeight) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- Clock ----
  var clockTime = document.getElementById('clockTime');
  var clockDate = document.getElementById('clockDate');
  var weekNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function updateClock() {
    var now = new Date();
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
  var corgiBtn = document.getElementById('corgiBtn');
  var widgetPanel = document.getElementById('widgetPanel');
  var panelOpen = false;

  corgiBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    panelOpen = !panelOpen;
    widgetPanel.classList.toggle('open', panelOpen);

    // Bounce animation
    corgiBtn.classList.remove('bounce');
    void corgiBtn.offsetWidth; // trigger reflow
    corgiBtn.classList.add('bounce');
  });

  document.addEventListener('click', function (e) {
    if (panelOpen && !e.target.closest('.corgi-widget')) {
      panelOpen = false;
      widgetPanel.classList.remove('open');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (panelOpen) {
        panelOpen = false;
        widgetPanel.classList.remove('open');
      }
      closeModal();
    }
  });

  document.getElementById('panelThemeToggle').addEventListener('click', function (e) {
    e.stopPropagation();
    switchTheme();
  });

  document.getElementById('panelTop').addEventListener('click', function (e) {
    e.stopPropagation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    panelOpen = false;
    widgetPanel.classList.remove('open');
  });

  // ---- Load & render posts ----
  var postsContainer = document.getElementById('postsContainer');
  var postsCache = null;

  function renderPosts(posts) {
    postsCache = posts;
    posts.forEach(function (post) {
      var charCount = post.summary.length;
      var minutes = Math.max(1, Math.round(charCount / 400));

      var article = document.createElement('article');
      article.className = 'post-card reveal';
      article.dataset.slug = post.slug;
      article.dataset.title = post.title;
      article.dataset.date = post.date;
      article.dataset.tag = post.tag;
      article.dataset.tagClass = post.tagClass;
      article.innerHTML =
        '<div class="accent-bar"></div>' +
        '<div class="post-card-meta">' +
          '<span class="tag ' + post.tagClass + '">' + post.tag + '</span>' +
          '<time datetime="' + post.date + '">' + post.date + '</time>' +
          '<span class="read-time">约 ' + minutes + ' 分钟阅读</span>' +
        '</div>' +
        '<h3><span class="post-link">' + post.title + '</span></h3>' +
        '<p>' + post.summary + '</p>';

      postsContainer.appendChild(article);
      observer.observe(article);

      // Click handler on article card
      article.addEventListener('click', function (e) {
        openPost(post.slug, post.title, post.date, post.tag, post.tagClass);
      });
    });
  }

  fetch('https://raw.githubusercontent.com/jinfengxie66/blog/master/posts.json')
    .then(function (res) { return res.json(); })
    .then(function (posts) {
      renderPosts(posts);

      // Hash route on load
      var hash = window.location.hash;
      if (hash && hash.indexOf('#post/') === 0) {
        var slugFromHash = hash.replace('#post/', '');
        var match = posts.find(function (p) { return p.slug === slugFromHash; });
        if (match) {
          openPost(match.slug, match.title, match.date, match.tag, match.tagClass);
        }
      }
    })
    .catch(function () {
      postsContainer.innerHTML =
        '<p style="text-align:center;color:var(--text-muted);padding:40px 0;">文章加载失败，请刷新重试。</p>';
    });

  // ---- Hash change listener ----
  window.addEventListener('hashchange', function () {
    var hash = window.location.hash;
    if (hash && hash.indexOf('#post/') === 0) {
      var slug = hash.replace('#post/', '');
      if (postsCache) {
        var match = postsCache.find(function (p) { return p.slug === slug; });
        if (match) {
          openPost(match.slug, match.title, match.date, match.tag, match.tagClass);
          return;
        }
      }
      // fallback: fetch posts.json
      fetch('https://raw.githubusercontent.com/jinfengxie66/blog/master/posts.json')
        .then(function (res) { return res.json(); })
        .then(function (posts) {
          postsCache = posts;
          var match = posts.find(function (p) { return p.slug === slug; });
          if (match) {
            openPost(match.slug, match.title, match.date, match.tag, match.tagClass);
          }
        });
    }
  });

  // ---- Article Modal ----
  var modalOverlay = document.getElementById('modalOverlay');
  var modalContent = document.getElementById('modalContent');
  var modalClose = document.getElementById('modalClose');
  var currentSlug = null;

  function openPost(slug, title, date, tag, tagClass) {
    if (currentSlug === slug && modalOverlay.classList.contains('open')) return;
    currentSlug = slug;
    if (window.location.hash !== '#post/' + slug) {
      window.location.hash = 'post/' + slug;
    }
    modalContent.innerHTML =
      '<div class="modal-loading">加载中...</div>';
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    fetch('https://raw.githubusercontent.com/jinfengxie66/blog/master/posts/' + slug + '.md')
      .then(function (res) {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then(function (raw) {
        var parts = raw.split('---');
        var body = parts.length >= 3 ? parts.slice(2).join('---') : raw;
        modalContent.innerHTML =
          '<article class="post-detail">' +
            '<h1 class="post-detail-title">' + title + '</h1>' +
            '<div class="post-detail-meta">' +
              '<span class="tag ' + tagClass + '">' + tag + '</span>' +
              '<time datetime="' + date + '">' + date + '</time>' +
            '</div>' +
            '<div class="post-detail-body">' + marked.parse(body) + '</div>' +
          '</article>';
      })
      .catch(function () {
        modalContent.innerHTML =
          '<p style="text-align:center;color:var(--text-muted);padding:60px 0;">文章加载失败，请稍后重试。</p>';
      });
  }

  function closeModal() {
    if (modalOverlay.classList.contains('open')) {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
      currentSlug = null;
      if (window.location.hash.indexOf('#post/') === 0) {
        history.replaceState(null, '', window.location.pathname);
      }
    }
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });
})();
