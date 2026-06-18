"use client";

import React, { useEffect, useState } from "react";
import { Stack, Typography, Skeleton, Avatar } from "@mui/material";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import TeacherCard from "@/app/components/modules/card/TeacherCard";
import { Auth } from "@/src/app/data/local";
import { useRouter } from "next/navigation";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import { ImageHandler } from "@/app/components/elements";

import AssignQuizModal from "@/modules/modal/AssignQuizModal";
import useTeacherDashboardStore from "@/src/app/stores/useTeacherDashboardStore";

const mainClassName = "dashboard-page";

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "night";
}

const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#E6E6E6",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor:
      getTimeOfDay() === "morning"
        ? "#00CDD2"
        : getTimeOfDay() === "afternoon"
          ? "#FF5000"
          : "#8264FF",
  },
}));

export default function TeacherDashboardClient() {
  const router = useRouter();
  const classrooms = useTeacherDashboardStore((s) => s.classrooms);
  const assignments = useTeacherDashboardStore((s) => s.assignments);
  const students = useTeacherDashboardStore((s) => s.students);
  const classroomMap = useTeacherDashboardStore((s) => s.classroomMap);
  const loading = useTeacherDashboardStore((s) => s.loading);
  const fetchAll = useTeacherDashboardStore((s) => s.fetchAll);
  const invalidate = useTeacherDashboardStore((s) => s.invalidate);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const dataUser = Auth.getDataUser();
  const name = dataUser?.name || "Teacher";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const timeOfDay = getTimeOfDay();

  const totalStudents = classrooms.reduce((acc, c) => {
    return acc + (c.student_count ?? c.students_count ?? c.total_students ?? 0);
  }, 0);

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <ContentLayout title="Dashboard" hideTitle={true}>
      <TeacherCard>
        <Stack className={mainClassName + "-student-wrapper"}>
          {/* Row 1: Profile card (70%) + Action cards (30%) */}
          <Stack className={mainClassName + "-flex-container"}>
            {/* Left: Profile + Stats */}
            <Stack className={mainClassName + "-flex-item-left"}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  background:
                    "linear-gradient(135deg, #8264ff 0%, #ff64a0 100%)",
                  fontWeight: 700,
                  fontSize: 36,
                  fontFamily: "'Advercase', serif",
                  flexShrink: 0,
                }}
              >
                {initials}
              </Avatar>

              <Stack
                ml={2}
                width="100%"
                justifyContent="space-between"
                className={mainClassName + "-flex-item-left-content"}
              >
                <Typography
                  fontSize={28}
                  fontWeight={600}
                  sx={{ fontFamily: "'Advercase', serif !important" }}
                >
                  {greeting}, {name}.
                </Typography>
                <Typography
                  mt={1}
                  fontSize={16}
                  fontWeight={500}
                  color="#565656"
                >
                  {classrooms.length}{" "}
                  {classrooms.length === 1 ? "classroom" : "classrooms"} &middot;{" "}
                  {totalStudents}{" "}
                  {totalStudents === 1 ? "student" : "students"}
                </Typography>

                {/* Stats row */}
                <Stack
                  direction="row"
                  spacing={3}
                  mt={2}
                  alignItems="center"
                >
                  <Stack alignItems="center">
                    <Typography fontSize={24} fontWeight={700} color="#FF5000">
                      {classrooms.length}
                    </Typography>
                    <Typography fontSize={12} color="#8D8D8D">
                      Classes
                    </Typography>
                  </Stack>
                  <Stack alignItems="center">
                    <Typography fontSize={24} fontWeight={700} color="#8264FF">
                      {totalStudents}
                    </Typography>
                    <Typography fontSize={12} color="#8D8D8D">
                      Students
                    </Typography>
                  </Stack>
                  <Stack alignItems="center">
                    <Typography fontSize={24} fontWeight={700} color="#02CDD2">
                      {assignments.length}
                    </Typography>
                    <Typography fontSize={12} color="#8D8D8D">
                      Assignments
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>

            {/* Right: Quick actions */}
            <Stack className={mainClassName + "-flex-item-right"}>
              <Stack
                className={
                  mainClassName + `-flex-item-right-content1 ${timeOfDay}`
                }
                onClick={() => router.push("/teacher/quizzes/new")}
                sx={{ cursor: "pointer" }}
              >
                <Stack alignItems="center" spacing={1}>
                  <ImageHandler
                    src={require("@/images/icon/icon-pen-holder.svg")}
                    alt="quiz"
                    style={{ width: 40, height: 40 }}
                  />
                  <Typography
                    fontSize={14}
                    fontWeight={600}
                    color="#fff"
                    textAlign="center"
                  >
                    Create Quiz
                  </Typography>
                </Stack>
              </Stack>
              <Stack
                className={
                  mainClassName + `-flex-item-right-content2 ${timeOfDay}`
                }
                onClick={() => setShowAssignModal(true)}
                sx={{ cursor: "pointer", mt: "10px" }}
              >
                <Stack alignItems="center" spacing={1}>
                  <ImageHandler
                    src={require("@/images/icon/icon-champion-hand.svg")}
                    alt="assign"
                    style={{ width: 40, height: 40 }}
                  />
                  <Typography
                    fontSize={14}
                    fontWeight={600}
                    color="#fff"
                    textAlign="center"
                  >
                    Assign Quiz
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          {/* Row 2: Classrooms (70%) + Students needing support (30%) */}
          <Stack
            className={mainClassName + "-flex-container"}
            sx={{ alignItems: "flex-start", mt: { xs: 2, md: 3 } }}
          >
            {/* Left: Classrooms + Assignments */}
            <Stack className={mainClassName + "-flex-item-left2"}>
              {/* My Classrooms card */}
              <Stack
                className={mainClassName + "-flex-item-left2-content1"}
                sx={{ flex: "50%", overflow: "auto" }}
              >
                <Typography fontSize={16} fontWeight={600} color="#565656" mb={2}>
                  My Classrooms
                </Typography>
                {loading ? (
                  <Stack spacing={1}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} variant="rounded" height={40} />
                    ))}
                  </Stack>
                ) : classrooms.length === 0 ? (
                  <Typography fontSize={14} color="#8D8D8D">
                    No classrooms yet. Create one from the Classrooms page.
                  </Typography>
                ) : (
                  <Stack
                    spacing={1}
                    sx={{
                      maxHeight: 240,
                      overflowY: "auto",
                      pr: 0.5,
                      "&::-webkit-scrollbar": { width: 6 },
                      "&::-webkit-scrollbar-thumb": {
                        background: "#e0d9ff",
                        borderRadius: 3,
                      },
                    }}
                  >
                    {classrooms.map((classroom) => {
                      const id = classroom.classroom_id || classroom.id;
                      const cname =
                        classroom.name ||
                        classroom.classroom_name ||
                        "Unnamed";
                      const count =
                        classroom.student_count ??
                        classroom.students_count ??
                        classroom.total_students ??
                        null;

                      return (
                        <Stack
                          key={id}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          onClick={() =>
                            router.push(`/teacher/classrooms/${id}`)
                          }
                          sx={{
                            cursor: "pointer",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            transition: "background 0.2s",
                            "&:hover": { backgroundColor: "#f5f3ff" },
                          }}
                        >
                          <Typography
                            fontSize={14}
                            fontWeight={500}
                            color="#565656"
                          >
                            {cname}
                          </Typography>
                          {count !== null && (
                            <Typography fontSize={13} color="#8D8D8D">
                              {count}{" "}
                              {count === 1 ? "student" : "students"}
                            </Typography>
                          )}
                        </Stack>
                      );
                    })}
                  </Stack>
                )}
              </Stack>

              {/* Active Assignments card */}
              <Stack
                className={mainClassName + "-flex-item-left2-content1"}
                sx={{
                  flex: "50%",
                  overflow: "auto",
                  ml: "10px",
                }}
              >
                <Typography fontSize={16} fontWeight={600} color="#565656" mb={2}>
                  Active Assignments
                </Typography>
                {loading ? (
                  <Stack spacing={2}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} variant="rounded" height={40} />
                    ))}
                  </Stack>
                ) : assignments.length === 0 ? (
                  <Typography fontSize={14} color="#8D8D8D">
                    No assignments yet.
                  </Typography>
                ) : (
                  <Stack
                    spacing={2}
                    sx={{
                      maxHeight: 240,
                      overflowY: "auto",
                      pr: 0.5,
                      "&::-webkit-scrollbar": { width: 6 },
                      "&::-webkit-scrollbar-thumb": {
                        background: "#e0d9ff",
                        borderRadius: 3,
                      },
                    }}
                  >
                    {assignments.map((assignment, idx) => {
                      const quizName =
                        assignment.quiz_name ||
                        assignment.name ||
                        assignment.title ||
                        "Untitled Quiz";
                      const done =
                        assignment.completed_students ??
                        assignment.completed ??
                        assignment.done ??
                        0;
                      const total =
                        assignment.total_students ??
                        assignment.total ??
                        assignment.student_count ??
                        0;
                      const progress =
                        total > 0 ? Math.round((done / total) * 100) : 0;
                      const status = assignment.status;
                      const statusColor =
                        status === "active"
                          ? "#00BE2A"
                          : status === "upcoming"
                            ? "#8264FF"
                            : "#8D8D8D";

                      return (
                        <Stack
                          key={assignment.quiz_id || assignment.id || idx}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 0.5 }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <Typography
                                fontSize={13}
                                fontWeight={500}
                                color="#565656"
                              >
                                {quizName}
                              </Typography>
                              {status && (
                                <Typography
                                  fontSize={10}
                                  fontWeight={600}
                                  sx={{
                                    color: statusColor,
                                    background: `${statusColor}15`,
                                    borderRadius: "4px",
                                    padding: "1px 6px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.3px",
                                  }}
                                >
                                  {status}
                                </Typography>
                              )}
                            </Stack>
                            <Typography fontSize={12} color="#8D8D8D">
                              {done}/{total}
                            </Typography>
                          </Stack>
                          <BorderLinearProgress
                            variant="determinate"
                            value={progress}
                          />
                        </Stack>
                      );
                    })}
                  </Stack>
                )}
                <Typography
                  onClick={() => setShowAssignModal(true)}
                  sx={{
                    fontSize: 13,
                    color: "#8264ff",
                    cursor: "pointer",
                    fontWeight: 500,
                    mt: 2,
                  }}
                >
                  + Assign a new quiz
                </Typography>
              </Stack>
            </Stack>

            {/* Right: Students needing support */}
            <Stack
              className={mainClassName + "-flex-item-right2"}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                marginLeft: "10px",
              }}
            >
              <Stack
                sx={{
                  width: "100%",
                  borderRadius: "20px",
                  backgroundColor: "#fff",
                  padding: "20px",
                  boxShadow: "4px 4px 6px -4px rgba(0, 0, 0, 0.2)",
                }}
              >
                <Typography
                  fontSize={16}
                  fontWeight={600}
                  color="#565656"
                  mb={2}
                >
                  Students Needing Support
                </Typography>
                {loading ? (
                  <Stack spacing={1}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} variant="rounded" height={40} />
                    ))}
                  </Stack>
                ) : students.length === 0 ? (
                  <Typography fontSize={14} color="#8D8D8D">
                    Assign quizzes to see student insights.
                  </Typography>
                ) : (
                  <Stack
                    spacing={1}
                    sx={{
                      maxHeight: 320,
                      overflowY: "auto",
                      pr: 0.5,
                      "&::-webkit-scrollbar": { width: 6 },
                      "&::-webkit-scrollbar-thumb": {
                        background: "#e0d9ff",
                        borderRadius: 3,
                      },
                    }}
                  >
                    {students.slice(0, 10).map((student) => {
                      const studentId =
                        student.student_id || student.user_id || student.id;
                      const sname =
                        student.name ||
                        student.display_name ||
                        student.full_name ||
                        "Unknown";
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
                        : `/teacher/classrooms`;

                      return (
                        <Stack
                          key={studentId}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          onClick={() => router.push(navPath)}
                          sx={{
                            cursor: "pointer",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            transition: "background 0.2s",
                            "&:hover": { backgroundColor: "#f5f3ff" },
                          }}
                        >
                          <Stack>
                            <Typography
                              fontSize={14}
                              fontWeight={500}
                              color="#565656"
                            >
                              {sname}
                            </Typography>
                            {classroomName && (
                              <Typography fontSize={12} color="#8D8D8D">
                                {classroomName}
                              </Typography>
                            )}
                          </Stack>
                          {avg !== null && (
                            <Typography
                              fontSize={13}
                              fontWeight={600}
                              color={
                                avg < 50
                                  ? "#D41C02"
                                  : avg < 70
                                    ? "#FF5000"
                                    : "#00BE2A"
                              }
                            >
                              {Math.round(avg)}%
                            </Typography>
                          )}
                        </Stack>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <AssignQuizModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onSuccess={invalidate}
        />
      </TeacherCard>
    </ContentLayout>
  );
}
