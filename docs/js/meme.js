// Meme 雷达：只用公开、只读、免密钥的接口做候选筛选与证据展示。
//
//   发现与行情  GeckoTerminal（活跃榜 / 新池、价格、市值、池子深度、买卖笔数）
//   合约风险    GoPlus（蜜罐、税率、权限、持仓集中度）
//   交叉校验    DexScreener（可选，默认关闭；失败只标注，不猜数）
//
// 三条硬规矩（和站点「只做整理，不做推荐」的口径一致）：
//   1. 不猜字段。接口没返回的项一律标记「未核验」，绝不当作通过。
//   2. 不填演示数据。接口失败就显示失败，别用假榜单撑版面。
//   3. 只筛选、只展示。页面不下单、不连接钱包、不索取任何密钥。
(function () {
  const list = document.querySelector('[data-radar-list]');
  if (!list) return;

  const statusNode = document.querySelector('[data-radar-status]');
  const sourceNode = document.querySelector('[data-radar-source]');
  const verdictLine = document.querySelector('[data-radar-verdict-line]');
  const countdownNode = document.querySelector('[data-radar-countdown]');
  const statScanned = document.querySelector('[data-radar-scanned]');
  const statPass = document.querySelector('[data-radar-pass]');
  const statVeto = document.querySelector('[data-radar-veto]');
  const statUpdated = document.querySelector('[data-radar-updated]');
  const depthSelect = document.querySelector('[data-radar-depth]');
  const autoButton = document.querySelector('[data-radar-auto]');
  const crossButton = document.querySelector('[data-radar-cross]');
  const refreshButton = document.querySelector('[data-radar-refresh]');
  const countsNode = document.querySelector('[data-radar-counts]');

  const GT = 'https://api.geckoterminal.com/api/v2';
  const GOPLUS = 'https://api.gopluslabs.io/api/v1';
  const DS = 'https://api.dexscreener.com/latest/dex/tokens';

  const CHAINS = [
    { id: 'solana', label: 'Solana', family: 'solana', goplus: 'solana', dot: '#7a5bd0' },
    { id: 'bsc', label: 'BNB Chain', family: 'evm', goplus: '56', dot: '#c99a00' },
    { id: 'base', label: 'Base', family: 'evm', goplus: '8453', dot: '#2563c9' },
    { id: 'eth', label: 'Ethereum', family: 'evm', goplus: '1', dot: '#5b6fd6' },
  ];

  // 阈值全部集中在这里，改口径只改这一处，页面说明与代码不会各说各话。
  const T = {
    minLiquidity: 8000, goodLiquidity: 30000,
    minVolume24h: 20000, goodVolume24h: 50000,
    maxTax: 0.05, maxTaxGap: 0.02,
    maxCreatorPct: 0.05, maxTop10: 0.5, warnTop10: 0.35,
    minAgeHours: 6, minMcap: 10000, maxMcap: 500000000,
  };

  const VERDICTS = {
    pass: { label: '可看', hint: '关键检查都过了' },
    review: { label: '待复核', hint: '有没查到的项，自己再核' },
    veto: { label: '别碰', hint: '触发一票否决' },
    unknown: { label: '数据不足', hint: '没拿到足够证据' },
  };

  const STATE_LABEL = { pass: '通过', fail: '不通过', unknown: '未核验' };

  const cache = new Map();
  const CACHE_MS = 60000;
  const REFRESH_MS = 60000;
  const INSPECT_GAP_MS = 420;

  let chain = CHAINS[0];
  let mode = 'trending';
  let sort = 'score';
  let filter = 'all';
  let depth = 8;
  let crossCheck = false;
  let autoRefresh = false;
  let candidates = [];
  let updatedAt = null;
  let loading = false;
  let roundToken = 0;
  let timer = null;

  try {
    const saved = JSON.parse(localStorage.getItem('nomad-radar') || '{}');
    if (CHAINS.some((item) => item.id === saved.chain)) chain = CHAINS.find((item) => item.id === saved.chain);
    if (typeof saved.autoRefresh === 'boolean') autoRefresh = saved.autoRefresh;
    if (typeof saved.crossCheck === 'boolean') crossCheck = saved.crossCheck;
    if ([4, 6, 8, 12].includes(saved.depth)) depth = saved.depth;
  } catch (error) {
    // 本地偏好读不出来就按默认值走，不影响功能。
  }

  const persist = () => {
    try {
      localStorage.setItem('nomad-radar', JSON.stringify({ chain: chain.id, autoRefresh, crossCheck, depth }));
    } catch (error) {
      // 隐私模式下写入会失败，忽略即可。
    }
  };

  /* ---------------------------------------------------------------- 工具 */

  const num = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  // Solana 地址大小写敏感，EVM 不敏感，比对时统一口径。
  const keyOf = (item) => (item.family === 'solana' ? item.address : String(item.address).toLowerCase());

  // 接口用 "0" / "1" 表示布尔，取不到就返回 null —— null 才代表「未核验」。
  const flag = (value) => {
    if (value === '1' || value === 1 || value === true) return true;
    if (value === '0' || value === 0 || value === false) return false;
    return null;
  };

  // GoPlus 的 Solana 权限字段是 {status, authority[]} 结构，status=1 表示这个权限还在。
  const nested = (value) => (value && typeof value === 'object' ? flag(value.status) : null);

  // GoPlus 的 Solana 权限字段有两种形状：{status, authority[]}，或者直接是一个数组。
  // 空数组表示「没有这个权限」，非空数组表示「有」—— 不能只按对象来读，否则永远拿不到结论。
  const authorityFlag = (value) => {
    if (Array.isArray(value)) return value.length > 0;
    return nested(value);
  };

  const escapeHtml = (value) =>
    String(value === null || value === undefined ? '' : value).replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#039;',
      '"': '&quot;',
    })[char]);

  const safeUrl = (value) => {
    const text = String(value || '');
    return /^https:\/\/[\w.-]+\//.test(text) ? text : '';
  };

  const money = (value) => {
    if (value === null || !Number.isFinite(value)) return '—';
    const abs = Math.abs(value);
    if (abs >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
    if (abs >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
    if (abs >= 1e3) return '$' + (value / 1e3).toFixed(1) + 'K';
    if (abs >= 1) return '$' + value.toFixed(2);
    if (abs === 0) return '$0';
    return '$' + value.toPrecision(3);
  };

  const usd = (value) => {
    if (value === null || !Number.isFinite(value)) return '—';
    const abs = Math.abs(value);
    if (abs >= 1) return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 4 });
    return '$' + String(value.toPrecision(4));
  };

  const percent = (value) => (value === null || !Number.isFinite(value) ? null : value);
  const pctText = (value) => {
    if (value === null || !Number.isFinite(value)) return '—';
    return (value > 0 ? '+' : '') + value.toFixed(1) + '%';
  };
  // 国内习惯：涨红跌绿。
  const toneOf = (value) => (value === null || !Number.isFinite(value) ? 'flat' : value > 0 ? 'up' : value < 0 ? 'down' : 'flat');

  const shortAddress = (value) => {
    const text = String(value || '');
    return text.length > 12 ? text.slice(0, 5) + '…' + text.slice(-4) : text;
  };

  // 笔数用「万」压缩，卡片里的数字保留一位就够读了，精确值放在 title 里。
  const count = (value) => {
    if (value === null || !Number.isFinite(value)) return '—';
    if (value >= 10000) return (value / 10000).toFixed(value >= 100000 ? 0 : 1) + '万';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return String(value);
  };

  const ageHours = (iso) => {
    const time = new Date(iso).getTime();
    if (Number.isNaN(time)) return null;
    return (Date.now() - time) / 3600000;
  };

  const ageText = (iso) => {
    const hours = ageHours(iso);
    if (hours === null) return '—';
    if (hours < 1) return Math.max(1, Math.round(hours * 60)) + ' 分钟';
    if (hours < 48) return Math.round(hours) + ' 小时';
    return Math.round(hours / 24) + ' 天';
  };

  const clockText = (date) =>
    date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const setText = (node, text) => { if (node) node.textContent = text; };

  const setStatus = (message, tone) => {
    if (!statusNode) return;
    statusNode.textContent = message || '';
    statusNode.className = 'radar-status' + (tone ? ' is-' + tone : '');
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function getJson(url, ms) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms || 12000);
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
      const text = await response.text();
      if (!response.ok) {
        let detail = 'HTTP ' + response.status;
        try {
          const parsed = JSON.parse(text);
          detail = parsed.status?.error_message || parsed.detail || parsed.error_message || detail;
        } catch (error) {
          if (/rate limit|1015/i.test(text)) detail = '接口限流（HTTP ' + response.status + '）';
        }
        const failure = new Error(detail);
        failure.status = response.status;
        throw failure;
      }
      return JSON.parse(text);
    } finally {
      clearTimeout(timer);
    }
  }

  /* ------------------------------------------------------------ 数据获取 */

  async function loadPools(target) {
    const key = target.id + ':' + mode;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.pools;
    const path = mode === 'new' ? 'new_pools' : 'trending_pools';
    const data = await getJson(GT + '/networks/' + target.id + '/' + path + '?include=base_token&page=1');
    const tokens = new Map((data.included || []).map((item) => [item.id, item.attributes || {}]));
    const pools = (data.data || []).slice(0, 20).map((pool) => normalize(pool, tokens, target)).filter(Boolean);
    // 同一个代币可能挂了好几个池子，只留流动性最深的那一个，免得同一枚币在榜上出现两次。
    const best = new Map();
    pools.forEach((pool) => {
      const id = keyOf(pool);
      const current = best.get(id);
      if (!current || (pool.liquidity ?? 0) > (current.liquidity ?? 0)) best.set(id, pool);
    });
    const unique = Array.from(best.values());
    cache.set(key, { at: Date.now(), pools: unique });
    return unique;
  }

  function normalize(pool, tokens, target) {
    const a = pool.attributes || {};
    const baseId = pool.relationships?.base_token?.data?.id || '';
    const address = baseId.includes('_') ? baseId.slice(baseId.indexOf('_') + 1) : baseId;
    if (!address) return null;
    const token = tokens.get(baseId) || {};
    const change = a.price_change_percentage || {};
    const volume = a.volume_usd || {};
    const txns = a.transactions || {};
    const txn = (bucket) => {
      const raw = txns[bucket];
      if (!raw) return null;
      return { buys: num(raw.buys) || 0, sells: num(raw.sells) || 0 };
    };
    return {
      chain: target.id,
      chainLabel: target.label,
      family: target.family,
      dot: target.dot,
      address,
      poolAddress: a.address || '',
      dex: pool.relationships?.dex?.data?.id || '',
      name: token.name || String(a.name || '').split(' / ')[0] || '未知代币',
      symbol: token.symbol || '?',
      image: safeUrl(token.image_url),
      price: num(a.base_token_price_usd),
      mcap: num(a.market_cap_usd) ?? num(a.fdv_usd),
      fdv: num(a.fdv_usd),
      liquidity: num(a.reserve_in_usd),
      createdAt: a.pool_created_at || '',
      change: {
        m5: num(change.m5), h1: num(change.h1), h6: num(change.h6), h24: num(change.h24),
      },
      volume: { m5: num(volume.m5), h1: num(volume.h1), h24: num(volume.h24) },
      txns: { m5: txn('m5'), h1: txn('h1'), h24: txn('h24') },
      risk: null,
      riskState: 'idle',
      cross: null,
      checks: [],
      score: null,
      coverage: null,
      verdict: 'unknown',
      reasons: [],
    };
  }

  async function loadRisk(item) {
    if (item.family === 'solana') {
      const data = await getJson(GOPLUS + '/solana/token_security?contract_addresses=' + encodeURIComponent(item.address));
      const key = Object.keys(data.result || {})[0];
      return key ? readSolanaRisk(data.result[key]) : null;
    }
    const target = CHAINS.find((entry) => entry.id === item.chain);
    const data = await getJson(GOPLUS + '/token_security/' + target.goplus + '?contract_addresses=' + item.address);
    const key = Object.keys(data.result || {})[0];
    return key ? readEvmRisk(data.result[key]) : null;
  }

  // 只做字段搬运与换算，不加任何推测：拿不到的一律留 null。
  function readEvmRisk(raw) {
    const holders = Array.isArray(raw.holders) ? raw.holders : [];
    const lp = Array.isArray(raw.lp_holders) ? raw.lp_holders : [];
    const dex = Array.isArray(raw.dex) ? raw.dex : [];
    const dexLiquidity = dex.reduce((sum, entry) => sum + (num(entry.liquidity) || 0), 0);
    const locked = lp.filter((entry) => flag(entry.is_locked) === true)
      .reduce((sum, entry) => sum + (num(entry.percent) || 0), 0);
    const burned = lp.filter((entry) => /^0x0+$|dead|burn/i.test(String(entry.address || '')) || /burn|dead/i.test(String(entry.tag || '')))
      .reduce((sum, entry) => sum + (num(entry.percent) || 0), 0);
    return {
      family: 'evm',
      chainLabel: raw.token_symbol ? raw.token_name + ' (' + raw.token_symbol + ')' : '',
      honeypot: flag(raw.is_honeypot),
      cannotSell: flag(raw.cannot_sell_all),
      cannotBuy: flag(raw.cannot_buy),
      buyTax: num(raw.buy_tax),
      sellTax: num(raw.sell_tax),
      openSource: flag(raw.is_open_source),
      mintable: flag(raw.is_mintable),
      pausable: flag(raw.transfer_pausable),
      blacklist: flag(raw.is_blacklisted),
      proxy: flag(raw.is_proxy),
      selfdestruct: flag(raw.selfdestruct),
      externalCall: flag(raw.external_call),
      hiddenOwner: flag(raw.hidden_owner),
      canTakeBackOwnership: flag(raw.can_take_back_ownership),
      ownerChangeBalance: flag(raw.owner_change_balance),
      cooldown: flag(raw.trading_cooldown),
      owner: String(raw.owner_address || ''),
      ownerRenounced: raw.owner_address ? /^0x0+$/i.test(String(raw.owner_address)) : null,
      holderCount: num(raw.holder_count),
      top10: holders.length ? holders.slice(0, 10).reduce((sum, entry) => sum + (num(entry.percent) || 0), 0) : null,
      creatorPct: num(raw.creator_percent),
      creator: String(raw.creator_address || ''),
      lpCount: num(raw.lp_holder_count),
      lpLockedPct: lp.length ? locked + burned : null,
      dexLiquidity: dex.length ? dexLiquidity : null,
      inDex: flag(raw.is_in_dex),
    };
  }

  function readSolanaRisk(raw) {
    const holders = Array.isArray(raw.holders) ? raw.holders : [];
    const lp = Array.isArray(raw.lp_holders) ? raw.lp_holders : [];
    const dex = Array.isArray(raw.dex) ? raw.dex : [];
    const burnFromDex = dex.reduce((best, entry) => {
      const value = num(entry.burn_percent);
      return value !== null && value > best ? value : best;
    }, 0);
    const locked = lp.filter((entry) => flag(entry.is_locked) === true)
      .reduce((sum, entry) => sum + (num(entry.percent) || 0), 0);
    // transfer_fee 为空对象表示没有转账税；非空但解析不出数值时保持「未核验」，不猜。
    const feeObject = raw.transfer_fee && typeof raw.transfer_fee === 'object' ? raw.transfer_fee : null;
    let feeRate = null;
    let feeKnown = false;
    if (feeObject && Object.keys(feeObject).length === 0) {
      feeRate = 0;
      feeKnown = true;
    } else if (feeObject) {
      const parsed = num(feeObject.fee_rate ?? feeObject.transfer_fee ?? feeObject.value ?? feeObject.rate);
      if (parsed !== null) {
        feeRate = parsed;
        feeKnown = true;
      }
    }
    return {
      family: 'solana',
      chainLabel: '',
      mintable: authorityFlag(raw.mintable),
      freezable: authorityFlag(raw.freezable),
      closable: authorityFlag(raw.closable),
      metadataMutable: authorityFlag(raw.metadata_mutable),
      balanceMutable: authorityFlag(raw.balance_mutable_authority),
      transferHook: authorityFlag(raw.transfer_hook),
      nonTransferable: flag(raw.non_transferable),
      transferFee: feeRate,
      transferFeeKnown: feeKnown,
      trusted: num(raw.trusted_token) === 1,
      holderCount: num(raw.holder_count),
      top10: holders.length ? holders.slice(0, 10).reduce((sum, entry) => sum + (num(entry.percent) || 0), 0) : null,
      lpLockedPct: lp.length || burnFromDex ? Math.max(locked, burnFromDex) : null,
      lpCount: lp.length || null,
      dexLiquidity: dex.length ? dex.reduce((sum, entry) => sum + (num(entry.lp_amount) || 0), 0) || null : null,
      inDex: dex.length ? true : null,
    };
  }

  async function loadCross(items) {
    const addresses = items.map((item) => item.address).join(',');
    const data = await getJson(DS + '/' + addresses, 12000);
    const byAddress = new Map();
    (data.pairs || []).forEach((pair) => {
      const key = String(pair.baseToken?.address || '').toLowerCase();
      if (!key) return;
      const liquidity = num(pair.liquidity?.usd) || 0;
      const current = byAddress.get(key);
      if (!current || liquidity > current.liquidity) {
        byAddress.set(key, {
          liquidity,
          mcap: num(pair.marketCap) ?? num(pair.fdv),
          price: num(pair.priceUsd),
          dex: pair.dexId || '',
        });
      }
    });
    return byAddress;
  }

  /* --------------------------------------------------------- 检查与结论 */

  const check = (key, label, state, detail) => ({ key, label, state, detail });

  // risk=true 表示「有这个风险」，所以 true 判不通过。
  function riskCheck(key, label, value, badDetail, okDetail) {
    if (value === null || value === undefined) return check(key, label, 'unknown', '接口未返回该字段');
    return value ? check(key, label, 'fail', badDetail) : check(key, label, 'pass', okDetail);
  }

  // good=true 表示「这是好状态」，所以 false 判不通过。
  function goodCheck(key, label, value, okDetail, badDetail) {
    if (value === null || value === undefined) return check(key, label, 'unknown', '接口未返回该字段');
    return value ? check(key, label, 'pass', okDetail) : check(key, label, 'fail', badDetail);
  }

  function marketChecks(item) {
    const checks = [];
    const liquidity = item.liquidity;
    if (liquidity === null) {
      checks.push(check('liquidity', '池子深度 ≥ $8,000', 'unknown', '行情接口没给流动性'));
    } else {
      checks.push(liquidity >= T.minLiquidity
        ? check('liquidity', '池子深度 ≥ $8,000', 'pass', '当前 ' + money(liquidity))
        : check('liquidity', '池子深度 ≥ $8,000', 'fail', '只有 ' + money(liquidity) + '，撤池风险高'));
    }

    const volume = item.volume.h24;
    if (volume === null) {
      checks.push(check('volume', '24 小时成交额 ≥ $20,000', 'unknown', '行情接口没给成交额'));
    } else {
      checks.push(volume >= T.minVolume24h
        ? check('volume', '24 小时成交额 ≥ $20,000', 'pass', money(volume))
        : check('volume', '24 小时成交额 ≥ $20,000', 'fail', '仅 ' + money(volume) + '，没人接盘'));
    }

    const minutes = item.volume.m5;
    checks.push(minutes === null
      ? check('live', '近 5 分钟有成交', 'unknown', '行情接口没给 5 分钟成交')
      : (minutes > 0
        ? check('live', '近 5 分钟有成交', 'pass', money(minutes))
        : check('live', '近 5 分钟有成交', 'fail', '近 5 分钟零成交')));

    const hours = ageHours(item.createdAt);
    checks.push(hours === null
      ? check('age', '池子已存在 ≥ 6 小时', 'unknown', '没有池子创建时间')
      : (hours >= T.minAgeHours
        ? check('age', '池子已存在 ≥ 6 小时', 'pass', '已 ' + ageText(item.createdAt))
        : check('age', '池子已存在 ≥ 6 小时', 'fail', '刚上线 ' + ageText(item.createdAt) + '，数据太少')));

    const mcap = item.mcap;
    checks.push(mcap === null
      ? check('mcap', '市值在 $1万 – $5亿', 'unknown', '行情接口没给市值')
      : (mcap >= T.minMcap && mcap <= T.maxMcap
        ? check('mcap', '市值在 $1万 – $5亿', 'pass', money(mcap))
        : check('mcap', '市值在 $1万 – $5亿', 'fail',
          '市值 ' + money(mcap) + (mcap > T.maxMcap ? '，已经太大，不在观察区间' : '，太小，随时可能归零'))));

    return checks;
  }

  function evmChecks(risk) {
    const checks = [];
    checks.push(riskCheck('honeypot', '不是蜜罐（买了能卖）', risk.honeypot, 'GoPlus 标记为蜜罐', '未标记蜜罐'));
    checks.push(riskCheck('sellable', '没有禁止卖出', risk.cannotSell, '合约限制卖出', '无卖出限制'));
    checks.push(goodCheck('openSource', '合约已开源', risk.openSource, '源码可见', '合约未开源'));

    const tax = (value, label, key) => {
      if (value === null) return check(key, label, 'unknown', '接口未返回税率');
      return value <= T.maxTax
        ? check(key, label, 'pass', (value * 100).toFixed(1) + '%')
        : check(key, label, 'fail', (value * 100).toFixed(1) + '% 超过 5%');
    };
    checks.push(tax(risk.buyTax, '买入税 ≤ 5%', 'buyTax'));
    checks.push(tax(risk.sellTax, '卖出税 ≤ 5%', 'sellTax'));

    if (risk.buyTax === null || risk.sellTax === null) {
      checks.push(check('taxGap', '买卖税差 ≤ 2 个百分点', 'unknown', '缺少税率数据'));
    } else {
      const gap = Math.abs(risk.buyTax - risk.sellTax);
      checks.push(gap <= T.maxTaxGap
        ? check('taxGap', '买卖税差 ≤ 2 个百分点', 'pass', '差额 ' + (gap * 100).toFixed(1) + ' 个百分点')
        : check('taxGap', '买卖税差 ≤ 2 个百分点', 'fail', '差额 ' + (gap * 100).toFixed(1) + ' 个百分点，偏向单边'));
    }

    checks.push(riskCheck('mintable', '不可增发', risk.mintable, '还能增发，随时稀释', '已关闭增发'));
    checks.push(riskCheck('pausable', '交易不可暂停', risk.pausable, '可以暂停交易', '不可暂停'));
    checks.push(goodCheck('renounced', '权限已放弃', risk.ownerRenounced, 'owner 已置零', 'owner 不是零地址，仍可操作'));
    checks.push(riskCheck('takeBack', '不可夺回权限', risk.canTakeBackOwnership, '可以夺回所有权', '不可夺回'));
    checks.push(riskCheck('hiddenOwner', '没有隐藏 owner', risk.hiddenOwner, '存在隐藏 owner', '无隐藏 owner'));
    checks.push(riskCheck('changeBalance', 'owner 不能改余额', risk.ownerChangeBalance, 'owner 可修改余额', '不可修改余额'));
    checks.push(riskCheck('blacklist', '没有黑名单机制', risk.blacklist, '存在黑名单', '无黑名单'));
    checks.push(riskCheck('proxy', '不是代理合约', risk.proxy, '代理合约，逻辑可替换', '非代理合约'));
    checks.push(riskCheck('selfdestruct', '没有自毁函数', risk.selfdestruct, '存在自毁函数', '无自毁函数'));

    const holders = [];
    if (risk.holderCount === null) {
      holders.push(check('holders', '持有人数 ≥ 50', 'unknown', '接口未返回持有人数'));
    } else {
      holders.push(risk.holderCount >= 50
        ? check('holders', '持有人数 ≥ 50', 'pass', risk.holderCount + ' 个地址')
        : check('holders', '持有人数 ≥ 50', 'fail', '只有 ' + risk.holderCount + ' 个地址'));
    }
    if (risk.top10 === null) {
      holders.push(check('top10', '前 10 持仓 < 50%', 'unknown', '接口未返回持仓分布'));
    } else {
      const text = (risk.top10 * 100).toFixed(1) + '%';
      holders.push(risk.top10 <= T.maxTop10
        ? check('top10', '前 10 持仓 < 50%', 'pass',
          '前 10 合计 ' + text + (risk.top10 > T.warnTop10 ? '，偏集中' : ''))
        : check('top10', '前 10 持仓 < 50%', 'fail', '前 10 合计 ' + text + '，高度集中'));
    }
    if (risk.creatorPct === null) {
      holders.push(check('creator', '创建者持仓 < 5%', 'unknown', '接口未返回创建者持仓'));
    } else {
      holders.push(risk.creatorPct <= T.maxCreatorPct
        ? check('creator', '创建者持仓 < 5%', 'pass', (risk.creatorPct * 100).toFixed(2) + '%')
        : check('creator', '创建者持仓 < 5%', 'fail', (risk.creatorPct * 100).toFixed(2) + '% 偏高'));
    }
    if (risk.lpLockedPct === null) {
      holders.push(check('lp', 'LP 已锁定或销毁', 'unknown', '接口未返回 LP 锁定情况'));
    } else {
      holders.push(risk.lpLockedPct > 0.5
        ? check('lp', 'LP 已锁定或销毁', 'pass', '约 ' + (risk.lpLockedPct * 100).toFixed(0) + '% 已锁/销毁')
        : check('lp', 'LP 已锁定或销毁', 'fail', '仅 ' + (risk.lpLockedPct * 100).toFixed(0) + '% 有锁定标记'));
    }
    return checks.concat(holders);
  }

  function solanaChecks(risk) {
    const checks = [];
    checks.push(riskCheck('mintable', '无增发权限', risk.mintable, '铸币权限还在，可随时增发', '铸币权限已放弃'));
    checks.push(riskCheck('freezable', '无冻结权限', risk.freezable, '可冻结你的代币', '不可冻结'));
    checks.push(riskCheck('closable', '无关闭权限', risk.closable, '账户可被关闭', '不可关闭'));
    checks.push(riskCheck('metadata', '元数据不可改', risk.metadataMutable, '名称/图标可被改掉', '元数据已固定'));
    checks.push(riskCheck('balanceAuth', '无余额修改权限', risk.balanceMutable, '余额可变', '余额不可变'));
    checks.push(riskCheck('hook', '无转账钩子', risk.transferHook, '存在转账钩子，逻辑可任意', '无转账钩子'));
    checks.push(riskCheck('nonTransferable', '不是不可转让代币', risk.nonTransferable, '代币不可转让', '可正常转让'));

    if (!risk.transferFeeKnown) {
      checks.push(check('fee', '无转账税', 'unknown', '接口返回了字段但解析不出税率'));
    } else if (risk.transferFee > T.maxTax) {
      checks.push(check('fee', '无转账税', 'fail', (risk.transferFee * 100).toFixed(1) + '% 转账税'));
    } else {
      checks.push(check('fee', '无转账税', 'pass',
        risk.transferFee > 0 ? (risk.transferFee * 100).toFixed(2) + '%' : '0%'));
    }

    const extra = [];
    if (risk.holderCount === null) {
      extra.push(check('holders', '持有人数 ≥ 50', 'unknown', '接口未返回持有人数'));
    } else {
      extra.push(risk.holderCount >= 50
        ? check('holders', '持有人数 ≥ 50', 'pass', risk.holderCount.toLocaleString('en-US') + ' 个地址')
        : check('holders', '持有人数 ≥ 50', 'fail', '只有 ' + risk.holderCount + ' 个地址'));
    }
    if (risk.top10 === null) {
      extra.push(check('top10', '前 10 持仓 < 50%', 'unknown', '接口未返回持仓分布'));
    } else {
      const text = (risk.top10 * 100).toFixed(1) + '%';
      extra.push(risk.top10 <= T.maxTop10
        ? check('top10', '前 10 持仓 < 50%', 'pass', '前 10 合计 ' + text)
        : check('top10', '前 10 持仓 < 50%', 'fail', '前 10 合计 ' + text + '，高度集中'));
    }
    if (risk.lpLockedPct === null) {
      extra.push(check('lp', 'LP 已销毁或锁定', 'unknown', '接口未返回 LP 情况'));
    } else {
      extra.push(risk.lpLockedPct > 0.5
        ? check('lp', 'LP 已销毁或锁定', 'pass', '约 ' + (risk.lpLockedPct * 100).toFixed(0) + '% 已锁/销毁')
        : check('lp', 'LP 已销毁或锁定', 'fail', '仅 ' + (risk.lpLockedPct * 100).toFixed(0) + '% 有锁定标记'));
    }
    return checks.concat(extra);
  }

  // 一票否决：命中任意一条直接归入「别碰」。
  const VETO_KEYS = new Set([
    'honeypot', 'sellable', 'openSource', 'buyTax', 'sellTax', 'taxGap',
    'renounced', 'takeBack', 'mintable', 'pausable', 'freezable', 'closable',
    'liquidity', 'top10', 'creator',
  ]);

  function evaluate(item) {
    const checks = marketChecks(item).concat(item.risk ? (item.family === 'solana' ? solanaChecks(item.risk) : evmChecks(item.risk)) : []);
    item.checks = checks;

    const unknown = checks.filter((entry) => entry.state === 'unknown');
    const failed = checks.filter((entry) => entry.state === 'fail');
    const passed = checks.filter((entry) => entry.state === 'pass');
    item.score = checks.length ? Math.round((passed.length / checks.length) * 100) : null;
    item.coverage = checks.length ? Math.round(((passed.length + failed.length) / checks.length) * 100) : 0;

    const vetoes = failed.filter((entry) => VETO_KEYS.has(entry.key));
    const unknownCritical = unknown.filter((entry) => VETO_KEYS.has(entry.key));
    item.reasons = vetoes.map((entry) => entry.label + '：' + entry.detail);

    if (!item.risk && item.riskState !== 'done') {
      item.verdict = 'unknown';
      if (!item.reasons.length) item.reasons.push('还没做合约风险深审，先不下结论');
    } else if (vetoes.length) {
      item.verdict = 'veto';
    } else if (unknown.length >= 4 || item.coverage < 70) {
      item.verdict = 'unknown';
      if (!item.reasons.length) item.reasons.push('有 ' + unknown.length + ' 项没查到，证据不足');
    } else if (failed.length) {
      item.verdict = 'review';
      item.reasons.push(failed.map((entry) => entry.label).join('、') + ' 未通过');
    } else if (unknownCritical.length) {
      // 关键项没查到就不能给「可看」，否则等于用沉默当通过。
      item.verdict = 'review';
      item.reasons.push(unknownCritical.map((entry) => entry.label).join('、')
        + ' 共 ' + unknownCritical.length + ' 项关键检查没查到，最高只能到待复核');
    } else if ((item.liquidity ?? 0) >= T.goodLiquidity && (item.volume.h24 ?? 0) >= T.goodVolume24h) {
      item.verdict = 'pass';
      // 「可看」不等于全查清了：还有没查到的项就直说，别让读者以为已经验完。
      if (unknown.length) {
        item.reasons = ['关键检查都过了，但还有 ' + unknown.length + ' 项没查到：'
          + unknown.map((entry) => entry.label).join('、')];
      }
    } else {
      item.verdict = 'review';
      item.reasons.push('关键检查都过了，但深度或成交额还没到舒适区');
    }
    return item;
  }

  /* ---------------------------------------------------------------- 渲染 */

  function visible() {
    let items = candidates.slice();
    if (filter !== 'all') items = items.filter((item) => item.verdict === filter);
    const rank = { pass: 0, review: 1, unknown: 2, veto: 3 };
    items.sort((a, b) => {
      if (sort === 'score') {
        if (rank[a.verdict] !== rank[b.verdict]) return rank[a.verdict] - rank[b.verdict];
        // 同一档里，已经深审过的排在前面 —— 有证据的比没证据的更值得看。
        const inspected = (item) => (item.risk ? 0 : 1);
        if (inspected(a) !== inspected(b)) return inspected(a) - inspected(b);
        return (b.score ?? -1) - (a.score ?? -1) || (b.volume.h24 ?? 0) - (a.volume.h24 ?? 0);
      }
      if (sort === 'volume') return (b.volume.h24 ?? -1) - (a.volume.h24 ?? -1);
      if (sort === 'change') return (b.change.h24 ?? -1e9) - (a.change.h24 ?? -1e9);
      if (sort === 'liquidity') return (b.liquidity ?? -1) - (a.liquidity ?? -1);
      return (ageHours(a.createdAt) ?? 1e9) - (ageHours(b.createdAt) ?? 1e9);
    });
    return items;
  }

  function checkRow(entry) {
    return '<li class="radar-check is-' + entry.state + '">'
      + '<b>' + escapeHtml(entry.label) + '</b>'
      + '<span class="radar-check-state">' + STATE_LABEL[entry.state] + '</span>'
      + '<i>' + escapeHtml(entry.detail || '') + '</i></li>';
  }

  // 分数只在做完深审之后才有意义：没深审的币只报行情项，不给百分比，免得「100% 覆盖」误导人。
  function scoreLine(item) {
    const passed = item.checks.filter((entry) => entry.state === 'pass').length;
    const total = item.checks.length;
    if (!item.risk) {
      return '<b>未深审</b> · 行情检查 ' + passed + '/' + total
        + ' 项通过 · 合约风险还没查，本轮不给分';
    }
    const unknowns = item.checks.filter((entry) => entry.state === 'unknown').length;
    return '<b>' + (item.score === null ? '—' : item.score) + '</b> 分 · 通过 ' + passed + '/' + total
      + ' 项 · 未核验 ' + unknowns + ' 项 · 覆盖率 ' + (item.coverage ?? 0) + '%';
  }

  function card(item, index) {
    const verdict = VERDICTS[item.verdict];
    const change = item.change.h24;
    const tone = toneOf(change);
    const txn = item.txns.h24;
    const buyRatio = txn && txn.buys + txn.sells > 0
      ? Math.round((txn.buys / (txn.buys + txn.sells)) * 100)
      : null;
    const link = item.family === 'solana'
      ? 'https://dexscreener.com/solana/' + item.address
      : 'https://dexscreener.com/' + (item.chain === 'eth' ? 'ethereum' : item.chain) + '/' + item.address;
    const gtLink = item.poolAddress
      ? 'https://www.geckoterminal.com/' + item.chain + '/pools/' + item.poolAddress
      : 'https://www.geckoterminal.com/' + item.chain + '/tokens/' + item.address;

    return '<article class="radar-card is-' + item.verdict + '">'
      + '<header class="radar-card-head">'
      + '<span class="radar-rank">' + String(index + 1).padStart(2, '0') + '</span>'
      + (item.image
        ? '<img class="radar-avatar" src="' + escapeHtml(item.image) + '" alt="" loading="lazy" width="40" height="40" />'
        : '<span class="radar-avatar is-fallback">' + escapeHtml(String(item.symbol || '?').slice(0, 1)) + '</span>')
      + '<div class="radar-title"><h3>' + escapeHtml(item.symbol) + '</h3>'
      + '<p>' + escapeHtml(item.name) + ' · <span class="radar-chain"><i style="background:' + item.dot + '"></i>'
      + escapeHtml(item.chainLabel) + '</span></p></div>'
      + '<span class="radar-verdict is-' + item.verdict + '">' + verdict.label + '</span>'
      + '</header>'
      + '<p class="radar-verdict-note">' + escapeHtml(item.reasons[0] || verdict.hint) + '</p>'
      + '<dl class="radar-metrics">'
      + '<div><dt>现价</dt><dd>' + usd(item.price) + '</dd></div>'
      + '<div><dt>市值</dt><dd>' + money(item.mcap) + '</dd></div>'
      + '<div><dt>池子深度</dt><dd>' + money(item.liquidity) + '</dd></div>'
      + '<div><dt>24h 成交</dt><dd>' + money(item.volume.h24) + '</dd></div>'
      + '<div><dt>24h 涨跌</dt><dd class="is-' + tone + '">' + pctText(change) + '</dd></div>'
      + '<div><dt>1h 涨跌</dt><dd class="is-' + toneOf(item.change.h1) + '">' + pctText(item.change.h1) + '</dd></div>'
      + '<div><dt>24h 买卖</dt><dd>' + (txn
        ? (buyRatio === null ? '0 笔' : '买 ' + buyRatio + '%')
          + ' <i class="radar-buy" title="' + txn.buys + ' 买 / ' + txn.sells + ' 卖">'
          + count(txn.buys + txn.sells) + ' 笔</i>'
        : '—') + '</dd></div>'
      + '<div><dt>上线</dt><dd>' + ageText(item.createdAt) + '</dd></div>'
      + '</dl>'
      + '<div class="radar-bar"><span style="width:' + (item.risk ? (item.score ?? 0) : 0) + '%"></span></div>'
      + '<p class="radar-score">'
      + scoreLine(item)
      + '</p>'
      + (item.checks.length
        ? '<details class="radar-checks"><summary>看完整检查矩阵（' + item.checks.length + ' 项）</summary><ul>'
          + item.checks.map(checkRow).join('') + '</ul></details>'
        : '<p class="radar-pending">合约风险还没查，等深审队列轮到它。</p>')
      + '<footer class="radar-card-foot">'
      + '<span class="radar-address" title="' + escapeHtml(item.address) + '">'
      + escapeHtml(shortAddress(item.address)) + '</span>'
      + '<span class="radar-links">'
      + '<a href="' + escapeHtml(gtLink) + '" target="_blank" rel="noopener">行情 ↗</a>'
      + '<a href="' + escapeHtml(link) + '" target="_blank" rel="noopener">DexScreener ↗</a>'
      + '</span></footer>'
      + '</article>';
  }

  function renderCounts() {
    if (!countsNode) return;
    const tally = { all: candidates.length, pass: 0, review: 0, veto: 0, unknown: 0 };
    candidates.forEach((item) => { tally[item.verdict] = (tally[item.verdict] || 0) + 1; });
    countsNode.querySelectorAll('[data-count]').forEach((node) => {
      const value = tally[node.dataset.count];
      node.textContent = String(value === undefined ? 0 : value);
    });
  }

  function renderStats() {
    const tally = { pass: 0, veto: 0 };
    candidates.forEach((item) => {
      if (item.verdict === 'pass') tally.pass += 1;
      if (item.verdict === 'veto') tally.veto += 1;
    });
    setText(statScanned, candidates.length ? String(candidates.length) : '—');
    setText(statPass, candidates.length ? String(tally.pass) : '—');
    setText(statVeto, candidates.length ? String(tally.veto) : '—');
    setText(statUpdated, updatedAt ? clockText(updatedAt) : '—');
    if (verdictLine) {
      if (!candidates.length) {
        verdictLine.textContent = '还没有数据。点右上角刷新，或等自动更新。';
      } else {
        const inspected = candidates.filter((item) => item.risk).length;
        verdictLine.textContent = '本轮 ' + candidates.length + ' 个候选，深审 ' + inspected + ' 个：'
          + tally.pass + ' 个关键检查全通过，'
          + candidates.filter((item) => item.verdict === 'review').length + ' 个待复核，'
          + candidates.filter((item) => item.verdict === 'unknown').length + ' 个证据不足，'
          + tally.veto + ' 个被一票否决。';
      }
    }
    renderCounts();
  }

  function render() {
    const items = visible();
    list.innerHTML = items.length
      ? items.map(card).join('')
      : '<p class="radar-empty">' + (candidates.length
        ? '当前筛选下没有候选，换个分档看看。'
        : '还没有取到数据。') + '</p>';
    renderStats();
  }

  function renderSource() {
    if (!sourceNode) return;
    const time = updatedAt ? updatedAt.toLocaleString('zh-CN', { hour12: false }) : '—';
    sourceNode.textContent = '数据来源：发现与行情 GeckoTerminal，合约风险 GoPlus'
      + (crossCheck ? '，交叉校验 DexScreener' : '')
      + '。本轮取数时间 ' + time + '。'
      + (mode === 'new' ? '当前看的是新池。' : '当前看的是活跃榜。');
  }

  /* ------------------------------------------------------------ 深审队列 */

  async function runRound() {
    if (loading) return;
    loading = true;
    roundToken += 1;
    const token = roundToken;
    if (refreshButton) refreshButton.disabled = true;
    setStatus('正在读取 ' + chain.label + ' 的' + (mode === 'new' ? '新池' : '活跃榜') + '…');

    try {
      const pools = await loadPools(chain);
      if (token !== roundToken) return;
      candidates = pools.map(evaluate);
      updatedAt = new Date();
      render();
      renderSource();
      setStatus(pools.length
        ? '已取到 ' + pools.length + ' 个候选，开始按顺序深审合约风险。'
        : '这一轮没有取到候选，稍后自动重试。', pools.length ? 'ok' : 'warn');

      const queue = candidates.slice(0, depth);
      let done = 0;
      for (const item of queue) {
        if (token !== roundToken) return;
        item.riskState = 'loading';
        try {
          item.risk = await loadRisk(item);
          item.riskState = item.risk ? 'done' : 'empty';
        } catch (error) {
          item.riskState = 'error';
          item.risk = null;
          item.riskError = error.status === 429 ? 'GoPlus 限流' : (error.message || '接口失败');
        }
        evaluate(item);
        done += 1;
        setStatus('深审 ' + done + '/' + queue.length + '：' + item.symbol
          + (item.riskState === 'done' ? ' 已出结论' : ' 未取到（' + (item.riskError || '无数据') + '）'));
        render();
        await sleep(INSPECT_GAP_MS);
      }

      if (crossCheck && token === roundToken) {
        try {
          const map = await loadCross(queue);
          queue.forEach((item) => {
            const hit = map.get(item.address.toLowerCase());
            if (!hit) return;
            item.cross = hit;
            if (item.liquidity === null && hit.liquidity) item.liquidity = hit.liquidity;
            if (item.mcap === null && hit.mcap) item.mcap = hit.mcap;
            evaluate(item);
          });
          render();
          setStatus('交叉校验完成，与 GeckoTerminal 的缺口已补齐。', 'ok');
        } catch (error) {
          setStatus('DexScreener 交叉校验没取到（' + (error.message || '接口失败') + '），其余数据不受影响。', 'warn');
        }
      } else {
        setStatus('本轮完成：深审 ' + done + ' 个。', 'ok');
      }
      renderSource();
    } catch (error) {
      if (token !== roundToken) return;
      candidates = [];
      render();
      const limited = error.status === 429;
      setStatus((limited ? '行情接口限流（HTTP 429）：' : '行情接口没取到数据：')
        + (error.message || '未知错误') + '。这一轮不填演示数据，稍后自动重试。', 'error');
    } finally {
      loading = false;
      if (refreshButton) refreshButton.disabled = false;
      scheduleNext();
    }
  }

  function scheduleNext() {
    clearTimeout(timer);
    if (!autoRefresh) {
      setText(countdownNode, '手动刷新');
      return;
    }
    const due = Date.now() + REFRESH_MS;
    const tick = () => {
      const left = Math.max(0, Math.round((due - Date.now()) / 1000));
      setText(countdownNode, left + ' 秒后自动更新');
      if (left <= 0) {
        runRound();
        return;
      }
      timer = setTimeout(tick, 1000);
    };
    tick();
  }

  /* ---------------------------------------------------------------- 交互 */

  function markActive(attribute, value) {
    document.querySelectorAll('[' + attribute + ']').forEach((node) => {
      node.classList.toggle('is-active', node.getAttribute(attribute) === value);
    });
  }

  document.querySelectorAll('[data-chain]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = CHAINS.find((item) => item.id === button.dataset.chain);
      if (!next || next.id === chain.id) return;
      chain = next;
      persist();
      markActive('data-chain', chain.id);
      runRound();
    });
  });

  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.mode === mode) return;
      mode = button.dataset.mode;
      markActive('data-mode', mode);
      runRound();
    });
  });

  document.querySelectorAll('[data-radar-sort]').forEach((button) => {
    button.addEventListener('click', () => {
      sort = button.dataset.radarSort;
      markActive('data-radar-sort', sort);
      render();
    });
  });

  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      filter = button.dataset.filter;
      markActive('data-filter', filter);
      render();
    });
  });

  depthSelect?.addEventListener('change', () => {
    depth = Number(depthSelect.value) || 8;
    persist();
    runRound();
  });

  autoButton?.addEventListener('click', () => {
    autoRefresh = !autoRefresh;
    autoButton.classList.toggle('is-active', autoRefresh);
    autoButton.setAttribute('aria-pressed', String(autoRefresh));
    autoButton.textContent = autoRefresh ? '自动更新：开' : '自动更新：关';
    persist();
    scheduleNext();
  });

  crossButton?.addEventListener('click', () => {
    crossCheck = !crossCheck;
    crossButton.classList.toggle('is-active', crossCheck);
    crossButton.setAttribute('aria-pressed', String(crossCheck));
    crossButton.textContent = crossCheck ? '交叉校验：开' : '交叉校验：关';
    persist();
    renderSource();
  });

  refreshButton?.addEventListener('click', () => runRound());

  document.addEventListener('visibilitychange', () => {
    // 页面切到后台就停掉自动请求，回来再补一次，免得白烧接口额度。
    if (document.hidden) {
      clearTimeout(timer);
      setText(countdownNode, '后台暂停');
    } else if (autoRefresh) {
      runRound();
    }
  });

  // 头像加载失败就退回首字母，不留破图。
  list.addEventListener('error', (event) => {
    const image = event.target;
    if (image && image.tagName === 'IMG') {
      const fallback = document.createElement('span');
      fallback.className = 'radar-avatar is-fallback';
      fallback.textContent = String(image.alt || '?').slice(0, 1) || '?';
      image.replaceWith(fallback);
    }
  }, true);

  /* ---------------------------------------------------------------- 启动 */

  markActive('data-chain', chain.id);
  markActive('data-mode', mode);
  markActive('data-radar-sort', sort);
  markActive('data-filter', filter);
  autoButton?.classList.toggle('is-active', autoRefresh);
  autoButton?.setAttribute('aria-pressed', String(autoRefresh));
  setText(autoButton, autoRefresh ? '自动更新：开' : '自动更新：关');
  crossButton?.classList.toggle('is-active', crossCheck);
  crossButton?.setAttribute('aria-pressed', String(crossCheck));
  setText(crossButton, crossCheck ? '交叉校验：开' : '交叉校验：关');
  if (depthSelect) depthSelect.value = String(depth);
  runRound();
})();
