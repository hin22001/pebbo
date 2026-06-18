"use client";
import React from "react";
import Popover from "@mui/material/Popover";
import { IconButton, Button } from "..";
import { Stack } from "@mui/material";

function CustomPopover(props) {
  const { icon, children, label, button, sx } = props;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const mainClassName = "element-icon-popover";

  return (
    <Stack className={mainClassName} sx={sx}>
      <Stack onClick={handleClick} aria-describedby={id}>
        {label || button ? (
          <Button startIcon={icon} label={label} {...(button || {})} />
        ) : (
          <IconButton icon={icon} />
        )}
      </Stack>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Stack className={mainClassName + "-content"}>{children}</Stack>
      </Popover>
    </Stack>
  );
}

export default CustomPopover;
