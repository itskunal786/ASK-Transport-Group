export interface PaymentHistoryItem {
  id: number;
  bookingNumber: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paidAt?: string | null;
  createdAt: string;
}
