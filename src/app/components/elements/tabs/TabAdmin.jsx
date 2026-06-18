"use client";
import { Stack, Typography } from "@mui/material";
import React from "react";

export default function TabAdmin(props) {
  const { switchTab, tabValue, tabList } = props;

  const mainClassName = "element-tabs";

  return (
    <Stack mt={2} mb={-2} direction="row" justifyContent="center">
      {tabList?.map((val, i) => (
        <Stack
          key={i}
          onClick={() => switchTab(i + 1)}
          className={
            mainClassName + `-tab-btn-${tabValue !== i + 1 ? "in" : ""}active`
          }
        >
          <Typography
            className={
              mainClassName +
              `-tab-btn-${tabValue !== i + 1 ? "in" : ""}active-text`
            }
          >
            {val}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
