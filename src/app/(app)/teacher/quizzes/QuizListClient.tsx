"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import TeacherCard from "@/app/components/modules/card/TeacherCard";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";

interface Quiz {
  quiz_id?: string;
  id?: string;
  quiz_name?: string;
  name?: string;
  title?: string;
  question_count?: number;
  questions_count?: number;
  total_questions?: number;
  classroom_count?: number;
  classrooms_count?: number;
  total_classrooms?: number;
  status?: string;
}

export default function QuizListClient() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filtered, setFiltered] = useState<Quiz[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(quizzes);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        quizzes.filter((quiz) => {
          const name = quiz.quiz_name || quiz.name || quiz.title || "";
          return name.toLowerCase().includes(q);
        })
      );
    }
  }, [search, quizzes]);

  async function fetchQuizzes() {
    setLoading(true);
    try {
      const res = await TeacherAPI.getQuizzes({
        page_number: 1,
        rows_per_page: 100,
      });
      const data: Quiz[] = res?.quizzes ?? res ?? [];
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Stack spacing={2} sx={{ padding: "1rem" }}>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              className="dashboard-page-title"
              style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}
            >
              My Quizzes
            </Typography>
            <Stack
              className="dashboard-page-form-btn"
              onClick={() => router.push("/teacher/quizzes/new")}
              sx={{ cursor: "pointer" }}
            >
              <Typography className="dashboard-page-form-btn-txt">
                + New quiz
              </Typography>
            </Stack>
          </Stack>

          {/* Search */}
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search quizzes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ maxWidth: 360 }}
          />

          {/* List */}
          <Card className="dashboard-page-card">
            {loading ? (
              <Stack spacing={1}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={52} />
                ))}
              </Stack>
            ) : quizzes.length === 0 ? (
              <Stack spacing={2} alignItems="center" sx={{ padding: "2rem 0" }}>
                <Typography
                  className="dashboard-page-description"
                  style={{ color: "#888", textAlign: "center" }}
                >
                  You haven&apos;t created any quizzes yet.
                </Typography>
                <Stack
                  className="dashboard-page-form-btn"
                  onClick={() => router.push("/teacher/quizzes/new")}
                  sx={{ cursor: "pointer" }}
                >
                  <Typography className="dashboard-page-form-btn-txt">
                    Create your first quiz
                  </Typography>
                </Stack>
              </Stack>
            ) : filtered.length === 0 ? (
              <Typography
                className="dashboard-page-description"
                style={{ color: "#888", textAlign: "left" }}
              >
                No quizzes match &ldquo;{search}&rdquo;.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {filtered.map((quiz) => {
                  const id = quiz.quiz_id || quiz.id;
                  const name =
                    quiz.quiz_name || quiz.name || quiz.title || "Untitled Quiz";
                  const questionCount =
                    quiz.question_count ??
                    quiz.questions_count ??
                    quiz.total_questions ??
                    null;
                  const classroomCount =
                    quiz.classroom_count ??
                    quiz.classrooms_count ??
                    quiz.total_classrooms ??
                    null;

                  return (
                    <Stack
                      key={id}
                      className="inbox-page-row"
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      onClick={() => router.push(`/teacher/quizzes/${id}`)}
                      sx={{
                        cursor: "pointer",
                        padding: "10px 12px",
                        borderRadius: "8px",
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#333",
                          }}
                        >
                          {name}
                        </Typography>
                        {quiz.status && quiz.status !== "published" && (
                          <Typography
                            style={{
                              fontSize: 11,
                              color: "#888",
                              background: "#f0f0f0",
                              borderRadius: 4,
                              padding: "1px 6px",
                            }}
                          >
                            {quiz.status}
                          </Typography>
                        )}
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {questionCount !== null && (
                          <Typography
                            style={{ fontSize: 13, color: "#777" }}
                          >
                            {questionCount}{" "}
                            {questionCount === 1 ? "question" : "questions"}
                          </Typography>
                        )}
                        {classroomCount !== null && (
                          <Typography
                            style={{ fontSize: 13, color: "#777" }}
                          >
                            {classroomCount}{" "}
                            {classroomCount === 1 ? "classroom" : "classrooms"}
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Card>
        </Stack>
      </TeacherCard>
    </ContentLayout>
  );
}
