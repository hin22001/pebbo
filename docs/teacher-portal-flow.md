# Pebbo Teacher Portal — v1 Flow

This document walks through what teachers will see and do in the v1 teacher portal. Read it as a step-by-step tour of the experience, not as engineering spec. Layout sketches are text-only and indicate position, not final visuals.

---

## Overview

The teacher portal lives at `/teacher/...` inside the same Pebbo web app students already use. Teachers log in with email and password, then land on a dashboard that gives them a one-glance view of their classrooms, students, and assigned work. From there they can dig into any classroom, look at individual students, create quizzes from Pebbo's question bank, and assign those quizzes to their classes.

The visual language matches the student portal: same fonts, same brand colors, same chrome (sidebar widths, header height), same component feel. A teacher who has seen the student app should immediately recognize the teacher portal as part of the same product.

---

## Logging in

Teachers use the same login page students use — email and password, no separate teacher login URL in v1. After a successful login, the system checks the role on the account: teachers go to `/teacher/dashboard`, students continue to their existing dashboard. No new login UI.

(Note for the future: we may add a separate, branded teacher login screen later if it becomes useful. For v1 the shared login is the right trade-off.)

---

## The dashboard — what a teacher sees on login

The dashboard is the home page of the portal. Goal: in five seconds, a teacher should know who they are, what their classes look like, what's outstanding, and what they can do next.

```
┌─────────────────────────────────────────────────────────────────┐
│ Good morning, Mrs. Sharma. You teach 3 classrooms, 78 students. │
└─────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────┐ ┌──────────────────────────┐
│ My Classrooms                     │ │ Quick Actions             │
│   Year 2 — 9J · 32 students  →    │ │  + Create new quiz        │
│   Year 2 — 9G · 28 students  →    │ │  + Assign a quiz          │
│   Year 2 — 9B · 18 students  →    │ └──────────────────────────┘
│                                   │ ┌──────────────────────────┐
│ Active Assignments                │ │ Students Needing Support  │
│  ▰▰▰▰▰▰▱▱  Fractions Q3   24/32 │ │   Riya · 42% avg     →    │
│  ▰▰▰▰▰▱▱▱  Word Probs 1   17/28 │ │   Ananya · 48% avg   →    │
│  ▰▰▰▰▰▰▰▱  Decimals Q2   25/28 │ │   Kabir · declining  →    │
│  + Assign a new quiz              │ │   Maya · 50% avg     →    │
└──────────────────────────────────┘ │   Dev · 51% avg      →    │
                                      └──────────────────────────┘
```

**The five sections:**

1. **Welcome strip (top, full width).** A single sentence with the teacher's name and headline numbers worked into prose: "Good morning, Mrs. Sharma. You teach 3 classrooms with 78 students." No big-number tiles. Avatar on the right.

2. **My Classrooms (left column).** A list of the teacher's classrooms. Each row shows the classroom name, student count, and last activity. Click a row to open that classroom's detail page.

3. **Active Assignments (left column, below).** Quizzes the teacher has assigned across their classrooms, each with a completion progress bar (e.g., `Fractions Quiz 3 in Year 2 — 9J: 24/32 done`). Includes an inline "+ Assign a new quiz" button so teachers can launch the assign flow without leaving the dashboard.

4. **Quick Actions (right column, top).** Two prominent buttons: "Create new quiz" and "Assign a quiz." The two most common teacher actions, two clicks from login.

5. **Students Needing Support (right column, below).** Up to five students with the lowest recent scores or declining performance. Click any name to open that student's detail page. If the teacher has no signal yet (e.g., no assignments completed), this card shows a calm "Start assigning quizzes to surface student insights" CTA instead.

The dashboard intentionally avoids charts, leaderboards, and notification feeds. Charts live on the classroom and student detail pages where they have context. The dashboard is text and cards.

---

## Sidebar — getting around the portal

A vertical sidebar on the left of every page contains:

- **Dashboard** — back to the home view above
- **Classrooms** — list of classrooms the teacher belongs to
- **Quizzes** — list of quizzes the teacher has created

The sidebar matches the student portal's chrome: same width, same active-state highlight (brand orange), same collapsed-to-icons behavior on narrow screens.

The teacher's avatar sits in the **top-right corner** of every page, with a dropdown for "Profile" and "Log out" (matching the student portal pattern). Profile is not in the sidebar.

