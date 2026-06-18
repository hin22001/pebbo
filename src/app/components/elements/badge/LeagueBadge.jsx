import React from "react";
import { Chip } from "@mui/material";

export const LeagueBadge = ({ league, size = "small" }) => {
  const getLeagueColor = () => {
    switch (league) {
      case "Gold League":
        return {
          bgColor: "#FFD700",
          textColor: "#000",
          borderColor: "#FFA500",
        };
      case "Silver League":
        return {
          bgColor: "#C0C0C0",
          textColor: "#000",
          borderColor: "#808080",
        };
      case "Bronze League":
        return {
          bgColor: "#CD7F32",
          textColor: "#FFF",
          borderColor: "#8B4513",
        };
      default:
        return {
          bgColor: "#E0E0E0",
          textColor: "#000",
          borderColor: "#BDBDBD",
        };
    }
  };

  const colors = getLeagueColor();

  return (
    <Chip
      label={league}
      size={size}
      sx={{
        backgroundColor: colors.bgColor,
        color: colors.textColor,
        border: `1px solid ${colors.borderColor}`,
        fontWeight: 600,
        fontSize: size === "small" ? "0.75rem" : "0.875rem",
        height: size === "small" ? "24px" : "28px",
        position: "relative",
        overflow: "hidden",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "50%",
          height: "100%",
          background:
            "linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0) 100%)",
          animation: "metal-sheen 2s ease-in-out infinite",
          opacity: 0.8,
          pointerEvents: "none",
        },
      }}
    />
  );
};
