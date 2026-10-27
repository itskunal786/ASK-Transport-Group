import { request } from './api';

export interface ClientSupportTicketReply {
  id: number;
  message: string;
  isStaffReply: boolean;
  createdAt: string;
}

export interface ClientSupportTicket {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  closedAt?: string | null;
  replies?: ClientSupportTicketReply[];
}

export interface ClientSupportTicketListResponse {
  success: boolean;
  message: string;
  data: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    data: ClientSupportTicket[];
  };
}

export interface ClientSupportTicketDetailResponse {
  success: boolean;
  message: string;
  data: ClientSupportTicket;
}

export interface CreateSupportTicketPayload {
  subject: string;
  description: string;
  category: string;
  priority: string;
}

export async function getMyTickets(
  page = 1,
  pageSize = 10,
  status = ''
): Promise<ClientSupportTicketListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (status) {
    query.set('status', status);
  }

  return request<ClientSupportTicketListResponse>(`/client/support?${query.toString()}`);
}

export async function getTicketDetails(
  ticketNumber: string
): Promise<ClientSupportTicketDetailResponse> {
  return request<ClientSupportTicketDetailResponse>(
    `/client/support/${encodeURIComponent(ticketNumber)}`
  );
}

export async function createSupportTicket(
  payload: CreateSupportTicketPayload
): Promise<ClientSupportTicketDetailResponse> {
  return request<ClientSupportTicketDetailResponse>('/client/support', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function addTicketReply(
  ticketNumber: string,
  message: string
): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(
    `/client/support/${encodeURIComponent(ticketNumber)}/reply`,
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    }
  );
}

export async function closeSupportTicket(
  ticketNumber: string
): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(
    `/client/support/${encodeURIComponent(ticketNumber)}/close`,
    {
      method: 'PUT',
    }
  );
}
