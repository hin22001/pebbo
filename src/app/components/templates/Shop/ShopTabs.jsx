"use client";
import React from "react";
import { Stack, Button, Typography } from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ExtensionIcon from "@mui/icons-material/Extension";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

const ShopTabs = ({ activeTab, onTabChange }) => {
  const mainClassName = "template-shop-tabs";

  const tabs = [
    {
      id: "boosters",
      label: "Boosters",
      icon: RocketLaunchIcon,
      color: "#436CFF",
    },
    { id: "puzzle", label: "Puzzle", icon: ExtensionIcon, color: "#FFB000" },
    { id: "custom", label: "Custom", icon: AutoFixHighIcon, color: "#00CDD2" },
  ];

  return (
    <Stack
      direction="row"
      justifyContent="center"
      spacing={2}
      className={mainClassName}
      sx={{ mb: 6 }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <Button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            variant={isActive ? "contained" : "text"}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: "15px",
              textTransform: "none",
              fontSize: "16px",
              fontWeight: 700,
              gap: 1.5,
              backgroundColor: isActive ? tab.color : "transparent",
              color: isActive ? "#fff" : "#666",
              boxShadow: isActive ? `0 8px 20px ${tab.color}44` : "none",
              "&:hover": {
                backgroundColor: isActive ? tab.color : "rgba(0,0,0,0.05)",
                transform: "translateY(-2px)",
              },
              transtion: "all 0.3s ease",
            }}
          >
            <Icon sx={{ fontSize: 24 }} />
            {tab.label}
          </Button>
        );
      })}
    </Stack>
  );
};

export default ShopTabs;
