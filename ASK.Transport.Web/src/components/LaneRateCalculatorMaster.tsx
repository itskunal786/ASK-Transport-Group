import React, { useState, useEffect } from 'react';
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
  X
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
  const uniqueOrigins = Array.from(new Set(laneRates.map(r => r.originCity))).sort();
  const uniqueDestinations = Array.from(new Set(laneRates.map(r => r.destCity))).sort();

  // Find rate for selected corridor in calculator
  const matchedLane = laneRates.find(
    r => (r.originCity.toLowerCase() === calcOrigin.toLowerCase() && r.destCity.toLowerCase() === calcDest.toLowerCase()) ||
         (r.originCity.toLowerCase() === calcDest.toLowerCase() && r.destCity.toLowerCase() === calcOrigin.toLowerCase())
  );

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
    // FTL
    baseFreight = ftlRateEstimate;
  }

  const fuelSurcharge = Math.round(baseFreight * 0.10);
  const handlingFee = 150;
  const taxableSubtotal = baseFreight + fuelSurcharge + handlingFee;
  const gstAmount = Math.round(taxableSubtotal * 0.18);
  const totalInvoicedFreight = taxableSubtotal + gstAmount;

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
      // Update existing
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
      showToast(`✓ Updated lane rate: ${formOriginCity} ➔ ${formDestCity} (${formPtlRate} ₹/kg)`);
    } else {
      // Add new
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
  const filteredRates = laneRates.filter(r => {
    const matchesSearch =
      r.originCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.originState.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destState.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.corridorHighway.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

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
            <Calculator size={24} style={{ color: '#0284c7' }} />
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
        <div className="lrm-kpi-card">
          <div className="lrm-kpi-top">
            <span className="lrm-kpi-label">{t('CONFIGURED LANES', 'दर्ज कुल रूट्स')}</span>
            <div className="lrm-kpi-icon" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
              <MapPin size={18} />
            </div>
          </div>
          <strong className="lrm-kpi-value" style={{ color: '#0284c7' }}>{totalLanes} {t('Routes', 'रूट्स')}</strong>
          <span className="lrm-kpi-sub">{activeLanes} {t('Active National Corridors', 'सक्रिय राष्ट्रीय कॉरिडोर')}</span>
        </div>

        <div className="lrm-kpi-card">
          <div className="lrm-kpi-top">
            <span className="lrm-kpi-label">{t('AVG PTL FREIGHT RATE', 'औसत पीटीएल दर')}</span>
            <div className="lrm-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Package size={18} />
            </div>
          </div>
          <strong className="lrm-kpi-value" style={{ color: '#10b981' }}>₹{avgPtlRate} <small>/ KG</small></strong>
          <span className="lrm-kpi-sub">{t('Min Floor avg: ₹465 per bilty', 'औसत न्यूनतम बिल्टी: ₹465')}</span>
        </div>

        <div className="lrm-kpi-card">
          <div className="lrm-kpi-top">
            <span className="lrm-kpi-label">{t('AVG FTL FULL TRUCKLOAD', 'औसत एफटीएल पूर्ण ट्रक')}</span>
            <div className="lrm-kpi-icon" style={{ background: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed' }}>
              <Truck size={18} />
            </div>
          </div>
          <strong className="lrm-kpi-value" style={{ color: '#7c3aed' }}>₹{avgFtlRate.toLocaleString('en-IN')}</strong>
          <span className="lrm-kpi-sub">{t('Across Golden Quadrilateral', 'स्वर्णिम चतुर्भुज औसत')}</span>
        </div>

        <div className="lrm-kpi-card">
          <div className="lrm-kpi-top">
            <span className="lrm-kpi-label">{t('RATE GOVERNANCE', 'रेट नियंत्रण स्थिति')}</span>
            <div className="lrm-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <strong className="lrm-kpi-value" style={{ color: '#f59e0b' }}>100% LIVE</strong>
          <span className="lrm-kpi-sub">{t('Governs all B2B and Admin Quotes', 'सभी बुकिंग्स में स्वचालित लागू')}</span>
        </div>
      </div>

      {/* 3. INTERACTIVE ROUTE RATE SIMULATOR & TEST ENGINE */}
      <div className="lrm-simulator-box">
        <div className="lrm-sim-header">
          <div>
            <h3 className="lrm-sim-title">
              <Calculator size={18} style={{ color: '#0284c7' }} />
              <span>{t('Live Route Rate Calculator (Test Any Location)', 'लाइव रूट दर कैलकुलेटर (कहाँ का कितना भाड़ा है जांचें)')}</span>
            </h3>
            <p className="lrm-sim-sub">
              {t(
                'Select Origin and Destination to immediately calculate live freight based on your configured lane rates.',
                'मूल शहर और गंतव्य चुनें और अपने द्वारा सेट किए गए रेट्स के आधार पर तुरंत भाड़ा देखें।'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopySimulatorQuote}
            className="lrm-btn-copy"
          >
            {calcCopied ? <CheckCircle2 size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
            <span>{calcCopied ? t('Quotation Copied!', 'कोटेशन कॉपी हो गया!') : t('Copy Official Quotation', 'कोटेशन कॉपी करें')}</span>
          </button>
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
            <label>{t('Service Mode', 'सेवा प्रकार')}</label>
            <div className="lrm-service-toggle">
              <button
                type="button"
                className={`lrm-toggle-btn ${calcServiceMode === 'PTL' ? 'active' : ''}`}
                onClick={() => setCalcServiceMode('PTL')}
              >
                PTL (Part Load)
              </button>
              <button
                type="button"
                className={`lrm-toggle-btn ${calcServiceMode === 'Express' ? 'active' : ''}`}
                onClick={() => setCalcServiceMode('Express')}
              >
                ⚡ Express
              </button>
              <button
                type="button"
                className={`lrm-toggle-btn ${calcServiceMode === 'FTL' ? 'active' : ''}`}
                onClick={() => setCalcServiceMode('FTL')}
              >
                🚛 Full Truck
              </button>
            </div>
          </div>

          <div className="lrm-form-field">
            <label>{t('Consignment Weight (KG)', 'कंसाइनमेंट वजन (किलो)')}</label>
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
              <strong>{calcOrigin}</strong>
              <ArrowRight size={16} style={{ color: '#0284c7' }} />
              <strong>{calcDest}</strong>
              <span className="lrm-km-badge">{distanceEstimate} KM</span>
            </div>
            <div className="lrm-sim-corridor-meta">
              <span>🛣️ {matchedLane ? matchedLane.corridorHighway : 'National Freight Highway'}</span>
              <span>⏱️ {transitEstimate}</span>
              {matchedLane && <span className="lrm-status-live">✓ Configured in Rate Master</span>}
            </div>
          </div>

          <div className="lrm-sim-pricing-cards">
            <div className="lrm-pricing-item">
              <span className="lrm-pricing-label">Base Freight</span>
              <strong>₹{baseFreight.toLocaleString('en-IN')}</strong>
              <small>{calcServiceMode === 'PTL' ? `@ ₹${ptlRateEstimate}/kg` : (calcServiceMode === 'Express' ? `@ ₹${expressRateEstimate}/kg` : 'Full Truckload')}</small>
            </div>

            <div className="lrm-pricing-item">
              <span className="lrm-pricing-label">Fuel (10%) + Handling</span>
              <strong>₹{(fuelSurcharge + handlingFee).toLocaleString('en-IN')}</strong>
              <small>MoRTH Index</small>
            </div>

            <div className="lrm-pricing-item">
              <span className="lrm-pricing-label">GST SAC 9965 (18%)</span>
              <strong>₹{gstAmount.toLocaleString('en-IN')}</strong>
              <small>Input Credit Ready</small>
            </div>

            <div className="lrm-pricing-item lrm-pricing-total">
              <span className="lrm-pricing-label" style={{ color: '#bbf7d0' }}>Total Invoiced Freight</span>
              <strong style={{ color: '#ffffff', fontSize: '20px' }}>₹{totalInvoicedFreight.toLocaleString('en-IN')}</strong>
              <small style={{ color: '#86efac' }}>Complete Commercial Quote</small>
            </div>
          </div>
        </div>
      </div>

      {/* 4. LANE RATE DIRECTORY TABLE (ADMIN CAN EDIT EVERY RATE) */}
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
              <Search size={15} style={{ color: '#64748b' }} />
              <input
                type="text"
                placeholder={t('Search origin, destination, or highway...', 'मूल स्थान, गंतव्य या हाईवे खोजें...')}
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
              <span>{t('Add Rate', 'नया रेट जोड़ें')}</span>
            </button>
          </div>
        </div>

        <div className="lrm-table-wrapper">
          <table className="lrm-table">
            <thead>
              <tr>
                <th>{t('Route Corridor (Origin ➔ Dest)', 'रूट कॉरिडोर (कहाँ से कहाँ)')}</th>
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
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    {t('No matching routes found. Click "+ Add New Route Rate" to create one.', 'कोई रूट नहीं मिला। नया रूट जोड़ने के लिए "+ नया रूट भाड़ा जोड़ें" पर क्लिक करें।')}
                  </td>
                </tr>
              ) : (
                filteredRates.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="lrm-route-cell">
                        <strong className="lrm-route-name">
                          {r.originCity} ➔ {r.destCity}
                        </strong>
                        <span className="lrm-route-highway">{r.corridorHighway}</span>
                      </div>
                    </td>

                    <td>
                      <span className="lrm-km-text">{r.distanceKm} KM</span>
                    </td>

                    <td>
                      <strong className="lrm-rate-highlight">₹{r.ptlRatePerKg.toFixed(2)}</strong>
                      <span className="lrm-unit-sub">/ KG</span>
                    </td>

                    <td>
                      <span className="lrm-min-floor">₹{r.minBiltyCharge.toLocaleString('en-IN')}</span>
                    </td>

                    <td>
                      <strong className="lrm-ftl-cell">₹{r.ftlFullTruckRate.toLocaleString('en-IN')}</strong>
                    </td>

                    <td>
                      <span className="lrm-express-cell">₹{r.expressRatePerKg.toFixed(2)}</span>
                    </td>

                    <td>
                      <span className="lrm-transit-text">{r.transitHours}</span>
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(r.id)}
                        className={`lrm-status-badge ${r.isActive ? 'active' : 'paused'}`}
                        title="Click to toggle status"
                      >
                        {r.isActive ? t('Active ✓', 'सक्रिय ✓') : t('Paused ⏸', 'स्थगित ⏸')}
                      </button>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="lrm-action-buttons">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(r)}
                          className="lrm-action-btn edit"
                          title="Edit lane rates"
                        >
                          <Edit2 size={13} />
                          <span>{t('Edit', 'संपादित')}</span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator size={18} style={{ color: '#0284c7' }} />
                <h3 className="lrm-modal-title">
                  {editingLane
                    ? t(`Edit Lane Rate: ${editingLane.originCity} ➔ ${editingLane.destCity}`, `रूट दर संपादित करें: ${editingLane.originCity} ➔ ${editingLane.destCity}`)
                    : t('Add New Route / Corridor Freight Rate', 'नया रूट / कॉरिडोर भाड़ा दर जोड़ें')}
                </h3>
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
              <div className="lrm-modal-grid-2">
                <div className="lrm-modal-field">
                  <label>{t('Origin City / Hub *', 'प्रस्थान शहर (Origin) *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={formOriginCity}
                    onChange={e => setFormOriginCity(e.target.value)}
                    className="lrm-modal-input"
                  />
                </div>

                <div className="lrm-modal-field">
                  <label>{t('Origin State', 'प्रस्थान राज्य (State)')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
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
                    placeholder="e.g. Delhi NCR"
                    value={formDestCity}
                    onChange={e => setFormDestCity(e.target.value)}
                    className="lrm-modal-input"
                  />
                </div>

                <div className="lrm-modal-field">
                  <label>{t('Destination State', 'गंतव्य राज्य (State)')}</label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi"
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
                    placeholder="e.g. NH-48 Golden Quadrilateral"
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
                    placeholder="e.g. 1420"
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
                    placeholder="18.5"
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
                    placeholder="500"
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
                    placeholder="45000"
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
                    placeholder="28.0"
                    value={formExpressRate}
                    onChange={e => setFormExpressRate(e.target.value)}
                    className="lrm-modal-input"
                  />
                </div>

                <div className="lrm-modal-field">
                  <label>{t('Estimated Transit Hours / Days', 'अनुमानित समय सीमा')}</label>
                  <input
                    type="text"
                    placeholder="e.g. 28-34 Hours"
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
