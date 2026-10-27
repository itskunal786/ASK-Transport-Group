import { get } from './api';
import type { PinCodeDetails } from '../types/pinCode';

export function getPinCode(pin: string) {
  return get<PinCodeDetails>(
    '/PinCode/' + encodeURIComponent(pin)
  );
}

/**
 * Robust PIN code lookup with dual-resolution:
 * 1. Queries backend API with SQLite caching and official India Post integration.
 * 2. Falls back to direct browser India Post API if backend is restarting/offline.
 * 3. Accurately flags invalid/non-existent PINs with clear error messages.
 */
export async function lookupPinCode(pin: string): Promise<PinCodeDetails> {
  const cleanPin = pin.trim();
  if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
    throw new Error('Please enter a valid 6-digit Indian PIN code.');
  }

  // 1. Try backend API first (DB cache + server India Post resolution)
  try {
    const data = await getPinCode(cleanPin);
    if (data && data.city && data.state) {
      return data;
    }
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.includes('404') || msg.includes('not found') || msg.includes('not recognized')) {
      throw new Error(`PIN code ${cleanPin} is not a valid Indian postal PIN.`);
    }
  }

  // 2. Direct India Post API browser fallback
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        const first = json[0];
        if (first.Status === 'Success' && Array.isArray(first.PostOffice) && first.PostOffice.length > 0) {
          const po = first.PostOffice[0];
          let district = (po.District || '').replace(/\s*\(.*?\)/g, '').trim();
          const state = po.State || 'India';
          const poName = (po.Name || '').replace(/\s*\(.*?\)/g, '').trim();

          if (district.toLowerCase() === 'gurgaon') district = 'Gurugram';
          if (district.toLowerCase() === 'bangalore') district = 'Bengaluru';
          if (district.toLowerCase() === 'raigarh' && state.toLowerCase() === 'maharashtra') district = 'Navi Mumbai';

          let city = district;
          if (poName.toLowerCase() === 'noida') city = 'Noida';
          if (!city) city = poName || 'Commercial Hub';

          return {
            pin: cleanPin,
            city,
            district: district || city,
            state,
            deliveryDays: 3,
            serviceable: true
          };
        } else if (first.Status === 'Error') {
          throw new Error(`PIN code ${cleanPin} is not a valid Indian postal PIN.`);
        }
      }
    }
  } catch (fetchErr: any) {
    if (fetchErr?.message?.includes('not a valid')) {
      throw fetchErr;
    }
  }

  throw new Error(`Unable to verify PIN code ${cleanPin}. Please check the number.`);
}
