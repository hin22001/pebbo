"use client";
import React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { IconCustom } from ".";
import { Badge } from "../badge";

export default function IconButtonToggle(props) {
  const {
    defaultValue,
    className,
    theme,
    data, // ===> can be single object or array of object
    handleChange, // ===> props handler controlled
    refreshData,
    useBadge,
  } = props;

  // =========================================
  // ===== Defined Initial Configuration =====
  // =========================================

  const dataType = data && (Array.isArray(data) ? "array" : typeof data);

  const refactorData =
    dataType == "array" ? data : dataType == "object" && [data];

  const isUsingIconActive = Boolean(data?.iconActive);

  // ===============================
  // ===== Defined Class Names =====
  // ===============================

  const mainClassName = "elements-icon-button-toggle";

  const refactorClassName = [
    mainClassName,
    className,
    theme,
    isUsingIconActive ? "using-icon-active" : "not-using-icon-active",
  ]
    .filter((item) => item)
    .join(" ");

  // =========================================
  // ===== State Configuration ===============
  // =========================================

  const [value, setValue] = React.useState(defaultValue);

  const handleEvent = (event, newValue) => {
    setValue(newValue);

    if (handleChange) {
      handleChange(newValue);
    }
  };

  // =========================================
  // ===== Component Mount ===================
  // =========================================

  React.useEffect(() => {
    if (defaultValue != value) {
      setValue(defaultValue);
    }
  }, [defaultValue, refreshData, value]);

  return (
    <ToggleButtonGroup
      className={refactorClassName}
      value={value}
      exclusive
      onChange={handleEvent}
    >
      {refactorData?.length > 0 &&
        refactorData.map((item, index) => {
          const val = item.id || item.value || index + 1;

          const isActive = val == value;
          const isUsingIconActive = item.iconActive; // ===> icon custom change based on this property

          const SelectedIcon = () =>
            isUsingIconActive ? (
              <>
                {isActive ? (
                  <IconCustom
                    {...(item?.iconActive?.constructor.name == "Object"
                      ? item.iconActive
                      : { icon: item.iconActive })}
                  />
                ) : (
                  <IconCustom
                    {...(item?.icon?.constructor.name == "Object"
                      ? item.icon
                      : { icon: item.icon })}
                  />
                )}
              </>
            ) : (
              <IconCustom
                {...(item?.icon?.constructor.name == "Object"
                  ? item.icon
                  : { icon: item.icon })}
              />
            );

          return (
            <ToggleButton
              className={
                mainClassName +
                "-item " +
                (isUsingIconActive ? "disable-mui-selected" : "")
              }
              value={val}
              key={mainClassName + "-item-" + index}
            >
              {useBadge ? (
                <Badge
                  headType={useBadge?.headType || "checklist"}
                  hide={!isActive}
                >
                  <SelectedIcon />
                </Badge>
              ) : (
                <SelectedIcon />
              )}
            </ToggleButton>
          );
        })}
    </ToggleButtonGroup>
  );
}
