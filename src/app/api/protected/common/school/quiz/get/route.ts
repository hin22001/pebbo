import { QuizDAO } from "@/src/app/api/lib/DAOs/quizDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { PageContext } from "@/src/app/api/lib/types/pagination";
import { GetQuizParams } from "@/src/app/api/lib/types/quizTypes";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { paginationSchema } from "@/src/app/api/lib/validation/paginationSchema";
import { z } from "zod";

export async function GET(req: Request) {
  const schema = paginationSchema.merge(
    z.object({
      quiz_id: z.union([z.string(), z.literal("")]).optional(),
      quiz_name: z.union([z.string(), z.literal("")]).optional(),
      date_created_start: z.union([z.string(), z.literal("")]).optional(),
      date_created_end: z.union([z.string(), z.literal("")]).optional(),
      start_date_start: z.union([z.string(), z.literal("")]).optional(),
      start_date_end: z.union([z.string(), z.literal("")]).optional(),
      end_date_start: z.union([z.string(), z.literal("")]).optional(),
      end_date_end: z.union([z.string(), z.literal("")]).optional(),
    }),
  );

  type GetQuizResponse = {
    quizzes: any;
    page_context: PageContext;
  };

  try {
    const request = new URLAdapter(req, schema);
    request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["teacher", "admin"]);
    user.assertPaying(true);

    const pagination = new Pagination(
      request.getURLProperty("page_number"),
      request.getURLProperty("rows_per_page"),
    );

    const quizDAO = new QuizDAO(supabaseService);
    const quizData = await quizDAO.get(
      user.getSchoolId() as number,
      pagination,
      Number(request.getURLProperty("quiz_id")) ?? undefined,
      request.getURLProperty("quiz_name"),
      request.getURLProperty("date_created_start"),
      request.getURLProperty("date_created_end"),
      request.getURLProperty("start_date_start"),
      request.getURLProperty("start_date_end"),
      request.getURLProperty("end_date_start"),
      request.getURLProperty("end_date_end"),
    );

    const pageContext = pagination.getPageContext(
      quizData.data.length,
      quizData.count as number,
    );

    const data: GetQuizResponse = {
      quizzes: quizData.data,
      page_context: pageContext,
    };

    return ResponseWrapper.success("Success get quiz", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed get quiz",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
