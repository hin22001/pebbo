"use client";

import React, { Component } from "react";
import _ from "lodash";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import { StudentCard } from "@/app/components/modules";
import { getDataHead } from "@/app/data/head";
import QuestionsAPI from "@/app/data/api/QuestionsAPI";
import { locale } from "@/locale";
import Helpers from "@/app/utils/Helpers";
import { Button, Skeleton, Tabs } from "@/app/components/elements";
import { RichText } from "@/app/components/sections";
import { Stack, Collapse, Typography } from "@mui/material";
import ClassAPI from "@/app/data/api/ClassAPI";
import dayjs from "dayjs";
import UserAPI from "@/app/data/api/UserAPI";

/**
 * Classroom student quiz — expects props.router (with push) and props.assignMainLayout.
 * Used by both Pages Router and App Router via wrapper.
 */
export default class ClassroomStudentQuiz extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataQuestionsTab: [],
      mainClassName: "template-question-page",
      loading: true,
      modalOpen: false,
    };

    this.refRichText = {};
    this.submitAnswers = this.submitAnswers.bind(this);
  }

  async assignHead() {
    this.setState({ loading: true });

    try {
      const head = getDataHead({
        name: "headQuizExercise",
      });

      const url = typeof window !== "undefined" ? window.location.search : "";
      const params = new URLSearchParams(url);
      const id = params.get("id");
      const quiz_id = params.get("quiz_id");

      const resQuiz = await ClassAPI.getQuizClassroom(
        {
          classroom_id: id,
          quiz_id,
          page_number: 1,
          rows_per_page: 1,
          order: "asc",
        },
        [],
      );

      const startDate = resQuiz?.payload?.data?.classroomQuizzes[0]?.start_date;
      const endDate = resQuiz?.payload?.data?.classroomQuizzes[0]?.end_date;

      const resQuest = await QuestionsAPI.getStudentQuizQuestions(
        {
          classroom_id: id,
          quiz_id,
        },
        [],
      );

      const dataQuest = resQuest?.payload?.data?.questions;
      let disableAnswer = dataQuest?.some(
        (question) => question.user_answers !== null,
      );

      const currentDate = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (currentDate < start || currentDate > end) {
        disableAnswer = true;
      }

      const dataQuestionsTab = dataQuest?.map((item, index) => {
        return {
          id: item.question_id,
          label: "Q" + (index + 1),
          no: index + 1,
        };
      });

      let dataTime = [];
      const activeTab = dataQuestionsTab[0]?.id;

      const dataAnswer = Helpers.structuredClone(dataQuest)?.flatMap((item) => {
        dataTime.push({
          id: item?.id,
          timeStart: item?.id == activeTab ? dayjs() : null,
          timeEnd: null,
        });
        return {
          ...(item || {}),
          time_taken: item?.time_taken || 0,
        };
      });

      this.setState({
        dataQuestions: dataQuest,
        dataQuestionsTab,
        activeTab,
        quiz_id: id,
        head,
        disableAnswer,
        dataAnswer,
        dataTime,
      });
    } catch (err) {}

    this.setState({ loading: false });
  }

  async assignDataAnswer(newActiveTab, newValue) {
    try {
      const {
        state: { dataAnswer },
      } = this;

      const activeTab = newActiveTab || this.state.activeTab;

      let foundIndex = dataAnswer.findIndex(
        (item) => item.question_id == activeTab,
      );

      const value =
        newValue ||
        (_.has(this.refRichText, activeTab)
          ? this.refRichText[activeTab]
          : dataAnswer[foundIndex]?.question);

      if (value) {
        let isInvalid = false;

        const arrAnswer = Helpers.getAttributeRichText(value);

        let refactorDataAnswer = [...(dataAnswer || [])];

        const sliceUnit = (unit, label) => {
          if (unit) {
            return label.replace(" " + unit, "");
          }
          return label;
        };

        if (foundIndex >= 0) {
          const refactorArrAnswer = arrAnswer?.map((item) => {
            let refactorItem = {};
            const val = item?.attrs?.value;

            const unit = item?.attrs?.unit;

            if (val) {
              switch (item?.type) {
                case "DropdownReactComponent": {
                  const isArray = Array.isArray(val);
                  refactorItem = {
                    answers: isArray
                      ? val?.flatMap((item) => sliceUnit(unit, item.label))
                      : [sliceUnit(unit, val?.label)],
                    attrs: item?.attrs,
                  };
                  break;
                }
                case "TextFieldReactComponent": {
                  refactorItem = {
                    answers: [val],
                    attrs: item?.attrs,
                  };
                  break;
                }
                case "FractionReactComponent": {
                  refactorItem = {
                    answers: [val],
                    attrs: item?.attrs,
                  };
                  break;
                }
                default:
                  break;
              }
            } else {
              isInvalid = true;
              return null;
            }

            return refactorItem;
          });

          if (refactorArrAnswer?.length > 0) {
            refactorDataAnswer[foundIndex]["answer"] = refactorArrAnswer;
          }

          isInvalid = false;
          refactorDataAnswer[foundIndex]["isInvalid"] = isInvalid;

          if (isInvalid) {
            Helpers.openSnackbar({
              name: "incompleteForm",
            });
          }
        } else {
          isInvalid = true;
        }

        this.setState({
          dataAnswer: refactorDataAnswer,
          isInvalid,
        });

        return {
          dataAnswer: refactorDataAnswer,
          isInvalid,
        };
      }

      return null;
    } catch (err) {}
  }

  getTimeDuration(dataTime, lastQuestion) {
    try {
      const newDataTime = dataTime?.map((item) => {
        let duration = 0;

        if (item?.timeEnd?.diff) {
          duration = item?.timeEnd.diff(item?.timeStart, "seconds");
        }

        if (item?.id == lastQuestion) {
          duration = dayjs().diff(item?.timeStart, "seconds") || 0;
        }

        return {
          ...item,
          duration,
        };
      });

      return newDataTime;
    } catch (err) {}
  }

  async submitAnswers() {
    const { activeTab } = this.state;
    const { dataAnswer } = await this.assignDataAnswer(activeTab);

    const dataTime = this.getTimeDuration(this.state.dataTime, activeTab);

    const refactorData = dataAnswer.map((item) => {
      const timeTaken = dataTime?.find((tt) => tt.id == item?.id)?.duration;

      return {
        question_id: item?.question_id,
        user_answers: item?.answer?.map((b) => ({
          answers: b?.answers || [""],
        })) || [{ answers: [""] }],
        time_taken: timeTaken,
      };
    });

    const url = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(url);
    const id = params.get("id");
    const quiz_id = params.get("quiz_id");

    const body = {
      classroom_id: id,
      quiz_id: quiz_id,
      all_answers: refactorData,
    };

    const res = await QuestionsAPI.quizSubmitAnswers({}, body);

    if (res?.payload?.status === 200) {
      Helpers.openSnackbar({
        variant: "success",
        message: res?.payload?.message,
        autoHideDuration: 3000,
      });

      const todayStr = new Date().toISOString().split("T")[0];
      UserAPI.postUpdateTodos([`quiz_${quiz_id}`], todayStr).catch((e) =>
        console.error("Failed to sync quiz todo:", e),
      );

      const router = this.props.router;
      if (router?.push) {
        router.push(`/classroom/student/detail?id=${id}`);
      }
    } else {
      Helpers.openSnackbar({ message: res?.message });
    }
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

    const contentMain = document.querySelector(".main-layout-content-main");
    if (contentMain) {
      this.contentMainFallbackScroll = contentMain.style.overflow;
      contentMain.style.overflow = "hidden";
    }
  }

  componentWillUnmount() {
    const contentMain = document.querySelector(".main-layout-content-main");
    if (contentMain) {
      contentMain.style.overflow = this.contentMainFallbackScroll || "auto";
    }
  }

  render() {
    const {
      state: {
        activeTab,
        dataQuestionsTab,
        dataQuestions,
        mainClassName,
        loading,
        head,
        disableAnswer,
      },
    } = this;

    const no = dataQuestionsTab?.find((val) => val?.id === activeTab)?.no;

    return (
      <ContentLayout>
        <StudentCard>
          {loading ? (
            <Skeleton width="100%" height="500px" />
          ) : (
            <Stack>
              <Typography ml={1} fontWeight={500} fontSize={24}>
                {locale(head?.detail?.title)}
              </Typography>
              <Typography ml={1} fontWeight={300} fontSize={14}>
                {locale(head?.detail?.questionId)}:{" "}
                {dataQuestionsTab?.find((val) => val?.id === activeTab)?.id}
              </Typography>
              {!disableAnswer && (
                <Stack justifyContent="flex-end" flexDirection="row">
                  {no > 1 && (
                    <Stack width="fit-content" mr={2}>
                      <Button
                        label={locale(head?.detail?.prev)}
                        handleClick={() => {
                          this.setState({
                            activeTab: dataQuestionsTab[no - 2]?.id,
                          });
                        }}
                        theme="secondary"
                      />
                    </Stack>
                  )}
                  {no < dataQuestions?.length ? (
                    <Stack width="fit-content">
                      <Button
                        label={locale(head?.detail?.next)}
                        handleClick={async () => {
                          await this.assignDataAnswer(activeTab);
                          this.setState({
                            activeTab: dataQuestionsTab[no]?.id,
                          });
                        }}
                      />
                    </Stack>
                  ) : (
                    <Stack width="fit-content">
                      <Button
                        label={locale(head?.detail?.submit)}
                        handleClick={this.submitAnswers}
                      />
                    </Stack>
                  )}
                </Stack>
              )}
              <Tabs
                head={dataQuestionsTab}
                value={activeTab}
                useFirstIndexAsDefaultValue={true}
                handleChange={async (value) => {
                  await this.assignDataAnswer(activeTab);
                  this.setState({
                    activeTab: value,
                  });
                }}
              />
              <Stack className={mainClassName + "-question "}>
                {dataQuestions?.length > 0 &&
                  dataQuestions?.map((item, index) => {
                    return (
                      <Collapse
                        key={mainClassName + "-question-" + index}
                        in={activeTab == item.question_id}
                        className={
                          activeTab == item.question_id ? "active" : ""
                        }
                      >
                        <Stack
                          spacing={2}
                          justifyContent={"center"}
                          justifyItems={"center"}
                          alignItems={"center"}
                          sx={{
                            minHeight: "37rem",
                            height: "100%",
                          }}
                        >
                          <RichText
                            value={item?.question_object}
                            hideMenuBar={true}
                            readOnly={true}
                            refEditor={(instance) =>
                              item.question_id == activeTab
                                ? (this.refRichText[item.question_id] =
                                    instance?.getJSON())
                                : (this.refRichText = {})
                            }
                          />
                        </Stack>
                      </Collapse>
                    );
                  })}
              </Stack>
            </Stack>
          )}
        </StudentCard>
      </ContentLayout>
    );
  }
}
