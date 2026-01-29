// Export Handler for GIF and WebM
class ExportHandler {
  constructor(renderer) {
    this.renderer = renderer;
  }

  async exportGIF() {
    // Show loading overlay
    const overlay = document.getElementById('loading-overlay');
    const title = document.getElementById('loading-title');
    const message = document.getElementById('loading-message');
    const progressBar = document.getElementById('loading-progress-bar');
    const percentage = document.getElementById('loading-percentage');

    overlay.style.display = 'flex';
    title.textContent = 'Creating GIF';
    message.textContent = 'Capturing frames...';
    progressBar.style.width = '0%';
    percentage.textContent = '0%';

    const btn = document.getElementById("export-gif-btn");
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

      const progress = Math.round((i / totalFrames) * 50); // 50% for capturing
      progressBar.style.width = progress + '%';
      percentage.textContent = progress + '%';
      await new Promise(resolve => setTimeout(resolve, 0)); // Allow UI update
    }

    message.textContent = 'Rendering GIF...';

    gif.on("progress", (p) => {
      const progress = 50 + Math.round(p * 50); // 50-100% for rendering
      progressBar.style.width = progress + '%';
      percentage.textContent = progress + '%';
    });

    gif.on("finished", (blob) => {
      const fileName = `${this.renderer.settings.characterName.replace(/\s+/g, "_")}_returning.gif`;
      saveAs(blob, fileName);
      
      // Success state
      title.textContent = 'Success!';
      message.textContent = 'Your GIF has been downloaded';
      progressBar.style.width = '100%';
      percentage.textContent = '100%';
      
      setTimeout(() => {
        overlay.style.display = 'none';
        btn.disabled = false;
        this.renderer.render(); // Reset to current state
      }, 1500);
    });

    gif.render();
  }

  async exportMP4() {
    // Show loading overlay
    const overlay = document.getElementById('loading-overlay');
    const title = document.getElementById('loading-title');
    const message = document.getElementById('loading-message');
    const progressBar = document.getElementById('loading-progress-bar');
    const percentage = document.getElementById('loading-percentage');

    overlay.style.display = 'flex';
    title.textContent = 'Creating Video';
    message.textContent = 'Recording animation...';
    progressBar.style.width = '0%';
    percentage.textContent = '0%';

    const btn = document.getElementById("export-mp4-btn");
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
            
            title.textContent = 'Downloaded WebM';
            message.textContent = 'MP4 conversion unavailable in file:// mode';
            progressBar.style.width = '100%';
            
            setTimeout(() => {
              overlay.style.display = 'none';
              btn.disabled = false;
              this.renderer.render();
            }, 2000);
            return;
          }

          // Convert WebM to MP4 using FFmpeg.wasm
          message.textContent = 'Converting to MP4...';
          progressBar.style.width = '70%';
          percentage.textContent = '70%';

          const { FFmpeg } = FFmpegWASM;
          const ffmpeg = new FFmpeg();

          try {
            // Use absolute paths from root for reliability in Workers
            await ffmpeg.load({
              coreURL: "/js/ffmpeg/ffmpeg-core.js",
              wasmURL: "/js/ffmpeg/ffmpeg-core.wasm",
            });
          } catch (loadError) {
            // If loading FFmpeg core fails (often due to SecurityError when using file://), fallback to WebM
            console.error("FFmpeg load failed:", loadError);
            const fileNameWebm = `${this.renderer.settings.characterName.replace(/\s+/g, "_")}_returning.webm`;
            saveAs(webmBlob, fileNameWebm);
            
            title.textContent = 'Downloaded WebM';
            message.textContent = 'MP4 conversion unavailable';
            progressBar.style.width = '100%';
            
            setTimeout(() => {
              overlay.style.display = 'none';
              btn.disabled = false;
              this.renderer.render();
            }, 2000);
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

          title.textContent = 'Success!';
          message.textContent = 'Your video has been downloaded';
          progressBar.style.width = '100%';
          percentage.textContent = '100%';
          
          setTimeout(() => {
            overlay.style.display = 'none';
            btn.disabled = false;
          }, 1500);
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
              title.textContent = 'Downloaded WebM';
              message.textContent = 'MP4 conversion unavailable';
            } catch (saveErr) {
              console.error("Failed to save fallback WebM:", saveErr);
              title.textContent = 'Export Failed';
              message.textContent = 'Could not save video file';
            }

            setTimeout(() => {
              overlay.style.display = 'none';
              btn.disabled = false;
              this.renderer.render();
            }, 2000);
          } else {
            title.textContent = 'Export Failed';
            message.textContent = 'An error occurred during conversion';
            setTimeout(() => {
              overlay.style.display = 'none';
              btn.disabled = false;
            }, 2000);
          }
        }
      };

      mediaRecorder.start();
      this.renderer.restart();
      this.renderer.play();

      // Stop when animation completes
      this.renderer.onCompleteCallback = () => {
        progressBar.style.width = '50%';
        percentage.textContent = '50%';
        setTimeout(() => {
          mediaRecorder.stop();
          this.renderer.onCompleteCallback = null;
        }, 500);
      };
    } catch (err) {
      console.error("Video Export Error:", err);
      title.textContent = 'Export Failed';
      message.textContent = err.message || 'An error occurred';
      setTimeout(() => {
        overlay.style.display = 'none';
        btn.disabled = false;
      }, 2000);
    }
  }
}
