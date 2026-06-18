import React, { useEffect, useState } from "react";
import { getDataHead } from "@/src/app/data/head";
import {
  Card,
  Stack,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Checkbox,
  TableSortLabel,
  Select,
  MenuItem,
  Popover,
  Modal,
  TextField,
  TablePagination,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVert from "@mui/icons-material/MoreVert";
import { ContentLayout } from "@/layouts/ContentLayout";
import { Alert, Loader, TabAdmin } from "../../elements";
import { ClassAPI } from "@/src/app/data/api";
import { locale } from "@/src/app/data/locale";

export default function AdminManagement() {
  const [tabManagement, setTabManagement] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataClass, setDataClass] = useState(null);
  const [totalData, setTotalData] = useState(0);
  const [head, setHead] = useState(null);

  const mainClassName = "admin-management-page";

  const switchManagementTab = (id) => {
    setTabManagement(id);
    if (id === 1) {
      getClassroom(0, 10);
    }
  };

  const getClassroom = async (
    page,
    rowsPerPage,
    classroom,
    teacher,
    subject,
  ) => {
    setLoading(true);
    try {
      const nameTeacher = teacher?.split(" ");

      const params = {
        page_number: page + 1,
        rows_per_page: rowsPerPage,
        classroom_name: classroom,
        first_name: nameTeacher[0] || "",
        last_name: nameTeacher?.slice(1).join(" ") || "",
        ...(subject?.length > 0 && {
          teaching_subjects: JSON.stringify([subject]),
        }),
      };

      const data = await ClassAPI.getClassroom(params, {});

      const rawData = data?.payload?.data?.classrooms;
      let finalData = [];
      for (let i = 0; i < rawData?.length; i += 1) {
        const obj = {
          ...finalData[i],
          classroom_id: rawData[i]?.classroom_id,
          name: rawData[i]?.classroom_name,
          noTeacher: rawData[i]?.total_teachers,
          noStudent: rawData[i]?.total_students,
        };
        finalData.push(obj);
      }
      setDataClass(finalData);
      setTotalData(data?.payload?.data?.page_context?.total_rows);
    } catch (error) {}
    setLoading(false);
  };

  useEffect(() => {
    getClassroom(0, 10, "", "", "");
    const head = getDataHead({
      name: "headAdminManagement",
    });
    setHead(head);
  }, []);

  return (
    <ContentLayout title="" hideTitle={true}>
      <Loader isOpen={loading} />
      <Stack>
        <TabAdmin
          switchTab={switchManagementTab}
          tabValue={tabManagement}
          tabList={[
            locale(head?.header?.classrooms),
            locale(head?.header?.teachers),
            locale(head?.header?.students),
            locale(head?.header?.questions),
          ]}
        />
        <Card className={mainClassName + "-card"}>
          {tabManagement === 1 ? (
            <Stack p={2}>
              <TableData
                data={dataClass}
                totalData={totalData}
                onGetData={getClassroom}
                head={head}
              />
            </Stack>
          ) : (
            <Stack p={2}>
              <Stack></Stack>
            </Stack>
          )}
        </Card>
      </Stack>
    </ContentLayout>
  );
}

