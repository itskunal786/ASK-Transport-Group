import { useState, useEffect } from 'react';
import { getWeighbridgeSlips, authorizeCrossDockDeLoad } from '../api/weighbridgeApi';

// ============================================================================
// WEIGHBRIDGE & DHARAM KANTA TYPES & MODELS
// ============================================================================

export type VehicleAxleCategory = 
  | '2-AXLE_6WHEEL'    // GVW Limit: 18,500 KG (18.5T)
  | '3-AXLE_10WHEEL'   // GVW Limit: 28,000 KG (28.0T)
  | '4-AXLE_14WHEEL'   // GVW Limit: 35,000 KG (35.0T)
  | '5-AXLE_16WHEEL'   // GVW Limit: 43,500 KG (43.5T)
  | '6-AXLE_TRAILER';  // GVW Limit: 55,000 KG (55.0T)

export interface WeighbridgeSlipRecord {
  id: string;
  slipNumber: string;
  vehicleNumber: string;
  truckModel: string;
  axleCategory: VehicleAxleCategory;
  axleLabel: string;
  driverName: string;
  driverPhone: string;
  transporterName: string;
  consignmentNo: string;
  materialName: string;
  
  // Weight Telematics in KG
  tareWeightKg: number;      // Empty truck weight
  grossWeightKg: number;     // Loaded truck weight
  netCargoWeightKg: number;  // gross - tare
  permissibleGvwKg: number;  // Legal RTO limit under Section 113
  
  // Compliance & Overload Defense
  overloadKg: number;        // max(0, grossWeightKg - permissibleGvwKg)
  overloadPercent: number;
  status: 'LEGAL_COMPLIANT' | 'OVERLOAD_CRITICAL' | 'TARE_PENDING';
  potentialRtoFineInr: number; // ₹20,000 base + ₹2,000/ton
  gatePassLocked: boolean;
  
  // Audit stamps
  weighedAt: string;
  operatorName: string;
  calibrationCertificateId: string;
}

// ============================================================================
// MOCK DATA: REALISTIC INDIAN FLEET DHARAM KANTA SLIPS
// ============================================================================

