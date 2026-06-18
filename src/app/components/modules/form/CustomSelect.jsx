import { Select, Stack, Typography, MenuItem } from "@mui/material";
import React from "react";
import { ImageHandler } from "../../elements";

export default function CustomSelect(props) {
  let {
    label,
    setValue,
    setModalOpen,
    isOpen,
    selectedValue,
    option,
    alignContent,
    alignLabel,
    multiple,
    placeholder,
  } = props;

  const mainClassName = "dashboard-page";

  const getArrString = (arr) => {
    let str = "";
    for (let i = 0; i < arr?.length; i += 1) {
      if (i === 0) {
        str = arr[i];
      } else {
        str = str + ", " + arr[i];
      }
    }

    return str;
  };

  return (
    <Stack direction="row" className={mainClassName + "-form-row"}>
      {label && (
        <Stack
          className={
            mainClassName +
            "-form-label" +
            (alignLabel === "start" ? "-start" : "")
          }
        >
          <Typography className={mainClassName + "-form-text"}>
            {label}
          </Typography>
        </Stack>
      )}
      <Stack className={mainClassName + "-form-input"}>
        <Stack className={mainClassName + "-form-input-select-front-wrapper"}>
          <Stack
            direction="row"
            onClick={() => setModalOpen(true)}
            className={mainClassName + "-form-input-select-front"}
          >
            <Stack
              className={
                mainClassName +
                "-form-input-select-front-inner-wrapper" +
                (alignContent === "start" ? "-start" : "")
              }
            >
              <Stack
                className={
                  mainClassName +
                  (selectedValue?.length > 0
                    ? "-form-input-select-front-inner"
                    : "")
                }
              >
                {selectedValue?.length === 0 || selectedValue === null ? (
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
                    {multiple
                      ? selectedValue?.join(", ")
                      : option?.find((val) => val?.value === selectedValue)
                          ?.label}
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
        <Select
          className={mainClassName + "-form-input-select"}
          value={selectedValue}
          onChange={(e) => setValue(e.target?.value)}
          displayEmpty
          open={isOpen}
          onClose={() => setModalOpen(false)}
          multiple={multiple}
        >
          {option.map((val, i) => (
            <MenuItem key={i} value={val.value}>
              {val.label}
            </MenuItem>
          ))}
        </Select>
        <Stack />
      </Stack>
    </Stack>
  );
}
