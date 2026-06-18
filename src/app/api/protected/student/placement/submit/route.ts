import { NextResponse } from "next/server";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { StudentDAO } from "@/src/app/api/lib/DAOs/studentDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import _ from "lodash";

/**
 * Traverse Tiptap JSON and extract nodes that have an 'answer' or 'answers' attribute.
 * Handles JSON-encoded answers and escaped strings.
 */
function extractCorrectAnswers(data: any): any[] {
  try {
    const stack = [JSON.parse(JSON.stringify(data || {}))];
    const results: any[] = [];

    while (stack.length > 0) {
      const current = stack.pop();

      if (current.content && Array.isArray(current.content)) {
        for (let i = current.content.length - 1; i >= 0; i--) {
          stack.push(current.content[i]);
        }
      }

      if (current.attrs) {
        const rawAnswer = current.attrs.answer ?? current.attrs.answers;
        if (rawAnswer !== undefined) {
          let parsedValue = rawAnswer;

          // Handle double-encoded JSON or escaped strings
          if (typeof rawAnswer === "string") {
            const trimmed = rawAnswer.trim();
            if (
              trimmed.startsWith("[") ||
              trimmed.startsWith("{") ||
              trimmed.startsWith('"')
            ) {
              try {
                let attempt = JSON.parse(trimmed);
                // Sometimes it's double-escaped in the DB
                if (
                  typeof attempt === "string" &&
                  (attempt.startsWith("[") || attempt.startsWith("{"))
                ) {
                  attempt = JSON.parse(attempt);
                }
                parsedValue = attempt;
              } catch (e) {
                // Fallback to raw
              }
            }
          }

          results.push({
            value: parsedValue,
            type: current.type,
            id: current.attrs.id,
          });
        }
      }
    }

    return results;
  } catch (err) {
    console.error("Error extracting answers:", err);
    return [];
  }
}

/**
 * Normalizes a value for comparison (removing quotes, trimming, lowercase).
 */
function normalize(val: any): string {
  if (val === null || val === undefined) return "";
  let s = String(val);
  // Remove surrounding literal quotes if they exist (e.g. "\"335\"" -> "335")
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1);
  }
  return s.trim().toLowerCase();
}

/**
 * Extracts a comparable value from a potentially complex answer object.
 */
function getComparableValue(obj: any): any {
  if (obj === null || obj === undefined) return "";
  if (typeof obj !== "object") return obj;
  // Handle dropdown/choice objects like {id: "1", label: "Answer A"}
  return obj.label || obj.value || obj.id || "";
}

/**
 * Check if user's answer matches the correct answer for a question.
 */
function checkAnswer(userAnswer: any[], correctAnswer: any[]): boolean {
  if (!userAnswer || !correctAnswer || correctAnswer.length === 0) return false;

  // Ensure userAnswer is an array and check for structural mismatch
  if (!Array.isArray(userAnswer) || userAnswer.length !== correctAnswer.length)
    return false;

  let correctCount = 0;

  for (let i = 0; i < correctAnswer.length; i++) {
    const correct = correctAnswer[i];

    // 1. Try to find match by ID
    let match: any = null;
    if (correct.id) {
      match = userAnswer.find(
        (u) => u.id && String(u.id) === String(correct.id),
      );
    }

    // 2. Fallback to index matching (positional)
    if (!match) {
      match = userAnswer[i];
    }

    if (match) {
      const uVal = normalize(getComparableValue(match.value));

      if (Array.isArray(correct.value)) {
        // Port of exercise-page fix (aa5fbed + 82f571a):
        // Only compare against checked=true answers — NOT all options.
        // Without this, any dropdown option (including wrong ones) would be accepted.
        const checkedCorrects = correct.value.filter(
          (c: any) => c.checked === true || c.checked === undefined,
        );
        const isMatch = checkedCorrects.some((c: any) => {
          const cVal = normalize(getComparableValue(c));
          return uVal === cVal && uVal !== "";
        });
        if (isMatch) correctCount++;
      } else {
        const cVal = normalize(getComparableValue(correct.value));
        if (uVal === cVal && uVal !== "") {
          correctCount++;
        }
      }
    }
  }

  // Question is correct only if ALL its interactive sub-nodes were answered correctly
  return correctCount >= correctAnswer.length;
}

