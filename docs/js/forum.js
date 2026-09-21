// 社区论坛:账户按网络地址自动生成(服务端取请求头里的客户端地址做加盐哈希),
// 不提供注册与登录;同一个网络地址永远是同一个账户,名字可以自己取,改完历史发言一起改名。
// 帖子一次性取回,分类、搜索与排序都在前端完成。
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
  const accountCard = document.querySelector('[data-account-card]');
  const accountName = document.querySelector('[data-account-name]');
  const accountMeta = document.querySelector('[data-account-meta]');
  const accountForm = document.querySelector('[data-account-form]');
  const accountInput = document.querySelector('#account-name-input');
  const accountStatus = document.querySelector('[data-account-status]');
  const accountNote = document.querySelector('[data-account-note]');
  const postAs = document.querySelector('[data-post-as]');

  const CATEGORIES = ['银行卡', '电话卡', '海外证券', '出海生活'];
  const SUMMARY_LIMIT = 180;
  const MAX_CONTENT = 1200;
  const ACCOUNT_NOTE = accountNote ? accountNote.textContent.trim() : '';

  let topics = [];
  let category = 'all';
  let keyword = '';
  let sort = 'new';
  let identity = null;
  let identityReady = false;

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
    const author = topic.author_label || topic.author_name || '';
    const mine = Boolean(identity && author && identity.author_label === author);
    const article = document.createElement('article');
    article.className = 'topic-card';
    article.dataset.category = topic.category;
    article.innerHTML =
      '<div class="topic-meta">' +
      '<span>' + escapeHtml(topic.category) + '</span>' +
      (author
        ? '<span class="topic-author' + (mine ? ' is-mine' : '') + '">'
          + escapeHtml(author) + (mine ? ' · 你' : '') + '</span>'
        : '') +
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

  function setStatus(node, message, isError) {
    if (!node) return;
    node.textContent = message || '';
    node.classList.toggle('is-error', Boolean(isError));
  }

  function setPostAs(text, isError) {
    if (!postAs) return;
    postAs.textContent = text;
    postAs.classList.toggle('is-error', Boolean(isError));
  }

  function updateCharCount() {
    if (!charCount || !textarea) return;
    const length = textarea.value.length;
    charCount.textContent = length + ' / ' + MAX_CONTENT;
    charCount.classList.toggle('is-near', length > MAX_CONTENT * 0.9);
  }

  function isMissingFunction(error) {
    return /could not find the function|does not exist|PGRST202/i.test(
      (error && error.message) || '');
  }

  /* ---------------- 账户 ---------------- */

  function paintIdentity() {
    const label = identity.author_label;
    if (accountName) accountName.textContent = label;
    if (accountMeta) {
      const since = identity.first_seen_at
        ? new Date(identity.first_seen_at).toLocaleDateString('zh-CN')
        : '';
      accountMeta.textContent = '已发布 ' + identity.topic_count + ' 个话题'
        + (since ? ' · 首次出现于 ' + since : '')
        + (identity.needs_name ? ' · 还没取名字' : ' · 名字已设置');
    }
    if (accountInput && document.activeElement !== accountInput) {
      accountInput.value = identity.display_name || '';
    }
    if (accountCard) accountCard.hidden = false;
    if (accountNote) {
      accountNote.hidden = false;
      accountNote.textContent = ACCOUNT_NOTE;
    }
    setPostAs('以「' + label + '」发言');
  }

  function degradeIdentity(message, isError) {
    identityReady = false;
    if (accountCard) accountCard.hidden = true;
    if (accountNote) {
      accountNote.hidden = false;
      // 面向访客只说明现状,不给部署指引;排查线索留给控制台。
      accountNote.textContent = ACCOUNT_NOTE;
    }
    if (message) console.warn('[forum] ' + message);
    setPostAs('匿名发言', isError);
  }

  async function loadIdentity() {
    if (!window.sb) {
      degradeIdentity('未找到 Supabase 客户端,论坛只能浏览。', true);
      return;
    }
    const { data, error } = await window.sb.rpc('forum_whoami');
    if (error) {
      if (isMissingFunction(error)) {
        degradeIdentity('数据库里缺少 forum_whoami 函数。把 supabase/forum-identity.sql '
          + '放进 Supabase SQL Editor 执行一次即可启用按地址自动建账户。');
      } else {
        degradeIdentity('识别网络地址失败:' + (error.message || '未知错误'), true);
      }
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      degradeIdentity('forum_whoami 返回空结果,已退回匿名发言。', true);
      return;
    }
    identity = row;
    identityReady = true;
    paintIdentity();
  }

  /* ---------------- 数据 ---------------- */

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

  /* ---------------- 交互 ---------------- */

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

  accountForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = accountForm.querySelector('button[type="submit"]');
    const value = accountInput ? accountInput.value.trim() : '';
    if (!value) {
      setStatus(accountStatus, '先想一个名字再保存。', true);
      return;
    }
    if (!window.sb || !identityReady) {
      setStatus(accountStatus, '账户服务暂未就绪，暂时改不了名字。', true);
      return;
    }
    submit.disabled = true;
    submit.textContent = '保存中…';
    setStatus(accountStatus, '正在保存…');
    const { data, error } = await window.sb.rpc('set_forum_name', { p_name: value });
    submit.disabled = false;
    submit.textContent = '保存名字';
    if (error) {
      setStatus(accountStatus, error.message || '保存失败，换一个名字再试试。', true);
      return;
    }
    const saved = typeof data === 'string' ? data : value;
    identity = Object.assign({}, identity, {
      display_name: saved,
      author_label: saved,
      needs_name: false,
    });
    paintIdentity();
    setStatus(accountStatus, '已保存，页面上所有属于你的发言都改成了「' + saved + '」。');
    await loadTopics();
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    if (!window.sb) {
      setStatus(status, '论坛服务暂未连接，请稍后再试。', true);
      return;
    }
    const payload = new FormData(form);
    submit.disabled = true;
    submit.textContent = '发布中…';
    setStatus(status, '正在提交…');
    const { error } = await window.sb.rpc('create_forum_topic', {
      p_title: String(payload.get('title')).trim(),
      p_category: payload.get('category'),
      p_content: String(payload.get('content')).trim(),
    });
    submit.disabled = false;
    submit.textContent = '发布话题 ↗';
    if (error) {
      setStatus(status, '发布失败：' + (error.message || '请检查内容后重试。'), true);
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
    setStatus(status, '发布成功，已出现在列表顶部。');
    if (identityReady) {
      identity = Object.assign({}, identity, { topic_count: (identity.topic_count || 0) + 1 });
      paintIdentity();
    }
    await loadTopics();
  });

  updateCharCount();
  (async function boot() {
    await loadIdentity();
    await loadTopics();
  })();
})();
