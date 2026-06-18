import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z.object({ first_name: z.string(), last_name: z.string() }).strict(),
    );
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    await userDAO.changeName(
      auth.getUserId(),
      request.getBodyProperty("first_name"),
      request.getBodyProperty("last_name"),
    );

    return ResponseWrapper.success("Success change name");
  } catch (err) {
    return ResponseWrapper.error(
      "Failed change name",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
