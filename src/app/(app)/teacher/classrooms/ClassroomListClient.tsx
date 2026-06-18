"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Modal,
  Box,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import TeacherCard from "@/app/components/modules/card/TeacherCard";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";
import Alert from "@/app/components/elements/alert/Alert";
import useTeacherDashboardStore, {
  TeacherClassroom,
} from "@/src/app/stores/useTeacherDashboardStore";

interface Classroom extends TeacherClassroom {
  active_assignments?: number;
  assignment_count?: number;
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#fff",
  borderRadius: "20px",
  outline: "none",
  p: 4,
};

export default function ClassroomListClient() {
  const router = useRouter();
  const classrooms = useTeacherDashboardStore(
    (s) => s.classrooms
  ) as Classroom[];
  const loading = useTeacherDashboardStore((s) => s.loading);
  const fetchAll = useTeacherDashboardStore((s) => s.fetchAll);
  const invalidate = useTeacherDashboardStore((s) => s.invalidate);

  const [filtered, setFiltered] = useState<Classroom[]>([]);
  const [search, setSearch] = useState("");

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(classrooms);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        classrooms.filter((c) => {
          const name = c.name || c.classroom_name || "";
          return name.toLowerCase().includes(q);
        })
      );
    }
  }, [search, classrooms]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await TeacherAPI.createClassroom({}, { classroom_name: newName.trim() });
      setAlertMsg("Classroom created successfully.");
      setAlertType("success");
      setAlertOpen(true);
      setShowCreate(false);
      setNewName("");
      invalidate();
    } catch (err) {
      setAlertMsg("Failed to create classroom. Please try again.");
      setAlertType("error");
      setAlertOpen(true);
    } finally {
      setCreating(false);
    }
  }

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Stack spacing={2} sx={{ padding: "1rem" }}>
          {/* Alert */}
          <Alert
            isOpen={alertOpen}
            message={alertMsg}
            type={alertType}
            handleClose={() => setAlertOpen(false)}
          />

          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              className="dashboard-page-title"
              style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}
            >
              My Classrooms
            </Typography>
            <Stack
              className="dashboard-page-form-btn"
              onClick={() => setShowCreate(true)}
              sx={{ cursor: "pointer" }}
            >
              <Typography className="dashboard-page-form-btn-txt">
                + New classroom
              </Typography>
            </Stack>
          </Stack>

          {/* Search */}
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search classrooms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ maxWidth: 360 }}
          />

          {/* List */}
          <Card className="dashboard-page-card">
            {loading ? (
              <Stack spacing={1}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={52} />
                ))}
              </Stack>
            ) : filtered.length === 0 && classrooms.length === 0 ? (
              <Typography
                className="dashboard-page-description"
                style={{ color: "#888", textAlign: "left" }}
              >
                You&apos;re not in any classrooms yet. Talk to your school
                admin, or create one if you have permission.
              </Typography>
            ) : filtered.length === 0 ? (
              <Typography
                className="dashboard-page-description"
                style={{ color: "#888", textAlign: "left" }}
              >
                No classrooms match &ldquo;{search}&rdquo;.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {filtered.map((classroom) => {
                  const id = classroom.classroom_id || classroom.id;
                  const name =
                    classroom.name ||
                    classroom.classroom_name ||
                    "Unnamed Classroom";
                  const count =
                    classroom.student_count ??
                    classroom.students_count ??
                    classroom.total_students ??
                    null;
                  const active =
                    classroom.active_assignments ??
                    classroom.assignment_count ??
                    null;

                  return (
                    <Stack
                      key={id}
                      className="inbox-page-row"
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      onClick={() =>
                        router.push(`/teacher/classrooms/${id}`)
                      }
                      sx={{
                        cursor: "pointer",
                        padding: "10px 12px",
                        borderRadius: "8px",
                      }}
                    >
                      <Typography
                        style={{ fontSize: 14, fontWeight: 500, color: "#333" }}
                      >
                        {name}
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {count !== null && (
                          <Typography style={{ fontSize: 13, color: "#777" }}>
                            {count} {count === 1 ? "student" : "students"}
                          </Typography>
                        )}
                        {active !== null && (
                          <Typography style={{ fontSize: 13, color: "#777" }}>
                            {active} active{" "}
                            {active === 1 ? "assignment" : "assignments"}
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Card>
        </Stack>

        {/* Create Classroom Modal */}
        <Modal open={showCreate} onClose={() => setShowCreate(false)}>
          <Box sx={modalStyle}>
            <Typography
              style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}
            >
              New Classroom
            </Typography>
            <TextField
              label="Classroom name"
              variant="outlined"
              size="small"
              fullWidth
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              sx={{ marginBottom: 2 }}
            />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Stack
                className="dashboard-page-form-btn"
                onClick={() => setShowCreate(false)}
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
                className="dashboard-page-form-btn"
                onClick={handleCreate}
                sx={{ cursor: "pointer", opacity: creating ? 0.7 : 1 }}
              >
                <Typography className="dashboard-page-form-btn-txt">
                  {creating ? "Creating…" : "Create"}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Modal>
      </TeacherCard>
    </ContentLayout>
  );
}
