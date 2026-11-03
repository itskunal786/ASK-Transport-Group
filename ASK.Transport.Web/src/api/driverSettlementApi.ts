import { request } from './api';
import type { DriverTripSettlement } from '../types/transportOperations';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const STORAGE_KEY = 'ask_driver_settlements';

export async function getAllDriverSettlements(): Promise<DriverTripSettlement[]> {
  try {
    const res = await request<ApiResponse<DriverTripSettlement[]>>('/driver-settlement');
    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
      }
      return res.data;
    }
  } catch {
    // API offline in static/Vercel demo environment
  }

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // ignore parse error
      }
    }
  }

  return [];
}

export async function getDriverSettlementById(id: string): Promise<DriverTripSettlement | null> {
  try {
    const res = await request<ApiResponse<DriverTripSettlement>>(`/driver-settlement/${encodeURIComponent(id)}`);
    if (res && res.data) return res.data;
  } catch {
    // local fallback
  }

  const all = await getAllDriverSettlements();
  return all.find(s => s.id === id || s.settlementNo === id) || null;
}

export async function createDriverSettlement(item: Partial<DriverTripSettlement>): Promise<DriverTripSettlement> {
  const newItem: DriverTripSettlement = {
    id: item.id || `settle-${Date.now()}`,
    settlementNo: item.settlementNo || `TRP-${new Date().getFullYear()}-SET-${Math.floor(1000 + Math.random() * 9000)}`,
    tripSheetNo: item.tripSheetNo || `TS-${Date.now().toString().slice(-6)}`,
    vehicleNumber: item.vehicleNumber || 'RJ-14-GH-4921',
    driverName: item.driverName || 'Driver',
    driverPhone: item.driverPhone || '+91 98000 00000',
    originCity: item.originCity || 'Hub A',
    destinationCity: item.destinationCity || 'Hub B',
    totalTripKm: item.totalTripKm || 1000,
    standardKmpl: item.standardKmpl || 4.2,
    actualKmpl: item.actualKmpl || 4.2,
    dieselLitersStandard: item.dieselLitersStandard || 238,
    dieselLitersActual: item.dieselLitersActual || 238,
    dieselPenaltyBonusInr: item.dieselPenaltyBonusInr || 0,
    advanceCashGivenInr: item.advanceCashGivenInr || 0,
    dieselCardAdvanceInr: item.dieselCardAdvanceInr || 0,
    fastagTollActualInr: item.fastagTollActualInr || 0,
    driverBhattaFoodInr: item.driverBhattaFoodInr || 0,
    loadingUnloadingExpensesInr: item.loadingUnloadingExpensesInr || 0,
    enrouteMaintenanceRtoInr: item.enrouteMaintenanceRtoInr || 0,
    totalAuthorizedExpensesInr: item.totalAuthorizedExpensesInr || 0,
    netPayableToDriverInr: item.netPayableToDriverInr || 0,
    recoverableFromDriverInr: item.recoverableFromDriverInr || 0,
    status: item.status || 'DRAFT_PENDING_APPROVAL',
    auditedBy: item.auditedBy || 'Fleet Audit Supervisor',
    notes: item.notes || 'Trip settled through electronic hisaab deck.'
  };

  try {
    const res = await request<ApiResponse<DriverTripSettlement>>('/driver-settlement', {
      method: 'POST',
      body: JSON.stringify(newItem),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res && res.data) {
      return res.data;
    }
  } catch {
    // API offline fallback
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const list: DriverTripSettlement[] = saved ? JSON.parse(saved) : [];
      list.unshift(newItem);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }

  return newItem;
}

export async function approveDriverSettlement(id: string): Promise<DriverTripSettlement> {
  const settledDate = new Date().toISOString();

  try {
    const res = await request<ApiResponse<DriverTripSettlement>>(`/driver-settlement/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
    });
    if (res && res.data) return res.data;
  } catch {
    // API offline fallback
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const list: DriverTripSettlement[] = JSON.parse(saved);
        const updated = list.map(s => s.id === id ? { ...s, status: 'SETTLED_CASH_PAID' as const, settledDate } : s);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {}
  }

  return {
    id,
    status: 'SETTLED_CASH_PAID',
    settledDate
  } as any;
}
