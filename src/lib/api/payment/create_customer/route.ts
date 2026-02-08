import { NextResponse } from "next/server";
import { stripe } from "@/lib/api/payment/stripe/stripe";

export async function POST(req: Request) {
  const { user_id, email } = await req.json();

  const customer = await stripe.customers.create({
    email,
    metadata: { user_id },
  });

  return NextResponse.json({
    success: true,
    customer_id: customer.id,
  });
}
