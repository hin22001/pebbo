import * as Manager from "@/app/core/ConnectionManager";
import { Helpers } from "../../utils";

const getDailyReport = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url:
      "/api/protected/student/reports/getAllDailyReports?date=" +
      (params?.date || ""),
    method: "GET",
    useToken: true,
    params: Helpers.filterObjectByKey(params, "date"),
    data: body,
  });

  return data;
};

const getDailyReportByID = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/reports/getDailyReport",
    method: "GET",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};
const getWeeklyReport = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url:
      "/api/protected/student/reports/getAllWeeklyReports?start_date=" +
      (params?.start_date || ""),
    method: "GET",
    useToken: true,
    params: Helpers.filterObjectByKey(params, "start_date"),
    data: body,
  });

  return data;
};

const getWeeklyReportByID = async (params = {}, body = {}) => {
  const data = await Manager.stream({
    url: "/api/protected/student/reports/getWeeklyReport",
    method: "GET",
    useToken: true,
    params: params,
    data: body,
  });

  return data;
};

const ReportAPI = {
  getDailyReport,
  getDailyReportByID,
  getWeeklyReport,
  getWeeklyReportByID,
};

export default ReportAPI;
