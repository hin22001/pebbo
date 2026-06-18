"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";
import Alert from "@/app/components/elements/alert/Alert";
import AssignQuizModal from "@/app/components/modules/modal/AssignQuizModal";
import useTeacherDashboardStore from "@/src/app/stores/useTeacherDashboardStore";

export default function AssignmentsTab({ classroomId }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⋮ menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeAssignment, setActiveAssignment] = useState(null);

  // AssignQuizModal state
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("success");

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await TeacherAPI.getQuizCompletion({
        classroom_id: classroomId,
      });
      const data = res?.quizzes ?? res ?? [];
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  function openMenu(event, assignment) {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setActiveAssignment(assignment);
  }

  function closeMenu() {
    setMenuAnchor(null);
    setActiveAssignment(null);
  }

  async function handleRemove() {
    const quizId =
      activeAssignment?.quiz_id || activeAssignment?.id;
    const quizName =
      activeAssignment?.quiz_name ||
      activeAssignment?.name ||
      "this quiz";
    closeMenu();

    const confirmed = window.confirm(
      `Remove "${quizName}" from this classroom?`
    );
    if (!confirmed) return;

    try {
      await TeacherAPI.removeQuizzesFromClassroom(
        {},
        { classroom_id: classroomId, quiz_ids: [quizId] }
      );
      setAlertMsg(`"${quizName}" removed from classroom.`);
      setAlertType("success");
      setAlertOpen(true);
      fetchAssignments();
      useTeacherDashboardStore.getState().invalidate();
    } catch (err) {
      setAlertMsg("Failed to remove quiz. Please try again.");
      setAlertType("error");
      setAlertOpen(true);
    }
  }

  function handleAssignQuiz() {
    setShowAssignModal(true);
  }

  return (
    <Stack spacing={2}>
      {/* Alert */}
      <Alert
        isOpen={alertOpen}
        message={alertMsg}
        type={alertType}
        handleClose={() => setAlertOpen(false)}
      />

      {/* Toolbar */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
          Assignments
        </Typography>
        <Stack
          className="dashboard-page-form-btn"
          onClick={handleAssignQuiz}
          sx={{ cursor: "pointer" }}
        >
          <Typography className="dashboard-page-form-btn-txt">
            + Assign quiz
          </Typography>
        </Stack>
      </Stack>

      {/* Assignment list */}
      <Card className="dashboard-page-card">
        {loading ? (
          <Stack spacing={1}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={64} />
            ))}
          </Stack>
        ) : assignments.length === 0 ? (
          <Typography
            className="dashboard-page-description"
            style={{ color: "#888", textAlign: "left" }}
          >
            No assignments yet. Click &lsquo;+ Assign quiz&rsquo; to get
            started.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {assignments.map((assignment) => {
              const quizId = assignment.quiz_id || assignment.id;
              const quizName =
                assignment.quiz_name || assignment.name || "Untitled Quiz";
              const done =
                assignment.completed_count ??
                assignment.done ??
                assignment.students_done ??
                0;
              const total =
                assignment.total_count ??
                assignment.total ??
                assignment.students_total ??
                0;
              const avgScore =
                assignment.avg_score ??
                assignment.average_score ??
                null;
              const dueDate =
                assignment.due_date || assignment.due_at || null;
              const targetScore =
                assignment.target_score ?? assignment.targetScore ?? null;
              const progress = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <Stack
                  key={quizId}
                  className="inbox-page-row"
                  spacing={0.75}
                  sx={{ padding: "10px 12px", borderRadius: "8px" }}
                >
                  {/* Row header */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Typography
                        style={{ fontSize: 14, fontWeight: 500, color: "#333" }}
                      >
                        {quizName}
                      </Typography>
                      <Typography style={{ fontSize: 12, color: "#777" }}>
                        {done}/{total} done
                      </Typography>
                      {avgScore !== null && (
                        <Typography style={{ fontSize: 12, color: "#777" }}>
                          Avg: {Math.round(avgScore)}%
                        </Typography>
                      )}
                      {dueDate && (
                        <Typography style={{ fontSize: 12, color: "#ff5000" }}>
                          Due:{" "}
                          {new Date(dueDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </Typography>
                      )}
                      {targetScore !== null && targetScore !== undefined && (
                        <Typography style={{ fontSize: 12, color: "#8264ff" }}>
                          Target: {targetScore}%
                        </Typography>
                      )}
                    </Stack>
                    <IconButton
                      size="small"
                      onClick={(e) => openMenu(e, assignment)}
                      sx={{ color: "#999" }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  {/* Progress bar */}
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#f0eeff",
                      "& .MuiLinearProgress-bar": {
                        background:
                          "linear-gradient(90deg, #8264ff 0%, #ff64a0 100%)",
                        borderRadius: 3,
                      },
                    }}
                  />
                </Stack>
              );
            })}
          </Stack>
        )}
      </Card>

      {/* AssignQuizModal */}
      <AssignQuizModal
        isOpen={showAssignModal}
        prefillClassroomId={classroomId}
        onClose={() => setShowAssignModal(false)}
        onSuccess={() => {
          fetchAssignments();
          useTeacherDashboardStore.getState().invalidate();
        }}
      />

      {/* ⋮ Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        PaperProps={{ sx: { borderRadius: "12px", minWidth: 200 } }}
      >
        <MenuItem
          onClick={handleRemove}
          sx={{ fontSize: 14, color: "#d32f2f" }}
        >
          Remove from this classroom
        </MenuItem>
      </Menu>
    </Stack>
  );
}
