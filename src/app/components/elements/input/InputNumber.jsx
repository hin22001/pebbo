"use client";
import { TextField } from "@mui/material";
import classnames from "classnames";
import React from "react";
import { IconButton } from "../icon";

export default function InputNumber(props) {
  const { min, max, defaultValue, className, theme, handleChange } = props;

  const mainClassName = "elements-input-number";

  const refactorClassName = classnames(mainClassName, className, theme);

  const [currentValue, setCurrentValue] = React.useState(0);

  const handleEvent = (type, event) => {
    try {
      switch (type) {
        case "minus":
          {
            setCurrentValue(currentValue - 1);
          }
          break;

        case "input":
          {
            const newVal = parseFloat(event.target.value) || 0;

            setCurrentValue(newVal);
            event.target.value = newVal;
          }
          break;

        case "plus":
          {
            setCurrentValue(currentValue + 1);
          }
          break;
      }

      if (handleChange) {
        handleChange(currentValue);
      }
    } catch (err) {}
  };

  React.useEffect(() => {
    try {
    } catch (err) {}
  }, []);

  const refButtonMinus = React.useRef();

  return (
    <div className={refactorClassName}>
      <div className={mainClassName + "-content"}>
        <div className={mainClassName + "-wrap-plus"}>
          <IconButton
            icon={{
              name: "Remove",
              type: "mui",
            }}
            handleClick={() => handleEvent("minus")}
            ref={refButtonMinus}
          />
        </div>

        <TextField
          type="number"
          className={mainClassName + "-wrap-input"}
          value={currentValue}
          onChange={(event) => handleEvent("input", event)}
        />

        <div className={mainClassName + "-wrap-minus"}>
          <IconButton
            icon={{
              name: "Add",
              type: "mui",
            }}
            handleClick={() => handleEvent("plus")}
          />
        </div>
      </div>
    </div>
  );
}
