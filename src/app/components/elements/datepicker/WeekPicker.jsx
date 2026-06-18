"use client";
import { getLabel, locale } from "@/app/data/locale";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import {
  InputAdornment,
  Popover,
  Stack,
  TextField,
  IconButton,
} from "@mui/material";
import React from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import * as locales from "react-date-range/dist/locale";
import { Helpers } from "@/app/utils";
import dayjs from "dayjs";
import { ConfigComponents } from "@/src/app/constant";

export default function DatePickerRange(props) {
  const weekday = require("dayjs/plugin/weekday");
  dayjs.extend(weekday);
  const { labels, placeholder, placeholders, onChange, values } = props;

  const mainClassName = "element-date-picker-range";

  const [selectedDateRange, setSelectedDateRange] = React.useState({
    startDate: new Date(dayjs().weekday(1).format("LL")),
    endDate: new Date(dayjs().weekday(5).format("LL")),
    key: "selection",
  });

  const [showCalendar, setShowCalendar] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClickTextField = (event) => {
    setAnchorEl(event.target);
    setShowCalendar(!showCalendar);
  };

  const handleSelect = (ranges) => {
    const isStartDateUnchanged = dayjs(ranges?.selection?.startDate).isSame(
      dayjs(selectedDateRange?.startDate),
    );

    const isEndDateUnchanged = dayjs(ranges?.selection?.endDate).isSame(
      dayjs(selectedDateRange?.endDate),
    );

    let startDate, endDate, refactorDate;

    if (!isStartDateUnchanged) {
      startDate = new Date(
        dayjs(ranges?.selection?.startDate).weekday(1).format("LL"),
      );

      endDate = new Date(
        dayjs(ranges?.selection?.startDate).weekday(5).format("LL"),
      );

      refactorDate = {
        ...(ranges?.selection || {}),
        startDate,
        endDate,
      };
    } else if (!isEndDateUnchanged) {
      startDate = new Date(
        dayjs(ranges?.selection?.endDate).weekday(1).format("LL"),
      );

      endDate = new Date(
        dayjs(ranges?.selection?.endDate).weekday(5).format("LL"),
      );

      refactorDate = {
        ...(ranges?.selection || {}),
        startDate,
        endDate,
      };
    }

    setSelectedDateRange(refactorDate);
    setShowCalendar(false);
    if (onChange) {
      onChange(refactorDate);
    }
  };

  React.useEffect(() => {
    if (
      values &&
      (values?.startDate != selectedDateRange.startDate ||
        values?.endDate != selectedDateRange.endDate)
    ) {
      const newDate = {
        startDate: values?.startDate
          ? new Date(dayjs(values?.startDate).weekday(1).format("LL"))
          : new Date(dayjs().weekday(1).format("LL")),
        endDate: values?.endDate
          ? new Date(dayjs(values?.startDate).weekday(5).format("LL"))
          : new Date(dayjs().weekday(5).format("LL")),
        key: "selection",
      };

      setSelectedDateRange(newDate);
    }
  }, [values, selectedDateRange]);

  // React.useEffect(() => {
  //   if (onChange) {
  //     onChange(selectedDateRange)
  //   }
  // }, [onChange, selectedDateRange])

  const dateLocale = Helpers.getCurrentLanguage();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return (
    <Stack
      className={mainClassName}
      sx={{
        width: "400px",
      }}
    >
      <Stack direction="row" spacing={2}>
        <TextField
          placeholder={placeholder || placeholders?.startDate || ""}
          label={getLabel({ name: "date" })}
          fullWidth={true}
          value={
            typeof selectedDateRange?.startDate == "object"
              ? selectedDateRange?.startDate?.toLocaleDateString(
                  dateLocale,
                  options,
                ) +
                " - " +
                selectedDateRange?.endDate?.toLocaleDateString(
                  dateLocale,
                  options,
                )
              : ""
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickTextField}>
                  <CalendarMonth />
                </IconButton>
              </InputAdornment>
            ),
          }}
          onClick={handleClickTextField}
        />
      </Stack>
      <Popover
        className={mainClassName + "-popover-calendar"}
        open={showCalendar}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={() => setShowCalendar(false)}
      >
        <DateRange
          editableDateInputs={true}
          onChange={handleSelect}
          moveRangeOnFirstSelection={false}
          showPreview={false}
          showSelectionPreview={false}
          showMonthAndYearPickers={true}
          ranges={[selectedDateRange]}
          locale={locales[Helpers.getCurrentLanguage() || "id"]}
          minDate={ConfigComponents.DatePicker?.minDate}
          maxDate={ConfigComponents.DatePicker?.maxDate}
          disabledDay={(date) => {
            const isDisabled = dayjs(date).day() < 1 || dayjs(date).day() > 5;

            return isDisabled;
          }}
        />
      </Popover>
    </Stack>
  );
}
// import React from 'react'

// export default function WeekPicker() {
//   return (
//     <div>WeekPicker</div>
//   )
// }
