"use client";
import React, { useState, useEffect } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Badge } from "../../elements";

export default function CollapseWithLabel({
  title,
  withLabel,
  children,
  active,
  handleClick,
  collapseIndex,
}) {
  const [collapse, setCollapse] = useState(false || active);

  function handleCollapse() {
    if (handleClick) {
      if (active === undefined) {
        setCollapse(!collapse);
        handleClick(collapseIndex);
      } else {
        handleClick(collapseIndex);
      }
    } else {
      setCollapse(!collapse);
    }
  }

  useEffect(() => {
    setCollapse(active);
  }, [active]);

  return (
    <div className={`collapse-with-label ${collapse ? "collapse" : ""}`}>
      <div
        className={`collapse-head ${collapse ? "collapse" : ""} ${withLabel ? "with-label" : ""}`}
      >
        <div className="collapse-title">
          <span>{title}</span>
          {withLabel && <Badge label={withLabel} theme="green-ligth" />}
        </div>
        <button
          type="button"
          className={`button-expand ${collapse ? "collapse" : ""}`}
          onClick={handleCollapse}
        >
          <ExpandMoreIcon />
        </button>
      </div>
      <div className={`collapse-body ${collapse ? "collapse" : ""}`}>
        {children}
      </div>
    </div>
  );
}
