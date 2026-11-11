import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Calculator,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Download,
  RotateCcw,
  MapPin,
  ArrowRight,
  TrendingUp,
  Truck,
  Package,
  Copy,
  Check,
  X,
  ArrowLeftRight,
  Sparkles,
  Zap,
  Clock
} from 'lucide-react';
import './LaneRateCalculatorMaster.css';

export interface LaneRate {
  id: string;
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  corridorHighway: string;
  distanceKm: number;
  ptlRatePerKg: number;
  minBiltyCharge: number;
  ftlFullTruckRate: number;
  expressRatePerKg: number;
  transitHours: string;
  isActive: boolean;
  lastUpdated: string;
}

const STORAGE_KEY = 'ask_lane_rates_master_v1';

export const INITIAL_LANE_RATES: LaneRate[] = [
  {
    id: 'LANE-001',
    originCity: 'Delhi NCR',
    originState: 'New Delhi',
    destCity: 'Mumbai',
    destState: 'Maharashtra',
    corridorHighway: 'NH-48 Golden Quadrilateral',
    distanceKm: 1420,
    ptlRatePerKg: 18.5,
    minBiltyCharge: 550,
    ftlFullTruckRate: 48000,
    expressRatePerKg: 28.0,
    transitHours: '32-36 Hours',
    isActive: true,
    lastUpdated: '04 Nov 2026'
  },
  {
    id: 'LANE-002',
    originCity: 'Mumbai',
    originState: 'Maharashtra',
    destCity: 'Bengaluru',
    destState: 'Karnataka',
    corridorHighway: 'NH-48 Industrial Corridor',
    distanceKm: 980,
    ptlRatePerKg: 16.0,
    minBiltyCharge: 450,
    ftlFullTruckRate: 36000,
    expressRatePerKg: 24.0,
    transitHours: '22-26 Hours',
    isActive: true,
    lastUpdated: '04 Nov 2026'
  },
  {
    id: 'LANE-003',
    originCity: 'Ahmedabad',
    originState: 'Gujarat',
    destCity: 'Kolkata',
    destState: 'West Bengal',
    corridorHighway: 'NH-19 East-West Spine',
    distanceKm: 1980,
    ptlRatePerKg: 22.0,
    minBiltyCharge: 650,
    ftlFullTruckRate: 64000,
    expressRatePerKg: 34.0,
    transitHours: '44-50 Hours',
    isActive: true,
    lastUpdated: '04 Nov 2026'
  },
  {
    id: 'LANE-004',
    originCity: 'Pune',
    originState: 'Maharashtra',
    destCity: 'Chennai',
    destState: 'Tamil Nadu',
    corridorHighway: 'NH-65 Southern Corridor',
    distanceKm: 1150,
    ptlRatePerKg: 17.5,
    minBiltyCharge: 500,
    ftlFullTruckRate: 41000,
    expressRatePerKg: 26.0,
    transitHours: '26-30 Hours',
    isActive: true,
    lastUpdated: '04 Nov 2026'
  },
  {
    id: 'LANE-005',
    originCity: 'Delhi NCR',
    originState: 'New Delhi',
    destCity: 'Kolkata',
    destState: 'West Bengal',
    corridorHighway: 'NH-19 Freight Expressway',
    distanceKm: 1530,
    ptlRatePerKg: 19.0,
    minBiltyCharge: 600,
    ftlFullTruckRate: 52000,
    expressRatePerKg: 30.0,
    transitHours: '34-40 Hours',
    isActive: true,
    lastUpdated: '03 Nov 2026'
  },
  {
    id: 'LANE-006',
    originCity: 'Mumbai',
    originState: 'Maharashtra',
    destCity: 'Hyderabad',
    destState: 'Telangana',
    corridorHighway: 'NH-65 via Solapur-Pune',
    distanceKm: 710,
    ptlRatePerKg: 14.5,
    minBiltyCharge: 450,
    ftlFullTruckRate: 28000,
    expressRatePerKg: 22.0,
    transitHours: '16-20 Hours',
    isActive: true,
    lastUpdated: '03 Nov 2026'
  },
  {
    id: 'LANE-007',
    originCity: 'Chennai',
    originState: 'Tamil Nadu',
    destCity: 'Bengaluru',
    destState: 'Karnataka',
    corridorHighway: 'NH-48 Tech Corridor',
    distanceKm: 350,
    ptlRatePerKg: 11.0,
    minBiltyCharge: 350,
    ftlFullTruckRate: 16500,
    expressRatePerKg: 18.0,
    transitHours: '8-12 Hours',
    isActive: true,
    lastUpdated: '02 Nov 2026'
  },
  {
    id: 'LANE-008',
    originCity: 'Jaipur',
    originState: 'Rajasthan',
    destCity: 'Ahmedabad',
    destState: 'Gujarat',
    corridorHighway: 'NH-48 Western Arterial',
    distanceKm: 670,
    ptlRatePerKg: 13.5,
    minBiltyCharge: 400,
    ftlFullTruckRate: 24000,
    expressRatePerKg: 21.0,
    transitHours: '14-18 Hours',
    isActive: true,
    lastUpdated: '02 Nov 2026'
  },
  {
    id: 'LANE-009',
    originCity: 'Kolkata',
    originState: 'West Bengal',
    destCity: 'Guwahati',
    destState: 'Assam',
    corridorHighway: 'NH-27 North-East Gateway',
    distanceKm: 1020,
    ptlRatePerKg: 21.0,
    minBiltyCharge: 650,
    ftlFullTruckRate: 44000,
    expressRatePerKg: 32.0,
    transitHours: '28-34 Hours',
    isActive: true,
    lastUpdated: '01 Nov 2026'
  },
  {
    id: 'LANE-010',
    originCity: 'Lucknow',
    originState: 'Uttar Pradesh',
    destCity: 'Delhi NCR',
    destState: 'New Delhi',
    corridorHighway: 'Agra-Lucknow Expressway & YEIDA',
    distanceKm: 530,
    ptlRatePerKg: 12.5,
    minBiltyCharge: 400,
    ftlFullTruckRate: 19500,
    expressRatePerKg: 19.0,
    transitHours: '10-14 Hours',
    isActive: true,
    lastUpdated: '01 Nov 2026'
  },
  {
    id: 'LANE-011',
    originCity: 'Patna',
    originState: 'Bihar',
    destCity: 'Kolkata',
    destState: 'West Bengal',
    corridorHighway: 'NH-19 Eastern Spine',
    distanceKm: 580,
    ptlRatePerKg: 13.0,
    minBiltyCharge: 400,
    ftlFullTruckRate: 22000,
    expressRatePerKg: 20.0,
    transitHours: '12-16 Hours',
    isActive: true,
    lastUpdated: '31 Oct 2026'
  },
  {
    id: 'LANE-012',
    originCity: 'Indore',
    originState: 'Madhya Pradesh',
    destCity: 'Mumbai',
    destState: 'Maharashtra',
    corridorHighway: 'NH-52 Central Freight Corridor',
    distanceKm: 590,
    ptlRatePerKg: 13.0,
    minBiltyCharge: 400,
    ftlFullTruckRate: 23500,
    expressRatePerKg: 20.0,
    transitHours: '12-16 Hours',
    isActive: true,
    lastUpdated: '31 Oct 2026'
  },
  {
    id: 'LANE-013',
    originCity: 'Surat',
    originState: 'Gujarat',
    destCity: 'Delhi NCR',
    destState: 'New Delhi',
    corridorHighway: 'NH-48 Textile Hub Spine',
    distanceKm: 1180,
    ptlRatePerKg: 17.0,
    minBiltyCharge: 500,
    ftlFullTruckRate: 40000,
    expressRatePerKg: 26.0,
    transitHours: '26-30 Hours',
    isActive: true,
    lastUpdated: '30 Oct 2026'
  },
  {
    id: 'LANE-014',
    originCity: 'Ludhiana',
    originState: 'Punjab',
    destCity: 'Mumbai',
    destState: 'Maharashtra',
    corridorHighway: 'NH-44 North-South Western Trunk',
    distanceKm: 1650,
    ptlRatePerKg: 20.5,
    minBiltyCharge: 600,
    ftlFullTruckRate: 58000,
    expressRatePerKg: 31.0,
    transitHours: '36-42 Hours',
    isActive: true,
    lastUpdated: '30 Oct 2026'
  },
  {
    id: 'LANE-015',
    originCity: 'Hyderabad',
    originState: 'Telangana',
    destCity: 'Bengaluru',
    destState: 'Karnataka',
    corridorHighway: 'NH-44 Cyber & Industrial Spine',
    distanceKm: 570,
    ptlRatePerKg: 13.0,
    minBiltyCharge: 400,
    ftlFullTruckRate: 22000,
    expressRatePerKg: 20.0,
    transitHours: '10-14 Hours',
    isActive: true,
    lastUpdated: '29 Oct 2026'
  },
  {
    id: 'LANE-016',
    originCity: 'Kochi',
    originState: 'Kerala',
    destCity: 'Chennai',
    destState: 'Tamil Nadu',
    corridorHighway: 'NH-544 / NH-44 South-West Line',
    distanceKm: 690,
    ptlRatePerKg: 14.5,
    minBiltyCharge: 450,
    ftlFullTruckRate: 27000,
    expressRatePerKg: 22.0,
    transitHours: '16-20 Hours',
    isActive: true,
    lastUpdated: '29 Oct 2026'
  },
  {
    id: 'LANE-017',
    originCity: 'Bhubaneswar',
    originState: 'Odisha',
    destCity: 'Visakhapatnam',
    destState: 'Andhra Pradesh',
    corridorHighway: 'NH-16 Coastal Port Spine',
    distanceKm: 440,
    ptlRatePerKg: 12.0,
    minBiltyCharge: 400,
    ftlFullTruckRate: 18000,
    expressRatePerKg: 18.0,
    transitHours: '9-12 Hours',
    isActive: true,
    lastUpdated: '28 Oct 2026'
  },
  {
    id: 'LANE-018',
    originCity: 'Nagpur',
    originState: 'Maharashtra',
    destCity: 'Delhi NCR',
    destState: 'New Delhi',
    corridorHighway: 'NH-44 Zero-Mile Central Spine',
    distanceKm: 1080,
    ptlRatePerKg: 17.0,
    minBiltyCharge: 500,
    ftlFullTruckRate: 39000,
    expressRatePerKg: 26.0,
    transitHours: '24-28 Hours',
    isActive: true,
    lastUpdated: '28 Oct 2026'
  }
];

