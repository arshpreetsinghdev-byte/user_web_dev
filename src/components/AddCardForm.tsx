"use client";

import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

export default function AddCardForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();

  async function confirmCard() {
    if (!stripe || !elements) return;

    const card = elements.getElement(CardNumberElement);

    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: card! },
    });

    console.log(result);
  }

  return (
    <>
      <CardNumberElement />
      <CardExpiryElement />
      <CardCvcElement />
      <button onClick={confirmCard}>Add Card</button>
    </>
  );
}