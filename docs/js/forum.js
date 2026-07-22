(function () {
  const list = document.querySelector('[data-topic-list]');
  const count = document.querySelector('[data-topic-count]');
  const form = document.querySelector('[data-topic-form]');
  let category = 'all';
  const escapeHtml = (value) => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]);
  const formatDate = (date) => new Date(date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  async function loadTopics() {
    if (!window.sb) { list.innerHTML = '<p class="forum-loading">论坛服务暂未连接，请稍后再试。</p>'; return; }
    list.innerHTML = '<p class="forum-loading">正在加载讨论…</p>';
    const { data, error } = await window.sb.rpc('get_forum_topics', { p_category: category === 'all' ? null : category });
    if (error) { list.innerHTML = '<p class="forum-loading">暂时无法加载讨论，请稍后再试。</p>'; return; }
    count.textContent = `${data.length} 个话题`;
    list.innerHTML = data.length ? data.map((topic) => `<article class="topic-card"><div class="topic-meta"><span>${escapeHtml(topic.category)}</span><time>${formatDate(topic.created_at)}</time></div><h3>${escapeHtml(topic.title)}</h3><p>${escapeHtml(topic.content)}</p></article>`).join('') : '<p class="forum-loading">这个分类还没有讨论。成为第一个发言的人吧。</p>';
  }
  document.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => { category = button.dataset.category; document.querySelectorAll('[data-category]').forEach((item) => item.classList.toggle('is-active', item === button)); loadTopics(); }));
  form?.addEventListener('submit', async (event) => {
    event.preventDefault(); const payload = new FormData(form); const submit = form.querySelector('button[type="submit"]');
    if (!window.sb) { alert('论坛服务暂未连接，请稍后再试。'); return; }
    submit.disabled = true; submit.textContent = '发布中…';
    const { error } = await window.sb.rpc('create_forum_topic', { p_title: payload.get('title').trim(), p_category: payload.get('category'), p_content: payload.get('content').trim() });
    submit.disabled = false; submit.textContent = '发布话题 ↗';
    if (error) { alert('发布失败，请检查内容后重试。'); return; }
    form.reset(); category = 'all'; document.querySelectorAll('[data-category]').forEach((item) => item.classList.toggle('is-active', item.dataset.category === 'all')); loadTopics();
  });
  loadTopics();
})();
