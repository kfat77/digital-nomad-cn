import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const CONFIG = {
  radius: 100,
  autoRotateSpeed: 0.22,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

const DATA_NODES = [
  [1.35, 103.82], [13.76, 100.5], [25.03, 121.57], [35.68, 139.65],
  [31.23, 121.47], [25.2, 55.27], [51.51, -0.13], [40.71, -74.01],
  [37.77, -122.42], [19.43, -99.13], [-23.55, -46.63], [52.52, 13.4],
  [38.72, -9.14], [41.01, 28.98], [-33.87, 151.21], [-1.29, 36.82],
];

const DATA_ROUTES = [
  [0, 1], [0, 2], [0, 4], [0, 5], [1, 3], [2, 3], [3, 4], [4, 11],
  [5, 11], [5, 13], [6, 7], [7, 8], [7, 9], [9, 10], [11, 12], [14, 0],
];

// Deliberately simplified, hand-drawn silhouettes: a visual data layer, not a map product.
const CONTINENT_OUTLINES = [
  [[72, -168], [65, -150], [58, -135], [51, -125], [47, -123], [40, -124], [34, -118], [29, -113], [24, -106], [19, -104], [15, -91], [21, -86], [27, -81], [34, -78], [42, -70], [50, -62], [57, -72], [62, -91], [68, -110], [72, -135], [72, -168]],
  [[12, -77], [5, -80], [-5, -79], [-16, -73], [-25, -67], [-35, -63], [-45, -66], [-54, -71], [-52, -60], [-42, -48], [-30, -47], [-18, -42], [-7, -35], [2, -48], [8, -62], [12, -77]],
  [[72, -10], [70, 25], [67, 55], [70, 95], [66, 125], [59, 150], [52, 145], [48, 128], [42, 122], [38, 112], [30, 104], [22, 108], [17, 102], [10, 103], [7, 80], [17, 74], [24, 56], [32, 45], [37, 30], [42, 19], [48, 3], [55, -6], [60, -2], [72, -10]],
  [[35, -10], [31, 4], [25, 11], [18, 17], [11, 15], [5, 9], [-4, 11], [-11, 14], [-20, 17], [-28, 24], [-35, 20], [-35, 10], [-29, 1], [-23, -5], [-14, -10], [-4, -14], [8, -17], [20, -16], [28, -14], [35, -10]],
  [[-11, 113], [-17, 122], [-23, 132], [-31, 139], [-35, 151], [-32, 153], [-25, 149], [-20, 145], [-15, 137], [-12, 128], [-11, 113]],
];

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function createLine(points, color, opacity) {
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
  );
}

function createLatitudeLongitudeGrid(radius) {
  const grid = new THREE.Group();
  for (let lat = -75; lat <= 75; lat += 15) {
    const points = [];
    for (let lng = -180; lng <= 180; lng += 3) points.push(latLngToVector3(lat, lng, radius));
    grid.add(createLine(points, 0x2b7ca5, 0.2));
  }
  for (let lng = -180; lng < 180; lng += 15) {
    const points = [];
    for (let lat = -90; lat <= 90; lat += 3) points.push(latLngToVector3(lat, lng, radius));
    grid.add(createLine(points, 0x2b7ca5, 0.2));
  }
  return grid;
}

function createContinentalOutlines(radius) {
  const outlines = new THREE.Group();
  CONTINENT_OUTLINES.forEach((outline) => {
    const points = outline.map(([lat, lng]) => latLngToVector3(lat, lng, radius));
    outlines.add(createLine(points, 0x82e8ff, 0.8));
  });
  return outlines;
}

function createDataRoutes(nodes, radius) {
  const routes = new THREE.Group();
  DATA_ROUTES.forEach(([from, to], index) => {
    const start = latLngToVector3(...nodes[from], radius + 1.4);
    const end = latLngToVector3(...nodes[to], radius + 1.4);
    const midpoint = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(radius * 1.34);
    const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);
    routes.add(createLine(curve.getPoints(42), index % 4 === 0 ? 0xf59e0b : 0x38dfff, index % 4 === 0 ? 0.6 : 0.48));
  });
  return routes;
}

