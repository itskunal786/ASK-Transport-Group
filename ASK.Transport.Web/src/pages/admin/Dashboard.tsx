import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import { useLanguage } from '../../context/LanguageContext';
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
  createHub,
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
import { isUserApproved, setUserApproved, getApprovalRequests, approveUserRequest, rejectUserRequest, isApprovalPending, type ApprovalRequest } from '../../utils/accessControl';
import './AdminDashboard.css';
import AiOperationsDeck from '../../components/AiOperationsDeck';
import AiOcrScannerModal from '../../components/AiOcrScannerModal';
import FleetOperationsDeck from '../../components/FleetOperationsDeck';
import EnterpriseB2BDeck from '../../components/EnterpriseB2BDeck';
import FinanceAccountingDeck from '../../components/FinanceAccountingDeck';
import NicEwayBillAutoExtensionSuite from '../../components/NicEwayBillAutoExtensionSuite';
import DockYardGatePassManager from '../../components/DockYardGatePassManager';
import ElectronicWeighbridgeDeck from '../../components/ElectronicWeighbridgeDeck';
import DriverTripSettlementHisaab from '../../components/DriverTripSettlementHisaab';
import Ais140SafetyTelematicsRadar from '../../components/Ais140SafetyTelematicsRadar';
import RtoBorderCheckpostVault from '../../components/RtoBorderCheckpostVault';
import CorporateCargoClaimsManager from '../../components/CorporateCargoClaimsManager';
import ExecutiveProfitabilityRadar from '../../components/ExecutiveProfitabilityRadar';
import CaTaxAuditVault from '../../components/CaTaxAuditVault';
import PhysicalPodInwardDeck from '../../components/PhysicalPodInwardDeck';
import DynamicTariffEngine from '../../components/DynamicTariffEngine';
import FinancialPnlAnalyticsDeck from '../../components/FinancialPnlAnalyticsDeck';
import SystemSettingsDeck from '../../components/SystemSettingsDeck';
import ErrorBoundary from '../../components/ErrorBoundary';

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
  status: 'Pending' | 'Picked Up' | 'In Transit' | 'Out for Delivery' | 'Delivered' | string;
  customStatus?: string;
  customNote?: string;
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
    customStatus: 'Priority Express Corridor',
    customNote: 'Fastag automated clearance verified at NH-48',
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
    customStatus: 'e-POD Verified',
    customNote: 'Digital signature captured at Port Gate #2',
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

