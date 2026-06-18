"use client";
import React from "react";
import { DateRangePicker } from "react-date-range";
import { addDays } from "date-fns";
import * as locales from "react-date-range/dist/locale";
import { Typography, Stack, Divider } from "@mui/material";
import { locale } from "@/app/data/locale";

export default function DatePickerRangeFull(props) {
  const mainClassName = "element-date-picker-range-full";

  const { onChange, values, label, error, startDateOffset, endDateOffset } =
    props;

  const lang = Helpers.getCurrentLanguage() || "id";

  const [state, setState] = React.useState({
    startDate: new Date(),
    endDate: addDays(new Date(), 7),
    key: "selection",
  });

  React.useEffect(() => {
    if (
      values &&
      (values?.startDate != state.startDate || values?.endDate != state.endDate)
    ) {
      const newDate = {
        startDate: values?.startDate ? new Date(values?.startDate) : new Date(),
        endDate: values?.endDate
          ? new Date(values?.endDate)
          : addDays(new Date(), 7),
        key: "selection",
      };

      setState(newDate);
    }
  }, [values, state]);

  return (
    <Stack
      className={
        mainClassName + (error?.startDate || error?.endDate ? " error " : "")
      }
    >
      {(label || error) && (
        <Stack className={mainClassName + "-header"} spacing={2}>
          {label && (
            <Typography variant="body-xs" component="label">
              {locale(label)}
            </Typography>
          )}
          {error?.startDate && (
            <Typography variant="caption" component="label">
              {locale(error?.startDate)}
            </Typography>
          )}
          {error?.endDate && (
            <Typography variant="caption" component="label">
              {locale(error?.endDate)}
            </Typography>
          )}
          <Divider />
        </Stack>
      )}
      <DateRangePicker
        onChange={(item) => {
          const newState = item.selection;

          setState(newState);

          if (onChange) {
            onChange(newState);
          }
        }}
        showSelectionPreview={true}
        moveRangeOnFirstSelection={false}
        months={2}
        ranges={[state]}
        direction="horizontal"
        locale={locales[lang]}
        startDateOffset={startDateOffset}
        endDateOffset={endDateOffset}
      />
    </Stack>
  );
}
