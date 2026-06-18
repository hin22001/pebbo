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
  TextField,
  Typography,
} from "@mui/material";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import TeacherCard from "@/app/components/modules/card/TeacherCard";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Status pill color — matches ClassReportClient / TeacherDashboardClient
function statusColor(status: string): string {
  if (status === "active") return "#00BE2A";
  if (status === "upcoming") return "#8264FF";
  return "#8D8D8D";
}

// Accuracy color: ≥70 green, 40–69 amber, <40 red (#ff5000)
function accuracyColor(pct: number): string {
  if (pct >= 70) return "#00BE2A";
  if (pct >= 40) return "#f59e0b";
  return "#ff5000";
}

// Custom lavender scrollbar sx — matches ClassReportClient
const scrollSx = {
  maxHeight: 500,
  overflowY: "auto" as const,
  paddingRight: "4px",
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "#e0d9ff", borderRadius: 3 },
};

// ─── Skeleton rows ────────────────────────────────────────────────────────────
function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <Stack spacing={1}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={56} />
      ))}
    </Stack>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuizReportClient() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "" | "active" | "upcoming" | "completed"
  >("");
  // Single combined sort select: "date_desc" | "date_asc" | "completion_desc" | ...
  const [sortKey, setSortKey] = useState<
    | "date_desc"
    | "date_asc"
    | "completion_desc"
    | "completion_asc"
    | "accuracy_desc"
    | "accuracy_asc"
  >("date_desc");

  // Fetch quiz list on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await TeacherAPI.getQuizDashboard().catch(() => null);
        if (cancelled) return;
        const list = Array.isArray(res?.recent_quizzes)
          ? res.recent_quizzes
          : [];
        setQuizzes(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter by search term + status
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return quizzes
      .filter((q) => !term || (q.quiz_name ?? "").toLowerCase().includes(term))
      .filter((q) => !statusFilter || q.status === statusFilter);
  }, [quizzes, search, statusFilter]);

  // Sort derived from single combined key
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const [sortBy, sortDir] = sortKey.split("_") as [string, string];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") {
        const aTime = a.created_date
          ? new Date(a.created_date).getTime()
          : Number.NEGATIVE_INFINITY;
        const bTime = b.created_date
          ? new Date(b.created_date).getTime()
          : Number.NEGATIVE_INFINITY;
        cmp = aTime - bTime;
      } else if (sortBy === "completion") {
        cmp = (a.completion_rate ?? 0) - (b.completion_rate ?? 0);
      } else if (sortBy === "accuracy") {
        cmp = (a.average_accuracy ?? 0) - (b.average_accuracy ?? 0);
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return arr;
  }, [filtered, sortKey]);

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Stack spacing={2} sx={{ padding: "1rem" }}>
          {/* Page header */}
          <Stack spacing={0.5}>
            <Typography style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>
              Quiz Report
            </Typography>
            <Typography style={{ fontSize: 13, color: "#777" }}>
              Browse and drill into individual quiz performance.
            </Typography>
          </Stack>

          {/* Sibling pill links — "Quiz Report" active, "Class Report" inactive */}
          <Stack direction="row" spacing={1}>
            <Stack
              className="dashboard-page-form-btn-disabled"
              onClick={() => router.push("/teacher/reports/class")}
              sx={{ cursor: "pointer" }}
            >
              <Typography className="dashboard-page-form-btn-txt">
                Class Report
              </Typography>
            </Stack>
            <Stack
              className="dashboard-page-form-btn"
              sx={{ cursor: "default", opacity: 1 }}
            >
              <Typography className="dashboard-page-form-btn-txt">
                Quiz Report
              </Typography>
            </Stack>
          </Stack>

          {/* Toolbar: search + status filter + sort */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ md: "center" }}
          >
            <TextField
              size="small"
              placeholder="Search quizzes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            {/* Combined sort select (field + direction in one value) */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                label="Sort by"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as any)}
              >
                <MenuItem value="date_desc">Date (newest)</MenuItem>
                <MenuItem value="date_asc">Date (oldest)</MenuItem>
                <MenuItem value="completion_desc">Completion (high)</MenuItem>
                <MenuItem value="completion_asc">Completion (low)</MenuItem>
                <MenuItem value="accuracy_desc">Accuracy (high)</MenuItem>
                <MenuItem value="accuracy_asc">Accuracy (low)</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Quiz list */}
          {loading ? (
            <SkeletonRows />
          ) : quizzes.length === 0 ? (
            /* Empty state — no quizzes at all */
            <Stack spacing={1.5} alignItems="center" sx={{ py: 3 }}>
              <Typography
                style={{
                  fontSize: 13,
                  color: "#777",
                  padding: "16px 0",
                  textAlign: "center",
                }}
              >
                You haven&apos;t assigned any quizzes yet.
              </Typography>
              <Stack
                className="dashboard-page-form-btn"
                onClick={() => router.push("/teacher/quizzes/new")}
                sx={{ cursor: "pointer", alignSelf: "center" }}
              >
                <Typography className="dashboard-page-form-btn-txt">
                  + Create your first quiz
                </Typography>
              </Stack>
            </Stack>
          ) : sorted.length === 0 ? (
            /* Filtered to zero */
            <Typography
              style={{ fontSize: 13, color: "#777", padding: "8px 0" }}
            >
              No quizzes match your filters.
            </Typography>
          ) : (
            /* Quiz rows */
            <Stack sx={scrollSx} spacing={1}>
              {sorted.map((q: any, idx: number) => {
                const quizId = q.quiz_id || q.id;
                const quizName = q.quiz_name ?? "Untitled Quiz";
                const status = q.status || "";
                const pillColor = statusColor(status);
                const responses: number = q.total_responses ?? 0;
                const accuracyRaw: number | null =
                  q.average_accuracy ?? null;
                const accuracyPct =
                  accuracyRaw !== null ? Math.round(accuracyRaw * 100) : null;
                const createdDate = q.created_date
                  ? formatDate(q.created_date)
                  : "";

                return (
                  <Stack
                    key={quizId || idx}
                    className="inbox-page-row"
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    onClick={() =>
                      quizId &&
                      router.push(`/teacher/quizzes/${quizId}/insights`)
                    }
                    sx={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      cursor: quizId ? "pointer" : "default",
                    }}
                  >
                    {/* Left: name + status pill + date */}
                    <Stack spacing={0.25}>
                      <Typography
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#333",
                        }}
                      >
                        {quizName}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {status && (
                          <Typography
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#fff",
                              backgroundColor: pillColor,
                              padding: "2px 8px",
                              borderRadius: 6,
                              display: "inline-block",
                              textTransform: "capitalize",
                            }}
                          >
                            {status}
                          </Typography>
                        )}
                        {createdDate && (
                          <Typography
                            style={{ fontSize: 12, color: "#aaa" }}
                          >
                            {createdDate}
                          </Typography>
                        )}
                      </Stack>
                    </Stack>

                    {/* Right: response count + accuracy + arrow */}
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                    >
                      <Stack alignItems="flex-end" spacing={0}>
                        <Typography style={{ fontSize: 12, color: "#777" }}>
                          {responses} responses
                        </Typography>
                      </Stack>
                      <Typography
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color:
                            responses > 0 && accuracyPct !== null
                              ? accuracyColor(accuracyPct)
                              : "#aaa",
                          minWidth: 36,
                          textAlign: "right",
                        }}
                      >
                        {responses > 0 && accuracyPct !== null
                          ? `${accuracyPct}%`
                          : "—"}
                      </Typography>
                      {/* Arrow affordance — orange reserved for click feedback only */}
                      <Typography style={{ fontSize: 16, color: "#bbb" }}>
                        →
                      </Typography>
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Stack>
      </TeacherCard>
    </ContentLayout>
  );
}
