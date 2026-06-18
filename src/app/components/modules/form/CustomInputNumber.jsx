import { Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import React, { useState } from "react";
import { ImageHandler } from "../../elements";
import dayjs from "dayjs";

export default function CustomInputNumber(props) {
  let { placeholder, alignContent, value, onChange } = props;

  const mainClassName = "custom-form-teacher";
  return (
    <Stack className={mainClassName + "-form-input"}>
      <Stack className={mainClassName + "-form-input-select-front-wrapper"}>
        <Stack
          direction="row"
          className={mainClassName + "-form-input-select-front-no-pointer"}
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
                mainClassName + (value ? "-form-input-select-front-inner" : "")
              }
            >
              {value === null ? (
                <Typography color="#C7C7C7" fontSize={14} fontWeight={400}>
                  {placeholder}
                </Typography>
              ) : (
                <Typography
                  className={mainClassName + "-form-input-select-front-value"}
                >
                  {value}
                </Typography>
              )}
            </Stack>
          </Stack>
          <Stack className={mainClassName + "-btn-gradient"}>
            <Stack onClick={() => onChange("up")}>
              <ImageHandler
                src={require("@/images/icon/icon-arrow-up.svg")}
                alt="ico-up"
                className={mainClassName + "-btn-cursor"}
              />
            </Stack>
            <Stack onClick={() => onChange("down")}>
              <ImageHandler
                src={require("@/images/icon/icon-arrow-down.svg")}
                alt="ico-down"
                className={mainClassName + "-btn-cursor"}
              />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
