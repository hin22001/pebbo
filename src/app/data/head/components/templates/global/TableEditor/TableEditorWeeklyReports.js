import { Helpers } from "@/src/app/utils";
import { Checkbox } from "@mui/material";
import dayjs from "dayjs";
import { locale } from "../../../../../locale";

const subjectList = {
  Maths: { zh: "數學", en: "Maths" },
};

export default Object.assign({
  title: {
    zh: "問題",
    en: "Weekly Report",
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
    datePickerReportStart: {},
    datePickerReportEnd: {},
    // weekPicker: {},
    searchRight: true,
    view: {
      href: "/reports/weekly/detail",
      params: ["week_start", "subject", "year"],
    },
  },
  table: {
    columns: [
      // {
      //   field: 'id',
      //   databaseKey: 'id',
      //   minWidth: 70,
      //   headerName: { zh: '序号', en: 'ID' },
      // },
      {
        field: "date",
        databaseKey: "week_start",
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