type AdminTab = 'dashboard' | 'bookings' | 'customers' | 'shipments' | 'drivers' | 'vehicles' | 'hubs' | 'tariff' | 'telematics' | 'ewaybill' | 'support' | 'audit' | 'settings' | 'reports' | 'access' | 'ai_automation' | 'fleet_mgmt' | 'enterprise_b2b' | 'finance_accounting' | 'dock_yard' | 'weighbridge' | 'rto_vault' | 'driver_settlement' | 'ais140_safety' | 'cargo_claims' | 'executive_pnl' | 'tax_audit' | 'pod_inward';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  // Active view in Admin Panel
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const [fleetDeckSubTab, setFleetDeckSubTab] = useState<'expenses' | 'fuel_theft' | 'cold_chain' | 'maintenance' | 'mobile_driver' | 'tyre_radar'>('expenses');
  const [aiDeckSubTab, setAiDeckSubTab] = useState<'3d_load' | 'ocr_scanner' | 'route_predictor' | 'whatsapp_bot' | 'spot_rate_ai'>('3d_load');
  const [financeDeckSubTab, setFinanceDeckSubTab] = useState<'einv' | 'erp' | 'credit' | 'settlement'>('settlement');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Auto-scroll main window to top on tab switch and close mobile drawer
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setIsMobileNavOpen(false);
  }, [activeTab, aiDeckSubTab, fleetDeckSubTab, financeDeckSubTab]);

  // Hierarchical Navigation Accordion State
  const [openNavGroups, setOpenNavGroups] = useState<Record<string, boolean>>({
    operations: true,
    fleet: true,
    enterprise: true,
    ai: true,
    governance: false,
  });

  const toggleNavGroup = (groupKey: string) => {
    setOpenNavGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Simple Dropdown Navigation State

  const isGroupActive = (group: 'operations' | 'fleet' | 'enterprise' | 'ai' | 'governance'): boolean => {
    switch (group) {
      case 'operations':
        return ['bookings', 'shipments', 'ewaybill', 'hubs', 'dock_yard', 'weighbridge', 'rto_vault', 'pod_inward'].includes(activeTab);
      case 'fleet':
        return ['fleet_mgmt', 'vehicles', 'drivers', 'telematics', 'driver_settlement', 'ais140_safety'].includes(activeTab);
      case 'enterprise':
        return ['enterprise_b2b', 'finance_accounting', 'tariff', 'cargo_claims', 'executive_pnl', 'tax_audit'].includes(activeTab);
      case 'ai':
        return activeTab === 'ai_automation';
      case 'governance':
        return ['customers', 'access', 'audit', 'support', 'reports', 'settings'].includes(activeTab);
      default:
        return false;
    }
  };

  useEffect(() => {
    if (['bookings', 'shipments', 'ewaybill', 'hubs', 'dock_yard', 'weighbridge', 'rto_vault', 'pod_inward'].includes(activeTab)) {
      setOpenNavGroups(prev => (prev.operations ? prev : { ...prev, operations: true }));
    } else if (['fleet_mgmt', 'vehicles', 'drivers', 'telematics', 'driver_settlement', 'ais140_safety'].includes(activeTab)) {
      setOpenNavGroups(prev => (prev.fleet ? prev : { ...prev, fleet: true }));
    } else if (['enterprise_b2b', 'finance_accounting', 'tariff', 'cargo_claims', 'executive_pnl', 'tax_audit'].includes(activeTab)) {
      setOpenNavGroups(prev => (prev.enterprise ? prev : { ...prev, enterprise: true }));
    } else if (activeTab === 'ai_automation') {
      setOpenNavGroups(prev => (prev.ai ? prev : { ...prev, ai: true }));
    } else if (['customers', 'access', 'audit', 'support', 'reports', 'settings'].includes(activeTab)) {
      setOpenNavGroups(prev => (prev.governance ? prev : { ...prev, governance: true }));
    }
  }, [activeTab]);

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

  // 6. Telematics & GPS Radar State
  const [telematicsFleet, setTelematicsFleet] = useState<TelematicsVehicle[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ask_telematics_fleet');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return INITIAL_TELEMATICS_FLEET;
  });
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



  // Audit Logs Filter
  const [auditActionFilter, setAuditActionFilter] = useState('All');

  // Digital LR Modal Preview
  const [selectedLr, setSelectedLr] = useState<ConsignmentLRData | null>(null);

  // Hubs State
  const [hubsList, setHubsList] = useState<HubItem[]>([]);
  const [hubsLoading, setHubsLoading] = useState(false);
  const [hubSearchQuery, setHubSearchQuery] = useState('');
  const [hubStatusFilter, setHubStatusFilter] = useState<'all' | 'operational' | 'standby'>('all');
  const [hubSortBy, setHubSortBy] = useState<'default' | 'capacity' | 'name'>('default');

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

  // Super Admin Account Clearance Notifications
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(() => getApprovalRequests());
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement | null>(null);

  const pendingRequests = approvalRequests.filter(r => r.status === 'PENDING');

  useEffect(() => {
    function refreshRequests() {
      setApprovalRequests(getApprovalRequests());
    }

    window.addEventListener('ask_approval_request_submitted', refreshRequests);
    window.addEventListener('ask_approval_request_updated', refreshRequests);
    window.addEventListener('ask_access_control_change', refreshRequests);

    function handleClickOutside(e: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('ask_approval_request_submitted', refreshRequests);
      window.removeEventListener('ask_approval_request_updated', refreshRequests);
      window.removeEventListener('ask_access_control_change', refreshRequests);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  async function handleQuickApprove(req: ApprovalRequest) {
    await approveUserRequest(req.userId, req.userEmail);
    setApprovalRequests(getApprovalRequests());
    setAdminUsers(prev => prev.map(x => (x.id === req.userId || (req.userEmail && x.email.toLowerCase() === req.userEmail.toLowerCase())) ? { ...x, isApproved: true } : x));
    showToast(`✓ Account Approved! Full access granted to ${req.userName || req.userEmail}`);
  }

  async function handleQuickReject(req: ApprovalRequest) {
    await rejectUserRequest(req.userId, req.userEmail);
    setApprovalRequests(getApprovalRequests());
    showToast(`🔒 Clearance request for ${req.userName || req.userEmail} rejected.`);
  }

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
      fleet_mgmt: { modules: ['Fleet', 'Expenses'], codes: ['Fleet.View', 'Expenses.Approve'] },
      enterprise_b2b: { modules: ['Enterprise'], codes: ['Enterprise.View'] },
      finance_accounting: { modules: ['Finance'], codes: ['Finance.View'] },
      dock_yard: { modules: ['Hubs', 'Terminal', 'Yard'], codes: ['Hubs.View'] },
      weighbridge: { modules: ['Weighbridge', 'Fleet'], codes: ['Fleet.View'] },
      rto_vault: { modules: ['Fleet', 'Operations'], codes: ['Fleet.View'] },
      driver_settlement: { modules: ['Fleet', 'Expenses'], codes: ['Expenses.Approve'] },
      ais140_safety: { modules: ['Telematics', 'Fleet'], codes: ['Telematics.View'] },
      cargo_claims: { modules: ['Enterprise', 'Finance'], codes: ['Enterprise.View'] },
      executive_pnl: { modules: ['Finance', 'Executive'], codes: ['Executive.View'] },
      tax_audit: { modules: ['Finance', 'Audit'], codes: ['Audit.View', 'Finance.View'] },
      pod_inward: { modules: ['Operations', 'Terminal'], codes: ['Operations.View', 'Terminal.View'] }
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
      if (hasViewRevoked) {
        return {
          revoked: true,
          reason: `Super Admin has revoked access: ${matchingRevoked.map(p => p.code).join(', ')}`
        };
      }
    }

    return { revoked: false };
  }

  // Shipments state (with localStorage persistence)
  const [shipmentsList, setShipmentsList] = useState<ShipmentRow[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ask_admin_shipments');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return INITIAL_SHIPMENTS;
  });
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [shipmentFilterStatus, setShipmentFilterStatus] = useState('All');
  const [showUpdateShipmentModal, setShowUpdateShipmentModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentRow | null>(null);
  const [newStatus, setNewStatus] = useState<string>('In Transit');
  const [customStatusName, setCustomStatusName] = useState('');
  const [customNoteText, setCustomNoteText] = useState('');
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
  const [vehiclesList, setVehiclesList] = useState<VehicleRow[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ask_fleet_vehicles');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return INITIAL_VEHICLES;
  });
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [editingVehiclePlate, setEditingVehiclePlate] = useState('');
  const [editVehicleModel, setEditVehicleModel] = useState('');
  const [editVehicleType, setEditVehicleType] = useState('32ft Multi-Axle (MXL)');
  const [editVehicleCapacity, setEditVehicleCapacity] = useState('16');
  const [editVehicleHub, setEditVehicleHub] = useState('Delhi Hub');
  const [editVehicleStatus, setEditVehicleStatus] = useState<'Available' | 'On Route' | 'Maintenance'>('Available');
  const [editVehicleFuel, setEditVehicleFuel] = useState('100%');
  const [newPlateNo, setNewPlateNo] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('32ft Multi-Axle (MXL)');
  const [newVehicleCapacity, setNewVehicleCapacity] = useState('16');
  const [newVehicleHub, setNewVehicleHub] = useState('Delhi Hub');
  const [newVehicleDriver, setNewVehicleDriver] = useState('');
  const [newVehicleCorridor, setNewVehicleCorridor] = useState('Delhi ⇄ Mumbai High-Speed Freight Corridor');

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
    try {
      await createHub(newHub);
    } catch (err) {
      console.warn('Backend createHub error:', err);
    }
    setHubsList(prev => {
      const updated = [newHub, ...prev.filter(h => h.code !== newHub.code)];
      if (typeof window !== 'undefined') {
        localStorage.setItem('ask_custom_hubs', JSON.stringify(updated));
      }
      return updated;
    });
    setShowAddHubModal(false);
    setNewHubCode('');
    setNewHubName('');
    setNewHubCity('');
    setNewHubState('');
    setNewHubAddress('');
    setNewHubManager('');
    showToast(`✓ Hub ${newHub.code} registered and active!`);
  }

  function handleToggleHubStatus(hubId: number) {
    setHubsList(prev => {
      const updated = prev.map(h => h.id === hubId ? { ...h, isActive: !h.isActive } : h);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ask_custom_hubs', JSON.stringify(updated));
      }
      return updated;
    });
    showToast('Hub operational status updated');
  }

  function handleDeleteHub(hubId: number) {
    if (!window.confirm('Are you sure you want to decommission this hub terminal?')) return;
    setHubsList(prev => {
      const updated = prev.filter(h => h.id !== hubId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ask_custom_hubs', JSON.stringify(updated));
      }
      return updated;
    });
    showToast('Hub decommissioned successfully');
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

  async function handleToggleUserApproval(u: AdminUserData, approved: boolean) {
    if (approved) {
      await approveUserRequest(u.id, u.email);
    } else {
      await rejectUserRequest(u.id, u.email);
    }
    setUserApproved(u.id, u.email, approved);
    setApprovalRequests(getApprovalRequests());
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
    setCustomStatusName(s.customStatus || '');
    setCustomNoteText(s.customNote || '');
    setNewLocation(s.currentLocation);
    setMilestoneNote(s.customNote || '');
    setShowUpdateShipmentModal(true);
  }

  function handleSaveShipmentStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedShipment) return;

    const finalStatus = newStatus === 'Custom' ? (customStatusName.trim() || 'Custom Status') : newStatus;
    const finalCustomStatus = customStatusName.trim() || (newStatus !== 'Pending' && newStatus !== 'Picked Up' && newStatus !== 'In Transit' && newStatus !== 'Out for Delivery' && newStatus !== 'Delivered' ? newStatus : undefined);
    const finalCustomNote = customNoteText.trim() || milestoneNote.trim() || undefined;

    setShipmentsList(prev => {
      const updated = prev.map(item =>
        item.shipmentNo === selectedShipment.shipmentNo
          ? {
              ...item,
              status: finalStatus,
              customStatus: finalCustomStatus,
              customNote: finalCustomNote,
              currentLocation: newLocation.trim() || item.currentLocation,
              updatedAt: 'Just now'
            }
          : item
      );
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ask_admin_shipments', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    // Also update corresponding booking status if matched
    setBookingsList(prev =>
      prev.map(b =>
        b.bookingNo === selectedShipment.bookingNo
          ? { ...b, status: finalStatus === 'Delivered' ? 'Delivered' : finalStatus === 'Pending' ? 'Pending' : 'In Transit' }
          : b
      )
    );

    setShowUpdateShipmentModal(false);
    showToast(`Shipment ${selectedShipment.shipmentNo} updated! Status: "${finalStatus}"`);
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

  // Handle Edit Vehicle
  function handleOpenEditVehicleModal(v: VehicleRow) {
    setEditingVehiclePlate(v.plateNo);
    setEditVehicleModel(v.model);
    setEditVehicleType(v.type);
    setEditVehicleCapacity(String(v.capacityTons));
    setEditVehicleHub(v.currentHub);
    setEditVehicleStatus(v.status);
    setEditVehicleFuel(v.fuelLevel);
    setShowEditVehicleModal(true);
  }

  function handleSaveEditVehicle(e: React.FormEvent) {
    e.preventDefault();
    if (!editingVehiclePlate || !editVehicleModel.trim()) return;

    const capacity = parseFloat(editVehicleCapacity) || 16;
    const updatedVeh: VehicleRow = {
      plateNo: editingVehiclePlate,
      model: editVehicleModel.trim(),
      type: editVehicleType,
      capacityTons: capacity,
      currentHub: editVehicleHub,
      status: editVehicleStatus,
      fuelLevel: editVehicleFuel
    };

    setVehiclesList(prev => {
      const updated = prev.map(v => v.plateNo === editingVehiclePlate ? updatedVeh : v);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ask_fleet_vehicles', JSON.stringify(updated));
      }
      return updated;
    });

    setShowEditVehicleModal(false);
    showToast(`✓ Vehicle ${editingVehiclePlate} details updated!`);
  }

  function handleDeleteFleetVehicle(plateNo: string) {
    if (window.confirm(`Are you sure you want to delete vehicle ${plateNo} from fleet registry?`)) {
      setVehiclesList(prev => {
        const updated = prev.filter(v => v.plateNo !== plateNo);
        if (typeof window !== 'undefined') {
          localStorage.setItem('ask_fleet_vehicles', JSON.stringify(updated));
        }
        return updated;
      });

      setTelematicsFleet(prev => {
        const updated = prev.filter(t => t.plateNo !== plateNo);
        if (typeof window !== 'undefined') {
          localStorage.setItem('ask_telematics_fleet', JSON.stringify(updated));
        }
        return updated;
      });

      showToast(`🗑️ Vehicle ${plateNo} deleted from fleet registry.`);
    }
  }

  // Handle Add Vehicle
  function handleAddVehicle(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlateNo.trim() || !newVehicleModel.trim()) return;

    const plateNo = newPlateNo.trim().toUpperCase();
    const model = newVehicleModel.trim();
    const capacity = parseFloat(newVehicleCapacity) || 16;
    const hub = newVehicleHub || 'Delhi Hub';
    const driverName = newVehicleDriver.trim() || 'Assigned Fleet Pilot';
    const corridor = newVehicleCorridor.trim() || `${hub} Logistics Corridor`;

    const newVeh: VehicleRow = {
      plateNo,
      model,
      type: newVehicleType,
      capacityTons: capacity,
      currentHub: hub,
      status: 'Available',
      fuelLevel: '100%'
    };

    const newTelem: TelematicsVehicle = {
      plateNo,
      driverName,
      driverPhone: '+91 98765 43210',
      speedKmH: 52,
      locationName: `${hub} Transit Terminal`,
      lat: 28.6139,
      lng: 77.2090,
      engineStatus: 'Running',
      geofenceStatus: 'Within Corridor',
      haltDurationMinutes: 0,
      fuelPercent: 100,
      lastPing: 'Just now',
      routeCorridor: corridor
    };

    setVehiclesList(prev => {
      const updated = [newVeh, ...prev.filter(v => v.plateNo !== plateNo)];
      if (typeof window !== 'undefined') {
        localStorage.setItem('ask_fleet_vehicles', JSON.stringify(updated));
      }
      return updated;
    });

    setTelematicsFleet(prev => {
      const updated = [newTelem, ...prev.filter(t => t.plateNo !== plateNo)];
      if (typeof window !== 'undefined') {
        localStorage.setItem('ask_telematics_fleet', JSON.stringify(updated));
      }
      return updated;
    });

    setShowAddVehicleModal(false);
    setNewPlateNo('');
    setNewVehicleModel('');
    setNewVehicleDriver('');
    showToast(`✓ Commercial Truck ${plateNo} registered into fleet & GPS Telematics Radar!`);
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
    if (shipmentFilterStatus !== 'All') {
      if (shipmentFilterStatus === 'Custom') {
        const isStandard = ['Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'].includes(s.status);
        if (!s.customStatus && !s.customNote && isStandard) return false;
      } else if (s.status !== shipmentFilterStatus) {
        return false;
      }
    }
    if (shipmentSearch.trim()) {
      const q = shipmentSearch.toLowerCase();
      return (
        s.shipmentNo.toLowerCase().includes(q) ||
        s.bookingNo.toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q) ||
        s.origin.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.driver.toLowerCase().includes(q) ||
        (s.customStatus && s.customStatus.toLowerCase().includes(q)) ||
        (s.customNote && s.customNote.toLowerCase().includes(q))
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

  // Filtered Hubs
  const filteredHubsList = hubsList.filter(h => {
    const q = hubSearchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      Boolean(h.name?.toLowerCase().includes(q)) ||
      Boolean(h.code?.toLowerCase().includes(q)) ||
      Boolean(h.city?.toLowerCase().includes(q)) ||
      Boolean(h.state?.toLowerCase().includes(q)) ||
      Boolean(h.address?.toLowerCase().includes(q)) ||
      Boolean(h.contactNumber?.toLowerCase().includes(q));
    const matchesStatus =
      hubStatusFilter === 'all' ||
      (hubStatusFilter === 'operational' && h.isActive) ||
      (hubStatusFilter === 'standby' && !h.isActive);
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (hubSortBy === 'capacity') return (b.capacity || 0) - (a.capacity || 0);
    if (hubSortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });



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
      {/* 1. SIMPLE & CLEAN DROPDOWN ADMIN SIDEBAR */}
      {isMobileNavOpen && (
        <div 
          className="admin-mobile-backdrop" 
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}
      <aside className={`admin-sidebar ${isMobileNavOpen ? 'mobile-open' : ''}`}>
        {/* BRAND LOGO */}
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M1 3h15v13H1z" />
              <path d="M16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div className="admin-brand-text">
            <strong>ASK TRANSPORT</strong>
            <small>LOGISTICS &amp; SUPPLY CHAIN</small>
          </div>
        </div>

        {/* NAVIGATION ACCORDION / DROPDOWN MENU */}
        <nav className="admin-nav-menu">
          {/* TOP STANDALONE: DASHBOARD HOME */}
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
            <span>{t('Dashboard', 'डैशबोर्ड')}</span>
          </button>

          {/* 1. OPERATIONS & DISPATCH DROPDOWN */}
          <div className="admin-nav-group">
            <button
              type="button"
              className={`admin-nav-dropdown-header ${isGroupActive('operations') ? 'active-group' : ''}`}
              onClick={() => toggleNavGroup('operations')}
            >
              <div className="nav-dropdown-title">
                <span className="nav-group-icon">📦</span>
                <span>{t('Operations', 'संचालन')}</span>
              </div>
              <svg
                className={`nav-chevron-icon ${openNavGroups.operations ? 'open' : ''}`}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {openNavGroups.operations && (
              <div className="admin-nav-sub-list">
                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'bookings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bookings')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Bookings & Bilty', 'बुकिंग और बिल्टी')}</span>
                  {isTabRevoked('bookings').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'shipments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('shipments')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Shipments & Dispatch', 'कंसाइनमेंट और डिस्पैच')}</span>
                  {isTabRevoked('shipments').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'ewaybill' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ewaybill')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('NIC E-Way Bill & Part-B', 'ई-वे बिल और भाग-बी')}</span>
                  {isTabRevoked('ewaybill').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'hubs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('hubs')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Hubs & Terminals', 'हब और टर्मिनल')}</span>
                  {isTabRevoked('hubs').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'dock_yard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dock_yard')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Gate Pass & Dock Yard', 'गेट पास और डॉक यार्ड')}</span>
                  {isTabRevoked('dock_yard').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'weighbridge' ? 'active' : ''}`}
                  onClick={() => setActiveTab('weighbridge')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Dharam Kanta & Weighbridge', 'धरम कांटा और वे-ब्रिज')}</span>
                  {isTabRevoked('weighbridge').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'rto_vault' ? 'active' : ''}`}
                  onClick={() => setActiveTab('rto_vault')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('RTO Check-Post Vault', 'आरटीओ चेक-पोस्ट वॉल्ट')}</span>
                  {isTabRevoked('rto_vault').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>
                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'pod_inward' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pod_inward')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Physical POD & SOS Rescue', 'भौतिक पीओडी और आपातकालीन सहायता')}</span>
                  {isTabRevoked('pod_inward').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>
              </div>
            )}
          </div>

          {/* 2. FLEET & DRIVERS DROPDOWN */}
          <div className="admin-nav-group">
            <button
              type="button"
              className={`admin-nav-dropdown-header ${isGroupActive('fleet') ? 'active-group' : ''}`}
              onClick={() => toggleNavGroup('fleet')}
            >
              <div className="nav-dropdown-title">
                <span className="nav-group-icon">🚛</span>
                <span>{t('Fleet & Drivers', 'फ्लीट और चालक')}</span>
              </div>
              <svg
                className={`nav-chevron-icon ${openNavGroups.fleet ? 'open' : ''}`}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {openNavGroups.fleet && (
              <div className="admin-nav-sub-list">
                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'fleet_mgmt' && fleetDeckSubTab === 'expenses' ? 'active' : ''}`}
                  onClick={() => { setFleetDeckSubTab('expenses'); setActiveTab('fleet_mgmt'); }}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Trip Petty Cash & P&L', 'ट्रिप खर्च और लाभ-हानि')}</span>
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'fleet_mgmt' && fleetDeckSubTab === 'fuel_theft' ? 'active' : ''}`}
                  onClick={() => { setFleetDeckSubTab('fuel_theft'); setActiveTab('fleet_mgmt'); }}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Fuel & Diesel Theft Radar', 'ईंधन और डीजल रडार')}</span>
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'fleet_mgmt' && fleetDeckSubTab === 'cold_chain' ? 'active' : ''}`}
                  onClick={() => { setFleetDeckSubTab('cold_chain'); setActiveTab('fleet_mgmt'); }}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Cold-Chain Temp Radar', 'कोल्ड-चेन तापमान रडार')}</span>
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'fleet_mgmt' && fleetDeckSubTab === 'maintenance' ? 'active' : ''}`}
                  onClick={() => { setFleetDeckSubTab('maintenance'); setActiveTab('fleet_mgmt'); }}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Fitness & Renewal Alerts', 'फिटनेस और नवीनीकरण अलर्ट')}</span>
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'fleet_mgmt' && fleetDeckSubTab === 'tyre_radar' ? 'active' : ''}`}
                  onClick={() => { setFleetDeckSubTab('tyre_radar'); setActiveTab('fleet_mgmt'); }}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Tyre & TPMS Radar', 'टायर और टीपीएमएस रडार')}</span>
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'fleet_mgmt' && fleetDeckSubTab === 'mobile_driver' ? 'active' : ''}`}
                  onClick={() => { setFleetDeckSubTab('mobile_driver'); setActiveTab('fleet_mgmt'); }}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Driver Mobile Mode', 'ड्राइवर मोबाइल मोड')}</span>
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'vehicles' ? 'active' : ''}`}
                  onClick={() => setActiveTab('vehicles')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Fleet & Vehicles', 'फ्लीट और वाहन')}</span>
                  {isTabRevoked('vehicles').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'drivers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('drivers')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Sarathi Drivers', 'सारथी चालक')}</span>
                  {isTabRevoked('drivers').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'telematics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('telematics')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('GPS Telematics Radar', 'जीपीएस टेलीमैटिक्स रडार')}</span>
                  {isTabRevoked('telematics').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'driver_settlement' ? 'active' : ''}`}
                  onClick={() => setActiveTab('driver_settlement')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Trip Settlement & Hisaab', 'ट्रिप निपटान और हिसाब')}</span>
                  {isTabRevoked('driver_settlement').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'ais140_safety' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ais140_safety')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('AIS-140 Highway Safety', 'एआईएस-140 सुरक्षा')}</span>
                  {isTabRevoked('ais140_safety').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>
              </div>
            )}
          </div>

          {/* 3. ENTERPRISE & FINANCE DROPDOWN */}
          <div className="admin-nav-group">
            <button
              type="button"
              className={`admin-nav-dropdown-header ${isGroupActive('enterprise') ? 'active-group' : ''}`}
              onClick={() => toggleNavGroup('enterprise')}
            >
              <div className="nav-dropdown-title">
                <span className="nav-group-icon">🏢</span>
                <span>{t('Enterprise & Finance', 'एंटरप्राइज और वित्त')}</span>
              </div>
              <svg
                className={`nav-chevron-icon ${openNavGroups.enterprise ? 'open' : ''}`}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {openNavGroups.enterprise && (
              <div className="admin-nav-sub-list">
                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'finance_accounting' && financeDeckSubTab === 'settlement' ? 'active' : ''}`}
                  onClick={() => { setFinanceDeckSubTab('settlement'); setActiveTab('finance_accounting'); }}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Hired Fleet & 194C TDS', 'किराए का बेड़ा और 194C टीडीएस')}</span>
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'finance_accounting' && financeDeckSubTab !== 'settlement' ? 'active' : ''}`}
                  onClick={() => { setFinanceDeckSubTab('einv'); setActiveTab('finance_accounting'); }}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('GST E-Invoice & ERP Ledgers', 'जीएसटी ई-चालान और ईआरपी लेजर')}</span>
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'cargo_claims' ? 'active' : ''}`}
                  onClick={() => setActiveTab('cargo_claims')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Cargo Claims & SLA Shield', 'कार्गो दावे और एसएलए सुरक्षा')}</span>
                  {isTabRevoked('cargo_claims').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>
                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'executive_pnl' ? 'active' : ''}`}
                  onClick={() => setActiveTab('executive_pnl')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Executive P&L Margins Radar', 'लाभ-हानि मार्जिन रडार')}</span>
                  {isTabRevoked('executive_pnl').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'tax_audit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tax_audit')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('CA 1-Click Tax & Audit Vault', 'सीए टैक्स और ऑडिट वॉल्ट')}</span>
                  {isTabRevoked('tax_audit').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'enterprise_b2b' ? 'active' : ''}`}
                  onClick={() => setActiveTab('enterprise_b2b')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('B2B Bulk, Auction & RTO', 'बी2बी बल्क, नीलामी और आरटीओ')}</span>
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'tariff' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tariff')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Tariff & Rate Matrix', 'भाड़ा दर सूची और मैट्रिक्स')}</span>
                  {isTabRevoked('tariff').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>
              </div>
            )}
          </div>

          {/* 4. AI & AUTOMATION DROPDOWN */}
          <div className="admin-nav-group">
            <button
              type="button"
              className={`admin-nav-dropdown-header ${isGroupActive('ai') ? 'active-group' : ''}`}
              onClick={() => toggleNavGroup('ai')}
            >
              <div className="nav-dropdown-title">
                <span className="nav-group-icon">🧠</span>
                <span>{t('AI & Automation', 'एआई और ऑटोमेशन')}</span>
              </div>
              <svg
                className={`nav-chevron-icon ${openNavGroups.ai ? 'open' : ''}`}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {openNavGroups.ai && (
              <div className="admin-nav-sub-list">
                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'ai_automation' && aiDeckSubTab === '3d_load' ? 'active' : ''}`}
                  onClick={() => { setAiDeckSubTab('3d_load'); setActiveTab('ai_automation'); }}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>3D Cargo Load Planner</span>
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'ai_automation' && aiDeckSubTab === 'ocr_scanner' ? 'active' : ''}`}
                  onClick={() => { setAiDeckSubTab('ocr_scanner'); setActiveTab('ai_automation'); }}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('AI Bilty Scanner (OCR)', 'एआई बिल्टी स्कैनर (ओसीआर)')}</span>
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'ai_automation' && aiDeckSubTab === 'route_predictor' ? 'active' : ''}`}
                  onClick={() => { setAiDeckSubTab('route_predictor'); setActiveTab('ai_automation'); }}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Highway Route Predictor', 'हाईवे मार्ग अनुमान')}</span>
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'ai_automation' && aiDeckSubTab === 'spot_rate_ai' ? 'active' : ''}`}
                  onClick={() => { setAiDeckSubTab('spot_rate_ai'); setActiveTab('ai_automation'); }}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Spot Freight Rate AI', 'स्पॉट भाड़ा दर एआई')}</span>
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'ai_automation' && aiDeckSubTab === 'whatsapp_bot' ? 'active' : ''}`}
                  onClick={() => { setAiDeckSubTab('whatsapp_bot'); setActiveTab('ai_automation'); }}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('WhatsApp AI Logistics Bot', 'व्हाट्सएप एआई लॉजिस्टिक्स बॉट')}</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. GOVERNANCE & ADMIN DROPDOWN */}
          <div className="admin-nav-group">
            <button
              type="button"
              className={`admin-nav-dropdown-header ${isGroupActive('governance') ? 'active-group' : ''}`}
              onClick={() => toggleNavGroup('governance')}
            >
              <div className="nav-dropdown-title">
                <span className="nav-group-icon">⚙️</span>
                <span>{t('Governance & Admin', 'प्रशासन और गवर्नेंस')}</span>
              </div>
              <svg
                className={`nav-chevron-icon ${openNavGroups.governance ? 'open' : ''}`}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {openNavGroups.governance && (
              <div className="admin-nav-sub-list">
                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'customers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('customers')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('User Management', 'उपयोगकर्ता प्रबंधन')}</span>
                  {isTabRevoked('customers').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'access' ? 'active' : ''}`}
                  onClick={() => setActiveTab('access')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Staff Access & Roles', 'स्टाफ अधिकार और भूमिकाएं')}</span>
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'audit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('audit')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Security & Audit Trail', 'सुरक्षा और ऑडिट लॉग')}</span>
                  {isTabRevoked('audit').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'support' ? 'active' : ''}`}
                  onClick={() => setActiveTab('support')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Support & Escalations', 'सहायता और शिकायत निवारण')}</span>
                  {isTabRevoked('support').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'reports' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reports')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('Reports & Data Export', 'रिपोर्ट और डेटा निर्यात')}</span>
                  {isTabRevoked('reports').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>

                <button
                  type="button"
                  className={`admin-nav-sub-item ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <span className="nav-sub-bullet">•</span>
                  <span>{t('System Settings', 'सिस्टम सेटिंग्स')}</span>
                  {isTabRevoked('settings').revoked && <span className="nav-revoked-pill">🔒</span>}
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* CLEAN FOOTER */}
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user-card">
            <div className="admin-user-avatar">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'HQ'}
            </div>
            <div className="admin-user-meta">
              <div className="admin-user-name">{user?.name || 'Administrator'}</div>
              <div className="admin-user-role">{user?.role === 'SuperAdmin' ? t('Super Admin', 'सुपर एडमिन') : t('Staff', 'स्टाफ')}</div>
            </div>
          </div>
          <div className="admin-sidebar-actions-grid">
            <Link to="/landing" className="admin-switch-link" title="Open public portal website">
              <span>🌐 {t('Web', 'वेबसाइट')}</span>
            </Link>
            <button type="button" onClick={logout} className="admin-logout-btn" title="Sign out from session">
              <span>🚪 {t('Sign Out', 'लॉग आउट')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT */}
      <main className="admin-main-viewport">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="admin-topbar-left-group">
            <button
              type="button"
              className="admin-mobile-hamburger"
              onClick={() => setIsMobileNavOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
              title="Toggle Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="admin-mobile-brand-title">
              <strong>ASK TRANSPORT</strong>
            </div>
          </div>

          <div className="admin-top-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder={t(`Search ${activeTab}...`, 'डैशबोर्ड में खोजें...')}
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
                  : activeTab === 'hubs'
                  ? hubSearchQuery
                  : ''
              }
              onChange={e => {
                const val = e.target.value;
                if (activeTab === 'bookings') setBookingSearch(val);
                else if (activeTab === 'customers') setCustomerSearch(val);
                else if (activeTab === 'shipments') setShipmentSearch(val);
                else if (activeTab === 'drivers') setDriverSearch(val);
                else if (activeTab === 'vehicles') setVehicleSearch(val);
                else if (activeTab === 'hubs') setHubSearchQuery(val);
              }}
            />
          </div>

          <div className="admin-topbar-quick-actions">
            <button
              type="button"
              onClick={() => { setFleetDeckSubTab('expenses'); setActiveTab('fleet_mgmt'); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: activeTab === 'fleet_mgmt' && fleetDeckSubTab === 'expenses' ? '#059669' : 'rgba(5, 150, 105, 0.12)',
                color: activeTab === 'fleet_mgmt' && fleetDeckSubTab === 'expenses' ? '#ffffff' : '#059669',
                border: '1px solid rgba(5, 150, 105, 0.3)',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>🚛</span> Petty Cash (P&amp;L)
            </button>

            <a
              href="/driver"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(37, 99, 235, 0.12)',
                color: '#2563eb',
                border: '1px solid rgba(37, 99, 235, 0.3)',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <span>📱</span> {t('Driver App (/driver) ↗', 'ड्राइवर ऐप (/driver) ↗')}
            </a>

            <button
              type="button"
              onClick={() => { setFleetDeckSubTab('maintenance'); setActiveTab('fleet_mgmt'); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: activeTab === 'fleet_mgmt' && fleetDeckSubTab === 'maintenance' ? '#dc2626' : 'rgba(220, 38, 38, 0.12)',
                color: activeTab === 'fleet_mgmt' && fleetDeckSubTab === 'maintenance' ? '#ffffff' : '#dc2626',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>🚨</span> {t('Vehicle Radar', 'वाहन रडार')}
            </button>
          </div>
          <div className="admin-top-profile">
            <LanguageToggle />
            <ThemeToggle />

            {/* SUPER ADMIN APPROVAL NOTIFICATION BELL */}
            {(user?.role === 'SuperAdmin' || user?.role === 'Admin') && (
              <div className="admin-notif-container" ref={notifDropdownRef}>
                <button
                  type="button"
                  className="admin-notif-btn"
                  onClick={() => setShowNotifMenu(prev => !prev)}
                  title={pendingRequests.length > 0 ? `${pendingRequests.length} pending account approval requests` : 'Notifications'}
                >
                  <span style={{ fontSize: '17px' }}>🔔</span>
                  {pendingRequests.length > 0 && (
                    <span className="admin-notif-badge">{pendingRequests.length}</span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="admin-notif-dropdown">
                    <div className="admin-notif-header">
                      <div className="admin-notif-title">
                        <span>🔔 Account Clearance Requests</span>
                        {pendingRequests.length > 0 && (
                          <span className="admin-notif-count-chip">{pendingRequests.length} Pending</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNotifMenu(false)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="admin-notif-list">
                      {pendingRequests.length === 0 ? (
                        <div className="admin-notif-empty">
                          <p style={{ margin: '0 0 4px', fontWeight: 600 }}>🎉 All Caught Up!</p>
                          <small>No pending account approval requests. All customers cleared.</small>
                        </div>
                      ) : (
                        pendingRequests.map(req => (
                          <div key={req.id} className="admin-notif-item">
                            <div className="admin-notif-item-top">
                              <div className="admin-notif-user-info">
                                <span className="admin-notif-user-name">{req.userName || 'Customer User'}</span>
                                <span className="admin-notif-user-meta">{req.userEmail} {req.userPhone ? `• ${req.userPhone}` : ''}</span>
                              </div>
                              <span className="admin-notif-time">
                                {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="admin-notif-desc">
                              ⚠️ Requesting full access to Payments, Invoices, and Documents.
                            </div>
                            <div className="admin-notif-actions">
                              <button
                                type="button"
                                className="admin-notif-btn-approve"
                                onClick={() => handleQuickApprove(req)}
                              >
                                ✓ {t('Approve Full Access', 'स्वीकृति दें')}
                              </button>
                              <button
                                type="button"
                                className="admin-notif-btn-reject"
                                onClick={() => handleQuickReject(req)}
                              >
                                ✕ {t('Reject', 'अस्वीकार')}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                  {user?.role === 'SuperAdmin' ? t('👑 Super Admin • Full Rights', '👑 सुपर एडमिन • पूर्ण अधिकार') : t('Admin • Operations Access', 'एडमिन • संचालन अधिकार')}
                </small>
              </div>
            </div>
          </div>
        </header>

        {/* EMERGENCY MAINTENANCE CONTROL BAR */}
        <div className={`admin-maintenance-bar ${isMaintenanceActive ? 'alert' : 'normal'}`}>
          <div className="maintenance-info">
            <span className="pulse-dot" />
            <strong>{isMaintenanceActive ? '⚠️ EMERGENCY MAINTENANCE ACTIVE: PUBLIC BOOKINGS PAUSED' : t('🟢 PLATFORM LIVE & FULLY OPERATIONAL', '🟢 प्लेटफ़ॉर्म लाइव और पूर्णतः संचालित')}</strong>
            <span>{isMaintenanceActive ? 'Online consignment bookings are frozen across web & mobile portals' : t('All public rate calculators, online bookings, and vehicle dispatches running normally', 'सभी सार्वजनिक दर कैलकुलेटर, ऑनलाइन बुकिंग और वाहन डिस्पैच सामान्य रूप से सक्रिय हैं')}</span>
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
                <h1>{t('Operations Command Center', 'संचालन कमांड सेंटर')}</h1>
                <p>{t('Real-time analytics and freight fleet monitoring', 'रीयल-टाइम एनालिटिक्स और मालवाहक बेड़े की निगरानी')}</p>
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
                    <span>{t('Total Bookings', 'कुल बुकिंग')}</span>
                  </div>
                </div>
                <div className="admin-box-delta green">
                  {t('↑ 12.5% vs previous 30 days', '↑ पिछले 30 दिनों से 12.5% अधिक')}
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
                    <span>{t('Active In-Transit', 'सक्रिय पारगमन में')}</span>
                  </div>
                </div>
                <div className="admin-box-delta green">
                  {t('↑ 5.2% on highways', '↑ राजमार्गों पर 5.2% अधिक')}
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
                    <span>{t('Delivered (Month)', 'वितरित (मासिक)')}</span>
                  </div>
                </div>
                <div className="admin-box-delta green">
                  {t('99.4% on-time SLA', '99.4% समय पर एसएलए')}
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
                    <span>{t('Gross Revenue', 'सकल राजस्व')}</span>
                  </div>
                </div>
                <div className="admin-box-delta green">
                  {t('↑ 18.2% GST Invoiced', '↑ 18.2% जीएसटी चालान')}
                </div>
              </div>
            </div>

            {/* 2026 FLEET, DRIVER & EXPENSE COMMAND SUITE */}
            <div style={{
              marginTop: '20px',
              marginBottom: '24px',
              padding: '22px 24px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: '16px',
              border: '1px solid #334155',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              color: '#ffffff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#6ee7b7', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <span>⚡</span> {t('2026 Fleet & Driver Operations Live Hub', '2026 फ्लीट एवं चालक संचालन लाइव हब')}
                  </div>
                  <h2 style={{ margin: '8px 0 4px', fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                    {t('Driver Petty Cash, Mobile Driver Mode & Fleet Compliance Suite', 'चालक खर्च, मोबाइल चालक मोड और वाहन अनुपालन सूट')}
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                    {t('Manage diesel expense slips, launch regional driver mobile app, and monitor RTO fitness & insurance expiry alerts.', 'डीजल पर्ची प्रबंधित करें, क्षेत्रीय ड्राइवर मोबाइल ऐप खोलें, और आरटीओ फिटनेस व बीमा समाप्ति अलर्ट देखें।')}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a
                    href="/driver"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <span>📱</span> {t('Launch Driver Mobile Mode (/driver) ↗', 'ड्राइवर मोबाइल मोड शुरू करें (/driver) ↗')}
                  </a>
                </div>
              </div>

              {/* 3 CORE FEATURE CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* CARD 1: TRIP EXPENSES & DIESEL SLIPS */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      ⛽
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {t('1. Driver Trip Expenses', '1. चालक ट्रिप खर्च')}
                        <span style={{ background: '#10b981', color: '#022c22', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px' }}>P&amp;L</span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                        {t('Review diesel pump receipts, Fastag tolls, puncture repairs, and halting bhatta. 1-click Approve/Reject with real-time Net Profit margin engine.', 'डीजल पर्ची, फास्टैग टोल और चालक भत्ते की समीक्षा करें। रियल-टाइम शुद्ध लाभ मार्जिन के साथ 1-क्लिक में स्वीकार/अस्वीकार करें।')}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => { setFleetDeckSubTab('expenses'); setActiveTab('fleet_mgmt'); }}
                      style={{
                        flex: 1,
                        padding: '9px 14px',
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {t('Audit Petty Cash & P&L →', 'खर्च और लाभ-हानि जांचें →')}
                    </button>
                  </div>
                </div>

                {/* CARD 2: DEDICATED MOBILE DRIVER APP */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      📱
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {t('2. Mobile Driver Mode', '2. मोबाइल चालक मोड')}
                        <span style={{ background: '#3b82f6', color: '#eff6ff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px' }}>HINDI/ENG</span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                        {t('Highway smartphone interface at /driver: Odometer start, 1-tap Google Maps GPS, Camera slip upload, Consignee OTP & POD signature.', '/driver पर मोबाइल इंटरफेस: ओडोमीटर रीडिंग, 1-टैप गूगल मैप्स जीपीएस, कैमरा रसीद अपलोड, ओटीपी और डिजिटल हस्ताक्षर।')}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <a
                      href="/driver"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        flex: 1,
                        padding: '9px 14px',
                        background: '#2563eb',
                        color: '#ffffff',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {t('Open Mobile App (/driver) ↗', 'मोबाइल ऐप खोलें (/driver) ↗')}
                    </a>
                    <button
                      type="button"
                      onClick={() => { setFleetDeckSubTab('mobile_driver'); setActiveTab('fleet_mgmt'); }}
                      style={{
                        padding: '9px 12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#e2e8f0',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title="Preview Driver Console inside Admin"
                    >
                      Admin Preview
                    </button>
                  </div>
                </div>

                {/* CARD 3: VEHICLE MAINTENANCE & FITNESS RADAR */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      🚨
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {t('3. Maintenance & Fitness Radar', '3. रखरखाव और फिटनेस रडार')}
                        <span style={{ background: '#ef4444', color: '#fef2f2', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px' }}>ALERTS</span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                        {t('Track Commercial Insurance, Fitness, PUC, and National Permit expiries + Engine oil KM countdown. 1-Click WhatsApp renewal alerts to drivers.', 'वाहन बीमा, फिटनेस, पीयूसी और राष्ट्रीय परमिट समाप्ति ट्रैक करें। ड्राइवरों को 1-क्लिक व्हाट्सएप नवीनीकरण अलर्ट भेजें।')}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => { setFleetDeckSubTab('maintenance'); setActiveTab('fleet_mgmt'); }}
                      style={{
                        flex: 1,
                        padding: '9px 14px',
                        background: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {t('Open Compliance Radar →', 'अनुपालन रडार खोलें →')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="admin-charts-grid">
              <div className="admin-chart-card">
                <div className="admin-chart-head">
                  <h3>{t('Monthly Bookings Trend', 'मासिक बुकिंग रुझान')}</h3>
                  <div className="admin-chart-sub">{t('Showing 2026 Monthly Volume', '2026 मासिक मात्रा प्रदर्शन')}</div>
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
                  <h3>{t('Shipment Status Breakdown', 'शिपमेंट स्थिति विवरण')}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{t('245 Active Units', '245 सक्रिय इकाइयाँ')}</span>
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
                      <small>{t('Total Units', 'कुल इकाइयाँ')}</small>
                    </div>
                  </div>

                  <div className="admin-donut-legend">
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot delivered" />
                      <span>{t('Delivered', 'वितरित')}</span>
                      <strong className="admin-legend-val">40%</strong>
                    </div>
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot transit" />
                      <span>{t('In Transit', 'मार्ग में')}</span>
                      <strong className="admin-legend-val">35%</strong>
                    </div>
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot pending" />
                      <span>{t('Pending', 'लंबित')}</span>
                      <strong className="admin-legend-val">15%</strong>
                    </div>
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot cancelled" />
                      <span>{t('Cancelled', 'रद्द')}</span>
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
            <ErrorBoundary fallbackTitle="Fleet Petty Cash & Operations Error">
              <FleetOperationsDeck initialTab={fleetDeckSubTab} />
            </ErrorBoundary>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: ENTERPRISE B2B SUITE (BULK, SPOT AUCTION, RTO) */}
        {/* ============================================================== */}
        {activeTab === 'enterprise_b2b' && (
          <div className="admin-content-pad">
            <ErrorBoundary fallbackTitle="Enterprise B2B Suite Error">
              <EnterpriseB2BDeck />
            </ErrorBoundary>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: FINANCE, GST & ACCOUNTING AUTOMATION SUITE */}
        {/* ============================================================== */}
        {activeTab === 'finance_accounting' && (
          <div className="admin-content-pad">
            <ErrorBoundary fallbackTitle="Finance & Accounting Suite Error">
              <FinanceAccountingDeck initialSubTab={financeDeckSubTab} />
            </ErrorBoundary>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 0: AI & SMART AUTOMATION LAB */}
        {/* ============================================================== */}
        {activeTab === 'ai_automation' && (
          <div className="admin-content-pad">
            <AiOperationsDeck
              initialDeckTab={aiDeckSubTab}
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
                Access to this module for your account (<strong>{user?.name || user?.email}</strong>) has been revoked by the Super Administrator.
              </p>
              <div className="admin-revoked-details">
                <strong>Revoked Security Policy:</strong>
                <span>{isTabRevoked(activeTab).reason}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)', marginTop: '14px' }}>
                You do not have permission to view or operate data in this subsystem. Please contact a Super Administrator if you require access rights to be delegated.
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
                <h1>{t('Manage Customer Bookings', 'ग्राहक बुकिंग प्रबंधन')}</h1>
                <p>{t('Consignments, schedules, and carrier allocations', 'कंसाइनमेंट, शेड्यूलिंग और वाहन आवंटन')}</p>
              </div>

              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-primary"
                  style={{ background: '#0284c7' }}
                  onClick={() => setShowManualBiltyModal(true)}
                >
                  {t('+ Manual Bilty (Counter Booking)', '+ मैन्युअल बिल्टी (काउंटर बुकिंग)')}
                </button>
                <button type="button" className="admin-btn-export" onClick={exportBookingsToCSV}>
                  Export CSV
                </button>
              </div>
            </div>

            {pendingRequests.length > 0 && (
              <div className="admin-approval-alert-banner">
                <div className="approval-banner-left">
                  <span className="approval-bell-pulse">🔔</span>
                  <div>
                    <strong>{pendingRequests.length} Account Clearance Request{pendingRequests.length > 1 ? 's' : ''} Pending</strong>
                    <p>Shippers are waiting for verification to unlock billing, GST invoices, and electronic documents.</p>
                  </div>
                </div>
                <div className="approval-banner-actions">
                  {pendingRequests.slice(0, 3).map(req => (
                    <button
                      key={req.id}
                      type="button"
                      className="approval-quick-btn"
                      onClick={() => handleQuickApprove(req)}
                      title={`Unlock ${req.userName || req.userEmail}`}
                    >
                      ✓ Quick Approve: {req.userName ? req.userName.split(' ')[0] : req.userEmail.split('@')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                    <th>{t('Booking No', 'बुकिंग सं.')}</th>
                    <th>{t('Customer', 'ग्राहक')}</th>
                    <th>{t('Route', 'मार्ग')}</th>
                    <th>{t('Date', 'दिनांक')}</th>
                    <th>{t('Status', 'स्थिति')}</th>
                    <th>{t('Actions', 'कार्रवाई')}</th>
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
                          className={`admin-badge-status admin-badge-${b.status.toLowerCase().replace(/\s+/g, '-')}`}
                          data-status={b.status}
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
                    <th style={{ width: '15%', minWidth: '110px' }}>{t('User & ID', 'उपयोगकर्ता व आईडी')}</th>
                    <th style={{ width: '18%', minWidth: '140px' }}>{t('Email Address', 'ईमेल पता')}</th>
                    <th style={{ width: '11%', minWidth: '95px' }}>{t('Mobile Phone', 'मोबाइल नंबर')}</th>
                    <th style={{ width: '12%', minWidth: '100px' }}>{t('Assigned Role', 'सौंपी गई भूमिका')}</th>
                    <th style={{ width: '14%', minWidth: '115px' }}>{t('Access Clearance', 'एक्सेस क्लीयरेंस')}</th>
                    <th style={{ width: '8%', minWidth: '70px', textAlign: 'center' }}>{t('Status', 'स्थिति')}</th>
                    <th style={{ width: '22%', minWidth: '150px', textAlign: 'right' }}>{t('Actions & Delegation', 'क्रियाएं व अधिकार')}</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.length > 0 ? (
                    adminUsers.map(u => {
                      const userApproved = isUserApproved(u);
                      return (
                        <tr key={u.id}>
                          <td style={{ verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: 700, fontSize: '13px' }}>{u.name}</div>
                            <small style={{ color: '#94a3b8', fontSize: '11px' }}>ID: #{u.id}</small>
                          </td>
                          <td style={{ verticalAlign: 'middle', color: '#0b72e7', fontWeight: 500 }}>{u.email}</td>
                          <td style={{ verticalAlign: 'middle', color: 'var(--text-secondary, #94a3b8)' }}>{u.phone || '—'}</td>
                          <td style={{ verticalAlign: 'middle' }}>
                            <span
                              className={`admin-badge-status ${
                                u.role === 'SuperAdmin'
                                  ? 'admin-role-superadmin'
                                  : u.role === 'Admin'
                                  ? 'admin-role-admin'
                                  : 'admin-role-user'
                              }`}
                              data-role={u.role}
                              style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {u.role === 'SuperAdmin' ? '👑 Super Admin' : u.role === 'Admin' ? '⚡ Admin' : '👤 User'}
                            </span>
                          </td>
                          <td style={{ verticalAlign: 'middle' }}>
                            {u.role === 'SuperAdmin' ? (
                              <span
                                className="admin-badge-status admin-clearance-master"
                                data-clearance="master"
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                👑 Full Master
                              </span>
                            ) : u.role === 'Admin' ? (
                              <span
                                className="admin-badge-status admin-clearance-admin"
                                data-clearance="admin"
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                ⚡ Admin Cleared
                              </span>
                            ) : userApproved ? (
                              <span
                                className="admin-badge-status admin-clearance-approved"
                                data-clearance="approved"
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="Payments, Invoices & Documents Unlocked"
                              >
                                🟢 Full Access (Approved)
                              </span>
                            ) : isApprovalPending(u.id, u.email) ? (
                              <span
                                className="admin-badge-status admin-clearance-pending"
                                data-clearance="pending"
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  animation: 'notifPulse 2s infinite ease-in-out'
                                }}
                                title="User requested account clearance"
                              >
                                🔔 Approval Requested
                              </span>
                            ) : (
                              <span
                                className="admin-badge-status admin-clearance-restricted"
                                data-clearance="restricted"
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="New User Restricted to Book & Track only"
                              >
                                🟡 Book & Track Only
                              </span>
                            )}
                          </td>
                          <td style={{ verticalAlign: 'middle' }}>
                            <span
                              className={`admin-badge-status ${u.isActive ? 'admin-badge-available' : 'admin-badge-maintenance'}`}
                              data-status={u.isActive ? 'Active' : 'Suspended'}
                              style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '11.5px',
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
                          <td style={{ verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div className="admin-table-action-row" style={{ justifyContent: 'flex-end' }}>
                              {/* Quick Approval / Restriction Action for Regular Users */}
                              {u.role === 'User' && (
                                !userApproved ? (
                                  <button
                                    type="button"
                                    className="admin-btn-action-approve"
                                    onClick={() => handleToggleUserApproval(u, true)}
                                    title="Grant Full Role Access (Unlock Invoices, Payments, Documents)"
                                    style={isApprovalPending(u.id, u.email) ? {
                                      background: '#10b981',
                                      color: '#ffffff',
                                      borderColor: '#059669',
                                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)',
                                      fontWeight: 800
                                    } : {}}
                                  >
                                    {isApprovalPending(u.id, u.email) ? '✓ ' + t('Approve Request', 'स्वीकृति दें') : '🔓 ' + t('Grant Access', 'एक्सेस दें')}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="admin-btn-action-restrict"
                                    onClick={() => handleToggleUserApproval(u, false)}
                                    title="Restrict user back to Book &amp; Track only"
                                  >
                                    🔒 {t('Restrict', 'सीमित करें')}
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
                  {['All', 'In Transit', 'Out for Delivery', 'Delivered', 'Pending', 'Custom'].map(st => {
                    const count = st === 'All'
                      ? shipmentsList.length
                      : st === 'Custom'
                      ? shipmentsList.filter(x => x.customStatus || x.customNote).length
                      : shipmentsList.filter(x => x.status === st).length;
                    return (
                      <button
                        key={st}
                        type="button"
                        className={`admin-filter-pill ${shipmentFilterStatus === st ? 'active' : ''}`}
                        onClick={() => setShipmentFilterStatus(st)}
                      >
                        <span>{st === 'Custom' ? '🏷️ Custom / Notes' : st}</span>
                        <span style={{ fontSize: '10px', opacity: 0.8, marginLeft: '4px' }}>({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="shipment-table-wrapper">
                <table className="admin-data-table" style={{ minWidth: '980px', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Shipment ID</th>
                      <th style={{ width: '150px' }}>Booking / Client</th>
                      <th style={{ width: '180px' }}>Origin → Destination</th>
                      <th style={{ width: '160px' }}>Driver &amp; Vehicle</th>
                      <th style={{ width: '170px' }}>Current Checkpoint</th>
                      <th style={{ width: '130px' }}>{t('Status', 'स्थिति')}</th>
                      <th style={{ width: '200px' }}>Custom Name / Notes</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Dispatch Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.map((s, idx) => (
                      <tr 
                        key={idx} 
                        className="shipment-table-row"
                        onClick={() => openUpdateShipmentModal(s)}
                        title="Click to update status"
                      >
                        <td>
                          <strong style={{ color: '#0b72e7', fontFamily: 'monospace', fontSize: '13px' }}>{s.shipmentNo}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{s.updatedAt}</div>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{s.customer}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Waybill: {s.bookingNo}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>{s.origin}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>→ {s.destination}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{s.driver}</div>
                          <div style={{ fontSize: '11px', color: '#0b72e7', fontWeight: 600 }}>{s.vehicle}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
                            📍 {s.currentLocation}
                          </span>
                        </td>
                        <td>
                          <span className={`shipment-status-pill ${
                            s.status === 'In Transit' ? 'in-transit' :
                            s.status === 'Delivered' ? 'delivered' :
                            s.status === 'Out for Delivery' ? 'out-for-delivery' :
                            s.status === 'Pending' ? 'pending' : 'custom'
                          }`}>
                            {s.status === 'In Transit' && '🚚 '}
                            {s.status === 'Delivered' && '✅ '}
                            {s.status === 'Out for Delivery' && '🎯 '}
                            {s.status === 'Pending' && '⏳ '}
                            {s.status}
                          </span>
                        </td>
                        <td>
                          {s.customStatus || s.customNote ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '240px' }}>
                              {s.customStatus && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: 'rgba(139, 92, 246, 0.12)',
                                    color: '#8b5cf6',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    width: 'fit-content'
                                  }}
                                >
                                  🏷️ {s.customStatus}
                                </span>
                              )}
                              {s.customNote && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    color: 'var(--text-secondary, #94a3b8)',
                                    lineHeight: 1.35,
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word'
                                  }}
                                  title={s.customNote}
                                >
                                  📝 {s.customNote}
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                openUpdateShipmentModal(s);
                              }}
                              style={{
                                background: 'transparent',
                                border: '1px dashed var(--border, #64748b)',
                                color: 'var(--text-secondary, #94a3b8)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              + Add Custom Note
                            </button>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="shipment-btn-action"
                            onClick={e => {
                              e.stopPropagation();
                              openUpdateShipmentModal(s);
                            }}
                          >
                            ✏️ Update Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 5: DRIVERS (NEW) */}
        {/* ============================================================== */}
        {activeTab === 'drivers' && (
          <div className="admin-content-pad">
            {/* MOBILE DRIVER MODE & PETTY CASH BANNER */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '20px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 4px 14px rgba(29, 78, 216, 0.25)'
            }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                  <span>📱</span> HIGHWAY DRIVER APP READY
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Dedicated Mobile Driver Mode (Bilingual Hindi / English)</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#bfdbfe' }}>
                  Drivers can access <strong>http://localhost:5173/driver</strong> from any smartphone to start trips, navigate via Google Maps, capture diesel slips, and collect consignee delivery OTP &amp; POD.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href="/driver"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#ffffff',
                    color: '#1d4ed8',
                    textDecoration: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  🚀 Open Driver Console (/driver) ↗
                </a>
                <button
                  type="button"
                  onClick={() => { setFleetDeckSubTab('expenses'); setActiveTab('fleet_mgmt'); }}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  ⛽ Audit Driver Petty Cash &amp; Slips →
                </button>
              </div>
            </div>
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
                    <th>{t('Status', 'स्थिति')}</th>
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
                      <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{d.phone}</td>
                      <td>
                        <div>{d.licenseNo}</div>
                        <small style={{ color: '#64748b' }}>{d.licenseType}</small>
                      </td>
                      <td>{d.hub}</td>
                      <td style={{ color: '#0b72e7', fontWeight: 600 }}>{d.assignedVehicle || 'Unassigned'}</td>
                      <td>
                        <span
                          className={`admin-badge-status ${
                            d.status === 'Active' ? 'admin-badge-available' :
                            d.status === 'On Trip' ? 'admin-badge-on-route' : 'admin-badge-off-duty'
                          }`}
                          data-status={d.status}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            background:
                              d.status === 'Active' ? '#edfdf4' :
                              d.status === 'On Trip' ? '#e0f2fe' : '#f1f5f9',
                            color:
                              d.status === 'Active' ? '#10b981' :
                              d.status === 'On Trip' ? '#0b72e7' : '#64748b'
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
            {/* VEHICLE MAINTENANCE RADAR & PETTY CASH BANNER */}
            <div style={{
              background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '20px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 4px 14px rgba(185, 28, 28, 0.25)'
            }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                  <span>🚨</span> COMPLIANCE &amp; EXPIRY RADAR ACTIVE
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Fleet Maintenance, Service &amp; Fitness Renewal Alerts</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#fecaca' }}>
                  Live document tracking: Commercial Insurance, Fitness, PUC, National Permits, and Engine Oil KM countdown with 1-Click WhatsApp reminder triggers.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setFleetDeckSubTab('maintenance'); setActiveTab('fleet_mgmt'); }}
                  style={{
                    background: '#ffffff',
                    color: '#b91c1c',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  🛡️ Open Maintenance Radar →
                </button>
                <button
                  type="button"
                  onClick={() => { setFleetDeckSubTab('expenses'); setActiveTab('fleet_mgmt'); }}
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  ⛽ Fleet Diesel &amp; Trip P&amp;L →
                </button>
              </div>
            </div>
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
                    <th>{t('Status', 'स्थिति')}</th>
                    <th>Actions</th>
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
                          className={`admin-badge-status ${
                            v.status === 'On Route' ? 'admin-badge-on-route' :
                            v.status === 'Available' ? 'admin-badge-available' : 'admin-badge-maintenance'
                          }`}
                          data-status={v.status}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '11.5px',
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
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="admin-btn-view"
                            onClick={() => handleOpenEditVehicleModal(v)}
                            style={{ padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFleetVehicle(v.plateNo)}
                            style={{
                              padding: '4px 10px',
                              fontSize: '11px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 700
                            }}
                          >
                            🗑️ Delete
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
        {/* VIEW 7: REPORTS & EXPORT (NEW) */}
        {/* ============================================================== */}
        {/* ============================================================== */}
        {/* VIEW 7: OPERATIONS, FINANCIAL & P&L ANALYTICS */}
        {/* ============================================================== */}
        {activeTab === 'reports' && (
          <div className="admin-content-pad">
            <FinancialPnlAnalyticsDeck
              onExportPnl={exportPnlToCSV}
              onExportBookings={exportBookingsToCSV}
              onExportRevenue={exportRevenueToCSV}
              onExportDrivers={exportDriversToCSV}
              onExportVehicles={exportVehiclesToCSV}
              showToast={showToast}
            />
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
                    <th>{t('Status', 'स्थिति')}</th>
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
                            className={`admin-badge-status ${staff.role === 'SuperAdmin' ? 'admin-role-superadmin' : 'admin-role-admin'}`}
                            data-role={staff.role}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {staff.role === 'SuperAdmin' ? '👑 Super Admin' : '⚡ Operational Admin'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`admin-badge-status ${staff.isActive ? 'admin-badge-available' : 'admin-badge-maintenance'}`}
                            data-status={staff.isActive ? 'Active' : 'Suspended'}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '11.5px',
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
                                    🔒 {t('Restrict', 'सीमित करें')}
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
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => setShowAddHubModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>➕</span> Add Hub / Terminal
                </button>
              </div>
            </div>

            {/* SEARCH & FILTER BAR */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border, #e2e8f0)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              {/* SEARCH INPUT */}
              <div style={{ flex: '1 1 320px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '15px', pointerEvents: 'none' }}>
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search hubs by name, code (e.g. HUB-DEL-01), city, or state..."
                  value={hubSearchQuery}
                  onChange={e => setHubSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 36px 9px 36px',
                    borderRadius: '8px',
                    border: '1px solid var(--border, #cbd5e1)',
                    background: 'var(--bg-input, #f8fafc)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '13.5px',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                />
                {hubSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setHubSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '2px 6px',
                      borderRadius: '50%'
                    }}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* STATUS FILTER PILLS & SORT */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', background: 'var(--bg-input, #f1f5f9)', borderRadius: '8px', padding: '3px' }}>
                  <button
                    type="button"
                    onClick={() => setHubStatusFilter('all')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: hubStatusFilter === 'all' ? '#0b72e7' : 'transparent',
                      color: hubStatusFilter === 'all' ? '#ffffff' : 'var(--text-secondary, #64748b)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    All ({hubsList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHubStatusFilter('operational')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: hubStatusFilter === 'operational' ? '#10b981' : 'transparent',
                      color: hubStatusFilter === 'operational' ? '#ffffff' : 'var(--text-secondary, #64748b)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    ● Operational ({hubsList.filter(h => h.isActive).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHubStatusFilter('standby')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: hubStatusFilter === 'standby' ? '#f59e0b' : 'transparent',
                      color: hubStatusFilter === 'standby' ? '#ffffff' : 'var(--text-secondary, #64748b)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    ○ Standby ({hubsList.filter(h => !h.isActive).length})
                  </button>
                </div>

                {/* SORT SELECTOR */}
                <select
                  value={hubSortBy}
                  onChange={e => setHubSortBy(e.target.value as any)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border, #cbd5e1)',
                    background: 'var(--bg-card, #ffffff)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '12px',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="default">Default Order</option>
                  <option value="capacity">Throughput (High → Low)</option>
                  <option value="name">Name (A → Z)</option>
                </select>
              </div>
            </div>

            {/* RESULTS COUNT & FILTER FEEDBACK */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontSize: '12.5px', color: 'var(--text-secondary, #64748b)' }}>
              <span>
                Showing <strong>{filteredHubsList.length}</strong> of <strong>{hubsList.length}</strong> hubs &amp; terminals nationwide
              </span>
              {hubSearchQuery && (
                <button
                  type="button"
                  onClick={() => setHubSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#0b72e7', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                >
                  Reset Search
                </button>
              )}
            </div>

            {/* HUBS GRID OR EMPTY STATE */}
            {filteredHubsList.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px 24px',
                  background: 'var(--bg-card, #ffffff)',
                  border: '1px dashed var(--border, #cbd5e1)',
                  borderRadius: '12px',
                  color: 'var(--text-secondary, #64748b)'
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏢</div>
                <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: 'var(--text-primary, #0f172a)' }}>
                  No Hubs or Terminals Found
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '13px' }}>
                  {hubSearchQuery
                    ? `No hubs matched your search "${hubSearchQuery}". Try adjusting your keywords or clearing the filter.`
                    : 'No hubs currently match the selected status filter.'}
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {hubSearchQuery && (
                    <button
                      type="button"
                      className="admin-btn-export"
                      onClick={() => setHubSearchQuery('')}
                    >
                      Clear Search
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-btn-primary"
                    onClick={() => setShowAddHubModal(true)}
                  >
                    ➕ Add New Hub / Terminal
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {filteredHubsList.map(h => (
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
                      justifyContent: 'space-between',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
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
                      {h.address && (
                        <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: 'var(--text-secondary, #94a3b8)', lineHeight: '1.3' }}>
                          {h.address}
                        </p>
                      )}
                      {h.contactNumber && (
                        <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#0b72e7', fontWeight: 600 }}>
                          📞 {h.contactNumber}
                        </p>
                      )}
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
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border, #cbd5e1)',
                          background: 'var(--bg-input, #f8fafc)',
                          color: 'var(--text-primary, #0f172a)',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {h.isActive ? '⏸ Put on Standby' : '▶ Make Operational'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteHub(h.id)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '6px',
                          border: '1px solid #fecaca',
                          background: '#fef2f2',
                          color: '#dc2626',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="Decommission Hub Terminal"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 9.5: TARIFF & RATE MATRIX ENGINE */}
        {/* ============================================================== */}
        {activeTab === 'tariff' && (
          <div className="admin-content-pad">
            <DynamicTariffEngine
              tariffFtlPerKm={tariffFtlPerKm}
              setTariffFtlPerKm={setTariffFtlPerKm}
              tariffFtlMinTrip={tariffFtlMinTrip}
              setTariffFtlMinTrip={setTariffFtlMinTrip}
              tariffPtlPerKgKm={tariffPtlPerKgKm}
              setTariffPtlPerKgKm={setTariffPtlPerKgKm}
              tariffPtlMinFloor={tariffPtlMinFloor}
              setTariffPtlMinFloor={setTariffPtlMinFloor}
              tariffExpressMult={tariffExpressMult}
              setTariffExpressMult={setTariffExpressMult}
              tariffFuelSurcharge={tariffFuelSurcharge}
              setTariffFuelSurcharge={setTariffFuelSurcharge}
              tariffGstPercent={tariffGstPercent}
              setTariffGstPercent={setTariffGstPercent}
              tariffHandlingFee={tariffHandlingFee}
              setTariffHandlingFee={setTariffHandlingFee}
              tariffSaving={tariffSaving}
              onSaveTariff={handleSaveTariffMatrix}
              showToast={showToast}
            />
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
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => setShowAddVehicleModal(true)}
                  style={{
                    background: '#059669',
                    borderColor: '#047857',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: '700',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  <span>➕</span> Add New Truck
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
                <div className="admin-toolbar-filter" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                  <button
                    type="button"
                    onClick={() => setShowAddVehicleModal(true)}
                    style={{
                      background: '#059669',
                      border: 'none',
                      color: '#ffffff',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginLeft: 'auto'
                    }}
                  >
                    <span>➕</span> Add Truck
                  </button>
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
                              <strong style={{ fontSize: '15px', color: '#f8fafc' }}>{v.plateNo}</strong>
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
          <NicEwayBillAutoExtensionSuite />
        )}

        {/* ============================================================== */}
        {/* VIEW: AUTOMATED GATE PASS & DOCK YARD MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'dock_yard' && (
          <div className="admin-content-pad">
            <DockYardGatePassManager />
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: ELECTRONIC WEIGHBRIDGE (DHARAM KANTA) & OVERLOAD SHIELD */}
        {/* ============================================================== */}
        {activeTab === 'weighbridge' && (
          <div className="admin-content-pad">
            <ElectronicWeighbridgeDeck />
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: 1-CLICK RTO BORDER CHECK-POST COMPLIANCE VAULT */}
        {/* ============================================================== */}
        {activeTab === 'rto_vault' && (
          <div className="admin-content-pad">
            <RtoBorderCheckpostVault />
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: DRIVER FINAL TRIP SETTLEMENT & HISAAB PARCHI */}
        {/* ============================================================== */}
        {activeTab === 'driver_settlement' && (
          <div className="admin-content-pad">
            <DriverTripSettlementHisaab />
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: GOVT AIS-140 GPS & HIGHWAY SAFETY RADAR */}
        {/* ============================================================== */}
        {activeTab === 'ais140_safety' && (
          <div className="admin-content-pad">
            <Ais140SafetyTelematicsRadar />
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: CORPORATE SHIPPER SLA & CARGO CLAIMS DISPUTE SHIELD */}
        {/* ============================================================== */}
        {activeTab === 'cargo_claims' && (
          <div className="admin-content-pad">
            <ErrorBoundary fallbackTitle="Corporate Cargo Claims & SLA Dispute Shield Error">
              <CorporateCargoClaimsManager />
            </ErrorBoundary>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: EXECUTIVE ROUTE PROFITABILITY & P&L MARGINS RADAR */}
        {/* ============================================================== */}
        {activeTab === 'executive_pnl' && (
          <div className="admin-content-pad">
            <ErrorBoundary fallbackTitle="Executive Route Profitability & P&L Margins Radar Error">
              <ExecutiveProfitabilityRadar />
            </ErrorBoundary>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: CA 1-CLICK TAX & AUDIT VAULT */}
        {/* ============================================================== */}
        {activeTab === 'tax_audit' && (
          <div className="admin-content-pad">
            <ErrorBoundary fallbackTitle="CA 1-Click Tax & Audit Vault Error">
              <CaTaxAuditVault />
            </ErrorBoundary>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: PHYSICAL POD INWARD & RESCUE DECK */}
        {/* ============================================================== */}
        {activeTab === 'pod_inward' && (
          <div className="admin-content-pad">
            <PhysicalPodInwardDeck />
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
              <div className="support-kpi-card kpi-critical">
                <small>Critical Escalations</small>
                <strong>{supportTickets.filter(t => t.priority === 'Critical' && t.status !== 'Resolved').length} High Priority</strong>
              </div>
              <div className="support-kpi-card kpi-inprogress">
                <small>In Progress</small>
                <strong>{supportTickets.filter(t => t.status === 'In Progress').length} Assigned</strong>
              </div>
              <div className="support-kpi-card kpi-resolved">
                <small>Resolved Today</small>
                <strong>{supportTickets.filter(t => t.status === 'Resolved').length} Solved</strong>
              </div>
              <div className="support-kpi-card kpi-sla">
                <small>Average Resolution SLA</small>
                <strong>28 Mins</strong>
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
                      className={`admin-filter-pill filter-pill-${prio.toLowerCase()} ${ticketFilterPriority === prio ? 'active' : ''}`}
                      onClick={() => setTicketFilterPriority(ticketFilterPriority === prio ? 'All' : prio)}
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
                    <th>{t('Status', 'स्थिति')}</th>
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
                            className={`admin-badge-status ticket-prio-badge ticket-prio-${t.priority.toLowerCase()} admin-priority-${t.priority.toLowerCase()}`}
                            data-priority={t.priority}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`admin-badge-status admin-support-status admin-support-status-${t.status.toLowerCase().replace(/\s+/g, '-')}`}
                            data-status={t.status}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-btn-view admin-btn-manage-ticket"
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
                    <div className="ticket-modal-summary-box">
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Issue Summary</div>
                      <div className="summary-title">{editingTicket.subject}</div>
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
                            className={`ticket-modal-status-btn ${editingTicket.status === st ? 'active' : ''}`}
                            onClick={() => handleUpdateTicketStatus(editingTicket.id, st)}
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
                          <span
                            className={`admin-badge-status admin-audit-badge ${
                              log.action.includes('SUCCESS') || log.action.includes('ACTIVATED') || log.action.includes('GRANTED')
                                ? 'admin-audit-success'
                                : log.action.includes('FAILED') || log.action.includes('Delete') || log.action.includes('Force') || log.action.includes('SUSPENDED')
                                ? 'admin-audit-danger'
                                : log.action.includes('Role') || log.action.includes('Rights') || log.action.includes('WARN')
                                ? 'admin-audit-warning'
                                : 'admin-audit-info'
                            }`}
                            data-action={log.action}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
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
                              className="admin-btn-killswitch"
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
            <SystemSettingsDeck
              settingsList={settingsList}
              settingsLoading={settingsLoading}
              editingSettings={editingSettings}
              setEditingSettings={setEditingSettings}
              savingKey={savingKey}
              onSaveSetting={handleSaveSetting}
              onRefresh={loadSettings}
              showToast={showToast}
            />
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
                <div className="shipment-modal-head-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="shipment-modal-badge">#{selectedShipment.shipmentNo}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)' }}>Waybill: {selectedShipment.bookingNo}</span>
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '4px 0 0', color: 'var(--text-primary, #0f172a)' }}>
                    Update Shipment Status
                  </h2>
                  <div className="shipment-route-pill">
                    <span>{selectedShipment.customer}</span>
                    <span>•</span>
                    <span>📍 {selectedShipment.origin} ➔ {selectedShipment.destination}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowUpdateShipmentModal(false)}
                  title="Close"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveShipmentStatus}>
                <div className="st-drawer-body">
                  <div className="st-form-field">
                    <label className="shipment-field-label">Current Status</label>
                    <select
                      className="shipment-select"
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value)}
                    >
                      <option value="Pending">⏳ Pending (Awaiting Pickup)</option>
                      <option value="Picked Up">📦 Picked Up (At Origin Hub)</option>
                      <option value="In Transit">🚚 In Transit (On Highway)</option>
                      <option value="Out for Delivery">🎯 Out for Delivery (Last Mile)</option>
                      <option value="Delivered">✅ Delivered (Completed)</option>
                      <option value="Custom">🏷️ Custom Status / Special Stage</option>
                    </select>
                  </div>

                  {/* CUSTOM NAME / STAGE INPUT & QUICK PRESET PILLS */}
                  <div className="shipment-custom-card">
                    <label className="shipment-field-label" style={{ color: '#8b5cf6', margin: 0 }}>
                      <span>🏷️ Custom Name / Stage Title</span>
                      <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: 'normal', textTransform: 'none' }}>
                        Optional or Custom Stage
                      </span>
                    </label>
                    <input
                      type="text"
                      className="shipment-input"
                      placeholder="e.g. Held at Border RTO, Weather Hold, Dock Holding..."
                      value={customStatusName}
                      onChange={e => {
                        setCustomStatusName(e.target.value);
                        if (e.target.value.trim() && !['Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'].includes(newStatus)) {
                          setNewStatus('Custom');
                        }
                      }}
                    />

                    {/* QUICK PRESET PILLS FOR EASY 1-CLICK ENTRY */}
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)', fontWeight: 700 }}>
                        Quick One-Click Tags:
                      </span>
                      <div className="shipment-tag-grid">
                        {[
                          '🚨 Held at Border RTO',
                          '🌧️ Weather Hold',
                          '🔄 Hub Transshipment',
                          '⏱️ Customer Rescheduled',
                          '🔧 Breakdown Maintenance',
                          '✅ Gate Pass Verified',
                          '🛑 RTO Inspection',
                          '📦 Weight Verified'
                        ].map(preset => {
                          const isTagActive = customStatusName === preset;
                          return (
                            <button
                              key={preset}
                              type="button"
                              className={`shipment-tag-btn ${isTagActive ? 'active' : ''}`}
                              onClick={() => {
                                setCustomStatusName(preset);
                                setNewStatus('Custom');
                              }}
                            >
                              {preset}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="st-form-field">
                    <label className="shipment-field-label">Current Checkpoint / Location *</label>
                    <input
                      type="text"
                      className="shipment-input"
                      placeholder="e.g., Jaipur Logistics Terminal or NH-48 Toll Plaza"
                      value={newLocation}
                      onChange={e => setNewLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label className="shipment-field-label">📝 Custom Note / Milestone Remarks</label>
                    <textarea
                      className="shipment-textarea"
                      placeholder="e.g., Consignment inspected, seal locks intact, departed terminal or any custom instructions..."
                      value={customNoteText}
                      onChange={e => {
                        setCustomNoteText(e.target.value);
                        setMilestoneNote(e.target.value);
                      }}
                      rows={3}
                    />
                  </div>

                  {/* DRIVER & VEHICLE INFO CARD */}
                  <div className="shipment-driver-box">
                    <div className="shipment-driver-meta">
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary, #94a3b8)', fontWeight: 700 }}>
                        Assigned Driver
                      </span>
                      <strong>👤 {selectedShipment.driver}</strong>
                    </div>
                    <div className="shipment-driver-meta" style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary, #94a3b8)', fontWeight: 700 }}>
                        Assigned Vehicle
                      </span>
                      <strong style={{ color: '#2563eb' }}>🚛 {selectedShipment.vehicle}</strong>
                    </div>
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
                    ✓ Update Status &amp; Notify Client
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
                    <label>Assigned Terminal Hub</label>
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

                  <div className="st-form-field">
                    <label>Assigned Driver (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Suresh Kumar Gurjar"
                      value={newVehicleDriver}
                      onChange={e => setNewVehicleDriver(e.target.value)}
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Active Freight Corridor (GPS Telematics Route)</label>
                    <input
                      type="text"
                      placeholder="e.g. Delhi ⇄ Mumbai High-Speed Freight Corridor"
                      value={newVehicleCorridor}
                      onChange={e => setNewVehicleCorridor(e.target.value)}
                    />
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

        {/* MODAL: EDIT VEHICLE MODAL */}
        {showEditVehicleModal && (
          <div className="st-modal-overlay" onClick={() => setShowEditVehicleModal(false)}>
            <div className="st-drawer-box" onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2>Edit Fleet Vehicle</h2>
                  <p>Registration: {editingVehiclePlate}</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowEditVehicleModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveEditVehicle}>
                <div className="st-drawer-body">
                  <div className="st-form-field">
                    <label>Registration Plate (Immutable)</label>
                    <input
                      type="text"
                      disabled
                      value={editingVehiclePlate}
                      style={{ background: '#f1f5f9', fontWeight: 800, color: '#0f172a' }}
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Truck Model &amp; Maker *</label>
                    <input
                      type="text"
                      required
                      value={editVehicleModel}
                      onChange={e => setEditVehicleModel(e.target.value)}
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Chassis / Body Type</label>
                    <select
                      value={editVehicleType}
                      onChange={e => setEditVehicleType(e.target.value)}
                    >
                      <option value="32ft Multi-Axle (MXL)">32ft Multi-Axle (MXL)</option>
                      <option value="32ft Single Axle (SXL)">32ft Single Axle (SXL)</option>
                      <option value="40ft High-Cube Container Trailer">40ft High-Cube Container Trailer</option>
                      <option value="24ft Open Truck (Taurus 10-Wheel)">24ft Open Truck (Taurus 10-Wheel)</option>
                      <option value="14ft Eicher Close Body">14ft Eicher Close Body</option>
                      <option value="Tata Ace / Intra (Last Mile)">Tata Ace / Intra (Last Mile)</option>
                      <option value="Reefer Cold-Chain Container">Reefer Cold-Chain Container</option>
                    </select>
                  </div>

                  <div className="st-form-field">
                    <label>Payload Capacity (Tons)</label>
                    <input
                      type="number"
                      required
                      value={editVehicleCapacity}
                      onChange={e => setEditVehicleCapacity(e.target.value)}
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Current Assigned Terminal / Hub</label>
                    <select
                      value={editVehicleHub}
                      onChange={e => setEditVehicleHub(e.target.value)}
                    >
                      <option value="Delhi Hub">Delhi Hub</option>
                      <option value="Mumbai Nhava Sheva">Mumbai Nhava Sheva</option>
                      <option value="Bangalore Hub">Bangalore Hub</option>
                      <option value="Kolkata Hub">Kolkata Hub</option>
                      <option value="Ahmedabad Hub">Ahmedabad Hub</option>
                      <option value="Pune Terminal">Pune Terminal</option>
                      <option value="Jaipur SuperHub">Jaipur SuperHub</option>
                    </select>
                  </div>

                  <div className="st-form-field">
                    <label>Vehicle Operational Status</label>
                    <select
                      value={editVehicleStatus}
                      onChange={e => setEditVehicleStatus(e.target.value as any)}
                    >
                      <option value="Available">Available (Ready for Dispatch)</option>
                      <option value="On Route">On Route (In Transit)</option>
                      <option value="Maintenance">Maintenance (Service Bay)</option>
                    </select>
                  </div>

                  <div className="st-form-field">
                    <label>Fuel Level</label>
                    <select
                      value={editVehicleFuel}
                      onChange={e => setEditVehicleFuel(e.target.value)}
                    >
                      <option value="100%">100% (Full Tank)</option>
                      <option value="75%">75%</option>
                      <option value="50%">50%</option>
                      <option value="25%">25% (Refueling Required)</option>
                    </select>
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowEditVehicleModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit">
                    Save Vehicle Changes
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
                              <strong style={{ fontSize: '13px', color: '#f8fafc' }}>{perm.code}</strong>
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
