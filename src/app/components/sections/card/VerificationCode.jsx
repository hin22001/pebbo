import React, { Component } from "react";

import { FormControl, FormGroup, TextField } from "@mui/material";

import Alert from "@/elements/alert/Alert";
import Button from "@/elements/button/Button";
import CountDown from "@/elements/timer/CountDown";

import HeaderCustom from "@/modules/header/HeaderCustom";

import InputCode from "@/elements/input/InputCode";
import { locale } from "@/src/app/data/locale";
import { getDataHead } from "@/src/app/data/head";
import { LoginAPI } from "@/src/app/data/api";
import { LocalData } from "@/src/app/data/local";

export default class VerificationCode extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "section-card-verification-code",
      isButtonSubmitDisabled: true,
      isResendButtonActive: true,
      codeLength: 6,
      resendCount: 0,
      alert: {
        isOpen: false,
        message: "",
        type: "error",
      },
      dataForm: {
        field: {
          code: {
            value: "",
            message: "",
          },
        },
      },
    };
  }

  resetForm() {
    try {
      this.setState({
        alert: {
          isOpen: false,
          message: "",
          type: "error",
        },
        dataForm: {
          field: {
            code: {
              value: "",
              message: "",
            },
          },
        },
      });
    } catch (err) {}
  }

  closeAlert() {
    this.setState({
      alert: {
        ...this.state.alert,
        isOpen: false,
      },
    });
  }

  openAlert({ message, type = "error", headType = {} }) {
    try {
      this.setState({
        alert: {
          ...this.state.alert,
          isOpen: true,
          message: message,
          type: type,
          headType,
        },
      });

      document
        .getElementsByClassName("." + this.state.mainClassName)[0]
        ?.scrollIntoView();
    } catch (err) {}
  }

  async validateForm(params) {
    try {
      const {
        state: { dataForm, codeLength },
        props: { head },
      } = this;

      const form = params?.data;
      const isInvalid = form.code.value.length == codeLength;
      form.code.message = isInvalid ? "" : head.label.codeEmpty;

      // ==================================
      // ======= Overall Validation =======
      // ==================================

      const isButtonSubmitDisabled = !isInvalid;

      this.setState({
        isButtonSubmitDisabled,
        dataForm: {
          ...(dataForm || {}),
          field: {
            ...(dataForm.field || {}),
            ...(form || {}),
          },
        },
      });
    } catch (err) {}
  }

  async handleEvent(type, value) {
    try {
      const {
        state: { dataForm, resendCount },
        props: {},
      } = this;

      switch (type) {
        case "field-code":
          {
            const refactorDataForm = JSON.parse(JSON.stringify(dataForm));
            refactorDataForm.field["code"].value = value;

            this.validateForm({
              data: refactorDataForm.field,
            });
          }
          break;

        case "delete-code":
          {
            const refactorDataForm = JSON.parse(JSON.stringify(dataForm));
            refactorDataForm.field["code"].value = "";

            this.setState({
              dataForm: refactorDataForm,
              isButtonSubmitDisabled: true,
            });
          }
          break;

        case "resend":
          {
            await this.closeAlert();

            await this.setState({
              dataForm: {
                field: {
                  code: {
                    value: "",
                    message: "",
                  },
                },
              },
              resendCount: resendCount + 1,
              isButtonSubmitDisabled: true,
              isResendButtonActive: false,
            });

            if (this.props.handleEvent) {
              const response = await this.props.handleEvent({
                type: "resend-verification-code",
              });

              if (response?.error) {
                if (response?.error?.message) {
                  this.openAlert({
                    message: response?.error?.message,
                  });
                } else {
                  this.openAlert({
                    headType: "generalError",
                  });
                }

                this.setState({
                  dataForm: {
                    field: {
                      code: {
                        value: "",
                        message: "",
                      },
                    },
                  },
                  resendCount: resendCount + 1,
                  isButtonSubmitDisabled: true,
                  isResendButtonActive: true,
                });
              }
            }
          }
          break;

        case "countdown-finish":
          {
            this.setState({
              isResendButtonActive: true,
            });
          }
          break;

        case "go-back":
          {
            if (this.props.handleEvent) {
              this.props.handleEvent({
                type: "go-back",
              });
            }
          }
          break;

        case "submit":
          {
            this.closeAlert();

            if (this.props.handleEvent) {
              const data = _.mapValues(dataForm.field, "value");

              const response = await this.props.handleEvent({
                type: "verification-code-submit",
                data: data,
              });

              if (response?.error) {
                if (response?.error?.message) {
                  this.openAlert({
                    message: response?.error?.message,
                  });
                } else {
                  this.openAlert({
                    headType: "generalError",
                  });
                }
              }
            }
          }
          break;
      }
    } catch (err) {}
  }

  async assignHead() {
    try {
      const head = getDataHead({ name: "headVerificationCode" });

      this.setState({
        head,
      });
    } catch (err) {}
  }

  componentDidMount() {
    this.assignHead();
  }

  componentDidUpdate(prevProps, prevState) {}

  componentDidCatch(err, errinfo) {}

  render() {
    const {
      state: {
        mainClassName,
        dataForm,
        isButtonSubmitDisabled,
        alert,
        codeLength,
        isResendButtonActive,
        resendCount,
        head,
      },
      props: {},
    } = this;

    const email = LocalData.getData("tempEmail");

    return (
      <>
        {head && (
          <div className={mainClassName}>
            <HeaderCustom
              title={locale(head.title)}
              subtitle={email && locale(head.label.subtitle, { email: email })}
              className="block-header"
              handleBack={this.handleEvent.bind(this, "go-back")}
            />

            <div className="block-content">
              {<Alert {...(alert || {})} />}

              <FormGroup className="block-content-form">
                <FormControl
                  error={dataForm?.field?.code?.message}
                  className="form-row"
                >
                  <InputCode
                    className="form-text-field"
                    type="password"
                    onComplete={this.handleEvent.bind(this, "field-code")}
                    onDeleteCode={this.handleEvent.bind(this, "delete-code")}
                    reset={resendCount}
                    length={codeLength}
                  />
                </FormControl>

                {email && (
                  <div className="text-detail-message">
                    <span>{locale(head.label.notRecieveCode)}</span>
                    <span className="text-resend">
                      <a
                        className={
                          "text-link " +
                          (isResendButtonActive ? "" : "disabled")
                        }
                        onClick={
                          isResendButtonActive
                            ? this.handleEvent.bind(this, "resend")
                            : () => null
                        }
                      >
                        <b>{locale(head.label.resend)}</b>
                      </a>
                      {!isResendButtonActive && (
                        <>
                          <span>{locale(head.label.in)}</span>
                          <CountDown
                            type="dateTime"
                            format="(mm:ss)"
                            targetTime={
                              new Date(new Date().getTime() + 1 * 60000)
                            } // === add 1 minutes ===
                            handleFinish={this.handleEvent.bind(
                              this,
                              "countdown-finish",
                            )}
                          />
                        </>
                      )}
                    </span>
                  </div>
                )}

                <Button
                  disabled={isButtonSubmitDisabled}
                  theme="thick"
                  handleClick={this.handleEvent.bind(this, "submit")}
                  headType={"submit"}
                />
              </FormGroup>
            </div>
          </div>
        )}
      </>
    );
  }
}
