"use client";
import React from "react";
import TextField from "@mui/material/TextField";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { getLabel, locale } from "@/app/data/locale";
import { Stack } from "@mui/material";
import moment from "moment";

export default function DatePickerRangeUncontrolled(props) {
  const mainClassName = "element-date-picker-range-uncontrolled";

  const {
    labels,
    format,
    values,
    placeholder,
    placeholders,
    onChange,
    error,
    helperText,
    disabled,
  } = props;

  const dateFormat = format || "DD MMMM YYYY";

  const [selectedDateRange, setSelectedDateRange] = React.useState({
    startDate: null,
    endDate: null,
  });

  const initialStateOfValidation = {
    startDate: {
      error: false,
      helperText: "",
    },
    endDate: {
      error: false,
      helperText: "",
    },
  };

  const [validationMessage, setValidationMessage] = React.useState(
    initialStateOfValidation,
  );

  const validate = (newSelectedDateRange, type) => {
    try {
      let newValidationMessage = {
        ...(initialStateOfValidation || {}),
      };

      let isValid = true;

      if (newSelectedDateRange.startDate && newSelectedDateRange.endDate) {
        if (
          moment(newSelectedDateRange.startDate, dateFormat)?.isAfter(
            moment(newSelectedDateRange.endDate, dateFormat),
          )
        ) {
          // ==== Error Happen ====
          if (
            (type ? type == "startDate" : true) &&
            moment(newSelectedDateRange.startDate, dateFormat)?.isAfter(
              moment(newSelectedDateRange.endDate, dateFormat),
            )
          ) {
            newValidationMessage["startDate"] = {
              error: true,
              helperText: getLabel({ name: "startDateError" }),
            };
          }
          if (
            (type ? type == "endDate" : true) &&
            moment(newSelectedDateRange.endDate, dateFormat)?.isBefore(
              moment(newSelectedDateRange.startDate, dateFormat),
            )
          ) {
            newValidationMessage["endDate"] = {
              error: true,
              helperText: getLabel({ name: "endDateError" }),
            };
          }
          isValid = false;
        }

        if (
          moment(newSelectedDateRange.startDate)?.format(dateFormat) ==
          moment(newSelectedDateRange.endDate)?.format(dateFormat)
        ) {
          newValidationMessage = {
            ...(initialStateOfValidation || {}),
          };
          isValid = true;
        }
      }

      setValidationMessage(newValidationMessage);
      return isValid;
    } catch (err) {}
  };

  const handleChangeDate = async (type, newValue) => {
    try {
      const newSelectedDateRange = {
        ...(selectedDateRange || {}),
        [type]: newValue,
      };
      setSelectedDateRange(newSelectedDateRange);

      const isValid = validate(newSelectedDateRange, type);

      if (isValid && onChange) {
        await onChange(newSelectedDateRange);
      }
    } catch (err) {}
  };

  React.useEffect(() => {
    if (
      values &&
      (values?.startDate != selectedDateRange?.startDate ||
        values?.endDate != selectedDateRange?.endDate)
    ) {
      const newDate = {
        startDate: values?.startDate ? moment(values?.startDate) : null,
        endDate: values?.endDate ? moment(values?.endDate) : null,
      };

      setSelectedDateRange(newDate);
    }
  }, [values, selectedDateRange, props.id]);

  React.useEffect(() => {
    let newValidationMessage = {
      ...(validationMessage || {}),
    };
    if (error?.startDate) {
      newValidationMessage["startDate"] = {
        error: true,
        helperText: error?.startDate,
      };
    } else {
      newValidationMessage["startDate"] = {
        error: false,
        helperText: "",
      };
    }

    if (error?.endDate) {
      newValidationMessage["endDate"] = {
        error: true,
        helperText: error?.endDate,
      };
    } else {
      newValidationMessage["endDate"] = {
        error: false,
        helperText: "",
      };
    }

    setValidationMessage(newValidationMessage);
  }, [error, validationMessage]);

  return (
    <Stack className={mainClassName} direction="row" spacing={2} useFlexGap>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <DatePicker
          label={locale(labels?.startDate) || getLabel({ name: "startDate" })}
          format={dateFormat}
          value={
            typeof selectedDateRange?.startDate == "object"
              ? selectedDateRange?.startDate
              : null
          }
          disabled={
            disabled?.constructor.name == "Object"
              ? disabled?.startDate
              : disabled
          }
          onChange={(newValue) => {
            handleChangeDate("startDate", newValue);
          }}
          placeholder={placeholder || placeholders?.startDate || ""}
          slotProps={{
            textField: {
              fullWidth: true,
              error: validationMessage?.startDate?.error,
              helperText: validationMessage?.startDate?.helperText,
            },
          }}
        />
        <DatePicker
          label={locale(labels?.endDate) || getLabel({ name: "endDate" })}
          format={dateFormat}
          value={
            typeof selectedDateRange?.endDate == "object"
              ? selectedDateRange?.endDate
              : null
          }
          disabled={
            disabled?.constructor.name == "Object"
              ? disabled?.endDate
              : disabled
          }
          onChange={(newValue) => {
            handleChangeDate("endDate", newValue);
          }}
          placeholder={placeholder || placeholders?.endDate || ""}
          slotProps={{
            textField: {
              fullWidth: true,
              error: validationMessage?.endDate?.error,
              helperText: validationMessage?.endDate?.helperText,
            },
          }}
        />
      </LocalizationProvider>
    </Stack>
  );
}
