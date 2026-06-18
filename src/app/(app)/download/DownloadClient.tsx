"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  assignMainLayout,
  assignAuthentication,
} from "@/app/contexts/redux/actions";
import ContentLayout from "@/layouts/ContentLayout/ContentLayout";
import Image from "next/image";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";

export default function DownloadClient() {
  const dispatch = useDispatch();
  const [mainClassName] = useState("dashboard-page");

  useEffect(() => {
    dispatch(assignAuthentication({}));
    dispatch(assignMainLayout({}));
  }, [dispatch]);

  const columns: GridColDef[] = [
    { field: "device", headerName: "Device", width: 130 },
    { field: "version", headerName: "Supported Version", flex: 1 },
    {
      field: "link",
      headerName: "Link",
      width: 130,
      renderCell: (params) => (
        <a
          href={params.value as string}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Download
        </a>
      ),
    },
  ];

  const rows: GridRowsProp = [
    {
      id: 1,
      device: "Android",
      version: "Android 10(API level 29) or above",
      link: "https://www.google.com",
    },
  ];

  return (
    <ContentLayout
      title="Download Mobile App"
      theme="full light-grey disable-padding disable-border"
      hideTitle={true}
      access={true}
    >
      <main>
        <div className={mainClassName + "-payment-wrapper"}>
          <div>
            <Image
              width={200}
              src={require("@/images/illustration/illustration-mascot-math.png")}
              alt="Image Dashboard"
            />
          </div>
          <div className={mainClassName + "-payment-title"}>
            Download Mobile App
          </div>
          <div style={{ height: 400, width: "50%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10]}
              disableSelectionOnClick
            />
          </div>
        </div>
      </main>
    </ContentLayout>
  );
}

