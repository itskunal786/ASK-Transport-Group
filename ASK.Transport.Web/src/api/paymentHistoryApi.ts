import { get } from './api';
import type { PaymentHistoryItem } from '../types/payment';

export function getMyPayments() {
  return get<PaymentHistoryItem[]>(
    '/Payment/my'
  );
}
