# Pebbo Platform - Animation Progress Report

**Last Updated:** October 23, 2025  
**Prepared For:** Client Demo (7pm HK)

---

## ✅ Completed Animations

### Phase 1: Foundation (Dashboard Core)

- [x] **XP Progress Bar Animation** - Smooth progress bar fill with GSAP easing
- [x] **XP Number Counter** - Animated number counting from current to target value
- [x] **Stats Counter Animation** - Dynamic number counting for statistics display
- [x] **Stats Counter (Percentage)** - Decimal-precise percentage counter with smooth transitions
- [x] **Button Click Animation** - Responsive scale and bounce-back effect on all buttons
- [x] **Todo Checkbox Animation** - Scale and bounce animation on todo completion
- [x] **Icon Hover Animation** - Subtle rotation and scale on icon hover
- [x] **Stats Icon Bounce** - Bounce effect for statistics icons with vertical lift
- [x] **Progress Bar Shimmer** - Shimmer effect overlay on progress completion

### Phase 2: Dashboard Celebrations & Gamification

- [x] **1.1 Level Up Celebration** - Fireworks confetti with level number scaling and star burst rotation (Magic UI)
- [x] **1.7 Todo Completion Celebration** - Multi-burst confetti with bounce animation and golden glow effect
- [x] **1.9 Daily Streak Increment** - Fire icon pulse, circle glow, and number counter animation
- [x] **1.10 Streak Milestone (Day 7)** - Fire-themed side cannons confetti with trophy bounce and circle pulse sequence
- [x] **Synchronized XP Display** - XP stars and progress bar remain in sync on refresh
- [x] **Streak Card Hover Animation** - Fire icon pulse and number bounce on hover (GSAP)
- [x] **User Chip Hover Animation** - Scale hover effect on language select, coin balance, and stars chips

### Phase 3: Exercise/Question Page Animations

- [x] **3.1 Category Card Hover** - Scale and shadow animation on category cards
- [x] **3.1 Category Card Selection** - Enhanced scale and glow on selection
- [x] **3.1 Category Cards Reveal** - Staggered fade-in from bottom on page load
- [x] **3.2 Start Exercise Button Pulse** - Continuous gentle pulse when categories selected
- [x] **3.2 Categories Fade Out** - Delayed staggered fade-out with upward movement
- [x] **3.4 Questions Ready (No Confetti)** - Button slide-up with elastic bounce
- [x] **3.5 Question Tab Click** - Subtle scale bounce on tab interaction
- [x] **3.7 Next Question Button Slide In** - Bottom-to-top slide with bounce
- [x] **3.8 Submit Button Animation** - Scale and rotation on submit click
- [x] **3.9 Results Screen Entrance** - Delayed mascot elastic entrance with score counter roll-up
- [x] **3.11 Incomplete Answer Validation** - Shake animation with red outline pulse on specific empty field
- [x] **Coin Animation Fix** - Coins only trigger on successful submission, not on incomplete answers

---

## 📋 Upcoming Enhancements

### User Experience Improvements

- [x] **Grade Display Format** - Update from "Year 1, Year 2..." to "1st Grade, 2nd Grade..." in student dashboard navbar
- [ ] **Mascot Loading Transitions** - Implement Duolingo-style cute mascot transitions before exercise categories load
- [ ] **Question Audio Support** - Add speaker icon with text-to-speech functionality for accessibility (English language support)
- [x] **Results Page Stats Animation** - Animate time, accuracy, and stars with sequential slide-up entrance (0.5s delay between each)
- [ ] **Ask Potter Button Enhancement** - Add visual icon to improve button discoverability
- [x] **Ask Potter Popup Positioning** - Change popup origin from bottom-right to center near click location with smooth slide-in animation
- [ ] **Ask Potter Periodic Reminder** - Periodic popup on results page to remind users to ask Potter for help
- [x] **Dashboard Section Hover Animations** - Question mark 180° flip on hover for exercise section, icon tilt on hover for reports section

---

## 🎨 Implementation Guidelines

### Animation Files Specifications

- **Format:** Lottie JSON
- **Max File Size:** 300 KB per animation
- **Compression:** Use LottieFiles optimizer for file size reduction
- **Frame Rate:** 30 fps for smooth playback
- **Background:** Export with transparent backgrounds
- **Optimization:** Ensure animations are lightweight for web performance

### Sound Files Specifications

- **Format:** MP3 or WebM for web compatibility
- **Quality:** 128kbps for balance between quality and file size
- **Duration:** Keep sound effects under 3 seconds for UI feedback
- **Volume:** Normalized levels to prevent audio spikes
- **Fallback:** Provide silent mode option for accessibility

### Animation Integration Points

- **Mascot Loading:** Replace static mascot with Lottie animation during exercise loading
- **Ask Potter Reminder:** Subtle Lottie animation for periodic popup
- **Dashboard Icons:** Enhance existing hover states with Lottie micro-animations
- **Sound Triggers:** Audio feedback for button clicks, completions, and celebrations

### Specific Lottie Animation Requirements

#### Exercise Page Animations

- **Side Mascots:** Animated mascots positioned on left/right sides of exercise interface
  - Idle animations (breathing, blinking, subtle movements)
  - Encouragement animations when students are struggling
  - Celebration animations for correct answers
  - File size: Max 200 KB per side mascot

#### Page Transition Animations

- **Exercise Start Transition:** Smooth transition from category selection to first question
  - Duration: 1-2 seconds
  - Style: Slide/sweep effect with mascot guidance

#### Results Page Mascot Animations

- **High Accuracy (90-100%):** Excited, jumping mascot with confetti
  - File: `mascot-excellent.json` (Max 250 KB)
  - Animation: Jumping, clapping, victory pose
- **Good Accuracy (70-89%):** Happy, encouraging mascot
  - File: `mascot-good.json` (Max 200 KB)
  - Animation: Thumbs up, smile, gentle celebration
- **Average Accuracy (50-69%):** Supportive, gentle mascot
  - File: `mascot-average.json` (Max 180 KB)
  - Animation: Nodding, gentle encouragement, "try again" gesture
- **Low Accuracy (0-49%):** Caring, supportive mascot
  - File: `mascot-supportive.json` (Max 200 KB)
  - Animation: Gentle pat, encouraging words, "don't give up" gesture

#### Technical Specifications for Mascot Animations

- **Loop Behavior:** Idle animations loop infinitely, celebration animations play once
- **Trigger Points:**
  - Side mascots: On question load, answer submission, page transitions
  - Results mascot: Based on accuracy percentage calculation
- **Positioning:**
  - Side mascots: Fixed position, responsive scaling
  - Results mascot: Centered, larger scale for impact
- **Performance:** Use `will-change: transform` CSS property for smooth rendering

---
