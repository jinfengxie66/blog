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

  // Close panel on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panelOpen) {
      panelOpen = false;
      widgetPanel.classList.remove('open');
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
      article.innerHTML =
        '<div class="accent-bar"></div>' +
        '<div class="post-card-meta">' +
          '<span class="tag ' + post.tagClass + '">' + post.tag + '</span>' +
          '<time datetime="' + post.date + '">' + post.date + '</time>' +
          '<span class="read-time">约 ' + minutes + ' 分钟阅读</span>' +
        '</div>' +
        '<h3><a href="#">' + post.title + '</a></h3>' +
        '<p>' + post.summary + '</p>';

      postsContainer.appendChild(article);
      observer.observe(article);
    });
  }

  fetch('posts.json')
    .then((res) => res.json())
    .then((posts) => {
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      renderPosts(posts);
    })
    .catch(() => {
      postsContainer.innerHTML = '<p style="text-align:center;color:var(--text-muted)">文章加载失败，请刷新重试。</p>';
    });
})();
