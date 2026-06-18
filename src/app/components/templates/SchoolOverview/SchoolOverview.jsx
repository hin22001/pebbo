import React, { Component, useEffect, useState } from "react";
import { getDataHead } from "@/src/app/data/head";
import {
  Card,
  Stack,
  Typography,
  TextField,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TableSortLabel,
} from "@mui/material";
import AdminCard from "@/modules/card/AdminCard";
import { ContentLayout } from "@/layouts/ContentLayout";
import Image from "next/image";
import { TabAdmin } from "../../elements";
import { locale } from "@/src/app/data/locale";
import SchoolOverviewAPI from "../../../data/api/SchoolOverviewAPI";

const defaultOverviewState = (initialOverview) => {
  if (!initialOverview || !Array.isArray(initialOverview)) return null;
  const byRole = (role) =>
    initialOverview.find((val) => val?.role === role)?.role_count ?? null;
  return {
    teachers: byRole("teacher"),
    students: byRole("student"),
    admin: byRole("admin"),
  };
};

export default function SchoolOverview({
  initialOverview = null,
  initialLicenses = null,
} = {}) {
  const derived = defaultOverviewState(initialOverview);
  const [tabOverview, setTabOverview] = useState(1);
  const [head, setHead] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState("ABC Primary School");
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [password, setPassword] = useState("123456");
  const [schoolOverviewTeachers, setSchoolOverviewTeachers] = useState(
    derived?.teachers ?? null,
  );
  const [schoolOverviewStudents, setSchoolOverviewStudents] = useState(
    derived?.students ?? null,
  );
  const [schoolOverviewAdmin, setSchoolOverviewAdmin] = useState(
    derived?.admin ?? null,
  );
  const [schoolLicenses, setSchoolLicenses] = useState(initialLicenses ?? null);

  const mainClassName = "school-overview-page";

  const switchOverviewTab = (id) => {
    setTabOverview(id);
  };

  const getSchoolOverview = async () => {
    const data = await SchoolOverviewAPI.getSchoolOverview();
    const finalData = data?.payload?.data;
    setSchoolOverviewTeachers(
      finalData.find((val) => val?.role === "teacher")?.role_count,
    );
    setSchoolOverviewStudents(
      finalData.find((val) => val?.role === "student")?.role_count,
    );
    setSchoolOverviewAdmin(
      finalData.find((val) => val?.role === "admin")?.role_count,
    );
  };

  const getSchoolLicenses = async () => {
    const data = await SchoolOverviewAPI.getLicenses();
    setSchoolLicenses(data?.payload?.data);
  };

  useEffect(() => {
    const head = getDataHead({
      name: "headAdminSchoolOverview",
    });
    setHead(head);
    if (!initialOverview) getSchoolOverview();
    if (!initialLicenses) getSchoolLicenses();
  }, []);

  return (
    <ContentLayout title="" hideTitle={true}>
      <AdminCard>
        <Stack>
          <TabAdmin
            switchTab={switchOverviewTab}
            tabValue={tabOverview}
            tabList={[
              locale(head?.header.schoolOverview),
              locale(head?.header.licenses),
              locale(head?.header.yourAccount),
              locale(head?.header.otherSetting),
            ]}
          />
          <Card className={mainClassName + "-card"}>
            {tabOverview === 1 ? (
              <Stack p={2}>
                <Stack direction="row" alignItems="center">
                  <Stack className={mainClassName + "-ava-card"}>
                    <Image
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/681px-Placeholder_view_vector.svg.png"
                      alt="img-ava"
                      width={200}
                      height={200}
                      style={{ borderRadius: "100px" }}
                    />
                  </Stack>
                  <Stack
                    width="100%"
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                  >
                    {isEdit ? (
                      <>
                        <TextField
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={mainClassName + "-input"}
                          id="outlined-basic"
                          label=""
                          variant="outlined"
                        />
                        <Stack
                          onClick={() => setIsEdit(false)}
                          ml={2}
                          className={mainClassName + "-form-btn"}
                        >
                          <Typography
                            className={mainClassName + "-form-btn-txt"}
                          >
                            {locale(head?.content.update)}
                          </Typography>
                        </Stack>
                      </>
                    ) : (
                      <>
                        <Typography
                          color="#565656"
                          fontWeight="bold"
                          fontSize={40}
                        >
                          {name}
                        </Typography>
                        <Stack
                          onClick={() => setIsEdit(true)}
                          ml={2}
                          className={mainClassName + "-btn-edit"}
                        >
                          <Typography
                            color="#8F8F8F"
                            fontWeight="bold"
                            fontSize={12}
                          >
                            {locale(head?.content.edit)}
                          </Typography>
                        </Stack>
                      </>
                    )}
                  </Stack>
                </Stack>
                {schoolOverviewTeachers && (
                  <Stack mt={10} className={mainClassName + "-info-row"}>
                    <Stack
                      width="50%"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Typography color="#565656">
                        {locale(head?.content.teachers)}
                      </Typography>
                    </Stack>
                    <Stack
                      width="50%"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Typography color="#565656">
                        {schoolOverviewTeachers}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
                {schoolOverviewStudents && (
                  <Stack className={mainClassName + "-info-row"}>
                    <Stack
                      width="50%"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Typography color="#565656">
                        {locale(head?.content.students)}
                      </Typography>
                    </Stack>
                    <Stack
                      width="50%"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Typography color="#565656">
                        {schoolOverviewStudents}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
                {schoolOverviewAdmin && (
                  <Stack className={mainClassName + "-info-row"}>
                    <Stack
                      width="50%"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Typography color="#565656">
                        {locale(head?.content.admins)}
                      </Typography>
                    </Stack>
                    <Stack
                      width="50%"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Typography color="#565656">
                        {schoolOverviewAdmin}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
              </Stack>
            ) : tabOverview === 2 ? (
              <Stack p={2}>
                <Stack mb={10} direction="row" alignItems="center">
                  <Stack className={mainClassName + "-ava-card"}>
                    <Image
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/681px-Placeholder_view_vector.svg.png"
                      alt="img-ava"
                      width={200}
                      height={200}
                      style={{ borderRadius: "100px" }}
                    />
                  </Stack>
                  <Stack
                    width="100%"
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Typography color="#565656" fontWeight="bold" fontSize={40}>
                      {name}
                    </Typography>
                  </Stack>
                </Stack>
                <TableContainer component={Paper}>
                  <Table aria-label="collapsible table">
                    <TableHead className={mainClassName + "-table-header"}>
                      <TableRow>
                        <TableCell
                          align="center"
                          className={mainClassName + "-table-header-txt"}
                        >
                          {locale(head?.content.noTeachers)}
                        </TableCell>
                        <TableCell
                          align="center"
                          className={mainClassName + "-table-header-txt"}
                        >
                          {locale(head?.content.noLicenses)}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow key={1} hover>
                        <TableCell align="center">
                          {schoolLicenses?.teacher_count}
                        </TableCell>
                        <TableCell align="center">
                          {schoolLicenses?.teacher_licenses}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Stack mt={2}>
                  <TableContainer component={Paper}>
                    <Table aria-label="collapsible table">
                      <TableHead className={mainClassName + "-table-header"}>
                        <TableRow>
                          <TableCell
                            align="center"
                            className={mainClassName + "-table-header-txt"}
                          >
                            {locale(head?.content.noAdmins)}
                          </TableCell>
                          <TableCell
                            align="center"
                            className={mainClassName + "-table-header-txt"}
                          >
                            {locale(head?.content.noLicenses)}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow key={1} hover>
                          <TableCell align="center">
                            {schoolLicenses?.admin_count}
                          </TableCell>
                          <TableCell align="center">
                            {schoolLicenses?.admin_licenses}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </Stack>
            ) : (
              <Stack p={2}>
                <Stack mb={10} direction="row" alignItems="center">
                  <Stack className={mainClassName + "-ava-card"}>
                    <Image
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/681px-Placeholder_view_vector.svg.png"
                      alt="img-ava"
                      width={200}
                      height={200}
                      style={{ borderRadius: "100px" }}
                    />
                  </Stack>
                  <Stack
                    width="100%"
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Typography color="#565656" fontWeight="bold" fontSize={40}>
                      {name}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack width="100%" alignItems="center">
                  <Stack mb={1}>
                    <Typography fontSize={18} fontWeight="600">
                      {locale(head?.content.firstName)}
                    </Typography>
                    <TextField
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={mainClassName + "-input"}
                      id="outlined-basic"
                      label=""
                      variant="outlined"
                    />
                  </Stack>
                  <Stack mb={1}>
                    <Typography fontSize={18} fontWeight="600">
                      {locale(head?.content.lastName)}
                    </Typography>
                    <TextField
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={mainClassName + "-input"}
                      id="outlined-basic"
                      label=""
                      variant="outlined"
                    />
                  </Stack>
                  <Stack mb={1}>
                    <Typography fontSize={18} fontWeight="600">
                      {locale(head?.content.password)}
                    </Typography>
                    <TextField
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={mainClassName + "-input"}
                      id="outlined-basic"
                      label=""
                      variant="outlined"
                      type="password"
                    />
                  </Stack>
                  <Stack mt={3} className={mainClassName + "-form-btn"}>
                    <Typography className={mainClassName + "-form-btn-txt"}>
                      {locale(head?.content.update)}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Card>
        </Stack>
      </AdminCard>
    </ContentLayout>
  );
}
