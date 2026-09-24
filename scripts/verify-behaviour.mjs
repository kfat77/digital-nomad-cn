/**
 * 行为级验证 · verify-behaviour.mjs
 *
 * 用 jsdom 在 Node 里真跑一遍两条最容易出事、又最难手工验证的路径：
 *   1. 订阅商城：读套餐、切币种、选周期、提交、查询（含未部署/暂停接单/未配价）
 *   2. 后台提醒：游标对齐、新单提醒、陈旧响应去重、函数缺失时静默停用
 *
 * 这是可选的开发依赖，CI 只跑零依赖的 scripts/check-site.mjs。
 *   安装：npm i -D jsdom
 *   运行：npm run verify
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

let JSDOM;
try {
  ({ JSDOM } = await import('jsdom'));
} catch {
  console.error('缺少测试依赖 jsdom，先执行：npm i -D jsdom');
  process.exit(2);
}

const SUB_PAGE = resolve('docs/subscriptions.html');
const SUB_SCRIPT = resolve('docs/js/subscriptions.js');
const NOTIFY_SCRIPT = resolve('docs/js/admin-notify.js');
const ADMIN_PAGE = resolve('docs/phone-cards/admin.html');
const ADMIN_SCRIPT = resolve('docs/js/admin.js');

const results = [];
const ok = (name, cond, extra = '') =>
  results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' :: ' + extra : ''}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PLAN_ROWS = [
  ['sub_x_3m_cny', '27'], ['sub_x_3m_usdt', '4'],
  ['sub_x_6m_cny', '54'], ['sub_x_6m_usdt', '8'],
  ['sub_x_12m_cny', '0'], ['sub_x_12m_usdt', '45'],
  ['sub_x_12m_plus_cny', '0'], ['sub_x_12m_plus_usdt', '210'],
  ['sub_tg_3m_cny', '101'], ['sub_tg_3m_usdt', '14'],
  ['sub_tg_6m_cny', '131'], ['sub_tg_6m_usdt', '19'],
  ['sub_tg_12m_cny', '222'], ['sub_tg_12m_usdt', '32'],
  ['sub_accepting', '1'],
  ['sub_pay_note', '请通过客服获取收款方式。'],
  ['sub_direct_url', 'https://ronvip.pages.dev/?ref=RP39040825423J2A5C'],
].map(([key, value]) => ({ key, value }));

// ────────────────────────────────────────────────────────────
// 一、订阅商城
// ────────────────────────────────────────────────────────────
async function bootSubscriptions(rpcImpl) {
  const html = await readFile(SUB_PAGE, 'utf8');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom;
  window.Element.prototype.scrollIntoView = function () {};
  window.sb = { rpc: rpcImpl };
  window.eval(await readFile(SUB_SCRIPT, 'utf8'));
  await sleep(60);
  return window;
}

const q = (w, sel) => w.document.querySelector(sel);
const txt = (w, sel) => (q(w, sel) || {}).textContent;

async function verifySubscriptions() {
  // 正常路径
  {
    const calls = [];
    const w = await bootSubscriptions(async (name, params) => {
      calls.push([name, params]);
      if (name === 'get_subscription_info') return { data: PLAN_ROWS, error: null };
      if (name === 'create_subscription_order') {
        return {
          data: [{
            order_number: 'X-20260924-0007', tracking_code: 'K7Q2ZD',
            unit_price: 45, total_price: 90, pay_currency: 'usdt',
          }], error: null,
        };
      }
      if (name === 'query_order') {
        return {
          data: [{
            order_number: 'X-20260924-0007', status: 'confirmed', quantity: 2,
            total_price: 90, courier_company: null, tracking_number: null,
            created_at: '2026-09-24T10:00:00Z', updated_at: '2026-09-24T10:20:00Z',
          }], error: null,
        };
      }
      return { data: null, error: null };
    });

    ok('默认平台渲染 4 个 X 套餐', w.document.querySelectorAll('[data-subs-plan]').length === 4);
    ok('接单状态显示接单中', txt(w, '[data-subs-accepting]') === '接单中');
    ok('在售套餐计数为 7', txt(w, '[data-subs-plan-count]') === '7 个');
    ok('人民币下 x_12m 不可选', q(w, '[data-subs-plan="x_12m"]').getAttribute('aria-disabled') === 'true');
    ok('切到 USDT 后 x_12m 可选', (() => {
      q(w, '[data-subs-currency="usdt"]').click();
      return q(w, '[data-subs-plan="x_12m"]').getAttribute('aria-disabled') === null;
    })());
    ok('选 12 个月后合计 45 USDT', (() => {
      q(w, '[data-subs-plan="x_12m"]').click();
      return txt(w, '[data-subs-total]') === '45 USDT';
    })(), txt(w, '[data-subs-total]'));
    ok('数量 +1 后合计 90 USDT', (() => {
      q(w, '[data-subs-qty-plus]').click();
      return txt(w, '[data-subs-total]') === '90 USDT';
    })());
    ok('切到 TG 只渲染 3 个套餐', (() => {
      q(w, '[data-subs-platform="tg"]').click();
      return w.document.querySelectorAll('[data-subs-plan]').length === 3;
    })());
    ok('切换平台后清空原选择', txt(w, '[data-subs-total]') === '—');

    q(w, '[data-subs-platform="x"]').click();
    q(w, '[data-subs-plan="x_6m"]').click();
    q(w, '[data-subs-currency="usdt"]').click();
    q(w, '[data-subs-plan="x_12m"]').click();
    q(w, '[data-subs-qty-plus]').click();
    w.document.getElementById('subs-account').value = '@buyer_one';
    w.document.getElementById('subs-contact').value = '@buyer_tg';
    q(w, '[data-subs-form]').dispatchEvent(new w.Event('submit', { cancelable: true, bubbles: true }));
    await sleep(60);

    const submit = calls.filter((c) => c[0] === 'create_subscription_order').pop();
    ok('提交调用 create_subscription_order', !!submit);
    if (submit) {
      const p = submit[1];
      ok('提交不含任何价格字段', !('p_unit_price' in p) && !('p_total_price' in p),
        JSON.stringify(Object.keys(p)));
      ok('提交套餐与币种正确', p.p_plan_code === 'x_12m' && p.p_currency === 'usdt');
      ok('提交数量与界面一致',
        p.p_quantity === Number(q(w, '[data-subs-qty]').value),
        'payload=' + p.p_quantity);
    }
    ok('成功区显示订单号与查询码',
      txt(w, '[data-subs-order-number]') === 'X-20260924-0007' && txt(w, '[data-subs-tracking-code]') === 'K7Q2ZD');
    ok('成功提示带金额与币种', (txt(w, '[data-subs-success-hint]') || '').includes('90 USDT'));
    ok('自助下单链接带返佣参数',
      (q(w, '[data-subs-direct]').getAttribute('href') || '').includes('ref=RP39040825423J2A5C'));

    w.document.getElementById('subs-lookup-number').value = 'X-20260924-0007';
    w.document.getElementById('subs-lookup-code').value = 'k7q2zd';
    q(w, '[data-subs-lookup-form]').dispatchEvent(new w.Event('submit', { cancelable: true, bubbles: true }));
    await sleep(60);
    const lookup = q(w, '[data-subs-lookup-result]').innerHTML;
    ok('查询码自动转大写', calls.some((c) => c[0] === 'query_order' && c[1].p_tracking_code === 'K7Q2ZD'));
    ok('查询结果渲染状态与金额', lookup.includes('已确认，待处理') && lookup.includes('90'));
  }

  // 暂停接单
  {
    const w = await bootSubscriptions(async (name) => {
      if (name === 'get_subscription_info') {
        return {
          data: PLAN_ROWS.map((r) => (r.key === 'sub_accepting' ? { key: r.key, value: '0' } : r)),
          error: null,
        };
      }
      return { data: null, error: null };
    });
    ok('暂停接单时显示已暂停', txt(w, '[data-subs-accepting]') === '已暂停');
    ok('暂停接单时提交被禁用', q(w, '[data-subs-submit]').disabled === true);
    ok('暂停接单时给出说明', (txt(w, '[data-subs-error]') || '').includes('暂停接单'));
  }

  // 订阅 SQL 未执行
  {
    const w = await bootSubscriptions(async () => ({
      data: null,
      error: new Error('Could not find the function public.get_subscription_info in the schema cache'),
    }));
    ok('未部署时提示怎么启用', (q(w, '[data-subs-plans]').textContent || '').includes('subscriptions.sql'));
    ok('未部署时不允许下单', q(w, '[data-subs-submit]').disabled === true);
    ok('未部署时接单状态标为未启用', txt(w, '[data-subs-accepting]') === '未启用');
  }

  // 后台未给 TG 配价
  {
    const w = await bootSubscriptions(async (name) => {
      if (name === 'get_subscription_info') {
        return { data: PLAN_ROWS.filter((r) => !/^sub_tg_/.test(r.key)), error: null };
      }
      return { data: null, error: null };
    });
    ok('未配价平台全部不可选', (() => {
      q(w, '[data-subs-platform="tg"]').click();
      return Array.from(w.document.querySelectorAll('[data-subs-plan]'))
        .every((b) => b.getAttribute('aria-disabled') === 'true');
    })());
    ok('未配价套餐不被计数', txt(w, '[data-subs-plan-count]') === '4 个');
  }
}

// ────────────────────────────────────────────────────────────
// 二、后台新订单提醒
// ────────────────────────────────────────────────────────────
const NOTIFY_MARKUP = `<!doctype html><html lang="zh-CN"><body>
<div class="admin-notify" data-notify-bar hidden>
  <strong data-notify-title></strong><p data-notify-detail></p>
  <button data-notify-open hidden></button>
  <button data-notify-sound aria-pressed="true"></button>
  <button data-notify-permission></button>
  <button data-notify-dismiss></button>
</div>
<p data-notify-state></p>
</body></html>`;

async function bootNotify(rpcImpl) {
  const dom = new JSDOM(NOTIFY_MARKUP, {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: 'http://localhost/admin',
  });
  const { window } = dom;
  const calls = [];
  window.sb = {
    rpc: async (name, params) => {
      calls.push([name, params]);
      return rpcImpl(name, params);
    },
  };
  window.eval(await readFile(NOTIFY_SCRIPT, 'utf8'));
  return { window, calls };
}

async function verifyNotify() {
  const ORDERS = [
    { id: 'aaaaaaaa-0000-0000-0000-000000000001', created_at: '2026-09-24T09:00:00Z' },
    { id: 'bbbbbbbb-0000-0000-0000-000000000002', created_at: '2026-09-24T11:30:00Z' },
    { id: 'cccccccc-0000-0000-0000-000000000003', created_at: '2026-09-24T10:15:00Z' },
  ];

  // 首次使用 + 真实新单
  {
    let phase = 1;
    const { window, calls } = await bootNotify((name, params) => {
      if (phase === 1) return { data: [{ new_count: 0, latest_id: null, latest_at: null }], error: null };
      if (params.p_since && params.p_since >= '2026-09-24T12:00:00Z') {
        return { data: [{ new_count: 0, latest_id: null, latest_at: null }], error: null };
      }
      return {
        data: [{
          new_count: 2,
          latest_id: 'dddddddd-0000-0000-0000-000000000004',
          latest_at: '2026-09-24T12:00:00Z',
          latest_number: 'TG-20260924-0003',
          latest_product: 'tg_premium',
          latest_plan: 'tg_12m',
          latest_account: '@buyer_one',
          latest_total: 222,
          latest_currency: 'cny',
          latest_contact: '@buyer_tg',
        }], error: null,
      };
    });

    const onChange = [];
    const onSelect = [];
    window.AdminNotify.start({ onChange: () => onChange.push(1), onSelect: (id) => onSelect.push(id) });
    ok('对齐游标前不轮询', calls.length === 0);

    window.AdminNotify.seedFromOrders(ORDERS);
    await sleep(30);
    ok('对齐后立即轮询一次', calls.length === 1);
    ok('游标钉在最新一单的 (created_at, id)',
      calls[0][1].p_since === '2026-09-24T11:30:00Z' &&
      calls[0][1].p_last_id === 'bbbbbbbb-0000-0000-0000-000000000002',
      JSON.stringify(calls[0][1]));
    ok('首次空结果不出横幅', window.document.querySelector('[data-notify-bar]').hidden === true);

    phase = 2;
    await window.AdminNotify.poll();
    await sleep(30);

    const bar = window.document.querySelector('[data-notify-bar]');
    ok('有新单时横幅出现', bar.hidden === false);
    ok('横幅标题带订单数',
      window.document.querySelector('[data-notify-title]').textContent === '有 2 笔新订单');
    const detail = window.document.querySelector('[data-notify-detail]').textContent;
    ok('横幅详情含商品、账号与金额',
      detail.includes('TG Premium') && detail.includes('@buyer_one') && detail.includes('¥222'), detail);
    ok('查看按钮带目标订单 id',
      window.document.querySelector('[data-notify-open]').getAttribute('data-notify-target') ===
      'dddddddd-0000-0000-0000-000000000004');
    ok('标题立即开始闪烁', window.document.title.includes('有新订单'), window.document.title);
    ok('提醒后台刷新列表', onChange.length === 1);
    ok('游标已持久化',
      JSON.parse(window.localStorage.getItem('ne_admin_seen_order_v1')).at === '2026-09-24T12:00:00Z');

    await window.AdminNotify.poll();
    ok('同一批订单不会重复提醒', onChange.length === 1, 'onChange=' + onChange.length);

    window.document.querySelector('[data-notify-open]').click();
    ok('查看按钮回传订单 id', onSelect[0] === 'dddddddd-0000-0000-0000-000000000004');
    ok('点查看后横幅收起', bar.hidden === true);

    const sound = window.document.querySelector('[data-notify-sound]');
    sound.click();
    ok('提示音开关可切换', sound.getAttribute('aria-pressed') === 'false');
    sound.click();
    ok('提示音开关可切回', sound.getAttribute('aria-pressed') === 'true');
    ok('无 Notification 能力时隐藏授权按钮',
      window.document.querySelector('[data-notify-permission]').hidden === true);
  }

  // 订阅 SQL 未执行
  {
    const { window } = await bootNotify(() => ({
      data: null,
      error: new Error('Could not find the function public.admin_new_orders(...) in the schema cache'),
    }));
    window.AdminNotify.start({});
    window.AdminNotify.seedFromOrders([]);
    await sleep(40);
    const state = window.document.querySelector('[data-notify-state]');
    ok('函数缺失时提示如何启用', state.textContent.includes('subscriptions.sql'), state.textContent);
    ok('函数缺失时标记为未启用', state.classList.contains('is-off'));
  }

  // 网络抖动不打断轮询
  {
    let n = 0;
    const { window } = await bootNotify((name, params) => {
      n += 1;
      if (n === 1) return { data: null, error: new Error('TypeError: Failed to fetch') };
      return { data: [{ new_count: 0, latest_id: null, latest_at: null }], error: null };
    });
    window.AdminNotify.start({});
    window.AdminNotify.seedFromOrders([]);
    await sleep(30);
    ok('网络失败后仍保持运行',
      window.document.querySelector('[data-notify-state]').textContent.includes('稍后重试'));
    await window.AdminNotify.poll();
    await sleep(20);
    ok('恢复后回到正常提示',
      window.document.querySelector('[data-notify-state]').textContent.includes('提醒运行中'));
  }

  // 服务端固执回同一行
  {
    const stale = {
      data: [{
        new_count: 5,
        latest_id: 'eeeeeeee-0000-0000-0000-000000000005',
        latest_at: '2026-09-24T13:00:00Z',
        latest_number: 'X-20260924-0009',
        latest_product: 'x_premium',
        latest_plan: 'x_12m',
        latest_account: '@stale_user',
        latest_total: 45,
        latest_currency: 'usdt',
        latest_contact: '@stale_tg',
      }], error: null,
    };
    const { window } = await bootNotify(() => stale);
    const onChange = [];
    window.AdminNotify.start({ onChange: () => onChange.push(1) });
    window.AdminNotify.seedFromOrders([]);
    await sleep(30);
    await window.AdminNotify.poll();
    await window.AdminNotify.poll();
    await window.AdminNotify.poll();
    await sleep(30);
    ok('陈旧响应只提醒一次', onChange.length === 1, 'onChange=' + onChange.length);
    ok('陈旧响应不覆盖游标',
      JSON.parse(window.localStorage.getItem('ne_admin_seen_order_v1')).at === '2026-09-24T13:00:00Z');
  }
}

// ────────────────────────────────────────────────────────────
// 三、后台对订阅订单的展示与交付
// ────────────────────────────────────────────────────────────
async function verifyAdminRendering() {
  const cardOrder = {
    id: '11111111-1111-1111-1111-111111111111', order_number: 'GF-20260924-0001',
    tracking_code: 'AAA111', product_type: 'card', quantity: 2, unit_price: 58, total_price: 116,
    customer_name: '张三', customer_phone: '13800001111', customer_email: null,
    shipping_address: '广东省深圳市南山区xx路1号', status: 'user_paid',
    courier_company: null, tracking_number: null, admin_remark: null,
    service_account: null, plan_code: null, pay_currency: null,
    customer_contact: null, customer_note: null,
    created_at: '2026-09-24T02:00:00Z', updated_at: '2026-09-24T02:00:00Z',
  };
  const subOrder = {
    id: '22222222-2222-2222-2222-222222222222', order_number: 'X-20260924-0002',
    tracking_code: 'BBB222', product_type: 'x_premium', quantity: 1, unit_price: 45, total_price: 45,
    customer_name: '@buyer_one', customer_phone: null, customer_email: 'buyer@example.com',
    shipping_address: null, status: 'confirmed',
    courier_company: null, tracking_number: null, admin_remark: null,
    service_account: '@buyer_one', plan_code: 'x_12m', pay_currency: 'usdt',
    customer_contact: '@buyer_tg', customer_note: '希望本周内开通',
    created_at: '2026-09-24T03:00:00Z', updated_at: '2026-09-24T03:00:00Z',
  };

  const html = await readFile(ADMIN_PAGE, 'utf8');
  const dom = new JSDOM(html, {
    runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/admin',
  });
  const { window } = dom;

  window.SITE_CONFIG = {
    ADMIN: { emails: ['admin@example.com'] },
    ORDER_STATUS: {
      pending_payment: '待支付', user_paid: '待确认收款', confirmed: '已确认',
      shipped: '已发货', completed: '已完成', cancelled: '已取消',
    },
  };

  const rpcCalls = [];
  const updates = [];
  window.sb = {
    auth: {
      onAuthStateChange(cb) { setTimeout(() => cb('SIGNED_IN', { user: { email: 'admin@example.com' } }), 0); },
      signOut: async () => {},
    },
    rpc: async (name, params) => {
      rpcCalls.push([name, params]);
      if (name === 'admin_get_orders') return { data: [subOrder, cardOrder], error: null };
      if (name === 'admin_new_orders') return { data: [{ new_count: 0, latest_id: null, latest_at: null }], error: null };
      if (name === 'admin_update_order') { updates.push(params); return { data: [subOrder], error: null }; }
      if (name === 'admin_get_settings') return { data: [], error: null };
      return { data: null, error: null };
    },
  };

  window.eval(await readFile(NOTIFY_SCRIPT, 'utf8'));
  window.eval(await readFile(ADMIN_SCRIPT, 'utf8'));
  await sleep(120);

  const doc = window.document;
  const table = doc.getElementById('table-container');
  ok('登录后进入后台', doc.getElementById('admin-section').style.display === 'block');

  const tableText = table.textContent;
  ok('订阅订单显示平台与周期', tableText.includes('X Premium · 12 个月'));
  ok('订阅订单显示目标账号', tableText.includes('@buyer_one'));
  ok('USDT 订单金额不标成人民币', tableText.includes('45 USDT') && !tableText.includes('¥45'));
  ok('实物订单仍按人民币显示并保留收货人',
    tableText.includes('¥116') && tableText.includes('张三'));
  ok('表头同时覆盖实物与订阅', tableText.includes('客户 / 账号'));

  table.querySelector('tbody tr[data-order-id="' + subOrder.id + '"]')
    .dispatchEvent(new window.Event('click', { bubbles: true }));
  await sleep(20);

  const detail = doc.getElementById('detail-panel');
  const detailText = detail.textContent;
  ok('详情显示目标账号与套餐',
    detailText.includes('目标账号（需开通的账号）') && detailText.includes('X Premium · 12 个月'));
  ok('详情显示联系方式与买家备注',
    detailText.includes('@buyer_tg') && detailText.includes('希望本周内开通'));
  ok('订阅订单不显示收货地址与快递输入',
    !detailText.includes('收货地址') && !detail.innerHTML.includes('edit-courier'));
  ok('订阅订单数量单位是份', detailText.includes('1 份'));
  ok('订阅订单出现交付备注输入与标记已交付按钮',
    detail.innerHTML.includes('edit-remark') && detailText.includes('标记已交付'));

  doc.getElementById('edit-remark').value = '已开通 12 个月';
  detail.querySelector('[data-action="deliver"]')
    .dispatchEvent(new window.Event('click', { bubbles: true }));
  await sleep(40);
  const deliver = updates.filter((u) => u.p_status === 'shipped').pop();
  ok('标记已交付写入状态与备注',
    !!deliver && deliver.p_admin_remark === '已开通 12 个月', JSON.stringify(deliver));

  table.querySelector('tbody tr[data-order-id="' + cardOrder.id + '"]')
    .dispatchEvent(new window.Event('click', { bubbles: true }));
  await sleep(20);
  const cardDetail = doc.getElementById('detail-panel');
  const cardText = cardDetail.textContent;
  ok('实物订单详情保留地址与电话',
    cardText.includes('广东省深圳市南山区xx路1号') && cardText.includes('13800001111'));
  ok('实物订单不出现目标账号与交付备注',
    !cardText.includes('目标账号') && !cardDetail.innerHTML.includes('edit-remark'));
  ok('实物订单按钮为确认收款', cardText.includes('确认收款'));
  ok('后台已启动新订单轮询', rpcCalls.some((c) => c[0] === 'admin_new_orders'));
  ok('设置页有订阅接单开关与价格输入',
    !!doc.getElementById('set-sub-accepting') &&
    !!doc.getElementById('set-sub-x_12m_plus-usdt') &&
    !!doc.getElementById('set-sub-tg_12m-cny'));
}

await verifySubscriptions();
await verifyNotify();
await verifyAdminRendering();

console.log(results.join('\n'));
const failed = results.filter((r) => r.startsWith('FAIL'));
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
