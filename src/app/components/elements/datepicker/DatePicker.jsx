"use client";
import React from "react";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import { DateTimePicker } from "@mui/x-date-pickers";
import { Helpers } from "@/app/utils";
import { locale } from "@/app/data/locale";
import dayjs from "dayjs";

export default function DatePickerCustom(props) {
  const { useTime, label, value, format, onChange } = props;

  const elementProps = Helpers.filterObjectByKey(props, [
    "label",
    "value",
    "format",
  ]);

  // === Refactor Props ===

  const refactorLabel = locale(label);

  const refactorFormat = format || "DD MMMM YYYY";

  const refactorValue = value ? dayjs(value) : null;

  return (
    // === LocalizationProvider only support EN => ID is not yet supported ===
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {useTime ? (
        // === Date Time Picker need to use "aa" format which is(AM/PM) ===

        <DateTimePicker
          viewRenderers={{
            hours: renderTimeViewClock,
            minutes: renderTimeViewClock,
            seconds: renderTimeViewClock,
          }}
          {...(elementProps || {})}
          label={refactorLabel}
          value={refactorValue}
          format={refactorFormat}
          onChange={onChange}
        />
      ) : (
        <DatePicker
          {...(elementProps || {})}
          label={refactorLabel}
          value={refactorValue}
          format={refactorFormat}
          onChange={onChange}
        />
      )}
    </LocalizationProvider>
  );
}
