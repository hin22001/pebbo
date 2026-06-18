# Teacher API Documentation

This document provides comprehensive documentation for all teacher-related API endpoints in the Pebbo MVP system.

## Base URL

All endpoints are prefixed with: `/api/protected/teacher`

## Authentication

All endpoints require:

- Valid JWT token in Authorization header
- User must have `teacher` role
- User must be a paying customer (`assertPaying(true)`)

## Common Response Format

### Success Response

```json
{
  "status": 200,
  "message": "Success message",
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "status": 400|401|403|404|500,
  "message": "Error message",
  "data": null
}
```

## Pagination

Most list endpoints support pagination with these parameters:

- `page_number` (string, default: "1")
- `rows_per_page` (string, default: "10" or "20")

### Page Context Response

```json
{
  "page_number": 1,
  "rows_per_page": 10,
  "total_pages": 5,
  "total_records": 50,
  "has_next_page": true,
  "has_previous_page": false
}
```

---

## 1. Classroom Management

### 1.1 List Classrooms

**GET** `/classroom/list`

#### Query Parameters

| Parameter       | Type   | Required | Description                                |
| --------------- | ------ | -------- | ------------------------------------------ |
| `page_number`   | string | No       | Page number (default: "1")                 |
| `rows_per_page` | string | No       | Items per page (default: "10")             |
| `search`        | string | No       | Search by classroom name                   |
| `archived`      | string | No       | Filter by archived status ("true"/"false") |

#### Response

```json
{
  "status": 200,
  "message": "Success get teacher classrooms",
  "data": {
    "classrooms": [
      {
        "classroom_id": 1,
        "classroom_name": "Math 101",
        "date_created": "2024-01-15T10:30:00Z",
        "archived": false,
        "student_count": 25
      }
    ],
    "page_context": {
      /* PageContext object */
    }
  }
}
```

### 1.2 Create Classroom

**POST** `/classroom/create`

#### Request Body

```json
{
  "classroom_name": "Math 101"
}
```

#### Response

```json
{
  "status": 200,
  "message": "Success Create Classroom",
  "data": null
}
```

### 1.3 Edit Classroom

**PUT** `/classroom/edit`

#### Request Body

```json
{
  "classroom_id": 1,
  "classroom_name": "Updated Math 101"
}
```

#### Response

```json
{
  "status": 200,
  "message": "Classroom updated successfully",
  "data": {
    "classroom_id": 1,
    "classroom_name": "Updated Math 101",
    "updated": true
  }
}
```

### 1.4 Delete Classroom

**DELETE** `/classroom/delete`

#### Request Body

```json
{
  "classroom_id": 1
}
```

#### Response

```json
{
  "status": 200,
  "message": "Classroom deleted successfully",
  "data": {
    "classroom_id": 1,
    "archived": true,
    "deleted": true
  }
}
```

### 1.5 Add Quizzes to Classroom

**POST** `/classroom/addQuizzes`

#### Request Body

```json
{
  "classroom_id": 1,
  "quiz_ids": [1, 2, 3]
}
```

#### Response

```json
{
  "status": 200,
  "message": "Success add quiz to classroom",
  "data": {
    "addedClassroomQuizzes": [
      {
        "quiz_id": 1,
        "classroom_id": 1
      }
    ]
  }
}
```

### 1.6 Remove Quizzes from Classroom

**POST** `/classroom/removeQuizzes`

#### Request Body

```json
{
  "classroom_id": 1,
  "quiz_ids": [1, 2, 3]
}
```

#### Response

```json
{
  "status": 200,
  "message": "Success remove quiz from classroom",
  "data": {
    "removedQuizzes": [
      {
        "quiz_id": 1,
        "classroom_id": 1
      }
    ]
  }
}
```

---

## 2. Student Management

### 2.1 List Classroom Students

**GET** `/classroom/students/list`

#### Query Parameters

