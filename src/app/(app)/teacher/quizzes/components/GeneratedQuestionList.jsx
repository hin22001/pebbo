"use client";

import React from "react";
import { Card, Stack, Typography } from "@mui/material";

const sectionHeadingStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: "#565656",
  marginBottom: 14,
};

export default function GeneratedQuestionList({
  candidates,
  requestedCount,
  generating,
  onRegenerate,
  onRemove,
  onPreview,
}) {
  if (!candidates || candidates.length === 0) return null;

  const thin = requestedCount != null && candidates.length < requestedCount;

  return (
    <Card className="dashboard-page-card" sx={{ margin: 0 }}>
      <Typography style={sectionHeadingStyle}>Review ({candidates.length})</Typography>

      <Stack spacing={0.5}>
        {candidates.map((q, idx) => (
          <Stack
            key={q.key}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              padding: "10px 12px",
              borderRadius: "10px",
              transition: "background 0.2s",
              "&:hover": { backgroundColor: "#f5f3ff" },
            }}
          >
            <Typography
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#565656",
                flex: 1,
                marginRight: 12,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: "#8d8d8d", marginRight: 6 }}>{idx + 1}.</span>
              {q.categoryName}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexShrink: 0 }}>
              {q.difficulty != null && (
                <Typography
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#8264ff",
                    backgroundColor: "#f0eefb",
                    borderRadius: 6,
                    padding: "2px 8px",
                  }}
                >
                  Difficulty {q.difficulty}
                </Typography>
              )}
              <Typography
                onClick={() => onRemove(q.key)}
                sx={{
                  fontSize: 13,
                  color: "#8d8d8d",
                  cursor: "pointer",
                  transition: "color 0.15s",
                  "&:hover": { color: "#d32f2f" },
                }}
              >
                Remove
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>

      {thin && (
        <Typography style={{ fontSize: 13, color: "#b26a00", marginTop: 10 }}>
          Only {candidates.length} question{candidates.length === 1 ? "" : "s"} matched your
          filters (you asked for {requestedCount}).
        </Typography>
      )}

      <Stack direction="row" spacing={1.5} sx={{ marginTop: 2 }} flexWrap="wrap">
        <Stack
          className={generating ? "dashboard-page-form-btn-disabled" : "dashboard-page-form-btn"}
          onClick={() => !generating && onRegenerate()}
          sx={{
            cursor: generating ? "default" : "pointer",
            background: "#f0eefb !important",
            "& .dashboard-page-form-btn-txt": { color: "#8264ff !important" },
          }}
        >
          <Typography className="dashboard-page-form-btn-txt">
            {generating ? "Generating…" : "↻ Regenerate"}
          </Typography>
        </Stack>
        <Stack
          className="dashboard-page-form-btn"
          onClick={onPreview}
          sx={{
            cursor: "pointer",
            background: "#f5f5f5 !important",
            "& .dashboard-page-form-btn-txt": { color: "#565656 !important" },
          }}
        >
          <Typography className="dashboard-page-form-btn-txt">Preview as student</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
