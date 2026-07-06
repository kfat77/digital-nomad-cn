// 数字游民指南 — 3D 交互地球 + 签证官网直达
// Three.js Earth with country markers, modal info, and official visa links

document.addEventListener('DOMContentLoaded', function() {

    // ===== 1. 数字计数动画 =====
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

    // ===== 2. 导航栏滚动效果 =====
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

    // ===== 3. 平滑滚动到锚点 =====
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

    // ===== 4. 模块卡片渐入动画 =====
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

    // ===== 5. 快速导航项动画 =====
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

    // ===== 6. 特色区块动画 =====
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

    // ===== 7. 代码标签切换 =====
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

    // ===== 8. Three.js 3D 交互地球 =====
    initGlobe();

    // ===== 9. 签证官网链接生成 =====
    generateVisaLinks();

    // ===== 10. 国家信息弹窗 =====
    initCountryModal();

    console.log('🌍 数字游民指南 — 3D 交互地球已加载');
});


// ============================================
// Three.js 3D 地球
// ============================================

function initGlobe() {
    const wrapper = document.getElementById('globe-canvas-wrapper');
    if (!wrapper || typeof THREE === 'undefined') {
        console.warn('Three.js 或地球容器未找到');
        return;
    }

    const rect = wrapper.getBoundingClientRect();
    const width = rect.width || 900;
    const height = rect.height || 900;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfafafa);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.8;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    wrapper.appendChild(renderer.domElement);

    // Earth group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const earthRadius = 1;

    // 1. Wireframe sphere
    const wireGeo = new THREE.IcosahedronGeometry(earthRadius, 3);
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0xd0d5dd,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    earthGroup.add(wireMesh);

    // 2. Inner solid sphere
    const innerGeo = new THREE.SphereGeometry(earthRadius * 0.98, 64, 64);
    const innerMat = new THREE.MeshBasicMaterial({
        color: 0xf5f7fa,
        transparent: true,
        opacity: 0.5
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    earthGroup.add(innerMesh);

    // 3. Outer glow ring
    const ringGeo = new THREE.TorusGeometry(earthRadius * 1.15, 0.008, 16, 128);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x2563eb,
        transparent: true,
        opacity: 0.2
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    earthGroup.add(ringMesh);

    // Country meshes storage
    const countryMeshes = {};
    const countryMeshList = [];
    let geoLoaded = false;

    // Load world-geo.json and create country meshes
    fetch('world-geo.json')
        .then(r => r.json())
        .then(geoData => {
            Object.entries(geoData).forEach(([key, data]) => {
                const countryColor = (window.COUNTRY_DATA && window.COUNTRY_DATA[key] && window.COUNTRY_DATA[key].color) || 0x2563eb;
                const colorObj = new THREE.Color(countryColor);

                // Create triangle mesh (fill)
                if (data.triangles && data.triangles.length > 0) {
                    const triGeo = new THREE.BufferGeometry();
                    const positions = new Float32Array(data.triangles);
                    triGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

                    const triMat = new THREE.MeshBasicMaterial({
                        color: colorObj,
                        transparent: true,
                        opacity: 0.1,
                        side: THREE.DoubleSide,
                        depthWrite: false
                    });

                    const triMesh = new THREE.Mesh(triGeo, triMat);
                    triMesh.userData = { country: key, type: 'fill', originalOpacity: 0.1, originalColor: colorObj.clone() };
                    earthGroup.add(triMesh);
                    countryMeshList.push(triMesh);

                    if (!countryMeshes[key]) countryMeshes[key] = {};
                    countryMeshes[key].mesh = triMesh;
                }

                // Create line mesh (outline)
                if (data.lines && data.lines.length > 0) {
                    const lineGeo = new THREE.BufferGeometry();
                    const positions = new Float32Array(data.lines);
                    lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

                    const lineMat = new THREE.LineBasicMaterial({
                        color: 0x8899aa,
                        transparent: true,
                        opacity: 0.4
                    });

                    const lineMesh = new THREE.Line(lineGeo, lineMat);
                    lineMesh.userData = { country: key, type: 'outline' };
                    earthGroup.add(lineMesh);

                    if (!countryMeshes[key]) countryMeshes[key] = {};
                    countryMeshes[key].lines = lineMesh;
                }
            });
            geoLoaded = true;
        })
        .catch(err => {
            console.warn('Failed to load world-geo.json:', err);
        });

    // Also create markers from COUNTRY_DATA
    const markers = [];
    const markerGroup = new THREE.Group();
    earthGroup.add(markerGroup);

    const countryData = window.COUNTRY_DATA || {};
    const markerMap = {};

    Object.entries(countryData).forEach(([key, country]) => {
        const pos = latLonToVector3(country.lat, country.lon, earthRadius * 1.02);

        const dotGeo = new THREE.SphereGeometry(0.018, 16, 16);
        const dotMat = new THREE.MeshBasicMaterial({
            color: country.color || 0x2563eb,
            transparent: true,
            opacity: 0.6
        });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(pos);
        dot.userData = { country: key, data: country, originalScale: 1 };
        markerGroup.add(dot);
        markers.push(dot);
        markerMap[key] = dot;

        const glowGeo = new THREE.RingGeometry(0.025, 0.035, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: country.color || 0x2563eb,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.copy(pos.clone().multiplyScalar(1.001));
        glow.lookAt(new THREE.Vector3(0, 0, 0));
        markerGroup.add(glow);
        dot.userData.glow = glow;
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-10, -10);
    let hoveredCountry = null;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let autoRotate = true;
    const rotationSpeed = 0.001;

    wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        if (isDragging) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            earthGroup.rotation.y += deltaX * 0.005;
            earthGroup.rotation.x += deltaY * 0.005;
            earthGroup.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, earthGroup.rotation.x));
            autoRotate = false;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });

    wrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    wrapper.addEventListener('mouseup', () => { isDragging = false; });
    wrapper.addEventListener('mouseleave', () => {
        isDragging = false;
        mouse.x = -10; mouse.y = -10;
    });

    // Click to navigate
    wrapper.addEventListener('click', (e) => {
        if (!isDragging) {
            const rect = wrapper.getBoundingClientRect();
            const clickMouse = new THREE.Vector2(
                ((e.clientX - rect.left) / rect.width) * 2 - 1,
                -((e.clientY - rect.top) / rect.height) * 2 + 1
            );
            raycaster.setFromCamera(clickMouse, camera);

            // Check country meshes first
            if (geoLoaded && countryMeshList.length > 0) {
                const meshIntersects = raycaster.intersectObjects(countryMeshList);
                if (meshIntersects.length > 0) {
                    const countryKey = meshIntersects[0].object.userData.country;
                    if (countryKey) {
                        window.location.href = 'country/' + countryKey + '/';
                        return;
                    }
                }
            }

            // Fallback to markers
            const markerIntersects = raycaster.intersectObjects(markers);
            if (markerIntersects.length > 0) {
                const marker = markerIntersects[0].object;
                if (marker.userData && marker.userData.country) {
                    window.location.href = 'country/' + marker.userData.country + '/';
                }
            }
        }
    });

    // Touch support
    wrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length === 1) {
            const deltaX = e.touches[0].clientX - previousMousePosition.x;
            const deltaY = e.touches[0].clientY - previousMousePosition.y;
            earthGroup.rotation.y += deltaX * 0.005;
            earthGroup.rotation.x += deltaY * 0.005;
            autoRotate = false;
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }, { passive: true });

    wrapper.addEventListener('touchend', () => { isDragging = false; });

    // Tooltip
    const tooltip = document.getElementById('globeTooltip');

    function resetHighlight(key) {
        if (!key) return;
        const prev = countryMeshes[key];
        if (prev) {
            if (prev.mesh) {
                prev.mesh.material.opacity = prev.mesh.userData.originalOpacity;
                prev.mesh.material.color.copy(prev.mesh.userData.originalColor);
            }
            if (prev.lines) {
                prev.lines.material.color.setHex(0x8899aa);
                prev.lines.material.opacity = 0.4;
            }
        }
        const prevMarker = markerMap[key];
        if (prevMarker) {
            prevMarker.scale.setScalar(1);
            prevMarker.material.opacity = 0.6;
            if (prevMarker.userData.glow) {
                prevMarker.userData.glow.scale.setScalar(1);
                prevMarker.userData.glow.material.opacity = 0.25;
            }
        }
        const prevItem = document.querySelector('.globe-sidebar-item[data-country="' + key + '"]');
        if (prevItem) prevItem.classList.remove('active');
    }

    function setHighlight(key) {
        if (!key) return;
        const curr = countryMeshes[key];
        if (curr) {
            if (curr.mesh) {
                curr.mesh.material.opacity = 0.5;
                curr.mesh.material.color.setHex(0x3b82f6);
            }
            if (curr.lines) {
                curr.lines.material.color.setHex(0xffffff);
                curr.lines.material.opacity = 0.9;
            }
        }
        const marker = markerMap[key];
        if (marker) {
            marker.scale.setScalar(2.0);
            marker.material.opacity = 1;
            if (marker.userData.glow) {
                marker.userData.glow.scale.setScalar(1.8);
                marker.userData.glow.material.opacity = 0.7;
            }
        }
        wrapper.style.cursor = 'pointer';
        const countryInfo = window.COUNTRY_DATA && window.COUNTRY_DATA[key];
        if (tooltip && countryInfo) {
            tooltip.textContent = countryInfo.name + ' (' + countryInfo.nameEn + ')';
            tooltip.classList.add('visible');
        }
        const item = document.querySelector('.globe-sidebar-item[data-country="' + key + '"]');
        if (item) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Animation loop
    let frameId;
    function animate() {
        frameId = requestAnimationFrame(animate);

        if (autoRotate && !isDragging) {
            earthGroup.rotation.y += rotationSpeed;
        }

        // Hover detection - country meshes first
        let foundHover = false;
        if (geoLoaded && countryMeshList.length > 0) {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(countryMeshList);
            if (intersects.length > 0) {
                const hitMesh = intersects[0].object;
                const countryKey = hitMesh.userData.country;
                if (countryKey && hoveredCountry !== countryKey) {
                    resetHighlight(hoveredCountry);
                    hoveredCountry = countryKey;
                    setHighlight(countryKey);
                }
                foundHover = true;
                if (tooltip && !isDragging) {
                    const wrapperRect = wrapper.getBoundingClientRect();
                    const hitPos = hitMesh.position.clone();
                    hitPos.applyMatrix4(earthGroup.matrixWorld);
                    hitPos.project(camera);
                    const x = (hitPos.x * 0.5 + 0.5) * wrapperRect.width;
                    const y = (-hitPos.y * 0.5 + 0.5) * wrapperRect.height;
                    tooltip.style.left = x + 'px';
                    tooltip.style.top = (y - 12) + 'px';
                }
            }
        }

        // Fallback to markers
        if (!foundHover) {
            raycaster.setFromCamera(mouse, camera);
            const markerIntersects = raycaster.intersectObjects(markers);
            if (markerIntersects.length > 0) {
                const marker = markerIntersects[0].object;
                const countryKey = marker.userData.country;
                if (countryKey && hoveredCountry !== countryKey) {
                    resetHighlight(hoveredCountry);
                    hoveredCountry = countryKey;
                    setHighlight(countryKey);
                }
                foundHover = true;
                if (tooltip && !isDragging) {
                    const wrapperRect = wrapper.getBoundingClientRect();
                    const markerPos = marker.position.clone();
                    markerPos.applyMatrix4(earthGroup.matrixWorld);
                    markerPos.project(camera);
                    const x = (markerPos.x * 0.5 + 0.5) * wrapperRect.width;
                    const y = (-markerPos.y * 0.5 + 0.5) * wrapperRect.height;
                    tooltip.style.left = x + 'px';
                    tooltip.style.top = (y - 12) + 'px';
                }
            }
        }

        if (!foundHover && hoveredCountry) {
            resetHighlight(hoveredCountry);
            hoveredCountry = null;
            wrapper.style.cursor = 'grab';
            if (tooltip) tooltip.classList.remove('visible');
        }

        // Gentle pulse for markers
        const time = Date.now() * 0.001;
        markers.forEach((m, i) => {
            if (m !== markerMap[hoveredCountry] && m.userData.glow) {
                const pulse = Math.sin(time * 2 + i) * 0.1 + 0.25;
                m.userData.glow.material.opacity = pulse;
            }
        });

        ringMesh.rotation.z += 0.0005;
        renderer.render(scene, camera);
    }

    animate();

    generateGlobeSidebar(markerMap, countryData);

    // Resize handler
    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const w = entry.contentRect.width;
            const h = entry.contentRect.height;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
    });
    resizeObserver.observe(wrapper);

    // IntersectionObserver for performance
    const globeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!frameId) animate();
            } else {
                if (frameId) {
                    cancelAnimationFrame(frameId);
                    frameId = null;
                }
            }
        });
    }, { threshold: 0.1 });
    globeObserver.observe(wrapper);
}

