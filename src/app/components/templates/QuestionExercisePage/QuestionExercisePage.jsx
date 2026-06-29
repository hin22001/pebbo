"use client";

import React, { Component } from "react";
import _ from "lodash";
import QuestionPage from "@/templates/QuestionPage/QuestionPage";
import { getDataHead } from "@/app/data/head";
import { CategoryHelpers, Helpers } from "@/app/utils";
import { Config } from "@/app/constant";
import nProgress from "nprogress";
import { CategoryAPI, QuestionsAPI } from "@/app/data/api";
import { Auth } from "@/app/data/local";
import Loader from "@/elements/loader/Loader";
import StudentCard from "@/modules/card/StudentCard";
import { locale } from "@/app/data/locale";

/**
 * Question / AI exercise page — expects props.assignMainLayout.
 */
function buildInitialCategoryState(initialEnabledCategories, initialYear) {
  if (
    initialEnabledCategories == null ||
    initialYear == null ||
    !Array.isArray(initialEnabledCategories)
  ) {
    return null;
  }
  const dataCategory = CategoryHelpers.getRefactorCategory(initialYear);
  if (!dataCategory || !dataCategory.length) return null;
  const refactorData = dataCategory.map((item, index) => ({
    ...item,
    checked: Boolean(initialEnabledCategories[index]),
  }));
  const categoryValues = refactorData
    ?.filter((item) => item.checked)
    ?.flatMap((item) => item.id);
  return {
    dataCategory: refactorData,
    currentCategoryArray: initialEnabledCategories,
    categoryValues: categoryValues ?? [],
  };
}

export default class QuestionExercisePage extends Component {
  constructor(props) {
    super(props);

    const initial = buildInitialCategoryState(
      props.initialEnabledCategories,
      props.initialYear,
    );

    this.state = {
      showLoader: false,
      ...(initial || {}),
    };
  }

  async loader(show = true) {
    try {
      if (show) {
        nProgress.start();
        this.setState({ showLoader: true });
      } else {
        this.setState({ showLoader: false });
        nProgress.done();
      }
    } catch (err) {}
  }

  async postCompleteQuestion(params) {
    try {
      await this.loader();

      const dataAnswerClean = Helpers.structuredClone(params?.dataAnswer);

      const refactorData = params?.dataAnswer.map((item, index) => {
        const timeTaken = params?.dataTime?.find(
          (tt) => tt.id == item?.id,
        )?.duration;

        return {
          question_id: item?.id,
          user_answers: item?.answer?.map((b) => ({
            answers: b?.answers || [""],
          })) || [{ answers: [""] }],
          time_taken: timeTaken,
        };
      });

      const body = { all_answers: refactorData };

      const response = await QuestionsAPI.postCompleteQuestion(null, body);

      if (response?.success) {
        let dataQuestions = response?.data || response?.payload?.data;

        const totalQuestion = dataQuestions?.length;
        let overallScore = 0;

        const refactorDataQuestions = dataQuestions?.map((item, index) => {
          overallScore = overallScore + item?.accuracy;
          const answerValue = dataAnswerClean[index]?.answer;

          const question = Helpers.completeRichTextValue(
            item?.question_object,
            answerValue,
          );

          const newItem = Helpers.filterObjectByKey(
            {
              ...(item || {}),
              question: question,
              elementKey: "question-key-" + _.uniqueId() + "-" + item?.id,
            },
            "question_object",
          );

          return newItem;
        });

        const percentage = _.round((overallScore / totalQuestion) * 100, 2);

        const scoreResult = {
          success: response?.success,
          status: response?.status,
          message: response?.message,
          coins_awarded:
            response?.coins_awarded || response?.payload?.coins_awarded,
          // Pass the authoritative DB totals through so QuestionPage can land
          // the coin/star chips on the exact DB value (?? keeps a valid 0).
          total_coins: response?.total_coins ?? response?.payload?.total_coins,
          total_stars: response?.total_stars ?? response?.payload?.total_stars,
          overallScore,
          totalQuestion,
          percentage,
          type: percentage > 50 ? "great" : "notGreat",
          dataQuestion: refactorDataQuestions,
          data: dataQuestions,
        };
        this.setState({ debugResponse: { response, body } });

        await this.loader(false);

        return scoreResult;
      } else {
        this.setState({ debugResponse: { response, body } });
        const headRes = getDataHead({ name: "headAlert" });
        Helpers.openSnackbar({
          message: locale(headRes?.actionFailed),
        });
      }

      await this.loader(false);
    } catch (err) {
      await this.loader(false);
    }
  }