const INITIAL_SLIPS: WeighbridgeSlipRecord[] = [
  {
    id: 'DK-REC-01',
    slipNumber: 'DK-2026-88291',
    vehicleNumber: 'MH-14-GH-6021',
    truckModel: 'Tata Signa 3523.T (4-Axle Rigid)',
    axleCategory: '4-AXLE_14WHEEL',
    axleLabel: '4-Axle (14-Wheeler)',
    driverName: 'Dilip Sawant',
    driverPhone: '+91 98230 44912',
    transporterName: 'ASK Dedicated Fleet',
    consignmentNo: 'ASK-LR-9921',
    materialName: 'Automobile Axles & Steel Billets',
    tareWeightKg: 11200,
    grossWeightKg: 34600,
    netCargoWeightKg: 23400,
    permissibleGvwKg: 35000,
    overloadKg: 0,
    overloadPercent: 0,
    status: 'LEGAL_COMPLIANT',
    potentialRtoFineInr: 0,
    gatePassLocked: false,
    weighedAt: '29 Oct 2026, 05:12 PM',
    operatorName: 'Sunil Jagtap (Scale Op 01)',
    calibrationCertificateId: 'W&M-GOVT-PN-2026-90'
  },
  {
    id: 'DK-REC-02',
    slipNumber: 'DK-2026-88292',
    vehicleNumber: 'RJ-14-TG-9901',
    truckModel: 'Ashok Leyland 4220 (5-Axle Rigid)',
    axleCategory: '5-AXLE_16WHEEL',
    axleLabel: '5-Axle (16-Wheeler)',
    driverName: 'Mukesh Choudhary',
    driverPhone: '+91 94140 88203',
    transporterName: 'Rajputana Roadways',
    consignmentNo: 'ASK-LR-9928',
    materialName: 'Marble Slabs & Ceramic Tiles',
    tareWeightKg: 12400,
    grossWeightKg: 46800,
    netCargoWeightKg: 34400,
    permissibleGvwKg: 43500,
    overloadKg: 3300,
    overloadPercent: 7.58,
    status: 'OVERLOAD_CRITICAL',
    potentialRtoFineInr: 28000, // ₹20k + 4 ton @ ₹2k
    gatePassLocked: true,
    weighedAt: '29 Oct 2026, 04:50 PM',
    operatorName: 'Sunil Jagtap (Scale Op 01)',
    calibrationCertificateId: 'W&M-GOVT-PN-2026-90'
  },
  {
    id: 'DK-REC-03',
    slipNumber: 'DK-2026-88293',
    vehicleNumber: 'KA-01-AJ-4102',
    truckModel: 'BharatBenz 2823R (3-Axle 10-Wheeler)',
    axleCategory: '3-AXLE_10WHEEL',
    axleLabel: '3-Axle (10-Wheeler)',
    driverName: 'Manjunath Reddy',
    driverPhone: '+91 98450 11980',
    transporterName: 'Deccan Cargo Movers',
    consignmentNo: 'ASK-LR-9932',
    materialName: 'Industrial Transformer Coils',
    tareWeightKg: 9800,
    grossWeightKg: 27850,
    netCargoWeightKg: 18050,
    permissibleGvwKg: 28000,
    overloadKg: 0,
    overloadPercent: 0,
    status: 'LEGAL_COMPLIANT',
    potentialRtoFineInr: 0,
    gatePassLocked: false,
    weighedAt: '29 Oct 2026, 04:20 PM',
    operatorName: 'Sunil Jagtap (Scale Op 01)',
    calibrationCertificateId: 'W&M-GOVT-PN-2026-90'
  },
  {
    id: 'DK-REC-04',
    slipNumber: 'DK-2026-88294',
    vehicleNumber: 'GJ-12-AZ-3301',
    truckModel: 'Eicher Pro 6055 (6-Axle 40ft Trailer)',
    axleCategory: '6-AXLE_TRAILER',
    axleLabel: '6-Axle Trailer (40ft)',
    driverName: 'Hasmukh Vaghela',
    driverPhone: '+91 98250 66710',
    transporterName: 'Gujarat Heavy Haulage',
    consignmentNo: 'ASK-LR-9937',
    materialName: 'Structural Steel Angles & Coils',
    tareWeightKg: 15400,
    grossWeightKg: 54100,
    netCargoWeightKg: 38700,
    permissibleGvwKg: 55000,
    overloadKg: 0,
    overloadPercent: 0,
    status: 'LEGAL_COMPLIANT',
    potentialRtoFineInr: 0,
    gatePassLocked: false,
    weighedAt: '29 Oct 2026, 03:45 PM',
    operatorName: 'Ravi Gaikwad (Scale Op 02)',
    calibrationCertificateId: 'W&M-GOVT-PN-2026-90'
  }
];

