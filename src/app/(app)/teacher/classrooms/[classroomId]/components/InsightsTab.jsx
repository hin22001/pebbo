"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";

export default function InsightsTab({ classroomId }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await TeacherAPI.getClassroomOverview({
        classroom_id: classroomId,
      });
      const data = res?.overview ?? res ?? null;
      setOverview(data);
    } catch (err) {
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  if (loading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={80} />
        <Skeleton variant="rounded" height={120} />
        <Skeleton variant="rounded" height={120} />
      </Stack>
    );
  }

  if (!overview) {
    return (
      <Typography
        className="dashboard-page-description"
        style={{ color: "#888", textAlign: "left", paddingTop: 8 }}
      >
        No data available yet. Insights appear after students complete
        assignments.
      </Typography>
    );
  }

  const avgScore =
    overview.avg_score ?? overview.average_score ?? null;
  const completionRate =
    overview.completion_rate ??
    overview.completion_pct ??
    overview.completion_percent ??
    null;
  const weakest = Array.isArray(overview.weakest_categories)
    ? overview.weakest_categories.slice(0, 3)
    : [];
  const strongest = Array.isArray(overview.strongest_categories)
    ? overview.strongest_categories.slice(0, 3)
    : [];

  const hasData =
    avgScore !== null ||
    completionRate !== null ||
    weakest.length > 0 ||
    strongest.length > 0;

  if (!hasData) {
    return (
      <Typography
        className="dashboard-page-description"
        style={{ color: "#888", textAlign: "left", paddingTop: 8 }}
      >
        No data available yet. Insights appear after students complete
        assignments.
      </Typography>
    );
  }

  return (
    <Stack spacing={2.5}>
      {/* Summary stats row */}
      <Stack direction="row" spacing={2}>
        {avgScore !== null && (
          <Card className="dashboard-page-card" sx={{ flex: 1 }}>
            <Stack spacing={0.5} sx={{ padding: "12px 16px" }}>
              <Typography style={{ fontSize: 12, color: "#777" }}>
                Average Score
              </Typography>
              <Typography
                style={{ fontSize: "2rem", fontWeight: 700, color: "#8264ff" }}
              >
                {Math.round(avgScore)}%
              </Typography>
            </Stack>
          </Card>
        )}
        {completionRate !== null && (
          <Card className="dashboard-page-card" sx={{ flex: 1 }}>
            <Stack spacing={0.5} sx={{ padding: "12px 16px" }}>
              <Typography style={{ fontSize: 12, color: "#777" }}>
                Completion Rate
              </Typography>
              <Typography
                style={{ fontSize: "2rem", fontWeight: 700, color: "#ff5000" }}
              >
                {Math.round(completionRate)}%
              </Typography>
            </Stack>
          </Card>
        )}
      </Stack>

      {/* Weakest Categories */}
      {weakest.length > 0 && (
        <Stack spacing={1}>
          <Typography style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
            Weakest Categories
          </Typography>
          <Card className="dashboard-page-card">
            <Stack spacing={0.5}>
              {weakest.map((cat, i) => {
                const name = cat.category || cat.name || `Category ${i + 1}`;
                const score = cat.avg_score ?? cat.score ?? 0;
                return (
                  <Stack
                    key={name}
                    className="inbox-page-row"
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ padding: "8px 12px", borderRadius: "8px" }}
                  >
                    <Typography style={{ fontSize: 13, color: "#333" }}>
                      {name}
                    </Typography>
                    <Typography
                      style={{ fontSize: 13, fontWeight: 600, color: "#d32f2f" }}
                    >
                      {Math.round(score)}%
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Card>
        </Stack>
      )}

      {/* Strongest Categories */}
      {strongest.length > 0 && (
        <Stack spacing={1}>
          <Typography style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
            Strongest Categories
          </Typography>
          <Card className="dashboard-page-card">
            <Stack spacing={0.5}>
              {strongest.map((cat, i) => {
                const name = cat.category || cat.name || `Category ${i + 1}`;
                const score = cat.avg_score ?? cat.score ?? 0;
                return (
                  <Stack
                    key={name}
                    className="inbox-page-row"
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ padding: "8px 12px", borderRadius: "8px" }}
                  >
                    <Typography style={{ fontSize: 13, color: "#333" }}>
                      {name}
                    </Typography>
                    <Typography
                      style={{ fontSize: 13, fontWeight: 600, color: "#43a047" }}
                    >
                      {Math.round(score)}%
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Card>
        </Stack>
      )}
    </Stack>
  );
}
