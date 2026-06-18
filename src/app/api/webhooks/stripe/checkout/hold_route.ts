// import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter"
// import { HeaderAdapter } from "@/src/app/api/lib/middleware/headerAdapter"
// import { StripeCheckoutSessionEvent } from "@/src/app/api/lib/types/stripeTypes"
// import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper"
// import { PebboStripe } from "@/src/app/api/lib/models/stripe"
// import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError"

// export async function POST(req: Request) {
//     try {
//         const headerAdapter = new HeaderAdapter(req)
//         const stripe_signature = headerAdapter.getHeader('stripe-signature')
//         PebboStripe.verifyWebhookSignature(stripe_signature)

//         const request = new BodyAdapter<StripeCheckoutSessionEvent>(req)
//         const event = request.getBody().get()

//         switch(event.type) {
//             case 'checkout.session.completed':
//                 //UPDATE THE paying on users accordingly
//                 break;

//             case 'checkout.session.async_payment_succeeded':
//                 //UPDATE THE paying on users accordingly
//                 break;

//             case 'checkout.session.async_payment_failed':
//                 //do nothing for now
//                 //it is possible that an already paying user just accidentally clicked twice
//                 break;

//             default:
//                 throw new FlexibleError('Unhandled event type', 404)
//         }

//         return ResponseWrapper.success("Stripe Checkout webhook processed successfully")
//     }
//     catch(err) {
//         return ResponseWrapper.error("Stripe Checkout webhook processing failed", 500)
//     }

// }