| Parameter       | Type   | Required | Description                     |
| --------------- | ------ | -------- | ------------------------------- |
| `classroom_id`  | string | Yes      | Classroom ID                    |
| `page_number`   | string | No       | Page number (default: "1")      |
| `rows_per_page` | string | No       | Items per page (default: "10")  |
| `search`        | string | No       | Search by student name or email |

#### Response

```json
{
  "status": 200,
  "message": "Success get classroom students",
  "data": {
    "students": [
      {
        "user_id": "uuid",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com"
      }
    ],
    "page_context": {
      /* PageContext object */
    }
  }
}
```

### 2.2 Add Student to Classroom

**POST** `/classroom/students/add`

#### Request Body

```json
{
  "classroom_id": 1,
  "email": "student@example.com"
}
```

#### Response

```json
{
  "status": 200,
  "message": "Success add student to classroom",
  "data": {
    "email": "student@example.com",
    "classroom_id": 1,
    "message": "Student added successfully"
  }
}
```

### 2.3 Remove Student from Classroom

**POST** `/classroom/students/remove`

#### Request Body

```json
{
  "classroom_id": 1,
  "email": "student@example.com"
}
```

#### Response

```json
{
  "status": 200,
  "message": "Success remove student from classroom",
  "data": {
    "email": "student@example.com",
    "classroom_id": 1,
    "message": "Student removed successfully"
  }
}
```

### 2.4 Bulk Student Operations

**POST** `/classroom/students/bulk`

#### Request Body

```json
{
  "classroom_id": 1,
  "action": "add_all" | "remove_all",
  "emails": ["student1@example.com", "student2@example.com"]
}
```

#### Response

```json
{
  "status": 200,
  "message": "Success add students to classroom",
  "data": {
    "action": "add_all",
    "totalEmails": 2,
    "successfulInserts": 2,
    "failedInserts": [],
    "failedCount": 0
  }
}
```

### 2.5 Upload Students via CSV

**POST** `/classroom/uploadStudents`

#### Request Body (FormData)

- `file`: CSV file (max 5MB)
- `classroom_id`: string

#### CSV Format

```csv
email
student1@example.com
student2@example.com
student3@example.com
```

#### Response

```json
{
  "status": 200,
  "message": "Successfully processed 3 emails. 3 students added, 0 failed.",
  "data": {
    "totalEmails": 3,
    "successfulInserts": 3,
    "failedInserts": [],
    "failedCount": 0
  }
}
```

### 2.6 Get CSV Upload Template

**GET** `/classroom/uploadTemplate`

#### Response

```json
{
  "status": 200,
  "message": "CSV upload template retrieved",
  "data": {
    "template": "email\nstudent1@example.com\n...",
    "instructions": {
      "format": "CSV file with email addresses",
      "requiredColumn": "email (first column)",
      "maxRows": 500,
      "maxFileSize": "5MB",
      "supportedFormats": ["CSV"],
      "example": ["email", "john.doe@school.edu", "..."]
    }
  }
}
```

---

## 3. Quiz Management

### 3.1 List Quizzes

**GET** `/quiz/list`

#### Query Parameters

| Parameter            | Type   | Required | Description                                        |
| -------------------- | ------ | -------- | -------------------------------------------------- |
| `page_number`        | string | No       | Page number (default: "1")                         |
| `rows_per_page`      | string | No       | Items per page (default: "20")                     |
| `search`             | string | No       | Search by quiz name                                |
| `status`             | string | No       | Filter by status ("upcoming"/"active"/"completed") |
| `date_created_start` | string | No       | Start date filter (ISO string)                     |
| `date_created_end`   | string | No       | End date filter (ISO string)                       |
| `start_date_start`   | string | No       | Quiz start date filter (ISO string)                |
| `start_date_end`     | string | No       | Quiz start date filter (ISO string)                |
| `end_date_start`     | string | No       | Quiz end date filter (ISO string)                  |
| `end_date_end`       | string | No       | Quiz end date filter (ISO string)                  |

#### Response

