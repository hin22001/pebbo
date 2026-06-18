import "server-only";

import { AbstractDebug } from "../abstractClasses/abstractDebug";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { UserBasic } from "@/src/app/api/lib/types/userData";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
// import { TypeGuard } from '@/src/app/api/lib/utils/typeGuard';

export class Auth extends AbstractDebug<UserBasic> {
  private server: SupabaseClient;
  private user: User;
  private inDebug: boolean;

  constructor(server: SupabaseClient) {
    super();
    this.server = server;
  }

  async init() {
    if (!this.inDebug) {
      const {
        data: { user },
      } = await this.server.auth.getUser();

      if (!user || user.aud != "authenticated") {
        throw new FlexibleError("User Unauthorized", 401);
      }

      this.user = user;
    }
  }

  getUserId(): string {
    return this.user.id;
  }

  getEmail(): string {
    return String(this.user.email) ?? "";
  }

  getCreatedAt(): string {
    return this.user.created_at;
  }

  injectDebug(debugObject: UserBasic) {
    this.user.id = debugObject.user_id;

    this.user.email = debugObject.email;

    this.inDebug = true;
  }
}
