import { ProductKeysDAO } from "@/src/app/api/lib/DAOs/productKeysDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(
      req,
      z.object({ key: z.string() }).strict(),
    );
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const productKeysDAO = new ProductKeysDAO(supabaseService);
    const updatedRow = await productKeysDAO.activateKey(
      auth.getUserId(),
      request.getBodyProperty("key"),
    );

    if (updatedRow) {
      const userDAO = new UserDAO(supabaseService);
      await userDAO.updatePayingStatus(true, undefined, auth.getUserId());
    } else {
      throw new FlexibleError("The key is invalid or an error occured", 500);
    }

    return ResponseWrapper.success("Success Activate Key", updatedRow);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed Activate Key",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
