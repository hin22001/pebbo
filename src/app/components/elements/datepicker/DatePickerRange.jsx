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

export default function DatePickerRange(props) {
  const { labels, placeholder, placeholders, onChange, values } = props;

  const mainClassName = "element-date-picker-range";

  const [selectedDateRange, setSelectedDateRange] = React.useState({
    startDate: "",
    endDate: "",
    // startDate: new Date(),
    // endDate: new Date(),
    key: "selection",
  });

  const [showCalendar, setShowCalendar] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClickTextField = (event) => {
    setAnchorEl(event.target);
    setShowCalendar(!showCalendar);
  };

  const handleSelect = (ranges) => {
    setSelectedDateRange(ranges.selection);
    if (onChange) {
      onChange(ranges.selection);
    }
  };

  React.useEffect(() => {
    if (
      values &&
      (values?.startDate != selectedDateRange.startDate ||
        values?.endDate != selectedDateRange.endDate)
    ) {
      const newDate = {
        startDate: values?.startDate ? new Date(values?.startDate) : "",
        endDate: values?.endDate ? new Date(values?.endDate) : "",
        key: "selection",
      };

      setSelectedDateRange(newDate);
    }
  }, [values, selectedDateRange]);

  React.useEffect(() => {
    if (onChange) {
      onChange(selectedDateRange);
    }
  }, [onChange, selectedDateRange]);

  const dateLocale = Helpers.getCurrentLanguage() == "id" ? "in" : "en";
  const options = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return (
    <div className={mainClassName}>
      <Stack direction="row" spacing={2}>
        <TextField
          placeholder={placeholder || placeholders?.startDate || ""}
          label={locale(labels?.startDate) || getLabel({ name: "startDate" })}
          fullWidth={true}
          value={
            typeof selectedDateRange?.startDate == "object"
              ? selectedDateRange?.startDate?.toLocaleDateString(
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
        <TextField
          placeholder={placeholder || placeholders?.endDate || ""}
          label={locale(labels?.endDate) || getLabel({ name: "endDate" })}
          fullWidth={true}
          value={
            typeof selectedDateRange?.endDate == "object"
              ? selectedDateRange?.endDate?.toLocaleDateString(
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
          showMonthAndYearPickers={true}
          ranges={[selectedDateRange]}
          locale={locales[Helpers.getCurrentLanguage() || "id"]}
        />
      </Popover>
    </div>
  );
}
