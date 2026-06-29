import { QuestionDAO } from "@/src/app/api/lib/DAOs/questionDAO";
import { StudentDAO } from "@/src/app/api/lib/DAOs/studentDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { AnswerProcessing } from "@/src/app/api/lib/processing/answerProcessing";
import { ScoreProcessing } from "@/src/app/api/lib/processing/scoreProcessing";
import { Questions } from "@/src/app/api/lib/types/questionTypes";
import { userAnswersSchema } from "@/src/app/api/lib/validation/question/userAnswerSchema";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  let auth: any = null;
  try {
    const bodyRequest = new BodyAdapter(
      req,
      z
        .object({
          all_answers: z.array(userAnswersSchema),
        })
        .strict()
    );
    await bodyRequest.init();
    const urlRequest = new URLAdapter(
      req,
      z.object({ region: z.string() }).strict()
    );
    urlRequest.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();
    console.log(`[DEBUG] Supabase clients initialized`);

    auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["student"]);
    user.assertPaying(true);

    const questionDAO = new QuestionDAO(supabaseService);

    const questions = await questionDAO.getAttemptingQuestions(
      auth.getUserId(),
      urlRequest.getURLProperty("region")
    );

    const answerProcessing = new AnswerProcessing(
      auth.getUserId(),
      bodyRequest.getBodyProperty("all_answers"),
      questions as Questions
    );
    answerProcessing.findAndCheckAnswers();
    console.log(`[DEBUG] Answer processing completed`);

    const DBCompletedQuestions = answerProcessing.getDBCompletedQuestions();

    const studentDAO = new StudentDAO(supabaseService);
    const studentScoreData = await studentDAO.getScoresUsingContext(
      auth.getUserId()
    );
    console.log(`[DEBUG] Student score data retrieved`);

    const education_level = studentScoreData.education_level;
    const year = studentScoreData.year;
    const currentScore = studentScoreData.current_scores;

    // Consolidated call: process completed questions and get award/balance in one trip
    const { coins_awarded: coinsAwarded, total_coins: totalCoinsAfter } =
      await questionDAO.processCompletedQuestions(
        auth.getUserId(),
        currentScore,
        DBCompletedQuestions,
        education_level,
        year
      );

    const questionsWithAccuracy = questions.map((q) => {
      const completed = DBCompletedQuestions.find(
        (cq) => cq.question_id === q.id
      );
      return {
        ...q,
        accuracy: completed?.accuracy ?? 0,
      };
    });

    // Stars are updated inside the RPC above (students.stars). Read the fresh
    // value so the client can update the navbar star chip instantly, the same
    // way it does for coins.
    const { data: starRow } = await supabaseService
      .from("students")
      .select("stars")
      .eq("user_id", auth.getUserId())
      .single();
    const totalStarsAfter = Number(starRow?.stars ?? 0);

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: `Success completeQuestions`,
        coins_awarded: coinsAwarded,
        // Authoritative DB balances AFTER this submission. Clients reconcile the
        // coin/star chips to these absolute values rather than adding locally.
        total_coins: totalCoinsAfter,
        total_stars: totalStarsAfter,
        data: questionsWithAccuracy,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[ERROR] completeQuestions API Route:", {
      message: err.message,
      stack: err.stack,
      userId: auth?.getUserId(),
      status: err.status || 500,
    });

    return NextResponse.json(
      {
        success: false,
        status: err.status ?? 500,
        message: `Failed completeQuestions: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 }
    );
  }
}
