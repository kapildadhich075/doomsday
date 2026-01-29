// "Will Return" Generator Logic
const generator = {
  canvas: document.getElementById("preview-canvas"),
  ctx: null,
  input: document.getElementById("character-name"),
  previewBtn: document.getElementById("preview-btn"),
  timeline: null,

  init() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    this.previewBtn.addEventListener("click", () => {
      const name = this.input.value.trim() || "STEVE ROGERS";
      this.playAnimation(name);
    });

    // Initial draw
    this.drawStatic("STEVE ROGERS");
  },

  drawStatic(name) {
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 72px 'Neo Sans Std', sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      name.toUpperCase(),
      this.canvas.width / 2,
      this.canvas.height / 2,
    );
  },

  playAnimation(name) {
    if (this.timeline) this.timeline.kill();
    this.timeline = gsap.timeline();

    const self = this;
    const canvas = this.canvas;
    const ctx = this.ctx;
    const upperName = name.toUpperCase();

    // 0.0s - 0.5s: Black screen
    this.timeline.to({}, { duration: 0.5 });

    // 0.5s - 2.0s: Character name fades in
    this.timeline.to(
      {},
      {
        duration: 1.5,
        onUpdate: function () {
          const progress = this.progress();
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.globalAlpha = progress;
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 72px 'Neo Sans Std', sans-serif";
          ctx.textAlign = "center";
          ctx.letterSpacing = "2px";
          ctx.fillText(upperName, canvas.width / 2, canvas.height / 2);
          ctx.globalAlpha = 1;
        },
      },
    );

    // 2.0s - 3.5s: Hold
    this.timeline.to({}, { duration: 1.5 });

    // 3.5s - 4.0s: Fade out
    this.timeline.to(
      {},
      {
        duration: 0.5,
        onUpdate: function () {
          const progress = 1 - this.progress();
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.globalAlpha = progress;
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 72px 'Neo Sans Std', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(upperName, canvas.width / 2, canvas.height / 2);
          ctx.globalAlpha = 1;
        },
      },
    );

    // 4.0s - 5.0s: WILL RETURN appears
    this.timeline.to(
      {},
      {
        duration: 1.0,
        onUpdate: function () {
          const progress = this.progress();
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.globalAlpha = progress;
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 96px 'Neo Sans Std', sans-serif";
          ctx.textAlign = "center";
          ctx.letterSpacing = "12px";
          ctx.fillText("WILL RETURN", canvas.width / 2, canvas.height / 2);
          ctx.globalAlpha = 1;

          // Slight scale effect
          const scale = 1 + 0.05 * progress;
          // Scaling is handled by the visual perception of the font size/spacing here
        },
      },
    );
  },

  // Mock export functionality
  exportGIF() {
    alert("GIF Generation started... (Demo Mode)");
  },

  exportMP4() {
    alert("MP4 Recording started... (Demo Mode)");
  },
};

window.addEventListener("DOMContentLoaded", () => generator.init());
document
  .getElementById("export-gif")
  .addEventListener("click", () => generator.exportGIF());
document
  .getElementById("export-mp4")
  .addEventListener("click", () => generator.exportMP4());
