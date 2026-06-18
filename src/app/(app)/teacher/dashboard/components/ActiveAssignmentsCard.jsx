"use client";

import React from "react";
import { Box, Card, LinearProgress, Skeleton, Stack, Typography } from "@mui/material";

export default function ActiveAssignmentsCard({
  assignments = [],
  loading = false,
  onAssignQuiz,
}) {
  return (
    <Card className="dashboard-page-card">
      <Typography
        className="dashboard-page-subtitle"
        style={{ textAlign: "left", marginBottom: 12 }}
      >
        Active Assignments
      </Typography>

      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={56} />
          ))}
        </Stack>
      ) : assignments.length === 0 ? (
        <Typography
          className="dashboard-page-description"
          style={{ textAlign: "left", color: "#888", marginTop: 8 }}
        >
          No active assignments yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {assignments.map((assignment, idx) => {
            const quizName =
              assignment.quiz_name ||
              assignment.name ||
              assignment.title ||
              "Untitled Quiz";
            const done = assignment.completed ?? assignment.done ?? 0;
            const total = assignment.total ?? assignment.student_count ?? 0;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <Box key={assignment.quiz_id || assignment.id || idx}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <Typography style={{ fontSize: 13, fontWeight: 500, color: "#333" }}>
                    {quizName}
                  </Typography>
                  <Typography style={{ fontSize: 12, color: "#777" }}>
                    {done}/{total} done
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#ebe8ff",
                    "& .MuiLinearProgress-bar": {
                      background:
                        "linear-gradient(90deg, #8264ff 0%, #ff64a0 100%)",
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      )}

      <Stack direction="row" sx={{ mt: 2 }}>
        <Typography
          onClick={onAssignQuiz}
          style={{
            fontSize: 13,
            color: "#8264ff",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          + Assign a new quiz
        </Typography>
      </Stack>
    </Card>
  );
}
