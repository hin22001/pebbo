"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";

type ApiEnvelope<T> = {
  status: number;
  message: string;
  data: T;
};

type ActiveUsersData = {
  period: "today" | "week" | "month";
  active_users: number;
};

type ActivityEvent = {
  id: number;
  event_id: string;
  user_id: string;
  session_id: string | null;
  event_type: string;
  path: string | null;
  question_id: number | null;
  region: string | null;
  network_hash: string | null;
  metadata: Record<string, unknown> | null;
  event_ts: string;
  created_at: string;
};

type ActivityTimelineData = {
  user_id: string;
  days: number;
  limit: number;
  events: ActivityEvent[];
};

type TopQuestion = {
  question_id: number;
  total_views: number;
  total_unique_users: number;
};

type TopQuestionsData = {
  days: number;
  limit: number;
  questions: TopQuestion[];
};

type NetworkCluster = {
  network_hash: string;
  region: string | null;
  user_count: number;
  user_ids: string[];
  samples: number;
};

type NetworkClustersData = {
  days: number;
  limit: number;
  clusters: NetworkCluster[];
};

type SpeedMetric = {
  metric_name: string;
  avg_value: number;
  p50: number;
  p95: number;
  samples: number;
};

type SpeedMetricsData = {
  days: number;
  metrics: SpeedMetric[];
};

async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const payload = (await res.json()) as ApiEnvelope<T>;

  if (!res.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload.data;
}

