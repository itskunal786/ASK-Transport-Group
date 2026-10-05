export interface InvoiceItem {
  id: number;
  bookingNumber: string;
  invoiceNumber: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

export interface InvoiceList {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: InvoiceItem[];
}

export interface InvoiceListResponse {
  success: boolean;
  message: string;
  data: InvoiceList;
}
