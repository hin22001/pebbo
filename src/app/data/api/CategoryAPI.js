import * as Manager from "@/app/core/ConnectionManager";

const categoryCache = {};

const getCategory = async (params = {}, body = {}) => {
  const cacheKey = JSON.stringify({ params, body });
  if (categoryCache[cacheKey]) {
    console.log("🚀 CategoryAPI - Returning cached categories");
    return categoryCache[cacheKey];
  }

  const data = await Manager.stream({
    url: "/api/protected/student/user/getCategories",
    method: "GET",
    useToken: true,
    params: params,
    data: body,
  });

  if (data?.status === 200) {
    categoryCache[cacheKey] = data;
  }

  return data;
};

const setCategory = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/user/setCategories",
    method: "POST",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const CategoryAPI = {
  getCategory,
  setCategory,
};

export default CategoryAPI;
