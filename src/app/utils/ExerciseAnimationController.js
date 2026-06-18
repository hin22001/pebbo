import gsap from "gsap";
// ConfettiManager removed for result reveal animations (no confetti on correct answers)

/**
 * ExerciseAnimationController
 * Handles all animations for the Exercise/Question page
 */
class ExerciseAnimationController {
  /**
   * 3.1 - Category Card Hover Animation
   * @param {HTMLElement} cardElement - The category card element
   * @param {boolean} isHovering - Whether mouse is hovering
   * @param {boolean} isSelected - Whether the card is currently selected
   */
  static animateCategoryCardHover(cardElement, isHovering, isSelected) {
    if (!cardElement) return;

    // Kill existing hover/selection tweens to avoid conflicts
    gsap.killTweensOf(cardElement, "scale,boxShadow,filter");

    if (isHovering) {
      gsap.to(cardElement, {
        scale: isSelected ? 1.03 : 1.015, // Reduced scale to avoid overlap
        boxShadow: isSelected
          ? "0 8px 25px rgba(255, 80, 0, 0.4)"
          : "0 8px 20px rgba(255, 80, 0, 0.15)",
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      // Return to the appropriate state base scale
      gsap.to(cardElement, {
        scale: isSelected ? 1.02 : 1,
        boxShadow: isSelected
          ? "0 0 20px rgba(255, 80, 0, 0.3)"
          : "0 2px 8px rgba(0, 0, 0, 0.1)",
        filter: isSelected ? "none" : "grayscale(0)",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }

  /**
   * 3.1 - Category Card Selection Animation
   * @param {HTMLElement} cardElement - The category card element
   * @param {boolean} isSelected - Whether card is selected
   */
  static animateCategoryCardSelection(cardElement, isSelected) {
    if (!cardElement) return;

    console.log(`🎯 Category Card ${isSelected ? "Selected" : "Deselected"}`);

    // Kill any active animations on this element to prevent overlap
    gsap.killTweensOf(cardElement);

    if (isSelected) {
      gsap.to(cardElement, {
        scale: 1.02, // Reduced from 1.05 to prevent overlap
        boxShadow: "0 0 20px rgba(255, 80, 0, 0.3)",
        filter: "none",
        duration: 0.4,
        ease: "back.out(1.7)",
      });
    } else {
      gsap.to(cardElement, {
        scale: 0.99, // Less extreme shrink
        filter: "grayscale(0.3)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          // Return to neutral scale after "shrink" effect
          gsap.to(cardElement, {
            scale: 1,
            duration: 0.2,
          });
        },
      });
    }
  }

  /**
   * 3.1 - Staggered reveal of category cards on load
   * @param {Array<HTMLElement>} cardElements - Array of card elements
   */
  static animateCategoryCardsReveal(cardElements) {
    if (!cardElements || cardElements.length === 0) return;

    console.log(
      `🎯 Revealing ${cardElements.length} category cards with stagger`
    );

    gsap.from(cardElements, {
      opacity: 0,
      y: 30,
      scale: 0.9,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
    });
  }

  /**
   * 3.2 - Start Exercise Button Pulse Animation
   * @param {HTMLElement} buttonElement - The start button element
   */
  static animateStartButtonPulse(buttonElement) {
    if (!buttonElement) return;

    console.log(`💓 Starting button pulse animation`);

    // Create infinite pulse animation
    gsap.to(buttonElement, {
      scale: 1.02,
      duration: 1,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * 3.2 - Stop Start Exercise Button Pulse
   * @param {HTMLElement} buttonElement - The start button element
   */
  static stopStartButtonPulse(buttonElement) {
    if (!buttonElement) return;
    gsap.killTweensOf(buttonElement);
    gsap.to(buttonElement, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  /**
   * 3.2 - Start Button Click Animation
   * @param {HTMLElement} buttonElement - The start button element
   * @param {Function} callback - Callback to execute after animation
   */
  static animateStartButtonClick(buttonElement, callback) {
    if (!buttonElement) return;

    console.log(`🚀 Start Exercise button clicked`);

    const timeline = gsap.timeline({
      onComplete: () => {
        if (callback) callback();
      },
    });

    // Stop pulse first
    gsap.killTweensOf(buttonElement);

    // Button click animation
    timeline
      .to(buttonElement, {
        scale: 0.95,
        duration: 0.1,
        ease: "power2.in",
      })
      .to(buttonElement, {
        scale: 1.1,
        duration: 0.2,
        ease: "back.out(3)",
      });
  }

  /**
   * 3.2 - Categories fade out with stagger
   * @param {Array<HTMLElement>} cardElements - Array of card elements
   */
  static animateCategoriesFadeOut(cardElements, onComplete) {
    if (!cardElements || cardElements.length === 0) return;

    console.log(`👋 Fading out categories with stagger`);

    gsap.to(cardElements, {
      opacity: 0,
      y: -20,
      scale: 0.9,
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.in",
      onComplete: onComplete,
    });
  }

  /**
   * 3.4 - Questions Ready Celebration
   * @param {HTMLElement} buttonElement - Start exercise button
   * @param {HTMLElement} countElement - Question count element
   * @param {number} questionCount - Number of questions
   */
  static animateQuestionsReady(buttonElement, countElement, questionCount) {
    console.log(`🎉 Questions ready animation - ${questionCount} questions`);

    const timeline = gsap.timeline();

    // Button slides up with bounce
    if (buttonElement) {
      timeline.from(buttonElement, {
        y: 50,
        opacity: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
      });
    }

    // Question count animates
    if (countElement && questionCount) {
      timeline.from(
        { value: 0 },
        {
          value: questionCount,
          duration: 1,
          ease: "power2.out",
          onUpdate: function () {
            countElement.textContent = Math.round(this.targets()[0].value);
          },
        },
        "-=0.3"
      );
    }
  }

  /**
   * 3.5 - Question Tab Click Animation
   * @param {HTMLElement} tabElement - The clicked tab
   */
  static animateTabClick(tabElement) {
    if (!tabElement) return;

    console.log(`📑 Tab clicked animation`);

    gsap.fromTo(
      tabElement,
      { scale: 0.95 },
      {
        scale: 1.05,
        duration: 0.2,
        ease: "back.out(2)",
        yoyo: true,
        repeat: 1,
      }
    );
  }

  /**
   * 3.5 - Question Content Transition
   * @param {HTMLElement} questionElement - The question container
   */
  static animateQuestionTransition(questionElement) {
    if (!questionElement) return;

    console.log(`📝 Question content transition`);

    gsap.fromTo(
      questionElement,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      }
    );
  }

  /**
   * 3.7 - Next Question Button Slide In
   * @param {HTMLElement} buttonElement - Next question button
   */
  static animateNextButtonSlideIn(buttonElement) {
    if (!buttonElement) return;

    console.log(`➡️ Next button slide in`);

    gsap.from(buttonElement, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      ease: "back.out(1.7)",
    });
  }

  /**
   * 3.8 - Submit Button Animation
   * @param {HTMLElement} buttonElement - Submit button
   * @param {Function} callback - Callback after animation
   */
  static animateSubmitButton(buttonElement, callback) {
    if (!buttonElement) return;

    console.log(`✅ Submit button animation`);

    const timeline = gsap.timeline({
      onComplete: () => {
        if (callback) callback();
      },
    });

    timeline
      .to(buttonElement, {
        scale: 0.9,
        duration: 0.15,
        ease: "power2.in",
      })
      .to(buttonElement, {
        scale: 1.1,
        rotation: 5,
        duration: 0.3,
        ease: "back.out(3)",
      })
      .to(buttonElement, {
        rotation: 0,
        duration: 0.25,
      });
  }

  /**
   * 3.9 - Results Screen Entrance
   * @param {HTMLElement} mascotElement - Mascot image
   * @param {HTMLElement} scoreElement - Score counter element
   * @param {number} finalScore - Final score value
   * @param {HTMLElement} percentageElement - Percentage element
   * @param {number} percentage - Percentage value
   */
  static animateResultsEntrance(
    mascotElement,
    scoreElement,
    finalScore,
    percentageElement,
    percentage
  ) {
    console.log(
      `🎊 Results entrance animation - Score: ${finalScore}, Percentage: ${percentage}%`
    );

    const timeline = gsap.timeline();

    // Mascot slides in from bottom
    if (mascotElement) {
      timeline.to(mascotElement, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "elastic.out(1, 0.6)",
        delay: 0.3, // Same delay as time stats
      });
    }

    // Score counter rolls up
    if (scoreElement && finalScore !== undefined) {
      timeline.from(
        { value: 0 },
        {
          value: finalScore,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: function () {
            const currentValue = Math.round(this.targets()[0].value * 10) / 10;
            scoreElement.textContent = currentValue.toFixed(1);
          },
        },
        "-=0.4"
      );
    }

    // Percentage displays immediately (no animation)
    if (percentageElement && percentage !== undefined) {
      percentageElement.textContent = percentage + "%";
    }
  }

  /**
   * 3.10 - Individual Question Result Reveal (Correct)
   * @param {HTMLElement} questionElement - Question result container
   * @param {HTMLElement} checkmarkElement - Checkmark icon (optional)
   */
  static animateCorrectAnswer(questionElement, checkmarkElement) {
    console.log(`✅ Correct answer animation`);

    const timeline = gsap.timeline({ delay: 1 });

    // Question element background tint only (no box shadow)
    if (questionElement) {
      // First clear any existing box shadow
      gsap.set(questionElement, { boxShadow: "none" });

      timeline.to(questionElement, {
        backgroundColor: "rgba(34, 197, 94, 0.06)",
        boxShadow: "none", // Explicitly ensure no box shadow
        duration: 0.9,
        ease: "power2.out",
      });
    }

    // Checkmark draws in
    if (checkmarkElement) {
      timeline.from(
        checkmarkElement,
        {
          scale: 0,
          rotation: -180,
          opacity: 0,
          duration: 0.5,
          ease: "back.out(2)",
        },
        "-=0.3"
      );
    }

    // No confetti for correct answers per latest requirements
  }

  /**
   * 3.10 - Individual Question Result Reveal (Incorrect)
   * @param {HTMLElement} questionElement - Question result container
   * @param {HTMLElement} xMarkElement - X mark icon (optional)
   */
  static animateIncorrectAnswer(questionElement, xMarkElement) {
    console.log(`❌ Incorrect answer animation (gentle)`);

    const timeline = gsap.timeline({ delay: 1 });

    // Question element gentle shake (not harsh)
    if (questionElement) {
      // First clear any existing box shadow
      gsap.set(questionElement, { boxShadow: "none" });

      timeline
        .to(questionElement, {
          x: -6,
          duration: 0.15,
          ease: "power2.inOut",
        })
        .to(questionElement, {
          x: 6,
          duration: 0.15,
          ease: "power2.inOut",
        })
        .to(questionElement, {
          x: 0,
          duration: 0.15,
          ease: "power2.inOut",
        })
        .to(questionElement, {
          backgroundColor: "rgba(239, 68, 68, 0.04)",
          boxShadow: "none", // Explicitly ensure no box shadow
          duration: 0.6,
          ease: "power2.out",
        });
    }

    // X mark fades in
    if (xMarkElement) {
      timeline.from(
        xMarkElement,
        {
          scale: 0,
          opacity: 0,
          duration: 0.4,
          ease: "back.out(1.5)",
        },
        "-=0.2"
      );
    }
  }

  /**
   * 3.11 - Incomplete Answer Feedback
   * @param {HTMLElement} inputElement - Input field element
   */
  static animateIncompleteAnswer(inputElement) {
    if (!inputElement) return;

    console.log(`⚠️ Incomplete answer shake animation`);

    const timeline = gsap.timeline();

    // Shake animation (3 shakes)
    timeline
      .to(inputElement, {
        x: -10,
        duration: 0.1,
        ease: "power2.inOut",
      })
      .to(inputElement, {
        x: 10,
        duration: 0.1,
        ease: "power2.inOut",
      })
      .to(inputElement, {
        x: -10,
        duration: 0.1,
        ease: "power2.inOut",
      })
      .to(inputElement, {
        x: 10,
        duration: 0.1,
        ease: "power2.inOut",
      })
      .to(inputElement, {
        x: -5,
        duration: 0.1,
        ease: "power2.inOut",
      })
      .to(inputElement, {
        x: 0,
        duration: 0.1,
        ease: "power2.inOut",
      });

    // Red outline pulse removed - keeping only shake animation
  }

  /**
   * 3.12 - Low Score Encouragement Animation
   * @param {HTMLElement} messageElement - Encouragement message
   * @param {HTMLElement} buttonElement - Try again button
   */
  static animateLowScoreEncouragement(messageElement, buttonElement) {
    console.log(`💪 Low score encouragement animation`);

    const timeline = gsap.timeline();

    // Message fades in with slide up
    if (messageElement) {
      timeline.from(messageElement, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    }

    // Button pulses gently
    if (buttonElement) {
      timeline.to(
        buttonElement,
        {
          scale: 1.05,
          duration: 0.8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        },
        "-=0.3"
      );
    }
  }

  /**
   * 3.13 - Results Page Stats Animation
   * @param {HTMLElement} timeElement - Time stats container
   * @param {HTMLElement} accuracyElement - Accuracy stats container
   * @param {HTMLElement} starsElement - Stars stats container
   */
  static animateResultsStats(timeElement, accuracyElement, starsElement) {
    // Check if elements exist
    if (!timeElement || !accuracyElement || !starsElement) {
      return;
    }

    const timeline = gsap.timeline({ delay: 0.3 });

    // Animate time stats first
    timeline.to(timeElement, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: "back.out(1.7)",
    });

    // Animate accuracy stats after 0.2 seconds
    timeline.to(
      accuracyElement,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
      },
      "+=0.2"
    );

    // Animate stars stats after another 0.2 seconds
    timeline.to(
      starsElement,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
      },
      "+=0.2"
    );

    return timeline;
  }

  /**
   * 3.11 - Animate speaker icon on hover
   * Subtle bounce effect when hovering over the speaker icon
   */
  static animateSpeakerHover(iconElement, isHovering) {
    if (!iconElement) return;

    if (isHovering) {
      gsap.to(iconElement, {
        scale: 1.15,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    } else {
      gsap.to(iconElement, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }

  /**
   * 3.12 - Animate speaker icon when speaking
   * Continuous pulse animation while text is being read
   */
  static animateSpeakerPulse(iconElement) {
    if (!iconElement) return;

    const timeline = gsap.timeline({ repeat: -1, yoyo: true });

    timeline.to(iconElement, {
      scale: 1.1,
      opacity: 0.8,
      duration: 0.6,
      ease: "power1.inOut",
    });

    return timeline;
  }

  /**
   * 3.13 - Stop speaker pulse animation
   */
  static stopSpeakerPulse(iconElement) {
    if (!iconElement) return;

    gsap.killTweensOf(iconElement);
    gsap.to(iconElement, {
      scale: 1,
      opacity: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  /**
   * 3.14 - Animate speaker icon click
   * Quick feedback animation when clicking the speaker icon
   */
  static animateSpeakerClick(iconElement) {
    if (!iconElement) return;

    const timeline = gsap.timeline();

    timeline
      .to(iconElement, {
        scale: 0.9,
        duration: 0.1,
        ease: "power2.in",
      })
      .to(iconElement, {
        scale: 1,
        duration: 0.2,
        ease: "back.out(2)",
      });

    return timeline;
  }
}

export default ExerciseAnimationController;
