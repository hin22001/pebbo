import * as Manager from "@/app/core/ConnectionManager";

const postSignIn = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/auth/login_otp",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const postSignInPassword = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/auth/login_password",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const postSignUp = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/auth/signup_student",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const postConfirmMagicLink = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/auth/confirm/magiclink",
    method: "POST",
    params: params,
    data: body,
  });

  return data;
};

const postSignOut = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/auth/logout",
    method: "GET",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const getStudentProfile = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/user/getProfile",
    method: "GET",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const postConfirmOTP = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/auth/confirm/otp",
    method: "POST",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const getIsAuth = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/auth/authenticated",
    method: "GET",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const postSetContext = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/user/setContext",
    method: "POST",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const postAttemptSubscription = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/user/attemptSubscriptionPurchase",
    method: "POST",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const postReconcilePaymentStatus = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/user/reconcilePaymentStatus",
    method: "POST",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const postActivateKey = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/common/activateKey",
    method: "POST",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const LoginAPI = {
  postSignIn,
  postSignInPassword,
  postSignUp,
  postConfirmMagicLink,
  postSignOut,
  getStudentProfile,
  postConfirmOTP,
  getIsAuth,
  postSetContext,
  postAttemptSubscription,
  postReconcilePaymentStatus,
  postActivateKey,
};

export default LoginAPI;
