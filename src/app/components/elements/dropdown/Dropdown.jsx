"use client";
import React from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function Dropdown(props) {
  const {
    id,
    data,
    placeholder,
    defaultValue,
    handleChange,
    name,
    disabled,
    className,
  } = props;

  let sortOption = props.sortOption && {
    sortBy: props.sortOption.sortBy || "label" || "id",
    type: props.sortOption.type || "asc",
  };

  const { value, setValue } = React.useState();

  let _defaultValue = defaultValue
    ? defaultValue
    : data && data.length > 0
      ? data[0].id
      : 0;

  const handleEvent = (event) => {
    if (handleChange) {
      handleChange(event, id ? id : "");
    }
  };

  React.useEffect(
    () => () => {
      _defaultValue = defaultValue
        ? defaultValue
        : data && data.length > 0
          ? data[0].id
          : 0;
    },
    [data, defaultValue, _defaultValue],
  );

  return (
    <div
      className={
        "element-dropdown " +
        (disabled ? "disabled" : "") +
        " " +
        (className || "")
      }
    >
      <FormControl className="mui-form-control">
        <Select
          defaultValue={_defaultValue}
          value={value}
          onChange={handleEvent}
          displayEmpty
          name={name}
          disabled={disabled}
        >
          {placeholder && (
            <MenuItem value="" disabled className="placeholder">
              {placeholder}
            </MenuItem>
          )}
          {data && data.length > 0 && sortOption
            ? data
                .sort((a, b) => {
                  if (sortOption.type.toLocaleLowerCase() == "asc") {
                    return a[sortOption.sortBy] - b[sortOption.sortBy];
                  } else {
                    return b[sortOption.sortBy] - a[sortOption.sortBy];
                  }
                })
                .map((item, index) => {
                  return (
                    <MenuItem
                      key={"dropdown-" + index}
                      value={
                        item.id ? item.id : item.label ? item.label : item.name
                      }
                      selected={item.id == defaultValue ? "selected" : "false"}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: item.label ? item.label : item.name,
                        }}
                      />
                    </MenuItem>
                  );
                })
            : data.map((item, index) => {
                return (
                  <MenuItem
                    key={"dropdown-" + index}
                    value={
                      item.id ? item.id : item.label ? item.label : item.name
                    }
                    selected={item.id == defaultValue ? "selected" : "false"}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: item.label ? item.label : item.name,
                      }}
                    />
                  </MenuItem>
                );
              })}
        </Select>
      </FormControl>
    </div>
  );
}
