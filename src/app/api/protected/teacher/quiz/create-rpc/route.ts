import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { bridgeEffectiveToUserQuestions } from "@/src/app/api/lib/utils/bridgeQuizQuestions";
import { z } from "zod";

// Simplified schema for RPC function
const createQuizRPCSchema = z.object({
  quiz_name: z.string().min(1).max(100),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  question_type: z.enum(["ai_selected", "specific"]),
  question_count: z.number().optional(),
  categories: z.array(z.number()).optional(),
  difficulties: z.array(z.number()).optional(),
  year: z.number().optional(),
  region: z.enum(["en", "zh"]).optional(),
  question_ids: z.array(z.number()).optional(),
});

export async function POST(req: Request) {
  type CreateQuizResponse = {
    quiz_id: number;
    quiz_name: string;
    question_count: number;
    created_at: string;
  };

  try {
    console.log("[Quiz Create RPC] POST request received");

    // Parse request body
    const request = new BodyAdapter(req, createQuizRPCSchema);
    await request.init();

    console.log("[Quiz Create RPC] Request body parsed successfully");

    // Get authentication and user data
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["teacher"]);
    user.assertPaying(true);

    const schoolId = user.getSchoolId();
    if (!schoolId) {
      throw new FlexibleError("User does not have a school ID", 400);
    }

    // Extract data from request
    const quizName = request.getBodyProperty("quiz_name");
    const startDate = request.getBodyProperty("start_date");
    const endDate = request.getBodyProperty("end_date");
    const questionType = request.getBodyProperty("question_type");

    console.log("[Quiz Create RPC] Extracted data:", {
      quizName,
      startDate,
      endDate,
      questionType,
    });

    // Prepare parameters for RPC function
    const rpcParams: any = {
      p_quiz_name: quizName,
      p_start_date: startDate,
      p_end_date: endDate,
      p_school_id: schoolId,
      p_user_id: auth.getUserId(),
    };

    // Add parameters based on question type
    if (questionType === "specific") {
      // quiz_junction.question_id FKs to user_questions. The picker provides
      // effective-view ids (drafts-over-primary); materialize them into this
      // school's user_questions and pass the NEW ids to create_quiz.
      const primaryIds = (request.getBodyProperty("question_ids") || []) as number[];
      if (!primaryIds.length) {
        throw new FlexibleError("At least one question is required", 400);
      }
      // Region = current UI language, injected into the request query by
      // Manager.stream (same as the student getAIQuestions route).
      const region: "en" | "zh" =
        new URL(req.url).searchParams.get("region") === "zh" ? "zh" : "en";
      rpcParams.p_question_ids = await bridgeEffectiveToUserQuestions(supabaseService, {
        effectiveIds: primaryIds,
        schoolId,
        userId: auth.getUserId(),
        region,
      });
    } else {
      // ai_selected is intentionally unsupported here. create_quiz's AI branch
      // inserts primary_questions ids straight into quiz_junction, which violates
      // the quiz_junction.question_id → user_questions FK. The teacher UI never
      // sends this (it always uses "specific" with generated + bridged ids via
      // the /quiz/generate flow). Fail fast with a clear error instead of an
      // opaque FK violation; route AI selection through generate + the bridge if
      // this path is ever revived.
      throw new FlexibleError(
        "AI-selected quizzes are not supported; generate questions and save as specific.",
        400
      );
    }

    console.log(
      "[Quiz Create RPC] Calling RPC function with params:",
      rpcParams
    );

    // Call the RPC function
    const { data, error } = await supabaseService.rpc("create_quiz", rpcParams);

    if (error) {
      console.error("[Quiz Create RPC] Supabase RPC error:", error);
      throw new FlexibleError(`Failed to create quiz: ${error.message}`, 500);
    }

    console.log("[Quiz Create RPC] RPC function result:", data);

    if (!data || !data.success) {
      throw new FlexibleError(
        data?.message || "Failed to create quiz",
        data?.status || 500
      );
    }

    const response: CreateQuizResponse = data.data;

    console.log("[Quiz Create RPC] Successful response:", response);
    return ResponseWrapper.success("Quiz created successfully", response);
  } catch (err) {
    console.error("[Quiz Create RPC] Error:", err);
    return ResponseWrapper.error(
      "Failed to create quiz",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
