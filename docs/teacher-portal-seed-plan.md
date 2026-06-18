# Teacher Portal — Test Data Seed Plan

Plan for getting the live Pebbo Supabase database into a state where client-facing teacher portal testing is possible. Drafted 2026-05-07.

Project: `qvervegypimlrnjdsnrk` (Pebbo).

---

## 1. Goal

Create a working teacher-testing environment for one school, so clients can log in as teachers and see populated classrooms (rosters, analytics, etc) without requiring the full admin/license production flow.

---

## 2. Current state (verified 2026-05-07)

### 2.1 Schools and tenancy

| school_id | name | students | teachers | admins | teacher_licenses |
|---|---|---:|---:|---:|---:|
| 1 | school_name | 0 (broken link) | 3 | 2 | 5 |
| 2 | NEWSCHOOLTEST | 0 | 0 | 0 | 1 |
| 3 | Test School | 0 | 1 | 1 | 10 |
| 6 | Demo School | 0 | 0 | 0 | 10 |

### 2.2 Orphan students

`public.users` contains **2,315 rows** with `role='student' AND school_id IS NULL`. They split into two groups, but per user decision both will be adopted into school 1 (user will filter trash later).

| Cohort | Count | Identifier |
|---|---:|---|
| The 2,000 test batch | 2,000 | `first_name LIKE 'Student %'`, `email LIKE 'student%@%'`, `auth.users.created_at::date = '2026-03-23'`, `stripe_customer_id LIKE 'cus_manual_%'` |
| Legacy junk (mixed test/real, will be filtered later) | ~315 | `ydcF1`..`ydcF150`, `TESTSTRIPE`, `asd`, `H`, `確認1231`, etc — created across 2024–2026 |

**Decision:** all 2,315 are backfilled to school_id=1. Canonical filter is the simpler one:

```sql
role = 'student' AND school_id IS NULL
```

### 2.3 Existing classrooms in school 1

10+ classrooms already exist (`9A`, `9B`, `9D`, `9E`, `9G`, `9J`, `Teacherr`, `TEACHER MADE THIS`, `Paris Class`, `class`, etc). Each has 0–2 participants. None of these are the right home for 2,000 students — using them would commingle test data with legacy real data.

### 2.4 Existing teachers

