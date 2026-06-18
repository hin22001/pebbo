"use client";
import React from "react";
import Chip from "@mui/material/Chip";
import { getDataHead } from "@/app/data/head";
import { IconCustom } from "../icon";
import { Helpers } from "@/app/utils";
import { locale } from "@/src/app/data/locale";

export default function index(props) {
  try {
    const { id, label, theme, headType, clickable, className, sx } = props;

    const handleClick = () => {
      props.handleClick(id);
    };

    const head = headType && getDataHead({ name: "headChip" })[headType];

    let icon = props?.icon || head?.icon;
    let color = props?.color || head?.color;

    return (
      <Chip
        icon={
          icon && (
            <IconCustom
              {...(icon?.constructor?.name == "Object" ? icon : { icon: icon })}
            />
          )
        }
        className={
          "element-chip " + (head?.theme || theme) + " " + (className || "")
        }
        label={locale(label || head?.label)}
        onClick={(props.handleClick ? handleClick : null) || props.onClick}
        clickable={clickable}
        color={color}
        sx={sx}
      />
    );
  } catch (err) {}
}
