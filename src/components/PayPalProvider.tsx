import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from 'react';

interface PayPalProviderProps {
  children: ReactNode;
}

export const PayPalProvider = ({ children }: PayPalProviderProps) => {
  const initialOptions = {
    clientId: "AQGKIgWsIXEBJMsT8zaxVU0vGpFgc6NjXq4V7pQOjYzBDap6LW8_7oG2PiV7GNVJeKzVwJ0dvPJE8XQJ", // Sandbox client ID
    currency: "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
};