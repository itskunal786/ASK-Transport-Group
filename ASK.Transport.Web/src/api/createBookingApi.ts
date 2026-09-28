import {
  get,
  post
} from './api';

import type {
  CreateBookingRequest,
  CreateBookingResponse,
  TransportService
} from '../types/createBooking';

export function getTransportServices() {
  return get<TransportService[]>(
    '/TransportService'
  );
}

export function createBooking(
  data: CreateBookingRequest
) {
  return post<CreateBookingResponse>(
    '/Booking',
    data
  );
}
