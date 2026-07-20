/**
 * 管理后台逻辑 · admin.js
 * 依赖：config.js, supabase-client.js
 */
(function () {
  'use strict';

  var sb = window.sb;
  var cfg = window.SITE_CONFIG || {};
  var statusMap = cfg.ORDER_STATUS || {};
  var adminEmails = (cfg.ADMIN || {}).emails || [];
  var currentFilter = 'all';
  var currentOrders = [];
  var selectedOrderId = null;

  var loginSection = document.getElementById('login-section');
  var adminSection = document.getElementById('admin-section');
  var loginBtn = document.getElementById('login-btn');
  var logoutBtn = document.getElementById('logout-btn');
  var loginError = document.getElementById('login-error');
  var tableContainer = document.getElementById('table-container');
  var detailPanel = document.getElementById('detail-panel');
  var filterBar = document.getElementById('filter-bar');

  // -- 工具函数 --
  function statusBadge(status) {
    var label = statusMap[status] || status;
    return '<span class="status-badge s-' + status + '">' + label + '</span>';
  }
  function fmtTime(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0') + ' ' +
      String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0');
  }
  function maskPhone(phone) {
    if (!phone || phone.length < 7) return phone;
    return phone.slice(0, 3) + '****' + phone.slice(-4);
  }
  // P1-4: HTML 转义，防止 XSS
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  // 检查邮箱是否在管理员白名单中
  function isAdminEmail(email) {
    if (!email || !adminEmails.length) return false;
    return adminEmails.indexOf(email.toLowerCase()) !== -1;
  }

  // -- 登录状态管理 --
  function showLogin() {
    loginSection.style.display = 'block';
    adminSection.style.display = 'none';
  }
  function showAdmin() {
    loginSection.style.display = 'none';
    adminSection.style.display = 'block';
    loadOrders();
  }

  if (sb) {
    sb.auth.onAuthStateChange(function (event, session) {
      if (session && session.user) {
        // P1-3: 检查是否为管理员（前端双重校验，后端 RLS 也会拦截）
        if (isAdminEmail(session.user.email)) {
          showAdmin();
        } else {
          // 非管理员 — 登出并提示
          sb.auth.signOut();
          loginError.textContent = '此账号无管理员权限。';
          loginError.style.display = 'block';
          showLogin();
        }
      } else {
        showLogin();
      }
    });
  }

  // -- 登录 --
  if (loginBtn) {
    loginBtn.addEventListener('click', async function () {
      var email = document.getElementById('login-email').value.trim();
      var password = document.getElementById('login-password').value;

      loginError.style.display = 'none';
      if (!sb) {
        loginError.textContent = '系统未配置，请检查 Supabase 设置。';
        loginError.style.display = 'block';
        return;
      }
      if (!email || !password) {
        loginError.textContent = '请输入邮箱和密码。';
        loginError.style.display = 'block';
        return;
      }

      loginBtn.disabled = true;
      loginBtn.textContent = '登录中…';

      try {
        var result = await sb.auth.signInWithPassword({ email: email, password: password });
        if (result.error) throw result.error;
        // onAuthStateChange 会处理界面切换
      } catch (err) {
        loginError.textContent = '登录失败：' + (err.message || '邮箱或密码错误');
        loginError.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = '登录';
      }
    });
  }

  // -- 登出 --
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function () {
      if (sb) await sb.auth.signOut();
      showLogin();
    });
  }

  // -- 加载订单列表 --
  async function loadOrders() {
    if (!sb) return;
    tableContainer.innerHTML = '<div class="empty-state">加载中…</div>';

    try {
      var query = sb.from('orders').select('*').order('created_at', { ascending: false });
      if (currentFilter !== 'all') {
        query = query.eq('status', currentFilter);
      }
      var result = await query;
      if (result.error) throw result.error;

      currentOrders = result.data || [];
      renderTable();
    } catch (err) {
      tableContainer.innerHTML = '<div class="empty-state">加载失败：' + escapeHtml(err.message || '未知错误') + '</div>';
    }
  }

  // -- 渲染订单表格 --
  function renderTable() {
    if (currentOrders.length === 0) {
      tableContainer.innerHTML = '<div class="empty-state">暂无订单</div>';
      return;
    }

    var html = '<table class="admin-table"><thead><tr>' +
      '<th>订单号</th><th>商品</th><th>收货人</th><th>数量</th><th>总价</th>' +
      '<th>状态</th><th>下单时间</th>' +
      '</tr></thead><tbody>';

    currentOrders.forEach(function (o) {
      var selected = o.id === selectedOrderId ? ' selected' : '';
      html += '<tr data-order-id="' + escapeHtml(o.id) + '"' + selected + '>' +
        '<td>' + escapeHtml(o.order_number) + '</td>' +
        '<td>giffgaff 电话卡</td>' +
        '<td>' + escapeHtml(o.customer_name) + '</td>' +
        '<td>' + escapeHtml(o.quantity) + '</td>' +
        '<td>¥' + escapeHtml(o.total_price) + '</td>' +
        '<td>' + statusBadge(o.status) + '</td>' +
        '<td>' + escapeHtml(fmtTime(o.created_at)) + '</td>' +
        '</tr>';
    });

    html += '</tbody></table>';
    tableContainer.innerHTML = html;

    // 绑定行点击
    var rows = tableContainer.querySelectorAll('tbody tr');
    rows.forEach(function (row) {
      row.addEventListener('click', function () {
        var orderId = this.getAttribute('data-order-id');
        selectOrder(orderId);
      });
    });
  }

  // -- 选中订单 → 显示详情 --
  function selectOrder(orderId) {
    selectedOrderId = orderId;
    // 更新表格高亮
    var rows = tableContainer.querySelectorAll('tbody tr');
    rows.forEach(function (r) {
      r.classList.toggle('selected', r.getAttribute('data-order-id') === orderId);
    });

    var order = currentOrders.find(function (o) { return o.id === orderId; });
    if (!order) return;

    var canEdit = (order.status === 'pending' || order.status === 'confirmed');
    var canShip = (order.status === 'confirmed');
    var canConfirm = (order.status === 'pending');
    var canCancel = (order.status !== 'completed' && order.status !== 'cancelled');

    var html = '<h3>订单详情 · ' + escapeHtml(order.order_number) + '</h3>';
    html += '<div class="detail-grid">';
    html += '<div class="item"><label>状态</label><p>' + statusBadge(order.status) + '</p></div>';
    html += '<div class="item"><label>数量</label><p>' + escapeHtml(order.quantity) + ' 张</p></div>';
    html += '<div class="item"><label>单价</label><p>¥' + escapeHtml(order.unit_price) + '</p></div>';
    html += '<div class="item"><label>总价</label><p>¥' + escapeHtml(order.total_price) + '</p></div>';
    html += '<div class="item"><label>收货人</label><p>' + escapeHtml(order.customer_name) + '</p></div>';
    html += '<div class="item"><label>联系电话</label><p>' + escapeHtml(order.customer_phone) + '</p></div>';
    html += '<div class="item full"><label>收货地址</label><p>' + escapeHtml(order.shipping_address) + '</p></div>';
    if (order.customer_email) {
      html += '<div class="item"><label>邮箱</label><p>' + escapeHtml(order.customer_email) + '</p></div>';
    }
    html += '<div class="item"><label>下单时间</label><p>' + escapeHtml(fmtTime(order.created_at)) + '</p></div>';
    if (order.courier_company) {
      html += '<div class="item"><label>快递公司</label><p>' + escapeHtml(order.courier_company) + '</p></div>';
    }
    if (order.tracking_number) {
      html += '<div class="item"><label>物流单号</label><p>' + escapeHtml(order.tracking_number) + '</p></div>';
    }
    if (order.admin_remark) {
      html += '<div class="item full"><label>备注</label><p>' + escapeHtml(order.admin_remark) + '</p></div>';
    }
    html += '</div>';

    // 编辑区域
    if (canEdit || canCancel) {
      html += '<div class="detail-actions">';
      if (canConfirm) {
        html += '<button class="action-btn btn-save" data-action="confirm" data-id="' + escapeHtml(order.id) + '">确认收款</button>';
      }
      if (canShip || order.status === 'shipped') {
        html += '<div class="form-row"><label>快递公司</label><input type="text" id="edit-courier" value="' + escapeHtml(order.courier_company || '') + '" placeholder="如：顺丰速运" /></div>';
        html += '<div class="form-row"><label>物流单号</label><input type="text" id="edit-tracking" value="' + escapeHtml(order.tracking_number || '') + '" placeholder="物流单号" /></div>';
        if (canShip) {
          html += '<button class="action-btn btn-save" data-action="ship" data-id="' + escapeHtml(order.id) + '">确认发货</button>';
        }
      }
      // 标记完成
      if (order.status === 'shipped') {
        html += '<button class="action-btn btn-save" data-action="complete" data-id="' + escapeHtml(order.id) + '">标记完成</button>';
      }
      if (canCancel) {
        html += '<button class="action-btn btn-cancel" data-action="cancel" data-id="' + escapeHtml(order.id) + '">取消订单</button>';
      }
      html += '</div>';
      html += '<div class="save-msg" id="save-msg"></div>';
    }

    detailPanel.innerHTML = html;
    detailPanel.style.display = 'block';

    // 绑定操作按钮
    var actionBtns = detailPanel.querySelectorAll('[data-action]');
    actionBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleAction(this.getAttribute('data-action'), this.getAttribute('data-id'));
      });
    });
  }

  // -- 处理订单操作 --
  async function handleAction(action, orderId) {
    var updateData = {};
    var msgEl = document.getElementById('save-msg');

    if (action === 'confirm') {
      updateData.status = 'confirmed';
    } else if (action === 'ship') {
      var courier = document.getElementById('edit-courier').value.trim();
      var tracking = document.getElementById('edit-tracking').value.trim();
      if (!courier || !tracking) {
        if (msgEl) { msgEl.className = 'save-msg err'; msgEl.textContent = '请填写快递公司和物流单号'; }
        return;
      }
      updateData.status = 'shipped';
      updateData.courier_company = courier;
      updateData.tracking_number = tracking;
    } else if (action === 'complete') {
      updateData.status = 'completed';
    } else if (action === 'cancel') {
      if (!confirm('确定取消此订单？')) return;
      updateData.status = 'cancelled';
    }

    try {
      var result = await sb.from('orders').update(updateData).eq('id', orderId);
      if (result.error) throw result.error;

      if (msgEl) { msgEl.className = 'save-msg ok'; msgEl.textContent = '操作成功'; }
      // 刷新列表
      await loadOrders();
      // 重新选中该订单
      selectOrder(orderId);
    } catch (err) {
      if (msgEl) { msgEl.className = 'save-msg err'; msgEl.textContent = '操作失败：' + (err.message || '未知错误'); }
    }
  }

  // -- 筛选 --
  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      if (e.target.classList.contains('filter-btn')) {
        var filter = e.target.getAttribute('data-filter');
        currentFilter = filter;
        // 更新按钮状态
        filterBar.querySelectorAll('.filter-btn').forEach(function (b) {
          b.classList.toggle('active', b === e.target);
        });
        selectedOrderId = null;
        detailPanel.style.display = 'none';
        loadOrders();
      }
    });
  }
})();
