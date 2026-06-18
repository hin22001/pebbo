export default Object.assign({
  welcome: {
    title: {
      zh: "歡迎來到Pebbo!",
      en: "Welcome to Pebbo!",
    },
    message: {
      zh: "<message>",
      en: "<message>",
    },
    theme: "title-lg",
    imageSrc: require("@/images/illustration/illustration-mascot-surfing-2.png"),
    useButton: [
      {
        label: {
          zh: "開始練習",
          en: "Start Excercise",
        },
        href: "/question/exercise",
      },
      {
        label: {
          zh: "查看我的報告",
          en: "See your reports",
        },
        href: "/reports/daily",
        theme: "secondary",
      },
    ],
  },
  payment: {
    title: {
      zh: "歡迎來到Pebbo!",
      en: "Welcome to Pebbo!",
    },
    message: {
      zh: "若要存取完整功能，請升級您的訂閱",
      en: "To access full feature, please upgrade your subscription",
    },
    theme: "title-lg",
    imageSrc: require("@/images/illustration/illustration-mascot-surfing-2.png"),
    btnTitle: {
      zh: "獲取訂閱",
      en: "Get Subscription",
    },
  },
  accessDenied: {
    title: {
      zh: "您没有访问权限",
      en: "Access Denied",
    },
    message: {
      zh: "很抱歉，您无法访问此功能，请联系管理员",
      en: "Sorry, you do not have access to this feature. Please contact the administrator.",
    },
    image: "ImageAccessDenied",
    useButton: [
      {
        label: {
          zh: "返回仪表盘",
          en: "Back to Dashboard",
        },
        href: "/dashboard",
      },
    ],
  },
  pageNotFound: {
    title: {
      zh: "404.",
      en: "404.",
    },
    image: "ImageNotFound",
    theme: "image-small",
    message: {
      zh: "页面未找到。",
      en: "Page not found.",
    },
    useButton: [
      {
        label: {
          zh: "返回主页",
          en: "Back to Main Page",
        },
        theme: "yellow",
        href: "/dashboard",
      },
    ],
  },
  underConstruction: {
    title: {
      zh: "页面正在建设中",
      en: "Page Under Construction",
    },
    image: "ImageUnderConstruction",
    message: {
      zh: "此页面目前正在建设中。",
      en: "This page is currently under construction.",
    },
  },
  dataEmpty: {
    title: {
      zh: "未找到数据",
      en: "Data Not Found",
    },
    image: "ImageDataNotFound",
    message: {
      zh: "无法显示任何数据",
      en: "No data available to display",
    },
  },
  dataEmptySimple: {
    title: {
      zh: "未找到数据",
      en: "Data Not Found",
    },
    message: {
      zh: "无法显示任何数据",
      en: "No data available to display",
    },
  },
  formSubmitted: {
    image: "ImageDashboard",
    theme: "image-small",
    title: {
      zh: "未找到数据",
      en: "Data Submitted Successfully",
    },
    message: {
      zh: "无法显示任何数据",
      en: "Data Submitted Successfully",
    },
  },
  verifyingUser: {
    imageSrc: require("@/images/illustration/illustration-pebbo-mascot-circle-smile.png"),
    theme: "image-small",
    title: {
      zh: "未找到数据",
      en: "Verifying User...",
    },
    message: {
      zh: "无法显示任何数据",
      en: "Please wait a moment",
    },
  },
  verifyingUserFailed: {
    imageSrc: require("@/images/illustration/illustration-pebbo-mascot-circle-sad.png"),
    theme: "image-small",
    title: {
      zh: "未找到数据",
      en: "Verifying User Failed",
    },
    message: {
      zh: "无法显示任何数据",
      en: "Please try to login again <a href='/login' class='text-link'>here</a>",
    },
  },
  verifyingUserSuccess: {
    imageSrc: require("@/images/illustration/illustration-pebbo-mascot-circle-happy.png"),
    theme: "image-small",
    title: {
      zh: "Verifying User Success!",
      en: "Verifying User Success!",
    },
    message: {
      zh: "We'll redirect you to awesome page! Click <a href='/' class='text-link'>here</a> if you're stuck",
      en: "We'll redirect you to awesome page! Click <a href='/' class='text-link'>here</a> if you're stuck",
    },
  },
});
