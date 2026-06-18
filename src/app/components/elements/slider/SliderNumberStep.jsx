"use client";
import React from "react";
import Slider from "@mui/material/Slider";
import classnames from "classnames";

export default function DiscreteSliderMarks(props) {
  const {
    data, //=> required
    className,
    theme,
    defaultValue,
    handleChange,
  } = props;

  // ========================
  // ==== Initial Config ====
  // ========================

  const [marks, setMarks] = React.useState([]);
  const [step, setStep] = React.useState(10);
  const [value, setValue] = React.useState(0);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const mainClassName = "elements-slider-number-step";

  const refactorClassName = classnames(
    mainClassName,
    className,
    theme,
    "active-index-" + activeIndex,
  );

  const onChange = (event, value) => {
    try {
      const foundIndex = marks.findIndex((item) => item.value == value);

      const id = marks[foundIndex]?.id;
      setActiveIndex(foundIndex);

      if (handleChange) {
        handleChange({ id, value });
      }
    } catch (err) {}
  };

  const refactorMarks = (data) => {
    try {
      let refactoredMarks, refactoredStep;

      if (data?.length > 0) {
        refactoredStep = Math.round(100 / (data.length - 1));

        refactoredMarks = data.map((item, index) => {
          const isLast = data.length == index + 1;

          if (isLast) {
            return {
              ...item,
              value: index * refactoredStep,
            };
          } else {
            return {
              ...item,
              value: index * refactoredStep,
            };
          }
        });
      }

      return { refactoredMarks, refactoredStep };
    } catch (err) {
      return { data, step };
    }
  };

  React.useEffect(() => {
    try {
      if (JSON.stringify(data || []) != JSON.stringify(marks || [])) {
        const { refactoredMarks, refactoredStep } = refactorMarks(data);

        setMarks(refactoredMarks);
        setStep(refactoredStep);
      }
    } catch (err) {}
  }, [data, marks]);

  return (
    <div className={refactorClassName}>
      <Slider
        className={mainClassName + "-slider"}
        defaultValue={value}
        step={step}
        marks={marks}
        onChangeCommitted={onChange}
        // slots={{
        //   markLabel: (val) => {

        //     return val?.children

        //   }
        // }}
      />
    </div>
  );
}
