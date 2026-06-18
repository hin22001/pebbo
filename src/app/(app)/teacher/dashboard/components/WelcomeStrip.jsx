"use client";

import React from "react";
import { Avatar, Card, Stack, Typography } from "@mui/material";
import { Auth } from "@/src/app/data/local";

export default function WelcomeStrip({ classroomCount = 0, studentCount = 0 }) {
  const dataUser = Auth.getDataUser();
  const name = dataUser?.name || "Teacher";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="dashboard-page-card" style={{ marginBottom: 0 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack spacing={0.5}>
          <Typography className="dashboard-page-title" style={{ textAlign: "left", fontSize: 20 }}>
            {greeting}, {name}.
          </Typography>
          <Typography className="dashboard-page-description" style={{ textAlign: "left" }}>
            You teach{" "}
            <strong>{classroomCount}</strong>{" "}
            {classroomCount === 1 ? "classroom" : "classrooms"} with{" "}
            <strong>{studentCount}</strong>{" "}
            {studentCount === 1 ? "student" : "students"}.
          </Typography>
        </Stack>
        <Avatar
          sx={{
            width: 52,
            height: 52,
            background: "linear-gradient(135deg, #8264ff 0%, #ff64a0 100%)",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          {initials}
        </Avatar>
      </Stack>
    </Card>
  );
}
