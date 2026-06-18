import { BodyAdapterTS } from "@/src/app/api/lib/middleware/bodyAdapter";
import { HeaderAdapter } from "@/src/app/api/lib/middleware/headerAdapter";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { PebboStripe } from "@/src/app/api/lib/models/stripe/stripe";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { StripeCustomerDataEvent } from "@/src/app/api/lib/types/stripeTypes";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";

export async function POST(req: Request) {
  try {
    const headerAdapter = new HeaderAdapter(req);
    const signaturePreImage = headerAdapter.getHeader("stripe-signature");

    const request = new BodyAdapterTS<StripeCustomerDataEvent>(req);
    await request.init();
    const eventBody = request.getRawBody();
    const event = PebboStripe.reconstructEvent<StripeCustomerDataEvent>(
      eventBody,
      signaturePreImage,
      "customerData",
    );

    const stripeCustomerID = event.data.object.id as string;
    const userDAO = new UserDAO(new Supabase().getServiceClient());

    switch (event.type) {
      case "customer.deleted":
        //stripe-customer-id = null
        await userDAO.updateStripeCustomerID(stripeCustomerID, null);
        break;

      default:
        throw new FlexibleError("Unhandled event type", 404);
    }

    return ResponseWrapper.success(
      "Stripe customer data webhook processed successfully",
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Stripe customer data webhook processing failed",
      500,
    );
  }
}
