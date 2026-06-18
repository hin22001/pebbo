"use client";
import { getDataHead } from "@/app/data/head";
import { Badge } from "@mui/material";
import React from "react";
import { IconCustom } from "../icon";

export default function Index(props) {
  const { children, badgeContent, headType, hide } = props;

  const mainClassName = "element-badge";

  const [head, setHead] = React.useState();

  React.useEffect(() => {
    const refactorHead = headType
      ? getDataHead({ name: "headBadge." + headType })
      : { badgeContent: badgeContent };

    setHead(refactorHead);
  }, [headType, badgeContent]);

  return (
    <>
      {!hide ? (
        <Badge
          badgeContent={
            <div className={mainClassName + "-content"}>
              {head?.badgeContent && head?.badgeContent?.icon ? (
                <IconCustom
                  className={mainClassName + "-content-icon"}
                  size="small"
                  {...(head?.badgeContent?.icon?.construction?.name == "String"
                    ? { icon: head?.badgeContent?.icon }
                    : head?.badgeContent?.icon || {})}
                />
              ) : (
                <span className={mainClassName + "-content-label"}>
                  {head.badgeContent}
                </span>
              )}
            </div>
          }
          className={mainClassName}
        >
          {children}
        </Badge>
      ) : (
        children
      )}
    </>
  );
}
