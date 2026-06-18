"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  LinearProgress,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Chart from "@/modules/chart/Chart";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import TeacherCard from "@/app/components/modules/card/TeacherCard";

// ─── Constants ────────────────────────────────────────────────────────────────

const TAB_KEYS = ["overview", "questions", "difficulty", "students", "activity"] as const;
type TabKey = (typeof TAB_KEYS)[number];

// Custom lavender scrollbar — matches ClassReportClient pattern
const scrollSx = {
  maxHeight: 500,
  overflowY: "auto" as const,
  pr: 0.5,
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-thumb": { background: "#e0d9ff", borderRadius: 3 },
};

// Flat sub-card style (no nested TeacherCard)
const subCardSx = {
  border: "1px solid #eee",
  borderRadius: "12px",
  padding: "1rem",
  boxShadow: "none",
  flex: 1,
};

// ─── KPI tile ─────────────────────────────────────────────────────────────────

function KpiTile({
  label,
  value,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  loading: boolean;
}) {
  return (
    <Card sx={{ ...subCardSx }}>
      <Typography style={{ fontSize: 12, color: "#777", marginBottom: 4 }}>
        {label}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width={60} height={32} />
      ) : (
        <Typography style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>
          {value}
        </Typography>
      )}
    </Card>
  );
}

// ─── Skeleton rows shared by list tabs ────────────────────────────────────────

