import * as Manager from "@/app/core/ConnectionManager";

/**
 * @param {Object} params - Query params. enabled_categories: number[] (optional) - when provided, used instead of DB so setCategory + getQuestion can run in parallel
 */
const getAIQuestions = async (params = {}, body = {}) => {
  const queryParams = { ...params };
  if (Array.isArray(queryParams.enabled_categories)) {
    queryParams.enabled_categories = queryParams.enabled_categories.join(",");
  }
  const data = await Manager.stream({
    url: "/api/protected/student/questions/getAIQuestions",
    method: "GET",
    params: queryParams,
    data: body,
  });

  return data;
};

/** Preloads ONNX model for faster first "Start Exercise" click. Fire-and-forget. */
const preloadModel = () => {
  Manager.stream({
    url: "/api/protected/student/questions/preloadModel",
    method: "GET",
  }).catch(() => {});
};

const postCompleteQuestion = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/questions/completeQuestions",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const postSecretAdminCompleteQuestion = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/admin/secret-question/complete",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const insertUserQuestion = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/school/userQuestions/insert",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const updateUserQuestion = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/school/userQuestions/update",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const deleteUserQuestion = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/school/userQuestions/delete",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const getUserQuestions = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/school/userQuestions/get",
    method: "GET",
    params: params,
    data: body,
  });

  return data;
};

const getQuiz = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/school/quiz/get",
    method: "GET",
    params: params,
    data: body,
  });

  return data;
};

const createQuiz = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/school/quiz/create",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const addQuizQuestion = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/school/quiz/addQuestions",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const removeQuizQuestion = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/school/quiz/removeQuestions",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const getQuizQuestions = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/school/quiz/getQuestions",
    method: "GET",
    params: params,
    data: body,
  });

  return data;
};

const getStudentQuizQuestions = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/quiz/getQuestions",
    method: "GET",
    params: params,
    data: body,
  });

  return data;
};

const quizSubmitAnswers = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/quiz/submitAnswers",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const chatGetStream = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/potterChat/getStream",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const chatGetStreamChunk = async (params = {}, body = {}, onChunk) => {
  const queryString = new URLSearchParams(params).toString();
  const url = `/api/protected/student/potterChat/getStream?${queryString}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/event-stream",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let done = false;
  while (!done) {
    const { value, done: streamDone } = await reader.read();
    done = streamDone;
    const chunk = decoder.decode(value, { stream: true });

    if (onChunk) onChunk(chunk);
  }

  return "Stream complete";
};

const chatGetHistory = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/potterChat/getHistory",
    method: "GET",
    params: params,
    data: body,
  });

  return data;
};

const postLogQuestionIssue = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/question/issue",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const getPlacementQuestions = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/placement/getQuestions",
    method: "GET",
    params: params,
    data: body,
  });

  return data;
};

const submitPlacementTest = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/placement/submit",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const getQuestionById = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/admin/secret-question",
    method: "GET",
    params: params,
    data: body,
  });

  return data;
};

const QuestionsAPI = {
  getAIQuestions,
  preloadModel,
  postCompleteQuestion,
  postSecretAdminCompleteQuestion,
  insertUserQuestion,
  deleteUserQuestion,
  updateUserQuestion,
  getUserQuestions,
  getQuiz,
  createQuiz,
  addQuizQuestion,
  removeQuizQuestion,
  getQuizQuestions,
  getStudentQuizQuestions,
  quizSubmitAnswers,
  chatGetStream,
  chatGetStreamChunk,
  chatGetHistory,
  postLogQuestionIssue,
  getPlacementQuestions,
  submitPlacementTest,
  getQuestionById,
};

export default QuestionsAPI;
