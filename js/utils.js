// Utility functions
const utils = {
  // Format numbers with leading zeros
  pad: (num) => num.toString().padStart(2, "0"),

  // Random integer between min and max
  randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),

  // Check if character name is valid
  isValidName: (name) => name.trim().length > 0 && name.length <= 30,

  // Calculate percentage of time passed
  calculateProgress: (start, target, current) => {
    const total = target - start;
    const passed = current - start;
    return Math.min(Math.max((passed / total) * 100, 0), 100);
  },

  // Share to X/Twitter
  shareToX: (text, url) => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(xUrl, "_blank");
  },

  // Share to Facebook
  shareToFB: (url) => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, "_blank");
  },
};