function Row(props) {
  const {
    selectedRows,
    setSelectedRows,
    selectedRowsTeacher,
    setSelectedRowsTeacher,
    selectedRowsStudent,
    setSelectedRowsStudent,
    row,
    head,
    openModalInvite,
    setLoader,
    renderSelect,
    setRenderSelect,
  } = props;
  const [open, setOpen] = React.useState(false);
  const [openTeacher, setOpenTeacher] = React.useState(false);
  const [openStudent, setOpenStudent] = React.useState(false);
  const [openPopOver, setOpenPopOver] = React.useState(null);
  const [dataTeacher, setDataTeacher] = React.useState([]);
  const [dataStudent, setDataStudent] = React.useState([]);

  const handleSelectClick = (event, id) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelectedRows = [];

    if (selectedIndex === -1) {
      newSelectedRows = newSelectedRows.concat(selectedRows, id);
    } else if (selectedIndex === 0) {
      newSelectedRows = newSelectedRows.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelectedRows = newSelectedRows.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelectedRows = newSelectedRows.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1),
      );
    }

    setSelectedRows(newSelectedRows);
  };

  const handleSelectAllClickTeacher = (event) => {
    if (event.target.checked) {
      setSelectedRowsTeacher(dataTeacher);
      return;
    }
    setSelectedRowsTeacher([]);
  };

  const handleSelectClickTeacher = (event, data) => {
    let newSelectedRows = selectedRowsTeacher;

    if (
      selectedRowsTeacher?.some(
        (val) =>
          val.user_id === data?.user_id &&
          val.classroom_id === data.classroom_id,
      )
    ) {
      newSelectedRows = newSelectedRows.filter(
        (val) =>
          !(
            val.user_id === data.user_id &&
            val.classroom_id === data.classroom_id
          ),
      );
    } else {
      newSelectedRows.push(data);
    }

    setSelectedRowsTeacher(newSelectedRows);
    setRenderSelect(false);
    setTimeout(() => {
      setRenderSelect(true);
    }, 1);
  };

  const handleSelectAllClickStudent = (event) => {
    if (event.target.checked) {
      setSelectedRowsStudent(dataStudent);
      return;
    }
    setSelectedRowsStudent([]);
  };

  const handleSelectClickStudent = (event, data) => {
    let newSelectedRows = selectedRowsStudent;

    if (
      selectedRowsStudent?.some(
        (val) =>
          val.user_id === data?.user_id &&
          val.classroom_id === data.classroom_id,
      )
    ) {
      newSelectedRows = newSelectedRows.filter(
        (val) =>
          !(
            val.user_id === data.user_id &&
            val.classroom_id === data.classroom_id
          ),
      );
    } else {
      newSelectedRows.push(data);
    }

    setSelectedRowsStudent(newSelectedRows);
    setRenderSelect(false);
    setTimeout(() => {
      setRenderSelect(true);
    }, 1);
  };

  const isSelected = (id) => selectedRows?.indexOf(id) !== -1;
  const isSelectedTeacher = (data) =>
    selectedRowsTeacher.some(
      (val) =>
        val.user_id === data?.user_id && val.classroom_id === data.classroom_id,
    );
  const isSelectedStudent = (data) =>
    selectedRowsStudent?.some(
      (val) =>
        val.user_id === data?.user_id && val.classroom_id === data.classroom_id,
    );
  const mainClassName = "admin-management-page";

  const onOpenChild = async (isStudent) => {
    setLoader(true);
    const res = await ClassAPI.getClassroomParticipant(
      {
        page_number: 1,
        rows_per_page: 1000,
        role: isStudent ? "student" : "teacher",
        classroom_id: row?.classroom_id,
      },
      {},
    );
    const data = res?.payload?.data?.students;

    if (isStudent) {
      setDataStudent(data);
      setOpenStudent(true);
    } else {
      setDataTeacher(data);
      setOpenTeacher(true);
    }

    setLoader(false);
  };

  return (
    <React.Fragment>
      <TableRow
        key={row.classroom_id}
        hover
        role="checkbox"
        aria-checked={isSelected(row?.classroom_id)}
        selected={isSelected(row?.classroom_id)}
        style={{ backgroundColor: "#FFFAE9" }}
      >
        <TableCell>
          <Checkbox
            checked={isSelected(row?.classroom_id)}
            onClick={(event) => handleSelectClick(event, row.classroom_id)}
          />
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography className={mainClassName + "-text-purple"}>
            {row.name}
          </Typography>
        </TableCell>
        <TableCell>{row.noTeacher}</TableCell>
        <TableCell>{row.noStudent}</TableCell>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => {
              setOpen(!open);
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={(event) => setOpenPopOver(event.currentTarget)}
          >
            <MoreVert />
          </IconButton>
          <Popover
            id={openPopOver ? "simple-popover" : null}
            open={openPopOver}
            anchorEl={openPopOver}
            onClose={() => setOpenPopOver(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
          >
            <Stack className={mainClassName + "-btn-popover"}>
              <Typography sx={{ p: 1 }}>
                {locale(head?.table?.seeClassReport)}
              </Typography>
            </Stack>
            <Stack className={mainClassName + "-btn-popover"}>
              <Typography sx={{ p: 1 }}>
                {locale(head?.table?.viewQuizzes)}
              </Typography>
            </Stack>
          </Popover>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, width: "100%" }}>
              <Table width="100%">
                <TableRow className={mainClassName + "-row-child-header"}>
                  <TableCell width="30px">
                    <Checkbox
                      checked={
                        selectedRowsTeacher.length === dataTeacher.length &&
                        dataTeacher?.length > 0
                      }
                      onChange={handleSelectAllClickTeacher}
                    />
                  </TableCell>
                  <TableCell width="186px" align="left" backgroundColor="pink">
                    <Typography className={mainClassName + "-text-purple"}>
                      {locale(head?.header?.teachers)}
                    </Typography>
                  </TableCell>
                  <TableCell align="left" scope="row">
                    <Stack direction="row" alignItems="center">
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={
                          openTeacher
                            ? () => setOpenTeacher(false)
                            : () => onOpenChild(false)
                        }
                      >
                        {openTeacher ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>
                      <Stack
                        onClick={() => openModalInvite([row?.classroom_id])}
                        ml={2}
                        className={mainClassName + "-row-child-btn"}
                      >
                        <Typography fontSize={12}>
                          {locale(head?.table?.inviteTeacher)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </Table>
            </Box>
            {openTeacher && (
              <Box sx={{ margin: 2, width: "100%" }}>
                <Table width="100%">
                  {renderSelect &&
                    dataTeacher.map((val, i) => (
                      <TableRow key={i}>
                        <TableCell width="30px">
                          <Checkbox
                            checked={isSelectedTeacher(val)}
                            onClick={(event) =>
                              handleSelectClickTeacher(event, val)
                            }
                          />
                        </TableCell>
                        <TableCell
                          width="186px"
                          align="left"
                          backgroundColor="pink"
                        >
                          {val.first_name} {val.last_name}
                        </TableCell>
                        <TableCell width="200px">{val.email}</TableCell>
                        <TableCell>
                          {val.confirmed ? "Confirmed" : "Pending"}
                        </TableCell>
                      </TableRow>
                    ))}
                </Table>
              </Box>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, width: "100%" }}>
              <Table width="100%">
                <TableRow className={mainClassName + "-row-child-header"}>
                  <TableCell width="30px">
                    <Checkbox
                      checked={
                        selectedRowsStudent.length === dataStudent.length &&
                        dataStudent?.length > 0
                      }
                      onChange={handleSelectAllClickStudent}
                    />
                  </TableCell>
                  <TableCell width="186px" align="left" backgroundColor="pink">
                    <Typography className={mainClassName + "-text-purple"}>
                      {locale(head?.header?.students)}
                    </Typography>
                  </TableCell>
                  <TableCell align="left" scope="row">
                    <Stack direction="row" alignItems="center">
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={
                          openStudent
                            ? () => setOpenStudent(false)
                            : () => onOpenChild(true)
                        }
                      >
                        {openStudent ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>
                      <Stack
                        ml={2}
                        onClick={() => openModalInvite([row?.classroom_id])}
                        className={mainClassName + "-row-child-btn"}
                      >
                        <Typography fontSize={12}>
                          {locale(head?.table?.inviteStudent)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </Table>
            </Box>
            {openStudent && (
              <Box sx={{ margin: 2, width: "100%" }}>
                <Table width="100%">
                  {renderSelect &&
                    dataStudent.map((val, i) => (
                      <TableRow key={i}>
                        <TableCell width="30px">
                          <Checkbox
                            checked={isSelectedStudent(val)}
                            onClick={(event) =>
                              handleSelectClickStudent(event, val)
                            }
                          />
                        </TableCell>
                        <TableCell
                          width="186px"
                          align="left"
                          backgroundColor="pink"
                        >
                          {val.first_name} {val.last_name}
                        </TableCell>
                        <TableCell width="200px">{val.email}</TableCell>
                        <TableCell>
                          {val.confirmed ? "Confirmed" : "Pending"}
                        </TableCell>
                      </TableRow>
                    ))}
                </Table>
              </Box>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

function TableData(props) {
  const { data, totalData, onGetData, head } = props;
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState([]);
  const [selectedRowsTeacher, setSelectedRowsTeacher] = useState([]);
  const [selectedRowsStudent, setSelectedRowsStudent] = useState([]);
  const [modal, setModal] = useState(false);
  const [modal2, setModal2] = useState(false);
  const [alert, setAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [loader, setLoader] = useState(false);
  const [className, setClassName] = useState("");
  const [emailName, setEmailName] = useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [filterClassName, setFilterClassName] = React.useState("");
  const [filterTeacherName, setFilterTeacherName] = React.useState("");
  const [filterSubjectName, setFilterSubjectName] = React.useState("");
  const [renderSelect, setRenderSelect] = React.useState(true);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    onGetData(
      newPage,
      rowsPerPage,
      filterClassName,
      filterTeacherName,
      filterSubjectName,
    );
  };

  const handleChangeRowsPerPage = (event) => {
    const rowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(rowsPerPage);
    setPage(0);
    onGetData(
      0,
      rowsPerPage,
      filterClassName,
      filterTeacherName,
      filterSubjectName,
    );
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelectedRows = data.map((row) => row.classroom_id);
      setSelectedRows(newSelectedRows);
      return;
    }
    setSelectedRows([]);
  };

  const mainClassName = "admin-management-page";

  const styleModal = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#fff",
    borderRadius: "20px",
    outline: "none",
  };

  const onCreateClassroom = async () => {
    if (className?.length > 0) {
      setLoader(true);
      try {
        await ClassAPI.createClassroom(
          {},
          {
            classroom_name: className,
          },
        );
        await onGetData(
          page,
          rowsPerPage,
          filterClassName,
          filterTeacherName,
          filterSubjectName,
        );
        openAlert("Classroom created successfully");
        setClassName("");
      } catch (error) {}
      setModal(false);
      setLoader(false);
    }
  };

  const onInviteUser = async () => {
    if (emailName?.length > 0) {
      setLoader(true);
      try {
        let data = [];
        for (let i = 0; i < selectedClassroom.length; i += 1) {
          const obj = {
            email: emailName,
            classroom_id: selectedClassroom[i],
          };
          data.push(obj);
        }

        await ClassAPI.classroomInviteUsers(
          {},
          {
            users: data,
          },
        );
        await onGetData(
          page,
          rowsPerPage,
          filterClassName,
          filterTeacherName,
          filterSubjectName,
        );

        openAlert("Invitation sent!");
        window.location.reload();

        setEmailName("");
      } catch (error) {}
      setModal2(false);
      setLoader(false);
    }
  };

  const openModalInvite = (selectedClassroom) => {
    setSelectedClassroom(selectedClassroom);
    setModal2(true);
  };

  const onSearch = async () => {
    setLoader(true);
    await onGetData(
      page,
      rowsPerPage,
      filterClassName,
      filterTeacherName,
      filterSubjectName,
    );
    setLoader(false);
  };

  const onClear = async () => {
    setFilterClassName("");
    setFilterTeacherName("");
    setFilterSubjectName("");
    setLoader(true);
    await onGetData(page, rowsPerPage, "", "", "");
    setLoader(false);
  };

  const openAlert = (msg) => {
    setAlertMsg(msg);
    setAlert(true);
  };

  const onRemoveUser = async () => {
    setLoader(true);

    let totalData = [];

    for (let i = 0; i < selectedRowsStudent?.length; i += 1) {
      const obj = {
        email: selectedRowsStudent[i]?.email,
        classroom_id: selectedRowsStudent[i]?.classroom_id,
      };
      totalData.push(obj);
    }

    for (let i = 0; i < selectedRowsTeacher?.length; i += 1) {
      const obj = {
        email: selectedRowsTeacher[i]?.email,
        classroom_id: selectedRowsTeacher[i]?.classroom_id,
      };
      totalData.push(obj);
    }

    try {
      await ClassAPI.removeUsersClassroom(
        {},
        {
          users: totalData,
        },
      );

      await onGetData(
        page,
        rowsPerPage,
        filterClassName,
        filterTeacherName,
        filterSubjectName,
      );

      openAlert("Users removed!");
      window.location.reload();
    } catch (error) {}

    setLoader(false);
  };

  return (
    <Stack>
      <Alert
        isOpen={alert}
        message={alertMsg}
        type="success"
        handleClose={() => setAlert(false)}
      />
      <Loader isOpen={loader} />
      <Stack
        mb={2}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Select
          value={1}
          // onChange={handleChange}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
          style={{ width: "100px", height: "35px" }}
        >
          <MenuItem value={1}>P1</MenuItem>
          <MenuItem value={2}>P2</MenuItem>
        </Select>
        <Stack direction="row">
          {renderSelect &&
          (selectedRowsTeacher.length > 0 || selectedRowsStudent.length > 0) ? (
            <Stack
              onClick={onRemoveUser}
              ml={1}
              className={mainClassName + "-btn-header"}
            >
              <Typography>{locale(head?.table?.removeUsers)}</Typography>
            </Stack>
          ) : (
            <></>
          )}
          {selectedRows.length > 0 && (
            <>
              <Stack
                onClick={() => openModalInvite(selectedRows)}
                ml={1}
                className={mainClassName + "-btn-header"}
              >
                <Typography>+ {locale(head?.header?.teacher)}</Typography>
              </Stack>
              <Stack
                onClick={() => openModalInvite(selectedRows)}
                ml={1}
                className={mainClassName + "-btn-header"}
              >
                <Typography>+ {locale(head?.header?.student)}</Typography>
              </Stack>
            </>
          )}
          {selectedRows.length > 1 && (
            <Stack ml={1} className={mainClassName + "-btn-header"}>
              <Typography>{locale(head?.table?.classComparison)}</Typography>
            </Stack>
          )}
          <Stack
            onClick={() => setModal(true)}
            ml={1}
            className={mainClassName + "-btn-header"}
          >
            <Typography>+ {locale(head?.header?.classroomplus)}</Typography>
          </Stack>
        </Stack>
      </Stack>
      <Stack mb={2} direction="row" justifyContent="space-between">
        <Stack direction="row" alignItems="center">
          <Stack
            mr={2}
            className={mainClassName + "-table-filter-label-wrapper"}
          >
            <Stack className={mainClassName + "-table-filter-label"}>
              <Typography color="#595959">
                {locale(head?.header?.classroom)}
              </Typography>
            </Stack>
            <input
              value={filterClassName}
              onChange={(e) => setFilterClassName(e?.target?.value)}
              className={mainClassName + "-search-input"}
              placeholder={locale(head?.header?.filterClassroom)}
            />
          </Stack>
          <Stack
            mr={2}
            className={mainClassName + "-table-filter-label-wrapper"}
          >
            <Stack className={mainClassName + "-table-filter-label"}>
              <Typography color="#595959">
                {locale(head?.header?.teacher)}
              </Typography>
            </Stack>
            <input
              value={filterTeacherName}
              onChange={(e) => setFilterTeacherName(e?.target?.value)}
              className={mainClassName + "-search-input"}
              placeholder={locale(head?.header?.filterTeacher)}
            />
          </Stack>
          <Stack className={mainClassName + "-table-filter-label-wrapper"}>
            <Stack className={mainClassName + "-table-filter-label"}>
              <Typography color="#595959">
                {locale(head?.header?.subject)}
              </Typography>
            </Stack>
            <input
              value={filterSubjectName}
              onChange={(e) => setFilterSubjectName(e?.target?.value)}
              className={mainClassName + "-search-input"}
              placeholder={locale(head?.header?.filterSubject)}
            />
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center">
          <Stack
            onClick={onClear}
            mr={2}
            className={mainClassName + "-btn-clear"}
          >
            <Typography color="#595959">
              {locale(head?.header?.clear)}
            </Typography>
          </Stack>
          <Stack onClick={onSearch} className={mainClassName + "-btn-search"}>
            <Typography color="#FFF">{locale(head?.header?.search)}</Typography>
          </Stack>
        </Stack>
      </Stack>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead className={mainClassName + "-table-header"}>
            <TableRow>
              <TableCell>
                <Checkbox
                  indeterminate={
                    selectedRows.length > 0 &&
                    selectedRows.length < data?.length
                  }
                  checked={selectedRows.length === data?.length}
                  onChange={handleSelectAllClick}
                  className={mainClassName + "-table-header-txt"}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={true}
                  className={mainClassName + "-table-header-txt"}
                >
                  {locale(head?.header?.classroom)} ({data?.length})
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={true}
                  className={mainClassName + "-table-header-txt"}
                >
                  {locale(head?.table?.noTeacher)}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={true}
                  className={mainClassName + "-table-header-txt"}
                >
                  {locale(head?.table?.noStudent)}
                </TableSortLabel>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((row, i) => (
              <React.Fragment key={i}>
                <Row
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  selectedRowsTeacher={selectedRowsTeacher}
                  setSelectedRowsTeacher={setSelectedRowsTeacher}
                  selectedRowsStudent={selectedRowsStudent}
                  setSelectedRowsStudent={setSelectedRowsStudent}
                  row={row}
                  head={head}
                  openModalInvite={openModalInvite}
                  setLoader={setLoader}
                  openAlert={openAlert}
                  renderSelect={renderSelect}
                  setRenderSelect={setRenderSelect}
                />
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack
        direction="row"
        mt={2}
        justifyContent="flex-end"
        alignItems="center"
      >
        <TablePagination
          component="div"
          count={totalData}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Stack className={mainClassName + "-btn-header"}>
          <Typography>{locale(head?.table?.export)}</Typography>
        </Stack>
      </Stack>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleModal}>
          <Stack alignItems="flex-end" p={2}>
            <Stack
              onClick={() => setModal(false)}
              className={mainClassName + "-modal-close"}
            >
              <Typography>x</Typography>
            </Stack>
          </Stack>
          <Typography className={mainClassName + "-subtitle"}>
            {locale(head?.modal?.title)}
          </Typography>
          <Stack alignItems="center" width="100%" mt={2}>
            <TextField
              onChange={(e) => setClassName(e.target.value)}
              sx={{ width: "300px" }}
              id="outlined-basic"
              label={locale(head?.modal?.form)}
              variant="outlined"
            />
          </Stack>
          <Stack pb={4} className={mainClassName + "-form-btn-wrapper"}>
            <Stack
              onClick={onCreateClassroom}
              className={
                mainClassName +
                "-form-btn" +
                (className?.length === 0 ? "-disabled" : "")
              }
            >
              <Typography className={mainClassName + "-form-btn-txt"}>
                {locale(head?.modal?.create)}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={modal2}
        onClose={() => setModal2(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleModal}>
          <Stack alignItems="flex-end" p={2}>
            <Stack
              onClick={() => setModal2(false)}
              className={mainClassName + "-modal-close"}
            >
              <Typography>x</Typography>
            </Stack>
          </Stack>
          <Typography className={mainClassName + "-subtitle"}>
            {locale(head?.modal2?.title)}
          </Typography>
          <Stack alignItems="center" width="100%" mt={2}>
            <TextField
              onChange={(e) => setEmailName(e.target.value)}
              sx={{ width: "300px" }}
              id="outlined-basic"
              label={locale(head?.modal2?.form)}
              variant="outlined"
            />
          </Stack>
          <Stack pb={4} className={mainClassName + "-form-btn-wrapper"}>
            <Stack
              onClick={onInviteUser}
              className={
                mainClassName +
                "-form-btn" +
                (emailName?.length === 0 ? "-disabled" : "")
              }
            >
              <Typography className={mainClassName + "-form-btn-txt"}>
                {locale(head?.modal2?.create)}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </Stack>
  );
}
