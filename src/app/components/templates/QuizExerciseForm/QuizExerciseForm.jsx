"use client";

import React, { Component } from "react";
import { TableEditor } from "@/app/components/templates";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import { TeacherCard } from "@/app/components/modules";
import { getDataHead } from "@/app/data/head";
import { APIHelpers } from "@/app/utils";
import QuestionsAPI from "@/app/data/api/QuestionsAPI";
import { ConfigComponents } from "@/app/constant";
import { Helpers } from "@/app/utils";
import { locale } from "@/locale";
import { Button, Skeleton, Tabs } from "@/app/components/elements";
import { RichText } from "@/app/components/sections";
import { Stack, Collapse, Modal, Box, Typography } from "@mui/material";
import dayjs from "dayjs";

class QuizExerciseForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataQuestionsTab: [],
      mainClassName: "template-question-page",
      loading: true,
      modalOpen: false,
    };
    this.onRemove = this.onRemove.bind(this);
  }

  getQuestion = async (params) => {
    try {
      const headColumns = this.state.head?.table?.columns || {};
      const paramsPageContext = APIHelpers.refactorParamsPageContext(
        headColumns,
        params,
      );
      let dateAscending = "asc";
      let search = "";
      if (paramsPageContext?.$sort === "-created_at") dateAscending = "desc";
      if (params?.search?.length > 0) search = params?.search;
      const refactorParams = {
        ...(paramsPageContext || {}),
        created_at: params?.created_at
          ? dayjs(params?.created_at)?.format("YYYY-MM-DD")
          : null,
        order: dateAscending,
        subject: search,
      };
      const response = await QuestionsAPI.getUserQuestions(refactorParams);
      if (response?.success) {
        const pageContext = response.payload?.data?.page_context;
        const refactorPageContext = {
          rowCount: pageContext?.total_rows,
          page: pageContext?.page_number - 1,
          pageSize: pageContext?.rows_per_page,
          pageTotal: Math.round(
            pageContext?.total_rows / pageContext?.rows_per_page,
          ),
        };
        const refactorData = response?.payload?.data?.userQuestions?.map(
          (item) => {
            const value = APIHelpers.refactorDatabaseToHeadTable(
              headColumns,
              item,
            );
            return {
              ...(value || {}),
              creator: item?.user?.first_name + " " + item?.user?.last_name,
              mutable: item?.mutable,
              originalData: item,
            };
          },
        );
        return { pageContext: refactorPageContext, data: refactorData };
      }
      return { pageContext: ConfigComponents.Table.pageContext, data: [] };
    } catch (err) {
      return { pageContext: ConfigComponents.Table.pageContext, data: [] };
    }
  };

  assignHead = async () => {
    this.setState({ loading: true });
    try {
      const head = getDataHead({ name: "headTableQuizEdit" });
      const head2 = getDataHead({ name: "headQuizExercise" });
      const url =
        typeof window !== "undefined" ? window.location.search : "";
      const params = new URLSearchParams(url);
      const id = params.get("id");
      const resQuest = await QuestionsAPI.getQuizQuestions({ quiz_id: id }, []);
      const dataQuest = resQuest?.payload?.data?.quizQuestions;
      const dataQuestionsTab = dataQuest?.map((item) => ({
        id: item.question_id,
        label: "ID: " + item.question_id,
      }));
      const res = await QuestionsAPI.getQuiz(
        { page_number: 1, rows_per_page: 2, quiz_id: id },
        [],
      );
      const data = res?.payload?.data?.quizzes[0]?.quiz_questions?.map(
        (question) => question?.question_id,
      );
      this.setState({
        head,
        access: { checkbox: true, data },
        initialSelectedRow: data,
        dataQuestions: dataQuest,
        dataQuestionsTab,
        activeTab: dataQuestionsTab[0]?.id,
        quiz_id: id,
        head2,
      });
    } catch (err) {}
    this.setState({ loading: false });
  };

  onSave = async (params) => {
    this.props.assignMainLayout?.({ type: "ASSIGN_OPEN_LOADER" });
    const { dataList, id } = params;
    const { initialSelectedRow } = this.state;
    try {
      const addList = dataList
        .filter((questionId) => !initialSelectedRow?.includes(questionId))
        .map((questionId) => ({
          question_id: questionId,
          quiz_id: parseInt(id),
        }));
      if (addList.length > 0) {
        const addResponse = await QuestionsAPI.addQuizQuestion(
          {},
          { quiz_questions: addList },
        );
        if (addResponse?.payload?.status === 200) {
          Helpers.openSnackbar({
            variant: "success",
            message: addResponse?.payload?.message,
            autoHideDuration: 3000,
          });
          this.setState({ modalOpen: false });
          await this.assignHead();
        } else {
          Helpers.openSnackbar({ message: addResponse?.payload?.message });
        }
      }
    } catch (error) {}
    this.props.assignMainLayout?.({ type: "ASSIGN_CLOSE_LOADER" });
  };

  onRemove = async (params) => {
    this.props.assignMainLayout?.({ type: "ASSIGN_OPEN_LOADER" });
    const { id } = params;
    try {
      const removeResponse = await QuestionsAPI.removeQuizQuestion(
        {},
        { quiz_id: parseInt(this.state.quiz_id), question_ids: [id] },
      );
      if (removeResponse?.payload?.status === 200) {
        Helpers.openSnackbar({
          variant: "success",
          message: removeResponse?.payload?.message,
          autoHideDuration: 3000,
        });
        this.setState({ modalOpen: false });
        await this.assignHead();
      } else {
        Helpers.openSnackbar({ message: removeResponse?.payload?.message });
      }
    } catch (error) {}
    this.props.assignMainLayout?.({ type: "ASSIGN_CLOSE_LOADER" });
  };

  componentDidMount() {
    this.props.assignMainLayout?.({ type: "ASSIGN_OPEN_LOADER" });
    this.assignHead();
    this.props.assignMainLayout?.({ type: "ASSIGN_CLOSE_LOADER" });
  }

  render() {
    const {
      head,
      access,
      activeTab,
      dataQuestionsTab,
      dataQuestions,
      mainClassName,
      loading,
      modalOpen,
      head2,
    } = this.state;
    const style = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "80%",
      bgcolor: "background.paper",
      border: "2px solid #000",
      boxShadow: 24,
      p: 4,
    };
    return (
      <ContentLayout>
        <TeacherCard>
          {loading ? (
            <Skeleton width="100%" height="500px" />
          ) : (
            <Stack>
              <Typography ml={1} fontWeight={500} fontSize={24}>
                {locale(head2?.detail?.title)}
              </Typography>
              <Stack alignItems="flex-end">
                <Stack width="fit-content">
                  <Button
                    label={locale(head2?.detail?.btn)}
                    handleClick={() => this.setState({ modalOpen: true })}
                  />
                </Stack>
              </Stack>
              <Tabs
                head={dataQuestionsTab}
                value={activeTab}
                useFirstIndexAsDefaultValue={true}
                handleChange={(value) => this.setState({ activeTab: value })}
              />
              <Stack className={mainClassName + "-question "}>
                {dataQuestions?.length > 0 &&
                  dataQuestions?.map((item, index) => (
                    <Collapse
                      key={mainClassName + "-question-" + index}
                      in={activeTab == item.question_id}
                      className={
                        activeTab == item.question_id ? "active" : ""
                      }
                    >
                      <Stack
                        spacing={2}
                        justifyContent="center"
                        justifyItems="center"
                        alignItems="center"
                        sx={{ minHeight: "37rem", height: "100%" }}
                      >
                        <RichText
                          value={item?.user_question?.question}
                          hideMenuBar={true}
                          onRemove={() => this.onRemove({ id: item?.question_id })}
                        />
                      </Stack>
                    </Collapse>
                  ))}
              </Stack>
            </Stack>
          )}
          <Modal
            open={modalOpen}
            onClose={() => this.setState({ modalOpen: false })}
            aria-labelledby="keep-mounted-modal-title"
            aria-describedby="keep-mounted-modal-description"
          >
            <Box sx={style}>
              <TableEditor
                head={head}
                access={access}
                getData={this.getQuestion}
                onSave={this.onSave}
              />
            </Box>
          </Modal>
        </TeacherCard>
      </ContentLayout>
    );
  }
}

export default QuizExerciseForm;
