"use client";
import { locale } from "@/locale";
import {
  Button,
  DatePicker,
  DatePickerRange,
  DatePickerRangeFull,
  IconButton,
  IconCustom,
  Skeleton,
  WeekPicker,
} from "@/app/components/elements";
import { ModalConfirm, NoticeCard } from "@/app/components/modules";
import Table from "@/app/components/modules/table/Table";
import TableReport from "@/app/components/modules/table/TableReport";
import { ModalFormBankAccount } from "@/app/components/sections";
import { ConfigComponents } from "@/app/constant";
import { APIHelpers, Helpers } from "@/app/utils";
import {
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import _ from "lodash";
import { withAppRouter } from "@/app/utils/withAppRouter";
import React, { Component } from "react";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import { connect } from "react-redux";
import { ModalForm, ModalForm as ModalFilter } from "./sections";
import ContentLayout from "@/app/components/layouts/ContentLayout/ContentLayout";
import { TempData } from "@/src/app/data/local";
import { getDataHead } from "@/src/app/data/head";

class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-global-table-editor",
      dataRows: [],
      showLoaderTable: true,
      pageSizeOptions: ConfigComponents.Table.pageSizeOptions,
      paginationModel: ConfigComponents.Table.pageContext,
      filterArray: [],
      sortArray: [],
      rowSelectionModel: [],
      heightTable: 500,
      modalConfirm: {
        isOpen: 0,
        headType: "",
      },
      modalForm: {
        isOpen: 0,
        type: "",
      },
      modalFilter: {
        isOpen: 0,
        head: null,
        type: "filter",
      },
    };
  }

  async loader(show = true) {
    try {
      await this.setState({
        showLoaderTable: show,
      });

      if (show) {
        async function handleTimeout(_this) {
          setTimeout(async function () {
            await _this.setState({
              showLoaderTable: false,
            });
          }, 60000);
        }
        handleTimeout(this);
      }
    } catch (err) {}
  }

  async assignHeightTable() {
    try {
      const {
        state: { mainClassName },
        props: {},
      } = this;

      const height1 = document.querySelector(".content-layout")?.clientHeight;
      const height2 = document.querySelector(
        "." + mainClassName + "-header",
      )?.clientHeight;

      const gap = 50;
      const heightTable = height1 - (height2 + gap);

      this.setState({
        heightTable: heightTable,
      });
    } catch (err) {}
  }

  async handleEvent(params) {
    try {
      const {
        state: {
          modalForm,
          modalConfirm,
          rowSelectionModel,
          backupParams,
          searchKey,
          modalFilter,
          selectedRowData,
        },
        props: { head, onSave },
      } = this;

      switch (params?.type) {
        case "date-changed":
          {
            if (params?.value) {
              let paramsData = {
                ...JSON.parse(backupParams || "{}"),
                date: params?.value,
              };

              await this.assignData(paramsData);
            }
          }
          break;

        case "date-changed-start":
          {
            if (params?.value) {
              let paramsData = {
                ...JSON.parse(backupParams || "{}"),
                start_date: params?.value,
              };

              await this.assignData(paramsData);
            }
          }
          break;

        case "week-changed":
          {
            if (params?.value) {
              let paramsData = {
                ...JSON.parse(backupParams || "{}"),
                weekRange: params?.value,
              };

              await this.assignData(paramsData);
            }
          }
          break;

        case "search-key":
          {
            if (params?.event) {
              const valueSearchKey = params?.event.target.value;
              this.setState({
                searchKey: valueSearchKey,
              });
            }
          }
          break;

        case "search":
          {
            let paramsData = {
              ...JSON.parse(backupParams || "{}"),
              search: searchKey,
            };

            await this.assignData(paramsData);
          }
          break;

        case "open-filter":
          {
            this.setState({
              modalFilter: {
                ...modalFilter,
                head: head?.modalFilter,
                isOpen: modalFilter?.isOpen + 1,
              },
            });
          }
          break;

        case "confirm-filter":
          {
            this.setState({
              modalFilter: {
                isOpen: 0,
                initialValues: params?.values,
              },
            });

            await this.assignData(params);
          }
          break;

        case "reset":
          {
            if (head?.action?.filter?.strict) {
              this.setState({
                modalFilter: {
                  ...modalFilter,
                  head: head?.modalFilter,
                  initialValues: null,
                  isOpen: modalFilter?.isOpen + 1,
                  type: "filter",
                },
                dataRows: [],
              });
            } else {
              this.setState({
                modalFilter: {
                  head: null,
                  isOpen: 0,
                  type: "filter",
                },
              });
              await this.assignData(null, true);
            }
          }
          break;

        case "submit-modal-form":
          {
            await this.props.assignMainLayout({
              type: "ASSIGN_OPEN_LOADER",
            });

            if (this.props.submitModalForm) {
              const response = await this.props.submitModalForm(params);

              if (response?.success) {
                await this.setState({
                  modalForm: {
                    ...modalForm,
                    isOpen: 0,
                  },
                });

                Helpers.openSnackbar({
                  name: "dataSuccessfullySubmitted",
                  autoHideDuration: 3000,
                });

                await this.assignData();
              } else {
                const headRes = getDataHead({
                  name: "headAlert",
                });

                Helpers.openSnackbar({
                  message: locale(headRes?.actionFailed),
                });
              }
            }
            await this.props.assignMainLayout({
              type: "ASSIGN_CLOSE_LOADER",
            });
          }
          break;

        case "export":
          {
            if (this.props.exportData) {
              this.props.exportData(JSON.parse(backupParams || "null"));
            }
          }
          break;

        case "add":
          {
            this.setState({
              modalForm: {
                isOpen: modalForm?.isOpen + 1,
                type: "add",
              },
            });
          }
          break;

        case "save":
          {
            const data = rowSelectionModel;

            await onSave({ dataList: data, id: this.props.router?.query?.id });

            // setTimeout(() => {
            //   Router.push('/quiz-exercise')
            // }, 1000);
          }
          break;

        case "delete":
          {
            this.setState({
              modalConfirm: {
                isOpen: modalConfirm?.isOpen + 1,
                headType: "deleteData",
              },
            });
          }
          break;

        case "delete-confirm":
          {
            if (this.props.deleteAction) {
              const response = await this.props.deleteAction({
                arrId: rowSelectionModel,
              });

              this.setState({
                rowSelectionModel: [],
              });

              if (response) {
                await this.assignData();
              }
            } else if (this.props.onDeleteRow) {
              this.props.onDeleteRow(selectedRowData);
            }
          }
          break;

        case "custom-add":
          {
            if (this.props.customAdd) {
              const response = await this.props.customAdd({
                arrId: rowSelectionModel,
              });

              this.setState({
                rowSelectionModel: [],
              });

              if (response) {
                await this.assignData();
              }
            }
          }
          break;
      }
    } catch (err) {}
  }

  async handleEventTable(params) {
    try {
      const {
        state: {
          paginationModel,
          filterArray,
          sortArray,
          rowSelectionModel,
          modalForm,
          backupParams,
          dataRows,
          modalConfirm,
        },
        props: { head },
      } = this;

      switch (params?.type) {
        case "pagination-change":
          {
            let refactorPaginationModel = params?.value;

            if (paginationModel?.pageSize != params?.value?.pageSize) {
              refactorPaginationModel = {
                page: 0,
                pageSize: params?.value?.pageSize,
              };
            }

            const paramsData = {
              ...JSON.parse(backupParams || "{}"),
              pagination: refactorPaginationModel,
              filter: filterArray,
              sort: sortArray,
            };

            await this.assignData(paramsData);

            this.setState({
              paginationModel: refactorPaginationModel,
            });
          }
          break;

        case "filter-change":
          {
            if (params?.value?.items?.length > 0) {
              const refactorPaginationModel = {
                page: 0,
                pageSize: paginationModel.pageSize,
              };

              const paramsData = {
                ...JSON.parse(backupParams || "{}"),
                pagination: refactorPaginationModel,
                filter: params?.value?.items,
                sort: sortArray,
              };

              await this.assignData(paramsData);

              this.setState({
                filterArray: params?.value?.items,
                paginationModel: refactorPaginationModel,
              });
            }
          }
          break;

        case "sort-change":
          {
            if (params?.value?.length > 0) {
              const refactorPaginationModel = {
                page: 0,
                pageSize: paginationModel.pageSize,
              };

              const paramsData = {
                ...JSON.parse(backupParams || "{}"),
                pagination: refactorPaginationModel,
                filter: filterArray,
                sort: params?.value,
              };

              await this.assignData(paramsData);

              this.setState({
                sortArray: params?.value,
                paginationModel: refactorPaginationModel,
              });
            }
          }
          break;

        case "row-selection":
          {
            // const selected = params?.value

            // const newData = dataRows?.find((val) => val?.id === selected[selected.length - 1])

            // if (newData?.originalData?.mutable) {
            this.setState({
              rowSelectionModel: params?.value,
            });
            // } else {
            //   Helpers.openSnackbar({ message: "Can't select this question, it is possible that this question is part of a quiz" })
            // }
          }
          break;

        case "edit-data":
          {
          }
          break;

        case "view":
          {
            if (head?.action?.view?.href) {
              const config = {
                pathname: head?.action?.view?.href,
                query: {},
              };

              if (head?.action?.view?.params?.length > 0) {
                head?.action?.view?.params.forEach((item) => {
                  config["query"][item] = params?.value?.originalData[item];
                });
              } else {
                config["query"] = {
                  id: params?.value?.originalData?.id,
                };
              }

              TempData.setData({
                name: "questionDetail",
                data: params?.value?.originalData,
                type: "asPath",
                asPath: config?.pathname + "?id=" + config?.query?.id,
              });

              this.props.router.push(config);
            }
          }
          break;

        case "customdelete":
          {
            this.setState({
              modalConfirm: {
                isOpen: modalConfirm?.isOpen + 1,
                headType: "deleteData",
              },
              selectedRowData: params?.value?.originalData,
            });
          }
          break;

        case "detailquest":
          {
            if (head?.action?.detailquest?.href) {
              const config = {
                pathname: head?.action?.detailquest?.href,
                query: {},
              };

              // if (head?.action?.view?.params?.length > 0) {

              //   head?.action?.view?.params.forEach(item => {
              //     config['query'][item] = params?.value?.originalData[item]
              //   })

              // }
              // else {

              config["query"] = {
                question_id: params?.value?.originalData?.question_id,
              };
              // }

              TempData.setData({
                name: "questionDetail",
                data: params?.value?.originalData,
                type: "asPath",
                asPath:
                  config?.pathname +
                  "?question_id=" +
                  config?.query?.question_id,
              });

              this.props.router.push(config);
            }
          }
          break;

        case "detailquiz":
          {
            if (head?.action?.detailquiz?.href) {
              const config = {
                pathname: head?.action?.detailquiz?.href,
                query: {},
              };

              // if (head?.action?.view?.params?.length > 0) {

              //   head?.action?.view?.params.forEach(item => {
              //     config['query'][item] = params?.value?.originalData[item]
              //   })

              // }
              // else {

              config["query"] = {
                id: params?.value?.originalData?.id,
              };
              // }

              TempData.setData({
                name: "questionDetail",
                data: params?.value?.originalData,
                type: "asPath",
                asPath: config?.pathname + "?id=" + config?.query?.id,
              });

              this.props.router.push(config);
            }
          }
          break;

        case "detailquizstudent":
          {
            if (head?.action?.detailquizstudent?.href) {
              const config = {
                pathname: head?.action?.detailquizstudent?.href,
                query: {},
              };

              config["query"] = {
                id: params?.value?.originalData?.classroom_id,
                quiz_id: params?.value?.originalData?.quiz_id,
              };

              TempData.setData({
                name: "questionDetail",
                data: params?.value?.originalData,
                type: "asPath",
                asPath:
                  config?.pathname +
                  "?id=" +
                  config?.query?.id +
                  "&quiz_id=" +
                  config?.query?.quiz_id,
              });

              this.props.router.push(config);
            }
          }
          break;

        case "edit":
          {
            if (head?.action?.edit?.href) {
              const config = {
                pathname: head?.action?.edit?.href,
                query: {
                  id: params?.value?.originalData?.id,
                },
              };

              TempData.setData({
                name: "questionDetail",
                data: params?.value?.originalData,
                type: "asPath",
                asPath: config?.pathname + "?id=" + config?.query?.id,
              });

              this.props.router.push(config);
            } else {
              this.setState({
                modalForm: {
                  isOpen: modalForm?.isOpen + 1,
                  type: "edit",
                  initialValues: params?.value,
                },
              });
            }
          }
          break;
      }

      if (params?.actionType == "handleAction") {
        const action = head.action[params?.type];

        if (action?.modalForm) {
          this.setState({
            modalForm: {
              isOpen: modalForm?.isOpen + 1,
              type: "edit",
              initialValues: params?.value,
              title: action?.modalForm?.title,
              head: action?.modalForm,
            },
          });
        }
      }
    } catch (err) {}
  }

  async assignData(params, reset) {
    try {
      const {
        state: { backupParams },
        props: { access },
      } = this;

      await this.loader();

      const newParams = reset
        ? null
        : params || JSON.parse(backupParams || "null");

      const response = await this.props.getData(newParams);

      let rowSelectionModel = [];
      if (access?.checkbox) {
        rowSelectionModel = access?.data;
      }

      this.setState({
        dataRows: response?.data,
        pageContext: response?.pageContext,
        showLoaderTable: false,
        backupParams: JSON.stringify(newParams),
        rowSelectionModel,
      });
    } catch (err) {}
  }

  async componentDidMount() {
    await this.props.assignMainLayout({
      type: "ASSIGN_OPEN_LOADER",
    });

    const strictFilter = this.props.head?.action?.filter?.strict;

    if (strictFilter) {
      this.handleEvent({
        type: "open-filter",
      });
    }
    if (this.props.access) {
      if (!strictFilter) {
        await this.assignData();
      }
      await this.assignHeightTable();
    }
    await this.props.assignMainLayout({
      type: "ASSIGN_CLOSE_LOADER",
    });
  }

  async componentDidUpdate(prevProps) {
    const strictFilter = this.props?.head?.action?.filter?.strict;

    if (!Helpers.compareObject(prevProps.access, this.props.access)) {
      this.loader();
      if (!strictFilter) {
        await this.assignData();
      }
      await this.assignHeightTable();
      this.loader(false);
    }
    if (!Helpers.compareObject(prevProps.head, this.props.head)) {
      if (strictFilter) {
        this.handleEvent({
          type: "open-filter",
        });
      }
    }
  }

  render() {
    const {
      state: {
        mainClassName,
        dataRows,
        showLoaderTable,
        pageContext,
        pageSizeOptions,
        paginationModel,
        heightTable,

        modalForm,
        rowSelectionModel,
        modalConfirm,
        modalFilter,
      },
      props: { head, access, submitForm, tableType, reportType },
    } = this;

    return (
      <ContentLayout access={access}>
        {head ? (
          access ? (
            <Stack component="main" className={mainClassName} spacing={2}>
              <Stack className={mainClassName + "-header"} spacing={2}>
                <Stack>
                  <Typography
                    className={mainClassName + "-title text-h1"}
                    variant="h2"
                    component="h1"
                    sx={{ fontFamily: "'Advercase', serif !important" }}
                  >
                    {locale(head?.title)}
                  </Typography>
                </Stack>

                <Stack
                  spacing={2}
                  direction={"row"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  {head?.action?.search && (
                    <Stack>
                      <TextField
                        sx={{
                          minWidth: "13rem",
                        }}
                        placeholder={locale(head?.label?.searchPlaceholder)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                icon="Search"
                                handleClick={() =>
                                  this.handleEvent({
                                    type: "search",
                                  })
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={(e) => {
                          e.preventDefault();
                          this.handleEvent({
                            type: "search-key",
                            event: e,
                          });
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          this.handleEvent({
                            type: "search",
                          })
                        }
                      />
                    </Stack>
                  )}
                  {tableType === "report" && <Stack />}
                  <Stack direction={"row"} spacing={1}>
                    {head?.action?.searchRight && (
                      <Stack direction="row" alignItems="center">
                        <Typography color="#4F446E" fontWeight={500} mr={1}>
                          {locale(head?.label?.subject)}
                        </Typography>
                        <TextField
                          sx={{
                            minWidth: "13rem",
                          }}
                          placeholder={locale(head?.label?.searchPlaceholder)}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  icon="Search"
                                  handleClick={() =>
                                    this.handleEvent({
                                      type: "search",
                                    })
                                  }
                                />
                              </InputAdornment>
                            ),
                          }}
                          onChange={(e) => {
                            e.preventDefault();
                            this.handleEvent({
                              type: "search-key",
                              event: e,
                            });
                          }}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            this.handleEvent({
                              type: "search",
                            })
                          }
                        />
                      </Stack>
                    )}
                    {head?.action?.datePickerReportStart && (
                      <Stack direction="row" alignItems="center">
                        <Typography
                          color="#4F446E"
                          fontWeight={500}
                          mr={1}
                          ml={2}
                        >
                          {locale(head?.label?.startDate)}
                        </Typography>
                        <DatePicker
                          {...(head?.action?.datePicker || {})}
                          onChange={(value) =>
                            this.handleEvent({
                              value,
                              type: "date-changed-start",
                            })
                          }
                        />
                      </Stack>
                    )}
                    {head?.action?.datePickerReportDate && (
                      <Stack direction="row" alignItems="center">
                        <Typography
                          color="#4F446E"
                          fontWeight={500}
                          mr={1}
                          ml={2}
                        >
                          {locale(head?.label?.date)}
                        </Typography>
                        <DatePicker
                          {...(head?.action?.datePicker || {})}
                          onChange={(value) =>
                            this.handleEvent({
                              value,
                              type: "date-changed",
                            })
                          }
                        />
                      </Stack>
                    )}
                    {head?.action?.datePickerReportEnd && (
                      <Stack direction="row" alignItems="center">
                        <Typography
                          color="#4F446E"
                          fontWeight={500}
                          mr={1}
                          ml={2}
                        >
                          {locale(head?.label?.endDate)}
                        </Typography>
                        <DatePicker
                          {...(head?.action?.datePicker || {})}
                          onChange={(value) =>
                            this.handleEvent({
                              value,
                              type: "date-changed-start",
                            })
                          }
                        />
                      </Stack>
                    )}
                    {head?.action?.datePicker && (
                      <DatePicker
                        {...(head?.action?.datePicker || {})}
                        onChange={(value) =>
                          this.handleEvent({
                            value,
                            type: "date-changed",
                          })
                        }
                      />
                    )}
                    {head?.action?.weekPicker && (
                      <WeekPicker
                        {...(head?.action?.weekPicker || {})}
                        onChange={(value) =>
                          this.handleEvent({
                            value,
                            type: "week-changed",
                          })
                        }
                      />
                    )}
                    {head?.action?.add && access?.add && (
                      <Button
                        headType="add"
                        href={head?.action?.add?.href}
                        handleClick={
                          !head?.action?.add?.href &&
                          this.handleEvent.bind(this, {
                            type: "add",
                          })
                        }
                      />
                    )}
                    {access?.customAdd && rowSelectionModel?.length > 0 && (
                      <Button
                        headType="add"
                        href={head?.action?.add?.href}
                        handleClick={this.handleEvent.bind(this, {
                          type: "custom-add",
                        })}
                      />
                    )}
                    {head?.action?.save && (
                      <Button
                        label={locale(head?.action?.save?.label)}
                        handleClick={this.handleEvent.bind(this, {
                          type: "save",
                        })}
                      />
                    )}
                    {head?.action?.delete && rowSelectionModel?.length > 0 && (
                      <Button
                        label={locale(head?.action?.delete?.label)}
                        handleClick={this.handleEvent.bind(this, {
                          type: "delete",
                        })}
                      />
                    )}
                    {head?.action?.filter && (
                      <>
                        {modalFilter?.initialValues && (
                          <Button
                            headType="reset"
                            handleClick={this.handleEvent.bind(this, {
                              type: "reset",
                            })}
                            className="secondary"
                          />
                        )}
                        <Button
                          headType="filter"
                          handleClick={this.handleEvent.bind(this, {
                            type: "open-filter",
                          })}
                          className={
                            modalFilter?.initialValues ? "primary" : "secondary"
                          }
                        />
                      </>
                    )}
                    {head?.action?.export && (
                      <Button
                        headType="exportExcel"
                        handleClick={this.handleEvent.bind(this, {
                          type: "export",
                        })}
                        disabled={dataRows?.length < 1}
                      />
                    )}
                  </Stack>
                </Stack>
              </Stack>

              <Stack
                className={mainClassName + "-table"}
                style={{ height: heightTable }}
              >
                {tableType === "report" ? (
                  <TableReport
                    rows={dataRows || []}
                    columns={head?.table.columns}
                    paginationModel={paginationModel}
                    pageSizeOptions={pageSizeOptions}
                    experimentalFeatures={{
                      lazyLoading: true,
                    }}
                    paginationMode="server"
                    onPaginationModelChange={(value) =>
                      this.handleEventTable({
                        type: "pagination-change",
                        value,
                      })
                    }
                    loading={showLoaderTable}
                    rowCount={pageContext?.rowCount}
                    filterMode="server"
                    onFilterModelChange={(value) =>
                      this.handleEventTable({
                        type: "filter-change",
                        value,
                      })
                    }
                    sortingMode="server"
                    onSortModelChange={(value) =>
                      this.handleEventTable({
                        type: "sort-change",
                        value,
                      })
                    }
                    checkboxSelection={access?.checkbox}
                    keepNonExistentRowsSelected
                    onRowSelectionModelChange={(value) =>
                      this.handleEventTable({
                        type: "row-selection",
                        value,
                      })
                    }
                    rowSelectionModel={rowSelectionModel}
                    handleChangeData={(value) => {
                      return this.handleEventTable({
                        type: "edit-data",
                        value,
                      });
                    }}
                    handleAction={async (value) => {
                      await this.handleEventTable({
                        ...(value || {}),
                        actionType: "handleAction",
                      });
                    }}
                    disableAction={!access.edit ? "edit" : ""}
                    reportType={reportType}
                  />
                ) : (
                  <Table
                    rows={dataRows || []}
                    columns={head?.table.columns}
                    paginationModel={paginationModel}
                    pageSizeOptions={pageSizeOptions}
                    experimentalFeatures={{
                      lazyLoading: true,
                    }}
                    paginationMode="server"
                    onPaginationModelChange={(value) =>
                      this.handleEventTable({
                        type: "pagination-change",
                        value,
                      })
                    }
                    loading={showLoaderTable}
                    rowCount={pageContext?.rowCount}
                    filterMode="server"
                    onFilterModelChange={(value) =>
                      this.handleEventTable({
                        type: "filter-change",
                        value,
                      })
                    }
                    sortingMode="server"
                    onSortModelChange={(value) =>
                      this.handleEventTable({
                        type: "sort-change",
                        value,
                      })
                    }
                    checkboxSelection={access?.checkbox}
                    keepNonExistentRowsSelected
                    onRowSelectionModelChange={(value) =>
                      this.handleEventTable({
                        type: "row-selection",
                        value,
                      })
                    }
                    rowSelectionModel={rowSelectionModel}
                    handleChangeData={(value) => {
                      return this.handleEventTable({
                        type: "edit-data",
                        value,
                      });
                    }}
                    handleAction={async (value) => {
                      await this.handleEventTable({
                        ...(value || {}),
                        actionType: "handleAction",
                      });
                    }}
                    disableAction={!access.edit ? "edit" : ""}
                  />
                )}
              </Stack>

              <ModalFilter
                {...(modalFilter || {})}
                refreshData={this.assignData.bind(this)}
                type="filter"
                submit={async (values) =>
                  await this.handleEvent({
                    type: "confirm-filter",
                    values,
                  })
                }
              />

              <ModalForm
                {...(modalForm || {})}
                refreshData={this.assignData.bind(this)}
                submit={async (values) =>
                  await this.handleEvent({
                    type: "submit-modal-form",
                    values,
                  })
                }
              />

              <ModalConfirm
                {...(modalConfirm || {})}
                handleAccept={this.handleEvent.bind(this, {
                  type: "delete-confirm",
                })}
              />
            </Stack>
          ) : (
            <NoticeCard headType="accessDenied" />
          )
        ) : (
          <Skeleton type="table" row={3} />
        )}
      </ContentLayout>
    );
  }
}
export default connect(null, { assignMainLayout })(withAppRouter(index));
