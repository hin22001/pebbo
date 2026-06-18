import { NextResponse } from "next/server";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { StudentDAO } from "@/src/app/api/lib/DAOs/studentDAO";
import { DefaultStudentData } from "@/src/app/api/lib/defaults/studentData";
import { ArrayHelper } from "@/src/app/api/lib/utils/arrayHelper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";

export const dynamic = "force-dynamic";

const PLACEMENT_QUESTION_IDS = [
  55, 845, 578, 118, 261, 177, 198, 2375, 343, 936,
];
const PLACEMENT_QUESTION_COUNT = PLACEMENT_QUESTION_IDS.length;

function pickQuestionObjectFromRow(row: any) {
  if (!row || typeof row !== "object") return undefined;
  return (
    row.question_object ??
    row.question_object_en ??
    row.question_object_zh ??
    row.questionObject ??
    row.question ??
    row.question_json ??
    row.questionJson ??
    row.question_data ??
    row.questionData ??
    undefined
  );
}

function normalizeRowToQuestionShape(row: any): any {
  if (!row || typeof row !== "object") return null;

  const questionId =
    typeof row.question_id === "number"
      ? row.question_id
      : typeof row.original_question_id === "number"
        ? row.original_question_id
        : typeof row.questionId === "number"
          ? row.questionId
          : typeof row.id === "number"
            ? row.id
            : undefined;

  const questionObject = pickQuestionObjectFromRow(row);

  return {
    ...(row || {}),
    // Placement UI expects `id` to be the question id.
    id: questionId ?? row.id,
    question_object: questionObject ?? row.question_object,
  };
}

/**
 * Strip answers/explanations from a question object (Tiptap JSON) in-place.
 */
function stripAnswers(question: any): any {
  const stack = [question.question_object];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (current.content) {
      for (const child of current.content) {
        stack.push(child);
      }
    }

    if (current.attrs) {
      if (current.attrs.isCorrect !== undefined) {
        delete current.attrs.isCorrect;
      }

      if (current.attrs.explanation !== undefined) {
        current.attrs.explanation = "";
      }

      if (current.attrs.answer !== undefined) {
        current.attrs.answer = "";
      }

      if (current.attrs.answers !== undefined) {
        // For placement, never reveal which options are correct or any explanation.
        // Just clear the answers array entirely so the dropdown behaves as a fresh input.
        current.attrs.answers = "[]";
        current.attrs.multiple = false;
      }
    }
  }

  return question;
}

function normalizeQuestionObject(question: any) {
  const obj = question?.question_object;
  if (!obj) return question;

  // Some queries return JSON columns as strings depending on driver/settings.
  if (typeof obj === "string") {
    try {
      question.question_object = JSON.parse(obj);
    } catch {
      // leave as-is; RichText will render empty but we prefer not to throw here
    }
  }
  return question;
}

export async function GET(req: Request) {
  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    try {
      await auth.init();
    } catch (authErr: any) {
      console.error("Auth initialization failed in placement getQuestions:", {
        message: authErr.message,
        status: authErr.status,
      });

      // If we got a 401, let's log the cookies to see if the session is there
      const cookieStore = (await import("next/headers")).cookies();
      const allCookies = cookieStore.getAll();
      console.log(
        "Current cookies in placement getQuestions:",
        allCookies.map((c) => c.name),
      );

      throw authErr;
    }

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["student"]);

    const studentDAO = new StudentDAO(supabaseService);
    const context = await studentDAO.getContext(auth.getUserId());

    const { education_level, year } = context;
    DefaultStudentData.assertContext(education_level, String(year));

    // Prefer drafts (by question_id), then fallback to primary_questions (by id).
    // Note: In drafts table, the question id is stored in `original_question_id` (not the row `id`).
    let draftRows: any[] = [];
    try {
      const { data, error } = await supabaseService
        .from("primary_questions_drafts")
        .select("*")
        .in("original_question_id", PLACEMENT_QUESTION_IDS);
      if (!error && Array.isArray(data)) {
        draftRows = data;
      }
    } catch {
      draftRows = [];
    }

    const draftByQuestionId = new Map<number, any>();
    for (const row of draftRows) {
      const qid = row?.original_question_id;
      if (typeof qid === "number") {
        draftByQuestionId.set(qid, row);
      }
    }

    const missingIds = PLACEMENT_QUESTION_IDS.filter(
      (id) => !draftByQuestionId.has(id),
    );

    const { data: primaryRows, error: primaryErr } = await supabaseService
      .from("primary_questions")
      .select("*")
      .in("id", missingIds.length > 0 ? missingIds : [-1]);

    if (primaryErr) throw primaryErr;

    const primaryById = new Map<number, any>();
    for (const row of primaryRows || []) {
      const id = row?.id;
      if (typeof id === "number") {
        primaryById.set(id, row);
      }
    }

    const combined = PLACEMENT_QUESTION_IDS.map((qid) => {
      const draft = draftByQuestionId.get(qid);
      if (draft) return { ...draft, question_id: qid };
      return primaryById.get(qid) || null;
    }).filter(Boolean);

    if (!combined.length) {
      throw new FlexibleError("No questions found for this grade level", 500);
    }

    const shaped = combined.map(normalizeRowToQuestionShape);

    // Normalize JSON columns, then shuffle and strip correctness/explanations
    console.log(
      "🔍 [placement/getQuestions] shaped count:",
      shaped?.length,
      "drafts:",
      draftByQuestionId.size,
      "primary:",
      primaryById.size,
    );
    console.log(
      "🔍 [placement/getQuestions] shaped[0] keys:",
      shaped?.[0] ? Object.keys(shaped[0]) : "no data",
    );
    console.log(
      "🔍 [placement/getQuestions] shaped[0].question_object type:",
      typeof shaped?.[0]?.question_object,
    );

    const shuffled = ArrayHelper.shuffleArray(shaped as any[]);
    const normalized = shuffled.map(normalizeQuestionObject);
    console.log(
      "🔍 [placement/getQuestions] after normalize, [0].question_object type:",
      typeof normalized?.[0]?.question_object,
    );

    const processed = normalized.map(stripAnswers);
    console.log(
      "🔍 [placement/getQuestions] processed[0].question_object snippet:",
      JSON.stringify(processed?.[0]?.question_object)?.slice(0, 300),
    );

    return NextResponse.json(
      {
        status: 200,
        message: "Questions fetched successfully",
        data: processed,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Error in placement getQuestions:", err);
    return NextResponse.json(
      {
        status: err.status || 500,
        message: err.message || "Internal Server Error",
      },
      { status: err.status || 500 },
    );
  }
}
