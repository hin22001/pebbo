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
  type GetClassroomsResponse = {
    classrooms: any[];
    page_context: PageContext;
  };

  const schema = paginationSchema.merge(
    z.object({
      search: z.union([z.string(), z.literal("")]).optional(),
      archived: z.union([z.string(), z.literal("")]).optional(),
    })
  );

  try {
    const request = new URLAdapter(req, schema);
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

    // Get pagination parameters
    const pagination = new Pagination(
      request.getURLProperty("page_number"),
      request.getURLProperty("rows_per_page")
    );

    // Get teacher's classrooms
    const classroomDAO = new ClassroomDAO(supabaseService);
    const classroomsData = await classroomDAO.getAllByUserID(
      auth.getUserId(),
      pagination
    );

    // Apply search filter if provided
    let filteredClassrooms = classroomsData.data;
    const searchTerm = request.getURLProperty("search");
    if (searchTerm && searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filteredClassrooms = classroomsData.data.filter((classroom) =>
        classroom.classroom_name?.toLowerCase().includes(search)
      );
    }

    // Apply archived filter if provided
    const archivedFilter = request.getURLProperty("archived");
    if (archivedFilter && archivedFilter !== "") {
      const showArchived = archivedFilter === "true";
      filteredClassrooms = filteredClassrooms.filter(
        (classroom) => classroom.archived === showArchived
      );
    }

    const pageContext = pagination.getPageContext(
      filteredClassrooms.length,
      classroomsData.count as number
    );

    const data: GetClassroomsResponse = {
      classrooms: filteredClassrooms,
      page_context: pageContext,
    };

    return ResponseWrapper.success("Success get teacher classrooms", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed get teacher classrooms",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
