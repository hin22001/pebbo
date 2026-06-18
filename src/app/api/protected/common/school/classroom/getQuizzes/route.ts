import { ClassroomQuizzesDAO } from "@/src/app/api/lib/DAOs/classroomQuizzesDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { PageParams, PageRequest } from "@/src/app/api/lib/types/pagination";
import {
  GetQuizParams,
  GetQuizRequest,
} from "@/src/app/api/lib/types/quizTypes";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { paginationSchema } from "@/src/app/api/lib/validation/paginationSchema";
import { getQuizSchema } from "@/src/app/api/lib/validation/quizSchema";

export async function GET(req: Request) {
  try {
    const request = new URLAdapter(req, getQuizSchema.merge(paginationSchema));
    request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();
    const userDAO = new UserDAO(supabaseService);
    const userData = await userDAO.getUser(auth.getUserId());
    userData.assertRole(["student", "teacher"]);
    userData.assertPaying(true);

    const pagination = new Pagination(
      request.getURLProperty("page_number"),
      request.getURLProperty("rows_per_page"),
    );

    const classroomQuizzesDAO = new ClassroomQuizzesDAO(supabaseService);
    const classroomQuizzes = await classroomQuizzesDAO.get(
      auth.getUserId(),
      Number(request.getURLProperty("classroom_id")) ?? undefined,
      Number(request.getURLProperty("quiz_id")) ?? undefined,
      request.getURLProperty("quiz_name"),
      request.getURLProperty("date_created_start"),
      request.getURLProperty("date_created_end"),
      request.getURLProperty("start_date_start"),
      request.getURLProperty("start_date_end"),
      request.getURLProperty("end_date_start"),
      request.getURLProperty("end_date_end"),
      pagination,
      request.getURLProperty("order") as "asc" | "desc",
    );

    const pageContext = pagination.getPageContext(
      classroomQuizzes.data.length,
      classroomQuizzes.count as number,
    );

    const data = {
      classroomQuizzes: classroomQuizzes.data,
      page_context: pageContext,
    };

    return ResponseWrapper.success("Success getClassrooms", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed getClassrooms",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
