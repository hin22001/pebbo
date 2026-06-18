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
      params: ["id"],
      href: "/quiz-exercise/form",
    },
    detailquiz: {
      params: ["id"],
      href: "/quiz-exercise/form",
    },
  },
  table: {
    columns: [
      {
        field: "view-button",
        minWidth: 100,
        headerName: { zh: "刪除", en: "Delete" },
        disableClickEventBubbling: true,
        useActionCell: {
          type: "customdelete",
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
        field: "school_id",
        databaseKey: "school_id",
        minWidth: 250,
        headerName: { zh: "学校编号", en: "School ID" },
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
