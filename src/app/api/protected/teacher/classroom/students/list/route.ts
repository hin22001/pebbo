import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { PageContext } from "@/src/app/api/lib/types/pagination";
import { ClassroomStudent } from "@/src/app/api/lib/types/classroomTypes";
import { Pagination } from "@/src/app/api/lib/utils/pagination";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { paginationSchema } from "@/src/app/api/lib/validation/paginationSchema";
import { z } from "zod";

export async function GET(req: Request) {
  type GetClassroomStudentsResponse = {
    students: ClassroomStudent[];
    page_context: PageContext;
  };

  const schema = paginationSchema.merge(
    z.object({
      classroom_id: z.string(),
      search: z.union([z.string(), z.literal("")]).optional(),
    })
  );

  try {
    const request = new URLAdapter(req, schema);
    request.init();

    const classroom_id = parseInt(request.getURLProperty("classroom_id"));
    if (isNaN(classroom_id)) {
      throw new Error("Invalid classroom ID");
    }

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["teacher"]);
    user.assertPaying(true);

    // Verify teacher has access to this classroom
    const classroomDAO = new ClassroomDAO(supabaseService);
    const classroomDetail = await classroomDAO.getClassroomParticipants(
      user.getSchoolId() as number,
      classroom_id,
      "teacher",
      undefined,
      auth.getUserId()
    );

    if (!classroomDetail?.count) {
      throw new Error("Teacher is not part of classroom");
    }

    // Get pagination parameters
    const pagination = new Pagination(
      request.getURLProperty("page_number"),
      request.getURLProperty("rows_per_page")
    );

    // Get students in classroom
    const studentsData = await classroomDAO.getClassroomParticipants(
      user.getSchoolId() as number,
      classroom_id,
      "student",
      pagination
    );

    // Apply search filter if provided
    let filteredStudents = studentsData.data;
    const searchTerm = request.getURLProperty("search");
    if (searchTerm && searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filteredStudents = studentsData.data.filter(
        (student) =>
          student.first_name?.toLowerCase().includes(search) ||
          student.last_name?.toLowerCase().includes(search) ||
          student.email?.toLowerCase().includes(search)
      );
    }

    const pageContext = pagination.getPageContext(
      filteredStudents.length,
      studentsData.count as number
    );

    const data: GetClassroomStudentsResponse = {
      students: filteredStudents,
      page_context: pageContext,
    };

    return ResponseWrapper.success("Success get classroom students", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed get classroom students",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
