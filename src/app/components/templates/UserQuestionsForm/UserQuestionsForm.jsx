"use client";

import React, { Component } from "react";
import { getDataHead } from "@/app/data/head";
import { APIHelpers, CategoryHelpers, Helpers } from "@/app/utils";
import { QuestionsAPI } from "@/app/data/api";
import { Auth, TempData } from "@/app/data/local";
import nProgress from "nprogress";
import QuestionForms from "@/app/components/templates/QuestionPage/forms/QuestionForms";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import { TeacherCard } from "@/app/components/modules";

class UserQuestionsForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  loader = async (show = true) => {
    try {
      if (show) {
        nProgress.start();
        this.props.assignMainLayout?.({ type: "ASSIGN_OPEN_LOADER" });
        setTimeout(() => nProgress.done(), 15000);
      } else {
        this.props.assignMainLayout?.({ type: "ASSIGN_CLOSE_LOADER" });
        nProgress.done();
      }
    } catch (err) {}
  };

  getDataCategories = (categoryId) => {
    try {
      const dataUser = Auth.getDataUser();
      let dataCategory = CategoryHelpers.getRefactorCategory(dataUser?.year);
      if (categoryId) {
        dataCategory = dataCategory.filter((item) => item.id == categoryId);
      }
      return dataCategory;
    } catch (err) {}
  };

  postQuestions = async (params) => {
    try {
      await this.loader(true);
      const questionId = this.state.questionId;
      const apiType = this.state.type;
      const { category, subject } = params?.valuesQuestionType;
      const question_objects = params?.valuesEn;
      const body = {
        ...(apiType == "edit" && questionId
          ? { question_id: parseInt(questionId) }
          : {}),
        category,
        subject,
        question: question_objects,
      };
      let response;
      if (apiType == "edit") {
        response = await QuestionsAPI.updateUserQuestion({}, body);
      } else {
        response = await QuestionsAPI.insertUserQuestion({}, body);
      }
      if (response.success) {
        await this.loader(false);
        return response;
      } else {
        Helpers.openSnackbar({ message: response.message });
      }
      await this.loader(false);
    } catch (err) {
      Helpers.openSnackbar();
      await this.loader(false);
    }
  };

  assignHead = async () => {
    try {
      const queryQuestionId = this.props.questionId;
      let refactorDataQuestion, questionFormEn, questionFormZh, questionId;
      let type = queryQuestionId ? "edit" : "add";
      const access = getDataHead({ name: "headRole" })["editor"].access;
      const accesForm = access[type];
      const accessUploadImage = accesForm ? access.questionImage : null;
      const head = Helpers.structuredClone(
        getDataHead({ name: "headQuestionForms" }),
      );
      const dataCategories = this.getDataCategories();
      head.forms.questionType.forms.category.dropdown = {
        data: dataCategories,
        getData: async (params) => await this.getDataCategories(params?.id),
      };
      if (type == "edit") {
        try {
          questionId = parseInt(queryQuestionId);
          const dataQuestion = TempData.getData("questionDetail");
          if (dataQuestion?.question_id == questionId) {
            refactorDataQuestion = { ...(dataQuestion || {}) };
            head.forms.questionType.forms.subject["defaultValue"] =
              refactorDataQuestion.subject;
            head.forms.questionType.forms.category["defaultValue"] = parseInt(
              refactorDataQuestion?.category,
            );
            questionFormEn = refactorDataQuestion?.question;
          }
        } catch (err) {}
      } else {
        try {
          head.forms.questionType.forms.category["defaultValue"] =
            dataCategories[0]?.id;
          head.forms.questionType.forms.subCategory["defaultValue"] =
            dataCategories[0]?.child[0]?.id;
        } catch (err) {}
      }
      if (!accessUploadImage) {
        head.forms.questionType.forms.uploadImage = {};
      }
      const initialValuesQuestionType = {};
      Object.keys(head.forms.questionType.forms).map((key) => {
        initialValuesQuestionType[key] =
          head.forms.questionType.forms[key]?.defaultValue;
      });
      this.setState({
        type,
        head,
        access,
        dataQuestion: refactorDataQuestion,
        questionFormEn,
        questionFormZh,
        questionId,
        initialValuesQuestionType,
      });
    } catch (err) {}
  };

  componentDidMount() {
    this.loader(true);
    this.assignHead();
    this.loader(false);
  }

  render() {
    const {
      head,
      access,
      type,
      questionFormZh,
      questionFormEn,
      initialValuesQuestionType,
      dataQuestion,
    } = this.state;
    return (
      <ContentLayout>
        <TeacherCard>
          <QuestionForms
            type={type}
            head={head}
            access={access}
            questionFormZh={questionFormZh}
            questionFormEn={questionFormEn}
            initialValuesQuestionType={initialValuesQuestionType}
            postQuestions={this.postQuestions}
            mutable={dataQuestion?.mutable}
            isEdit={this.props.questionId}
          />
        </TeacherCard>
      </ContentLayout>
    );
  }
}

export default UserQuestionsForm;
