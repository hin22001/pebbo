import * as Manager from "@/app/core/ConnectionManager";

/**
 * Fetches the required system version from the database
 */
const getRequiredVersion = async () => {
  const data = await Manager.stream({
    url: "/api/common/system/settings",
    method: "GET",
    useToken: false, // This is a public check
  });

  return data;
};

const SystemAPI = {
  getRequiredVersion,
};

export default SystemAPI;
