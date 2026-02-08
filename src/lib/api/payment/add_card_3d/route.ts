import { NextResponse } from "next/server";
import { stripe } from "@/lib/api/payment/stripe/stripe";

export async function POST(req: Request) {
  const { customer_id } = await req.json();

  const setupIntent = await stripe.setupIntents.create({
    customer: customer_id,
    payment_method_types: ["card"],
  });

  return NextResponse.json({
    success: true,
    session_id: setupIntent.id,
    client_secret: setupIntent.client_secret,
  });
}
