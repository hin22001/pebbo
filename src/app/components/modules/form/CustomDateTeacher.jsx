import { Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import React, { useState } from "react";
import { ImageHandler } from "../../elements";
import dayjs from "dayjs";

export default function CustomSelect(props) {
  let { placeholder, alignContent, selectedDate, setSelectedDate } = props;

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    handleClose();
  };

  const mainClassName = "custom-form-teacher";
  return (
    <Stack className={mainClassName + "-form-input"}>
      <Stack className={mainClassName + "-form-input-select-front-wrapper"}>
        <Stack
          direction="row"
          onClick={() => setIsOpen(true)}
          className={mainClassName + "-form-input-select-front"}
        >
          <Stack
            className={
              mainClassName +
              "-form-input-select-front-inner-wrapper-" +
              (alignContent ? alignContent : "start")
            }
          >
            <Stack
              className={
                mainClassName +
                (selectedDate ? "-form-input-select-front-inner" : "")
              }
            >
              {selectedDate === null ? (
                <Typography
                  className={
                    mainClassName + "-form-input-select-front-placeholder"
                  }
                >
                  {placeholder}
                </Typography>
              ) : (
                <Typography
                  className={mainClassName + "-form-input-select-front-value"}
                >
                  {dayjs(selectedDate).format("DD/MM/YYYY")}
                </Typography>
              )}
            </Stack>
          </Stack>
          <ImageHandler
            src={require("@/images/icon/icon-purple-arrow-down.svg")}
            alt="ico-down"
            className={mainClassName + "-ico-down"}
          />
        </Stack>
      </Stack>
      <Stack className={mainClassName + "-form-input-select"}>
        <DatePicker
          value={selectedDate}
          onChange={handleDateChange}
          open={isOpen}
          onClose={handleClose}
          height="1px"
          style={{ height: "1px", marginTop: "-8px", visibility: "hidden" }}
        />
      </Stack>
      <Stack />
    </Stack>
  );
}