export async function POST(req: Request) {
  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["student"]);

    const body = await req.json();
    const { answers } = body; // { [questionId]: [{ value, type, id }] }

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { message: "No answers provided" },
        { status: 400 },
      );
    }

    const questionIds = Object.keys(answers).map((id) => parseInt(id));

    // Fetch correct answers from DB
    const { data: questionsData, error: fetchError } = await supabaseService
      .from("primary_questions")
      .select("id, question_object_en")
      .in("id", questionIds);

    if (fetchError || !questionsData) {
      throw new Error("Failed to fetch validation data");
    }

    let score = 0;
    const total = questionIds.length;
    const correctQuestionIds: number[] = [];
    const evaluationDetails: any = {
      userAnswers: answers,
      results: [],
    };

    for (const qData of questionsData) {
      const userAns = answers[qData.id];
      const correctNodes = extractCorrectAnswers(qData.question_object_en);
      const isCorrect = checkAnswer(userAns, correctNodes);

      if (isCorrect) {
        score++;
        correctQuestionIds.push(qData.id);
      }

      evaluationDetails.results.push({
        questionId: qData.id,
        isCorrect,
        correctAnswers: correctNodes,
        userAnswer: userAns,
      });
    }

    // Get student's grade level
    const { data: studentData } = await supabaseService
      .from("students")
      .select("year")
      .eq("user_id", auth.getUserId())
      .single();

    const gradeLevel = String(studentData?.year ?? "4");

    // Mark onboarding as complete
    const studentDAO = new StudentDAO(supabaseService);
    await studentDAO.completeOnboarding(auth.getUserId());

    // Insert result
    const { data: insertData, error: insertError } = await supabaseService
      .from("placement_test_results")
      .insert({
        user_id: auth.getUserId(),
        grade_level: gradeLevel,
        score,
        total_questions: total,
        details: evaluationDetails, // Store trace for debugging
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const uniqueCorrectQuestionIds = Array.from(new Set(correctQuestionIds));
    const { data: rewardData, error: rewardError } = await supabaseService.rpc(
      "process_placement_rewards",
      {
        p_user_id: auth.getUserId(),
        p_correct_question_ids: uniqueCorrectQuestionIds,
        p_placement_result_id: insertData.id,
      },
    );
    if (rewardError) throw rewardError;

    const rewardRow = Array.isArray(rewardData) ? rewardData[0] : rewardData;
    const coinsAwardedThisAttempt = Number(rewardRow?.coins_awarded ?? 0);
    const starsAwardedThisAttempt = Number(rewardRow?.stars_awarded ?? 0);
    const totalCoinsAfter = Number(rewardRow?.total_coins ?? 0);
    const totalStarsAfter = Number(rewardRow?.total_stars ?? 0);

    // Calculate percentile
    const { data: percentile, error: rpcError } = await supabaseService.rpc(
      "calculate_placement_percentile",
      { p_score: score, p_grade_level: gradeLevel },
    );

    let finalPercentile = 50.0;
    if (!rpcError && percentile !== null) {
      finalPercentile = percentile;
      await supabaseService
        .from("placement_test_results")
        .update({ percentile: finalPercentile })
        .eq("id", insertData.id);
    }

    return NextResponse.json(
      {
        status: 200,
        message: "Test submitted successfully",
        data: {
          score,
          total,
          percentile: finalPercentile,
          gradeLevel,
          coinsAwardedThisAttempt,
          starsAwardedThisAttempt,
          totalCoinsAfter,
          totalStarsAfter,
        },
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Error in placement submit:", err);
    return NextResponse.json(
      {
        status: err.status || 500,
        message: err.message || "Internal Server Error",
      },
      { status: err.status || 500 },
    );
  }
}
