import React, { useState } from 'react';
import {
  Zap,
  Truck,
  Package,
  Percent,
  Sliders,
  RotateCcw,
  Save,
  Copy,
  Printer,
  MapPin,
  CheckCircle2,
  Fuel,
  Info,
  X,
  FileText
} from 'lucide-react';
import './DynamicTariffEngine.css';

interface DynamicTariffEngineProps {
  tariffFtlPerKm: string;
  setTariffFtlPerKm: (val: string) => void;
  tariffFtlMinTrip: string;
  setTariffFtlMinTrip: (val: string) => void;
  tariffPtlPerKgKm: string;
  setTariffPtlPerKgKm: (val: string) => void;
  tariffPtlMinFloor: string;
  setTariffPtlMinFloor: (val: string) => void;
  tariffExpressMult: string;
  setTariffExpressMult: (val: string) => void;
  tariffFuelSurcharge: string;
  setTariffFuelSurcharge: (val: string) => void;
  tariffGstPercent: string;
  setTariffGstPercent: (val: string) => void;
  tariffHandlingFee: string;
  setTariffHandlingFee: (val: string) => void;
  tariffSaving: boolean;
  onSaveTariff: () => Promise<void>;
  showToast: (msg: string) => void;
}

export const DynamicTariffEngine: React.FC<DynamicTariffEngineProps> = ({
  tariffFtlPerKm,
  setTariffFtlPerKm,
  tariffFtlMinTrip,
  setTariffFtlMinTrip,
  tariffPtlPerKgKm,
  setTariffPtlPerKgKm,
  tariffPtlMinFloor,
  setTariffPtlMinFloor,
  tariffExpressMult,
  setTariffExpressMult,
  tariffFuelSurcharge,
  setTariffFuelSurcharge,
  tariffGstPercent,
  setTariffGstPercent,
  tariffHandlingFee,
  setTariffHandlingFee,
  tariffSaving,
  onSaveTariff,
  showToast
}) => {
  // Simulator Local States
  const [simDistanceKm, setSimDistanceKm] = useState<number>(1000);
  const [simWeightKg, setSimWeightKg] = useState<number>(16000);
  const [simService, setSimService] = useState<'PTL' | 'FTL' | 'Express'>('FTL');
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [showRateSlipModal, setShowRateSlipModal] = useState(false);
  const [quoteRefId] = useState<string>(() => `ASK-QTN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
  const [selectedCorridorName, setSelectedCorridorName] = useState<string>('Delhi ➔ Mumbai (NH-48 Golden Quadrilateral)');

  // Stepper Helper Functions
  const stepFtlRate = (delta: number) => {
    const cur = parseFloat(tariffFtlPerKm) || 14.5;
    const next = Math.max(1, cur + delta);
    setTariffFtlPerKm(next.toFixed(2));
  };

  const stepFtlMin = (delta: number) => {
    const cur = parseFloat(tariffFtlMinTrip) || 12000;
    const next = Math.max(1000, cur + delta);
    setTariffFtlMinTrip(String(Math.round(next)));
  };

  const stepPtlRate = (delta: number) => {
    const cur = parseFloat(tariffPtlPerKgKm) || 1.85;
    const next = Math.max(0.1, cur + delta);
    setTariffPtlPerKgKm(next.toFixed(2));
  };

  const stepPtlMin = (delta: number) => {
    const cur = parseFloat(tariffPtlMinFloor) || 450;
    const next = Math.max(50, cur + delta);
    setTariffPtlMinFloor(String(Math.round(next)));
  };

  const stepFuel = (delta: number) => {
    const cur = parseFloat(tariffFuelSurcharge) || 11.5;
    const next = Math.max(0, cur + delta);
    setTariffFuelSurcharge(next.toFixed(1));
  };

  const stepHandling = (delta: number) => {
    const cur = parseFloat(tariffHandlingFee) || 250;
    const next = Math.max(0, cur + delta);
    setTariffHandlingFee(String(Math.round(next)));
  };

  // Reset to MoRTH Official Benchmark
  const handleResetBenchmark = () => {
    setTariffFtlPerKm('14.50');
    setTariffFtlMinTrip('12000');
    setTariffPtlPerKgKm('1.85');
    setTariffPtlMinFloor('450');
    setTariffExpressMult('1.75');
    setTariffFuelSurcharge('11.5');
    setTariffGstPercent('18.0');
    setTariffHandlingFee('250');
    showToast('🔄 Restored Indian Highway Logistics MoRTH benchmark tariffs.');
  };

  // Live Simulator Calculations
  const ftlPerKm = parseFloat(tariffFtlPerKm || '14.5');
  const ftlMinFloor = parseFloat(tariffFtlMinTrip || '12000');
  const ptlPerKgKm = parseFloat(tariffPtlPerKgKm || '1.85');
  const ptlMinFloor = parseFloat(tariffPtlMinFloor || '450');
  const expressMult = parseFloat(tariffExpressMult || '1.75');
  const fuelPct = parseFloat(tariffFuelSurcharge || '11.5');
  const gstPct = parseFloat(tariffGstPercent || '18');
  const handlingFee = parseFloat(tariffHandlingFee || '250');

  const simBaseFreight = simService === 'FTL'
    ? Math.round(Math.max(simDistanceKm * ftlPerKm, ftlMinFloor))
    : Math.round(Math.max((simDistanceKm * ptlPerKgKm * (simWeightKg / 100)), ptlMinFloor) * (simService === 'Express' ? expressMult : 1.0));

  const simFuelCharge = Math.round(simBaseFreight * (fuelPct / 100));
  const simHandling = handlingFee;
  const simSubtotal = Math.round(simBaseFreight + simFuelCharge + simHandling);
  const simGst = Math.round(simSubtotal * (gstPct / 100));
  const simTotal = simSubtotal + simGst;

  // Copy Quotation to Clipboard
  const handleCopyQuotation = () => {
    const quoteText = `================================================
ASK TRANSPORT & LOGISTICS - FREIGHT QUOTE
================================================
Trip Distance:       ${simDistanceKm.toLocaleString('en-IN')} KM
Consignment Weight:  ${simWeightKg.toLocaleString('en-IN')} KG (${(simWeightKg / 1000).toFixed(1)} Ton)
Service Category:    ${simService === 'FTL' ? 'Full Truckload (FTL Dedicated)' : simService === 'Express' ? 'Express Highway / Air Priority' : 'Part Truckload (PTL Parcel)'}
------------------------------------------------
Base Haulage:        ₹${simBaseFreight.toLocaleString('en-IN')}
Fuel Surcharge (${fuelPct}%): ₹${simFuelCharge.toLocaleString('en-IN')}
Terminal & Tolls:    ₹${simHandling.toLocaleString('en-IN')}
GST (SAC 9965 ${gstPct}%):  ₹${simGst.toLocaleString('en-IN')}
------------------------------------------------
TOTAL FREIGHT:       ₹${simTotal.toLocaleString('en-IN')}
------------------------------------------------
* Generated live via ASK Dynamic Tariff Engine
* 100% AIS-140 GPS tracking & Digital E-Way Bill synced.`;

    navigator.clipboard.writeText(quoteText);
    setCopiedQuote(true);
    showToast('📋 Official Quotation copied to clipboard!');
    setTimeout(() => setCopiedQuote(false), 3000);
  };

  // Indian Rupees Amount to Words
  const numberToWordsINR = (amount: number): string => {
    if (!amount || isNaN(amount)) return 'Zero Rupees Only';
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertChunk = (n: number): string => {
      let str = '';
      if (n >= 100) {
        str += units[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        str += tens[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + units[n % 10] : '') + ' ';
      } else if (n > 0) {
        str += units[n] + ' ';
      }
      return str.trim();
    };

    let num = Math.round(amount);
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const remainder = num;

    let words = '';
    if (crore > 0) words += convertChunk(crore) + ' Crore ';
    if (lakh > 0) words += convertChunk(lakh) + ' Lakh ';
    if (thousand > 0) words += convertChunk(thousand) + ' Thousand ';
    if (remainder > 0) words += convertChunk(remainder) + ' ';

    return 'Rupees ' + words.trim() + ' Only';
  };

  const getVehicleType = (weightKg: number): string => {
    if (weightKg <= 1000) return '1.0T LCV (Tata Ace / Mahindra Bolero Pickup)';
    if (weightKg <= 3500) return '3.5T LCV (14 Ft Eicher Pro / Tata 407)';
    if (weightKg <= 9000) return '9.0T ICV (19-22 Ft 6-Wheeler Intermediate)';
    if (weightKg <= 16000) return '16.0T Heavy (32 Ft MXL Multi-Axle Container)';
    return '25.0 - 40.0T Multi-Axle Trailer (Heavy Haulage Freight Spine)';
  };

  const getTransitEstimate = (km: number): string => {
    const minHrs = Math.max(8, Math.round(km / 45));
    const maxHrs = Math.max(12, Math.round(km / 35));
    return `${minHrs} - ${maxHrs} Hours (Direct Highway Linehaul)`;
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const validUntilStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const handlePrintRateSlip = () => {
    setShowRateSlipModal(true);
    setTimeout(() => {
      window.print();
    }, 280);
  };

  // High-Volume Freight Corridors
  const CORRIDORS = [
    {
      id: 'del-mum',
      name: 'Delhi ➔ Mumbai',
      km: 1420,
      transit: '34-38 Hours',
      defaultWeight: 20000,
      highway: 'NH-48 Golden Quadrilateral'
    },
    {
      id: 'mum-blr',
      name: 'Mumbai ➔ Bengaluru',
      km: 980,
      transit: '22-26 Hours',
      defaultWeight: 16000,
      highway: 'NH-48 Industrial Corridor'
    },
    {
      id: 'ahm-kol',
      name: 'Ahmedabad ➔ Kolkata',
      km: 1980,
      transit: '44-50 Hours',
      defaultWeight: 25000,
      highway: 'NH-19 East-West Freight Spine'
    },
    {
      id: 'pun-chn',
      name: 'Pune ➔ Chennai',
      km: 1150,
      transit: '26-30 Hours',
      defaultWeight: 20000,
      highway: 'NH-65 Southern Corridor'
    }
  ];

  return (
    <div className="dte-container">
      {/* 1. HERO HEADER BANNER */}
      <div className="dte-hero">
        <div className="dte-hero-left">
          <div className="dte-hero-badge">
            <Zap size={13} className="animate-pulse" />
            <span>MoRTH &amp; GST Council Aligned Pricing Matrix</span>
          </div>
          <h1 className="dte-hero-title">
            <Zap size={24} style={{ color: '#38bdf8' }} />
            <span>Dynamic Tariff &amp; Rate Matrix Engine</span>
          </h1>
          <p className="dte-hero-desc">
            Governs national commercial freight tariffs, real-time diesel surcharge index, GST SAC 9965 tax slabs, and client booking calculation API.
          </p>
        </div>

        <div className="dte-hero-actions">
          <button
            type="button"
            onClick={handleResetBenchmark}
            className="dte-btn-reset"
            title="Reset parameters to National Highway MoRTH Benchmark"
          >
            <RotateCcw size={14} />
            <span>Reset Benchmark</span>
          </button>

          <button
            type="button"
            onClick={onSaveTariff}
            disabled={tariffSaving}
            className="dte-btn-broadcast"
            title="Broadcast live tariffs to booking engine, driver apps, and B2B client portal"
          >
            <Save size={15} />
            <span>{tariffSaving ? 'Broadcasting...' : 'Save & Broadcast Tariff to Portal'}</span>
          </button>
        </div>
      </div>

      {/* 2. TOP BENCHMARK METRIC CARDS */}
      <div className="dte-kpi-grid">
        <div className="dte-kpi-card" style={{ borderLeft: '4px solid #059669' }}>
          <div className="dte-kpi-top">
            <span className="dte-kpi-label">FTL BASE BENCHMARK</span>
            <div className="dte-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Truck size={18} />
            </div>
          </div>
          <div className="dte-kpi-val" style={{ color: '#059669' }}>
            ₹{tariffFtlPerKm} <span style={{ fontSize: '12px', color: '#64748b' }}>/ Ton-KM</span>
          </div>
          <div className="dte-kpi-sub">
            <span>Min Floor: <b>₹{Number(tariffFtlMinTrip).toLocaleString('en-IN')}</b></span>
            <span>• 32ft MXL Fleet</span>
          </div>
        </div>

        <div className="dte-kpi-card" style={{ borderLeft: '4px solid #d97706' }}>
          <div className="dte-kpi-top">
            <span className="dte-kpi-label">PTL PARCEL BASE</span>
            <div className="dte-kpi-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Package size={18} />
            </div>
          </div>
          <div className="dte-kpi-val" style={{ color: '#d97706' }}>
            ₹{tariffPtlPerKgKm} <span style={{ fontSize: '12px', color: '#64748b' }}>/ Kg-KM</span>
          </div>
          <div className="dte-kpi-sub">
            <span>Min Docket: <b>₹{Number(tariffPtlMinFloor).toLocaleString('en-IN')}</b></span>
            <span>• Volumetric CFT (1:10)</span>
          </div>
        </div>

        <div className="dte-kpi-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="dte-kpi-top">
            <span className="dte-kpi-label">DIESEL FUEL SURCHARGE</span>
            <div className="dte-kpi-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>
              <Fuel size={18} />
            </div>
          </div>
          <div className="dte-kpi-val" style={{ color: '#0284c7' }}>
            +{tariffFuelSurcharge}%
          </div>
          <div className="dte-kpi-sub">
            <span>IOCL Benchmark: <b>₹89.62 / Litre</b></span>
          </div>
        </div>

        <div className="dte-kpi-card" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div className="dte-kpi-top">
            <span className="dte-kpi-label">EXPRESS &amp; STATUTORY GST</span>
            <div className="dte-kpi-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <Percent size={18} />
            </div>
          </div>
          <div className="dte-kpi-val" style={{ color: '#7c3aed' }}>
            {tariffExpressMult}x <span style={{ fontSize: '12px', color: '#64748b' }}>• GST {tariffGstPercent}%</span>
          </div>
          <div className="dte-kpi-sub">
            <span>SAC Code: <b>9965 (Goods Transport)</b></span>
          </div>
        </div>
      </div>

      {/* 3. TARIFF CONFIGURATION CARDS GRID */}
      <div className="dte-config-grid">
        {/* Card 1: FTL Full Truckload */}
        <div className="dte-config-card">
          <div className="dte-card-header">
            <div className="dte-card-badge ftl">
              <Truck size={22} />
            </div>
            <div>
              <h3 className="dte-card-title">Full Truckload (FTL) Freight Slab</h3>
              <p className="dte-card-desc">Commercial rates for 32ft MXL, 24ft, and container trailers</p>
            </div>
          </div>

          <div className="dte-input-block">
            <div className="dte-input-label-row">
              <label className="dte-input-label">Base Tariff (₹ per Ton / KM)</label>
              <span className="dte-input-hint">Benchmark: ₹13 - ₹16</span>
            </div>
            <div className="dte-input-stepper-wrap">
              <span className="dte-input-prefix">₹</span>
              <input
                type="number"
                step="0.5"
                value={tariffFtlPerKm}
                onChange={e => setTariffFtlPerKm(e.target.value)}
                className="dte-stepper-input"
              />
              <button type="button" onClick={() => stepFtlRate(-0.5)} className="dte-step-btn">-0.5</button>
              <button type="button" onClick={() => stepFtlRate(+0.5)} className="dte-step-btn">+0.5</button>
            </div>
          </div>

          <div className="dte-input-block">
            <div className="dte-input-label-row">
              <label className="dte-input-label">Minimum Corridor Trip Charge (Floor)</label>
              <span className="dte-input-hint">Minimum dispatch floor</span>
            </div>
            <div className="dte-input-stepper-wrap">
              <span className="dte-input-prefix">₹</span>
              <input
                type="number"
                step="500"
                value={tariffFtlMinTrip}
                onChange={e => setTariffFtlMinTrip(e.target.value)}
                className="dte-stepper-input"
              />
              <button type="button" onClick={() => stepFtlMin(-500)} className="dte-step-btn">-500</button>
              <button type="button" onClick={() => stepFtlMin(+500)} className="dte-step-btn">+500</button>
            </div>
          </div>

          <div className="dte-card-pill-note">
            <Info size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
            Applied automatically to dedicated full-load bookings with toll &amp; border green-channel pass.
          </div>
        </div>

        {/* Card 2: PTL Part Truckload */}
        <div className="dte-config-card">
          <div className="dte-card-header">
            <div className="dte-card-badge ptl">
              <Package size={22} />
            </div>
            <div>
              <h3 className="dte-card-title">Part Truckload (PTL / Parcel Express)</h3>
              <p className="dte-card-desc">LTL commercial parcels with volumetric CFT calculations</p>
            </div>
          </div>

          <div className="dte-input-block">
            <div className="dte-input-label-row">
              <label className="dte-input-label">Base Freight (₹ per Kg / KM)</label>
              <span className="dte-input-hint">Standard: ₹1.50 - ₹2.20</span>
            </div>
            <div className="dte-input-stepper-wrap">
              <span className="dte-input-prefix">₹</span>
              <input
                type="number"
                step="0.05"
                value={tariffPtlPerKgKm}
                onChange={e => setTariffPtlPerKgKm(e.target.value)}
                className="dte-stepper-input"
              />
              <button type="button" onClick={() => stepPtlRate(-0.05)} className="dte-step-btn">-0.05</button>
              <button type="button" onClick={() => stepPtlRate(+0.05)} className="dte-step-btn">+0.05</button>
            </div>
          </div>

          <div className="dte-input-block">
            <div className="dte-input-label-row">
              <label className="dte-input-label">Minimum Parcel Booking Fee</label>
              <span className="dte-input-hint">Base docket creation</span>
            </div>
            <div className="dte-input-stepper-wrap">
              <span className="dte-input-prefix">₹</span>
              <input
                type="number"
                step="50"
                value={tariffPtlMinFloor}
                onChange={e => setTariffPtlMinFloor(e.target.value)}
                className="dte-stepper-input"
              />
              <button type="button" onClick={() => stepPtlMin(-50)} className="dte-step-btn">-50</button>
              <button type="button" onClick={() => stepPtlMin(+50)} className="dte-step-btn">+50</button>
            </div>
          </div>

          <div className="dte-card-pill-note">
            <Info size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
            Calculated dynamically using volumetric CFT formula (10 Kg per CFT standard ratio).
          </div>
        </div>

        {/* Card 3: Surcharges & Taxes */}
        <div className="dte-config-card">
          <div className="dte-card-header">
            <div className="dte-card-badge tax">
              <Percent size={22} />
            </div>
            <div>
              <h3 className="dte-card-title">Surcharges, Fuel &amp; GST Rates</h3>
              <p className="dte-card-desc">Regulatory tax slabs and dynamic highway fuel surcharges</p>
            </div>
          </div>

          <div className="dte-input-block">
            <div className="dte-input-label-row">
              <label className="dte-input-label">Express / Air Cargo Multiplier</label>
              <span className="dte-input-hint">Next-day priority</span>
            </div>
            <div className="dte-input-stepper-wrap">
              <span className="dte-input-prefix">x</span>
              <input
                type="number"
                step="0.05"
                value={tariffExpressMult}
                onChange={e => setTariffExpressMult(e.target.value)}
                className="dte-stepper-input"
              />
            </div>
          </div>

          <div className="dte-input-block">
            <div className="dte-input-label-row">
              <label className="dte-input-label">Diesel Price Fuel Surcharge (%)</label>
              <span className="dte-input-hint">IOCL Highway Index</span>
            </div>
            <div className="dte-input-stepper-wrap">
              <span className="dte-input-prefix">%</span>
              <input
                type="number"
                step="0.5"
                value={tariffFuelSurcharge}
                onChange={e => setTariffFuelSurcharge(e.target.value)}
                className="dte-stepper-input"
              />
              <button type="button" onClick={() => stepFuel(-0.5)} className="dte-step-btn">-0.5%</button>
              <button type="button" onClick={() => stepFuel(+0.5)} className="dte-step-btn">+0.5%</button>
            </div>
          </div>

          <div className="dte-input-block">
            <div className="dte-input-label-row">
              <label className="dte-input-label">GST Freight Rate (%)</label>
              <span className="dte-input-hint">SAC 9965 Forward</span>
            </div>
            <div className="dte-input-stepper-wrap">
              <span className="dte-input-prefix">%</span>
              <input
                type="number"
                value={tariffGstPercent}
                onChange={e => setTariffGstPercent(e.target.value)}
                className="dte-stepper-input"
              />
            </div>
          </div>

          <div className="dte-input-block">
            <div className="dte-input-label-row">
              <label className="dte-input-label">Terminal Handling &amp; Toll Fee (Fixed)</label>
              <span className="dte-input-hint">Dock entry &amp; seal</span>
            </div>
            <div className="dte-input-stepper-wrap">
              <span className="dte-input-prefix">₹</span>
              <input
                type="number"
                step="50"
                value={tariffHandlingFee}
                onChange={e => setTariffHandlingFee(e.target.value)}
                className="dte-stepper-input"
              />
              <button type="button" onClick={() => stepHandling(-50)} className="dte-step-btn">-50</button>
              <button type="button" onClick={() => stepHandling(+50)} className="dte-step-btn">+50</button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. HIGH-VOLUME FREIGHT CORRIDORS TABLE */}
      <div className="dte-corridor-box">
        <div className="dte-corridor-header">
          <div>
            <h3 className="dte-corridor-title">
              <MapPin size={18} style={{ color: '#0284c7' }} />
              <span>National High-Volume Freight Corridors (Golden Quadrilateral)</span>
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              Real-time pre-calculated freight quotes on top arterial highways based on active tariff matrix. Click any route to load in Simulator.
            </p>
          </div>
        </div>

        <div className="dte-corridor-grid">
          {CORRIDORS.map(corridor => {
            const corridorFtl = Math.round(Math.max(corridor.km * ftlPerKm, ftlMinFloor));
            const corridorFtlTotal = Math.round((corridorFtl * (1 + fuelPct / 100) + handlingFee) * (1 + gstPct / 100));
            const corridorPtl = Math.round(Math.max((corridor.km * ptlPerKgKm * (500 / 100)), ptlMinFloor));
            const corridorPtlTotal = Math.round((corridorPtl * (1 + fuelPct / 100) + handlingFee) * (1 + gstPct / 100));

            return (
              <div
                key={corridor.id}
                className="dte-corridor-tile"
                onClick={() => {
                  setSimDistanceKm(corridor.km);
                  setSimWeightKg(corridor.defaultWeight);
                  setSelectedCorridorName(`${corridor.name} (${corridor.highway})`);
                  showToast(`Loaded ${corridor.name} (${corridor.km} KM) into Simulator!`);
                }}
                title={`Click to load ${corridor.name} into simulator`}
              >
                <div className="dte-corridor-route">
                  <span>{corridor.name}</span>
                  <span className="dte-corridor-km">{corridor.km} KM</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {corridor.highway} • <b>{corridor.transit}</b>
                </div>
                <div className="dte-corridor-pricing">
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 700 }}>FTL ({corridor.defaultWeight / 1000}T)</span>
                    <strong className="dte-corridor-ftl">₹{corridorFtlTotal.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 700 }}>PTL (500 Kg)</span>
                    <strong className="dte-corridor-ptl">₹{corridorPtlTotal.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. INTERACTIVE REAL-TIME TARIFF SIMULATOR & QUOTATION GENERATOR */}
      <div className="dte-sim-box">
        <div className="dte-sim-header">
          <div>
            <h3 className="dte-sim-title">
              <Sliders size={20} style={{ color: '#38bdf8' }} />
              <span>Real-Time Tariff Simulator &amp; Instant Quotation Studio</span>
            </h3>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '12.5px' }}>
              Simulate live client freight quotes, test rate elasticity, and generate client-ready rate breakdowns.
            </p>
          </div>
          <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '5px 12px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 800, border: '1px solid rgba(56, 189, 248, 0.4)' }}>
            ⚡ Live Interactive Preview
          </span>
        </div>

        {/* Sliders and Mode Switcher */}
        <div className="dte-sim-controls-grid">
          <div className="dte-sim-slider-block">
            <div className="dte-sim-slider-label">
              <span>Haulage Distance (KM):</span>
              <strong>{simDistanceKm} KM</strong>
            </div>
            <input
              type="range"
              min="50"
              max="3500"
              step="50"
              value={simDistanceKm}
              onChange={e => setSimDistanceKm(parseInt(e.target.value))}
              className="dte-sim-slider"
            />
            <div className="dte-preset-chips">
              {[250, 500, 1000, 1500, 2500].map(km => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setSimDistanceKm(km)}
                  className="dte-preset-chip"
                >
                  {km} KM
                </button>
              ))}
            </div>
          </div>

          <div className="dte-sim-slider-block">
            <div className="dte-sim-slider-label">
              <span>Consignment Weight (KG / Ton):</span>
              <strong>{simWeightKg} KG ({(simWeightKg / 1000).toFixed(1)}T)</strong>
            </div>
            <input
              type="range"
              min="100"
              max="30000"
              step="100"
              value={simWeightKg}
              onChange={e => setSimWeightKg(parseInt(e.target.value))}
              className="dte-sim-slider"
            />
            <div className="dte-preset-chips">
              {[
                { label: '500 KG', kg: 500 },
                { label: '2.5T (LTV)', kg: 2500 },
                { label: '9T (6-Wh)', kg: 9000 },
                { label: '16T (10-Wh)', kg: 16000 },
                { label: '25T (Trailer)', kg: 25000 }
              ].map(item => (
                <button
                  key={item.kg}
                  type="button"
                  onClick={() => setSimWeightKg(item.kg)}
                  className="dte-preset-chip"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="dte-sim-slider-block">
            <div className="dte-sim-slider-label">
              <span>Freight Service Tier:</span>
              <strong>{simService}</strong>
            </div>
            <div className="dte-service-tabs">
              <button
                type="button"
                onClick={() => setSimService('PTL')}
                className={`dte-service-tab ${simService === 'PTL' ? 'active' : ''}`}
              >
                📦 PTL Parcel
              </button>
              <button
                type="button"
                onClick={() => setSimService('FTL')}
                className={`dte-service-tab ${simService === 'FTL' ? 'active' : ''}`}
              >
                🚛 FTL Full Load
              </button>
              <button
                type="button"
                onClick={() => setSimService('Express')}
                className={`dte-service-tab ${simService === 'Express' ? 'active' : ''}`}
              >
                ⚡ Express Priority
              </button>
            </div>
          </div>
        </div>

        {/* Real-Time Result Receipt Card */}
        <div className="dte-sim-receipt">
          <div className="dte-receipt-row">
            <span>Base Haulage Freight ({simDistanceKm} KM × {simWeightKg} KG via {simService}):</span>
            <strong>₹{simBaseFreight.toLocaleString('en-IN')}</strong>
          </div>
          <div className="dte-receipt-row">
            <span>Diesel Fuel Surcharge ({fuelPct}% on Base):</span>
            <strong>₹{simFuelCharge.toLocaleString('en-IN')}</strong>
          </div>
          <div className="dte-receipt-row">
            <span>Terminal Dock Handling &amp; Electronic Seal Fee:</span>
            <strong>₹{simHandling.toLocaleString('en-IN')}</strong>
          </div>
          <div className="dte-receipt-row">
            <span>GST Road Transport SAC 9965 ({gstPct}% Forward Charge):</span>
            <strong>₹{simGst.toLocaleString('en-IN')}</strong>
          </div>
          <div className="dte-receipt-row total">
            <span className="dte-receipt-total-label">Total Calculated Client Freight Tariff:</span>
            <span className="dte-receipt-total-val">₹{simTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Simulator Actions */}
        <div className="dte-sim-actions">
          <button
            type="button"
            onClick={handleCopyQuotation}
            className="dte-btn-copy"
          >
            {copiedQuote ? <CheckCircle2 size={15} /> : <Copy size={15} />}
            <span>{copiedQuote ? 'Quotation Copied!' : 'Copy Official Quotation'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrintRateSlip}
            className="dte-btn-reset"
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            <Printer size={15} />
            <span>Print Rate Slip</span>
          </button>
        </div>
      </div>

      {/* OFFICIAL FREIGHT TARIFF & RATE QUOTATION SLIP MODAL */}
      {showRateSlipModal && (
        <div className="dte-rate-slip-overlay" onClick={() => setShowRateSlipModal(false)}>
          <div className="dte-rate-slip-modal-container" onClick={e => e.stopPropagation()}>
            {/* TOOLBAR (Screen Only) */}
            <div className="dte-slip-toolbar dte-no-print">
              <div className="dte-slip-toolbar-left">
                <FileText size={18} style={{ color: '#38bdf8' }} />
                <span>Official Commercial Freight Tariff &amp; Rate Quotation Slip</span>
              </div>
              <div className="dte-slip-toolbar-actions">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="dte-slip-btn-print"
                >
                  <Printer size={15} />
                  <span>Print Slip / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyQuotation}
                  className="dte-slip-btn-copy"
                >
                  <Copy size={15} />
                  <span>Copy Text Quote</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowRateSlipModal(false)}
                  className="dte-slip-btn-close"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* PRINTABLE SLIP SHEET (Visible on Screen & Strictly Formatted for Print) */}
            <div className="dte-rate-slip-sheet">
              {/* HEADER */}
              <div className="dte-slip-header">
                <div className="dte-slip-brand">
                  <div className="dte-slip-logo-badge">ASK</div>
                  <div>
                    <h2 className="dte-slip-company-name">ASK TRANSPORT GROUP</h2>
                    <div className="dte-slip-tagline">NATIONAL LOGISTICS &amp; HEAVY COMMERCIAL FLEET SUPPLY CHAIN</div>
                    <div className="dte-slip-subtext">Certified ISO 9001:2015 &bull; IBA Approved National Carrier &bull; AIS-140 GPS Telematics</div>
                  </div>
                </div>
                <div className="dte-slip-header-meta">
                  <div className="dte-slip-doc-badge">COMMERCIAL RATE QUOTATION</div>
                  <div className="dte-slip-meta-line"><strong>QUOTATION REF:</strong> {quoteRefId}</div>
                  <div className="dte-slip-meta-line"><strong>DATE:</strong> {todayStr}</div>
                  <div className="dte-slip-meta-line"><strong>VALID UNTIL:</strong> {validUntilStr}</div>
                </div>
              </div>

              <div className="dte-slip-divider" />

              {/* STATUTORY REGISTRATION ROW */}
              <div className="dte-slip-statutory-row">
                <div><strong>GSTIN:</strong> 27AABCA1234D1Z5</div>
                <div><strong>PAN:</strong> AABCA1234D</div>
                <div><strong>SAC CODE:</strong> 9965 (Goods Transport Agency)</div>
                <div><strong>IBA REG:</strong> ASK-IBA-2026-992</div>
                <div><strong>TOLL FREE:</strong> 1800-210-9999</div>
              </div>

              {/* CONSIGNMENT & ROUTE SPECIFICATIONS */}
              <div className="dte-slip-section-title">CONSIGNMENT &amp; ROUTE SPECIFICATIONS</div>
              <div className="dte-slip-specs-grid">
                <div className="dte-slip-spec-item">
                  <span className="dte-slip-spec-label">Freight Corridor / Route:</span>
                  <span className="dte-slip-spec-val">{selectedCorridorName || 'National Arterial Freight Corridor'}</span>
                </div>
                <div className="dte-slip-spec-item">
                  <span className="dte-slip-spec-label">Linehaul Highway Distance:</span>
                  <span className="dte-slip-spec-val">{simDistanceKm.toLocaleString('en-IN')} KM (Direct Highway Route)</span>
                </div>
                <div className="dte-slip-spec-item">
                  <span className="dte-slip-spec-label">Consignment Gross Weight:</span>
                  <span className="dte-slip-spec-val">{simWeightKg.toLocaleString('en-IN')} KG ({(simWeightKg / 1000).toFixed(2)} Metric Tons)</span>
                </div>
                <div className="dte-slip-spec-item">
                  <span className="dte-slip-spec-label">Freight Service Tier:</span>
                  <span className="dte-slip-spec-val">
                    {simService === 'FTL' ? 'Full Truckload (FTL Dedicated)' : simService === 'Express' ? 'Express Priority (Time-Critical)' : 'Part Truckload (PTL Parcel)'}
                  </span>
                </div>
                <div className="dte-slip-spec-item">
                  <span className="dte-slip-spec-label">Recommended Fleet Vehicle:</span>
                  <span className="dte-slip-spec-val">{getVehicleType(simWeightKg)}</span>
                </div>
                <div className="dte-slip-spec-item">
                  <span className="dte-slip-spec-label">Estimated Transit Turnaround:</span>
                  <span className="dte-slip-spec-val">{getTransitEstimate(simDistanceKm)}</span>
                </div>
              </div>

              {/* ITEMIZED COMMERCIAL FREIGHT TARIFF SCHEDULE */}
              <div className="dte-slip-section-title">ITEMIZED COMMERCIAL FREIGHT TARIFF SCHEDULE</div>
              <table className="dte-slip-table">
                <thead>
                  <tr>
                    <th style={{ width: '36px', textAlign: 'center' }}>#</th>
                    <th>Tariff Component &amp; Description</th>
                    <th>Basis / Applied Matrix Formula</th>
                    <th style={{ textAlign: 'right', width: '130px' }}>Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'center' }}>1</td>
                    <td>
                      <strong>Base Linehaul Freight Haulage</strong>
                      <div className="dte-slip-table-sub">Direct highway linehaul haulage across arterial toll corridors</div>
                    </td>
                    <td>
                      {simService === 'FTL'
                        ? `${simDistanceKm} KM @ ₹${ftlPerKm}/KM (Floor: ₹${ftlMinFloor.toLocaleString('en-IN')})`
                        : `${simDistanceKm} KM × ${simWeightKg} KG @ ₹${ptlPerKgKm}/KG-KM (Floor: ₹${ptlMinFloor})`}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{simBaseFreight.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center' }}>2</td>
                    <td>
                      <strong>Dynamic Fuel Adjustment Index (Diesel Surcharge)</strong>
                      <div className="dte-slip-table-sub">Index linked fuel surcharge aligned with national diesel benchmark</div>
                    </td>
                    <td>{fuelPct}% on Base Linehaul Freight</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{simFuelCharge.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center' }}>3</td>
                    <td>
                      <strong>Terminal Cargo Handling &amp; RFID Electronic Seal</strong>
                      <div className="dte-slip-table-sub">Dock handover, RFID tamper seal &amp; digital weighbridge slip</div>
                    </td>
                    <td>Standard Flat Terminal &amp; Gate Fee</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{simHandling.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="dte-slip-subtotal-row">
                    <td colSpan={3} style={{ textAlign: 'right' }}><strong>Taxable Base Freight Value (Subtotal):</strong></td>
                    <td style={{ textAlign: 'right' }}><strong>₹{simSubtotal.toLocaleString('en-IN')}</strong></td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center' }}>4</td>
                    <td>
                      <strong>Road Transport Goods &amp; Services Tax (SAC 9965)</strong>
                      <div className="dte-slip-table-sub">Statutory forward charge mechanism on freight transport services</div>
                    </td>
                    <td>GST @ {gstPct}% on Taxable Freight</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{simGst.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="dte-slip-total-row">
                    <td colSpan={3} style={{ textAlign: 'right' }}>
                      <span className="dte-slip-total-title">TOTAL ALL-INCLUSIVE FREIGHT TARIFF (NET PAYABLE):</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="dte-slip-total-amount">₹{simTotal.toLocaleString('en-IN')}</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* AMOUNT IN WORDS */}
              <div className="dte-slip-words-box">
                <span className="dte-slip-words-label">AMOUNT IN WORDS:</span>
                <span className="dte-slip-words-val">{numberToWordsINR(simTotal)}</span>
              </div>

              {/* TERMS & CONDITIONS */}
              <div className="dte-slip-terms-block">
                <div className="dte-slip-terms-title">COMMERCIAL TERMS &amp; OPERATIONAL SLA:</div>
                <ol className="dte-slip-terms-list">
                  <li><strong>Transit Tolls &amp; E-Way:</strong> Quoted tariff is inclusive of all National Highway arterial FASTag tolls and digital E-Way Bill documentation.</li>
                  <li><strong>Free Detention Allowance:</strong> 24 hours complimentary loading at origin and 24 hours unloading at destination bay. Post 24 hrs, standard detention fee of ₹1,500/day applies.</li>
                  <li><strong>Transit Protection:</strong> Consignments covered under standard carrier liability per Indian Carriage by Road Act 2007. Declared value transit cargo insurance optional.</li>
                  <li><strong>Telematics &amp; Live Tracking:</strong> 100% AIS-140 certified GPS telematics telemetry with automated milestone alerts via WhatsApp/SMS to consignor and consignee.</li>
                  <li><strong>Tariff Validity:</strong> Valid for 7 calendar days from issuance. Subject to dynamic diesel benchmark revisions exceeding &plusmn;5% within quotation window.</li>
                </ol>
              </div>

              {/* FOOTER: BARCODE & SIGNATURE */}
              <div className="dte-slip-footer">
                <div className="dte-slip-barcode-area">
                  <div className="dte-barcode-lines">
                    <div className="dte-bar-mock" />
                  </div>
                  <div className="dte-barcode-text">*{quoteRefId.replace(/[^A-Z0-9]/g, '')}*</div>
                  <div className="dte-barcode-sub">AUTHENTICATED DIGITAL RATE QUOTE &bull; ASK CENTRAL FREIGHT REGISTRY</div>
                </div>

                <div className="dte-slip-sign-area">
                  <div className="dte-seal-stamp">
                    <span className="dte-seal-inner">ASK TRANSPORT</span>
                    <span className="dte-seal-star">&starf; VERIFIED &starf;</span>
                  </div>
                  <div className="dte-sign-line" />
                  <div className="dte-sign-name">Authorized Commercial Signatory</div>
                  <div className="dte-sign-title">ASK Transport Group (India) &bull; Tariff Operations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicTariffEngine;
