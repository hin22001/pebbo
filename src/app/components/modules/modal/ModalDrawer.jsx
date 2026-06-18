"use client";
import React from "react";
import { Skeleton, Typography, Drawer, Stack } from "@mui/material";

import classnames from "classnames";

import Button from "@/elements/button/Button";
import IconButton from "@/elements/icon/IconButton";
import ImageHandler from "@/elements/image/ImageHandler";
import { locale } from "@/app/data/locale";

export default function ModalDrawer(props) {
  const {
    title, //=> required
    description,
    hideDescription, //=> hide status

    subtitle,

    className,
    theme,
    isOpen,
    anchor,

    useButton,
    useCard,

    children,
    disableBackdrop,

    image,
  } = props;

  // ========================
  // ==== Initial Config ====
  // ========================

  const mainClassName = "module-modal-drawer";
  const _anchor = anchor || "right";

  const attributeClassName = classnames(
    className,
    theme,
    "anchor-" + _anchor,
    disableBackdrop ? "disable-backdrop" : "",
  );
  const refactorClassName = classnames(mainClassName, attributeClassName);

  const [_isOpen, setOpen] = React.useState(isOpen);

  const toggleDrawer = (open) => {
    setOpen(false);
  };

  React.useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <Drawer
      className={refactorClassName}
      anchor={_anchor}
      open={Boolean(_isOpen)}
      onClose={toggleDrawer}
    >
      <Stack
        className={mainClassName + "-content " + (image ? "use-image" : "")}
      >
        {image && (
          <Stack className={mainClassName + "-content-image"}>
            <ImageHandler
              src={image?.src}
              size={image?.size}
              className={image?.className}
            />
          </Stack>
        )}
        <Stack
          className={mainClassName + "-content-header"}
          spacing={2}
          direction={"row"}
        >
          <Typography variant="h3" className="text-title">
            {locale(title) || <Skeleton />}
          </Typography>

          <IconButton icon="close" handleClick={toggleDrawer} />
        </Stack>
        <Stack className={mainClassName + "-content-body"}>
          {subtitle && (
            <Typography variant="subtitle1" className="text-subtitle">
              {locale(subtitle) || <Skeleton />}
            </Typography>
          )}

          {description && (
            <Typography variant="body1" className="text-description">
              {locale(description) || <Skeleton row={3} />}
            </Typography>
          )}

          {children}

          {useButton && <Button {...(useButton || {})} />}
        </Stack>
      </Stack>
    </Drawer>
  );
}
