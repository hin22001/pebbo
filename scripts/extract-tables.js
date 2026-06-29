#!/usr/bin/env node

// Extract all table names from grep results
const tablesInCode = [
  "schools",
  "quiz_creators",
  "quizzes",
  "quiz_junction",
  "primary_questions",
  "users",
  "classrooms",
  "completed_questions",
  "quiz_submissions",
  "role_counts_by_school",
  "school_user_licenses",
  "product_keys",
  "chat_history",
  "classroom_quizzes",
  "classroom_quizzes_aggregate",
  "student_data",
  "students",
  "student_scores_categories",
  "primary_questions_drafts",
  // Add more as found...
];

console.log("Tables referenced in codebase:", tablesInCode.length);
console.log(JSON.stringify([...new Set(tablesInCode)].sort(), null, 2));
