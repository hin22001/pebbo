"use client";
import React, { useState, useRef } from "react";
import classnames from "classnames";
import _ from "lodash";

const InputCode = (props) => {
  const { label, loading, onComplete, theme, className, onDeleteCode, reset } =
    props;

  const length = props.length || 6;

  const [code, setCode] = useState([...Array(length)].map(() => ""));
  const inputs = useRef([]);

  const processInput = async (e, slot) => {
    try {
      if (e.type != "paste") {
        // === Get New Value ===

        const num = e.target.value;

        if (/[^0-9]/.test(num)) return;

        const newCode = [...code];

        newCode[slot] = num;

        setCode(newCode);

        if (slot !== length - 1) {
          // === Set Focus To Next Field ===

          inputs.current[slot + 1].focus();
        }

        // === Set Char Type To Secure The Code ===

        // await setTimeout(() => {

        // inputs.current[slot].type = 'password'

        // }, 200);

        // === On Complete ===

        if (newCode.every((num) => num !== "") && onComplete) {
          onComplete(newCode.join(""));
        }
      }
    } catch (err) {}
  };

  const onKeyUp = async (e, slot) => {
    try {
      if (e.type != "paste" && e.keyCode != 17) {
        // === E Code == 8 is for BACKSPACE ===
        if (e.keyCode === 8) {
          if (onDeleteCode) {
            onDeleteCode();
          }

          if (!code[slot] && slot !== 0) {
            const newCode = [...code];

            let currentSlot = slot - 1;

            // === Backward Focus ===

            newCode[currentSlot] = "";

            setCode(newCode);

            inputs.current[currentSlot].type = "text";
            inputs.current[slot - 1].focus();
          }
        }
      }
    } catch (err) {}
  };

  const onPaste = async (e) => {
    try {
      const value = e?.clipboardData?.getData("Text");

      if (!_.isNaN(parseInt(value))) {
        setTimeout(() => {
          const arrValue = value?.split("");
          const newCode = Array(length)
            .fill("")
            .map((item, index) =>
              index < arrValue?.length ? arrValue[index] : "",
            );
          setCode(newCode);

          // === Move focus ===
          const lastBox =
            arrValue?.length < length ? arrValue?.length : length - 1;
          inputs.current[lastBox].focus();
          e.stopPropagation();

          if (newCode.every((num) => num !== "") && onComplete) {
            onComplete(newCode.join(""));
          }
        }, 200);
      }
    } catch (err) {}
  };

  React.useEffect(() => {
    setCode(null);
    setCode([...Array(length)].map(() => ""));
  }, [reset, length]);

  const mainClassName = "elements-input-code";
  const currentClassname = classnames(mainClassName, theme, className);

  return (
    <div className={currentClassname}>
      <label className={mainClassName + "-label"}>{label}</label>
      <div className={mainClassName + "-inputs"}>
        {code?.length > 0 &&
          code.map((num, idx) => {
            return (
              <input
                key={idx}
                // type={charType[idx]}
                inputMode="numeric"
                maxLength={1}
                value={num}
                autoFocus={!code[0].length && idx === 0}
                readOnly={loading}
                onChange={async (e) => await processInput(e, idx)}
                onKeyUp={async (e) => await onKeyUp(e, idx)}
                onPaste={async (e) => await onPaste(e, idx)}
                ref={(ref) => inputs.current.push(ref)}
              />
            );
          })}
      </div>
    </div>
  );
};

export default InputCode;