```json
{
  "status": 200,
  "message": "Quizzes retrieved successfully",
  "data": {
    "quizzes": [
      {
        "id": 1,
        "quiz_name": "Math Quiz 1",
        "date_created": "2024-01-15T10:30:00Z",
        "start_date": "2024-01-20T09:00:00Z",
        "end_date": "2024-01-20T17:00:00Z",
        "question_count": 10,
        "status": "upcoming",
        "created_by": "John Doe"
      }
    ],
    "page_context": {
      /* PageContext object */
    }
  }
}
```

### 3.2 Create Quiz

**POST** `/quiz/create`

#### Request Body (Specific Questions)

```json
{
  "quiz_name": "Math Quiz 1",
  "start_date": "2024-01-20T09:00:00Z",
  "end_date": "2024-01-20T17:00:00Z",
  "question_type": "specific",
  "question_ids": [1, 2, 3, 4, 5]
}
```

#### Request Body (AI-Selected Questions)

```json
{
  "quiz_name": "Math Quiz 1",
  "start_date": "2024-01-20T09:00:00Z",
  "end_date": "2024-01-20T17:00:00Z",
  "question_type": "ai_selected",
  "question_count": 10,
  "categories": [1, 2, 3],
  "difficulties": [1, 2, 3],
  "year": 2024,
  "region": "en"
}
```

#### Response

```json
{
  "status": 200,
  "message": "Quiz created successfully with 5 questions",
  "data": {
    "quiz_id": 1,
    "quiz_name": "Math Quiz 1",
    "start_date": "2024-01-20T09:00:00Z",
    "end_date": "2024-01-20T17:00:00Z",
    "question_count": 5,
    "questions_added": 5,
    "questions": [
      {
        "question_id": 1,
        "category": 1,
        "difficulty": 2,
        "subject": "Maths",
        "concept": "Algebra"
      }
    ],
    "created_by": "John Doe",
    "created_at": "2024-01-15T10:30:00Z",
    "question_selection_method": "specific"
  }
}
```

### 3.3 Edit Quiz

**PUT** `/quiz/edit`

#### Request Body

```json
{
  "quiz_id": 1,
  "quiz_name": "Updated Quiz Name",
  "start_date": "2024-01-21T09:00:00Z",
  "end_date": "2024-01-21T17:00:00Z"
}
```

#### Response

```json
{
  "status": 200,
  "message": "Quiz updated successfully",
  "data": {
    "quiz_id": 1,
    "quiz_name": "Updated Quiz Name",
    "start_date": "2024-01-21T09:00:00Z",
    "end_date": "2024-01-21T17:00:00Z",
    "updated": true
  }
}
```

### 3.4 Delete Quiz

**DELETE** `/quiz/delete`

#### Request Body

```json
{
  "quiz_id": 1
}
```

#### Response

```json
{
  "status": 200,
  "message": "Quiz deleted successfully. 5 questions were removed.",
  "data": {
    "quiz_id": 1,
    "deleted": true,
    "questions_removed": 5
  }
}
```

### 3.5 Get Quiz Questions

**GET** `/quiz/questions`

#### Query Parameters

| Parameter       | Type   | Required | Description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `quiz_id`       | string | Yes      | Quiz ID                        |
| `page_number`   | string | No       | Page number (default: "1")     |
| `rows_per_page` | string | No       | Items per page (default: "10") |

#### Response

```json
{
  "status": 200,
  "message": "Quiz questions retrieved successfully",
  "data": {
    "quiz_id": 1,
    "quiz_name": "Math Quiz 1",
    "total_questions": 5,
    "questions": [
      {
        "question_id": 1,
        "category": 1,
        "difficulty": 2,
        "subject": "Maths",
        "concept": "Algebra",
        "question_type": "multiple_choice",
        "need_image": false,
        "book_ref": "Chapter 1",
        "year": 2024
      }
    ],
    "page_context": {
      /* PageContext object */
    }
  }
}
```

### 3.6 Add Questions to Quiz

