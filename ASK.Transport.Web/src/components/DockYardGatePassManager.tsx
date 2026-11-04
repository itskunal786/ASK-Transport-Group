import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { expediteDockLoading, authorizeGateOut } from '../api/dockYardApi';
import { getHubs, createHub } from '../api/adminApi';
import './DockYardGatePassManager.css';

// ============================================================================
// DOCK YARD & GATE PASS TYPES & MODELS
// ============================================================================

export type GatePassType = 'INBOUND_UNLOAD' | 'OUTBOUND_DISPATCH' | 'EMPTY_STAGING' | 'MAINTENANCE_BAY';
export type GatePassStatus = 'AT_GATE' | 'DOCKED' | 'LOADING_UNLOADING' | 'INSPECTION_PENDING' | 'GATE_OUT_CLEARED' | 'DETENTION_WARNING';
export type SealStatus = 'INTACT_VERIFIED' | 'TAMPERED_BROKEN' | 'NOT_APPLICABLE';

export interface GatePassRecord {
  id: string;
  passNumber: string;
  type: GatePassType;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  transporterName: string;
  consignmentNo: string;
  materialType: string;
  cargoWeightTon: number;
  assignedBay: string;
  sealNumber: string;
  sealStatus: SealStatus;
  status: GatePassStatus;
  gateInTime: string;
  dockInTime?: string;
  gateOutTime?: string;
  elapsedMinutes: number;
  targetTatMinutes: number;
  demurrageChargesInr: number;
  securityGuardName: string;
  odometerReadingKm: number;
}

export interface DockBayStatus {
  bayId: string;
  bayName: string;
  type: 'UNLOADING' | 'LOADING' | 'REEFER_COLD_BAY' | 'STAGING';
  status: 'OCCUPIED' | 'AVAILABLE' | 'MAINTENANCE';
  activePassNumber?: string;
  activeVehicle?: string;
  material?: string;
  progressPercent?: number;
  elapsedMinutes?: number;
  targetMinutes: number;
}

export interface HubYardConfig {
  code: string;
  name: string;
  city: string;
  state: string;
  capacity: number;
  avgTatMinutes: number;
  demurrageAmount: number;
  bays: DockBayStatus[];
  passes: GatePassRecord[];
}

// ============================================================================
// COMPREHENSIVE MULTI-HUB YARD DATA REPOSITORY
// ============================================================================

