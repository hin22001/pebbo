import React from "react";
import ReactECharts from "echarts-for-react";
import { Stack, Typography, Skeleton } from "@mui/material";
import { Helpers } from "@/app/utils";
import { locale } from "@/app/data/locale";

export default function Chart(props) {
  const {
    pieCustom,
    title,
    option,
    loading,
    elementKey,
    height,
    width,
    maxHeight,
    disableStyleCard,
    slot,
    onEvents,
    sx,
  } = props;

  const mainClassName = "module-chart";

  return (
    <Stack
      className={mainClassName + " " + (disableStyleCard ? "" : "card-flat")}
      spacing={3}
      width={width}
      height={height || "100%"}
      maxHeight={maxHeight}
      sx={sx}
    >
      {(title || slot?.header) && (
        <Stack
          direction={"row"}
          spacing={1}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Typography variant="h6">{locale(title)}</Typography>

          {slot?.header}
        </Stack>
      )}
      {loading || !option ? (
        <Skeleton />
      ) : (
        <Stack className={mainClassName + "-chart"}>
          {pieCustom && (
            <Stack className={mainClassName + "-chart-custom-pie-custom"}>
              <Typography
                className={mainClassName + "-chart-custom-pie-custom-label"}
                variant="h6"
              >
                {locale(pieCustom?.label)}
              </Typography>
              <Typography
                className={
                  mainClassName + "-chart-custom-pie-custom-label text-h1"
                }
              >
                {locale(pieCustom?.bigValue)}
              </Typography>
            </Stack>
          )}
          <ReactECharts
            className={mainClassName + "-echart"}
            option={option}
            key={elementKey}
            onEvents={onEvents}
          />
        </Stack>
      )}
    </Stack>
  );
}
