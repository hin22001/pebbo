export default Object.assign([
  {
    id: "dashboard",
    icon: "dashboard-home",
    label: {
      zh: "儀表板",
      en: "Dashboard",
    },
    href: "/teacher/dashboard",
  },
  {
    id: "classroom",
    icon: "classroom",
    label: {
      zh: "教室",
      en: "Classrooms",
    },
    href: "/teacher/classrooms",
  },
  {
    id: "quiz-exercise",
    icon: "pen-holder",
    label: {
      zh: "測驗",
      en: "Quizzes",
    },
    href: "/teacher/quizzes",
  },
  {
    id: "reports",
    icon: "chart-bar",
    label: {
      zh: "報告",
      en: "Reports",
    },
    href: "/teacher/reports/class",
    matchPrefix: "/teacher/reports",
  },
  {
    id: "class-report",
    icon: "champion-hand",
    label: {
      zh: "課堂報告",
      en: "Class Report",
    },
    href: "/class-report",
  },
  {
    id: "quiz-report",
    icon: "star-yellow",
    label: {
      zh: "測驗報告",
      en: "Quiz Report",
    },
    href: "/quiz-report",
  },
]);
