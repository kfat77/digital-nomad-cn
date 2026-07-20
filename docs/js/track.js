/**
 * 物流查询逻辑 · track.js
 * 依赖：config.js, supabase-client.js
 */
(function () {
  'use strict';

  var sb = window.sb;
  var cs = (window.SITE_CONFIG || {}).CUSTOMER_SERVICE || {};
  var statusMap = (window.SITE_CONFIG || {}).ORDER_STATUS || {};

  // -- 填充客服信息 --
  var elCsDesc = document.getElementById('cs-desc');
  var elCsWechat = document.getElementById('cs-wechat');
  if (elCsDesc) elCsDesc.textContent = cs.description || '如有疑问请联系客服';
  if (elCsWechat && cs.wechat && cs.wechat !== 'YOUR_WECHAT_ID') {
    elCsWechat.textContent = '微信: ' + cs.wechat;
  }

  // -- 元素引用 --
  var inputOrder = document.getElementById('track-order-number');
  var inputCode = document.getElementById('track-code');
  var trackBtn = document.getElementById('track-btn');
  var errorBox = document.getElementById('track-error');
  var resultBox = document.getElementById('track-result');
  var resultCard = document.getElementById('result-card');

  function showError(msg) {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.style.display = 'block';
    }
    resultBox.style.display = 'none';
  }
  function hideError() {
    if (errorBox) errorBox.style.display = 'none';
  }

  // -- 工具函数 --
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  // -- 查询 --
  if (trackBtn) {
    trackBtn.addEventListener('click', async function () {
      hideError();

      if (!sb) {
        showError('系统未就绪，请联系客服查询。');
        return;
      }

      var orderNumber = (inputOrder.value || '').trim();
      var trackingCode = (inputCode.value || '').trim().toUpperCase();

      if (!orderNumber || !trackingCode) {
        showError('请输入订单号和查询码。');
        return;
      }

      trackBtn.disabled = true;
      trackBtn.textContent = '查询中…';

      try {
        var result = await sb.rpc('query_order', {
          p_order_number: orderNumber,
          p_tracking_code: trackingCode
        });

        if (result.error) throw result.error;

        var data = result.data;
        if (!data || data.length === 0) {
          showError('未找到匹配的订单，请检查订单号与查询码是否正确。');
          trackBtn.disabled = false;
          trackBtn.textContent = '查询';
          return;
        }

        var order = data[0];
        renderResult(order);
      } catch (err) {
        console.error('[Track] 查询失败:', err);
        showError('查询失败：' + (err.message || '未知错误') + '。请重试或联系客服。');
      }

      trackBtn.disabled = false;
      trackBtn.textContent = '查询';
    });
  }

  // -- 渲染结果 --
  function renderResult(order) {
    var statusLabel = statusMap[order.status] || order.status;
    var html = '';

    // 状态
    html += '<div class="result-status">';
    html += '<span class="status-badge s-' + order.status + '">' + statusLabel + '</span>';
    html += '</div>';

    // 详情行
    html += '<div class="result-row"><label>订单号</label><p>' + escapeHtml(order.order_number) + '</p></div>';
    html += '<div class="result-row"><label>数量</label><p>' + escapeHtml(order.quantity) + ' 张</p></div>';
    html += '<div class="result-row"><label>总价</label><p>¥' + escapeHtml(order.total_price) + '</p></div>';

    if (order.courier_company) {
      html += '<div class="result-row"><label>快递公司</label><p>' + escapeHtml(order.courier_company) + '</p></div>';
    }
    if (order.tracking_number) {
      html += '<div class="result-row"><label>物流单号</label><p class="copyable" data-copy="' + escapeHtml(order.tracking_number) + '">' + escapeHtml(order.tracking_number) + ' (点击复制)</p></div>';
    }

    html += '<div class="result-row"><label>下单时间</label><p>' + fmtTime(order.created_at) + '</p></div>';
    html += '<div class="result-row"><label>更新时间</label><p>' + fmtTime(order.updated_at) + '</p></div>';

    // 状态提示
    if (order.status === 'pending') {
      html += '<div style="margin-top:20px;padding:14px 16px;border-radius:12px;background:var(--mint);color:#085041;font-size:13px">订单已提交，等待商家确认。</div>';
    } else if (order.status === 'confirmed') {
      html += '<div style="margin-top:20px;padding:14px 16px;border-radius:12px;background:var(--blue);color:#0c447c;font-size:13px">订单已确认，正在准备发货。</div>';
    } else if (order.status === 'shipped') {
      html += '<div style="margin-top:20px;padding:14px 16px;border-radius:12px;background:#e9f8dd;color:#085041;font-size:13px">已发货，请留意快递动态。</div>';
    } else if (order.status === 'completed') {
      html += '<div style="margin-top:20px;padding:14px 16px;border-radius:12px;background:#dff6d0;color:#234b13;font-size:13px">订单已完成，感谢您的购买。</div>';
    } else if (order.status === 'cancelled') {
      html += '<div style="margin-top:20px;padding:14px 16px;border-radius:12px;background:#f1efe8;color:#5f5e5a;font-size:13px">订单已取消。如有疑问请联系客服。</div>';
    }

    resultCard.innerHTML = html;
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth' });

    // 绑定复制
    var copyable = resultCard.querySelector('[data-copy]');
    if (copyable) {
      copyable.addEventListener('click', function () {
        var text = this.getAttribute('data-copy');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            var orig = copyable.innerHTML;
            copyable.innerHTML = escapeHtml(text) + ' (已复制)';
            setTimeout(function () { copyable.innerHTML = orig; }, 1500);
          });
        }
      });
    }
  }

  // -- 回车查询 --
  if (inputCode) {
    inputCode.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') trackBtn.click();
    });
  }
  if (inputOrder) {
    inputOrder.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') trackBtn.click();
    });
  }
})();
