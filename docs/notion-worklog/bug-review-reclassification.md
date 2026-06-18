# Bug Review Reclassification (Do Not Push Yet)

Purpose: expand bug visibility for client review (current board under-represents bug work).

Based on commit history already captured in:

- `docs/notion-worklog/commit-coverage-checklist.md`
- `docs/notion-worklog-question-viewer/commit-coverage-checklist.md`

## Summary

- Current visible bug rows are too compressed.
- Recommended bug rows to show in Notion: **14** (Pebbo + Question Viewer).
- This keeps feature/proof coverage intact while clearly reflecting defect-fix effort.

## Recommended Bug Rows (Pebbo)

| Proposed Item Name | Priority | Date Window | Commit Evidence | Why this is a bug item |
|---|---|---|---|---|
| [Pebbo Bug] Question result accuracy and scoring sync fixes | P0 — Critical | 2026-01-16 to 2026-01-17 | `a248ea6,2232b5c,c4b47b7` | Fixed incorrect accuracy determination and coin/star reward synchronization. |
| [Pebbo Bug] Question page layout + scroll behavior corrections | P1 — High | 2026-01-20 | `373cc6d` | Corrected broken height/overflow behavior impacting usability. |
| [Pebbo Bug] Settings cache invalidation regressions | P1 — High | 2026-01-23 | `45dac94,c117b97` | Patched repeated settings-cache issues with direct fixes. |
| [Pebbo Bug] Deferred streak ceremony timing and state race fixes | P1 — High | 2026-02-05 to 2026-02-06 | `0639e86,0a65a28,0c7abdb,05b8c01,62e003d` | Resolved ceremony trigger races after onboarding/initial load. |
| [Pebbo Bug] Session handling hardening (401 debounce/logout/local state cleanup) | P1 — High | 2026-02-05 to 2026-02-06 | `42a8509,0c7abdb,62e003d,474f11c` | Fixed unstable auth/session behavior causing noisy logout loops/state leakage. |
| [Pebbo Bug] Chat localization consistency fixes | P1 — High | 2026-02-10 to 2026-02-13 | `21d56cc,fe5c347` | Fixed mismatches in selected language vs stream/greeting output. |
| [Pebbo Bug] Payment and onboarding profile-state reconciliation | P0 — Critical | 2026-02-23 to 2026-02-24 | `0d20264,1e9b939` | Fixed non-paying modal/reconciliation behavior and missing onboarding flags in auth profile. |
| [Pebbo Bug] Dashboard NaN and fallback data guard fixes | P1 — High | 2026-03-03 | `3ce14ce` | Prevented invalid dashboard stats and added guarded fallback fetch logic. |
| [Pebbo Bug] Placement answer validation and multi-choice correctness | P1 — High | 2026-03-09 | `00d26d8` | Corrected answer validation to consider checked options only. |
| [Pebbo Bug] Legacy mixed-fraction parsing normalization | P1 — High | 2026-03-16 | `25687e8` | Fixed parsing inconsistencies caused by legacy mixed-fraction encodings. |
| [Pebbo Bug] Admin preview stale render key issues | P2 — Medium | 2026-03-16 | `cb44ea8` | Fixed stale rich-text render behavior by ensuring unique keys. |
| [Pebbo Bug] image_approved propagation overwrite prevention | P1 — High | 2026-03-16 | `ade86b3` | Prevented incorrect flag overwrites in question processing. |

## Recommended Bug Rows (Question Viewer)

| Proposed Item Name | Priority | Date Window | Commit Evidence | Why this is a bug item |
|---|---|---|---|---|
| [Question Viewer Bug] Build/API route stabilization fixes | P1 — High | 2026-01-29 | `6bec354` | Addressed build/runtime issues in category prompt and question API routes. |
| [Question Viewer Bug] Question card/text overflow layout fix | P2 — Medium | 2026-01-30 | `78ec825` | Fixed title/category/grid overflow causing UI breakage. |
| [Question Viewer Bug] Runtime null-guarding for route/search params | P1 — High | 2026-02-01 | `8d71883` | Prevented runtime crashes from nullable params in app routes. |
| [Question Viewer Bug] Fraction explanation JSON parse fallback | P1 — High | 2026-02-01 | `85d824f` | Fixed parser failures for non-JSON explanation content. |
| [Question Viewer Bug] 404 semantics for missing question resources | P1 — High | 2026-03-13 | `4b0d8ff` | Corrected API to return proper 404 for missing/non-existent records. |

## Proposed Action (after your review)

1. Keep existing 35 proof-of-work rows as-is.
2. Add these bug rows (or convert specific existing rows into bug rows) so bug count is clearly above 4.
3. Ensure each bug row includes commit link/range and remains `Done` + `Reported By = Faraz`.

No Notion changes were made in this step.

## Client-Facing Bug Shortlist (10 Items)

