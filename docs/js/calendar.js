// 钱进日历:数据来自 data/calendar.json,渲染成整年月历。
// 悬停(桌面)或点击(触屏)任意日期方块,该方块放大并展开当天全部事项。
(function () {
  const grid = document.querySelector('[data-calendar-grid]');
  if (!grid) return;

  const monthRoot = document.querySelector('[data-calendar-month]');
  const prevButton = document.querySelector('[data-calendar-prev]');
  const nextButton = document.querySelector('[data-calendar-next]');
  const todayButton = document.querySelector('[data-calendar-today]');
  const filtersRoot = document.querySelector('[data-calendar-filters]');
  const legendRoot = document.querySelector('[data-calendar-legend]');
  const watchRoot = document.querySelector('[data-calendar-watchlist]');
  const updatedRoot = document.querySelector('[data-calendar-updated]');
  const totalRoot = document.querySelector('[data-calendar-total]');
  const spanRoot = document.querySelector('[data-calendar-span]');
  const nextRoot = document.querySelector('[data-calendar-next]');

  const WEEKDAY = ['一', '二', '三', '四', '五', '六', '日'];
  const LEVEL_LABEL = { high: '重点', mid: '关注', watch: '观察' };
  const LEVEL_CLASS = { high: 'is-high', mid: 'is-mid', watch: 'is-watch' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let categories = [];
  let labelOf = {};
  let byDate = new Map();
  let filter = 'all';
  let view = { year: today.getFullYear(), month: today.getMonth() + 1 };
  let bounds = { min: null, max: null };
  let openCell = null;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function pad(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function toKey(year, month, day) {
    return year + '-' + pad(month) + '-' + pad(day);
  }

  function parseDate(value) {
    const parts = value.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  function matches(item) {
    return filter === 'all' || item.category === filter;
  }

  function visibleItems(key) {
    return (byDate.get(key) || []).filter(matches);
  }

  /* ---------- 单元格弹出内容 ---------- */

  function popupHtml(key, items) {
    const date = parseDate(key);
    const head = (date.getMonth() + 1) + ' 月 ' + date.getDate() + ' 日 · 周'
      + WEEKDAY[(date.getDay() + 6) % 7] + ' · ' + items.length + ' 项';
    const body = items.map(function (item) {
      const level = item.level || 'watch';
      return '<article class="cal-pop-item">' +
        '<div class="cal-pop-meta">' +
        '<span class="cal-tag tag-' + escapeHtml(item.category) + '">'
        + escapeHtml(labelOf[item.category] || '事项') + '</span>' +
        '<span class="cal-region">' + escapeHtml(item.region) + '</span>' +
        '<span class="cal-level ' + (LEVEL_CLASS[level] || 'is-watch') + '">'
        + escapeHtml(LEVEL_LABEL[level] || '观察') + '</span>' +
        '</div>' +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        '<p class="cal-pop-detail">' + escapeHtml(item.detail) + '</p>' +
        '<p class="cal-pop-impact"><b>对你的影响</b>' + escapeHtml(item.impact) + '</p>' +
        '</article>';
    }).join('');
    return '<div class="cal-pop-head"><span>' + escapeHtml(head) + '</span>' +
      '<button class="cal-pop-close" type="button" aria-label="关闭当日事项">✕</button></div>' + body;
  }

  function cellHtml(key, day, items, column, isToday, isPast) {
    const classes = ['cal-cell'];
    if (items.length) classes.push('has-events');
    if (isToday) classes.push('is-today');
    if (isPast) classes.push('is-past');
    if (column <= 1) classes.push('pop-left');
    else if (column >= 5) classes.push('pop-right');

    const dots = items.map(function (item) {
      return '<i class="cal-dot dot-' + escapeHtml(item.category) + '"></i>';
    }).join('');
    const chip = items.length
      ? '<span class="cal-chip">' + escapeHtml(items[0].title) + '</span>'
      : '';
    const label = items.length
      ? day + ' 日,' + items.length + ' 项事项:' + items.map(function (item) {
        return item.title;
      }).join('；')
      : day + ' 日,无排期事项';

    return '<div class="' + classes.join(' ') + '" data-date="' + escapeHtml(key) +
      '" data-col="' + column + '" tabindex="' + (items.length ? '0' : '-1') +
      '" role="button" aria-label="' + escapeHtml(label) + '" aria-expanded="false">' +
      '<span class="cal-num">' + day + '</span>' +
      '<span class="cal-dots">' + dots + '</span>' +
      chip +
      '</div>';
  }

  /* ---------- 渲染 ---------- */

  function renderMonth() {
    hideCell();
    const first = new Date(view.year, view.month - 1, 1);
    const offset = (first.getDay() + 6) % 7;
    const total = new Date(view.year, view.month, 0).getDate();
    const monthStart = new Date(view.year, view.month - 1, 1);

    let html = '';
    for (let index = 0; index < offset; index += 1) {
      html += '<div class="cal-cell is-blank" aria-hidden="true"></div>';
    }
    for (let day = 1; day <= total; day += 1) {
      const key = toKey(view.year, view.month, day);
      const items = visibleItems(key);
      const column = (offset + day - 1) % 7;
      const date = new Date(view.year, view.month - 1, day);
      html += cellHtml(key, day, items, column, isSameDay(date, today), date < today);
    }
    grid.innerHTML = html;

    if (monthRoot) monthRoot.textContent = view.year + ' 年 ' + view.month + ' 月';
    const monthCount = grid.querySelectorAll('.cal-cell.has-events').length;
    grid.dataset.monthDays = String(monthCount);

    if (prevButton) {
      prevButton.disabled = Boolean(bounds.min && monthStart <= bounds.min);
    }
    if (nextButton) {
      const monthEnd = new Date(view.year, view.month, 1);
      nextButton.disabled = Boolean(bounds.max && monthEnd >= bounds.max);
    }
  }

  function showCell(cell, pinned) {
    if (!cell || !cell.classList.contains('has-events')) return;
    if (openCell && openCell !== cell) hideCell();
    const key = cell.dataset.date;
    const items = visibleItems(key);
    if (!items.length) return;
    if (!cell.querySelector('.cal-pop')) {
      const pop = document.createElement('div');
      pop.className = 'cal-pop';
      pop.setAttribute('role', 'tooltip');
      pop.innerHTML = popupHtml(key, items);
      cell.appendChild(pop);
    }
    // 视口下方放不下时向上弹出,避免展开内容跑到屏幕外。
    const bounds = cell.getBoundingClientRect();
    const roomBelow = window.innerHeight - bounds.top;
    cell.classList.toggle('pop-up', roomBelow < 360 && bounds.bottom > 380);
    cell.classList.add('is-open');
    cell.setAttribute('aria-expanded', 'true');
    cell.dataset.pinned = pinned ? 'true' : 'false';
    openCell = cell;
  }

  function hideCell() {
    if (!openCell) return;
    openCell.classList.remove('is-open');
    openCell.setAttribute('aria-expanded', 'false');
    openCell.dataset.pinned = 'false';
    openCell = null;
  }

  /* ---------- 统计 ---------- */

  function renderStats(items) {
    if (!items.length) return;
    if (totalRoot) totalRoot.textContent = String(items.length);
    if (spanRoot) {
      spanRoot.textContent = items[0].date.slice(0, 7).replace('-', '.') + ' – '
        + items[items.length - 1].date.slice(0, 7).replace('-', '.');
    }
    if (nextRoot) {
      const upcoming = items.filter(function (item) {
        return parseDate(item.date) >= today;
      })[0];
      nextRoot.textContent = upcoming
        ? (parseDate(upcoming.date).getMonth() + 1) + ' 月 ' + parseDate(upcoming.date).getDate() + ' 日'
        : '已排至区间末尾';
    }
  }

  function renderLegend() {
    if (!legendRoot) return;
    legendRoot.innerHTML = categories.map(function (category) {
      return '<span class="cal-legend-item"><i class="cal-dot dot-' +
        escapeHtml(category.key) + '"></i>' + escapeHtml(category.label) + '</span>';
    }).join('');
  }

  function renderWatchlist(entries) {
    if (!watchRoot || !entries) return;
    watchRoot.innerHTML = entries.map(function (entry) {
      return '<li><h3>' + escapeHtml(entry.title) + '</h3><p>'
        + escapeHtml(entry.impact) + '</p></li>';
    }).join('');
  }

  /* ---------- 交互 ---------- */

  grid.addEventListener('pointerover', function (event) {
    const cell = event.target.closest('.cal-cell');
    if (!cell || cell === openCell) return;
    if (event.pointerType !== 'mouse') return;
    showCell(cell, false);
  });

  grid.addEventListener('pointerout', function (event) {
    if (event.pointerType !== 'mouse') return;
    const cell = event.target.closest('.cal-cell');
    if (!cell || cell !== openCell) return;
    if (event.relatedTarget && cell.contains(event.relatedTarget)) return;
    if (cell.dataset.pinned === 'true') return;
    hideCell();
  });

  grid.addEventListener('focusin', function (event) {
    const cell = event.target.closest('.cal-cell');
    if (cell) showCell(cell, false);
  });

  grid.addEventListener('focusout', function (event) {
    const cell = event.target.closest('.cal-cell');
    if (cell && cell === openCell && cell.dataset.pinned !== 'true') hideCell();
  });

  grid.addEventListener('click', function (event) {
    if (event.target.closest('.cal-pop-close')) {
      event.stopPropagation();
      hideCell();
      return;
    }
    const cell = event.target.closest('.cal-cell');
    if (!cell) return;
    if (cell === openCell && cell.dataset.pinned === 'true') {
      hideCell();
      return;
    }
    showCell(cell, true);
  });

  grid.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    hideCell();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') hideCell();
  });

  document.addEventListener('pointerdown', function (event) {
    if (!openCell) return;
    if (openCell.contains(event.target)) return;
    hideCell();
  });

  prevButton?.addEventListener('click', function () {
    const month = view.month === 1 ? 12 : view.month - 1;
    const year = view.month === 1 ? view.year - 1 : view.year;
    view = { year: year, month: month };
    renderMonth();
  });

  nextButton?.addEventListener('click', function () {
    const month = view.month === 12 ? 1 : view.month + 1;
    const year = view.month === 12 ? view.year + 1 : view.year;
    view = { year: year, month: month };
    renderMonth();
  });

  todayButton?.addEventListener('click', function () {
    view = { year: today.getFullYear(), month: today.getMonth() + 1 };
    renderMonth();
  });

  /* ---------- 启动 ---------- */

  function prepare(data) {
    categories = data.categories || [];
    categories.forEach(function (category) {
      labelOf[category.key] = category.label;
    });

    const items = (data.items || []).slice().sort(function (a, b) {
      return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    });
    items.forEach(function (item) {
      if (!byDate.has(item.date)) byDate.set(item.date, []);
      byDate.get(item.date).push(item);
    });

    const firstMonth = parseDate(items[0].date);
    const lastMonth = parseDate(items[items.length - 1].date);
    bounds.min = new Date(firstMonth.getFullYear(), firstMonth.getMonth(), 1);
    bounds.max = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);

    renderStats(items);
    renderLegend();
    renderWatchlist(data.watchlist);

    if (filtersRoot) {
      const buttons = [{ key: 'all', label: '全部' }].concat(categories);
      filtersRoot.innerHTML = buttons.map(function (button, index) {
        return '<button class="calendar-filter' + (index === 0 ? ' is-active' : '') +
          '" type="button" data-filter="' + escapeHtml(button.key) + '">' +
          escapeHtml(button.label) + '</button>';
      }).join('');
      filtersRoot.addEventListener('click', function (event) {
        const target = event.target.closest('[data-filter]');
        if (!target) return;
        filter = target.dataset.filter;
        filtersRoot.querySelectorAll('.calendar-filter').forEach(function (button) {
          button.classList.toggle('is-active', button === target);
        });
        renderMonth();
      });
    }

    if (updatedRoot && data.updated) {
      updatedRoot.textContent = '数据核对日期:' + data.updated + ' · 共 ' + items.length
        + ' 条已排期事项';
    }

    if (today < bounds.min || new Date(today.getFullYear(), today.getMonth(), 1) > bounds.max) {
      view = { year: firstMonth.getFullYear(), month: firstMonth.getMonth() + 1 };
    }
    renderMonth();
    revealBoard();
  }

  function revealBoard() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const board = document.querySelector('.calendar-board');
    if (!board) return;
    ScrollTrigger.create({
      trigger: board,
      start: 'top 88%',
      once: true,
      onEnter: function () {
        gsap.from(board, {
          autoAlpha: 0,
          y: 30,
          duration: 0.7,
          ease: 'power3.out',
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
    .then(prepare)
    .catch(function (error) {
      console.warn('日历加载失败:', error);
      grid.innerHTML = '<p class="calendar-error">日历数据暂时无法加载,请稍后重试。</p>';
    });
})();
