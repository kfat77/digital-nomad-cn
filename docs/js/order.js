/**
 * 下单页逻辑 · order.js
 * 依赖：config.js, supabase-client.js
 */
(function () {
  'use strict';

  var cfg = window.SITE_CONFIG || {};
  var products = cfg.PRODUCTS || {};
  var cs = cfg.CUSTOMER_SERVICE || {};
  var sb = window.sb;

  var currentProduct = 'card'; // 'card' | 'recharge'
  var unitPrice = 0;
  var maxQty = 10;
  var sym = '¥';
  // 当前订单信息（提交成功后保存，供"我已支付"使用）
  var currentOrder = { orderNumber: '', trackingCode: '', totalPrice: 0 };

  // ── DIAG 诊断日志 ──
  console.log('[DIAG] sb 可用:', !!sb);
  console.log('[DIAG] currentProduct:', currentProduct);
  console.log('[DIAG] fallback price:', getProductCfg().price);

  // -- DOM 元素（必须在同步初始化之前查询，防止 undefined 崩溃）--
  var elName = document.getElementById('product-name');
  var elDesc = document.getElementById('product-desc');
  var elPrice = document.getElementById('product-price');
  var elTotal = document.getElementById('total-price');
  var soldOutTag = document.getElementById('sold-out-tag');
  var qtyInput = document.querySelector('[data-qty-input]');
  var btnMinus = document.querySelector('[data-qty-minus]');
  var btnPlus = document.querySelector('[data-qty-plus]');
  var submitBtn = document.querySelector('[data-submit-btn]');
  var form = document.querySelector('[data-order-form]');
  var errorBox = document.querySelector('[data-order-error]');
  var successBox = document.querySelector('[data-order-success]');
  var formArea = document.getElementById('order-form-area');
  var ptSelector = document.getElementById('product-type-selector');
  var markPaidBtn = document.getElementById('mark-paid-btn');
  var payAmountEl = document.getElementById('pay-amount');
  var payDoneEl = document.getElementById('pay-done');

  // -- 产品套餐数据 --
  function getProductCfg() {
    return products[currentProduct] || products.card || {};
  }

  // -- 产品类型切换 --
  if (ptSelector) {
    ptSelector.addEventListener('click', function (e) {
      var option = e.target.closest('.pt-option');
      if (!option) return;
      var pt = option.getAttribute('data-pt');
      if (!pt || pt === currentProduct) return;
      currentProduct = pt;
      ptSelector.querySelectorAll('.pt-option').forEach(function (o) {
        o.classList.toggle('active', o === option);
      });
      applyCurrentProduct();
    });
  }

  // -- 填充商品信息 --
  function updateProductUI() {
    var p = getProductCfg();
    if (elName) elName.textContent = p.name || '';
    if (elDesc) elDesc.textContent = p.description || '';
    if (elPrice) elPrice.textContent = sym + unitPrice;
    updateTotal();
  }

  // -- 更新总价（防御性 null 检查）--
  function updateTotal() {
    if (!qtyInput) { console.warn('[DIAG] qtyInput 不存在，跳过 updateTotal'); return; }
    var qty = parseInt(qtyInput.value, 10) || 1;
    if (elTotal) elTotal.textContent = sym + (qty * unitPrice);
  }

  // 初始化默认值
  var defaultP = getProductCfg();
  unitPrice = defaultP.price || 0;
  updateProductUI();

  // -- 从 Supabase 读取最新价格和库存 --
  async function loadProductInfo() {
    if (!sb) { console.warn('[DIAG] sb 为 null，跳过加载'); return; }
    try {
      console.log('[DIAG] 正在调用 get_product_info...');
      var result = await sb.rpc('get_product_info');
      console.log('[DIAG] RPC 返回:', result);
      if (result.error) { console.error('[DIAG] RPC 错误:', result.error); return; }
      var data = result.data || [];
      console.log('[DIAG] RPC data:', JSON.stringify(data));
      var dbPrices = {};
      var dbStocks = {};
      data.forEach(function (row) {
        if (row.key === 'card_price') dbPrices.card = Number(row.value);
        if (row.key === 'card_stock') dbStocks.card = Number(row.value) || 0;
        if (row.key === 'recharge_price') dbPrices.recharge = Number(row.value);
        if (row.key === 'recharge_stock') dbStocks.recharge = Number(row.value) || 0;
      });
      console.log('[DIAG] dbPrices:', dbPrices);
      console.log('[DIAG] dbStocks:', dbStocks);
      // 写入全局缓存
      window._dbPrices = dbPrices;
      window._dbStocks = dbStocks;
      applyCurrentProduct();
      console.log('[DIAG] 应用后 unitPrice:', unitPrice, 'maxQty:', maxQty);
    } catch (e) {
      console.warn('[Order] 加载产品信息失败，使用默认配置:', e);
      console.error('[DIAG] catch 捕获异常:', e);
    }
  }

  function applyCurrentProduct() {
    var dbPrices = window._dbPrices || {};
    var dbStocks = window._dbStocks || {};
    var fallback = getProductCfg();
    unitPrice = dbPrices[currentProduct] || fallback.price || 0;

    // 库存语义：-1=无限, 0=售罄, >0=有限, undefined=DB未加载→暂按无限处理
    var hasStock = (currentProduct in dbStocks);
    var stock = hasStock ? dbStocks[currentProduct] : -1;
    var isSoldOut = (stock === 0);
    var isUnlimited = (stock === -1);

    if (qtyInput) {
      if (isSoldOut) {
        maxQty = 0;
        qtyInput.max = 0;
        qtyInput.value = 0;
      } else {
        maxQty = isUnlimited ? 99 : Math.min(stock, 99);
        qtyInput.max = maxQty;
        if (parseInt(qtyInput.value, 10) < 1) qtyInput.value = 1;
        if (parseInt(qtyInput.value, 10) > maxQty) qtyInput.value = maxQty;
      }
    }

    updateProductUI();
    updateSoldOutUI(isSoldOut);
  }
  loadProductInfo();

  // -- 更新售罄状态UI --
  function updateSoldOutUI(isSoldOut) {
    if (soldOutTag) soldOutTag.style.display = isSoldOut ? 'inline-block' : 'none';
    if (btnMinus) btnMinus.disabled = isSoldOut;
    if (btnPlus) btnPlus.disabled = isSoldOut;
    if (submitBtn) {
      submitBtn.disabled = isSoldOut;
      submitBtn.textContent = isSoldOut ? '已售罄' : '提交订单';
      submitBtn.style.opacity = isSoldOut ? '0.4' : '';
      submitBtn.style.cursor = isSoldOut ? 'not-allowed' : '';
    }
  }

  // -- 填充客服信息 --
  var elCsDesc = document.getElementById('cs-desc');
  var elCsWechat = document.getElementById('cs-wechat');
  if (elCsDesc) elCsDesc.textContent = cs.description || '如有疑问请联系客服';
  if (elCsWechat && cs.wechat && cs.wechat !== 'YOUR_WECHAT_ID') {
    elCsWechat.textContent = '微信: ' + cs.wechat;
  }

  // -- 数量控制（事件绑定）--
  if (btnMinus) btnMinus.addEventListener('click', function () {
    if (!qtyInput) return;
    var v = parseInt(qtyInput.value, 10) || 1;
    if (v > 1) { qtyInput.value = v - 1; updateTotal(); }
  });
  if (btnPlus) btnPlus.addEventListener('click', function () {
    if (!qtyInput) return;
    var v = parseInt(qtyInput.value, 10) || 1;
    if (v < maxQty) { qtyInput.value = v + 1; updateTotal(); }
  });

  // -- 表单提交 --

  function showError(msg) {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.style.display = 'block';
    }
  }
  function hideError() {
    if (errorBox) errorBox.style.display = 'none';
  }

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError();

      // 检查 Supabase 是否可用
      if (!sb) {
        showError('系统未就绪，请联系客服手动下单。');
        return;
      }
      // 售罄检查
      if (maxQty <= 0) {
        showError('该商品已售罄，无法下单。');
        return;
      }

      var formData = new FormData(form);
      var qty = parseInt(qtyInput.value, 10) || 1;
      var customerName = (formData.get('customer_name') || '').trim();
      var customerPhone = (formData.get('customer_phone') || '').trim();
      var shippingAddress = (formData.get('shipping_address') || '').trim();
      var customerEmail = (formData.get('customer_email') || '').trim();

      // 基础验证
      if (!customerName || !customerPhone || !shippingAddress) {
        showError('请填写必填项（姓名、手机号、收货地址）。');
        return;
      }

      // 禁用按钮
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '提交中…';
      }

      try {
        // 通过 RPC create_order 下单（SECURITY DEFINER 绕过 RLS）
        // 避免直接 INSERT 后 SELECT 被 RLS 阻止的问题
        var result = await sb.rpc('create_order', {
          p_quantity: qty,
          p_unit_price: unitPrice,
          p_total_price: qty * unitPrice,
          p_customer_name: customerName,
          p_customer_phone: customerPhone,
          p_customer_email: customerEmail || '',
          p_shipping_address: shippingAddress,
          p_product_type: currentProduct
        });

        if (result.error) throw result.error;

        // RPC 返回数组 [{ order_number, tracking_code }]
        var orderResult = (result.data && result.data[0]) || null;
        if (!orderResult || !orderResult.order_number) {
          throw new Error('订单创建成功但未返回订单号，请联系客服。');
        }

        // 显示成功信息
        var elON = document.querySelector('[data-order-number]');
        var elTC = document.querySelector('[data-tracking-code]');
        if (elON) elON.textContent = orderResult.order_number;
        if (elTC) elTC.textContent = orderResult.tracking_code;

        // 保存当前订单信息，供"我已支付"按钮使用
        currentOrder.orderNumber = orderResult.order_number;
        currentOrder.trackingCode = orderResult.tracking_code;
        currentOrder.totalPrice = qty * unitPrice;

        // 显示应付金额
        if (payAmountEl) payAmountEl.textContent = sym + currentOrder.totalPrice;

        // 切换视图
        if (formArea) formArea.style.display = 'none';
        var secondSection = formArea.nextElementSibling;
        if (secondSection) secondSection.style.display = 'none';
        if (successBox) successBox.style.display = 'block';
        if (successBox) successBox.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        console.error('[Order] 提交失败:', err);
        showError('订单提交失败：' + (err.message || '未知错误') + '。请重试或联系客服。');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '提交订单';
        }
      }
    });
  }

  // -- "我已完成支付"按钮：调用 user_mark_paid RPC --
  if (markPaidBtn) {
    markPaidBtn.addEventListener('click', async function () {
      if (!sb) {
        alert('系统未就绪，请联系客服。');
        return;
      }
      if (!currentOrder.orderNumber || !currentOrder.trackingCode) {
        alert('订单信息缺失，请刷新页面重试或联系客服。');
        return;
      }

      markPaidBtn.disabled = true;
      markPaidBtn.textContent = '提交中…';

      try {
        var result = await sb.rpc('user_mark_paid', {
          p_order_number: currentOrder.orderNumber,
          p_tracking_code: currentOrder.trackingCode
        });

        if (result.error) throw result.error;

        // 成功：显示确认提示，隐藏按钮
        if (payDoneEl) payDoneEl.classList.add('show');
        markPaidBtn.style.display = 'none';
      } catch (err) {
        console.error('[Order] 标记支付失败:', err);
        alert('提交失败：' + (err.message || '未知错误') + '\n请确认已扫码支付，或联系客服。');
        markPaidBtn.disabled = false;
        markPaidBtn.textContent = '我已完成支付';
      }
    });
  }
})();
