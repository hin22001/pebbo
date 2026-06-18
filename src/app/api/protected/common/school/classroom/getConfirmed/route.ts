import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { PageContext } from "@/src/app/api/lib/types/pagination";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { paginationSchema } from "@/src/app/api/lib/validation/paginationSchema";

export async function GET(req: Request) {
  type GetClassroomsResponse = {
    classrooms: object[];
    page_context: PageContext;
  };

  try {
    const request = new URLAdapter(req, paginationSchema);
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

    const classroomDAO = new ClassroomDAO(supabaseService);
    const classrooms = await classroomDAO.getAllByUserID(
      auth.getUserId(),
      pagination,
    );

    const pageContext = pagination.getPageContext(
      classrooms.data.length,
      classrooms.count as number,
    );

    const data: GetClassroomsResponse = {
      classrooms: classrooms.data,
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
