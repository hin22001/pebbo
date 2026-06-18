/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { Checkbox, Chip, Stack, styled } from "@mui/material";
import { Helpers } from "@/app/utils";
import { getLabel, locale } from "@/app/data/locale";

export default function Asynchronous(props) {
  try {
    const {
      id,
      name,
      data,
      label,
      placeholder,
      multiple,
      value,
      onChange,
      error,
      helperText,
      color,
      disabled,
      getData,
      loading,
      freeSolo,
      directFetch,
      required,
      groupBy,
      noLimitTags,
      disableReturnOnMount,
      endAdornment,
      floatAction,
      correctDropdown,
    } = props;

    const limitTags = !noLimitTags && 3;

    const mainClassName = "element-dropdown-input";
    const [stateValue, setStateValue] = React.useState([]);

    const [selectAll, setSelectAll] = React.useState(false);

    const [open, setOpen] = React.useState(false);
    const [showLoader, setShowLoader] = React.useState(false);

    const [options, setOptions] = React.useState([]);

    const directGetData = () => {
      try {
        if (getData && directFetch) {
          (async () => {
            setShowLoader(true);

            const response = await getData();

            if (response?.length > 0) {
              setOptions(response);
            }

            setShowLoader(false);
          })();
        }
      } catch (err) {
        // Error handling
      }
    };

    const setStateValueObject = (paramData) => {
      if (paramData?.length > 0) {
        if (multiple) {
          const foundValue = paramData?.filter((item) =>
            value?.includes(item?.id),
          );

          setStateValue(foundValue || []);
        } else {
          const foundValue = paramData?.find((item) => item.id == value);

          setStateValue(foundValue || "");
        }
      } else {
        setStateValue(multiple ? [] : "");
      }
    };

    const handleSelectAll = (e) => {
      const newVal = !selectAll;

      setSelectAll(newVal);

      if (newVal) {
        setStateValue(options);
      } else {
        setStateValue([]);
      }
    };

    const handleChange = async (event, value) => {
      setStateValue(value);

      if (onChange) {
        await onChange(value);
      }
    };

    React.useEffect(() => {
      setShowLoader(loading ? true : false);
    }, [loading]);

    React.useEffect(() => {
      setShowLoader(true);

      if (!directFetch) {
        setStateValueObject(data);
        setOptions(data || []);
      }

      setShowLoader(false);
    }, [data, multiple, value]);

    React.useEffect(() => {
      if (open && options.length === 0) {
        directGetData();
        setStateValueObject(data);
      }
    }, [open]);

    React.useEffect(() => {
      if (multiple) {
        const isSelectAllActive = stateValue?.length == options?.length;

        setSelectAll(isSelectAllActive);
      }
    }, [stateValue]);

    React.useEffect(() => {
      if (multiple) {
        if (onChange) {
          const change = async () => {
            await onChange(stateValue);
          };

          change();
        }
      }
    }, [selectAll]);

    const CorrectTextField = styled(TextField)({
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#AAFF00",
          borderWidth: "4px",
        },
        "&:hover fieldset": {
          borderColor: "#AAFF00",
        },
      },
      "& .MuiInputBase-root": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#AAFF00",
        },
      },
    });

    return (
      <Autocomplete
        className={mainClassName + " " + (multiple ? "use-multiple" : "")}
        id={id}
        name={name}
        freeSolo={freeSolo}
        multiple={multiple}
        disableCloseOnSelect={multiple}
        disableClearable={required}
        open={open}
        value={stateValue}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        onChange={handleChange}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={(option) => locale(option?.label || "")}
        options={options}
        disabled={showLoader ? true : disabled}
        loading={showLoader}
        renderTags={(option, getTagProps) => {
          const chips = option.filter((item) =>
            stateValue.flatMap((item) => item.id).includes(item.id),
          );

          const nTags =
            limitTags &&
            (chips?.length > limitTags ? chips?.length - limitTags : 0);

          const refactorChips = limitTags ? chips.slice(0, limitTags) : chips;

          return (
            <Stack spacing={1} className={mainClassName + "-wrap-chip"}>
              {refactorChips.map((item, index) => (
                <Chip
                  key={"dropdown-chip-" + index}
                  label={item.label}
                  {...getTagProps({ index })}
                />
              ))}
              {nTags > 0 && (
                <span className={mainClassName + "-wrap-chip-length"}>
                  {"+" + nTags}
                </span>
              )}
            </Stack>
          );
        }}
        renderOption={(props, option, { selected }) => {
          return (
            <li {...props}>
              {multiple && (
                <Checkbox style={{ marginRight: 8 }} checked={selected} />
              )}
              {option.label && (
                <span>
                  {locale(option.label)}
                  {option.subtitle && (
                    <i className="text-subtitle">
                      {" (" + locale(option.subtitle) + ")"}
                    </i>
                  )}
                </span>
              )}
            </li>
          );
        }}
        groupBy={multiple && ((option) => (groupBy ? option[groupBy] : true))}
        renderGroup={
          !groupBy &&
          ((params) => {
            return (
              <li key={params.key} className={mainClassName + "-options"}>
                <div
                  className={mainClassName + "-option-select-all"}
                  onClick={handleSelectAll}
                >
                  {multiple && (
                    <Checkbox
                      style={{ marginRight: 8 }}
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  )}
                  {getLabel({ name: "selectAll" })}
                </div>
                <div>{params.children}</div>
              </li>
            );
          })
        }
        renderInput={(params) => (
          <>
            {correctDropdown ? (
              <CorrectTextField
                {...params}
                label={locale(label)}
                placeholder={placeholder}
                error={error}
                color={color}
                helperText={helperText}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                      {endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            ) : (
              <TextField
                {...params}
                label={locale(label)}
                placeholder={placeholder}
                error={error}
                color={color}
                helperText={helperText}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                      {endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          </>
        )}
      />
    );
  } catch (err) {
    // Error handling
    return <></>;
  }
}
