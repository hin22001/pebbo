import React from "react";
import { Stack, Typography } from "@mui/material";
import ImageHandler from "@/elements/image/ImageHandler";
import { useRouter } from "next/navigation";
import { locale } from "@/locale";

const NavigationButtons = ({ mainClassName, head2 }) => {
  const router = useRouter();
  const checkUrl = (url) => {
    const url_ = window.location.href;
    return url_?.includes(url);
  };

  const navigationItems = [
    {
      id: "dashboard",
      icon: require("@/images/icon/icon-classroom.svg"),
      label: head2?.management,
      path: "/dashboard",
      altText: "ico classroom",
    },
    {
      id: "admin-performance",
      icon: require("@/images/icon/icon-chart-bar.svg"),
      label: head2?.performance,
      path: "/admin-performance",
      altText: "ico chart",
    },
    {
      id: "school-overview",
      icon: require("@/images/icon/icon-uniform.svg"),
      label: head2?.schoolOverview,
      path: "/school-overview",
      altText: "ico uniform",
    },
    {
      id: "admin-monitoring",
      icon: require("@/images/icon/icon-chart-bar.svg"),
      label: {
        en: "Monitoring",
        zh: "監控",
      },
      path: "/admin-monitoring",
      altText: "ico monitoring",
    },
  ];

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      width="100%"
      direction="row"
    >
      {navigationItems.map((item) => (
        <Stack
          key={item.id}
          onClick={() => router.push(item.path)}
          ml={1}
          direction="row"
          className={
            mainClassName +
            `-ico-wrapper-${checkUrl(item.id) ? "" : "in"}active`
          }
        >
          <ImageHandler
            className={mainClassName + "-ico"}
            src={item.icon}
            alt={item.altText}
          />
          <Typography
            className={
              mainClassName + `-ico-text-${checkUrl(item.id) ? "" : "in"}active`
            }
            sx={{
              fontFamily: "'Advercase', serif !important",
              letterSpacing: "0.07rem",
            }}
          >
            {locale(item.label)}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
};

export default NavigationButtons;
