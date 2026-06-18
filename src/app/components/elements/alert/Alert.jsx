"use client";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { getDataHead } from "@/app/data/head";
import { locale } from "@/app/data/locale";

import { Alert, AlertTitle, IconButton, Collapse } from "@mui/material";

export default function TransitionAlerts(props) {
  const [isOpen, setIsOpen] = React.useState(false);

  let {
    message,
    type,
    theme,
    disableClose,
    disableTitle,
    customTitle,
    headType,
  } = props;

  const [head, setHead] = React.useState();
  let title = getDataHead({ name: "headAlert" })["title"];

  if (headType) {
    if (head) {
      type = head.type;
      title = title || head.title;
      message = head.message;
      disableTitle = head.disableTitle;
    }
  }

  const handleClose = () => {
    if (props.handleClose) {
      props.handleClose();
    }

    setIsOpen(false);
  };

  React.useEffect(() => {
    setIsOpen(props?.isOpen);
  }, [props?.isOpen]);

  React.useEffect(() => {
    try {
      const dataHead = getDataHead({ name: "headAlert" })[headType];

      setHead(dataHead);
    } catch (err) {}
  }, [headType]);

  return (
    <Collapse
      in={isOpen}
      className={
        " elements-alert " + (theme || "") + " " + (isOpen ? "open" : "")
      }
    >
      <Alert
        severity={type || "info"}
        action={
          !disableClose && (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          )
        }
      >
        {!disableTitle &&
          (Boolean(customTitle) ? (
            <AlertTitle>{locale(customTitle)}</AlertTitle>
          ) : (
            <AlertTitle>{locale(title[type || "info"])}</AlertTitle>
          ))}
        {Boolean(message) && (
          <div dangerouslySetInnerHTML={{ __html: locale(message) }}></div>
        )}
      </Alert>
    </Collapse>
  );
}
