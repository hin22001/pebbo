"use client";

import React from "react";
import { Card, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function QuickActionsCard({ onAssignQuiz }) {
  const router = useRouter();

  return (
    <Card className="dashboard-page-card">
      <Typography
        className="dashboard-page-subtitle"
        style={{ textAlign: "left", marginBottom: 16 }}
      >
        Quick Actions
      </Typography>

      <Stack spacing={2} alignItems="flex-start">
        <Stack
          className="dashboard-page-form-btn"
          onClick={() => router.push("/teacher/quizzes/new")}
        >
          <Typography className="dashboard-page-form-btn-txt">
            + Create new quiz
          </Typography>
        </Stack>

        <Stack
          className="dashboard-page-form-btn"
          onClick={onAssignQuiz}
        >
          <Typography className="dashboard-page-form-btn-txt">
            + Assign a quiz
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
