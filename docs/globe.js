import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const CONFIG = {
  radius: 100,
  autoRotateSpeed: 0.35,
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
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
}

function createLatitudeLongitudeGrid(radius) {
  const grid = new THREE.Group();
  const material = { color: 0x60a5fa, opacity: 0.28 };

  for (let lat = -75; lat <= 75; lat += 15) {
    const points = [];
    for (let lng = -180; lng <= 180; lng += 3) {
      points.push(latLngToVector3(lat, lng, radius));
    }
    grid.add(createLine(points, material.color, material.opacity));
  }

  for (let lng = -180; lng < 180; lng += 15) {
    const points = [];
    for (let lat = -90; lat <= 90; lat += 3) {
      points.push(latLngToVector3(lat, lng, radius));
    }
    grid.add(createLine(points, material.color, material.opacity));
  }

  return grid;
}

function createDataRoutes(nodes, radius) {
  const routes = new THREE.Group();

  DATA_ROUTES.forEach(([from, to], index) => {
    const start = latLngToVector3(...nodes[from], radius + 1);
    const end = latLngToVector3(...nodes[to], radius + 1);
    const midpoint = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(radius * 1.32);
    const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);
    routes.add(createLine(curve.getPoints(36), index % 3 === 0 ? 0xef4444 : 0x38bdf8, 0.64));
  });

  return routes;
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
    globe.add(new THREE.Mesh(
      new THREE.SphereGeometry(radius, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x0b1f3a, transparent: true, opacity: 0.94 }),
    ));
    globe.add(createLatitudeLongitudeGrid(radius + 0.8));
    globe.add(createDataRoutes(DATA_NODES, radius));

    const nodeGeometry = new THREE.SphereGeometry(2.15, 16, 16);
    DATA_NODES.forEach(([lat, lng], index) => {
      const node = new THREE.Mesh(nodeGeometry, new THREE.MeshBasicMaterial({ color: index % 3 === 0 ? 0xef4444 : 0x7dd3fc }));
      node.position.copy(latLngToVector3(lat, lng, radius + 2));
      globe.add(node);
      this.nodes.push(node);
    });

    globe.add(new THREE.Mesh(
      new THREE.SphereGeometry(radius + 4, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.11, side: THREE.BackSide }),
    ));
    globe.add(new THREE.Mesh(
      new THREE.SphereGeometry(radius + 7, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.05, side: THREE.BackSide }),
    ));
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
      this.nodes.forEach((node, index) => node.scale.setScalar(0.82 + Math.sin(time * 0.002 + index) * 0.18));
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

new DigitalGlobe('globe-viz');
