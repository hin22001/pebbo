"use client";

import React, { useEffect, useState } from "react";
import {
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import TeacherCard from "@/app/components/modules/card/TeacherCard";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";
import Alert from "@/app/components/elements/alert/Alert";
import RosterTab from "./components/RosterTab";
import AssignmentsTab from "./components/AssignmentsTab";
import useTeacherDashboardStore from "@/src/app/stores/useTeacherDashboardStore";

interface Classroom {
  classroom_id?: string;
  id?: string;
  name?: string;
  classroom_name?: string;
  student_count?: number;
  students_count?: number;
  total_students?: number;
}

// "roster" key kept for backward-compatible ?tab=roster links; the visible
// label is "Students". Insights tab intentionally removed.
const TAB_KEYS = ["roster", "assignments"] as const;
type TabKey = (typeof TAB_KEYS)[number];

interface ClassroomDetailClientProps {
  classroomId: string;
}

export default function ClassroomDetailClient({
  classroomId,
}: ClassroomDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab") as TabKey | null;
  const tabIndex = tabParam && TAB_KEYS.includes(tabParam)
    ? TAB_KEYS.indexOf(tabParam)
    : 0;

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit name state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  useEffect(() => {
    fetchClassroom();
  }, [classroomId]);

  async function fetchClassroom() {
    setLoading(true);
    try {
      // /classroom/get resolves the specific classroom by id (the list route
      // ignores classroom_id), so the header shows the real name + count.
      const res = await TeacherAPI.getClassroom({ classroom_id: classroomId });
      const data: Classroom | null = res?.classroom ?? res ?? null;
      setClassroom(data);
    } catch (err) {
      setClassroom(null);
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(_: React.SyntheticEvent, newIndex: number) {
    const key = TAB_KEYS[newIndex];
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("tab", key);
    router.push(`/teacher/classrooms/${classroomId}?${params.toString()}`);
  }

  async function handleSaveName() {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await TeacherAPI.editClassroom(
        {},
        { classroom_id: Number(classroomId), classroom_name: editName.trim() }
      );
      setAlertMsg("Classroom name updated.");
      setAlertType("success");
      setAlertOpen(true);
      setEditing(false);
      fetchClassroom();
      useTeacherDashboardStore.getState().invalidate();
    } catch (err) {
      setAlertMsg("Failed to update classroom name.");
      setAlertType("error");
      setAlertOpen(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this classroom? This action cannot be undone."
    );
    if (!confirmed) return;
    try {
      await TeacherAPI.deleteClassroom({ classroom_id: Number(classroomId) });
      useTeacherDashboardStore.getState().invalidate();
      router.push("/teacher/classrooms");
    } catch (err) {
      setAlertMsg("Failed to delete classroom.");
      setAlertType("error");
      setAlertOpen(true);
    }
  }

  const classroomName =
    classroom?.name || classroom?.classroom_name || "Classroom";
  const studentCount =
    classroom?.student_count ??
    classroom?.students_count ??
    classroom?.total_students ??
    null;

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

          {/* Back link */}
          <Typography
            onClick={() => router.push("/teacher/classrooms")}
            style={{
              fontSize: 13,
              color: "#ff5000",
              cursor: "pointer",
              display: "inline-block",
              width: "fit-content",
            }}
          >
            ← My Classrooms
          </Typography>

          {/* Header */}
          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={32} width={240} />
              <Skeleton variant="rounded" height={20} width={120} />
            </Stack>
          ) : (
            <Stack spacing={0.5}>
              {editing ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    variant="outlined"
                    size="small"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") {
                        setEditing(false);
                        setEditName("");
                      }
                    }}
                    autoFocus
                    sx={{ minWidth: 240 }}
                  />
                  <Stack
                    className="dashboard-page-form-btn"
                    onClick={handleSaveName}
                    sx={{ cursor: "pointer", opacity: saving ? 0.7 : 1 }}
                  >
                    <Typography className="dashboard-page-form-btn-txt">
                      {saving ? "Saving…" : "Save"}
                    </Typography>
                  </Stack>
                  <Typography
                    onClick={() => {
                      setEditing(false);
                      setEditName("");
                    }}
                    style={{ fontSize: 13, color: "#888", cursor: "pointer" }}
                  >
                    Cancel
                  </Typography>
                </Stack>
              ) : (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography
                    style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}
                  >
                    {classroomName}
                  </Typography>
                  <Typography
                    onClick={() => {
                      setEditing(true);
                      setEditName(classroomName);
                    }}
                    style={{
                      fontSize: 13,
                      color: "#ff5000",
                      cursor: "pointer",
                    }}
                  >
                    Edit name
                  </Typography>
                  <Typography
                    onClick={handleDelete}
                    style={{ fontSize: 13, color: "#d32f2f", cursor: "pointer" }}
                  >
                    Delete
                  </Typography>
                </Stack>
              )}
              {studentCount !== null && (
                <Typography style={{ fontSize: 13, color: "#777" }}>
                  {studentCount} {studentCount === 1 ? "student" : "students"}
                </Typography>
              )}
            </Stack>
          )}

          {/* Tabs */}
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            sx={{
              borderBottom: "1px solid #eee",
              "& .MuiTab-root": { textTransform: "none", fontSize: 14 },
              "& .Mui-selected": { color: "#ff5000 !important" },
              "& .MuiTabs-indicator": { backgroundColor: "#ff5000" },
            }}
          >
            <Tab label="Students" />
            <Tab label="Assignments" />
          </Tabs>

          {/* Tab content */}
          {tabIndex === 0 && <RosterTab classroomId={classroomId} />}
          {tabIndex === 1 && <AssignmentsTab classroomId={classroomId} />}
        </Stack>
      </TeacherCard>
    </ContentLayout>
  );
}
