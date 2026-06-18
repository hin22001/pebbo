import * as Manager from "@/app/core/ConnectionManager";

const getClassroom = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/admin/classroom/getAll",
    method: "GET",
    params: params,
    data: body,
  });

  return data;
};

const createClassroom = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/admin/classroom/create",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const createClassroomTeacher = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/classroom/create",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const classroomInviteUsers = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/school/classroom/inviteUsers",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const getClassroomInvitations = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/school/classroom/getInvitations",
    method: "GET",
    params: params,
    data: body,
  });

  return data;
};

const acceptClassroomInvitation = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/school/classroom/acceptInvitation",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const getClassroomParticipant = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/admin/classroom/getParticipants",
    method: "GET",
    params: params,
    data: body,
  });

  return data;
};

const removeUsersClassroom = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/school/classroom/removeUsers",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const getConfirmedClassroom = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/school/classroom/getConfirmed",
    method: "GET",
    params: params,
    data: body,
  });

  return data;
};

const getQuizClassroom = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/school/classroom/getQuizzes",
    method: "GET",
    params: params,
    data: body,
  });

  return data;
};

const addQuizClassroom = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/teacher/classroom/addQuizzes",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const ClassAPI = {
  getClassroom,
  createClassroom,
  createClassroomTeacher,
  classroomInviteUsers,
  getClassroomInvitations,
  acceptClassroomInvitation,
  getClassroomParticipant,
  removeUsersClassroom,
  getConfirmedClassroom,
  addQuizClassroom,
  getQuizClassroom,
};

export default ClassAPI;
