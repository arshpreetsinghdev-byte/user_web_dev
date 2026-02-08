import { NextResponse } from "next/server";
import { stripe } from "@/lib/api/payment/stripe/stripe";

export async function POST(req: Request) {
  const { customer_id, card_id, amount } = await req.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    customer: customer_id,
    payment_method: card_id,
    off_session: true,  
    confirm: true,
  });

  return NextResponse.json({
    success: true,
    payment_intent_id: paymentIntent.id,
  });
}
