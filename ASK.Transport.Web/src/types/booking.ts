export interface ClientBooking {
  id: number;
  bookingNumber: string;
  senderName: string;
  receiverName: string;
  fromCity: string;
  toCity: string;
  weight: number;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  pickupDate: string;
  createdAt: string;
}

export interface ClientBookingResponse {
  items: ClientBooking[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
