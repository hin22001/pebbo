import { StripeDAO } from "@/src/app/api/lib/DAOs/stripeDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { StripeSubscriptionWrapper } from "@/src/app/api/lib/models/stripe/stripeSubscriptionWrapper";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";

export async function POST(req: Request) {
  type ResponseType = {
    paying: boolean;
    reconciled: boolean;
  };

  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["student"]);

    let data: ResponseType;

    if (!user.getPaymentStatus()) {
      //user is not paying, attempt to reconcile
      const stripeID = user.getStripeCustomerID(); //can be string OR null

      if (!stripeID) {
        return ResponseWrapper.success("User has no stripe customer id", {
          paying: false,
          reconciled: false,
        });
      }

      const stripeDAO = new StripeDAO();
      const customerSubscriptions =
        await stripeDAO.getCustomerSubscriptions(stripeID);
      const subscriptionWrapper = new StripeSubscriptionWrapper(
        customerSubscriptions,
      );
      if (subscriptionWrapper.isActive()) {
        await userDAO.updatePayingStatus(true, stripeID);

        data = {
          paying: true,
          reconciled: true,
        };
      } else {
        data = {
          paying: false,
          reconciled: false,
        };
      }
    } else {
      data = {
        paying: true,
        reconciled: false,
      };
    }

    return ResponseWrapper.success("Success reconcile", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to reconcile",
      err?.status ?? 500,
      err?.message ?? "",
    );
  }
}