  async getAIQuestion(selectedCategories, dataCategory) {
    try {
      const params = {};
      if (selectedCategories?.length && dataCategory?.length) {
        // selectedCategories can be array of ids [15, "1.1"] or array of objects [{id: 15}]
        let arrSelected = selectedCategories.flatMap((item) =>
          typeof item === "object" && item != null && "id" in item
            ? item.id
            : item,
        );
        arrSelected = arrSelected.filter((v) => v != null && v !== "");
        params.enabled_categories = dataCategory.map((item) =>
          arrSelected.some((v) => String(v) === String(item?.id)) ? 1 : 0,
        );
      }
      const response = await QuestionsAPI.getAIQuestions(params, {});

      if (response?.success) {
        const refactorData = response?.payload?.data?.filter(
          (item) => item.question_object,
        );
        return refactorData;
      } else {
        const headRes = getDataHead({ name: "headAlert" });
        Helpers.openSnackbar({
          message: locale(headRes?.actionFailed),
        });
      }

      return [];
    } catch (err) {}
  }

  async getQuestion(selectedCategories, dataCategory) {
    try {
      const data = await this.getAIQuestion(selectedCategories, dataCategory);

      if (data?.length > 0) {
        const dataQuestions = data.map((item) => {
          return Helpers.filterObjectByKey(
            {
              ...(item || {}),
              question: item?.question_object,
            },
            "question_object",
          );
        });

        const dataQuestionsTab = dataQuestions.map((item, index) => ({
          id: item.id,
          label: "Q" + (index + 1),
        }));

        return { dataQuestions, dataQuestionsTab };
      }
    } catch (err) {}
  }

  async assignDataCategories() {
    try {
      if (this.state.dataCategory?.length > 0) {
        return;
      }

      const dataUser = Auth.getDataUser();

      const dataCategory = CategoryHelpers.getRefactorCategory(dataUser?.year);

      let defaultValues = this.props.initialEnabledCategories || null;

      if (!defaultValues) {
        const response = await CategoryAPI.getCategory(
          {
            education_level: dataUser?.education_level,
            year: dataUser?.year,
          },
          {},
        );

        defaultValues = response?.payload?.data?.enabled_categories;
      }

      const refactorData = dataCategory.map((item, index) => ({
        ...item,
        checked: Boolean(defaultValues && defaultValues[index]),
      }));

      const categoryValues = refactorData
        ?.filter((item) => item.checked)
        ?.flatMap((item) => item.id);

      this.setState({
        dataCategory: refactorData,
        currentCategoryArray: defaultValues,
        categoryValues,
      });
    } catch (err) {}
  }

  async setCategory(value) {
    try {
      const { dataCategory, currentCategoryArray } = this.state;

      let arrSelected = value?.flatMap((item) => item.id);
      arrSelected =
        arrSelected?.filter((item) => item)?.length > 0 ? arrSelected : value;

      const formatedArrCategory = dataCategory
        ?.map((item) => ({
          checkedStatus: arrSelected?.includes(item?.id.toString()) ? 1 : 0,
        }))
        ?.flatMap((item) => item.checkedStatus);

      if (!Helpers.compareObject(currentCategoryArray, formatedArrCategory)) {
        const dataUser = Auth.getDataUser();
        const body = {
          enabled_categories: formatedArrCategory,
          education_level: dataUser?.education_level,
          year: dataUser?.year?.toString(),
        };

        await CategoryAPI.setCategory(null, body);
      }
    } catch (err) {}
  }

  clearQuestion = () => {
    this.setState({
      dataQuestions: null,
      dataQuestionsTab: null,
    });
  };

  async assignHead() {
    try {
      const head = getDataHead({ name: "headQuestionPage" });
      this.setState({ head });
      await this.assignDataCategories();
    } catch (err) {}
  }

  async componentDidMount() {
    const assignMainLayout = this.props.assignMainLayout;
    if (assignMainLayout) {
      await assignMainLayout({ type: "ASSIGN_OPEN_LOADER" });
    }
    await this.assignHead();
    if (assignMainLayout) {
      await assignMainLayout({ type: "ASSIGN_CLOSE_LOADER" });
    }
  }

  render() {
    const {
      state: {
        head,
        dataQuestions,
        dataQuestionsTab,
        dataCategory,
        categoryValues,
        showLoader,
        debugResponse,
      },
      props: { assignMainLayout },
    } = this;

    const QuestionPageComponent = QuestionPage;

    return (
      <StudentCard>
        <Loader isOpen={showLoader} />
        <QuestionPageComponent
          head={head}
          debugResponse={debugResponse}
          dataQuestions={dataQuestions}
          dataQuestionsTab={dataQuestionsTab}
          dataCategory={dataCategory}
          categoryValues={categoryValues}
          setCategory={this.setCategory.bind(this)}
          postCompleteQuestion={this.postCompleteQuestion.bind(this)}
          getQuestion={this.getQuestion.bind(this)}
          clearQuestion={this.clearQuestion}
          assignMainLayout={assignMainLayout}
        />
      </StudentCard>
    );
  }
}
