import { Checkbox } from "@mui/material";
import Helpers from "../../../../../../utils/Helpers";

export default Object.assign({
  title: {
    zh: "問題",
    en: "Questions",
  },
  label: {
    searchPlaceholder: {
      zh: "搜索科目",
      en: "Search Subject",
    },
  },
  action: {
    search: true,
    delete: {
      label: {
        zh: "删除",
        en: "Delete",
      },
    },
    add: {
      href: "/user-questions/form",
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
      // {
      //   field: 'edit-button',
      //   minWidth: 70,
      //   headerName: { zh: '编辑', en: 'Edit' },
      //   disableClickEventBubbling: true,
      //   useActionCell: {
      //     type: 'edit'
      //   },
      // },
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
        headerName: { zh: "科目", en: "Subject" },
      },
      {
        field: "category",
        databaseKey: "category",
        minWidth: 200,
        headerName: { zh: "類別", en: "Category" },
      },
      {
        field: "school_id",
        databaseKey: "school_id",
        minWidth: 250,
        headerName: { zh: "学校编号", en: "School ID" },
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
