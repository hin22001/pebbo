import Stripe from "stripe";

export class StripeSubscriptionWrapper {
  subscriptions: Stripe.Subscription[];

  constructor(subscriptions: Stripe.Subscription[]) {
    this.subscriptions = subscriptions;
  }

  isActive(): boolean {
    if (!this.subscriptions) {
      return false;
    } else {
      let isActive = false;

      this.subscriptions.forEach((subscription) => {
        if (subscription.status.toString() == "active") {
          isActive = true;
        }
      });
      return isActive;
    }
  }
}