3 teachers already in school 1 (we don't have known passwords). 1 teacher in school 3.

---

## 3. Plan

Three sequential phases. Each phase is independently reversible.

### Phase 1 — Adopt all 2,315 orphan students into school 1

```sql
UPDATE public.users
SET school_id = 1
WHERE role = 'student'
  AND school_id IS NULL;
-- Expected: 2315 rows updated.
```

**Rollback** (note: this strips school_id from any student in school 1, so only safe if no manual additions happened in between):
```sql
-- Safer rollback: only revert the rows we just touched, captured to a side table first.
-- Simple rollback (use immediately, before other writes):
UPDATE public.users SET school_id = NULL WHERE role = 'student' AND school_id = 1;
```

**Recommended pre-flight:** snapshot the affected user_ids before the update so rollback is precise:

```sql
CREATE TABLE IF NOT EXISTS _seed_backfill_2026_05_07 AS
SELECT user_id FROM public.users WHERE role='student' AND school_id IS NULL;
-- Then run the UPDATE above.
-- Precise rollback:
-- UPDATE public.users SET school_id = NULL WHERE user_id IN (SELECT user_id FROM _seed_backfill_2026_05_07);
```

### Phase 2 — Create one dedicated classroom and add all 2,315 students

We do NOT reuse existing school 1 classrooms — they hold a few legacy students and shouldn't be polluted. Create a new classroom flagged for test-cohort cleanup later.

```sql
-- Create the classroom
INSERT INTO public.classrooms (classroom_name, school_id, archived)
VALUES ('All Test Students', 1, false)
RETURNING classroom_id;
-- Note the returned classroom_id — call it $CID below.

-- Add all 2,315 students as confirmed participants
INSERT INTO public.classroom_participants (user_id, classroom_id, confirmed)
SELECT user_id, $CID, true
FROM public.users
WHERE role = 'student'
  AND school_id = 1
ON CONFLICT DO NOTHING;
-- Expected: 2315 rows inserted (assuming none already participate in $CID).
```

**Rollback:**
```sql
DELETE FROM public.classroom_participants WHERE classroom_id = $CID;
DELETE FROM public.classrooms WHERE classroom_id = $CID;
```

User notes the option to "separate students later" — separation is a future task, handled by editing `classroom_participants` rows once teacher portal supports the UI flow.

### Phase 3 — Create teacher test accounts

Bypass the admin/license flow for test seeding. Mirror the pattern in `scripts/create-student-accounts.ts`. Steps:

1. **Bump license count** so the API never blocks future legitimate teacher creation:
   ```sql
   UPDATE public.schools SET teacher_licenses = 50 WHERE school_id = 1;
   ```
2. **Run new script** `scripts/create-teacher-accounts.ts` (to be written) that:
   - Uses `SUPABASE_SERVICE_ROLE_KEY`.
   - For each entry in a hardcoded `teachers[]` array, calls `supabase.auth.admin.createUser` with metadata matching `TeacherMetadata`:
     ```ts
     {
       role: 'teacher',
       first_name, last_name,
       school_id: 1,
       teaching_subject: ['math'],     // text[] in DB
       is_subject_head: false,
       referred_by: null,
       stripe_customer_id: null,
       email_verified: true
     }
     ```
   - `email_confirm: true` so teachers can log in immediately.
   - Verifies the `public.users` and `public.teachers` rows were created by triggers; inserts manually if not (the student script relies on triggers — same expectation here).
   - Optionally adds each teacher to the `All Test Students` classroom via `classroom_participants` so they see the populated roster on first login.

**Suggested seed:**

```ts
const teachers = [
  { email: 'test.teacher1@pebbo.io', password: 'password123', first_name: 'Test', last_name: 'Teacher One',  teaching_subject: ['math'] },
  { email: 'test.teacher2@pebbo.io', password: 'password123', first_name: 'Test', last_name: 'Teacher Two',  teaching_subject: ['math'] },
  { email: 'test.teacher3@pebbo.io', password: 'password123', first_name: 'Test', last_name: 'Teacher Three',teaching_subject: ['math'] },
  { email: 'test.teacher4@pebbo.io', password: 'password123', first_name: 'Test', last_name: 'Teacher Four', teaching_subject: ['math'] },
  { email: 'test.teacher5@pebbo.io', password: 'password123', first_name: 'Test', last_name: 'Teacher Five', teaching_subject: ['math'] },
];
```

**Rollback:**
```sql
-- Identify the cohort
SELECT user_id FROM public.users WHERE role='teacher' AND first_name='Test' AND last_name LIKE 'Teacher %';
-- Then via supabase.auth.admin.deleteUser(uuid) per row, plus
DELETE FROM public.classroom_participants WHERE user_id IN (...);
```

---

## 4. Decisions deferred (per user)

- **Trash account cleanup.** All 2,315 orphans (including ~315 legacy junk) get adopted into school 1. User will filter later.
- **Splitting students across classrooms.** All 2,315 in one classroom for now. User will subdivide once teacher portal UI exists.
- **Auth flow for prod teacher creation.** This plan is test-data-only. Production teacher onboarding should still go through `/api/protected/admin/create_teacher` and respect license counts. The bypass is justified only because we control the school and need a fast seed for client testing.

---

## 5. Open questions

1. **Classroom name** — `All Test Students` is a placeholder. Confirm or rename.
2. **Number of test teachers** — 5 proposed; user can adjust before script runs.
3. **Test teacher passwords** — `password123` matches the student-script convention. Same here, or stronger?
4. **Whether teachers should be auto-added to `All Test Students`** — recommended yes (so the first login isn't an empty state). Confirm.

---

## 6. Execution checklist

- [ ] User reviews this plan
- [ ] Phase 1 SQL runs (2,315 students → school_id=1)
- [ ] Phase 2 SQL runs (new classroom + 2,315 participants)
- [ ] `teacher_licenses` bumped to 50 on school 1
- [ ] `scripts/create-teacher-accounts.ts` written
- [ ] Script runs, 5 teacher accounts created
- [ ] (Optional) Teachers added as participants in `Test Cohort 2000`
- [ ] Credentials documented and shared with client tester
- [ ] Smoke test: log in as `test.teacher1@pebbo.io`, verify classroom + roster visible
