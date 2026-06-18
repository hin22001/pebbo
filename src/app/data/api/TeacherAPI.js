import * as Manager from "@/app/core/ConnectionManager";

// ConnectionManager.stream returns { _err, payload: { data }, status, success }
// on success and { _err, message, status, success: false } on failure.
// unwrap extracts the inner data so callers get clean objects/arrays — and
// throws on failure so callers' try/catch fire instead of silently treating
// the error envelope as data (which made write calls show false success).
const unwrap = (res) => {
  if (res && res.success === false) {
    const err = new Error(res.message || "Request failed");
    err.status = res.status;
    throw err;
  }
  if (res?.success && res?.payload?.data !== undefined) return res.payload.data;
  if (res?.payload?.data !== undefined) return res.payload.data;
  return res;
};

// ─── Classroom Management ────────────────────────────────────────────────────

const getClassrooms = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/classroom/list",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

// Single classroom by id (membership-scoped). /classroom/list ignores
// classroom_id, so the detail page uses this to resolve the real name + count.
const getClassroom = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/classroom/get",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const createClassroom = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/classroom/create",
    method: "POST",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const editClassroom = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/classroom/edit",
    method: "PUT",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const deleteClassroom = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/classroom/delete",
    method: "DELETE",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const addQuizzesToClassroom = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/classroom/addQuizzes",
    method: "POST",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const removeQuizzesFromClassroom = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/classroom/removeQuizzes",
    method: "POST",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const getUploadTemplate = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/classroom/uploadTemplate",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const uploadStudents = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/classroom/uploadStudents",
    method: "POST",
    params: params,
    data: body,
  });
  return unwrap(data);
};

// ─── Classroom Students ──────────────────────────────────────────────────────

const getClassroomStudents = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/classroom/students/list",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const addStudentToClassroom = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/classroom/students/add",
    method: "POST",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const bulkAddStudents = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/classroom/students/bulk",
    method: "POST",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const removeStudentFromClassroom = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/classroom/students/remove",
    method: "POST",
    params: params,
    data: body,
  });
  return unwrap(data);
};

// ─── Quiz Management ─────────────────────────────────────────────────────────

const getQuizzes = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/quiz/list",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const createQuiz = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/quiz/create-rpc",
    method: "POST",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const editQuiz = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/quiz/edit",
    method: "PUT",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const deleteQuiz = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/quiz/delete",
    method: "DELETE",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const getQuizQuestions = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/quiz/questions",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const generateQuiz = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/quiz/generate",
    method: "POST",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const addQuestionsToQuiz = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/quiz/addQuestions",
    method: "POST",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const removeQuestionsFromQuiz = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/quiz/removeQuestions",
    method: "DELETE",
    params: params,
    data: body,
  });
  return unwrap(data);
};

// ─── Question Bank ───────────────────────────────────────────────────────────

const searchQuestions = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/questions/search",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const getQuestionCategories = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/questions/categories",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

// ─── Analytics ───────────────────────────────────────────────────────────────

const getClassroomOverview = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/analytics/classroom/overview",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const getQuizCompletion = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/analytics/quiz/completion",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const getQuizDashboard = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/analytics/quiz/dashboard",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const getQuizDifficulty = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/analytics/quiz/difficulty",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const getQuizPerformance = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/analytics/quiz/performance",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const getQuizResponses = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/analytics/quiz/responses",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const getAccuracyByWeekday = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/analytics/accuracyByWeekday",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const getStudentDailyReport = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/analytics/student/dailyReport",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const getStudentScores = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/analytics/student/scores",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const getStudentWeeklyReport = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/analytics/student/weeklyReport",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

const getStudentsSummary = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/analytics/students/summary",
    method: "GET",
    params: params,
    data: body,
  });
  return unwrap(data);
};

// ─── Export ──────────────────────────────────────────────────────────────────

const TeacherAPI = {
  // Classroom Management
  getClassrooms,
  getClassroom,
  createClassroom,
  editClassroom,
  deleteClassroom,
  addQuizzesToClassroom,
  removeQuizzesFromClassroom,
  getUploadTemplate,
  uploadStudents,
  // Classroom Students
  getClassroomStudents,
  addStudentToClassroom,
  bulkAddStudents,
  removeStudentFromClassroom,
  // Quiz Management
  getQuizzes,
  createQuiz,
  editQuiz,
  deleteQuiz,
  getQuizQuestions,
  generateQuiz,
  addQuestionsToQuiz,
  removeQuestionsFromQuiz,
  // Question Bank
  searchQuestions,
  getQuestionCategories,
  // Analytics
  getClassroomOverview,
  getQuizCompletion,
  getQuizDashboard,
  getQuizDifficulty,
  getQuizPerformance,
  getQuizResponses,
  getAccuracyByWeekday,
  getStudentDailyReport,
  getStudentScores,
  getStudentWeeklyReport,
  getStudentsSummary,
};

export default TeacherAPI;
