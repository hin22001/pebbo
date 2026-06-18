# DESIGN.md

Token inventory extracted from the live student dashboard and quiz-exercise pages on 2026-05-07. Source of truth for the upcoming teacher portal so the two surfaces share a visual language.

Sources scanned:
- `tailwind.config.js`
- `src/app/assets/scss/themes/_colors.scss`, `_variable.scss`, `themes/index.scss`
- `src/app/assets/scss/typographys/index.scss`
- `src/app/assets/scss/bases/_global.scss`, `index.scss`
- `src/app/(app)/dashboard/**`, `src/app/(app)/quiz-exercise/**`
- `src/app/layout.tsx`

---

## 1. Register

**Product.** This is application UI (dashboard, quiz, classroom, reports, shop). Design serves task completion and data legibility. Brand presence is constant but quiet — the orange and purple show up in actions, status, and rewards, not as wallpaper.

The teacher portal inherits this register. Restrained color, committed type, generous data density.

---

## 2. Color tokens

### 2.1 Findings (raw, from code)

Two brand orange values coexist:

| Token in code | Hex | Usage |
|---|---|---|
| `--color-primary` / `$color-primary` | `#f05724` | Default action color, links, FullCalendar buttons (SCSS) |
| `NextTopLoader color` + orange gradients | `#FF5000` | Top loading bar, gradient hero accents |

