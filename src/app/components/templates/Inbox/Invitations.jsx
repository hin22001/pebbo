import React, { useEffect, useState } from "react";
import { getDataHead } from "@/src/app/data/head";
import Loader from "@/elements/loader/Loader";
import UserAPI from "../../../data/api/UserAPI";
import { Card, Typography, Stack, TablePagination } from "@mui/material";
import ClassAPI from "../../../data/api/ClassAPI";

export default function Invitations() {
  const [loader, setLoader] = useState(false);
  const [head, setHead] = useState(null);
  const [data, setData] = useState(null);
  const [pageContext, setPageContext] = useState(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(10);

  const mainClassName = "inbox-page";

  const getInvitations = async () => {
    const res = await ClassAPI.getClassroomInvitations(
      {
        page_number: pageNumber + 1,
        rows_per_page: rowPerPage,
        order: "desc",
      },
      {},
    );

    setData(res?.payload?.data?.invitations);
    setPageContext(res?.payload?.data?.page_context);
  };

  const accInvitations = async (val) => {
    setLoader(true);
    await ClassAPI.acceptClassroomInvitation(
      {},
      {
        id: val?.id,
        classroom_id: val?.classroom?.classroom_id,
      },
    );

    await getInvitations();
    setLoader(false);
  };

  const initialize = async () => {
    try {
      setLoader(true);

      let head = await getDataHead({ name: "headDashboardPage" });
      await getInvitations();

      setHead(head);
      setLoader(false);
    } catch (err) {}
  };

  const handleChangePage = async (event, newPage) => {
    setPageNumber(newPage);

    setLoader(true);
    await getInvitations();
    setLoader(false);
  };

  const handleChangeRowsPerPage = async (event) => {
    const rowsPerPage = parseInt(event.target.value, 10);
    setRowPerPage(rowsPerPage);
    setPageNumber(0);

    setLoader(true);
    await getInvitations();
    setLoader(false);
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <Loader isOpen={loader} />
      <Card className={mainClassName + "-card"}>
        <Stack width="100%">
          {data?.map((val, i) => (
            <Stack key={i} className={mainClassName + "-row"}>
              <Typography>
                Classroom: {val?.classroom?.classroom_name}
              </Typography>
              {val?.confirmed ? (
                <Stack className={mainClassName + "-btnAccepted"}>
                  <Typography className={mainClassName + "-btnAccept-txt"}>
                    Accepted
                  </Typography>
                </Stack>
              ) : (
                <Stack
                  onClick={() => accInvitations(val)}
                  className={mainClassName + "-btnAccept"}
                >
                  <Typography className={mainClassName + "-btnAccept-txt"}>
                    Accept
                  </Typography>
                </Stack>
              )}
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
