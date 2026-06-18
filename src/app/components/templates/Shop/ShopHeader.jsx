"use client";
import React from "react";
import { Stack, Box, Typography, Card } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import StarsIcon from "@mui/icons-material/Stars";

const ShopHeader = ({ dataUser }) => {
  const mainClassName = "template-shop-header";

  const CurrencyItem = ({ icon: Icon, value, label, color }) => (
    <Card
      className={mainClassName + "-item"}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 3,
        py: 1.5,
        borderRadius: "20px",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        border: `1px solid ${color}33`,
      }}
    >
      <Box sx={{ color: color, display: "flex" }}>
        <Icon sx={{ fontSize: 32 }} />
      </Box>
      <Stack>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ color: "#333", lineHeight: 1 }}
        >
          {value || 0}
        </Typography>
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{ color: "#888", textTransform: "uppercase" }}
        >
          {label}
        </Typography>
      </Stack>
    </Card>
  );

  return (
    <Box
      className={mainClassName}
      sx={{
        background: "linear-gradient(180deg, #f0f4ff 0%, transparent 100%)",
        pt: 4,
        pb: 2,
        px: 4,
      }}
    >
      <Stack
        direction="row"
        justifyContent="center"
        spacing={3}
        flexWrap="wrap"
        gap={2}
      >
        <CurrencyItem
          icon={MonetizationOnIcon}
          value={dataUser?.coins || 500}
          label="Coins"
          color="#FFB800"
        />
        <CurrencyItem
          icon={BoltIcon}
          value={dataUser?.energy || 80}
          label="Energy"
          color="#00D1FF"
        />
        <CurrencyItem
          icon={StarsIcon}
          value={dataUser?.tokens || 5}
          label="Tokens"
          color="#FF4D4D"
        />
      </Stack>
    </Box>
  );
};

export default ShopHeader;
