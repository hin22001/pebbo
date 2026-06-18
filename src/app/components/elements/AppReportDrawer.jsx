"use client";
import React, { useState } from "react";
import {
  Drawer,
  Stack,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Box,
} from "@mui/material";
import { Button, IconButton } from "@/elements";
import { locale } from "@/app/data/locale";
import UserAPI from "@/app/data/api/UserAPI";
import nProgress from "nprogress";
import Helpers from "@/app/utils/Helpers";

const APP_REPORT_CATEGORIES = [
  { id: "audio_loud", label: "Audio is too loud" },
  { id: "rewards_not_given", label: "Rewards or coins not given" },
  { id: "page_slow", label: "Page is slow or loading takes too long" },
  { id: "something_else", label: "Something didn't work as expected" },
];

export default function AppReportDrawer({ isOpen, onClose }) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const playAlertSound = () => {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (!soundEnabled) return;

    const audio = new Audio(
      "/sounds/Alert_exercise_page_turn_up_its_volume.mp3",
    );
    audio.currentTime = 0;
    audio.play().catch((err) => {
      console.error("Error playing alert sound:", err);
    });
  };

  const handleSubmit = async () => {
    if (!category) {
      Helpers.openSnackbar({ message: "Please select a category" });
      return;
    }

    if (category === "something_else" && !description.trim()) {
      Helpers.openSnackbar({ message: "Please tell us what didn't work" });
      return;
    }

    setLoading(true);
    nProgress.start();

    try {
      await UserAPI.postLogAppReport(
        {},
        {
          category,
          description: category === "something_else" ? description : null,
        },
      );

      playAlertSound();
      Helpers.openSnackbar({
        message: "Thank you for your feedback! We will look into it.",
        variant: "success",
      });

      // Reset and close
      setCategory("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Failed to report app issue:", error);
      Helpers.openSnackbar({
        message: "Failed to submit report. Please try again later.",
        variant: "error",
      });
    } finally {
      setLoading(false);
      nProgress.done();
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={isOpen}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          padding: "24px",
          width: { xs: "100%", sm: "500px" },
          margin: { sm: "0 auto" },
          maxHeight: "90vh",
        },
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight="bold">
            {locale("Report a Problem")}
          </Typography>
          <IconButton icon="close" handleClick={onClose} />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {locale("What happened? Help us improve Pebbo!")}
        </Typography>

        <FormControl>
          <RadioGroup value={category} onChange={handleCategoryChange}>
            {APP_REPORT_CATEGORIES.map((item) => (
              <FormControlLabel
                key={item.id}
                value={item.id}
                control={<Radio color="primary" />}
                label={locale(item.label)}
                sx={{
                  padding: "4px 0",
                  "& .MuiTypography-root": {
                    fontSize: "0.95rem",
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {category === "something_else" && (
          <Box className="fade-in">
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={locale("Tell us more about what happened...")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#f9f9f9",
                },
              }}
            />
          </Box>
        )}

        <Button
          fullWidth
          theme="primary"
          variant="contained"
          size="lg"
          handleClick={handleSubmit}
          loading={loading}
          sx={{
            marginTop: "8px",
            borderRadius: "12px",
            height: "56px",
            fontSize: "1.1rem",
            textTransform: "none",
          }}
        >
          {locale("Submit Report")}
        </Button>
      </Stack>
    </Drawer>
  );
}
