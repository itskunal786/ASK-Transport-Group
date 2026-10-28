import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import {
  getAdminOperationsSummary,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserRole,
  changeUserStatus,
  getAllRights,
  getUserRights,
  updateUserRights,
  getAuditLogs,
  forceLogoutUser,
  getHubs,
  getSystemSettings,
  updateSystemSetting,
  type AdminOperationsSummary,
  type AdminUserData,
  type SystemPermissionItem,
  type AuditLogItem,
  type HubItem,
  type SystemSettingItem
} from '../../api/adminApi';
import ConsignmentLRModal, { type ConsignmentLRData } from '../../components/ConsignmentLRModal';
import DispatchChallanModal, { type DispatchChallanData } from '../../components/DispatchChallanModal';
import ManualBiltyModal from '../../components/ManualBiltyModal';
import DigitalPodVerifyModal from '../../components/DigitalPodVerifyModal';
import ElectronicPodModal, { type PodData } from '../../components/ElectronicPodModal';
import LiveGpsRouteMap from '../../components/LiveGpsRouteMap';
import type { Shipment } from '../../api/trackingApi';
import { isUserApproved, setUserApproved } from '../../utils/accessControl';
import './AdminDashboard.css';
import AiOperationsDeck from '../../components/AiOperationsDeck';
import AiOcrScannerModal from '../../components/AiOcrScannerModal';
import FleetOperationsDeck from '../../components/FleetOperationsDeck';

interface BookingRow {
  bookingNo: string;
  customer: string;
  route: string;
  date: string;
  status: 'In Transit' | 'Delivered' | 'Pending' | 'Cancelled';
  assignedVehicle?: string;
  assignedDriver?: string;
  driverPhone?: string;
  driverLicense?: string;
  dispatchChallanNo?: string;
  ewayBillNo?: string;
  podVerified?: boolean;
  podPhotoUrl?: string;
  podData?: PodData;
}

export interface SupportTicket {
  id: string;
  customerName: string;
  customerPhone: string;
  consignmentNo: string;
  category: string;
  subject: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  assignedTo: string;
  resolutionNotes?: string;
}

export interface EwayBillRecord {
  ewbNo: string;
  supplierGstin: string;
  supplierName: string;
  recipientGstin: string;
  recipientName: string;
  validFrom: string;
  validUntil: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
  vehicleNo: string;
  hsnCode: string;
  cargoValue: number;
  docNo: string;
  distanceKm: number;
}

export interface TelematicsVehicle {
  plateNo: string;
  driverName: string;
  driverPhone: string;
  speedKmH: number;
  locationName: string;
  lat: number;
  lng: number;
  engineStatus: 'Running' | 'Idling' | 'Stopped';
  geofenceStatus: 'Within Corridor' | 'Route Deviation';
  haltDurationMinutes: number;
  fuelPercent: number;
  lastPing: string;
  routeCorridor: string;
}

interface ShipmentRow {
  shipmentNo: string;
  bookingNo: string;
  customer: string;
  origin: string;
  destination: string;
  driver: string;
  vehicle: string;
  currentLocation: string;
  status: 'Pending' | 'Picked Up' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  updatedAt: string;
}

interface DriverRow {
  id: string;
  name: string;
  phone: string;
  licenseNo: string;
  licenseType: string;
  hub: string;
  status: 'Active' | 'On Trip' | 'Off Duty';
  assignedVehicle?: string;
  tripsCompleted: number;
}

interface VehicleRow {
  plateNo: string;
  model: string;
  type: string;
  capacityTons: number;
  currentHub: string;
  status: 'Available' | 'On Route' | 'Maintenance';
  fuelLevel: string;
}

const INITIAL_BOOKINGS: BookingRow[] = [
  {
    bookingNo: 'ASKB00123',
    customer: 'Rajesh Kumar',
    route: 'Delhi → Mumbai',
    date: '21 Sep 2026',
    status: 'In Transit',
    assignedVehicle: 'DL-01-AB-1234',
    assignedDriver: 'Ramesh Yadav',
    driverPhone: '9811223344',
    driverLicense: 'DL-042018001234',
    dispatchChallanNo: 'CHLN-2026-9021',
    ewayBillNo: '2410-9876-5432'
  },
  {
    bookingNo: 'ASKB00122',
    customer: 'Priya Singh',
    route: 'Bangalore → Chennai',
    date: '18 Sep 2026',
    status: 'Delivered',
    assignedVehicle: 'KA-05-CD-5678',
    assignedDriver: 'Murugan Swamy',
    driverPhone: '9840112233',
    driverLicense: 'TN-012019005678',
    dispatchChallanNo: 'CHLN-2026-8840',
    podVerified: true,
    podData: {
      bookingNumber: 'ASKB00122',
      shipmentNumber: 'SHP-9902',
      deliveredDate: '18 Sep 2026, 03:30 PM',
      receiverName: 'Priya Singh',
      receiverPhone: '9840112233',
      deliveredLocation: 'Chennai Port Container Hub',
      otpVerified: true,
      notes: 'Delivered intact, seal verified.',
      driverName: 'Murugan Swamy'
    }
  },
  {
    bookingNo: 'ASKB00121',
    customer: 'Amit Patel',
    route: 'Pune → Hyderabad',
    date: '15 Sep 2026',
    status: 'Pending'
  },
  {
    bookingNo: 'ASKB00120',
    customer: 'Neha Jain',
    route: 'Delhi → Jaipur',
    date: '12 Sep 2026',
    status: 'Cancelled'
  },
  {
    bookingNo: 'ASKB00119',
    customer: 'Suresh Reddy',
    route: 'Kolkata → Patna',
    date: '10 Sep 2026',
    status: 'In Transit',
    assignedVehicle: 'WB-02-GH-3456',
    assignedDriver: 'Bijoy Das',
    driverPhone: '9833445566',
    driverLicense: 'WB-022017003456',
    dispatchChallanNo: 'CHLN-2026-7719',
    ewayBillNo: '1009-8877-6655'
  },
  {
    bookingNo: 'ASKB00118',
    customer: 'Vikram Mehta',
    route: 'Ahmedabad → Surat',
    date: '08 Sep 2026',
    status: 'Delivered',
    assignedVehicle: 'GJ-01-JK-7890',
    assignedDriver: 'Harish Bhai',
    driverPhone: '9879556677',
    driverLicense: 'GJ-012021007890',
    dispatchChallanNo: 'CHLN-2026-6618',
    podVerified: false // Ready for POD verification
  },
];

const INITIAL_SHIPMENTS: ShipmentRow[] = [
  {
    shipmentNo: 'SHP-9901',
    bookingNo: 'ASKB00123',
    customer: 'Rajesh Kumar',
    origin: 'Delhi Hub',
    destination: 'Mumbai Nhava Sheva',
    driver: 'Ramesh Yadav',
    vehicle: 'DL-01-AB-1234 (32ft MXL)',
    currentLocation: 'Jaipur Expressway Toll Gate',
    status: 'In Transit',
    updatedAt: '10 mins ago'
  },
  {
    shipmentNo: 'SHP-9902',
    bookingNo: 'ASKB00122',
    customer: 'Priya Singh',
    origin: 'Bangalore Hub',
    destination: 'Chennai Port',
    driver: 'Murugan Swamy',
    vehicle: 'KA-05-CD-5678 (14ft Eicher)',
    currentLocation: 'Chennai Destination Terminal',
    status: 'Delivered',
    updatedAt: '2 hours ago'
  },
  {
    shipmentNo: 'SHP-9903',
    bookingNo: 'ASKB00121',
    customer: 'Amit Patel',
    origin: 'Pune MIDC',
    destination: 'Hyderabad Hub',
    driver: 'Santosh Shinde',
    vehicle: 'MH-12-EF-9012 (24ft Container)',
    currentLocation: 'Pune Origin Hub - Loading Bay',
    status: 'Pending',
    updatedAt: '35 mins ago'
  },
  {
    shipmentNo: 'SHP-9904',
    bookingNo: 'ASKB00119',
    customer: 'Suresh Reddy',
    origin: 'Kolkata Hub',
    destination: 'Patna Terminal',
    driver: 'Bijoy Das',
    vehicle: 'WB-02-GH-3456 (19ft Closed)',
    currentLocation: 'Asansol Highway Checkpoint',
    status: 'In Transit',
    updatedAt: '1 hour ago'
  },
  {
    shipmentNo: 'SHP-9905',
    bookingNo: 'ASKB00118',
    customer: 'Vikram Mehta',
    origin: 'Ahmedabad GIDC',
    destination: 'Surat Ring Road',
    driver: 'Harish Bhai',
    vehicle: 'GJ-01-JK-7890 (Tata 407)',
    currentLocation: 'Surat City Hub - Out for Delivery',
    status: 'Out for Delivery',
    updatedAt: '15 mins ago'
  }
];

const INITIAL_DRIVERS: DriverRow[] = [
  { id: 'DRV-101', name: 'Ramesh Yadav', phone: '9811223344', licenseNo: 'DL-042018001234', licenseType: 'Commercial Heavy (HMV)', hub: 'Delhi Hub', status: 'On Trip', assignedVehicle: 'DL-01-AB-1234', tripsCompleted: 142 },
  { id: 'DRV-102', name: 'Murugan Swamy', phone: '9840112233', licenseNo: 'TN-012019005678', licenseType: 'Commercial Medium (MMV)', hub: 'Bangalore Hub', status: 'Active', assignedVehicle: 'KA-05-CD-5678', tripsCompleted: 98 },
  { id: 'DRV-103', name: 'Santosh Shinde', phone: '9822334455', licenseNo: 'MH-122020009012', licenseType: 'Commercial Heavy (HMV)', hub: 'Pune Hub', status: 'Active', assignedVehicle: 'MH-12-EF-9012', tripsCompleted: 76 },
  { id: 'DRV-104', name: 'Bijoy Das', phone: '9833445566', licenseNo: 'WB-022017003456', licenseType: 'Commercial Medium (MMV)', hub: 'Kolkata Hub', status: 'On Trip', assignedVehicle: 'WB-02-GH-3456', tripsCompleted: 115 },
  { id: 'DRV-105', name: 'Harish Bhai', phone: '9879556677', licenseNo: 'GJ-012021007890', licenseType: 'Commercial Light (LMV)', hub: 'Ahmedabad Hub', status: 'On Trip', assignedVehicle: 'GJ-01-JK-7890', tripsCompleted: 64 },
  { id: 'DRV-106', name: 'Gurpreet Singh', phone: '9815001122', licenseNo: 'PB-102016009988', licenseType: 'Commercial Heavy (HMV)', hub: 'Delhi Hub', status: 'Off Duty', assignedVehicle: 'None', tripsCompleted: 210 }
];

const INITIAL_VEHICLES: VehicleRow[] = [
  { plateNo: 'DL-01-AB-1234', model: 'Tata Prima 4028.S', type: '32ft Multi-Axle (MXL)', capacityTons: 18.5, currentHub: 'Delhi Hub', status: 'On Route', fuelLevel: '82%' },
  { plateNo: 'KA-05-CD-5678', model: 'Eicher Pro 2110', type: '14ft Closed Body', capacityTons: 7.2, currentHub: 'Bangalore Hub', status: 'Available', fuelLevel: '95%' },
  { plateNo: 'MH-12-EF-9012', model: 'Ashok Leyland 1618', type: '24ft Container Truck', capacityTons: 12.0, currentHub: 'Pune Hub', status: 'Available', fuelLevel: '68%' },
  { plateNo: 'WB-02-GH-3456', model: 'BharatBenz 1217C', type: '19ft Heavy Medium', capacityTons: 9.5, currentHub: 'Kolkata Hub', status: 'On Route', fuelLevel: '74%' },
  { plateNo: 'GJ-01-JK-7890', model: 'Tata 407 Gold SFC', type: '8ft Express Pickup', capacityTons: 3.5, currentHub: 'Ahmedabad Hub', status: 'On Route', fuelLevel: '88%' },
  { plateNo: 'HR-26-LM-4321', model: 'Mahindra Blazo X 35', type: '32ft Multi-Axle (MXL)', capacityTons: 22.0, currentHub: 'Delhi Hub', status: 'Maintenance', fuelLevel: '45%' }
];

const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-8091',
    customerName: 'Reliance Retail Logistics',
    customerPhone: '+91 98200 12345',
    consignmentNo: 'ASKB00123',
    category: 'Delay in Transit',
    subject: 'Truck delayed at Jaipur Toll bypass, urgent update requested',
    priority: 'Critical',
    status: 'In Progress',
    createdAt: '27 Oct 2026, 09:15 AM',
    assignedTo: 'Dispatch Control - North',
    resolutionNotes: 'Driver contacted; clear of toll congestion now moving at 58 km/h.'
  },
  {
    id: 'TCK-8092',
    customerName: 'Tata Motors Fleet Operations',
    customerPhone: '+91 98223 99887',
    consignmentNo: 'ASKB00122',
    category: 'POD Certificate',
    subject: 'Need stamped e-POD certificate copy for accounting clearance',
    priority: 'Medium',
    status: 'Resolved',
    createdAt: '26 Oct 2026, 05:40 PM',
    assignedTo: 'Finance Operations',
    resolutionNotes: 'Electronic POD generated and mailed to accounting.'
  },
  {
    id: 'TCK-8093',
    customerName: 'Sun Pharma Distribution',
    customerPhone: '+91 98980 44332',
    consignmentNo: 'ASKB00118',
    category: 'Temperature / Speed Telematics',
    subject: 'Verify continuous transit without unscheduled halts in Rajasthan',
    priority: 'High',
    status: 'Open',
    createdAt: '27 Oct 2026, 11:30 AM',
    assignedTo: 'Fleet Radar Team'
  },
  {
    id: 'TCK-8094',
    customerName: 'Havells India Lighting',
    customerPhone: '+91 98110 55667',
    consignmentNo: 'ASKB00120',
    category: 'Billing / Freight Surcharge',
    subject: 'Request fuel surcharge breakdown for October corridor dispatch',
    priority: 'Low',
    status: 'Resolved',
    createdAt: '25 Oct 2026, 02:20 PM',
    assignedTo: 'Tariff Billing Desk',
    resolutionNotes: 'Standard 11.5% diesel surcharge invoice breakdown shared.'
  }
];

const INITIAL_EWAY_BILLS: EwayBillRecord[] = [
  {
    ewbNo: '2410-9876-5432',
    supplierGstin: '07AABCA1234F1Z5',
    supplierName: 'Reliance Retail Ltd - Delhi DC',
    recipientGstin: '27AABCT9988D1Z2',
    recipientName: 'Reliance Retail Hub - Mumbai Bhiwandi',
    validFrom: '26-Oct-2026 10:00 AM',
    validUntil: '29-Oct-2026 11:59 PM',
    status: 'VALID',
    vehicleNo: 'DL-01-AB-1234',
    hsnCode: '8528 - Consumer Electronics',
    cargoValue: 1485000,
    docNo: 'INV/DEL/26/9021',
    distanceKm: 1420
  },
  {
    ewbNo: '1812-4321-9988',
    supplierGstin: '24AABCS7766K1Z9',
    supplierName: 'Sun Pharmaceutical Industries Ltd, Ahmedabad',
    recipientGstin: '07AABCS3322P1Z4',
    recipientName: 'Sun Pharma Central Depot, Okhla Delhi',
    validFrom: '25-Oct-2026 08:30 AM',
    validUntil: '28-Oct-2026 08:30 PM',
    status: 'EXPIRING_SOON',
    vehicleNo: 'GJ-01-JK-7890',
    hsnCode: '3004 - Medicaments & Formulations',
    cargoValue: 2850000,
    docNo: 'SPI/AHM/1089',
    distanceKm: 940
  },
  {
    ewbNo: '1009-8877-6655',
    supplierGstin: '19AABCF4433H1Z1',
    supplierName: 'Kolkata Heavy Foundry Works',
    recipientGstin: '10AABCB5544J1Z8',
    recipientName: 'Patna Infrastructure Grid Ltd',
    validFrom: '20-Oct-2026 06:00 AM',
    validUntil: '23-Oct-2026 11:59 PM',
    status: 'EXPIRED',
    vehicleNo: 'WB-02-GH-3456',
    hsnCode: '7308 - Steel Structures',
    cargoValue: 650000,
    docNo: 'KHF/2026/410',
    distanceKm: 580
  }
];

const INITIAL_TELEMATICS_FLEET: TelematicsVehicle[] = [
  {
    plateNo: 'DL-01-AB-1234',
    driverName: 'Ramesh Yadav',
    driverPhone: '+91 98112 23344',
    speedKmH: 68,
    locationName: 'NH-48 Near Shahpura Toll, Rajasthan',
    lat: 27.3892,
    lng: 75.9587,
    engineStatus: 'Running',
    geofenceStatus: 'Within Corridor',
    haltDurationMinutes: 0,
    fuelPercent: 82,
    lastPing: '15 seconds ago',
    routeCorridor: 'Delhi ⇄ Mumbai High-Speed Freight Corridor'
  },
  {
    plateNo: 'WB-02-GH-3456',
    driverName: 'Bijoy Das',
    driverPhone: '+91 98334 45566',
    speedKmH: 54,
    locationName: 'NH-19 Near Durgapur Expressway',
    lat: 23.5204,
    lng: 87.3119,
    engineStatus: 'Running',
    geofenceStatus: 'Within Corridor',
    haltDurationMinutes: 0,
    fuelPercent: 74,
    lastPing: '45 seconds ago',
    routeCorridor: 'Kolkata ⇄ Patna Corridor'
  },
  {
    plateNo: 'GJ-01-JK-7890',
    driverName: 'Harish Bhai',
    driverPhone: '+91 98795 56677',
    speedKmH: 0,
    locationName: 'NH-48 Near Himatnagar Bypass ढाबा (Rest Stop)',
    lat: 23.5977,
    lng: 72.9698,
    engineStatus: 'Idling',
    geofenceStatus: 'Within Corridor',
    haltDurationMinutes: 52,
    fuelPercent: 88,
    lastPing: '1 min ago',
    routeCorridor: 'Ahmedabad ⇄ Delhi Express Route'
  },
  {
    plateNo: 'HR-26-LM-4321',
    driverName: 'Gurpreet Singh',
    driverPhone: '+91 98150 01122',
    speedKmH: 48,
    locationName: 'State Highway 26, Haryana Rural Link (Off Corridor)',
    lat: 28.4595,
    lng: 77.0266,
    engineStatus: 'Running',
    geofenceStatus: 'Route Deviation',
    haltDurationMinutes: 0,
    fuelPercent: 45,
    lastPing: '20 seconds ago',
    routeCorridor: 'Delhi Hub Local Distribution'
  },
  {
    plateNo: 'KA-05-CD-5678',
    driverName: 'Murugan Swamy',
    driverPhone: '+91 98401 12233',
    speedKmH: 0,
    locationName: 'Bangalore Hub Dock Bay #4 (Unloading)',
    lat: 12.9716,
    lng: 77.5946,
    engineStatus: 'Stopped',
    geofenceStatus: 'Within Corridor',
    haltDurationMinutes: 0,
    fuelPercent: 95,
    lastPing: '2 mins ago',
    routeCorridor: 'Bangalore Regional Logistics'
  }
];

type AdminTab = 'dashboard' | 'bookings' | 'customers' | 'shipments' | 'drivers' | 'vehicles' | 'hubs' | 'tariff' | 'telematics' | 'ewaybill' | 'support' | 'audit' | 'settings' | 'reports' | 'access' | 'ai_automation' | 'fleet_mgmt';

