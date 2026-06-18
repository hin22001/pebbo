import { SupabaseClient } from "@supabase/supabase-js";
import {
  AdminLicense,
  TeacherLicense,
} from "@/src/app/api/lib/types/licenseTypes";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";

export class SchoolDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  /**
   *
   * @param server - expects Supabase server client
   */
  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  async getLicenseCount(
    licenseName: "admin_licenses",
    school_id: number,
  ): Promise<AdminLicense>;
  async getLicenseCount(
    licenseName: "teacher_licenses",
    school_id: number,
  ): Promise<TeacherLicense>;

  async getLicenseCount(
    licenseName: "admin_licenses" | "teacher_licenses",
    school_id: number,
  ) {
    const { data, error } = await this.server
      .from("schools")
      .select(licenseName)
      .eq("school_id", school_id)
      .single();

    if (error) throw new FlexibleError("Admin Licenses missing", 500);

    return data;
  }

  async getSchool(school_id: number) {
    const { data, error } = await this.server
      .from("schools")
      .select("*")
      .eq("school_id", school_id)
      .single();

    if (error) throw error;
    if (!data) throw new FlexibleError("School not found", 500);

    return data;
  }

  async getOverview(school_id: number) {
    const { data, error } = await this.server
      .from("role_counts_by_school")
      .select("*")
      .eq("school_id", school_id);

    if (error) throw error;
    if (!data) throw new FlexibleError("School not found", 500);

    return data;
  }

  async getLicensesAndRoleCount(school_id: number) {
    const { data, error } = await this.server
      .from("school_user_licenses")
      .select("*")
      .eq("school_id", school_id)
      .single();

    if (error) throw error;

    if (!data) throw new FlexibleError("School has no license or users", 500);

    return data;
  }
}
