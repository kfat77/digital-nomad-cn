// 社区论坛:一次性取回话题,分类、搜索与排序都在前端完成,切换不再重新请求。
(function () {
  const list = document.querySelector('[data-topic-list]');
  if (!list) return;

  const count = document.querySelector('[data-topic-count]');
  const statTopics = document.querySelector('[data-stat-topics]');
  const form = document.querySelector('[data-topic-form]');
  const searchInput = document.querySelector('[data-forum-search]');
  const charCount = document.querySelector('[data-char-count]');
  const status = document.querySelector('[data-topic-status]');
  const textarea = form ? form.querySelector('textarea[name="content"]') : null;

  const CATEGORIES = ['银行卡', '电话卡', '海外证券', '出海生活'];
  const SUMMARY_LIMIT = 180;
  const MAX_CONTENT = 1200;

  let topics = [];
  let category = 'all';
  let keyword = '';
  let sort = 'new';

  const escapeHtml = (value) =>
    String(value).replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#039;',
      '"': '&quot;',
    })[char]);

  function relativeTime(value) {
    const time = new Date(value).getTime();
    if (Number.isNaN(time)) return '';
    const diff = Date.now() - time;
    const minute = 60000;
    const hour = 3600000;
    const day = 86400000;
    if (diff < minute) return '刚刚';
    if (diff < hour) return Math.floor(diff / minute) + ' 分钟前';
    if (diff < day) return Math.floor(diff / hour) + ' 小时前';
    if (diff < day * 30) return Math.floor(diff / day) + ' 天前';
    return new Date(value).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function updateCounts() {
    const tally = { all: topics.length };
    CATEGORIES.forEach((item) => { tally[item] = 0; });
    topics.forEach((topic) => {
      tally[topic.category] = (tally[topic.category] || 0) + 1;
    });
    document.querySelectorAll('[data-count]').forEach((node) => {
      const value = tally[node.dataset.count];
      node.textContent = String(value === undefined ? 0 : value);
    });
    if (statTopics) statTopics.textContent = String(topics.length);
  }

  function visibleTopics() {
    let items = topics.slice();
    if (category !== 'all') {
      items = items.filter((topic) => topic.category === category);
    }
    if (keyword) {
      const needle = keyword.toLowerCase();
      items = items.filter((topic) =>
        (topic.title + ' ' + topic.content).toLowerCase().includes(needle));
    }
    items.sort((a, b) => {
      const left = new Date(a.created_at).getTime();
      const right = new Date(b.created_at).getTime();
      return sort === 'new' ? right - left : left - right;
    });
    return items;
  }

  function buildCard(topic) {
    const isLong = topic.content.length > SUMMARY_LIMIT;
    const body = isLong ? topic.content.slice(0, SUMMARY_LIMIT) : topic.content;
    const article = document.createElement('article');
    article.className = 'topic-card';
    article.dataset.category = topic.category;
    article.innerHTML =
      '<div class="topic-meta">' +
      '<span>' + escapeHtml(topic.category) + '</span>' +
      '<time datetime="' + escapeHtml(topic.created_at) + '">' + escapeHtml(relativeTime(topic.created_at)) + '</time>' +
      (isLong ? '<i class="topic-length">' + topic.content.length + ' 字</i>' : '') +
      '</div>' +
      '<h3>' + escapeHtml(topic.title) + '</h3>' +
      '<p class="topic-body">' + escapeHtml(body) + (isLong ? '…' : '') + '</p>' +
      (isLong
        ? '<button class="topic-toggle" type="button" data-topic-id="' + escapeHtml(topic.id) + '" data-expanded="false">展开全文</button>'
        : '');
    return article;
  }

  function render() {
    const items = visibleTopics();
    list.innerHTML = '';
    if (!items.length) {
      const hint = topics.length
        ? '没有匹配的讨论。换个关键词，或者切回「全部讨论」。'
        : '这个分类还没有讨论。成为第一个发言的人吧。';
      const empty = document.createElement('p');
      empty.className = 'forum-loading';
      empty.textContent = hint;
      list.appendChild(empty);
    } else {
      items.forEach((topic) => list.appendChild(buildCard(topic)));
    }
    if (count) {
      count.textContent = items.length === topics.length
        ? topics.length + ' 个话题'
        : items.length + ' / ' + topics.length + ' 个话题';
    }
    updateCounts();
  }

  function setStatus(message, isError) {
    if (!status) return;
    status.textContent = message || '';
    status.classList.toggle('is-error', Boolean(isError));
  }

  function updateCharCount() {
    if (!charCount || !textarea) return;
    const length = textarea.value.length;
    charCount.textContent = length + ' / ' + MAX_CONTENT;
    charCount.classList.toggle('is-near', length > MAX_CONTENT * 0.9);
  }

  async function loadTopics() {
    if (!window.sb) {
      list.innerHTML = '<p class="forum-loading">论坛服务暂未连接，请稍后再试。</p>';
      return;
    }
    list.innerHTML = '<p class="forum-loading">正在加载讨论…</p>';
    const { data, error } = await window.sb.rpc('get_forum_topics', { p_category: null });
    if (error) {
      list.innerHTML = '<p class="forum-loading">暂时无法加载讨论，请稍后再试。</p>';
      return;
    }
    topics = Array.isArray(data) ? data : [];
    render();
  }

  document.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      category = button.dataset.category;
      document.querySelectorAll('[data-category]').forEach((item) => {
        item.classList.toggle('is-active', item === button);
      });
      render();
    });
  });

  document.querySelectorAll('[data-sort]').forEach((button) => {
    button.addEventListener('click', () => {
      sort = button.dataset.sort;
      document.querySelectorAll('[data-sort]').forEach((item) => {
        item.classList.toggle('is-active', item === button);
      });
      render();
    });
  });

  searchInput?.addEventListener('input', () => {
    keyword = searchInput.value.trim();
    render();
  });

  textarea?.addEventListener('input', updateCharCount);

  list.addEventListener('click', (event) => {
    const button = event.target.closest('.topic-toggle');
    if (!button) return;
    const topic = topics.find((item) => item.id === button.dataset.topicId);
    if (!topic) return;
    const body = button.parentElement.querySelector('.topic-body');
    const expanded = button.dataset.expanded === 'true';
    body.textContent = expanded ? topic.content.slice(0, SUMMARY_LIMIT) + '…' : topic.content;
    button.textContent = expanded ? '展开全文' : '收起';
    button.dataset.expanded = String(!expanded);
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    if (!window.sb) {
      setStatus('论坛服务暂未连接，请稍后再试。', true);
      return;
    }
    const payload = new FormData(form);
    submit.disabled = true;
    submit.textContent = '发布中…';
    setStatus('正在提交…');
    const { error } = await window.sb.rpc('create_forum_topic', {
      p_title: String(payload.get('title')).trim(),
      p_category: payload.get('category'),
      p_content: String(payload.get('content')).trim(),
    });
    submit.disabled = false;
    submit.textContent = '发布话题 ↗';
    if (error) {
      setStatus('发布失败：' + (error.message || '请检查内容后重试。'), true);
      return;
    }
    form.reset();
    updateCharCount();
    category = 'all';
    keyword = '';
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('[data-category]').forEach((item) => {
      item.classList.toggle('is-active', item.dataset.category === 'all');
    });
    setStatus('发布成功，已出现在列表顶部。');
    await loadTopics();
  });

  updateCharCount();
  loadTopics();
})();
