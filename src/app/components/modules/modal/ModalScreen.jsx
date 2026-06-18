"use client";
import React from "react";
import Modal from "@mui/material/Modal";
import { ModalConfirm } from "@/components/modules";
import { Typography } from "@mui/material";
import { locale } from "@/app/data/locale";
import { IconButton, Skeleton } from "../../elements";

export default function ModalScreen(props) {
  const {
    children,
    isOpen,
    handleClose,
    className,
    confirmClose,
    preventClose,
    title,
  } = props;

  const [open, setOpen] = React.useState(Boolean(isOpen));
  const [openModalConfirm, setOpenModalConfirm] = React.useState(false);

  const onClose = (type) => {
    if (!preventClose) {
      if (type == "modal-confirm-done") {
        setOpen(false);
        setOpenModalConfirm(false);
        if (handleClose) handleClose();
      } else if (confirmClose) {
        setOpenModalConfirm(true);
      } else {
        setOpen(false);
        if (handleClose) handleClose();
      }
    }
  };

  React.useEffect(() => {
    setOpen(Boolean(isOpen));
  }, [isOpen]);

  const mainClassName = "modules-modal-screen";

  return (
    <>
      <Modal
        className={mainClassName + " " + (className || "")}
        open={open}
        onClose={onClose}
      >
        <div className={mainClassName + "-content"}>
          {title && (
            <div className={mainClassName + "-content-header"}>
              <Typography variant="h5" component="h3" className="text-title">
                {locale(title) || <Skeleton />}
              </Typography>

              <IconButton icon="close" handleClick={onClose} />
            </div>
          )}

          {children}

          {confirmClose && (
            <ModalConfirm
              isOpen={openModalConfirm}
              headType="leave"
              handleClose={() => setOpenModalConfirm(false)}
              handleAccept={() => onClose("modal-confirm-done")}
            />
          )}
        </div>
      </Modal>
    </>
  );
}
