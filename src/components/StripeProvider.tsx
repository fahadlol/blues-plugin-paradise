import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode } from 'react';

const stripePromise = loadStripe('pk_test_51QZxqRGTL7xKol3JNulD0mbw5QPelXcjNcr3nyJGpvD5bzZiyZiaEJcspVGbDBOmJdxjHv0iPeZ41kNaGkqk5ebV00FPnUrBil');

interface StripeProviderProps {
  children: ReactNode;
  amount: number;
}

export const StripeProvider = ({ children, amount }: StripeProviderProps) => {
  const options = {
    mode: 'payment' as const,
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};