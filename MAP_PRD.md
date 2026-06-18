# MAP PAGE — PRD

## Purpose

The Map Page visualizes learning progress through a **10×10 puzzle map (100 pieces)**.
Each puzzle piece represents progress gained through leveling up (XP).
Puzzle pieces are **earned for free** but require **coins to assemble** via Mr. Woody.

This page reinforces:

- Long-term motivation
- Coin usage (burn mechanism)
- Visual sense of completion

---

## Page Structure

### Header (Thin, Persistent)

```
Energy | Coins | Level | Map Completion %
```

- Energy: 0–100
- Coins: Total spendable coins
- Level: Current learning level
- Map Completion %: Assembled pieces / 100

---

### Main Map Area

```
┌──────────────────────────────────────────────┐
│              MAIN MAP AREA                   │
│        (10×10 Puzzle Grid Display)           │
│                                              │
│   - Assembled pieces: full color             │
│   - Unassembled pieces: glowing outline      │
│   - Empty slots: faint silhouette            │
└──────────────────────────────────────────────┘
```

#### Puzzle States

| State               | Visual Style            | Interaction     |
| ------------------- | ----------------------- | --------------- |
| Assembled           | Full color illustration | Tap to view     |
| Unassembled (Owned) | Glowing outline         | Tap to assemble |
| Empty               | Faint silhouette        | No action       |

---

### Bottom Panel — Mr. Woody Dialogue

```
┌──────────────────────────────────────────────┐
│ Mr. Woody Dialogue Area                      │
└──────────────────────────────────────────────┘
```

- Explains puzzle assembly
- Guides coin usage
- Short friendly messages

---

## Puzzle Assembly Interaction

### Trigger

Tap an **unassembled puzzle piece**

### Popup

```
┌──────────────────────────────┐
│ Puzzle Piece Earned          │
│ Assembly Cost: 120 Coins     │
│ [ Ask Mr. Woody ] [ Later ]  │
└──────────────────────────────┘
```

---

## Map Update Logic

1. Level up → earn 1 unassembled piece
2. Piece appears on map
3. Coins spent to assemble
4. Piece becomes full color
5. Completion % updates

---

## Puzzle Map Asset Generation

### Goal

Create a **10×10 jigsaw-style puzzle map** for animation and progressive reveal.

### Assets Per Piece

- Full color
- Glow outline
- Silhouette
- SVG mask

---

## Design Notes

- Subtle rewarding animations
- Crafted assembly feel
- Milestones at 25%, 50%, 75%, 100%

---

# Implementation Guide

> **Scope**: Frontend UI only. All data is mocked. No backend integration.

---

## File Structure (To Create)

```
src/
├── pages/
│   └── map/
│       └── index.jsx              # Page entry point
└── app/
    ├── components/
    │   └── templates/
    │       └── Map/
    │           ├── Map.jsx            # Main component
    │           ├── MapHeader.jsx      # Level/Coins/Progress display
    │           ├── PuzzleGrid.jsx     # 10x10 grid container
    │           ├── PuzzlePiece.jsx    # Individual piece
    │           ├── WoodyPanel.jsx     # Mr. Woody dialogue
    │           ├── AssemblyModal.jsx  # Confirmation popup
    │           └── index.js           # Export barrel
    └── assets/
        └── scss/
            └── components/
                └── templates/
                    └── Map/
                        └── _map.scss  # All Map page styles
```

---

## Mock Data (Inline in Component or Separate Constant)

```javascript
// Mock user progress
const mockUserProgress = {
  coins: 500,
  level: 12,
  completionPercent: 10, // 10 out of 100 assembled
};

// Generate 100 puzzle pieces
// States: "assembled" | "owned" | "empty"
const mockPuzzlePieces = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  row: Math.floor(i / 10),
  col: i % 10,
  state: i < 10 ? "assembled" : i < 15 ? "owned" : "empty",
  assemblyCost: 120,
}));

const woodyMessages = {
  default: "Welcome to your puzzle map! Complete exercises to earn pieces.",
  assembled: "This piece is already assembled. Great work!",
  owned: "You own this piece! Spend coins to assemble it.",
  empty: "Keep learning to earn this puzzle piece!",
};
```

---

## Reference Files (Style & Pattern Guide)

Look at these existing files for patterns:

| Purpose          | File                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| Grid layout      | `src/app/components/templates/MathLibrary/MathLibrary.jsx`               |
| Header + modals  | `src/app/components/templates/Dashboard/StudentDashboard.jsx`            |
| Confetti effects | `src/app/utils/ConfettiManager.js`                                       |
| Modal animation  | `src/app/components/elements/LevelUpCelebration/`                        |
| SCSS patterns    | `src/app/assets/scss/components/templates/MathLibrary/_mathLibrary.scss` |

---

## What to Skip (Backend Scope)

Do NOT implement these (they will be added later):

- Actual coin deduction API calls
- Real puzzle state persistence
- XP/Level tracking integration
- Supabase/database reads or writes
- Any `/api/` route calls
