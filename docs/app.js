// 数字游民指南 — 复刻 tikhub.io 风格交互脚本

document.addEventListener('DOMContentLoaded', function() {

    // ===== 数字计数动画 =====
    const statNumbers = document.querySelectorAll('.stat-num[data-count]');

    const countUp = (element, target, duration = 2000) => {
        const start = 0;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (target - start) * easeProgress);
            element.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(update);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.count);
                countUp(entry.target, target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => statsObserver.observe(num));

    // ===== 导航栏滚动效果 =====
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            header.style.borderColor = 'rgba(0,0,0,0.08)';
        } else {
            header.style.borderColor = 'rgba(0,0,0,0.04)';
        }
        lastScroll = currentScroll;
    });

    // ===== 平滑滚动到锚点 =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // ===== 模块卡片渐入动画 =====
    const cards = document.querySelectorAll('.module-card');
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 80);
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        cardObserver.observe(card);
    });

    // ===== 快速导航项动画 =====
    const quickItems = document.querySelectorAll('.quicknav-item');
    const quickObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 40);
                quickObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    quickItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(12px)';
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        quickObserver.observe(item);
    });

    // ===== 特色区块动画 =====
    const featureBlocks = document.querySelectorAll('.feature-block');
    const featureObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                featureObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    featureBlocks.forEach(block => {
        block.style.opacity = '0';
        block.style.transform = 'translateY(24px)';
        block.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        featureObserver.observe(block);
    });

    // ===== 代码标签切换 =====
    const codeTabs = document.querySelectorAll('.code-header span');
    const codeBlock = document.querySelector('.code-block');

    const codeSnippets = {
        '香港开户流程': `<span class="c-comment"># 一天搞定香港四卡 — 数字游民基础架构</span>
<span class="c-variable">schedule</span> = {
    <span class="c-string">"上午"</span>: <span class="c-string">"中银香港线下开户（预约+地址证明）"</span>,
    <span class="c-string">"中午"</span>: <span class="c-string">"汇丰 App 线上开户（10分钟，连香港WiFi）"</span>,
    <span class="c-string">"下午"</span>: <span class="c-string">"众安 + 蚂蚁虚拟银行（各5分钟，纯线上）"</span>,
    <span class="c-string">"顺路"</span>: <span class="c-string">"711 买 Club SIM（6港币/年保号）"</span>,
    <span class="c-string">"最后"</span>: <span class="c-string">"香港IP注册 Gmail（100%成功）"</span>
}

<span class="c-comment"># 需要的材料</span>
<span class="c-variable">materials</span> = [<span class="c-string">"身份证"</span>, <span class="c-string">"港澳通行证"</span>, <span class="c-string">"入境小白条"</span>, 
              <span class="c-string">"地址证明"</span>, <span class="c-string">"投资证明"</span>, <span class="c-string">"1000-2000 HKD现金"</span>]

<span class="c-function">print</span>(<span class="c-string">f"推荐组合：汇丰 + 中银 + 众安 + 蚂蚁"</span>)
<span class="c-function">print</span>(<span class="c-string">f"总耗时：约 4-6 小时 | 总费用：0 元（仅需交通和生活成本）"</span>)`,

        '券商入金路径': `<span class="c-comment"># 最佳入金路径 — 低成本 + 高效率</span>
<span class="c-variable">path</span> = {
    <span class="c-string">"最佳"</span>: [<span class="c-string">"大陆购汇"</span>, <span class="c-string">"→"</span>, <span class="c-string">"香港银行"</span>, <span class="c-string">"→"</span>, <span class="c-string">"美股券商"</span>],
    <span class="c-string">"替代"</span>: [<span class="c-string">"Wise"</span>, <span class="c-string">"→"</span>, <span class="c-string">"ACH转账"</span>, <span class="c-string">"→"</span>, <span class="c-string">"盈透/嘉信"</span>]
}

<span class="c-comment"># 各路径成本对比</span>
<span class="c-variable">costs</span> = {
    <span class="c-string">"港卡→盈透"</span>: <span class="c-string">"$0-5 / 1-2天"</span>,
    <span class="c-string">"Wise→嘉信"</span>: <span class="c-string">"$0-2 / 1-2天"</span>,
    <span class="c-string">"大陆电汇"</span>: <span class="c-string">"$20-50 / 3-5天"</span>
}

<span class="c-function">print</span>(<span class="c-string">f"推荐：先开香港银行卡，再连接券商，最稳最低成本"</span>)`,

        '身份规划决策': `<span class="c-comment"># 按预算选择身份路径</span>
<span class="c-keyword">def</span> <span class="c-function">choose_path</span>(budget, timeline, goal):
    <span class="c-keyword">if</span> budget == <span class="c-string">"几乎零成本"</span>:
        <span class="c-keyword">return</span> [<span class="c-string">"加拿大 EE"</span>, <span class="c-string">"新西兰技术移民"</span>]
    <span class="c-keyword">elif</span> budget == <span class="c-string">"低成本"</span>:
        <span class="c-keyword">return</span> [<span class="c-string">"香港高才通"</span>, <span class="c-string">"西班牙非盈利"</span>]
    <span class="c-keyword">elif</span> budget == <span class="c-string">"中等成本"</span>:
        <span class="c-keyword">return</span> [<span class="c-string">"葡萄牙 D7"</span>, <span class="c-string">"马来西亚 MM2H"</span>]
    <span class="c-keyword">elif</span> budget == <span class="c-string">"高成本"</span>:
        <span class="c-keyword">return</span> [<span class="c-string">"韩国存款移民"</span>, <span class="c-string">"新加坡 GIP"</span>]

<span class="c-comment"># 核心建议</span>
<span class="c-function">print</span>(<span class="c-string">f"选对国家 + 拿绿卡不入籍 = 双重福利 + 出入境便利"</span>)
<span class="c-function">print</span>(<span class="c-string">f"大多数数字游民的第一站：香港身份 或 日本身份"</span>)`
    };

    codeTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            codeTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const label = this.textContent.trim();
            if (codeBlock && codeSnippets[label]) {
                codeBlock.innerHTML = codeSnippets[label];
            }
        });
    });

    console.log('🌍 数字游民指南 — tikhub.io 风格已加载');
});
