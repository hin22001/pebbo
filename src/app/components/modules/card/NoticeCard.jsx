"use client";
import React, { Component } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import { Button, IconCustom } from "../../elements";

import { getDataHead } from "../../../data/head";
import Image from "next/image";
import { locale } from "@/app/data/locale";

export default function NoticeCard(props) {
  let {
    title,
    message,
    theme,
    useButton, // ==> see headNoticeCard
    headType,
    icon,
    disableCard,
    reconcilePayment,
    btnTitle,
    attemptSubscribe,
  } = props;

  const [head, setHead] = React.useState();

  const images = {
    ImageAccessDenied: (
      <Image
        src={require("@/images/illustration/illustration-access-denied.svg")}
        alt="Image Access Denied"
      />
    ),
    ImageDataNotFound: (
      <Image
        src={require("@/images/illustration/illustration-no-data.svg")}
        alt="Image Data Not Found"
      />
    ),
    ImageUnderConstruction: (
      <Image
        src={require("@/images/illustration/illustration-under-construction.svg")}
        alt="Image Under Construction"
      />
    ),
    ImageDashboard: (
      <Image
        src={require("@/images/illustration/illustration-mascot.png")}
        alt="Image Dashboard"
      />
    ),
    ImageNotFound: (
      <Image
        src={require("@/images/illustration/illustration-page-not-found.svg")}
        alt="Page Not Found"
      />
    ),
    IconRedX: (
      <Image
        src={require("@/images/icon/icon-alert-red.png")}
        alt="Icon Red Hazard"
      />
    ),
  };

  let image = images[props.image];
  let imageSrc = props.imageSrc || head?.imageSrc;

  image = imageSrc ? (
    <Image src={imageSrc} alt={head?.imageAlt || "Image Illustration"} />
  ) : head?.image ? (
    images[head?.image]
  ) : null;

  if (headType && head) {
    title = head.title;

    message = head.message;

    theme = head.theme + " " + (props.theme || "");
    useButton = head.useButton;
    icon = head.icon;
  }

  React.useEffect(() => {
    try {
      const dataHead = getDataHead({ name: "headNoticeCard" })[headType];
      setHead(dataHead);
    } catch (err) {}
  }, [headType]);

  return (
    <div
      className={
        (disableCard ? "" : "card") +
        " modules-notice-card " +
        (theme || "") +
        " " +
        (image ? "with-image" : "")
      }
    >
      <Card>
        <CardContent>
          {image && <div className="wrap-image">{image}</div>}
          {icon && <IconCustom {...(icon || {})} />}
          <div className="wrap-text">
            <Typography
              className="text-1"
              gutterBottom
              dangerouslySetInnerHTML={{ __html: locale(title) }}
            ></Typography>
            {message && locale(message) !== "" && (
              <Typography
                className="text-2"
                variant="body2"
                dangerouslySetInnerHTML={{ __html: locale(message) }}
              ></Typography>
            )}
          </div>
          {useButton && useButton.length > 0 && (
            <div className="wrap-button">
              {useButton.map((item, index) => (
                <Button
                  key={"notice-card-use-button-" + index}
                  {...(item || {})}
                />
              ))}
            </div>
          )}

          {reconcilePayment && !reconcilePayment?.payload?.data?.paying && (
            <div className="wrap-button">
              <Button handleClick={attemptSubscribe} label={locale(btnTitle)} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
