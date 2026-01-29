// Presets Manager
const presetsManager = {
  presets: {
    classic: {
      layout: "line",
      fontFamily: "'Neo Sans Std', sans-serif",
      fontSize: 100,
      letterSpacing: 12,
      textColor: "#FFFFFF",
      accentColor: "#4A7C2C",
      effects: {
        vignette: true,
        scanlines: false,
        grain: false,
        textShadow: true,
      },
    },
    modern: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 120,
      letterSpacing: 15,
      textColor: "#FFFFFF",
      accentColor: "#00FF88",
      effects: {
        vignette: false,
        scanlines: true,
        grain: true,
        textShadow: true,
      },
    },
    comic: {
      fontFamily: "'Anton', sans-serif",
      fontSize: 110,
      letterSpacing: 5,
      textColor: "#FFFF00",
      accentColor: "#FF0000",
      effects: {
        vignette: true,
        scanlines: false,
        grain: true,
        textShadow: true,
      },
    },
    infinity: {
      fontFamily: "'Oswald', sans-serif",
      fontSize: 84,
      letterSpacing: 20,
      textColor: "#FFFFFF",
      accentColor: "#9B51E0",
      effects: {
        vignette: true,
        scanlines: true,
        grain: false,
        textShadow: true,
      },
    },
    multiverse: {
      fontFamily: "'Roboto Condensed', sans-serif",
      fontSize: 96,
      letterSpacing: 10,
      textColor: "#00FFFF",
      accentColor: "#FF00FF",
      effects: {
        vignette: true,
        scanlines: true,
        grain: true,
        textShadow: true,
      },
    },
    inline: {
      layout: "line",
      fontFamily: "'Neo Sans Std', sans-serif",
      fontSize: 50,
      letterSpacing: 10,
      textColor: "#FFFFFF",
      accentColor: "#4A7C2C",
      effects: {
        vignette: true,
        scanlines: false,
        grain: false,
        textShadow: true,
      },
    },
  },

  getPreset(name) {
    return this.presets[name] || this.presets.classic;
  },

  applyToUI(preset) {
    document.getElementById("font-family").value = preset.fontFamily;
    document.getElementById("font-size").value = preset.fontSize;
    document.getElementById("size-val").textContent = `${preset.fontSize}px`;
    document.getElementById("letter-spacing").value = preset.letterSpacing;
    document.getElementById("spacing-val").textContent =
      `${preset.letterSpacing}px`;

    // Update color pickers (will be handled in generator-core)
    document.getElementById("text-color-hex").value = preset.textColor;
    document.getElementById("accent-color-hex").value = preset.accentColor;

    // Update checkboxes
    document.getElementById("vignette-toggle").checked =
      preset.effects.vignette;
    document.getElementById("scanlines-toggle").checked =
      preset.effects.scanlines;
    document.getElementById("grain-toggle").checked = preset.effects.grain;
  },
};
