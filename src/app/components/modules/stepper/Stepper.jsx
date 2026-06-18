"use client";
import React from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { locale } from "@/src/app/data/locale";

export default function index(props) {
  const mainClassName = "module-stepper";

  const { activeStep, steps } = props;
  return (
    <div className={mainClassName}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps?.length > 0 &&
          steps.map((item, index) => (
            <Step key={mainClassName + "-" + index}>
              <StepLabel>{locale(item.label)}</StepLabel>
            </Step>
          ))}
      </Stepper>
    </div>
  );
}
