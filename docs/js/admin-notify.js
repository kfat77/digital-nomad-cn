/**
 * 后台新订单提醒 · admin-notify.js
 * 依赖：config.js, supabase-client.js, admin 页面上的 data-notify-* 元素
 *
 * 做法：定时调用 admin_new_orders(since, lastId)，拿「上次看过之后新增的订单」。
 * 用 (created_at, id) 元组做游标，避免同一时刻两单被漏掉。
 * 数据库里还没有这个函数时（subscriptions.sql 未执行）自动静默停用，不影响后台其它功能。
 */
(function () {
  'use strict';

  var STORE_KEY = 'ne_admin_seen_order_v1';
  var POLL_MS = 20000;

  var state = {
    at: null,          // 已看到的最后一条时间
    id: null,          // 已看到的最后一条 id
    running: false,
    armed: false,
    provisional: false,
    timer: null,
    sound: true,
    audio: null,
    flash: null,
    baseTitle: null,
    hooks: {},
    unread: 0
  };
  var provisionalTimer = null;

  var elBar = document.querySelector('[data-notify-bar]');
  var elTitle = document.querySelector('[data-notify-title]');
  var elDetail = document.querySelector('[data-notify-detail]');
  var elState = document.querySelector('[data-notify-state]');
  var btnOpen = document.querySelector('[data-notify-open]');
  var btnSound = document.querySelector('[data-notify-sound]');
  var btnPerm = document.querySelector('[data-notify-permission]');
  var btnDismiss = document.querySelector('[data-notify-dismiss]');

  var PRODUCT_LABEL = {
    card: 'giffgaff 电话卡',
    recharge: '10英镑充值券',
    x_premium: 'X Premium',
    tg_premium: 'TG Premium'
  };

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function money(amount, currency) {
    if (currency === 'usdt') return Number(amount) + ' USDT';
    return '¥' + Number(amount);
  }

  function fmtTime(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    function p(n) { return String(n).padStart(2, '0'); }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function readStore() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || !obj.at) return null;
      return obj;
    } catch (e) {
      return null;
    }
  }

  function writeStore() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ at: state.at, id: state.id }));
    } catch (e) {
      // 隐私模式下写不了就只在本次会话内生效
    }
  }

  // ── 提示音：不引外部音频，用振荡器现场合成 ──
  function beep() {
    if (!state.sound) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      state.audio = state.audio || new Ctx();
      var ctx = state.audio;
      if (ctx.state === 'suspended') ctx.resume();
      var t0 = ctx.currentTime;
      [0, 0.19].forEach(function (offset, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = i === 0 ? 880 : 1180;
        gain.gain.setValueAtTime(0, t0 + offset);
        gain.gain.linearRampToValueAtTime(0.16, t0 + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0008, t0 + offset + 0.17);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0 + offset);
        osc.stop(t0 + offset + 0.19);
      });
    } catch (e) {
      // 浏览器策略不允许出声就算了，横幅和标题仍然会显示
    }
  }

  // ── 标题闪烁：切到别的标签页也能看见 ──
  function flashTitle() {
    if (state.flash) return;
    state.baseTitle = document.title;
    document.title = '【有新订单】' + state.baseTitle;
    var on = true;
    state.flash = window.setInterval(function () {
      on = !on;
      document.title = on ? '【有新订单】' + state.baseTitle : state.baseTitle;
    }, 900);
  }

  function stopFlash() {
    if (!state.flash) return;
    window.clearInterval(state.flash);
    state.flash = null;
    if (state.baseTitle) document.title = state.baseTitle;
  }

  // ── 系统通知：需要用户点一下授权 ──
  function systemNotify(text) {
    try {
      if (!('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;
      var n = new Notification('Nomad Essentials · 新订单', {
        body: text,
        tag: 'ne-new-order',
        renotify: true
      });
      n.onclick = function () {
        window.focus();
        if (btnOpen) btnOpen.click();
      };
    } catch (e) {
      // 部分浏览器在非 https / 无授权下会抛错，忽略
    }
  }

  function renderState(text, off) {
    if (!elState) return;
    elState.textContent = text;
    elState.classList.toggle('is-off', !!off);
  }

  function syncSoundBtn() {
    if (!btnSound) return;
    btnSound.textContent = state.sound ? '提示音 开' : '提示音 关';
    btnSound.setAttribute('aria-pressed', state.sound ? 'true' : 'false');
  }

  function syncPermBtn() {
    if (!btnPerm) return;
    if (!('Notification' in window)) {
      btnPerm.hidden = true;
      return;
    }
    if (Notification.permission === 'granted') {
      btnPerm.textContent = '通知已开启';
      btnPerm.disabled = true;
      return;
    }
    btnPerm.hidden = false;
    btnPerm.textContent = Notification.permission === 'denied' ? '通知被浏览器拦了' : '开启浏览器通知';
    btnPerm.disabled = Notification.permission === 'denied';
  }

  // ── 页内横幅 ──
  function showBar(row, count) {
    if (!elBar) return;
    state.unread += count;

    var product = PRODUCT_LABEL[row.latest_product] || row.latest_product || '订单';
    var plan = row.latest_plan ? ' · ' + row.latest_plan : '';
    var account = row.latest_account ? ' · 账号 ' + row.latest_account : '';
    var amount = row.latest_total === null || row.latest_total === undefined
      ? ''
      : ' · ' + money(row.latest_total, row.latest_currency);

    if (elTitle) {
      elTitle.textContent = count > 1
        ? '有 ' + count + ' 笔新订单'
        : '有新订单 ' + (row.latest_number || '');
    }
    if (elDetail) {
      elDetail.innerHTML = escapeHtml(product + plan + account + amount) +
        ' · ' + escapeHtml(fmtTime(row.latest_at)) +
        (state.unread > count ? '（本次未读共 ' + state.unread + ' 笔）' : '');
    }

    elBar.hidden = false;
    if (btnOpen) {
      btnOpen.setAttribute('data-notify-target', row.latest_id || '');
      btnOpen.hidden = false;
    }

    beep();
    flashTitle();
    systemNotify((row.latest_number || '') + ' · ' + product + plan + account + amount);
  }

  // 游标比较：(created_at, id) 严格大于才算新。
  // 服务端理论上只会返回比游标新的行，但这里自己再挡一道，
  // 避免缓存或重复响应把同一单反复提醒。
  function cursorAfter(at, id) {
    if (!at) return false;
    if (!state.at) return true;
    if (at > state.at) return true;
    if (at < state.at) return false;
    return !!id && !!state.id && id > state.id;
  }

  // ── 轮询 ──
  async function poll() {
    var sb = window.sb;
    if (!sb || !state.running) return;

    try {
      var result = await sb.rpc('admin_new_orders', {
        p_since: state.at,
        p_last_id: state.id
      });
      if (result.error) throw result.error;

      var row = (result.data && result.data[0]) || null;
      if (!row) return;

      if (row.new_count > 0 && cursorAfter(row.latest_at, row.latest_id)) {
        state.at = row.latest_at;
        state.id = row.latest_id;
        writeStore();
        showBar(row, row.new_count);
        if (typeof state.hooks.onChange === 'function') state.hooks.onChange();
      }

      renderState('提醒运行中 · 每 ' + Math.round(POLL_MS / 1000) + ' 秒检查一次', false);
    } catch (err) {
      var message = (err && err.message) || '';
      if (/admin_new_orders|schema cache|does not exist|function/i.test(message)) {
        stop();
        renderState('提醒未启用：数据库里缺少 admin_new_orders，执行 supabase/subscriptions.sql 后可用', true);
        console.warn('[AdminNotify] ' + message);
        return;
      }
      // 网络抖动不打断轮询
      renderState('提醒运行中（上次检查失败，稍后重试）', false);
      console.warn('[AdminNotify] 轮询失败:', message);
    }
  }

  function start(hooks) {
    if (state.running || state.armed) return;
    var sb = window.sb;
    if (!sb) {
      renderState('提醒未启用：Supabase 未配置', true);
      return;
    }

    state.hooks = hooks || {};
    state.baseTitle = document.title;

    var store = readStore();
    if (store) {
      state.at = store.at;
      state.id = store.id || null;
      beginPolling();
      return;
    }

    // 首次使用：等后台把订单列表读回来，再把游标钉到最新一单，
    // 避免把历史订单重新提醒一遍，也不漏掉刚下的单。
    state.armed = true;
    state.provisional = true;
    renderState('提醒已就绪，正在对齐订单游标…', false);
    provisionalTimer = window.setTimeout(function () {
      if (!state.provisional) return;
      state.provisional = false;
      state.at = new Date().toISOString();
      state.id = null;
      writeStore();
      beginPolling();
    }, 2500);
  }

  function beginPolling() {
    if (state.running) return;
    state.running = true;
    syncSoundBtn();
    syncPermBtn();
    if (elBar) elBar.hidden = true;
    poll();
    state.timer = window.setInterval(poll, POLL_MS);
  }

  function stop() {
    state.running = false;
    state.armed = false;
    state.provisional = false;
    window.clearTimeout(provisionalTimer);
    if (state.timer) {
      window.clearInterval(state.timer);
      state.timer = null;
    }
    stopFlash();
  }

  // 首次使用时，用后台已经加载出来的订单列表把游标钉到最新一条。
  // 之后 loadOrders 再被调用也不会改动游标（provisional 已为 false）。
  function seedFromOrders(orders) {
    if (!state.provisional) return;
    window.clearTimeout(provisionalTimer);
    state.provisional = false;

    if (orders && orders.length) {
      var newest = orders[0];
      for (var i = 1; i < orders.length; i++) {
        var a = orders[i];
        if (a.created_at > newest.created_at ||
          (a.created_at === newest.created_at && a.id > newest.id)) {
          newest = a;
        }
      }
      state.at = newest.created_at;
      state.id = newest.id;
    } else {
      state.at = new Date().toISOString();
      state.id = null;
    }

    writeStore();
    beginPolling();
  }

  // ── 交互绑定 ──
  if (btnOpen) {
    btnOpen.addEventListener('click', function () {
      var id = btnOpen.getAttribute('data-notify-target');
      state.unread = 0;
      stopFlash();
      if (elBar) elBar.hidden = true;
      if (id && typeof state.hooks.onSelect === 'function') state.hooks.onSelect(id);
    });
  }

  if (btnDismiss) {
    btnDismiss.addEventListener('click', function () {
      state.unread = 0;
      stopFlash();
      if (elBar) elBar.hidden = true;
    });
  }

  if (btnSound) {
    btnSound.addEventListener('click', function () {
      state.sound = !state.sound;
      syncSoundBtn();
      if (state.sound) beep();
    });
  }

  if (btnPerm) {
    btnPerm.addEventListener('click', async function () {
      if (!('Notification' in window)) return;
      try {
        var permission = await Notification.requestPermission();
        syncPermBtn();
        if (permission === 'granted') {
          systemNotify('浏览器通知已开启，之后有人下单会直接弹出来。');
        }
      } catch (e) {
        console.warn('[AdminNotify] 申请通知权限失败:', e);
      }
    });
  }

  // 页面被隐藏时不停止轮询，这正是提醒要起作用的场景
  window.addEventListener('beforeunload', stop);

  window.AdminNotify = {
    start: start,
    stop: stop,
    seedFromOrders: seedFromOrders,
    poll: poll
  };
})();
