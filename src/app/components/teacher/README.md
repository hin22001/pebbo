# Teacher portal components

Composed components specific to the teacher portal. Follows the family-resemblance contract with the student dashboard (see `DESIGN.md` and memory note `project_teacher-portal-direction.md`).

- `shell/` — TeacherShell, TeacherSidebar, TeacherHeader (Phase 1)
- `dashboard/` — dashboard cards (Phase 2)
- `classroom/` — list + detail tabs (Phase 3)
- `quiz/` — list + authoring (Phase 4)
- `student/` — student detail (Phase 5)
- `flows/` — cross-cutting modals like AssignQuizModal (Phase 4)

Primitives (`Button`, `Card`, `Dialog`, etc.) live in `src/app/components/ui/` (shadcn). Don't fork primitives here — extend them via composition.

Visual parity is enforced by manual PR review. When in doubt, open the student-side equivalent in another browser tab and eyeball.
