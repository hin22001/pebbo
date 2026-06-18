# Notion Worklog Pack

This folder is the source of truth for client-facing proof-of-work tracking from commit:

`787911b011a512f5e6c2912f3e9abe4b8b5b5d27`

to current `HEAD`.

## Files

- `task-groups.md`: Grouped Notion-ready items (feature, bug fix, refactor, perf, docs).
- `commit-coverage-checklist.md`: Full commit-by-commit coverage checklist so no work is missed.

## Usage Flow

1. Open `task-groups.md` and create one Notion row per task group.
2. Use `commit-coverage-checklist.md` to tick off each commit once mapped to a Notion row.
3. Keep "Commit Hashes" in each Notion row for auditability.
4. Mark `Included in Notion` as done in the checklist before sharing with client.
