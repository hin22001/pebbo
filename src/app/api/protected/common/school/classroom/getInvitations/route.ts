import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { PageContext } from "@/src/app/api/lib/types/pagination";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { paginationSchema } from "@/src/app/api/lib/validation/paginationSchema";
import { z } from "zod";

export async function GET(req: Request) {
  type GetInvitationsResponse = {
    invitations: any;
    page_context: PageContext;
  };

  try {
    const request = new URLAdapter(
      req,
      paginationSchema.extend({ order: z.string() }),
    );
    request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();

    const auth = new Auth(supabase);
    await auth.init();

    const supabaseService = _supabase.getServiceClient();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["student", "teacher"]);
    user.assertPaying(true);

    const pagination = new Pagination(
      request.getURLProperty("page_number"),
      request.getURLProperty("rows_per_page"),
    );

    const classroomDAO = new ClassroomDAO(supabaseService);

    const invitations = await classroomDAO.getInvitations(
      auth.getUserId(),
      request.getURLProperty("order"),
      pagination,
    );

    const pageContext = pagination.getPageContext(
      invitations.data.length,
      invitations.count as number,
    );

    const data: GetInvitationsResponse = {
      invitations: invitations.data,
      page_context: pageContext,
    };

    return ResponseWrapper.success("Success get classroom invitations", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed get classroom invitations",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
