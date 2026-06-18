"use client";
import React, { Component } from "react";
import IconButton from "@mui/material/IconButton";
import { IconCustom } from ".";
import classnames from "classnames";
import { LinkWrapper } from "../../modules";

function index(props) {
  const {
    theme,
    handleClick,
    value,
    size,
    disabled,
    icon,
    className,
    href,
    label,
    color,
    sx,
    children,
  } = props;

  const mainClassName = classnames(
    "elements-icon-button",
    color ? "color-" + color : "",
    label ? "use-label" : "",
    theme ? "theme-" + theme : "",
    size ? "size-" + size : "",
    disabled ? "disabled" : "",
  );

  return (
    <LinkWrapper
      className={"elements-icon-button-link-wrapper " + (className || "")}
      href={href}
      handleClick={(event) => {
        if (!href && handleClick) {
          event?.preventDefault();

          handleClick({
            target: {
              value: value,
            },
            event,
          });
        }
      }}
    >
      <IconButton
        className={mainClassName}
        value={value || ""}
        size={size}
        disabled={disabled}
        // disableRipple={true}
        sx={sx}
      >
        {children || (
          <IconCustom
            size={size}
            color={color}
            {
              ...(icon?.constructor?.name == "Object" ? icon : { icon: icon }) // ==> if string
            }
          />
        )}
        {label && <p className={"label"}>{label}</p>}
      </IconButton>
    </LinkWrapper>
  );
}

export default index;
