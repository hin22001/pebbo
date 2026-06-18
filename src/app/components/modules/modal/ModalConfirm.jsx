"use client";
import React from "react";

import ModalScreen from "@/modules/modal/ModalScreen";

import Button from "@/elements/button/Button";
import IconButton from "@/elements/icon/IconButton";
import IconCustom from "@/elements/icon/IconCustom";
import ImageHandler from "@/elements/image/ImageHandler";

import { getDataHead } from "../../../data/head";
import Image from "next/image";
import { locale } from "@/app/data/locale";

function DialogConfirm(props) {
  const { head, handleConfirm, handleAccept, handleDecline, message } = props;

  const mainClassName = "modules-modal-confirm";

  const type = props.type || "confirm";

  const labels = getDataHead({
    name: "headLabel",
  });

  if (message) {
    head["message"] = message;
  }

  return (
    <div className={mainClassName}>
      {head && (
        <div className={mainClassName + "-content"}>
          {head.showCloseButton && (
            <div className={mainClassName + "-close-button "}>
              <IconButton
                icon={{
                  name: "close",
                  type: "mui",
                }}
                handleClick={handleDecline}
              />
            </div>
          )}

          <div className={mainClassName + "-icon " + (head?.iconSize || "")}>
            {head?.image ? (
              <ImageHandler
                className={mainClassName + "-icon-image"}
                src={head?.image}
              />
            ) : (
              head?.icon && (
                <IconCustom
                  name={head?.icon?.name || head?.icon}
                  size={head?.icon?.size || "large"}
                />
              )
            )}
          </div>

          {head.label && (
            <p className={mainClassName + "-title"}>{locale(head.label)}</p>
          )}

          {head.explanation && (
            <p className={mainClassName + "-explanation"}>
              {locale(head.explanation)}
            </p>
          )}

          {head.message && (
            <p
              className={mainClassName + "-message"}
              dangerouslySetInnerHTML={{ __html: locale(head.message) }}
            ></p>
          )}

          <div className={mainClassName + "-button"}>
            {
              {
                confirm: (
                  <>
                    <Button
                      handleClick={handleAccept}
                      {...(head?.button?.confirmAccepted || {
                        headType: "confirmAccepted",
                      })}
                    />
                    <Button
                      handleClick={handleDecline}
                      {...(head?.button?.confirmDecline || {
                        headType: "confirmDecline",
                      })}
                    />
                  </>
                ),
                feedback: (
                  <Button
                    handleClick={handleConfirm}
                    label={head?.button?.label || labels?.close}
                    href={head?.button?.href}
                  />
                ),
              }[type]
            }
          </div>
        </div>
      )}
    </div>
  );
}

export default function ModalConfirm(props) {
  const {
    isOpen,
    handleAccept,
    handleDecline,
    handleConfirm,
    handleClose,
    headType,
    preventCloseBackdrop,
    strictOnClose,
    message,
  } = props;

  const type = props.type || "confirm"; // ==> Confirm (With button Accept & Decline) || Feedback (With Single Confirm Button)

  const [open, setOpen] = React.useState(isOpen || false);
  const [head, setHead] = React.useState(props.head);

  const closeModal = () => {
    if (!strictOnClose) {
      setOpen(false);
    }

    if (handleDecline) {
      handleDecline();
    }

    if (handleClose) {
      handleClose();
    }
  };

  const acceptConfirm = () => {
    if (handleAccept) {
      handleAccept();
    } else if (handleConfirm) {
      handleConfirm();
    }

    closeModal();
  };

  React.useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  React.useEffect(() => {
    if (headType) {
      const newHead = getDataHead({ name: "headModalConfirm" })[headType];

      setHead(newHead);
    }
  }, [headType]);

  React.useEffect(() => {
    if (JSON.stringify(head) != JSON.stringify(props.head) && props.head) {
      setHead(props.head);
    }
  }, [props.head, head]);

  return (
    <ModalScreen
      isOpen={open}
      handleClose={!preventCloseBackdrop && closeModal}
    >
      <DialogConfirm
        type={head?.type || type}
        head={head}
        handleConfirm={acceptConfirm}
        handleAccept={acceptConfirm}
        handleDecline={closeModal}
        message={message}
      />
    </ModalScreen>
  );
}
