# SHOP PAGE — PRD

## Purpose

Allow students to spend in-game currency to:

- Progress faster
- Customize experience
- Reduce friction
- Avoid pay-to-win mechanics

---

## Page Layout

```
┌──────────────────────────────────────────────┐
│ HEADER (Thin)                                │
│ Coins | Energy | Tokens                     │
├──────────────────────────────────────────────┤
│ SHOP CATEGORY TABS                           │
│ [ Boosters ] [ Puzzle ] [ Custom ] [ More ] │
├──────────────────────────────────────────────┤
│ ITEM GRID AREA                               │
│ Scrollable 2–3 column grid                  │
├──────────────────────────────────────────────┤
│ BOTTOM PANEL                                 │
│ Mr. Woody Tips / Notices                    │
└──────────────────────────────────────────────┘
```

---

## Categories

### Boosters

| Item          | Effect      | Price    |
| ------------- | ----------- | -------- |
| Energy Refill | +20 Energy  | 50 Coins |
| Hint Token    | Reveal step | 30 Coins |
| Time Freeze   | Pause timer | 40 Coins |
| Double Reward | 2× Coins    | 80 Coins |

Rules:

- No infinite stacking
- Cooldowns apply
- Level-based locks

---

### Puzzle

| Item                 | Effect           |
| -------------------- | ---------------- |
| Puzzle Fragment Pack | Random map piece |
| Missing Piece Finder | Highlights gaps  |
| Instant Assembly     | Skip coin cost   |

---

### Custom

| Item            | Effect            |
| --------------- | ----------------- |
| Mr. Woody Skins | Visual only       |
| Map Theme       | Background change |
| Avatar Frames   | Cosmetic          |

---

## Item Card

```
┌──────────────────────────┐
│ Item Icon                │
│ Item Name                │
│ Description              │
│ Coin Price   [ BUY ]     │
└──────────────────────────┘
```

States:

- Normal
- Disabled
- Purchased
- Locked

---

## Purchase Flow

```
Select item
→ Confirm
→ Currency check
→ Success or failure feedback
```

---

## Economy Rules

- No hard paywalls
- All items earnable via gameplay
- Soft caps on boosters
- Admin-controlled pricing

---

## Analytics

- Conversion rate
- Popular items
- Drop-off points
- Correlation with progress

---

## UX Principles

- Clear value
- No pressure tactics
- Learning-first motivation
- Visual delight

---

# Implementation Guide

> **Scope**: Frontend UI only. All data is mocked. No backend integration.

---

## File Structure (To Create)

```
src/
├── pages/
│   └── shop/
│       └── index.jsx              # Page entry point
└── app/
    ├── components/
    │   └── templates/
    │       └── Shop/
    │           ├── Shop.jsx           # Main component
    │           ├── ShopHeader.jsx     # Currency display
    │           ├── ShopTabs.jsx       # Category tabs
    │           ├── ShopItemCard.jsx   # Individual item card
    │           ├── PurchaseModal.jsx  # Confirmation popup
    │           └── index.js           # Export barrel
    └── assets/
        └── scss/
            └── components/
                └── templates/
                    └── Shop/
                        └── _shop.scss # All Shop page styles
```

---

## Mock Data (Inline in Component or Separate Constant)

```javascript
// Mock user currency
const mockUserCurrency = {
  coins: 500,
  energy: 80,
};

// Mock shop items
const mockShopItems = {
  boosters: [
    {
      id: 1,
      name: "Energy Refill",
      description: "+20 Energy",
      price: 50,
      icon: "energy",
    },
    {
      id: 2,
      name: "Hint Token",
      description: "Reveals a step",
      price: 30,
      icon: "hint",
    },
    {
      id: 3,
      name: "Time Freeze",
      description: "Pause timer",
      price: 40,
      icon: "timer",
    },
    {
      id: 4,
      name: "Double Reward",
      description: "2× Coins",
      price: 80,
      icon: "coins",
    },
  ],
  puzzle: [
    {
      id: 5,
      name: "Puzzle Fragment Pack",
      description: "Random map piece",
      price: 100,
      icon: "puzzle",
    },
  ],
  cosmetics: [
    {
      id: 6,
      name: "Mr. Woody Skin",
      description: "Cool outfit",
      price: 200,
      icon: "skin",
    },
    {
      id: 7,
      name: "Avatar Frame - Gold",
      description: "Shiny border",
      price: 150,
      icon: "frame",
    },
  ],
};
```

---

## Reference Files (Style & Pattern Guide)

Look at these existing files for patterns:

| Purpose        | File                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| Grid layout    | `src/app/components/templates/MathLibrary/MathLibrary.jsx`               |
| Header + state | `src/app/components/templates/Dashboard/StudentDashboard.jsx`            |
| Tab component  | `src/app/components/elements/Tabs/`                                      |
| Modal pattern  | `src/app/components/modules/ModalConfirm/`                               |
| SCSS patterns  | `src/app/assets/scss/components/templates/MathLibrary/_mathLibrary.scss` |

---

## What to Skip (Backend Scope)

Do NOT implement these (they will be added later):

- Actual purchase API calls
- Real coin deductions
- Supabase/database integration
- Inventory persistence
- Any `/api/` route calls