function WidgetCard({
  title,
  loading,
  error,
  inlineError = false,
  onRefresh,
  children,
}: {
  title: string;
  loading: boolean;
  error: string | null;
  inlineError?: boolean;
  onRefresh?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card
      className="dashboard-page-card"
      sx={{
        width: "100%",
        borderRadius: "20px",
        boxShadow: "2px 10px 14px -4px rgba(0,0,0,0.2)",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#2f2f2f" }}>
            {title}
          </Typography>
          {onRefresh && (
            <Button
              size="small"
              variant="outlined"
              sx={{
                borderColor: "#8264ff",
                color: "#8264ff",
                "&:hover": {
                  borderColor: "#6f56dc",
                  backgroundColor: "rgba(130, 100, 255, 0.08)",
                },
              }}
              onClick={onRefresh}
            >
              Refresh
            </Button>
          )}
        </Stack>
        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Stack direction="row" spacing={1} alignItems="center" py={2}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          </Stack>
        ) : error && !inlineError ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Stack spacing={inlineError && error ? 2 : 0}>
            {inlineError && error ? <Alert severity="error">{error}</Alert> : null}
            {children}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminMonitoringClient() {
  const searchParams = useSearchParams();
  const timelineUserIdParam = (searchParams?.get("user_id") || "").trim();
  const [activeUsers, setActiveUsers] = useState<ActiveUsersData | null>(null);
  const [topQuestions, setTopQuestions] = useState<TopQuestionsData | null>(null);
  const [networkClusters, setNetworkClusters] =
    useState<NetworkClustersData | null>(null);
  const [speedMetrics, setSpeedMetrics] = useState<SpeedMetricsData | null>(null);
  const [activityTimeline, setActivityTimeline] =
    useState<ActivityTimelineData | null>(null);

  const [loadingActiveUsers, setLoadingActiveUsers] = useState(false);
  const [loadingTopQuestions, setLoadingTopQuestions] = useState(false);
  const [loadingNetworkClusters, setLoadingNetworkClusters] = useState(false);
  const [loadingSpeedMetrics, setLoadingSpeedMetrics] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const [errorActiveUsers, setErrorActiveUsers] = useState<string | null>(null);
  const [errorTopQuestions, setErrorTopQuestions] = useState<string | null>(null);
  const [errorNetworkClusters, setErrorNetworkClusters] = useState<string | null>(
    null,
  );
  const [errorSpeedMetrics, setErrorSpeedMetrics] = useState<string | null>(null);
  const [errorTimeline, setErrorTimeline] = useState<string | null>(null);

  const [timelineUserId, setTimelineUserId] = useState("");
  const [timelineDays, setTimelineDays] = useState("7");
  const [timelineLimit, setTimelineLimit] = useState("100");

  const loadActiveUsers = useCallback(async () => {
    try {
      setLoadingActiveUsers(true);
      setErrorActiveUsers(null);
      const data = await fetchApi<ActiveUsersData>(
        "/api/protected/admin/analytics/active-users?period=week",
      );
      setActiveUsers(data);
    } catch (err: any) {
      setErrorActiveUsers(err?.message || "Failed to load active users");
    } finally {
      setLoadingActiveUsers(false);
    }
  }, []);

  const loadTopQuestions = useCallback(async () => {
    try {
      setLoadingTopQuestions(true);
      setErrorTopQuestions(null);
      const data = await fetchApi<TopQuestionsData>(
        "/api/protected/admin/analytics/top-questions",
      );
      setTopQuestions(data);
    } catch (err: any) {
      setErrorTopQuestions(err?.message || "Failed to load top questions");
    } finally {
      setLoadingTopQuestions(false);
    }
  }, []);

  const loadNetworkClusters = useCallback(async () => {
    try {
      setLoadingNetworkClusters(true);
      setErrorNetworkClusters(null);
      const data = await fetchApi<NetworkClustersData>(
        "/api/protected/admin/analytics/network-clusters",
      );
      setNetworkClusters(data);
    } catch (err: any) {
      setErrorNetworkClusters(err?.message || "Failed to load network clusters");
    } finally {
      setLoadingNetworkClusters(false);
    }
  }, []);

  const loadSpeedMetrics = useCallback(async () => {
    try {
      setLoadingSpeedMetrics(true);
      setErrorSpeedMetrics(null);
      const data = await fetchApi<SpeedMetricsData>(
        "/api/protected/admin/analytics/speed-metrics",
      );
      setSpeedMetrics(data);
    } catch (err: any) {
      setErrorSpeedMetrics(err?.message || "Failed to load speed metrics");
    } finally {
      setLoadingSpeedMetrics(false);
    }
  }, []);

  const canLoadTimeline = useMemo(
    () => Boolean(timelineUserId.trim()),
    [timelineUserId],
  );

  const loadTimeline = useCallback(async () => {
    if (!timelineUserId.trim()) {
      setErrorTimeline("Enter a valid user ID");
      setActivityTimeline(null);
      return;
    }

    const days = Number(timelineDays);
    const limit = Number(timelineLimit);

    if (!Number.isInteger(days) || days < 1 || days > 90) {
      setErrorTimeline("Days must be an integer between 1 and 90");
      setActivityTimeline(null);
      return;
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
      setErrorTimeline("Limit must be an integer between 1 and 500");
      setActivityTimeline(null);
      return;
    }

    try {
      setLoadingTimeline(true);
      setErrorTimeline(null);
      const params = new URLSearchParams({
        user_id: timelineUserId.trim(),
        days: String(days),
        limit: String(limit),
      });
      const data = await fetchApi<ActivityTimelineData>(
        `/api/protected/admin/analytics/activity-timeline?${params.toString()}`,
      );
      setActivityTimeline(data);
    } catch (err: any) {
      setErrorTimeline(err?.message || "Failed to load activity timeline");
      setActivityTimeline(null);
    } finally {
      setLoadingTimeline(false);
    }
  }, [timelineDays, timelineLimit, timelineUserId]);

  useEffect(() => {
    if (!timelineUserIdParam) return;
    setTimelineUserId(timelineUserIdParam);
  }, [timelineUserIdParam]);

  useEffect(() => {
    if (!timelineUserId) return;
    if (timelineUserId === timelineUserIdParam) {
      loadTimeline();
    }
  }, [loadTimeline, timelineUserId, timelineUserIdParam]);

  useEffect(() => {
    loadActiveUsers();
    loadTopQuestions();
    loadNetworkClusters();
    loadSpeedMetrics();
  }, [loadActiveUsers, loadNetworkClusters, loadSpeedMetrics, loadTopQuestions]);

  return (
    <ContentLayout title="Monitoring" className="dashboard-page-student-bg">
      <Stack
        spacing={2}
        className="dashboard-page-student-wrapper"
        sx={{ width: "100%", maxWidth: 1700, mx: "auto", px: { xs: 0, md: 1 } }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" },
            gap: 2,
            width: "100%",
          }}
        >
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "1 / span 4" } }}>
            <WidgetCard
              title="Active users (week)"
              loading={loadingActiveUsers}
              error={errorActiveUsers}
              onRefresh={loadActiveUsers}
            >
              {!activeUsers ? (
                <Typography variant="body2" color="text.secondary">
                  No data available.
                </Typography>
              ) : (
                <Stack spacing={0.5}>
                  <Typography variant="h4">{activeUsers.active_users}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Period: {activeUsers.period}
                  </Typography>
                </Stack>
              )}
            </WidgetCard>
          </Box>

          <Box sx={{ gridColumn: { xs: "1 / -1", md: "5 / -1" } }}>
            <WidgetCard
              title="Top questions"
              loading={loadingTopQuestions}
              error={errorTopQuestions}
              onRefresh={loadTopQuestions}
            >
              {!topQuestions || topQuestions.questions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No top questions data yet.
                </Typography>
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Question ID</TableCell>
                        <TableCell>Views</TableCell>
                        <TableCell>Unique Users</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topQuestions.questions.map((question) => (
                        <TableRow key={question.question_id}>
                          <TableCell>{question.question_id}</TableCell>
                          <TableCell>{question.total_views}</TableCell>
                          <TableCell>{question.total_unique_users}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </WidgetCard>
          </Box>
        </Box>

        <WidgetCard
          title="Student activity timeline"
          loading={loadingTimeline}
          error={errorTimeline}
          inlineError
          onRefresh={canLoadTimeline ? loadTimeline : undefined}
        >
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <TextField
                label="User ID (UUID)"
                value={timelineUserId}
                onChange={(e) => {
                  setTimelineUserId(e.target.value);
                  if (errorTimeline) setErrorTimeline(null);
                }}
                fullWidth
              />
              <TextField
                label="Days"
                value={timelineDays}
                onChange={(e) => {
                  setTimelineDays(e.target.value);
                  if (errorTimeline) setErrorTimeline(null);
                }}
                type="number"
                inputProps={{ min: 1, max: 90 }}
                sx={{ minWidth: 120 }}
              />
              <TextField
                label="Limit"
                value={timelineLimit}
                onChange={(e) => {
                  setTimelineLimit(e.target.value);
                  if (errorTimeline) setErrorTimeline(null);
                }}
                type="number"
                inputProps={{ min: 1, max: 500 }}
                sx={{ minWidth: 120 }}
              />
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#8264ff",
                  "&:hover": { backgroundColor: "#6f56dc" },
                }}
                onClick={loadTimeline}
                disabled={loadingTimeline || !canLoadTimeline}
              >
                Load
              </Button>
            </Stack>

            {!activityTimeline ? (
              <Typography variant="body2" color="text.secondary">
                Enter a user ID and click Load.
              </Typography>
            ) : activityTimeline.events.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No events found for this user and date range.
              </Typography>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Event</TableCell>
                      <TableCell>Path</TableCell>
                      <TableCell>Question ID</TableCell>
                      <TableCell>Region</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activityTimeline.events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          {new Date(event.event_ts).toLocaleString()}
                        </TableCell>
                        <TableCell>{event.event_type}</TableCell>
                        <TableCell>{event.path || "-"}</TableCell>
                        <TableCell>{event.question_id ?? "-"}</TableCell>
                        <TableCell>{event.region || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Stack>
        </WidgetCard>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" },
            gap: 2,
            width: "100%",
          }}
        >
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "1 / span 7" } }}>
            <WidgetCard
              title="Network clusters"
              loading={loadingNetworkClusters}
              error={errorNetworkClusters}
              onRefresh={loadNetworkClusters}
            >
              {!networkClusters || networkClusters.clusters.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No network clusters found.
                </Typography>
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Network hash</TableCell>
                        <TableCell>Region</TableCell>
                        <TableCell>Users</TableCell>
                        <TableCell>Samples</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {networkClusters.clusters.map((cluster) => (
                        <TableRow
                          key={`${cluster.network_hash}-${cluster.region ?? "unknown"}`}
                        >
                          <TableCell>{cluster.network_hash}</TableCell>
                          <TableCell>{cluster.region || "unknown"}</TableCell>
                          <TableCell>{cluster.user_count}</TableCell>
                          <TableCell>{cluster.samples}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </WidgetCard>
          </Box>

          <Box sx={{ gridColumn: { xs: "1 / -1", md: "8 / -1" } }}>
            <WidgetCard
              title="Speed metrics"
              loading={loadingSpeedMetrics}
              error={errorSpeedMetrics}
              onRefresh={loadSpeedMetrics}
            >
              {!speedMetrics || speedMetrics.metrics.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No speed metrics available.
                </Typography>
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell>Avg</TableCell>
                        <TableCell>P50</TableCell>
                        <TableCell>P95</TableCell>
                        <TableCell>Samples</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {speedMetrics.metrics.map((metric) => (
                        <TableRow key={metric.metric_name}>
                          <TableCell>{metric.metric_name}</TableCell>
                          <TableCell>{metric.avg_value}</TableCell>
                          <TableCell>{metric.p50}</TableCell>
                          <TableCell>{metric.p95}</TableCell>
                          <TableCell>{metric.samples}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </WidgetCard>
          </Box>
        </Box>
      </Stack>
    </ContentLayout>
  );
}
