"use client";

import React from "react";
import {
  Card,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

// Native teacher-portal section heading (matches the dashboard: 16/600/#565656).
const sectionHeadingStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: "#565656",
  marginBottom: 14,
};

// Field sub-labels inside a card.
const fieldLabelStyle = { fontSize: 14, fontWeight: 600, color: "#565656" };

// Tint MUI input focus to the brand purple instead of MUI's default blue.
const purpleFocusSx = {
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#8264ff",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#8264ff" },
};

export default function QuizGeneratorPanel({
  year,
  setYear,
  categoryOptions, // [{ id, label }]
  selectedCategories,
  setSelectedCategories,
  selectedDifficulties,
  setSelectedDifficulties,
  count,
  setCount,
  onGenerate,
  generating,
}) {
  const toggle = (arr, setArr, value) =>
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);

  const allCatIds = categoryOptions.map((c) => Number(c.id));
  const allSelected =
    allCatIds.length > 0 && allCatIds.every((id) => selectedCategories.includes(id));
  const canGenerate =
    selectedCategories.length > 0 && selectedDifficulties.length > 0 && !generating;

  const chipSx = (on) => ({
    cursor: "pointer",
    fontWeight: on ? 600 : 500,
    backgroundColor: on ? "#8264ff" : "#f0eefb",
    color: on ? "#fff" : "#565656",
    transition: "background-color 0.15s ease, color 0.15s ease",
    "&:hover": { backgroundColor: on ? "#7253f5" : "#e6e2f8" },
  });

  return (
    <Card className="dashboard-page-card" sx={{ margin: 0 }}>
      <Typography style={sectionHeadingStyle}>Generate questions</Typography>
      <Stack spacing={2.5}>
        <FormControl size="small" sx={{ minWidth: 160, ...purpleFocusSx }}>
          <InputLabel>Year level</InputLabel>
          <Select value={year} label="Year level" onChange={(e) => setYear(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6].map((y) => (
              <MenuItem key={y} value={y}>
                Year {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography style={fieldLabelStyle}>Categories</Typography>
            <Typography
              onClick={() => setSelectedCategories(allSelected ? [] : allCatIds)}
              style={{ fontSize: 13, fontWeight: 500, color: "#8264ff", cursor: "pointer" }}
            >
              {allSelected ? "Clear all" : "Select all"}
            </Typography>
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {categoryOptions.length === 0 ? (
              <Typography style={{ fontSize: 13, color: "#8d8d8d" }}>
                No categories for this year.
              </Typography>
            ) : (
              categoryOptions.map((c) => {
                const id = Number(c.id);
                const on = selectedCategories.includes(id);
                return (
                  <Chip
                    key={c.id}
                    label={c.label}
                    size="small"
                    onClick={() => toggle(selectedCategories, setSelectedCategories, id)}
                    sx={chipSx(on)}
                  />
                );
              })
            )}
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography style={fieldLabelStyle}>Difficulty</Typography>
          <Stack direction="row" gap={0.75}>
            {[1, 2, 3, 4, 5].map((d) => {
              const on = selectedDifficulties.includes(d);
              return (
                <Chip
                  key={d}
                  label={d}
                  size="small"
                  onClick={() => toggle(selectedDifficulties, setSelectedDifficulties, d)}
                  sx={{ ...chipSx(on), minWidth: 38 }}
                />
              );
            })}
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography style={fieldLabelStyle}>Number of questions</Typography>
          <TextField
            type="number"
            size="small"
            sx={{ maxWidth: 130, ...purpleFocusSx }}
            value={count}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              setCount(Number.isFinite(n) ? Math.min(Math.max(n, 1), 10) : "");
            }}
            inputProps={{ min: 1, max: 10 }}
            helperText="Up to 10"
            FormHelperTextProps={{ sx: { marginLeft: 0, color: "#8d8d8d" } }}
          />
        </Stack>

        <Stack
          className={canGenerate ? "dashboard-page-form-btn" : "dashboard-page-form-btn-disabled"}
          onClick={() => canGenerate && onGenerate()}
          sx={{ cursor: canGenerate ? "pointer" : "default", marginTop: "0.5rem" }}
        >
          <Typography className="dashboard-page-form-btn-txt">
            {generating ? "Generating…" : "Generate"}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
