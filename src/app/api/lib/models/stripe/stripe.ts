import "server-only";
import Stripe from "stripe";
import { EnvManager } from "@/src/app/api/lib/utils/envManager";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";

export class PebboStripe {
  private static stripe: Stripe = new Stripe(
    EnvManager.getVariable("STRIPE_PROD_SECRET", "STRIPE_TEST_SECRET"),
  );

  static getClient(): Stripe {
    return this.stripe;
  }

  static verifyWebhookSignature(
    toTest: string,
    eventType: "invoice" | "customerData" | "customerSubscriptions",
  ) {
    switch (eventType) {
      case "invoice":
        if (
          toTest !==
          EnvManager.getVariable(
            "STRIPE_PROD_WEBHOOK_INVOICE_SECRET",
            "STRIPE_TEST_WEBHOOK_SECRET",
          )
        ) {
          throw new FlexibleError("Invalid Stripe signature for webhooks", 404);
        }
        break;
      case "customerData":
        if (
          toTest !==
          EnvManager.getVariable(
            "STRIPE_PROD_WEBHOOK_CUSTOMERDATA_SECRET",
            "STRIPE_TEST_WEBHOOK_SECRET",
          )
        ) {
          throw new FlexibleError("Invalid Stripe signature for webhooks", 404);
        }
        break;
      case "customerSubscriptions":
        if (
          toTest !==
          EnvManager.getVariable(
            "STRIPE_PROD_WEBHOOK_CUSTOMERSUBSCRIPTIONS_SECRET",
            "STRIPE_TEST_WEBHOOK_SECRET",
          )
        ) {
          throw new FlexibleError("Invalid Stripe signature for webhooks", 404);
        }
        break;
    }
  }

  static reconstructEvent<T>(
    rawBody: any,
    preImage: string,
    eventType: "invoice" | "customerData" | "customerSubscriptions",
  ) {
    let signing_secret: string;

    switch (eventType) {
      case "invoice":
        signing_secret = EnvManager.getVariable(
          "STRIPE_PROD_WEBHOOK_INVOICE_SECRET",
          "STRIPE_TEST_WEBHOOK_SECRET",
        );
        break;
      case "customerData":
        signing_secret = EnvManager.getVariable(
          "STRIPE_PROD_WEBHOOK_CUSTOMERDATA_SECRET",
          "STRIPE_TEST_WEBHOOK_SECRET",
        );
        break;
      case "customerSubscriptions":
        signing_secret = EnvManager.getVariable(
          "STRIPE_PROD_WEBHOOK_CUSTOMERSUBSCRIPTIONS_SECRET",
          "STRIPE_TEST_WEBHOOK_SECRET",
        );
        break;
    }

    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      preImage,
      signing_secret,
    );

    return event as T;
  }
}