export const INITIAL_HUB_DATA_MAP: Record<string, HubYardConfig> = {
  'HUB-PUN-01': {
    code: 'HUB-PUN-01',
    name: 'Pune Logistics Park',
    city: 'Pune',
    state: 'Maharashtra',
    capacity: 3500,
    avgTatMinutes: 68,
    demurrageAmount: 84500,
    bays: [
      {
        bayId: 'BAY-01',
        bayName: 'Bay 1 - Heavy Cargo Unloading',
        type: 'UNLOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-2026-9041',
        activeVehicle: 'MH-12-RN-4421',
        material: 'Auto Engine Parts (24.5 Ton)',
        progressPercent: 70,
        elapsedMinutes: 48,
        targetMinutes: 75
      },
      {
        bayId: 'BAY-02',
        bayName: 'Bay 2 - Fast Express Cross-Dock',
        type: 'LOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-2026-9042',
        activeVehicle: 'DL-01-AJ-8829',
        material: 'E-Commerce Parcels (14.2 Ton)',
        progressPercent: 92,
        elapsedMinutes: 84,
        targetMinutes: 90
      },
      {
        bayId: 'BAY-03',
        bayName: 'Bay 3 - FMCG High Throughput',
        type: 'LOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-2026-9043',
        activeVehicle: 'HR-55-XY-1011',
        material: 'Packaged Foods & Beverages',
        progressPercent: 45,
        elapsedMinutes: 115,
        targetMinutes: 90
      },
      {
        bayId: 'BAY-04',
        bayName: 'Bay 4 - General Cargo Inbound',
        type: 'UNLOADING',
        status: 'AVAILABLE',
        targetMinutes: 60
      },
      {
        bayId: 'BAY-05',
        bayName: 'Bay 5 - Reefer Cold-Chain Terminal',
        type: 'REEFER_COLD_BAY',
        status: 'OCCUPIED',
        activePassNumber: 'GP-2026-9044',
        activeVehicle: 'GJ-03-BW-7744',
        material: 'Pharma Vaccines & APIs (-18°C)',
        progressPercent: 30,
        elapsedMinutes: 28,
        targetMinutes: 60
      },
      {
        bayId: 'BAY-06',
        bayName: 'Bay 6 - Staging & Pre-Dispatch',
        type: 'STAGING',
        status: 'AVAILABLE',
        targetMinutes: 45
      }
    ],
    passes: [
      {
        id: 'GP-PUN-01',
        passNumber: 'GP-2026-9041',
        type: 'INBOUND_UNLOAD',
        vehicleNumber: 'MH-12-RN-4421',
        driverName: 'Ramesh Singh Yadav',
        driverPhone: '+91 98220 11445',
        transporterName: 'ASK Dedicated Fleet',
        consignmentNo: 'ASK-LR-9921',
        materialType: 'Automobile Axles & Steel Bars',
        cargoWeightTon: 24.5,
        assignedBay: 'BAY-01',
        sealNumber: 'SEAL-ASK-99881',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 04:15 PM',
        dockInTime: 'Today, 04:32 PM',
        elapsedMinutes: 48,
        targetTatMinutes: 75,
        demurrageChargesInr: 0,
        securityGuardName: 'Prem Chand (Gate 1)',
        odometerReadingKm: 142850
      },
      {
        id: 'GP-PUN-02',
        passNumber: 'GP-2026-9042',
        type: 'OUTBOUND_DISPATCH',
        vehicleNumber: 'DL-01-AJ-8829',
        driverName: 'Sardar Baldev Singh',
        driverPhone: '+91 98110 55432',
        transporterName: 'Express Logistics India',
        consignmentNo: 'ASK-LR-9922',
        materialType: 'E-Commerce Parcels',
        cargoWeightTon: 14.2,
        assignedBay: 'BAY-02',
        sealNumber: 'SEAL-ASK-99882',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 03:40 PM',
        dockInTime: 'Today, 03:55 PM',
        elapsedMinutes: 84,
        targetTatMinutes: 90,
        demurrageChargesInr: 0,
        securityGuardName: 'Prem Chand (Gate 1)',
        odometerReadingKm: 98450
      },
      {
        id: 'GP-PUN-03',
        passNumber: 'GP-2026-9043',
        type: 'INBOUND_UNLOAD',
        vehicleNumber: 'HR-55-XY-1011',
        driverName: 'Mohd. Imran Khan',
        driverPhone: '+91 99990 88761',
        transporterName: 'North Star Transport',
        consignmentNo: 'ASK-LR-9923',
        materialType: 'Packaged FMCG Goods',
        cargoWeightTon: 18.0,
        assignedBay: 'BAY-03',
        sealNumber: 'SEAL-ASK-99883',
        sealStatus: 'INTACT_VERIFIED',
        status: 'DETENTION_WARNING',
        gateInTime: 'Today, 03:05 PM',
        dockInTime: 'Today, 03:25 PM',
        elapsedMinutes: 115,
        targetTatMinutes: 90,
        demurrageChargesInr: 1800,
        securityGuardName: 'Prem Chand (Gate 1)',
        odometerReadingKm: 218900
      },
      {
        id: 'GP-PUN-04',
        passNumber: 'GP-2026-9044',
        type: 'INBOUND_UNLOAD',
        vehicleNumber: 'GJ-03-BW-7744',
        driverName: 'Kailash Patel',
        driverPhone: '+91 94260 55410',
        transporterName: 'Gujarat Pharma Carriers',
        consignmentNo: 'ASK-LR-9934',
        materialType: 'Pharma Active Ingredients',
        cargoWeightTon: 9.8,
        assignedBay: 'BAY-05',
        sealNumber: 'SEAL-REEFER-4412',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 04:35 PM',
        dockInTime: 'Today, 04:45 PM',
        elapsedMinutes: 28,
        targetTatMinutes: 60,
        demurrageChargesInr: 0,
        securityGuardName: 'Prem Chand (Gate 1)',
        odometerReadingKm: 76540
      },
      {
        id: 'GP-PUN-05',
        passNumber: 'GP-2026-9040',
        type: 'OUTBOUND_DISPATCH',
        vehicleNumber: 'KA-04-MB-1290',
        driverName: 'Suresh Gowda',
        driverPhone: '+91 98450 66201',
        transporterName: 'ASK Dedicated Fleet',
        consignmentNo: 'ASK-LR-9918',
        materialType: 'Industrial Tools & Pumps',
        cargoWeightTon: 16.0,
        assignedBay: 'BAY-04',
        sealNumber: 'SEAL-ASK-99860',
        sealStatus: 'INTACT_VERIFIED',
        status: 'GATE_OUT_CLEARED',
        gateInTime: 'Today, 01:10 PM',
        dockInTime: 'Today, 01:25 PM',
        gateOutTime: 'Today, 02:40 PM',
        elapsedMinutes: 90,
        targetTatMinutes: 90,
        demurrageChargesInr: 0,
        securityGuardName: 'Devendra Kumar (Gate 2)',
        odometerReadingKm: 184300
      }
    ]
  },

  'HUB-DEL-01': {
    code: 'HUB-DEL-01',
    name: 'Delhi Central Logistics Hub',
    city: 'New Delhi',
    state: 'Delhi',
    capacity: 5000,
    avgTatMinutes: 58,
    demurrageAmount: 32000,
    bays: [
      {
        bayId: 'BAY-01',
        bayName: 'Bay 1 - Consumer Electronics Inbound',
        type: 'UNLOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-DEL-101',
        activeVehicle: 'DL-1L-AA-5520',
        material: 'LED Smart Displays (18.5 Ton)',
        progressPercent: 85,
        elapsedMinutes: 52,
        targetMinutes: 75
      },
      {
        bayId: 'BAY-02',
        bayName: 'Bay 2 - Capital Region Cross-Dock',
        type: 'LOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-DEL-102',
        activeVehicle: 'HR-26-CP-9102',
        material: 'Amazon & Flipkart B2B Cargo (16.8 Ton)',
        progressPercent: 78,
        elapsedMinutes: 65,
        targetMinutes: 90
      },
      {
        bayId: 'BAY-03',
        bayName: 'Bay 3 - Textile & Apparel Terminal',
        type: 'LOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-DEL-103',
        activeVehicle: 'UP-14-BT-3319',
        material: 'Export Cotton Garments (12.0 Ton)',
        progressPercent: 95,
        elapsedMinutes: 88,
        targetMinutes: 90
      },
      {
        bayId: 'BAY-04',
        bayName: 'Bay 4 - Heavy Machinery & Spares',
        type: 'UNLOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-DEL-104',
        activeVehicle: 'DL-04-EA-7788',
        material: 'JCB Hydraulic Pumps (26.0 Ton)',
        progressPercent: 40,
        elapsedMinutes: 45,
        targetMinutes: 90
      },
      {
        bayId: 'BAY-05',
        bayName: 'Bay 5 - Cold-Chain Dairy Terminal',
        type: 'REEFER_COLD_BAY',
        status: 'OCCUPIED',
        activePassNumber: 'GP-DEL-105',
        activeVehicle: 'HR-38-EF-4411',
        material: 'Amul Dairy & Ice Cream (-22°C)',
        progressPercent: 60,
        elapsedMinutes: 42,
        targetMinutes: 60
      },
      {
        bayId: 'BAY-06',
        bayName: 'Bay 6 - Staging & Pre-Dispatch',
        type: 'STAGING',
        status: 'AVAILABLE',
        targetMinutes: 45
      }
    ],
    passes: [
      {
        id: 'GP-DEL-01',
        passNumber: 'GP-DEL-101',
        type: 'INBOUND_UNLOAD',
        vehicleNumber: 'DL-1L-AA-5520',
        driverName: 'Gurmeet Singh',
        driverPhone: '+91 98118 77610',
        transporterName: 'Samsung Logistics Division',
        consignmentNo: 'ASK-LR-DEL-801',
        materialType: 'LED Smart Displays',
        cargoWeightTon: 18.5,
        assignedBay: 'BAY-01',
        sealNumber: 'SEAL-DEL-00911',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 03:30 PM',
        dockInTime: 'Today, 03:45 PM',
        elapsedMinutes: 52,
        targetTatMinutes: 75,
        demurrageChargesInr: 0,
        securityGuardName: 'Satish Tyagi (Main Gate)',
        odometerReadingKm: 112400
      },
      {
        id: 'GP-DEL-02',
        passNumber: 'GP-DEL-102',
        type: 'OUTBOUND_DISPATCH',
        vehicleNumber: 'HR-26-CP-9102',
        driverName: 'Rajesh Kumar Yadav',
        driverPhone: '+91 98101 22340',
        transporterName: 'ASK Dedicated Northern Fleet',
        consignmentNo: 'ASK-LR-DEL-802',
        materialType: 'E-Commerce High Priority',
        cargoWeightTon: 16.8,
        assignedBay: 'BAY-02',
        sealNumber: 'SEAL-DEL-00912',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 03:15 PM',
        dockInTime: 'Today, 03:30 PM',
        elapsedMinutes: 65,
        targetTatMinutes: 90,
        demurrageChargesInr: 0,
        securityGuardName: 'Satish Tyagi (Main Gate)',
        odometerReadingKm: 65400
      },
      {
        id: 'GP-DEL-03',
        passNumber: 'GP-DEL-103',
        type: 'OUTBOUND_DISPATCH',
        vehicleNumber: 'UP-14-BT-3319',
        driverName: 'Salim Khan',
        driverPhone: '+91 99120 44872',
        transporterName: 'Raymond Freight Express',
        consignmentNo: 'ASK-LR-DEL-803',
        materialType: 'Export Cotton Garments',
        cargoWeightTon: 12.0,
        assignedBay: 'BAY-03',
        sealNumber: 'SEAL-DEL-00913',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 02:50 PM',
        dockInTime: 'Today, 03:05 PM',
        elapsedMinutes: 88,
        targetTatMinutes: 90,
        demurrageChargesInr: 0,
        securityGuardName: 'Vikram Singh (Gate 3)',
        odometerReadingKm: 189200
      },
      {
        id: 'GP-DEL-04',
        passNumber: 'GP-DEL-104',
        type: 'INBOUND_UNLOAD',
        vehicleNumber: 'DL-04-EA-7788',
        driverName: 'Joginder Pal',
        driverPhone: '+91 98711 00923',
        transporterName: 'Capital Heavy Haulage',
        consignmentNo: 'ASK-LR-DEL-804',
        materialType: 'JCB Hydraulic Pumps',
        cargoWeightTon: 26.0,
        assignedBay: 'BAY-04',
        sealNumber: 'SEAL-DEL-00914',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 04:00 PM',
        dockInTime: 'Today, 04:15 PM',
        elapsedMinutes: 45,
        targetTatMinutes: 90,
        demurrageChargesInr: 0,
        securityGuardName: 'Satish Tyagi (Main Gate)',
        odometerReadingKm: 245100
      },
      {
        id: 'GP-DEL-05',
        passNumber: 'GP-DEL-105',
        type: 'INBOUND_UNLOAD',
        vehicleNumber: 'HR-38-EF-4411',
        driverName: 'Harpreet Singh',
        driverPhone: '+91 98124 55102',
        transporterName: 'Cold-Chain Express Logistics',
        consignmentNo: 'ASK-LR-DEL-805',
        materialType: 'Amul Dairy Products',
        cargoWeightTon: 14.5,
        assignedBay: 'BAY-05',
        sealNumber: 'SEAL-DEL-REEFER-11',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 04:10 PM',
        dockInTime: 'Today, 04:20 PM',
        elapsedMinutes: 42,
        targetTatMinutes: 60,
        demurrageChargesInr: 0,
        securityGuardName: 'Satish Tyagi (Main Gate)',
        odometerReadingKm: 89000
      }
    ]
  },

  'HUB-MUM-02': {
    code: 'HUB-MUM-02',
    name: 'Mumbai JNPT Port Terminal',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    capacity: 6500,
    avgTatMinutes: 74,
    demurrageAmount: 112000,
    bays: [
      {
        bayId: 'BAY-01',
        bayName: 'Bay 1 - 40ft Marine Container Export',
        type: 'LOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-MUM-201',
        activeVehicle: 'MH-46-CL-8801',
        material: 'Container MSKU-882910-4 (32.0 Ton)',
        progressPercent: 60,
        elapsedMinutes: 55,
        targetMinutes: 90
      },
      {
        bayId: 'BAY-02',
        bayName: 'Bay 2 - Hazmat Chemicals Terminal',
        type: 'UNLOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-MUM-202',
        activeVehicle: 'MH-04-KF-1229',
        material: 'Liquid Solvents & Polymers (18.5 Ton)',
        progressPercent: 30,
        elapsedMinutes: 125,
        targetMinutes: 90
      },
      {
        bayId: 'BAY-03',
        bayName: 'Bay 3 - CFS Breakbulk De-stuffing',
        type: 'UNLOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-MUM-203',
        activeVehicle: 'MH-06-AZ-9903',
        material: 'Imported Hot Rolled Steel Coils (28.0 Ton)',
        progressPercent: 80,
        elapsedMinutes: 70,
        targetMinutes: 90
      },
      {
        bayId: 'BAY-04',
        bayName: 'Bay 4 - Port General Inbound',
        type: 'UNLOADING',
        status: 'AVAILABLE',
        targetMinutes: 60
      },
      {
        bayId: 'BAY-05',
        bayName: 'Bay 5 - Seafood Cold-Chain Export',
        type: 'REEFER_COLD_BAY',
        status: 'OCCUPIED',
        activePassNumber: 'GP-MUM-204',
        activeVehicle: 'MH-43-BB-7722',
        material: 'Frozen Black Tiger Prawns (-25°C)',
        progressPercent: 55,
        elapsedMinutes: 38,
        targetMinutes: 60
      },
      {
        bayId: 'BAY-06',
        bayName: 'Bay 6 - Coastal Transshipment Staging',
        type: 'STAGING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-MUM-205',
        activeVehicle: 'MH-12-PQ-6611',
        material: 'Automobile Engines for Africa Export',
        progressPercent: 45,
        elapsedMinutes: 35,
        targetMinutes: 60
      }
    ],
    passes: [
      {
        id: 'GP-MUM-01',
        passNumber: 'GP-MUM-201',
        type: 'OUTBOUND_DISPATCH',
        vehicleNumber: 'MH-46-CL-8801',
        driverName: 'Dnyaneshwar Patil',
        driverPhone: '+91 98200 44512',
        transporterName: 'Maersk India Logistics',
        consignmentNo: 'ASK-LR-MUM-401',
        materialType: 'Marine Export Container',
        cargoWeightTon: 32.0,
        assignedBay: 'BAY-01',
        sealNumber: 'SEAL-JNPT-CUSTOMS-991',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 03:20 PM',
        dockInTime: 'Today, 03:40 PM',
        elapsedMinutes: 55,
        targetTatMinutes: 90,
        demurrageChargesInr: 0,
        securityGuardName: 'Anil Mhatre (JNPT Gate 4)',
        odometerReadingKm: 87500
      },
      {
        id: 'GP-MUM-02',
        passNumber: 'GP-MUM-202',
        type: 'INBOUND_UNLOAD',
        vehicleNumber: 'MH-04-KF-1229',
        driverName: 'Sandeep Kadam',
        driverPhone: '+91 98212 99401',
        transporterName: 'Reliance Petrochem Freight',
        consignmentNo: 'ASK-LR-MUM-402',
        materialType: 'Liquid Solvents & Polymers',
        cargoWeightTon: 18.5,
        assignedBay: 'BAY-02',
        sealNumber: 'SEAL-HAZMAT-4410',
        sealStatus: 'INTACT_VERIFIED',
        status: 'DETENTION_WARNING',
        gateInTime: 'Today, 02:15 PM',
        dockInTime: 'Today, 02:35 PM',
        elapsedMinutes: 125,
        targetTatMinutes: 90,
        demurrageChargesInr: 3600,
        securityGuardName: 'Anil Mhatre (JNPT Gate 4)',
        odometerReadingKm: 132400
      },
      {
        id: 'GP-MUM-03',
        passNumber: 'GP-MUM-203',
        type: 'INBOUND_UNLOAD',
        vehicleNumber: 'MH-06-AZ-9903',
        driverName: 'Vijay More',
        driverPhone: '+91 97660 33120',
        transporterName: 'JSW Steel Port Carrier',
        consignmentNo: 'ASK-LR-MUM-403',
        materialType: 'Hot Rolled Steel Coils',
        cargoWeightTon: 28.0,
        assignedBay: 'BAY-03',
        sealNumber: 'SEAL-JNPT-9942',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 03:00 PM',
        dockInTime: 'Today, 03:20 PM',
        elapsedMinutes: 70,
        targetTatMinutes: 90,
        demurrageChargesInr: 0,
        securityGuardName: 'Tukaram Gawde (Gate 1)',
        odometerReadingKm: 154200
      },
      {
        id: 'GP-MUM-04',
        passNumber: 'GP-MUM-204',
        type: 'OUTBOUND_DISPATCH',
        vehicleNumber: 'MH-43-BB-7722',
        driverName: 'Ganesh Shinde',
        driverPhone: '+91 98205 66781',
        transporterName: 'Coastal Marine Cold-Ex',
        consignmentNo: 'ASK-LR-MUM-404',
        materialType: 'Frozen Black Tiger Prawns',
        cargoWeightTon: 15.0,
        assignedBay: 'BAY-05',
        sealNumber: 'SEAL-COLD-JNPT-01',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 03:45 PM',
        dockInTime: 'Today, 04:00 PM',
        elapsedMinutes: 38,
        targetTatMinutes: 60,
        demurrageChargesInr: 0,
        securityGuardName: 'Anil Mhatre (JNPT Gate 4)',
        odometerReadingKm: 62100
      },
      {
        id: 'GP-MUM-05',
        passNumber: 'GP-MUM-205',
        type: 'OUTBOUND_DISPATCH',
        vehicleNumber: 'MH-12-PQ-6611',
        driverName: 'Sunil Jadhav',
        driverPhone: '+91 98500 11234',
        transporterName: 'Mahindra Automotive Export',
        consignmentNo: 'ASK-LR-MUM-405',
        materialType: 'Automobile Engines',
        cargoWeightTon: 22.0,
        assignedBay: 'BAY-06',
        sealNumber: 'SEAL-ASK-EXP-77',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 03:50 PM',
        dockInTime: 'Today, 04:05 PM',
        elapsedMinutes: 35,
        targetTatMinutes: 60,
        demurrageChargesInr: 0,
        securityGuardName: 'Tukaram Gawde (Gate 1)',
        odometerReadingKm: 98100
      }
    ]
  },

  'HUB-BLR-03': {
    code: 'HUB-BLR-03',
    name: 'Bengaluru Tech & Cargo Park',
    city: 'Bengaluru',
    state: 'Karnataka',
    capacity: 4000,
    avgTatMinutes: 52,
    demurrageAmount: 24000,
    bays: [
      {
        bayId: 'BAY-01',
        bayName: 'Bay 1 - Data Center Server Racks',
        type: 'UNLOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-BLR-301',
        activeVehicle: 'KA-01-MJ-4412',
        material: 'High-Density Cloud Servers (11.0 Ton)',
        progressPercent: 90,
        elapsedMinutes: 45,
        targetMinutes: 60
      },
      {
        bayId: 'BAY-02',
        bayName: 'Bay 2 - E-Commerce Quick Hub',
        type: 'LOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-BLR-302',
        activeVehicle: 'KA-51-AB-9011',
        material: 'Consumer Electronics & Gadgets (15.5 Ton)',
        progressPercent: 75,
        elapsedMinutes: 60,
        targetMinutes: 90
      },
      {
        bayId: 'BAY-03',
        bayName: 'Bay 3 - Aerospace Precision Cargo',
        type: 'UNLOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-BLR-303',
        activeVehicle: 'KA-03-HA-3344',
        material: 'Avionics Wiring & Turbine Spares (8.5 Ton)',
        progressPercent: 40,
        elapsedMinutes: 35,
        targetMinutes: 90
      },
      {
        bayId: 'BAY-04',
        bayName: 'Bay 4 - General Cargo Inbound',
        type: 'UNLOADING',
        status: 'AVAILABLE',
        targetMinutes: 60
      },
      {
        bayId: 'BAY-05',
        bayName: 'Bay 5 - Bio-Pharma Cold Storage',
        type: 'REEFER_COLD_BAY',
        status: 'OCCUPIED',
        activePassNumber: 'GP-BLR-304',
        activeVehicle: 'KA-05-NN-1234',
        material: 'Insulin & Biologicals (-20°C)',
        progressPercent: 35,
        elapsedMinutes: 22,
        targetMinutes: 60
      },
      {
        bayId: 'BAY-06',
        bayName: 'Bay 6 - Outbound Express Staging',
        type: 'STAGING',
        status: 'AVAILABLE',
        targetMinutes: 45
      }
    ],
    passes: [
      {
        id: 'GP-BLR-01',
        passNumber: 'GP-BLR-301',
        type: 'INBOUND_UNLOAD',
        vehicleNumber: 'KA-01-MJ-4412',
        driverName: 'Venkatesh Rao',
        driverPhone: '+91 98450 11902',
        transporterName: 'Tata Communications Logistics',
        consignmentNo: 'ASK-LR-BLR-601',
        materialType: 'Cloud High-Density Servers',
        cargoWeightTon: 11.0,
        assignedBay: 'BAY-01',
        sealNumber: 'SEAL-TECH-0091',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 03:40 PM',
        dockInTime: 'Today, 03:55 PM',
        elapsedMinutes: 45,
        targetTatMinutes: 60,
        demurrageChargesInr: 0,
        securityGuardName: 'Ranganath Swamy (Gate 1)',
        odometerReadingKm: 48900
      },
      {
        id: 'GP-BLR-02',
        passNumber: 'GP-BLR-302',
        type: 'OUTBOUND_DISPATCH',
        vehicleNumber: 'KA-51-AB-9011',
        driverName: 'Manjunath K',
        driverPhone: '+91 98441 55620',
        transporterName: 'Flipkart Quick Sort Express',
        consignmentNo: 'ASK-LR-BLR-602',
        materialType: 'Consumer Electronics',
        cargoWeightTon: 15.5,
        assignedBay: 'BAY-02',
        sealNumber: 'SEAL-ECOM-4410',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 03:20 PM',
        dockInTime: 'Today, 03:35 PM',
        elapsedMinutes: 60,
        targetTatMinutes: 90,
        demurrageChargesInr: 0,
        securityGuardName: 'Ranganath Swamy (Gate 1)',
        odometerReadingKm: 78200
      },
      {
        id: 'GP-BLR-03',
        passNumber: 'GP-BLR-303',
        type: 'INBOUND_UNLOAD',
        vehicleNumber: 'KA-03-HA-3344',
        driverName: 'Anand Kumar',
        driverPhone: '+91 98801 22910',
        transporterName: 'HAL Aerospace Carrier',
        consignmentNo: 'ASK-LR-BLR-603',
        materialType: 'Avionics Turbine Spares',
        cargoWeightTon: 8.5,
        assignedBay: 'BAY-03',
        sealNumber: 'SEAL-AERO-7721',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 04:00 PM',
        dockInTime: 'Today, 04:12 PM',
        elapsedMinutes: 35,
        targetTatMinutes: 90,
        demurrageChargesInr: 0,
        securityGuardName: 'Prakash Gowda (Gate 2)',
        odometerReadingKm: 92400
      },
      {
        id: 'GP-BLR-04',
        passNumber: 'GP-BLR-304',
        type: 'OUTBOUND_DISPATCH',
        vehicleNumber: 'KA-05-NN-1234',
        driverName: 'Nagaraj S',
        driverPhone: '+91 99000 88120',
        transporterName: 'Biocon Biologics Express',
        consignmentNo: 'ASK-LR-BLR-604',
        materialType: 'Insulin & Bio-Vaccines',
        cargoWeightTon: 6.0,
        assignedBay: 'BAY-05',
        sealNumber: 'SEAL-COLD-BIO-09',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 04:15 PM',
        dockInTime: 'Today, 04:25 PM',
        elapsedMinutes: 22,
        targetTatMinutes: 60,
        demurrageChargesInr: 0,
        securityGuardName: 'Ranganath Swamy (Gate 1)',
        odometerReadingKm: 34100
      }
    ]
  },

  'HUB-CCU-04': {
    code: 'HUB-CCU-04',
    name: 'Kolkata East Logistics Gateway',
    city: 'Kolkata',
    state: 'West Bengal',
    capacity: 3200,
    avgTatMinutes: 64,
    demurrageAmount: 42000,
    bays: [
      {
        bayId: 'BAY-01',
        bayName: 'Bay 1 - Jute & Agro Commodities',
        type: 'UNLOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-CCU-401',
        activeVehicle: 'WB-19-K-8822',
        material: 'Export Burlap & Hessian Cloth (22.0 Ton)',
        progressPercent: 65,
        elapsedMinutes: 50,
        targetMinutes: 75
      },
      {
        bayId: 'BAY-02',
        bayName: 'Bay 2 - Eastern Corridors Cross-Dock',
        type: 'LOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-CCU-402',
        activeVehicle: 'WB-23-E-1019',
        material: 'ITC Consumer FMCG Packets (16.0 Ton)',
        progressPercent: 80,
        elapsedMinutes: 72,
        targetMinutes: 90
      },
      {
        bayId: 'BAY-03',
        bayName: 'Bay 3 - Heavy Mining Spares',
        type: 'UNLOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-CCU-403',
        activeVehicle: 'WB-73-F-3312',
        material: 'Heavy Excavator Drill Bits (29.0 Ton)',
        progressPercent: 50,
        elapsedMinutes: 45,
        targetMinutes: 90
      },
      {
        bayId: 'BAY-04',
        bayName: 'Bay 4 - General Cargo Inbound',
        type: 'UNLOADING',
        status: 'AVAILABLE',
        targetMinutes: 60
      },
      {
        bayId: 'BAY-05',
        bayName: 'Bay 5 - Tea Export Cold Terminal',
        type: 'REEFER_COLD_BAY',
        status: 'OCCUPIED',
        activePassNumber: 'GP-CCU-404',
        activeVehicle: 'WB-02-Y-4554',
        material: 'Darjeeling First Flush Tea (12.0 Ton)',
        progressPercent: 40,
        elapsedMinutes: 25,
        targetMinutes: 60
      },
      {
        bayId: 'BAY-06',
        bayName: 'Bay 6 - Staging & Pre-Dispatch',
        type: 'STAGING',
        status: 'AVAILABLE',
        targetMinutes: 45
      }
    ],
    passes: [
      {
        id: 'GP-CCU-01',
        passNumber: 'GP-CCU-401',
        type: 'INBOUND_UNLOAD',
        vehicleNumber: 'WB-19-K-8822',
        driverName: 'Subhasish Roy',
        driverPhone: '+91 98300 44120',
        transporterName: 'Bengal Jute Mills Freight',
        consignmentNo: 'ASK-LR-CCU-501',
        materialType: 'Export Burlap & Hessian',
        cargoWeightTon: 22.0,
        assignedBay: 'BAY-01',
        sealNumber: 'SEAL-CCU-8811',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 03:35 PM',
        dockInTime: 'Today, 03:50 PM',
        elapsedMinutes: 50,
        targetTatMinutes: 75,
        demurrageChargesInr: 0,
        securityGuardName: 'Debabrata Sen (Gate 1)',
        odometerReadingKm: 145200
      },
      {
        id: 'GP-CCU-02',
        passNumber: 'GP-CCU-402',
        type: 'OUTBOUND_DISPATCH',
        vehicleNumber: 'WB-23-E-1019',
        driverName: 'Pradip Ghosh',
        driverPhone: '+91 98311 22901',
        transporterName: 'ITC Eastern Express Logistics',
        consignmentNo: 'ASK-LR-CCU-502',
        materialType: 'Consumer Packaged FMCG',
        cargoWeightTon: 16.0,
        assignedBay: 'BAY-02',
        sealNumber: 'SEAL-CCU-8812',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 03:10 PM',
        dockInTime: 'Today, 03:28 PM',
        elapsedMinutes: 72,
        targetTatMinutes: 90,
        demurrageChargesInr: 0,
        securityGuardName: 'Debabrata Sen (Gate 1)',
        odometerReadingKm: 88900
      },
      {
        id: 'GP-CCU-03',
        passNumber: 'GP-CCU-403',
        type: 'INBOUND_UNLOAD',
        vehicleNumber: 'WB-73-F-3312',
        driverName: 'Bimal Das',
        driverPhone: '+91 94340 77123',
        transporterName: 'Coal India Heavy Spares Logistics',
        consignmentNo: 'ASK-LR-CCU-503',
        materialType: 'Excavator Drill Bits',
        cargoWeightTon: 29.0,
        assignedBay: 'BAY-03',
        sealNumber: 'SEAL-CCU-8813',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 03:50 PM',
        dockInTime: 'Today, 04:05 PM',
        elapsedMinutes: 45,
        targetTatMinutes: 90,
        demurrageChargesInr: 0,
        securityGuardName: 'Sourav Mondal (Gate 2)',
        odometerReadingKm: 198000
      },
      {
        id: 'GP-CCU-04',
        passNumber: 'GP-CCU-404',
        type: 'OUTBOUND_DISPATCH',
        vehicleNumber: 'WB-02-Y-4554',
        driverName: 'Anirban Mukherjee',
        driverPhone: '+91 98320 66100',
        transporterName: 'Goodricke Tea Export Division',
        consignmentNo: 'ASK-LR-CCU-504',
        materialType: 'Darjeeling First Flush Tea',
        cargoWeightTon: 12.0,
        assignedBay: 'BAY-05',
        sealNumber: 'SEAL-TEA-COLD-04',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 04:10 PM',
        dockInTime: 'Today, 04:25 PM',
        elapsedMinutes: 25,
        targetTatMinutes: 60,
        demurrageChargesInr: 0,
        securityGuardName: 'Debabrata Sen (Gate 1)',
        odometerReadingKm: 72400
      }
    ]
  },

  'HUB-AMD-05': {
    code: 'HUB-AMD-05',
    name: 'Ahmedabad Distribution Hub',
    city: 'Ahmedabad',
    state: 'Gujarat',
    capacity: 4500,
    avgTatMinutes: 56,
    demurrageAmount: 36000,
    bays: [
      {
        bayId: 'BAY-01',
        bayName: 'Bay 1 - Textile & Denim Rolls',
        type: 'UNLOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-AMD-501',
        activeVehicle: 'GJ-01-XX-9012',
        material: 'Denim Indigo Fabric Rolls (19.0 Ton)',
        progressPercent: 70,
        elapsedMinutes: 50,
        targetMinutes: 75
      },
      {
        bayId: 'BAY-02',
        bayName: 'Bay 2 - Chemical & Polymer Resins',
        type: 'LOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-AMD-502',
        activeVehicle: 'GJ-27-TT-4419',
        material: 'Plastic Granules & Polymers (25.0 Ton)',
        progressPercent: 85,
        elapsedMinutes: 75,
        targetMinutes: 90
      },
      {
        bayId: 'BAY-03',
        bayName: 'Bay 3 - Ceramic & Sanitary Cargo',
        type: 'UNLOADING',
        status: 'OCCUPIED',
        activePassNumber: 'GP-AMD-503',
        activeVehicle: 'GJ-06-AX-1122',
        material: 'Morbi Vitrified Wall Tiles (17.0 Ton)',
        progressPercent: 40,
        elapsedMinutes: 38,
        targetMinutes: 90
      },
      {
        bayId: 'BAY-04',
        bayName: 'Bay 4 - General Cargo Inbound',
        type: 'UNLOADING',
        status: 'AVAILABLE',
        targetMinutes: 60
      },
      {
        bayId: 'BAY-05',
        bayName: 'Bay 5 - Pharma Finished Goods Terminal',
        type: 'REEFER_COLD_BAY',
        status: 'OCCUPIED',
        activePassNumber: 'GP-AMD-504',
        activeVehicle: 'GJ-03-YY-7890',
        material: 'Temperature Sensitive Antibiotics (-15°C)',
        progressPercent: 50,
        elapsedMinutes: 30,
        targetMinutes: 60
      },
      {
        bayId: 'BAY-06',
        bayName: 'Bay 6 - Staging & Pre-Dispatch',
        type: 'STAGING',
        status: 'AVAILABLE',
        targetMinutes: 45
      }
    ],
    passes: [
      {
        id: 'GP-AMD-01',
        passNumber: 'GP-AMD-501',
        type: 'INBOUND_UNLOAD',
        vehicleNumber: 'GJ-01-XX-9012',
        driverName: 'Hasmukh Patel',
        driverPhone: '+91 98250 88201',
        transporterName: 'Arvind Mills Denim Division',
        consignmentNo: 'ASK-LR-AMD-701',
        materialType: 'Denim Fabric Rolls',
        cargoWeightTon: 19.0,
        assignedBay: 'BAY-01',
        sealNumber: 'SEAL-AMD-9011',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 03:35 PM',
        dockInTime: 'Today, 03:50 PM',
        elapsedMinutes: 50,
        targetTatMinutes: 75,
        demurrageChargesInr: 0,
        securityGuardName: 'Bharat Desai (Gate 1)',
        odometerReadingKm: 112000
      },
      {
        id: 'GP-AMD-02',
        passNumber: 'GP-AMD-502',
        type: 'OUTBOUND_DISPATCH',
        vehicleNumber: 'GJ-27-TT-4419',
        driverName: 'Pravin Shah',
        driverPhone: '+91 98240 66310',
        transporterName: 'Gujarat Polysols Express',
        consignmentNo: 'ASK-LR-AMD-702',
        materialType: 'Plastic Polymers',
        cargoWeightTon: 25.0,
        assignedBay: 'BAY-02',
        sealNumber: 'SEAL-AMD-9012',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 03:05 PM',
        dockInTime: 'Today, 03:25 PM',
        elapsedMinutes: 75,
        targetTatMinutes: 90,
        demurrageChargesInr: 0,
        securityGuardName: 'Bharat Desai (Gate 1)',
        odometerReadingKm: 89400
      },
      {
        id: 'GP-AMD-03',
        passNumber: 'GP-AMD-503',
        type: 'INBOUND_UNLOAD',
        vehicleNumber: 'GJ-06-AX-1122',
        driverName: 'Bhavesh Joshi',
        driverPhone: '+91 99090 33412',
        transporterName: 'Morbi Ceramic Freight Carriers',
        consignmentNo: 'ASK-LR-AMD-703',
        materialType: 'Vitrified Wall Tiles',
        cargoWeightTon: 17.0,
        assignedBay: 'BAY-03',
        sealNumber: 'SEAL-AMD-9013',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 03:55 PM',
        dockInTime: 'Today, 04:08 PM',
        elapsedMinutes: 38,
        targetTatMinutes: 90,
        demurrageChargesInr: 0,
        securityGuardName: 'Kishore Vaghela (Gate 3)',
        odometerReadingKm: 167500
      },
      {
        id: 'GP-AMD-04',
        passNumber: 'GP-AMD-504',
        type: 'OUTBOUND_DISPATCH',
        vehicleNumber: 'GJ-03-YY-7890',
        driverName: 'Jignesh Dave',
        driverPhone: '+91 98255 11980',
        transporterName: 'Cadila Pharma Logistics',
        consignmentNo: 'ASK-LR-AMD-704',
        materialType: 'Antibiotics & Cold-Ex Pharma',
        cargoWeightTon: 14.0,
        assignedBay: 'BAY-05',
        sealNumber: 'SEAL-PHARMA-COLD-05',
        sealStatus: 'INTACT_VERIFIED',
        status: 'LOADING_UNLOADING',
        gateInTime: 'Today, 04:05 PM',
        dockInTime: 'Today, 04:20 PM',
        elapsedMinutes: 30,
        targetTatMinutes: 60,
        demurrageChargesInr: 0,
        securityGuardName: 'Bharat Desai (Gate 1)',
        odometerReadingKm: 54100
      }
    ]
  }
};

