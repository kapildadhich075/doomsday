// Three.js Background Scene (Original Mask + Debris)
const backgroundScene = {
  scene: null,
  camera: null,
  renderer: null,
  mask: null,
  debris: [],
  mouse: { x: 0, y: 0 },
  targetMouse: { x: 0, y: 0 },

  init() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0a0a, 5, 15);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 6;

    const canvas = document.getElementById("three-canvas");
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.createMask();
    this.createDebris();
    this.addLights();

    window.addEventListener("mousemove", (e) => this.onMouseMove(e));
    window.addEventListener("resize", () => this.onResize());

    this.animate();
  },

  createMask() {
    // Restoring the original "ball" (Low-poly Doom style sphere)
    const geometry = new THREE.IcosahedronGeometry(1.8, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x2d5016,
      emissive: 0x4a7c2c,
      emissiveIntensity: 0.2,
      shininess: 100,
      flatShading: true,
      wireframe: true,
    });
    this.mask = new THREE.Mesh(geometry, material);
    this.mask.position.set(0, 0, -2);
    this.scene.add(this.mask);

    const innerGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x4a7c2c,
      transparent: true,
      opacity: 0.2,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    this.mask.add(innerSphere);
  },

  createDebris() {
    const debrisCount = window.innerWidth < 768 ? 30 : 60;
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      flatShading: true,
    });

    for (let i = 0; i < debrisCount; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      const scale = Math.random() * 0.2 + 0.05;
      mesh.scale.set(scale, scale, scale);
      mesh.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);
      mesh.userData = {
        rotationSpeed: { x: (Math.random() - 0.5) * 0.01, y: (Math.random() - 0.5) * 0.01, z: (Math.random() - 0.5) * 0.01 },
        velocity: { x: (Math.random() - 0.5) * 0.005, y: (Math.random() - 0.5) * 0.005, z: (Math.random() - 0.5) * 0.005 },
      };
      this.debris.push(mesh);
      this.scene.add(mesh);
    }
  },

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x4a7c2c, 3, 20);
    pointLight.position.set(2, 2, 4);
    this.scene.add(pointLight);
  },

  onMouseMove(e) {
    this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  },

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  },

  animate() {
    requestAnimationFrame(() => this.animate());
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    if (this.mask) {
      this.mask.rotation.y += 0.002;
      this.mask.rotation.x += 0.001;
      const time = Date.now() * 0.001;
      const pulse = Math.sin(time) * 0.05 + 1;
      this.mask.scale.set(pulse, pulse, pulse);
    }

    this.debris.forEach(item => {
      item.rotation.x += item.userData.rotationSpeed.x;
      item.rotation.y += item.userData.rotationSpeed.y;
      item.rotation.z += item.userData.rotationSpeed.z;
      item.position.x += item.userData.velocity.x;
      item.position.y += item.userData.velocity.y;
      item.position.z += item.userData.velocity.z;
      if (Math.abs(item.position.x) > 8) item.position.x *= -0.9;
      if (Math.abs(item.position.y) > 8) item.position.y *= -0.9;
      if (Math.abs(item.position.z) > 8) item.position.z *= -0.9;
    });

    this.camera.position.x += (this.mouse.x * 2 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.mouse.y * 2 - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.camera);
  }
};

// GLTF Interactive Model Viewer Section
const modelViewer = {
  scene: null,
  camera: null,
  renderer: null,
  model: null,
  container: null,
  isDragging: false,
  previousMousePosition: { x: 0, y: 0 },
  rotation: { x: 0, y: 0 },

  init() {
    this.container = document.querySelector('.model-container');
    if (!this.container) return;

    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(20, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
    this.camera.position.set(2, 2, 8);

    const canvas = document.getElementById('model-canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.addLights();
    this.loadModel();
    this.setupMouseControls();

    window.addEventListener('resize', () => this.onResize());
    this.animate();
  },

  setupMouseControls() {
    const canvas = document.getElementById('model-canvas');

    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.rotation.y += deltaX * 0.01;
      this.rotation.x += deltaY * 0.01;

      // Limit vertical rotation
      this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
    });

    // Touch support for mobile
    canvas.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      };
    });

    canvas.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      e.preventDefault();

      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      this.rotation.y += deltaX * 0.01;
      this.rotation.x += deltaY * 0.01;

      this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));

      this.previousMousePosition = { 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      };
    });

    canvas.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  },

  addLights() {
    // Brighter ambient light for overall visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);
    
    // Main spotlight from front-top
    const mainSpotlight = new THREE.SpotLight(0xffffff, 3);
    mainSpotlight.position.set(2, 8, 8);
    mainSpotlight.angle = Math.PI / 6;
    mainSpotlight.penumbra = 0.3;
    mainSpotlight.decay = 2;
    mainSpotlight.distance = 50;
    this.scene.add(mainSpotlight);

    // Key light from the right
    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(8, 5, 5);
    this.scene.add(keyLight);

    // Rim light from behind for dramatic edge lighting
    const rimLight = new THREE.DirectionalLight(0x4a7c2c, 1.5);
    rimLight.position.set(-5, 3, -8);
    this.scene.add(rimLight);

    // Fill light from below to eliminate harsh shadows
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(0, -5, 5);
    this.scene.add(fillLight);

    // Side accent light with green tint
    const accentLight = new THREE.PointLight(0x4a7c2c, 2, 20);
    accentLight.position.set(-8, 2, 2);
    this.scene.add(accentLight);

    // Additional front point light for face illumination
    const frontLight = new THREE.PointLight(0xffffff, 1.5, 15);
    frontLight.position.set(2, 3, 10);
    this.scene.add(frontLight);
  },

  loadModel() {
    const loader = new THREE.GLTFLoader();
    loader.load('assets/doctor_doom.glb', (gltf) => {
      this.model = gltf.scene;
      
      const box = new THREE.Box3().setFromObject(this.model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Center the model at origin, shift slightly right
      this.model.position.set(-center.x + 0.5, -center.y + size.y * 0.3, -center.z);
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 6 / maxDim; // Increased from 4 to 6 for bigger size
      this.model.scale.set(scale, scale, scale);
      
      this.scene.add(this.model);
      
      // Point camera at the model (adjusted for right shift)
      this.camera.lookAt(0.5, size.y * 0.3, 0);
    });
  },

  onResize() {
    if (!this.container) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  },

  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Apply user-controlled rotation instead of automatic
    if (this.model) {
      this.model.rotation.y = this.rotation.y;
      this.model.rotation.x = this.rotation.x;
    }
    
    this.renderer.render(this.scene, this.camera);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  backgroundScene.init();
  modelViewer.init();
});
