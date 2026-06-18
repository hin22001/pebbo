import * as Manager from "@/app/core/ConnectionManager";

const getAssets = async (params = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/mathLibrary/getAssets",
    method: "GET",
    useToken: true,
    params: params,
  });

  return data;
};

const MathLibraryAPI = {
  getAssets,
};

export default MathLibraryAPI;
