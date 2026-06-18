"use client";
import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

const PurchaseModal = ({ isOpen, onClose, onConfirm, item }) => {
  if (!item) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: "32px",
          boxShadow: 24,
          p: 4,
          outline: "none",
        }}
      >
        <Stack spacing={3} textAlign="center">
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 16, top: 16 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h5" fontWeight={800}>
            Confirm Purchase
          </Typography>

          <Box
            sx={{
              width: 120,
              height: 120,
              bgcolor: "rgba(67, 108, 255, 0.05)",
              borderRadius: "24px",
              mx: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "60px",
            }}
          >
            🎁
          </Box>

          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={700}>
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to buy this item? It will be added to your
              inventory immediately.
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Typography
              variant="h5"
              fontWeight={900}
              sx={{
                color: "#FFB800",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <MonetizationOnIcon fontSize="large" />
              {item.price}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} pt={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              sx={{
                borderRadius: "14px",
                py: 1.5,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={onConfirm}
              sx={{
                borderRadius: "14px",
                py: 1.5,
                textTransform: "none",
                fontWeight: 700,
                background: "linear-gradient(135deg, #436CFF 0%, #00CDD2 100%)",
              }}
            >
              Confirm
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default PurchaseModal;
