import { NextResponse } from "next/server";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";

export const dynamic = "force-dynamic";

function normalizeRowToQuestionShape(row: any, questionId: number): any {
  if (!row || typeof row !== "object") return null;

  const questionObject =
    row.question_object ??
    row.question_object_en ??
    row.question_object_zh ??
    row.questionObject ??
    row.question ??
    row.question_json ??
    row.questionJson ??
    row.question_data ??
    row.questionData ??
    undefined;

  return {
    ...row,
    id: questionId,
    question_object: questionObject ?? row.question_object,
    explanation: undefined,
    correct_answer: undefined,
    correct_answers: undefined,
    answers_json: undefined,
  };
}

function normalizeQuestionObject(question: any) {
  const obj = question?.question_object;
  if (!obj) return question;

  // Some queries return JSON columns as strings depending on driver/settings.
  if (typeof obj === "string") {
    try {
      question.question_object = JSON.parse(obj);
    } catch {
      // leave as-is
    }
  }
  return question;
}

function stripAnswersFromContent(content: any): any {
  if (!content) return content;
  if (Array.isArray(content)) {
    return content.map(stripAnswersFromContent);
  }
  if (typeof content === "object") {
    const newObj = { ...content };
    
    // Nodes that hold answer data
    if (["dropdown", "textfield", "fractionField"].includes(newObj.type)) {
      if (newObj.attrs) {
        newObj.attrs = {
          ...newObj.attrs,
          // Clear answer-related attributes
          answers: "[]",
          explanation: "",
          isCorrect: undefined,
          value: undefined,
        };
      }
    }

    if (newObj.content) {
      newObj.content = stripAnswersFromContent(newObj.content);
    }
    return newObj;
  }
  return content;
}

function injectImageApproved(content: any, imageApproved: boolean): any {
  if (!content) return content;
  if (Array.isArray(content)) {
    return content.map((c) => injectImageApproved(c, imageApproved));
  }
  if (typeof content === "object") {
    const node = { ...content };
    if (node.type === "SvgReactComponent") {
      node.attrs = {
        ...(node.attrs || {}),
        image_approved: !!imageApproved,
      };
    }
    if (node.content) {
      node.content = injectImageApproved(node.content, imageApproved);
    }
    return node;
  }
  return content;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const question_id_param = searchParams.get("question_id");

    if (!question_id_param) {
      return NextResponse.json(
        { status: 400, message: "Missing question_id parameter" },
        { status: 400 },
      );
    }

    const question_id = parseInt(question_id_param, 10);
    if (isNaN(question_id)) {
      return NextResponse.json(
        { status: 400, message: "Invalid question_id format (must be a number)" },
        { status: 400 },
      );
    }

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    try {
      await auth.init();
    } catch (authErr: any) {
      console.error("Auth init failed in secretadmin getQuestion:", authErr);
      throw authErr;
    }

    // Try finding it in drafts first
    let rawRow = null;
    const { data: draftData, error: draftErr } = await supabaseService
      .from("primary_questions_drafts")
      .select("*")
      .eq("original_question_id", question_id)
      .limit(1)
      .maybeSingle();

    if (!draftErr && draftData) {
      rawRow = draftData;
    } else {
      // Fallback to primary
      const { data: primaryData, error: primaryErr } = await supabaseService
        .from("primary_questions")
        .select("*")
        .eq("id", question_id)
        .limit(1)
        .maybeSingle();

      if (primaryErr) throw primaryErr;
      if (primaryData) {
        rawRow = primaryData;
      }
    }

    if (!rawRow) {
      return NextResponse.json(
        { status: 404, message: "Question not found" },
        { status: 404 },
      );
    }

    const shaped = normalizeRowToQuestionShape(rawRow, question_id);
    const normalized = normalizeQuestionObject(shaped);

    // Inject image_approved flag into SvgReact nodes so PNGs can render,
    // then strip answers for the initial student-view preview.
    if (normalized.question_object) {
      normalized.question_object = injectImageApproved(
        normalized.question_object,
        !!rawRow.image_approved,
      );
      normalized.question_object = stripAnswersFromContent(
        normalized.question_object,
      );
    }

    return NextResponse.json(
      {
        status: 200,
        message: "Question fetched successfully",
        data: normalized,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Error in secret admin getQuestion:", err);
    return NextResponse.json(
      {
        status: err.status || 500,
        message: err.message || "Internal Server Error",
      },
      { status: err.status || 500 },
    );
  }
}
