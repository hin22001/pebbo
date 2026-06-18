import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { z } from "zod";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PAGE_SIZE = 1000;

// Moved to module scope to avoid re-creating the schema on every request.
const querySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  classroom_id: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().positive())
    .optional(),
  quiz_id: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().positive())
    .optional(),
});

type AccuracyByWeekdayResponse = {
  weekdays: Array<{
    weekday: number;
    label: string;
    average_accuracy: number;
    total_responses: number;
  }>;
  range: { start_date: string; end_date: string };
  total_responses: number;
  /** Present only when quiz_id was supplied but filtering is not yet supported. */
  note?: string;
};

export async function GET(req: Request) {
  try {
    const request = new URLAdapter(req, querySchema);
    request.init();

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

    // Resolve date range.
    // end_date / start_date are caller-facing inclusive day boundaries (YYYY-MM-DD).
    // The SQL .lt() filter requires an exclusive upper bound: we add 1 UTC day so that
    // all records on the inclusive end_date day are captured (bare dates coerce to
    // midnight UTC, which would otherwise silently drop the entire end_date day).
    const today = new Date();
    const todayISO = today.toISOString().split("T")[0]; // YYYY-MM-DD

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString().split("T")[0];

    // rawEndDate / rawStartDate are the inclusive dates exposed in the response.
    const rawEndDate = request.getURLProperty("end_date") ?? todayISO;
    const rawStartDate = request.getURLProperty("start_date") ?? thirtyDaysAgoISO;

    // endDateExclusive is the exclusive upper bound passed to .lt() in the query.
    const endDateExclusive = (() => {
      const d = new Date(rawEndDate + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() + 1);
      return d.toISOString().split("T")[0];
    })();

    const classroomId = request.getURLProperty("classroom_id");
    const quizId = request.getURLProperty("quiz_id");

    // Build the set of student user_ids scoped to this school.
    // Students do NOT have school_id in the users table — they are scoped to a
    // school via classroom_participants → classrooms.school_id. When classroom_id
    // is also provided, we narrow further to that specific classroom.
    let allowedUserIds: string[];

    if (classroomId != null) {
      // Classroom-scoped: participants of a specific classroom, which must
      // belong to the teacher's school (defense-in-depth guard via classrooms join).
      const { data: classroomParticipants, error: cpError } =
        await supabaseService
          .from("users")
          .select(
            `user_id, classroom_participants!inner(classroom_id, classrooms!inner(school_id))`,
          )
          .eq("role", "student")
          .eq("classroom_participants.classroom_id", classroomId)
          .eq("classroom_participants.classrooms.school_id", schoolId);

      if (cpError) {
        throw new FlexibleError(
          `Failed to fetch classroom participants: ${cpError.message}`,
          500,
        );
      }

      allowedUserIds = (classroomParticipants ?? []).map((p) => p.user_id);
    } else {
      // School-scoped: all students in any classroom belonging to this school.
      const { data: schoolStudents, error: spError } =
        await supabaseService
          .from("users")
          .select(
            `user_id, classroom_participants!inner(classrooms!inner(school_id))`,
          )
          .eq("role", "student")
          .eq("classroom_participants.classrooms.school_id", schoolId);

      if (spError) {
        throw new FlexibleError(
          `Failed to fetch school students: ${spError.message}`,
          500,
        );
      }

      // Deduplicate — a student may be in multiple classrooms.
      const seen = new Set<string>();
      allowedUserIds = [];
      for (const p of schoolStudents ?? []) {
        if (!seen.has(p.user_id)) {
          seen.add(p.user_id);
          allowedUserIds.push(p.user_id);
        }
      }
    }

    if (allowedUserIds.length === 0) {
      return ResponseWrapper.success(
        "Accuracy by weekday retrieved",
        buildEmptyResponse(rawStartDate, rawEndDate),
      );
    }

    // TODO: quiz_id filter is not implemented. The quiz system (quizzes → quiz_junction →
    // user_questions) uses a separate question table (user_questions) from the one referenced
    // by completed_questions (primary_questions). There is no join path between quiz_id and
    // completed_questions.question_id without a cross-table mapping that does not currently exist.

    // Fetch all completed_questions rows, chunking the user_id IN clause to
    // avoid URL length limits (PostgREST serialises .in() as query params;
    // ~37 chars/UUID means 300 UUIDs ≈ 11KB, easily hitting Vercel/nginx limits).
    // We also paginate within each chunk to bypass the 1000-row default cap.
    const UID_CHUNK_SIZE = 200;
    type CQRow = { completed_at: string; accuracy: number };
    const allRows: CQRow[] = [];

    for (let ci = 0; ci < allowedUserIds.length; ci += UID_CHUNK_SIZE) {
      const chunk = allowedUserIds.slice(ci, ci + UID_CHUNK_SIZE);
      let rangeFrom = 0;
      let hasMore = true;

      while (hasMore) {
        const { data: page, error: pageError } = await supabaseService
          .from("completed_questions")
          .select("completed_at, accuracy")
          .in("user_id", chunk)
          .gte("completed_at", rawStartDate)
          .lt("completed_at", endDateExclusive)
          .range(rangeFrom, rangeFrom + PAGE_SIZE - 1);

        if (pageError) {
          throw new FlexibleError(
            `Failed to fetch completed questions: ${pageError.message}`,
            500,
          );
        }

        const rows = (page ?? []) as CQRow[];
        allRows.push(...rows);

        if (rows.length < PAGE_SIZE) {
          hasMore = false;
        } else {
          rangeFrom += PAGE_SIZE;
        }
      }
    }

    // Aggregate by UTC weekday (0=Sunday … 6=Saturday, matches Postgres EXTRACT(DOW))
    type Bucket = { sum: number; count: number };
    const buckets: Bucket[] = Array.from({ length: 7 }, () => ({
      sum: 0,
      count: 0,
    }));

    for (const row of allRows) {
      // Bucket by UTC weekday — local-day bucketing would require per-school timezone, which we don't track yet.
      const dow = new Date(row.completed_at).getUTCDay();
      buckets[dow].sum += Number(row.accuracy);
      buckets[dow].count += 1;
    }

    const weekdays = buckets.map((b, i) => ({
      weekday: i,
      label: WEEKDAY_LABELS[i],
      average_accuracy: b.count > 0 ? b.sum / b.count : 0,
      total_responses: b.count,
    }));

    const totalResponses = allRows.length;

    const response: AccuracyByWeekdayResponse = {
      weekdays,
      range: { start_date: rawStartDate, end_date: rawEndDate },
      total_responses: totalResponses,
    };

    if (quizId != null) {
      response.note =
        "quiz_id filter not yet supported; returning data for the whole school/classroom scope.";
    }

    return ResponseWrapper.success("Accuracy by weekday retrieved", response);
  } catch (error) {
    return ResponseWrapper.error(error);
  }
}

function buildEmptyResponse(
  start_date: string,
  end_date: string,
): AccuracyByWeekdayResponse {
  return {
    weekdays: WEEKDAY_LABELS.map((label, i) => ({
      weekday: i,
      label,
      average_accuracy: 0,
      total_responses: 0,
    })),
    range: { start_date, end_date },
    total_responses: 0,
  };
}