**POST** `/quiz/addQuestions`

#### Request Body

```json
{
  "quiz_id": 1,
  "question_ids": [6, 7, 8]
}
```

#### Response

```json
{
  "status": 200,
  "message": "Successfully added 3 questions to quiz",
  "data": {
    "quiz_id": 1,
    "questions_added": 3,
    "total_questions": 8,
    "added_questions": [
      {
        "question_id": 6,
        "category": 2,
        "difficulty": 1,
        "subject": "Maths"
      }
    ]
  }
}
```

### 3.7 Remove Questions from Quiz

**DELETE** `/quiz/removeQuestions`

#### Request Body

```json
{
  "quiz_id": 1,
  "question_ids": [6, 7, 8]
}
```

#### Response

```json
{
  "status": 200,
  "message": "Successfully removed 3 questions from quiz",
  "data": {
    "quiz_id": 1,
    "questions_removed": 3,
    "total_questions": 5,
    "removed_questions": [6, 7, 8]
  }
}
```

---

## 4. Question Management

### 4.1 Search Questions

**GET** `/questions/search`

#### Query Parameters

| Parameter       | Type   | Required | Description                                                |
| --------------- | ------ | -------- | ---------------------------------------------------------- |
| `page_number`   | string | No       | Page number (default: "1")                                 |
| `rows_per_page` | string | No       | Items per page (default: "10")                             |
| `search`        | string | No       | Search term                                                |
| `categories`    | string | No       | Comma-separated category IDs                               |
| `difficulties`  | string | No       | Comma-separated difficulty levels                          |
| `subjects`      | string | No       | Comma-separated subjects                                   |
| `year`          | string | No       | Year filter                                                |
| `region`        | string | No       | Language region ("en"/"zh", default: "en")                 |
| `question_type` | string | No       | Question type ("primary"/"custom"/"both", default: "both") |
| `audited_only`  | string | No       | Show only audited questions ("true"/"false")               |
| `mutable_only`  | string | No       | Show only mutable questions ("true"/"false")               |

#### Response

```json
{
  "status": 200,
  "message": "Question search completed",
  "data": {
    "primary_questions": [
      {
        "id": 1,
        "concept": "Algebra",
        "subject": "Maths",
        "outer_category": 1,
        "inner_category": 2,
        "difficulty": 2,
        "year": 2024,
        "audited": true
      }
    ],
    "custom_questions": [
      {
        "id": 1,
        "question": {
          /* question object */
        },
        "category": "Maths",
        "subject": "Algebra",
        "created_by": "teacher_id",
        "mutable": true
      }
    ],
    "page_context": {
      /* PageContext object */
    },
    "total_primary": 100,
    "total_custom": 25
  }
}
```

### 4.2 Get Question Categories

**GET** `/questions/categories`

#### Response

```json
{
  "status": 200,
  "message": "Question categories retrieved successfully",
  "data": {
    "subjects": [
      {
        "name": "Maths",
        "total_questions": 500,
        "outer_categories": 10,
        "inner_categories": 25,
        "difficulties": 5,
        "years": 3
      }
    ],
    "outer_categories": [
      {
        "id": 1,
        "count": 50
      }
    ],
    "inner_categories": [
      {
        "id": 1,
        "count": 20
      }
    ],
    "difficulties": [
      {
        "level": 1,
        "count": 100
      }
    ],
    "years": [
      {
        "year": 2024,
        "count": 200
      }
    ],
    "total_questions": 500
  }
}
```

---

## 5. Analytics

### 5.1 Classroom Overview

**GET** `/analytics/classroom/overview`

#### Query Parameters

| Parameter       | Type   | Required | Description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `classroom_id`  | string | Yes      | Classroom ID                   |
| `page_number`   | string | No       | Page number (default: "1")     |
| `rows_per_page` | string | No       | Items per page (default: "10") |

#### Response

