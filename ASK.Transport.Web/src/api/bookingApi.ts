import { get } from './api';

import type {
  ClientBookingResponse
} from '../types/booking';

export function getClientBookings(
  page = 1,
  search = '',
  status = ''
) {
  const params = new URLSearchParams();

  params.set('page', String(page));
  params.set('pageSize', '10');

  if (search.trim()) {
    params.set('search', search.trim());
  }

  if (status) {
    params.set('bookingStatus', status);
  }

  return get<ClientBookingResponse>(
    '/my/bookings?' + params.toString()
  );
}
