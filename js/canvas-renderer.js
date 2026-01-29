// Advanced Canvas Animation Engine
class WillReturnRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.isPlaying = false;
    this.currentFrame = 0;
    this.startTime = 0;

    // Default Settings
    this.settings = {
      characterName: "VICTOR VON DOOM",
      fontFamily: "'Neo Sans Std', sans-serif",
      fontSize: 120,
      fontWeight: "bold",
      letterSpacing: 12,
      textColor: "#FFFFFF",
      accentColor: "#4A7C2C",
      bgColor: "#000000",
      duration: 5.0, // seconds
      fps: 30,
      effects: {
        vignette: true,
        scanlines: false,
        grain: false,
        textShadow: true,
      },
    };

    this.onUpdateCallback = null;
    this.onCompleteCallback = null;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    if (!this.isPlaying) this.render();
  }

  render(frame = this.currentFrame) {
    const totalFrames = this.settings.duration * this.settings.fps;
    const progress = Math.min(frame / totalFrames, 1);

    // Clear Canvas
    this.ctx.fillStyle = this.settings.bgColor;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Apply Effects (Pre-text)
    if (this.settings.effects.vignette) this.drawVignette();

    // Layout and Sequence
    if (this.settings.layout === "line") {
      this.renderLineLayout(progress);
    } else {
      this.renderPiecesLayout(progress);
    }

    // Apply Effects (Post-text)
    if (this.settings.effects.scanlines) this.drawScanlines();
    if (this.settings.effects.grain) this.drawGrain();

    if (this.onUpdateCallback) this.onUpdateCallback(progress);
  }

  renderPiecesLayout(progress) {
    // 5-Phase Cinematic Sequence
    const phases = [
      { text: this.settings.characterName, weight: "bold", sizeMult: 1 },
      { text: "WILL", weight: "900", sizeMult: 1.2 },
      { text: "RETURN", weight: "900", sizeMult: 1.2 },
      { text: "IN AVENGERS:", weight: "bold", sizeMult: 0.8 },
      { text: "DOOMSDAY", weight: "900", sizeMult: 1.5 },
    ];

    const phaseDuration = 1 / phases.length; // 0.2 each
    const fadeDuration = 0.05; // Overlap for cross-dissolve

    phases.forEach((phase, i) => {
      const phaseStart = i * phaseDuration;
      const phaseEnd = (i + 1) * phaseDuration;

      let alpha = 0;
      let scale = 1;

      if (
        progress >= phaseStart - fadeDuration &&
        progress <= phaseEnd + fadeDuration
      ) {
        // Calculate phase-specific progress (0 to 1)
        const phaseProgress = (progress - phaseStart) / phaseDuration;

        if (progress < phaseStart + fadeDuration) {
          alpha = (progress - (phaseStart - fadeDuration)) / (fadeDuration * 2);
        } else if (progress > phaseEnd - fadeDuration) {
          alpha =
            1 - (progress - (phaseEnd - fadeDuration)) / (fadeDuration * 2);
        } else {
          alpha = 1;
        }

        // Cinematic Zoom: Text grows slightly during its window
        scale = 1 + (phaseProgress + 0.5) * 0.1;

        if (alpha > 0) {
          this.drawText(
            phase.text,
            alpha,
            phase.sizeMult * scale,
            phase.weight,
          );
        }
      }
    });
  }

  renderLineLayout(progress) {
    const parts = [
      { text: this.settings.characterName, highlight: true },
      { text: " WILL", highlight: true },
      { text: " RETURN", highlight: true },
      { text: " IN AVENGERS:", highlight: false },
      { text: " DOOMSDAY", highlight: false },
    ];

    // Reveal over 75% of duration, hold for last 25% for a clean "Avengers/Doomsday" finish
    const revealEnd = 0.75;
    const phaseDuration = revealEnd / parts.length;
    const fadeDuration = 0.05;

    // Cinematic Zoom
    const scale = 1 + progress * 0.05;

    this.ctx.save();

    // Scale size based on canvas width (approx 1080p target)
    const baseSize = this.settings.fontSize * 0.6 * scale;
    const spacing = this.settings.letterSpacing * 0.7;
    this.ctx.font = `bold ${baseSize}px ${this.settings.fontFamily}`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // Measure total width for centering
    const fullText = parts.map((p) => p.text.toUpperCase()).join("");
    const totalWidth = this.measureSpacedText(fullText, spacing);

    let startX = this.width / 2 - totalWidth / 2;

    parts.forEach((part, i) => {
      const phaseStart = i * phaseDuration;
      let alpha = 0;

      if (progress >= phaseStart) {
        alpha = Math.min((progress - phaseStart) / fadeDuration, 1);
      }

      if (alpha > 0) {
        this.ctx.save();

        // Final Crescendo: As we reach the final part (Doomsday),
        // transition the entire line to full brightness
        const crescendoStart = 0.6; // Starts when "IN AVENGERS:" appears
        const crescendoProgress = Math.max(
          0,
          (progress - crescendoStart) / (1 - crescendoStart),
        );

        // Highlight logic: Parts are either Highlighted (1.0) or Dimmed (transitions 0.4 -> 1.0)
        const baseOpacity = part.highlight
          ? 1.0
          : 0.4 + 0.6 * crescendoProgress;

        this.ctx.globalAlpha = alpha * baseOpacity;
        this.ctx.fillStyle = this.settings.textColor;

        if (this.settings.effects.textShadow) {
          this.ctx.shadowColor = this.settings.accentColor;
          this.ctx.shadowBlur =
            part.highlight || crescendoProgress > 0.5 ? 20 * alpha : 0;
        }

        const partText = part.text.toUpperCase();
        this.drawSpacedText(partText, startX, this.height / 2, spacing);
        this.ctx.restore();

        startX += this.measureSpacedText(partText, spacing) + spacing;
      } else {
        startX +=
          this.measureSpacedText(part.text.toUpperCase(), spacing) + spacing;
      }
    });

    this.ctx.restore();
  }

  measureSpacedText(text, spacing) {
    const chars = text.split("");
    return chars.reduce(
      (acc, char) => acc + this.ctx.measureText(char).width + spacing,
      -spacing,
    );
  }

  drawSpacedText(text, x, y, spacing) {
    const chars = text.split("");
    let currentX = x;
    chars.forEach((char) => {
      const w = this.ctx.measureText(char).width;
      this.ctx.fillText(char, currentX + w / 2, y);
      currentX += w + spacing;
    });
  }

  drawText(text, alpha, sizeMult = 1, fontWeight = "bold") {
    this.ctx.save();

    const size = this.settings.fontSize * sizeMult;
    const spacing =
      this.settings.letterSpacing *
      (sizeMult > 1 ? 1 + (sizeMult - 1) * 0.5 : sizeMult);

    this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    this.ctx.font = `${fontWeight} ${size}px ${this.settings.fontFamily}`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = this.settings.textColor;

    if (this.settings.effects.textShadow) {
      this.ctx.shadowColor = this.settings.accentColor;
      this.ctx.shadowBlur = 20 * alpha;
    }

    // Draw with letter spacing
    const chars = text.toUpperCase().split("");
    const charWidths = chars.map((c) => this.ctx.measureText(c).width);
    const totalWidth =
      charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * spacing;

    let startX = this.width / 2 - totalWidth / 2;
    chars.forEach((char, i) => {
      this.ctx.fillText(char, startX + charWidths[i] / 2, this.height / 2);
      startX += charWidths[i] + spacing;
    });

    this.ctx.restore();
  }

  drawVignette() {
    const grad = this.ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      0,
      this.width / 2,
      this.height / 2,
      this.width / 1.2,
    );
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.8)");
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawScanlines() {
    this.ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let i = 0; i < this.height; i += 4) {
      this.ctx.fillRect(0, i, this.width, 1);
    }
  }

  drawGrain() {
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = (Math.random() - 0.5) * 40;
      data[i] += val;
      data[i + 1] += val;
      data[i + 2] += val;
    }
    this.ctx.putImageData(imageData, 0, 0);
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.startTime = performance.now();
    this.animate();
  }

  pause() {
    this.isPlaying = false;
  }

  restart() {
    this.currentFrame = 0;
    this.render();
    if (this.isPlaying) this.startTime = performance.now();
  }

  animate(time) {
    if (!this.isPlaying) return;

    const elapsed = (time - this.startTime) / 1000;
    const totalFrames = this.settings.duration * this.settings.fps;
    this.currentFrame = Math.floor(elapsed * this.settings.fps);

    if (this.currentFrame >= totalFrames) {
      this.currentFrame = totalFrames;
      this.render();
      this.isPlaying = false;
      if (this.onCompleteCallback) this.onCompleteCallback();
      return;
    }

    this.render();
    requestAnimationFrame((t) => this.animate(t));
  }
}
