import { PebboStripe } from "@/src/app/api/lib/models/stripe/stripe";
import { EnvManager } from "@/src/app/api/lib/utils/envManager";
import Stripe from "stripe";

export class StripeDAO {
  private stripe: Stripe = PebboStripe.getClient();

  async createCustomer(firstName: string, lastName: string, email: string) {
    const customer = await this.stripe.customers.create({
      name: firstName + " " + lastName,
      email: email,
    });

    return customer;
  }

  async createCheckoutSession(
    customer_id: string,
    type: "monthly" | "annually",
    successUrl?: string,
  ) {
    const price =
      type == "monthly"
        ? process.env.STRIPE_MONTHLY_PRICE_ID
        : process.env.STRIPE_ANNUAL_PRICE_ID;

    const session = await this.stripe.checkout.sessions.create({
      customer: customer_id,
      success_url: successUrl || process.env.PAYMENT_SUCCESS_URL,
      mode: "subscription",
      line_items: [
        {
          price: price,
          quantity: 1,
        },
      ],
    });

    return session;
  }

  async getActiveCustomer(customer_id: string) {
    const customer = await this.stripe.customers.retrieve(customer_id);
    return customer as Stripe.Response<Stripe.Customer>; //make sure that we dont get a deleted customer object
  }

  async getCustomerSubscriptions(customer_id: string) {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customer_id,
    });

    return subscriptions.data;
  }
}
