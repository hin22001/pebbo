import React from "react";
import { Card, CardContent, Typography, Button, Stack, Box } from "@mui/material";
import { ImageHandler } from "@/components/elements";

export const RewardCard = ({ reward, onRedeem, canAfford, isRedeemed }) => {
  const handleRedeem = () => {
    if (canAfford && !isRedeemed) {
      onRedeem(reward.id);
    }
  };

  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: "280px",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
        },
        opacity: isRedeemed ? 0.6 : 1,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Image */}
        <Stack
          alignItems="center"
          justifyContent="center"
          mb={2}
          sx={{
            height: "160px",
            backgroundColor: "#F5F5F5",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <ImageHandler
            src={reward.image}
            alt={reward.name}
            width={140}
            height={140}
          />
        </Stack>

        {/* Name */}
        <Typography
          fontWeight={600}
          fontSize={16}
          mb={1}
          textAlign="center"
          color="#231F20"
          sx={{
            minHeight: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {reward.name}
        </Typography>

        {/* Description */}
        <Typography
          fontSize={12}
          color="#666"
          mb={2}
          textAlign="center"
          sx={{ minHeight: "36px" }}
        >
          {reward.description}
        </Typography>

        {/* Coin Cost */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={0.5}
          mb={2}
        >
          <ImageHandler
            src={require("@/images/icon/icon-star-yellow.png")}
            alt="coin"
            width={24}
            height={24}
          />
          <Typography fontSize={20} fontWeight={700} color="#FFD700">
            {reward.cost}
          </Typography>
        </Stack>

        {/* Redeem Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleRedeem}
          disabled={!canAfford || isRedeemed}
          sx={{
            backgroundColor:
              isRedeemed
                ? "#90EE90"
                : canAfford
                ? "#8264FF"
                : "#C0C0C0",
            color: "#FFF",
            fontWeight: 600,
            borderRadius: "8px",
            py: 1,
            textTransform: "none",
            fontSize: 14,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor:
                isRedeemed
                  ? "#90EE90"
                  : canAfford
                  ? "#6d52e6"
                  : "#C0C0C0",
              transform: canAfford && !isRedeemed ? "scale(1.05)" : "none",
            },
            "&:disabled": {
              backgroundColor: "#E0E0E0",
              color: "#999",
            },
          }}
        >
          {isRedeemed ? "Redeemed" : canAfford ? "Redeem" : "Not Enough Coins"}
        </Button>
      </CardContent>
    </Card>
  );
};
