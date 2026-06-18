import { BodyAdapterTS } from "@/src/app/api/lib/middleware/bodyAdapter";
import { HeaderAdapter } from "@/src/app/api/lib/middleware/headerAdapter";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { PebboStripe } from "@/src/app/api/lib/models/stripe/stripe";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { StripeCustomerSubscriptionEvent } from "@/src/app/api/lib/types/stripeTypes";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";

export async function POST(req: Request) {
  try {
    const headerAdapter = new HeaderAdapter(req);
    const signaturePreImage = headerAdapter.getHeader("stripe-signature");

    const request = new BodyAdapterTS<StripeCustomerSubscriptionEvent>(req);
    await request.init();
    const eventBody = request.getRawBody();

    const event = PebboStripe.reconstructEvent<StripeCustomerSubscriptionEvent>(
      eventBody,
      signaturePreImage,
      "customerSubscriptions",
    );

    const stripeCustomerID = event.data.object.customer as string;
    const userDAO = new UserDAO(new Supabase().getServiceClient());
    const subscriptionValid: boolean =
      event.data.object.status.toString() == "active" ? true : false;

    switch (event.type) {
      // case 'customer.deleted': --> move to other handler
      //     //stripe-customer-id = null
      //     await userDAO.updateStripeCustomerID(stripeCustomerID, null)
      //     break;

      case "customer.subscription.resumed":
        //paying = true
        await userDAO.updatePayingStatus(true, stripeCustomerID);
        break;

      case "customer.subscription.deleted": //subscription ends (deterministic)
        //paying = false
        await userDAO.updatePayingStatus(false, stripeCustomerID);
        break;

      case "customer.subscription.created": //this triggers regardless of payment status
        //paying = true --> we optimistically allow access to the user
        await userDAO.updatePayingStatus(true, stripeCustomerID);
        break;

      case "customer.subscription.updated": //usually this means the subscription is still valid
        //paying = true
        await userDAO.updatePayingStatus(true, stripeCustomerID);
        break;

      case "customer.subscription.paused":
        //paying = false
        await userDAO.updatePayingStatus(false, stripeCustomerID);
        break;

      case "customer.subscription.pending_update_expired": //this usually means they failed to pay
        //paying = false --> potentially do nothing
        await userDAO.updatePayingStatus(false, stripeCustomerID);

        break;

      case "customer.subscription.pending_update_applied":
        //paying = true --> potentially do nothing
        if (subscriptionValid) {
          await userDAO.updatePayingStatus(true, stripeCustomerID);
        } else {
          await userDAO.updatePayingStatus(false, stripeCustomerID);
        }
        break;

      default:
        throw new FlexibleError("Unhandled event type", 404);
    }

    return ResponseWrapper.success(
      "Stripe customer subscription webhook processed successfully",
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Stripe customer subscription webhook processing failed",
      500,
      err?.message ?? "",
      err,
    );
  }
}
