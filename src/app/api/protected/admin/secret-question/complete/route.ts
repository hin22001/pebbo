import { NextResponse } from "next/server";
import { z } from "zod";

import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { AnswerProcessing } from "@/src/app/api/lib/processing/answerProcessing";
import { Questions } from "@/src/app/api/lib/types/questionTypes";
import { userAnswersSchema } from "@/src/app/api/lib/validation/question/userAnswerSchema";

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
  };
}

function normalizeQuestionObject(question: any) {
  const obj = question?.question_object;
  if (!obj) return question;

  if (typeof obj === "string") {
    try {
      question.question_object = JSON.parse(obj);
    } catch {
      // leave as-is
    }
  }
  return question;
}

export async function POST(req: Request) {
  let auth: any = null;

  try {
    const bodyRequest = new BodyAdapter(
      req,
      z
        .object({
          all_answers: z.array(userAnswersSchema),
        })
        .strict(),
    );
    await bodyRequest.init();

    const allAnswers = bodyRequest.getBodyProperty("all_answers") as Array<{
      question_id: number;
    }>;

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    auth = new Auth(supabase);
    await auth.init();

    // For admin preview, fetch questions directly from primary tables (with answers)
    // instead of the exercise view that strips answers.
    const uniqueIds = Array.from(
      new Set(allAnswers.map((a) => a.question_id)),
    ) as number[];

    const fetchedById = new Map<number, any>();
    for (const id of uniqueIds) {
      if (typeof id !== "number") continue;

      // Try drafts first, then primary – mirror GET /secret-question
      let rawRow: any = null;
      const { data: draftData, error: draftErr } = await supabaseService
        .from("primary_questions_drafts")
        .select("*")
        .eq("original_question_id", id)
        .limit(1)
        .maybeSingle();

      if (!draftErr && draftData) {
        rawRow = draftData;
      } else {
        const { data: primaryData, error: primaryErr } = await supabaseService
          .from("primary_questions")
          .select("*")
          .eq("id", id)
          .limit(1)
          .maybeSingle();

        if (primaryErr) throw primaryErr;
        if (primaryData) {
          rawRow = primaryData;
        }
      }

      if (!rawRow) {
        continue;
      }

      const shaped = normalizeRowToQuestionShape(rawRow, id);
      const normalized = normalizeQuestionObject(shaped);
      fetchedById.set(id, normalized);
    }

    const questions = allAnswers.map(
      (a) => fetchedById.get(a.question_id),
    ) as Questions;

    const answerProcessing = new AnswerProcessing(
      auth.getUserId(),
      allAnswers,
      questions as Questions,
    );
    answerProcessing.findAndCheckAnswers();

    const DBCompletedQuestions = answerProcessing.getDBCompletedQuestions();

    const questionsWithAccuracy = questions.map((q) => {
      const completed = DBCompletedQuestions.find(
        (cq) => cq.question_id === q.id,
      );
      return {
        ...q,
        accuracy: completed?.accuracy ?? 0,
      };
    });

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: "Success completeQuestions (secret admin preview)",
        coins_awarded: 0,
        data: questionsWithAccuracy,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[ERROR] secret-admin completeQuestions API Route:", {
      message: err.message,
      stack: err.stack,
      userId: auth?.getUserId(),
      status: err.status || 500,
    });

    return NextResponse.json(
      {
        success: false,
        status: err.status ?? 500,
        message: `Failed secret-admin completeQuestions: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}

