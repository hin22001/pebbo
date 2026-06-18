import { Tables } from "@/src/app/api/lib/types/supabaseTypes";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";

export class User {
  private data: Tables<"users">;

  constructor(userData: Tables<"users">) {
    this.data = userData;
  }

  getData(): Tables<"users"> {
    return this.data;
  }

  getID(): string {
    return this.data.user_id;
  }

  assertRole(roleArray: string[]) {
    if (!roleArray.includes(this.data.role)) {
      throw new FlexibleError("Unauthorized role", 404);
    }
  }

  assertPaying(boolean: boolean) {
    if (this.data.paying !== boolean) {
      throw new FlexibleError(`User paying status is not ${boolean}`, 403);
    }
  }

  getSchoolId(): number | null {
    return this.data.school_id;
  }

  getRole(): string {
    return this.data.role;
  }

  getPaymentStatus(): boolean {
    return this.data.paying;
  }

  getStripeCustomerID(): string | null {
    return this.data.stripe_customer_id;
  }

  requirePaying(): void {
    if (!this.data.paying) {
      throw new FlexibleError("User is not a paying", 403);
    }
  }
}