export default function Dashboard() {
  const { user, logout } = useAuth();

  // Active view in Admin Panel
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // OPERATIONAL CONTROL (ADMIN / FLEET MANAGERS) STATE
  // 1. Dispatch Fleet State
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchBookingTarget, setDispatchBookingTarget] = useState<BookingRow | null>(null);
  const [selectedDispatchVehicle, setSelectedDispatchVehicle] = useState('DL-01-AB-1234');
  const [selectedDispatchDriver, setSelectedDispatchDriver] = useState('DRV-101');
  const [dispatchEwayBill, setDispatchEwayBill] = useState('2410-9876-5432');
  const [selectedChallanModalData, setSelectedChallanModalData] = useState<DispatchChallanData | null>(null);

  // 2. Manual Bilty (Counter Booking) Modal
  const [showManualBiltyModal, setShowManualBiltyModal] = useState(false);

  // 3. Digital POD Verification Modal State
  const [podVerifyBooking, setPodVerifyBooking] = useState<BookingRow | null>(null);
  const [viewingElectronicPod, setViewingElectronicPod] = useState<PodData | null>(null);

  // 4. Support Desk & Escalation State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [ticketFilterStatus, setTicketFilterStatus] = useState('All');
  const [ticketFilterPriority, setTicketFilterPriority] = useState('All');
  const [ticketSearch, setTicketSearch] = useState('');
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null);
  const [ticketResolutionNote, setTicketResolutionNote] = useState('');

  // 5. E-Way Bill Auto Verification Engine State
  const [ewayBillsList, setEwayBillsList] = useState<EwayBillRecord[]>(INITIAL_EWAY_BILLS);
  const [ewbSearchInput, setEwbSearchInput] = useState('');
  const [ewbVerificationResult, setEwbVerificationResult] = useState<EwayBillRecord | null>(null);
  const [ewbVerifying, setEwbVerifying] = useState(false);

  // 6. Telematics & GPS Radar State
  const [telematicsFleet, setTelematicsFleet] = useState<TelematicsVehicle[]>(INITIAL_TELEMATICS_FLEET);
  const [telematicsFilter, setTelematicsFilter] = useState<'All' | 'Alerts' | 'Moving' | 'Stationary'>('All');
  const [telematicsSearch, setTelematicsSearch] = useState('');
  const [selectedRadarShipment, setSelectedRadarShipment] = useState<Shipment | null>(null);

  // Emergency Maintenance Switch
  const [isMaintenanceActive, setIsMaintenanceActive] = useState<boolean>(() => {
    return localStorage.getItem('ask_system_maintenance') === 'true';
  });

  // Hub Modal & Management
  const [showAddHubModal, setShowAddHubModal] = useState(false);
  const [newHubCode, setNewHubCode] = useState('');
  const [newHubName, setNewHubName] = useState('');
  const [newHubCity, setNewHubCity] = useState('');
  const [newHubState, setNewHubState] = useState('');
  const [newHubCapacity, setNewHubCapacity] = useState('3000');
  const [newHubAddress, setNewHubAddress] = useState('');
  const [newHubManager, setNewHubManager] = useState('');

  // Tariff & Rate Matrix Engine State
  const [tariffFtlPerKm, setTariffFtlPerKm] = useState('14.50');
  const [tariffFtlMinTrip, setTariffFtlMinTrip] = useState('12000');
  const [tariffPtlPerKgKm, setTariffPtlPerKgKm] = useState('1.85');
  const [tariffPtlMinFloor, setTariffPtlMinFloor] = useState('450');
  const [tariffExpressMult, setTariffExpressMult] = useState('1.75');
  const [tariffFuelSurcharge, setTariffFuelSurcharge] = useState('11.5');
  const [tariffGstPercent, setTariffGstPercent] = useState('18.0');
  const [tariffHandlingFee, setTariffHandlingFee] = useState('250');
  const [tariffSaving, setTariffSaving] = useState(false);

  // Rate Simulator State
  const [simDistanceKm, setSimDistanceKm] = useState<number>(750);
  const [simWeightKg, setSimWeightKg] = useState<number>(1200);
  const [simService, setSimService] = useState<'FTL' | 'PTL' | 'Express'>('PTL');

  // Audit Logs Filter
  const [auditActionFilter, setAuditActionFilter] = useState('All');

  // Digital LR Modal Preview
  const [selectedLr, setSelectedLr] = useState<ConsignmentLRData | null>(null);

  // Hubs State
  const [hubsList, setHubsList] = useState<HubItem[]>([]);
  const [hubsLoading, setHubsLoading] = useState(false);

  // Security & Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [forceLoggingOutId, setForceLoggingOutId] = useState<number | null>(null);

  // Dynamic System Settings State
  const [settingsList, setSettingsList] = useState<SystemSettingItem[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [editingSettings, setEditingSettings] = useState<{ [key: string]: string }>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Dashboard API data
  const [summary, setSummary] = useState<AdminOperationsSummary | null>(null);
  const [activeMonthHover, setActiveMonthHover] = useState<number | null>(null);

  // Bookings list state
  const [bookingsList, setBookingsList] = useState<BookingRow[]>(INITIAL_BOOKINGS);
  const [bookingFilterStatus, setBookingFilterStatus] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');

  // Live Users & Customer Management State
  const [adminUsers, setAdminUsers] = useState<AdminUserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAccess, setNewCustAccess] = useState<'Restricted' | 'Approved'>('Restricted');

  // Edit User State
  const [editingUser, setEditingUser] = useState<AdminUserData | null>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserName, setEditUserName] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserActive, setEditUserActive] = useState(true);
  const [editUserLoading, setEditUserLoading] = useState(false);

  // Role Assignment State (SuperAdmin Only)
  const [roleModalUser, setRoleModalUser] = useState<AdminUserData | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [targetRole, setTargetRole] = useState<'User' | 'Admin' | 'SuperAdmin'>('User');
  const [roleUpdating, setRoleUpdating] = useState(false);

  // Rights Delegation State (SuperAdmin Only)
  const [rightsModalUser, setRightsModalUser] = useState<AdminUserData | null>(null);
  const [showRightsModal, setShowRightsModal] = useState(false);
  const [allSystemRights, setAllSystemRights] = useState<SystemPermissionItem[]>([]);
  const [grantedIds, setGrantedIds] = useState<number[]>([]);
  const [revokedIds, setRevokedIds] = useState<number[]>([]);
  const [rightsLoading, setRightsLoading] = useState(false);
  const [rightsSaving, setRightsSaving] = useState(false);

  // Current Logged-in Admin Rights & Restrictions
  const [myRevokedIds, setMyRevokedIds] = useState<number[]>(() => {
    if (!user || user.role === 'SuperAdmin') return [];
    try {
      const saved = localStorage.getItem(`ask_user_revoked_ids_${user.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  function isTabRevoked(tab: AdminTab): { revoked: boolean; reason?: string } {
    if (!user || user.role === 'SuperAdmin') return { revoked: false };
    if (tab === 'dashboard') return { revoked: false };
    if (tab === 'access') {
      return { revoked: true, reason: 'Super Admin Rights Delegation is restricted to Super Admin master account.' };
    }

    const tabModuleMap: Record<AdminTab, { modules: string[]; codes: string[] }> = {
      dashboard: { modules: [], codes: [] },
      bookings: { modules: ['Bookings'], codes: ['Bookings.View', 'Bookings.Assign', 'Bookings.Cancel', 'Bookings.Create', 'Bookings.Edit', 'Bookings.UpdateStatus'] },
      customers: { modules: ['Users'], codes: ['Users.View', 'Users.Edit'] },
      shipments: { modules: ['Bookings', 'Shipments'], codes: ['Bookings.UpdateStatus', 'Bookings.View', 'Bookings.Assign'] },
      drivers: { modules: ['Drivers'], codes: ['Drivers.View', 'Drivers.Create', 'Drivers.Edit'] },
      vehicles: { modules: ['Vehicles'], codes: ['Vehicles.View', 'Vehicles.Create', 'Vehicles.Edit'] },
      telematics: { modules: ['Telematics', 'Tracking'], codes: ['Telematics.View', 'Tracking.View'] },
      hubs: { modules: ['Hubs', 'Branches'], codes: ['Hubs.View', 'Hubs.Create', 'Branches.View'] },
      tariff: { modules: ['Tariff', 'Pricing'], codes: ['Tariff.View', 'Tariff.Edit'] },
      ewaybill: { modules: ['EwayBill'], codes: ['EwayBill.View', 'EwayBill.Verify'] },
      audit: { modules: ['Audit'], codes: ['Audit.View'] },
      support: { modules: ['Support'], codes: ['Support.View', 'Support.Resolve'] },
      settings: { modules: ['Settings'], codes: ['Settings.View', 'Settings.Edit'] },
      reports: { modules: ['Reports'], codes: ['Reports.View', 'Reports.Export'] },
      access: { modules: ['Roles'], codes: ['Roles.ManagePermissions'] },
      ai_automation: { modules: ['AI', 'Automation'], codes: ['AI.View', 'AI.Use'] },
      fleet_mgmt: { modules: ['Fleet', 'Expenses'], codes: ['Fleet.View', 'Expenses.Approve'] }
    };

    const mapping = tabModuleMap[tab];
    if (!mapping) return { revoked: false };

    // Find revoked rights for this user
    const matchingRevoked = allSystemRights.filter(p => {
      if (!myRevokedIds.includes(p.id)) return false;
      const matchModule = mapping.modules.some(m => m.toLowerCase() === p.module.toLowerCase());
      const matchCode = mapping.codes.some(c => c.toLowerCase() === p.code.toLowerCase());
      return matchModule || matchCode;
    });

    if (matchingRevoked.length > 0) {
      const hasViewRevoked = matchingRevoked.some(p => p.code.toLowerCase().endsWith('.view') || p.action.toLowerCase() === 'view');
      const singleOrDirectMatch = mapping.codes.length <= 2 || hasViewRevoked;
      if (singleOrDirectMatch || matchingRevoked.length >= mapping.codes.length / 2) {
        return {
          revoked: true,
          reason: `Super Admin has revoked access: ${matchingRevoked.map(p => p.code).join(', ')}`
        };
      }
    }

    return { revoked: false };
  }

  // Shipments state
  const [shipmentsList, setShipmentsList] = useState<ShipmentRow[]>(INITIAL_SHIPMENTS);
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [shipmentFilterStatus, setShipmentFilterStatus] = useState('All');
  const [showUpdateShipmentModal, setShowUpdateShipmentModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentRow | null>(null);
  const [newStatus, setNewStatus] = useState<'Pending' | 'Picked Up' | 'In Transit' | 'Out for Delivery' | 'Delivered'>('In Transit');
  const [newLocation, setNewLocation] = useState('');
  const [milestoneNote, setMilestoneNote] = useState('');

  // Drivers state
  const [driversList, setDriversList] = useState<DriverRow[]>(INITIAL_DRIVERS);
  const [driverSearch, setDriverSearch] = useState('');
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showAiScannerModal, setShowAiScannerModal] = useState(false);
  const [aiScannerDocType, setAiScannerDocType] = useState<'driving_license' | 'vehicle_rc' | 'physical_bilty'>('driving_license');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverDL, setNewDriverDL] = useState('');
  const [newDriverType, setNewDriverType] = useState('Commercial Heavy (HMV)');
  const [newDriverHub, setNewDriverHub] = useState('Delhi Hub');

  // Vehicles state
  const [vehiclesList, setVehiclesList] = useState<VehicleRow[]>(INITIAL_VEHICLES);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newPlateNo, setNewPlateNo] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('32ft Multi-Axle (MXL)');
  const [newVehicleCapacity, setNewVehicleCapacity] = useState('16');
  const [newVehicleHub, setNewVehicleHub] = useState('Delhi Hub');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }

  // ================================================================
  // OPERATIONAL CONTROL HANDLERS (ADMIN / FLEET MANAGERS)
  // ================================================================

  // 1. Dispatch Fleet & Driver Allocation
  function handleOpenDispatchModal(booking: BookingRow) {
    setDispatchBookingTarget(booking);
    const availVeh = INITIAL_VEHICLES.find(v => v.status === 'Available') || INITIAL_VEHICLES[0];
    const availDrv = INITIAL_DRIVERS.find(d => d.status === 'Active') || INITIAL_DRIVERS[0];
    setSelectedDispatchVehicle(availVeh?.plateNo || 'DL-01-AB-1234');
    setSelectedDispatchDriver(availDrv?.id || 'DRV-101');
    setDispatchEwayBill(`2410-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`);
    setShowDispatchModal(true);
  }

  function handleConfirmDispatch() {
    if (!dispatchBookingTarget) return;

    const matchedVeh = INITIAL_VEHICLES.find(v => v.plateNo === selectedDispatchVehicle) || INITIAL_VEHICLES[0];
    const matchedDrv = INITIAL_DRIVERS.find(d => d.id === selectedDispatchDriver) || INITIAL_DRIVERS[0];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const challanNo = `CHLN-2026-${randomSuffix}`;

    const updatedBooking: BookingRow = {
      ...dispatchBookingTarget,
      status: 'In Transit',
      assignedVehicle: matchedVeh.plateNo,
      assignedDriver: matchedDrv.name,
      driverPhone: matchedDrv.phone,
      driverLicense: matchedDrv.licenseNo,
      dispatchChallanNo: challanNo,
      ewayBillNo: dispatchEwayBill
    };

    setBookingsList(prev => prev.map(b => b.bookingNo === dispatchBookingTarget.bookingNo ? updatedBooking : b));
    setShowDispatchModal(false);

    const challanData: DispatchChallanData = {
      challanNumber: challanNo,
      bookingNumber: dispatchBookingTarget.bookingNo,
      dispatchDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      originHub: dispatchBookingTarget.route.split('→')[0]?.trim() || 'Origin Hub',
      destinationHub: dispatchBookingTarget.route.split('→')[1]?.trim() || 'Destination Hub',
      consignorName: dispatchBookingTarget.customer,
      consigneeName: `${dispatchBookingTarget.customer} Consignee Hub`,
      vehicleNumber: matchedVeh.plateNo,
      vehicleModel: matchedVeh.model,
      driverName: matchedDrv.name,
      driverPhone: matchedDrv.phone,
      driverLicense: matchedDrv.licenseNo,
      ewayBillNumber: dispatchEwayBill,
      dispatcherName: user?.name || 'Shift Fleet Operations Manager'
    };

    setSelectedChallanModalData(challanData);
    showToast(`✓ Allotted! Driver ${matchedDrv.name} & Truck ${matchedVeh.plateNo} dispatched`);
  }

  function handleOpenChallan(b: BookingRow) {
    const challanData: DispatchChallanData = {
      challanNumber: b.dispatchChallanNo || `CHLN-${b.bookingNo}`,
      bookingNumber: b.bookingNo,
      dispatchDate: b.date,
      originHub: b.route.split('→')[0]?.trim() || 'Delhi Hub',
      destinationHub: b.route.split('→')[1]?.trim() || 'Destination Terminal',
      consignorName: b.customer,
      consigneeName: `${b.customer} Receiver Depot`,
      vehicleNumber: b.assignedVehicle || 'DL-01-AB-1234',
      vehicleModel: '32ft Multi-Axle (MXL)',
      driverName: b.assignedDriver || 'Ramesh Yadav',
      driverPhone: b.driverPhone || '9811223344',
      driverLicense: b.driverLicense || 'DL-042018001234',
      ewayBillNumber: b.ewayBillNo || '2410-9876-5432',
      dispatcherName: user?.name || 'Operations Controller'
    };
    setSelectedChallanModalData(challanData);
  }

  // 2. Manual Bilty (Counter Booking) Handler
  function handleManualBiltySubmit(lrData: ConsignmentLRData) {
    const newBooking: BookingRow = {
      bookingNo: lrData.bookingNumber,
      customer: `[Walk-in] ${lrData.senderName}`,
      route: `${lrData.fromCity} → ${lrData.toCity}`,
      date: lrData.bookingDate || new Date().toISOString().slice(0, 10),
      status: 'In Transit',
      assignedVehicle: 'DL-01-AB-1234',
      assignedDriver: 'Ramesh Yadav',
      driverPhone: '9811223344',
      driverLicense: 'DL-042018001234',
      dispatchChallanNo: `CHLN-2026-M${Math.floor(1000 + Math.random() * 9000)}`,
      ewayBillNo: `2410-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setBookingsList(prev => [newBooking, ...prev]);
    setShowManualBiltyModal(false);
    setSelectedLr(lrData);
    showToast(`✓ Counter Booking created! LR ${lrData.consignmentNumber} generated`);
  }

  // 3. Digital POD Verification Handlers
  function handleApprovePod(pod: PodData) {
    if (!podVerifyBooking) return;
    setBookingsList(prev => prev.map(b => b.bookingNo === podVerifyBooking.bookingNo ? {
      ...b,
      status: 'Delivered',
      podVerified: true,
      podData: pod
    } : b));
    setPodVerifyBooking(null);
    showToast(`✓ POD Verified & Sealed for ${pod.bookingNumber}! Proof of Delivery archived`);
  }

  function handleRejectPod(reason: string) {
    if (!podVerifyBooking) return;
    const newTicket: SupportTicket = {
      id: `TCK-${Math.floor(8100 + Math.random() * 900)}`,
      customerName: podVerifyBooking.customer,
      customerPhone: '+91 98765 00000',
      consignmentNo: podVerifyBooking.bookingNo,
      category: 'POD Missing / Rejected',
      subject: `POD Rejected: ${reason}`,
      priority: 'High',
      status: 'Open',
      createdAt: 'Just now',
      assignedTo: 'Claims & Verification Desk'
    };
    setSupportTickets(prev => [newTicket, ...prev]);
    setPodVerifyBooking(null);
    showToast(`⚠️ POD Rejected! Incident ticket ${newTicket.id} escalated to Support Desk`);
  }

  // 4. E-Way Bill Auto Verification Engine Handler
  function handleVerifyEwayBill(query?: string) {
    const target = (query || ewbSearchInput).trim();
    if (!target) {
      showToast('Please enter an E-Way Bill Number');
      return;
    }
    setEwbVerifying(true);
    setTimeout(() => {
      const existing = ewayBillsList.find(e => e.ewbNo.includes(target) || target.includes(e.ewbNo));
      if (existing) {
        setEwbVerificationResult(existing);
      } else {
        const fetched: EwayBillRecord = {
          ewbNo: target,
          supplierGstin: '07AABCA4567K1Z8',
          supplierName: 'National Logistics Partner Delhi',
          recipientGstin: '27AABCT1234L1Z3',
          recipientName: 'Maharashtra Freight Consignee',
          validFrom: new Date(Date.now() - 3600000 * 12).toLocaleString('en-IN'),
          validUntil: new Date(Date.now() + 3600000 * 48).toLocaleString('en-IN'),
          status: 'VALID',
          vehicleNo: 'DL-01-AB-1234',
          hsnCode: '8471 - Computing Machinery',
          cargoValue: 980000,
          docNo: `INV/2026/${Math.floor(1000 + Math.random() * 9000)}`,
          distanceKm: 1350
        };
        setEwayBillsList(prev => [fetched, ...prev]);
        setEwbVerificationResult(fetched);
      }
      setEwbVerifying(false);
      showToast(`✓ E-Way Bill ${target} verified from National GST System!`);
    }, 600);
  }

  // 5. Support Desk Handlers
  function handleUpdateTicketStatus(ticketId: string, newStatus: SupportTicket['status']) {
    setSupportTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      status: newStatus,
      resolutionNotes: ticketResolutionNote || (newStatus === 'Resolved' ? 'Issue resolved after driver confirmation.' : t.resolutionNotes)
    } : t));
    setEditingTicket(null);
    setTicketResolutionNote('');
    showToast(`✓ Ticket ${ticketId} status updated to ${newStatus}`);
  }

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAdminOperationsSummary();
        setSummary(data);
      } catch (err) {
        console.warn('Backend summary fallback:', err);
      }
    }
    loadData();
    loadUsers();

    // Ensure all system rights are pre-loaded
    getAllRights()
      .then(rights => {
        if (rights && rights.length > 0) {
          setAllSystemRights(rights);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user || user.role === 'SuperAdmin') return;
    const currentAdminId = user.id;

    let isMounted = true;
    async function loadCurrentAdminRights() {
      try {
        const rightsRes = await getUserRights(currentAdminId);
        if (!isMounted) return;
        if (rightsRes) {
          const rev = rightsRes.revokedPermissionIds || [];
          setMyRevokedIds(rev);
          localStorage.setItem(`ask_user_revoked_ids_${currentAdminId}`, JSON.stringify(rev));
        }
      } catch {
        try {
          const saved = localStorage.getItem(`ask_user_revoked_ids_${currentAdminId}`);
          if (saved && isMounted) setMyRevokedIds(JSON.parse(saved));
        } catch {}
      }
    }

    loadCurrentAdminRights();

    function onRightsUpdated(e: any) {
      if (e?.detail?.userId === currentAdminId) {
        setMyRevokedIds(e.detail.revokedIds || []);
      }
    }

    window.addEventListener('ask_rights_updated', onRightsUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('ask_rights_updated', onRightsUpdated);
    };
  }, [user]);

  useEffect(() => {
    if (activeTab === 'hubs') loadHubs();
    if (activeTab === 'audit') loadAuditLogs();
    if (activeTab === 'settings') loadSettings();
  }, [activeTab]);

  async function loadHubs() {
    try {
      setHubsLoading(true);
      const data = await getHubs();
      setHubsList(data);
    } catch (err) {
      console.warn('Backend hubs load error:', err);
    } finally {
      setHubsLoading(false);
    }
  }

  async function loadAuditLogs() {
    try {
      setAuditLoading(true);
      const data = await getAuditLogs({ search: auditSearch });
      if (data && data.data) {
        setAuditLogs(data.data);
      }
    } catch (err) {
      console.warn('Backend audit load error:', err);
    } finally {
      setAuditLoading(false);
    }
  }

  async function handleForceLogout(userId: number, email?: string) {
    if (!window.confirm(`Emergency Kill Switch: Revoke all active bearer tokens and session cookies for user #${userId} (${email || 'Account'}) immediately?`)) {
      return;
    }
    try {
      setForceLoggingOutId(userId);
      const res = await forceLogoutUser(userId);
      showToast(res.message || `Session revoked for user #${userId}`);
      loadAuditLogs();
    } catch (err: any) {
      showToast(err?.message || 'Failed to revoke session');
    } finally {
      setForceLoggingOutId(null);
    }
  }

  async function loadSettings() {
    try {
      setSettingsLoading(true);
      const data = await getSystemSettings();
      setSettingsList(data);
      const mapped: { [key: string]: string } = {};
      data.forEach(s => { mapped[s.key] = s.value; });
      setEditingSettings(mapped);
    } catch (err) {
      console.warn('Backend settings load error:', err);
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleSaveSetting(item: SystemSettingItem) {
    try {
      setSavingKey(item.key);
      const newVal = editingSettings[item.key] ?? item.value;
      const res = await updateSystemSetting({
        key: item.key,
        value: newVal,
        group: item.group,
        description: item.description,
        isPublic: item.isPublic,
      });
      showToast(res.message || `System setting "${item.key}" updated to "${newVal}"`);
      loadSettings();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update setting');
    } finally {
      setSavingKey(null);
    }
  }

  async function loadUsers() {
    try {
      setUsersLoading(true);
      const res = await getAdminUsers({ search: customerSearch });
      if (res && res.data) {
        setAdminUsers(res.data);
      }
    } catch (err) {
      console.warn('Backend users load error:', err);
    } finally {
      setUsersLoading(false);
    }
  }

  // 1. EMERGENCY MAINTENANCE TOGGLE
  async function handleToggleMaintenance() {
    const nextState = !isMaintenanceActive;
    if (!window.confirm(nextState
      ? 'EMERGENCY FREEZE: Freeze all public consignment bookings immediately?'
      : 'RESUME OPERATIONS: Re-open platform for public bookings?'
    )) return;

    setIsMaintenanceActive(nextState);
    localStorage.setItem('ask_system_maintenance', String(nextState));

    try {
      await updateSystemSetting({
        key: 'SYSTEM_MAINTENANCE_MODE',
        value: String(nextState),
        group: 'System',
        description: 'Emergency freeze customer bookings'
      });
      showToast(nextState ? '🔴 Platform bookings FROZEN' : '🟢 Platform live and open for bookings');
      loadAuditLogs();
    } catch {
      showToast(nextState ? '🔴 Platform bookings FROZEN (Local)' : '🟢 Platform live (Local)');
    }
  }

  // 2. HUB & TERMINAL HANDLERS
  async function handleAddHubSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newHubCode.trim() || !newHubName.trim()) {
      showToast('Please provide Hub Code and Name');
      return;
    }
    const newHub: HubItem = {
      id: Date.now(),
      code: newHubCode.trim().toUpperCase(),
      name: newHubName.trim(),
      city: newHubCity.trim() || 'New Hub City',
      state: newHubState.trim() || 'State',
      capacity: parseInt(newHubCapacity) || 2500,
      isActive: true,
      address: newHubAddress.trim(),
      contactNumber: newHubManager.trim()
    };
    setHubsList(prev => [newHub, ...prev]);
    setShowAddHubModal(false);
    setNewHubCode('');
    setNewHubName('');
    setNewHubCity('');
    setNewHubState('');
    setNewHubAddress('');
    showToast(`✓ Hub ${newHub.code} created successfully`);
  }

  function handleToggleHubStatus(hubId: number) {
    setHubsList(prev => prev.map(h => h.id === hubId ? { ...h, isActive: !h.isActive } : h));
    showToast('Hub operational status updated');
  }

  function handleDeleteHub(hubId: number) {
    if (!window.confirm('Are you sure you want to decommission this hub terminal?')) return;
    setHubsList(prev => prev.filter(h => h.id !== hubId));
    showToast('Hub decommissioned');
  }

  // 3. TARIFF & RATE MATRIX HANDLER
  async function handleSaveTariffMatrix() {
    setTariffSaving(true);
    try {
      await updateSystemSetting({ key: 'TARIFF_FTL_PER_KM', value: tariffFtlPerKm, group: 'Pricing' });
      await updateSystemSetting({ key: 'TARIFF_PTL_PER_KG_KM', value: tariffPtlPerKgKm, group: 'Pricing' });
      await updateSystemSetting({ key: 'TARIFF_EXPRESS_MULTIPLIER', value: tariffExpressMult, group: 'Pricing' });
      await updateSystemSetting({ key: 'TARIFF_FUEL_SURCHARGE_PCT', value: tariffFuelSurcharge, group: 'Pricing' });
      await updateSystemSetting({ key: 'TARIFF_GST_PCT', value: tariffGstPercent, group: 'Taxation' });
      await updateSystemSetting({ key: 'TARIFF_HANDLING_INR', value: tariffHandlingFee, group: 'Pricing' });
      showToast('⚡ Tariff & Rate Matrix successfully updated and broadcast to portal!');
    } catch {
      showToast('⚡ Tariff & Rate Matrix updated locally');
    } finally {
      setTariffSaving(false);
    }
  }

  // 4. AUDIT EXPORT
  function exportAuditLogsToCSV() {
    if (auditLogs.length === 0) {
      showToast('No audit logs available to export');
      return;
    }
    const headers = ['Log ID', 'Timestamp', 'Action Event', 'Actor User', 'IP Address', 'Details'];
    const rows = auditLogs.map(l => [
      l.id,
      new Date(l.createdAt).toISOString(),
      `"${l.action.replace(/"/g, '""')}"`,
      `"${(l.userEmail || '').replace(/"/g, '""')}"`,
      `"${(l.ipAddress || '127.0.0.1').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ASK_Transport_Security_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Security Audit Trail downloaded');
  }

  // 5. P&L FINANCIAL STATEMENT EXPORT
  function exportPnlToCSV() {
    const headers = ['Financial Metric', 'Amount (INR)', 'Percentage Share / Status'];
    const rows = [
      ['Gross MTD Turnover', '42,50,000', '100%'],
      ['Actual Cash Collected', '36,80,000', '86.5% Collection Rate'],
      ['Sundry Debtors (Pending Collection)', '5,70,000', '13.5% Outstanding'],
      ['Operational Fleet & Fuel Costs', '18,40,000', '43.3% Cost of Operations'],
      ['EBITDA Net Margin', '18,40,000', '43.2% Profit Margin'],
      ['---', '---', '---'],
      ['Delhi Central Hub Revenue', '16,15,000', '38.0% Share'],
      ['Mumbai Nhava Sheva Terminal', '13,17,500', '31.0% Share'],
      ['Bengaluru Tech & Cargo Park', '7,65,000', '18.0% Share'],
      ['Kolkata East Logistics Gateway', '5,52,500', '13.0% Share'],
    ];
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ASK_Transport_Financial_PnL_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ P&L Statement downloaded');
  }

  // 6. RIGHTS PRESETS
  function applyRightsPreset(preset: 'dispatch' | 'finance' | 'manager' | 'superadmin') {
    if (preset === 'dispatch') {
      const ids = allSystemRights.filter(r => r.module === 'Bookings' || r.module === 'Shipments' || r.module === 'Drivers' || r.module === 'Vehicles').map(r => r.id);
      setGrantedIds(ids.length > 0 ? ids : [1, 2, 4, 5]);
      setRevokedIds([]);
      showToast('⚡ Applied Dispatcher Preset');
    } else if (preset === 'finance') {
      const ids = allSystemRights.filter(r => r.module === 'Payments' || r.module === 'Invoices' || r.module === 'Pricing').map(r => r.id);
      setGrantedIds(ids.length > 0 ? ids : [6, 7, 8]);
      setRevokedIds([]);
      showToast('💳 Applied Accounts & Finance Preset');
    } else if (preset === 'manager') {
      const ids = allSystemRights.filter(r => r.module === 'Bookings' || r.module === 'Hubs' || r.module === 'Shipments').map(r => r.id);
      setGrantedIds(ids.length > 0 ? ids : [1, 2, 3, 5]);
      setRevokedIds([]);
      showToast('🏢 Applied Branch Manager Preset');
    } else if (preset === 'superadmin') {
      setGrantedIds(allSystemRights.map(r => r.id));
      setRevokedIds([]);
      showToast('👑 Applied Super Admin Master Preset (All Rights)');
    }
  }

  function handleOpenEditUser(u: AdminUserData) {
    setEditingUser(u);
    setEditUserName(u.name);
    setEditUserPhone(u.phone);
    setEditUserEmail(u.email);
    setEditUserActive(u.isActive);
    setShowEditUserModal(true);
  }

  async function handleSaveUserEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setEditUserLoading(true);
      const res = await updateAdminUser(editingUser.id, {
        name: editUserName,
        phone: editUserPhone,
        email: editUserEmail,
        isActive: editUserActive
      });
      showToast(res.message || 'User data updated successfully!');
      setShowEditUserModal(false);
      loadUsers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update user');
    } finally {
      setEditUserLoading(false);
    }
  }

  function handleOpenRoleModal(u: AdminUserData) {
    setRoleModalUser(u);
    setTargetRole(u.role);
    setShowRoleModal(true);
  }

  async function handleSaveRole(e: React.FormEvent) {
    e.preventDefault();
    if (!roleModalUser) return;
    try {
      setRoleUpdating(true);
      const res = await updateAdminUserRole(roleModalUser.id, targetRole);
      showToast(res.message || `Role updated to ${targetRole}!`);
      setShowRoleModal(false);
      loadUsers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update role');
    } finally {
      setRoleUpdating(false);
    }
  }

  async function handleOpenRightsModal(u: AdminUserData) {
    setRightsModalUser(u);
    setShowRightsModal(true);
    setRightsLoading(true);
    try {
      const [allRights, userRights] = await Promise.all([
        getAllRights(),
        getUserRights(u.id)
      ]);
      setAllSystemRights(allRights);
      setGrantedIds(userRights.grantedPermissionIds || []);
      setRevokedIds(userRights.revokedPermissionIds || []);
    } catch (err: any) {
      showToast('Failed to load user permissions');
    } finally {
      setRightsLoading(false);
    }
  }

  async function handleSaveRights() {
    if (!rightsModalUser) return;
    try {
      setRightsSaving(true);
      const res = await updateUserRights(rightsModalUser.id, {
        grantedPermissionIds: grantedIds,
        revokedPermissionIds: revokedIds
      });

      // Update persistent storage for instant enforcement
      localStorage.setItem(`ask_user_revoked_ids_${rightsModalUser.id}`, JSON.stringify(revokedIds));
      localStorage.setItem(`ask_user_granted_ids_${rightsModalUser.id}`, JSON.stringify(grantedIds));

      window.dispatchEvent(
        new CustomEvent('ask_rights_updated', {
          detail: { userId: rightsModalUser.id, revokedIds, grantedIds }
        })
      );

      if (user && user.id === rightsModalUser.id) {
        setMyRevokedIds(revokedIds);
      }

      showToast(res.message || 'Rights successfully updated!');
      setShowRightsModal(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to update rights');
    } finally {
      setRightsSaving(false);
    }
  }

  async function handleToggleUserStatus(u: AdminUserData) {
    try {
      const newStatus = !u.isActive;
      await changeUserStatus(u.id, newStatus);
      showToast(`User ${u.name} ${newStatus ? 'activated' : 'suspended'}!`);
      loadUsers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status');
    }
  }

  function handleToggleUserApproval(u: AdminUserData, approved: boolean) {
    setUserApproved(u.id, u.email, approved);
    showToast(
      approved
        ? `✓ Granted Full Access to ${u.name}! (Payments, Invoices & Documents Unlocked)`
        : `🔒 Restricted ${u.name} to Book & Track only.`
    );
    setAdminUsers(prev => prev.map(x => (x.id === u.id ? { ...x, isApproved: approved } : x)));
  }

  // CSV Exporters
  function exportBookingsToCSV() {
    const headers = 'BookingNo,Customer,Route,Date,Status';
    const rows = bookingsList.map(b => `"${b.bookingNo}","${b.customer}","${b.route}","${b.date}","${b.status}"`);
    downloadCSV([headers, ...rows].join('\n'), `ASK_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Bookings report exported to CSV!');
  }

  function exportRevenueToCSV() {
    const headers = 'Month,BookingsCount,RevenueINR,GSTCollectedINR,OnTimeRate';
    const rows = [
      '"Jan 2026","42","385000","69300","99.2%"',
      '"Feb 2026","58","520000","93600","99.5%"',
      '"Mar 2026","65","610000","109800","99.1%"',
      '"Apr 2026","72","690000","124200","99.4%"',
      '"May 2026","80","765000","137700","99.6%"',
      '"Jun 2026","88","840000","151200","99.3%"',
      '"Jul 2026","92","895000","161100","99.7%"',
      '"Aug 2026","98","955000","171900","99.8%"',
      '"Sep 2026","85","820000","147600","99.4%"'
    ];
    downloadCSV([headers, ...rows].join('\n'), `ASK_Revenue_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Revenue ledger exported to CSV!');
  }

  function exportDriversToCSV() {
    const headers = 'DriverID,Name,Phone,LicenseNo,Type,Hub,Status,TripsCompleted';
    const rows = driversList.map(d => `"${d.id}","${d.name}","${d.phone}","${d.licenseNo}","${d.licenseType}","${d.hub}","${d.status}","${d.tripsCompleted}"`);
    downloadCSV([headers, ...rows].join('\n'), `ASK_Drivers_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Driver logs exported to CSV!');
  }

  function exportVehiclesToCSV() {
    const headers = 'PlateNo,Model,Type,CapacityTons,Hub,Status,Fuel';
    const rows = vehiclesList.map(v => `"${v.plateNo}","${v.model}","${v.type}","${v.capacityTons}","${v.currentHub}","${v.status}","${v.fuelLevel}"`);
    downloadCSV([headers, ...rows].join('\n'), `ASK_Fleet_Vehicles_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Fleet registry exported to CSV!');
  }

  function downloadCSV(content: string, filename: string) {
    const csvContent = 'data:text/csv;charset=utf-8,' + content;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Handle Add Customer
  function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!newCustName.trim() || !newCustEmail.trim()) return;

    const newCust: AdminUserData = {
      id: Date.now(),
      name: newCustName.trim(),
      email: newCustEmail.trim(),
      phone: newCustPhone.trim() || '9876543210',
      role: 'User',
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setAdminUsers(prev => [newCust, ...prev]);
    setShowAddCustomerModal(false);
    setNewCustName('');
    setNewCustEmail('');
    setNewCustPhone('');
    const isApprovedSelected = newCustAccess === 'Approved';
    setUserApproved(newCust.id, newCust.email, isApprovedSelected);
    (newCust as any).isApproved = isApprovedSelected;
    setNewCustAccess('Restricted');
    showToast(
      isApprovedSelected
        ? `✓ Customer "${newCust.name}" added with Full Access!`
        : `✓ Customer "${newCust.name}" registered (Restricted to Book & Track only)`
    );
  }

  // Handle Shipment Status Update
  function openUpdateShipmentModal(s: ShipmentRow) {
    setSelectedShipment(s);
    setNewStatus(s.status);
    setNewLocation(s.currentLocation);
    setMilestoneNote('');
    setShowUpdateShipmentModal(true);
  }

  function handleSaveShipmentStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedShipment) return;

    setShipmentsList(prev =>
      prev.map(item =>
        item.shipmentNo === selectedShipment.shipmentNo
          ? {
              ...item,
              status: newStatus,
              currentLocation: newLocation.trim() || item.currentLocation,
              updatedAt: 'Just now'
            }
          : item
      )
    );

    // Also update corresponding booking status if matched
    setBookingsList(prev =>
      prev.map(b =>
        b.bookingNo === selectedShipment.bookingNo
          ? { ...b, status: newStatus === 'Delivered' ? 'Delivered' : newStatus === 'Pending' ? 'Pending' : 'In Transit' }
          : b
      )
    );

    setShowUpdateShipmentModal(false);
    showToast(`Shipment ${selectedShipment.shipmentNo} status updated to "${newStatus}"!`);
  }

  // Handle Add Driver
  function handleAddDriver(e: React.FormEvent) {
    e.preventDefault();
    if (!newDriverName.trim() || !newDriverPhone.trim() || !newDriverDL.trim()) return;

    const newDrv: DriverRow = {
      id: `DRV-${Math.floor(100 + Math.random() * 900)}`,
      name: newDriverName.trim(),
      phone: newDriverPhone.trim(),
      licenseNo: newDriverDL.trim(),
      licenseType: newDriverType,
      hub: newDriverHub,
      status: 'Active',
      tripsCompleted: 0
    };

    setDriversList(prev => [newDrv, ...prev]);
    setShowAddDriverModal(false);
    setNewDriverName('');
    setNewDriverPhone('');
    setNewDriverDL('');
    showToast(`Driver ${newDrv.name} registered successfully!`);
  }

  // Handle Add Vehicle
  function handleAddVehicle(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlateNo.trim() || !newVehicleModel.trim()) return;

    const newVeh: VehicleRow = {
      plateNo: newPlateNo.trim().toUpperCase(),
      model: newVehicleModel.trim(),
      type: newVehicleType,
      capacityTons: parseFloat(newVehicleCapacity) || 10,
      currentHub: newVehicleHub,
      status: 'Available',
      fuelLevel: '100%'
    };

    setVehiclesList(prev => [newVeh, ...prev]);
    setShowAddVehicleModal(false);
    setNewPlateNo('');
    setNewVehicleModel('');
    showToast(`Vehicle ${newVeh.plateNo} registered into fleet!`);
  }

  // Monthly trends data for Bookings Trend chart
  const monthlyTrends = [
    { month: 'Jan', count: 42 },
    { month: 'Feb', count: 58 },
    { month: 'Mar', count: 65 },
    { month: 'Apr', count: 72 },
    { month: 'May', count: 80 },
    { month: 'Jun', count: 88 },
    { month: 'Jul', count: 92 },
    { month: 'Aug', count: 98 },
    { month: 'Sep', count: 85 }
  ];

  const filteredBookings = bookingsList.filter(b => {
    if (bookingFilterStatus !== 'All' && b.status !== bookingFilterStatus) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      return (
        b.bookingNo.toLowerCase().includes(q) ||
        b.customer.toLowerCase().includes(q) ||
        b.route.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredShipments = shipmentsList.filter(s => {
    if (shipmentFilterStatus !== 'All' && s.status !== shipmentFilterStatus) return false;
    if (shipmentSearch.trim()) {
      const q = shipmentSearch.toLowerCase();
      return (
        s.shipmentNo.toLowerCase().includes(q) ||
        s.bookingNo.toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q) ||
        s.origin.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.driver.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredDrivers = driversList.filter(d => {
    if (driverSearch.trim()) {
      const q = driverSearch.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.licenseNo.toLowerCase().includes(q) ||
        d.hub.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredVehicles = vehiclesList.filter(v => {
    if (vehicleSearch.trim()) {
      const q = vehicleSearch.toLowerCase();
      return (
        v.plateNo.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q) ||
        v.currentHub.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter(log => {
    if (auditActionFilter !== 'All' && !log.action.toLowerCase().includes(auditActionFilter.toLowerCase())) {
      return false;
    }
    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Simulator calculation
  const simBaseFreight = simService === 'FTL'
    ? Math.max(simDistanceKm * parseFloat(tariffFtlPerKm || '14.5'), parseFloat(tariffFtlMinTrip || '12000'))
    : Math.max((simDistanceKm * parseFloat(tariffPtlPerKgKm || '1.85') * (simWeightKg / 100)), parseFloat(tariffPtlMinFloor || '450')) * (simService === 'Express' ? parseFloat(tariffExpressMult || '1.75') : 1.0);
  const simFuelCharge = Math.round(simBaseFreight * (parseFloat(tariffFuelSurcharge || '11.5') / 100));
  const simHandling = parseFloat(tariffHandlingFee || '250');
  const simSubtotal = Math.round(simBaseFreight + simFuelCharge + simHandling);
  const simGst = Math.round(simSubtotal * (parseFloat(tariffGstPercent || '18') / 100));
  const simTotal = simSubtotal + simGst;

  return (
    <div className="admin-layout-container">
      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          background: '#07192b',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 600,
          borderLeft: '4px solid #10b981'
        }}>
          {toastMessage}
        </div>
      )}

      {/* 1. DARK ADMIN SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">A</div>
          <div className="admin-brand-text">
            <strong>ASK TRANSPORT</strong>
            <small>LOGISTICS &amp; SUPPLY CHAIN</small>
          </div>
        </div>

        <nav className="admin-nav-menu">
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            Dashboard
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''} ${isTabRevoked('bookings').revoked ? 'revoked' : ''}`}
            onClick={() => setActiveTab('bookings')}
            title={isTabRevoked('bookings').revoked ? 'Access Revoked by Super Admin' : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Bookings
            {isTabRevoked('bookings').revoked && <span className="nav-revoked-pill">🔒 Revoked</span>}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''} ${isTabRevoked('customers').revoked ? 'revoked' : ''}`}
            onClick={() => setActiveTab('customers')}
            title={isTabRevoked('customers').revoked ? 'Access Revoked by Super Admin' : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            User Management
            {isTabRevoked('customers').revoked && <span className="nav-revoked-pill">🔒 Revoked</span>}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'shipments' ? 'active' : ''} ${isTabRevoked('shipments').revoked ? 'revoked' : ''}`}
            onClick={() => setActiveTab('shipments')}
            title={isTabRevoked('shipments').revoked ? 'Access Revoked by Super Admin' : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            Shipments &amp; Dispatch
            {isTabRevoked('shipments').revoked && <span className="nav-revoked-pill">🔒 Revoked</span>}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'drivers' ? 'active' : ''} ${isTabRevoked('drivers').revoked ? 'revoked' : ''}`}
            onClick={() => setActiveTab('drivers')}
            title={isTabRevoked('drivers').revoked ? 'Access Revoked by Super Admin' : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            </svg>
            Drivers
            {isTabRevoked('drivers').revoked && <span className="nav-revoked-pill">🔒 Revoked</span>}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'vehicles' ? 'active' : ''} ${isTabRevoked('vehicles').revoked ? 'revoked' : ''}`}
            onClick={() => setActiveTab('vehicles')}
            title={isTabRevoked('vehicles').revoked ? 'Access Revoked by Super Admin' : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            Fleet &amp; Vehicles
            {isTabRevoked('vehicles').revoked && <span className="nav-revoked-pill">🔒 Revoked</span>}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'fleet_mgmt' ? 'active' : ''}`}
            onClick={() => setActiveTab('fleet_mgmt')}
            style={{
              borderLeft: activeTab === 'fleet_mgmt' ? '3px solid #059669' : undefined,
              background: activeTab === 'fleet_mgmt' ? 'rgba(5, 150, 105, 0.15)' : undefined
            }}
          >
            <span style={{ fontSize: '18px' }}>🚛</span>
            Fleet Petty Cash &amp; P&amp;L
            <span style={{ marginLeft: 'auto', background: '#059669', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>NEW</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'ai_automation' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai_automation')}
            style={{
              borderLeft: activeTab === 'ai_automation' ? '3px solid #6366f1' : undefined,
              background: activeTab === 'ai_automation' ? 'rgba(99, 102, 241, 0.15)' : undefined
            }}
          >
            <span style={{ fontSize: '18px' }}>🤖</span>
            AI &amp; Automation Lab
            <span style={{ marginLeft: 'auto', background: '#6366f1', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>NEW</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'telematics' ? 'active' : ''} ${isTabRevoked('telematics').revoked ? 'revoked' : ''}`}
            onClick={() => setActiveTab('telematics')}
            style={{ borderLeft: activeTab === 'telematics' ? '3px solid #22c55e' : undefined }}
            title={isTabRevoked('telematics').revoked ? 'Access Revoked by Super Admin' : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            🛰️ Fleet Telematics (GPS)
            {isTabRevoked('telematics').revoked && <span className="nav-revoked-pill">🔒 Revoked</span>}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'hubs' ? 'active' : ''} ${isTabRevoked('hubs').revoked ? 'revoked' : ''}`}
            onClick={() => setActiveTab('hubs')}
            title={isTabRevoked('hubs').revoked ? 'Access Revoked by Super Admin' : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Hubs &amp; Terminals
            {isTabRevoked('hubs').revoked && <span className="nav-revoked-pill">🔒 Revoked</span>}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'tariff' ? 'active' : ''} ${isTabRevoked('tariff').revoked ? 'revoked' : ''}`}
            onClick={() => setActiveTab('tariff')}
            style={user?.role === 'SuperAdmin' ? { borderLeft: '3px solid #38bdf8', color: '#e0f2fe' } : {}}
            title={isTabRevoked('tariff').revoked ? 'Access Revoked by Super Admin' : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="6" y1="8" x2="6" y2="8" />
              <line x1="10" y1="8" x2="10" y2="8" />
              <line x1="14" y1="8" x2="18" y2="8" />
              <line x1="6" y1="12" x2="6" y2="12" />
              <line x1="10" y1="12" x2="10" y2="12" />
              <line x1="14" y1="12" x2="18" y2="12" />
            </svg>
            ⚡ Tariff &amp; Rate Matrix
            {isTabRevoked('tariff').revoked && <span className="nav-revoked-pill">🔒 Revoked</span>}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'ewaybill' ? 'active' : ''} ${isTabRevoked('ewaybill').revoked ? 'revoked' : ''}`}
            onClick={() => setActiveTab('ewaybill')}
            title={isTabRevoked('ewaybill').revoked ? 'Access Revoked by Super Admin' : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
            </svg>
            ⚡ E-Way Bill Engine
            {isTabRevoked('ewaybill').revoked && <span className="nav-revoked-pill">🔒 Revoked</span>}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'audit' ? 'active' : ''} ${isTabRevoked('audit').revoked ? 'revoked' : ''}`}
            onClick={() => setActiveTab('audit')}
            title={isTabRevoked('audit').revoked ? 'Access Revoked by Super Admin' : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            Security &amp; Audit Trail
            {isTabRevoked('audit').revoked && <span className="nav-revoked-pill">🔒 Revoked</span>}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'support' ? 'active' : ''} ${isTabRevoked('support').revoked ? 'revoked' : ''}`}
            onClick={() => setActiveTab('support')}
            title={isTabRevoked('support').revoked ? 'Access Revoked by Super Admin' : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            🎧 Support &amp; Escalations
            {isTabRevoked('support').revoked && <span className="nav-revoked-pill">🔒 Revoked</span>}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''} ${isTabRevoked('settings').revoked ? 'revoked' : ''}`}
            onClick={() => setActiveTab('settings')}
            title={isTabRevoked('settings').revoked ? 'Access Revoked by Super Admin' : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            System Settings
            {isTabRevoked('settings').revoked && <span className="nav-revoked-pill">🔒 Revoked</span>}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''} ${isTabRevoked('reports').revoked ? 'revoked' : ''}`}
            onClick={() => setActiveTab('reports')}
            title={isTabRevoked('reports').revoked ? 'Access Revoked by Super Admin' : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Reports &amp; Export
            {isTabRevoked('reports').revoked && <span className="nav-revoked-pill">🔒 Revoked</span>}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'access' ? 'active' : ''}`}
            onClick={() => setActiveTab('access')}
            style={user?.role === 'SuperAdmin' ? { borderLeft: '3px solid #f59e0b', color: '#fef3c7' } : {}}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {user?.role === 'SuperAdmin' ? '👑 Rights & Delegation' : 'Staff Access'}
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/landing" className="admin-switch-link">
            🌐 Public Website
          </Link>

          <button type="button" onClick={logout} className="admin-logout-btn">
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT */}
      <main className="admin-main-viewport">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="admin-top-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={
                activeTab === 'bookings'
                  ? bookingSearch
                  : activeTab === 'customers'
                  ? customerSearch
                  : activeTab === 'shipments'
                  ? shipmentSearch
                  : activeTab === 'drivers'
                  ? driverSearch
                  : activeTab === 'vehicles'
                  ? vehicleSearch
                  : ''
              }
              onChange={e => {
                const val = e.target.value;
                if (activeTab === 'bookings') setBookingSearch(val);
                else if (activeTab === 'customers') setCustomerSearch(val);
                else if (activeTab === 'shipments') setShipmentSearch(val);
                else if (activeTab === 'drivers') setDriverSearch(val);
                else if (activeTab === 'vehicles') setVehicleSearch(val);
              }}
            />
          </div>

          <div className="admin-top-profile">
            <ThemeToggle />

            <div className="admin-profile-pill">
              <div
                className="admin-user-avatar"
                style={user?.role === 'SuperAdmin' ? { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' } : {}}
              >
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="admin-user-names">
                <strong>{user?.name || 'Administrator'}</strong>
                <small style={user?.role === 'SuperAdmin' ? { color: '#f59e0b', fontWeight: 700 } : {}}>
                  {user?.role === 'SuperAdmin' ? '👑 Super Admin • Full Rights' : 'Admin • Operations Access'}
                </small>
              </div>
            </div>
          </div>
        </header>

        {/* EMERGENCY MAINTENANCE CONTROL BAR */}
        <div className={`admin-maintenance-bar ${isMaintenanceActive ? 'alert' : 'normal'}`}>
          <div className="maintenance-info">
            <span className="pulse-dot" />
            <strong>{isMaintenanceActive ? '⚠️ EMERGENCY MAINTENANCE ACTIVE: PUBLIC BOOKINGS PAUSED' : '🟢 PLATFORM LIVE & FULLY OPERATIONAL'}</strong>
            <span>{isMaintenanceActive ? 'Online consignment bookings are frozen across web & mobile portals' : 'All public rate calculators, online bookings, and vehicle dispatches running normally'}</span>
          </div>
          {user?.role === 'SuperAdmin' && (
            <button
              type="button"
              className={`admin-maintenance-toggle-btn ${isMaintenanceActive ? 'btn-resume' : 'btn-freeze'}`}
              onClick={handleToggleMaintenance}
            >
              {isMaintenanceActive ? '▶ Resume Public Bookings' : '⏸ Emergency Booking Freeze'}
            </button>
          )}
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: DASHBOARD TAB */}
        {/* ============================================================== */}
        {activeTab === 'dashboard' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Operations Command Center</h1>
                <p>Real-time analytics and freight fleet monitoring</p>
              </div>

              <div className="admin-title-actions">
                <button type="button" className="admin-btn-export" onClick={exportBookingsToCSV}>
                  Export CSV
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => setActiveTab('bookings')}
                >
                  Manage Bookings →
                </button>
              </div>
            </div>

            {/* 4 TOP METRIC BOXES */}
            <div className="admin-metrics-grid">
              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon bookings">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div className="admin-box-content">
                    <strong>{summary?.totalBookings && summary.totalBookings > 0 ? summary.totalBookings : 1284}</strong>
                    <span>Total Bookings</span>
                  </div>
                </div>
                <div className="admin-box-delta green">
                  ↑ 12.5% vs previous 30 days
                </div>
              </div>

              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon transit">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                    </svg>
                  </div>
                  <div className="admin-box-content">
                    <strong>{summary?.inTransitShipments && summary.inTransitShipments > 0 ? summary.inTransitShipments : 184}</strong>
                    <span>Active In-Transit</span>
                  </div>
                </div>
                <div className="admin-box-delta green">
                  ↑ 5.2% on highways
                </div>
              </div>

              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon delivered">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div className="admin-box-content">
                    <strong>{summary?.deliveredBookings && summary.deliveredBookings > 0 ? summary.deliveredBookings : 1032}</strong>
                    <span>Delivered (Month)</span>
                  </div>
                </div>
                <div className="admin-box-delta green">
                  99.4% on-time SLA
                </div>
              </div>

              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon pending">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className="admin-box-content">
                    <strong>₹{(summary?.successfulPaymentAmount && summary.successfulPaymentAmount > 0 ? summary.successfulPaymentAmount : 4250000).toLocaleString('en-IN')}</strong>
                    <span>Gross Revenue</span>
                  </div>
                </div>
                <div className="admin-box-delta green">
                  ↑ 18.2% GST Invoiced
                </div>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="admin-charts-grid">
              <div className="admin-chart-card">
                <div className="admin-chart-head">
                  <h3>Monthly Bookings Trend</h3>
                  <div className="admin-chart-sub">Showing 2026 Monthly Volume</div>
                </div>

                <div className="admin-bar-chart-container">
                  {monthlyTrends.map((item, idx) => {
                    const isHovered = activeMonthHover === idx;
                    const maxVal = 100;
                    const heightPercent = Math.round((item.count / maxVal) * 100);

                    return (
                      <div
                        key={idx}
                        className="admin-bar-col"
                        onMouseEnter={() => setActiveMonthHover(idx)}
                        onMouseLeave={() => setActiveMonthHover(null)}
                      >
                        {isHovered && (
                          <div className="admin-bar-tooltip">
                            <strong>{item.count} </strong>
                            <span>bookings</span>
                          </div>
                        )}
                        <div
                          className={`admin-bar-fill ${isHovered ? 'active' : ''}`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="admin-bar-label">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="admin-chart-card">
                <div className="admin-chart-head">
                  <h3>Shipment Status Breakdown</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>245 Active Units</span>
                </div>

                <div className="admin-donut-wrapper">
                  <div className="admin-donut-svg-wrap">
                    <svg viewBox="0 0 36 36" width="100%" height="100%">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="3.8"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="4"
                        strokeDasharray="40, 100"
                        strokeDashoffset="25"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#0b72e7"
                        strokeWidth="4"
                        strokeDasharray="35, 100"
                        strokeDashoffset="-15"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="4"
                        strokeDasharray="15, 100"
                        strokeDashoffset="-50"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="4"
                        strokeDasharray="10, 100"
                        strokeDashoffset="-65"
                      />
                    </svg>

                    <div className="admin-donut-center">
                      <strong>245</strong>
                      <small>Total Units</small>
                    </div>
                  </div>

                  <div className="admin-donut-legend">
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot delivered" />
                      <span>Delivered</span>
                      <strong className="admin-legend-val">40%</strong>
                    </div>
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot transit" />
                      <span>In Transit</span>
                      <strong className="admin-legend-val">35%</strong>
                    </div>
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot pending" />
                      <span>Pending</span>
                      <strong className="admin-legend-val">15%</strong>
                    </div>
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot cancelled" />
                      <span>Cancelled</span>
                      <strong className="admin-legend-val">10%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: FLEET PETTY CASH & TRIP P&L OPERATIONS DECK */}
        {/* ============================================================== */}
        {activeTab === 'fleet_mgmt' && (
          <div className="admin-content-pad">
            <FleetOperationsDeck />
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 0: AI & SMART AUTOMATION LAB */}
        {/* ============================================================== */}
        {activeTab === 'ai_automation' && (
          <div className="admin-content-pad">
            <AiOperationsDeck
              onApplyOcrData={(type, extracted) => {
                if (type === 'driving_license') {
                  setNewDriverName(extracted.fullName || '');
                  setNewDriverPhone(extracted.mobileNumber || '');
                  setNewDriverDL(extracted.dlNumber || '');
                  setShowAddDriverModal(true);
                  showToast(`✓ Driver DL verified via MoRTH Sarathi! Opening Add Driver modal.`);
                } else if (type === 'vehicle_rc') {
                  setNewPlateNo(extracted.registrationNumber || '');
                  setNewVehicleModel(extracted.makerModel || '');
                  setNewVehicleCapacity(String(Math.round((extracted.payloadCapacityKg || 18500) / 1000)));
                  setShowAddVehicleModal(true);
                  showToast(`✓ Vehicle RC verified via Vahan! Opening Add Vehicle modal.`);
                } else {
                  showToast(`✓ Bilty LR ${extracted.biltyNumber || ''} scanned successfully!`);
                }
              }}
            />
          </div>
        )}

        {/* ACCESS REVOKED SHIELD FOR RESTRICTED TABS */}
        {activeTab !== 'dashboard' && isTabRevoked(activeTab).revoked ? (
          <div className="admin-content-pad">
            <div className="admin-revoked-card">
              <div className="admin-revoked-icon">🔒</div>
              <h2>Module Access Revoked</h2>
              <p className="admin-revoked-desc">
                Aapke account (<strong>{user?.name || user?.email}</strong>) se iss module ka right Super Admin dwara revoke kar diya gaya hai.
              </p>
              <div className="admin-revoked-details">
                <strong>Revoked Security Policy:</strong>
                <span>{isTabRevoked(activeTab).reason}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)', marginTop: '14px' }}>
                Aap iss subsystem ke data ya features ko operate nahi kar sakte. Agar aapko access chahiye, toh kripya Super Admin se rights delegate karwayein.
              </p>
              <button
                type="button"
                className="admin-btn-primary"
                style={{ marginTop: '18px' }}
                onClick={() => setActiveTab('dashboard')}
              >
                ← Return to Admin Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
        {/* ============================================================== */}
        {/* VIEW 2: BOOKINGS TAB */}
        {/* ============================================================== */}
        {activeTab === 'bookings' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Manage Customer Bookings</h1>
                <p>Consignments, schedules, and carrier allocations</p>
              </div>

              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-primary"
                  style={{ background: '#0284c7' }}
                  onClick={() => setShowManualBiltyModal(true)}
                >
                  + Manual Bilty (Counter Booking)
                </button>
                <button type="button" className="admin-btn-export" onClick={exportBookingsToCSV}>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="admin-table-card">
              <div className="admin-table-toolbar">
                <div className="admin-toolbar-search">
                  <input
                    type="text"
                    placeholder="Search by Booking #, Customer, or Route..."
                    value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                  />
                </div>

                <div className="admin-toolbar-filter">
                  {['All', 'In Transit', 'Delivered', 'Pending', 'Cancelled'].map(st => (
                    <button
                      key={st}
                      type="button"
                      className={`admin-filter-pill ${bookingFilterStatus === st ? 'active' : ''}`}
                      onClick={() => setBookingFilterStatus(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Booking No</th>
                    <th>Customer</th>
                    <th>Route</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b, i) => (
                    <tr key={i}>
                      <td><strong style={{ color: '#0b72e7' }}>{b.bookingNo}</strong></td>
                      <td style={{ fontWeight: 600 }}>{b.customer}</td>
                      <td>{b.route}</td>
                      <td style={{ color: '#64748b' }}>{b.date}</td>
                      <td>
                        <span
                          className="admin-badge-status"
                          style={{
                            background:
                              b.status === 'Delivered' ? '#edfdf4' :
                              b.status === 'In Transit' ? '#e0f2fe' :
                              b.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                            color:
                              b.status === 'Delivered' ? '#10b981' :
                              b.status === 'In Transit' ? '#0b72e7' :
                              b.status === 'Pending' ? '#d97706' : '#dc2626'
                          }}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {/* 1. FLEET & DRIVER ALLOCATION (DISPATCH) */}
                          {!b.assignedVehicle ? (
                            <button
                              type="button"
                              onClick={() => handleOpenDispatchModal(b)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid #10b981',
                                background: '#ecfdf5',
                                color: '#059669',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              ⚡ Allot Fleet
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenChallan(b)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid #c7d2fe',
                                background: '#eef2ff',
                                color: '#4338ca',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              title={`Vehicle: ${b.assignedVehicle} | Driver: ${b.assignedDriver}`}
                            >
                              🚛 Challan
                            </button>
                          )}

                          {/* 2. DIGITAL POD VERIFICATION */}
                          {b.status === 'Delivered' && (
                            b.podVerified ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (b.podData) {
                                    setViewingElectronicPod(b.podData);
                                  } else {
                                    setViewingElectronicPod({
                                      bookingNumber: b.bookingNo,
                                      deliveredDate: `${b.date}, 04:00 PM`,
                                      receiverName: b.customer,
                                      receiverPhone: '9876543210',
                                      deliveredLocation: b.route.split('→')[1]?.trim() || 'Destination Hub',
                                      otpVerified: true,
                                      notes: 'Delivered in good condition with receiver sign verified.',
                                      driverName: b.assignedDriver || 'Commercial Driver'
                                    });
                                  }
                                }}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #86efac',
                                  background: '#f0fdf4',
                                  color: '#166534',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                ✓ POD Verified
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setPodVerifyBooking(b)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #fde68a',
                                  background: '#fffbeb',
                                  color: '#b45309',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                📸 Verify POD
                              </button>
                            )
                          )}

                          <button
                            type="button"
                            className="admin-btn-view"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => {
                              const foundShip = shipmentsList.find(s => s.bookingNo === b.bookingNo);
                              if (foundShip) {
                                openUpdateShipmentModal(foundShip);
                              } else {
                                alert(`Booking: ${b.bookingNo}\nCustomer: ${b.customer}\nRoute: ${b.route}\nStatus: ${b.status}`);
                              }
                            }}
                          >
                            Status
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLr({
                                bookingNumber: b.bookingNo,
                                consignmentNumber: `LR-${b.bookingNo}`,
                                bookingDate: b.date,
                                fromCity: b.route.split('→')[0]?.trim() || 'Origin Hub',
                                toCity: b.route.split('→')[1]?.trim() || 'Destination Terminal',
                                senderName: b.customer,
                                senderPhone: '9876543210',
                                receiverName: 'Authorized Consignee',
                                receiverPhone: '9812345678',
                                goodsType: 'Commercial Goods',
                                weight: 450,
                                quantity: 10,
                                freightAmount: 8500,
                                gstAmount: 1530,
                                totalAmount: 10030,
                                status: b.status,
                              });
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid #bfdbfe',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            📄 LR
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: USER MANAGEMENT & UPDATION TAB */}
        {/* ============================================================== */}
        {activeTab === 'customers' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>User Directory &amp; Data Management</h1>
                <p>Manage user profiles, edit contact information, toggle account status, and delegate administrative roles</p>
              </div>

              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-export"
                  onClick={loadUsers}
                  disabled={usersLoading}
                >
                  {usersLoading ? 'Refreshing...' : '🔄 Refresh Users'}
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => setShowAddCustomerModal(true)}
                >
                  + Add User
                </button>
              </div>
            </div>

            <div className="admin-table-card">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '16%' }}>User &amp; ID</th>
                    <th style={{ width: '18%' }}>Email Address</th>
                    <th style={{ width: '12%' }}>Mobile Phone</th>
                    <th style={{ width: '12%' }}>Assigned Role</th>
                    <th style={{ width: '15%' }}>Access Clearance</th>
                    <th style={{ width: '9%' }}>Status</th>
                    <th style={{ width: '18%', whiteSpace: 'nowrap', minWidth: '340px' }}>Actions &amp; Delegation</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.length > 0 ? (
                    adminUsers.map(u => {
                      const userApproved = isUserApproved(u);
                      return (
                        <tr key={u.id}>
                          <td style={{ verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>{u.name}</div>
                            <small style={{ color: '#94a3b8', fontSize: '11px' }}>ID: #{u.id}</small>
                          </td>
                          <td style={{ verticalAlign: 'middle', color: '#0b72e7', fontWeight: 500 }}>{u.email}</td>
                          <td style={{ verticalAlign: 'middle', color: 'var(--text-secondary, #94a3b8)' }}>{u.phone || '—'}</td>
                          <td style={{ verticalAlign: 'middle' }}>
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background:
                                  u.role === 'SuperAdmin'
                                    ? '#fef3c7'
                                    : u.role === 'Admin'
                                    ? '#ede9fe'
                                    : '#e0f2fe',
                                color:
                                  u.role === 'SuperAdmin'
                                    ? '#b45309'
                                    : u.role === 'Admin'
                                    ? '#6d28d9'
                                    : '#0284c7'
                              }}
                            >
                              {u.role === 'SuperAdmin' ? '👑 Super Admin' : u.role === 'Admin' ? '⚡ Admin' : '👤 User'}
                            </span>
                          </td>
                          <td style={{ verticalAlign: 'middle' }}>
                            {u.role === 'SuperAdmin' ? (
                              <span
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                👑 Full Master
                              </span>
                            ) : u.role === 'Admin' ? (
                              <span
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: '#ede9fe',
                                  color: '#6d28d9',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                ⚡ Admin Cleared
                              </span>
                            ) : userApproved ? (
                              <span
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: '#edfdf4',
                                  color: '#16a34a',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="Payments, Invoices &amp; Documents Unlocked"
                              >
                                🟢 Full Access (Approved)
                              </span>
                            ) : (
                              <span
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="New User Restricted to Book &amp; Track only"
                              >
                                🟡 Book &amp; Track Only
                              </span>
                            )}
                          </td>
                          <td style={{ verticalAlign: 'middle' }}>
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                background: u.isActive ? '#edfdf4' : '#fee2e2',
                                color: u.isActive ? '#10b981' : '#dc2626'
                              }}
                            >
                              {u.isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <div className="admin-table-action-row">
                              {/* Quick Approval / Restriction Action for Regular Users */}
                              {u.role === 'User' && (
                                !userApproved ? (
                                  <button
                                    type="button"
                                    className="admin-btn-action-approve"
                                    onClick={() => handleToggleUserApproval(u, true)}
                                    title="Grant Full Role Access (Unlock Invoices, Payments, Documents)"
                                  >
                                    🔓 Grant Full Access
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="admin-btn-action-restrict"
                                    onClick={() => handleToggleUserApproval(u, false)}
                                    title="Restrict user back to Book &amp; Track only"
                                  >
                                    🔒 Restrict Access
                                  </button>
                                )
                              )}

                              <button
                                type="button"
                                className="admin-btn-action-edit"
                                onClick={() => handleOpenEditUser(u)}
                                title="Edit user details"
                              >
                                ✏️ Edit
                              </button>

                              <button
                                type="button"
                                className={`admin-btn-action-status ${u.isActive ? 'suspend' : 'activate'}`}
                                onClick={() => handleToggleUserStatus(u)}
                                title={u.isActive ? 'Suspend User' : 'Activate User'}
                              >
                                {u.isActive ? 'Suspend' : 'Activate'}
                              </button>

                              {user?.role === 'SuperAdmin' && (
                                <>
                                  <button
                                    type="button"
                                    className="admin-btn-action-role"
                                    onClick={() => handleOpenRoleModal(u)}
                                    title="Change User Role (SuperAdmin Only)"
                                  >
                                    👑 Role
                                  </button>

                                  <button
                                    type="button"
                                    className="admin-btn-action-rights"
                                    onClick={() => handleOpenRightsModal(u)}
                                    title="Delegate or Revoke Specific Rights (SuperAdmin Only)"
                                  >
                                    🛡️ Rights
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        {usersLoading ? 'Loading users...' : 'No users found matching your query.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: SHIPMENTS & DISPATCH (NEW) */}
        {/* ============================================================== */}
        {activeTab === 'shipments' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Live Shipments &amp; Dispatch</h1>
                <p>Real-time vehicle tracking, driver allocation, and milestone updater</p>
              </div>

              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => {
                    const first = shipmentsList[0];
                    if (first) openUpdateShipmentModal(first);
                  }}
                >
                  ⚡ Quick Status Update
                </button>
              </div>
            </div>

            <div className="admin-table-card">
              <div className="admin-table-toolbar">
                <div className="admin-toolbar-search">
                  <input
                    type="text"
                    placeholder="Search by Shipment #, Driver, or Hub..."
                    value={shipmentSearch}
                    onChange={e => setShipmentSearch(e.target.value)}
                  />
                </div>

                <div className="admin-toolbar-filter">
                  {['All', 'In Transit', 'Out for Delivery', 'Delivered', 'Pending'].map(st => (
                    <button
                      key={st}
                      type="button"
                      className={`admin-filter-pill ${shipmentFilterStatus === st ? 'active' : ''}`}
                      onClick={() => setShipmentFilterStatus(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Shipment ID</th>
                    <th>Booking / Client</th>
                    <th>Origin → Destination</th>
                    <th>Driver &amp; Vehicle</th>
                    <th>Current Checkpoint</th>
                    <th>Status</th>
                    <th>Dispatch Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.map((s, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong style={{ color: '#0b72e7' }}>{s.shipmentNo}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{s.updatedAt}</div>
                      </td>
                      <td>
                        <strong>{s.customer}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Waybill: {s.bookingNo}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.origin}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>→ {s.destination}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.driver}</div>
                        <div style={{ fontSize: '11px', color: '#0b72e7' }}>{s.vehicle}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>
                          📍 {s.currentLocation}
                        </span>
                      </td>
                      <td>
                        <span
                          className="admin-badge-status"
                          style={{
                            background:
                              s.status === 'Delivered' ? '#edfdf4' :
                              s.status === 'Out for Delivery' ? '#e0f2fe' :
                              s.status === 'In Transit' ? '#eff6ff' : '#fef3c7',
                            color:
                              s.status === 'Delivered' ? '#10b981' :
                              s.status === 'Out for Delivery' ? '#0369a1' :
                              s.status === 'In Transit' ? '#0b72e7' : '#d97706'
                          }}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn-view"
                          onClick={() => openUpdateShipmentModal(s)}
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 5: DRIVERS (NEW) */}
        {/* ============================================================== */}
        {activeTab === 'drivers' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Drivers &amp; Operators Directory</h1>
                <p>Commercial license records, hub allocations, and availability</p>
              </div>

              <div className="admin-title-actions">
                <button type="button" className="admin-btn-export" onClick={exportDriversToCSV}>
                  Export Drivers CSV
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => setShowAddDriverModal(true)}
                >
                  + Add Driver
                </button>
              </div>
            </div>

            <div className="admin-table-card">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Driver ID &amp; Name</th>
                    <th>Contact Phone</th>
                    <th>Driving License (DL)</th>
                    <th>Base Hub</th>
                    <th>Assigned Vehicle</th>
                    <th>Status</th>
                    <th>Trips</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((d, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{d.name}</strong>
                        <div style={{ fontSize: '11px', color: '#0b72e7' }}>{d.id}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#334155' }}>{d.phone}</td>
                      <td>
                        <div>{d.licenseNo}</div>
                        <small style={{ color: '#64748b' }}>{d.licenseType}</small>
                      </td>
                      <td>{d.hub}</td>
                      <td style={{ color: '#0b72e7', fontWeight: 600 }}>{d.assignedVehicle || 'Unassigned'}</td>
                      <td>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background:
                              d.status === 'Active' ? '#edfdf4' :
                              d.status === 'On Trip' ? '#e0f2fe' : '#fee2e2',
                            color:
                              d.status === 'Active' ? '#10b981' :
                              d.status === 'On Trip' ? '#0b72e7' : '#dc2626'
                          }}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td><strong>{d.tripsCompleted}</strong> trips</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 6: FLEET & VEHICLES (NEW) */}
        {/* ============================================================== */}
        {activeTab === 'vehicles' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Fleet &amp; Heavy Vehicles Registry</h1>
                <p>Commercial transport trucks, container trailers, and maintenance logs</p>
              </div>

              <div className="admin-title-actions">
                <button type="button" className="admin-btn-export" onClick={exportVehiclesToCSV}>
                  Export Fleet CSV
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => setShowAddVehicleModal(true)}
                >
                  + Add Vehicle
                </button>
              </div>
            </div>

            <div className="admin-table-card">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Registration No.</th>
                    <th>Model &amp; Chassis</th>
                    <th>Body / Container Type</th>
                    <th>Payload Capacity</th>
                    <th>Assigned Terminal</th>
                    <th>Fuel Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((v, idx) => (
                    <tr key={idx}>
                      <td><strong style={{ color: '#0b72e7' }}>{v.plateNo}</strong></td>
                      <td style={{ fontWeight: 600 }}>{v.model}</td>
                      <td>{v.type}</td>
                      <td><strong>{v.capacityTons}</strong> Tons</td>
                      <td>{v.currentHub}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981' }}>{v.fuelLevel}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background:
                              v.status === 'Available' ? '#edfdf4' :
                              v.status === 'On Route' ? '#e0f2fe' : '#fee2e2',
                            color:
                              v.status === 'Available' ? '#10b981' :
                              v.status === 'On Route' ? '#0b72e7' : '#dc2626'
                          }}
                        >
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 7: REPORTS & EXPORT (NEW) */}
        {/* ============================================================== */}
        {/* ============================================================== */}
        {/* VIEW 7: OPERATIONS, FINANCIAL & P&L ANALYTICS */}
        {/* ============================================================== */}
        {activeTab === 'reports' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>📈 Financial &amp; P&amp;L Performance Analytics</h1>
                <p>Monthly turnover, cash realization, sundry debtors, hub contributions, and fleet cost margins</p>
              </div>
              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={exportPnlToCSV}
                >
                  📥 Download P&amp;L Statement (CSV)
                </button>
              </div>
            </div>

            {/* FINANCIAL & PNL SUMMARY CARDS */}
            <div className="pnl-grid">
              <div className="pnl-card" style={{ borderLeft: '4px solid #0b72e7' }}>
                <small>Gross Monthly Turnover</small>
                <strong>₹42,50,000</strong>
                <span style={{ color: '#10b981' }}>↑ 14.8% vs last month</span>
              </div>

              <div className="pnl-card" style={{ borderLeft: '4px solid #10b981' }}>
                <small>Cash Realized (Paid)</small>
                <strong>₹36,80,000</strong>
                <span style={{ color: '#10b981' }}>86.5% Collection Rate</span>
              </div>

              <div className="pnl-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                <small>Sundry Debtors (Pending)</small>
                <strong>₹5,70,000</strong>
                <span style={{ color: '#b45309' }}>13.5% Receivables (B2B 30-Day)</span>
              </div>

              <div className="pnl-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                <small>Fleet Fuel &amp; Toll Costs</small>
                <strong>₹18,40,000</strong>
                <span style={{ color: '#6d28d9' }}>43.3% Cost of Operations</span>
              </div>

              <div className="pnl-card" style={{ borderLeft: '4px solid #059669' }}>
                <small>EBITDA Net Margin</small>
                <strong style={{ color: '#059669' }}>₹18,40,000</strong>
                <span style={{ color: '#059669' }}>43.2% Profit Margin</span>
              </div>
            </div>

            {/* TWO-COLUMN ANALYTICS: HUB SHARE & ROUTE PROFITABILITY */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* Hub Revenue Share */}
              <div style={{ background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: 'var(--text-primary, #0f172a)' }}>
                  🏢 Pan-India Hub Revenue Distribution
                </h3>

                <div className="hub-bar-item">
                  <div className="hub-bar-head">
                    <span>Delhi Central Hub (HUB-DEL-01)</span>
                    <strong>₹16.15 Lakh (38%)</strong>
                  </div>
                  <div className="hub-bar-track">
                    <div className="hub-bar-fill" style={{ width: '38%', background: '#0b72e7' }} />
                  </div>
                </div>

                <div className="hub-bar-item">
                  <div className="hub-bar-head">
                    <span>Mumbai JNPT Terminal (HUB-MUM-02)</span>
                    <strong>₹13.17 Lakh (31%)</strong>
                  </div>
                  <div className="hub-bar-track">
                    <div className="hub-bar-fill" style={{ width: '31%', background: '#10b981' }} />
                  </div>
                </div>

                <div className="hub-bar-item">
                  <div className="hub-bar-head">
                    <span>Bengaluru Tech Cargo Park (HUB-BLR-03)</span>
                    <strong>₹7.65 Lakh (18%)</strong>
                  </div>
                  <div className="hub-bar-track">
                    <div className="hub-bar-fill" style={{ width: '18%', background: '#f59e0b' }} />
                  </div>
                </div>

                <div className="hub-bar-item">
                  <div className="hub-bar-head">
                    <span>Kolkata East Logistics Gateway (HUB-CCU-04)</span>
                    <strong>₹5.52 Lakh (13%)</strong>
                  </div>
                  <div className="hub-bar-track">
                    <div className="hub-bar-fill" style={{ width: '13%', background: '#8b5cf6' }} />
                  </div>
                </div>
              </div>

              {/* High-Margin Corridors Table */}
              <div style={{ background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: 'var(--text-primary, #0f172a)' }}>
                  🛣️ Top High-Margin Freight Corridors
                </h3>

                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border, #e2e8f0)', color: '#64748b', textAlign: 'left' }}>
                      <th style={{ paddingBottom: '8px' }}>Route Corridor</th>
                      <th style={{ paddingBottom: '8px' }}>Freight Mode</th>
                      <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Avg Trip Margin</th>
                      <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border, #f1f5f9)' }}>
                      <td style={{ padding: '8px 0', fontWeight: 600 }}>Delhi ↔ Mumbai</td>
                      <td style={{ color: '#64748b' }}>FTL 32ft MXL</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>₹28,400</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>48.2%</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border, #f1f5f9)' }}>
                      <td style={{ padding: '8px 0', fontWeight: 600 }}>Pune ↔ Hyderabad</td>
                      <td style={{ color: '#64748b' }}>Express PTL</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>₹12,800</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>44.5%</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border, #f1f5f9)' }}>
                      <td style={{ padding: '8px 0', fontWeight: 600 }}>Ahmedabad ↔ Surat</td>
                      <td style={{ color: '#64748b' }}>Industrial Surface</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>₹8,500</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>39.0%</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0', fontWeight: 600 }}>Chennai ↔ Bengaluru</td>
                      <td style={{ color: '#64748b' }}>Short Haul PTL</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>₹6,200</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>36.8%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* DOWNLOADABLE DATA LEDGERS */}
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: 'var(--text-primary, #0f172a)' }}>
              📥 Export Structured Compliance Ledgers
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="admin-kpi-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '18px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '14px' }}>Bookings Ledger (CSV)</h4>
                <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b' }}>
                  Full consignment records, routes, status, and client bookings history.
                </p>
                <button type="button" className="admin-btn-primary" onClick={exportBookingsToCSV} style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
                  Download Bookings CSV
                </button>
              </div>

              <div className="admin-kpi-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '18px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '14px' }}>Revenue &amp; GST Ledger (CSV)</h4>
                <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b' }}>
                  Monthly billing summary, freight revenue, and 18% GST collected for filing.
                </p>
                <button type="button" className="admin-btn-primary" onClick={exportRevenueToCSV} style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
                  Download Revenue CSV
                </button>
              </div>

              <div className="admin-kpi-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '18px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '14px' }}>Fleet &amp; Drivers Report (CSV)</h4>
                <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b' }}>
                  Commercial drivers, license numbers, and truck assignments.
                </p>
                <button type="button" className="admin-btn-primary" onClick={exportDriversToCSV} style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
                  Download Drivers CSV
                </button>
              </div>

              <div className="admin-kpi-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '18px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '14px' }}>Vehicle Registry (CSV)</h4>
                <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b' }}>
                  Active vehicle models, tonnage capacity, assigned terminals, and fuel levels.
                </p>
                <button type="button" className="admin-btn-primary" onClick={exportVehiclesToCSV} style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
                  Download Vehicles CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 8: SUPER ADMIN CONTROL & RIGHTS DELEGATION TAB */}
        {/* ============================================================== */}
        {activeTab === 'access' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>👑 Super Admin Control Center &amp; Rights Delegation</h1>
                <p>Governing role assignments, administrative privileges, and granular module access control</p>
              </div>

              {user?.role === 'SuperAdmin' && (
                <div className="admin-title-actions">
                  <span style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    color: '#92400e',
                    fontSize: '13px',
                    fontWeight: 700
                  }}>
                    👑 Super Admin Master Mode Active
                  </span>
                </div>
              )}
            </div>

            {/* SUPER ADMIN NOTICE */}
            <div className="admin-architecture-box">
              <h3>Hierarchical Security Architecture:</h3>
              <p>
                1. <strong>Super Admin</strong>: Holds unrestricted master permissions across all backend APIs, database tables, financial reconciliations, and security settings. Only the Super Admin can promote users to Admin or grant/revoke specific rights.<br />
                2. <strong>Admin</strong>: Manages day-to-day user data, shipment tracking, consignments, drivers, and operations strictly based on rights delegated by the Super Admin.<br />
                3. <strong>User / Customer</strong>: Accesses their personal shipper panel to book cargo, track consignments, and update their account credentials.
              </p>
            </div>

            {/* KPI STATS */}
            <div className="admin-metrics-grid">
              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                    👑
                  </div>
                  <div className="admin-box-content">
                    <strong>{adminUsers.filter(u => u.role === 'SuperAdmin').length || 1}</strong>
                    <span>Super Admins</span>
                  </div>
                </div>
                <div className="admin-box-delta green">
                  Master Ownership Access
                </div>
              </div>

              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                    ⚡
                  </div>
                  <div className="admin-box-content">
                    <strong>{adminUsers.filter(u => u.role === 'Admin').length}</strong>
                    <span>Operational Admins</span>
                  </div>
                </div>
                <div className="admin-box-delta green">
                  Delegated Operations Staff
                </div>
              </div>

              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                    👥
                  </div>
                  <div className="admin-box-content">
                    <strong>{adminUsers.filter(u => u.role === 'User').length}</strong>
                    <span>Registered Users</span>
                  </div>
                </div>
                <div className="admin-box-delta">
                  MSME &amp; Cargo Shippers
                </div>
              </div>

              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon" style={{ background: '#edfdf4', color: '#16a34a' }}>
                    🛡️
                  </div>
                  <div className="admin-box-content">
                    <strong>8 Modules</strong>
                    <span>Delegable Matrix</span>
                  </div>
                </div>
                <div className="admin-box-delta green">
                  Granular Permission Slates
                </div>
              </div>
            </div>

            {/* STAFF TABLE */}
            <div className="admin-table-card">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary, #0f172a)' }}>
                    System Staff &amp; Administrative Personnel
                  </h2>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary, #64748b)' }}>
                    Personnel credentials, security clearance status, and delegation actions
                  </p>
                </div>
              </div>

              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Personnel</th>
                    <th>Email Address</th>
                    <th>Role Privilege</th>
                    <th>Status</th>
                    <th>Super Admin Rights Delegation</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers
                    .filter(u => u.role === 'Admin' || u.role === 'SuperAdmin')
                    .map(staff => (
                      <tr key={staff.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{staff.name}</div>
                          <small style={{ color: '#64748b' }}>Staff ID: #{staff.id}</small>
                        </td>
                        <td style={{ color: '#0b72e7' }}>{staff.email}</td>
                        <td>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: staff.role === 'SuperAdmin' ? '#fef3c7' : '#ede9fe',
                              color: staff.role === 'SuperAdmin' ? '#b45309' : '#6d28d9'
                            }}
                          >
                            {staff.role === 'SuperAdmin' ? '👑 Super Admin' : '⚡ Operational Admin'}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: staff.isActive ? '#edfdf4' : '#fee2e2',
                              color: staff.isActive ? '#10b981' : '#dc2626'
                            }}
                          >
                            {staff.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td>
                          {user?.role === 'SuperAdmin' ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                className="admin-btn-action-rights"
                                onClick={() => handleOpenRightsModal(staff)}
                              >
                                🛡️ Manage Rights
                              </button>

                              <button
                                type="button"
                                className="admin-btn-action-role"
                                onClick={() => handleOpenRoleModal(staff)}
                              >
                                👑 Change Role
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                              Governed by Super Admin
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* NEW USER RESTRICTION & ACCESS CLEARANCE GOVERNANCE */}
            <div className="admin-table-card" style={{ marginTop: '24px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary, #0f172a)' }}>
                    Customer Clearance &amp; New User Access Approval
                  </h2>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary, #64748b)' }}>
                    Policy Enforcement: Newly registered users default to <strong>Book &amp; Track Only</strong>. Grant full access here to unlock Payments, Invoices, and Legal Documents.
                  </p>
                </div>
              </div>

              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Clearance State</th>
                    <th>Account Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.filter(u => u.role === 'User').length > 0 ? (
                    adminUsers
                      .filter(u => u.role === 'User')
                      .map(cust => {
                        const approved = isUserApproved(cust);
                        return (
                          <tr key={cust.id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{cust.name}</div>
                              <small style={{ color: '#94a3b8' }}>ID: #{cust.id}</small>
                            </td>
                            <td style={{ color: '#0b72e7' }}>{cust.email}</td>
                            <td>
                              {approved ? (
                                <span
                                  style={{
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    background: '#edfdf4',
                                    color: '#16a34a',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  🟢 Full Access Granted
                                </span>
                              ) : (
                                <span
                                  style={{
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  🟡 Restricted (Book &amp; Track Only)
                                </span>
                              )}
                            </td>
                            <td>
                              <span
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: cust.isActive ? '#edfdf4' : '#fee2e2',
                                  color: cust.isActive ? '#10b981' : '#dc2626'
                                }}
                              >
                                {cust.isActive ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {!approved ? (
                                  <button
                                    type="button"
                                    className="admin-btn-action-approve"
                                    onClick={() => handleToggleUserApproval(cust, true)}
                                    title="Grant Full Role Access (Unlock Invoices, Payments, Documents)"
                                  >
                                    🔓 Approve Full Access
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="admin-btn-action-restrict"
                                    onClick={() => handleToggleUserApproval(cust, false)}
                                    title="Restrict User to Book &amp; Track Only"
                                  >
                                    🔒 Restrict Access
                                  </button>
                                )}

                                {user?.role === 'SuperAdmin' && (
                                  <button
                                    type="button"
                                    className="admin-btn-action-role"
                                    onClick={() => handleOpenRoleModal(cust)}
                                    title="Promote directly to Admin or SuperAdmin"
                                  >
                                    👑 Promote Role
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No regular customer accounts registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 9: MULTI-CITY HUBS & TERMINALS */}
        {/* ============================================================== */}
        {activeTab === 'hubs' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Multi-City Logistics Hubs &amp; Terminals</h1>
                <p>National hub infrastructure, sorting centers, cargo throughput, and operational status</p>
              </div>
              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-export"
                  onClick={loadHubs}
                  disabled={hubsLoading}
                >
                  {hubsLoading ? 'Refreshing...' : '🔄 Refresh Hubs'}
                </button>
                {user?.role === 'SuperAdmin' && (
                  <button
                    type="button"
                    className="admin-btn-primary"
                    onClick={() => setShowAddHubModal(true)}
                  >
                    + Add Pan-India Hub
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {hubsList.map(h => (
                <div
                  key={h.id}
                  style={{
                    background: 'var(--bg-card, #ffffff)',
                    border: '1px solid var(--border, #e2e8f0)',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: '#2563eb',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}>
                        {h.code}
                      </span>
                      <span style={{
                        background: h.isActive ? '#edfdf4' : '#fee2e2',
                        color: h.isActive ? '#10b981' : '#dc2626',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '12px'
                      }}>
                        {h.isActive ? '● Operational' : '○ Standby'}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: 'var(--text-primary, #0f172a)' }}>
                      {h.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary, #64748b)' }}>
                      📍 {h.city}, {h.state}
                    </p>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border, #f1f5f9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)', display: 'block' }}>DAILY THROUGHPUT</span>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary, #0f172a)' }}>{h.capacity?.toLocaleString('en-IN') || 2500} MT / Day</strong>
                    </div>
                    <span style={{ fontSize: '12px', color: '#0b72e7', fontWeight: 600 }}>Active Gate ➔</span>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleHubStatus(h.id)}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        color: '#0f172a',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {h.isActive ? '⏸ Put on Standby' : '▶ Make Operational'}
                    </button>
                    {user?.role === 'SuperAdmin' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteHub(h.id)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #fecaca',
                          background: '#fef2f2',
                          color: '#dc2626',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        title="Decommission Hub"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 9.5: TARIFF & RATE MATRIX ENGINE */}
        {/* ============================================================== */}
        {activeTab === 'tariff' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>⚡ Dynamic Tariff &amp; Rate Matrix Engine</h1>
                <p>Governs commercial freight tariffs, diesel fuel surcharge index, GST tax slabs, and real-time public rate calculations</p>
              </div>
              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={handleSaveTariffMatrix}
                  disabled={tariffSaving}
                >
                  {tariffSaving ? 'Broadcasting...' : '💾 Save & Broadcast Tariff to Portal'}
                </button>
              </div>
            </div>

            {/* TARIFF CARDS GRID */}
            <div className="tariff-grid">
              {/* Card 1: FTL Full Truckload */}
              <div className="tariff-card">
                <div className="tariff-card-header">
                  <span style={{ fontSize: '1.4rem' }}>🚛</span>
                  <h3>Full Truckload (FTL) Freight Slab</h3>
                </div>
                <div className="tariff-input-group">
                  <label>Base Tariff (₹ per Ton / KM)</label>
                  <div className="tariff-input-wrap">
                    <span className="tariff-input-prefix">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      value={tariffFtlPerKm}
                      onChange={e => setTariffFtlPerKm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="tariff-input-group">
                  <label>Minimum Corridor Trip Charge (Floor)</label>
                  <div className="tariff-input-wrap">
                    <span className="tariff-input-prefix">₹</span>
                    <input
                      type="number"
                      value={tariffFtlMinTrip}
                      onChange={e => setTariffFtlMinTrip(e.target.value)}
                    />
                  </div>
                </div>
                <small style={{ color: '#64748b', fontSize: '11px' }}>
                  Applied automatically to 32ft MXL, 24ft, and containerized fleet.
                </small>
              </div>

              {/* Card 2: PTL Part Truckload */}
              <div className="tariff-card">
                <div className="tariff-card-header">
                  <span style={{ fontSize: '1.4rem' }}>📦</span>
                  <h3>Part Truckload (PTL / Parcel)</h3>
                </div>
                <div className="tariff-input-group">
                  <label>Base Freight (₹ per Kg / KM)</label>
                  <div className="tariff-input-wrap">
                    <span className="tariff-input-prefix">₹</span>
                    <input
                      type="number"
                      step="0.05"
                      value={tariffPtlPerKgKm}
                      onChange={e => setTariffPtlPerKgKm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="tariff-input-group">
                  <label>Minimum Parcel Booking Fee</label>
                  <div className="tariff-input-wrap">
                    <span className="tariff-input-prefix">₹</span>
                    <input
                      type="number"
                      value={tariffPtlMinFloor}
                      onChange={e => setTariffPtlMinFloor(e.target.value)}
                    />
                  </div>
                </div>
                <small style={{ color: '#64748b', fontSize: '11px' }}>
                  Calculated dynamically with volumetric weight formula (CFT).
                </small>
              </div>

              {/* Card 3: Priority & Fuel Surcharges */}
              <div className="tariff-card">
                <div className="tariff-card-header">
                  <span style={{ fontSize: '1.4rem' }}>⚡</span>
                  <h3>Surcharges &amp; Taxes</h3>
                </div>
                <div className="tariff-input-group">
                  <label>Express / Air Cargo Multiplier (x)</label>
                  <div className="tariff-input-wrap">
                    <span className="tariff-input-prefix">x</span>
                    <input
                      type="number"
                      step="0.05"
                      value={tariffExpressMult}
                      onChange={e => setTariffExpressMult(e.target.value)}
                    />
                  </div>
                </div>
                <div className="tariff-input-group">
                  <label>Diesel Price Fuel Surcharge (%)</label>
                  <div className="tariff-input-wrap">
                    <span className="tariff-input-prefix">%</span>
                    <input
                      type="number"
                      step="0.5"
                      value={tariffFuelSurcharge}
                      onChange={e => setTariffFuelSurcharge(e.target.value)}
                    />
                  </div>
                </div>
                <div className="tariff-input-group">
                  <label>GST Freight Rate (%)</label>
                  <div className="tariff-input-wrap">
                    <span className="tariff-input-prefix">%</span>
                    <input
                      type="number"
                      value={tariffGstPercent}
                      onChange={e => setTariffGstPercent(e.target.value)}
                    />
                  </div>
                </div>
                <div className="tariff-input-group">
                  <label>Dock Handling &amp; Toll Surcharge (Fixed)</label>
                  <div className="tariff-input-wrap">
                    <span className="tariff-input-prefix">₹</span>
                    <input
                      type="number"
                      value={tariffHandlingFee}
                      onChange={e => setTariffHandlingFee(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE SIMULATOR FOR SUPER ADMIN */}
            <div className="tariff-sim-box">
              <div className="tariff-sim-title">
                <div>
                  <h3>🧪 Real-Time Tariff Simulator</h3>
                  <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>
                    Verify how customer rate calculator responds to current matrix parameters
                  </p>
                </div>
                <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Interactive Preview
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Trip Distance: <strong>{simDistanceKm} KM</strong></label>
                  <input
                    type="range"
                    min="50"
                    max="3000"
                    step="50"
                    value={simDistanceKm}
                    onChange={e => setSimDistanceKm(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Consignment Weight: <strong>{simWeightKg} KG</strong></label>
                  <input
                    type="range"
                    min="50"
                    max="24000"
                    step="50"
                    value={simWeightKg}
                    onChange={e => setSimWeightKg(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Freight Service Mode</label>
                  <select
                    value={simService}
                    onChange={e => setSimService(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#07192b', color: '#fff', border: '1px solid #1e3355' }}
                  >
                    <option value="PTL">Part Truckload (PTL)</option>
                    <option value="FTL">Full Truckload (FTL Dedicated)</option>
                    <option value="Express">Express Air/Highway Priority</option>
                  </select>
                </div>
              </div>

              <div className="tariff-sim-result-card">
                <div className="sim-row">
                  <span>Base Haulage Freight ({simDistanceKm} km × {simWeightKg} kg):</span>
                  <strong>₹{simBaseFreight.toLocaleString('en-IN')}</strong>
                </div>
                <div className="sim-row">
                  <span>Diesel Fuel Surcharge ({tariffFuelSurcharge}%):</span>
                  <strong>₹{simFuelCharge.toLocaleString('en-IN')}</strong>
                </div>
                <div className="sim-row">
                  <span>Terminal Handling &amp; Dock Fee:</span>
                  <strong>₹{simHandling.toLocaleString('en-IN')}</strong>
                </div>
                <div className="sim-row">
                  <span>GST Road Transport SAC 9965 ({tariffGstPercent}%):</span>
                  <strong>₹{simGst.toLocaleString('en-IN')}</strong>
                </div>
                <div className="sim-row total">
                  <span>Total Calculated Client Tariff:</span>
                  <span>₹{simTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: FLEET TELEMATICS & GPS RADAR */}
        {/* ============================================================== */}
        {activeTab === 'telematics' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>🛰️ Vehicle Tracking Telematics &amp; Fleet Radar</h1>
                <p>Live satellite GPS sync, speed monitoring, automated halt alerts (&gt;45m stop), and geo-fencing route deviation alerts</p>
              </div>
              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-export"
                  onClick={() => {
                    setTelematicsFleet(prev => prev.map(t => ({
                      ...t,
                      lastPing: 'Just now'
                    })));
                    showToast('📡 GPS Telematics pings refreshed from satellite feed');
                  }}
                >
                  🔄 Ping Satellite Feeds
                </button>
              </div>
            </div>

            {/* TELEMATICS KPI GRID */}
            <div className="admin-metrics-grid" style={{ marginBottom: '20px' }}>
              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                    🛰️
                  </div>
                  <div className="admin-box-content">
                    <strong>{telematicsFleet.length} Trucks</strong>
                    <span>Live Telematics Sync</span>
                  </div>
                </div>
                <div className="admin-box-delta green">100% Sat-Com Connected</div>
              </div>

              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    🚛
                  </div>
                  <div className="admin-box-content">
                    <strong>{telematicsFleet.filter(t => t.speedKmH > 0).length} Moving</strong>
                    <span>Active on Corridors</span>
                  </div>
                </div>
                <div className="admin-box-delta green">Avg Speed: 56.6 km/h</div>
              </div>

              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                    ⚡
                  </div>
                  <div className="admin-box-content">
                    <strong style={{ color: '#dc2626' }}>{telematicsFleet.filter(t => t.speedKmH > 65).length} Alert</strong>
                    <span>Over-Speed (&gt;65 km/h)</span>
                  </div>
                </div>
                <div className="admin-box-delta" style={{ color: '#dc2626' }}>DL-01-AB-1234 flagged</div>
              </div>

              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                    🛑
                  </div>
                  <div className="admin-box-content">
                    <strong style={{ color: '#b45309' }}>{telematicsFleet.filter(t => t.haltDurationMinutes > 45).length} Stop</strong>
                    <span>Halt Alert (&gt;45 mins)</span>
                  </div>
                </div>
                <div className="admin-box-delta" style={{ color: '#b45309' }}>GJ-01-JK-7890 (52m Stop)</div>
              </div>
            </div>

            {/* TELEMATICS TOOLBAR */}
            <div className="admin-table-card">
              <div className="admin-table-toolbar">
                <div className="admin-toolbar-search">
                  <input
                    type="text"
                    placeholder="Search by Plate Number, Driver, or Corridor..."
                    value={telematicsSearch}
                    onChange={e => setTelematicsSearch(e.target.value)}
                  />
                </div>
                <div className="admin-toolbar-filter">
                  {(['All', 'Alerts', 'Moving', 'Stationary'] as const).map(flt => (
                    <button
                      key={flt}
                      type="button"
                      className={`admin-filter-pill ${telematicsFilter === flt ? 'active' : ''}`}
                      onClick={() => setTelematicsFilter(flt)}
                    >
                      {flt === 'Alerts' ? '⚠️ Alerts Only' : flt}
                    </button>
                  ))}
                </div>
              </div>

              {/* TELEMATICS FLEET CARDS */}
              <div className="telematics-grid" style={{ padding: '16px' }}>
                {telematicsFleet
                  .filter(v => {
                    const matchSearch =
                      v.plateNo.toLowerCase().includes(telematicsSearch.toLowerCase()) ||
                      v.driverName.toLowerCase().includes(telematicsSearch.toLowerCase()) ||
                      v.locationName.toLowerCase().includes(telematicsSearch.toLowerCase());
                    if (!matchSearch) return false;
                    if (telematicsFilter === 'Alerts') {
                      return v.speedKmH > 65 || v.haltDurationMinutes > 45 || v.geofenceStatus === 'Route Deviation';
                    }
                    if (telematicsFilter === 'Moving') return v.speedKmH > 0;
                    if (telematicsFilter === 'Stationary') return v.speedKmH === 0;
                    return true;
                  })
                  .map(v => {
                    const isOverSpeed = v.speedKmH > 65;
                    const isHalted = v.haltDurationMinutes > 45;
                    const isDeviated = v.geofenceStatus === 'Route Deviation';

                    return (
                      <div key={v.plateNo} className="telematics-card">
                        <div className="telematics-card-head">
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span
                                className="radar-ping-dot"
                                style={{ background: v.speedKmH > 0 ? '#10b981' : '#f59e0b' }}
                              />
                              <strong style={{ fontSize: '15px', color: '#0f172a' }}>{v.plateNo}</strong>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              {v.routeCorridor}
                            </div>
                          </div>

                          <div>
                            {isOverSpeed ? (
                              <span className="speed-badge speed-alert">⚡ {v.speedKmH} km/h (OVER-SPEED)</span>
                            ) : v.speedKmH > 0 ? (
                              <span className="speed-badge speed-normal">🟢 {v.speedKmH} km/h</span>
                            ) : (
                              <span className="speed-badge speed-idle">🛑 0 km/h ({v.engineStatus})</span>
                            )}
                          </div>
                        </div>

                        {/* ALERTS BADGE IF TRIGGERED */}
                        {(isHalted || isDeviated) && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {isHalted && (
                              <span className="halt-alert-tag">
                                🛑 Halt Alert: Highway stop for {v.haltDurationMinutes} mins
                              </span>
                            )}
                            {isDeviated && (
                              <span className="halt-alert-tag" style={{ background: '#fef3c7', borderColor: '#fde68a', color: '#b45309' }}>
                                ⚠️ Geofence Route Deviation Detected (+14km)
                              </span>
                            )}
                          </div>
                        )}

                        {/* PARTICULARS */}
                        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ color: '#334155' }}>
                            <strong>📍 Checkpoint:</strong> {v.locationName}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                            <span>Driver: <strong style={{ color: '#0f172a' }}>{v.driverName}</strong></span>
                            <span>Tel: {v.driverPhone}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#64748b' }}>
                              Fuel: <strong>{v.fuelPercent}%</strong> | Ping: {v.lastPing}
                            </span>
                            <span className={`geofence-tag ${isDeviated ? 'geofence-dev' : 'geofence-ok'}`}>
                              {isDeviated ? '⚠️ Route Deviation' : '✓ In Corridor'}
                            </span>
                          </div>
                        </div>

                        {/* ACTION */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRadarShipment({
                              id: 991,
                              trackingNumber: `TRK-${v.plateNo}`,
                              bookingNumber: `BK-${v.plateNo}`,
                              status: v.speedKmH > 0 ? 'In Transit' : 'Halted at Highway Checkpoint',
                              currentHubId: 1,
                              createdAt: new Date().toISOString()
                            });
                          }}
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #bfdbfe',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            marginTop: 'auto'
                          }}
                        >
                          📡 View Live Satellite GPS Radar &rarr;
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: E-WAY BILL AUTO VERIFICATION ENGINE */}
        {/* ============================================================== */}
        {activeTab === 'ewaybill' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>⚡ Govt E-Way Bill Auto Verification Engine</h1>
                <p>Direct GST portal sync, GSTIN validation, vehicle validity cross-check, and zero RTO penalty guarantee</p>
              </div>
            </div>

            {/* VERIFY SEARCH BOX */}
            <div className="ewb-box">
              <h3 style={{ margin: '0 0 10px', fontSize: '15px', color: '#0f172a' }}>
                🔍 Instant E-Way Bill Auto-Fetch
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
                Enter a 12-digit Government E-Way Bill number to auto-verify transporter allotment, supplier/recipient GSTINs, and RTO transit validity.
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Enter 12-Digit E-Way Bill # (e.g. 2410-9876-5432)"
                  value={ewbSearchInput}
                  onChange={e => setEwbSearchInput(e.target.value)}
                  style={{ flex: 1, minWidth: '280px', padding: '10px 14px', border: '2px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                />
                <button
                  type="button"
                  onClick={() => handleVerifyEwayBill()}
                  disabled={ewbVerifying}
                  style={{
                    padding: '10px 24px',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {ewbVerifying ? 'Verifying with GST...' : '🔍 Auto-Fetch Govt Portal Data'}
                </button>
              </div>

              {/* DEMO CHIPS */}
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Quick Demos:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEwbSearchInput('2410-9876-5432');
                    handleVerifyEwayBill('2410-9876-5432');
                  }}
                  style={{ padding: '4px 10px', fontSize: '11px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  🟢 2410-9876-5432 (Valid FTL)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEwbSearchInput('1812-4321-9988');
                    handleVerifyEwayBill('1812-4321-9988');
                  }}
                  style={{ padding: '4px 10px', fontSize: '11px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  🟡 1812-4321-9988 (Expiring Soon)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEwbSearchInput('1009-8877-6655');
                    handleVerifyEwayBill('1009-8877-6655');
                  }}
                  style={{ padding: '4px 10px', fontSize: '11px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  🔴 1009-8877-6655 (Expired)
                </button>
              </div>

              {/* ACTIVE VERIFICATION CARD */}
              {ewbVerificationResult && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <div
                    className={`ewb-status-banner ${
                      ewbVerificationResult.status === 'VALID'
                        ? 'valid'
                        : ewbVerificationResult.status === 'EXPIRING_SOON'
                        ? 'expiring'
                        : 'expired'
                    }`}
                  >
                    <div>
                      {ewbVerificationResult.status === 'VALID' && (
                        <span>✓ GOVERNMENT E-WAY BILL VALID &amp; ACTIVE — ZERO RTO PENALTY RISK</span>
                      )}
                      {ewbVerificationResult.status === 'EXPIRING_SOON' && (
                        <span>⚠️ ATTENTION: E-WAY BILL EXPIRES IN &lt;4 HOURS — REQUEST VEHICLE VALIDITY EXTENSION</span>
                      )}
                      {ewbVerificationResult.status === 'EXPIRED' && (
                        <span>❌ EXPIRED E-WAY BILL — TRANSIT PROHIBITED UNDER GST SECTION 129</span>
                      )}
                    </div>
                    <div>
                      Valid Until: <strong>{ewbVerificationResult.validUntil}</strong>
                    </div>
                  </div>

                  <div className="ewb-party-grid">
                    <div className="ewb-party-card">
                      <small style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>
                        Supplier / Consignor Details
                      </small>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                        {ewbVerificationResult.supplierName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                        GSTIN: {ewbVerificationResult.supplierGstin}
                      </div>
                    </div>

                    <div className="ewb-party-card">
                      <small style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>
                        Recipient / Consignee Details
                      </small>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                        {ewbVerificationResult.recipientName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                        GSTIN: {ewbVerificationResult.recipientGstin}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Assigned Vehicle Plate:</span>
                      <div style={{ fontWeight: 800, color: '#0b72e7', fontSize: '13px' }}>{ewbVerificationResult.vehicleNo}</div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Invoice / Doc Ref:</span>
                      <div style={{ fontWeight: 700 }}>{ewbVerificationResult.docNo}</div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>HSN Code &amp; Goods:</span>
                      <div style={{ fontWeight: 700 }}>{ewbVerificationResult.hsnCode}</div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Declared Consignment Value:</span>
                      <div style={{ fontWeight: 800, color: '#059669' }}>₹{ewbVerificationResult.cargoValue.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RECENT E-WAY BILLS TABLE */}
            <div className="admin-table-card">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>
                  Recently Verified E-Way Bills Registry
                </h3>
              </div>
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>EWB Number</th>
                    <th>Supplier / Consignor</th>
                    <th>Recipient</th>
                    <th>Vehicle Plate</th>
                    <th>Cargo Value</th>
                    <th>Validity Expiry</th>
                    <th>RTO Compliance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ewayBillsList.map(e => (
                    <tr key={e.ewbNo}>
                      <td><strong style={{ color: '#0b72e7' }}>{e.ewbNo}</strong></td>
                      <td>{e.supplierName}</td>
                      <td>{e.recipientName}</td>
                      <td><strong style={{ color: '#0f172a' }}>{e.vehicleNo}</strong></td>
                      <td>₹{e.cargoValue.toLocaleString('en-IN')}</td>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>{e.validUntil}</td>
                      <td>
                        <span
                          className="admin-badge-status"
                          style={{
                            background:
                              e.status === 'VALID' ? '#ecfdf5' : e.status === 'EXPIRING_SOON' ? '#fffbeb' : '#fef2f2',
                            color:
                              e.status === 'VALID' ? '#059669' : e.status === 'EXPIRING_SOON' ? '#b45309' : '#dc2626'
                          }}
                        >
                          {e.status === 'VALID' ? '✓ Valid & Compliant' : e.status === 'EXPIRING_SOON' ? '⚠️ Expiring Soon' : '❌ Expired'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: SUPPORT DESK & LIVE ESCALATION MATRIX */}
        {/* ============================================================== */}
        {activeTab === 'support' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>🎧 Support Desk &amp; Live Escalation Matrix</h1>
                <p>Manage customer complaint tickets, transit delays, claim disputes, and consignee escalations</p>
              </div>
            </div>

            {/* SUPPORT KPI GRID */}
            <div className="support-kpi-grid">
              <div className="support-kpi-card">
                <small>Total Open Tickets</small>
                <strong>{supportTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length} Active</strong>
              </div>
              <div className="support-kpi-card" style={{ borderColor: '#fca5a5' }}>
                <small style={{ color: '#dc2626' }}>Critical Escalations</small>
                <strong style={{ color: '#dc2626' }}>{supportTickets.filter(t => t.priority === 'Critical' && t.status !== 'Resolved').length} High Priority</strong>
              </div>
              <div className="support-kpi-card">
                <small>In Progress</small>
                <strong style={{ color: '#0284c7' }}>{supportTickets.filter(t => t.status === 'In Progress').length} Assigned</strong>
              </div>
              <div className="support-kpi-card">
                <small>Resolved Today</small>
                <strong style={{ color: '#059669' }}>{supportTickets.filter(t => t.status === 'Resolved').length} Solved</strong>
              </div>
              <div className="support-kpi-card">
                <small>Average Resolution SLA</small>
                <strong style={{ color: '#4338ca' }}>28 Mins</strong>
              </div>
            </div>

            {/* TICKETS TABLE CARD */}
            <div className="admin-table-card">
              <div className="admin-table-toolbar">
                <div className="admin-toolbar-search">
                  <input
                    type="text"
                    placeholder="Search by Ticket ID, Customer, or Consignment Ref..."
                    value={ticketSearch}
                    onChange={e => setTicketSearch(e.target.value)}
                  />
                </div>
                <div className="admin-toolbar-filter">
                  {(['All', 'Open', 'In Progress', 'Resolved'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      className={`admin-filter-pill ${ticketFilterStatus === st ? 'active' : ''}`}
                      onClick={() => setTicketFilterStatus(st)}
                    >
                      {st}
                    </button>
                  ))}
                  {(['Critical', 'High'] as const).map(prio => (
                    <button
                      key={prio}
                      type="button"
                      className={`admin-filter-pill ${ticketFilterPriority === prio ? 'active' : ''}`}
                      onClick={() => setTicketFilterPriority(ticketFilterPriority === prio ? 'All' : prio)}
                      style={{ color: prio === 'Critical' ? '#dc2626' : '#ea580c' }}
                    >
                      {prio === 'Critical' ? '🔴 Critical' : '🟠 High'}
                    </button>
                  ))}
                </div>
              </div>

              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Customer Particulars</th>
                    <th>Consignment Ref</th>
                    <th>Category &amp; Subject</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {supportTickets
                    .filter(t => {
                      const matchSearch =
                        t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                        t.customerName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                        t.consignmentNo.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                        t.subject.toLowerCase().includes(ticketSearch.toLowerCase());
                      if (!matchSearch) return false;
                      if (ticketFilterStatus !== 'All' && t.status !== ticketFilterStatus) return false;
                      if (ticketFilterPriority !== 'All' && t.priority !== ticketFilterPriority) return false;
                      return true;
                    })
                    .map(t => (
                      <tr key={t.id}>
                        <td><strong style={{ color: '#0b72e7' }}>{t.id}</strong></td>
                        <td>
                          <strong>{t.customerName}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{t.customerPhone}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#4338ca' }}>{t.consignmentNo}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{t.subject}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>[{t.category}] • {t.createdAt}</div>
                        </td>
                        <td>
                          <span
                            className={
                              t.priority === 'Critical'
                                ? 'ticket-prio-critical'
                                : t.priority === 'High'
                                ? 'ticket-prio-high'
                                : t.priority === 'Medium'
                                ? 'ticket-prio-medium'
                                : 'ticket-prio-low'
                            }
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <span
                            className="admin-badge-status"
                            style={{
                              background:
                                t.status === 'Resolved' ? '#ecfdf5' : t.status === 'In Progress' ? '#eff6ff' : '#fffbeb',
                              color:
                                t.status === 'Resolved' ? '#059669' : t.status === 'In Progress' ? '#2563eb' : '#b45309'
                            }}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-btn-view"
                            onClick={() => {
                              setEditingTicket(t);
                              setTicketResolutionNote(t.resolutionNotes || '');
                            }}
                          >
                            Manage Ticket
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* EDIT / RESOLVE TICKET MODAL */}
            {editingTicket && (
              <div className="st-modal-overlay" onClick={() => setEditingTicket(null)}>
                <div className="st-drawer-box" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
                  <div className="st-drawer-head">
                    <div>
                      <h2>🎧 Manage Ticket: {editingTicket.id}</h2>
                      <p>Client: {editingTicket.customerName} | Ref: {editingTicket.consignmentNo}</p>
                    </div>
                    <button type="button" className="st-drawer-close" onClick={() => setEditingTicket(null)}>
                      &times;
                    </button>
                  </div>

                  <div className="st-drawer-body">
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Issue Summary</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{editingTicket.subject}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        Category: {editingTicket.category} | Logged: {editingTicket.createdAt}
                      </div>
                    </div>

                    <div className="st-form-field">
                      <label>Update Ticket Lifecycle Status</label>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        {(['Open', 'In Progress', 'Resolved', 'Closed'] as const).map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateTicketStatus(editingTicket.id, st)}
                            style={{
                              flex: 1,
                              padding: '8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: '1px solid',
                              borderColor: editingTicket.status === st ? '#2563eb' : '#cbd5e1',
                              background: editingTicket.status === st ? '#2563eb' : '#ffffff',
                              color: editingTicket.status === st ? '#ffffff' : '#475569'
                            }}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="st-form-field" style={{ marginTop: '16px' }}>
                      <label>Internal Resolution Notes &amp; Dispatcher Comments</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Spoke with consignee; truck arrived at bay #2, unsealed under driver supervision."
                        value={ticketResolutionNote}
                        onChange={e => setTicketResolutionNote(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', resize: 'vertical' }}
                      />
                    </div>
                  </div>

                  <div className="st-drawer-actions">
                    <button
                      type="button"
                      className="st-btn-cancel"
                      onClick={() => setEditingTicket(null)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="st-btn-submit"
                      onClick={() => handleUpdateTicketStatus(editingTicket.id, 'Resolved')}
                    >
                      ✓ Mark Ticket as Resolved
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 10: SECURITY AUDIT TRAIL & ACCESS CONTROLS */}
        {/* ============================================================== */}
        {activeTab === 'audit' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Security Audit Trail &amp; Access Controls</h1>
                <p>Live immutable event log of all administrative actions, authentication attempts, and emergency kill-switch controls</p>
              </div>
              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-export"
                  onClick={exportAuditLogsToCSV}
                >
                  📥 Export Audit Trail (CSV)
                </button>
                <button
                  type="button"
                  className="admin-btn-export"
                  onClick={loadAuditLogs}
                  disabled={auditLoading}
                >
                  {auditLoading ? 'Refreshing...' : '🔄 Refresh Trail'}
                </button>
              </div>
            </div>

            <div className="admin-table-card">
              <div className="admin-table-toolbar">
                <div className="admin-toolbar-search">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search action, actor email, or IP address..."
                    value={auditSearch}
                    onChange={e => setAuditSearch(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') loadAuditLogs(); }}
                  />
                </div>
                <select
                  value={auditActionFilter}
                  onChange={e => setAuditActionFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    background: 'var(--bg-card, #fff)',
                    color: 'var(--text-primary, #0f172a)'
                  }}
                >
                  <option value="All">All Event Types</option>
                  <option value="ROLE">Role &amp; Privilege Changes</option>
                  <option value="RIGHTS">Rights Delegation</option>
                  <option value="FORCE_LOGOUT">Force Logouts / Kill-Switch</option>
                  <option value="MAINTENANCE">Maintenance Events</option>
                  <option value="TARIFF">Tariff Modifications</option>
                  <option value="HUB">Hub Operations</option>
                </select>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={loadAuditLogs}
                >
                  Filter Logs
                </button>
              </div>

              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Timestamp</th>
                    <th>Action Event</th>
                    <th>Actor / User</th>
                    <th>IP / Origin</th>
                    <th>Details / Metadata</th>
                    <th>Emergency Kill-Switch</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                        No audit events recorded for current query.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map(log => (
                      <tr key={log.id}>
                        <td><code style={{ fontSize: '11px', color: '#64748b' }}>#{log.id}</code></td>
                        <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' })}
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: log.action.includes('Delete') || log.action.includes('Force') ? '#fee2e2' :
                                        log.action.includes('Role') || log.action.includes('Rights') ? '#fef3c7' : '#e0f2fe',
                            color: log.action.includes('Delete') || log.action.includes('Force') ? '#b91c1c' :
                                   log.action.includes('Role') || log.action.includes('Rights') ? '#b45309' : '#0369a1'
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '12px' }}>{log.userEmail || `User #${log.userId || '-'}`}</div>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>
                            {log.ipAddress || '127.0.0.1'}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.details || '-'}
                        </td>
                        <td>
                          {log.userId ? (
                            <button
                              type="button"
                              onClick={() => handleForceLogout(log.userId!, log.userEmail)}
                              disabled={forceLoggingOutId === log.userId}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: '1px solid #fecaca',
                                background: '#fef2f2',
                                color: '#dc2626',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                              title="Instantly revoke all active sessions for this user"
                            >
                              {forceLoggingOutId === log.userId ? 'Revoking...' : '⚡ Force Logout'}
                            </button>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>System Event</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 11: DYNAMIC SYSTEM SETTINGS */}
        {/* ============================================================== */}
        {activeTab === 'settings' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Dynamic System Settings &amp; Platform Controls</h1>
                <p>Configure live tariffs, fuel surcharges, taxation rates, and platform maintenance status without redeploying</p>
              </div>
              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-export"
                  onClick={loadSettings}
                  disabled={settingsLoading}
                >
                  {settingsLoading ? 'Refreshing...' : '🔄 Refresh Settings'}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              {settingsList.map(item => (
                <div
                  key={item.key}
                  style={{
                    background: 'var(--bg-card, #ffffff)',
                    border: '1px solid var(--border, #e2e8f0)',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      background: 'rgba(37, 99, 235, 0.08)',
                      color: '#2563eb',
                      fontWeight: 700,
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '4px'
                    }}>
                      {item.group}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                      {item.key}
                    </span>
                  </div>

                  <p style={{ margin: '8px 0 16px 0', fontSize: '13px', color: 'var(--text-secondary, #475569)', minHeight: '38px' }}>
                    {item.description || item.key}
                  </p>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {item.key === 'SYSTEM_MAINTENANCE_MODE' ? (
                      <select
                        value={editingSettings[item.key] ?? item.value}
                        onChange={e => setEditingSettings({ ...editingSettings, [item.key]: e.target.value })}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border, #cbd5e1)', background: 'var(--bg-card, #fff)', color: 'var(--text-primary, #0f172a)' }}
                      >
                        <option value="false">🟢 Operational (Normal Booking Active)</option>
                        <option value="true">🔴 Maintenance Mode (Freeze Bookings)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={editingSettings[item.key] ?? item.value}
                        onChange={e => setEditingSettings({ ...editingSettings, [item.key]: e.target.value })}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border, #cbd5e1)', background: 'var(--bg-card, #fff)', color: 'var(--text-primary, #0f172a)' }}
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => handleSaveSetting(item)}
                      disabled={savingKey === item.key}
                      style={{
                        padding: '8px 16px',
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: savingKey === item.key ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {savingKey === item.key ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

          </>
        )}

        {/* ============================================================== */}
        {/* MODAL 0: AI OCR SCANNER MODAL */}
        {showAiScannerModal && (
          <AiOcrScannerModal
            initialDocType={aiScannerDocType}
            onClose={() => setShowAiScannerModal(false)}
            onApplyExtractedData={(type, extracted) => {
              if (type === 'driving_license') {
                setNewDriverName(extracted.fullName || '');
                setNewDriverPhone(extracted.mobileNumber || '');
                setNewDriverDL(extracted.dlNumber || '');
                showToast('✓ Applied Driver DL: ' + (extracted.fullName || ''));
              } else if (type === 'vehicle_rc') {
                setNewPlateNo(extracted.registrationNumber || '');
                setNewVehicleModel(extracted.makerModel || '');
                setNewVehicleCapacity(String(Math.round((extracted.payloadCapacityKg || 18500) / 1000)));
                showToast('✓ Applied Vehicle RC: ' + (extracted.registrationNumber || ''));
              }
            }}
          />
        )}

        {/* MODAL 1: ADD CUSTOMER MODAL */}
        {/* ============================================================== */}
        {showAddCustomerModal && (
          <div className="st-modal-overlay" onClick={() => setShowAddCustomerModal(false)}>
            <div className="st-drawer-box" onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2>Add New Customer</h2>
                  <p>Register a verified client account</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowAddCustomerModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddCustomer}>
                <div className="st-drawer-body">
                  <div className="st-form-field">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Vikram Singhania"
                      value={newCustName}
                      onChange={e => setNewCustName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g., vikram@company.com"
                      value={newCustEmail}
                      onChange={e => setNewCustEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Mobile Number *</label>
                    <input
                      type="text"
                      placeholder="e.g., 9876543210"
                      value={newCustPhone}
                      onChange={e => setNewCustPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Account Access Clearance *</label>
                    <select
                      value={newCustAccess}
                      onChange={e => setNewCustAccess(e.target.value as 'Restricted' | 'Approved')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        background: 'var(--bg-surface, #ffffff)',
                        color: 'var(--text-primary, #0f172a)',
                        fontSize: '13px'
                      }}
                    >
                      <option value="Restricted">
                        🟡 Restricted (Book &amp; Track Only) — Default for new users
                      </option>
                      <option value="Approved">
                        🟢 Full Access Granted (Payments, Invoices &amp; Documents Unlocked)
                      </option>
                    </select>
                    <small style={{ display: 'block', marginTop: '4px', color: '#64748b', fontSize: '11px' }}>
                      Restricted users can only Book shipments and Track live consignments.
                    </small>
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowAddCustomerModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit">
                    Save Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 2: UPDATE SHIPMENT STATUS MODAL (NEW) */}
        {/* ============================================================== */}
        {showUpdateShipmentModal && selectedShipment && (
          <div className="st-modal-overlay" onClick={() => setShowUpdateShipmentModal(false)}>
            <div className="st-drawer-box" onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2>Update Shipment Status</h2>
                  <p>Shipment: {selectedShipment.shipmentNo} ({selectedShipment.customer})</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowUpdateShipmentModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveShipmentStatus}>
                <div className="st-drawer-body">
                  <div className="st-form-field">
                    <label>Current Status</label>
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: '#ffffff'
                      }}
                    >
                      <option value="Pending">Pending (Awaiting Pickup)</option>
                      <option value="Picked Up">Picked Up (At Origin Hub)</option>
                      <option value="In Transit">In Transit (On Highway)</option>
                      <option value="Out for Delivery">Out for Delivery (Last Mile)</option>
                      <option value="Delivered">Delivered (Completed)</option>
                    </select>
                  </div>

                  <div className="st-form-field">
                    <label>Current Checkpoint / Location *</label>
                    <input
                      type="text"
                      placeholder="e.g., Jaipur Logistics Terminal or Delhi Ring Road"
                      value={newLocation}
                      onChange={e => setNewLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Milestone Notes / Driver Remarks</label>
                    <textarea
                      placeholder="e.g., Consignment inspected, seal locks intact, departed terminal."
                      value={milestoneNote}
                      onChange={e => setMilestoneNote(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
                    <div>Driver Assigned: <strong>{selectedShipment.driver}</strong></div>
                    <div>Vehicle Assigned: <strong>{selectedShipment.vehicle}</strong></div>
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowUpdateShipmentModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit">
                    Update Status &amp; Notify Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 3: ADD DRIVER MODAL (NEW) */}
        {/* ============================================================== */}
        {showAddDriverModal && (
          <div className="st-modal-overlay" onClick={() => setShowAddDriverModal(false)}>
            <div className="st-drawer-box" onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2>Register New Driver</h2>
                  <p>Add commercial fleet operator to system</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowAddDriverModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddDriver}>
                <div style={{ margin: '14px 24px 0', padding: '10px 14px', background: '#f5f3ff', border: '1px dashed #818cf8', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '12px', color: '#4338ca' }}>🤖 AI Auto-Scan Driver License</strong>
                    <p style={{ margin: 0, fontSize: '11px', color: '#6366f1' }}>Upload DL photo to auto-fill name, phone &amp; Sarathi status</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAiScannerDocType('driving_license');
                      setShowAiScannerModal(true);
                    }}
                    style={{ padding: '6px 14px', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Scan DL with AI
                  </button>
                </div>
                <div className="st-drawer-body">
                  <div className="st-form-field">
                    <label>Driver Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Jaswinder Singh"
                      value={newDriverName}
                      onChange={e => setNewDriverName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Mobile Number *</label>
                    <input
                      type="text"
                      placeholder="e.g., 9811223344"
                      value={newDriverPhone}
                      onChange={e => setNewDriverPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Driving License (DL) Number *</label>
                    <input
                      type="text"
                      placeholder="e.g., DL-042022001928"
                      value={newDriverDL}
                      onChange={e => setNewDriverDL(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>License Class</label>
                    <select
                      value={newDriverType}
                      onChange={e => setNewDriverType(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option>Commercial Heavy (HMV)</option>
                      <option>Commercial Medium (MMV)</option>
                      <option>Commercial Light (LMV)</option>
                    </select>
                  </div>

                  <div className="st-form-field">
                    <label>Base Terminal / Hub</label>
                    <select
                      value={newDriverHub}
                      onChange={e => setNewDriverHub(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option>Delhi Hub</option>
                      <option>Mumbai Hub</option>
                      <option>Bangalore Hub</option>
                      <option>Kolkata Hub</option>
                      <option>Ahmedabad Hub</option>
                      <option>Pune Hub</option>
                    </select>
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowAddDriverModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit">
                    Save Driver
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 4: ADD VEHICLE MODAL (NEW) */}
        {/* ============================================================== */}
        {showAddVehicleModal && (
          <div className="st-modal-overlay" onClick={() => setShowAddVehicleModal(false)}>
            <div className="st-drawer-box" onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2>Register Fleet Vehicle</h2>
                  <p>Add commercial transport truck or trailer</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowAddVehicleModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddVehicle}>
                <div style={{ margin: '14px 24px 0', padding: '10px 14px', background: '#ecfdf5', border: '1px dashed #34d399', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '12px', color: '#065f46' }}>🤖 AI Auto-Scan Vehicle RC Book</strong>
                    <p style={{ margin: 0, fontSize: '11px', color: '#059669' }}>Upload RC photo to auto-fill plate no, model &amp; Vahan payload</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAiScannerDocType('vehicle_rc');
                      setShowAiScannerModal(true);
                    }}
                    style={{ padding: '6px 14px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Scan RC with AI
                  </button>
                </div>
                <div className="st-drawer-body">
                  <div className="st-form-field">
                    <label>Registration Plate Number *</label>
                    <input
                      type="text"
                      placeholder="e.g., HR-55-XY-9876"
                      value={newPlateNo}
                      onChange={e => setNewPlateNo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Model &amp; Make *</label>
                    <input
                      type="text"
                      placeholder="e.g., Tata Signa 4825.TK or Eicher Pro 3019"
                      value={newVehicleModel}
                      onChange={e => setNewVehicleModel(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Vehicle Configuration</label>
                    <select
                      value={newVehicleType}
                      onChange={e => setNewVehicleType(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option>32ft Multi-Axle (MXL)</option>
                      <option>24ft Container Truck</option>
                      <option>19ft Heavy Medium</option>
                      <option>14ft Closed Body</option>
                      <option>8ft Express Pickup</option>
                    </select>
                  </div>

                  <div className="st-form-field">
                    <label>Payload Capacity (Tons)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="16"
                      value={newVehicleCapacity}
                      onChange={e => setNewVehicleCapacity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Assigned Terminal</label>
                    <select
                      value={newVehicleHub}
                      onChange={e => setNewVehicleHub(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option>Delhi Hub</option>
                      <option>Mumbai Hub</option>
                      <option>Bangalore Hub</option>
                      <option>Kolkata Hub</option>
                      <option>Ahmedabad Hub</option>
                      <option>Pune Hub</option>
                    </select>
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowAddVehicleModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit">
                    Save Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 5: EDIT USER DATA MODAL */}
        {/* ============================================================== */}
        {showEditUserModal && editingUser && (
          <div className="st-modal-overlay" onClick={() => setShowEditUserModal(false)}>
            <div className="st-drawer-box" onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2>Edit User Profile Data</h2>
                  <p>User #{editingUser.id} ({editingUser.email})</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowEditUserModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveUserEdit}>
                <div className="st-drawer-body">
                  <div className="st-form-field">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={editUserName}
                      onChange={e => setEditUserName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={editUserPhone}
                      onChange={e => setEditUserPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={editUserEmail}
                      onChange={e => setEditUserEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Account Status</label>
                    <select
                      value={editUserActive ? 'active' : 'suspended'}
                      onChange={e => setEditUserActive(e.target.value === 'active')}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="active">Active (Access Allowed)</option>
                      <option value="suspended">Suspended (Access Blocked)</option>
                    </select>
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowEditUserModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit" disabled={editUserLoading}>
                    {editUserLoading ? 'Saving...' : 'Save User Updates'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 6: ROLE ASSIGNMENT MODAL (SUPERADMIN ONLY) */}
        {/* ============================================================== */}
        {showRoleModal && roleModalUser && (
          <div className="st-modal-overlay" onClick={() => setShowRoleModal(false)}>
            <div className="st-drawer-box" onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2 style={{ color: '#b45309' }}>👑 Assign System Role</h2>
                  <p>Target User: {roleModalUser.name} ({roleModalUser.email})</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowRoleModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveRole}>
                <div className="st-drawer-body">
                  <div style={{ background: '#fef3c7', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fde68a', color: '#92400e', fontSize: '12px', marginBottom: '16px' }}>
                    Super Admin Privilege: Promoting a user to <strong>Admin</strong> grants them operational dashboard access. Promoting to <strong>SuperAdmin</strong> grants master rights.
                  </div>

                  <div className="st-form-field">
                    <label>Select Role *</label>
                    <select
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value as any)}
                      style={{ width: '100%', padding: '12px', border: '2px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', fontWeight: 600 }}
                    >
                      <option value="User">👤 Customer / Standard User (Shipping &amp; Tracking)</option>
                      <option value="Admin">⚡ Administrator (Operations, Bookings, Fleet &amp; Users)</option>
                      <option value="SuperAdmin">👑 Super Admin (Full Unrestricted Master Rights &amp; Delegation)</option>
                    </select>
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowRoleModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit" disabled={roleUpdating}>
                    {roleUpdating ? 'Assigning...' : 'Confirm Role Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 7: RIGHTS DELEGATION MODAL (SUPERADMIN ONLY) */}
        {/* ============================================================== */}
        {showRightsModal && rightsModalUser && (
          <div className="rights-modal-overlay" onClick={() => setShowRightsModal(false)}>
            <div className="rights-modal-box" onClick={e => e.stopPropagation()}>
              <div className="rights-modal-head">
                <div>
                  <h2 style={{ color: '#4338ca' }}>🛡️ Super Admin Rights Delegation</h2>
                  <p>Assign specific permissions for: <strong>{rightsModalUser.name}</strong> ({rightsModalUser.role})</p>
                </div>
                <button
                  type="button"
                  className="rights-modal-close"
                  onClick={() => setShowRightsModal(false)}
                  title="Close Modal"
                >
                  &times;
                </button>
              </div>

              <div className="rights-modal-body">
                {rightsLoading ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Loading permissions registry...
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', marginBottom: '10px' }}>
                      Toggle individual rights to grant or revoke access to specific subsystems:
                    </p>

                    {/* Quick Presets for Role Delegation */}
                    <div className="rights-preset-wrap" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px', background: '#f1f5f9', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                        Presets:
                      </span>
                      <button
                        type="button"
                        onClick={() => applyRightsPreset('dispatch')}
                        style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 600, background: '#ffffff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        ⚡ Dispatcher
                      </button>
                      <button
                        type="button"
                        onClick={() => applyRightsPreset('finance')}
                        style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 600, background: '#ffffff', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        💳 Finance
                      </button>
                      <button
                        type="button"
                        onClick={() => applyRightsPreset('manager')}
                        style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 600, background: '#ffffff', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        🏢 Hub Manager
                      </button>
                      <button
                        type="button"
                        onClick={() => applyRightsPreset('superadmin')}
                        style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 700, background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        👑 Super Admin (All)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRevokedIds(allSystemRights.map(r => r.id));
                          setGrantedIds([]);
                          showToast('✕ Revoked all permissions for this user');
                        }}
                        style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 700, background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', marginLeft: 'auto' }}
                      >
                        ✕ Revoke All
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {allSystemRights.map(perm => {
                        const isRevoked = revokedIds.includes(perm.id);
                        const isExplicitlyGranted = grantedIds.includes(perm.id);

                        return (
                          <div
                            key={perm.id}
                            className="rights-item-row"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              background: '#f8fafc',
                              border: isRevoked ? '1px solid #fca5a5' : isExplicitlyGranted ? '1px solid #86efac' : '1px solid #e2e8f0',
                              borderRadius: '8px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{perm.code}</strong>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                [{perm.module}] {perm.description || perm.action}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  // Toggle grant
                                  if (isExplicitlyGranted) {
                                    setGrantedIds(prev => prev.filter(x => x !== perm.id));
                                  } else {
                                    setGrantedIds(prev => [...prev, perm.id]);
                                    setRevokedIds(prev => prev.filter(x => x !== perm.id));
                                  }
                                }}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: '1px solid #10b981',
                                  background: isExplicitlyGranted ? '#10b981' : '#ffffff',
                                  color: isExplicitlyGranted ? '#ffffff' : '#10b981'
                                }}
                              >
                                {isExplicitlyGranted ? '✓ Granted' : 'Grant'}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  // Toggle revoke
                                  if (isRevoked) {
                                    setRevokedIds(prev => prev.filter(x => x !== perm.id));
                                  } else {
                                    setRevokedIds(prev => [...prev, perm.id]);
                                    setGrantedIds(prev => prev.filter(x => x !== perm.id));
                                  }
                                }}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: '1px solid #ef4444',
                                  background: isRevoked ? '#ef4444' : '#ffffff',
                                  color: isRevoked ? '#ffffff' : '#ef4444'
                                }}
                              >
                                {isRevoked ? '✕ Revoked' : 'Revoke'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* STICKY BOTTOM ACTIONS BAR - PERMANENTLY VISIBLE */}
              <div className="rights-modal-actions">
                <button
                  type="button"
                  className="st-btn-cancel"
                  onClick={() => setShowRightsModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="st-btn-submit"
                  onClick={handleSaveRights}
                  disabled={rightsSaving}
                  style={{ background: '#4338ca' }}
                >
                  {rightsSaving ? 'Saving Rights...' : 'Save Rights Delegation'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ============================================================== */}
        {/* MODAL 8: ADD PAN-INDIA HUB MODAL (SUPERADMIN ONLY) */}
        {/* ============================================================== */}
        {showAddHubModal && (
          <div className="st-modal-overlay" onClick={() => setShowAddHubModal(false)}>
            <div className="st-drawer-box" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2 style={{ color: '#0369a1' }}>🏢 Add Pan-India Terminal / Hub</h2>
                  <p>Register a new regional hub, warehouse, or transit office into the nationwide network</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowAddHubModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddHubSubmit}>
                <div className="st-drawer-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="st-form-field">
                      <label>Hub Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. BLR-HUB-02"
                        value={newHubCode}
                        onChange={e => setNewHubCode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="st-form-field">
                      <label>Hub / Terminal Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Bangalore South Hub"
                        value={newHubName}
                        onChange={e => setNewHubName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                    <div className="st-form-field">
                      <label>City *</label>
                      <input
                        type="text"
                        placeholder="e.g. Bengaluru"
                        value={newHubCity}
                        onChange={e => setNewHubCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="st-form-field">
                      <label>State *</label>
                      <input
                        type="text"
                        placeholder="e.g. Karnataka"
                        value={newHubState}
                        onChange={e => setNewHubState(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                    <div className="st-form-field">
                      <label>Capacity (Sq. Ft / Tonnage)</label>
                      <input
                        type="number"
                        placeholder="e.g. 35000"
                        value={newHubCapacity}
                        onChange={e => setNewHubCapacity(e.target.value)}
                      />
                    </div>
                    <div className="st-form-field">
                      <label>Manager / Contact No.</label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98450 12345"
                        value={newHubManager}
                        onChange={e => setNewHubManager(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="st-form-field" style={{ marginTop: '10px' }}>
                    <label>Terminal Physical Address</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Plot 42, Electronic City Logistics Park, Phase II, Bengaluru"
                      value={newHubAddress}
                      onChange={e => setNewHubAddress(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowAddHubModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit">
                    ✓ Create Hub Terminal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* OPERATIONAL CONTROL MODALS */}
        {/* ============================================================== */}

        {/* 1. DISPATCH FLEET & DRIVER ALLOTMENT MODAL */}
        {showDispatchModal && dispatchBookingTarget && (
          <div className="st-modal-overlay" onClick={() => setShowDispatchModal(false)}>
            <div className="st-drawer-box" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2 style={{ color: '#059669' }}>🚛 Allot Fleet &amp; Driver (Dispatch)</h2>
                  <p>Consignment #{dispatchBookingTarget.bookingNo} • {dispatchBookingTarget.route}</p>
                </div>
                <button type="button" className="st-drawer-close" onClick={() => setShowDispatchModal(false)}>
                  &times;
                </button>
              </div>

              <div className="st-drawer-body">
                <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '12px', marginBottom: '14px' }}>
                  Allotting a vehicle and driver automatically shifts booking status to <strong>In Transit</strong> and generates an official printable <strong>Dispatch Challan &amp; Gate Pass</strong>.
                </div>

                <div className="st-form-field">
                  <label>Select Commercial Vehicle *</label>
                  <select
                    value={selectedDispatchVehicle}
                    onChange={e => setSelectedDispatchVehicle(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                  >
                    {INITIAL_VEHICLES.map(v => (
                      <option key={v.plateNo} value={v.plateNo}>
                        {v.plateNo} - {v.model} ({v.type}) [{v.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="st-form-field" style={{ marginTop: '12px' }}>
                  <label>Assign Commercial Driver *</label>
                  <select
                    value={selectedDispatchDriver}
                    onChange={e => setSelectedDispatchDriver(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                  >
                    {INITIAL_DRIVERS.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.phone}) • DL: {d.licenseNo} [{d.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="st-form-field" style={{ marginTop: '12px' }}>
                  <label>Govt E-Way Bill Number (Auto-linked)</label>
                  <input
                    type="text"
                    value={dispatchEwayBill}
                    onChange={e => setDispatchEwayBill(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#059669' }}
                  />
                </div>
              </div>

              <div className="st-drawer-actions">
                <button type="button" className="st-btn-cancel" onClick={() => setShowDispatchModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="st-btn-submit"
                  style={{ background: '#059669' }}
                  onClick={handleConfirmDispatch}
                >
                  ✓ Confirm Allotment &amp; Generate Challan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRINTABLE DISPATCH CHALLAN MODAL */}
        {selectedChallanModalData && (
          <DispatchChallanModal
            data={selectedChallanModalData}
            onClose={() => setSelectedChallanModalData(null)}
          />
        )}

        {/* 3. MANUAL BILTY ENTRY MODAL */}
        {showManualBiltyModal && (
          <ManualBiltyModal
            onClose={() => setShowManualBiltyModal(false)}
            onSubmit={handleManualBiltySubmit}
          />
        )}

        {/* 4. DIGITAL POD VERIFICATION MODAL */}
        {podVerifyBooking && (
          <DigitalPodVerifyModal
            bookingNumber={podVerifyBooking.bookingNo}
            customer={podVerifyBooking.customer}
            route={podVerifyBooking.route}
            initialPod={podVerifyBooking.podData}
            onClose={() => setPodVerifyBooking(null)}
            onApprove={handleApprovePod}
            onReject={handleRejectPod}
          />
        )}

        {/* 5. VIEWING ELECTRONIC POD CERTIFICATE */}
        {viewingElectronicPod && (
          <ElectronicPodModal
            data={viewingElectronicPod}
            onClose={() => setViewingElectronicPod(null)}
          />
        )}

        {/* 6. TELEMATICS LIVE GPS ROUTE RADAR MODAL */}
        {selectedRadarShipment && (
          <div className="lr-modal-overlay" onClick={() => setSelectedRadarShipment(null)}>
            <div style={{ maxWidth: '850px', width: '100%' }} onClick={e => e.stopPropagation()}>
              <LiveGpsRouteMap shipment={selectedRadarShipment} />
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  style={{ padding: '8px 24px', background: '#334155', color: '#ffffff', borderRadius: '6px', cursor: 'pointer', border: 'none', fontWeight: 700 }}
                  onClick={() => setSelectedRadarShipment(null)}
                >
                  ✕ Close Live Telematics Map
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedLr && (
          <ConsignmentLRModal
            data={selectedLr}
            onClose={() => setSelectedLr(null)}
          />
        )}
      </main>
    </div>
  );
}
