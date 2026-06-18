# Database RPCs Used in Exercise Page

This document lists the Remote Procedure Calls (RPCs) used in the exercise page interactions (`src/pages/question/exercise/index.jsx`) and related API routes.

## Core Question Flow

### 1. `get_questionobj_bycategoryregion_optimized`

- **Description**: Fetches the actual question objects for the student to solve. It applies optimization logic to select questions based on the student's current level and region.
- **Used In**: `src/app/api/lib/DAOs/questionDAO.ts` -> `getQuestions()`
- **Parameters/Filters**:
  - `categories` (array of numbers): IDs of categories enabled for the student.
  - `difficulties` (array of numbers): Predicted difficulty levels.
  - `region` (string): Language/Region code ('en' or 'zh').
  - `_user_id` (UUID): The current student's ID.
  - `year` (number): The academic year.

### 1b. `get_questionobj_for_investor_demo` (TEMPORARY)

- **Description**: Temporary variant of the question fetching RPC designed for investor demos. It applies strict high-quality filters for Grade 2 and Grade 5.
- **Used In**: Manually switched in `src/app/api/lib/DAOs/questionDAO.ts` -> `getQuestions()`
- **Parameters/Filters**: Same as `get_questionobj_bycategoryregion_optimized`.
- **Special Demo Logic**:
  - **Grade 2**:
    - `need_image=true` questions must have `image_approved=true`.
    - `need_image=false` (text-only) questions are all allowed.
  - **Grade 5**:
    - `need_image=true` questions must have `image_approved=true`.
    - `need_image=false` (text-only) questions must have `question_id < 9700`.
  - **Other Grades**: Defaults to standard behavior.

### 2. `get_student_attempting_questions`

- **Description**: Retrieves the list of question IDs that the student is currently attempting (i.e., questions fetched but not yet completed).
- **Used In**: `src/app/api/lib/DAOs/questionDAO.ts` -> `getAttemptingQuestions()`
- **Parameters**:
  - `user_id` (UUID)
  - `region` (string)

### 3. `process_completed_questions_optimized`

- **Description**: Handles the submission of answers. It calculates scores, updates student progress, awards coins, and records the completion status.
- **Used In**: `src/app/api/lib/DAOs/questionDAO.ts` -> `processCompletedQuestions()`
- **Parameters**:
  - `_user_id` (UUID)
  - `new_score` (array): The updated scores for the student.
  - `completed_qs` (array of objects): Details of the answered questions.
  - `education_level` (enum)
  - `year` (enum)

## Student Context & Metadata

### 4. `get_user_categories`

- **Description**: Fetches the list of categories enabled for a specific student, filtering by their education level and year.
- **Used In**: `src/app/api/lib/DAOs/studentDAO.ts` -> `getCategories()`
- **Parameters**:
  - `_user_id` (UUID)
  - `_education_level` (string)
  - `_year` (string)

### 5. `set_student_context`

- **Description**: Initializes or updates the student's context, including their initial scores and enabled categories when they start a new level/year.
- **Used In**: `src/app/api/lib/DAOs/studentDAO.ts` -> `setContext()`
- **Parameters**:
  - `_user_id` (UUID)
  - `_education_level` (enum)
  - `_year` (enum)
  - `_initial_scores` (array)
  - `_current_scores` (array)
  - `_enabled_categories` (array)

### 6. `get_user_total_coins`

- **Description**: Calculates and retrieves the total number of coins a user has earned.
- **Used In**: `src/app/api/lib/DAOs/studentDAO.ts` -> `getProfile()`
- **Parameters**:
  - `_user_id` (UUID)

### 7. `handle_daily_streak`

- **Description**: Checks and updates the student's daily streak based on their activity.
- **Used In**: `src/app/api/lib/DAOs/studentDAO.ts` -> `handleStreak()`
- **Parameters**:
  - `_user_id` (UUID)

### 8. `get_user_completed_questions_summary`

- **Description**: Provides summary statistics of the questions completed by the user (e.g., total count, accuracy).
- **Used In**: `src/app/api/lib/DAOs/completedQuestionsDAO.ts` -> `getSummary()`
- **Parameters**:
  - `_user_id` (UUID)

## Note on Additional Filtering

In addition to the database-level filtering done by these RPCs, the API code (`src/app/api/protected/student/questions/getAIQuestions/route.ts`) performs an application-level filter:

- **Recently Completed Filter**: It explicitly filters out questions that the user has completed within the last **14 days** (with a fallback to 7 days if supply is low) to ensure variety and prevent immediate repetition.

## Image Display Logic

The system enforces a strict priority for rendering question visuals, controlled by the `image_approved` status (from the `primary_questions` table).

### Logic Flow

1.  **Check Approval**: The frontend checks if `imageUrl` exists **AND** `image_approved` is `true`.
2.  **Display PNG**: If both conditions are met, the **PNG** image (from `imageUrl`) is displayed.
3.  **Fallback to SVG**: If `imageUrl` is missing OR `image_approved` is `false`, the system falls back to rendering the **Raw SVG** data embedded in the question object.

### Implementation Details

- **Database**: The `image_approved` boolean column in `primary_questions` controls visibility.
- **API**: `QuestionProcessing` injects this status into the `SvgReactComponent` node attributes within the `question_object`.
- **Frontend**: `RichTextSVGComponent` implements the condition `const showPng = imageUrl && image_approved;`.