Use this shortlist for presentation if you want stronger bug visibility without bloating the board.

| Item Name | Repo | Priority | Date Window | Commit Link |
|---|---|---|---|---|
| Question result accuracy and scoring sync fixes | Pebbo | P0 — Critical | 2026-01-16 to 2026-01-17 | https://github.com/irfanfaraaz/pebbo_mvp-oct/compare/a248ea6...c4b47b7 |
| Question page layout and scroll behavior corrections | Pebbo | P1 — High | 2026-01-20 | https://github.com/irfanfaraaz/pebbo_mvp-oct/commit/373cc6d |
| Settings cache invalidation regressions | Pebbo | P1 — High | 2026-01-23 | https://github.com/irfanfaraaz/pebbo_mvp-oct/compare/45dac94...c117b97 |
| Deferred streak ceremony timing race fixes | Pebbo | P1 — High | 2026-02-05 to 2026-02-06 | https://github.com/irfanfaraaz/pebbo_mvp-oct/compare/0639e86...62e003d |
| Session/auth 401 handling hardening | Pebbo | P1 — High | 2026-02-05 to 2026-02-06 | https://github.com/irfanfaraaz/pebbo_mvp-oct/compare/42a8509...474f11c |
| Payment and onboarding profile-state reconciliation | Pebbo | P0 — Critical | 2026-02-23 to 2026-02-24 | https://github.com/irfanfaraaz/pebbo_mvp-oct/compare/0d20264...1e9b939 |
| Dashboard NaN stats and fallback guard fixes | Pebbo | P1 — High | 2026-03-03 | https://github.com/irfanfaraaz/pebbo_mvp-oct/commit/3ce14ce |
| Legacy mixed-fraction parsing normalization | Pebbo | P1 — High | 2026-03-16 | https://github.com/irfanfaraaz/pebbo_mvp-oct/commit/25687e8 |
| Runtime null-guarding for route/search params | Question Viewer | P1 — High | 2026-02-01 | https://github.com/irfanfaraaz/question-viewer/commit/8d71883 |
| 404 semantics for missing question resources | Question Viewer | P1 — High | 2026-03-13 | https://github.com/irfanfaraaz/question-viewer/commit/4b0d8ff |

### Suggested Board Move

- Keep all existing proof-of-work rows.
- Add these 10 as explicit `Bug` rows with `Status=Done`, `Reported By=Faraz`.
- This resolves the "only 4 bugs" perception while staying concise and evidence-backed.

## Client-Facing Bug Shortlist (10 Rows)

Use this if you want a concise but strong bug narrative on the board.

| # | Bug Item (client-facing) | Priority | Repo | Commit Link |
|---|---|---|---|---|
| 1 | [Pebbo Bug] Question result accuracy and scoring sync fixes | P0 — Critical | pebbo_mvp-oct | https://github.com/irfanfaraaz/pebbo_mvp-oct/compare/a248ea6...c4b47b7 |
| 2 | [Pebbo Bug] Question page layout + scroll behavior corrections | P1 — High | pebbo_mvp-oct | https://github.com/irfanfaraaz/pebbo_mvp-oct/commit/373cc6d |
| 3 | [Pebbo Bug] Settings cache invalidation regressions | P1 — High | pebbo_mvp-oct | https://github.com/irfanfaraaz/pebbo_mvp-oct/compare/45dac94...c117b97 |
| 4 | [Pebbo Bug] Session handling hardening (401 debounce/logout/state cleanup) | P1 — High | pebbo_mvp-oct | https://github.com/irfanfaraaz/pebbo_mvp-oct/compare/42a8509...474f11c |
| 5 | [Pebbo Bug] Chat localization consistency fixes | P1 — High | pebbo_mvp-oct | https://github.com/irfanfaraaz/pebbo_mvp-oct/compare/21d56cc...fe5c347 |
| 6 | [Pebbo Bug] Payment and onboarding profile-state reconciliation | P0 — Critical | pebbo_mvp-oct | https://github.com/irfanfaraaz/pebbo_mvp-oct/compare/0d20264...1e9b939 |
| 7 | [Pebbo Bug] Dashboard NaN and fallback data guard fixes | P1 — High | pebbo_mvp-oct | https://github.com/irfanfaraaz/pebbo_mvp-oct/commit/3ce14ce |
| 8 | [Pebbo Bug] Legacy mixed-fraction parsing normalization | P1 — High | pebbo_mvp-oct | https://github.com/irfanfaraaz/pebbo_mvp-oct/commit/25687e8 |
| 9 | [Question Viewer Bug] Runtime null-guarding for route/search params | P1 — High | question-viewer | https://github.com/irfanfaraaz/question-viewer/commit/8d71883 |
| 10 | [Question Viewer Bug] 404 semantics for missing question resources | P1 — High | question-viewer | https://github.com/irfanfaraaz/question-viewer/commit/4b0d8ff |
