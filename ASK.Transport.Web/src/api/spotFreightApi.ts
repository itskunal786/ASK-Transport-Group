import { request } from './api';
import type { FreightCorridorIndex, SpotBrokerBid } from '../types/transportOperations';
import type { ApiResponse } from './tyreApi';

const STORAGE_KEY_BIDS = 'ask_spot_broker_bids';
const STORAGE_KEY_CORRIDORS = 'ask_spot_freight_corridors';

export const DEFAULT_CORRIDORS: FreightCorridorIndex[] = [
  {
    id: 'LANE-01',
    lane: 'Pune ➔ Kolkata (NH-53)',
    originHub: 'Pune Logistics Park (MH)',
    destinationHub: 'Dankuni Hub, Kolkata (WB)',
    distanceKm: 1840,
    bodyType: '16-Wheeler Open',
    recommendedCapacityTon: 22.0,
    currentSpotRateInr: 92000,
    thirtyDayAvgRateInr: 94500,
    trendPercentage: -2.6,
    trendDirection: 'DOWN',
    marketLorryAvailability: 'SURPLUS',
    dieselImpactNote: 'Surplus return empty lorries from Maharashtra manufacturing belt.'
  },
  {
    id: 'LANE-02',
    lane: 'Delhi ➔ Mumbai (NH-48)',
    originHub: 'Kundli Terminal, Delhi NCR',
    destinationHub: 'Bhiwandi Hub, Mumbai (MH)',
    distanceKm: 1420,
    bodyType: 'Container 32ft',
    recommendedCapacityTon: 20.0,
    currentSpotRateInr: 68500,
    thirtyDayAvgRateInr: 66200,
    trendPercentage: +3.4,
    trendDirection: 'UP',
    marketLorryAvailability: 'DEFICIT_HIGH_DEMAND',
    dieselImpactNote: 'Festive retail e-commerce surge. Lorry demand exceeds supply.'
  },
  {
    id: 'LANE-03',
    lane: 'Bengaluru ➔ Delhi (NH-44)',
    originHub: 'Nelamangala Hub, Bengaluru',
    destinationHub: 'Kundli Terminal, Delhi NCR',
    distanceKm: 2150,
    bodyType: '22-Wheeler Trailer',
    recommendedCapacityTon: 25.0,
    currentSpotRateInr: 112000,
    thirtyDayAvgRateInr: 110000,
    trendPercentage: +1.8,
    trendDirection: 'UP',
    marketLorryAvailability: 'BALANCED',
    dieselImpactNote: 'Steady South-North industrial electronics and textile flow.'
  },
  {
    id: 'LANE-04',
    lane: 'Ahmedabad ➔ Chennai (NH-48/16)',
    originHub: 'Changodar Hub, Ahmedabad',
    destinationHub: 'Madhavaram Hub, Chennai',
    distanceKm: 1720,
    bodyType: '16-Wheeler Open',
    recommendedCapacityTon: 20.0,
    currentSpotRateInr: 88000,
    thirtyDayAvgRateInr: 87500,
    trendPercentage: +0.5,
    trendDirection: 'STABLE',
    marketLorryAvailability: 'BALANCED',
    dieselImpactNote: 'Chemical and pharma freight rates steady with minimal fluctuation.'
  }
];

export const DEFAULT_BIDS: SpotBrokerBid[] = [
  {
    id: 'BID-01',
    brokerName: 'Shree Ram Roadlines (Vapi)',
    contactPerson: 'Sukhwinder Singh',
    phone: '+91 98251 44021',
    vehicleNumber: 'GJ-15-AT-7819',
    vehicleBody: '16-Wheeler 28 Ton Multi-Axle',
    quotedRateInr: 64500,
    varianceVsTargetInr: -1535,
    driverRating: 4.8,
    status: 'ACCEPTED',
    bidReceivedTime: '12 mins ago',
    tripSheetNo: 'TRP-SPOT-2026-7819',
    issuedAt: '10:45 AM',
    advanceAmount: 45150,
    balanceAmount: 19350,
    tdsDeduction: 1290
  },
  {
    id: 'BID-02',
    brokerName: 'Western Fleet Carrier (Thane)',
    contactPerson: 'Karan Sharma',
    phone: '+91 98200 99122',
    vehicleNumber: 'MH-04-HY-6612',
    vehicleBody: '16-Wheeler Tata Signa',
    quotedRateInr: 65800,
    varianceVsTargetInr: -235,
    driverRating: 4.6,
    status: 'PENDING',
    bidReceivedTime: '18 mins ago'
  },
  {
    id: 'BID-03',
    brokerName: 'Balaji Transport Syndicate (Pune)',
    contactPerson: 'Mahesh Patil',
    phone: '+91 98901 33451',
    vehicleNumber: 'MH-12-PQ-8890',
    vehicleBody: '16-Wheeler Ashok Leyland',
    quotedRateInr: 68500,
    varianceVsTargetInr: +2465,
    driverRating: 4.9,
    status: 'PENDING',
    bidReceivedTime: '24 mins ago'
  }
];

export function getLocalBids(): SpotBrokerBid[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BIDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Unable to read cached spot broker bids', e);
  }
  return DEFAULT_BIDS;
}

