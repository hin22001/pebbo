"use client";
import React from "react";

import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import { Box, Stack } from "@mui/material";

function CustomTooltip({ title, children, ...other }) {
  return (
    <Tooltip title={title} {...other}>
      <Stack>{children}</Stack>
    </Tooltip>
  );
}

export default CustomTooltip;
