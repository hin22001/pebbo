import { SupabaseClient } from "@supabase/supabase-js";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { Tables } from "@/src/app/api/lib/types/supabaseTypes";
import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";
import { UserClassroomID } from "@/src/app/api/lib/types/classroomTypes";
import { Pagination } from "@/src/app/api/lib/utils/pagination";

export class ClassroomDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  /**
   *
   * @param server - expects Supabase service client
   */
  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  async create(classroom_name: string, school_id: number) {
    const { data, error } = await this.server
      .from("classrooms")
      .insert({
        classroom_name: classroom_name,
        school_id: school_id,
      })
      .select();

    if (!data) throw new FlexibleError("class could not be created", 500);
    if (error) throw error;

    return data[0];
  }

  async join(user_id: string, classroom_id: number): Promise<void> {
    const { error } = await this.server.from("classroom_participants").insert({
      user_id: user_id,
      classroom_id: classroom_id,
      confirmed: true,
    });

    if (error) throw error;
  }

  async get(school_id: number, classroom_id?: number) {
    const query = this.server
      .from("classrooms")
      .select("*")
      .eq("school_id", school_id);

    if (classroom_id) query.eq("classroom_id", classroom_id);

    const { data, error } = await query.single();

    if (error) throw error;

    return data;
  }

  async getAll(school_id: number, pagination: Pagination) {
    const { data, error, count } = await this.server
      .from("classrooms")
      .select("*", { count: "exact" })
      .eq("school_id", school_id)
      .order("classroom_id", { ascending: false })
      .limit(pagination.getRowsPerPage())
      .range(pagination.getOffsetStart(), pagination.getOffsetEnd());

    if (error) throw error;

    const classrooms = data;

    return { classrooms, count };
  }

  async getAllByUserID(user_id: string, pagination: Pagination) {
    const { data, count, error } = await this.server
      .from("classroom_details")
      .select(
        `
                archived:c_archived,
                classroom_id:c_classroom_id,
                classroom_name:c_classroom_name,
                school_id:c_school_id
            `,
        { count: "exact" }
      )
      .eq("cp_confirmed", true)
      .eq("cp_user_id", user_id)
      .limit(pagination.getRowsPerPage())
      .range(pagination.getOffsetStart(), pagination.getOffsetEnd());

    if (error) throw error;

    return { data, count };
  }

  async insertUsers(_datas: UserClassroomID) {
    const { data, error } = await this.server.rpc("insert_classroom_users", {
      _datas: _datas,
    });

    if (error) throw error;

    return data; //returns unsuccessful inserts
  }

  async getInvitations(user_id: string, order: string, pagination: Pagination) {
    const isAscending = order == "asc" ? true : false;

    const { data, count, error } = await this.server
      .from("classroom_participants")
      .select(
        `
                *, 
                classroom: classrooms(*)
            `,
        { count: "exact" }
      )
      .eq("confirmed", false)
      .eq("user_id", user_id)
      .order("id", { ascending: isAscending })
      .limit(pagination.getRowsPerPage())
      .range(pagination.getOffsetStart(), pagination.getOffsetEnd());

    if (error) throw error;

    return { data, count };
  }

  async acceptInvitation(user_id: string, classroom_id: number, id: number) {
    const { error } = await this.server
      .from("classroom_participants")
      .update({
        confirmed: true,
      })
      .eq("user_id", user_id)
      .eq("classroom_id", classroom_id)
      .eq("id", id);

    if (error) throw error;
  }

  async getJoinedClassroms(
    user_id: string,
    pagination: Pagination,
    classroom_name?: string
  ) {
    const query = this.server
      .from("classroom_participants")
      .select(
        `
                *,
                classroom:classrooms(*)
            `
      )
      .eq("confirmed", true)
      .eq("user_id", user_id)
      .limit(pagination.getRowsPerPage())
      .range(pagination.getOffsetStart(), pagination.getOffsetEnd());

    if (classroom_name) {
      query.eq("classrooms.classrom_name", classroom_name);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  }

  async getClassroomSummary(
    school_id: number,
    pagination: Pagination,
    first_name?: string,
    last_name?: string,
    teaching_subjects?: string[],
    classroom_name?: string
  ) {
    const query = this.server
      .from("classroom_summary")
      .select(
        `
                classroom_id:c_classroom_id,
                classroom_name:c_classroom_name,
                school_id:c_school_id,
                first_names,
                last_names,
                all_teaching_subjects,
                total_students,
                total_teachers
            `,
        { count: "exact" }
      )
      .eq("c_school_id", school_id)
      .limit(pagination.getRowsPerPage())
      .range(pagination.getOffsetStart(), pagination.getOffsetEnd());

    if (first_name) query.contains("first_names", [first_name]);
    if (last_name) query.contains("last_names", [last_name]);
    if (teaching_subjects)
      query.contains("all_teaching_subjects", teaching_subjects);
    if (classroom_name) query.eq("c_classroom_name", classroom_name);

    const { data, count, error } = await query;

    if (error) throw error;

    return { data, count };
  }

  async getClassroomParticipants(
    school_id: number,
    classroom_id: number,
    role: "student" | "teacher",
    pagination?: Pagination,
    user_id?: string
  ) {
    const query = this.server
      .from("classroom_details")
      .select(
        `
                classroom_id:c_classroom_id,
                classroom_name:c_classroom_name,
                archived:c_archived,
                school_id:c_school_id,
                user_id:cp_user_id,
                confirmed:cp_confirmed,
                email:u_email,
                first_name:u_first_name,
                last_name:u_last_name,
                role:u_role,
                stars:s_stars
            `,
        { count: "exact" }
      )
      .eq("u_role", role)
      .eq("c_school_id", school_id)
      .eq("c_classroom_id", classroom_id);

    if (user_id) query.eq("cp_user_id", user_id);

    if (pagination) {
      query.limit(pagination.getRowsPerPage());
      query.range(pagination.getOffsetStart(), pagination.getOffsetEnd());
    }

    const { data, count, error } = await query;

    if (error) throw error;

    return { data, count };
  }

  async removeUsers(_users: UserClassroomID) {
    const { data, error } = await this.server.rpc("delete_classroom_users", {
      _datas: _users,
    });

    if (error) throw error;

    return data; //returns unsuccessful removals
  }

  async getClassroomsDetails(
    user_id: string,
    school_id: number,
    classroom_ids: number[]
  ) {
    const { data, error } = await this.server
      .from("classroom_details")
      .select(
        `
                school_id:c_school_id,
                user_id:cp_user_id,
                classroom_id:c_classroom_id
            `
      )
      .eq("cp_user_id", user_id)
      .eq("c_school_id", school_id)
      .in("c_classroom_id", classroom_ids);

    if (error) throw error;

    return data;
  }
}
