import * as Manager from "@/app/core/ConnectionManager";

const createCheckoutSession = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/payment/checkout",
    method: "POST",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

export default {
  createCheckoutSession,
};
