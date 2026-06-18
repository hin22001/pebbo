# Task Groups for Notion Dashboard

Range covered: `787911b011a512f5e6c2912f3e9abe4b8b5b5d27..HEAD`

## Suggested Notion Schema

- Status
- Item Name
- Type
- Priority
- Date Window
- Commit Hashes
- Proof Summary
- Reported By

## Grouped Items


| Item Name                                                                   | Type               | Priority | Date Window              | Commit Hashes                                                                                                             | Proof Summary                                                                                                             |
| --------------------------------------------------------------------------- | ------------------ | -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| AI question audit/fix automation pipeline (Y2/Y5)                           | Feature            | P0       | 2026-01-09 to 2026-01-15 | `7fe03ee,2d4c1f6,ad66e82`                                                                                                 | Built audit and fix automation with progress logging, extraction helpers, and QA scripts.                                 |
| Question image generation tooling rollout (scripts + utilities)             | Feature            | P1       | 2026-01-15               | `7f1d61b`                                                                                                                 | Introduced image-generation scripting stack and supporting utilities for question media.                                  |
| Question flow stabilization, scoring fixes, and load-time optimization      | Bug Fix / Perf     | P0       | 2026-01-12 to 2026-01-20 | `6cc941d,2f99c32,c4a321c,56fd088,a248ea6,c4b47b7,2232b5c,373cc6d`                                                         | Fixed accuracy/coins sync and scroll issues; improved question transitions and responsiveness.                            |
| Audited question data path and image architecture improvements              | Feature            | P0       | 2026-01-17 to 2026-01-20 | `64b6b08,7aa5f7a,736b570,ceef064`                                                                                         | Added effective question view + RPC updates + SVG imageUrl/PNG fallback rendering improvements.                           |
| Celebration APIs and dashboard cache/performance instrumentation            | Feature / Perf     | P1       | 2026-01-21 to 2026-01-23 | `5a10956,a0d15fb,d47f1a9,0869ecc,45dac94,c117b97`                                                                         | Added celebration APIs, cache busting logic, and parallelized dashboard initialization with timing metrics.               |
| Product planning docs for map/shop and math asset strategy                  | Docs / Planning    | P2       | 2026-01-23               | `df5343f,75bbbf1`                                                                                                         | Produced PRDs and architecture notes used to guide upcoming product work.                                                 |
| Math Library v1, profile image sync, and Shop v1 delivery                   | Feature            | P1       | 2026-01-26 to 2026-01-28 | `6ea782c,c7afe55,f58a740,1877294`                                                                                         | Delivered math library endpoints/UI, profile avatar persistence, and initial shop UI + purchase modal.                    |
| Onboarding modal UX, navigation guidance, and contextual intros             | Feature            | P1       | 2026-02-02 to 2026-02-06 | `85ad831,ba958e9,2b33bbc,a5fe736,5d64015`                                                                                 | Implemented multi-scene and page-aware onboarding modal experience and navigation guidance.                               |
| Audio theming, delayed streak ceremony, and session/error hardening         | Feature / Bug Fix  | P1       | 2026-02-04 to 2026-02-06 | `eb808fa,0f37565,0639e86,42a8509,0a65a28,0c7abdb,05b8c01,62e003d,474f11c`                                                 | Added BGM/sound assets, deferred reward ceremony timing, and hardened logout/401 flows.                                   |
| App and question issue reporting workflows                                  | Feature            | P1       | 2026-02-09               | `09ef6b7,14acb0a,4af6170`                                                                                                 | Shipped in-app + question-level issue reporting drawers and backend handling.                                             |
| Dashboard data consolidation and client caching architecture                | Feature / Perf     | P1       | 2026-02-10 to 2026-02-13 | `21d56cc,6f31e3c,487388a,9d9cb17,0a39e8d,4d52d89,a3897e9,f823fbb,fe5c347,34ca767`                                         | Consolidated dashboard data APIs/RPCs, introduced Zustand caching, and modularized dashboard/UI sound behavior.           |
| Signup and placement onboarding flow implementation                         | Feature            | P0       | 2026-02-18 to 2026-02-20 | `5303af9,f7109a8,1738b66`                                                                                                 | Added grade-aware signup and placement test flow with stronger onboarding enforcement.                                    |
| Stripe checkout + payment reconciliation + onboarding resume gate           | Feature            | P0       | 2026-02-23 to 2026-02-24 | `265384c,0d20264,1e9b939`                                                                                                 | Implemented checkout integration, payment status recovery, and resume gating for onboarding continuity.                   |
| Typography rollout and UI consistency pass                                  | Refactor / Style   | P2       | 2026-02-24               | `7cafbc2,957b45f,df7c712`                                                                                                 | Applied Advercase font across core surfaces and cleaned visual consistency for key components.                            |
| Student account script maintenance updates                                  | Feature            | P2       | 2026-02-25               | `ee9f543`                                                                                                                 | Updated account creation scripting for testing/operations workflows.                                                      |
| App Router migration: public surface and shared providers                   | Refactor           | P0       | 2026-02-25               | `8ecdcf1`                                                                                                                 | Migrated public pages and core provider/wrapper plumbing to Next.js App Router structure.                                 |
| App Router migration: student/teacher/admin routes                          | Refactor           | P0       | 2026-02-25 to 2026-02-26 | `c23578c,0e3799f,a637abf,5d9b1e8`                                                                                         | Migrated app-area routes across student, teacher, and admin domains with compatibility steps.                             |
| SSR/SEO rollout across student/public journeys                              | Feature / Perf     | P0       | 2026-03-03               | `8252964,2c8f820,157b4e7,a22b9e6,90cd9a8,3ae15c2,101f895,8112f06`                                                         | Delivered SSR prefetch and SEO metadata on primary student/public experiences.                                            |
| Auth context and QuestionPage modernization (v2 + ONNX path)                | Feature / Perf     | P0       | 2026-03-03 to 2026-03-05 | `18d94f4,98e52d9,3ce14ce,4ef052c,0b02a09,e3a179a,a0644a6,688b0c5,50923c3,d5e1267,11a9c11,ec3841e`                         | Modernized question architecture and improved auth/context refresh with model performance updates.                        |
| Teacher/admin SSR SEO expansion and dashboard/exercise UX refinements       | Feature / Refactor | P1       | 2026-03-06 to 2026-03-11 | `18b92fe,098b6af,84c6db4,aa08bdb,00d26d8,6617db6,cd62371,d63a2b8,6078257,7091d3b,53786df,f33b171,eca18ce,284e5ea,3e95ccb` | Expanded SSR/SEO and polished category filtering, onboarding exercise behavior, animations, and dashboard responsiveness. |
| Secret admin question tools and answer/image correctness fixes              | Feature / Bug Fix  | P1       | 2026-03-16               | `5a18132,4f2073b,25687e8,cb44ea8,fd06ed3,ade86b3`                                                                         | Added secret admin APIs and fixed mixed-fraction parsing, rich-text keying, and image approval propagation.               |
| Dev compilation optimization phases 0-3 (imports and lazy loading)          | Perf               | P1       | 2026-03-17               | `2263a52,20c8ca2,c5f86e9,06dd414,a75082f,f541f46,7461deb`                                                                 | Reduced dev compile overhead via optimizePackageImports, direct import paths, and lazy loading.                           |
| Anti-regression guardrails for compilation performance                      | Infra Optimisation | P2       | 2026-03-17               | `a2c292b,e982c74`                                                                                                         | Added lint/documentation guardrails to prevent barrel-import regressions after optimization.                              |
| Activity tracking, web vitals capture, and admin monitoring analytics pages | Feature            | P1       | 2026-03-23               | `1637303`                                                                                                                 | Added end-user activity tracking, vitals reporting, analytics APIs, admin monitoring UI, and supporting migrations.       |


## Scripts Spotlight (For Client Visibility)

- AI audit and fix scripts: `scripts/ai-audit-questions.ts`, `scripts/apply-ai-fixes.ts`, `scripts/scan-chinese-explanations.ts`
- Image generation scripts: `scripts/generate-question-images.ts`, `scripts/generate-needed-images.ts` and utility folders under `scripts/generate-images-utils` and `scripts/generate-needed-images-utils`

## Totals

- Total grouped Notion tasks: **24**
- Total commits covered (via `commit-coverage-checklist.md`): **100**
- Coverage status: **100 commits mapped into 24 grouped tasks**

