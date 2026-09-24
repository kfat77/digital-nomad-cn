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
  var tabBar = document.getElementById('tab-bar');
  var ordersPanel = document.getElementById('orders-panel');
  var settingsPanel = document.getElementById('settings-panel');
  var setCardPrice = document.getElementById('set-card-price');
  var setCardStock = document.getElementById('set-card-stock');
  var setRechargePrice = document.getElementById('set-recharge-price');
  var setRechargeStock = document.getElementById('set-recharge-stock');
  var saveSettingsBtn = document.getElementById('save-settings-btn');
  var settingsSaved = document.getElementById('settings-saved');

  var productNameMap = {
    card: 'giffgaff 电话卡',
    recharge: '10英镑充值券',
    x_premium: 'X Premium',
    tg_premium: 'TG Premium'
  };

  // 订阅类套餐代码 -> 可读周期
  var planLabelMap = {
    x_3m: '3 个月',
    x_6m: '6 个月',
    x_12m: '12 个月',
    x_12m_plus: 'Premium+ 12 个月',
    tg_3m: '3 个月',
    tg_6m: '6 个月',
    tg_12m: '12 个月'
  };

  // 订阅类产品没有实物，交付方式是「开通账号」而不是寄快递
  function isDigital(order) {
    return order && (order.product_type === 'x_premium' || order.product_type === 'tg_premium');
  }

  function productLabel(order) {
    if (!order) return '';
    var base = productNameMap[order.product_type] || order.product_type || '订单';
    var plan = planLabelMap[order.plan_code];
    return plan ? base + ' · ' + plan : base;
  }

  // 金额带币种：用 USDT 结算的订单不能标成人民币
  function moneyText(order, amount) {
    if (amount === null || amount === undefined) return '—';
    if (order && order.pay_currency === 'usdt') return amount + ' USDT';
    return '¥' + amount;
  }

  // -- 设置项清单：订单页的四个字段 + 订阅商城的价格与开关 --
  var PLAN_FIELDS = [
    ['x_3m', 'X Premium · 3 个月'],
    ['x_6m', 'X Premium · 6 个月'],
    ['x_12m', 'X Premium · 12 个月'],
    ['x_12m_plus', 'X Premium+ · 12 个月'],
    ['tg_3m', 'TG Premium · 3 个月'],
    ['tg_6m', 'TG Premium · 6 个月'],
    ['tg_12m', 'TG Premium · 12 个月']
  ];

  var SETTINGS_FIELDS = [
    { key: 'card_price', name: '电话卡价格', kind: 'price' },
    { key: 'card_stock', name: '电话卡库存', kind: 'stock' },
    { key: 'recharge_price', name: '充值券价格', kind: 'price' },
    { key: 'recharge_stock', name: '充值券库存', kind: 'stock' },
    { key: 'sub_accepting', name: '接单状态', kind: 'accepting' },
    { key: 'sub_pay_note', name: '支付说明', kind: 'text' },
    { key: 'sub_direct_url', name: '自助下单入口', kind: 'text' }
  ];
  PLAN_FIELDS.forEach(function (pair) {
    var code = pair[0];
    var label = pair[1];
    SETTINGS_FIELDS.push({ key: 'sub_' + code + '_cny', name: label + ' 人民币价', kind: 'plan' });
    SETTINGS_FIELDS.push({ key: 'sub_' + code + '_usdt', name: label + ' USDT 价', kind: 'plan' });
  });

  function settingEl(key) {
    if (key === 'card_price') return setCardPrice;
    if (key === 'card_stock') return setCardStock;
    if (key === 'recharge_price') return setRechargePrice;
    if (key === 'recharge_stock') return setRechargeStock;
    if (key === 'sub_accepting') return document.getElementById('set-sub-accepting');
    if (key === 'sub_pay_note') return document.getElementById('set-sub-pay-note');
    if (key === 'sub_direct_url') return document.getElementById('set-sub-direct-url');
    var m = /^sub_(.+)_(cny|usdt)$/.exec(key);
    if (m) return document.getElementById('set-sub-' + m[1] + '-' + m[2]);
    return null;
  }

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
    startNotifier();
  }

  // -- 新订单提醒：登录后开始轮询，有人下单就出横幅 + 提示音 + 系统通知 --
  function startNotifier() {
    if (!window.AdminNotify) return;
    window.AdminNotify.start({
      onChange: function () { loadOrders(); },
      onSelect: function (orderId) {
        var tab = document.querySelector('[data-tab="orders"]');
        if (tab && !tab.classList.contains('active')) tab.click();
        selectOrder(orderId);
      }
    });
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

  // -- 加载订单列表（通过 admin_get_orders RPC，绕过 RLS）--
  async function loadOrders() {
    if (!sb) return;
    tableContainer.innerHTML = '<div class="empty-state">加载中…</div>';

    try {
      var filter = currentFilter === 'all' ? undefined : currentFilter;
      var result = await sb.rpc('admin_get_orders', { p_filter: filter });
      if (result.error) throw result.error;

      currentOrders = result.data || [];
      renderTable();
      // 提醒游标以实际最新一单为起点，既不漏新单也不重刷历史
      if (window.AdminNotify && window.AdminNotify.seedFromOrders) {
        window.AdminNotify.seedFromOrders(currentOrders);
      }
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
      '<th>订单号</th><th>商品</th><th>客户 / 账号</th><th>数量</th><th>总价</th>' +
      '<th>状态</th><th>下单时间</th>' +
      '</tr></thead><tbody>';

    currentOrders.forEach(function (o) {
      var selected = o.id === selectedOrderId ? ' selected' : '';
      var who = o.service_account || o.customer_name || '';
      html += '<tr data-order-id="' + escapeHtml(o.id) + '"' + selected + '>' +
        '<td>' + escapeHtml(o.order_number) + '</td>' +
        '<td>' + escapeHtml(productLabel(o)) + '</td>' +
        '<td>' + escapeHtml(who) + '</td>' +
        '<td>' + escapeHtml(o.quantity) + '</td>' +
        '<td>' + escapeHtml(moneyText(o, o.total_price)) + '</td>' +
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

    var canEdit = (order.status === 'pending_payment' || order.status === 'user_paid' || order.status === 'confirmed');
    var canShip = (order.status === 'confirmed');
    var canConfirm = (order.status === 'user_paid');
    var canCancel = (order.status !== 'completed' && order.status !== 'cancelled');
    var digital = isDigital(order);

    var html = '<h3>订单详情 · ' + escapeHtml(order.order_number) + '</h3>';
    html += '<div class="detail-grid">';
    html += '<div class="item"><label>状态</label><p>' + statusBadge(order.status) + '</p></div>';
    html += '<div class="item"><label>商品</label><p>' + escapeHtml(productLabel(order)) + '</p></div>';
    html += '<div class="item"><label>数量</label><p>' + escapeHtml(order.quantity) + (digital ? ' 份' : ' 张') + '</p></div>';
    html += '<div class="item"><label>单价</label><p>' + escapeHtml(moneyText(order, order.unit_price)) + '</p></div>';
    html += '<div class="item"><label>总价</label><p>' + escapeHtml(moneyText(order, order.total_price)) + '</p></div>';
    if (digital) {
      html += '<div class="item full"><label>目标账号（需开通的账号）</label><p>' + escapeHtml(order.service_account || '—') + '</p></div>';
    }
    html += '<div class="item"><label>' + (digital ? '客户' : '收货人') + '</label><p>' + escapeHtml(order.customer_name || '—') + '</p></div>';
    html += '<div class="item"><label>联系方式</label><p>' + escapeHtml(order.customer_contact || order.customer_phone || '—') + '</p></div>';
    if (!digital) {
      html += '<div class="item full"><label>收货地址</label><p>' + escapeHtml(order.shipping_address || '—') + '</p></div>';
    }
    if (order.customer_email) {
      html += '<div class="item"><label>邮箱</label><p>' + escapeHtml(order.customer_email) + '</p></div>';
    }
    html += '<div class="item"><label>下单时间</label><p>' + escapeHtml(fmtTime(order.created_at)) + '</p></div>';
    if (order.customer_note) {
      html += '<div class="item full"><label>买家备注</label><p>' + escapeHtml(order.customer_note) + '</p></div>';
    }
    if (order.courier_company) {
      html += '<div class="item"><label>快递公司</label><p>' + escapeHtml(order.courier_company) + '</p></div>';
    }
    if (order.tracking_number) {
      html += '<div class="item"><label>物流单号</label><p>' + escapeHtml(order.tracking_number) + '</p></div>';
    }
    if (order.admin_remark) {
      html += '<div class="item full"><label>' + (digital ? '交付备注' : '备注') + '</label><p>' + escapeHtml(order.admin_remark) + '</p></div>';
    }
    html += '</div>';

    // 编辑区域
    if (canEdit || canCancel) {
      html += '<div class="detail-actions">';
      if (canConfirm) {
        html += '<button class="action-btn btn-save" data-action="confirm" data-id="' + escapeHtml(order.id) + '">确认收款</button>';
      }
      if (digital) {
        // 订阅类订单交付的是「开通结果」，不填快递
        if (canShip || order.status === 'shipped') {
          html += '<div class="form-row" style="flex:2;min-width:260px"><label>交付备注</label><input type="text" id="edit-remark" value="' + escapeHtml(order.admin_remark || '') + '" placeholder="例如：已开通，12 个月，2026-09-24 起" /></div>';
          if (canShip) {
            html += '<button class="action-btn btn-save" data-action="deliver" data-id="' + escapeHtml(order.id) + '">标记已交付</button>';
          }
        }
      } else if (canShip || order.status === 'shipped') {
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
    } else if (action === 'deliver') {
      // 订阅类订单：以交付备注记录开通结果，状态仍走 shipped
      var remarkEl = document.getElementById('edit-remark');
      var remark = remarkEl ? remarkEl.value.trim() : '';
      if (!remark) {
        if (msgEl) { msgEl.className = 'save-msg err'; msgEl.textContent = '请填写交付备注，便于日后回溯开通情况'; }
        return;
      }
      updateData.status = 'shipped';
      updateData.admin_remark = remark;
    } else if (action === 'complete') {
      updateData.status = 'completed';
    } else if (action === 'cancel') {
      if (!confirm('确定取消此订单？')) return;
      updateData.status = 'cancelled';
    }

    try {
      var result = await sb.rpc('admin_update_order', {
        p_order_id: orderId,
        p_status: updateData.status || undefined,
        p_courier_company: updateData.courier_company || undefined,
        p_tracking_number: updateData.tracking_number || undefined,
        p_admin_remark: updateData.admin_remark || undefined
      });
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
        filterBar.querySelectorAll('.filter-btn').forEach(function (b) {
          b.classList.toggle('active', b === e.target);
        });
        selectedOrderId = null;
        detailPanel.style.display = 'none';
        loadOrders();
      }
    });
  }

  // -- 标签切换 --
  if (tabBar) {
    tabBar.addEventListener('click', function (e) {
      if (!e.target.classList.contains('tab-btn')) return;
      var tab = e.target.getAttribute('data-tab');
      tabBar.querySelectorAll('.tab-btn').forEach(function (b) {
        b.classList.toggle('active', b === e.target);
      });
      if (tab === 'orders') {
        ordersPanel.style.display = 'block';
        settingsPanel.style.display = 'none';
      } else {
        ordersPanel.style.display = 'none';
        settingsPanel.style.display = 'block';
        loadSettings();
      }
    });
  }

  // -- 加载产品设置 --
  async function loadSettings() {
    if (!sb) return;
    try {
      var result = await sb.rpc('admin_get_settings');
      if (result.error) throw result.error;
      var data = result.data || [];
      data.forEach(function (row) {
        var el = settingEl(row.key);
        if (el) el.value = row.value;
      });
    } catch (err) {
      console.error('[Admin] 加载设置失败:', err);
    }
  }

  // -- 保存产品设置 --
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async function () {
      if (!sb) return;
      saveSettingsBtn.disabled = true;
      settingsSaved.style.display = 'none';
      try {
        var settings = SETTINGS_FIELDS;
        for (var i = 0; i < settings.length; i++) {
          var s = settings[i];
          var el = settingEl(s.key);
          if (!el) continue;
          var val = String(el.value === null || el.value === undefined ? '' : el.value).trim();
          var invalid = false;

          if (s.kind === 'price') invalid = !val || isNaN(val) || Number(val) <= 0;
          else if (s.kind === 'stock') invalid = !val || isNaN(val) || Number(val) < -1;
          else if (s.kind === 'plan') invalid = !val || isNaN(val) || Number(val) < 0;
          else if (s.kind === 'accepting') invalid = (val !== '0' && val !== '1');

          if (invalid) {
            alert('请输入有效的' + s.name + '（实物价格>0，库存 -1=无限/0=售罄，订阅价 0 表示该币种不可用，接单状态只能 0 或 1）');
            saveSettingsBtn.disabled = false; return;
          }
          var r = await sb.rpc('admin_update_settings', { p_key: s.key, p_value: val });
          if (r.error) throw new Error('保存 ' + s.name + ' 失败：' + r.error.message);
        }
        settingsSaved.style.display = 'block';
        setTimeout(function () { settingsSaved.style.display = 'none'; }, 2000);
      } catch (err) {
        alert('保存失败：' + (err.message || '未知错误'));
      }
      saveSettingsBtn.disabled = false;
    });
  }
})();
