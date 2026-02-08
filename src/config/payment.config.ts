export const paymentConfig = {
  // Stripe
  stripe: {
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
    enabled: true,
  },
  
  // Razorpay
  razorpay: {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    enabled: true,
  },
  
  // PayPal
  paypal: {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    enabled: false,
  },
  
  // Payment methods
  methods: [
    {
      id: 'cash',
      name: 'Cash',
      icon: '💵',
      enabled: true,
      description: 'Pay with cash to the driver',
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      enabled: true,
      description: 'Pay securely with your card',
    },
    {
      id: 'wallet',
      name: 'Wallet',
      icon: '👛',
      enabled: true,
      description: 'Pay from your wallet balance',
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: '📱',
      enabled: true,
      description: 'Pay via UPI',
    },
  ],
  
  // Currency
  currency: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
  },
} as const;

export type PaymentConfig = typeof paymentConfig;
