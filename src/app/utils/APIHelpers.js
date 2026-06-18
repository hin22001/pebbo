import _ from "lodash";
import { ConfigComponents } from "../constant";
import Helpers from "./Helpers";

function tableSortToParamAPI(headColumns = {}, paramSort = []) {
  // === From Array of Sort to Object Params ===

  try {
    const config = {
      asc: "",
      desc: "-",
    };

    const arrSort = paramSort.map((item) => {
      const sort = config[item.sort];

      const columnItem = headColumns.find((col) => col.field == item.field);
      const databaseKey = columnItem?.databaseKey || columnItem?.field;

      return sort + "" + databaseKey;
    });

    let result =
      arrSort?.length > 0
        ? {
            $sort: arrSort.join(","),
          }
        : {};

    return result;
  } catch (err) {
    return {};
  }
}

function tableFilterToParamAPI(headColumns = {}, paramFilter = []) {
  // === From Array of filter to Object Params ===

  try {
    const config = {
      contains: "$like",
    };

    let result = {};

    paramFilter.forEach((item) => {
      const operator = config[item.operator];

      const columnItem = headColumns.find((col) => col.field == item.field);
      const databaseKey = columnItem?.databaseKey || columnItem?.field;

      result[databaseKey + (operator ? "." + operator : "")] = item.value;
    });

    return result;
  } catch (err) {
    return {};
  }
}

function searchToParamAPI(headColumns = {}, paramFilter = "") {
  try {
    const contains = headColumns
      .filter((item) => item.searchable)
      ?.flatMap((item) => item.databaseKey || item.field)
      ?.join(",");

    if (contains) {
      let result = paramFilter && {
        ["$search"]: contains + "=" + paramFilter,
      };

      return result;
    }
    return {};
  } catch (err) {
    return {};
  }
}

function refactorParamsPageContext(
  headColumns = {},
  params = {
    pagination: {},
    filter: [],
    sort: [],
    search: "",
  },
) {
  try {
    return {
      page_number:
        (params?.pagination?.page || ConfigComponents.Table.pageContext?.page) +
        1,
      rows_per_page:
        params?.pagination?.pageSize ||
        ConfigComponents.Table.pageContext?.pageSize,
      ...(tableFilterToParamAPI(headColumns, params?.filter) || {}),
      ...(tableSortToParamAPI(headColumns, params?.sort) || {}),
      ...(searchToParamAPI(headColumns, params?.search) || {}),
    };
  } catch (err) {
    return params;
  }
}

function $params(params = {}) {
  try {
    let result = {};

    Object.keys(params).forEach((item) => {
      result[+item] = params[item];
    });

    return result;
  } catch (err) {
    return params;
  }
}

function refactorDatabaseToHeadTable(headColumns, objDatabase) {
  // === headColumns => Array => on head Column Data Grid ===
  // === objDatabase => Object => response from api per item ===

  try {
    const result = {};

    if (headColumns?.length > 0) {
      headColumns.forEach((col) => {
        if (col?.databaseKey) {
          const colValue = Helpers.getDescendantProp(
            objDatabase,
            col?.databaseKey,
          );

          if (col?.type == "number") {
            result[col?.field] = parseFloat(colValue);
          } else if (col?.type == "boolean") {
            result[col?.field] = Boolean(colValue);
          } else {
            result[col?.field] = colValue;
          }
        }
      });
    }

    return result;
  } catch (err) {
    return null;
  }
}

function refactorMainQuestionAPIGetToHead(values, head) {
  try {
    const forms = { ...(head?.forms?.questionForm?.forms || {}) };

    const result = { ...(forms || {}) };

    result.question["defaultValue"] = values?.Main_Question?.Question;

    // // ================================================================
    // // =================== REFACTOR MAIN QUESTION =====================
    // // ================================================================

    let questionNestedChild = [];

    if (Object.keys(values?.Main_Question?.Answers || {}).length > 0) {
      questionNestedChild = Object.keys(values.Main_Question.Answers).map(
        (item, index) => {
          const valueAnswer = values.Main_Question.Answers[item] || "";

          return {
            id: _.uniqueId(),
            forms: {
              answer: {
                ...forms?.question?.nested?.forms?.answer,
                defaultValue: valueAnswer?.Answer,
              },
              explanation: {
                ...forms?.question?.nested?.forms?.explanation,
                defaultValue: valueAnswer?.Explanation,
              },
            },
          };
        },
      );
    }

    result.question.nested.child = questionNestedChild;

    // // ================================================================
    // // =================== REFACTOR SUB QUESTION ======================
    // // ================================================================

    let subQuestionNestedChild = [];

    if (Object.keys(values?.Nested_Questions || {})?.length > 0) {
      subQuestionNestedChild = Object.keys(values?.Nested_Questions).map(
        (item, index) => {
          const valueQuestion = values?.Nested_Questions[item]?.Question;

          const valueAnswer = values?.Nested_Questions[item]?.Answers || {};

          let childAnswer = [];

          if (Object.keys(valueAnswer || {})?.length > 0) {
            childAnswer = Object.keys(valueAnswer).map(
              (itemChildAnswer, indexChildAnswer) => {
                return {
                  id: _.uniqueId(),
                  forms: {
                    answer: {
                      ...forms?.subQuestion?.nested?.forms?.subQuestion?.nested
                        ?.forms?.answer,
                      defaultValue: valueAnswer[itemChildAnswer]?.Answer,
                    },
                    explanation: {
                      ...forms?.subQuestion?.nested?.forms?.subQuestion?.nested
                        ?.forms?.explanation,
                      defaultValue: valueAnswer[itemChildAnswer]?.Explanation,
                    },
                  },
                };
              },
            );
          }

          const subQuestion = {
            id: _.uniqueId(),
            forms: {
              subQuestion: {
                ...(forms?.subQuestion.nested.forms.subQuestion || {}),
                defaultValue: valueQuestion,
                nested: {
                  ...(forms?.subQuestion.nested.forms.subQuestion?.nested ||
                    {}),
                  child: childAnswer,
                },
              },
            },
          };

          return subQuestion;
        },
      );
    }

    result.subQuestion.nested.child = subQuestionNestedChild;

    return result;
  } catch (err) {}
}

