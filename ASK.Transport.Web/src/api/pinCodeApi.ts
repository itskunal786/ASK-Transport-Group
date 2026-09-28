import { get } from './api';

import type {
  PinCodeDetails
} from '../types/pinCode';

export function getPinCode(pin: string) {
  return get<PinCodeDetails>(
    '/PinCode/' + encodeURIComponent(pin)
  );
}
