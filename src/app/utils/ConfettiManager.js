import confetti from "canvas-confetti";

export class ConfettiManager {
  // Basic confetti burst
  static burst(origin = { x: 0.5, y: 0.5 }, options = {}) {
    const defaults = {
      particleCount: 50,
      spread: 45,
      startVelocity: 45,
      decay: 0.9,
      gravity: 1,
      drift: 0,
      flat: false,
      ticks: 200,
      colors: [
        "#26ccff",
        "#a25afd",
        "#ff5e7e",
        "#88ff5a",
        "#fcff42",
        "#ffa62d",
        "#ff36ff",
      ],
      shapes: ["square", "circle", "star"],
      zIndex: 100,
      scalar: 1,
    };

    return confetti({
      ...defaults,
      ...options,
      origin,
    });
  }

  // Todo completion celebration
  static celebrateTodoCompletion(containerElement) {
    if (!containerElement) return;

    const rect = containerElement.getBoundingClientRect();
    const origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };

    // Multiple bursts for celebration effect
    this.burst(origin, {
      particleCount: 30,
      spread: 60,
      startVelocity: 30,
      colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#95E1D3", "#FFA07A"],
    });

    // Second burst after delay
    setTimeout(() => {
      this.burst(origin, {
        particleCount: 20,
        spread: 45,
        startVelocity: 25,
        colors: ["#FFD700", "#FF6B6B", "#4ECDC4"],
      });
    }, 300);
  }

  // Level up celebration with fireworks
  static celebrateLevelUp(levelElement) {
    if (!levelElement) return;

    // Use fireworks effect for level up
    this.fireworks();
  }

  // Streak milestone celebration with fire side cannons
  static celebrateStreakMilestone(streakElement) {
    if (!streakElement) return;

    // Use fire-themed side cannons effect for streak milestone
    this.fireSideCannons();
  }

  // Fireworks effect
  static fireworks() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
    };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Left side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });

      // Right side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }

  // Side cannons effect
  static sideCannons(colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"]) {
    const end = Date.now() + 3 * 1000;

    const frame = () => {
      if (Date.now() > end) return;

      // Left cannon
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });

      // Right cannon
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  }

  // Fire-themed side cannons for streak milestone
  static fireSideCannons() {
    const fireColors = ["#FF4500", "#FF6347", "#FFD700", "#FF8C00", "#FFA500"];
    this.sideCannons(fireColors);
  }

  // Stars effect
  static stars() {
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ["circle"],
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  }

  // Sad emoji confetti effect - falls from top when accuracy is low
  static sadEmojis() {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const sadEmojis = ["😢", "😞", "😔", "😟", "😕", "😓"];
    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    // Create a canvas overlay for emoji rendering
    let canvas = document.getElementById("emoji-confetti-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "emoji-confetti-canvas";
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "9999";
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const createEmoji = () => {
      particles.push({
        emoji: sadEmojis[Math.floor(Math.random() * sadEmojis.length)],
        x: randomInRange(0, canvas.width),
        y: 0,
        vx: randomInRange(-1, 1),
        vy: randomInRange(1, 3),
        size: randomInRange(20, 35),
      });
    };

    const animate = () => {
      if (Date.now() > animationEnd && particles.length === 0) {
        if (canvas && canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create new emojis
      if (Date.now() < animationEnd && Math.random() > 0.7) {
        createEmoji();
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // slower gravity

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.font = `${p.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();

        // Remove particles that are off screen
        if (p.y > canvas.height || p.x < -50 || p.x > canvas.width + 50) {
          particles.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    };

    // Start animation
    createEmoji();
    animate();
  }
}

export default ConfettiManager;