function refactorMainQuestionAPIToArrayOfObject(data, questionId) {
  try {
    const result = {};

    // // ================================================================
    // // =================== REFACTOR MAIN QUESTION =====================
    // // ================================================================

    let mainQuestionAnswer = [];

    if (Object.keys(data?.Main_Question?.Answers || {}).length > 0) {
      mainQuestionAnswer = Object.keys(data.Main_Question.Answers).map(
        (item, index) => {
          return {
            id: "main-question-answer-" + questionId + "-" + _.uniqueId(),
            originalId: item,
            value: data.Main_Question.Answers[item]?.Answer,
            explanation: data.Main_Question.Answers[item]?.Explanation,
          };
        },
      );
    }

    result["mainQuestion"] = {
      id: "main-question-" + questionId,
      question: data?.Main_Question?.Question,
      answer: mainQuestionAnswer,
    };

    // // ================================================================
    // // =================== REFACTOR SUB QUESTION ======================
    // // ================================================================

    let refactorNestedQuestion = [];

    if (Object.keys(data?.Nested_Questions || {})?.length > 0) {
      refactorNestedQuestion = Object.keys(data?.Nested_Questions).map(
        (item, index) => {
          const valueQuestion = data?.Nested_Questions[item]?.Question;

          const valueAnswer = data?.Nested_Questions[item]?.Answers || {};

          let refactorAnswer = [];

          if (Object.keys(valueAnswer || {})?.length > 0) {
            refactorAnswer = Object.keys(valueAnswer).map(
              (itemChildAnswer, indexChildAnswer) => {
                return {
                  id:
                    "nested-question-answer-" + questionId + "-" + _.uniqueId(),
                  originalId: itemChildAnswer,
                  value: valueAnswer[itemChildAnswer]?.Answer,
                  explanation: valueAnswer[itemChildAnswer]?.Explanation,
                };
              },
            );
          }

          const subQuestion = {
            id: "nested-question-" + questionId + "-" + _.uniqueId(),
            question: valueQuestion,
            answer: refactorAnswer,
          };

          return subQuestion;
        },
      );
    }

    result["nestedQuestion"] = refactorNestedQuestion;

    return result;
  } catch (err) {}
}

function refactorMainQuestionHeadToAPIBody(values) {
  try {
    let mainAnswer = {};

    if (values?.question?.child?.length > 0) {
      values?.question.child?.forEach((item, index) => {
        mainAnswer[index] = {
          Answer: item.value.answer,
          Explanation: item.value.explanation,
        };
      });
    }

    let nestedQuestion = {};

    if (values?.subQuestion?.child?.length > 0) {
      values?.subQuestion.child?.forEach((item, index) => {
        let dataAnswer = {};

        if (item?.value?.subQuestion?.child?.length > 0) {
          // from add button
          item?.value?.subQuestion?.child.forEach((subItem, subIndex) => {
            dataAnswer[subIndex] = {
              Answer: subItem?.value?.answer,
              Explanation: subItem?.value?.explanation,
            };
          });
        } else if (item?.value?.child?.length > 0) {
          //  from info update api

          item?.value?.child.forEach((subItem, subIndex) => {
            dataAnswer[subIndex] = {
              Answer: subItem?.value?.answer,
              Explanation: subItem?.value?.explanation,
            };
          });
        }

        nestedQuestion[index] = {
          Answers: dataAnswer,
          Question: item?.value?.subQuestion?.value || item?.value?.value,
        };
      });
    }

    const result = {
      Main_Question: {
        Question: values?.question?.value,
        ...(Object.keys(mainAnswer)?.length > 0
          ? {
              Answers: mainAnswer,
            }
          : {}),
      },
      ...(Object.keys(nestedQuestion)?.length > 0
        ? {
            Nested_Questions: nestedQuestion,
          }
        : {}),
    };

    return result;
  } catch (err) {}
}

const APIHelpers = {
  refactorParamsPageContext,
  refactorDatabaseToHeadTable,
  refactorMainQuestionAPIGetToHead,
  refactorMainQuestionHeadToAPIBody,
  refactorMainQuestionAPIToArrayOfObject,
};

export default APIHelpers;
