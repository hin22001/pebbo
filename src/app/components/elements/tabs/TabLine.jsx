"use client";
import React from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { locale } from "@/locale";

export default function CenteredTabs(props) {
  const { head } = props;

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);

    if (props.handleChange) {
      props.handleChange({
        index: newValue,
        id: head[newValue]?.id,
      });
    }
  };

  React.useEffect(() => {
    if (props.handleChange && head?.length > 0) {
      props.handleChange({
        index: 0,
        id: head[0]?.id,
      });
    }
  }, []);

  return (
    <Box
      className="element-tab-line"
      sx={{
        width: "100%",
        bgcolor: "background.paper",
      }}
    >
      <Tabs value={value} onChange={handleChange} centered>
        {head?.length > 0 &&
          head.map((item, index) => (
            <Tab key={"tab-" + index} label={locale(item?.label)} />
          ))}
      </Tabs>
    </Box>
  );
}
