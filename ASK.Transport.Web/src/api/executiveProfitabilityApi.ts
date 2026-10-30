import { request } from './api';
import type { ExecutiveRouteProfitability, BranchPerformanceRanking } from '../types/transportOperations';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getRouteProfitabilityRadar(): Promise<ExecutiveRouteProfitability[]> {
  const res = await request<ApiResponse<ExecutiveRouteProfitability[]>>('/executive-profitability/routes');
  return res.data;
}

export async function getBranchRankings(): Promise<BranchPerformanceRanking[]> {
  const res = await request<ApiResponse<BranchPerformanceRanking[]>>('/executive-profitability/branches');
  return res.data;
}

export async function recalculateRouteMargin(id: string): Promise<ExecutiveRouteProfitability> {
  const res = await request<ApiResponse<ExecutiveRouteProfitability>>(
    `/executive-profitability/routes/${encodeURIComponent(id)}/recalculate`,
    { method: 'POST' }
  );
  return res.data;
}
