"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import TeacherCard from "@/app/components/modules/card/TeacherCard";

// ─── Types ────────────────────────────────────────────────────────────────────

type DateRange = "7d" | "30d" | "90d" | "custom";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function subtractDays(n: number): string {
  const d = today();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatRelative(iso: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// Status pill color — same logic as TeacherDashboardClient
function statusColor(status: string): string {
  if (status === "active") return "#00BE2A";
  if (status === "upcoming") return "#8264FF";
  return "#8D8D8D";
}

// Custom lavender scrollbar sx — matches TeacherDashboardClient
const scrollSx = {
  maxHeight: 500,
  overflowY: "auto" as const,
  pr: 0.5,
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-thumb": { background: "#e0d9ff", borderRadius: 3 },
};

// ─── Skeleton rows shared by tabs ────────────────────────────────────────────
function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <Stack spacing={1}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={56} />
      ))}
    </Stack>
  );
}

// ─── KPI tile ────────────────────────────────────────────────────────────────
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
    <Card
      sx={{
        border: "1px solid #eee",
        borderRadius: "12px",
        padding: "1rem",
        flex: 1,
        boxShadow: "none",
      }}
    >
      <Typography style={{ fontSize: 12, color: "#777", marginBottom: 4 }}>
        {label}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width={60} height={32} />
      ) : (
        <Typography style={{ fontSize: 26, fontWeight: 700, color: "#1a1a1a" }}>
          {value}
        </Typography>
      )}
    </Card>
  );
}

// ─── Student row (shared by Top Performers + Needs Support tabs) ─────────────

