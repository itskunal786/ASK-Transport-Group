export interface CreatePaymentRequest {
  bookingNumber: string;
  paymentMethod: string;
  paymentReference?: string;
}

export interface PaymentTransaction {
  id: number;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentMessage?: string;
  paidAt?: string;
}

export interface PaymentResponse {
  message: string;
  bookingNumber: string;
  invoiceNumber: string;
  transaction: PaymentTransaction;
}
