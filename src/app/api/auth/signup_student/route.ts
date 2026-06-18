"use server";

import { NextResponse } from "next/server";
import { Supabase } from "../../lib/models/supabase";
import { UserDAO } from "../../lib/DAOs/userDAO";
import { BodyAdapter } from "@/src/app/api/lib/middleware/bodyAdapter";
import { StudentMetadata } from "@/src/app/api/lib/types/userData";
import { StripeDAO } from "@/src/app/api/lib/DAOs/stripeDAO";
import { z } from "zod";

const schema = z
  .object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    password: z.string(),
    referred_by: z.union([z.string(), z.null()]).optional(),
    subscription_type: z.enum(["monthly", "annually"]),
    year: z.string().optional(),
    skip_payment: z.boolean().optional(),
  })
  .strict();

export async function POST(req: Request) {
  try {
    const request = new BodyAdapter(req, schema);
    await request.init();

    const _supabase = new Supabase();
    const supabase = _supabase.getServiceClient();

    const userDAO = new UserDAO(supabase);
    const stripeDAO = new StripeDAO();

    const skipPayment = request.getBodyProperty("skip_payment") ?? false;
    let stripeCustomerId: string | null = null;

    if (!skipPayment) {
      const stripeCustomer = await stripeDAO.createCustomer(
        request.getBodyProperty("first_name"),
        request.getBodyProperty("last_name"),
        request.getBodyProperty("email"),
      );
      stripeCustomerId = stripeCustomer.id;
    }

    const metadata: StudentMetadata = {
      role: "student",
      first_name: request.getBodyProperty("first_name"),
      last_name: request.getBodyProperty("last_name"),
      school_id: null,
      referred_by: request.getBodyProperty("referred_by") ?? null,
      stripe_customer_id: stripeCustomerId,
      year: request.getBodyProperty("year"),
    };

    await userDAO.createUser(
      request.getBodyProperty("email"),
      request.getBodyProperty("password"),
      metadata,
    );

    let checkoutUrl: string | null = null;
    if (!skipPayment && stripeCustomerId) {
      const checkoutSession = await stripeDAO.createCheckoutSession(
        stripeCustomerId,
        request.getBodyProperty("subscription_type"),
      );
      checkoutUrl = checkoutSession.url;
    }

    return NextResponse.json(
      {
        status: 200,
        message: `Success Signup`,
        data: { url: checkoutUrl },
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed to Signup: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  }
}
