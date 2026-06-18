import { StripeDAO } from "@/src/app/api/lib/DAOs/stripeDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";

export async function POST(req: Request) {
  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["student"]);

    const stripeDAO = new StripeDAO();
    const userData = user.getData();

    let stripeCustomerId = userData.stripe_customer_id;

    // Create a Stripe customer if we don't have one yet
    if (!stripeCustomerId) {
      const customer = await stripeDAO.createCustomer(
        userData.first_name || "",
        userData.last_name || "",
        auth.getEmail(),
      );
      stripeCustomerId = customer.id;

      // Persist the new customer id back to the users table
      await supabaseService
        .from("users")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("user_id", auth.getUserId());
    }

    // Read the requested plan from the request body (default to monthly)
    const body = await req.json().catch(() => ({}));
    const type: "monthly" | "annually" =
      body.type === "annually" ? "annually" : "monthly";

    const origin =
      req.headers.get("origin") ||
      process.env.PAYMENT_SUCCESS_URL?.split("/payment-success")[0] ||
      "http://localhost:3000";
    const successUrl = `${origin}/payment-success`;

    const session = await stripeDAO.createCheckoutSession(
      stripeCustomerId,
      type,
      successUrl,
    );

    if (!session?.url) {
      throw new FlexibleError("Failed to create Stripe checkout session", 500);
    }

    return ResponseWrapper.success("Checkout session created", {
      url: session.url,
    });
  } catch (err: any) {
    return ResponseWrapper.error(
      "Failed to create checkout session",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
