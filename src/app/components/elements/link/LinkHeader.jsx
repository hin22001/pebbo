"use client";
import { getDataHead } from "@/app/data/head";
import Link from "next/link";
import React from "react";
import { IconCustom } from "@/elements";

export default function LinkHeader(props) {
  const { title, linkLabel, theme, className, seeAll, seeOther, icon } = props;

  const headLinkLabel = getDataHead({ name: "headLabel.seeAll" });

  return (
    <div
      className={
        "elements-link-header " + (theme || "") + " " + (className || "")
      }
    >
      <div className="elements-link-header-block-title">
        {icon && <IconCustom size="medium" {...(icon ? { icon } : {})} />}
        {title && <h3 className="elements-link-header-title">{title}</h3>}
      </div>

      {(seeAll || seeOther) && (
        <Link
          className="elements-link-header-subtitle"
          href={seeAll?.href || seeOther?.href || "#"}
        >
          <span>{linkLabel || headLinkLabel}</span>
          <IconCustom icon="KeyboardArrowRight" type="mui" />
        </Link>
      )}
    </div>
  );
}