export default function DockYardGatePassManager() {
  const { t } = useLanguage();

  // Dynamic Hub selection state
  const [selectedHubCode, setSelectedHubCode] = useState<string>(() => {
    return localStorage.getItem('ask_selected_dockyard_hub') || 'HUB-PUN-01';
  });

  const [hubDataMap, setHubDataMap] = useState<Record<string, HubYardConfig>>(() => INITIAL_HUB_DATA_MAP);
  const [allHubList, setAllHubList] = useState<{ code: string; name: string; city: string; state: string }[]>([
    { code: 'HUB-PUN-01', name: 'Pune Logistics Park', city: 'Pune', state: 'Maharashtra' },
    { code: 'HUB-DEL-01', name: 'Delhi Central Logistics Hub', city: 'New Delhi', state: 'Delhi' },
    { code: 'HUB-MUM-02', name: 'Mumbai JNPT Port Terminal', city: 'Navi Mumbai', state: 'Maharashtra' },
    { code: 'HUB-BLR-03', name: 'Bengaluru Tech & Cargo Park', city: 'Bengaluru', state: 'Karnataka' },
    { code: 'HUB-CCU-04', name: 'Kolkata East Logistics Gateway', city: 'Kolkata', state: 'West Bengal' },
    { code: 'HUB-AMD-05', name: 'Ahmedabad Distribution Hub', city: 'Ahmedabad', state: 'Gujarat' }
  ]);

  // Current active Hub data
  const currentHub = hubDataMap[selectedHubCode] || hubDataMap['HUB-PUN-01'] || INITIAL_HUB_DATA_MAP['HUB-PUN-01'];
  const currentBays = currentHub.bays;
  const currentPasses = currentHub.passes;

  const [selectedPass, setSelectedPass] = useState<GatePassRecord | null>(() => {
    return currentPasses[0] || null;
  });

  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'ACTIVE_DOCKS' | 'DETENTION_ALERTS' | 'GATE_OUT'>('ALL');
  const [showNewGateInModal, setShowNewGateInModal] = useState<boolean>(false);
  const [showCreateHubModal, setShowCreateHubModal] = useState<boolean>(false);
  const [newHubCode, setNewHubCode] = useState<string>('');
  const [newHubName, setNewHubName] = useState<string>('');
  const [newHubCity, setNewHubCity] = useState<string>('');
  const [newHubState, setNewHubState] = useState<string>('');
  const [newHubCapacity, setNewHubCapacity] = useState<string>('3000');
  const [newHubBaysCount, setNewHubBaysCount] = useState<number>(6);
  const [newHubAddress, setNewHubAddress] = useState<string>('');
  const [newHubManager, setNewHubManager] = useState<string>('');
  const [showSlipPrintModal, setShowSlipPrintModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with backend / dynamic hubs
  useEffect(() => {
    getHubs().then(apiHubs => {
      if (apiHubs && apiHubs.length > 0) {
        // Merge with existing list
        setAllHubList(prev => {
          const map = new Map(prev.map(h => [h.code, h]));
          apiHubs.forEach(ah => {
            if (!map.has(ah.code)) {
              map.set(ah.code, {
                code: ah.code,
                name: ah.name,
                city: ah.city || 'Regional Depot',
                state: ah.state || 'India'
              });
            }
          });
          return Array.from(map.values());
        });

        // Initialize any missing hubs in hubDataMap with default bays
        setHubDataMap(prev => {
          const updated = { ...prev };
          apiHubs.forEach(ah => {
            if (!updated[ah.code]) {
              updated[ah.code] = {
                code: ah.code,
                name: ah.name,
                city: ah.city || 'Regional Hub',
                state: ah.state || 'India',
                capacity: ah.capacity || 3000,
                avgTatMinutes: 60,
                demurrageAmount: 18000,
                bays: [
                  { bayId: 'BAY-01', bayName: 'Bay 1 - Inbound Unload', type: 'UNLOADING', status: 'AVAILABLE', targetMinutes: 60 },
                  { bayId: 'BAY-02', bayName: 'Bay 2 - Cross-Dock Staging', type: 'LOADING', status: 'AVAILABLE', targetMinutes: 90 },
                  { bayId: 'BAY-03', bayName: 'Bay 3 - Outbound Express', type: 'LOADING', status: 'AVAILABLE', targetMinutes: 90 },
                  { bayId: 'BAY-04', bayName: 'Bay 4 - General Cargo', type: 'UNLOADING', status: 'AVAILABLE', targetMinutes: 60 },
                  { bayId: 'BAY-05', bayName: 'Bay 5 - Cold Terminal', type: 'REEFER_COLD_BAY', status: 'AVAILABLE', targetMinutes: 60 },
                  { bayId: 'BAY-06', bayName: 'Bay 6 - Pre-Dispatch', type: 'STAGING', status: 'AVAILABLE', targetMinutes: 45 }
                ],
                passes: []
              };
            }
          });
          return updated;
        });
      }
    }).catch(() => {});
  }, []);

  // Handle New Hub Terminal Creation
  const handleCreateHubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubCode.trim() || !newHubName.trim()) {
      setToastMessage('Please provide Hub Code and Terminal Name');
      return;
    }
    const code = newHubCode.trim().toUpperCase();
    const name = newHubName.trim();
    const city = newHubCity.trim() || 'Regional Depot';
    const state = newHubState.trim() || 'India';
    const capacity = parseInt(newHubCapacity) || 3000;

    // Generate active dock bays
    const generatedBays: DockBayStatus[] = [];
    const count = Math.max(2, Math.min(newHubBaysCount, 12));
    for (let i = 1; i <= count; i++) {
      const pad = String(i).padStart(2, '0');
      let type: 'LOADING' | 'UNLOADING' | 'REEFER_COLD_BAY' | 'STAGING' = 'UNLOADING';
      let bayName = `Bay ${i} - Inbound Unload`;
      if (i % 3 === 2) {
        type = 'LOADING';
        bayName = `Bay ${i} - Outbound Dispatch`;
      } else if (i % 3 === 0) {
        type = 'STAGING';
        bayName = `Bay ${i} - Cross-Dock Staging`;
      }
      generatedBays.push({
        bayId: `BAY-${pad}`,
        bayName,
        type,
        status: 'AVAILABLE',
        targetMinutes: 60
      });
    }

    const newConfig: HubYardConfig = {
      code,
      name,
      city,
      state,
      capacity,
      avgTatMinutes: 55,
      demurrageAmount: 15000,
      bays: generatedBays,
      passes: []
    };

    setHubDataMap(prev => ({
      ...prev,
      [code]: newConfig
    }));

    setAllHubList(prev => {
      const exists = prev.some(h => h.code === code);
      if (exists) return prev;
      return [...prev, { code, name, city, state }];
    });

    try {
      await createHub({
        code,
        name,
        city,
        state,
        capacity,
        isActive: true,
        address: newHubAddress.trim(),
        contactNumber: newHubManager.trim()
      });
    } catch (err) {
      console.warn('createHub API fallback', err);
    }

    setSelectedHubCode(code);
    try {
      localStorage.setItem('ask_selected_dockyard_hub', code);
    } catch {}

    setNewHubCode('');
    setNewHubName('');
    setNewHubCity('');
    setNewHubState('');
    setNewHubAddress('');
    setNewHubManager('');
    setShowCreateHubModal(false);
    setToastMessage(`✓ Hub Terminal ${code} registered and active on Dock Yard!`);
  };

  // Handle Hub selection
  const handleSelectHub = (hubCode: string) => {
    setSelectedHubCode(hubCode);
    try {
      localStorage.setItem('ask_selected_dockyard_hub', hubCode);
    } catch {}

    const targetHub = hubDataMap[hubCode];
    if (targetHub && targetHub.passes.length > 0) {
      setSelectedPass(targetHub.passes[0]);
    } else {
      setSelectedPass(null);
    }

    showToast(`🏢 Switched to ${targetHub ? targetHub.name : hubCode} (${targetHub ? targetHub.city : ''})`);
  };

  // New Gate In Form State
  const [newVehicle, setNewVehicle] = useState('MH-04-KD-8819');
  const [newDriver, setNewDriver] = useState('Santosh Kumar Verma');
  const [newPhone, setNewPhone] = useState('+91 98112 44901');
  const [newTransporter] = useState('ASK Dedicated Fleet');
  const [newConsignment, setNewConsignment] = useState('ASK-LR-9945');
  const [newMaterial, setNewMaterial] = useState('Automotive Components');
  const [newWeight, setNewWeight] = useState(18.5);
  const [newBay, setNewBay] = useState('BAY-04');
  const [newSealNo, setNewSealNo] = useState('SEAL-ASK-99912');
  const [newOdo, setNewOdo] = useState(124500);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------

  const handleCreateGateIn = (e: React.FormEvent) => {
    e.preventDefault();
    const newPassNo = `GP-${currentHub.code.split('-')[1] || 'YARD'}-${Math.floor(9045 + Math.random() * 50)}`;
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const newRecord: GatePassRecord = {
      id: `GP-REC-${Date.now()}`,
      passNumber: newPassNo,
      type: 'INBOUND_UNLOAD',
      vehicleNumber: newVehicle.toUpperCase().trim(),
      driverName: newDriver.trim(),
      driverPhone: newPhone.trim(),
      transporterName: newTransporter,
      consignmentNo: newConsignment.trim(),
      materialType: newMaterial.trim(),
      cargoWeightTon: Number(newWeight),
      assignedBay: newBay,
      sealNumber: newSealNo.trim(),
      sealStatus: 'INTACT_VERIFIED',
      status: 'DOCKED',
      gateInTime: `Today, ${nowTime}`,
      dockInTime: `Today, ${nowTime}`,
      elapsedMinutes: 2,
      targetTatMinutes: 75,
      demurrageChargesInr: 0,
      securityGuardName: 'Prem Chand (Gate 1)',
      odometerReadingKm: Number(newOdo)
    };

    setHubDataMap(prev => {
      const hub = prev[selectedHubCode] || currentHub;
      const updatedPasses = [newRecord, ...hub.passes];
      const updatedBays = hub.bays.map(b => {
        if (b.bayId === newBay) {
          return {
            ...b,
            status: 'OCCUPIED' as const,
            activePassNumber: newPassNo,
            activeVehicle: newVehicle.toUpperCase().trim(),
            material: `${newMaterial} (${newWeight} Ton)`,
            progressPercent: 10,
            elapsedMinutes: 2
          };
        }
        return b;
      });

      return {
        ...prev,
        [selectedHubCode]: {
          ...hub,
          bays: updatedBays,
          passes: updatedPasses
        }
      };
    });

    setSelectedPass(newRecord);
    setShowNewGateInModal(false);
    showToast(`✓ Gate Pass ${newPassNo} generated for ${newVehicle}! Bay ${newBay} assigned at ${currentHub.name}.`);
  };

  const handleExpediteLoading = (passId: string) => {
    expediteDockLoading(passId).catch(() => {});
    setHubDataMap(prev => {
      const hub = prev[selectedHubCode] || currentHub;
      const updatedPasses = hub.passes.map(p => {
        if (p.id === passId) {
          return {
            ...p,
            status: 'LOADING_UNLOADING' as GatePassStatus,
            elapsedMinutes: Math.min(p.elapsedMinutes, p.targetTatMinutes - 10),
            demurrageChargesInr: 0
          };
        }
        return p;
      });
      return {
        ...prev,
        [selectedHubCode]: {
          ...hub,
          passes: updatedPasses
        }
      };
    });
    showToast(`⚡ Dock Yard supervisor notified on walkie-talkie! Forklift expedited for ${selectedPass?.vehicleNumber}.`);
  };

  const handleGateOutRelease = (passId: string) => {
    authorizeGateOut(passId).catch(() => {});
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    setHubDataMap(prev => {
      const hub = prev[selectedHubCode] || currentHub;
      const updatedPasses = hub.passes.map(p => {
        if (p.id === passId) {
          return {
            ...p,
            status: 'GATE_OUT_CLEARED' as GatePassStatus,
            gateOutTime: `Today, ${nowTime}`
          };
        }
        return p;
      });

      const updatedBays = hub.bays.map(b =>
        b.bayId === selectedPass?.assignedBay
          ? {
              ...b,
              status: 'AVAILABLE' as const,
              activePassNumber: undefined,
              activeVehicle: undefined,
              material: undefined,
              progressPercent: 0,
              elapsedMinutes: 0
            }
          : b
      );

      return {
        ...prev,
        [selectedHubCode]: {
          ...hub,
          bays: updatedBays,
          passes: updatedPasses
        }
      };
    });

    if (selectedPass) {
      setSelectedPass({
        ...selectedPass,
        status: 'GATE_OUT_CLEARED',
        gateOutTime: `Today, ${nowTime}`
      });
    }

    showToast(`🚚 Vehicle ${selectedPass?.vehicleNumber} Gate-Out authorized! Digital exit barcode validated at ${currentHub.name}.`);
  };

  // Filtered passes
  const filteredPasses = currentPasses.filter(p => {
    if (activeTabFilter === 'ACTIVE_DOCKS') {
      return p.status === 'DOCKED' || p.status === 'LOADING_UNLOADING';
    }
    if (activeTabFilter === 'DETENTION_ALERTS') {
      return p.status === 'DETENTION_WARNING' || p.elapsedMinutes > p.targetTatMinutes;
    }
    if (activeTabFilter === 'GATE_OUT') {
      return p.status === 'GATE_OUT_CLEARED';
    }
    return true;
  });

  const occupiedBaysCount = currentBays.filter(b => b.status === 'OCCUPIED').length;
  const detentionPassesCount = currentPasses.filter(p => p.status === 'DETENTION_WARNING' || p.elapsedMinutes > p.targetTatMinutes).length;

  return (
    <div className="dockyard-container">
      {/* 1. TOP HEADER BANNER */}
      <div className="dockyard-banner">
        <div style={{ maxWidth: '640px' }}>
          <div className="dockyard-banner-tag">
            <span>🏷️</span> {t('HUB & WAREHOUSE TERMINAL OPERATIONS', 'हब एवं वेयरहाउस टर्मिनल संचालन')}
          </div>
          <div className="dockyard-banner-titles">
            <h1>{t('Automated Gate Pass & Dock Yard Management', 'स्वचालित गेट पास एवं डॉक यार्ड प्रबंधन')}</h1>
            <p>
              {t(
                'Digital QR Gate-In / Gate-Out inspection slips, live loading bay turnaround time (TAT) clocks, physical container seal integrity audits, and zero-detention alerts.',
                'डिजिटल क्यूआर गेट-इन / गेट-आउट निरीक्षण पर्ची, लाइव लोडिंग बे टर्नअराउंड समय (TAT) घड़ियां, कंटेनर सील अखंडता ऑडिट और शून्य-डिटेंशन अलर्ट।'
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNewGateInModal(true)}
          className="dockyard-btn-new-pass"
        >
          <span>➕</span> {t('Generate Gate-In Entry Pass', 'गेट-इन एंट्री पास बनाएं')}
        </button>
      </div>

      {/* 2. TOAST ALERT */}
      {toastMessage && (
        <div
          style={{
            background: '#064e3b',
            color: '#a7f3d0',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            border: '1px solid #059669',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* 3. FOUR TOP KPI METRIC TILES (DYNAMIC TO SELECTED HUB) */}
      <div className="dockyard-kpi-grid">
        <div className="dockyard-kpi-card">
          <div className="dockyard-kpi-head">
            <span className="dockyard-kpi-label">{t('Active Docks & Bays', 'सक्रिय डॉक्स और बे')}</span>
            <span className="dockyard-kpi-icon">🚛</span>
          </div>
          <div className="dockyard-kpi-value">
            {occupiedBaysCount} / {currentBays.length} <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>Bays ({Math.round((occupiedBaysCount / (currentBays.length || 1)) * 100)}% Active)</span>
          </div>
          <span className="dockyard-kpi-sub">{currentBays.length - occupiedBaysCount} {t('Bays ready for immediate staging', 'बे तत्काल स्टेजिंग हेतु तैयार')}</span>
        </div>

        <div className="dockyard-kpi-card">
          <div className="dockyard-kpi-head">
            <span className="dockyard-kpi-label">{t('Avg Turnaround Time (TAT)', 'औसत टर्नअराउंड समय')}</span>
            <span className="dockyard-kpi-icon">⏱️</span>
          </div>
          <div className="dockyard-kpi-value">
            {currentHub.avgTatMinutes} {t('Minutes', 'मिनट')}
          </div>
          <span className="dockyard-kpi-sub">
            {90 - currentHub.avgTatMinutes > 0 ? `(-${90 - currentHub.avgTatMinutes}m vs Target)` : `(+${currentHub.avgTatMinutes - 90}m vs Target)`} • {t('Benchmark standard: < 90 mins', 'मानक: < 90 मिनट')}
          </span>
        </div>

        <div className="dockyard-kpi-card">
          <div className="dockyard-kpi-head">
            <span className="dockyard-kpi-label">{t('Demurrage / Detention Incurred', 'डिमरेज / डिटेंशन शुल्क')}</span>
            <span className="dockyard-kpi-icon">🛡️</span>
          </div>
          <div className="dockyard-kpi-value" style={{ color: '#0284c7' }}>
            ₹{currentHub.demurrageAmount.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1' }}>/ {t('this Month', 'इस महीने')}</span>
          </div>
          <span className="dockyard-kpi-sub">
            {detentionPassesCount > 0 ? `${detentionPassesCount} ${t('truck currently in detention review', 'ट्रक वर्तमान में डिटेंशन समीक्षा में')}` : t('0 trucks currently in detention', 'कोई ट्रक डिटेंशन में नहीं')}
          </span>
        </div>

        <div className="dockyard-kpi-card">
          <div className="dockyard-kpi-head">
            <span className="dockyard-kpi-label">{t('Container Seal Integrity', 'कंटेनर सील अखंडता')}</span>
            <span className="dockyard-kpi-icon">🔒</span>
          </div>
          <div className="dockyard-kpi-value" style={{ color: '#16a34a' }}>
            100% {t('Intact', 'अक्षुण्ण')} <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>{t('Verified', 'सत्यापित')}</span>
          </div>
          <span className="dockyard-kpi-sub">{t(`0 tamper breach incidents logged at ${currentHub.city}`, `${currentHub.city} पर 0 छेड़छाड़ उल्लंघन दर्ज`)}</span>
        </div>
      </div>

      {/* 4. LIVE DOCK BAYS SCHEMATIC WITH DYNAMIC HUB SELECTOR */}
      <div className="dockyard-card-left" style={{ padding: '22px' }}>
        
        {/* HUB SELECTOR DROPDOWN FILTER BAR */}
        <div className="dockyard-hub-filter-bar">
          <div className="dockyard-hub-selector-wrap">
            <span className="dockyard-hub-icon">🏢</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span className="dockyard-hub-label">{t('Select Logistics Hub Terminal', 'लॉजिस्टिक्स हब टर्मिनल चुनें')}:</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <select
                  className="dockyard-hub-select"
                  value={selectedHubCode}
                  onChange={e => {
                    if (e.target.value === "__ADD_NEW_HUB__") {
                      setShowCreateHubModal(true);
                    } else {
                      handleSelectHub(e.target.value);
                    }
                  }}
                >
                  <optgroup label="Registered Hub Terminals">
                    {allHubList.map(h => (
                      <option key={h.code} value={h.code}>
                        {h.code} — {h.name} ({h.city}, {h.state})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Actions">
                    <option value="__ADD_NEW_HUB__">➕ + Add / Create New Hub Terminal...</option>
                  </optgroup>
                </select>

                <button
                  type="button"
                  className="dockyard-btn-add-hub"
                  onClick={() => setShowCreateHubModal(true)}
                  title="Register and initialize a new logistics hub & dock yard terminal"
                >
                  <span>➕</span> Add / Create Hub
                </button>
              </div>
            </div>
          </div>

          <div className="dockyard-hub-meta-pill">
            <span className="hub-meta-item">📍 <strong>{currentHub.city}, {currentHub.state}</strong></span>
            <span className="hub-meta-divider">•</span>
            <span className="hub-meta-item">⚖️ {t('Capacity', 'क्षमता')}: <strong>{currentHub.capacity.toLocaleString()} MT</strong></span>
            <span className="hub-meta-divider">•</span>
            <span className="hub-live-badge">🟢 {t('Yard Online & Live', 'यार्ड सक्रिय व लाइव')}</span>
          </div>
        </div>

        {/* BAYS SECTION HEADER */}
        <div className="dockyard-bays-header" style={{ marginBottom: '16px', marginTop: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚚</span>
              <span>{t('Live Terminal Loading Bays', 'लाइव टर्मिनल लोडिंग बे')} ({currentHub.name})</span>
            </h3>
            <small style={{ color: 'var(--text-secondary, #64748b)', fontSize: '12px' }}>
              {t('Visual real-time status of cargo docks, trailers docked, and turnaround countdown', 'कार्गो डॉक्स, ट्रेलरों और टर्नअराउंड उल्टी गिनती की दृश्य वास्तविक स्थिति')} • <code>{currentHub.code}</code>
            </small>
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> {t('Available', 'उपलब्ध')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }}></span> {t('Loading/Unloading', 'लोड/अनलोड')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }}></span> {t('Detention Warning', 'डिटेंशन चेतावनी')}
            </span>
          </div>
        </div>

        {/* LOADING BAYS GRID (BAYS 1 TO 6) */}
        <div className="dockyard-bays-grid">
          {currentBays.map(bay => {
            const isDetention = bay.elapsedMinutes && bay.elapsedMinutes > bay.targetMinutes;
            const isAvailable = bay.status === 'AVAILABLE';

            return (
              <div
                key={bay.bayId}
                className={`dockyard-bay-card ${isDetention ? 'bay-detention' : isAvailable ? 'bay-available' : 'bay-occupied'}`}
              >
                <div className="dockyard-bay-top">
                  <span className="dockyard-bay-id">
                    {bay.bayId} • {bay.type}
                  </span>
                  <span className={`dockyard-bay-status-badge ${isDetention ? 'detention' : isAvailable ? 'available' : 'occupied'}`}>
                    {isDetention ? t('⚠️ Detention', '⚠️ डिटेंशन') : isAvailable ? t('✓ Ready', '✓ तैयार') : t('Active', 'सक्रिय')}
                  </span>
                </div>

                <h4 style={{ margin: '2px 0 6px', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                  {bay.bayName}
                </h4>

                {!isAvailable ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, marginTop: '8px' }}>
                      <span className="dockyard-vehicle-text">🚛 {bay.activeVehicle}</span>
                      <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: '11px', fontFamily: 'monospace' }}>{bay.activePassNumber}</span>
                    </div>
                    <div className="dockyard-bay-material">
                      📦 {bay.material}
                    </div>

                    <div className="dockyard-bay-progress-wrap">
                      <div className="dockyard-bay-progress-labels">
                        <span>{t('Dock Progress', 'डॉक प्रगति')} ({bay.progressPercent}%)</span>
                        <span style={{ color: isDetention ? '#dc2626' : undefined, fontWeight: 700 }}>
                          ⏱️ {bay.elapsedMinutes}m / {bay.targetMinutes}m
                        </span>
                      </div>
                      <div className="dockyard-bay-progress-bar-bg">
                        <div
                          className={`dockyard-bay-progress-bar-fill ${isDetention ? 'detention' : ''}`}
                          style={{ width: `${bay.progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="dockyard-bay-empty-state">
                    <span style={{ fontSize: '24px' }}>🟢</span>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>{t('Bay Free & Ready for Docking', 'बे खाली एवं डॉकिंग हेतु तैयार')}</div>
                    <small style={{ color: 'var(--text-secondary, #64748b)' }}>Target TAT: {bay.targetMinutes} mins</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. SPLIT SECTION: YARD TRAFFIC TABLE + AUDIT CLEARANCE CARD */}
      <div className="dockyard-split-row">
        
        {/* LEFT: DIGITAL GATE PASSES TABLE */}
        <div className="dockyard-card-left">
          <div className="dockyard-card-header">
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                📋 {t("Digital Gate Passes (Today's Yard Traffic)", "डिजिटल गेट पास (आज का यार्ड ट्रैफिक)")} • {currentHub.name}
              </h3>
              <small style={{ color: 'var(--text-secondary, #64748b)', fontSize: '12px' }}>
                {t('Live inbound / outbound inspection records and terminal security seal status', 'लाइव इनबाउंड / आउटबाउंड निरीक्षण रिकॉर्ड एवं टर्मिनल सील स्थिति')}
              </small>
            </div>

            <div className="dockyard-filter-group">
              <button
                type="button"
                className={'dockyard-filter-pill ' + (activeTabFilter === 'ALL' ? 'active' : '')}
                onClick={() => setActiveTabFilter('ALL')}
              >
                {t('All Passes', 'सभी पास')}
              </button>
              <button
                type="button"
                className={'dockyard-filter-pill ' + (activeTabFilter === 'ACTIVE_DOCKS' ? 'active' : '')}
                onClick={() => setActiveTabFilter('ACTIVE_DOCKS')}
              >
                {t('Docked', 'डॉक्ड')} ({currentBays.filter(b => b.status === 'OCCUPIED').length})
              </button>
              <button
                type="button"
                className={'dockyard-filter-pill ' + (activeTabFilter === 'DETENTION_ALERTS' ? 'active' : '')}
                onClick={() => setActiveTabFilter('DETENTION_ALERTS')}
              >
                {t('Detention', 'डिटेंशन')} ({detentionPassesCount})
              </button>
              <button
                type="button"
                className={'dockyard-filter-pill ' + (activeTabFilter === 'GATE_OUT' ? 'active' : '')}
                onClick={() => setActiveTabFilter('GATE_OUT')}
              >
                {t('Cleared', 'स्वीकृत')}
              </button>
            </div>
          </div>

          <div className="dockyard-table-wrap">
            <table className="dockyard-data-table">
              <thead>
                <tr>
                  <th style={{ width: '110px', minWidth: '100px' }}>{t('PASS #', 'पास सं.')}</th>
                  <th style={{ minWidth: '120px' }}>{t('VEHICLE & DRIVER', 'वाहन एवं चालक')}</th>
                  <th style={{ minWidth: '130px' }}>{t('BAY & CARGO', 'बे एवं कार्गो')}</th>
                  <th style={{ minWidth: '95px' }}>{t('TAT STATUS', 'TAT स्थिति')}</th>
                  <th style={{ minWidth: '85px' }}>{t('SEAL', 'सील')}</th>
                  <th style={{ width: '70px', minWidth: '70px', textAlign: 'right' }}>{t('ACTION', 'कार्यवाही')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPasses.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary, #64748b)' }}>
                      {t('No gate passes found for this filter in current hub.', 'वर्तमान हब में इस फिल्टर हेतु कोई गेट पास नहीं मिला।')}
                    </td>
                  </tr>
                ) : (
                  filteredPasses.map(pass => {
                    const isSelected = selectedPass?.id === pass.id;
                    const isDetention = pass.status === 'DETENTION_WARNING' || pass.elapsedMinutes > pass.targetTatMinutes;
                    const isCleared = pass.status === 'GATE_OUT_CLEARED';

                    return (
                      <tr
                        key={pass.id}
                        onClick={() => setSelectedPass(pass)}
                        className={'dockyard-table-row ' + (isSelected ? 'selected' : '')}
                      >
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div className="dockyard-pass-no">{pass.passNumber}</div>
                          <div className="dockyard-type-badge">{pass.type.replace('_', ' ')}</div>
                        </td>

                        <td>
                          <div className="dockyard-vehicle-text">{pass.vehicleNumber}</div>
                          <div className="dockyard-driver-text">{pass.driverName}</div>
                        </td>

                        <td>
                          <div className="dockyard-bay-badge">{pass.assignedBay}</div>
                          <div className="dockyard-cargo-text" title={pass.materialType + ' (' + pass.cargoWeightTon + 'T)'}>
                            {pass.materialType} ({pass.cargoWeightTon}T)
                          </div>
                        </td>

                        <td>
                          <span className={'dockyard-tat-pill ' + (isDetention ? 'detention' : isCleared ? 'cleared' : 'safe')}>
                            {isDetention ? '⚠️ ' + pass.elapsedMinutes + 'm (' + t('Overdue', 'अतिदेय') + ')' : isCleared ? '✓ ' + t('Cleared', 'स्वीकृत') : '⏱️ ' + pass.elapsedMinutes + 'm / ' + pass.targetTatMinutes + 'm'}
                          </span>
                        </td>

                        <td>
                          <span className={'dockyard-seal-pill ' + (pass.sealStatus === 'INTACT_VERIFIED' ? 'intact' : 'tampered')}>
                            {pass.sealStatus === 'INTACT_VERIFIED' ? '🔒 ' + t('Intact', 'अक्षुण्ण') : '⚠️ ' + t('Tampered', 'छेड़छाड़')}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            className="dockyard-btn-slip"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPass(pass);
                              setShowSlipPrintModal(true);
                            }}
                          >
                            🖨️ {t('Slip', 'पर्ची')}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: GATE PASS AUDIT & CLEARANCE CARD */}
        <div className="dockyard-card-right">
          {selectedPass ? (
            <div>
              <div className="dockyard-audit-header">
                <div>
                  <span className="dockyard-audit-tag">
                    {t('GATE PASS AUDIT & CLEARANCE', 'गेट पास ऑडिट एवं निकास')} • {currentHub.code}
                  </span>
                  <div className="dockyard-audit-title">{selectedPass.passNumber}</div>
                </div>
                <span className={'dockyard-status-pill-big ' + (selectedPass.status === 'GATE_OUT_CLEARED' ? 'cleared' : selectedPass.status === 'DETENTION_WARNING' ? 'detention' : 'docked')}>
                  {selectedPass.status}
                </span>
              </div>

              <div className="dockyard-vehicle-banner">
                <div className="dockyard-qr-thumb">📱</div>
                <div className="dockyard-vehicle-info-text">
                  <div className="dockyard-plate-big">{selectedPass.vehicleNumber}</div>
                  <div className="dockyard-driver-contact">{selectedPass.driverName} • {selectedPass.driverPhone}</div>
                  <div className="dockyard-transporter-name">{t('Transporter', 'ट्रांसपोर्टर')}: {selectedPass.transporterName}</div>
                </div>
              </div>

              {/* MINI TILES GRID */}
              <div className="dockyard-metrics-2x2">
                <div className="dockyard-mini-tile">
                  <span>{t('CONSIGNMENT / LR', 'बिल्टी / एलआर')}</span>
                  <strong>{selectedPass.consignmentNo}</strong>
                  <small>{selectedPass.cargoWeightTon} Tonnes</small>
                </div>

                <div className="dockyard-mini-tile">
                  <span>{t('CONTAINER SEAL ID', 'कंटेनर सील आईडी')}</span>
                  <strong style={{ color: selectedPass.sealStatus === 'INTACT_VERIFIED' ? '#10b981' : '#dc2626' }}>
                    {selectedPass.sealNumber}
                  </strong>
                  <small>✓ {t('Verified at Gate', 'गेट पर सत्यापित')}</small>
                </div>

                <div className="dockyard-mini-tile">
                  <span>{t('ASSIGNED DOCK BAY', 'सौंपा गया डॉक बे')}</span>
                  <strong style={{ color: '#0284c7' }}>{selectedPass.assignedBay}</strong>
                  <small>{currentHub.name}</small>
                </div>

                <div className="dockyard-mini-tile">
                  <span>{t('ODOMETER INWARD', 'ओडोमीटर इनवर्ड')}</span>
                  <strong>{selectedPass.odometerReadingKm.toLocaleString()} KM</strong>
                  <small>{selectedPass.securityGuardName}</small>
                </div>
              </div>

              {/* TIMESTAMPS ACCORDION */}
              <div className="dockyard-timeline-box">
                <div className="dockyard-timeline-row">
                  <span>🟢 {t('Gate In Time', 'गेट-इन समय')}:</span>
                  <strong>{selectedPass.gateInTime}</strong>
                </div>
                <div className="dockyard-timeline-row">
                  <span>⏱️ {t('Elapsed Turnaround', 'बीता हुआ समय')}:</span>
                  <strong style={{ color: selectedPass.elapsedMinutes > selectedPass.targetTatMinutes ? '#dc2626' : undefined }}>
                    {selectedPass.elapsedMinutes} mins (Target: {selectedPass.targetTatMinutes}m)
                  </strong>
                </div>
                {selectedPass.gateOutTime && (
                  <div className="dockyard-timeline-row">
                    <span>🏁 {t('Gate Out Cleared', 'गेट-आउट स्वीकृत')}:</span>
                    <strong style={{ color: '#10b981' }}>{selectedPass.gateOutTime}</strong>
                  </div>
                )}
                {selectedPass.demurrageChargesInr > 0 && (
                  <div className="dockyard-timeline-row" style={{ color: '#dc2626', fontWeight: 800 }}>
                    <span>⚠️ {t('Detention Surcharge', 'डिटेंशन सरचार्ज')}:</span>
                    <strong>₹{selectedPass.demurrageChargesInr.toLocaleString()}</strong>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                {selectedPass.status !== 'GATE_OUT_CLEARED' && (
                  <>
                    <button
                      type="button"
                      className="dockyard-btn-gateout"
                      onClick={() => handleGateOutRelease(selectedPass.id)}
                    >
                      <span>🚪</span> {t('Authorize Gate-Out Exit & Print Slip', 'गेट-आउट अधिकृत करें व निकास पर्ची छापें')}
                    </button>

                    <button
                      type="button"
                      className="dockyard-btn-expedite"
                      onClick={() => handleExpediteLoading(selectedPass.id)}
                    >
                      <span>⚡</span> {t('Expedite Loading (Walkie-Talkie Alert)', 'लोडिंग तेज करें (वॉकी-टॉकी अलर्ट)')}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="dockyard-btn-doc"
                  onClick={() => setShowSlipPrintModal(true)}
                >
                  <span>🖨️</span> {t('View Official Digital Gate Pass Document', 'आधिकारिक डिजिटल गेट पास दस्तावेज देखें')}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary, #64748b)' }}>
              <span style={{ fontSize: '32px' }}>📋</span>
              <p style={{ marginTop: '10px' }}>{t('Select any gate pass from the table to inspect details', 'विवरण देखने के लिए तालिका से कोई भी गेट पास चुनें')}</p>
            </div>
          )}
        </div>
      </div>

      {/* 6. MODAL: REGISTER NEW GATE-IN PASS */}
      {showNewGateInModal && (
        <div className="dockyard-modal-overlay">
          <div className="dockyard-modal-card">
            <div className="dockyard-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  🚛 {t('Register Gate-In Entry Slip', 'गेट-इन एंट्री पर्ची दर्ज करें')}
                </h3>
                <small style={{ color: 'var(--text-secondary, #64748b)' }}>
                  {t('Terminal Security Check-In & Bay Assignment', 'टर्मिनल सुरक्षा चेक-इन एवं बे आवंटन')} • <strong>{currentHub.name}</strong>
                </small>
              </div>
              <button
                type="button"
                className="dockyard-modal-close"
                onClick={() => setShowNewGateInModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGateIn} className="dockyard-modal-body">
              <div className="dockyard-form-grid">
                <div>
                  <label className="dockyard-form-label">{t('Vehicle Number (RC Plate)', 'वाहन नंबर')}</label>
                  <input
                    type="text"
                    required
                    className="dockyard-input-field"
                    value={newVehicle}
                    onChange={e => setNewVehicle(e.target.value)}
                    placeholder="e.g. MH-12-AB-1234"
                  />
                </div>

                <div>
                  <label className="dockyard-form-label">{t('Driver Name', 'चालक का नाम')}</label>
                  <input
                    type="text"
                    required
                    className="dockyard-input-field"
                    value={newDriver}
                    onChange={e => setNewDriver(e.target.value)}
                  />
                </div>

                <div>
                  <label className="dockyard-form-label">{t('Driver Mobile', 'चालक का मोबाइल')}</label>
                  <input
                    type="text"
                    required
                    className="dockyard-input-field"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="dockyard-form-label">{t('Consignment Bilty / LR #', 'कंसाइनमेंट बिल्टी / एलआर')}</label>
                  <input
                    type="text"
                    required
                    className="dockyard-input-field"
                    value={newConsignment}
                    onChange={e => setNewConsignment(e.target.value)}
                  />
                </div>

                <div>
                  <label className="dockyard-form-label">{t('Material / Cargo Description', 'कार्गो विवरण')}</label>
                  <input
                    type="text"
                    required
                    className="dockyard-input-field"
                    value={newMaterial}
                    onChange={e => setNewMaterial(e.target.value)}
                  />
                </div>

                <div>
                  <label className="dockyard-form-label">{t('Weight (Metric Tonnes)', 'वजन (मीट्रिक टन)')}</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    className="dockyard-input-field"
                    value={newWeight}
                    onChange={e => setNewWeight(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="dockyard-form-label">{t('Assigned Loading Bay', 'सौंपा गया लोडिंग बे')}</label>
                  <select
                    className="dockyard-select-field"
                    value={newBay}
                    onChange={e => setNewBay(e.target.value)}
                  >
                    {currentBays.map(b => (
                      <option key={b.bayId} value={b.bayId}>
                        {b.bayId} — {b.bayName} ({b.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="dockyard-form-label">{t('Physical Container Seal Number', 'कंटेनर सील नंबर')}</label>
                  <input
                    type="text"
                    required
                    className="dockyard-input-field"
                    value={newSealNo}
                    onChange={e => setNewSealNo(e.target.value)}
                  />
                </div>

                <div>
                  <label className="dockyard-form-label">{t('Odometer Reading (KM)', 'ओडोमीटर रीडिंग (किमी)')}</label>
                  <input
                    type="number"
                    required
                    className="dockyard-input-field"
                    value={newOdo}
                    onChange={e => setNewOdo(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="dockyard-form-label">{t('Terminal Hub Location', 'टर्मिनल हब स्थान')}</label>
                  <div style={{ padding: '9px 12px', background: 'var(--bg-card, #f1f5f9)', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', fontWeight: 800, fontSize: '13px' }}>
                    🏢 {currentHub.code} — {currentHub.name} ({currentHub.city})
                  </div>
                </div>
              </div>

              <div className="dockyard-security-box">
                <span style={{ fontSize: '18px' }}>🛡️</span>
                <span style={{ fontSize: '12px' }}>
                  {t(
                    'MoRTH Electronic Seal & Digital Weighment protocol enforced. Tamper breach will trigger an emergency gate lock.',
                    'सड़क परिवहन मंत्रालय इलेक्ट्रॉनिक सील एवं डिजिटल वजन प्रोटोकॉल लागू। छेड़छाड़ पर गेट तुरंत लॉक होगा।'
                  )}
                </span>
              </div>

              <div className="dockyard-modal-actions">
                <button
                  type="button"
                  className="dockyard-btn-cancel"
                  onClick={() => setShowNewGateInModal(false)}
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="dockyard-btn-submit"
                >
                  {t('Confirm & Authorize Gate-In', 'पुष्टि करें एवं गेट-इन अधिकृत करें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. PRINT SLIP MODAL */}
      {showSlipPrintModal && selectedPass && (
        <div className="dockyard-modal-overlay" onClick={() => setShowSlipPrintModal(false)}>
          <div className="dockyard-modal-card print-card" onClick={e => e.stopPropagation()}>
            {/* Top Close Button */}
            <button
              type="button"
              className="gate-slip-close-btn"
              onClick={() => setShowSlipPrintModal(false)}
              aria-label="Close"
            >
              ✕
            </button>

            {/* TICKET HEADER */}
            <div className="gate-slip-header">
              <div className="gate-slip-brand-row">
                <span className="gate-slip-icon">🏢</span>
                <span className="gate-slip-brand">ASK TRANSPORT GROUP</span>
              </div>
              <div className="gate-slip-hub-tag">
                HUB TERMINAL: {currentHub.code} • {currentHub.name.toUpperCase()} ({currentHub.city.toUpperCase()})
              </div>
              <div className="gate-slip-title">
                OFFICIAL GATE IN / OUT PASS
              </div>
              <div className="gate-slip-pass-badge">
                <span className="gate-slip-pass-label">PASS NO:</span>
                <span className="gate-slip-pass-num">{selectedPass.passNumber}</span>
              </div>
            </div>

            {/* PERFORATION DIVIDER 1 */}
            <div className="gate-slip-perforation">
              <span className="gate-slip-notch left"></span>
              <div className="gate-slip-dash"></div>
              <span className="gate-slip-notch right"></span>
            </div>

            {/* DETAILS GRID */}
            <div className="gate-slip-details-grid">
              <div className="gate-slip-row">
                <span className="gate-slip-label">VEHICLE NO:</span>
                <span className="gate-slip-value gate-slip-plate">{selectedPass.vehicleNumber}</span>
              </div>

              <div className="gate-slip-row">
                <span className="gate-slip-label">BILTY / LR NO:</span>
                <span className="gate-slip-value gate-slip-mono">{selectedPass.consignmentNo}</span>
              </div>

              <div className="gate-slip-row">
                <span className="gate-slip-label">DRIVER:</span>
                <span className="gate-slip-value">{selectedPass.driverName} <span className="gate-slip-sub">({selectedPass.driverPhone})</span></span>
              </div>

              <div className="gate-slip-row">
                <span className="gate-slip-label">TRANSPORTER:</span>
                <span className="gate-slip-value">{selectedPass.transporterName}</span>
              </div>

              <div className="gate-slip-row">
                <span className="gate-slip-label">CARGO:</span>
                <span className="gate-slip-value">{selectedPass.materialType} <span className="gate-slip-weight-pill">{selectedPass.cargoWeightTon} Ton</span></span>
              </div>

              <div className="gate-slip-row">
                <span className="gate-slip-label">DOCK BAY:</span>
                <span className="gate-slip-value gate-slip-bay">{selectedPass.assignedBay}</span>
              </div>

              <div className="gate-slip-row">
                <span className="gate-slip-label">SEAL NO:</span>
                <span className="gate-slip-value">
                  <span className="gate-slip-mono">{selectedPass.sealNumber}</span>
                  <span className="gate-slip-seal-badge">VERIFIED INTACT</span>
                </span>
              </div>

              <div className="gate-slip-row">
                <span className="gate-slip-label">ODOMETER:</span>
                <span className="gate-slip-value gate-slip-mono">{Number(selectedPass.odometerReadingKm || 0).toLocaleString('en-IN')} KM</span>
              </div>

              <div className="gate-slip-row">
                <span className="gate-slip-label">GATE-IN:</span>
                <span className="gate-slip-value gate-slip-time">{selectedPass.gateInTime}</span>
              </div>

              <div className="gate-slip-row">
                <span className="gate-slip-label">GATE-OUT:</span>
                <span className="gate-slip-value">
                  {selectedPass.gateOutTime ? (
                    <span className="gate-slip-time-out">{selectedPass.gateOutTime}</span>
                  ) : (
                    <span className="gate-slip-status-active">IN PROGRESS</span>
                  )}
                </span>
              </div>

              <div className="gate-slip-row full-width">
                <span className="gate-slip-label">GUARD / DESK:</span>
                <span className="gate-slip-value">{selectedPass.securityGuardName}</span>
              </div>

              <div className="gate-slip-row full-width">
                <span className="gate-slip-label">HUB LOCATION:</span>
                <span className="gate-slip-value">{currentHub.name} ({currentHub.city}, {currentHub.state})</span>
              </div>
            </div>

            {/* PERFORATION DIVIDER 2 */}
            <div className="gate-slip-perforation">
              <span className="gate-slip-notch left"></span>
              <div className="gate-slip-dash"></div>
              <span className="gate-slip-notch right"></span>
            </div>

            {/* BARCODE & AUTHENTICATION */}
            <div className="gate-slip-barcode-area">
              <svg className="gate-slip-barcode-svg" viewBox="0 0 260 44" preserveAspectRatio="none">
                <rect x="0" y="0" width="3" height="44" fill="currentColor" />
                <rect x="5" y="0" width="1" height="44" fill="currentColor" />
                <rect x="8" y="0" width="4" height="44" fill="currentColor" />
                <rect x="15" y="0" width="2" height="44" fill="currentColor" />
                <rect x="19" y="0" width="1" height="44" fill="currentColor" />
                <rect x="23" y="0" width="3" height="44" fill="currentColor" />
                <rect x="28" y="0" width="2" height="44" fill="currentColor" />
                <rect x="33" y="0" width="4" height="44" fill="currentColor" />
                <rect x="39" y="0" width="1" height="44" fill="currentColor" />
                <rect x="43" y="0" width="3" height="44" fill="currentColor" />
                <rect x="48" y="0" width="2" height="44" fill="currentColor" />
                <rect x="53" y="0" width="4" height="44" fill="currentColor" />
                <rect x="59" y="0" width="1" height="44" fill="currentColor" />
                <rect x="63" y="0" width="3" height="44" fill="currentColor" />
                <rect x="68" y="0" width="2" height="44" fill="currentColor" />
                <rect x="73" y="0" width="4" height="44" fill="currentColor" />
                <rect x="79" y="0" width="1" height="44" fill="currentColor" />
                <rect x="83" y="0" width="3" height="44" fill="currentColor" />
                <rect x="88" y="0" width="2" height="44" fill="currentColor" />
                <rect x="93" y="0" width="4" height="44" fill="currentColor" />
                <rect x="99" y="0" width="1" height="44" fill="currentColor" />
                <rect x="103" y="0" width="3" height="44" fill="currentColor" />
                <rect x="108" y="0" width="2" height="44" fill="currentColor" />
                <rect x="113" y="0" width="4" height="44" fill="currentColor" />
                <rect x="119" y="0" width="1" height="44" fill="currentColor" />
                <rect x="123" y="0" width="3" height="44" fill="currentColor" />
                <rect x="128" y="0" width="2" height="44" fill="currentColor" />
                <rect x="133" y="0" width="4" height="44" fill="currentColor" />
                <rect x="139" y="0" width="1" height="44" fill="currentColor" />
                <rect x="143" y="0" width="3" height="44" fill="currentColor" />
                <rect x="148" y="0" width="2" height="44" fill="currentColor" />
                <rect x="153" y="0" width="4" height="44" fill="currentColor" />
                <rect x="159" y="0" width="1" height="44" fill="currentColor" />
                <rect x="163" y="0" width="3" height="44" fill="currentColor" />
                <rect x="168" y="0" width="2" height="44" fill="currentColor" />
                <rect x="173" y="0" width="4" height="44" fill="currentColor" />
                <rect x="179" y="0" width="1" height="44" fill="currentColor" />
                <rect x="183" y="0" width="3" height="44" fill="currentColor" />
                <rect x="188" y="0" width="2" height="44" fill="currentColor" />
                <rect x="193" y="0" width="4" height="44" fill="currentColor" />
                <rect x="199" y="0" width="1" height="44" fill="currentColor" />
                <rect x="203" y="0" width="3" height="44" fill="currentColor" />
                <rect x="208" y="0" width="2" height="44" fill="currentColor" />
                <rect x="213" y="0" width="4" height="44" fill="currentColor" />
                <rect x="219" y="0" width="1" height="44" fill="currentColor" />
                <rect x="223" y="0" width="3" height="44" fill="currentColor" />
                <rect x="228" y="0" width="2" height="44" fill="currentColor" />
                <rect x="233" y="0" width="4" height="44" fill="currentColor" />
                <rect x="239" y="0" width="1" height="44" fill="currentColor" />
                <rect x="243" y="0" width="3" height="44" fill="currentColor" />
                <rect x="248" y="0" width="2" height="44" fill="currentColor" />
                <rect x="253" y="0" width="4" height="44" fill="currentColor" />
                <rect x="258" y="0" width="2" height="44" fill="currentColor" />
              </svg>
              <div className="gate-slip-barcode-text">*{selectedPass.passNumber}*</div>
              <div className="gate-slip-security-notice">
                🔒 RFID BOOM BARRIER VERIFIED • MoRTH RULE 138 COMPLIANT
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="gate-slip-actions">
              <button
                type="button"
                onClick={() => setShowSlipPrintModal(false)}
                className="dockyard-btn-cancel"
                style={{ flex: 1 }}
              >
                {t('Close', 'बंद करें')}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="dockyard-btn-submit"
                style={{ flex: 1.4 }}
              >
                🖨️ {t('Print Slip Now', 'पर्ची प्रिंट करें')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. CREATE / ADD HUB TERMINAL MODAL */}
      {showCreateHubModal && (
        <div className="dockyard-modal-overlay" onClick={() => setShowCreateHubModal(false)}>
          <div className="dockyard-modal-card" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
            <div className="dockyard-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏢</span>
                  <span>{t('Add & Initialize New Hub Terminal', 'नया हब टर्मिनल जोड़ें व आरंभ करें')}</span>
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary, #64748b)' }}>
                  {t('Register a new multi-city terminal and configure its active dock bays for immediate dispatch & receiving.', 'एक नया मल्टी-सिटी टर्मिनल जोड़ें और तत्काल लोडिंग/अनलोडिंग हेतु इसके डॉक बे कॉन्फ़िगर करें।')}
                </p>
              </div>
              <button
                type="button"
                className="dockyard-btn-close"
                onClick={() => setShowCreateHubModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateHubSubmit} style={{ padding: '20px' }}>
              <div className="dockyard-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label className="dockyard-form-label">{t('Hub / Terminal Code *', 'हब कोड *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HUB-BHO-06"
                    className="dockyard-input-field"
                    value={newHubCode}
                    onChange={e => setNewHubCode(e.target.value)}
                  />
                </div>

                <div>
                  <label className="dockyard-form-label">{t('Terminal Facility Name *', 'टर्मिनल का नाम *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhopal Central Logistics Hub"
                    className="dockyard-input-field"
                    value={newHubName}
                    onChange={e => setNewHubName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="dockyard-form-label">{t('City *', 'शहर *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhopal"
                    className="dockyard-input-field"
                    value={newHubCity}
                    onChange={e => setNewHubCity(e.target.value)}
                  />
                </div>

                <div>
                  <label className="dockyard-form-label">{t('State *', 'राज्य *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madhya Pradesh"
                    className="dockyard-input-field"
                    value={newHubState}
                    onChange={e => setNewHubState(e.target.value)}
                  />
                </div>

                <div>
                  <label className="dockyard-form-label">{t('Daily Throughput / Capacity (MT)', 'क्षमता (मीट्रिक टन)')}</label>
                  <input
                    type="number"
                    placeholder="e.g. 3500"
                    className="dockyard-input-field"
                    value={newHubCapacity}
                    onChange={e => setNewHubCapacity(e.target.value)}
                  />
                </div>

                <div>
                  <label className="dockyard-form-label">{t('Initialize Dock Bays', 'आरंभिक डॉक बे संख्या')}</label>
                  <select
                    className="dockyard-input-field"
                    value={newHubBaysCount}
                    onChange={e => setNewHubBaysCount(Number(e.target.value))}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value={4}>4 Dock Bays (2 Unload, 1 Load, 1 Staging)</option>
                    <option value={6}>6 Standard Bays (3 Unload, 2 Load, 1 Staging)</option>
                    <option value={8}>8 Large Terminal Bays (4 Unload, 3 Load, 1 Cold)</option>
                    <option value={10}>10 Mega Hub Bays (Full Multimodal Setup)</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="dockyard-form-label">{t('Yard Manager / Contact No.', 'यार्ड प्रबंधक संपर्क नंबर')}</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210 (Rajesh Sharma)"
                    className="dockyard-input-field"
                    value={newHubManager}
                    onChange={e => setNewHubManager(e.target.value)}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="dockyard-form-label">{t('Terminal Physical Address', 'टर्मिनल का भौतिक पता')}</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Mandideep Industrial Area, Phase II, NH-12, Bhopal - 462022"
                    className="dockyard-input-field"
                    value={newHubAddress}
                    onChange={e => setNewHubAddress(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="dockyard-modal-actions" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="dockyard-btn-cancel"
                  onClick={() => setShowCreateHubModal(false)}
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="dockyard-btn-submit"
                  style={{ background: '#0284c7' }}
                >
                  ✓ {t('Create & Activate Hub Terminal', 'हब टर्मिनल बनाएं व सक्रिय करें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
