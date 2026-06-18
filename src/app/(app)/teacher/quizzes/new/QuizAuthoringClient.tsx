"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import TeacherCard from "@/app/components/modules/card/TeacherCard";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";
import Alert from "@/app/components/elements/alert/Alert";
import CategoryHelpers from "@/app/utils/CategoryHelpers";
import QuizGeneratorPanel from "../components/QuizGeneratorPanel";
import GeneratedQuestionList from "../components/GeneratedQuestionList";
import QuizPreview from "../components/QuizPreview";

// Region (en/zh) is auto-injected into every request's query by
// ConnectionManager.stream as the current UI language, so the client never
// passes it — the teacher routes read it from the query (parity with students).

type Candidate = {
  key: string;
  source: "generated" | "existing";
  primaryId?: number;
  uqId?: number;
  outer_category: number | null;
  difficulty: number | null;
  categoryName: string;
  question_object: any;
};

interface Props {
  quizId?: string;
  isEdit?: boolean;
}

export default function QuizAuthoringClient({ quizId, isEdit }: Props) {
  const router = useRouter();

  const [quizName, setQuizName] = useState("");
  const [year, setYear] = useState<number>(3);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>([]);
  const [count, setCount] = useState<number | "">(5);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [requestedCount, setRequestedCount] = useState<number | null>(null);
  const [loadedExistingIds, setLoadedExistingIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(!!isEdit);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  const categoryOptions = useMemo(
    () => (CategoryHelpers.getRefactorCategory(year) as any[]) || [],
    [year]
  );

  function notify(msg: string, type: "success" | "error") {
    setAlertMsg(msg);
    setAlertType(type);
    setAlertOpen(true);
  }

  // Category ids differ per year, so clear the selection when the year changes.
  function handleYearChange(y: number) {
    setYear(y);
    setSelectedCategories([]);
  }

  function categoryNameFor(outerCategory: number | null): string {
    if (outerCategory == null) return "Question";
    const match = categoryOptions.find((c) => Number(c.id) === outerCategory);
    return match?.label || `Category ${outerCategory}`;
  }

  useEffect(() => {
    if (isEdit && quizId) loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, quizId]);

  async function loadQuiz() {
    setLoading(true);
    try {
      const res = await TeacherAPI.getQuizQuestions({
        quiz_id: quizId,
        page_number: 1,
        rows_per_page: 200,
      });
      setQuizName(res?.quiz_name || "");
      const qs = Array.isArray(res?.questions) ? res.questions : [];
      const existing: Candidate[] = qs.map((q: any, i: number) => ({
        key: `ex-${q.question_id}-${i}`,
        source: "existing",
        uqId: q.question_id,
        outer_category: q.category != null ? Number(q.category) : null,
        difficulty: null,
        categoryName: "Saved question",
        question_object: q.question_object ?? null,
      }));
      setCandidates(existing);
      setLoadedExistingIds(existing.map((c) => c.uqId as number));
    } catch (err) {
      console.error("[QuizAuthoring] loadQuiz error:", err);
      notify("Failed to load quiz.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    if (selectedCategories.length === 0 || selectedDifficulties.length === 0) {
      notify("Pick at least one category and one difficulty.", "error");
      return;
    }
    const n = typeof count === "number" ? count : 5;
    setGenerating(true);
    setRequestedCount(n);
    try {
      const res = await TeacherAPI.generateQuiz(
        {},
        {
          year,
          categories: selectedCategories,
          difficulties: selectedDifficulties,
          count: n,
        }
      );
      const qs = Array.isArray(res?.questions) ? res.questions : [];
      const generated: Candidate[] = qs.map((q: any, i: number) => ({
        key: `gen-${q.id}-${i}`,
        source: "generated",
        primaryId: q.id,
        outer_category: q.outer_category,
        difficulty: q.difficulty,
        categoryName: categoryNameFor(q.outer_category),
        question_object: q.question_object,
      }));
      // (Re)generate replaces the generated set; existing (edit) questions stay.
      setCandidates((prev) => [
        ...prev.filter((c) => c.source === "existing"),
        ...generated,
      ]);
      if (qs.length === 0) notify("No questions matched those filters.", "error");
    } catch (err) {
      console.error("[QuizAuthoring] generate error:", err);
      notify("Failed to generate questions.", "error");
    } finally {
      setGenerating(false);
    }
  }

  function handleRemove(key: string) {
    setCandidates((prev) => prev.filter((c) => c.key !== key));
  }

  async function handleSave() {
    if (!quizName.trim()) {
      notify("Please enter a quiz name.", "error");
      return;
    }
    if (candidates.length === 0) {
      notify("Generate at least one question before saving.", "error");
      return;
    }
    // A quiz holds at most 15 questions (enforced server-side in addQuestions).
    // Guard BEFORE any mutation: the edit save fires editQuiz → remove → add as
    // three separate, non-atomic calls. Letting an over-cap set through would
    // persist the name + removals and then throw on the add — a partial write
    // with an unrecoverable retry. candidates.length is exactly the post-save
    // question count (kept existing + generated), so it mirrors the server cap.
    if (candidates.length > 15) {
      notify(
        `A quiz can have at most 15 questions (this has ${candidates.length}). Remove ${
          candidates.length - 15
        } before saving.`,
        "error"
      );
      return;
    }
    setSaving(true);
    try {
      if (isEdit && quizId) {
        await TeacherAPI.editQuiz({}, { quiz_id: quizId, quiz_name: quizName.trim() });

        const keptExisting = candidates
          .filter((c) => c.source === "existing")
          .map((c) => c.uqId as number);
        const removedExisting = loadedExistingIds.filter(
          (id) => !keptExisting.includes(id)
        );
        const newGenerated = candidates
          .filter((c) => c.source === "generated")
          .map((c) => c.primaryId as number);

        if (removedExisting.length > 0) {
          await TeacherAPI.removeQuestionsFromQuiz(
            {},
            { quiz_id: quizId, question_ids: removedExisting }
          );
        }
        if (newGenerated.length > 0) {
          await TeacherAPI.addQuestionsToQuiz(
            {},
            { quiz_id: quizId, question_ids: newGenerated }
          );
        }
      } else {
        const ids = candidates
          .filter((c) => c.source === "generated")
          .map((c) => c.primaryId as number);
        const now = new Date();
        const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        await TeacherAPI.createQuiz(
          {},
          {
            quiz_name: quizName.trim(),
            start_date: now.toISOString(),
            end_date: end.toISOString(),
            question_type: "specific",
            question_ids: ids,
          }
        );
      }
      notify("Quiz saved.", "success");
      setTimeout(() => router.push("/teacher/quizzes"), 1000);
    } catch (err) {
      console.error("[QuizAuthoring] save error:", err);
      notify("Failed to save quiz. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!quizId) return;
    if (!window.confirm("Delete this quiz? This cannot be undone.")) return;
    try {
      await TeacherAPI.deleteQuiz({ quiz_id: quizId });
      router.push("/teacher/quizzes");
    } catch (err) {
      notify("Failed to delete quiz.", "error");
    }
  }

  if (loading) {
    return (
      <ContentLayout title="" hideTitle={true}>
        <TeacherCard>
          <Stack spacing={2} sx={{ padding: "1rem" }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rounded" height={56} />
            ))}
          </Stack>
        </TeacherCard>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Stack spacing={2.5} sx={{ padding: "1rem" }}>
          <Alert
            isOpen={alertOpen}
            message={alertMsg}
            type={alertType}
            handleClose={() => setAlertOpen(false)}
          />

          <Typography
            onClick={() => router.push("/teacher/quizzes")}
            style={{ fontSize: 13, color: "#8264ff", cursor: "pointer", width: "fit-content" }}
          >
            ← My Quizzes
          </Typography>

          <Typography
            className="dashboard-page-title"
            style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}
          >
            {isEdit ? "Edit Quiz" : "New Quiz"}
          </Typography>

          {/* Step 1 — Name */}
          <Card className="dashboard-page-card" sx={{ margin: 0 }}>
            <Typography
              style={{ fontSize: 16, fontWeight: 600, color: "#565656", marginBottom: 14 }}
            >
              Name your quiz
            </Typography>
            <TextField
              label="Quiz name"
              variant="outlined"
              size="small"
              fullWidth
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#8264ff",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#8264ff" },
              }}
            />
          </Card>

          {/* Step 2 — Generate */}
          <QuizGeneratorPanel
            year={year}
            setYear={handleYearChange}
            categoryOptions={categoryOptions}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedDifficulties={selectedDifficulties}
            setSelectedDifficulties={setSelectedDifficulties}
            count={count}
            setCount={setCount}
            onGenerate={handleGenerate}
            generating={generating}
          />

          {/* Step 3 — Review */}
          <GeneratedQuestionList
            candidates={candidates}
            requestedCount={requestedCount}
            generating={generating}
            onRegenerate={handleGenerate}
            onRemove={handleRemove}
            onPreview={() => setShowPreview(true)}
          />

          {/* Step 4 — Save */}
          <Card className="dashboard-page-card" sx={{ margin: 0 }}>
            <Typography
              style={{ fontSize: 16, fontWeight: 600, color: "#565656", marginBottom: 16 }}
            >
              Save quiz
            </Typography>
            {candidates.length > 15 && (
              <Typography style={{ fontSize: 12, color: "#d32f2f", marginBottom: 8 }}>
                This quiz has {candidates.length} questions; the maximum is 15. Remove{" "}
                {candidates.length - 15} to save.
              </Typography>
            )}
            <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
              <Stack
                className={saving ? "dashboard-page-form-btn-disabled" : "dashboard-page-form-btn"}
                onClick={() => !saving && handleSave()}
                sx={{ cursor: saving ? "default" : "pointer" }}
              >
                <Typography className="dashboard-page-form-btn-txt">
                  {saving ? "Saving…" : "Save to My Quizzes"}
                </Typography>
              </Stack>
              {isEdit && (
                <Typography
                  onClick={handleDelete}
                  style={{ fontSize: 13, color: "#d32f2f", cursor: "pointer", marginLeft: 8 }}
                >
                  Delete quiz
                </Typography>
              )}
            </Stack>
          </Card>
        </Stack>
      </TeacherCard>

      {showPreview && (
        <QuizPreview candidates={candidates} onClose={() => setShowPreview(false)} />
      )}
    </ContentLayout>
  );
}
