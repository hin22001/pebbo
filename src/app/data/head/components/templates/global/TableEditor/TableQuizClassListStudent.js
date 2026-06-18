import Helpers from "../../../../../../utils/Helpers";

export default Object.assign({
  title: {
    zh: "",
    en: "",
  },
  label: {
    searchPlaceholder: {
      zh: "搜索主题",
      en: "Search Subject",
    },
  },
  action: {
    search: false,
    customdelete: true,
    edit: {
      params: ["id", "classroom_id"],
      href: "/classroom/student/detail/quiz",
    },
    detailquizstudent: {
      params: ["id", "classroom_id"],
      href: "/classroom/student/detail/quiz",
    },
  },
  table: {
    columns: [
      {
        field: "view-button",
        minWidth: 100,
        headerName: { zh: "", en: "Start Quiz" },
        disableClickEventBubbling: true,
        useActionCell: {
          type: "detailquizstudent",
        },
      },
      {
        field: "id",
        databaseKey: "quiz_id",
        minWidth: 70,
        headerName: { zh: "编号", en: "ID" },
      },
      {
        field: "quiz_name",
        databaseKey: "quiz_name",
        minWidth: 200,
        headerName: { zh: "测验名称", en: "Quiz Name" },
      },
      {
        field: "start_date",
        databaseKey: "start_date",
        minWidth: 200,
        headerName: { zh: "开始日期", en: "Start Date" },
        valueFormatter: (params) =>
          Helpers.formatDateDefault({ value: params?.value }),
      },
      {
        field: "end_date",
        databaseKey: "end_date",
        minWidth: 200,
        headerName: { zh: "结束日期", en: "End Date" },
        valueFormatter: (params) =>
          Helpers.formatDateDefault({ value: params?.value }),
      },
      {
        field: "classroom_id",
        databaseKey: "classroom_id",
        minWidth: 250,
        headerName: { zh: "", en: "Classroom ID" },
      },
      {
        field: "date_created",
        databaseKey: "date_created",
        minWidth: 200,
        headerName: { zh: "创建日期", en: "Created" },
        valueFormatter: (params) =>
          Helpers.formatDateDefault({ value: params?.value }),
      },
    ],
  },
});
