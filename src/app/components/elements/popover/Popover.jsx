"use client";
import React from "react";
import Popover from "@mui/material/Popover";
import { IconCustom } from "..";

function CustomPopover(props) {
  const {
    handleClickModalEdit,
    handleDelete,
    isAnchorEl,
    handleClickDetail,
    handleCloseDetail,
    idValue,
    idKey,
  } = props;

  const handleClick = (event) => {
    handleClickDetail(event, idKey, idValue);
    // setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    handleCloseDetail(null);
    // setAnchorEl(null);
  };

  const handleClickEdit = async (event) => {
    handleClickModalEdit(Number(idKey), idValue);
  };

  const handleClickDelete = async (event) => {
    handleDelete();
  };

  const open = Boolean(isAnchorEl);
  const id = open ? "simple-popover" : undefined;
  return (
    <div>
      <div onClick={handleClick}>
        <IconCustom icon="detail" />
      </div>
      <Popover
        id={id}
        open={open}
        className="popover-mobile"
        anchorEl={isAnchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <div className="icons" onClick={handleClickEdit}>
          <IconCustom icon="pen" />
          <span>Ubah</span>
        </div>

        <div className="icons" onClick={handleClickDelete}>
          <IconCustom icon="trash" />
          <span>Hapus</span>
        </div>
      </Popover>
    </div>
  );
}

export default CustomPopover;
