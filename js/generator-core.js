// Main UI Controller for Generator
document.addEventListener("DOMContentLoaded", () => {
  const renderer = new WillReturnRenderer("animation-canvas");
  const exporter = new ExportHandler(renderer);

  // Initialization
  renderer.render();

  // Color Pickers
  const initColorPicker = (el, defaultColor, callback) => {
    const pickr = Pickr.create({
      el: el,
      theme: "classic",
      default: defaultColor,
      components: {
        preview: true,
        opacity: true,
        hue: true,
        interaction: { hex: true, input: true, save: true },
      },
    });
    pickr.on("change", (color) => {
      const hex = color.toHEXA().toString();
      callback(hex);
    });
    return pickr;
  };

  const textColorPicker = initColorPicker(
    "#text-color-picker",
    "#FFFFFF",
    (hex) => {
      renderer.updateSettings({ textColor: hex });
      document.getElementById("text-color-hex").value = hex;
    },
  );

  const accentColorPicker = initColorPicker(
    "#accent-color-picker",
    "#4A7C2C",
    (hex) => {
      renderer.updateSettings({ accentColor: hex });
      document.getElementById("accent-color-hex").value = hex;
    },
  );

  // UI Event Listeners
  document.getElementById("character-name").addEventListener("input", (e) => {
    const name = e.target.value || "CHARACTER NAME";
    renderer.updateSettings({ characterName: name });
    document.getElementById("name-count").textContent =
      `${e.target.value.length}/40`;
  });

  document.getElementById("font-family").addEventListener("change", (e) => {
    renderer.updateSettings({ fontFamily: e.target.value });
  });

  document.getElementById("font-size").addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    renderer.updateSettings({ fontSize: val });
    document.getElementById("size-val").textContent = `${val}px`;
  });

  document.getElementById("letter-spacing").addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    renderer.updateSettings({ letterSpacing: val });
    document.getElementById("spacing-val").textContent = `${val}px`;
  });

  // Toggles
  document.getElementById("vignette-toggle").addEventListener("change", (e) => {
    renderer.settings.effects.vignette = e.target.checked;
    renderer.render();
  });

  document
    .getElementById("scanlines-toggle")
    .addEventListener("change", (e) => {
      renderer.settings.effects.scanlines = e.target.checked;
      renderer.render();
    });

  document.getElementById("grain-toggle").addEventListener("change", (e) => {
    renderer.settings.effects.grain = e.target.checked;
    renderer.render();
  });

  // Presets
  document.querySelectorAll(".preset-card").forEach((card) => {
    card.addEventListener("click", () => {
      document
        .querySelectorAll(".preset-card")
        .forEach((c) => c.classList.remove("active"));
      card.classList.add("active");

      const preset = presetsManager.getPreset(card.dataset.preset);
      presetsManager.applyToUI(preset);
      renderer.updateSettings(preset);

      // Sync Pickers
      textColorPicker.setColor(preset.textColor);
      accentColorPicker.setColor(preset.accentColor);
    });
  });

  // Action Buttons
  document.getElementById("preview-btn").addEventListener("click", () => {
    if (typeof audioManager !== "undefined" && audioManager.isEnabled) {
      if (audioManager.ui.click) audioManager.ui.click.play();
      // Optional: Add a specific dramatic sound for the generator
    }
    renderer.restart();
    renderer.play();
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    const preset = presetsManager.getPreset("classic");
    presetsManager.applyToUI(preset);
    renderer.updateSettings(preset);
    document.getElementById("character-name").value = "VICTOR VON DOOM";
    renderer.updateSettings({ characterName: "VICTOR VON DOOM" });

    // Sync Pickers
    if (textColorPicker) textColorPicker.setColor(preset.textColor);
    if (accentColorPicker) accentColorPicker.setColor(preset.accentColor);
  });

  // Playback Controls
  document.getElementById("play-pause").addEventListener("click", () => {
    if (renderer.isPlaying) {
      renderer.pause();
      document.getElementById("play-pause").innerHTML =
        '<span class="icon">▶</span>';
    } else {
      renderer.play();
      document.getElementById("play-pause").innerHTML =
        '<span class="icon">⏸</span>';
    }
  });

  document.getElementById("restart").addEventListener("click", () => {
    renderer.restart();
  });

  // Renderer Callbacks for UI sync
  renderer.onUpdateCallback = (progress) => {
    const progressEl = document.getElementById("progress");
    const playhead = document.getElementById("playhead");
    const currentTimeEl = document.getElementById("current-time");

    if (progressEl && playhead && currentTimeEl) {
      const percent = progress * 100;
      progressEl.style.width = `${percent}%`;
      playhead.style.left = `${percent}%`;

      const currentSecs = (progress * renderer.settings.duration).toFixed(1);
      const m = Math.floor(currentSecs / 60);
      const s = (currentSecs % 60).toFixed(1);
      currentTimeEl.textContent = `${m}:${s.padStart(4, "0")}`;
    }
  };

  renderer.onCompleteCallback = () => {
    document.getElementById("play-pause").innerHTML =
      '<span class="icon">▶</span>';
  };

  // Export Buttons
  document
    .getElementById("export-gif-btn")
    .addEventListener("click", () => exporter.exportGIF());
  document
    .getElementById("export-mp4-btn")
    .addEventListener("click", () => exporter.exportMP4());
});
