"use client";
import React, { Component } from "react";

import {
  FormControl,
  FormGroup,
  FormLabel,
  Stack,
  TextField,
  InputAdornment,
  Collapse,
  Link as MuiLink,
  Typography,
  MenuItem,
} from "@mui/material";
import Alert from "@/elements/alert/Alert";
import Button from "@/elements/button/Button";
import IconButton from "@/elements/icon/IconButton";
import ImageHandler from "@/elements/image/ImageHandler";
import HeaderCustom from "@/modules/header/HeaderCustom";
import nProgress from "nprogress";
import { getDataHead } from "@/app/data/head";
import { locale } from "@/app/data/locale";
import { SelectLanguage } from "@/components/sections";
import { LocalData } from "@/src/app/data/local";
import { Helpers } from "@/src/app/utils";
import { Config } from "@/src/app/constant";
import { withAppRouter } from "@/app/utils/withAppRouter";

class FormSignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "login-page-section login-page-section-form-sign-in",
      isButtonSubmitDisabled: true,
      activeScreen: "sign-in",
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
          first_name: {
            value: "",
            message: "",
          },
          last_name: {
            value: "",
            message: "",
          },
          email: {
            value: "",
            message: "",
          },
          password: {
            value: "",
            message: "",
            showPassword: false,
          },
          password2: {
            value: "",
            message: "",
            showPassword: false,
          },
          referral_code: {
            value: "",
            message: "",
          },
          year: {
            value: "2",
            message: "",
          },
        },
      },
      plan: 1,
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
            first_name: {
              value: "",
              message: "",
            },
            last_name: {
              value: "",
              message: "",
            },
            email: {
              value: "",
              message: "",
            },
            password: {
              value: "",
              message: "",
              showPassword: false,
            },
            password2: {
              value: "",
              message: "",
              showPassword: false,
            },
            referral_code: {
              value: "",
              message: "",
            },
            year: {
              value: "2",
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
              if (item.value) {
                const isInvalid = !item.value;
                item.message = isInvalid ? locale(head?.label.fieldIsNull) : "";
              } else {
                item.message = locale(head?.label.fieldIsNull);
              }
            }
            break;
          case "password":
            {
              // Minimal length validation can be added here if needed
            }
            break;
        }
      }

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
        state: { dataForm, plan },
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

        case "submit":
          {
            this.closeAlert();
            if (this.props.handleEvent) {
              let data = _.mapValues(dataForm.field, "value");
              data = {
                ...data,
                subscription_type: plan === 1 ? "annually" : "monthly",
              };

              if (data?.referral_code?.length > 0) {
              } else {
                data = { ...data, referred_by: null };
              }

              // Added for new onboarding flow
              data = { ...data, skip_payment: true };

              if (data?.password === data?.password2) {
                delete data?.referral_code;
                delete data?.password2;

                const response = await this.props.handleEvent({
                  type: "sign-up",
                  data: data,
                });
                nProgress.done();
                setTimeout(() => {
                  if (response?.payload?.data?.url) {
                    localStorage.setItem(
                      "subscribeUrl",
                      response?.payload?.data?.url,
                    );
                    window.open(response?.payload?.data?.url, "_blank");
                  }

                  if (response?.status === 200) {
                    this.openAlert({
                      message: response?.payload?.message,
                      type: "success",
                    });
                    this.props.router.push("/onboarding/placement");
                  } else {
                    this.openAlert({
                      message: response?.message,
                      type: "error",
                    });
                  }
                }, 1);
                this.resetForm();
              } else {
                this.openAlert({
                  message: "Password didn't match",
                  type: "error",
                });
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
    this.populateReferralCode();
  }

  componentDidUpdate(prevProps, prevState) {
    try {
      if (prevProps.resetForm?.formSignIn != this.props.resetForm?.formSignIn) {
        this.resetForm();
      }
    } catch (err) {}
  }

  populateReferralCode() {
    const inviteCode = this.props.router.query?.invite;

    if (inviteCode) {
      this.setState((prevState) => ({
        dataForm: {
          ...prevState.dataForm,
          field: {
            ...prevState.dataForm.field,
            referral_code: {
              ...prevState.dataForm.field.referral_code,
              value: inviteCode,
            },
          },
        },
      }));
    }
  }

  render() {
    const {
      state: {
        mainClassName,
        dataForm,
        alert,
        elementsId,
        head,
        activeScreen,
        plan,
      },
      props: {},
    } = this;

    return (
      <>
        {head && (
          <div className="login-parent">
            <div className={mainClassName}>
              <Stack className={"subscribe"}>
                <Stack width={"100%"} gap={"1rem"}>
                  <Typography
                    className={"subscribe-title"}
                    sx={{
                      fontFamily: "'Advercase', serif !important",
                      letterSpacing: "0.07rem",
                    }}
                  >
                    {locale(head?.subscribe?.selectPlan)}
                  </Typography>
                  <Stack>
                    <Stack className={"subscribe-plan"}>
                      <Stack
                        className={`subscribe-plan-${plan === 1 ? "active1" : "inactive"}`}
                        onClick={() => this.setState({ plan: 1 })}
                      >
                        <Typography
                          className={`subscribe-plan-txt-${plan === 1 ? "active" : "inactive"}`}
                        >
                          {locale(head?.subscribe?.annually)}
                        </Typography>
                      </Stack>
                      <Stack
                        className={`subscribe-plan-${plan === 2 ? "active2" : "inactive"}`}
                        onClick={() => this.setState({ plan: 2 })}
                      >
                        <Typography
                          className={`subscribe-plan-txt-${plan === 2 ? "active" : "inactive"}`}
                        >
                          {locale(head?.subscribe?.monthly)}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack className={"subscribe-plan-content"}>
                      <Stack
                        className={`subscribe-plan-content-wrapper${plan === 1 ? "-outer1" : "-outer2"}`}
                      >
                        <Stack
                          className={`subscribe-plan-content-wrapper-card-${plan}`}
                        >
                          <Stack
                            width={"100%"}
                            height={"100%"}
                            alignItems={"center"}
                            justifyContent={"center"}
                            gap={"2px"}
                          >
                            <Typography
                              className={
                                "subscribe-plan-content-wrapper-card-txt"
                              }
                              fontStyle="italic"
                              fontWeight={400}
                            >
                              {locale(head?.subscribe?.now)}
                            </Typography>
                            <Typography
                              className={
                                "subscribe-plan-content-wrapper-card-txt"
                              }
                              fontStyle="italic"
                              color={plan === 2 ? "#8264FF" : "#FF5000"}
                              fontWeight={400}
                              sx={{
                                textDecoration: "line-through",
                                fontFamily: "'Advercase', serif !important",
                              }}
                            >
                              HKD {plan === 2 ? "$149" : "$1140"}
                            </Typography>
                            <Typography
                              className={
                                "subscribe-plan-content-wrapper-card-txt"
                              }
                              fontStyle="italic"
                              fontWeight={600}
                              sx={{
                                fontFamily: "'Advercase', serif !important",
                              }}
                            >
                              HKD {plan === 2 ? "$89" : "$488"}
                            </Typography>
                            <Typography
                              className={
                                "subscribe-plan-content-wrapper-card-txt3"
                              }
                              fontStyle="italic"
                              fontWeight={600}
                              sx={{
                                fontFamily: "'Advercase', serif !important",
                              }}
                            >
                              {plan === 2 ? "30" : "365"}{" "}
                              {locale(head?.subscribe?.days)}{" "}
                              <span style={{ fontWeight: 400 }}>
                                {locale(head?.subscribe?.for)}
                              </span>{" "}
                              <span style={{ fontStyle: "normal" }}>
                                {plan === 2 ? "$89" : "488"}
                              </span>
                            </Typography>
                            <Typography
                              className={
                                "subscribe-plan-content-wrapper-card-txt"
                              }
                              fontStyle="italic"
                            >
                              {locale(head?.subscribe?.just)}{" "}
                              <span style={{ fontWeight: "bold" }}>
                                {plan === 2 ? "$3" : "$1.3"}
                              </span>{" "}
                              {locale(head?.subscribe?.perDay)}
                            </Typography>
                            <Typography
                              className={
                                "subscribe-plan-content-wrapper-card-txt2"
                              }
                              mt={2}
                              color={plan === 2 ? "#8264FF" : "#FF5000"}
                            >
                              ({locale(head?.subscribe?.cancellation)})
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>

              <Stack className="block-form" maxWidth={"500px"}>
                <HeaderCustom
                  title={locale(head.label.signUp)}
                  disableBack={true}
                  className="block-header"
                  subtitle={locale(head?.label?.signUpText)}
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
                        error={dataForm?.field?.first_name?.message}
                        className="form-row"
                      >
                        <FormLabel
                          htmlFor={elementsId?.e}
                          className="form-label"
                        >
                          {locale(head?.form?.first_name?.label)}
                        </FormLabel>

                        <TextField
                          id={elementsId?.e}
                          type="text"
                          onChange={this.handleEvent.bind(
                            this,
                            "field-first_name",
                          )}
                          className="form-text-field"
                          value={dataForm?.field?.first_name?.value}
                          error={Boolean(dataForm?.field?.first_name?.message)}
                          helperText={locale(
                            dataForm?.field?.first_name?.message,
                          )}
                          placeholder={locale(
                            head?.form?.first_name?.placeholder,
                          )}
                          onKeyDown={(event) => {
                            if (event?.key == "Enter") {
                              this.handleEvent("submit");
                            }
                          }}
                        />
                      </FormControl>

                      <FormControl
                        error={dataForm?.field?.last_name?.message}
                        className="form-row"
                      >
                        <FormLabel
                          htmlFor={elementsId?.e}
                          className="form-label"
                        >
                          {locale(head?.form?.last_name?.label)}
                        </FormLabel>

                        <TextField
                          id={elementsId?.e}
                          type="text"
                          onChange={this.handleEvent.bind(
                            this,
                            "field-last_name",
                          )}
                          className="form-text-field"
                          value={dataForm?.field?.last_name?.value}
                          error={locale(dataForm?.field?.last_name?.message)}
                          helperText={locale(
                            dataForm?.field?.last_name?.message,
                          )}
                          placeholder={locale(
                            head?.form?.last_name?.placeholder,
                          )}
                          onKeyDown={(event) => {
                            if (event?.key == "Enter") {
                              this.handleEvent("submit");
                            }
                          }}
                        />
                      </FormControl>

                      <FormControl className="form-row">
                        <FormLabel className="form-label">
                          {locale(head?.form?.year?.label) || "Grade"}
                        </FormLabel>

                        <TextField
                          select
                          className="form-text-field"
                          onChange={this.handleEvent.bind(this, "field-year")}
                          value={dataForm?.field?.year?.value || "2"}
                        >
                          <MenuItem value="1">Year 1</MenuItem>
                          <MenuItem value="2">Year 2</MenuItem>
                          <MenuItem value="3">Year 3</MenuItem>
                          <MenuItem value="4">Year 4</MenuItem>
                          <MenuItem value="5">Year 5</MenuItem>
                          <MenuItem value="6">Year 6</MenuItem>
                        </TextField>
                      </FormControl>

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
                          error={Boolean(dataForm?.field?.email?.message)}
                          helperText={locale(dataForm?.field?.email?.message)}
                          placeholder={locale(head?.form?.email?.placeholder)}
                          onKeyDown={(event) => {
                            if (event?.key == "Enter") {
                              this.handleEvent("submit");
                            }
                          }}
                        />
                      </FormControl>

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

                      <FormControl
                        error={dataForm?.field?.password?.message}
                        className={"form-row"}
                      >
                        <FormLabel
                          htmlFor={elementsId?.p}
                          className="form-label"
                        >
                          {locale(head?.form?.password2?.label)}
                        </FormLabel>

                        <TextField
                          id={elementsId?.p}
                          className="form-text-field"
                          onChange={this.handleEvent.bind(
                            this,
                            "field-password2",
                          )}
                          value={dataForm?.field?.password2?.value}
                          type={
                            dataForm?.field?.password?.showPassword
                              ? "text"
                              : "password"
                          }
                          error={locale(dataForm?.field?.password2?.message)}
                          helperText={locale(
                            dataForm?.field?.password2?.message,
                          )}
                          placeholder={locale(
                            head?.form?.password2?.placeholder,
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

                      <div className={"pebbo-img"}>
                        <ImageHandler
                          src={require("@/images/illustration/pebbo.svg")}
                        />
                      </div>

                      <FormControl
                        error={dataForm?.field?.referral_code?.message}
                        className="form-row"
                      >
                        <FormLabel
                          htmlFor={elementsId?.e}
                          className="form-label"
                        >
                          {locale(head?.form?.referral_code?.label)}
                        </FormLabel>

                        <TextField
                          id={elementsId?.e}
                          type="text"
                          onChange={this.handleEvent.bind(
                            this,
                            "field-referral_code",
                          )}
                          className="form-text-field"
                          value={dataForm?.field?.referral_code?.value}
                          error={locale(
                            dataForm?.field?.referral_code?.message,
                          )}
                          helperText={locale(
                            dataForm?.field?.referral_code?.message,
                          )}
                          placeholder={locale(
                            head?.form?.referral_code?.placeholder,
                          )}
                        />
                      </FormControl>

                      <Button
                        handleClick={this.handleEvent.bind(this, "submit")}
                        label={locale(head.label.signUp)}
                      />

                      <MuiLink
                        onClick={() => this.props.router.push("/login")}
                        color="primary"
                        underline="none"
                        className="role-link"
                      >
                        {locale(head?.label?.haveAccount)}{" "}
                        <span className="primary-text">
                          {locale(head?.label?.signInBtn)}
                        </span>
                      </MuiLink>
                    </FormGroup>
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

export default withAppRouter(FormSignUp);
