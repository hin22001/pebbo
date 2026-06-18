# Exact props passed Server → Client that contain Module objects

We pass a **single prop** from the server page to the client:

- **Prop name:** `head`
- **Value:** `getDataHead({ name: "headLandingPage" })` (used on `/`, `/about`, `/contact`, `/pricing`)

Inside `head`, these paths still contain **Module objects** (Webpack/Next `require()` results) that trigger the warning *"Only plain objects can be passed to Client Components from Server Components"*:

---

## 1. `head.sectionPartners.content[]` (10 items)

- **Shape:** `{ image: Module, alt: "Partner" }`
- **Source:** [LandingPage.js](src/app/data/head/components/templates/LandingPage/LandingPage.js) lines 136–179  
- **What’s wrong:** `image` is `require("@/images/placeholder/placeholder-icon.png")` (a Module).  
- **Warning text:** `{ src: Module, alt: "Partner" }` (React or a child may show `src` when it’s the same value passed into an image component.)

---

## 2. `head.sectionAbout.list[]` — 4 feature-card items

- **Shape:** `{ ..., image: { src: Module, alt: "Partner" }, ... }`
- **Source:** [LandingPage.js](src/app/data/head/components/templates/LandingPage/LandingPage.js) lines 359–424  
- **What’s wrong:** `image.src` is `require("@/images/decor/decor-card-*.png")` (Module).  
- **Warning text:** `{ src: Module, alt: "Partner" }`

---

## 3. `head.sectionGuide.student.illustration`

- **Shape:** `{ direction: "row", src: Module }`
- **Source:** [LandingPage.js](src/app/data/head/components/templates/LandingPage/LandingPage.js) lines 453–456  
- **What’s wrong:** `src` is `require("@/images/illustration/illustration-road-purple.png")` (Module).  
- **Warning text:** `{ direction: "row", src: Module }`

---

## 4. `head.sectionGuide.parent.illustration`

- **Shape:** `{ direction: "row-reverse", src: Module }`
- **Source:** [LandingPage.js](src/app/data/head/components/templates/LandingPage/LandingPage.js) lines 530–532  
- **What’s wrong:** `src` is `require("@/images/illustration/illustration-road-mint.png")` (Module).  
- **Warning text:** `{ direction: "..., src: Module }`

---

## Summary

| Path | Shape | Count / note |
|------|--------|----------------|
| `head.sectionPartners.content[].image` | `Module` | 10 items |
| `head.sectionAbout.list[].image.src` | `Module` | 4 items |
| `head.sectionGuide.student.illustration.src` | `Module` | 1 |
| `head.sectionGuide.parent.illustration.src` | `Module` | 1 |

All of these are inside the **`head`** object passed from the server `page.tsx` into `LandingClient` / `AboutClient` / etc. `sanitizeModules()` in `getDataHead` is supposed to turn every `require()` result into a plain string or object; if it doesn’t fully unwrap the Module (e.g. on the server), these paths stay as Module and cause the warnings.