---

## Classrooms — the list

```
My Classrooms                                       + New classroom

┌─────────────────────────────────────────────────────────────────┐
│ Search classrooms…                                               │
├─────────────────────────────────────────────────────────────────┤
│ Year 2 — 9J     32 students   3 active assignments   2h ago  →  │
│ Year 2 — 9G     28 students   2 active assignments   1d ago  →  │
│ Year 2 — 9B     18 students   1 active assignment    3d ago  →  │
└─────────────────────────────────────────────────────────────────┘
```

Click a classroom row to enter it. "+ New classroom" creates a classroom with just a name (no wizard, no fancy setup — teachers can configure students and assignments from inside the classroom afterwards).

**Empty state** (rare — admin usually creates classrooms): "You're not in any classrooms yet. Talk to your school admin, or create one if you have permission."

---

## Classroom detail — the most important page

Three tabs on a single classroom: **Roster**, **Assignments**, **Insights**. The teacher stays in one URL while switching tabs — no back-button friction, no losing context about which classroom they're in.

```
← My Classrooms
Year 2 — 9J                                    [Edit name] [Archive]
32 students · Created Jan 2026

┌─────────────────────────────────────────────────────────────────┐
│ Roster   Assignments   Insights                                  │
└─────────────────────────────────────────────────────────────────┘

ROSTER tab (default):
┌─────────────────────────────────────────────────────────────────┐
│ Search students…                                  + Add students │
├─────────────────────────────────────────────────────────────────┤
│ Anya Sharma         87% avg   Last active 2h ago         →       │
│ Riya Patel          42% avg   Last active 3d ago    ⚠   →       │
│ Kabir Nair          75% avg   Last active 1h ago         →       │
│ … 29 more                                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Roster tab (default)

Every student in the classroom: name, average score, last active. Click a row to open the student's detail page.

**Adding students:** "+ Add students" opens a small modal with two paths:

- Paste student emails one per line, or
- Upload a CSV (template downloadable inside the modal)

Both go through the existing bulk-import endpoint.

**Removing a student:** Each row has a small action menu (the ⋮ icon on the right) with a "Remove from classroom" option. Clicking it shows a confirm dialog ("Remove Riya Patel from Year 2 — 9J?"), and on confirm the student is removed from this classroom only — their Pebbo account stays active, they just no longer appear in this roster. Reversible by re-adding them via "+ Add students".

### Assignments tab

Quizzes assigned to this classroom, each row showing:

- Quiz name
- Completion progress (`24/32 done`)
- Class average score
- Due date (if set)

**Assigning:** "+ Assign quiz" opens the same assign-quiz modal as the dashboard.

**Drilling in:** Click an assignment row to see who's done, who hasn't, and individual scores.

**Unassigning:** Each row has a small action menu (⋮) with a "Remove from this classroom" option. Confirm dialog appears, and on confirm the assignment link is removed — the quiz itself stays in the teacher's quiz list (it just no longer appears for this classroom). Existing student attempts at that quiz are not deleted; they remain on each student's history.

### Insights tab

Class-level analytics: average score, weekly trend, top three weakest categories, top three strongest, completion rate across all assignments. This is where charts live — never on the dashboard.

---

## Student detail — drilling into one student

```
← Year 2 — 9J
Anya Sharma   ·   87% avg   ·   14 quizzes done   ·   5-day streak

Recent activity:
  Fractions Quiz 3       87%   2h ago
  Decimals Q2            91%   yesterday
  Word Problems 1        78%   2 days ago
  …

Progress by category:
  Fractions       ▰▰▰▰▰▰▰▰▱▱   85%   ↑ 4% this week
  Word Problems   ▰▰▰▰▰▰▱▱▱▱   62%   ↓ 1%
  Decimals        ▰▰▰▰▰▰▰▰▰▱   91%   ↑ 6%
  …

[ Daily summary ] [ Weekly summary ]
```

The teacher can review the student's recent quiz attempts, see how they're trending per math category, and expand daily or weekly summary reports. v1 is read-only — no manual grade overrides, no messaging the student.

---

## Quizzes — the list

```
My Quizzes                                          + New quiz