export default function ElectronicWeighbridgeDeck() {
  const [slips, setSlips] = useState<WeighbridgeSlipRecord[]>(INITIAL_SLIPS);
  const [selectedSlip, setSelectedSlip] = useState<WeighbridgeSlipRecord | null>(INITIAL_SLIPS[1]); // Default to the overloaded truck to demonstrate fine shield
  const [liveScaleReadingKg, setLiveScaleReadingKg] = useState<number>(34600);
  const [isScaleStabilized, setIsScaleStabilized] = useState<boolean>(true);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showCrossDockModal, setShowCrossDockModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    getWeighbridgeSlips().then(data => {
      if (data && data.length > 0) setSlips(data);
    }).catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------

  const handleSimulateWeighing = (truckPlate: string) => {
    setIsScaleStabilized(false);
    showToast(`⚖️ Truck ${truckPlate} rolling onto Dharam Kanta ramp... Reading load cell sensors.`);
    setTimeout(() => {
      const match = slips.find(s => s.vehicleNumber === truckPlate);
      if (match) {
        setLiveScaleReadingKg(match.grossWeightKg);
        setSelectedSlip(match);
      }
      setIsScaleStabilized(true);
      showToast(`✅ Scale stabilized at ${liveScaleReadingKg.toLocaleString('en-IN')} KG! Calibration verified.`);
    }, 1200);
  };

  const handleAuthorizeCrossDockDeload = (slipId: string) => {
    authorizeCrossDockDeLoad(slipId).catch(() => {});
    setSlips(prev =>
      prev.map(s => {
        if (s.id === slipId) {
          const newGross = s.permissibleGvwKg - 400; // Safe below limit
          const newNet = newGross - s.tareWeightKg;
          return {
            ...s,
            grossWeightKg: newGross,
            netCargoWeightKg: newNet,
            overloadKg: 0,
            overloadPercent: 0,
            status: 'LEGAL_COMPLIANT',
            potentialRtoFineInr: 0,
            gatePassLocked: false
          };
        }
        return s;
      })
    );

    if (selectedSlip?.id === slipId) {
      setSelectedSlip({
        ...selectedSlip,
        grossWeightKg: selectedSlip.permissibleGvwKg - 400,
        netCargoWeightKg: selectedSlip.permissibleGvwKg - 400 - selectedSlip.tareWeightKg,
        overloadKg: 0,
        overloadPercent: 0,
        status: 'LEGAL_COMPLIANT',
        potentialRtoFineInr: 0,
        gatePassLocked: false
      });
      setLiveScaleReadingKg(selectedSlip.permissibleGvwKg - 400);
    }

    setShowCrossDockModal(false);
    showToast(`🛡️ Forklift cross-dock completed! 3.3 Tonnes de-loaded to Hub Bay-4. RTO Overload fine ₹28,000 saved! Gate-Out pass unlocked.`);
  };

  const totalOverloadFinesShielded = slips.reduce((sum, s) => sum + (s.status === 'OVERLOAD_CRITICAL' ? s.potentialRtoFineInr : 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px -5px rgba(28, 25, 23, 0.4)'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>
            <span>⚖️</span> HUB WEIGHBRIDGE &amp; RTO COMPLIANCE SHIELD
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Electronic Weighbridge (Dharam Kanta) &amp; Overload Shield
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#d6d3d1', lineHeight: 1.5 }}>
            Govt calibrated digital load-cell telemetry, Gross / Tare / Net cargo validation, Motor Vehicles Act 1988 (Sec 113/194) permissible axle load limits, and automated exit gate-locks.
          </p>
        </div>

        {/* TOP STATUS */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#a8a29e', textTransform: 'uppercase', fontWeight: 700 }}>Scale Calibration</span>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#4ade80', marginTop: '2px' }}>✓ W&amp;M Govt Certified</div>
          </div>
        </div>
      </div>

      {/* TOAST ALERT */}
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

      {/* KPI STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Overload Fine Shielded</span>
            <span style={{ fontSize: '18px' }}>🛡️</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#dc2626', marginTop: '6px' }}>
            ₹{totalOverloadFinesShielded.toLocaleString('en-IN')} <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444' }}>Fine Prevented</span>
          </div>
          <small style={{ fontSize: '11px', color: '#64748b' }}>Sec 194 MV Act: ₹20k base + ₹2k/T</small>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Today's Total Tonnage Weighed</span>
            <span style={{ fontSize: '18px' }}>⚖️</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
            163.4 Tonnes
          </div>
          <small style={{ fontSize: '11px', color: '#64748b' }}>4 Trucks completed • 1 on ramp</small>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>RTO Compliance Ratio</span>
            <span style={{ fontSize: '18px' }}>📋</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '6px' }}>
            75% First-Pass
          </div>
          <small style={{ fontSize: '11px', color: '#64748b' }}>1 Overload blocked at Hub ramp</small>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Scale Accuracy &amp; Drift</span>
            <span style={{ fontSize: '18px' }}>🎯</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0284c7', marginTop: '6px' }}>
            ±0.02% Error
          </div>
          <small style={{ fontSize: '11px', color: '#64748b' }}>Legal limit allowed: ±0.1%</small>
        </div>
      </div>

      {/* LIVE WEIGHBRIDGE ELECTRONIC SCALE PLATFORM */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: 'var(--text-primary, #0f172a)' }}>
              📟 Live Weighbridge Digital Console (Hub-01 Pune Scale Ramp)
            </h3>
            <small style={{ color: '#64748b', fontSize: '12px' }}>Real-time 60-Ton electronic pitless scale terminal with Avery Weigh-Tronix load cell interface</small>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {slips.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSimulateWeighing(s.vehicleNumber)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedSlip?.vehicleNumber === s.vehicleNumber ? '#0f172a' : '#cbd5e1',
                  background: selectedSlip?.vehicleNumber === s.vehicleNumber ? '#0f172a' : '#f8fafc',
                  color: selectedSlip?.vehicleNumber === s.vehicleNumber ? '#ffffff' : '#334155'
                }}
              >
                🚛 {s.vehicleNumber}
              </button>
            ))}
          </div>
        </div>

        {/* SCALE HARDWARE LED DISPLAY SIMULATOR */}
        <div
          style={{
            background: '#09090b',
            borderRadius: '14px',
            padding: '24px',
            color: '#22c55e',
            fontFamily: 'monospace',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8)'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#a1a1aa', letterSpacing: '1px' }}>
              ELECTRONIC WEIGH SCALE • STATION #01 PUNE
            </div>
            <div style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '2px', color: isScaleStabilized ? '#22c55e' : '#f59e0b', marginTop: '4px' }}>
              {liveScaleReadingKg.toLocaleString('en-IN')} <span style={{ fontSize: '20px' }}>KG</span>
            </div>
            <div style={{ fontSize: '13px', color: '#e4e4e7', display: 'flex', gap: '14px', marginTop: '4px' }}>
              <span>STATUS: {isScaleStabilized ? 'STABILIZED (✓)' : 'WEIGHING IN PROGRESS...'}</span>
              <span>TARE: {selectedSlip ? `${selectedSlip.tareWeightKg} KG` : 'N/A'}</span>
              <span>NET: {selectedSlip ? `${selectedSlip.netCargoWeightKg} KG` : 'N/A'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
            <div style={{ background: '#18181b', padding: '10px 14px', borderRadius: '8px', border: '1px solid #27272a' }}>
              <div style={{ fontSize: '10px', color: '#a1a1aa' }}>ON-RAMP VEHICLE:</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                {selectedSlip ? selectedSlip.vehicleNumber : 'NO VEHICLE ON SCALE'}
              </div>
              <div style={{ fontSize: '11px', color: '#71717a' }}>{selectedSlip?.truckModel}</div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => selectedSlip && handleSimulateWeighing(selectedSlip.vehicleNumber)}
                style={{ flex: 1, padding: '8px', background: '#27272a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
              >
                🔄 Re-Zero / Tare
              </button>
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                style={{ flex: 1, padding: '8px', background: '#22c55e', color: '#000000', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
              >
                🖨️ Print Slip
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE OF SLIPS & RTO AXLE LOAD AUDIT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(360px, 1fr)', gap: '20px', alignItems: 'start' }}>
        {/* SLIPS TABLE */}
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
              📑 Dharam Kanta Weighment Ledger
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Govt Sec 113 / 194 MV Act</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>SLIP NO</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>VEHICLE &amp; AXLE</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>GROSS / PERMISSIBLE</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>NET CARGO</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>COMPLIANCE</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {slips.map(slip => {
                  const isSelected = selectedSlip?.id === slip.id;
                  const isOverload = slip.status === 'OVERLOAD_CRITICAL';

                  return (
                    <tr
                      key={slip.id}
                      onClick={() => setSelectedSlip(slip)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '12px', fontWeight: 800, color: '#0f172a' }}>
                        <div>{slip.slipNumber}</div>
                        <small style={{ color: '#64748b' }}>{slip.weighedAt.split(',')[1]}</small>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{slip.vehicleNumber}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{slip.axleLabel}</div>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 800, color: isOverload ? '#dc2626' : '#0f172a' }}>
                          {(slip.grossWeightKg / 1000).toFixed(1)}T Gross
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Limit: {(slip.permissibleGvwKg / 1000).toFixed(1)}T
                        </div>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 800, color: '#059669' }}>
                          {(slip.netCargoWeightKg / 1000).toFixed(1)}T Net
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Tare: {(slip.tareWeightKg / 1000).toFixed(1)}T
                        </div>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            background: isOverload ? '#fee2e2' : '#ecfdf5',
                            color: isOverload ? '#dc2626' : '#059669',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isOverload ? `🚨 +${(slip.overloadKg / 1000).toFixed(1)}T Overload` : '✓ Legal Compliant'}
                        </span>
                      </td>

                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSlip(slip);
                            setShowPrintModal(true);
                          }}
                          style={{
                            background: '#f1f5f9',
                            color: '#0f172a',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          🖨️ Slip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: OVERLOAD SHIELD & GATE INTERLOCK */}
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '22px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {selectedSlip ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    AXLE LOAD &amp; PENALTY SHIELD
                  </span>
                  <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                    {selectedSlip.vehicleNumber}
                  </h3>
                </div>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    background: selectedSlip.status === 'OVERLOAD_CRITICAL' ? '#fee2e2' : '#ecfdf5',
                    color: selectedSlip.status === 'OVERLOAD_CRITICAL' ? '#dc2626' : '#059669'
                  }}
                >
                  {selectedSlip.status === 'OVERLOAD_CRITICAL' ? '🚨 EXIT LOCKED' : '✓ EXIT CLEARED'}
                </span>
              </div>

              {/* OVERLOAD ALERT BOX */}
              {selectedSlip.status === 'OVERLOAD_CRITICAL' ? (
                <div style={{ background: '#fff1f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '16px', margin: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: '#b91c1c' }}>
                      ⚠️ RTO MOTOR VEHICLE ACT OVERLOAD ALERT
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#b91c1c' }}>
                      +{selectedSlip.overloadKg} KG (+{selectedSlip.overloadPercent}%)
                    </span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#991b1b', lineHeight: 1.5 }}>
                    This vehicle exceeds the permissible Gross Vehicle Weight of {(selectedSlip.permissibleGvwKg / 1000).toFixed(1)}T by <strong>{(selectedSlip.overloadKg / 1000).toFixed(1)} Tonnes</strong>.
                  </p>

                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #fecdd3', marginTop: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>POTENTIAL RTO CHALLAN IF DISPATCHED:</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#dc2626', marginTop: '2px' }}>
                      ₹{selectedSlip.potentialRtoFineInr.toLocaleString('en-IN')} Fine
                    </div>
                    <div style={{ fontSize: '10px', color: '#71717a' }}>
                      Calculation: Section 194 MV Act ₹20,000 Base Penalty + ₹2,000/Tonne excess
                    </div>
                  </div>

                  <div style={{ marginTop: '14px' }}>
                    <button
                      type="button"
                      onClick={() => setShowCrossDockModal(true)}
                      style={{
                        width: '100%',
                        background: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '11px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>🚜</span> Authorize Forklift Cross-Dock De-Load
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '16px', margin: '16px 0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 900, color: '#166534' }}>
                    ✓ 100% LEGAL &amp; AXLE COMPLIANT
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#15803d' }}>
                    Gross weight is {selectedSlip.permissibleGvwKg - selectedSlip.grossWeightKg} KG safely under the legal permissible limit. Digital Gate-Out pass unlocked.
                  </p>
                </div>
              )}

              {/* WEIGHT BREAKDOWN GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Gross Weight (Loaded)</span>
                  <div style={{ fontWeight: 900, fontSize: '16px', color: '#0f172a' }}>{selectedSlip.grossWeightKg.toLocaleString('en-IN')} KG</div>
                  <small style={{ color: '#64748b' }}>{(selectedSlip.grossWeightKg / 1000).toFixed(2)} Ton</small>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Tare Weight (Unloaded)</span>
                  <div style={{ fontWeight: 900, fontSize: '16px', color: '#0f172a' }}>{selectedSlip.tareWeightKg.toLocaleString('en-IN')} KG</div>
                  <small style={{ color: '#64748b' }}>{(selectedSlip.tareWeightKg / 1000).toFixed(2)} Ton</small>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Net Cargo Pay-Load</span>
                  <div style={{ fontWeight: 900, fontSize: '16px', color: '#059669' }}>{selectedSlip.netCargoWeightKg.toLocaleString('en-IN')} KG</div>
                  <small style={{ color: '#059669', fontWeight: 700 }}>{(selectedSlip.netCargoWeightKg / 1000).toFixed(2)} Ton</small>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>RTO Legal GVW Cap</span>
                  <div style={{ fontWeight: 900, fontSize: '16px', color: '#0284c7' }}>{selectedSlip.permissibleGvwKg.toLocaleString('en-IN')} KG</div>
                  <small style={{ color: '#64748b' }}>{(selectedSlip.permissibleGvwKg / 1000).toFixed(2)} Ton Max</small>
                </div>
              </div>

              {/* RTO AXLE REGULATIONS INFO */}
              <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b' }}>
                <div style={{ fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  📜 Govt of India Gazette Notification S.O. 3467(E) Max Axle Norms:
                </div>
                • 2-Axle (18.5T) | 3-Axle (28T) | 4-Axle (35T) | 5-Axle (43.5T) | 6-Axle Trailer (55T).
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Select a weighment slip to audit compliance.
            </div>
          )}
        </div>
      </div>

      {/* CROSS DOCK DE-LOAD MODAL */}
      {showCrossDockModal && selectedSlip && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#dc2626' }}>
                🚜 Cross-Dock Cargo De-Load Interlock
              </h3>
              <button
                type="button"
                onClick={() => setShowCrossDockModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
              Vehicle <strong>{selectedSlip.vehicleNumber}</strong> has <strong>{selectedSlip.overloadKg} KG</strong> excess cargo.
              Dispatching forklift team to transfer {(selectedSlip.overloadKg / 1000).toFixed(1)} Tonnes of {selectedSlip.materialName} to <strong>Hub Bay-4 (Cross-dock staging)</strong> for next scheduled convoy.
            </p>

            <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '10px', border: '1px solid #fecaca', margin: '14px 0', fontSize: '12px' }}>
              <strong>Fine Shield Impact:</strong> Prevents <strong>₹{selectedSlip.potentialRtoFineInr.toLocaleString('en-IN')}</strong> penalty and vehicle seizure at Maharashtra-Gujarat RTO highway check-post.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCrossDockModal(false)}
                style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: '#475569' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAuthorizeCrossDockDeload(selectedSlip.id)}
                style={{ flex: 2, padding: '10px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
              >
                Confirm Cross-Dock &amp; Unlock Gate-Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT OFFICIAL DHARAM KANTA SLIP MODAL */}
      {showPrintModal && selectedSlip && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              fontFamily: 'monospace'
            }}
          >
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900 }}>ASK DHARAM KANTA • धर्म कांटा</div>
              <div style={{ fontSize: '11px' }}>HUB TERMINAL-01 PUNE (GOVT APPROVED 60-TON SCALE)</div>
              <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '4px' }}>COMPUTERIZED WEIGHMENT CERTIFICATE</div>
              <div style={{ fontSize: '11px' }}>SLIP NO: {selectedSlip.slipNumber} • CALIB ID: {selectedSlip.calibrationCertificateId}</div>
            </div>

            <div style={{ padding: '16px 0', fontSize: '12px', lineHeight: '1.8', borderBottom: '2px dashed #000' }}>
              <div><strong>TRUCK NO:</strong> {selectedSlip.vehicleNumber} ({selectedSlip.axleLabel})</div>
              <div><strong>DRIVER:</strong> {selectedSlip.driverName} ({selectedSlip.driverPhone})</div>
              <div><strong>CONSIGNMENT / BILTY:</strong> {selectedSlip.consignmentNo}</div>
              <div><strong>COMMODITY:</strong> {selectedSlip.materialName}</div>
              <div><strong>TIMESTAMP:</strong> {selectedSlip.weighedAt}</div>
              <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '8px 0' }} />
              <div style={{ fontSize: '14px' }}><strong>GROSS WEIGHT:</strong> {selectedSlip.grossWeightKg.toLocaleString('en-IN')} KG</div>
              <div style={{ fontSize: '14px' }}><strong>TARE WEIGHT:</strong> {selectedSlip.tareWeightKg.toLocaleString('en-IN')} KG</div>
              <div style={{ fontSize: '15px', color: '#000', fontWeight: 900 }}>
                <strong>NET CARGO WEIGHT:</strong> {selectedSlip.netCargoWeightKg.toLocaleString('en-IN')} KG ({(selectedSlip.netCargoWeightKg / 1000).toFixed(2)} Ton)
              </div>
              <div style={{ fontSize: '11px' }}>PERMISSIBLE GVW: {selectedSlip.permissibleGvwKg.toLocaleString('en-IN')} KG (Sec 113 MV Act)</div>
              <div style={{ fontSize: '12px', fontWeight: 800 }}>
                STATUS: {selectedSlip.status === 'OVERLOAD_CRITICAL' ? '🚨 OVERLOAD EXCEEDED' : '✓ LEGAL COMPLIANT'}
              </div>
              <div><strong>SCALE OPERATOR:</strong> {selectedSlip.operatorName}</div>
            </div>

            <div style={{ textAlign: 'center', padding: '12px 0', borderBottom: '2px dashed #000', fontSize: '10px' }}>
              [ SEAL OF ACCREDITATION: WEIGHTS &amp; MEASURES DEPT MAHARASHTRA ]
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                style={{ flex: 1, padding: '9px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                style={{ flex: 1, padding: '9px', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                🖨️ Print Dharam Kanta Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
