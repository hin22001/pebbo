---

# 🧩 EPIC: Pebbo Adventure — Mascot Intro UI

**Description**
Implement a step-by-step onboarding popup for Pebbo Adventure.
This Epic covers trigger logic, UI structure, scene flow, and persistence.
Lottie animations and MP4 backgrounds will be integrated later.

**Out of Scope**

- Lottie animation logic
- Audio playback
- Localization

---

## 🎟️ Issue 1: Intro Popup Trigger Logic

**Title**
`[Intro Popup] Implement trigger conditions`

**Description**
Implement logic to determine when the Mascot Intro Popup should appear.

**Acceptance Criteria**

- [ ] Popup triggers on **first login ever**
- [ ] Popup triggers when user clicks **Help / ?** inside Adventure
- [ ] (Optional) Popup triggers for returning users after **7+ days inactivity**
- [ ] Popup does **NOT auto-trigger** if intro already completed (except Help)

---

## 🎟️ Issue 2: User State & Persistence

**Title**
`[Intro Popup] Add user flags & persistence`

**Description**
Store intro completion state per user.

**Acceptance Criteria**

- [ ] Add `intro_completed` (boolean)
- [ ] Add `intro_last_shown_at` (timestamp)
- [ ] Set `intro_completed = true` when:
  - User finishes final scene
  - User clicks Skip

- [ ] Help button always replays intro regardless of flag

---

## 🎟️ Issue 3: Popup Modal Container

**Title**
`[Intro Popup] Build full-screen modal container`

**Description**
Create the base modal used for the mascot intro.

**Acceptance Criteria**

- [ ] Full-screen modal overlay
- [ ] Background page interaction disabled
- [ ] Centered content container
- [ ] Responsive for desktop & iPad
- [ ] Background placeholder supported (MP4 later)

---

## 🎟️ Issue 4: Layering & Z-Index Structure

**Title**
`[Intro Popup] Implement fixed z-index layering`

**Description**
Ensure UI elements stack correctly and predictably.

**Acceptance Criteria**

- [ ] Layer 1: Background placeholder
- [ ] Layer 2: Mascot container (placeholder)
- [ ] Layer 3: Speech bubble / text area
- [ ] Layer 4: UI controls (buttons, indicators)

---

## 🎟️ Issue 5: Base UI Components

**Title**
`[Intro Popup] Build base UI components`

**Description**
Create reusable components used across all intro scenes.

**Acceptance Criteria**

- [ ] Mascot container (static placeholder)
- [ ] Speech bubble / dialogue text area
- [ ] Scene indicator (● ● ●)
- [ ] Navigation buttons:
  - Previous (`<--`)
  - Next (`-->`)

- [ ] Skip button

---

## 🎟️ Issue 6: Scene State Management

**Title**
`[Intro Popup] Implement scene state & navigation`

**Description**
Handle scene indexing and navigation logic.

**Acceptance Criteria**

- [ ] Implement `intro_scene_index` (0, 1, 2)
- [ ] Default index = 0
- [ ] Next button increments index
- [ ] Previous button decrements index
- [ ] Disable:
  - Previous on first scene
  - Next on last scene

---

## 🎟️ Issue 7: Scene Content Switching

**Title**
`[Intro Popup] Switch content per scene`

**Description**
Update UI content based on active scene.

**Acceptance Criteria**

- [ ] Scene 0: Potter — Exercises & XP
- [ ] Scene 1: Bobby — Shop, Coins, Energy
- [ ] Scene 2: Zippy — Map & Puzzle
- [ ] For each scene:
  - Background placeholder changes
  - Mascot placeholder changes
  - Dialogue text updates
  - UI preview highlights update

---

## 🎟️ Issue 8: Dialogue Rendering

**Title**
`[Intro Popup] Render dialogue text safely`

**Description**
Display mascot dialogue clearly and consistently.

**Acceptance Criteria**

- [ ] Support multi-line dialogue
- [ ] Preserve line breaks
- [ ] Limit text width for readability
- [ ] Dialogue visible without audio

---

## 🎟️ Issue 9: Button Behavior

**Title**
`[Intro Popup] Implement button behavior`

**Description**
Define behavior for Next, Previous, and Skip buttons.

**Acceptance Criteria**

- [ ] Next:
  - Advances scene
  - On last scene → closes popup & enters Adventure

- [ ] Skip:
  - Closes popup immediately
  - Sets `intro_completed = true`

---

## 🎟️ Issue 10: Accessibility & Fallback

**Title**
`[Intro Popup] Accessibility & fallback handling`

**Description**
Ensure intro works even without animations or media.

**Acceptance Criteria**

- [ ] UI usable without animations
- [ ] Text readable without audio
- [ ] Graceful fallback if mascot or background fails to load

---

## 🎟️ Issue 11: QA & Testing

**Title**
`[Intro Popup] QA & regression testing`

**Description**
Verify intro popup works across scenarios.

**Acceptance Criteria**

- [ ] Triggers fire correctly
- [ ] Flags persist across sessions
- [ ] Help button always replays intro
- [ ] Scene navigation works correctly
- [ ] No dependency on Lottie / MP4 assets

---

## 🎯 Definition of Done (Epic)

- [ ] Intro popup fully functional
- [ ] No hard dependency on future assets
- [ ] Safe to integrate Lottie & MP4 later
- [ ] Ready for design polish & animation pass

---