```json
{
  "status": 200,
  "message": "Classroom overview retrieved successfully",
  "data": {
    "classroom_id": 1,
    "classroom_name": "Math 101",
    "total_students": 25,
    "students": [
      {
        "student_id": "uuid",
        "student_name": "John Doe",
        "student_email": "john@example.com",
        "current_scores": [85, 90, 78],
        "last_activity": "2024-01-15T10:30:00Z"
      }
    ],
    "page_context": {
      /* PageContext object */
    }
  }
}
```

### 5.2 Quiz Dashboard

**GET** `/analytics/quiz/dashboard`

#### Response

```json
{
  "status": 200,
  "message": "Quiz dashboard retrieved successfully",
  "data": {
    "teacher_id": "uuid",
    "teacher_name": "John Doe",
    "school_id": 1,
    "overview_stats": {
      "total_quizzes": 10,
      "active_quizzes": 3,
      "completed_quizzes": 7,
      "total_students_participated": 150,
      "total_responses": 1500,
      "average_quiz_accuracy": 78.5
    },
    "recent_quizzes": [
      {
        "quiz_id": 1,
        "quiz_name": "Math Quiz 1",
        "total_questions": 10,
        "total_responses": 25,
        "completion_rate": 85.0,
        "average_accuracy": 78.5,
        "status": "active",
        "created_date": "2024-01-15T10:30:00Z"
      }
    ],
    "top_performing_quizzes": [
      {
        "quiz_id": 1,
        "quiz_name": "Math Quiz 1",
        "average_accuracy": 85.0,
        "completion_rate": 90.0,
        "total_responses": 25
      }
    ],
    "category_performance": [
      {
        "category": "General",
        "subject": "Mixed",
        "total_questions": 100,
        "average_accuracy": 78.5,
        "total_responses": 1500
      }
    ],
    "student_engagement": {
      "total_students": 150,
      "active_students": 120,
      "completion_rate": 80.0,
      "average_accuracy": 78.5
    }
  }
}
```

### 5.3 Quiz Completion Analytics

**GET** `/analytics/quiz/completion`

#### Query Parameters

| Parameter       | Type   | Required | Description                                              |
| --------------- | ------ | -------- | -------------------------------------------------------- |
| `page_number`   | string | No       | Page number (default: "1")                               |
| `rows_per_page` | string | No       | Items per page (default: "20")                           |
| `classroom_id`  | string | No       | Filter by classroom                                      |
| `status`        | string | No       | Filter by status ("upcoming"/"active"/"completed"/"all") |
| `search`        | string | No       | Search by quiz name                                      |

#### Response

```json
{
  "status": 200,
  "message": "Quiz completion data retrieved successfully",
  "data": {
    "quizzes": [
      {
        "quiz_id": 1,
        "quiz_name": "Math Quiz 1",
        "total_questions": 10,
        "total_students": 25,
        "completed_students": 20,
        "completion_rate": 80.0,
        "average_accuracy": 78.5,
        "created_date": "2024-01-15T10:30:00Z",
        "start_date": "2024-01-20T09:00:00Z",
        "end_date": "2024-01-20T17:00:00Z",
        "status": "active"
      }
    ],
    "page_context": {
      /* PageContext object */
    },
    "summary_stats": {
      "total_quizzes": 10,
      "average_completion_rate": 75.0,
      "total_students_participated": 150,
      "active_quizzes": 3
    }
  }
}
```

### 5.4 Quiz Performance Analytics

**GET** `/analytics/quiz/performance`

#### Query Parameters

| Parameter       | Type   | Required | Description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `quiz_id`       | string | Yes      | Quiz ID                        |
| `page_number`   | string | No       | Page number (default: "1")     |
| `rows_per_page` | string | No       | Items per page (default: "10") |

#### Response

