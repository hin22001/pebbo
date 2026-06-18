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
    search: true,
    save: {
      label: {
        zh: "保存",
        en: "Save",
      },
    },
    edit: {
      query: ["id"],
      href: "/user-questions/form",
    },
    detailquest: {
      params: ["question_id"],
      href: "/user-questions/form",
    },
  },
  table: {
    columns: [
      {
        field: "view-button",
        minWidth: 100,
        headerName: { zh: "查看详细問題", en: "View Detail" },
        disableClickEventBubbling: true,
        useActionCell: {
          type: "detailquest",
        },
      },
      {
        field: "id",
        databaseKey: "question_id",
        minWidth: 70,
        headerName: { zh: "编号", en: "ID" },
      },
      {
        field: "creator",
        databaseKey: "creator",
        minWidth: 200,
        headerName: { zh: "创建者", en: "Creator" },
      },
      {
        field: "subject",
        databaseKey: "subject",
        minWidth: 200,
        headerName: { zh: "主题", en: "Subject" },
      },
      {
        field: "category",
        databaseKey: "category",
        minWidth: 200,
        headerName: { zh: "類別", en: "Category" },
      },
      {
        field: "created_at",
        databaseKey: "created_at",
        minWidth: 200,
        headerName: { zh: "日期", en: "Date" },
        valueFormatter: (params) =>
          Helpers.formatDateDefault({ value: params?.value }),
      },
    ],
  },
});
