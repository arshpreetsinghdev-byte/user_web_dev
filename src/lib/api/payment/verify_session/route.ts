import { NextResponse } from "next/server";
import { stripe } from "@/lib/api/payment/stripe/stripe";

export async function POST(req: Request) {
  const { session_id } = await req.json();

  const setupIntent = await stripe.setupIntents.retrieve(session_id);

  if (setupIntent.status === "succeeded") {
    return NextResponse.json({
      success: true,
      card_id: setupIntent.payment_method,
    });
  }

  return NextResponse.json({
    success: false,
    status: setupIntent.status,
  });
}
