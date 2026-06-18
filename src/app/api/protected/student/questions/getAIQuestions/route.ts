"server-only";

import { StudentDAO } from "@/src/app/api/lib/DAOs/studentDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { NextResponse } from "next/server";
import { ModelProcessing } from "@/src/app/api/lib/processing/modelProcessing";
import { ArrayHelper } from "@/src/app/api/lib/utils/arrayHelper";
import { PredictionProcessing } from "@/src/app/api/lib/processing/predictionProcessing";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { QuestionDAO } from "@/src/app/api/lib/DAOs/questionDAO";
import { QuestionProcessing } from "@/src/app/api/lib/processing/questionProcessing";
import { CompletedQuestionsDAO } from "@/src/app/api/lib/DAOs/completedQuestionsDAO";
import { z } from "zod";

export async function GET(req: Request) {
  console.log(
    `[DEBUG] getAIQuestions API called - ${new Date().toISOString()}`,
  );
  try {
    const request = new URLAdapter(
      req,
      z.object({
        region: z.enum(["en", "zh"]),
        enabled_categories: z.string().optional(),
      }),
    );
    request.init();
    console.log(`[DEBUG] URL validation passed`);

    // Optional override: if client passes enabled_categories, use them so we can parallelise with setCategory
    const enabledCategoriesRaw = request.getURLProperty("enabled_categories");
    const enabledCategoriesOverride =
      enabledCategoriesRaw &&
      enabledCategoriesRaw
        .split(",")
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => !Number.isNaN(n));

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();
    const supabaseService = _supabase.getServiceClient();
    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["student"]);
    user.assertPaying(true);

    const studentDAO = new StudentDAO(supabaseService);
    const data = await studentDAO.getScoresUsingContext(auth.getUserId());
    console.log(`[DEBUG] Student data retrieved:`, {
      hasData: !!data,
      enabled_categories: data?.enabled_categories,
      education_level: data?.education_level,
      year: data?.year,
    });

    const enabled_categories =
      enabledCategoriesOverride &&
      enabledCategoriesOverride.length === data.enabled_categories?.length
        ? enabledCategoriesOverride
        : data.enabled_categories;
    const education_level = data.education_level;
    const year = data.year;

    const current_score = ArrayHelper.elementWiseMultiply(
      data.current_scores,
      enabled_categories,
    );

    const completedQuestionsDAO = new CompletedQuestionsDAO(supabaseService);

    // Run model prediction and recently-completed fetch in parallel
    const [predictionResult, recentlyCompletedQuestionIds] = await Promise.all([
      (async () => {
        const modelProcessing = new ModelProcessing(education_level, year);
        await modelProcessing.init();
        const { predictedCategories, predictedDifficulties } =
          await modelProcessing.predict(current_score);
        const predictionProcessing = new PredictionProcessing(
          current_score,
          predictedCategories,
          predictedDifficulties,
        );
        return predictionProcessing.fixPredictions();
      })(),
      completedQuestionsDAO.getRecentlyCompletedQuestionIds(
        auth.getUserId(),
        14,
      ),
    ]);

    const { trueCategories, trueDifficulties } = predictionResult;

    const questionDAO = new QuestionDAO(supabaseService);
    let questions = await questionDAO.getQuestions(
      auth.getUserId(),
      request.getURLProperty("region"),
      trueCategories,
      trueDifficulties,
      year,
    );
    console.log(
      `[DEBUG] Retrieved ${questions.length} questions from database`,
    );
    console.log(`[DEBUG] Question categories:`, trueCategories);
    console.log(`[DEBUG] Question difficulties:`, trueDifficulties);
    console.log(`[DEBUG] Region:`, request.getURLProperty("region"));

    // Filter out recently completed questions before processing
    if (recentlyCompletedQuestionIds.length > 0) {
      const originalQuestionCount = questions.length;
      console.log(
        `[DEBUG] Filtering out ${recentlyCompletedQuestionIds.length} recently completed questions`,
      );
      questions = questions.filter(
        (question) => !recentlyCompletedQuestionIds.includes(question.id),
      );
      console.log(
        `[DEBUG] After filtering: ${questions.length} questions remaining (removed ${originalQuestionCount - questions.length})`,
      );

      // If filtering removes too many questions (< 3 remaining), get fresh questions
      // by temporarily extending the categories/difficulties or reducing the lookback period
      if (questions.length < 5 && originalQuestionCount > 0) {
        console.log(
          `Warning: Only ${questions.length} questions remaining after filtering out ${originalQuestionCount - questions.length} recently completed questions. Using fallback strategy.`,
        );

        // Fallback 1: Try with shorter lookback period (7 days instead of 14)
        const shorterPeriodIds =
          await completedQuestionsDAO.getRecentlyCompletedQuestionIds(
            auth.getUserId(),
            7, // 7 days lookback period
          );

        // Reset questions and filter with shorter period
        questions = await questionDAO.getQuestions(
          auth.getUserId(),
          request.getURLProperty("region"),
          trueCategories,
          trueDifficulties,
          year,
        );

        questions = questions.filter(
          (question) => !shorterPeriodIds.includes(question.id),
        );

        // If still too few, allow recently completed questions but prioritize fresh ones
        if (questions.length < 5) {
          questions = await questionDAO.getQuestions(
            auth.getUserId(),
            request.getURLProperty("region"),
            trueCategories,
            trueDifficulties,
            year,
          );

          // Sort to prioritize questions NOT in recently completed list
          questions.sort((a, b) => {
            const aIsRecent = recentlyCompletedQuestionIds.includes(a.id)
              ? 1
              : 0;
            const bIsRecent = recentlyCompletedQuestionIds.includes(b.id)
              ? 1
              : 0;
            return aIsRecent - bIsRecent;
          });
        }
      }
    }

    const questionProcessing = new QuestionProcessing(questions);

    // Debug: Add try-catch around fixQuestions to catch parsing errors
    let newQuestions;
    try {
      console.log(`[DEBUG] Starting question processing...`);
      newQuestions = questionProcessing.fixQuestions();
      console.log(`[DEBUG] Question processing completed successfully`);
    } catch (parseError) {
      console.error(`[ERROR] Question parsing failed:`, parseError);
      console.error(`[ERROR] Parse error details:`, {
        message: parseError.message,
        stack: parseError.stack,
        name: parseError.name,
      });

      // Log the problematic questions for debugging
      console.log(
        `[DEBUG] Questions that caused parsing error:`,
        JSON.stringify(questions, null, 2),
      );

      throw new Error(`Question parsing failed: ${parseError.message}`);
    }

    const questionIDs = questionProcessing.getQuestionIDs();
    console.log(`[DEBUG] Generated ${questionIDs.length} question IDs`);

    await studentDAO.setAttemptingQuestion(auth.getUserId(), questionIDs);
    console.log(
      `[DEBUG] Set attempting questions for user: ${auth.getUserId()}`,
    );

    //answers and explanation cleared but property not removed

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: `Success getAIQuestions`,
        data: newQuestions,
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        status: err.status ?? 500,
        message: `Failed getAIQuestions: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
