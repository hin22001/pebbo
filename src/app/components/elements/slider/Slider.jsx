"use client";
import React from "react";
import Slider from "@mui/material/Slider";
import classnames from "classnames";
import { IconCustom } from "../icon";
import { Helpers } from "@/app/utils";
import { getDataHead } from "@/app/data/head";
import _ from "lodash";

export default function CustomSlider(props) {
  const {
    defaultValue,
    className,
    theme,
    type,
    disabled,
    progress,
    useDetailProgress, // => dependent on progress
    detail, // => string
  } = props;

  // ========================
  // ==== Initial Config ====
  // ========================

  const mainClassName = "elements-slider";

  const _type = type || "progress";

  const refactorClassName = classnames(
    mainClassName,
    className,
    theme,
    detail || useDetailProgress ? "use-detail" : "",
    useDetailProgress?.type ? "use-detail-type-" + useDetailProgress?.type : "",
    "type-" + _type,
  );

  const labels = getDataHead({
    name: "headLabel",
  });

  const isDisabled = true || type == "slider";

  const detailProgress =
    useDetailProgress &&
    {
      default: [
        progress?.current,
        useDetailProgress?.string1 || labels?.from,
        progress?.total,
        useDetailProgress?.string2 || "",
      ].join(" "),
      percent: useDetailProgress?.label,
    }[useDetailProgress?.type || "default"];

  // ========================
  // ==== Config Value ======
  // ========================

  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    refactorValue();
  }, [props?.progress, refactorValue]);

  React.useEffect(() => {
    refactorValue();
  }, [refactorValue]);

  const refactorValue = () => {
    try {
      let value =
        defaultValue ||
        Helpers.percentage(progress?.current, progress?.total) ||
        0;

      if (
        // _type == 'progress-lock' &&
        progress?.total >= 100
      ) {
        const current = progress?.current || 0;

        const max = progress?.total || 0;

        const offsetPercent = max * (2 / 100);
        const offsetMax = max - offsetPercent;

        if (current >= max - offsetMax && current < max) {
          value = Helpers.percentage(current, max + offsetPercent);
        }
      }

      setValue(value);
    } catch (err) {}
  };

  return (
    <div className={refactorClassName}>
      <div className={mainClassName + "-content"}>
        <Slider
          className={mainClassName + "-item " + (value ? "" : "hide-track")}
          value={value}
          valueLabelDisplay="auto"
          disabled={isDisabled}
        />
        {_type == "progress-lock" && (
          <IconCustom
            className={mainClassName + "-target-icon"}
            icon="padlock"
            size="medium"
          />
        )}
      </div>
      {detail && <p className={mainClassName + "-detail"}>{detail}</p>}
      {useDetailProgress &&
        detailProgress &&
        {
          default: (
            <p className={mainClassName + "-detail detail-progress"}>
              {detailProgress}
            </p>
          ),
          percent: (
            <div className={mainClassName + "-detail detail-progress"}>
              <span className={mainClassName + "-detail-text-label"}>
                {detailProgress}
              </span>
              <span className={mainClassName + "-detail-text-percent"}>
                {_.round(value || 0) + "%"}
              </span>
            </div>
          ),
        }[useDetailProgress?.type || "default"]}
    </div>
  );
}
