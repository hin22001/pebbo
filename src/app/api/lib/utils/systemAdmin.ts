import "server-only";

import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";

export class SystemAdmin {
  static assertAdminKey(key: string): void {
    if (key !== process.env.ADMIN_KEY) {
      throw new FlexibleError("Unauthorized", 401);
    }
  }

  static getSupabaseServiceKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
}
