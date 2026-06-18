import { Stack, Typography } from "@mui/material";
import React from "react";

export default function CustomSelect(props) {
  let { label, onClick } = props;

  const mainClassName = "dashboard-page";
  return (
    <Stack onClick={onClick} className={mainClassName + "-form-btn"}>
      <Typography className={mainClassName + "-form-btn-txt"}>
        {label}
      </Typography>
    </Stack>
  );
}
