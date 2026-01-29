// Audio Manager
const audioManager = {
  ambient: null,
  ui: {},
  isEnabled: false,

  init() {
    // Note: Audio files would normally be in assets/sounds/
    // Using placeholders for now
    this.ambient = new Howl({
      src: ["assets/avengers_endgame.mp3"],
      loop: true,
      volume: 0.3, // Start at 30% volume
      preload: true,
      html5: true, // Better for local file protocol and large files
      autoplay: true, // Auto-play on load
    });

    this.ui.click = { play: () => {} };
    this.ui.hover = { play: () => {} };

    // Set audio as enabled by default
    this.isEnabled = true;
    
    // Update UI to show audio is on
    const toggle = document.getElementById("sound-toggle");
    const icon = document.getElementById("sound-icon");
    const label = toggle.querySelector(".label");
    
    if (toggle && icon && label) {
      icon.textContent = "🔊";
      label.textContent = "Sound ON";
      toggle.classList.add("active");
    }

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
