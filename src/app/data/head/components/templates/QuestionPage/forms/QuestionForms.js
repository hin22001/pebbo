import _ from "lodash";

export default Object.assign({
  header: {
    type: {
      edit: {
        title: {
          en: "Edit Question",
          zh: "编辑問題",
        },
        subtitle: {
          en: "Edit your questions",
          zh: "编辑你的問題",
        },
        steps: [
          {
            id: "config",
            label: {
              en: "Question Type",
              zh: "問題类型",
            },
          },
          {
            id: "form",
            label: {
              en: "Question Form",
              zh: "問題表单",
            },
          },
          {
            id: "finish",
            label: {
              en: "Finish",
              zh: "完成",
            },
          },
        ],
      },
      add: {
        title: {
          en: "Add Question",
          zh: "添加問題",
        },
        subtitle: {
          en: "Fill your questions",
          zh: "填写您的問題",
        },
        steps: [
          {
            id: "config",
            label: {
              en: "Question Type",
              zh: "問題类型",
            },
          },
          {
            id: "form",
            label: {
              en: "Question Form",
              zh: "問題表单",
            },
          },
          {
            id: "finish",
            label: {
              en: "Finish",
              zh: "完成",
            },
          },
        ],
      },
    },
  },
  forms: {
    questionType: {
      forms: {
        // concept: {},
        subject: {
          type: "string",
          label: {
            en: "Subject",
            zh: "類別",
          },
          placeholder: {
            en: "Fill your subject study",
            zh: "选择您的類別",
          },
        },
        category: {
          type: "dropdown",
          label: {
            en: "Category",
            zh: "類別",
          },
          placeholder: {
            en: "Select your category",
            zh: "选择您的類別",
          },
          dropdown: {},
        },
        subCategory: {},
        type: {},
        difficulty: {},
      },
    },
    questionForm: {
      forms: {
        question: {
          type: "string",
          label: {
            en: "Question",
            zh: "問題",
          },
          placeholder: {
            en: "Fill your question here",
            zh: "在此处填写您的問題",
          },
          nested: {
            maxNumber: 10,
            initialNumber: 1,
            fieldClass: "flex-row gap-2",
            useNumber: true,
            addButton: {
              label: {
                en: "Add Answer",
                zh: "添加答案",
              },
            },
            forms: {
              answer: {
                type: "string",
                label: {
                  en: "Answer",
                  zh: "答案",
                },
                placeholder: {
                  en: "Put your answer here",
                  zh: "在此处放置您的答案",
                },
              },
              explanation: {
                type: "string",
                label: {
                  en: "Explanation",
                  zh: "答案",
                },
                placeholder: {
                  en: "Put your explanation here",
                  zh: "在此处放置您的答案",
                },
              },
            },
            child: [],
          },
        },
        subQuestion: {
          nested: {
            addButton: {
              label: {
                en: "Add Sub Question",
                zh: "添加子問題",
              },
            },
            formClass: "card",
            useNumber: true,
            titleAttribute: {
              variant: "h6",
            },
            title: {
              en: "Sub Question",
              zh: "子問題",
            },
            forms: {
              subQuestion: {
                type: "string",
                label: {
                  en: "Sub Question",
                  zh: "子問題",
                },
                placeholder: {
                  en: "Fill your question here",
                  zh: "在此处填写您的問題",
                },
                nested: {
                  maxNumber: 10,
                  initialNumber: 1,
                  fieldClass: "flex-row gap-2",
                  useNumber: true,
                  addButton: {
                    label: {
                      en: "Add Answer",
                      zh: "添加答案",
                    },
                  },
                  forms: {
                    answer: {
                      type: "string",
                      label: {
                        en: "Answer",
                        zh: "答案",
                      },
                      placeholder: {
                        en: "Put your answer here",
                        zh: "在此处放置您的答案",
                      },
                    },
                    explanation: {
                      type: "string",
                      label: {
                        en: "Explanation",
                        zh: "答案",
                      },
                      placeholder: {
                        en: "Put your explanation here",
                        zh: "在此处放置您的答案",
                      },
                    },
                  },
                  child: [],
                },
              },
            },
            child: [],
          },
        },
      },
    },
  },
});
