import * as Manager from "@/app/core/ConnectionManager";

const getSchoolOverview = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/admin/school_profile/get_school_overview",
    method: "GET",
    params: params,
    data: body,
  });

  return data;
};

const getLicenses = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/admin/school_profile/get_licenses",
    method: "GET",
    params: params,
    data: body,
  });

  return data;
};

const SchoolOverviewAPI = {
  getSchoolOverview,
  getLicenses,
};

export default SchoolOverviewAPI;
