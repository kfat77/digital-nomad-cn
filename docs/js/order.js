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

  // -- DOM 元素 --
  var elName = document.getElementById('product-name');
  var elDesc = document.getElementById('product-desc');
  var elPrice = document.getElementById('product-price');
  var elTotal = document.getElementById('total-price');
  var soldOutTag = document.getElementById('sold-out-tag');

  // -- 产品套餐数据 --
  function getProductCfg() {
    return products[currentProduct] || products.card || {};
  }

  // -- 产品类型切换 --
  var ptSelector = document.getElementById('product-type-selector');
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

  // 初始化默认值
  var defaultP = getProductCfg();
  unitPrice = defaultP.price || 0;
  updateProductUI();

  // -- 从 Supabase 读取最新价格和库存 --
  async function loadProductInfo() {
    if (!sb) return;
    try {
      var result = await sb.rpc('get_product_info');
      if (result.error) return;
      var data = result.data || [];
      var dbPrices = {};
      var dbStocks = {};
      data.forEach(function (row) {
        if (row.key === 'card_price') dbPrices.card = Number(row.value);
        if (row.key === 'card_stock') dbStocks.card = Number(row.value) || 0;
        if (row.key === 'recharge_price') dbPrices.recharge = Number(row.value);
        if (row.key === 'recharge_stock') dbStocks.recharge = Number(row.value) || 0;
      });
      // 写入全局缓存
      window._dbPrices = dbPrices;
      window._dbStocks = dbStocks;
      applyCurrentProduct();
    } catch (e) {
      console.warn('[Order] 加载产品信息失败，使用默认配置:', e);
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

  // -- 数量控制 --
  var qtyInput = document.querySelector('[data-qty-input]');
  var btnMinus = document.querySelector('[data-qty-minus]');
  var btnPlus = document.querySelector('[data-qty-plus]');

  function updateTotal() {
    var qty = parseInt(qtyInput.value, 10) || 1;
    if (elTotal) elTotal.textContent = sym + (qty * unitPrice);
  }

  if (btnMinus) btnMinus.addEventListener('click', function () {
    var v = parseInt(qtyInput.value, 10) || 1;
    if (v > 1) { qtyInput.value = v - 1; updateTotal(); }
  });
  if (btnPlus) btnPlus.addEventListener('click', function () {
    var v = parseInt(qtyInput.value, 10) || 1;
    if (v < maxQty) { qtyInput.value = v + 1; updateTotal(); }
  });

  // -- 表单提交 --
  var form = document.querySelector('[data-order-form]');
  var errorBox = document.querySelector('[data-order-error]');
  var submitBtn = document.querySelector('[data-submit-btn]');
  var successBox = document.querySelector('[data-order-success]');
  var formArea = document.getElementById('order-form-area');

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
})();
