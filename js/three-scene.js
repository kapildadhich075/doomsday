// Three.js Scene Setup (Doom's Mask + Floating Debris)
const threeScene = {
  scene: null,
  camera: null,
  renderer: null,
  mask: null,
  debris: [],
  mouse: { x: 0, y: 0 },
  targetMouse: { x: 0, y: 0 },
  baseScale: 1,

  init() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0a0a, 5, 15);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
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

    this.createModel();
    this.createDebris();
    this.addLights();

    window.addEventListener("mousemove", (e) => this.onMouseMove(e));
    window.addEventListener("resize", () => this.onResize());

    this.animate();
  },

  createModel() {
    const loader = new THREE.GLTFLoader();
    loader.load(
      "assets/scene.gltf",
      (gltf) => {
        this.mask = gltf.scene;
        
        // Center and scale the model
        const box = new THREE.Box3().setFromObject(this.mask);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        this.mask.position.set(-center.x, -center.y, -center.z - 2);
        
        // Adjust scale based on screen size
        const maxDim = Math.max(size.x, size.y, size.z);
        this.baseScale = (window.innerWidth < 768 ? 2.5 : 4) / maxDim;
        this.mask.scale.set(this.baseScale, this.baseScale, this.baseScale);
        
        this.scene.add(this.mask);
        
        // Add a subtle glow/emissive effect to the model's children if they have materials
        this.mask.traverse((child) => {
          if (child.isMesh) {
            child.material.envMapIntensity = 1.5;
            if (child.material.emissive) {
              child.material.emissive.setHex(0x2d5016);
              child.material.emissiveIntensity = 0.5;
            }
          }
        });
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF model:", error);
      }
    );
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

      mesh.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );

      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01,
        },
        velocity: {
          x: (Math.random() - 0.5) * 0.005,
          y: (Math.random() - 0.5) * 0.005,
          z: (Math.random() - 0.5) * 0.005,
        },
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

    const secondaryLight = new THREE.PointLight(0x2d5016, 2, 15);
    secondaryLight.position.set(-2, -2, 2);
    this.scene.add(secondaryLight);
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

    // Lerp mouse for smooth parallax
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    // Rotate and Pulse Mask
    if (this.mask) {
      this.mask.rotation.y += 0.002;
      this.mask.rotation.x += 0.001;

      // Pulse effect (subtle)
      const time = Date.now() * 0.001;
      const pulse = 1 + Math.sin(time * 2) * 0.05; 
      const s = this.baseScale * pulse;
      this.mask.scale.set(s, s, s);
    }

    // Animate Debris
    this.debris.forEach((item) => {
      item.rotation.x += item.userData.rotationSpeed.x;
      item.rotation.y += item.userData.rotationSpeed.y;
      item.rotation.z += item.userData.rotationSpeed.z;

      item.position.x += item.userData.velocity.x;
      item.position.y += item.userData.velocity.y;
      item.position.z += item.userData.velocity.z;

      // Wrap around bounds
      if (Math.abs(item.position.x) > 8) item.position.x *= -0.9;
      if (Math.abs(item.position.y) > 8) item.position.y *= -0.9;
      if (Math.abs(item.position.z) > 8) item.position.z *= -0.9;
    });

    // Parallax Camera
    this.camera.position.x +=
      (this.mouse.x * 2 - this.camera.position.x) * 0.05;
    this.camera.position.y +=
      (this.mouse.y * 2 - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  },
};

window.addEventListener("DOMContentLoaded", () => threeScene.init());
