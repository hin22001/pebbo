export default Object.assign({
  title: {
    zh: "查看过滤器",
    en: "Add Questions",
  },
  forms: {
    questions: {
      required: true,
      label: {
        zh: "客户",
        en: "questions",
      },
      placeholder: {
        zh: "选择客户",
        en: "Fill questions",
      },
      type: "string",
    },
    dates: {
      required: {
        endDate: true,
      },
      labels: {
        startDate: {
          zh: "开始日期",
          en: "Date Start",
        },
        endDate: {
          zh: "结束日期",
          en: "Date End",
        },
      },
      placeholder: {
        zh: "选择日期",
        en: "Select date",
      },
      type: "date-picker-range-uncontrolled",
    },
  },
});
