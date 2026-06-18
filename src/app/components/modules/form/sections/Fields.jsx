import React from "react";
import { locale } from "@/src/app/data/locale";
import DatePickerRange from "@/elements/datepicker/DatePickerRange";
import DatePickerRangeUncontrolled from "@/elements/datepicker/DatePickerRangeUncontrolled";
import DatePickerRangeFull from "@/elements/datepicker/DatePickerRangeFull";
import DatePicker from "@/elements/datepicker/DatePicker";
import {
  Autocomplete,
  Checkbox,
  Chip,
  FormControlLabel,
  InputAdornment,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@/elements/button/Button";
import DropdownInput from "@/elements/dropdown/DropdownInput";
import UploadFile from "@/modules/upload/UploadFile";

export default function Fields(props) {
  const mainClassName = "module-form-generator-section-field";

  const {
    formItem,
    formKeys,
    formIndex,
    formik,
    handleEvent,
    convertDateRangeName,
    dataDropdown,
    onlyView,
  } = props;

  switch (formItem?.type) {
    case "number":
    case "email":
    case "string":
      {
        return (
          <TextField
            key={"form-item-string-" + formIndex}
            className={mainClassName + "-text-field"}
            fullWidth
            id={formKeys}
            name={formKeys}
            type={formItem?.type}
            multiline={formItem?.multiline}
            rows={formItem?.rows}
            maxRows={formItem?.maxRows}
            placeholder={locale(formItem?.placeholder)}
            label={locale(formItem?.label)}
            value={
              formItem?.fakeValue || (formik.values && formik.values[formKeys])
            }
            InputProps={{
              inputProps: {
                min: formItem?.minNumber,
                max: formItem?.maxNumber,
              },
              ...(formItem?.endAdornment && {
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant={"subtitle"}>
                      {formItem?.endAdornment?.subtitle}
                    </Typography>
                  </InputAdornment>
                ),
              }),
            }}
            onChange={(event) =>
              handleEvent({ type: "text-field-handle-change", event })
            }
            onBlur={(event) =>
              handleEvent({ type: "text-field-handle-blur", event })
            }
            disabled={onlyView || formItem?.disabled}
            error={formik.touched[formKeys] && Boolean(formik.errors[formKeys])}
            helperText={formik.touched[formKeys] && formik.errors[formKeys]}
          />
        );
      }
      break;

    case "date":
      {
        return (
          <DatePicker
            key={"form-item-date-picker-" + formIndex}
            id={formKeys}
            name={formKeys}
            format={formItem?.format}
            placeholder={locale(formItem?.placeholder)}
            label={formItem?.label}
            useTime={formItem?.useTime}
            value={formik.values && formik.values[formKeys]}
            onChange={(value) =>
              handleEvent({
                type: "change-date",
                value: value?.format(formItem?.format),
                formKeys,
              })
            }
            onBlur={(value) =>
              handleEvent({
                type: "change-date",
                value: value?.format(formItem?.format),
                formKeys,
              })
            }
            disabled={onlyView || formItem?.disabled}
          />
        );
      }
      break;

    case "date-range":
      {
        return (
          <DatePickerRange
            key={"form-item-date-picker-range-" + formIndex}
            id={formKeys}
            name={formKeys}
            placeholder={locale(formItem?.placeholder)}
            labels={formItem?.labels}
            values={convertDateRangeName(formik.values, formKeys)}
            onChange={(value) =>
              handleEvent({ type: "change-date-range", value, formKeys })
            }
            disabled={onlyView || formItem?.disabled}
          />
        );
      }
      break;

    case "date-picker-range-uncontrolled":
      {
        return (
          <DatePickerRangeUncontrolled
            key={
              "form-item-date-picker-uncontrolled-" +
              formIndex +
              "-" +
              formItem?.elementKey
            }
            elementKey={formItem?.elementKey}
            id={formKeys}
            name={formKeys}
            placeholder={locale(formItem?.placeholder)}
            labels={formItem?.labels}
            values={convertDateRangeName(formik.values, formKeys)}
            onChange={(value) =>
              handleEvent({ type: "change-date-range", value, formKeys })
            }
            disabled={onlyView || formItem?.disabled}
            error={
              !formItem?.disabled &&
              convertDateRangeName(formik.errors, formKeys)
            }
          />
        );
      }
      break;

    case "date-picker-range-full":
      {
        return (
          <DatePickerRangeFull
            key={
              "form-item-date-picker-full-" +
              formIndex +
              "-" +
              formItem?.elementKey
            }
            id={formKeys}
            name={formKeys}
            placeholder={locale(formItem?.placeholder)}
            label={locale(formItem?.label)}
            labels={formItem?.labels}
            values={convertDateRangeName(formik.values, formKeys)}
            onChange={(value) =>
              handleEvent({ type: "change-date-range", value, formKeys })
            }
            disabled={onlyView || formItem?.disabled}
            error={convertDateRangeName(formik.errors, formKeys)}
          />
        );
      }
      break;

    case "dropdown":
      {
        return (
          <DropdownInput
            key={
              "form-item-dropdown-" +
              formIndex +
              "-" +
              (formItem?.elementKey || "")
            }
            id={formKeys}
            name={formKeys}
            multiple={formItem?.multiple}
            label={locale(formItem?.label)}
            placeholder={locale(formItem?.placeholder)}
            data={
              formItem?.dropdown?.data ||
              (dataDropdown && dataDropdown[formKeys])
            }
            directFetch={formItem?.dropdown?.directFetch}
            getData={formItem?.dropdown?.getData}
            loading={formItem?.dropdown?.loading}
            required={formItem?.required}
            freeSolo={formItem?.dropdown?.freeSolo}
            disabled={
              onlyView || formItem?.dropdown?.loading
                ? true
                : formItem?.disabled
            }
            value={formik.values && formik.values[formKeys]}
            onChange={async (value, objData) => {
              await handleEvent({
                type: "change-dropdown",
                multiple: formItem?.multiple,
                value,
                objData,
                formik,
                formItem,
                formKeys,
              });
            }}
            error={formItem?.dropdown?.loading ? null : formik.errors[formKeys]}
            helperText={
              formItem?.dropdown?.loading ? null : formik.errors[formKeys]
            }
          />
        );
      }
      break;

    case "chip-stack":
      {
        let isChipError =
          _.has(formik?.errors, formKeys) &&
          (Array.isArray(formik?.errors[formKeys])
            ? formik.errors[formKeys].find(
                (errValue) => typeof errValue == "string",
              )
            : formik?.errors[formKeys]);
        const isChipErrorGeneral = typeof isChipError == "string";

        return (
          <Autocomplete
            key={
              "form-item-chip-stack-" +
              formIndex +
              "-" +
              (formItem?.elementKey || "")
            }
            className={mainClassName + "-field-chip-stack"}
            multiple
            id={formKeys}
            name={formKeys}
            options={[]}
            freeSolo
            value={formik.values && formik.values[formKeys]}
            onChange={async (event) =>
              await handleEvent({
                type: "chip-stack",
                event,
                formKeys,
              })
            }
            renderTags={(value, getTagProps) => {
              return (
                <Stack
                  direction={formItem?.direction || "row"}
                  className={mainClassName + "-field-chip-stack-tags"}
                  sx={
                    formItem?.tags?.useCheckbox && {
                      flexDirection: "column",
                      gap: "0.5rem",
                    }
                  }
                >
                  {value.map((option, index) => {
                    const isChipErrorOnSingleItem =
                      !isChipErrorGeneral &&
                      isChipError &&
                      typeof formik.errors[formKeys][index] == "string";

                    return (
                      <Stack
                        direction={"row"}
                        spacing={1}
                        key={
                          mainClassName + "-field-autocomplete-chip-" + index
                        }
                      >
                        <Chip
                          label={
                            typeof option == "string"
                              ? option
                              : option?.label || ""
                          }
                          {...(getTagProps({ index }) || {})}
                          {...(isChipErrorOnSingleItem && {
                            variant: "outlined",
                            color: "error",
                          })}
                          onDelete={async (event) => {
                            getTagProps({ index }).onDelete(event);
                            await handleEvent({
                              type: "chip-stack-delete",
                              formKeys,
                              value: option,
                            });
                          }}
                          icon={
                            <>
                              {formItem?.tags?.useCheckbox && (
                                <Checkbox
                                  checked={Boolean(option && option?.checked)}
                                  onChange={async (event) =>
                                    await handleEvent({
                                      type: "chip-stack-checkbox",
                                      index: index,
                                      event: event,
                                      formKeys,
                                    })
                                  }
                                  sx={{
                                    marginLeft: "0.5rem",
                                  }}
                                />
                              )}
                            </>
                          }
                          className={
                            mainClassName +
                            "-field-autocomplete-chip-item " +
                            (formItem?.tags?.item?.className || "")
                          }
                        />
                      </Stack>
                    );
                  })}
                </Stack>
              );
            }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  error={Boolean(isChipError)}
                  helperText={isChipError}
                  label={locale(formItem?.label)}
                  placeholder={locale(formItem?.placeholder)}
                />
              );
            }}
          />
        );
      }
      break;

    case "file":
      {
        return (
          <UploadFile
            key={
              "form-item-upload-file-" +
              formIndex +
              "-" +
              (formItem?.elementKey || "")
            }
            id={formKeys}
            label={locale(formItem?.label)}
            multiple={formItem?.multiple}
            directUpload={formItem?.directUpload}
            value={formik.values && formik.values[formKeys]}
            stillLoading={async (value) =>
              await handleEvent({
                type: "file-still-loading",
                value,
                formKeys,
              })
            }
            handleGetFile={async (value) =>
              await handleEvent({
                type: "file",
                value,
                formKeys,
              })
            }
            accept={formItem?.accept}
          />
        );
      }
      break;
    case "switch":
      {
        return (
          <FormControlLabel
            control={
              <Switch
                name={formKeys}
                checked={formik.values && formik.values[formKeys]}
                onChange={(event) =>
                  handleEvent({
                    type: "field-switch",
                    formKeys,
                    event,
                    value: formik.values && formik.values[formKeys],
                  })
                }
              />
            }
            label={locale(formItem?.label)}
          />
        );
      }
      break;
  }
}
