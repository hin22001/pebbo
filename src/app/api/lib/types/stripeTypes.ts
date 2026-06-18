import Stripe from "stripe";

export type StripeCheckoutSessionEvent = Omit<Stripe.Event, "data"> & {
  data: {
    object: Stripe.Checkout.Session;
  };
};

export type StripeCustomerSubscriptionEvent = Omit<Stripe.Event, "data"> & {
  data: {
    object: Stripe.Subscription;
  };
};

export type StripeCustomerDataEvent = Omit<Stripe.Event, "data"> & {
  data: {
    object: Stripe.Customer;
  };
};

export type StripeInvoiceEvent = Omit<Stripe.Event, "data"> & {
  data: {
    object: Stripe.Invoice;
  };
};