// ============================================
// 地球侧边国家列表
// ============================================

function generateGlobeSidebar(markerMap, countryData) {
    const sidebar = document.getElementById('globeSidebar');
    if (!sidebar) return;

    const flagEmoji = {
        'Hong Kong': '🇭🇰', 'Macao': '🇲🇴', 'Singapore': '🇸🇬', 'Japan': '🇯🇵',
        'South Korea': '🇰🇷', 'Australia': '🇦🇺', 'New Zealand': '🇳🇿',
        'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'Portugal': '🇵🇹',
        'Spain': '🇪🇸', 'Estonia': '🇪🇪', 'Malaysia': '🇲🇾', 'Thailand': '🇹🇭',
        'Vietnam': '🇻🇳', 'Canada': '🇨🇦', 'Schengen Area': '🇪🇺'
    };

    // Sort countries by region: Asia -> Oceania -> Americas -> Europe
    const regionOrder = ['hongkong', 'macao', 'singapore', 'japan', 'southkorea', 'thailand', 'vietnam', 'malaysia', 'australia', 'newzealand', 'usa', 'canada', 'uk', 'schengen', 'portugal', 'spain', 'estonia'];
    const sortedEntries = regionOrder
        .map(key => [key, countryData[key]])
        .filter(([, c]) => c);

    // Group by region
    const groups = {
        '亚洲': [],
        '大洋洲': [],
        '美洲': [],
        '欧洲': []
    };

    const regionMap = {
        hongkong: '亚洲', macao: '亚洲', singapore: '亚洲', japan: '亚洲', southkorea: '亚洲',
        thailand: '亚洲', vietnam: '亚洲', malaysia: '亚洲',
        australia: '大洋洲', newzealand: '大洋洲',
        usa: '美洲', canada: '美洲',
        uk: '欧洲', schengen: '欧洲', portugal: '欧洲', spain: '欧洲', estonia: '欧洲'
    };

    sortedEntries.forEach(([key, country]) => {
        const region = regionMap[key] || '其他';
        if (!groups[region]) groups[region] = [];
        groups[region].push({ key, country });
    });

    let html = '';
    Object.entries(groups).forEach(([regionName, items]) => {
        if (items.length === 0) return;
        html += `<div class="globe-sidebar-title">${regionName}</div>`;
        items.forEach(({ key, country }) => {
            const flag = flagEmoji[country.nameEn] || '🌐';
            const colorHex = '#' + (country.color || 0x2563eb).toString(16).padStart(6, '0');
            html += `
                <div class="globe-sidebar-item" data-country="${key}">
                    <span class="flag">${flag}</span>
                    <span class="name">${country.name}</span>
                    <span class="dot" style="background:${colorHex}"></span>
                </div>
            `;
        });
    });

    sidebar.innerHTML = html;

    // Bind click events
    sidebar.querySelectorAll('.globe-sidebar-item').forEach(item => {
        item.addEventListener('click', () => {
            const key = item.dataset.country;
            if (key) {
                window.location.href = 'country/' + key + '/';
            }
        });
        item.addEventListener('click', () => {
            const key = item.dataset.country;
            if (key) {
                window.location.href = `country/${key}.html`;
            }
        });
        item.addEventListener('mouseenter', () => {
            const key = item.dataset.country;
            const marker = markerMap[key];
            if (marker) {
                // Simulate hover on marker
                marker.scale.setScalar(2.0);
                marker.material.opacity = 1;
                if (marker.userData.glow) {
                    marker.userData.glow.scale.setScalar(1.8);
                    marker.userData.glow.material.opacity = 0.7;
                }
            }
        });
        item.addEventListener('mouseleave', () => {
            const key = item.dataset.country;
            const marker = markerMap[key];
            if (marker) {
                marker.scale.setScalar(1);
                marker.material.opacity = 0.85;
                if (marker.userData.glow) {
                    marker.userData.glow.scale.setScalar(1);
                    marker.userData.glow.material.opacity = 0.3;
                }
            }
        });
    });
}

