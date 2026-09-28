export interface TransportService {
  id: number;
  name: string;
  isActive: boolean;
  extraDeliveryDays?: number;
}

export interface CreateBookingRequest {
  orderType: string;

  senderName: string;
  senderPhone: string;
  fromAddress: string;
  fromPinCode: string;

  receiverName: string;
  receiverPhone: string;
  toAddress: string;
  toPinCode: string;

  goodsType: string;
  weight: number;
  quantity: number;
  goodsDescription?: string;

  transportServiceId: number;
  pickupDate: string;

  discountAmount: number;
  notes?: string;

  items: [];
}

export interface CreatedBooking {
  id: number;
  bookingNumber: string;
  bookingStatus: string;
  paymentStatus: string;

  service: string;

  fromCity: string;
  toCity: string;

  weight: number;
  quantity: number;

  freightAmount: number;
  gstAmount: number;
  discountAmount: number;
  totalAmount: number;

  pickupDate: string;
  expectedDeliveryDate: string;
}

export interface CreateBookingResponse {
  message: string;
  booking: CreatedBooking;
}
