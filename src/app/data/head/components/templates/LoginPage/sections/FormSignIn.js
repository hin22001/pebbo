export default Object.assign({
  title: {
    student: {
      en: "Student Portal",
      zh: "學生門戶",
    },
    teacher: {
      en: "Teacher Portal",
      zh: "教師門戶",
    },
  },
  label: {
    signIn: { zh: "登入您的帳戶", en: "Login to Your Account" },
    signInBtn: { zh: "登入", en: "Login" },
    signInText: {
      zh: "請輸入您的憑證以存取您的帳戶",
      en: "Please enter your credentials to access your Account",
    },
    signUpText: {
      zh: "請輸入您的憑證以存取您的帳戶",
      en: "Please enter your credentials to access your Account",
    },
    orSignIn: { zh: "或使用以下方式登录", en: "Or sign in with Code" },
    welcome: { zh: "欢迎！", en: "Welcome!" },
    dontHaveAccountLink: { zh: "建立學生帳戶", en: "Create Account" },
    dontHaveAccount: { zh: "沒有帳戶？", en: "Don't have an account?" },
    haveAccount: { zh: "已經有帳戶？", en: "Already have an account? " },
    signUp: { zh: "建立您的帳戶", en: "Create Your Account" },
    forgotPassword: { zh: "忘记密码", en: "Forgot Password" },
    fieldIsNull: { zh: "此填写栏不能为空", en: "This field cannot be empty" },
    signInTeacher: { zh: "以教師身分登入", en: "Sign in as teacher" },
    signInStudent: { zh: "以學生身分登入", en: "Sign in as student" },
    usePw: { zh: "使用密碼", en: "Use Password" },
    useOtp: { zh: "使用一次性密碼", en: "Use OTP" },
    forgot: { zh: "忘記密碼？", en: "Forgot Password?" },
    forgotTitle: { zh: "忘記密碼", en: "Forgot Password" },
    sendEmail: { zh: "發電子郵件", en: "Send Email" },
    resend: { zh: "重發", en: "Resend" },
    resetPassword: { zh: "重新設密碼", en: "Reset Password" },
    submit: { zh: "提交", en: "Submit" },
  },
  form: {
    first_name: {
      type: "text",
      label: { zh: "名", en: "First Name" },
      placeholder: { zh: "輸入您的名字", en: "Enter your first name" },
    },
    last_name: {
      type: "text",
      label: { zh: "姓", en: "Last Name" },
      placeholder: { zh: "輸入您的姓氏", en: "Enter your last name" },
    },
    email: {
      type: "email",
      label: { zh: "電子郵件", en: "Email" },
      placeholder: { zh: "example@gmail.com", en: "example@gmail.com" },
    },
    newPassword: {
      type: "password",
      label: { zh: "新密碼", en: "New Password" },
      placeholder: { zh: "輸入您的密碼", en: "Enter your password" },
    },
    password: {
      type: "password",
      label: { zh: "密碼", en: "Password" },
      placeholder: { zh: "**************", en: "**************" },
    },
    password2: {
      type: "password",
      label: { zh: "確認密碼", en: "Confirm Password" },
      placeholder: { zh: "輸入您的密碼", en: "Enter your password" },
    },
    referral_code: {
      type: "text",
      label: { zh: "推薦碼", en: "Referral Code" },
      placeholder: {
        zh: "輸入推薦碼(可選)",
        en: "Enter referral code(optional)",
      },
    },
    year: {
      type: "select",
      label: { zh: "級別", en: "Grade" },
      placeholder: { zh: "選擇您的級別", en: "Select your grade" },
    },
  },
  footer: {
    title: {
      zh: "版权所有 © Pebbo - 2024。保留所有权利。",
      en: "Copyright © Pebbo - 2024. All rights reserved.",
    },
    items: [
      {
        label: {
          zh: "联系我们",
          en: "Contact Us",
        },
        href: "#",
      },
      {
        label: {
          zh: "隐私政策",
          en: "Privacy Policy",
        },
        href: "#",
      },
      {
        label: "TOC",
        href: "#",
      },
      {
        label: {
          zh: "使用条款",
          en: "Term of Use",
        },
        href: "#",
      },
      {
        label: {
          zh: "数据保留政策",
          en: "Data Retention Policy",
        },
        href: "#",
      },
    ],
  },
  subscribe: {
    selectPlan: {
      en: "Select Plan",
      zh: "選擇計劃",
    },
    annually: {
      en: "Annualy",
      zh: "年付",
    },
    monthly: {
      en: "Monthly",
      zh: "月付",
    },
    now: {
      en: "Now",
      zh: "現在只需",
    },
    days: {
      en: "Days",
      zh: "日",
    },
    for: {
      en: "for",
      zh: "只要",
    },
    just: {
      en: "just",
      zh: "平均",
    },
    perDay: {
      en: "per day",
      zh: "一日",
    },
    cancellation: {
      en: "free cancellation in 14days",
      zh: "14 天內可免費取消",
    },
  },
});
