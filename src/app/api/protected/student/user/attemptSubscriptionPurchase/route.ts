import { StripeDAO } from "@/src/app/api/lib/DAOs/stripeDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

const schema = z
  .object({
    subscription_type: z.enum(["monthly", "annually"]),
  })
  .strict();

export async function POST(req: Request) {
  type ResponseType = {
    stripe_customer_id: string;
    url: string;
  };

  try {
    const request = new BodyAdapter(req, schema);
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["student"]);
    user.assertPaying(false); //we want to make sure that they are not paying yet.

    const stripeDAO = new StripeDAO();

    let stripeID = user.getStripeCustomerID(); //can be string OR null

    if (!stripeID) {
      //they are NOT an existing customer AND they are not paying
      const stripeCustomer = await stripeDAO.createCustomer(
        user.getData().first_name as string,
        user.getData().last_name as string,
        auth.getEmail() as string,
      );

      stripeID = stripeCustomer.id;
    }

    const checkoutSession = await stripeDAO.createCheckoutSession(
      stripeID as string,
      request.getBodyProperty("subscription_type"),
    );

    const data: ResponseType = {
      stripe_customer_id: stripeID,
      url: checkoutSession.url as string,
    };

    return ResponseWrapper.success("Success attempt subscription", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to attempt subscription",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