function createOrbitLine(radius, inclination, phase) {
  const points = [];
  for (let step = 0; step <= 160; step += 1) {
    const angle = (step / 160) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  const orbit = createLine(points, 0x63d9ff, 0.32);
  orbit.rotation.set(inclination, phase, 0);
  return orbit;
}

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.14, 'rgba(186,230,253,0.98)');
  gradient.addColorStop(0.42, 'rgba(56,189,248,0.36)');
  gradient.addColorStop(1, 'rgba(56,189,248,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function createStarField() {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  let seed = 41;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let index = 0; index < 340; index += 1) {
    positions.push((random() - 0.5) * 620, (random() - 0.5) * 450, -80 - random() * 180);
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xbfe9ff, size: 1.3, transparent: true, opacity: 0.7, depthWrite: false }));
}

class DigitalGlobe {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.nodes = [];
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 30, 280);
    this.createRenderer();
    this.createControls();
    this.createGlobe();
    this.animate();
    window.addEventListener('resize', () => this.onResize());
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;cursor:grab;touch-action:pan-y;';
    this.container.appendChild(this.renderer.domElement);
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.zoomSpeed = 0.8;
    this.controls.minDistance = 150;
    this.controls.maxDistance = 450;
    this.controls.enablePan = false;
    this.controls.autoRotate = !CONFIG.reducedMotion;
    this.controls.autoRotateSpeed = CONFIG.autoRotateSpeed;
    this.controls.addEventListener('start', () => { this.renderer.domElement.style.cursor = 'grabbing'; this.controls.autoRotate = false; });
    this.controls.addEventListener('end', () => {
      this.renderer.domElement.style.cursor = 'grab';
      clearTimeout(this.resumeTimer);
      if (!CONFIG.reducedMotion) this.resumeTimer = setTimeout(() => { this.controls.autoRotate = true; }, 4000);
    });
  }

  createGlobe() {
    const globe = new THREE.Group();
    const radius = CONFIG.radius;
    const glowTexture = createGlowTexture();
    this.scene.add(createStarField());

    globe.add(new THREE.Mesh(
      new THREE.SphereGeometry(radius, 96, 96),
      new THREE.MeshBasicMaterial({ color: 0x061b30, transparent: true, opacity: 0.96 }),
    ));
    globe.add(createLatitudeLongitudeGrid(radius + 0.6));
    globe.add(createContinentalOutlines(radius + 1.4));
    globe.add(createDataRoutes(DATA_NODES, radius));

    const nodeGeometry = new THREE.SphereGeometry(1.65, 16, 16);
    DATA_NODES.forEach(([lat, lng], index) => {
      const position = latLngToVector3(lat, lng, radius + 2.1);
      const node = new THREE.Mesh(nodeGeometry, new THREE.MeshBasicMaterial({ color: index % 4 === 0 ? 0xfbbf24 : 0xdff8ff }));
      node.position.copy(position);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: index % 4 === 0 ? 0xf59e0b : 0x38bdf8, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.position.copy(position);
      halo.scale.setScalar(index % 4 === 0 ? 15 : 11);
      globe.add(halo, node);
      this.nodes.push({ node, halo, baseScale: halo.scale.x });
    });

    globe.add(createOrbitLine(radius * 1.42, 0.62, 0.15));
    globe.add(createOrbitLine(radius * 1.3, -0.34, -0.5));
    globe.add(new THREE.Mesh(
      new THREE.SphereGeometry(radius + 4, 72, 72),
      new THREE.MeshBasicMaterial({ color: 0x22b8ff, transparent: true, opacity: 0.13, side: THREE.BackSide, blending: THREE.AdditiveBlending }),
    ));
    globe.add(new THREE.Mesh(
      new THREE.SphereGeometry(radius + 8, 72, 72),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.045, side: THREE.BackSide, blending: THREE.AdditiveBlending }),
    ));
    globe.rotation.set(-0.08, -0.72, 0);
    this.scene.add(globe);
  }

  onResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate(time = 0) {
    requestAnimationFrame((nextTime) => this.animate(nextTime));
    if (!CONFIG.reducedMotion) {
      this.nodes.forEach(({ node, halo, baseScale }, index) => {
        const pulse = 0.82 + Math.sin(time * 0.002 + index) * 0.18;
        node.scale.setScalar(pulse);
        halo.scale.setScalar(baseScale * pulse);
      });
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

new DigitalGlobe('globe-viz');