function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <Stack spacing={1}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={56} />
      ))}
    </Stack>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function QuizInsightsClient({ quizId }: { quizId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-synced tab (same pattern as ClassroomDetailClient)
  const tabParam = (searchParams.get("tab") as TabKey | null) ?? "overview";
  const tabIndex = TAB_KEYS.includes(tabParam as TabKey)
    ? TAB_KEYS.indexOf(tabParam as TabKey)
    : 0;

  const [perf, setPerf] = useState<any>(null);
  const [diff, setDiff] = useState<any>(null);
  const [weekday, setWeekday] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sort state for By Question and By Student tabs
  const [questionSort, setQuestionSort] = useState<"asc" | "desc">("asc"); // asc = hardest first (lowest accuracy)
  const [studentSort, setStudentSort] = useState<"asc" | "desc">("desc");  // desc = highest accuracy first

  // Fan-out fetch on mount — cancelled-flag pattern to avoid stale state
  useEffect(() => {
    if (!quizId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [p, d, w] = await Promise.all([
          TeacherAPI.getQuizPerformance({ quiz_id: quizId }).catch(() => null),
          TeacherAPI.getQuizDifficulty({ quiz_id: quizId }).catch(() => null),
          TeacherAPI.getAccuracyByWeekday({ quiz_id: quizId }).catch(() => null),
        ]);
        if (cancelled) return;
        setPerf(p);
        setDiff(d);
        setWeekday(w);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  // Tab navigation — pushes URL param, same pattern as ClassroomDetailClient
  function handleTabChange(_: React.SyntheticEvent, newIndex: number) {
    const key = TAB_KEYS[newIndex];
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("tab", key);
    router.push(`/teacher/quizzes/${quizId}/insights?${params.toString()}`);
  }

  // ─── KPI values ─────────────────────────────────────────────────────────────

  const totalResponses = perf?.total_responses ?? "—";
  const completionRate =
    perf?.completion_rate != null
      ? Math.round(perf.completion_rate * 100) + "%"
      : "—";
  const avgAccuracy =
    perf?.average_accuracy != null
      ? Math.round(perf.average_accuracy * 100) + "%"
      : "—";
  const avgTime =
    perf?.average_time_per_question != null
      ? Math.round(perf.average_time_per_question * 10) / 10 + "s"
      : "—";

  // ─── No data guard ──────────────────────────────────────────────────────────

  if (
    !loading &&
    (
      (perf == null && diff == null && weekday == null) ||
      (perf != null && (perf.total_responses ?? 0) === 0)
    )
  ) {
    return (
      <ContentLayout>
        <TeacherCard>
          <Stack spacing={2} sx={{ padding: "2rem 0" }} alignItems="center">
            <Typography style={{ fontSize: 15, color: "#999" }}>
              No responses yet for this quiz.
            </Typography>
          </Stack>
        </TeacherCard>
      </ContentLayout>
    );
  }

  // ─── Tab 0: Overview ────────────────────────────────────────────────────────

  function TabOverview() {
    const categories = Array.isArray(diff?.category_analysis)
      ? diff.category_analysis
      : [];

    // Best: sorted desc by average_accuracy (already 0..100), top 3
    const bestCats = [...categories]
      .sort((a, b) => (b.average_accuracy ?? 0) - (a.average_accuracy ?? 0))
      .slice(0, 3);

    // Hardest: sorted asc (lowest accuracy first), bottom 3
    const hardestCats = [...categories]
      .sort((a, b) => (a.average_accuracy ?? 0) - (b.average_accuracy ?? 0))
      .slice(0, 3);

    function CategoryBar({
      cat,
    }: {
      cat: any;
    }) {
      return (
        <Stack spacing={0.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography style={{ fontSize: 13, color: "#333" }}>
              {cat.category ?? "—"}
            </Typography>
            <Typography style={{ fontSize: 12, color: "#777" }}>
              {Math.round(cat.average_accuracy ?? 0)}%
            </Typography>
          </Stack>
          {/* average_accuracy is 0..100 already — pass directly */}
          <LinearProgress
            variant="determinate"
            value={cat.average_accuracy ?? 0}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "#f0eeff",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #8264ff 0%, #ff64a0 100%)",
                borderRadius: 3,
              },
            }}
          />
        </Stack>
      );
    }

    if (loading) {
      return (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Card sx={subCardSx}>
            <Skeleton variant="text" width={120} height={24} sx={{ mb: 1 }} />
            <Stack spacing={1}>
              {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={28} />)}
            </Stack>
          </Card>
          <Card sx={subCardSx}>
            <Skeleton variant="text" width={120} height={24} sx={{ mb: 1 }} />
            <Stack spacing={1}>
              {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={28} />)}
            </Stack>
          </Card>
        </Stack>
      );
    }

    return (
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {/* Best categories card */}
        <Card sx={subCardSx}>
          <Typography style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 12 }}>
            Best Categories
          </Typography>
          {bestCats.length === 0 ? (
            <Typography style={{ fontSize: 13, color: "#999" }}>
              No category data yet.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {bestCats.map((cat, i) => (
                <CategoryBar key={cat.category ?? i} cat={cat} />
              ))}
            </Stack>
          )}
        </Card>

        {/* Hardest categories card */}
        <Card sx={subCardSx}>
          <Typography style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 12 }}>
            Hardest Categories
          </Typography>
          {hardestCats.length === 0 ? (
            <Typography style={{ fontSize: 13, color: "#999" }}>
              No category data yet.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {hardestCats.map((cat, i) => (
                <CategoryBar key={cat.category ?? i} cat={cat} />
              ))}
            </Stack>
          )}
        </Card>
      </Stack>
    );
  }

  // ─── Tab 1: By Question ─────────────────────────────────────────────────────

  function TabByQuestion() {
    const questions = Array.isArray(perf?.performance_by_question)
      ? perf.performance_by_question
      : [];

    // Sort by accuracy_rate (0..1); asc = hardest first (lowest accuracy)
    const sorted = [...questions].sort((a, b) =>
      questionSort === "asc"
        ? (a.accuracy_rate ?? 0) - (b.accuracy_rate ?? 0)
        : (b.accuracy_rate ?? 0) - (a.accuracy_rate ?? 0)
    );

    if (loading) return <SkeletonRows />;

    if (sorted.length === 0) {
      return (
        <Typography style={{ fontSize: 13, color: "#999", padding: "8px 0" }}>
          No question data yet for this quiz.
        </Typography>
      );
    }

    return (
      <Stack spacing={0.5}>
        {/* Sort toggle */}
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 0.5 }}>
          <Typography
            onClick={() => setQuestionSort(questionSort === "asc" ? "desc" : "asc")}
            style={{ fontSize: 12, color: "#8264ff", cursor: "pointer" }}
          >
            Sort: {questionSort === "asc" ? "hardest first" : "easiest first"}
          </Typography>
        </Stack>

        <Stack sx={scrollSx} spacing={0.5}>
          {sorted.map((q: any, idx: number) => {
            const accuracyPct = Math.round((q.accuracy_rate ?? 0) * 100);
            return (
              <Stack
                key={q.question_id ?? idx}
                className="inbox-page-row"
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ padding: "10px 12px", borderRadius: "8px" }}
              >
                {/* Left: Q-index + subject/category */}
                <Stack sx={{ minWidth: 80, flexShrink: 0 }}>
                  <Typography style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>
                    Q{idx + 1}
                  </Typography>
                  <Typography style={{ fontSize: 12, color: "#aaa" }} noWrap>
                    {[q.category, q.subject].filter(Boolean).join(" · ") || "—"}
                  </Typography>
                </Stack>

                {/* Middle: accuracy progress bar */}
                <Stack flex={1} spacing={0.3}>
                  <LinearProgress
                    variant="determinate"
                    value={accuracyPct}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#f0eeff",
                      "& .MuiLinearProgress-bar": {
                        background: "linear-gradient(90deg, #8264ff 0%, #ff64a0 100%)",
                        borderRadius: 3,
                      },
                    }}
                  />
                </Stack>

                {/* Right: percentage + avg time */}
                <Stack alignItems="flex-end" sx={{ minWidth: 60, flexShrink: 0 }}>
                  <Typography style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>
                    {accuracyPct}%
                  </Typography>
                  <Typography style={{ fontSize: 12, color: "#aaa" }}>
                    {q.average_time != null ? Math.round(q.average_time) + "s" : "—"}
                  </Typography>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    );
  }

  // ─── Tab 2: By Difficulty ───────────────────────────────────────────────────

  function TabByDifficulty() {
    const diffItems = Array.isArray(diff?.difficulty_analysis)
      ? [...diff.difficulty_analysis].sort((a, b) => a.difficulty_level - b.difficulty_level)
      : [];

    // Difficulty bar chart — accuracy_rate is 0..100 already from this endpoint
    const difficultyOption = {
      xAxis: {
        type: "category",
        data: diffItems.map((d) => `Level ${d.difficulty_level}`),
      },
      yAxis: { type: "value", min: 0, max: 100 },
      series: [
        {
          type: "bar",
          data: diffItems.map((d) => Math.round(d.accuracy_rate ?? 0)),
          itemStyle: { color: "#8264ff" },
        },
      ],
    };

    if (loading) {
      return (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={300} />
          <SkeletonRows count={3} />
        </Stack>
      );
    }

    if (diffItems.length === 0) {
      return (
        <Typography style={{ fontSize: 13, color: "#999", padding: "8px 0" }}>
          No difficulty data yet for this quiz.
        </Typography>
      );
    }

    return (
      <Stack spacing={2}>
        {/* Bar chart */}
        <Card sx={subCardSx}>
          <Chart
            option={difficultyOption}
            disableStyleCard={true}
            height={300}
            onEvents={null}
          />
        </Card>

        {/* Summary table: Difficulty · Students · Accuracy */}
        <Card sx={subCardSx}>
          {/* Header row */}
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ pb: 1, borderBottom: "1px solid #f0f0f0", mb: 1 }}
          >
            <Typography style={{ fontSize: 12, fontWeight: 600, color: "#777", flex: 1 }}>
              Difficulty
            </Typography>
            <Typography style={{ fontSize: 12, fontWeight: 600, color: "#777", width: 110, textAlign: "right" }}>
              Students
            </Typography>
            <Typography style={{ fontSize: 12, fontWeight: 600, color: "#777", width: 80, textAlign: "right" }}>
              Accuracy
            </Typography>
          </Stack>
          <Stack spacing={0.75}>
            {diffItems.map((d: any) => (
              <Stack
                key={d.difficulty_level}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography style={{ fontSize: 13, color: "#333", flex: 1 }}>
                  Level {d.difficulty_level}
                </Typography>
                <Typography style={{ fontSize: 13, color: "#777", width: 110, textAlign: "right" }}>
                  {d.students_attempted ?? "—"}
                </Typography>
                <Typography style={{ fontSize: 13, fontWeight: 600, color: "#8264ff", width: 80, textAlign: "right" }}>
                  {Math.round(d.accuracy_rate ?? 0)}%
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Card>
      </Stack>
    );
  }

  // ─── Tab 3: By Student ──────────────────────────────────────────────────────

  function TabByStudent() {
    const students = Array.isArray(perf?.performance_by_student)
      ? perf.performance_by_student
      : [];

    // Sort by derived accuracy percentage
    const sorted = [...students].sort((a, b) => {
      const accA = a.questions_correct / Math.max(1, a.questions_attempted);
      const accB = b.questions_correct / Math.max(1, b.questions_attempted);
      return studentSort === "desc" ? accB - accA : accA - accB;
    });

    if (loading) return <SkeletonRows />;

    if (sorted.length === 0) {
      return (
        <Typography style={{ fontSize: 13, color: "#999", padding: "8px 0" }}>
          No student attempts yet.
        </Typography>
      );
    }

    return (
      <Stack spacing={0.5}>
        {/* Sort toggle */}
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 0.5 }}>
          <Typography
            onClick={() => setStudentSort(studentSort === "desc" ? "asc" : "desc")}
            style={{ fontSize: 12, color: "#8264ff", cursor: "pointer" }}
          >
            Sort: {studentSort === "desc" ? "highest first" : "lowest first"}
          </Typography>
        </Stack>

        <Stack sx={scrollSx} spacing={0.5}>
          {sorted.map((s: any, idx: number) => {
            const accPct = Math.round(
              (s.questions_correct / Math.max(1, s.questions_attempted)) * 100
            );
            const name = s.student_name || "Unknown";
            const initial = name.charAt(0).toUpperCase();

            return (
              <Stack
                key={s.student_id ?? idx}
                className="inbox-page-row"
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ padding: "10px 12px", borderRadius: "8px" }}
              >
                {/* Rank */}
                <Typography
                  style={{ fontSize: 13, fontWeight: 600, color: "#aaa", minWidth: 28 }}
                >
                  #{idx + 1}
                </Typography>

                {/* Avatar */}
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#e0d9ff",
                    flexShrink: 0,
                  }}
                >
                  <Typography style={{ fontSize: 13, fontWeight: 600, color: "#8264ff" }}>
                    {initial}
                  </Typography>
                </Stack>

                {/* Name + email */}
                <Stack flex={1} minWidth={0}>
                  <Typography
                    onClick={
                      s.classroom_id
                        ? () =>
                            router.push(
                              `/teacher/classrooms/${s.classroom_id}/students/${s.student_id}`
                            )
                        : undefined
                    }
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#333",
                      cursor: s.classroom_id ? "pointer" : "default",
                    }}
                    sx={
                      s.classroom_id
                        ? { "&:hover": { color: "#ff5000" } }
                        : undefined
                    }
                    noWrap
                  >
                    {name}
                  </Typography>
                  {s.student_email && (
                    <Typography style={{ fontSize: 12, color: "#aaa" }} noWrap>
                      {s.student_email}
                    </Typography>
                  )}
                </Stack>

                {/* Attempted · Correct · Accuracy */}
                <Stack direction="row" alignItems="center" spacing={1.5} flexShrink={0}>
                  <Stack alignItems="center">
                    <Typography style={{ fontSize: 11, color: "#aaa" }}>Tried</Typography>
                    <Typography style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>
                      {s.questions_attempted ?? "—"}
                    </Typography>
                  </Stack>
                  <Stack alignItems="center">
                    <Typography style={{ fontSize: 11, color: "#aaa" }}>Correct</Typography>
                    <Typography style={{ fontSize: 13, fontWeight: 600, color: "#00BE2A" }}>
                      {s.questions_correct ?? "—"}
                    </Typography>
                  </Stack>
                  <Stack alignItems="center">
                    <Typography style={{ fontSize: 11, color: "#aaa" }}>Acc</Typography>
                    <Typography style={{ fontSize: 13, fontWeight: 700, color: "#8264ff" }}>
                      {accPct}%
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    );
  }

  // ─── Tab 4: Activity (weekday line chart) ───────────────────────────────────

  function TabActivity() {
    const weekdays = Array.isArray(weekday?.weekdays) ? weekday.weekdays : [];

    // average_accuracy from weekday endpoint is 0..1 — multiply by 100
    const activityOption = {
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          const axisLabel: string = p?.axisValue ?? "";
          const day = weekdays.find((w: any) => w.label === axisLabel);
          const acc = day ? Math.round((day.average_accuracy ?? 0) * 100) : 0;
          const responses = day?.total_responses ?? 0;
          return `<b>${axisLabel}</b><br/>Accuracy: ${acc}%<br/>Responses: ${responses}`;
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: weekdays.map((w: any) => w.label),
      },
      yAxis: { type: "value", min: 0, max: 100 },
      series: [
        {
          type: "line",
          smooth: true,
          areaStyle: { color: "rgba(130, 100, 255, 0.2)" },
          data: weekdays.map((w: any) => Math.round((w.average_accuracy ?? 0) * 100)),
          lineStyle: { color: "#8264ff" },
          itemStyle: { color: "#8264ff" },
        },
      ],
    };

    if (loading) {
      return <Skeleton variant="rounded" height={300} />;
    }

    // Empty when no weekday data or no responses at all
    if (weekday == null || weekdays.length === 0) {
      return (
        <Typography style={{ fontSize: 13, color: "#999", padding: "8px 0" }}>
          No activity data yet for this quiz.
        </Typography>
      );
    }

    return (
      <Stack spacing={2}>
        <Card sx={subCardSx}>
          <Chart
            option={activityOption}
            disableStyleCard={true}
            height={300}
            onEvents={null}
          />
        </Card>

        {/* Date range footer */}
        {weekday?.range && (
          <Typography style={{ fontSize: 12, color: "#999" }}>
            Range: {weekday.range.start_date} — {weekday.range.end_date}
          </Typography>
        )}

        {/* Surface any note from the weekday route (e.g. quiz_id no-op note) */}
        {weekday?.note && (
          <Typography style={{ fontSize: 12, color: "#aaa", fontStyle: "italic" }}>
            {weekday.note}
          </Typography>
        )}
      </Stack>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <ContentLayout>
      <TeacherCard>
        <Stack spacing={2}>
          {/* Back link */}
          <Typography
            onClick={() => router.push("/teacher/reports/quiz")}
            style={{
              fontSize: 13,
              color: "#ff5000",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            ← Back to Quiz Reports
          </Typography>

          {/* Quiz name heading */}
          {loading ? (
            <Skeleton variant="text" width={280} height={32} />
          ) : (
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>
                {perf?.quiz_name ?? "Quiz Insights"}
              </Typography>
              {/* Status pill — derived from presence of responses */}
              {perf != null && (
                <Typography
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#fff",
                    backgroundColor: (perf?.total_responses ?? 0) > 0 ? "#00BE2A" : "#8D8D8D",
                    padding: "2px 10px",
                    borderRadius: 6,
                    textTransform: "capitalize",
                  }}
                >
                  {(perf?.total_responses ?? 0) > 0 ? "active" : "no attempts"}
                </Typography>
              )}
            </Stack>
          )}

          {/* KPI row — 4 headline stats */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <KpiTile label="Total responses" value={totalResponses} loading={loading} />
            <KpiTile label="Completion rate" value={completionRate} loading={loading} />
            <KpiTile label="Avg accuracy" value={avgAccuracy} loading={loading} />
            <KpiTile label="Avg time / Q" value={avgTime} loading={loading} />
          </Stack>

          {/* Tab strip — orange indicator matches ClassReportClient */}
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            sx={{
              borderBottom: "1px solid #eee",
              "& .MuiTab-root": { textTransform: "none", fontSize: 14 },
              "& .Mui-selected": { color: "#ff5000 !important" },
              "& .MuiTabs-indicator": { backgroundColor: "#ff5000" },
            }}
          >
            <Tab label="Overview" />
            <Tab label="By Question" />
            <Tab label="By Difficulty" />
            <Tab label="By Student" />
            <Tab label="Activity" />
          </Tabs>

          {/* Tab panels — render only the active tab */}
          <Stack sx={{ pt: 1 }}>
            {tabIndex === 0 && <TabOverview />}
            {tabIndex === 1 && <TabByQuestion />}
            {tabIndex === 2 && <TabByDifficulty />}
            {tabIndex === 3 && <TabByStudent />}
            {tabIndex === 4 && <TabActivity />}
          </Stack>
        </Stack>
      </TeacherCard>
    </ContentLayout>
  );
}