// Convert lat/lon to 3D vector
function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
}


// ============================================
// 国家信息弹窗
// ============================================

function initCountryModal() {
    const modal = document.getElementById('countryModal');
    const backdrop = modal.querySelector('.country-modal-backdrop');
    const closeBtn = modal.querySelector('.country-modal-close');

    function close() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    backdrop.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            close();
        }
    });

    window.closeCountryModal = close;
}

function openCountryModal(data) {
    const modal = document.getElementById('countryModal');
    const flag = document.getElementById('modalFlag');
    const title = document.getElementById('modalTitle');
    const subtitle = document.getElementById('modalSubtitle');
    const body = document.getElementById('modalBody');

    flag.textContent = getFlagEmoji(data.nameEn);
    title.textContent = data.name;
    subtitle.textContent = data.nameEn;

    let html = '';
    const sections = data.info || {};

    const sectionIcons = {
        bank: '💳',
        phone: '📱',
        visa: '🛂',
        securities: '📈',
        identity: '🏛️',
        tools: '🛠️'
    };

    const sectionNames = {
        bank: '银行卡',
        phone: '电话卡',
        visa: '签证',
        securities: '证券账户',
        identity: '身份规划',
        tools: '数字工具'
    };

    Object.entries(sections).forEach(([key, section]) => {
        const icon = sectionIcons[key] || '📋';
        const name = section.title || sectionNames[key] || key;
        html += `<div class="country-info-section">
            <div class="country-info-section-title">${icon} ${name}</div>
            <ul class="country-info-list">`;

        section.items.forEach(item => {
            if (item.link) {
                html += `<li><a href="${item.link}" target="_blank">${item.text}</a></li>`;
            } else {
                html += `<li><span>${item.text}</span></li>`;
            }
        });

        html += `</ul></div>`;
    });

    body.innerHTML = html;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function getFlagEmoji(countryName) {
    const flags = {
        'Hong Kong': '🇭🇰',
        'Macao': '🇲🇴',
        'Singapore': '🇸🇬',
        'Japan': '🇯🇵',
        'South Korea': '🇰🇷',
        'Australia': '🇦🇺',
        'New Zealand': '🇳🇿',
        'United States': '🇺🇸',
        'United Kingdom': '🇬🇧',
        'Portugal': '🇵🇹',
        'Spain': '🇪🇸',
        'Estonia': '🇪🇪',
        'Malaysia': '🇲🇾',
        'Thailand': '🇹🇭',
        'Vietnam': '🇻🇳',
        'Canada': '🇨🇦',
        'Schengen Area': '🇪🇺'
    };
    return flags[countryName] || '🌐';
}


// ============================================
// 签证官网链接生成
// ============================================

function generateVisaLinks() {
    const grid = document.getElementById('visaOfficialGrid');
    if (!grid) return;

    const links = window.VISA_OFFICIAL_LINKS || {};

    Object.entries(links).forEach(([key, region]) => {
        const card = document.createElement('div');
        card.className = 'visa-official-card';

        let listHtml = '<ul class="visa-official-card-list">';
        region.countries.forEach(country => {
            listHtml += `
                <li>
                    <a href="${country.link}" target="_blank" rel="noopener">
                        <span class="flag">${country.flag}</span>
                        <span>${country.name}</span>
                        <span class="link-arrow">→</span>
                    </a>
                </li>
            `;
        });
        listHtml += '</ul>';

        card.innerHTML = `
            <div class="visa-official-card-title">${region.title}</div>
            ${listHtml}
        `;

        grid.appendChild(card);
    });
}


// ============================================
// Homepage v2 — Country Grid Filters & Tabs
// ============================================

function initCountryGridFilters() {
    const visaFilters = document.querySelectorAll('.visa-filter');
    const regionTabs = document.querySelectorAll('.region-tab');
    const countryCards = document.querySelectorAll('.country-card');
    const regionSections = document.querySelectorAll('.region-section');

    let activeVisa = 'all';
    let activeRegion = 'all';

    // Visa filter click
    visaFilters.forEach(btn => {
        btn.addEventListener('click', function() {
            visaFilters.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            activeVisa = this.dataset.filter;
            applyFilters();
        });
    });

    // Region tab click
    regionTabs.forEach(btn => {
        btn.addEventListener('click', function() {
            regionTabs.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            activeRegion = this.dataset.region;
            applyFilters();
        });
    });

    function applyFilters() {
        // Show/hide region sections
        regionSections.forEach(section => {
            const regionId = section.id.replace('region-', '');
            if (activeRegion === 'all' || activeRegion === regionId) {
                section.style.display = '';
            } else {
                section.style.display = 'none';
            }
        });

        // Show/hide country cards based on both filters
        let visibleCount = 0;
        countryCards.forEach(card => {
            const cardRegion = card.dataset.region;
            const cardVisa = card.dataset.visa;
            const hasNomadVisa = card.dataset.hasNomadVisa === 'true';

            const regionMatch = activeRegion === 'all' || activeRegion === cardRegion;
            let visaMatch = activeVisa === 'all';
            if (!visaMatch) {
                if (activeVisa === 'nomad') {
                    visaMatch = hasNomadVisa;
                } else {
                    visaMatch = cardVisa === activeVisa;
                }
            }

            if (regionMatch && visaMatch) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        // If no cards visible in a region, hide the section
        regionSections.forEach(section => {
            if (section.style.display === 'none') return;
            const visibleCards = section.querySelectorAll('.country-card:not(.hidden)');
            if (visibleCards.length === 0) {
                section.style.display = 'none';
            }
        });
    }
}

// Initialize new v2 features on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    initCountryGridFilters();
});

