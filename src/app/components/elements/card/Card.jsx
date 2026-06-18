"use client";
import React from "react";

import classnames from "classnames";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Button, Chip, IconCustom } from "@/elements";
import { Stack } from "@mui/material";

export default function CardCustom(props) {
  const mainClassName = "element-card";

  const {
    className,
    title,
    topSubtitle,
    subtitle,
    description,
    icon,
    button,
    chip,
  } = props;

  return (
    <Stack
      className={classnames(mainClassName, className, icon ? "with-icon" : "")}
    >
      <Card>
        <CardContent>
          {topSubtitle && (
            <Typography
              className={mainClassName + "-text-top-subtitle"}
              variant="body1"
            >
              {topSubtitle}
            </Typography>
          )}
          {title && (
            <Typography className={mainClassName + "-text-title"} variant="h5">
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              className={mainClassName + "-text-subtitle"}
              variant="h6"
            >
              {subtitle}
            </Typography>
          )}
          {description && (
            <Typography
              className={mainClassName + "-text-description"}
              variant="body1"
            >
              {description}
            </Typography>
          )}
          {icon && <IconCustom {...(icon || {})} />}
          {chip && <Chip {...(chip || {})} />}
          {button && (
            <CardActions>
              <Button {...(button || {})} />
            </CardActions>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
