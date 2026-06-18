"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/navigation";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";
import Alert from "@/app/components/elements/alert/Alert";

import AddStudentsModal from "./AddStudentsModal";

export default function RosterTab({ classroomId }) {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ⋮ menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeStudent, setActiveStudent] = useState(null);

  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("success");

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [classroomId]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(students);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        students.filter((s) => {
          const hay = [s.first_name, s.last_name, s.email]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        })
      );
    }
  }, [search, students]);

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await TeacherAPI.getClassroomStudents({
        classroom_id: classroomId,
        page_number: 1,
        rows_per_page: 200,
      });
      const data = res?.students ?? res ?? [];
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  function openMenu(event, student) {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setActiveStudent(student);
  }

  function closeMenu() {
    setMenuAnchor(null);
    setActiveStudent(null);
  }

  async function handleRemove() {
    const email = activeStudent?.email;
    const studentName =
      [activeStudent?.first_name, activeStudent?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      activeStudent?.email ||
      "this student";
    closeMenu();

    if (!email) {
      setAlertMsg("Cannot remove this student (missing email).");
      setAlertType("error");
      setAlertOpen(true);
      return;
    }

    const confirmed = window.confirm(
      `Remove ${studentName} from this classroom?`
    );
    if (!confirmed) return;

    try {
      // The /students/remove route is strict and keys off `email`
      // (it resolves the user id server-side), not student_id.
      await TeacherAPI.removeStudentFromClassroom(
        {},
        { classroom_id: classroomId, email }
      );
      setAlertMsg(`${studentName} removed from classroom.`);
      setAlertType("success");
      setAlertOpen(true);
      fetchStudents();
    } catch (err) {
      setAlertMsg("Failed to remove student. Please try again.");
      setAlertType("error");
      setAlertOpen(true);
    }
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
        spacing={1}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search students…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 300 }}
        />
        <Stack
          className="dashboard-page-form-btn"
          onClick={() => setShowAddModal(true)}
          sx={{ cursor: "pointer" }}
        >
          <Typography className="dashboard-page-form-btn-txt">
            + Add students
          </Typography>
        </Stack>
      </Stack>

      {/* Student list */}
      <Card className="dashboard-page-card">
        {loading ? (
          <Stack spacing={1}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rounded" height={52} />
            ))}
          </Stack>
        ) : filtered.length === 0 && students.length === 0 ? (
          <Typography
            className="dashboard-page-description"
            style={{ color: "#888", textAlign: "left" }}
          >
            No students in this classroom yet. Click &lsquo;+ Add
            students&rsquo; to get started.
          </Typography>
        ) : filtered.length === 0 ? (
          <Typography
            className="dashboard-page-description"
            style={{ color: "#888", textAlign: "left" }}
          >
            No students match &ldquo;{search}&rdquo;.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {filtered.map((student) => {
              const id =
                student.user_id || student.student_id || student.id;
              const fullName = [student.first_name, student.last_name]
                .filter(Boolean)
                .join(" ")
                .trim();
              const name = fullName || student.email || "Unnamed student";
              const pending = student.confirmed === false;

              return (
                <Stack
                  key={id}
                  className="inbox-page-row"
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    cursor: "pointer",
                    padding: "10px 12px",
                    borderRadius: "8px",
                  }}
                  onClick={() =>
                    router.push(
                      `/teacher/classrooms/${classroomId}/students/${id}`
                    )
                  }
                >
                  {/* Name + email */}
                  <Stack spacing={0.25}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        style={{ fontSize: 14, fontWeight: 500, color: "#333" }}
                      >
                        {name}
                      </Typography>
                      {pending && (
                        <Typography
                          style={{
                            fontSize: 11,
                            color: "#b26a00",
                            backgroundColor: "#fff4e5",
                            borderRadius: 6,
                            padding: "1px 6px",
                          }}
                        >
                          Pending
                        </Typography>
                      )}
                    </Stack>
                    {fullName && student.email && (
                      <Typography style={{ fontSize: 12, color: "#999" }}>
                        {student.email}
                      </Typography>
                    )}
                  </Stack>

                  {/* Menu */}
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => openMenu(e, student)}
                      sx={{ color: "#999" }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Card>

      {/* ⋮ Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        PaperProps={{ sx: { borderRadius: "12px", minWidth: 180 } }}
      >
        <MenuItem
          onClick={handleRemove}
          sx={{ fontSize: 14, color: "#d32f2f" }}
        >
          Remove from classroom
        </MenuItem>
      </Menu>

      {showAddModal && (
        <AddStudentsModal
          classroomId={classroomId}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchStudents}
        />
      )}
    </Stack>
  );
}
