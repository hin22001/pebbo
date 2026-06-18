"use client";
import React, { Component } from "react";

import {
  Divider,
  FormControl,
  FormGroup,
  FormLabel,
  Stack,
  TextField,
  InputAdornment,
  Typography,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Link as MuiLink,
} from "@mui/material";

import Alert from "@/elements/alert/Alert";
import Button from "@/elements/button/Button";
import ButtonLogo from "@/elements/button/ButtonLogo";
import IconButton from "@/elements/icon/IconButton";
import ImageHandler from "@/elements/image/ImageHandler";

import HeaderCustom from "@/modules/header/HeaderCustom";
import LinkWrapper from "@/modules/link/LinkWrapper";
import nProgress from "nprogress";
import { getDataHead } from "@/app/data/head";
import { locale } from "@/app/data/locale";
import { SelectLanguage } from "@/components/sections";
import VerificationCode from "../../../sections/card/VerificationCode";
import { withAppRouter } from "@/app/utils/withAppRouter";

import { LocalData, TempData } from "@/src/app/data/local";
import { Helpers } from "@/src/app/utils";
import { Config } from "@/src/app/constant";

class FormSignIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // Use same layout grid as signup/forgot/reset so illustration + form
      // sit side-by-side on large screens and stack on mobile.
      mainClassName: "login-page-section login-page-section-form-sign-in",
      elementsId: {
        p: "6ea48596-a758-11ed-afa1-0242ac120002",
        e: "72efe0e6-a758-11ed-afa1-0242ac120002",
        cp: "7824ce50-a758-11ed-afa1-0242ac120002",
      },
      alert: {
        isOpen: false,
        message: "",
        type: "error",
      },
      dataForm: {
        field: {
          email: {
            value: "",
            message: "",
          },
          password: {
            value: "",
            message: "",
            showPassword: false,
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
            email: {
              value: "",
              message: "",
            },
            password: {
              value: "",
              message: "",
              showPassword: false,
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
        .getElementsByClassName("login-page-section")[0]
        ?.scrollIntoView();
    } catch (err) {}
  }

  async validateForm(params) {
    try {
      const {
        state: { dataForm },
        props: { head },
      } = this;

      const form = JSON.parse(
        JSON.stringify(params?.data || dataForm.field || {}),
      );

      for (let type in form) {
        const item = form[type];

        switch (type) {
          case "email":
            {
              // === Use Email Format ===

              if (item.value) {
                // const isInvalid = !Helpers.validateEmail(item.value)
                // item.message = isInvalid ? head.label.emailInvalid : ''

                const isInvalid = !item.value;
                item.message = isInvalid ? locale(head?.label.fieldIsNull) : "";
              } else {
                item.message = locale(head?.label.fieldIsNull);
              }
            }
            break;

          case "password":
            {
              // === Minimal length 8 ===
              // const isInvalid = item.value.length < 8
              // item.message = isInvalid ? head.label.errorPasswordLength : ''
            }
            break;
        }
      }

      // ==================================
      // ======= Overall Validation =======
      // ==================================

      const isButtonSubmitDisabled = Boolean(
        _.filter(_.mapValues(form, "message"), (item) => item).length,
      );

      this.setState({
        dataForm: {
          ...(dataForm || {}),
          field: {
            ...(dataForm.field || {}),
            ...(form || {}),
          },
        },
        isButtonSubmitDisabled,
      });
    } catch (err) {}
  }

  async handleEvent(type, value) {
    try {
      this.closeAlert();

      const {
        state: { dataForm, isOtp },
        props: {},
      } = this;

      try {
        const isField = type?.split("-")[0] == "field";

        if (isField) {
          const fieldName = type.split("-")[1];
          const refactorDataForm = JSON.parse(JSON.stringify(dataForm));
          refactorDataForm.field[fieldName].value = value?.target?.value;

          await this.validateForm({
            data: { [fieldName]: refactorDataForm.field[fieldName] },
          });
        }
      } catch (err) {}

      if (value?.type == "go-back") {
        this.setState({
          activeScreen: "sign-in",
        });
      }

      switch (type) {
        case "close-alert":
          {
            this.setState({
              alert: {
                isOpen: false,
                message: "",
                type: "error",
              },
            });
          }
          break;

        case "show-password":
          {
            const refactorDataForm = JSON.parse(JSON.stringify(dataForm));
            refactorDataForm.field["password"].showPassword =
              !refactorDataForm.field["password"].showPassword;

            this.setState({
              dataForm: refactorDataForm,
            });
          }
          break;

        case "go-input-code":
          {
            this.setState({
              activeScreen: "input-code",
            });
          }
          break;

        case "verification-code-submit":
          {
            if (this.props.handleEvent) {
              const response = await this.props.handleEvent({
                type: "verification-code-submit",
                value,
              });

              this.openAlert({
                message: response?.message,
                type: response?.type,
              });
            }
          }
          break;

        case "resend-verification-code":
        case "submit":
          {
            this.closeAlert();

            if (!isOtp && dataForm?.field?.password?.value === "") {
              this.openAlert({
                message: "Please input password",
                type: "error",
              });
            } else {
              if (this.props.handleEvent) {
                const data = _.mapValues(dataForm.field, "value");

                const response = await this.props.handleEvent({
                  type: "sign-in",
                  data: data,
                });

                nProgress.done();

                this.openAlert({
                  message: response?.message,
                  type: response?.type,
                });

                if (response.type == "success" && isOtp) {
                  this.setState({
                    activeScreen: "input-code",
                  });
                }
              }
            }
          }
          break;
      }
    } catch (err) {}
  }

  assignHead() {
    try {
      const head = getDataHead({
        name: "headFormSignIn",
      });

      const email = LocalData.getData("tempEmail");

      const activeScreen =
        this.props.router.query?.activeScreen ||
        this.state.activeScreen ||
        "sign-in";

      if (!email && typeof window !== "undefined") {
        this.props.router.replace(this.props.router.pathname, undefined, {
          shallow: true,
        });
      }

      this.setState({
        head,
        activeScreen,
      });
    } catch (err) {}
  }

  componentDidMount() {
    this.assignHead();
  }

  async componentDidUpdate(prevProps, prevState) {
    try {
      if (prevProps.resetForm?.formSignIn != this.props.resetForm?.formSignIn) {
        this.resetForm();
      }
    } catch (err) {}
  }

  render() {
    const {
      state: {
        mainClassName,
        dataForm,
        isButtonSubmitDisabled,
        alert,
        elementsId,
        head,
        activeScreen,
        isOtp,
      },
      props: {},
    } = this;

    const email = LocalData.getData("tempEmail");

    return (
      <>
        {head && (
          <div className="login-parent">
            <div className={mainClassName}>
              {/* <SelectLanguage
                float={true}
                usePartialRefresh={true}
              /> */}

              <div className={"block-illustration"}>
                <ImageHandler
                  src={require("@/images/illustration/login-banner.png")}
                />
              </div>

              <Stack className="block-form" maxWidth={"500px"}>
                <HeaderCustom
                  title={locale(head?.label?.signIn)}
                  disableBack={true}
                  className="block-header"
                  subtitle={locale(head?.label?.signInText)}
                />

                <div className="block-content">
                  {
                    <Alert
                      {...(alert || {})}
                      handleClose={() => {
                        this.handleEvent({
                          type: "close-alert",
                        });
                      }}
                    />
                  }

                  <Collapse
                    className={mainClassName + "-screen-sign-in"}
                    in={activeScreen == "sign-in"}
                  >
                    <FormGroup className="block-content-form">
                      <FormControl
                        error={dataForm?.field?.email?.message}
                        className="form-row"
                      >
                        <FormLabel
                          htmlFor={elementsId?.e}
                          className="form-label"
                        >
                          {locale(head?.form?.email?.label)}
                        </FormLabel>

                        <TextField
                          id={elementsId?.e}
                          type="email"
                          onChange={this.handleEvent.bind(this, "field-email")}
                          className="form-text-field"
                          value={dataForm?.field?.email?.value}
                          error={locale(dataForm?.field?.email?.message)}
                          helperText={locale(dataForm?.field?.email?.message)}
                          placeholder={locale(head?.form?.email?.placeholder)}
                          onKeyDown={(event) => {
                            if (event?.key == "Enter") {
                              this.handleEvent("submit");
                            }
                          }}
                        />
                      </FormControl>

                      {!isOtp && (
                        <FormControl
                          error={dataForm?.field?.password?.message}
                          className={"form-row"}
                        >
                          <FormLabel
                            htmlFor={elementsId?.p}
                            className="form-label"
                          >
                            {locale(head?.form?.password?.label)}
                          </FormLabel>

                          <TextField
                            id={elementsId?.p}
                            className="form-text-field"
                            onChange={this.handleEvent.bind(
                              this,
                              "field-password",
                            )}
                            value={dataForm?.field?.password?.value}
                            type={
                              dataForm?.field?.password?.showPassword
                                ? "text"
                                : "password"
                            }
                            error={locale(dataForm?.field?.password?.message)}
                            helperText={locale(
                              dataForm?.field?.password?.message,
                            )}
                            placeholder={locale(
                              head?.form?.password?.placeholder,
                            )}
                            onKeyDown={(event) => {
                              if (event?.key == "Enter") {
                                this.handleEvent("submit");
                              }
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    icon={
                                      dataForm?.field?.password?.showPassword
                                        ? "VisibilityOff"
                                        : "Visibility"
                                    }
                                    handleClick={this.handleEvent.bind(
                                      this,
                                      "show-password",
                                    )}
                                  />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </FormControl>
                      )}

                      <Stack direction="row" justifyContent="space-between">
                        <MuiLink
                          onClick={() => this.setState({ isOtp: !isOtp })}
                          color="primary"
                          underline="none"
                          className="use-link"
                        >
                          {isOtp
                            ? locale(head?.label?.usePw)
                            : locale(head?.label?.useOtp)}
                        </MuiLink>

                        {/* {!isOtp &&
                          <MuiLink
                            onClick={() => Router.push('/forgot')}
                            color='primary'
                            underline="none"
                            className='role-link'
                          >
                            {locale(head?.label?.forgot)}
                          </MuiLink>
                        } */}
                      </Stack>

                      <Button
                        handleClick={this.handleEvent.bind(this, "submit")}
                        label={locale(head.label.signInBtn)}
                      />

                      <MuiLink
                        onClick={() => this.props.router.push("/signup")}
                        underline="none"
                        className="role-link text-left"
                      >
                        {locale(head?.label?.dontHaveAccount)}{" "}
                        <span className="primary-text">
                          {locale(head?.label?.dontHaveAccountLink)}
                        </span>
                      </MuiLink>

                      {email && (
                        <>
                          <Divider />

                          <Stack alignItems={"center"}>
                            <LinkWrapper
                              className="text-link input-code"
                              handleClick={this.handleEvent.bind(
                                this,
                                "go-input-code",
                              )}
                            >
                              {locale(head?.label.orSignIn)}
                            </LinkWrapper>
                          </Stack>
                        </>
                      )}
                    </FormGroup>
                  </Collapse>

                  <Collapse
                    className={mainClassName + "-screen-input-code"}
                    in={activeScreen == "input-code"}
                  >
                    <Stack className="card">
                      <VerificationCode
                        handleEvent={async (value) =>
                          await this.handleEvent(value.type, value)
                        }
                      />
                    </Stack>
                  </Collapse>
                </div>
              </Stack>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default withAppRouter(FormSignIn);
