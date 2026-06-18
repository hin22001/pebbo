import createError from "../../utils/createError";

export function checkDebug(params) {
  // if(params?.debug == null) throw createError("Unexpected error", 500);
  if (params?.debug) {
    if (params.debug_api_key != process.env.ADMIN_KEY)
      throw createError("Unauthorized", 401);
  }
  return params?.debug;
}
