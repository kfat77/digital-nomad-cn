// 重大事项日历:数据来自 data/calendar.json,按当天自动区分「待发生」与「已发生」。
(function () {
  const listRoot = document.querySelector('[data-calendar-list]');
  if (!listRoot) return;

  const archiveRoot = document.querySelector('[data-calendar-archive]');
  const watchRoot = document.querySelector('[data-calendar-watchlist]');
  const filtersRoot = document.querySelector('[data-calendar-filters]');
  const updatedRoot = document.querySelector('[data-calendar-updated]');

  const LEVEL_LABEL = { high: '重点', mid: '关注', watch: '观察' };
  const LEVEL_CLASS = { high: 'is-high', mid: 'is-mid', watch: 'is-watch' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function parseDate(value) {
    const parts = value.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function buildItem(item, label, isPast) {
    const parts = item.date.split('-');
    const level = item.level || 'watch';
    const article = document.createElement('article');
    article.className = 'calendar-item' + (isPast ? ' is-past' : '');
    article.dataset.category = item.category;
    article.innerHTML =
      '<div class="calendar-date">' +
      '<span class="calendar-day">' + escapeHtml(parts[1] + '-' + parts[2]) + '</span>' +
      '<span class="calendar-year">' + escapeHtml(parts[0]) + '</span>' +
      '</div>' +
      '<div class="calendar-body">' +
      '<div class="calendar-meta">' +
      '<span class="calendar-tag tag-' + escapeHtml(item.category) + '">' + escapeHtml(label) + '</span>' +
      '<span class="calendar-region">' + escapeHtml(item.region) + '</span>' +
      '<span class="calendar-level ' + (LEVEL_CLASS[level] || 'is-watch') + '">' + escapeHtml(LEVEL_LABEL[level] || '观察') + '</span>' +
      (isPast ? '<span class="calendar-past">已发生</span>' : '') +
      '</div>' +
      '<h3>' + escapeHtml(item.title) + '</h3>' +
      '<p class="calendar-detail">' + escapeHtml(item.detail) + '</p>' +
      '<p class="calendar-impact"><b>对你的影响</b>' + escapeHtml(item.impact) + '</p>' +
      '</div>';
    return article;
  }

  function render(data) {
    listRoot.innerHTML = '';
    const labels = {};
    (data.categories || []).forEach(function (category) {
      labels[category.key] = category.label;
    });

    const items = (data.items || []).slice().sort(function (a, b) {
      return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    });

    const upcoming = items.filter(function (item) {
      return parseDate(item.date) >= today;
    });
    const past = items.filter(function (item) {
      return parseDate(item.date) < today;
    }).reverse();

    upcoming.forEach(function (item) {
      listRoot.appendChild(buildItem(item, labels[item.category] || '事项', false));
    });

    if (archiveRoot && past.length) {
      past.forEach(function (item) {
        archiveRoot.appendChild(buildItem(item, labels[item.category] || '事项', true));
      });
      const archive = archiveRoot.closest('details');
      if (archive) archive.hidden = false;
    }

    if (filtersRoot && data.categories) {
      const all = document.createElement('button');
      all.type = 'button';
      all.className = 'calendar-filter is-active';
      all.dataset.filter = 'all';
      all.textContent = '全部';
      filtersRoot.appendChild(all);

      data.categories.forEach(function (category) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'calendar-filter';
        button.dataset.filter = category.key;
        button.textContent = category.label;
        filtersRoot.appendChild(button);
      });

      filtersRoot.addEventListener('click', function (event) {
        const target = event.target.closest('[data-filter]');
        if (!target) return;
        const key = target.dataset.filter;
        filtersRoot.querySelectorAll('.calendar-filter').forEach(function (button) {
          button.classList.toggle('is-active', button === target);
        });
        document.querySelectorAll('.calendar-item').forEach(function (item) {
          item.hidden = key !== 'all' && item.dataset.category !== key;
        });
      });
    }

    if (watchRoot && data.watchlist) {
      data.watchlist.forEach(function (entry) {
        const li = document.createElement('li');
        li.innerHTML =
          '<h3>' + escapeHtml(entry.title) + '</h3>' +
          '<p>' + escapeHtml(entry.impact) + '</p>';
        watchRoot.appendChild(li);
      });
    }

    if (updatedRoot && data.updated) {
      updatedRoot.textContent = '数据核对日期:' + data.updated;
    }

    revealItems();
  }

  function revealItems() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = document.querySelectorAll('.calendar-item');
    if (!items.length) return;
    ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: function (batch) {
        gsap.from(batch, {
          autoAlpha: 0,
          y: 26,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.06,
          overwrite: 'auto',
        });
      },
    });
  }

  fetch('./data/calendar.json')
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(render)
    .catch(function (error) {
      console.warn('日历加载失败:', error);
      listRoot.innerHTML = '<p class="calendar-error">日历数据暂时无法加载,请稍后重试。</p>';
    });
})();
