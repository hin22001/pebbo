"use client";
import React from "react";
import { Stack, Box, Typography, Button, Card } from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { ImageHandler } from "@/app/components/elements";

const ShopItemCard = ({ item, onBuy }) => {
  const mainClassName = "template-shop-item-card";

  return (
    <Card
      className={mainClassName}
      sx={{
        width: 280,
        borderRadius: "24px",
        padding: 3,
        textAlign: "center",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-10px)",
          boxShadow: "0 20px 40px rgba(67, 108, 255, 0.12)",
          borderColor: "rgba(67, 108, 255, 0.3)",
        },
      }}
    >
      <Box
        sx={{
          height: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f8fbff 0%, #f0f4ff 100%)",
          borderRadius: "16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{ width: 100, height: 100, transition: "transform 0.3s ease" }}
          className="item-icon-container"
        >
          {/* Fallback to simple box if icon not found */}
          <Box
            sx={{
              width: "100%",
              height: "100%",
              bgcolor: "rgba(67, 108, 255, 0.1)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
            }}
          >
            🎁
          </Box>
        </Box>
      </Box>

      <Stack spacing={1} flex={1}>
        <Typography variant="h6" fontWeight={800} color="#333">
          {item.name}
        </Typography>
        <Typography variant="body2" color="#666" sx={{ minHeight: 40 }}>
          {item.description}
        </Typography>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mt={2}
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <MonetizationOnIcon sx={{ color: "#FFB800", fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={800} color="#333">
            {item.price}
          </Typography>
        </Stack>

        <Button
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            onBuy();
          }}
          sx={{
            borderRadius: "12px",
            px: 3,
            textTransform: "none",
            fontWeight: 800,
            background: "linear-gradient(135deg, #436CFF 0%, #00CDD2 100%)",
            "&:hover": {
              opacity: 0.9,
              boxShadow: "0 4px 15px rgba(67, 108, 255, 0.4)",
            },
          }}
        >
          Buy
        </Button>
      </Stack>
    </Card>
  );
};

export default ShopItemCard;
