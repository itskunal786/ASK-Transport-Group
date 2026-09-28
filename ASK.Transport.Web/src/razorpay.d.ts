export {};

declare global {
  interface Window {
    Razorpay: new (
      options: RazorpayOptions
    ) => RazorpayInstance;
  }

  interface RazorpayInstance {
    open(): void;
    on(
      event: string,
      callback: (
        response: RazorpayFailureResponse
      ) => void
    ): void;
  }

  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;

    handler: (
      response: RazorpaySuccessResponse
    ) => void | Promise<void>;

    modal?: {
      ondismiss?: () => void;
    };

    theme?: {
      color?: string;
    };
  }

  interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayFailureResponse {
    error?: {
      description?: string;
    };
  }
}
