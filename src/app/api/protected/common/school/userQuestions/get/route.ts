import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { UserQuestionsDAO } from "@/src/app/api/lib/DAOs/userQuestionsDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { PageContext, PageParams } from "@/src/app/api/lib/types/pagination";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { paginationSchema } from "@/src/app/api/lib/validation/paginationSchema";
import { z } from "zod";

export async function GET(req: Request) {
  type GetUserQuestionsResponse = {
    userQuestions: any;
    page_context: PageContext;
  };

  try {
    const request = new URLAdapter(
      req,
      z
        .object({
          order: z.enum(["asc", "desc"]),
          question_id: z.union([z.string(), z.literal("")]).optional(),
          category: z.union([z.string(), z.literal("")]).optional(),
          subject: z.union([z.string(), z.literal("")]).optional(),
          created_by: z.union([z.string(), z.literal("")]).optional(),
          created_at_start: z.union([z.string(), z.literal("")]).optional(),
          created_at_end: z.union([z.string(), z.literal("")]).optional(),
          mutable: z.union([z.string(), z.literal("")]).optional(),
        })
        .merge(paginationSchema),
    );
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

    const userQuestionsDAO = new UserQuestionsDAO(supabaseService);
    const userQuestions = await userQuestionsDAO.get(
      user.getSchoolId() as number,
      request.getURLProperty("order"),
      pagination,
      Number(request.getURLProperty("question_id")) ?? undefined,
      request.getURLProperty("category"),
      request.getURLProperty("subject"),
      request.getURLProperty("created_by"),
      request.getURLProperty("created_at_start"),
      request.getURLProperty("created_at_end"),
      request.getURLProperty("mutable") == "true" ? true : false,
    );

    const pageContext = pagination.getPageContext(
      userQuestions.data.length,
      userQuestions.count as number,
    );

    const data: GetUserQuestionsResponse = {
      userQuestions: userQuestions.data,
      page_context: pageContext,
    };

    return ResponseWrapper.success("Success get user questions ", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed get user questions ",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
