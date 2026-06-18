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
import QuestionsAPI from "@/app/data/api/QuestionsAPI";
import nProgress from "nprogress";
import Helpers from "@/app/utils/Helpers";

const ISSUE_REASONS = [
  { id: "question_wrong", label: "The question is wrong" },
  { id: "correct_answer_wrong", label: "The answer marked correct is wrong" },
  { id: "my_answer_wrong", label: "My correct answer was marked wrong" },
  {
    id: "explanation_incorrect",
    label: "The explanation is confusing or incorrect",
  },
  { id: "image_mismatch", label: "The image does not match the question" },
  { id: "audio_incorrect", label: "The audio does not sound correct" },
  { id: "something_else", label: "Something else went wrong" },
];

export default function IssueReportDrawer({ isOpen, onClose, questionId }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReasonChange = (event) => {
    setReason(event.target.value);
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
    if (!reason) {
      Helpers.openSnackbar({ message: "Please select a reason" });
      return;
    }

    if (reason === "something_else" && !description.trim()) {
      Helpers.openSnackbar({ message: "Please provide a description" });
      return;
    }

    setLoading(true);
    nProgress.start();

    try {
      await QuestionsAPI.postLogQuestionIssue(
        {},
        {
          question_id: questionId,
          reason,
          description: reason === "something_else" ? description : null,
        },
      );

      playAlertSound();
      Helpers.openSnackbar({
        message: "Thank you for your report! We will look into it.",
        variant: "success",
      });

      // Reset and close
      setReason("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Failed to report issue:", error);
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
            {locale("Report an Issue")}
          </Typography>
          <IconButton icon="close" handleClick={onClose} />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {locale("What's wrong with this question?")}
        </Typography>

        <FormControl>
          <RadioGroup value={reason} onChange={handleReasonChange}>
            {ISSUE_REASONS.map((item) => (
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

        {reason === "something_else" && (
          <Box className="fade-in">
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={locale("Tell us more about the issue...")}
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
