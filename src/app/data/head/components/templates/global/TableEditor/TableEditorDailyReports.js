import { Helpers } from "@/src/app/utils";
import { Checkbox } from "@mui/material";
import dayjs from "dayjs";
import { locale } from "../../../../../locale";

const subjectList = {
  Maths: { zh: "數學", en: "Maths" },
};

export default Object.assign({
  title: {
    zh: "每日報告",
    en: "Daily Report",
  },
  label: {
    searchPlaceholder: {
      zh: "",
      en: "",
    },
    subject: { zh: "科目", en: "Subject" },
    startDate: { zh: "開始日期", en: "Start Date" },
    endDate: { zh: "結束日期", en: "End Date" },
    date: { zh: "開始日期", en: "Date" },
  },
  action: {
    datePickerReportDate: true,
    searchRight: true,
    view: {
      href: "/reports/daily/detail",
      params: ["date", "subject", "year"],
    },
  },
  table: {
    columns: [
      {
        field: "date",
        databaseKey: "date",
        minWidth: 200,
        headerName: { zh: "日期", en: "Date" },
        valueFormatter: (params) => dayjs(params?.value)?.format("DD/MM/YYYY"),
      },
      {
        field: "subject",
        databaseKey: "subject",
        minWidth: 800,
        headerName: { zh: "科目", en: "Subject" },
        valueFormatter: (params) => locale(subjectList?.[params?.value]),
      },
      // {
      //   field: 'coin',
      //   databaseKey: 'subject',
      //   minWidth: 200,
      //   headerName: { zh: '', en: 'Coin' },
      //   useActionCell: {
      //     type: 'coin'
      //   },
      // },
      // {
      //   field: 'xp',
      //   databaseKey: 'subject',
      //   minWidth: 200,
      //   headerName: { zh: '', en: 'Xp' },
      //   useActionCell: {
      //     type: 'xp'
      //   },
      // },
      {
        field: "view-button",
        minWidth: 100,
        headerName: { zh: "查看報告", en: "View Detail" },
        disableClickEventBubbling: true,
        useActionCell: {
          type: "view",
        },
      },
    ],
  },
});
