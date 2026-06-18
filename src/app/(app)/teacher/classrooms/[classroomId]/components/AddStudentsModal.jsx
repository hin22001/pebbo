"use client";

import React, { useRef, useState } from "react";
import {
  Box,
  Divider,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import Loader from "@/elements/loader/Loader";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 480,
  bgcolor: "#fff",
  borderRadius: "20px",
  outline: "none",
  p: 4,
};

export default function AddStudentsModal({ classroomId, onClose, onSuccess }) {
  const [emails, setEmails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  async function handleBulkAdd() {
    setError("");
    const emailList = emails
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    if (emailList.length === 0) {
      setError("Please enter at least one email address.");
      return;
    }

    setSubmitting(true);
    try {
      // The /students/bulk route is strict and REQUIRES `action`; omitting it
      // made every paste-add fail validation. add_all enrolls the listed emails.
      const res = await TeacherAPI.bulkAddStudents(
        {},
        { classroom_id: classroomId, action: "add_all", emails: emailList }
      );
      const failed = Array.isArray(res?.failedInserts) ? res.failedInserts : [];
      const added = res?.successfulInserts ?? emailList.length - failed.length;
      if (failed.length > 0) {
        // Partial success — keep the modal open so the teacher sees who was
        // skipped (only already-registered Pebbo students can be enrolled).
        onSuccess();
        setError(
          `Added ${added}. ${failed.length} not added — students must already have a Pebbo account: ${failed.join(", ")}`
        );
        return;
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to add students. Please check the emails and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTemplateDownload() {
    try {
      const res = await TeacherAPI.getUploadTemplate({
        classroom_id: classroomId,
      });
      const url = res?.url ?? res;
      if (url && typeof url === "string") {
        window.open(url, "_blank");
      }
    } catch (err) {
      setError("Failed to download template.");
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("classroom_id", classroomId);
      const res = await TeacherAPI.uploadStudents({}, formData);
      const failed = Array.isArray(res?.failedInserts) ? res.failedInserts : [];
      const added = res?.successfulInserts ?? null;
      if (failed.length > 0) {
        // Partial success — surface skipped rows instead of silently closing.
        onSuccess();
        setError(
          `${added !== null ? `Added ${added}. ` : ""}${failed.length} not added — students must already have a Pebbo account: ${failed.join(", ")}`
        );
        return;
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to upload CSV. Please check the file format and try again.");
    } finally {
      setSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <Loader isOpen={submitting} />
      <Modal open onClose={onClose}>
        <Box sx={modalStyle}>
          <Typography style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Add Students
          </Typography>

          {/* Paste emails section */}
          <Stack spacing={1}>
            <Typography style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>
              Paste email addresses
            </Typography>
            <Typography style={{ fontSize: 12, color: "#888" }}>
              One email per line, or separate with commas / semicolons.
            </Typography>
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder={"student1@school.com\nstudent2@school.com"}
              rows={5}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 13,
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <Stack
              className="dashboard-page-form-btn"
              onClick={handleBulkAdd}
              sx={{ cursor: "pointer", alignSelf: "flex-start" }}
            >
              <Typography className="dashboard-page-form-btn-txt">
                Add students
              </Typography>
            </Stack>
          </Stack>

          {/* OR divider */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ my: 2.5 }}
          >
            <Divider sx={{ flex: 1 }} />
            <Typography style={{ fontSize: 12, color: "#aaa", whiteSpace: "nowrap" }}>
              OR
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Stack>

          {/* CSV upload section */}
          <Stack spacing={1}>
            <Typography style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>
              Upload CSV
            </Typography>
            <Typography
              onClick={handleTemplateDownload}
              style={{
                fontSize: 12,
                color: "#8264ff",
                cursor: "pointer",
                textDecoration: "underline",
                width: "fit-content",
              }}
            >
              Download template
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <Stack
              className="dashboard-page-form-btn"
              onClick={() => fileInputRef.current?.click()}
              sx={{ cursor: "pointer", alignSelf: "flex-start" }}
            >
              <Typography className="dashboard-page-form-btn-txt">
                Choose CSV file
              </Typography>
            </Stack>
          </Stack>

          {/* Error */}
          {error && (
            <Typography
              style={{ fontSize: 13, color: "#d32f2f", marginTop: 12 }}
            >
              {error}
            </Typography>
          )}

          {/* Cancel */}
          <Stack sx={{ mt: 3 }}>
            <Typography
              onClick={onClose}
              style={{
                fontSize: 13,
                color: "#888",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              Cancel
            </Typography>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}
