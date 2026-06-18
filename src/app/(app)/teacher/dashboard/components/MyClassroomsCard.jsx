"use client";

import React from "react";
import { Card, Skeleton, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function MyClassroomsCard({ classrooms = [], loading = false }) {
  const router = useRouter();

  return (
    <Card className="dashboard-page-card">
      <Typography
        className="dashboard-page-subtitle"
        style={{ textAlign: "left", marginBottom: 12 }}
      >
        My Classrooms
      </Typography>

      {loading ? (
        <Stack spacing={1}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={48} />
          ))}
        </Stack>
      ) : classrooms.length === 0 ? (
        <Typography
          className="dashboard-page-description"
          style={{ textAlign: "left", color: "#888", marginTop: 8 }}
        >
          You&apos;re not in any classrooms yet. Talk to your school admin, or
          create one from the Classrooms page.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {classrooms.map((classroom) => {
            const id = classroom.classroom_id || classroom.id;
            const name = classroom.name || classroom.classroom_name || "Unnamed Classroom";
            const count =
              classroom.student_count ??
              classroom.students_count ??
              classroom.total_students ??
              null;

            return (
              <Stack
                key={id}
                className="inbox-page-row"
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                onClick={() => router.push(`/teacher/classrooms/${id}`)}
                sx={{ cursor: "pointer", padding: "10px 12px", borderRadius: "8px" }}
              >
                <Typography style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>
                  {name}
                </Typography>
                {count !== null && (
                  <Typography style={{ fontSize: 13, color: "#777" }}>
                    {count} {count === 1 ? "student" : "students"}
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
