# Question Viewer Task Groups

Repo: `https://github.com/irfanfaraaz/question-viewer`  
Range: `91b24631c83e322a465f270641780ecc43715604..HEAD`

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

| Item Name | Type | Priority | Date Window | Commit Hashes | Proof Summary |
|---|---|---|---|---|---|
| Question data foundation: ID/description filters and draft/effective status logic | Feature | P0 | 2026-01-13 to 2026-01-16 | `8744a95,816dc3a,32cd2a0,36f5d9f,e094228,d26ee71` | Established stable question retrieval and filtering behavior including description and draft handling. |
| Question display UX refinement: dynamic categories and image approval visibility | Feature | P1 | 2026-01-15 to 2026-01-17 | `bf47e1a,e9330b1,fc2484d` | Improved display semantics with category labels and effective image approval signals. |
| Image architecture and generation/upload operations enablement | Feature | P0 | 2026-01-19 to 2026-01-22 | `5a0cd97,8777045,f83029c,4d913f1` | Added architecture guidance and operational scripts for image generation, upload, and rendering placement. |
| Platform/config cleanup for image workflow stability | Infra Optimisation | P2 | 2026-01-21 | `c0de64e` | Removed experimental Next config to stabilize app behavior during rapid image tooling changes. |
| Math asset library module, centralized Supabase client, and bulk asset upload | Feature | P1 | 2026-01-23 to 2026-01-26 | `fb83633,900ee07,31689f4,501fa79,8116e33` | Delivered math library CRUD/upload pages, centralized DB client usage, and bulk ingestion limits. |
| Prompt quality and DALL-E generation tuning for educational images | Feature | P1 | 2026-01-28 to 2026-01-29 | `dca8312,e61fe21,df3dba7` | Increased prompt clarity and generation quality for cleaner, solvable educational visuals. |
| LLM image pipeline hardening: progress tracking, category prompts, and UI resilience | Feature | P1 | 2026-01-29 to 2026-01-30 | `7d1fd4b,6bec354,99e95d9,78ec825` | Added operational robustness around generation progress and improved error/overflow handling. |
| AI audit/fix scripts and utilities rollout | Feature | P0 | 2026-01-31 | `52a7fea` | Implemented script stack for automated auditing, fixing, and inspection workflows. |
| Finalization status and runtime guardrails for question processing | Feature / Bug | P0 | 2026-02-01 | `96471cf,a8dac6e,8d71883,85d824f` | Added finalization workflow and runtime safety checks for params and explanation parsing. |
| Reporting module delivery (UI + APIs + schema updates) and build sync | Feature | P1 | 2026-02-16 | `e654d63,792f1c7` | Added reporting pages/APIs and related DB support while stabilizing dependency/lockfile state. |
| API correctness and editor fraction-editing enhancements | Bug Fix / Feature | P1 | 2026-03-13 to 2026-03-16 | `4b0d8ff,aded520,da7ca93` | Added strict 404 behavior for missing questions and improved rich text fraction insertion/edit UX. |

## Totals

- Total grouped Notion tasks: **11**
- Total commits covered (via `commit-coverage-checklist.md`): **36**
- Coverage status: **36 commits mapped into 11 grouped tasks**
