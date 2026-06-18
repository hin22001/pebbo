"use client";
import React, { Component } from "react";
import { getDataHead } from "@/app/data/head";
import {
  FormGenerator,
  ModalScreen,
  ModalConfirm as ModalConfirmSubmit,
} from "@/components/modules";
import { Alert, Button, IconButton, Tabs } from "@/components/elements";
import { Helpers } from "@/app/utils";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import { connect } from "react-redux";
import _ from "lodash";
import { Stack } from "@mui/material";

class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-global-table-editor-section-modal-form",
      values: {
        name: "",
      },
      alert: {
        type: "error",
        isOpen: 0,
        headType: "generalError",
      },
      modalConfirmSubmit: {
        isOpen: 0,
        head: {},
      },
      initialValues: null,
    };
  }

  async closeModal() {
    try {
      this.setState({
        isOpen: 0,
      });
    } catch (err) {}
  }

  async openAlert(message) {
    try {
      this.setState({
        alert: {
          ...this.state.alert,
          isOpen: this.state.alert.isOpen + 1,
          message,
          headType: message ? null : this.state.alert.headType,
        },
      });
    } catch (err) {}
  }

  async handleEvent(params) {
    try {
      const {
        state: { modalConfirmSubmit, head },
        props: { type, initialValues, disableConfirmSubmit },
      } = this;

      switch (params?.type) {
        case "on-change":
          {
            this.setState({
              values: {
                name: "",
              },
            });
          }
          break;

        case "submit":
          {
            const data = {
              ...(params?.data || {}),
              fullData: params?.fullData,
            };

            if (type == "filter") {
              if (this.props.submit) {
                await this.props.submit(data);
              }
            } else {
              if (!disableConfirmSubmit) {
                this.setState({
                  modalConfirmSubmit: {
                    isOpen: modalConfirmSubmit?.isOpen + 1,
                    head:
                      head?.ModalConfirmSubmit &&
                      head?.ModalConfirmSubmit[type],
                  },
                  data: data,
                });
              } else {
                if (this.props.submit) {
                  await this.props.submit(data);
                }
              }
            }
          }
          break;

        case "confirm-submit":
          {
            if (type == "add") {
            }
            if (type == "edit") {
            }

            if (this.props.submit) {
              await this.props.submit({
                data: this.state.data,
                initialValues,
              });
            }
          }
          break;
      }
    } catch (err) {}
  }

  async assignDataForEdit() {
    try {
      const {
        state: {},
        props: { type, initialValues },
      } = this;

      if (type == "edit") {
      }
    } catch (err) {
      await this.props.assignMainLayout({
        type: "ASSIGN_CLOSE_LOADER",
      });
    }
  }

  async assignHead() {
    try {
      const {
        state: {},
        props: { type },
      } = this;

      await this.setState({
        isOpen: this.props.isOpen,
      });
    } catch (err) {}
  }

  async componentDidMount() {
    await this.assignDataForEdit();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.isOpen != this.props.isOpen) {
      this.props.assignMainLayout({
        type: "ASSIGN_OPEN_LOADER",
      });

      this.setState({
        isOpen: this.props.isOpen,
        alert: {
          type: "warning",
          isOpen: 0,
          headType: "generalError",
        },
        modalConfirmSubmit: {
          isOpen: 0,
          head: {},
        },
        initialValues: null,
      });

      await this.assignDataForEdit();

      this.props.assignMainLayout({
        type: "ASSIGN_CLOSE_LOADER",
      });
    }
  }

  render() {
    const {
      state: { mainClassName, modalConfirmSubmit, alert, isOpen },
      props: {
        initialValues,
        head,
        type, // add | edit | filter
        disableConfirmSubmit,
        confirmClose,
      },
    } = this;

    const title =
      (_.has(head, "type") && type && head?.type[type]?.title) || head?.title;

    return (
      <ModalScreen
        isOpen={isOpen}
        confirmClose={confirmClose && type != "filter"}
        title={title}
        className="paper"
      >
        {head && (
          <>
            <Alert
              {...(alert || {})}
              handleClose={this.handleEvent.bind(this, { type: "close-alert" })}
              useHiddenElement={true}
            />
            <div className={mainClassName}>
              {head?.tabs && (
                <Tabs
                  head={head?.tabs?.head}
                  handleChange={async (values) =>
                    await this.handleEvent({
                      type: "switch-tab",
                      values,
                    })
                  }
                />
              )}

              {head?.splitScreen ? (
                <Stack direction={"row"} spacing={2}>
                  {Object.keys(head?.splitScreen)?.map((form, formIndex) => {
                    return (
                      <Stack
                        className="card"
                        key={
                          mainClassName +
                          "-form-generator-split-screen-" +
                          formIndex
                        }
                      >
                        <FormGenerator
                          {...(head?.formsAttribute || {})}
                          head={head?.forms[form]}
                          title={head?.splitScreen[form]?.title}
                          handleEvent={async (params) =>
                            await this.handleEvent(params)
                          }
                          initialValues={initialValues}
                        />
                      </Stack>
                    );
                  })}
                </Stack>
              ) : (
                <FormGenerator
                  {...(head?.formsAttribute || {})}
                  head={head?.forms}
                  handleEvent={async (params) => await this.handleEvent(params)}
                  initialValues={initialValues}
                />
              )}
            </div>
            {type != "filter" && !disableConfirmSubmit && (
              <ModalConfirmSubmit
                {...(modalConfirmSubmit || {})}
                head={head?.modalConfirmSubmit}
                handleAccept={this.handleEvent.bind(this, {
                  type: "confirm-submit",
                })}
              />
            )}
          </>
        )}
      </ModalScreen>
    );
  }
}
export default connect(null, { assignMainLayout })(index);
