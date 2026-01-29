// Export Handler for GIF and WebM
class ExportHandler {
  constructor(renderer) {
    this.renderer = renderer;
  }

  async exportGIF() {
    const btn = document.getElementById("export-gif-btn");
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="icon">⌛</span> Capturing...';
    btn.disabled = true;

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: this.renderer.width,
      height: this.renderer.height,
      workerScript:
        "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js",
    });

    const totalFrames =
      this.renderer.settings.duration * this.renderer.settings.fps;
    const delay = 1000 / this.renderer.settings.fps;

    for (let i = 0; i <= totalFrames; i++) {
      this.renderer.render(i);
      gif.addFrame(this.renderer.canvas, { copy: true, delay: delay });

      const progress = Math.round((i / totalFrames) * 100);
      btn.innerHTML = `<span class="icon">⌛</span> Capturing ${progress}%`;
    }

    gif.on("finished", (blob) => {
      const fileName = `${this.renderer.settings.characterName.replace(/\s+/g, "_")}_returning.gif`;
      saveAs(blob, fileName);
      btn.innerHTML = originalText;
      btn.disabled = false;
      this.renderer.render(); // Reset to current state
    });

    btn.innerHTML = '<span class="icon">⌛</span> Rendering GIF...';
    gif.render();
  }

  async exportMP4() {
    const btn = document.getElementById("export-mp4-btn");
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="icon">🎥</span> Recording...';
    btn.disabled = true;

    try {
      const stream = this.renderer.canvas.captureStream(
        this.renderer.settings.fps,
      );

      // Try to use MP4 if supported, otherwise fall back to WebM
      const mimeTypes = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];

      let selectedMimeType = "";
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error("No supported video format found");
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 5000000,
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          const webmBlob = new Blob(chunks, { type: selectedMimeType });

          // If page is opened via file:// or has origin 'null', loading remote Workers will fail.
          if (
            window.location.protocol === "file:" ||
            window.origin === "null"
          ) {
            console.warn(
              "MP4 conversion requires the page to be served over HTTP. Falling back to WebM download.",
            );
            const fileNameWebm = `${this.renderer.settings.characterName.replace(/\s+/g, "_")}_returning.webm`;
            saveAs(webmBlob, fileNameWebm);
            btn.innerHTML = originalText;
            btn.disabled = false;
            this.renderer.render();
            return;
          }

          // Convert WebM to MP4 using FFmpeg.wasm
          btn.innerHTML = '<span class="icon">⌛</span> Converting to MP4...';

          const { FFmpeg } = FFmpegWASM;
          const ffmpeg = new FFmpeg();

          try {
            await ffmpeg.load({
              coreURL:
                "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js",
            });
          } catch (loadError) {
            // If loading FFmpeg core fails (often due to SecurityError when using file://), fallback to WebM
            console.error("FFmpeg load failed:", loadError);
            const fileNameWebm = `${this.renderer.settings.characterName.replace(/\s+/g, "_")}_returning.webm`;
            saveAs(webmBlob, fileNameWebm);
            btn.innerHTML = "❌ Conversion Unavailable (downloaded WebM)";
            setTimeout(() => {
              btn.innerHTML = originalText;
              btn.disabled = false;
              this.renderer.render();
            }, 4000);
            return;
          }

          // Write WebM file to FFmpeg virtual filesystem
          const webmData = new Uint8Array(await webmBlob.arrayBuffer());
          await ffmpeg.writeFile("input.webm", webmData);

          // Convert to MP4
          await ffmpeg.exec([
            "-i",
            "input.webm",
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-crf",
            "22",
            "output.mp4",
          ]);

          // Read the output MP4
          const mp4Data = await ffmpeg.readFile("output.mp4");
          const mp4Blob = new Blob([mp4Data.buffer], { type: "video/mp4" });

          const fileName = `${this.renderer.settings.characterName.replace(/\s+/g, "_")}_returning.mp4`;
          saveAs(mp4Blob, fileName);

          btn.innerHTML = originalText;
          btn.disabled = false;
        } catch (conversionError) {
          console.error("Conversion Error:", conversionError);

          // If conversion failed due to SecurityError/Worker restrictions, fall back to WebM download
          if (
            conversionError &&
            (conversionError.name === "SecurityError" ||
              /Worker/.test(conversionError.message))
          ) {
            console.warn(
              "Falling back to downloading WebM due to conversion error.",
            );
            const fileNameWebm = `${this.renderer.settings.characterName.replace(/\s+/g, "_")}_returning.webm`;
            try {
              saveAs(webmBlob, fileNameWebm);
              btn.innerHTML = "❌ Conversion Unavailable (downloaded WebM)";
            } catch (saveErr) {
              console.error("Failed to save fallback WebM:", saveErr);
              btn.innerHTML = "❌ Conversion Failed";
            }

            setTimeout(() => {
              btn.innerHTML = originalText;
              btn.disabled = false;
              this.renderer.render();
            }, 4000);
          } else {
            btn.innerHTML = "❌ Conversion Failed";
            setTimeout(() => {
              btn.innerHTML = originalText;
              btn.disabled = false;
            }, 3000);
          }
        }
      };

      mediaRecorder.start();
      this.renderer.restart();
      this.renderer.play();

      // Stop when animation completes
      this.renderer.onCompleteCallback = () => {
        setTimeout(() => {
          mediaRecorder.stop();
          this.renderer.onCompleteCallback = null;
        }, 500);
      };
    } catch (err) {
      console.error("Video Export Error:", err);
      btn.innerHTML = "❌ Export Failed";
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 3000);
    }
  }
}
