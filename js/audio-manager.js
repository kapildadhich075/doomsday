// Audio Manager
const audioManager = {
  ambient: null,
  ui: {},
  isEnabled: false,

  init() {
    // Note: Audio files would normally be in assets/sounds/
    // Using placeholders for now
    this.ambient = new Howl({
      src: [
        "https://assets.mixkit.co/music/preview/mixkit-sci-fi-drone-background-908.mp3",
      ], // Placeholder ominous drone
      loop: true,
      volume: 0, // Starts at 0 for fade in
      preload: true,
    });

    this.ui.click = new Howl({
      src: [
        "https://assets.mixkit.co/sfx/preview/mixkit-modern-click-box-check-1120.mp3",
      ],
      volume: 0.5,
    });

    this.ui.hover = new Howl({
      src: [
        "https://assets.mixkit.co/sfx/preview/mixkit-simple-hover-check-1102.mp3",
      ],
      volume: 0.2,
    });

    this.setupListeners();
  },

  setupListeners() {
    const toggle = document.getElementById("sound-toggle");
    const icon = document.getElementById("sound-icon");
    const label = toggle.querySelector(".label");

    toggle.addEventListener("click", () => {
      this.isEnabled = !this.isEnabled;

      if (this.isEnabled) {
        this.ambient.play();
        this.ambient.fade(0, 0.3, 2000);
        icon.textContent = "🔊";
        label.textContent = "Sound ON";
        toggle.classList.add("active");
        this.ui.click.play();
      } else {
        this.ambient.fade(0.3, 0, 1000);
        setTimeout(() => this.ambient.pause(), 1000);
        icon.textContent = "🔇";
        label.textContent = "Sound OFF";
        toggle.classList.remove("active");
      }
    });

    // Button hovers
    document.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        if (this.isEnabled) this.ui.hover.play();
      });
      btn.addEventListener("click", () => {
        if (this.isEnabled) this.ui.click.play();
      });
    });
  },
};

window.addEventListener("DOMContentLoaded", () => audioManager.init());
