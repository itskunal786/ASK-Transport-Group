import { get } from './api';

import type {
  InvoiceListResponse
} from '../types/invoice';


export function getMyInvoices() {
  return get<InvoiceListResponse>(
    '/client/invoices?page=1&pageSize=100'
  );
}


function getApiRoot() {
  return (
    import.meta.env.VITE_API_ROOT ||
    'http://localhost:5208/api'
  );
}


export function getInvoicePdfUrl(
  invoiceNumber: string
) {
  return `${getApiRoot()}/Invoice/${encodeURIComponent(
    invoiceNumber
  )}/pdf`;
}
