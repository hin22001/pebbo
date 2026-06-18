"use client";
import React from "react";
import {
  DataGrid,
  GridCell,
  GridFooter,
  GridFooterContainer,
  GridRow,
  useGridApiContext,
  GridToolbar,
} from "@mui/x-data-grid";
import Snackbar from "@mui/material/Snackbar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import { Helpers } from "@/app/utils";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { getLabel, locale } from "@/app/data/locale";
import {
  Box,
  Checkbox,
  CircularProgress,
  Collapse,
  MenuItem,
  Select,
  Stack,
  TablePagination,
  Tooltip,
  Typography,
} from "@mui/material";
import Edit from "@mui/icons-material/Edit";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Visibility from "@mui/icons-material/Visibility";
import DeleteForever from "@mui/icons-material/DeleteForever";
import Button from "@/elements/button/Button";
import IconCustom from "@/elements/icon/IconCustom";
import IconButton from "@/elements/icon/IconButton";
import ChipStack from "@/elements/chip/ChipStack";
import ImageHandler from "@/elements/image/ImageHandler";

const mainClassName = "module-table";

function ActionCell(props) {
  const {
    id,
    data,
    handleAction,
    useActionCell,
    handleOpenCollapse,
    value,
    colItem,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  let attribute = useActionCell?.button?.getAttribute
    ? useActionCell?.button?.getAttribute(value)
    : {
        ...(Helpers.filterObjectByKey(useActionCell?.button, "getAttribute") ||
          {}),
      };

  attribute = {
    ...(attribute || {}),
    ...(useActionCell?.button?.attribute || {}),
  };

  let xp = [10, 20, 30, 40, 50];

  return (
    <>
      {!attribute?.hide && (
        <Stack
          key={mainClassName + "-action-cell-" + id}
          direction="row"
          alignItems={"center"}
        >
          {useActionCell?.type === "coin" || useActionCell?.type === "xp" ? (
            <Stack direction="row">
              {xp?.map((val, i) => (
                <Stack key={i} className={mainClassName + "-cell-xp"}>
                  <Typography color="#8D8D8D" fontWeight={500} fontSize={10}>
                    {val}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <>
              {useActionCell?.type == "button" && attribute ? (
                <Button
                  {...(Helpers.filterObjectByKey(
                    useActionCell?.button,
                    "getAttribute",
                  ) || {})}
                  {...(attribute || {})}
                  loading={loading}
                  handleClick={async (event) => {
                    setLoading(true);

                    const isFinished = await handleAction({
                      type: colItem?.field,
                      value: Helpers.structuredClone(data),
                    });

                    event.stopPropagation();

                    setLoading(isFinished);
                  }}
                />
              ) : (
                <IconButton
                  className={mainClassName + "-action-cell"}
                  onClick={async (event) => {
                    try {
                      setLoading(true);

                      if (useActionCell?.type == "collapse") {
                        if (handleOpenCollapse) {
                          handleOpenCollapse(id);
                        }
                        if (handleAction && !open) {
                          handleAction({
                            type: useActionCell?.type,
                            value: Helpers.structuredClone(data),
                            open: !open,
                          });
                        }

                        setOpen(!open);
                      } else {
                        if (handleAction) {
                          handleAction({
                            type: useActionCell?.type,
                            value: Helpers.structuredClone(data),
                          });
                        }
                        event.stopPropagation();
                      }

                      setLoading(false);
                    } catch (err) {
                      setLoading(false);
                    }
                  }}
                >
                  {
                    {
                      collapse: <>{open ? <ExpandLess /> : <ExpandMore />}</>,
                      view: <Visibility />,
                      detailquest: data?.mutable ? <Edit /> : <Visibility />,
                      detailquiz: <Edit />,
                      detailquizstudent: <Edit />,
                      edit: <Edit />,
                      customdelete: <DeleteForever />,
                      delete: <DeleteForever />,
                    }[useActionCell?.type || "edit"]
                  }
                </IconButton>
              )}
            </>
          )}
          {loading && (
            <CircularProgress
              sx={{
                color: "grey.500",
                width: "20px !important",
                height: "20px !important",
                marginLeft: "5px",
              }}
            />
          )}
        </Stack>
      )}
    </>
  );
}

function computeMutation(newRow, oldRow) {
  const difference = Helpers.difference(newRow, oldRow)[0];

  if (difference) {
    return `${difference} ${getLabel({ name: "from" })} '${oldRow[difference]}' ${getLabel({ name: "to" })} '${newRow[difference]}'`;
  }

  return null;
}

const StyledDataGrid = styled(DataGrid)(({ reportType }) => ({
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor:
      reportType === "daily" ? "rgba(255, 80, 0, 0.1)" : "#8264FF",
    color: reportType === "daily" ? "#000" : "white",
    borderRadius: "8px",
  },
  "& .MuiDataGrid-row": {
    backgroundColor: "#F9FBFF",
    borderRadius: "8px",
    marginTop: "3px",
    marginBottom: "3px",
  },
  "& .MuiDataGrid-root": {
    border: "none",
  },
  "& .MuiDataGrid-cell": {
    border: "none",
  },
}));

export default function Table(props) {
  const {
    isBulkUpdate,
    handleChangeData,
    // props?.columns,
    disableAction, // e.g: edit
    disableConfirmDialog,
    theme,
    reportType,
  } = props;

  // === Inital Variable ===

  const noButtonRef = React.useRef(null);
  const yesButtonRef = React.useRef(null);
  const [promiseArguments, setPromiseArguments] = React.useState(null);

  const [snackbar, setSnackbar] = React.useState(null);
  const [pagination, setPagination] = React.useState(
    ConfigComponents?.Table?.pageContext,
  );
  const [columns, setColumns] = React.useState([]);
  const [collapseIds, setCollapseIds] = React.useState([]);

  // === Handlers ===

  const handleCloseSnackbar = () => closeSnackbar();

  const processRowUpdate = React.useCallback(
    (newRow, oldRow) =>
      new Promise((resolve, reject) => {
        const mutation = computeMutation(newRow, oldRow);

        if (mutation) {
          if (disableConfirmDialog) {
            handleChangeData(newRow);

            newRow["edited"] = true;
            resolve(newRow);
          } else {
            // Save the arguments to resolve or reject the promise later
            setPromiseArguments({ resolve, reject, newRow, oldRow });
          }
        } else {
          resolve(oldRow); // Nothing was changed
        }
      }),
    [disableConfirmDialog],
  );

  const handleNo = () => {
    const { oldRow, resolve } = promiseArguments;
    resolve(oldRow); // Resolve with the old row to not update the internal state
    setPromiseArguments(null);
  };

  const handleYes = async () => {
    const headRes = getDataHead({
      name: "headAlert",
    });

    const { newRow, oldRow, reject, resolve } = promiseArguments;

    try {
      // Make the HTTP request to save in the backend

      const difference = Helpers.difference(newRow, oldRow)[0];

      if (handleChangeData) {
        const response = await handleChangeData(newRow);

        if (response?.success) {
          if (!isBulkUpdate) {
            // ===> using bulk on api not put or patch specific data

            enqueueSnackbar(
              locale(headRes?.actionSuccess) ||
                difference + " successfully saved",
              {
                variant: "success",
              },
            );
          }
          newRow["edited"] = true;

          resolve(newRow);
        } else {
          enqueueSnackbar(locale(headRes?.actionFailed), {
            variant: "error",
          });

          reject(oldRow);
        }

        setPromiseArguments(null);
      }
    } catch (error) {
      enqueueSnackbar("Error", { variant: "error" });
      reject(oldRow);
      setPromiseArguments(null);
    }
  };

  const handleOpenCollapse = (value) => {
    let newCollapseIds = collapseIds || [];

    if (collapseIds?.includes(value)) {
      newCollapseIds = newCollapseIds.filter((item) => item != value);
    } else {
      newCollapseIds.push(value);
    }

    setCollapseIds(newCollapseIds);
  };

  const handleEntered = () => {
    // The `autoFocus` is not used because, if used, the same Enter that saves
    // the cell triggers "No". Instead, we manually focus the "No" button once
    // the dialog is fully open.
    yesButtonRef.current?.focus();
  };
  const renderConfirmDialog = () => {
    if (!promiseArguments) {
      return null;
    }

    const { newRow, oldRow } = promiseArguments;
    const mutation = computeMutation(newRow, oldRow);

    return (
      <Dialog
        maxWidth="xs"
        TransitionProps={{ onEntered: handleEntered }}
        open={!!promiseArguments}
      >
        <DialogTitle>{getLabel({ name: "youSure" })}</DialogTitle>
        <DialogContent dividers>
          {getLabel({ name: "changeConfirm" }) + " " + mutation}
        </DialogContent>
        <DialogActions>
          <Button ref={noButtonRef} onClick={handleNo}>
            {getLabel({ name: "no" })}
          </Button>
          <Button ref={yesButtonRef} onClick={handleYes}>
            {getLabel({ name: "yes" })}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const refactorColumns = (columns) => {
    // only for global setting with no consecuence of its cell value

    try {
      let result = columns;

      if (props?.columns?.length > 0) {
        result = columns
          .map((item, index) => {
            if (typeof item.headerName != "string") {
              item["headerName"] = locale(item.headerName);
            }

            if (item.field === "coin") {
              item["renderHeader"] = () => (
                <Stack direction="row" alignItems="center">
                  <Typography mr={1}>{locale(item.headerName)}</Typography>
                  <ImageHandler
                    src={require("@/images/icon/icon-point-coin.png")}
                    alt="ico coin"
                    width={24}
                    height={24}
                  />
                </Stack>
              );
            } else if (item.field === "xp") {
              item["renderHeader"] = () => (
                <Stack direction="row" alignItems="center">
                  <Typography mr={1}>{locale(item.headerName)}</Typography>
                  <ImageHandler
                    src={require("@/images/icon/icon-star-yellow.png")}
                    alt="ico coin"
                    width={30}
                    height={30}
                  />
                </Stack>
              );
            } else {
              item["renderHeader"] = () => (
                <Stack direction="row" alignItems="center">
                  <Typography mr={1}>{locale(item.headerName)}</Typography>
                </Stack>
              );
            }

            if (disableAction) {
              // disable action value : edit | add | delete

              if (disableAction == "edit") {
                if (item.editable) {
                  return {
                    ...item,
                    editable: false,
                  };
                } else if (disableAction == item?.useActionCell?.type) {
                  return null;
                }
              }
            }

            if (item.tooltip) {
              return {
                ...item,
                renderCell: (params) => {
                  return <Tooltip></Tooltip>;
                },
              };
            } else if (item.editable) {
              return {
                ...item,
                renderCell: (params) => {
                  const formattedValue = params?.value;

                  return (
                    <Tooltip title={getLabel({ name: "doubleClickEdit" })}>
                      <div className={mainClassName + "-cell-editable"}>
                        <span>{formattedValue}</span>
                      </div>
                    </Tooltip>
                  );
                },
              };
            } else if (item.customCell) {
              if (_.has(item.customCell, "chip")) {
                return {
                  ...item,
                  renderCell: (params) => {
                    const attribute = item.customCell?.chip?.getAttribute(
                      params?.value,
                    );

                    const initialAttribute = Helpers.filterObjectByKey(
                      item.customCell?.chip,
                      "getAttribute",
                    );

                    return (
                      <>
                        {!attribute?.hide && (
                          <Chip
                            {...(initialAttribute || {})}
                            {...(attribute || {})}
                          />
                        )}
                      </>
                    );
                  },
                };
              }
              if (_.has(item.customCell, "checkbox")) {
                return {
                  ...item,
                  renderCell: (params) => {
                    const attribute = item.customCell?.checkbox?.getAttribute(
                      params?.value,
                    );

                    const initialAttribute = Helpers.filterObjectByKey(
                      item.customCell?.checkbox,
                      "getAttribute",
                    );

                    return (
                      <>
                        {!attribute?.hide && (
                          <Checkbox
                            {...(initialAttribute || {})}
                            {...(attribute || {})}
                          />
                        )}
                      </>
                    );
                  },
                };
              }

              return item;
            } else {
              return item;
            }
          })
          .filter((item) => item);
      }

      setColumns(result);
    } catch (err) {
      setColumns(columns);
    }
  };

  const filterCustomProps = (object) => {
    return _.pickBy(
      object,
      (value, key) => key != "columns" || key != "Child" || key != "total",
    );
  };

  React.useEffect(() => {
    refactorColumns(props?.columns);
  }, []);
  React.useEffect(() => {
    refactorColumns(props?.columns);
  }, [props.columns]);

  React.useEffect(() => {}, [collapseIds]);

  return (
    <div
      className={
        mainClassName +
        " " +
        (isBulkUpdate ? "use-bulk-edit" : "") +
        " " +
        (disableAction ? "disable-action-" + disableAction : "") +
        " " +
        (theme || "")
      }
    >
      {renderConfirmDialog()}
      {columns?.length > 0 && (
        <StyledDataGrid
          reportType={reportType}
          onPaginationModelChange={(newPage) => {
            setPagination(newPage);
          }}
          {...(ConfigComponents.Table || {})}
          {...(filterCustomProps(props) || {})}
          columns={columns}
          processRowUpdate={processRowUpdate}
          getRowClassName={(params) => {
            let refactorClassName = mainClassName + "-row";

            if (params?.row?.mutable === false) {
              refactorClassName = refactorClassName + "-disabled";
            } else {
              if (params?.row?.edited) {
                refactorClassName = refactorClassName + "-edited";
              }
              if (params?.row?.rowTheme?.bgColor) {
                refactorClassName =
                  refactorClassName +
                  "-bg-color-" +
                  params?.row?.rowTheme?.bgColor;
              }
            }

            return refactorClassName;
          }}
          onProcessRowUpdateError={(error) => {
            enqueueSnackbar("Error", { variant: "error" });
          }}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
            noResultsOverlay: CustomNoRowsOverlay,
            cell: (params) => {
              const colItem = props?.columns?.find(
                (item) => item.field == params?.column?.field,
              );
              const row = props?.rows?.find((item) => item.id == params?.rowId);

              if (colItem?.useActionCell) {
                return (
                  <GridCell {...params}>
                    <ActionCell
                      id={params.rowId}
                      value={params.value}
                      colItem={colItem}
                      data={row}
                      handleAction={props.handleAction}
                      useActionCell={colItem.useActionCell}
                      handleOpenCollapse={handleOpenCollapse}
                    />
                  </GridCell>
                );
              } else if (colItem?.useIcon) {
                const row = props?.rows?.find(
                  (item) => item.id == params?.rowId,
                );
                const returnValue =
                  colItem?.useIcon?.conditionally &&
                  colItem?.useIcon?.conditionally({ row });

                return (
                  <GridCell {...params}>
                    <Stack direction={"row"} spacing={1}>
                      <span>{params?.formattedValue || params?.value}</span>
                      {returnValue && (
                        <CustomTooltip title={returnValue}>
                          <IconCustom
                            icon={colItem?.useIcon?.icon}
                            color={"red"}
                          />
                        </CustomTooltip>
                      )}
                    </Stack>
                  </GridCell>
                );
              } else if (_.has(colItem?.customCell, "chipStack")) {
                const attrChipStack = colItem?.customCell.chipStack;

                const value =
                  row && params?.column?.field && row[params?.column?.field];

                return (
                  <GridCell {...params}>
                    <ChipStack
                      data={
                        attrChipStack?.valueGetter
                          ? attrChipStack?.valueGetter(value)
                          : value
                      }
                    />
                  </GridCell>
                );
              } else if (_.has(colItem?.customCell, "imageSVG")) {
                const value =
                  row && params?.column?.field && row[params?.column?.field];

                return (
                  <GridCell {...params}>
                    <Stack>
                      {value && (
                        <ImageHandler
                          className={"size-small"}
                          src={`data:image/svg+xml;utf8,${encodeURIComponent(value)}`}
                        />
                      )}
                    </Stack>
                  </GridCell>
                );
              } else {
                return <GridCell {...params} />;
              }
            },
            row: (params) => {
              const isCollapseOn = Boolean(
                props?.columns?.findIndex(
                  (item) => item?.useActionCell?.type == "collapse",
                ) >= 0,
              );
              const Child = props.Child;

              return (
                <div key={mainClassName + "-row-" + params?.row?.id}>
                  <GridRow {...params}></GridRow>
                  {isCollapseOn && (
                    <div
                      className={
                        collapseIds?.includes(params?.row?.id) ? "" : "hide"
                      }
                    >
                      <div className={mainClassName + "-tr-child"}>
                        <Child {...(params?.row || {})} />
                      </div>
                    </div>
                  )}
                </div>
              );
            },
            footer: () =>
              CustomFooter({
                rows: props.rows,
                columns,
                total: props.total,
                paginationMode: props.paginationMode,
                paginationModel: props.paginationModel || pagination,
                pageSizeOptions: props.pageSizeOptions,
                rowCount: props.rowCount,
              }),
          }}
          isCellEditable={(params) => {
            return true;
          }}
        />
      )}
      {!!snackbar && (
        <Snackbar open onClose={handleCloseSnackbar} autoHideDuration={6000}>
          <Alert {...snackbar} onClose={handleCloseSnackbar} />
        </Snackbar>
      )}
    </div>
  );
}

function CustomFooter(props) {
  const {
    rows,
    columns,
    paginationMode,
    paginationModel,
    total,
    pageSizeOptions,
    rowCount,
  } = props;

  let sumTotal = 0,
    model,
    totalPerPage = 0,
    filterRowPagination = 0;

  try {
    // === Count total all ===

    model = columns.find((item) => item.aggregation)?.field;

    sumTotal = Helpers.currencyFormatter(
      _.sumBy(rows, function (item) {
        return item[model];
      }),
    );

    // === Count total per page ===

    if (
      (!paginationMode || paginationMode != "server") &&
      paginationModel.pageSize < rows?.length
    ) {
      const rangeIDMin = paginationModel.pageSize * paginationModel.page + 1;

      const rangeIDMax =
        paginationModel.pageSize * paginationModel.page +
        paginationModel.pageSize;

      filterRowPagination = rows.filter((item, index) => {
        const isIncluded = rangeIDMin <= index + 1 && index + 1 <= rangeIDMax;
        return isIncluded;
      });

      totalPerPage = Helpers.currencyFormatter(
        _.sumBy(filterRowPagination, function (item, index) {
          return item[model];
        }),
      );
    } else {
      totalPerPage = sumTotal;
    }
  } catch (err) {}

  const handlePageChange = (params) => {};

  return (
    <GridFooterContainer>
      {model && (
        <Stack
          spacing={1}
          sx={{ marginLeft: "0.5rem", padding: "0.5rem 0rem" }}
        >
          <Stack direction={"row"} spacing={1}>
            <Typography variant="subtitle1">
              {getLabel({ name: "totalFor" }) +
                " " +
                (filterRowPagination?.length || rows?.length) +
                " data:"}
            </Typography>
            <Typography variant="subtitle1">
              <b>{totalPerPage}</b>
            </Typography>
          </Stack>

          {(paginationMode != "server" || total) && (
            <Stack direction={"row"} spacing={1}>
              <Typography variant="subtitle1">
                {getLabel({ name: "totalAll" }) + ": "}
              </Typography>
              <Typography variant="subtitle1">
                <b>{total || sumTotal}</b>
              </Typography>
            </Stack>
          )}
        </Stack>
      )}

      {/* <TablePagination
        rowsPerPageOptions={pageSizeOptions}
        count={rowCount}
        page={paginationModel.page}
        onPageChange={handlePageChange}
        ActionsComponent={(subProps) => {
          const {
            page,
            count,
            rowsPerPage,
            backIconButtonProps,
            nextIconButtonProps,
            showLastButton,
            getItemAriaLabel,
            showFirstButton,
            onPageChange,
            ...restSubProps
          } = subProps;
          return (
            <>
              <Select
                size="small"
                onChange={(e) => handlePageChange(e, e.target.value)}
                value={page}
                MenuProps={{
                  PaperProps: { sx: { maxHeight: 360 } }
                }}
              >
                <MenuItem id={1} key={1} value={1}>{1}</MenuItem>
                <MenuItem id={2} key={2} value={2}>{2}</MenuItem>
                <MenuItem id={3} key={3} value={3}>{3}</MenuItem>
              </Select>
            </>
          );
        }}
      /> */}

      <GridFooter
        sx={{
          border: "none", // To delete double border.
          justifyContent: "space-between",
          width: model ? "fit-content" : "100%",
        }}
      />
    </GridFooterContainer>
  );
}

function CustomNoRowsOverlay() {
  return (
    <StyledGridOverlay>
      <svg
        width="120"
        height="100"
        viewBox="0 0 184 152"
        aria-hidden
        focusable="false"
      >
        <g fill="none" fillRule="evenodd">
          <g transform="translate(24 31.67)">
            <ellipse
              className="ant-empty-img-5"
              cx="67.797"
              cy="106.89"
              rx="67.797"
              ry="12.668"
            />
            <path
              className="ant-empty-img-1"
              d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
            />
            <path
              className="ant-empty-img-2"
              d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
            />
            <path
              className="ant-empty-img-3"
              d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
            />
          </g>
          <path
            className="ant-empty-img-3"
            d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
          />
          <g className="ant-empty-img-4" transform="translate(149.65 15.383)">
            <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
            <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
          </g>
        </g>
      </svg>
      <Box sx={{ mt: 1 }}>{getLabel({ name: "dataNotFound" })}</Box>
    </StyledGridOverlay>
  );
}

import { styled } from "@mui/material/styles";
import { ConfigComponents } from "@/app/constant";
import { TempData } from "@/app/data/local";
import Chip from "@/elements/chip/Chip";
import { Skeleton } from "@mui/material";
import CustomTooltip from "@/elements/tooltip/Tooltip";
import { getDataHead } from "@/src/app/data/head";

const StyledGridOverlay = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  "& .ant-empty-img-1": {
    fill: theme.palette.mode === "light" ? "#aeb8c2" : "#262626",
  },
  "& .ant-empty-img-2": {
    fill: theme.palette.mode === "light" ? "#f5f5f7" : "#595959",
  },
  "& .ant-empty-img-3": {
    fill: theme.palette.mode === "light" ? "#dce0e6" : "#434343",
  },
  "& .ant-empty-img-4": {
    fill: theme.palette.mode === "light" ? "#fff" : "#1c1c1c",
  },
  "& .ant-empty-img-5": {
    fillOpacity: theme.palette.mode === "light" ? "0.8" : "0.08",
    fill: theme.palette.mode === "light" ? "#f5f5f5" : "#fff",
  },
}));
