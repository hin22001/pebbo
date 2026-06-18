export default Object.assign([
  {
    id: "dashboard",
    icon: "dashboard-home",
    label: {
      zh: "主頁",
      en: "Dashboard",
    },
    href: "/dashboard",
  },
  {
    id: "question",
    icon: "question-mark",
    label: {
      zh: "每日挑戰",
      en: "Exercise",
    },
    href: "/question/exercise",
  },
  {
    id: "reports",
    icon: "report",
    label: {
      zh: "報告",
      en: "Reports",
    },
    listHref: ["/reports/daily", "/reports/weekly/table"],
    child: [
      {
        id: "daily-report",
        label: {
          zh: "每日報告",
          en: "Daily Reports",
        },
        href: "/reports/daily",
      },
      {
        id: "weekly-report",
        label: {
          zh: "每週報告",
          en: "Weekly Reports",
        },
        href: "/reports/weekly/table",
      },
    ],
  },
  {
    id: "leaderboard",
    icon: "champion-hand",
    label: {
      zh: "排行榜",
      en: "Leaderboard",
    },
    href: "/leaderboard",
  },
  {
    id: "math-library",
    icon: "math-library-icon",
    label: {
      zh: "數學資源庫",
      en: "Math Library",
    },
    href: "/math-library",
  },
  {
    id: "classroom",
    icon: "classroom",
    label: {
      zh: "教室",
      en: "Classroom",
    },
    listHref: ["/classroom/student", "/inbox/student"],
    child: [
      {
        id: "classroom-overview",
        label: {
          zh: "課室總覽",
          en: "Overview",
        },
        href: "/classroom/student",
      },
      {
        id: "classroom-invitation",
        label: {
          zh: "邀請",
          en: "Invitations",
        },
        href: "/inbox/student",
      },
    ],
  },
  {
    id: "shop",
    icon: "gift",
    label: {
      zh: "商店",
      en: "Shop",
    },
    href: "/shop",
  },
  // {
  //   id: "notification",
  //   icon: "notification",
  //   label: {
  //     zh: '通知',
  //     en: 'Notification'
  //   },
  //   href: '/notification'
  // },
]);
