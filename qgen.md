# Strategic Master Plan: Parametric Question Generation & Modular Graphics System (PQG-MGS)

## 1. Objective

To build a "KooBits-level" education platform that achieves 100% mathematical accuracy, infinite content scalability, and zero marginal cost for graphic production. The system transitions the company from "Manual Data Entry" to a high-velocity "Content Architecture" model.

---

## 2. Pain Points & Legacy Risks

- **The Accuracy Trap:** Manual data entry currently leads to logical errors and incorrect answers, which risks partner trust and prevents a stable Beta launch.
- **The Design Bottleneck:** K1–K6 mathematics requires thousands of precise diagrams. Hand-drawing these (Angles, 3D shapes, Fractions) is financially unsustainable and slows down the roadmap.
- **Legacy Debt:** Continuing with a static database creates 10,000+ entries that are difficult to search, update, or localize for different regional curriculums.
- **Monitoring Gap:** There is currently no unified system to monitor developer output, check question integrity automatically, or track platform traffic data.

---

## 3. The Solution: Parametric Content Architecture

We will replace static database entries with "Master Templates." Instead of storing a single static question, we store the Mathematical DNA of the problem.

- **Procedural Generation:** Use code to calculate answers and render graphics on the fly.
- **LLM Hydration:** Use AI to wrap math logic in varied story contexts (scenarios, names, and objects).
- **Automated Auditing:** A "Double-Blind" verification system that ensures every question is mathematically sound before it reaches a student.

---

## 4. Technical System Architecture (The 3-Tier Pipeline)

### Tier A: The Master Template (The Schema)

A JSON-based "recipe" stored in the database:

- **Variables:** Defined ranges (e.g., `Radius = 1 to 10`)
- **Logic:** A JS-executable string (e.g., `Math.PI * r * r`)
- **Pattern:** Text with placeholders (e.g., `"A circle has a radius of {{r}}m..."`)

---

### Tier B: The Generator Engine

A serverless function that:

1. Picks a Template.
2. Randomizes variables within defined constraints.
3. Calculates the Verified Answer using a math library (`math.js`).
4. Generates the SVG code for any required visual aids.

---

### Tier C: The Auditor (Validation Loop)

The final question text is sent to an independent AI (Claude 3.5). The system compares the AI's result with the Generator’s calculated answer.

- **Match:** Question is pushed to the `Live_DB`.
- **Mismatch:** Flagged for immediate human review.

---

## 5. Template Library: Guidance & Scaling

To reach the 1,000+ template milestone, assets are categorized into three layers:

1. **Core Logic Templates (~150):**  
   The mathematical rules (e.g., Long Division, Pythagorean theorem).

2. **Visual Variation Templates (~350):**  
   Applying different graphic modules to the same logic (e.g., 1/2 as a pie slice vs. a bar).

3. **Contextual Wrappers (~500+):**  
   Using LLMs to change the story context (e.g., shopping scenario, space mission, sports stat).

**Guidance:**  
One Logic Template combined with 5 Context Wrappers equals 5 Master Templates. This multiplier effect allows rapid library expansion.

---

## 6. Grade-Level Generation Difficulty Matrix

| Grade | Low Complexity                     | Medium Complexity                   | Hard Complexity                                           |
| ----- | ---------------------------------- | ----------------------------------- | --------------------------------------------------------- |
| G1    | Numbers to 100, Basic Addition     | Time I, Date I, 2D Shapes, Coins    | 3D Shapes I, Positions                                    |
| G2    | 3/4-digit Numbers, Multiplication  | Time II, HK Currency, Line Segments | Angles, Direction, 3D Shapes II, Pictograms               |
| G3    | 5-digit Numbers, Division          | Weight, Capacity, Fractions         | Parallel Lines, Triangles, Bar Graphs                     |
| G4    | Arithmetic Ops, Factors/Multiples  | Perimeter, Area, Decimals           | Quadrilaterals, Eight Directions, Bar Charts              |
| G5    | Multi-digit, Algebraic Expressions | Area of Polygons, Decimals          | 3D Cross-sections, Compound Bars, Volume                  |
| G6    | Averages, Percentage, Equations    | Speed, Axial Symmetry               | Circle Area/Circumference, Pie Charts, Broken Line Graphs |

---

## 7. Proposed Solution: The "Big 6" Universal Graphic Engines

Instead of building images per grade, we will build 6 Graphic Engines. These modules receive JSON data and render visuals dynamically.

1. **Number Engine:** Handles number lines, fractions, and bonds.
2. **2D Shape Engine:** Handles polygons, perimeter, and area.
3. **3D Perspective Engine:** Handles solids and cross-sections via Zdog or Three.js.
4. **Data Viz Engine:** Handles all charts (Bar, Pie, Line) via Recharts.
5. **Spatial Engine:** Handles analog clocks, 8-point compasses, and angles.
6. **Measurement Module:** Handles rulers, scales, and liquid gauges.

---

## 8. Proposed Steps & Timeline

### Sprint 1: Infrastructure & Core Engines (Weeks 1–2)

- Database (10h): Setup `templates` and `verified_questions` tables.
- Dev (20h): Build Number Engine and 2D Shape Engine (SVG-based).
- Logic (15h): Integrate `math.js` for truth calculations and logic strings.

---

### Sprint 2: AI Pipeline & Advanced Viz (Weeks 3–4)

- AI (20h): Connect LLM API for story hydration and automated Auditor loop.
- Dev (20h): Build Data Viz Engine and Spatial Engine.
- Batching (10h): Generate the first 5,000 verified questions for Beta launch.

---

## 9. Conclusion

By adopting the PQG-MGS system, we eliminate the primary risk to the Beta launch: Accuracy.

This infrastructure transforms the company from a manual content house into a high-tech platform capable of out-scaling legacy competitors.

Success is defined by:

- Automation SVG graphics on the fly. 100% of the K1–K6 graphic requirements
- Elimination of manual auditing labor