export function saveLocalBids(bids: SpotBrokerBid[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BIDS, JSON.stringify(bids));
  } catch (e) {
    console.warn('Unable to persist spot broker bids', e);
  }
}

export function resetBrokerBidsToDefault(): SpotBrokerBid[] {
  try {
    localStorage.setItem(STORAGE_KEY_BIDS, JSON.stringify(DEFAULT_BIDS));
  } catch (e) {
    console.warn('Unable to reset spot broker bids', e);
  }
  return DEFAULT_BIDS;
}

export async function getFreightCorridors(): Promise<FreightCorridorIndex[]> {
  try {
    const res = await request<ApiResponse<FreightCorridorIndex[]>>('/spot-freight/corridors');
    if (res?.data && res.data.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_CORRIDORS, JSON.stringify(res.data));
      } catch {}
      return res.data;
    }
  } catch {
    // fallback to cache or defaults
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_CORRIDORS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return DEFAULT_CORRIDORS;
}

export async function getBrokerBids(): Promise<SpotBrokerBid[]> {
  try {
    const res = await request<ApiResponse<SpotBrokerBid[]>>('/spot-freight/bids');
    if (res?.data && res.data.length > 0) {
      saveLocalBids(res.data);
      return res.data;
    }
  } catch {
    // fallback to localStorage
  }

  return getLocalBids();
}

export async function acceptBrokerBid(bidId: string): Promise<SpotBrokerBid> {
  const currentBids = getLocalBids();
  let matchedBid: SpotBrokerBid | undefined;

  const updatedBids = currentBids.map(b => {
    if (b.id === bidId) {
      const advance = Math.round(b.quotedRateInr * 0.7);
      const balance = b.quotedRateInr - advance;
      const tds = Math.round(b.quotedRateInr * 0.02);
      const tripNo = b.tripSheetNo || `TRP-SPOT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const time = b.issuedAt || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      matchedBid = {
        ...b,
        status: 'ACCEPTED' as const,
        tripSheetNo: tripNo,
        issuedAt: time,
        advanceAmount: advance,
        balanceAmount: balance,
        tdsDeduction: tds
      };
      return matchedBid;
    }
    return {
      ...b,
      status: 'REJECTED' as const
    };
  });

  saveLocalBids(updatedBids);

  try {
    await request<ApiResponse<SpotBrokerBid>>(`/spot-freight/bids/${encodeURIComponent(bidId)}/accept`, {
      method: 'POST'
    });
  } catch {
    // offline or mock
  }

  return matchedBid || currentBids[0];
}

export async function broadcastLoadRequirement(lane: string, tonnage: number, targetMaxHireRate: number): Promise<boolean> {
  try {
    await request<ApiResponse<boolean>>(
      `/spot-freight/broadcast?lane=${encodeURIComponent(lane)}&tonnage=${tonnage}&targetMaxHireRate=${targetMaxHireRate}`,
      { method: 'POST' }
    );
  } catch {
    // generate simulated bids locally
  }

  const generatedBids: SpotBrokerBid[] = [
    {
      id: `BID-${Date.now()}-1`,
      brokerName: 'Express Highway Cargo Logistics',
      contactPerson: 'Gurmeet Singh',
      phone: '+91 98112 77412',
      vehicleNumber: `MH-${Math.floor(10 + Math.random() * 40)}-AB-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleBody: `${tonnage > 20 ? '22-Wheeler Trailer' : '16-Wheeler Multi-Axle'}`,
      quotedRateInr: Math.round(targetMaxHireRate * 0.96),
      varianceVsTargetInr: Math.round(targetMaxHireRate * 0.96) - targetMaxHireRate,
      driverRating: 4.8,
      status: 'PENDING',
      bidReceivedTime: 'Just now'
    },
    {
      id: `BID-${Date.now()}-2`,
      brokerName: 'Khandesh Freight Syndicate',
      contactPerson: 'Sachin Patil',
      phone: '+91 97654 32189',
      vehicleNumber: `GJ-${Math.floor(10 + Math.random() * 25)}-CD-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleBody: '16-Wheeler Tata Signa',
      quotedRateInr: Math.round(targetMaxHireRate * 0.98),
      varianceVsTargetInr: Math.round(targetMaxHireRate * 0.98) - targetMaxHireRate,
      driverRating: 4.7,
      status: 'PENDING',
      bidReceivedTime: 'Just now'
    },
    {
      id: `BID-${Date.now()}-3`,
      brokerName: 'Golden Dumper & Trailer Fleet',
      contactPerson: 'Ramavtar Meena',
      phone: '+91 94140 88231',
      vehicleNumber: `RJ-${Math.floor(10 + Math.random() * 20)}-GA-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleBody: '20 Ton Container 32ft MXL',
      quotedRateInr: Math.round(targetMaxHireRate * 1.02),
      varianceVsTargetInr: Math.round(targetMaxHireRate * 1.02) - targetMaxHireRate,
      driverRating: 4.9,
      status: 'PENDING',
      bidReceivedTime: 'Just now'
    }
  ];

  saveLocalBids(generatedBids);
  return true;
}
