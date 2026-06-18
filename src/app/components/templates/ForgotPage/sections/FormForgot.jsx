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
import { Config } from "@/src/app/constant";
import { withAppRouter } from "@/app/utils/withAppRouter";

class FormForgot extends Component {
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
          email: {
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
            email: {
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
        state: { dataForm },
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

        case "submit":
          {
            this.closeAlert();

            // if (this.props.handleEvent) {

            //   const data = _.mapValues(dataForm.field, 'value')

            //   if (data?.password === data?.password2) {

            //     const response = await this.props.handleEvent({
            //       type: 'sign-up',
            //       data: data
            //     })

            //     nProgress.done()

            //     setTimeout(() => {
            //       this.openAlert({
            //         message: response?.status === 200 ? response?.payload?.message : response?.message,
            //         type: response?.status === 200 ? 'success' : 'error',
            //       })
            //     }, 1);

            //     this.resetForm()

            //   } else {
            //     this.openAlert({
            //       message: "Password didn't match",
            //       type: 'error'
            //     })
            //   }

            // }
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

      if (!email) {
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
      state: { mainClassName, dataForm, alert, elementsId, head, activeScreen },
      props: {},
    } = this;

    return (
      <>
        {head && (
          <div className={mainClassName}>
            <SelectLanguage float={true} usePartialRefresh={true} />

            <div className={"block-illustration-teacher"}>
              <ImageHandler
                src={require("@/images/illustration/illustration-mascot.png")}
              />
            </div>

            <Stack className="block-form" maxWidth={"500px"}>
              <HeaderCustom
                title={locale(head.label.forgotTitle)}
                disableBack={true}
                className="block-header"
                image={Config.logo}
                imageHref={Helpers.hrefLocale("/")}
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
                      <FormLabel htmlFor={elementsId?.e} className="form-label">
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

                    <Button
                      handleClick={this.handleEvent.bind(this, "submit")}
                      label={locale(head.label.sendEmail)}
                    />

                    <MuiLink
                      // onClick={() => Router.push('/login')}
                      color="primary"
                      underline="none"
                      className="role-link"
                    >
                      {locale(head?.label.resend)}
                    </MuiLink>
                  </FormGroup>
                </Collapse>
              </div>
            </Stack>
          </div>
        )}
      </>
    );
  }
}

export default withAppRouter(FormForgot);
