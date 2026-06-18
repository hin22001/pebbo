export default Object.assign({
  header: {
    title: {
      en: "Exercise",
      zh: "練習",
    },
  },
  sectionCategory: {
    label: {
      saveCategory: {
        en: "Save Category",
        zh: "保存類別",
      },
    },
    forms: {
      category: {
        type: "dropdown",
        label: {
          en: "Category",
          zh: "課題",
        },
        placeholder: {
          en: "Select your category",
          zh: "选择您的主類別",
        },
        dropdown: {},
        updateNextField: [
          {
            id: "subCategory",
            updateValidation: true,
          },
        ],
      },
      subCategory: {
        type: "dropdown",
        label: {
          en: "Sub Category",
          zh: "子類別",
        },
        placeholder: {
          en: "Select your sub category",
          zh: "选择您的子類別",
        },
        dropdown: {},
      },
    },
  },
  scoreCard: {
    great: {
      imageSrc: require("@/images/illustration/illustration-pebbo-mascot-circle-happy.png"),
      theme: "image-small list-like",
      title: {
        zh: "你的分數是 <span class='text-green text-h4'>{value}</span>",
        en: "Your score is <span class='text-green text-h4'>{value}</span>",
      },
      message: {
        zh: "做得太好了!真棒!",
        en: "Well done! Awesome!",
      },
    },
    notGreat: {
      imageSrc: require("@/images/illustration/illustration-pebbo-mascot-circle-sad.png"),
      theme: "image-small list-like",
      title: {
        zh: "你的分數是 <span class='text-red text-h4'>{value}</span>",
        en: "Your score is <span class='text-red text-h4'>{value}</span>",
      },
      message: {
        zh: "不要放棄！只要努力，下次一定會做得更好!",
        en: "Do not give up! As long as you work hard, you will definitely do better next time!",
      },
    },
  },
  cardQuestionTryAgain: {
    title: {
      en: "You've just finished {value} question, Let's try again!",
      zh: "你剛剛完成了{value}條問題，請繼續前進完成今日挑戰!",
    },
    theme: "image-small list-like button-on-description",
    disableBackdrop: true,
    imageSrc: require("@/images/illustration/illustration-mascot-hula.png"),
    useButton: [
      {
        label: {
          zh: "繼續",
          en: "Continue",
        },
      },
    ],
  },
  answers: {
    label: {
      category: {
        en: "Category: {value}",
        zh: "類別: {value}",
      },
    },
    forms: {
      answer: {
        type: "string",
        label: {
          en: "Your Answer",
          zh: "您的答案",
        },
        placeholder: {
          en: "Put your answer here",
          zh: "在此处输入您的答案",
        },
      },
    },
  },
  tabs: {
    status: {
      warning: {
        tabItem: {
          className: "yellow",
          icon: "Warning",
          iconPosition: "start",
          iconSize: "sm",
        },
      },
      correct: {
        tabItem: {
          className: "green",
          icon: "correct",
          iconPosition: "start",
          iconSize: "sm",
        },
      },
      wrong: {
        tabItem: {
          className: "red",
          icon: "wrong",
          iconPosition: "start",
          iconSize: "sm",
        },
      },
    },
  },
  spentTime: {
    en: "Spent Time",
    zh: "已進行",
  },
  exerciseStart: {
    en: "Exercise Start",
    zh: "開始時間",
  },
  exerciseStart: {
    en: "Exercise Start",
    zh: "開始時間",
  },
  exerciseEnd: {
    en: "Exercise End",
    zh: "結束時間",
  },
  result: {
    en: "Result",
    zh: "成績",
  },
  continue: {
    en: "Continue",
    zh: "下一個練習",
  },
  answer: {
    en: "Answer",
    zh: "答案",
  },
  askPotter: {
    en: "Ask Potter",
    zh: "問問波特",
  },
  hundredCoin: {
    en: "Spends 100 coins to chat with AI for help",
    zh: "花費100個金幣請教一下波特",
  },
  congrats: {
    en: "Congrats!",
    zh: "做得不錯!加油努力!",
  },
  wishSuccess: {
    en: "Wishing you even more success in the future",
    zh: "堅持會有回報!",
  },
  tryHarder: {
    en: "Challenges are part of progress!",
    zh: "進步的路上總有挑戰！",
  },
  doBetter: {
    en: "Don’t give up! Every effort is a key to grow!",
    zh: "不要放棄! 每一次努力，都是進步的關鍵！",
  },
  time: {
    en: "Time",
    zh: "所用時間",
  },
  yourScore: {
    en: "Your Score",
    zh: "分數",
  },
  stars: {
    en: "Stars",
    zh: "獲得星星",
  },
  rewards: {
    en: "Rewards",
    zh: "獎勵",
  },
  continue2: {
    en: "Continue",
    zh: "繼續",
  },
  continueExercise: {
    en: "Continue",
    zh: "繼續",
  },
  category: {
    en: "Category",
    zh: "類別",
  },
  difficulty: {
    en: "Difficulty",
    zh: "難度",
  },
  questionId: {
    en: "Question ID",
    zh: "問題ID",
  },
});
