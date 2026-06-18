import React, { Component } from "react";
import FormGenerator from "@/modules/form/FormGenerator";
import NoticeCard from "@/modules/card/NoticeCard";
import Stepper from "@/modules/stepper/Stepper";
import { Collapse, Paper, Stack, Typography, Skeleton } from "@mui/material";
import { getLabel, locale } from "@/src/app/data/locale";
import Button from "@/elements/button/Button";
import { Config } from "@/src/app/constant";
import { Helpers } from "@/src/app/utils";
import { RichText } from "../../../sections";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import { connect } from "react-redux";

class QuestionForms extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-question-forms",
      activeStep: 0, // index => start from 0
      valuesQuestionType: {},
      valuesEn: {},
      valuesZh: {},
    };

    this.refFormGeneratorEn = React.createRef();
    this.refFormGeneratorZh = React.createRef();
    this.refEditorEn = React.createRef();
    this.refEditorZh = React.createRef();
  }

  async handleEvent(params) {
    try {
      const {
        state: { activeStep, valuesQuestionType, valuesEn, valuesZh },

        props: { head, type, initialValuesQuestionType },
      } = this;

      const header = head?.header?.type[type];

      switch (params?.type) {
        case "form-value-en":
          {
            if (params?.formType == "questionType") {
              const refactorValues = {
                ...(valuesQuestionType | {}),
                ...(params?.value?.formikValues || {}),
              };

              this.setState({
                valuesQuestionType: refactorValues,
              });
            } else {
              const refactorValues = {
                ...(valuesEn | {}),
                ...(params?.value || {}),
              };

              this.setState({
                valuesEn: refactorValues,
              });
            }
          }
          break;
        case "form-value-zh":
          {
            const refactorValues = {
              ...(valuesZh | {}),
              ...(params?.value || {}),
            };

            this.setState({
              valuesZh: refactorValues,
            });
          }
          break;

        case "prev-button":
          {
            this.setState({
              activeStep: activeStep - 1,
            });
          }
          break;

        case "submit":
          {
            const activeStepId = header?.steps[activeStep]?.id;

            if (activeStepId == "form") {
              await this.props.assignMainLayout({
                type: "ASSIGN_OPEN_LOADER",
              });

              const formEn = _.isEmpty(valuesEn)
                ? this.refEditorEn.getJSON()
                : valuesEn;

              const formZh = null; //_.isEmpty(valuesZh) ? this.refEditorZh.getJSON()  : valuesZh

              const bodyValue = {
                valuesQuestionType: _.isEmpty(valuesQuestionType)
                  ? initialValuesQuestionType
                  : valuesQuestionType,
                valuesEn: formEn,
                valuesZh: formZh,
              };

              // api hit
              const response = await this.props.postQuestions(bodyValue);

              if (response?.success) {
                this.setState({
                  activeStep: activeStep + 1,
                });
              }

              await this.props.assignMainLayout({
                type: "ASSIGN_CLOSE_LOADER",
              });
            } else {
              this.setState({
                activeStep: activeStep + 1,
              });
            }
          }
          break;
      }
    } catch (err) {}
  }

  async componentDidMount() {}

  render() {
    const {
      state: { mainClassName, activeStep },
      props: {
        head,
        access,
        type,
        questionFormZh,
        questionFormEn,
        mutable,
        isEdit,
      },
    } = this;

    const header = head?.header?.type[type];
    const activeStepId = header?.steps[activeStep]?.id;

    return (
      <>
        {head ? (
          access ? (
            <Stack component="main" className={mainClassName} spacing={3}>
              <Stack className={mainClassName + "-header"} spacing={2}>
                <Typography
                  className={mainClassName + "-title text-h1"}
                  variant="h2"
                  component="h1"
                >
                  {locale(header?.title)}
                </Typography>
                <Typography
                  className={mainClassName + "-subtitle"}
                  variant="body1"
                  component="p"
                >
                  {locale(header?.subtitle)}
                </Typography>
                <Stepper steps={header?.steps} activeStep={activeStep} />
              </Stack>

              <Stack className={mainClassName + "-body"} spacing={3}>
                {Object.keys(head?.forms || {}).map((item, index) => {
                  const isSplitScreen = head?.forms[item]?.splitScreen;

                  let form, formZh;

                  // if (isSplitScreen) {

                  //   if (type == 'add') {

                  //     form = {
                  //       title: locale(head?.forms[item]?.splitScreen?.en?.title),
                  //       forms: head?.forms[item]?.forms
                  //     }

                  //     formZh = {
                  //       title: locale(head?.forms[item]?.splitScreen?.zh?.title),
                  //       forms: head?.forms[item]?.forms
                  //     }

                  //   }
                  //   else if (type == 'edit') {

                  //     form = {
                  //       title: locale(head?.forms[item]?.splitScreen?.en?.title),
                  //       forms: questionFormEn,
                  //     }

                  //     formZh = {
                  //       title: locale(head?.forms[item]?.splitScreen?.zh?.title),
                  //       forms: questionFormZh,
                  //     }

                  //   }

                  // }
                  // else {
                  form = {
                    title: "Question Type",
                    forms: head?.forms[item]?.forms,
                  };
                  // }

                  return (
                    <Collapse
                      in={activeStep == index}
                      className={activeStep == index ? "active" : ""}
                      key={"question-form-" + index}
                    >
                      <Stack spacing={3} alignItems={"center"}>
                        <Stack
                          direction={"row"}
                          spacing={2}
                          padding={"0rem 1rem"}
                        >
                          <Stack
                            className="card"
                            justifyContent={"start"}
                            spacing={1}
                          >
                            {item == "questionType" ? (
                              <FormGenerator
                                refFormGenerator={(instance) => {
                                  this.refFormGeneratorEn = instance;
                                }}
                                getFormNestedValue={async (value) => {
                                  if (item != "questionType") {
                                    await this.handleEvent({
                                      type: "form-value-en",
                                      formType: item,
                                      value,
                                    });
                                  }
                                }}
                                onChangeValue={async (value) => {
                                  if (item == "questionType") {
                                    await this.handleEvent({
                                      type: "form-value-en",
                                      formType: item,
                                      value,
                                    });
                                  }
                                }}
                                title={form?.title}
                                head={form?.forms}
                                hideButtonSubmit={true}
                                handleEvent={(params) =>
                                  this.handleEvent(params)
                                }
                              />
                            ) : (
                              <RichText
                                title={form?.title}
                                value={questionFormEn}
                                refEditor={(instance) =>
                                  (this.refEditorEn = instance)
                                }
                              />
                            )}
                          </Stack>
                          {isSplitScreen && (
                            <Stack
                              className="card"
                              justifyContent={"start"}
                              spacing={1}
                            >
                              <RichText
                                title={formZh?.title}
                                value={questionFormZh}
                                refEditor={(instance) =>
                                  (this.refEditorZh = instance)
                                }
                              />
                            </Stack>
                          )}
                        </Stack>
                      </Stack>
                    </Collapse>
                  );
                })}
                <Collapse
                  in={activeStepId == "finish"}
                  className={activeStepId == "finish" ? "active" : ""}
                >
                  <Stack justifyContent={"center"}>
                    <NoticeCard headType={"formSubmitted"} />
                  </Stack>
                </Collapse>

                <Stack
                  direction={"row"}
                  spacing={2}
                  justifyContent={"center"}
                  sx={{ paddingBottom: "3rem" }}
                >
                  {activeStep != 0 && (
                    <Button
                      label={getLabel({ name: "prev" })}
                      handleClick={() =>
                        this.handleEvent({
                          type: "prev-button",
                        })
                      }
                      theme="secondary thick wide"
                    />
                  )}
                  {activeStepId == "form" && (mutable || !isEdit) && (
                    <Button
                      label={getLabel({ name: "submit" })}
                      handleClick={() =>
                        this.handleEvent({
                          type: "submit",
                        })
                      }
                      theme="primary thick wide"
                    />
                  )}
                  {activeStepId != "finish" && activeStepId != "form" && (
                    <Button
                      label={getLabel({ name: "next" })}
                      handleClick={() =>
                        this.handleEvent({
                          type: "submit",
                        })
                      }
                      theme="primary thick wide"
                    />
                  )}
                  {activeStepId == "finish" ||
                  (!mutable && isEdit && activeStepId == "form") ? (
                    <Button
                      label={getLabel({ name: "finish" })}
                      href={"/user-questions/teacher"}
                      theme="primary thick wide"
                    />
                  ) : (
                    <></>
                  )}
                </Stack>
              </Stack>
            </Stack>
          ) : (
            <NoticeCard headType="accessDenied" />
          )
        ) : (
          <Skeleton type="dashboard" row={3} />
        )}
      </>
    );
  }
}

export default connect(null, { assignMainLayout })(QuestionForms);
