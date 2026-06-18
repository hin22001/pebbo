import gsap from "gsap";
import ConfettiManager from "./ConfettiManager";

export class AnimationController {
  // XP Progress
  static animateProgressBar(element, percentage) {
    return gsap.to(element, {
      width: `${percentage}%`,
      duration: 1,
      ease: "power2.out",
    });
  }

  // Stats Counter
  static animateCounter(element, finalValue) {
    return gsap.to(element, {
      textContent: finalValue,
      duration: 1.5,
      snap: { textContent: 1 },
      ease: "power2.out",
    });
  }

  // Stats Counter for percentages (preserves decimals)
  static animateCounterPercentage(element, finalValue) {
    const current = { value: 0 };
    return gsap.to(current, {
      value: finalValue,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: () => {
        element.textContent = current.value.toFixed(2) + "%";
      },
    });
  }

  // Button Click
  static animateButtonClick(element, callback) {
    const timeline = gsap.timeline();
    timeline.to(element, { scale: 0.95, duration: 0.1 }).to(element, {
      scale: 1,
      duration: 0.2,
      ease: "back.out(1.7)",
      onComplete: callback,
    });
    return timeline;
  }

  // Todo Check
  static animateTodoCheck(checkboxElement, rowElement) {
    const timeline = gsap.timeline();
    timeline
      .to(checkboxElement, { scale: 0, duration: 0.2 })
      .to(checkboxElement, {
        scale: 1,
        duration: 0.3,
        ease: "back.out(1.7)",
      })
      .to(
        rowElement,
        {
          x: 10,
          opacity: 0.7,
          duration: 0.2,
        },
        "-=0.1"
      );
    return timeline;
  }

  // Icon Hover
  static animateIconHover(element) {
    return gsap.to(element, {
      rotation: 5,
      scale: 1.1,
      duration: 0.2,
      ease: "power2.out",
    });
  }

  static resetIconHover(element) {
    return gsap.to(element, {
      rotation: 0,
      scale: 1,
      duration: 0.2,
    });
  }

  // Stats Icon Bounce
  static animateStatsIcon(element) {
    return gsap.to(element, {
      scale: 1.1,
      y: -5,
      duration: 0.3,
      ease: "back.out(1.7)",
    });
  }

  static resetStatsIcon(element) {
    return gsap.to(element, {
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  // Shimmer Effect for Progress Bar
  static createShimmerEffect(element) {
    const shimmer = document.createElement("div");
    shimmer.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: shimmer 1.5s ease-in-out;
    `;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
      }
    `;
    document.head.appendChild(style);

    element.style.position = "relative";
    element.appendChild(shimmer);

    setTimeout(() => {
      element.removeChild(shimmer);
    }, 1500);
  }

  // Confetti Generator (using Magic UI confetti)
  static createConfetti(
    containerElement,
    count = 15,
    origin = { x: 50, y: 0 }
  ) {
    if (!containerElement) return;

    const rect = containerElement.getBoundingClientRect();
    const confettiOrigin = {
      x: (rect.left + (rect.width * origin.x) / 100) / window.innerWidth,
      y: (rect.top + (rect.height * origin.y) / 100) / window.innerHeight,
    };

    ConfettiManager.burst(confettiOrigin, {
      particleCount: count,
      spread: 60,
      startVelocity: 30,
      colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#95E1D3", "#FFA07A"],
    });
  }

  // Todo Completion Celebration
  static celebrateTodoCompletion(todoContainer, todoRows) {
    if (!todoContainer || !todoRows || todoRows.length === 0) return;

    const tl = gsap.timeline();

    // Bounce all rows
    tl.to(todoRows, {
      y: -10,
      duration: 0.3,
      stagger: 0.1,
      ease: "power2.out",
    }).to(todoRows, {
      y: 0,
      duration: 0.3,
      stagger: 0.1,
      ease: "bounce.out",
    });

    // Glow effect on container
    gsap.to(todoContainer, {
      boxShadow: "0 0 30px rgba(255, 215, 0, 0.6)",
      duration: 0.5,
      yoyo: true,
      repeat: 3,
    });

    // Trigger Magic UI confetti
    setTimeout(() => {
      ConfettiManager.celebrateTodoCompletion(todoContainer);
    }, 300);

    return tl;
  }

  // Level Up Celebration
  static celebrateLevelUp(levelElement, starElement, containerElement) {
    if (!levelElement) return;

    const tl = gsap.timeline();
    tl.to(levelElement, {
      scale: 1.5,
      color: "#FFD700",
      duration: 0.3,
      ease: "back.out(2)",
    })
      .to(levelElement, { scale: 1.2, duration: 0.2 })
      .to(levelElement, {
        scale: 1,
        color: "#FF5000",
        duration: 0.2,
      });

    // Star burst in parallel
    if (starElement) {
      gsap.to(starElement, {
        scale: 1.5,
        rotation: 360,
        duration: 0.8,
        ease: "back.out(1.7)",
      });
    }

    // Trigger Magic UI confetti
    if (levelElement) {
      setTimeout(() => {
        ConfettiManager.celebrateLevelUp(levelElement);
      }, 200);
    }

    return tl;
  }

  // Streak Increment Animation
  static animateStreakIncrement(
    fireElement,
    circleElement,
    numberElement,
    value
  ) {
    const tl = gsap.timeline();

    // Fire icon pulse
    if (fireElement) {
      tl.to(fireElement, {
        scale: 1.3,
        filter: "brightness(1.5)",
        duration: 0.3,
        ease: "back.out(2)",
      })
        .to(fireElement, {
          scale: 1.1,
          filter: "brightness(1)",
          duration: 0.2,
        })
        .to(fireElement, { scale: 1, duration: 0.2 });
    }

    // Circle glow
    if (circleElement) {
      gsap.to(circleElement, {
        boxShadow: "0 0 20px rgba(255, 140, 0, 0.8)",
        duration: 0.5,
        yoyo: true,
        repeat: 1,
      });
    }

    // Number counter
    if (numberElement) {
      this.animateCounter(numberElement, value);
    }

    return tl;
  }

  // Streak Milestone (Day 7)
  static celebrateStreakMilestone(circleElements, trophyElement) {
    const tl = gsap.timeline();

    // All circles pulse in sequence
    if (circleElements && circleElements.length > 0) {
      tl.to(circleElements, {
        scale: 1.15,
        duration: 0.3,
        stagger: 0.1,
        ease: "power2.out",
        yoyo: true,
        repeat: 1,
      });
    }

    // Trophy bounce (enhance existing)
    if (trophyElement) {
      gsap.to(trophyElement, {
        scale: 1.2,
        rotation: 15,
        duration: 0.4,
        ease: "elastic.out(1, 0.3)",
        yoyo: true,
        repeat: 1,
      });

      // Trigger Magic UI confetti for streak milestone
      setTimeout(() => {
        ConfettiManager.celebrateStreakMilestone(trophyElement);
      }, 200);
    }

    return tl;
  }
}

export default AnimationController;