function StudentRow({
  student,
  accentColor,
}: {
  student: any;
  accentColor: string;
}) {
  const name =
    student.student_name ||
    student.name ||
    student.display_name ||
    "Unknown";
  const initial = name.charAt(0).toUpperCase();
  const accuracy = student.average_accuracy ?? null;
  const lastActivity = student.last_activity || student.last_active || "";
  const classroomNames: string[] = Array.isArray(student.classroom_names)
    ? student.classroom_names
    : [];

  return (
    <Stack
      className="inbox-page-row"
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{ padding: "10px 12px", borderRadius: "8px" }}
    >
      {/* Avatar */}
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#e0d9ff",
          flexShrink: 0,
        }}
      >
        <Typography style={{ fontSize: 14, fontWeight: 600, color: "#8264ff" }}>
          {initial}
        </Typography>
      </Stack>

      {/* Name + classroom */}
      <Stack flex={1} minWidth={0}>
        <Typography style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>
          {name}
        </Typography>
        {classroomNames.length > 0 && (
          <Typography
            style={{ fontSize: 12, color: "#777" }}
            noWrap
          >
            {classroomNames.join(" · ")}
          </Typography>
        )}
      </Stack>

      {/* Accuracy + last activity */}
      <Stack alignItems="flex-end" flexShrink={0}>
        {accuracy !== null && (
          <Typography style={{ fontSize: 16, fontWeight: 700, color: accentColor }}>
            {Math.round(accuracy)}%
          </Typography>
        )}
        {lastActivity && (
          <Typography style={{ fontSize: 12, color: "#aaa" }}>
            {formatRelative(lastActivity)}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function ClassReportClient() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classroomFilter, setClassroomFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [tabIndex, setTabIndex] = useState(0);

  // Initial fetch: dashboard + classrooms (runs once on mount)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dash, classroomsRes] = await Promise.all([
          TeacherAPI.getQuizDashboard().catch(() => null),
          TeacherAPI.getClassrooms({ page_number: 1, rows_per_page: 50 }).catch(
            () => null
          ),
        ]);
        if (cancelled) return;
        setDashboard(dash);
        const cs = Array.isArray(classroomsRes?.classrooms)
          ? classroomsRes.classrooms
          : Array.isArray(classroomsRes)
            ? classroomsRes
            : [];
        setClassrooms(cs);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Students fetch: re-runs when classroomFilter changes, passes classroom_id to API
  useEffect(() => {
    let cancelled = false;
    setStudentsLoading(true);
    (async () => {
      try {
        const params: Record<string, any> = {
          page_number: 1,
          rows_per_page: 100,
        };
        if (classroomFilter) params.classroom_id = classroomFilter;
        const studentsRes = await TeacherAPI.getStudentsSummary(params).catch(
          () => null
        );
        if (cancelled) return;
        const sts = Array.isArray(studentsRes?.students)
          ? studentsRes.students
          : Array.isArray(studentsRes)
            ? studentsRes
            : [];
        setStudents(sts);
      } finally {
        if (!cancelled) setStudentsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [classroomFilter]);

  // ─── Derived values ───────────────────────────────────────────────────────

  const dateBounds = useMemo(() => {
    const todayStr = toISODate(today());
    if (dateRange === "7d") return { start: subtractDays(7), end: todayStr };
    if (dateRange === "30d") return { start: subtractDays(30), end: todayStr };
    if (dateRange === "90d") return { start: subtractDays(90), end: todayStr };
    // custom — use provided strings (may be empty → no filter)
    return { start: customStart, end: customEnd };
  }, [dateRange, customStart, customEnd]);

  // recent_quizzes filtered by date; classroom filter is best-effort (no classroom_id on this list)
  const filteredQuizzes = useMemo(() => {
    const raw: any[] = Array.isArray(dashboard?.recent_quizzes)
      ? dashboard.recent_quizzes
      : [];
    return raw.filter((q) => {
      const date = (q.created_date || q.created_at || "").slice(0, 10);
      if (!date) return true;
      if (dateBounds.start && date < dateBounds.start) return false;
      if (dateBounds.end && date > dateBounds.end) return false;
      // Note: recent_quizzes doesn't carry classroom_id — classroom filter is a no-op here
      return true;
    });
  }, [dashboard, dateBounds]);

  const topPerformers = useMemo(() => {
    return [...students]
      .filter((s) => (s.total_questions_completed ?? 0) > 0)
      .sort(
        (a, b) => (b.average_accuracy ?? 0) - (a.average_accuracy ?? 0)
      )
      .slice(0, 10);
  }, [students]);

  const needsSupport = useMemo(() => {
    return [...students]
      .filter((s) => (s.total_questions_completed ?? 0) > 0)
      .sort(
        (a, b) => (a.average_accuracy ?? 0) - (b.average_accuracy ?? 0)
      )
      .slice(0, 10);
  }, [students]);

  // ─── Tab content ──────────────────────────────────────────────────────────

  function TabRecentActivity() {
    if (loading) return <SkeletonRows />;
    if (filteredQuizzes.length === 0) {
      return (
        <Typography style={{ fontSize: 13, color: "#999", padding: "8px 0" }}>
          No recent quizzes in this range.
        </Typography>
      );
    }
    return (
      <Stack sx={scrollSx} spacing={0.5}>
        {filteredQuizzes.map((q: any, idx: number) => {
          const quizId = q.quiz_id || q.id;
          const quizName = q.quiz_name || q.name || q.title || "Untitled Quiz";
          const date = (q.created_date || q.created_at || "").slice(0, 10);
          const status = q.status || "";
          const pilColor = statusColor(status);
          const completion = q.completion_rate ?? q.completion ?? null;
          const accuracy = q.avg_accuracy ?? q.average_accuracy ?? null;

          return (
            <Stack
              key={quizId || idx}
              className="inbox-page-row"
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              onClick={() =>
                quizId && router.push(`/teacher/quizzes/${quizId}/insights`)
              }
              sx={{
                cursor: quizId ? "pointer" : "default",
                padding: "10px 12px",
                borderRadius: "8px",
              }}
            >
              {/* Left: date + quiz name */}
              <Stack>
                {date && (
                  <Typography style={{ fontSize: 12, color: "#aaa" }}>
                    {formatDate(date)}
                  </Typography>
                )}
                <Typography style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>
                  {quizName}
                </Typography>
                {q.classroom_name && (
                  <Typography style={{ fontSize: 12, color: "#777" }}>
                    {q.classroom_name}
                  </Typography>
                )}
              </Stack>

              {/* Right: status pill + stats */}
              <Stack direction="row" alignItems="center" spacing={1.5}>
                {completion !== null && (
                  <Typography style={{ fontSize: 12, color: "#777" }}>
                    {Math.round(completion)}% done
                  </Typography>
                )}
                {accuracy !== null && (
                  <Typography style={{ fontSize: 12, color: "#777" }}>
                    {Math.round(accuracy)}% acc
                  </Typography>
                )}
                {status && (
                  <Typography
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#fff",
                      backgroundColor: pilColor,
                      padding: "2px 8px",
                      borderRadius: 6,
                      textTransform: "capitalize",
                    }}
                  >
                    {status}
                  </Typography>
                )}
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    );
  }

  function TabTopPerformers() {
    if (studentsLoading) return <SkeletonRows />;
    if (topPerformers.length === 0) {
      return (
        <Typography style={{ fontSize: 13, color: "#999", padding: "8px 0" }}>
          Not enough data yet — assign a quiz and watch this card light up.
        </Typography>
      );
    }
    return (
      <Stack sx={scrollSx} spacing={0.5}>
        {topPerformers.map((s: any) => (
          <StudentRow
            key={s.student_id || s.id}
            student={s}
            accentColor="#00BE2A"
          />
        ))}
      </Stack>
    );
  }

  function TabNeedsSupport() {
    if (studentsLoading) return <SkeletonRows />;
    if (needsSupport.length === 0) {
      return (
        <Typography style={{ fontSize: 13, color: "#999", padding: "8px 0" }}>
          No struggling students right now.
        </Typography>
      );
    }
    return (
      <Stack sx={scrollSx} spacing={0.5}>
        {needsSupport.map((s: any) => (
          <StudentRow
            key={s.student_id || s.id}
            student={s}
            accentColor="#ff5000"
          />
        ))}
      </Stack>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Stack spacing={2} sx={{ padding: "1rem" }}>
          {/* Page header */}
          <Stack spacing={0.5}>
            <Typography style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>
              Class Report
            </Typography>
            <Typography style={{ fontSize: 13, color: "#777" }}>
              See how your classrooms and students are doing across all
              assignments.
            </Typography>
          </Stack>

          {/* Sibling pill links — "Class Report" active, "Quiz Report" inactive */}
          <Stack direction="row" spacing={1}>
            <Stack
              className="dashboard-page-form-btn"
              sx={{ cursor: "default", opacity: 1 }}
            >
              <Typography className="dashboard-page-form-btn-txt">
                Class Report
              </Typography>
            </Stack>
            <Stack
              className="dashboard-page-form-btn-disabled"
              onClick={() => router.push("/teacher/reports/quiz")}
              sx={{ cursor: "pointer" }}
            >
              <Typography className="dashboard-page-form-btn-txt">
                Quiz Report
              </Typography>
            </Stack>
          </Stack>

          {/* KPI tile row */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <KpiTile
              label="Classrooms"
              value={classrooms.length}
              loading={loading}
            />
            <KpiTile
              label="Students"
              value={
                dashboard?.overview_stats?.total_students_participated ?? "—"
              }
              loading={loading}
            />
            <KpiTile
              label="Active quizzes"
              value={dashboard?.overview_stats?.active_quizzes ?? "—"}
              loading={loading}
            />
          </Stack>

          {/* Filter bar */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ md: "center" }}
          >
            {/* Classroom filter */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>All classrooms</InputLabel>
              <Select
                value={classroomFilter}
                label="All classrooms"
                onChange={(e) => setClassroomFilter(e.target.value)}
              >
                <MenuItem value="">All classrooms</MenuItem>
                {classrooms.map((c: any) => {
                  const id = c.classroom_id || c.id;
                  const name = c.name || c.classroom_name || "Unnamed";
                  return (
                    <MenuItem key={id} value={id}>
                      {name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {/* Date range filter */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Date range</InputLabel>
              <Select
                value={dateRange}
                label="Date range"
                onChange={(e) => setDateRange(e.target.value as DateRange)}
              >
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>

            {/* Custom date pickers — shown only when custom is selected */}
            {dateRange === "custom" && (
              <>
                <TextField
                  type="date"
                  size="small"
                  label="From"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="date"
                  size="small"
                  label="To"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}
          </Stack>

          {/* Tabs */}
          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            sx={{
              borderBottom: "1px solid #eee",
              "& .MuiTab-root": { textTransform: "none", fontSize: 14 },
              "& .Mui-selected": { color: "#ff5000 !important" },
              "& .MuiTabs-indicator": { backgroundColor: "#ff5000" },
            }}
          >
            <Tab label="Recent Activity" />
            <Tab label="Top Performers" />
            <Tab label="Needs Support" />
          </Tabs>

          {/* Tab panels — render only the active one */}
          <Stack sx={{ pt: 1 }}>
            {tabIndex === 0 && <TabRecentActivity />}
            {tabIndex === 1 && <TabTopPerformers />}
            {tabIndex === 2 && <TabNeedsSupport />}
          </Stack>
        </Stack>
      </TeacherCard>
    </ContentLayout>
  );
}
