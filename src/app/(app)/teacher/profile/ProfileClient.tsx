"use client";

import React, { useEffect, useState } from "react";
import { Card, Stack, Typography } from "@mui/material";
import { createClient } from "@supabase/supabase-js";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import TeacherCard from "@/app/components/modules/card/TeacherCard";
import Alert from "@/app/components/elements/alert/Alert";
import { Auth } from "@/src/app/data/local";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: 8,
  fontSize: "0.9rem",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "#555",
  marginBottom: 4,
  display: "block",
};

export default function ProfileClient() {
  // Alert
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  // Profile form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [subjects, setSubjects] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  // Password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const user = Auth.getDataUser();
    if (user) {
      const meta = user.user_metadata || user;
      setFirstName(meta.first_name || "");
      setLastName(meta.last_name || "");
      setSubjects(meta.subjects || meta.subject || "");
      setEmail(meta.email || user.email || "");
    }
  }, []);

  function showAlert(msg: string, type: "success" | "error") {
    setAlertMsg(msg);
    setAlertType(type);
    setAlertOpen(true);
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          subjects: subjects.trim(),
        },
      });
      if (error) throw error;
      showAlert("Profile updated successfully.", "success");
    } catch (err: any) {
      showAlert(err?.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 6) {
      showAlert("Password must be at least 6 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert("Passwords do not match.", "error");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showAlert("Password changed successfully.", "success");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showAlert(err?.message || "Failed to change password.", "error");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* fall through */
    }
    window.location.href = "/login";
  }

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Stack spacing={3} sx={{ padding: "1rem", maxWidth: 600 }}>
          {/* Alert */}
          <Alert
            isOpen={alertOpen}
            message={alertMsg}
            type={alertType}
            handleClose={() => setAlertOpen(false)}
          />

          {/* Title */}
          <Typography
            className="dashboard-page-title"
            style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}
          >
            Profile
          </Typography>

          {/* Profile form card */}
          <Card className="dashboard-page-card">
            <Stack spacing={2}>
              <Typography style={{ fontSize: 15, fontWeight: 600, color: "#333" }}>
                Personal Information
              </Typography>

              <Stack direction="row" spacing={2}>
                <Stack sx={{ flex: 1 }}>
                  <label style={labelStyle}>First name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    style={inputStyle}
                  />
                </Stack>
                <Stack sx={{ flex: 1 }}>
                  <label style={labelStyle}>Last name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    style={inputStyle}
                  />
                </Stack>
              </Stack>

              <Stack>
                <label style={labelStyle}>Teaching subject(s)</label>
                <input
                  type="text"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="e.g. Mathematics, Science"
                  style={inputStyle}
                />
              </Stack>

              <Stack>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  style={{ ...inputStyle, background: "#f5f5f5", color: "#888", cursor: "not-allowed" }}
                />
              </Stack>

              <Stack alignItems="flex-start">
                <Stack
                  className="dashboard-page-form-btn"
                  onClick={saving ? undefined : handleSaveProfile}
                  sx={{ cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
                >
                  <Typography className="dashboard-page-form-btn-txt">
                    {saving ? "Saving…" : "Save"}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Card>

          {/* Change Password card */}
          <Card className="dashboard-page-card">
            <Stack spacing={2}>
              <Typography style={{ fontSize: 15, fontWeight: 600, color: "#333" }}>
                Change Password
              </Typography>

              <Stack>
                <label style={labelStyle}>New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  style={inputStyle}
                />
              </Stack>

              <Stack>
                <label style={labelStyle}>Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  style={inputStyle}
                />
              </Stack>

              <Stack alignItems="flex-start">
                <Stack
                  className="dashboard-page-form-btn"
                  onClick={changingPassword ? undefined : handleChangePassword}
                  sx={{
                    cursor: changingPassword ? "not-allowed" : "pointer",
                    opacity: changingPassword ? 0.7 : 1,
                  }}
                >
                  <Typography className="dashboard-page-form-btn-txt">
                    {changingPassword ? "Changing…" : "Change password"}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Card>

          {/* Logout */}
          <Stack alignItems="flex-start">
            <Typography
              onClick={handleLogout}
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#e53935",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              Log out
            </Typography>
          </Stack>
        </Stack>
      </TeacherCard>
    </ContentLayout>
  );
}
