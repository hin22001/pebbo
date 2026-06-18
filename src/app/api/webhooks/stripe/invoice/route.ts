import { BodyAdapterTS } from "@/src/app/api/lib/middleware/bodyAdapter";
import { HeaderAdapter } from "@/src/app/api/lib/middleware/headerAdapter";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { PebboStripe } from "@/src/app/api/lib/models/stripe/stripe";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { StripeInvoiceEvent } from "@/src/app/api/lib/types/stripeTypes";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Supabase } from "@/src/app/api/lib/models/supabase";

export async function POST(req: Request) {
  try {
    const headerAdapter = new HeaderAdapter(req);
    const signaturePreImage = headerAdapter.getHeader("stripe-signature");

    const request = new BodyAdapterTS<StripeInvoiceEvent>(req);
    await request.init();
    const eventBody = request.getRawBody();

    const event = PebboStripe.reconstructEvent<StripeInvoiceEvent>(
      eventBody,
      signaturePreImage,
      "invoice",
    );

    const stripeCustomerID = event.data.object.customer as string;

    const userDAO = new UserDAO(new Supabase().getServiceClient());
    // const user = await userDAO.getUserByStripeCustomerID(stripeCustomerID)
    // const userPaymentStatus = user.getPaymentStatus()

    switch (event.type) {
      case "invoice.payment_succeeded":
        //paying = true
        await userDAO.updatePayingStatus(true, stripeCustomerID);

        break;

      case "invoice.payment_failed":
        //paying = false
        await userDAO.updatePayingStatus(false, stripeCustomerID);

        break;

      // case 'invoice.overude': --> for some reason this isnt supported in current Stripe.js
      //     //paying = false
      //     break;

      default:
        throw new FlexibleError("Unhandled event type", 404);
    }

    return ResponseWrapper.success(
      "Stripe invoice webhook processed successfully",
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Stripe invoice webhook processing failed",
      500,
      err?.message ?? "",
      err,
    );
  }
}
