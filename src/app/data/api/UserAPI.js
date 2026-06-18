import * as Manager from "@/app/core/ConnectionManager";

const postChangeName = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/changeName",
    method: "POST",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const postResetPassword = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/resetPassword",
    method: "POST",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const getProfile = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/getProfile",
    method: "GET",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const getMe = async () => {
  const data = await Manager.stream({
    url: "/api/protected/student/user/me",
    method: "GET",
    useToken: true,
  });
  return data;
};

const getSummary = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/user/getSummary",
    method: "GET",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const getDashboardData = async (params = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/dashboard/getData",
    method: "GET",
    useToken: true,
    params: params,
  });

  return data;
};

const postHandleStreak = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/user/handleStreak",
    method: "POST",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const postCelebrateLevel = async (level) => {
  const data = await Manager.stream({
    url: "/api/protected/student/user/celebrateLevel",
    method: "POST",
    useToken: true,
    data: { level },
  });

  return data;
};

const postUpdateTodos = async (todo_list, date) => {
  const data = await Manager.stream({
    url: "/api/protected/student/user/syncTodos",
    method: "POST",
    useToken: true,
    data: { todo_list, date },
  });

  return data;
};

const postCelebrateTodos = async (date) => {
  const data = await Manager.stream({
    url: "/api/protected/student/user/celebrateTodos",
    method: "POST",
    useToken: true,
    data: { date },
  });

  return data;
};

const postCelebrateStreak = async (streak) => {
  const data = await Manager.stream({
    url: "/api/protected/student/user/celebrateStreak",
    method: "POST",
    useToken: true,
    data: { streak },
  });

  return data;
};

const postUpdateProfileImage = async (profile_image) => {
  const data = await Manager.stream({
    url: "/api/protected/common/editProfileImage",
    method: "POST",
    useToken: true,
    data: { profile_image },
  });

  return data;
};

const postLogAppReport = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/app/report",
    method: "POST",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const UserAPI = {
  postChangeName,
  postResetPassword,
  getProfile,
  getMe,
  getSummary,
  getDashboardData,
  postHandleStreak,
  postCelebrateLevel,
  postUpdateTodos,
  postCelebrateTodos,
  postCelebrateStreak,
  postUpdateProfileImage,
  postLogAppReport,
};

export default UserAPI;
