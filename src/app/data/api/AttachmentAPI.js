import * as Manager from "@/app/core/ConnectionManager";
import { Helpers } from "@/app/utils";

const postAttachment = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/updateImage",
    method: "POST",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const AttachmentAPI = {
  postAttachment,
};
export default AttachmentAPI;