These should converge. Recommendation: adopt **`#FF5000`** as canonical (it's the louder, more identity-carrying value and already drives the gradients), retire `#f05724`. If brand owners disagree, flip the recommendation; don't keep both.

Full palette as currently authored (top frequency in SCSS, deduped):

| Role | Hex | OKLCH (approx) | Usage notes |
|---|---|---|---|
| Brand primary | `#FF5000` | `oklch(0.690 0.230 35)` | Primary action, brand accent |
| Brand primary deep | `#d14b1e` | `oklch(0.560 0.183 36)` | Hover/pressed |
| Brand primary tint | `#FFF6EB` | `oklch(0.984 0.018 75)` | Subtle bg, hover surface |
| Secondary purple | `#8264FF` | `oklch(0.590 0.220 287)` | Secondary brand, premium/reward UI |
| Secondary pink | `#FF64A0` | `oklch(0.720 0.180 1)` | Pairs with purple in gradients |
| Mint | `#02CDD2` | `oklch(0.740 0.130 195)` | Tertiary accent, fresh/info |
| Mint tint | `#E4FEFF` | `oklch(0.985 0.020 195)` | Bg surface for mint zones |
| Gold | `#B78316` | `oklch(0.610 0.130 80)` | Achievements, currency |
| Gold deep | `#5E420D` | `oklch(0.350 0.080 75)` | Premium label text |
| Yellow accent | `#FFDA27` | `oklch(0.890 0.180 95)` | Highlights, streaks |
| Success | `#00BE2A` | `oklch(0.700 0.220 145)` | Correct answers, positive deltas |
| Success deep | `#359b4b` | `oklch(0.580 0.150 145)` | Success text on light bg |
| Success tint | `#DEF9D0` | `oklch(0.960 0.060 130)` | Correct answer surface |
| Error | `#D41C02` | `oklch(0.560 0.220 30)` | Wrong answers, destructive |
| Error loud | `#FC2C29` | `oklch(0.640 0.230 30)` | High-priority error |

Neutrals (currently scattered as raw `#fff`, `#000`, `#565656`, `#C7C7C7`, `#EAEAEA`, `#D9D9D9`, `#FAFAFA`). For the teacher portal, define the ramp explicitly and **tint each neutral with `chroma 0.005–0.01` toward the orange hue (≈35°)** so the surface doesn't read as cold.

| Role | Replace | Use |
|---|---|---|
| `surface-0` | `#fff` | Page background |
| `surface-1` | `#FAFAFA` | Card background |
| `surface-2` | `#F4F2EF` | Subtle raised surface (currently approximated by `#fff6eb` for orange zones) |
| `border-subtle` | `#EAEAEA` | Hairline dividers |
| `border-default` | `#D9D9D9` / `#C7C7C7` | Card and input borders |
| `text-strong` | tinted near-black, not `#000` | Headings |
| `text-default` | `#565656` | Body |
| `text-muted` | `#8D8D8D` / `#A6A8AB` | Captions, metadata |

### 2.2 Color strategy (per impeccable shared laws)

**Restrained.** Tinted off-white surfaces, near-black text, single brand orange for action. Purple/pink/mint are role-coded (rewards, info, secondary), not decorative. Never use brand orange as a large fill area in the teacher portal — that real estate is reserved for student delight zones (shop, streaks).

### 2.3 Gradients (preserve, don't multiply)

These already exist and carry the product's voice. Re-use them, don't invent new ones for the teacher portal:

- **Primary cream→lavender:** `linear-gradient(270deg, #f8efe5, #f1ebff 65%)` — page hero backdrops
- **Purple→pink:** `linear-gradient(90deg, #8264FF 0%, #FF64A0 100%)` — premium/reward CTAs
- **Orange:** `linear-gradient(90deg, #FF5000 0%, #FF8F00 100%)` — streak / fire moments
- **Lilac:** `linear-gradient(90deg, #f7f5ff 4.76%, #c8bafd 140.48%)` — soft secondary backdrop

Teacher portal should use gradient surfaces sparingly — at most one per page, on hero or empty states.

---

## 3. Typography

### 3.1 Families

| Token | Stack | Where it's loaded | Use |
|---|---|---|---|
| `font-primary` | `"Inter", sans-serif` | Google Fonts, weights 100–900 | Default body, UI |
| `font-secondary` | `"Open Hunin"` | Local `/public/font/font-open-hunin.ttf` | Decorative, sparse |
| `font-title` | `"Advercase", serif` | Local `AdvercaseFont-Demo-Regular/Bold.otf` | Display, hero headings |
| `font-poppins` | `"Poppins", sans-serif` | Tailwind config only | **Dead weight** — registered but no SCSS or active component uses it |

**Recommendation for portal:**
- Body / UI: **Inter** (already loaded, free, broad weight range).
- Display / hero / "Welcome, Mrs. Sharma" type moments: **Advercase**.
- Drop `font-poppins` from Tailwind during the migration.

### 3.2 Scale

The student app uses Tailwind's default scale (`text-xs` … `text-7xl`) layered on top of a fluid root font that shrinks at smaller breakpoints (`90% → 80% → 70%`). This is a global decision baked into `_global.scss`; the teacher portal must inherit it or both surfaces will desync at small viewports.

Use the existing scale; don't introduce custom sizes. Hierarchy via weight + scale jumps ≥ 1.25× (per impeccable laws). Avoid sibling type sizes.

### 3.3 Weight contracts

- Display / page title: 700 (Advercase Bold or Inter 700)
- Section heading: 600
- Body: 400
- Captions / metadata: 400 with reduced color contrast (`text-muted`), not 300

---

## 4. Radius

Tailwind defaults, observed frequency in dashboard + quiz code:

| Token | Tailwind value | Frequency | Use |
|---|---|---|---|
| `rounded` | `0.25rem` | 33 | Default — buttons, inputs, small cards |
| `rounded-md` | `0.375rem` | 3 | Form fields |
| `rounded-lg` | `0.5rem` | 4 | Larger cards |
| `rounded-xl` | `0.75rem` | 1 | Hero cards |
| `rounded-full` | pill | 4 | Avatars, badges, primary CTAs |

The system is **moderately rounded, not soft**. Don't drift to `rounded-2xl` or `rounded-3xl` in the portal — that's a different visual era.

---

## 5. Spacing & layout structure

From `_variable.scss`:

| Token | Value | Use |
|---|---|---|
| `$height-header` | `5rem` | Top nav |
| `$height-thumbnail` | `8rem` | Card thumbs |
| `$width-navigation` | `15rem` | Side nav expanded |
| `$side-nav-bar-collapsed-width` | `60px` | Side nav collapsed |
| `$size-avatar` | `4.2rem` | Avatar circles |

Teacher portal must match `$height-header` and the side-nav widths for chrome consistency. If the design diverges here, it'll feel like a different app — that's the visible seam users notice first.

### 5.1 Breakpoints

```
xxs 280   xs 320   ts 360   smt 400   sm 480   sd 555   md 769
mh 920    hg 1024  lg 1216  xl 1440   hd 1920
```

Use these, not Tailwind's default `sm/md/lg/xl/2xl`. Mismatched breakpoints between student and teacher portals = layout shifts at the same window widths.

---

## 6. Motion

The student app has **24+ named keyframe animations** (coin-jump, streak-wiggle, restore-color, metal-sheen, card-pop, card-glow, number-pop-effect, final-pop, character break-arm-left/right, break-leg-left/right, etc).

Most of these are **student-only delight moments** (rewards, streaks, character reactions). The teacher portal should **not** import them. The signals are wrong: a teacher reviewing class performance does not need a coin-jump.

What the teacher portal **should** inherit:

| Teacher-appropriate | Why |
|---|---|
| `card-pop` (subtle scale 1 → 1.07 → 1) | Selection feedback |
| `final-pop` (gentler version) | Confirmation of save |
| `restore-color` | Disabled → enabled state changes |

**Easing:** `ease-out` and `ease-in-out`, durations 300–600ms. No bounce, no elastic (per impeccable laws — already aligned).

---

## 7. Components — observed conventions

Component hierarchy in `src/app/components/`:

```
elements/   — buttons, inputs, text, icons (smallest reusable units)
modules/    — composed elements (cards, forms)
templates/  — page-level slot layouts
sections/   — feature-specific blocks
layouts/    — app-wide chrome (nav, sidebars)
```

The teacher portal should slot into the same folders. Adding a `(app)/teacher/` route group is fine; introducing parallel `components/teacher/elements/...` would fork the design system.

---

## 8. Migration tokens for Tailwind v4 + shadcn

Drop these into `tailwind.config.js` (or the v4 `@theme` block in CSS) so shadcn primitives inherit student-side identity automatically. OKLCH values; `--color-*` CSS vars per shadcn convention.

```css
@theme {
  /* Brand */
  --color-brand: oklch(0.690 0.230 35);          /* #FF5000 */
  --color-brand-deep: oklch(0.560 0.183 36);     /* hover/pressed */
  --color-brand-tint: oklch(0.984 0.018 75);     /* subtle surface */

  /* Secondary identity */
  --color-purple: oklch(0.590 0.220 287);
  --color-pink: oklch(0.720 0.180 1);
  --color-mint: oklch(0.740 0.130 195);
  --color-mint-tint: oklch(0.985 0.020 195);
  --color-gold: oklch(0.610 0.130 80);
  --color-yellow: oklch(0.890 0.180 95);

  /* Semantic */
  --color-success: oklch(0.700 0.220 145);
  --color-success-tint: oklch(0.960 0.060 130);
  --color-error: oklch(0.560 0.220 30);
  --color-error-loud: oklch(0.640 0.230 30);

  /* Neutrals — tinted toward brand hue (35°) */
  --color-surface-0: oklch(1 0 0);
  --color-surface-1: oklch(0.985 0.005 75);
  --color-surface-2: oklch(0.965 0.008 75);
  --color-border-subtle: oklch(0.928 0.005 75);
  --color-border-default: oklch(0.846 0.006 75);
  --color-text-strong: oklch(0.180 0.005 75);
  --color-text-default: oklch(0.420 0.005 75);
  --color-text-muted: oklch(0.620 0.005 75);

  /* Type */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-display: "Advercase", "Inter", serif;

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;

  /* Spacing chrome */
  --height-header: 5rem;
  --width-nav: 15rem;
  --width-nav-collapsed: 60px;
}
```

shadcn `Button`, `Card`, `Dialog`, `Input`, `Table` will automatically inherit `--color-brand` for `--primary`, `--radius-md` for `--radius`, and `--font-sans` for typography. Map shadcn's semantic vars to these in a single `globals.css` block; do not theme component-by-component.

---

## 9. Open inconsistencies (resolve before building portal)

These need a one-line decision each before the teacher portal starts. They are pre-existing issues in the student app — pretending they don't exist will recreate them in the portal.

1. **Two brand oranges (`#f05724` vs `#FF5000`).** Pick one canonical. Recommended: `#FF5000`.
2. **Dead `font-poppins` token** in Tailwind config — remove during migration.
3. **Raw `#fff` and `#000`** used 130+ times in SCSS — replace with tinted neutrals in the new theme. Don't propagate.
4. **`text-strong` is currently `color: $color-black` (`#000`) on `:root`** in `_global.scss` — this is the absolute-bans territory the impeccable laws flag. New surfaces use tinted near-black.
5. **Animation library is student-only.** Decide which 2–3 animations the teacher portal inherits (recommended: `card-pop`, `final-pop`, `restore-color`) and leave the rest behind.

---

## 10. What this document does not cover

- **PRODUCT.md** — strategic positioning, users, anti-references. Not extracted; this file is a *visual* inventory only. If teacher-portal scope expands beyond "match the student app," run `/impeccable:impeccable teach` to add product context.
- **shadcn component-by-component theming.** Once the `@theme` block above is in place, individual shadcn primitives (`Button` variants, `Card` variants) need a one-time mapping pass — that's the next deliverable.
- **Iconography.** Not yet cataloged. Worth running a separate pass if the portal needs many icons.

---

_Generated 2026-05-07 from a read-only scan. Re-run extraction after major design changes. Source files listed at top of document._
