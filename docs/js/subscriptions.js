/**
 * 订阅商城 · subscriptions.js
 * 依赖：config.js, supabase-client.js
 *
 * 价格一律以数据库为准（RPC 内服务端读取），这里只负责展示与提交。
 * 未执行 supabase/subscriptions.sql 时页面保持可读，但不允许下单。
 */
(function () {
  'use strict';

  var sb = window.sb;

  // 套餐目录只放固定文案，价格与是否在售全部来自后台配置
  var CATALOG = [
    { platform: 'x', code: 'x_3m', label: '3 个月', tier: 'Premium' },
    { platform: 'x', code: 'x_6m', label: '6 个月', tier: 'Premium' },
    { platform: 'x', code: 'x_12m', label: '12 个月', tier: 'Premium' },
    { platform: 'x', code: 'x_12m_plus', label: 'Premium+ · 12 个月', tier: 'Premium+' },
    { platform: 'tg', code: 'tg_3m', label: '3 个月', tier: 'Telegram Premium' },
    { platform: 'tg', code: 'tg_6m', label: '6 个月', tier: 'Telegram Premium' },
    { platform: 'tg', code: 'tg_12m', label: '12 个月', tier: 'Telegram Premium' }
  ];

  var STATUS_LABEL = {
    pending_payment: '待支付',
    user_paid: '已提交支付，待确认',
    confirmed: '已确认，待处理',
    shipped: '已交付',
    completed: '已完成',
    cancelled: '已取消'
  };

  var settings = {};      // sub_* 键值
  var platform = 'x';
  var currency = 'cny';
  var selected = null;    // 当前选中的套餐 code
  var qty = 1;
  var ready = false;      // 配置是否已加载

  // ── DOM ──
  var elAccepting = document.querySelector('[data-subs-accepting]');
  var elPlanCount = document.querySelector('[data-subs-plan-count]');
  var elUpdated = document.querySelector('[data-subs-updated]');
  var elPlans = document.querySelector('[data-subs-plans]');
  var elCurrencyGroup = document.querySelector('[data-subs-currency-group]');
  var elCurrencyHint = document.querySelector('[data-subs-currency-hint]');
  var elSelection = document.querySelector('[data-subs-selection]');
  var elTotal = document.querySelector('[data-subs-total]');
  var elForm = document.querySelector('[data-subs-form]');
  var elSubmit = document.querySelector('[data-subs-submit]');
  var elError = document.querySelector('[data-subs-error]');
  var elQty = document.querySelector('[data-subs-qty]');
  var elSuccess = document.querySelector('[data-subs-success]');
  var elOrderNumber = document.querySelector('[data-subs-order-number]');
  var elTrackingCode = document.querySelector('[data-subs-tracking-code]');
  var elSuccessHint = document.querySelector('[data-subs-success-hint]');
  var elPayNote = document.querySelector('[data-subs-pay-note]');
  var elDirect = document.querySelector('[data-subs-direct]');

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function num(value) {
    var n = Number(value);
    return isFinite(n) ? n : 0;
  }

  function money(amount, cur) {
    var n = num(amount);
    if (cur === 'usdt') return n + ' USDT';
    return '¥' + n;
  }

  function priceOf(code, cur) {
    return num(settings['sub_' + code + '_' + cur]);
  }

  function plansOf(pf) {
    return CATALOG.filter(function (p) { return p.platform === pf; });
  }

  function nowText() {
    var d = new Date();
    function p(n) { return String(n).padStart(2, '0'); }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  // ── 读取后台配置 ──
  function applySettings(rows) {
    settings = {};
    (rows || []).forEach(function (row) {
      if (row && row.key) settings[row.key] = row.value;
    });

    var accepting = String(settings.sub_accepting === undefined ? '1' : settings.sub_accepting) === '1';
    ready = true;

    if (elAccepting) {
      elAccepting.textContent = accepting ? '接单中' : '已暂停';
      elAccepting.classList.toggle('is-off', !accepting);
    }
    if (elDirect && settings.sub_direct_url) {
      elDirect.setAttribute('href', settings.sub_direct_url);
    }
    if (elPayNote) {
      var note = (settings.sub_pay_note || '').trim();
      elPayNote.textContent = note;
      elPayNote.hidden = !note;
    }

    var sellable = CATALOG.filter(function (p) {
      return priceOf(p.code, 'cny') > 0 || priceOf(p.code, 'usdt') > 0;
    }).length;
    if (elPlanCount) elPlanCount.textContent = sellable + ' 个';
    if (elUpdated) elUpdated.textContent = nowText();

    renderPlans();
    renderSelection();
    if (!accepting) {
      disableSubmit('当前暂停接单，请稍后再来。');
    } else if (sellable === 0) {
      disableSubmit('套餐价格还没配置，请联系客服。');
    }
  }

  function unavailable(message) {
    ready = false;
    if (elAccepting) { elAccepting.textContent = '未启用'; elAccepting.classList.add('is-off'); }
    if (elPlanCount) elPlanCount.textContent = '—';
    if (elUpdated) elUpdated.textContent = nowText();
    if (elPlans) {
      elPlans.innerHTML = '<div class="subs-loading">' + escapeHtml(message) + '</div>';
    }
    disableSubmit(message);
    console.warn('[Subscription] ' + message);
  }

  function disableSubmit(message) {
    if (elSubmit) {
      elSubmit.disabled = true;
      elSubmit.textContent = '暂不可下单';
      elSubmit.style.opacity = '0.55';
      elSubmit.style.cursor = 'not-allowed';
    }
    if (elError && message) {
      elError.textContent = message;
      elError.style.display = 'block';
    }
  }

  // ── 渲染套餐 ──
  function renderPlans() {
    if (!elPlans) return;
    var list = plansOf(platform);

    // 换平台或换币种后，原先的选中项可能已经不可用，先清掉再渲染
    if (selected) {
      var stillOk = list.some(function (p) {
        return p.code === selected && priceOf(p.code, currency) > 0;
      });
      if (!stillOk) selected = null;
    }

    var html = '';

    list.forEach(function (plan) {
      var active = priceOf(plan.code, currency);
      var other = currency === 'cny' ? 'usdt' : 'cny';
      var otherPrice = priceOf(plan.code, other);
      var sellable = active > 0;
      var isSelected = selected === plan.code;

      html += '<button type="button" class="subs-plan' +
        (isSelected ? ' is-selected' : '') +
        (sellable ? '' : ' is-unavailable') + '"' +
        ' data-subs-plan="' + escapeHtml(plan.code) + '"' +
        (sellable ? '' : ' aria-disabled="true"') +
        ' aria-pressed="' + (isSelected ? 'true' : 'false') + '">';

      html += '<span class="subs-plan-head"><span class="subs-plan-tier">' + escapeHtml(plan.tier) + '</span>' +
        '<span class="subs-plan-term">' + escapeHtml(plan.label) + '</span></span>';

      if (sellable) {
        html += '<span class="subs-plan-price">' + escapeHtml(money(active, currency)) + '</span>';
        if (otherPrice > 0) {
          html += '<span class="subs-plan-alt">或 ' + escapeHtml(money(otherPrice, other)) + '</span>';
        } else {
          html += '<span class="subs-plan-alt">不支持' + (other === 'cny' ? '人民币' : ' USDT') + '结算</span>';
        }
      } else {
        html += '<span class="subs-plan-price subs-plan-price-off">本币种不可用</span>';
        if (otherPrice > 0) {
          html += '<span class="subs-plan-alt">改用 ' + escapeHtml(money(otherPrice, other)) + '</span>';
        }
      }

      html += '<span class="subs-plan-flag">' + (sellable ? '选择' : '不可选') + '</span>';
      html += '</button>';
    });

    elPlans.innerHTML = html;

    var btns = elPlans.querySelectorAll('[data-subs-plan]');
    Array.prototype.forEach.call(btns, function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-disabled') === 'true') return;
        selected = btn.getAttribute('data-subs-plan');
        renderPlans();
        renderSelection();
      });
    });
  }

  // ── 渲染当前选择与合计 ──
  function renderSelection() {
    var plan = null;
    CATALOG.forEach(function (p) { if (p.code === selected) plan = p; });

    if (!plan) {
      if (elSelection) elSelection.textContent = '请先在上方选一个套餐';
      if (elTotal) elTotal.textContent = '—';
      if (elCurrencyHint) {
        elCurrencyHint.textContent = currency === 'cny'
          ? '标 0 的套餐需要走 USDT 结算'
          : 'USDT 为跨境常用结算方式，到账以链上确认为准';
      }
      return;
    }

    var unit = priceOf(plan.code, currency);
    var name = (plan.platform === 'x' ? 'X Premium' : 'TG Premium') + ' · ' + plan.label;
    if (elSelection) elSelection.textContent = name;
    if (elTotal) elTotal.textContent = money(unit * qty, currency);
    if (elCurrencyHint) elCurrencyHint.textContent = '按 ' + money(unit, currency) + ' / 份 计算';
  }

  // ── 平台 / 币种 / 数量 ──
  var platformBtns = document.querySelectorAll('[data-subs-platform]');
  Array.prototype.forEach.call(platformBtns, function (btn) {
    btn.addEventListener('click', function () {
      platform = btn.getAttribute('data-subs-platform');
      selected = null;
      Array.prototype.forEach.call(platformBtns, function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      renderPlans();
      renderSelection();
    });
  });

  if (elCurrencyGroup) {
    elCurrencyGroup.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-subs-currency]');
      if (!btn) return;
      var next = btn.getAttribute('data-subs-currency');
      if (next === currency) return;
      currency = next;
      elCurrencyGroup.querySelectorAll('[data-subs-currency]').forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
      });
      renderPlans();
      renderSelection();
    });
  }

  var btnMinus = document.querySelector('[data-subs-qty-minus]');
  var btnPlus = document.querySelector('[data-subs-qty-plus]');
  if (btnMinus) {
    btnMinus.addEventListener('click', function () {
      if (qty > 1) { qty -= 1; if (elQty) elQty.value = qty; renderSelection(); }
    });
  }
  if (btnPlus) {
    btnPlus.addEventListener('click', function () {
      if (qty < 10) { qty += 1; if (elQty) elQty.value = qty; renderSelection(); }
    });
  }

  // ── 提交订单 ──
  function showError(message) {
    if (!elError) return;
    elError.textContent = message;
    elError.style.display = 'block';
  }
  function hideError() {
    if (elError) elError.style.display = 'none';
  }

  if (elForm) {
    elForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError();

      if (!ready) { showError('套餐配置还没就绪，请联系客服手动下单。'); return; }
      if (!sb) { showError('系统未就绪，请联系客服手动下单。'); return; }
      if (!selected) { showError('请先选择一个套餐。'); return; }

      var account = (document.getElementById('subs-account') || {}).value || '';
      var contact = (document.getElementById('subs-contact') || {}).value || '';
      var email = (document.getElementById('subs-email') || {}).value || '';

      if (!account.trim()) { showError('请填写需要开通的目标账号。'); return; }
      if (!contact.trim()) { showError('请填写联系方式，方便同步进度。'); return; }
      if (selected.indexOf('tg_') === 0 && !contact.trim()) {
        showError('TG Premium 需要可联系到你的 Telegram 账号。'); return;
      }

      if (elSubmit) {
        elSubmit.disabled = true;
        elSubmit.textContent = '提交中…';
      }

      try {
        // 价格不从这里传，服务端会重新按 plan_code + 币种读取
        var result = await sb.rpc('create_subscription_order', {
          p_plan_code: selected,
          p_currency: currency,
          p_service_account: account.trim(),
          p_customer_contact: contact.trim(),
          p_customer_name: null,
          p_customer_email: email.trim() || null,
          p_customer_note: null,
          p_quantity: qty
        });
        if (result.error) throw result.error;

        var row = (result.data && result.data[0]) || null;
        if (!row || !row.order_number) throw new Error('订单已创建但未返回订单号，请联系客服。');

        if (elOrderNumber) elOrderNumber.textContent = row.order_number;
        if (elTrackingCode) elTrackingCode.textContent = row.tracking_code;
        if (elSuccessHint) {
          elSuccessHint.textContent = '订单已进入后台，金额 ' +
            money(row.total_price, row.pay_currency || currency) +
            '。请保存订单号与查询码，我们会按你留的联系方式核对支付并开通。';
        }

        elForm.style.display = 'none';
        if (elSuccess) {
          elSuccess.style.display = 'block';
          elSuccess.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // 进入待支付后重新拉一次配置，接单状态可能随时变动
        loadPlans();
      } catch (err) {
        console.error('[Subscription] 提交失败:', err);
        showError('订单提交失败：' + ((err && err.message) || '未知错误') + '。请重试或联系客服。');
        if (elSubmit) {
          elSubmit.disabled = false;
          elSubmit.textContent = '提交订单';
          elSubmit.style.opacity = '';
          elSubmit.style.cursor = '';
        }
      }
    });
  }

  // ── 订单查询 ──
  var elLookupForm = document.querySelector('[data-subs-lookup-form]');
  var elLookupResult = document.querySelector('[data-subs-lookup-result]');
  var elLookupSubmit = document.querySelector('[data-subs-lookup-submit]');

  if (elLookupForm) {
    elLookupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var number = ((document.getElementById('subs-lookup-number') || {}).value || '').trim();
      var code = ((document.getElementById('subs-lookup-code') || {}).value || '').trim();

      if (!elLookupResult) return;
      if (!number || !code) {
        elLookupResult.innerHTML = '<p class="subs-lookup-empty">请填写订单号与查询码。</p>';
        return;
      }
      if (!sb) {
        elLookupResult.innerHTML = '<p class="subs-lookup-empty">系统未就绪，请稍后再试。</p>';
        return;
      }

      if (elLookupSubmit) { elLookupSubmit.disabled = true; elLookupSubmit.textContent = '查询中…'; }
      try {
        var result = await sb.rpc('query_order', {
          p_order_number: number,
          p_tracking_code: code.toUpperCase()
        });
        if (result.error) throw result.error;

        var rows = result.data || [];
        if (!rows.length) {
          elLookupResult.innerHTML = '<p class="subs-lookup-empty">没有查到对应订单，请核对订单号与查询码。</p>';
          return;
        }

        var o = rows[0];
        var label = STATUS_LABEL[o.status] || o.status;
        var html = '<div class="subs-lookup-card">';
        html += '<div class="subs-lookup-head"><strong>' + escapeHtml(o.order_number) + '</strong>' +
          '<span class="subs-lookup-status s-' + escapeHtml(o.status) + '">' + escapeHtml(label) + '</span></div>';
        html += '<dl class="subs-lookup-grid">';
        html += '<div><dt>数量</dt><dd>' + escapeHtml(o.quantity) + '</dd></div>';
        html += '<div><dt>金额</dt><dd>¥' + escapeHtml(o.total_price) + '</dd></div>';
        html += '<div><dt>下单时间</dt><dd>' + escapeHtml(fmt(o.created_at)) + '</dd></div>';
        html += '<div><dt>最近更新</dt><dd>' + escapeHtml(fmt(o.updated_at)) + '</dd></div>';
        if (o.tracking_number) {
          html += '<div class="is-full"><dt>交付信息</dt><dd>' +
            escapeHtml((o.courier_company ? o.courier_company + ' · ' : '') + o.tracking_number) + '</dd></div>';
        }
        html += '</dl></div>';
        elLookupResult.innerHTML = html;
      } catch (err) {
        console.error('[Subscription] 查询失败:', err);
        elLookupResult.innerHTML = '<p class="subs-lookup-empty">查询失败：' +
          escapeHtml((err && err.message) || '未知错误') + '</p>';
      } finally {
        if (elLookupSubmit) { elLookupSubmit.disabled = false; elLookupSubmit.textContent = '查询'; }
      }
    });
  }

  function fmt(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    function p(n) { return String(n).padStart(2, '0'); }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  // ── 初始化 ──
  var loadPlans = async function () {
    if (!sb) {
      unavailable('未配置 Supabase，套餐暂不可用。请联系客服手动下单。');
      return;
    }
    try {
      var result = await sb.rpc('get_subscription_info');
      if (result.error) throw result.error;
      applySettings(result.data || []);
    } catch (err) {
      console.warn('[Subscription] 读取套餐失败:', err);
      unavailable('套餐配置还没启用（数据库里缺少 get_subscription_info）。把 supabase/subscriptions.sql 执行一次即可。');
    }
  };
  loadPlans();

  console.log('[Subscription] ready, sb =', !!sb);
})();
