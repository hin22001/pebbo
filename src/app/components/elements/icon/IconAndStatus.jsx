"use client";
import { Skeleton } from "@mui/material";
import React from "react";
import IconCustom from "./IconCustom";

export default function IconAndStatus(props) {
  const { data, theme } = props;

  const className = "elements-icon-and-status";

  const dataType = data && (Array.isArray(data) ? "array" : typeof data);
  const refactorData =
    dataType == "array" ? data : dataType == "object" && [data];

  return (
    <div className={className + " " + (theme || "")}>
      {refactorData &&
        refactorData.length > 0 &&
        refactorData.map((item, index) => (
          <div
            className={
              className +
              "-item " +
              (item.theme || "") +
              " " +
              (item?.className || "")
            }
            key={className + "-item-" + index}
          >
            <div className={className + "-wrap-icon-status"}>
              <div className={className + "-wrap-icon"}>
                <IconCustom
                  {...(typeof item?.icon == "string"
                    ? { icon: item?.icon }
                    : item?.icon || {})}
                />
              </div>

              <div className={className + "-wrap-status"}>
                {item?.label || item?.label == 0 ? (
                  <p>{item.label}</p>
                ) : (
                  <Skeleton variant="text" />
                )}
              </div>

              {item.subtitle && (
                <div className={className + "-wrap-subtitle"}>
                  <p>{item.subtitle}</p>
                </div>
              )}

              {item.endIcon && (
                <IconCustom
                  className={className + "-end-icon"}
                  {...(typeof item?.endIcon == "string"
                    ? { icon: item?.endIcon }
                    : item?.endIcon || {})}
                />
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