┌─────────────────────────────────────────────────────────────────┐
│ Search quizzes…                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Fractions Quiz 3        12 questions   Assigned to 2 classrooms │
│ Word Problems 1         10 questions   Assigned to 3 classrooms │
│ Decimals Q2             8 questions    Assigned to 1 classroom  │
└─────────────────────────────────────────────────────────────────┘
```

Click a quiz row to edit. "+ New quiz" opens the quiz authoring screen.

**Empty state**: "You haven't created any quizzes yet — Create your first quiz."

---

## Quiz authoring — creating or editing a quiz

Single screen with three labeled sections. No multi-page wizard — teachers iterate (add questions, swap, preview, swap again), and a wizard would force linear progression that fights how teachers actually build quizzes.

```
← My Quizzes
Untitled Quiz                              [Save draft] [Publish]

STEP 1 — Name and describe
  Title:        [ Fractions Quiz 3              ]
  Description:  [ Mixed-number addition practice ]
  Year level:   [ Year 2 ▾ ]      Subject: [ Math ▾ ]

STEP 2 — Pick questions from the question bank
  ┌────────────────────────────────┬─────────────────────────────┐
  │ SEARCH                          │ ADDED TO THIS QUIZ          │
  │ ┌──────────────────────────┐   │ 1. What is 1/2 + 1/4?      │
  │ │ Search by keyword…        │   │ 2. Simplify 6/8.            │
  │ └──────────────────────────┘   │ 3. Add 2 1/3 + 1 2/3.       │
  │ Filter: Category, Difficulty   │ 4. (drag to reorder)        │
  │                                 │                             │
  │ ☐ What is 1/2 + 1/4?     [Add] │ Total: 12 questions         │
  │ ☐ Simplify 6/8.          [Add] │                             │
  │ ☐ Compare 3/4 and 5/8.  [Add] │                             │
  │ … 84 more                       │                             │
  └────────────────────────────────┴─────────────────────────────┘

STEP 3 — Review and save
  [ Preview as student would see ]   [ Save draft ]   [ Publish ]
```

The teacher sets metadata, searches Pebbo's existing question bank by keyword + category + difficulty, adds and reorders questions, optionally previews how the quiz will look to a student, and saves either as a draft (only the teacher can see) or publishes (becomes assignable to classrooms).

Editing an existing quiz uses the same screen with questions pre-loaded. Teachers can also delete a quiz from this screen with a confirmation dialog.

**Important note for v1:** Teachers pick from the _existing_ Pebbo question bank. They do not write new questions in v1.

---

## Assigning a quiz — one consistent modal

The assign-quiz flow is reachable from three places:

- The dashboard's "Quick Actions" card
- A classroom's Assignments tab ("+ Assign quiz" button)
- The dashboard's Active Assignments card ("+ Assign a new quiz" inline button)

All three open the **same modal**:

```
Assign quiz
─────────────────────────────────
1. Pick a classroom:  [ Year 2 — 9J ▾ ]
2. Pick a quiz:        [ Fractions Quiz 3 ▾ ]
3. Due date:           [ Fri, May 16 ]   (optional)
4. Target score:       [ 70% ]            (optional)

[ Cancel ]                    [ Assign ]
```

If the teacher arrived from a classroom-detail page, step 1 is pre-filled with that classroom. If from the dashboard, they pick. One consistent modal across entry points means less to learn.

---

## Profile

A simple form: first name, last name, teaching subject(s), email (display-only), and a "Change password" section. Plus a "Log out" button. Reachable from the avatar dropdown in the top-right corner of every page.

---

## End-to-end demo narrative

A typical first session for a new teacher tester would look like:

1. Log in with credentials we provide.
2. Land on the dashboard — see classrooms, see "no active assignments yet" empty state.
3. Click **Create new quiz** in Quick Actions.
4. Name the quiz, search the question bank for "fractions", add 8–10 questions, publish.
5. Back on the dashboard, click **Assign a quiz** → pick the classroom + the quiz they just made → set a due date.
6. The Active Assignments card on the dashboard now shows their first assignment with a `0/32 done` progress bar.
7. As students complete the quiz over the next minutes/hours/days, the progress bar fills, the Students Needing Support card surfaces struggling students, and the classroom Insights tab populates.
8. Drill into a struggling student to see their per-category breakdown, decide what to do next.

That loop — create → assign → watch progress → drill in → act — is the teacher portal in one paragraph.

---
