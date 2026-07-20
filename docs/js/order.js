/**
 * 下单页逻辑 · order.js
 * 依赖：config.js, supabase-client.js
 */
(function () {
  'use strict';

  var cfg = window.SITE_CONFIG || {};
  var product = cfg.PRODUCT || {};
  var cs = cfg.CUSTOMER_SERVICE || {};
  var sb = window.sb;

  // -- 填充商品信息 --
  var elName = document.getElementById('product-name');
  var elDesc = document.getElementById('product-desc');
  var elPrice = document.getElementById('product-price');
  var elTotal = document.getElementById('total-price');
  var sym = product.currencySymbol || '¥';
  var unitPrice = product.price || 0;

  if (elName) elName.textContent = product.name || 'giffgaff 电话卡';
  if (elDesc) elDesc.textContent = product.description || '';
  if (elPrice) elPrice.textContent = sym + unitPrice;

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
    if (v < 10) { qtyInput.value = v + 1; updateTotal(); }
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
          p_shipping_address: shippingAddress
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
