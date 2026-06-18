"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Box, Divider, IconButton, Modal, Stack, Typography } from "@mui/material";

// RichText (Tiptap) is client-only and reads the `value` prop (NOT `data`).
const RichText = dynamic(
  () =>
    import("@/app/components/sections/richText").then((m) => ({
      default: m.RichText,
    })),
  { ssr: false }
);

export default function QuizPreview({ candidates, onClose }) {
  const count = candidates?.length || 0;

  return (
    <Modal open onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 720,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#fff",
          borderRadius: "20px",
          outline: "none",
          boxShadow: "0 20px 48px -12px rgba(0, 0, 0, 0.35)",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ padding: "20px 24px", borderBottom: "1px solid #eee" }}
        >
          <Stack>
            <Typography style={{ fontSize: 18, fontWeight: 600, color: "#565656" }}>
              Preview as student
            </Typography>
            <Typography style={{ fontSize: 13, color: "#8d8d8d" }}>
              How students will see {count === 1 ? "this question" : `these ${count} questions`}
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small" sx={{ color: "#8d8d8d" }}>
            <Typography style={{ fontSize: 22, lineHeight: 1 }}>×</Typography>
          </IconButton>
        </Stack>

        <Box sx={{ padding: "8px 24px 24px", overflowY: "auto" }}>
          {count === 0 ? (
            <Typography style={{ color: "#8d8d8d", fontSize: 14, paddingTop: 16 }}>
              No questions to preview.
            </Typography>
          ) : (
            <Stack divider={<Divider sx={{ borderColor: "#f0f0f0" }} />}>
              {candidates.map((q, idx) => (
                <Stack key={q.key || idx} spacing={0.75} sx={{ paddingY: 2.5 }}>
                  <Typography
                    style={{ fontSize: 12, fontWeight: 600, color: "#8264ff" }}
                  >
                    Question {idx + 1}
                  </Typography>
                  {q.question_object ? (
                    <RichText
                      value={q.question_object}
                      readOnly
                      hideMenuBar
                      questionId={q.primaryId || q.uqId || idx}
                    />
                  ) : (
                    <Typography style={{ fontSize: 14, color: "#8d8d8d" }}>
                      No preview available.
                    </Typography>
                  )}
                </Stack>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
