import axios from 'axios';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:5208/api';
const API_BASE = `${API_ROOT}/fleet`;

export interface TripExpense {
  id: number;
  tripId: number;
  tripNumber: string;
  driverId: number;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  expenseType: 'Diesel' | 'Toll' | 'TyrePuncture' | 'DriverBhatta' | 'BorderEntry' | 'Maintenance' | 'Other';
  amount: number;
  liters?: number | null;
  fuelStationName?: string | null;
  receiptPhotoUrl?: string | null;
  odometerReading?: number | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
}

export interface ExpenseMetrics {
  totalApproved: number;
  totalPending: number;
  totalDiesel: number;
  totalToll: number;
  pendingCount: number;
  approvedCount: number;
}

export interface TripPnLResult {
  tripId: number;
  tripNumber: string;
  route: string;
  vehicleNumber: string;
  driverName: string;
  financials: {
    grossFreightRevenue: number;
    totalOperatingExpenses: number;
    netProfit: number;
    netMarginPercent: number;
    driverAdvanceGiven: number;
    driverCashSpent: number;
    driverPettyCashBalance: number;
  };
  breakdown: {
    dieselTotal: number;
    tollTotal: number;
    bhattaTotal: number;
    maintenanceTotal: number;
    otherTotal: number;
    totalApprovedExpenses: number;
  };
}

export interface DriverActiveTrip {
  tripId: number;
  tripNumber: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  originHub: string;
  destinationHub: string;
  consigneeName: string;
  consigneePhone: string;
  deliveryAddress: string;
  goodsDescription: string;
  waybillLRNumber: string;
  tripStatus: 'Planned' | 'InTransit' | 'ArrivedAtDestination' | 'Completed';
  startingOdometerKm: number;
  currentOdometerKm: number;
  endingOdometerKm?: number | null;
  deliveryOtp: string;
  isOtpVerified: boolean;
  podPhotoUrl?: string | null;
  podSubmittedAt?: string | null;
}

export interface VehicleMaintenanceAlert {
  vehicleId: number;
  vehicleNumber: string;
  model: string;
  hubName: string;
  driverName: string;
  driverPhone: string;
  insuranceExpiryDate?: string | null;
  insuranceDaysLeft: number;
  fitnessExpiryDate?: string | null;
  fitnessDaysLeft: number;
  pucExpiryDate?: string | null;
  pucDaysLeft: number;
  nationalPermitExpiryDate?: string | null;
  permitDaysLeft: number;
  currentOdometerKm: number;
  nextEngineOilServiceKm: number;
  kmUntilNextService: number;
  overallHealthStatus: 'Critical' | 'Warning' | 'Healthy';
  criticalIssues: string[];
}

export interface FleetMaintenanceSummary {
  fleetAlerts: VehicleMaintenanceAlert[];
  summary: {
    totalVehicles: number;
    criticalCount: number;
    warningCount: number;
    healthyCount: number;
  };
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 1. Trip Expense Operations
export async function getTripExpenses(params?: {
  tripId?: number;
  status?: string;
  expenseType?: string;
}): Promise<{ expenses: TripExpense[]; metrics: ExpenseMetrics }> {
  const res = await axios.get(`${API_BASE}/trip-expenses`, {
    params,
    headers: getAuthHeaders()
  });
  return res.data;
}

export async function createTripExpense(data: {
  tripId?: number;
  tripNumber?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  expenseType: string;
  amount: number;
  liters?: number;
  fuelStationName?: string;
  receiptPhotoUrl?: string;
  odometerReading?: number;
}): Promise<{ message: string; expense: TripExpense }> {
  const res = await axios.post(`${API_BASE}/trip-expenses`, data, {
    headers: getAuthHeaders()
  });
  return res.data;
}

export async function reviewTripExpense(
  id: number,
  data: {
    status: 'Approved' | 'Rejected';
    adminNotes?: string;
    rejectionReason?: string;
  }
): Promise<{ message: string; expense: TripExpense }> {
  const res = await axios.post(`${API_BASE}/trip-expenses/${id}/review`, data, {
    headers: getAuthHeaders()
  });
  return res.data;
}

export async function getTripPnL(tripId: number): Promise<TripPnLResult> {
  const res = await axios.get(`${API_BASE}/trips/${tripId}/pnl`, {
    headers: getAuthHeaders()
  });
  return res.data;
}

// 2. Mobile Driver Console Operations
export async function getDriverActiveTrip(): Promise<DriverActiveTrip> {
  const res = await axios.get(`${API_BASE}/driver/active-trip`, {
    headers: getAuthHeaders()
  });
  return res.data;
}

export async function startDriverTrip(odometerKm: number): Promise<{ message: string; activeTrip: DriverActiveTrip }> {
  const res = await axios.post(`${API_BASE}/driver/start-trip`, { odometerKm }, {
    headers: getAuthHeaders()
  });
  return res.data;
}

export async function verifyDeliveryOtp(otp: string): Promise<{ success: boolean; message: string }> {
  const res = await axios.post(`${API_BASE}/driver/verify-delivery-otp`, { otp }, {
    headers: getAuthHeaders()
  });
  return res.data;
}

export async function submitDriverPod(data: {
  photoUrl?: string;
  receiverNotes?: string;
}): Promise<{ success: boolean; message: string; activeTrip: DriverActiveTrip }> {
  const res = await axios.post(`${API_BASE}/driver/submit-pod`, data, {
    headers: getAuthHeaders()
  });
  return res.data;
}

// 3. Vehicle Maintenance Alerts Operations
export async function getFleetMaintenanceAlerts(): Promise<FleetMaintenanceSummary> {
  const res = await axios.get(`${API_BASE}/maintenance-alerts`, {
    headers: getAuthHeaders()
  });
  return res.data;
}

export async function sendVehicleRenewalAlert(
  vehicleId: number,
  phoneNumber?: string
): Promise<{ success: boolean; message: string }> {
  const res = await axios.post(
    `${API_BASE}/vehicles/${vehicleId}/send-renewal-alert`,
    { phoneNumber },
    { headers: getAuthHeaders() }
  );
  return res.data;
}
