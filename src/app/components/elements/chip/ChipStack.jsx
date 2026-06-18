"use client";
import React from "react";
import Stack from "@mui/material/Stack";
import { Chip } from "..";

export default function ChipStack(props) {
  const { data, defaultValue, useRadio, theme } = props;

  const [radioActiveId, setRadioActiveId] = React.useState(defaultValue);

  const handleClick = (id) => {
    if (useRadio) {
      setRadioActiveId(id);
    }

    if (props.handleClick) {
      props.handleClick(id);
    }
  };

  React.useEffect(() => {
    setRadioActiveId(defaultValue);
  }, [defaultValue]);

  return (
    <Stack
      direction="row"
      spacing={1}
      className={"elements-chip-stack " + (theme || "")}
    >
      {data?.length > 0 &&
        Array.isArray(data) &&
        data.map((item, index) => {
          if (typeof item == "object") {
            return (
              <Chip
                key={"chip-" + index}
                id={item.id}
                theme={
                  item.theme + " " + (item.id == radioActiveId ? "active" : "")
                }
                handleClick={handleClick}
                clickable={Boolean(props.handleClick || item.href)}
                color={item.color}
              />
            );
          } else if (typeof item == "string") {
            return (
              <Chip key={"chip-" + index} label={item} color={props.color} />
            );
          }
        })}
    </Stack>
  );
}