export default function LaneRateCalculatorMaster() {
  const { t } = useLanguage();

  // Load from localStorage or defaults
  const [laneRates, setLaneRates] = useState<LaneRate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_LANE_RATES;
  });

  // Save to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(laneRates));
    } catch {
      // ignore
    }
  }, [laneRates]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'active' | 'paused' | 'gq' | 'express' | 'longhaul' | 'shorthaul'>('all');

  // Modal State for Add / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingLane, setEditingLane] = useState<LaneRate | null>(null);

  // Form Fields
  const [formOriginCity, setFormOriginCity] = useState('');
  const [formOriginState, setFormOriginState] = useState('');
  const [formDestCity, setFormDestCity] = useState('');
  const [formDestState, setFormDestState] = useState('');
  const [formHighway, setFormHighway] = useState('NH-48 National Corridor');
  const [formDistanceKm, setFormDistanceKm] = useState('1000');
  const [formPtlRate, setFormPtlRate] = useState('16.0');
  const [formMinBilty, setFormMinBilty] = useState('450');
  const [formFtlRate, setFormFtlRate] = useState('35000');
  const [formExpressRate, setFormExpressRate] = useState('24.0');
  const [formTransitHours, setFormTransitHours] = useState('24-30 Hours');

  // Toast Notice
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Interactive Live Rate Calculator Simulator State
  const [calcOrigin, setCalcOrigin] = useState<string>(() => laneRates[0]?.originCity || 'Delhi NCR');
  const [calcDest, setCalcDest] = useState<string>(() => laneRates[0]?.destCity || 'Mumbai');
  const [calcWeightKg, setCalcWeightKg] = useState<number>(500);
  const [calcServiceMode, setCalcServiceMode] = useState<'PTL' | 'Express' | 'FTL'>('PTL');
  const [calcCopied, setCalcCopied] = useState(false);

  // Available unique origins and destinations
  const uniqueOrigins = useMemo(() => Array.from(new Set(laneRates.map(r => r.originCity))).sort(), [laneRates]);
  const uniqueDestinations = useMemo(() => Array.from(new Set(laneRates.map(r => r.destCity))).sort(), [laneRates]);

  // Find rate for selected corridor in calculator
  const matchedLane = useMemo(() => {
    return laneRates.find(
      r => (r.originCity.toLowerCase() === calcOrigin.toLowerCase() && r.destCity.toLowerCase() === calcDest.toLowerCase()) ||
           (r.originCity.toLowerCase() === calcDest.toLowerCase() && r.destCity.toLowerCase() === calcOrigin.toLowerCase())
    );
  }, [laneRates, calcOrigin, calcDest]);

  // Swap Origin and Destination
  const handleSwapCorridor = () => {
    const prevOrigin = calcOrigin;
    setCalcOrigin(calcDest);
    setCalcDest(prevOrigin);
    showToast(`⇄ Swapped corridor: ${calcDest} ➔ ${prevOrigin}`);
  };

  // Load a lane into simulator
  const handleLoadInSimulator = (lane: LaneRate) => {
    setCalcOrigin(lane.originCity);
    setCalcDest(lane.destCity);
    window.scrollTo({ top: 380, behavior: 'smooth' });
    showToast(`⚡ Loaded ${lane.originCity} ➔ ${lane.destCity} (${lane.distanceKm} KM) into Rate Calculator!`);
  };

  // Fallback calculation if route not explicitly configured
  const distanceEstimate = matchedLane ? matchedLane.distanceKm : 1000;
  const ptlRateEstimate = matchedLane ? matchedLane.ptlRatePerKg : 16.5;
  const minChargeEstimate = matchedLane ? matchedLane.minBiltyCharge : 450;
  const ftlRateEstimate = matchedLane ? matchedLane.ftlFullTruckRate : Math.round(distanceEstimate * 36);
  const expressRateEstimate = matchedLane ? matchedLane.expressRatePerKg : (ptlRateEstimate * 1.5);
  const transitEstimate = matchedLane ? matchedLane.transitHours : `${Math.round(distanceEstimate / 40)}-${Math.round(distanceEstimate / 35)} Hours`;

  // Compute calculated amounts
  let baseFreight = 0;
  if (calcServiceMode === 'PTL') {
    baseFreight = Math.max(calcWeightKg * ptlRateEstimate, minChargeEstimate);
  } else if (calcServiceMode === 'Express') {
    baseFreight = Math.max(calcWeightKg * expressRateEstimate, minChargeEstimate * 1.5);
  } else {
    baseFreight = ftlRateEstimate;
  }

  const fuelSurcharge = Math.round(baseFreight * 0.10);
  const handlingFee = 150;
  const taxableSubtotal = baseFreight + fuelSurcharge + handlingFee;
  const gstAmount = Math.round(taxableSubtotal * 0.18);
  const totalInvoicedFreight = taxableSubtotal + gstAmount;

  // Auto-Calculate Recommended Rates from Distance
  const handleAutoCalcFromDistance = (distKm: number) => {
    const km = Math.max(50, distKm);
    const ptl = Math.max(10, Math.round((10 + km * 0.006) * 10) / 10);
    const minBilty = km < 500 ? 350 : km < 1000 ? 450 : km < 1500 ? 550 : 650;
    const ftlRate = Math.round((km * (km < 600 ? 38 : km < 1200 ? 35 : 32)) / 500) * 500;
    const expRate = Math.round((ptl * 1.45) * 10) / 10;
    const minHrs = Math.max(6, Math.round(km / 45));
    const maxHrs = Math.max(10, Math.round(km / 35));

    setFormPtlRate(ptl.toFixed(1));
    setFormMinBilty(String(minBilty));
    setFormFtlRate(String(ftlRate));
    setFormExpressRate(expRate.toFixed(1));
    setFormTransitHours(`${minHrs}-${maxHrs} Hours`);
    showToast(`✨ Auto-calculated MoRTH compliant rates for ${km} KM`);
  };

  // Open modal for new rate
  const handleOpenAddModal = () => {
    setEditingLane(null);
    setFormOriginCity('');
    setFormOriginState('');
    setFormDestCity('');
    setFormDestState('');
    setFormHighway('NH-48 National Corridor');
    setFormDistanceKm('1000');
    setFormPtlRate('16.0');
    setFormMinBilty('450');
    setFormFtlRate('35000');
    setFormExpressRate('24.0');
    setFormTransitHours('24-30 Hours');
    setShowModal(true);
  };

  // Open modal for editing existing rate
  const handleOpenEditModal = (lane: LaneRate) => {
    setEditingLane(lane);
    setFormOriginCity(lane.originCity);
    setFormOriginState(lane.originState);
    setFormDestCity(lane.destCity);
    setFormDestState(lane.destState);
    setFormHighway(lane.corridorHighway);
    setFormDistanceKm(String(lane.distanceKm));
    setFormPtlRate(String(lane.ptlRatePerKg));
    setFormMinBilty(String(lane.minBiltyCharge));
    setFormFtlRate(String(lane.ftlFullTruckRate));
    setFormExpressRate(String(lane.expressRatePerKg));
    setFormTransitHours(lane.transitHours);
    setShowModal(true);
  };

  // Save new or edited rate
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOriginCity.trim() || !formDestCity.trim()) {
      showToast('⚠️ Please enter Origin and Destination cities!');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    if (editingLane) {
      setLaneRates(prev =>
        prev.map(item =>
          item.id === editingLane.id
            ? {
                ...item,
                originCity: formOriginCity.trim(),
                originState: formOriginState.trim() || item.originState,
                destCity: formDestCity.trim(),
                destState: formDestState.trim() || item.destState,
                corridorHighway: formHighway.trim() || 'National Highway',
                distanceKm: parseFloat(formDistanceKm) || 1000,
                ptlRatePerKg: parseFloat(formPtlRate) || 16.0,
                minBiltyCharge: parseFloat(formMinBilty) || 450,
                ftlFullTruckRate: parseFloat(formFtlRate) || 35000,
                expressRatePerKg: parseFloat(formExpressRate) || 24.0,
                transitHours: formTransitHours.trim() || '24-30 Hours',
                lastUpdated: todayStr
              }
            : item
        )
      );
      showToast(`✓ Updated lane rate: ${formOriginCity} ➔ ${formDestCity} (₹${formPtlRate}/kg)`);
    } else {
      const newLane: LaneRate = {
        id: `LANE-${Math.floor(100 + Math.random() * 900)}`,
        originCity: formOriginCity.trim(),
        originState: formOriginState.trim() || 'India Hub',
        destCity: formDestCity.trim(),
        destState: formDestState.trim() || 'India Hub',
        corridorHighway: formHighway.trim() || 'National Highway',
        distanceKm: parseFloat(formDistanceKm) || 1000,
        ptlRatePerKg: parseFloat(formPtlRate) || 16.0,
        minBiltyCharge: parseFloat(formMinBilty) || 450,
        ftlFullTruckRate: parseFloat(formFtlRate) || 35000,
        expressRatePerKg: parseFloat(formExpressRate) || 24.0,
        transitHours: formTransitHours.trim() || '24-30 Hours',
        isActive: true,
        lastUpdated: todayStr
      };
      setLaneRates(prev => [newLane, ...prev]);
      showToast(`✓ Added new lane rate: ${formOriginCity} ➔ ${formDestCity} successfully!`);
    }

    setShowModal(false);
  };

  // Delete rate
  const handleDeleteRate = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete rate for corridor: ${name}?`)) {
      setLaneRates(prev => prev.filter(r => r.id !== id));
      showToast(`🗑️ Deleted lane rate: ${name}`);
    }
  };

  // Toggle active status
  const handleToggleStatus = (id: string) => {
    setLaneRates(prev =>
      prev.map(r => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
    const lane = laneRates.find(r => r.id === id);
    if (lane) {
      showToast(`${!lane.isActive ? '✓ Activated' : '⏸ Paused'} tariff for ${lane.originCity} ➔ ${lane.destCity}`);
    }
  };

  // Reset to default factory rates
  const handleResetDefaults = () => {
    if (window.confirm('Reset all lane rates to standard national MoRTH factory defaults?')) {
      setLaneRates(INITIAL_LANE_RATES);
      localStorage.removeItem(STORAGE_KEY);
      showToast('🔄 Reset all routes to National MoRTH Benchmark rates!');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    let csv = 'ID,OriginCity,OriginState,DestCity,DestState,HighwayCorridor,DistanceKM,PtlRatePerKg,MinBiltyFloor,FtlFullTruckRate,ExpressRatePerKg,TransitHours,IsActive\n';
    laneRates.forEach(r => {
      csv += `"${r.id}","${r.originCity}","${r.originState}","${r.destCity}","${r.destState}","${r.corridorHighway}",${r.distanceKm},${r.ptlRatePerKg},${r.minBiltyCharge},${r.ftlFullTruckRate},${r.expressRatePerKg},"${r.transitHours}",${r.isActive}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ASK_Transport_National_Lane_Rates_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📥 Exported national lane rate sheet to CSV!');
  };

  // Copy Quotation from simulator
  const handleCopySimulatorQuote = () => {
    const text = `================================================
ASK TRANSPORT GROUP - COMMERCIAL FREIGHT QUOTATION
================================================
Origin:          ${calcOrigin}
Destination:     ${calcDest}
Highway Route:   ${matchedLane ? matchedLane.corridorHighway : 'National Freight Corridor'}
Distance:        ${distanceEstimate} KM (~${transitEstimate})
Service Mode:    ${calcServiceMode} (${calcServiceMode === 'FTL' ? 'Full Truckload' : `${calcWeightKg} KG`})
------------------------------------------------
1. Base Freight:       ₹${baseFreight.toLocaleString('en-IN')} ${calcServiceMode === 'PTL' ? `(@ ₹${ptlRateEstimate}/kg, min ₹${minChargeEstimate})` : ''}
2. Fuel Surcharge 10%: ₹${fuelSurcharge.toLocaleString('en-IN')}
3. Handling & Docket:  ₹${handlingFee.toLocaleString('en-IN')}
4. GST SAC 9965 (18%): ₹${gstAmount.toLocaleString('en-IN')}
------------------------------------------------
TOTAL INVOICED FREIGHT: ₹${totalInvoicedFreight.toLocaleString('en-IN')}
------------------------------------------------
* Rates managed via ASK Admin Rate Calculator Master
* All trucks equipped with AIS-140 GPS telematics`;

    navigator.clipboard.writeText(text);
    setCalcCopied(true);
    showToast('📋 Commercial quotation copied to clipboard!');
    setTimeout(() => setCalcCopied(false), 2500);
  };

  // Filtered rows
  const filteredRates = useMemo(() => {
    return laneRates.filter(r => {
      // 1. Text Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        r.originCity.toLowerCase().includes(q) ||
        r.originState.toLowerCase().includes(q) ||
        r.destCity.toLowerCase().includes(q) ||
        r.destState.toLowerCase().includes(q) ||
        r.corridorHighway.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 2. Category Filter
      if (filterCategory === 'active') return r.isActive;
      if (filterCategory === 'paused') return !r.isActive;
      if (filterCategory === 'gq') return r.corridorHighway.toLowerCase().includes('nh-48') || r.corridorHighway.toLowerCase().includes('nh-19') || r.corridorHighway.toLowerCase().includes('nh-44') || r.corridorHighway.toLowerCase().includes('golden');
      if (filterCategory === 'express') {
        const firstHour = parseInt(r.transitHours, 10);
        return !isNaN(firstHour) && firstHour <= 16;
      }
      if (filterCategory === 'longhaul') return r.distanceKm >= 1000;
      if (filterCategory === 'shorthaul') return r.distanceKm < 1000;

      return true;
    });
  }, [laneRates, searchQuery, filterCategory]);

  // KPI Calculations
  const totalLanes = laneRates.length;
  const activeLanes = laneRates.filter(r => r.isActive).length;
  const avgPtlRate = (laneRates.reduce((acc, r) => acc + r.ptlRatePerKg, 0) / (totalLanes || 1)).toFixed(2);
  const avgFtlRate = Math.round(laneRates.reduce((acc, r) => acc + r.ftlFullTruckRate, 0) / (totalLanes || 1));

  return (
    <div className="lrm-container">
      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="lrm-toast">
          {toastMsg}
        </div>
      )}

      {/* 1. HERO HEADER */}
      <div className="lrm-hero">
        <div className="lrm-hero-content">
          <div className="lrm-hero-badge">
            <Calculator size={13} />
            <span>{t('ADMIN / SUPER ADMIN FREIGHT RATE MASTER', 'एडमिन / सुपर एडमिन भाड़ा दर मास्टर')}</span>
          </div>
          <h1 className="lrm-hero-title">
            <Calculator size={26} style={{ color: '#38bdf8' }} />
            <span>{t('National Lane Rate Master & Route Calculator', 'राष्ट्रीय लेन रेट मास्टर एवं रूट कैलकुलेटर')}</span>
          </h1>
          <p className="lrm-hero-desc">
            {t(
              'Configure custom freight rates for all locations, cities & corridors across India. Set per-KG rates, minimum docket charges, and full-truckload tariffs that instantly govern live quotations.',
              'भारत के सभी शहरों और कॉरिडोर्स के लिए कस्टम भाड़ा दरें खुद से तय करें। प्रति किलो दर, न्यूनतम बिल्टी शुल्क और पूर्ण ट्रक भाड़ा सेट करें जो तुरंत लाइव गणना में लागू होता है।'
            )}
          </p>
        </div>

        <div className="lrm-hero-actions">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="lrm-btn-primary"
          >
            <Plus size={16} />
            <span>{t('+ Add New Route Rate', '+ नया रूट भाड़ा जोड़ें')}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="lrm-btn-secondary"
            title="Export all rates to CSV"
          >
            <Download size={14} />
            <span>{t('Export CSV', 'सीएसवी निर्यात')}</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="lrm-btn-ghost"
            title="Reset to factory benchmark"
          >
            <RotateCcw size={14} />
            <span>{t('Reset Benchmark', 'डिफ़ॉल्ट रीसेट')}</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW KPIS */}
      <div className="lrm-kpi-grid">
        <div className="lrm-kpi-card" onClick={() => setFilterCategory('all')} style={{ cursor: 'pointer' }}>
          <div className="lrm-kpi-top">
            <span className="lrm-kpi-label">{t('CONFIGURED LANES', 'दर्ज कुल रूट्स')}</span>
            <div className="lrm-kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <MapPin size={18} />
            </div>
          </div>
          <strong className="lrm-kpi-value" style={{ color: '#38bdf8' }}>{totalLanes} {t('Routes', 'रूट्स')}</strong>
          <span className="lrm-kpi-sub">{activeLanes} {t('Active National Corridors', 'सक्रिय राष्ट्रीय कॉरिडोर')}</span>
        </div>

        <div className="lrm-kpi-card">
          <div className="lrm-kpi-top">
            <span className="lrm-kpi-label">{t('AVG PTL FREIGHT RATE', 'औसत पीटीएल दर')}</span>
            <div className="lrm-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Package size={18} />
            </div>
          </div>
          <strong className="lrm-kpi-value" style={{ color: '#10b981' }}>₹{avgPtlRate} <small>/ KG</small></strong>
          <span className="lrm-kpi-sub">{t('Min Floor avg: ₹465 per bilty', 'औसत न्यूनतम बिल्टी: ₹465')}</span>
        </div>

        <div className="lrm-kpi-card" onClick={() => setFilterCategory('longhaul')} style={{ cursor: 'pointer' }}>
          <div className="lrm-kpi-top">
            <span className="lrm-kpi-label">{t('AVG FTL FULL TRUCKLOAD', 'औसत एफटीएल पूर्ण ट्रक')}</span>
            <div className="lrm-kpi-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <Truck size={18} />
            </div>
          </div>
          <strong className="lrm-kpi-value" style={{ color: '#c084fc' }}>₹{avgFtlRate.toLocaleString('en-IN')}</strong>
          <span className="lrm-kpi-sub">{t('Across Golden Quadrilateral', 'स्वर्णिम चतुर्भुज औसत')}</span>
        </div>

        <div className="lrm-kpi-card" onClick={() => setFilterCategory('active')} style={{ cursor: 'pointer' }}>
          <div className="lrm-kpi-top">
            <span className="lrm-kpi-label">{t('RATE GOVERNANCE', 'रेट नियंत्रण स्थिति')}</span>
            <div className="lrm-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <strong className="lrm-kpi-value" style={{ color: '#fbbf24' }}>100% LIVE</strong>
          <span className="lrm-kpi-sub">{t('Governs all B2B and Admin Quotes', 'सभी बुकिंग्स में स्वचालित लागू')}</span>
        </div>
      </div>

      {/* 3. INTERACTIVE ROUTE RATE SIMULATOR & TEST ENGINE */}
      <div className="lrm-simulator-box">
        <div className="lrm-sim-header">
          <div>
            <h3 className="lrm-sim-title">
              <Calculator size={18} style={{ color: '#38bdf8' }} />
              <span>{t('Live Route Rate Calculator (Test Any Location)', 'लाइव रूट दर कैलकुलेटर (कहाँ का कितना भाड़ा है जांचें)')}</span>
            </h3>
            <p className="lrm-sim-sub">
              {t(
                'Select Origin and Destination to immediately calculate live freight based on your configured lane rates.',
                'मूल शहर और गंतव्य चुनें और अपने द्वारा सेट किए गए रेट्स के आधार पर तुरंत भाड़ा देखें।'
              )}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleSwapCorridor}
              className="lrm-btn-ghost"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              title="Swap origin and destination"
            >
              <ArrowLeftRight size={13} />
              <span>{t('Swap ⇄', 'अदला-बदली ⇄')}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySimulatorQuote}
              className="lrm-btn-copy"
            >
              {calcCopied ? <CheckCircle2 size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
              <span>{calcCopied ? t('Quotation Copied!', 'कोटेशन कॉपी हो गया!') : t('Copy Official Quotation', 'कोटेशन कॉपी करें')}</span>
            </button>
          </div>
        </div>

        <div className="lrm-sim-form-grid">
          <div className="lrm-form-field">
            <label>{t('Origin Hub / City', 'प्रस्थान शहर (Origin)')}</label>
            <select
              value={calcOrigin}
              onChange={e => setCalcOrigin(e.target.value)}
              className="lrm-select"
            >
              {uniqueOrigins.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="lrm-form-field">
            <label>{t('Destination Hub / City', 'गंतव्य शहर (Destination)')}</label>
            <select
              value={calcDest}
              onChange={e => setCalcDest(e.target.value)}
              className="lrm-select"
            >
              {uniqueDestinations.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="lrm-form-field">
            <label>{t('Service Category', 'सेवा का प्रकार')}</label>
            <div className="lrm-service-toggle">
              <button
                type="button"
                className={`lrm-toggle-btn ${calcServiceMode === 'PTL' ? 'active' : ''}`}
                onClick={() => setCalcServiceMode('PTL')}
              >
                PTL (₹/KG)
              </button>
              <button
                type="button"
                className={`lrm-toggle-btn ${calcServiceMode === 'Express' ? 'active' : ''}`}
                onClick={() => setCalcServiceMode('Express')}
              >
                Express Priority
              </button>
              <button
                type="button"
                className={`lrm-toggle-btn ${calcServiceMode === 'FTL' ? 'active' : ''}`}
                onClick={() => setCalcServiceMode('FTL')}
              >
                FTL Dedicated
              </button>
            </div>
          </div>

          <div className="lrm-form-field">
            <label>
              {calcServiceMode === 'FTL'
                ? t('Standard FTL Vehicle Payload', 'पूर्ण ट्रक पेलोड')
                : t('Shipment Weight (KG)', 'पार्सल का वजन (किलोग्राम)')}
            </label>
            <input
              type="number"
              min={1}
              value={calcWeightKg}
              onChange={e => setCalcWeightKg(Math.max(1, Number(e.target.value)))}
              disabled={calcServiceMode === 'FTL'}
              className="lrm-input"
            />
          </div>
        </div>

        {/* SIMULATOR RESULT STRIP */}
        <div className="lrm-sim-result-strip">
          <div className="lrm-sim-route-info">
            <div className="lrm-sim-corridor-title">
              <span className="lrm-city-pill origin">{calcOrigin}</span>
              <ArrowRight size={16} style={{ color: '#38bdf8' }} />
              <span className="lrm-city-pill dest">{calcDest}</span>
              <span className="lrm-km-badge">📏 {distanceEstimate} KM</span>
            </div>
            <div className="lrm-sim-corridor-meta">
              <span>🛣️ {matchedLane ? matchedLane.corridorHighway : 'National Freight Highway'}</span>
              <span>⏱️ {transitEstimate}</span>
              {matchedLane && <span className="lrm-status-live">✓ Live in Rate Master</span>}
            </div>
          </div>

          <div className="lrm-sim-pricing-cards">
            <div className="lrm-pricing-item">
              <span className="lrm-pricing-label">Base Freight</span>
              <strong>₹{baseFreight.toLocaleString('en-IN')}</strong>
              <small>{calcServiceMode === 'PTL' ? `@ ₹${ptlRateEstimate}/kg` : (calcServiceMode === 'Express' ? `@ ₹${expressRateEstimate}/kg` : 'Dedicated FTL')}</small>
            </div>

            <div className="lrm-pricing-item">
              <span className="lrm-pricing-label">Fuel (10%) + Handling</span>
              <strong>₹{(fuelSurcharge + handlingFee).toLocaleString('en-IN')}</strong>
              <small>MoRTH Index + Terminal</small>
            </div>

            <div className="lrm-pricing-item">
              <span className="lrm-pricing-label">GST SAC 9965 (18%)</span>
              <strong>₹{gstAmount.toLocaleString('en-IN')}</strong>
              <small>Input Tax Credit Ready</small>
            </div>

            <div className="lrm-pricing-item lrm-pricing-total">
              <span className="lrm-pricing-label" style={{ color: '#bbf7d0' }}>Total Invoiced Freight</span>
              <strong style={{ color: '#ffffff', fontSize: '20px' }}>₹{totalInvoicedFreight.toLocaleString('en-IN')}</strong>
              <small style={{ color: '#86efac' }}>100% Verified Commercial Quote</small>
            </div>
          </div>
        </div>
      </div>

      {/* 4. LANE RATE DIRECTORY TABLE (STICKY FREEZE PANE & RESPONSIVE TILES) */}
      <div className="lrm-table-card">
        <div className="lrm-table-header">
          <div className="lrm-table-title-cluster">
            <h3 className="lrm-table-title">
              <span>📍</span> {t('All-India Lane Rates Master Directory', 'अखिल भारतीय लेन रेट मास्टर डायरेक्टरी')}
            </h3>
            <span className="lrm-table-count">{filteredRates.length} {t('Lanes Available', 'रूट्स उपलब्ध')}</span>
          </div>

          <div className="lrm-table-controls">
            <div className="lrm-search-box">
              <Search size={15} style={{ color: '#94a3b8' }} />
              <input
                type="text"
                placeholder={t('Search origin, destination, state, or highway...', 'मूल स्थान, गंतव्य, राज्य या हाईवे खोजें...')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="lrm-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="lrm-btn-add-table"
            >
              <Plus size={14} />
              <span>{t('Add Route Rate', 'नया रेट जोड़ें')}</span>
            </button>
          </div>
        </div>

        {/* 4.1 FILTER CHIPS BAR */}
        <div className="lrm-filter-bar">
          <div className="lrm-filter-chips">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`lrm-filter-chip ${filterCategory === 'all' ? 'active' : ''}`}
            >
              <span>{t('All Corridors', 'सभी कॉरिडोर')}</span>
              <span className="lrm-chip-badge">{laneRates.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterCategory('active')}
              className={`lrm-filter-chip ${filterCategory === 'active' ? 'active' : ''}`}
            >
              <span className="lrm-dot active" />
              <span>{t('Active', 'सक्रिय')}</span>
              <span className="lrm-chip-badge">{activeLanes}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterCategory('gq')}
              className={`lrm-filter-chip ${filterCategory === 'gq' ? 'active' : ''}`}
            >
              <span>🛣️ {t('Golden Quadrilateral', 'स्वर्णिम चतुर्भुज')}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterCategory('express')}
              className={`lrm-filter-chip ${filterCategory === 'express' ? 'active' : ''}`}
            >
              <span>⚡ {t('Express Fast (<16h)', 'एक्सप्रेस फास्ट')}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterCategory('longhaul')}
              className={`lrm-filter-chip ${filterCategory === 'longhaul' ? 'active' : ''}`}
            >
              <span>🚛 {t('Long Haul (>1000 KM)', 'लंबी दूरी (>1000 KM)')}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterCategory('shorthaul')}
              className={`lrm-filter-chip ${filterCategory === 'shorthaul' ? 'active' : ''}`}
            >
              <span>📦 {t('Regional (<1000 KM)', 'क्षेत्रीय (<1000 KM)')}</span>
            </button>

            {filterCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setFilterCategory('all')}
                className="lrm-filter-clear"
              >
                ✕ {t('Clear Filter', 'फ़िल्टर हटाएं')}
              </button>
            )}
          </div>
        </div>

        {/* 4.2 HIGH-CONSTRAST RESPONSIVE TABLE WITH FROZEN CORRIDOR PANE */}
        <div className="lrm-table-wrapper">
          <table className="lrm-table">
            <thead>
              <tr>
                <th className="lrm-th-sticky-route">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} style={{ color: '#38bdf8' }} />
                    <span>{t('Route Corridor (Origin ➔ Dest)', 'रूट कॉरिडोर (कहाँ से कहाँ)')}</span>
                  </div>
                </th>
                <th>{t('Distance', 'दूरी')}</th>
                <th>{t('PTL Rate (₹/KG)', 'पीटीएल दर (₹/किलो)')}</th>
                <th>{t('Min Floor (₹)', 'न्यूनतम बिल्टी')}</th>
                <th>{t('FTL Truck (₹)', 'पूर्ण ट्रक (FTL)')}</th>
                <th>{t('Express (₹/KG)', 'एक्सप्रेस दर')}</th>
                <th>{t('Est. Transit', 'समय सीमा')}</th>
                <th>{t('Status', 'स्थिति')}</th>
                <th style={{ textAlign: 'right' }}>{t('Actions', 'कार्रवाई')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRates.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#f1f5f9', marginBottom: '4px' }}>
                      {t('No matching routes found', 'कोई मेल खाता रूट नहीं मिला')}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {t('Try adjusting your search or click "+ Add New Route Rate" to configure a new corridor.', 'सर्च शब्द बदलें या नया रूट जोड़ने के लिए "+ नया रूट भाड़ा जोड़ें" पर क्लिक करें।')}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRates.map(r => (
                  <tr key={r.id}>
                    {/* FROZEN ROUTE CORRIDOR COLUMN */}
                    <td className="lrm-td-sticky-route">
                      <div className="lrm-route-cell">
                        <div className="lrm-route-id-row">
                          <span className="lrm-lane-id-tag">#{r.id}</span>
                          <span className="lrm-state-tag">{r.originState} ➔ {r.destState}</span>
                        </div>
                        <div className="lrm-route-name-row">
                          <strong className="lrm-city-text origin">{r.originCity}</strong>
                          <span className="lrm-arrow-icon">➔</span>
                          <strong className="lrm-city-text dest">{r.destCity}</strong>
                        </div>
                        <div className="lrm-highway-row">
                          <span className="lrm-highway-pill">🛣️ {r.corridorHighway}</span>
                          <button
                            type="button"
                            onClick={() => handleLoadInSimulator(r)}
                            className="lrm-btn-quick-calc"
                            title="Test this route in rate calculator above"
                          >
                            ⚡ Test Rate
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* DISTANCE */}
                    <td>
                      <span className="lrm-km-badge-cell">
                        <span>📏</span>
                        <strong>{r.distanceKm}</strong>
                        <small>KM</small>
                      </span>
                    </td>

                    {/* PTL PARCEL RATE */}
                    <td>
                      <div className="lrm-rate-container ptl">
                        <strong className="lrm-rate-val">₹{r.ptlRatePerKg.toFixed(2)}</strong>
                        <span className="lrm-rate-unit">/ KG</span>
                      </div>
                    </td>

                    {/* MINIMUM FLOOR */}
                    <td>
                      <span className="lrm-min-floor-badge">
                        <span>🛡️</span>
                        <span>₹{r.minBiltyCharge.toLocaleString('en-IN')}</span>
                      </span>
                    </td>

                    {/* FTL FULL TRUCK RATE */}
                    <td>
                      <div className="lrm-rate-container ftl">
                        <strong className="lrm-ftl-val">₹{r.ftlFullTruckRate.toLocaleString('en-IN')}</strong>
                        <span className="lrm-ftl-unit">32ft MXL</span>
                      </div>
                    </td>

                    {/* EXPRESS RATE */}
                    <td>
                      <div className="lrm-rate-container express">
                        <strong className="lrm-express-val">₹{r.expressRatePerKg.toFixed(2)}</strong>
                        <span className="lrm-express-unit">/ KG</span>
                      </div>
                    </td>

                    {/* TRANSIT HOURS */}
                    <td>
                      <span className="lrm-transit-pill">
                        <Clock size={12} style={{ color: '#38bdf8' }} />
                        <span>{r.transitHours}</span>
                      </span>
                    </td>

                    {/* ACTIVE STATUS TOGGLE */}
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(r.id)}
                        className={`lrm-status-toggle-pill ${r.isActive ? 'active' : 'paused'}`}
                        title="Click to toggle status (Active / Paused)"
                      >
                        <span className={`lrm-toggle-dot ${r.isActive ? 'active' : 'paused'}`} />
                        <span>{r.isActive ? t('Active ✓', 'सक्रिय ✓') : t('Paused ⏸', 'रोका गया ⏸')}</span>
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="lrm-action-buttons">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(r)}
                          className="lrm-action-btn edit"
                          title="Edit lane rates"
                        >
                          <Edit2 size={13} />
                          <span>{t('Edit', 'बदलें')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteRate(r.id, `${r.originCity} ➔ ${r.destCity}`)}
                          className="lrm-action-btn delete"
                          title="Delete route rate"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ADD / EDIT RATE MODAL */}
      {showModal && (
        <div className="lrm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="lrm-modal-container" onClick={e => e.stopPropagation()}>
            <div className="lrm-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="lrm-modal-icon-badge">
                  <Calculator size={20} style={{ color: '#38bdf8' }} />
                </div>
                <div>
                  <h3 className="lrm-modal-title">
                    {editingLane
                      ? t(`Edit Lane Rate: ${editingLane.originCity} ➔ ${editingLane.destCity}`, `रूट दर संपादित करें: ${editingLane.originCity} ➔ ${editingLane.destCity}`)
                      : t('Add New Route / Corridor Freight Rate', 'नया रूट / कॉरिडोर भाड़ा दर जोड़ें')}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    {t('Configure corridor distance, per-KG rates, minimum docket charge & FTL full truck pricing', 'दूरी, प्रति किलो दर, न्यूनतम बिल्टी और पूर्ण ट्रक भाड़ा निर्धारित करें')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="lrm-modal-close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="lrm-modal-form">
              {/* HELPER TOOLBAR: AUTO-CALCULATOR ASSISTANT */}
              <div className="lrm-modal-helper-bar">
                <span style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} style={{ color: '#fbbf24' }} />
                  <strong>Smart Tariff Assistant:</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleAutoCalcFromDistance(parseFloat(formDistanceKm) || 1000)}
                  className="lrm-btn-helper-autocalc"
                >
                  <Zap size={13} />
                  <span>⚡ Auto-Calculate Recommended Rates from Distance</span>
                </button>
              </div>

              <div className="lrm-modal-grid-2">
                <div className="lrm-modal-field">
                  <label>{t('Origin City / Hub *', 'प्रस्थान शहर (Origin) *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Patna"
                    value={formOriginCity}
                    onChange={e => setFormOriginCity(e.target.value)}
                    className="lrm-modal-input"
                  />
                </div>

                <div className="lrm-modal-field">
                  <label>{t('Origin State', 'प्रस्थान राज्य (State)')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Bihar"
                    value={formOriginState}
                    onChange={e => setFormOriginState(e.target.value)}
                    className="lrm-modal-input"
                  />
                </div>
              </div>

              <div className="lrm-modal-grid-2">
                <div className="lrm-modal-field">
                  <label>{t('Destination City / Hub *', 'गंतव्य शहर (Destination) *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kolkata"
                    value={formDestCity}
                    onChange={e => setFormDestCity(e.target.value)}
                    className="lrm-modal-input"
                  />
                </div>

                <div className="lrm-modal-field">
                  <label>{t('Destination State', 'गंतव्य राज्य (State)')}</label>
                  <input
                    type="text"
                    placeholder="e.g. West Bengal"
                    value={formDestState}
                    onChange={e => setFormDestState(e.target.value)}
                    className="lrm-modal-input"
                  />
                </div>
              </div>

              <div className="lrm-modal-grid-2">
                <div className="lrm-modal-field">
                  <label>{t('Highway Corridor Name', 'हाईवे कॉरिडोर का नाम')}</label>
                  <input
                    type="text"
                    placeholder="e.g. NH-19 Eastern Spine"
                    value={formHighway}
                    onChange={e => setFormHighway(e.target.value)}
                    className="lrm-modal-input"
                  />
                </div>

                <div className="lrm-modal-field">
                  <label>{t('Highway Distance (KM) *', 'दूरी (किलोमीटर) *')}</label>
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="e.g. 580"
                    value={formDistanceKm}
                    onChange={e => setFormDistanceKm(e.target.value)}
                    className="lrm-modal-input"
                  />
                </div>
              </div>

              <div className="lrm-modal-section-title">
                {t('Commercial Freight Rates Setup (कहाँ का कितना भाड़ा)', 'वाणिज्यिक भाड़ा दर सेटअप')}
              </div>

              <div className="lrm-modal-grid-3">
                <div className="lrm-modal-field">
                  <label>{t('PTL Rate (₹ / KG) *', 'पीटीएल दर (₹ / किलो) *')}</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    required
                    placeholder="13.0"
                    value={formPtlRate}
                    onChange={e => setFormPtlRate(e.target.value)}
                    className="lrm-modal-input lrm-highlight-input"
                  />
                </div>

                <div className="lrm-modal-field">
                  <label>{t('Min Bilty Floor (₹) *', 'न्यूनतम बिल्टी चार्ज (₹) *')}</label>
                  <input
                    type="number"
                    min={50}
                    required
                    placeholder="400"
                    value={formMinBilty}
                    onChange={e => setFormMinBilty(e.target.value)}
                    className="lrm-modal-input"
                  />
                </div>

                <div className="lrm-modal-field">
                  <label>{t('Full Truckload FTL (₹) *', 'पूर्ण ट्रक भाड़ा FTL (₹) *')}</label>
                  <input
                    type="number"
                    min={500}
                    required
                    placeholder="22000"
                    value={formFtlRate}
                    onChange={e => setFormFtlRate(e.target.value)}
                    className="lrm-modal-input"
                  />
                </div>
              </div>

              <div className="lrm-modal-grid-2">
                <div className="lrm-modal-field">
                  <label>{t('Express Air/Surface Rate (₹ / KG)', 'एक्सप्रेस दर (₹ / किलो)')}</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    placeholder="20.0"
                    value={formExpressRate}
                    onChange={e => setFormExpressRate(e.target.value)}
                    className="lrm-modal-input"
                  />
                </div>

                <div className="lrm-modal-field">
                  <label>{t('Estimated Transit Hours / Days', 'अनुमानित समय सीमा')}</label>
                  <input
                    type="text"
                    placeholder="e.g. 12-16 Hours"
                    value={formTransitHours}
                    onChange={e => setFormTransitHours(e.target.value)}
                    className="lrm-modal-input"
                  />
                </div>
              </div>

              <div className="lrm-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="lrm-btn-cancel"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="lrm-btn-save"
                >
                  <Check size={16} />
                  <span>{editingLane ? t('Update Rate ✓', 'दर अपडेट करें ✓') : t('Save & Publish Rate ✓', 'दर सुरक्षित व लागू करें ✓')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
