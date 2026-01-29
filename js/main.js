// Main UI Controller
const mainUI = {
  facts: [
    {
      text: "Robert Downey Jr. was announced to play Doctor Doom at SDCC 2024.",
      source: "Marvel Studios",
    },
    {
      text: "Avengers: Doomsday was previously titled Avengers: The Kang Dynasty.",
      source: "Variety",
    },
    {
      text: "The Russo Brothers (Joe and Anthony) are returning to direct both Doomsday and Secret Wars.",
      source: "The Hollywood Reporter",
    },
    {
      text: "Doctor Doom first appeared in Fantastic Four #5 in 1962.",
      source: "Marvel Comics",
    },
    {
      text: "The movie is set to release on December 18, 2026.",
      source: "Disney Release Calendar",
    },
  ],

  init() {
    this.initGSAPTransitions();
    this.initFactCard();
    this.initAccordion();
    this.initParticles();
    this.initEasterEggs();
  },

  initGSAPTransitions() {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(".hero-title", { opacity: 1, y: 0, duration: 1.5, delay: 0.5 })
      .to(".countdown-container", { opacity: 1, scale: 1, duration: 1 }, "-=1")
      .to(".hero-subtitle", { opacity: 1, y: 0, duration: 1 }, "-=0.5")
      .to(".hero-cta", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
      .to(".side-nav", { x: 0, duration: 0.8 }, "-=0.5")
      .to(".mcu-fact-card", { opacity: 1, x: 0, duration: 0.8 }, "-=0.5");

    // Scroll trigger for generator section
    gsap.from(".generator-section", {
      scrollTrigger: {
        trigger: ".generator-section",
        start: "top 80%",
      },
      opacity: 0,
      y: 50,
      duration: 1.2,
    });
  },

  initFactCard() {
    const card = document.getElementById("fact-card");
    const closeBtn = document.getElementById("close-fact");
    const content = document.getElementById("fact-content");
    const source = document.getElementById("fact-source");

    // Load random fact
    const randomFact =
      this.facts[Math.floor(Math.random() * this.facts.length)];
    content.textContent = randomFact.text;
    source.textContent = `Source: ${randomFact.source}`;

    closeBtn.addEventListener("click", () => {
      gsap.to(card, {
        opacity: 0,
        x: 100,
        duration: 0.5,
        onComplete: () => (card.style.display = "none"),
      });
    });
  },

  initAccordion() {
    const headers = document.querySelectorAll(".accordion-header");
    headers.forEach((header) => {
      header.addEventListener("click", () => {
        const item = header.parentElement;
        const isActive = item.classList.contains("active");

        // Close all
        document
          .querySelectorAll(".accordion-item")
          .forEach((i) => i.classList.remove("active"));

        if (!isActive) {
          item.classList.add("active");
        }
      });
    });
  },

  initParticles() {
    if (typeof particlesJS !== "undefined") {
      particlesJS("particles-js", {
        particles: {
          number: { value: 100, density: { enable: true, value_area: 800 } },
          color: { value: "#4a7c2c" },
          shape: { type: "circle" },
          opacity: { value: 0.4, random: true },
          size: { value: 3, random: true },
          line_linked: { enable: false },
          move: {
            enable: true,
            speed: 1,
            direction: "top",
            random: true,
            out_mode: "out",
          },
        },
        interactivity: {
          events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" },
          },
          modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { particles_nb: 4 },
          },
        },
      });
    }
  },

  initEasterEggs() {
    // Konami Code
    let konami = [];
    const code = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];

    window.addEventListener("keydown", (e) => {
      konami.push(e.key);
      konami = konami.slice(-10);
      if (konami.join("") === code.join("")) {
        this.triggerEasterEgg();
      }
    });
  },

  triggerEasterEgg() {
    alert("SUCCESS IS MINE! - Victor von Doom");
    document.body.style.filter = "hue-rotate(90deg)";
    setTimeout(() => (document.body.style.filter = "none"), 5000);
  },
};

window.addEventListener("DOMContentLoaded", () => mainUI.init());

function shareFact(platform) {
  const fact = document.getElementById("fact-content").textContent;
  const url = window.location.href;
  if (platform === "x") utils.shareToX(fact, url);
  else if (platform === "fb") utils.shareToFB(url);
}
