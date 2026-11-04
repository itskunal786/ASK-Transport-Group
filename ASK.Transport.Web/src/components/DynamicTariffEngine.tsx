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
  Info
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
            onClick={() => window.print()}
            className="dte-btn-reset"
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            <Printer size={15} />
            <span>Print Rate Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicTariffEngine;