```json
{
  "status": 200,
  "message": "Quiz performance retrieved successfully",
  "data": {
    "quiz_id": 1,
    "quiz_name": "Math Quiz 1",
    "total_questions": 10,
    "total_responses": 200,
    "completion_rate": 80.0,
    "average_accuracy": 78.5,
    "average_time_per_question": 120.5,
    "performance_by_question": [
      {
        "question_id": 1,
        "category": "Algebra",
        "subject": "Maths",
        "difficulty": 2,
        "total_attempts": 20,
        "correct_attempts": 16,
        "accuracy_rate": 80.0,
        "average_time": 120.5
      }
    ],
    "performance_by_student": [
      {
        "student_id": "uuid",
        "student_name": "John Doe",
        "student_email": "john@example.com",
        "questions_attempted": 10,
        "questions_correct": 8,
        "accuracy_rate": 80.0,
        "total_time": 1200,
        "completion_status": "completed"
      }
    ],
    "page_context": {
      /* PageContext object */
    }
  }
}
```

### 5.5 Quiz Difficulty Analysis

**GET** `/analytics/quiz/difficulty`

#### Query Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `quiz_id` | string | Yes      | Quiz ID     |

#### Response

```json
{
  "status": 200,
  "message": "Quiz difficulty analysis retrieved successfully",
  "data": {
    "quiz_id": 1,
    "quiz_name": "Math Quiz 1",
    "difficulty_analysis": [
      {
        "difficulty_level": 1,
        "total_questions": 5,
        "total_attempts": 100,
        "correct_attempts": 85,
        "accuracy_rate": 85.0,
        "average_time": 90.5,
        "students_attempted": 20
      }
    ],
    "category_analysis": [
      {
        "category": "Algebra",
        "subject": "Maths",
        "total_questions": 5,
        "average_accuracy": 80.0,
        "average_time": 120.5,
        "difficulty_breakdown": [
          {
            "difficulty": 1,
            "questions": 2,
            "accuracy": 90.0
          }
        ]
      }
    ],
    "overall_stats": {
      "total_questions": 10,
      "total_attempts": 200,
      "overall_accuracy": 78.5,
      "average_time_per_question": 120.5,
      "most_difficult_category": "Geometry",
      "easiest_category": "Algebra"
    }
  }
}
```

### 5.6 Quiz Responses

**GET** `/analytics/quiz/responses`

#### Query Parameters

| Parameter       | Type   | Required | Description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `quiz_id`       | string | Yes      | Quiz ID                        |
| `page_number`   | string | No       | Page number (default: "1")     |
| `rows_per_page` | string | No       | Items per page (default: "20") |
| `student_id`    | string | No       | Filter by student              |
| `question_id`   | string | No       | Filter by question             |
| `category`      | string | No       | Filter by category             |
| `subject`       | string | No       | Filter by subject              |
| `accuracy_min`  | string | No       | Minimum accuracy filter        |
| `accuracy_max`  | string | No       | Maximum accuracy filter        |

#### Response

```json
{
  "status": 200,
  "message": "Quiz responses retrieved successfully",
  "data": {
    "quiz_id": 1,
    "quiz_name": "Math Quiz 1",
    "responses": [
      {
        "student_id": "uuid",
        "student_name": "John Doe",
        "student_email": "john@example.com",
        "question_id": 1,
        "question_object": {
          /* question data */
        },
        "category": "Algebra",
        "subject": "Maths",
        "user_answers": {
          /* user answers */
        },
        "accuracy": 80.0,
        "time_taken": 120,
        "is_correct": true,
        "submitted_at": "2024-01-20T10:30:00Z"
      }
    ],
    "page_context": {
      /* PageContext object */
    },
    "response_summary": {
      "total_responses": 200,
      "correct_responses": 160,
      "accuracy_rate": 80.0,
      "average_time": 120.5,
      "fastest_response": 30,
      "slowest_response": 300
    }
  }
}
```

### 5.7 Students Summary

**GET** `/analytics/students/summary`

#### Query Parameters

| Parameter       | Type   | Required | Description                     |
| --------------- | ------ | -------- | ------------------------------- |
| `page_number`   | string | No       | Page number (default: "1")      |
| `rows_per_page` | string | No       | Items per page (default: "20")  |
| `search`        | string | No       | Search by student name or email |
| `classroom_id`  | string | No       | Filter by classroom             |

