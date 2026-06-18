"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  Collapse,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import TeacherCard from "@/app/components/modules/card/TeacherCard";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";

interface StudentDetailClientProps {
  classroomId: string;
  studentId: string;
}

interface QuizAttempt {
  quiz_id?: string;
  id?: string;
  quiz_name?: string;
  name?: string;
  score?: number;
  score_pct?: number;
  attempted_at?: string;
  completed_at?: string;
  created_at?: string;
}

interface CategoryProgress {
  category?: string;
  name?: string;
  avg_score?: number;
  score?: number;
  delta?: number;
  score_delta?: number;
}

interface ScoresData {
  student_name?: string;
  display_name?: string;
  full_name?: string;
  username?: string;
  avg_score?: number;
  average_score?: number;
  quizzes_done?: number;
  total_quizzes?: number;
  streak?: number;
  streak_days?: number;
  recent_attempts?: QuizAttempt[];
  attempts?: QuizAttempt[];
  categories?: CategoryProgress[];
  category_progress?: CategoryProgress[];
}

export default function StudentDetailClient({
  classroomId,
  studentId,
}: StudentDetailClientProps) {
  const router = useRouter();

  const [scores, setScores] = useState<ScoresData | null>(null);
  const [loadingScores, setLoadingScores] = useState(true);

  // Daily report
  const [showDaily, setShowDaily] = useState(false);
  const [dailyData, setDailyData] = useState<unknown>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [dailyFetched, setDailyFetched] = useState(false);

  // Weekly report
  const [showWeekly, setShowWeekly] = useState(false);
  const [weeklyData, setWeeklyData] = useState<unknown>(null);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [weeklyFetched, setWeeklyFetched] = useState(false);

  const fetchScores = useCallback(async () => {
    setLoadingScores(true);
    try {
      const res = await TeacherAPI.getStudentScores({ student_id: studentId });
      const data = res?.student ?? res ?? null;
      setScores(data);
    } catch {
      setScores(null);
    } finally {
      setLoadingScores(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  async function handleToggleDaily() {
    const next = !showDaily;
    setShowDaily(next);
    if (next && !dailyFetched) {
      setLoadingDaily(true);
      try {
        const res = await TeacherAPI.getStudentDailyReport({
          student_id: studentId,
        });
        setDailyData(res ?? null);
      } catch {
        setDailyData(null);
      } finally {
        setLoadingDaily(false);
        setDailyFetched(true);
      }
    }
  }

  async function handleToggleWeekly() {
    const next = !showWeekly;
    setShowWeekly(next);
    if (next && !weeklyFetched) {
      setLoadingWeekly(true);
      try {
        const res = await TeacherAPI.getStudentWeeklyReport({
          student_id: studentId,
        });
        setWeeklyData(res ?? null);
      } catch {
        setWeeklyData(null);
      } finally {
        setLoadingWeekly(false);
        setWeeklyFetched(true);
      }
    }
  }

  // Derived values
  const studentName =
    scores?.student_name ||
    scores?.display_name ||
    scores?.full_name ||
    scores?.username ||
    "Student";
  const avgScore = scores?.avg_score ?? scores?.average_score ?? null;
  const quizzesDone =
    scores?.quizzes_done ?? scores?.total_quizzes ?? null;
  const streak = scores?.streak ?? scores?.streak_days ?? null;
  const recentAttempts: QuizAttempt[] =
    scores?.recent_attempts || scores?.attempts || [];
  const categories: CategoryProgress[] =
    scores?.categories || scores?.category_progress || [];

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Stack spacing={2} sx={{ padding: "1rem" }}>
          {/* Back link */}
          <Typography
            onClick={() =>
              router.push(`/teacher/classrooms/${classroomId}?tab=roster`)
            }
            style={{
              fontSize: 13,
              color: "#ff5000",
              cursor: "pointer",
              display: "inline-block",
              width: "fit-content",
            }}
          >
            ← Back to classroom
          </Typography>

          {/* Header */}
          {loadingScores ? (
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={32} width={200} />
              <Skeleton variant="rounded" height={20} width={320} />
            </Stack>
          ) : (
            <Stack spacing={0.5}>
              <Typography
                style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}
              >
                {studentName}
              </Typography>
              <Typography style={{ fontSize: 13, color: "#777" }}>
                {[
                  avgScore !== null ? `${Math.round(avgScore)}% avg` : null,
                  quizzesDone !== null
                    ? `${quizzesDone} ${quizzesDone === 1 ? "quiz" : "quizzes"} done`
                    : null,
                  streak !== null ? `${streak}-day streak` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Typography>
            </Stack>
          )}

          {/* Recent Activity */}
          <Stack spacing={1}>
            <Typography
              style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}
            >
              Recent Activity
            </Typography>
            <Card className="dashboard-page-card">
              {loadingScores ? (
                <Stack spacing={1}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rounded" height={44} />
                  ))}
                </Stack>
              ) : recentAttempts.length === 0 ? (
                <Typography
                  className="dashboard-page-description"
                  style={{ color: "#888", textAlign: "left" }}
                >
                  No quiz attempts yet.
                </Typography>
              ) : (
                <Stack spacing={0.5}>
                  {recentAttempts.map((attempt, idx) => {
                    const attemptId =
                      attempt.quiz_id || attempt.id || String(idx);
                    const quizName =
                      attempt.quiz_name || attempt.name || "Untitled Quiz";
                    const score =
                      attempt.score_pct ?? attempt.score ?? null;
                    const date =
                      attempt.attempted_at ||
                      attempt.completed_at ||
                      attempt.created_at ||
                      null;
                    const isGood = score !== null && score >= 70;

                    return (
                      <Stack
                        key={`${attemptId}-${idx}`}
                        className="inbox-page-row"
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ padding: "8px 12px", borderRadius: "8px" }}
                      >
                        <Typography
                          style={{ fontSize: 13, color: "#333" }}
                        >
                          {quizName}
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          {score !== null && (
                            <Typography
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: isGood ? "#43a047" : "#d32f2f",
                              }}
                            >
                              {Math.round(score)}%
                            </Typography>
                          )}
                          {date && (
                            <Typography style={{ fontSize: 12, color: "#aaa" }}>
                              {new Date(date).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
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

          {/* Progress by Category */}
          {!loadingScores && categories.length > 0 && (
            <Stack spacing={1}>
              <Typography
                style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}
              >
                Progress by Category
              </Typography>
              <Card className="dashboard-page-card">
                <Stack spacing={1.5}>
                  {categories.map((cat, idx) => {
                    const catName =
                      cat.category || cat.name || `Category ${idx + 1}`;
                    const catScore = cat.avg_score ?? cat.score ?? 0;
                    const delta = cat.delta ?? cat.score_delta ?? null;

                    return (
                      <Stack key={catName} spacing={0.5}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography
                            style={{ fontSize: 13, color: "#333" }}
                          >
                            {catName}
                          </Typography>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <Typography
                              style={{ fontSize: 13, fontWeight: 600, color: "#333" }}
                            >
                              {Math.round(catScore)}%
                            </Typography>
                            {delta !== null && (
                              <Typography
                                style={{
                                  fontSize: 12,
                                  color: delta >= 0 ? "#43a047" : "#d32f2f",
                                }}
                              >
                                {delta >= 0 ? `↑${Math.abs(Math.round(delta))}` : `↓${Math.abs(Math.round(delta))}`}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, Math.max(0, catScore))}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#f0eeff",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: "#8264ff",
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Stack>
                    );
                  })}
                </Stack>
              </Card>
            </Stack>
          )}

          {/* Daily / Weekly Summary */}
          <Stack spacing={1}>
            <Typography
              style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}
            >
              Reports
            </Typography>

            {/* Daily toggle */}
            <Stack spacing={1}>
              <Stack
                className="dashboard-page-form-btn"
                onClick={handleToggleDaily}
                sx={{ cursor: "pointer", alignSelf: "flex-start" }}
              >
                <Typography className="dashboard-page-form-btn-txt">
                  {showDaily ? "Hide Daily Summary" : "Show Daily Summary"}
                </Typography>
              </Stack>
              <Collapse in={showDaily}>
                <Card className="dashboard-page-card">
                  {loadingDaily ? (
                    <Stack spacing={1}>
                      <Skeleton variant="rounded" height={60} />
                    </Stack>
                  ) : dailyData ? (
                    <Typography
                      style={{
                        fontSize: 12,
                        color: "#555",
                        fontFamily: "monospace",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                      }}
                    >
                      {JSON.stringify(dailyData, null, 2)}
                    </Typography>
                  ) : (
                    <Typography
                      className="dashboard-page-description"
                      style={{ color: "#888" }}
                    >
                      No daily data available.
                    </Typography>
                  )}
                </Card>
              </Collapse>
            </Stack>

            {/* Weekly toggle */}
            <Stack spacing={1}>
              <Stack
                className="dashboard-page-form-btn"
                onClick={handleToggleWeekly}
                sx={{ cursor: "pointer", alignSelf: "flex-start" }}
              >
                <Typography className="dashboard-page-form-btn-txt">
                  {showWeekly ? "Hide Weekly Summary" : "Show Weekly Summary"}
                </Typography>
              </Stack>
              <Collapse in={showWeekly}>
                <Card className="dashboard-page-card">
                  {loadingWeekly ? (
                    <Stack spacing={1}>
                      <Skeleton variant="rounded" height={60} />
                    </Stack>
                  ) : weeklyData ? (
                    <Typography
                      style={{
                        fontSize: 12,
                        color: "#555",
                        fontFamily: "monospace",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                      }}
                    >
                      {JSON.stringify(weeklyData, null, 2)}
                    </Typography>
                  ) : (
                    <Typography
                      className="dashboard-page-description"
                      style={{ color: "#888" }}
                    >
                      No weekly data available.
                    </Typography>
                  )}
                </Card>
              </Collapse>
            </Stack>
          </Stack>
        </Stack>
      </TeacherCard>
    </ContentLayout>
  );
}
