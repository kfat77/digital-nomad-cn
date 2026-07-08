// Digital Nomad Guide — 3D Interactive Globe + Visa Official Links
// Three.js Earth with country markers, modal info, and official visa links

document.addEventListener('DOMContentLoaded', function() {

    // ===== 1. Animated Counter =====
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

    // ===== 2. Header Scroll Effect =====
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

    // ===== 3. Smooth Scroll to Anchors =====
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

    // ===== 4. Module Card Fade-in Animation =====
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

    // ===== 5. Quick Nav Item Animation =====
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

    // ===== 6. Feature Block Animation =====
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

    // ===== 7. Code Tab Switching =====
    const codeTabs = document.querySelectorAll('.code-header span');
    const codeBlock = document.querySelector('.code-block');

    const codeSnippets = {
        'Hong Kong Bank Account': `<span class="c-comment"># One-Day Hong Kong 4-Card Setup — Digital Nomad Infrastructure</span>
<span class="c-variable">schedule</span> = {
    <span class="c-string">"Morning"</span>: <span class="c-string">"BOC HK branch opening (appointment + address proof)"</span>,
    <span class="c-string">"Noon"</span>: <span class="c-string">"HSBC app online opening (10 min, HK WiFi required)"</span>,
    <span class="c-string">"Afternoon"</span>: <span class="c-string">"ZA + Ant virtual banks (5 min each, fully online)"</span>,
    <span class="c-string">"On the way"</span>: <span class="c-string">"711 Club SIM (6 HKD/year to keep number)"</span>,
    <span class="c-string">"Finally"</span>: <span class="c-string">"Register Gmail with HK IP (100% success)"</span>
}

<span class="c-comment"># Required materials</span>
<span class="c-variable">materials</span> = [<span class="c-string">"ID card"</span>, <span class="c-string">"HK-Macau Pass"</span>, <span class="c-string">"Entry slip"</span>, 
              <span class="c-string">"Address proof"</span>, <span class="c-string">"Investment proof"</span>, <span class="c-string">"1000-2000 HKD cash"</span>]

<span class="c-function">print</span>(<span class="c-string">f"Recommended combo: HSBC + BOC + ZA + Ant"</span>)
<span class="c-function">print</span>(<span class="c-string">f"Total time: ~4-6 hours | Total cost: 0 (transport only)"</span>)`,

        'Broker Funding Path': `<span class="c-comment"># Best Funding Path — Low Cost + High Efficiency</span>
<span class="c-variable">path</span> = {
    <span class="c-string">"Best"</span>: [<span class="c-string">"Mainland FX purchase"</span>, <span class="c-string">"→"</span>, <span class="c-string">"HK bank"</span>, <span class="c-string">"→"</span>, <span class="c-string">"US broker"</span>],
    <span class="c-string">"Alternative"</span>: [<span class="c-string">"Wise"</span>, <span class="c-string">"→"</span>, <span class="c-string">"ACH transfer"</span>, <span class="c-string">"→"</span>, <span class="c-string">"IBKR/Schwab"</span>]
}

<span class="c-comment"># Path cost comparison</span>
<span class="c-variable">costs</span> = {
    <span class="c-string">"HK Card → IBKR"</span>: <span class="c-string">"$0-5 / 1-2 days"</span>,
    <span class="c-string">"Wise → Schwab"</span>: <span class="c-string">"$0-2 / 1-2 days"</span>,
    <span class="c-string">"Mainland wire"</span>: <span class="c-string">"$20-50 / 3-5 days"</span>
}

<span class="c-function">print</span>(<span class="c-string">f"Recommendation: Open HK bank account first, then connect broker — most stable and lowest cost"</span>)`,

        'Identity Planning': `<span class="c-comment"># Choose identity path by budget</span>
<span class="c-keyword">def</span> <span class="c-function">choose_path</span>(budget, timeline, goal):
    <span class="c-keyword">if</span> budget == <span class="c-string">"Almost zero"</span>:
        <span class="c-keyword">return</span> [<span class="c-string">"Canada EE"</span>, <span class="c-string">"NZ Skilled Migrant"</span>]
    <span class="c-keyword">elif</span> budget == <span class="c-string">"Low cost"</span>:
        <span class="c-keyword">return</span> [<span class="c-string">"HK Top Talent Pass"</span>, <span class="c-string">"Spain Non-Lucrative"</span>]
    <span class="c-keyword">elif</span> budget == <span class="c-string">"Medium cost"</span>:
        <span class="c-keyword">return</span> [<span class="c-string">"Portugal D7"</span>, <span class="c-string">"Malaysia MM2H"</span>]
    <span class="c-keyword">elif</span> budget == <span class="c-string">"High cost"</span>:
        <span class="c-keyword">return</span> [<span class="c-string">"Korea Investor"</span>, <span class="c-string">"Singapore GIP"</span>]

<span class="c-comment"># Core advice</span>
<span class="c-function">print</span>(<span class="c-string">f"Right country + PR without citizenship = dual benefits + travel convenience"</span>)
<span class="c-function">print</span>(<span class="c-string">f"Most digital nomads' first step: HK or Japan identity"</span>)`
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

    // ===== 8. Three.js 3D Interactive Globe =====
    initGlobe();

    // ===== 9. Visa Official Links Generation =====
    generateVisaLinks();

    // ===== 10. Country Info Modal =====
    initCountryModal();

    console.log('🌍 Digital Nomad Guide — 3D Interactive Globe loaded');
});


// ============================================
// Three.js 3D Earth
// ============================================

function initGlobe() {
    const wrapper = document.getElementById('globe-canvas-wrapper');
    if (!wrapper || typeof THREE === 'undefined') {
        console.warn('Three.js or globe container not found');
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

    // Earth sphere (using wireframe + dot pattern for stylized look)
    const earthRadius = 1;

    // 1. Wireframe sphere (main globe outline)
    const wireGeo = new THREE.IcosahedronGeometry(earthRadius, 3);
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0xd0d5dd,
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    earthGroup.add(wireMesh);

    // 2. Inner solid sphere (slightly smaller, subtle fill)
    const innerGeo = new THREE.SphereGeometry(earthRadius * 0.98, 64, 64);
    const innerMat = new THREE.MeshBasicMaterial({
        color: 0xf5f7fa,
        transparent: true,
        opacity: 0.6
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

    // 4. Atmosphere glow
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.08, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
        color: 0x2563eb,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosMesh);

    // 5. Country markers
    const markers = [];
    const markerGroup = new THREE.Group();
    earthGroup.add(markerGroup);

    const countryData = window.COUNTRY_DATA || {};
    const markerMap = {}; // key -> marker mesh mapping

    Object.entries(countryData).forEach(([key, country]) => {
        const pos = latLonToVector3(country.lat, country.lon, earthRadius * 1.02);

        // Marker dot
        const dotGeo = new THREE.SphereGeometry(0.025, 16, 16);
        const dotMat = new THREE.MeshBasicMaterial({
            color: country.color || 0x2563eb,
            transparent: true,
            opacity: 0.85
        });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(pos);
        dot.userData = { country: key, data: country, originalScale: 1 };
        markerGroup.add(dot);
        markers.push(dot);
        markerMap[key] = dot;

        // Glow ring around marker
        const glowGeo = new THREE.RingGeometry(0.035, 0.05, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: country.color || 0x2563eb,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.copy(pos.clone().multiplyScalar(1.001));
        glow.lookAt(new THREE.Vector3(0, 0, 0));
        markerGroup.add(glow);
        dot.userData.glow = glow;

        // Connection line to surface
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            pos.clone().multiplyScalar(0.98),
            pos.clone().multiplyScalar(1.08)
        ]);
        const lineMat = new THREE.LineBasicMaterial({
            color: country.color || 0x2563eb,
            transparent: true,
            opacity: 0.35
        });
        const line = new THREE.Line(lineGeo, lineMat);
        markerGroup.add(line);
        dot.userData.line = line;
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
    let hoveredMarker = null;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let autoRotate = true;
    const rotationSpeed = 0.001;

    // Mouse move for raycasting
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

    wrapper.addEventListener('mouseup', () => {
        isDragging = false;
    });

    wrapper.addEventListener('mouseleave', () => {
        isDragging = false;
        mouse.x = -10;
        mouse.y = -10;
    });

    // Click to navigate to country page
    wrapper.addEventListener('click', (e) => {
        if (!isDragging) {
            const rect = wrapper.getBoundingClientRect();
            const clickMouse = new THREE.Vector2(
                ((e.clientX - rect.left) / rect.width) * 2 - 1,
                -((e.clientY - rect.top) / rect.height) * 2 + 1
            );
            raycaster.setFromCamera(clickMouse, camera);
            const intersects = raycaster.intersectObjects(markers);
            if (intersects.length > 0) {
                const marker = intersects[0].object;
                if (marker.userData && marker.userData.country) {
                    window.location.href = `country/${marker.userData.country}.html`;
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

    wrapper.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Tooltip element
    const tooltip = document.getElementById('globeTooltip');
    let tooltipTimeout = null;

    // Animation loop
    let frameId;
    function animate() {
        frameId = requestAnimationFrame(animate);

        // Auto rotate
        if (autoRotate && !isDragging) {
            earthGroup.rotation.y += rotationSpeed;
        }

        // Hover detection
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markers);

        if (intersects.length > 0) {
            const marker = intersects[0].object;
            if (hoveredMarker !== marker) {
                // Reset previous
                if (hoveredMarker) {
                    hoveredMarker.scale.setScalar(1);
                    hoveredMarker.material.opacity = 0.85;
                    if (hoveredMarker.userData.glow) {
                        hoveredMarker.userData.glow.scale.setScalar(1);
                        hoveredMarker.userData.glow.material.opacity = 0.3;
                    }
                    // Reset sidebar active
                    const prevKey = hoveredMarker.userData.country;
                    const prevItem = document.querySelector(`.globe-sidebar-item[data-country="${prevKey}"]`);
                    if (prevItem) prevItem.classList.remove('active');
                }
                // Highlight new
                hoveredMarker = marker;
                hoveredMarker.scale.setScalar(2.0);
                hoveredMarker.material.opacity = 1;
                if (hoveredMarker.userData.glow) {
                    hoveredMarker.userData.glow.scale.setScalar(1.8);
                    hoveredMarker.userData.glow.material.opacity = 0.7;
                }
                wrapper.style.cursor = 'pointer';

                // Show tooltip — use English name when available
                const data = marker.userData.data;
                const displayName = data.nameEn || data.name;
                if (tooltip) {
                    tooltip.textContent = displayName;
                    tooltip.classList.add('visible');
                }
                // Highlight sidebar item
                const key = marker.userData.country;
                const item = document.querySelector(`.globe-sidebar-item[data-country="${key}"]`);
                if (item) {
                    item.classList.add('active');
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }

            // Update tooltip position
            if (tooltip && !isDragging) {
                const wrapperRect = wrapper.getBoundingClientRect();
                // Project marker position to screen
                const markerPos = marker.position.clone();
                markerPos.applyMatrix4(earthGroup.matrixWorld);
                markerPos.project(camera);
                const x = (markerPos.x * 0.5 + 0.5) * wrapperRect.width;
                const y = (-markerPos.y * 0.5 + 0.5) * wrapperRect.height;
                tooltip.style.left = x + 'px';
                tooltip.style.top = (y - 12) + 'px';
            }
        } else {
            if (hoveredMarker) {
                hoveredMarker.scale.setScalar(1);
                hoveredMarker.material.opacity = 0.85;
                if (hoveredMarker.userData.glow) {
                    hoveredMarker.userData.glow.scale.setScalar(1);
                    hoveredMarker.userData.glow.material.opacity = 0.3;
                }
                // Reset sidebar active
                const key = hoveredMarker.userData.country;
                const item = document.querySelector(`.globe-sidebar-item[data-country="${key}"]`);
                if (item) item.classList.remove('active');
                hoveredMarker = null;
                wrapper.style.cursor = 'grab';
            }
            if (tooltip) {
                tooltip.classList.remove('visible');
            }
        }

        // Gentle pulse animation for markers
        const time = Date.now() * 0.001;
        markers.forEach((m, i) => {
            if (m !== hoveredMarker && m.userData.glow) {
                const pulse = Math.sin(time * 2 + i) * 0.1 + 0.3;
                m.userData.glow.material.opacity = pulse;
            }
        });

        // Ring rotation
        ringMesh.rotation.z += 0.0005;

        // Atmosphere subtle rotation
        atmosMesh.rotation.y += 0.0002;

        renderer.render(scene, camera);
    }

    animate();

    // Generate sidebar country list
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

    // IntersectionObserver for performance (pause when not visible)
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
// Globe Sidebar Country List
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
        'Asia': [],
        'Oceania': [],
        'Americas': [],
        'Europe': []
    };

    const regionMap = {
        hongkong: 'Asia', macao: 'Asia', singapore: 'Asia', japan: 'Asia', southkorea: 'Asia',
        thailand: 'Asia', vietnam: 'Asia', malaysia: 'Asia',
        australia: 'Oceania', newzealand: 'Oceania',
        usa: 'Americas', canada: 'Americas',
        uk: 'Europe', schengen: 'Europe', portugal: 'Europe', spain: 'Europe', estonia: 'Europe'
    };

    sortedEntries.forEach(([key, country]) => {
        const region = regionMap[key] || 'Other';
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
            // Use English name when available
            const displayName = country.nameEn || country.name;
            html += `
                <div class="globe-sidebar-item" data-country="${key}">
                    <span class="flag">${flag}</span>
                    <span class="name">${displayName}</span>
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
// Country Info Modal
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
    // Use English name when available
    title.textContent = data.nameEn || data.name;
    subtitle.textContent = data.nameEn ? data.name : '';

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
        bank: 'Bank Cards',
        phone: 'Phone SIM',
        visa: 'Visa',
        securities: 'Securities Account',
        identity: 'Identity Planning',
        tools: 'Digital Tools'
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
// Visa Official Links Generation
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
