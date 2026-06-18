import { SupabaseClient } from "@supabase/supabase-js";
import { User } from "@/src/app/api/lib/models/user";
import { UserMetadata } from "@/src/app/api/lib/types/userData";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";

export class UserDAO {
  server: SupabaseClient<PebboDatabase, "public">;

  /**
   *
   * @param server - expects Supabase Service Client
   */
  constructor(server: SupabaseClient<PebboDatabase, "public">) {
    this.server = server;
  }

  async getUser(user_id: string): Promise<User> {
    const { data, error } = await this.server
      .from("users")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (!data || error) {
      throw new FlexibleError("User not found", 401);
    }

    return new User(data);
  }

  async getUserByStripeCustomerID(stripe_customer_id: string): Promise<User> {
    const { data, error } = await this.server
      .from("users")
      .select("*")
      .eq("stripe_customer_id", stripe_customer_id)
      .single();

    if (!data || error) {
      throw new FlexibleError("User not found by stripe customer ID", 401);
    }

    return new User(data);
  }

  async getRoleCount(roleName: string, school_id: number): Promise<number> {
    const { data, count, error } = await this.server
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("school_id", school_id)
      .eq("role", roleName);

    if (error || count == null)
      throw new FlexibleError("School not found", 500);

    return count;
  }

  async createUser(
    email: string,
    password: string,
    user_metadata: UserMetadata,
  ) {
    const { data, error } = await this.server.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: user_metadata,
    });

    if (error) throw error;
  }

  async changeName(user_id: string, first_name: string, last_name: string) {
    const { error } = await this.server
      .from("users")
      .update({
        first_name: first_name,
        last_name: last_name,
      })
      .eq("user_id", user_id);

    if (error) throw error;
  }

  async changeEmail(user_id: string, new_email: string) {
    const { data: user, error } = await this.server.auth.admin.updateUserById(
      user_id,
      { email: new_email },
    );

    if (error) throw error;
  }

  async updatePayingStatus(
    _boolean: boolean,
    stripeCustomerId?: string,
    user_id?: string,
  ) {
    const query = this.server.from("users").update({
      paying: _boolean,
    });

    if (stripeCustomerId) query.eq("stripe_customer_id", stripeCustomerId);
    if (user_id) query.eq("user_id", user_id);

    const { error } = await query;

    if (error) throw error;
  }

  async updateStripeCustomerID(
    stripeCustomerID: string,
    newStripeCustomerID: string | null,
  ) {
    const { error } = await this.server
      .from("users")
      .update({
        stripe_customer_id: newStripeCustomerID,
      })
      .eq("stripe_customer_id", stripeCustomerID);

    if (error) throw error;
  }

  async updateProfileImage(user_id: string, profile_image: number) {
    const { error } = await this.server
      .schema("public")
      .from("users")
      .update({
        profile_image: profile_image,
      })
      .eq("user_id", user_id);

    if (error) throw error;
  }
}
