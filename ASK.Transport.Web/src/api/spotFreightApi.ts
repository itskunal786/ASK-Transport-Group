import { request } from './api';
import type { FreightCorridorIndex, SpotBrokerBid } from '../types/transportOperations';
import type { ApiResponse } from './tyreApi';

export async function getFreightCorridors(): Promise<FreightCorridorIndex[]> {
  const res = await request<ApiResponse<FreightCorridorIndex[]>>('/spot-freight/corridors');
  return res.data;
}

export async function getBrokerBids(): Promise<SpotBrokerBid[]> {
  const res = await request<ApiResponse<SpotBrokerBid[]>>('/spot-freight/bids');
  return res.data;
}

export async function acceptBrokerBid(bidId: string): Promise<SpotBrokerBid> {
  const res = await request<ApiResponse<SpotBrokerBid>>(`/spot-freight/bids/${encodeURIComponent(bidId)}/accept`, {
    method: 'POST'
  });
  return res.data;
}

export async function broadcastLoadRequirement(lane: string, tonnage: number, targetMaxHireRate: number): Promise<boolean> {
  const res = await request<ApiResponse<boolean>>(
    `/spot-freight/broadcast?lane=${encodeURIComponent(lane)}&tonnage=${tonnage}&targetMaxHireRate=${targetMaxHireRate}`,
    { method: 'POST' }
  );
  return res.data;
}