#### Response

```json
{
  "status": 200,
  "message": "Students summary retrieved successfully",
  "data": {
    "students": [
      {
        "student_id": "uuid",
        "student_name": "John Doe",
        "student_email": "john@example.com",
        "current_scores": [85, 90, 78],
        "total_questions_completed": 150,
        "average_accuracy": 78.5,
        "last_activity": "2024-01-15T10:30:00Z",
        "classroom_names": ["Math 101", "Science 101"]
      }
    ],
    "page_context": {
      /* PageContext object */
    },
    "summary_stats": {
      "total_students": 100,
      "average_scores": [78.5],
      "total_questions_completed": 15000,
      "students_with_recent_activity": 85
    }
  }
}
```

### 5.8 Student Scores

**GET** `/analytics/student/scores`

#### Query Parameters

| Parameter    | Type   | Required | Description       |
| ------------ | ------ | -------- | ----------------- |
| `student_id` | string | Yes      | Student ID (UUID) |

#### Response

```json
{
  "status": 200,
  "message": "Student scores retrieved successfully",
  "data": {
    "student_id": "uuid",
    "student_name": "John Doe",
    "student_email": "john@example.com",
    "current_scores": [85, 90, 78],
    "score_categories": {
      /* score categories data */
    },
    "enabled_categories": {
      /* enabled categories data */
    },
    "score_data": {
      /* detailed score data */
    }
  }
}
```

### 5.9 Student Daily Report

**GET** `/analytics/student/dailyReport`

#### Query Parameters

| Parameter    | Type   | Required | Description       |
| ------------ | ------ | -------- | ----------------- |
| `student_id` | string | Yes      | Student ID (UUID) |
| `year`       | string | Yes      | Year              |
| `date`       | string | Yes      | Date (YYYY-MM-DD) |
| `subject`    | string | Yes      | Subject           |

#### Response

```json
{
  "status": 200,
  "message": "Student daily report retrieved successfully",
  "data": {
    "student_id": "uuid",
    "student_name": "John Doe",
    "student_email": "john@example.com",
    "report": {
      /* DailyReport object with detailed analytics */
    }
  }
}
```

### 5.10 Student Weekly Report

**GET** `/analytics/student/weeklyReport`

#### Query Parameters

| Parameter    | Type   | Required | Description                  |
| ------------ | ------ | -------- | ---------------------------- |
| `student_id` | string | Yes      | Student ID (UUID)            |
| `year`       | string | Yes      | Year                         |
| `start_date` | string | Yes      | Week start date (YYYY-MM-DD) |
| `subject`    | string | Yes      | Subject                      |

#### Response

```json
{
  "status": 200,
  "message": "Student weekly report retrieved successfully",
  "data": {
    "student_id": "uuid",
    "student_name": "John Doe",
    "student_email": "john@example.com",
    "report": {
      /* WeeklyReport object with detailed analytics */
    }
  }
}
```

---

## Error Codes

| Code | Description                                                       |
| ---- | ----------------------------------------------------------------- |
| 400  | Bad Request - Invalid parameters or data                          |
| 401  | Unauthorized - Invalid token or insufficient permissions          |
| 403  | Forbidden - Access denied (e.g., student not in teacher's school) |
| 404  | Not Found - Resource not found                                    |
| 500  | Internal Server Error - Server-side error                         |

## Rate Limits

- Maximum 500 students per bulk operation
- Maximum 5MB file size for CSV uploads
- Maximum 15 questions per quiz
- Maximum 100 characters for classroom names

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All UUIDs are in standard UUID v4 format
3. Pagination is 1-indexed (page 1 is the first page)
4. Search is case-insensitive
5. All endpoints require teacher role and paying status
6. Classroom operations require teacher to be part of the classroom
7. Quiz operations require teacher to be the creator of the quiz
