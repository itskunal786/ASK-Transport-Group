import { post } from './api';

export interface RazorpayOrderResponse {
  message: string;
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  bookingNumber: string;
  invoiceNumber?: string;
}

export interface RazorpayVerifyRequest {
  bookingNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface RazorpayVerifyResponse {
  message: string;
  bookingNumber: string;
  transactionId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  paymentStatus: string;
}

export function createRazorpayOrder(
  bookingNumber: string
) {
  return post<RazorpayOrderResponse>(
    '/Razorpay/create-order',
    {
      bookingNumber
    }
  );
}

export function verifyRazorpayPayment(
  data: RazorpayVerifyRequest
) {
  return post<RazorpayVerifyResponse>(
    '/Razorpay/verify',
    data
  );
}
