import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { PageContext, PageParams } from "@/src/app/api/lib/types/pagination";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

export async function GET(req: Request) {
  const schema = z.object({
    page_number: z.string(),
    rows_per_page: z.string(),
    classroom_id: z.string(),
    role: z.string(),
  });

  type GetStudentsResponse = {
    students: object[];
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
    const userData = await userDAO.getUser(auth.getUserId());
    userData.assertRole(["admin"]);
    userData.assertPaying(true);

    const pagination = new Pagination(
      request.getURLProperty("page_number"),
      request.getURLProperty("rows_per_page"),
    );

    const classroomDAO = new ClassroomDAO(supabaseService);
    const students = await classroomDAO.getClassroomParticipants(
      userData.getSchoolId() as number,
      parseInt(request.getURLProperty("classroom_id")),
      request.getURLProperty("role") as "student" | "teacher",
      pagination,
    );

    const pageContext = pagination.getPageContext(
      students.data.length,
      students.count as number,
    );

    const data: GetStudentsResponse = {
      students: students.data,
      page_context: pageContext,
    };

    return ResponseWrapper.success("Success getStudents", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed getStudents",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
