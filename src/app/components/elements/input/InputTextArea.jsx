"use client";
import React from "react";
import { makeStyles } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import TextareaAutosize from "@mui/material/TextareaAutosize";

function TextArea() {
  return (
    <TextareaAutosize
      aria-label="minimum height"
      rowsMin={3}
      placeholder="Minimum 3 rows"
    />
  );
}

export default function InputTextArea(props) {
  const {
    defaultValue,
    label,
    disabled,
    changeHandler,
    placeholder,
    row,
    name,
    id,
    disableRow,
    maxRows,
  } = props;
  const [value, setValue] = React.useState("Controlled");

  const handleChange = (event) => {
    setValue(event.target.value);
    changeHandler(event);
  };

  return (
    <TextField
      id={id ? id : "filled-multiline-static"}
      className={
        "input input-basic input-text-area " + (disabled ? "disabled" : "")
      }
      label={label}
      name={name}
      multiline
      rows={row ? row : disableRow ? "" : 4}
      maxRows={maxRows}
      placeholder={placeholder}
      onChange={handleChange}
      defaultValue={defaultValue}
      disabled={disabled}
      variant="outlined"
      value={props.value}
    />
  );
}
