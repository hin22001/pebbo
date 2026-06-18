"use client";

import React from "react";
import { Card, Skeleton, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function StudentsNeedingSupportCard({
  students = [],
  loading = false,
  classroomMap = {},
}) {
  const router = useRouter();

  const displayStudents = students.slice(0, 5);

  return (
    <Card className="dashboard-page-card">
      <Typography
        className="dashboard-page-subtitle"
        style={{ textAlign: "left", marginBottom: 12 }}
      >
        Students Needing Support
      </Typography>

      {loading ? (
        <Stack spacing={1}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={44} />
          ))}
        </Stack>
      ) : displayStudents.length === 0 ? (
        <Typography
          className="dashboard-page-description"
          style={{ textAlign: "left", color: "#888", marginTop: 8 }}
        >
          Start assigning quizzes to surface student insights.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {displayStudents.map((student) => {
            const studentId =
              student.student_id || student.user_id || student.id;
            const name =
              student.name ||
              student.display_name ||
              student.full_name ||
              "Unknown Student";
            const avg =
              student.avg_score ??
              student.average_score ??
              student.score ??
              null;
            const classroomId = student.classroom_id;
            const classroomName = classroomId
              ? classroomMap[classroomId]
              : null;

            const navPath = classroomId
              ? `/teacher/classrooms/${classroomId}/students/${studentId}`
              : `/teacher/students/${studentId}`;

            return (
              <Stack
                key={studentId}
                className="inbox-page-row"
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                onClick={() => router.push(navPath)}
                sx={{ cursor: "pointer", padding: "10px 12px", borderRadius: "8px" }}
              >
                <Stack>
                  <Typography style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>
                    {name}
                  </Typography>
                  {classroomName && (
                    <Typography style={{ fontSize: 12, color: "#999" }}>
                      {classroomName}
                    </Typography>
                  )}
                </Stack>
                {avg !== null && (
                  <Typography
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: avg < 50 ? "#e53935" : avg < 70 ? "#ef8c20" : "#43a047",
                    }}
                  >
                    {Math.round(avg)}%
                  </Typography>
                )}
              </Stack>
            );
          })}
        </Stack>
      )}
    </Card>
  );
}
