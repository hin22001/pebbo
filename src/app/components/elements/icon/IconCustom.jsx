"use client";
import React from "react";
import classnames from "classnames";
import { ImageHandler } from "../image";

function MuiIcon(props) {
  const { theme, iconName, color, className } = props;

  const capitalize = (str) => {
    return str?.replace(/\b\w/g, function (m) {
      return m.toUpperCase();
    });
  };

  const arrName = iconName?.split("_");

  let muiIconName = capitalize(iconName);

  if (arrName?.length > 0) {
    muiIconName = arrName.map((item) => capitalize(item)).join("");
  }

  if (muiIconName && muiIconName != " ") {
    let MuiCustomIcon;

    try {
      const Icons = require("@mui/icons-material");
      MuiCustomIcon = Icons && Icons[muiIconName];
    } catch (err) {}

    if (MuiCustomIcon) {
      return (
        <MuiCustomIcon
          className={className + " mui-icon"}
          color={theme}
          style={{ color: color }}
        />
      );
    } else {
      return <></>;
    }
  } else {
    return <></>;
  }
}

export default function IconCustom(props) {
  const {
    icon,
    name,
    theme,
    type,
    color,
    className,
    transform,
    size,
    disableLoader,
  } = props;

  const iconName =
    icon?.constructor?.name == "Object" ? icon?.name : icon || name;

  if (iconName) {
    const refactorClassName = classnames(
      "elements-icon-custom",
      className,
      theme,
      size ? "size-" + size : "",
      transform,
      "icon-name-" + iconName,
    );

    const imageConfig = {
      width: "auto",
      height: "auto",
      disableLoader,
    };

    if (type == "mui") {
      return (
        <MuiIcon
          iconName={iconName}
          theme={theme}
          color={color}
          className={refactorClassName}
        />
      );
    } else {
      switch (iconName) {
        case "chart":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "chart-yellow":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "chart-bar":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "dashboard":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "wallet":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "wallet":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "star-yellow":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".png")}
              type={"icon"}
            />
          );
        case "point-fire":
          return (
            <ImageHandler
              className={"elements-icon-custom-icon-custom-image-top-bar"}
              src={require("@/images/icon/icon-" + iconName + ".png")}
              type={"icon"}
            />
          );
        case "point-coin":
          return (
            <ImageHandler
              className={"elements-icon-custom-icon-custom-image-top-bar"}
              src={require("@/images/icon/icon-" + iconName + ".png")}
              type={"icon"}
            />
          );
        case "shield-and-sword":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".png")}
              type={"icon"}
            />
          );
        case "question":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".png")}
              type={"icon"}
            />
          );
        case "report-shine":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".png")}
              type={"icon"}
            />
          );
        case "correct":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".png")}
              type={"icon"}
            />
          );
        case "wrong":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".png")}
              type={"icon"}
            />
          );
        case "whatsapp":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "email":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "linkedin":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "instagram":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "facebook":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "maps":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "calendar":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "champion-hand":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "pen-holder":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "letter":
          return (
            <ImageHandler
              {...(imageConfig || {})}
              className={refactorClassName + " icon-custom-image"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "dashboard-home":
          return (
            <ImageHandler
              className={"elements-icon-custom-icon-custom-image-nav"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "gift":
          return (
            <ImageHandler
              className={"elements-icon-custom-icon-custom-image-nav"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "notification":
          return (
            <ImageHandler
              className={"elements-icon-custom-icon-custom-image-nav"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "question-mark":
          return (
            <ImageHandler
              className={"elements-icon-custom-icon-custom-image-nav"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "report":
          return (
            <ImageHandler
              className={"elements-icon-custom-icon-custom-image-nav"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "classroom":
          return (
            <ImageHandler
              className={"elements-icon-custom-icon-custom-image-nav"}
              src={require("@/images/icon/icon-" + iconName + ".svg")}
              type={"icon"}
            />
          );
        case "math-library-icon":
          return (
            <ImageHandler
              className={"elements-icon-custom-math-library-nav-icon"}
              src={"/Nav_Library_Photo.png"}
              type={"icon"}
            />
          );
        default:
          return (
            <MuiIcon
              iconName={iconName}
              className={refactorClassName}
              theme={theme}
              color={color}
            />
          );
          break;
      }
    }
  } else {
    return <></>;
  }
}
