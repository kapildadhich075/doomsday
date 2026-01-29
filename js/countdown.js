// Countdown Timer Logic
const countdown = {
  targetDate: new Date("2026-12-18T00:00:00Z").getTime(),
  startDate: new Date("2024-07-27T00:00:00Z").getTime(), // SDCC Announcement Date
  elements: {
    months: document.getElementById("months"),
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds"),
    statDays: document.getElementById("stat-days"),
    progressFill: document.getElementById("progress-fill"),
  },

  init() {
    this.update();
    setInterval(() => this.update(), 1000);

    // Add pulse class to container
    document.querySelector(".countdown-container").classList.add("pulse");
  },

  update() {
    const now = new Date().getTime();
    const distance = this.targetDate - now;

    if (distance < 0) {
      this.handleExpiry();
      return;
    }

    // Calculations
    const months = Math.floor(distance / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor(
      (distance % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24),
    );
    const totalDays = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update numbers
    this.animateNumber("months", months);
    this.animateNumber("days", days);
    this.animateNumber("hours", hours);
    this.animateNumber("minutes", minutes);
    this.animateNumber("seconds", seconds);

    // Update Stats
    if (this.elements.statDays) {
      this.elements.statDays.textContent = totalDays;
    }

    // Update Progress
    const progress = utils.calculateProgress(
      this.startDate,
      this.targetDate,
      now,
    );
    if (this.elements.progressFill) {
      this.elements.progressFill.style.width = `${progress}%`;
    }

    // Urgent state check
    if (totalDays < 30) {
      document.body.classList.add("urgent");
    }
  },

  animateNumber(id, value) {
    const el = this.elements[id];
    if (!el) return;

    const currentValue = parseInt(el.textContent);
    const newValue = utils.pad(value);

    if (currentValue !== value) {
      gsap.to(el, {
        duration: 0.5,
        opacity: 0,
        y: -10,
        onComplete: () => {
          el.textContent = newValue;
          gsap.to(el, {
            duration: 0.5,
            opacity: 1,
            y: 0,
          });
        },
      });
    }
  },

  handleExpiry() {
    const container = document.querySelector(".countdown-container");
    container.innerHTML =
      '<h2 class="arrived" style="font-family: var(--font-heading); font-size: 48px; color: var(--highlight-green); letter-spacing: 4px;">DOOMSDAY HAS ARRIVED</h2>';
    document.querySelector(".hero-title").textContent = "DOOMSDAY IS HERE";
  },
};

window.addEventListener("DOMContentLoaded", () => countdown.init());
