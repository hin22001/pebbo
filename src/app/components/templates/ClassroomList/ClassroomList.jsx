import React, { useEffect, useState } from "react";
import { getDataHead } from "@/src/app/data/head";
import Loader from "@/elements/loader/Loader";
import UserAPI from "../../../data/api/UserAPI";
import { Card, Typography, Stack, TablePagination } from "@mui/material";
import ClassAPI from "../../../data/api/ClassAPI";
import { useRouter } from "next/navigation";
export default function ClassroomList(props) {
  const [loader, setLoader] = useState(false);
  const [head, setHead] = useState(null);
  const [data, setData] = useState(null);
  const [pageContext, setPageContext] = useState(null);
  const router = useRouter();
  const [pageNumber, setPageNumber] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(10);

  const mainClassName = "inbox-page";

  const getClassroom = async () => {
    const res = await ClassAPI.getConfirmedClassroom(
      {
        page_number: pageNumber + 1,
        rows_per_page: rowPerPage,
        order: "desc",
      },
      {},
    );

    setData(res?.payload?.data?.classrooms);
    setPageContext(res?.payload?.data?.page_context);
  };

  const initialize = async () => {
    try {
      setLoader(true);

      let head = await getDataHead({ name: "headDashboardPage" });
      await getClassroom();

      setHead(head);
      setLoader(false);
    } catch (err) {}
  };

  const handleChangePage = async (event, newPage) => {
    setPageNumber(newPage);

    setLoader(true);
    await getClassroom();
    setLoader(false);
  };

  const handleChangeRowsPerPage = async (event) => {
    const rowsPerPage = parseInt(event.target.value, 10);
    setRowPerPage(rowsPerPage);
    setPageNumber(0);

    setLoader(true);
    await getClassroom();
    setLoader(false);
  };

  useEffect(() => {
    initialize();
  }, []);

  const detailRoute = props?.role === "teacher" ? "add-quiz" : "student/detail";

  return (
    <>
      <Loader isOpen={loader} />
      <Card className={mainClassName + "-card"}>
        <Stack width="100%">
          {data?.map((val, i) => (
            <Stack
              onClick={(e) =>
                router.push(
                  "/classroom/" + detailRoute + `?id=${val?.classroom_id}`,
                )
              }
              key={i}
              className={mainClassName + "-row"}
            >
              <Typography>Classroom: {val?.classroom_name}</Typography>
              <Stack
                onClick={() => {}}
                className={mainClassName + "-btnAccept"}
              >
                <Typography className={mainClassName + "-btnAccept-txt"}>
                  Detail
                </Typography>
              </Stack>
            </Stack>
          ))}

          <TablePagination
            component="div"
            count={pageContext?.total_rows}
            page={pageNumber}
            onPageChange={handleChangePage}
            rowsPerPage={rowPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Stack>
      </Card>
    </>
  );
}
