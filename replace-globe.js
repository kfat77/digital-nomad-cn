const fs = require('fs');

const appJs = fs.readFileSync('./website/app.js', 'utf8');
const lines = appJs.split('\n');

// Find initGlobe start (line with "function initGlobe() {")
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'function initGlobe() {' && startIdx === -1) {
        startIdx = i;
    }
    // Find the end: the line after initGlobe is "// ============================================" for sidebar section
    if (startIdx !== -1 && i > startIdx && lines[i].trim() === '// ============================================' && lines[i+1] && lines[i+1].includes('地球侧边国家列表')) {
        // endIdx is the line before the empty line before this comment
        // The pattern is: }\n\n// ==== ...
        endIdx = i - 2; // skip empty line
        break;
    }
}

console.log('initGlobe starts at line:', startIdx + 1);
console.log('initGlobe ends at line:', endIdx + 1);

// Verify we found the right positions
if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    console.error('Could not find initGlobe boundaries');
    process.exit(1);
}

// Verify the boundary line is just "}"
console.log('Boundary line:', JSON.stringify(lines[endIdx]));
if (lines[endIdx].trim() !== '}') {
    console.error('Boundary line is not "}"');
    process.exit(1);
}

// New initGlobe function
const newInitGlobe = `function initGlobe() {
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
}`;

const before = lines.slice(0, startIdx).join('\n');
const after = lines.slice(endIdx + 1).join('\n');

const output = before + '\n' + newInitGlobe + '\n' + after;
fs.writeFileSync('./website/app.js', output);
console.log('app.js updated successfully');
