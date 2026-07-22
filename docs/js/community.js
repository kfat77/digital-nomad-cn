/* 社区讨论：为每张工具卡提供匿名留言和一次性有用度投票。 */
(function () {
  const storagePrefix = 'nomad-community-v1:';
  const panel = document.createElement('aside');
  panel.className = 'community-panel';
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
    <div class="community-backdrop" data-community-close></div>
    <section class="community-dialog" role="dialog" aria-modal="true" aria-labelledby="community-dialog-title">
      <div class="community-dialog-head">
        <div><p class="card-index">社区讨论</p><h2 id="community-dialog-title">加载中</h2></div>
        <button class="community-close" type="button" aria-label="关闭讨论" data-community-close>×</button>
      </div>
      <div class="community-comments" data-community-comments aria-live="polite"></div>
      <form class="community-form" data-community-form>
        <label for="community-message">分享你的真实体验</label>
        <textarea id="community-message" name="message" maxlength="500" required placeholder="例如：适合什么场景、实际办理条件、你遇到的坑……"></textarea>
        <div class="community-form-foot"><span>请勿留下联系方式或敏感个人信息</span><button type="submit">发布留言</button></div>
      </form>
    </section>`;
  document.body.appendChild(panel);

  let activeTool = null;
  const slugify = (text) => text.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/(^-|-$)/g, '');
  const getTool = (card) => {
    const category = card.closest('.tool-category')?.id || 'tools';
    const title = card.querySelector('h3')?.childNodes[0]?.textContent || card.querySelector('h3')?.textContent || '工具';
    return { id: `${category}-${slugify(title)}`, title: title.trim() };
  };
  const escapeHtml = (value) => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]);
  const voteKey = (toolId) => `${storagePrefix}vote:${toolId}`;

  function setStatus(button, message) {
    const status = button.closest('.community-actions')?.querySelector('[data-community-status]');
    if (status) status.textContent = message;
  }
  async function loadVotes(toolId, controls) {
    if (!window.sb) return;
    const { data, error } = await window.sb.rpc('get_tool_votes', { p_tool_id: toolId });
    if (error || !data?.[0]) return;
    controls.querySelector('[data-vote="up"] .vote-count').textContent = data[0].upvotes || 0;
    controls.querySelector('[data-vote="down"] .vote-count').textContent = data[0].downvotes || 0;
  }
  async function vote(tool, direction, controls) {
    if (localStorage.getItem(voteKey(tool.id))) { setStatus(controls.querySelector(`[data-vote="${direction}"]`), '你已评价过'); return; }
    if (!window.sb) { setStatus(controls.querySelector(`[data-vote="${direction}"]`), '讨论服务暂未连接'); return; }
    const { error } = await window.sb.rpc('vote_for_tool', { p_tool_id: tool.id, p_direction: direction });
    if (error) { setStatus(controls.querySelector(`[data-vote="${direction}"]`), '暂时无法提交，请稍后再试'); return; }
    localStorage.setItem(voteKey(tool.id), direction);
    controls.querySelector(`[data-vote="${direction}"]`).classList.add('is-selected');
    setStatus(controls.querySelector(`[data-vote="${direction}"]`), '已记录，谢谢');
    loadVotes(tool.id, controls);
  }
  function renderComments(comments) {
    const container = panel.querySelector('[data-community-comments]');
    if (!comments?.length) { container.innerHTML = '<p class="community-empty">还没有留言。写下第一条真实体验吧。</p>'; return; }
    container.innerHTML = comments.map((comment) => `<article class="community-comment"><p>${escapeHtml(comment.message)}</p><time>${new Date(comment.created_at).toLocaleDateString('zh-CN')}</time></article>`).join('');
  }
  async function loadComments() {
    const container = panel.querySelector('[data-community-comments]');
    container.innerHTML = '<p class="community-empty">正在加载留言…</p>';
    if (!window.sb) { container.innerHTML = '<p class="community-empty">讨论服务暂未连接。数据库配置完成后，大家的留言会显示在这里。</p>'; return; }
    const { data, error } = await window.sb.rpc('get_tool_comments', { p_tool_id: activeTool.id });
    if (error) { container.innerHTML = '<p class="community-empty">暂时无法加载留言，请稍后再试。</p>'; return; }
    renderComments(data);
  }
  function openPanel(tool) {
    activeTool = tool;
    panel.querySelector('#community-dialog-title').textContent = tool.title;
    panel.classList.add('is-open'); panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('community-open'); loadComments();
    setTimeout(() => panel.querySelector('textarea').focus(), 120);
  }
  function closePanel() { panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true'); document.body.classList.remove('community-open'); }
  panel.querySelectorAll('[data-community-close]').forEach((button) => button.addEventListener('click', closePanel));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closePanel(); });
  panel.querySelector('[data-community-form]').addEventListener('submit', async (event) => {
    event.preventDefault(); const textarea = event.currentTarget.message; const message = textarea.value.trim(); if (!message || !activeTool) return;
    const submit = event.currentTarget.querySelector('button[type="submit"]'); submit.disabled = true; submit.textContent = '发布中…';
    if (!window.sb) { alert('讨论服务暂未连接，请稍后再试。'); } else {
      const { error } = await window.sb.rpc('add_tool_comment', { p_tool_id: activeTool.id, p_message: message });
      if (error) alert('发布失败，请稍后再试。'); else { textarea.value = ''; await loadComments(); }
    }
    submit.disabled = false; submit.textContent = '发布留言';
  });
  document.querySelectorAll('.tool-card').forEach((card) => {
    const tool = getTool(card); const actions = document.createElement('div'); actions.className = 'community-actions';
    actions.innerHTML = `<button type="button" class="vote-button" data-vote="up" aria-label="觉得 ${tool.title} 有用"><span aria-hidden="true">↑</span> 有用 <b class="vote-count">0</b></button><button type="button" class="vote-button" data-vote="down" aria-label="觉得 ${tool.title} 没用"><span aria-hidden="true">↓</span> 没用 <b class="vote-count">0</b></button><button type="button" class="discussion-button">讨论 <span aria-hidden="true">↗</span></button><span class="community-status" data-community-status aria-live="polite"></span>`;
    card.appendChild(actions); loadVotes(tool.id, actions);
    const previous = localStorage.getItem(voteKey(tool.id)); if (previous) actions.querySelector(`[data-vote="${previous}"]`)?.classList.add('is-selected');
    actions.querySelector('[data-vote="up"]').addEventListener('click', () => vote(tool, 'up', actions));
    actions.querySelector('[data-vote="down"]').addEventListener('click', () => vote(tool, 'down', actions));
    actions.querySelector('.discussion-button').addEventListener('click', () => openPanel(tool));
  });
})();
