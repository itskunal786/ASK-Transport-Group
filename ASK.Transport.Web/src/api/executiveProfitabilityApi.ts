import { request } from './api';
import type { ExecutiveRouteProfitability, BranchPerformanceRanking } from '../types/transportOperations';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const isProductionHttpsLocalhost = (): boolean => {
  if (typeof window === 'undefined') return false;
  const isHttps = window.location.protocol === 'https:';
  const apiRoot = import.meta.env.VITE_API_ROOT || 'http://localhost:5208/api';
  return isHttps && (apiRoot.includes('localhost') || apiRoot.includes('127.0.0.1'));
};

export async function getRouteProfitabilityRadar(): Promise<ExecutiveRouteProfitability[]> {
  if (isProductionHttpsLocalhost()) {
    return [];
  }
  try {
    const res = await request<ApiResponse<ExecutiveRouteProfitability[]>>('/executive-profitability/routes');
    return res.data;
  } catch {
    return [];
  }
}

export async function getBranchRankings(): Promise<BranchPerformanceRanking[]> {
  if (isProductionHttpsLocalhost()) {
    return [];
  }
  try {
    const res = await request<ApiResponse<BranchPerformanceRanking[]>>('/executive-profitability/branches');
    return res.data;
  } catch {
    return [];
  }
}

export async function recalculateRouteMargin(id: string): Promise<ExecutiveRouteProfitability> {
  if (isProductionHttpsLocalhost()) {
    throw new Error('Offline fallback recalculation mode');
  }
  try {
    const res = await request<ApiResponse<ExecutiveRouteProfitability>>(
      `/executive-profitability/routes/${encodeURIComponent(id)}/recalculate`,
      { method: 'POST' }
    );
    return res.data;
  } catch {
    throw new Error('Offline fallback recalculation mode');
  }
}
