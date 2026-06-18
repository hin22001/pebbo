"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 440,
  bgcolor: "#fff",
  borderRadius: "20px",
  outline: "none",
  p: 4,
};

export default function AssignQuizModal({
  isOpen,
  prefillClassroomId,
  onClose,
  onSuccess,
}) {
  const [classrooms, setClassrooms] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [classroomId, setClassroomId] = useState(prefillClassroomId || "");
  const [quizId, setQuizId] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [targetScore, setTargetScore] = useState("");
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchClassrooms();
      fetchQuizzes();
      // Reset selections (but respect prefill)
      setClassroomId(prefillClassroomId || "");
      setQuizId("");
      setDueDate(null);
      setTargetScore("");
      setError("");
    }
  }, [isOpen, prefillClassroomId]);

  async function fetchClassrooms() {
    setLoadingClassrooms(true);
    try {
      const res = await TeacherAPI.getClassrooms({
        page_number: 1,
        rows_per_page: 100,
      });
      const data = res?.classrooms ?? res ?? [];
      setClassrooms(Array.isArray(data) ? data : []);
    } catch {
      setClassrooms([]);
    } finally {
      setLoadingClassrooms(false);
    }
  }

  async function fetchQuizzes() {
    setLoadingQuizzes(true);
    try {
      const res = await TeacherAPI.getQuizzes({
        page_number: 1,
        rows_per_page: 100,
      });
      const data = res?.quizzes ?? res ?? [];
      setQuizzes(Array.isArray(data) ? data : []);
    } catch {
      setQuizzes([]);
    } finally {
      setLoadingQuizzes(false);
    }
  }

  async function handleAssign() {
    if (!classroomId || !quizId) {
      setError("Please select a classroom and a quiz.");
      return;
    }
    setAssigning(true);
    setError("");
    try {
      const body = {
        classroom_id: classroomId,
        quiz_ids: [quizId],
      };
      if (dueDate) {
        body.due_date = dayjs(dueDate).toISOString();
      }
      if (targetScore !== "" && targetScore !== null) {
        const score = Number(targetScore);
        if (!isNaN(score)) body.target_score = score;
      }
      await TeacherAPI.addQuizzesToClassroom({}, body);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to assign quiz. Please try again.");
    } finally {
      setAssigning(false);
    }
  }

  const canAssign = !!classroomId && !!quizId && !assigning;

  return (
    <Modal open={!!isOpen} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography
          style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}
        >
          Assign Quiz to Classroom
        </Typography>

        <Stack spacing={2.5}>
          {/* 1. Pick a classroom */}
          <FormControl size="small" fullWidth>
            <InputLabel>Classroom</InputLabel>
            <Select
              value={classroomId}
              label="Classroom"
              onChange={(e) => setClassroomId(e.target.value)}
            >
              {loadingClassrooms ? (
                <MenuItem disabled>Loading…</MenuItem>
              ) : classrooms.length === 0 ? (
                <MenuItem disabled>No classrooms found</MenuItem>
              ) : (
                classrooms.map((c) => {
                  const id = c.classroom_id || c.id;
                  const name = c.name || c.classroom_name || "Unnamed";
                  return (
                    <MenuItem key={id} value={id}>
                      {name}
                    </MenuItem>
                  );
                })
              )}
            </Select>
          </FormControl>

          {/* 2. Pick a quiz */}
          <FormControl size="small" fullWidth>
            <InputLabel>Quiz</InputLabel>
            <Select
              value={quizId}
              label="Quiz"
              onChange={(e) => setQuizId(e.target.value)}
            >
              {loadingQuizzes ? (
                <MenuItem disabled>Loading…</MenuItem>
              ) : quizzes.length === 0 ? (
                <MenuItem disabled>No published quizzes found</MenuItem>
              ) : (
                quizzes.map((q) => {
                  const id = q.quiz_id || q.id;
                  const name = q.quiz_name || q.name || q.title || "Untitled";
                  return (
                    <MenuItem key={id} value={id}>
                      {name}
                    </MenuItem>
                  );
                })
              )}
            </Select>
          </FormControl>

          {/* 3. Due date */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Due date (optional)"
              value={dueDate}
              onChange={(newValue) => setDueDate(newValue)}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </LocalizationProvider>

          {/* 4. Target score */}
          <TextField
            label="Target score (optional, 0–100)"
            variant="outlined"
            size="small"
            fullWidth
            type="number"
            inputProps={{ min: 0, max: 100 }}
            value={targetScore}
            onChange={(e) => setTargetScore(e.target.value)}
          />

          {/* Error */}
          {error && (
            <Typography style={{ fontSize: 13, color: "#d32f2f" }}>
              {error}
            </Typography>
          )}

          {/* Actions */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Stack
              className="dashboard-page-form-btn"
              onClick={onClose}
              sx={{
                cursor: "pointer",
                background: "#f5f5f5 !important",
                "& .dashboard-page-form-btn-txt": { color: "#555 !important" },
              }}
            >
              <Typography className="dashboard-page-form-btn-txt">
                Cancel
              </Typography>
            </Stack>
            <Stack
              className={
                canAssign
                  ? "dashboard-page-form-btn"
                  : "dashboard-page-form-btn-disabled"
              }
              onClick={canAssign ? handleAssign : undefined}
              sx={{ cursor: canAssign ? "pointer" : "default" }}
            >
              <Typography className="dashboard-page-form-btn-txt">
                {assigning ? "Assigning…" : "Assign"}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
}
