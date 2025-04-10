/**
 * Payment utilities for the club ticket booking application
 * These functions simulate payment processing for the MVP
 */

/**
 * Simulates processing a payment
 * @param amount The payment amount
 * @param method The payment method (applepay, creditcard, paypal)
 * @returns A promise that resolves with the payment result
 */
export async function processPayment(amount: number, method: string): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
  last4?: string;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock success with 95% probability
  const isSuccess = Math.random() < 0.95;
  
  if (isSuccess) {
    return {
      success: true,
      transactionId: generateTransactionId(),
      last4: method === 'creditcard' ? '4242' : undefined
    };
  } else {
    const errors = [
      "Payment declined by issuer",
      "Insufficient funds",
      "Payment method expired",
      "Network error during processing"
    ];
    
    return {
      success: false,
      error: errors[Math.floor(Math.random() * errors.length)]
    };
  }
}

/**
 * Calculates the service fee for a ticket purchase
 * @param subtotal The subtotal amount
 * @returns The service fee amount
 */
export function calculateServiceFee(subtotal: number): number {
  return Math.round(subtotal * 0.1 * 100) / 100; // 10% service fee
}

/**
 * Calculates tax for a ticket purchase
 * @param subtotal The subtotal amount
 * @returns The tax amount
 */
export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * 0.07 * 100) / 100; // 7% tax
}

/**
 * Calculates the total price for a ticket purchase
 * @param subtotal The subtotal amount
 * @param serviceFee The service fee amount
 * @param tax The tax amount
 * @returns The total price
 */
export function calculateTotal(subtotal: number, serviceFee: number, tax: number): number {
  return Math.round((subtotal + serviceFee + tax) * 100) / 100;
}

/**
 * Generates a mock transaction ID
 * @returns A transaction ID string
 */
function generateTransactionId(): string {
  return `TXN${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

/**
 * Get display name for payment method
 * @param method The payment method key
 * @returns Human-readable payment method name
 */
export function getPaymentMethodName(method: string): string {
  const methods: Record<string, string> = {
    'applepay': 'Apple Pay',
    'creditcard': 'Credit Card',
    'paypal': 'PayPal'
  };
  
  return methods[method] || method;
}

/**
 * Prepares payment details for API submission
 * @param method The payment method
 * @param subtotal The subtotal amount
 * @param serviceFee The service fee amount
 * @param tax The tax amount
 * @returns Payment details object for the API
 */
export function preparePaymentDetails(
  method: string,
  subtotal: number,
  serviceFee: number, 
  tax: number
): Record<string, any> {
  return {
    method: getPaymentMethodName(method),
    subtotal: subtotal.toFixed(2),
    serviceFee: serviceFee.toFixed(2),
    tax: tax.toFixed(2),
    // In a real app, this would include actual payment processing info
    last4: method === 'creditcard' ? '4242' : undefined,
    transactionId: generateTransactionId()
  };
}
