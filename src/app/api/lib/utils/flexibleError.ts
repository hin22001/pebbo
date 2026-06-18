import "server-only";
import { PostgrestError } from "@supabase/supabase-js";

export class FlexibleError extends Error {
  private status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
  }
}

// export class PostgresErrorWrapper extends FlexibleError {
//     constructor(error: PostgrestError) {
//         super(error.message, parseInt(error.code))

//     }
// }
