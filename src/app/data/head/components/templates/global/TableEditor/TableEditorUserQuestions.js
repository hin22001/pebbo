import { Helpers } from "@/src/app/utils";
import { Checkbox } from "@mui/material";
import dayjs from "dayjs";

export default Object.assign({
  title: {
    zh: "每日報告",
    en: "User Questions",
  },
  label: {
    searchPlaceholder: {
      zh: "按主題搜尋",
      en: "Search by subject",
    },
  },
  action: {
    datePicker: true,
    search: true,
    view: {
      href: "/reports/daily/detail",
      params: ["date", "subject", "year"],
    },
  },
  table: {
    columns: [
      {
        field: "view-button",
        minWidth: 100,
        headerName: { zh: "查看報告", en: "View Detail" },
        disableClickEventBubbling: true,
        useActionCell: {
          type: "view",
        },
      },
      // {
      //   field: 'id',
      //   databaseKey: 'id',
      //   minWidth: 70,
      //   headerName: { zh: '序号', en: 'ID' },
      // },
      {
        field: "subject",
        databaseKey: "subject",
        minWidth: 200,
        headerName: { zh: "科目", en: "Subject" },
      },
      {
        field: "date",
        databaseKey: "date",
        minWidth: 200,
        headerName: { zh: "日期", en: "Date" },
        valueFormatter: (params) =>
          Helpers.formatDateDefault({ value: params?.value }),
      },
    ],
  },
});
