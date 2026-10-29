import { useState } from 'react';

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

// ============================================================================
// INITIAL MOCK DATA
// ============================================================================

const INITIAL_BAYS: DockBayStatus[] = [
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
];

const INITIAL_GATE_PASSES: GatePassRecord[] = [
  {
    id: 'GP-REC-01',
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
    gateInTime: '29 Oct 2026, 04:15 PM',
    dockInTime: '29 Oct 2026, 04:32 PM',
    elapsedMinutes: 48,
    targetTatMinutes: 75,
    demurrageChargesInr: 0,
    securityGuardName: 'Prem Chand (Gate 1)',
    odometerReadingKm: 142850
  },
  {
    id: 'GP-REC-02',
    passNumber: 'GP-2026-9042',
    type: 'OUTBOUND_DISPATCH',
    vehicleNumber: 'DL-01-AJ-8829',
    driverName: 'Sardar Baldev Singh',
    driverPhone: '+91 97110 33882',
    transporterName: 'National Expressway Logistics',
    consignmentNo: 'ASK-LR-9925',
    materialType: 'Retail Footwear & Apparel',
    cargoWeightTon: 14.2,
    assignedBay: 'BAY-02',
    sealNumber: 'SEAL-ASK-99885',
    sealStatus: 'INTACT_VERIFIED',
    status: 'INSPECTION_PENDING',
    gateInTime: '29 Oct 2026, 03:40 PM',
    dockInTime: '29 Oct 2026, 03:55 PM',
    elapsedMinutes: 84,
    targetTatMinutes: 90,
    demurrageChargesInr: 0,
    securityGuardName: 'Devendra Kumar (Gate 2)',
    odometerReadingKm: 98420
  },
  {
    id: 'GP-REC-03',
    passNumber: 'GP-2026-9043',
    type: 'OUTBOUND_DISPATCH',
    vehicleNumber: 'HR-55-XY-1011',
    driverName: 'Mohd. Imran Khan',
    driverPhone: '+91 98960 77123',
    transporterName: 'Haryana Highway Lines',
    consignmentNo: 'ASK-LR-9930',
    materialType: 'Packaged FMCG Goods',
    cargoWeightTon: 21.0,
    assignedBay: 'BAY-03',
    sealNumber: 'SEAL-ASK-99890',
    sealStatus: 'INTACT_VERIFIED',
    status: 'DETENTION_WARNING',
    gateInTime: '29 Oct 2026, 03:05 PM',
    dockInTime: '29 Oct 2026, 03:25 PM',
    elapsedMinutes: 115,
    targetTatMinutes: 90,
    demurrageChargesInr: 1800,
    securityGuardName: 'Prem Chand (Gate 1)',
    odometerReadingKm: 218900
  },
  {
    id: 'GP-REC-04',
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
    gateInTime: '29 Oct 2026, 04:35 PM',
    dockInTime: '29 Oct 2026, 04:45 PM',
    elapsedMinutes: 28,
    targetTatMinutes: 60,
    demurrageChargesInr: 0,
    securityGuardName: 'Prem Chand (Gate 1)',
    odometerReadingKm: 76540
  },
  {
    id: 'GP-REC-05',
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
    gateInTime: '29 Oct 2026, 01:10 PM',
    dockInTime: '29 Oct 2026, 01:25 PM',
    gateOutTime: '29 Oct 2026, 02:40 PM',
    elapsedMinutes: 90,
    targetTatMinutes: 90,
    demurrageChargesInr: 0,
    securityGuardName: 'Devendra Kumar (Gate 2)',
    odometerReadingKm: 184300
  }
];

export default function DockYardGatePassManager() {
  const [bays, setBays] = useState<DockBayStatus[]>(INITIAL_BAYS);
  const [gatePasses, setGatePasses] = useState<GatePassRecord[]>(INITIAL_GATE_PASSES);
  const [selectedPass, setSelectedPass] = useState<GatePassRecord | null>(INITIAL_GATE_PASSES[0]);
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'ACTIVE_DOCKS' | 'DETENTION_ALERTS' | 'GATE_OUT'>('ALL');
  const [showNewGateInModal, setShowNewGateInModal] = useState<boolean>(false);
  const [showSlipPrintModal, setShowSlipPrintModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    const newPassNo = `GP-2026-${Math.floor(9045 + Math.random() * 50)}`;
    const newRecord: GatePassRecord = {
      id: `GP-REC-${Date.now()}`,
      passNumber: newPassNo,
      type: 'INBOUND_UNLOAD',
      vehicleNumber: newVehicle.toUpperCase().trim(),
      driverName: newDriver.trim(),
      driverPhone: newPhone.trim(),
      transporterName: newTransporter.trim(),
      consignmentNo: newConsignment.trim(),
      materialType: newMaterial.trim(),
      cargoWeightTon: Number(newWeight),
      assignedBay: newBay,
      sealNumber: newSealNo.trim(),
      sealStatus: 'INTACT_VERIFIED',
      status: 'DOCKED',
      gateInTime: 'Just Now',
      dockInTime: 'Just Now',
      elapsedMinutes: 0,
      targetTatMinutes: 75,
      demurrageChargesInr: 0,
      securityGuardName: 'Prem Chand (Gate 1)',
      odometerReadingKm: Number(newOdo)
    };

    setGatePasses([newRecord, ...gatePasses]);
    setSelectedPass(newRecord);

    // Update bay status
    setBays(prev =>
      prev.map(b =>
        b.bayId === newBay
          ? {
              ...b,
              status: 'OCCUPIED',
              activePassNumber: newPassNo,
              activeVehicle: newRecord.vehicleNumber,
              material: newRecord.materialType,
              progressPercent: 5,
              elapsedMinutes: 0
            }
          : b
      )
    );

    setShowNewGateInModal(false);
    showToast(`✅ Gate-In Pass ${newPassNo} generated! Vehicle assigned to ${newBay}`);
  };

  const handleExpediteDock = (passId: string) => {
    setGatePasses(prev =>
      prev.map(p => {
        if (p.id === passId) {
          return {
            ...p,
            status: 'LOADING_UNLOADING',
            elapsedMinutes: Math.min(p.elapsedMinutes, p.targetTatMinutes - 10),
            demurrageChargesInr: 0
          };
        }
        return p;
      })
    );
    showToast(`⚡ Dock Yard supervisor notified on walkie-talkie! Forklift expedited for ${selectedPass?.vehicleNumber}.`);
  };

  const handleGateOutRelease = (passId: string) => {
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setGatePasses(prev =>
      prev.map(p => {
        if (p.id === passId) {
          return {
            ...p,
            status: 'GATE_OUT_CLEARED',
            gateOutTime: `Today, ${nowTime}`
          };
        }
        return p;
      })
    );

    // Release bay
    if (selectedPass?.assignedBay) {
      setBays(prev =>
        prev.map(b =>
          b.bayId === selectedPass.assignedBay
            ? {
                ...b,
                status: 'AVAILABLE',
                activePassNumber: undefined,
                activeVehicle: undefined,
                material: undefined,
                progressPercent: 0,
                elapsedMinutes: 0
              }
            : b
        )
      );
    }

    if (selectedPass) {
      setSelectedPass({
        ...selectedPass,
        status: 'GATE_OUT_CLEARED',
        gateOutTime: `Today, ${nowTime}`
      });
    }

    showToast(`🚛 Vehicle ${selectedPass?.vehicleNumber} Gate-Out authorized! Digital exit barcode validated.`);
  };

  // Filtered passes
  const filteredPasses = gatePasses.filter(p => {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>
            <span>🏷️</span> HUB &amp; WAREHOUSE TERMINAL OPERATIONS
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Automated Gate Pass &amp; Dock Yard Management
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
            Digital QR Gate-In / Gate-Out inspection slips, live loading bay turnaround time (TAT) clocks, physical container seal integrity audits, and zero-detention alerts.
          </p>
        </div>

        {/* TOP CTA BUTTONS */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setShowNewGateInModal(true)}
            style={{
              padding: '11px 20px',
              borderRadius: '10px',
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)'
            }}
          >
            <span>➕</span> Generate Gate-In Entry Pass
          </button>
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

      {/* KPI METRICS OVERVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Active Bay Occupancy</span>
            <span style={{ fontSize: '18px' }}>🏗️</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
            4 / 6 Bays <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>(67% Active)</span>
          </div>
          <small style={{ fontSize: '11px', color: '#64748b' }}>2 Bays ready for immediate staging</small>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Average Yard TAT</span>
            <span style={{ fontSize: '18px' }}>⏱️</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#059669', marginTop: '6px' }}>
            68 Minutes <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>(-22m vs Target)</span>
          </div>
          <small style={{ fontSize: '11px', color: '#64748b' }}>Benchmark standard: &lt; 90 mins</small>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Detention Loss Prevented</span>
            <span style={{ fontSize: '18px' }}>🛡️</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0284c7', marginTop: '6px' }}>
            ₹84,500 <span style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1' }}>/ this Month</span>
          </div>
          <small style={{ fontSize: '11px', color: '#64748b' }}>1 truck currently in detention review</small>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Container Seal Integrity</span>
            <span style={{ fontSize: '18px' }}>🔒</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '6px' }}>
            100% Intact <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>Verified</span>
          </div>
          <small style={{ fontSize: '11px', color: '#64748b' }}>0 tamper breach incidents logged</small>
        </div>
      </div>

      {/* LIVE DOCK BAYS SCHEMATIC (BAYS 1 TO 6) */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '22px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
              🏭 Live Terminal Loading Bays (Hub-01 Pune Logistics Park)
            </h3>
            <small style={{ color: '#64748b', fontSize: '12px' }}>Visual real-time status of cargo docks, trailers docked, and turnaround countdown</small>
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Available
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }}></span> Loading/Unloading
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }}></span> Detention Warning
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {bays.map(bay => {
            const isDetention = bay.elapsedMinutes && bay.elapsedMinutes > bay.targetMinutes;
            const isAvailable = bay.status === 'AVAILABLE';

            return (
              <div
                key={bay.bayId}
                style={{
                  border: '1.5px solid',
                  borderColor: isDetention ? '#fca5a5' : isAvailable ? '#cbd5e1' : '#bae6fd',
                  background: isDetention ? '#fff1f2' : isAvailable ? '#f8fafc' : '#f0f9ff',
                  borderRadius: '12px',
                  padding: '14px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: isDetention ? '#b91c1c' : isAvailable ? '#64748b' : '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {bay.bayId} • {bay.type}
                    </span>
                    <h4 style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      {bay.bayName}
                    </h4>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: isDetention ? '#fee2e2' : isAvailable ? '#e2e8f0' : '#e0f2fe',
                      color: isDetention ? '#dc2626' : isAvailable ? '#475569' : '#0284c7'
                    }}
                  >
                    {isDetention ? '⚠️ Detention' : isAvailable ? '✓ Ready' : 'Active'}
                  </span>
                </div>

                {!isAvailable ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, marginTop: '8px' }}>
                      <span style={{ color: '#0f172a' }}>🚛 {bay.activeVehicle}</span>
                      <span style={{ color: '#64748b' }}>{bay.activePassNumber}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      📦 {bay.material}
                    </div>

                    {/* PROGRESS BAR & TAT */}
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                        <span style={{ color: '#64748b' }}>Dock Progress ({bay.progressPercent}%)</span>
                        <span style={{ color: isDetention ? '#dc2626' : '#0284c7' }}>
                          ⏱️ {bay.elapsedMinutes}m / {bay.targetMinutes}m TAT
                        </span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${bay.progressPercent}%`,
                            background: isDetention ? '#dc2626' : '#0284c7',
                            borderRadius: '3px'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '70px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <span style={{ fontSize: '20px' }}>🟢</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '4px' }}>Bay Vacant - Ready for Docking</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* GATE PASS MASTER TABLE & INSPECTION SPLIT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(360px, 1fr)', gap: '20px', alignItems: 'start' }}>
        {/* LEFT COLUMN: GATE PASSES DIRECTORY */}
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {/* TAB FILTERS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
              📋 Digital Gate Passes (Today's Yard Traffic)
            </h3>

            <div style={{ display: 'flex', gap: '6px' }}>
              {(['ALL', 'ACTIVE_DOCKS', 'DETENTION_ALERTS', 'GATE_OUT'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTabFilter(tab)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTabFilter === tab ? '#0f172a' : '#f1f5f9',
                    color: activeTabFilter === tab ? '#ffffff' : '#64748b'
                  }}
                >
                  {tab === 'ALL' && 'All Passes'}
                  {tab === 'ACTIVE_DOCKS' && 'Docked (3)'}
                  {tab === 'DETENTION_ALERTS' && 'Detention (1)'}
                  {tab === 'GATE_OUT' && 'Cleared'}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>PASS #</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>VEHICLE &amp; DRIVER</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>BAY &amp; CARGO</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>TAT STATUS</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800 }}>SEAL</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredPasses.map(pass => {
                  const isSelected = selectedPass?.id === pass.id;
                  const isDetention = pass.status === 'DETENTION_WARNING';

                  return (
                    <tr
                      key={pass.id}
                      onClick={() => setSelectedPass(pass)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '12px', fontWeight: 800, color: '#0f172a' }}>
                        <div>{pass.passNumber}</div>
                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>{pass.type}</span>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{pass.vehicleNumber}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{pass.driverName}</div>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 800, color: '#0284c7' }}>{pass.assignedBay}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pass.materialType} ({pass.cargoWeightTon}T)
                        </div>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            background: isDetention ? '#fee2e2' : pass.status === 'GATE_OUT_CLEARED' ? '#ecfdf5' : '#f0f9ff',
                            color: isDetention ? '#dc2626' : pass.status === 'GATE_OUT_CLEARED' ? '#059669' : '#0284c7'
                          }}
                        >
                          {isDetention ? `⚠️ ${pass.elapsedMinutes}m (Overdue)` : pass.status === 'GATE_OUT_CLEARED' ? '✓ Cleared' : `⏱️ ${pass.elapsedMinutes}m / ${pass.targetTatMinutes}m`}
                        </span>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: pass.sealStatus === 'INTACT_VERIFIED' ? '#ecfdf5' : '#fee2e2',
                            color: pass.sealStatus === 'INTACT_VERIFIED' ? '#059669' : '#dc2626'
                          }}
                        >
                          {pass.sealStatus === 'INTACT_VERIFIED' ? '🔒 Intact' : 'Tampered'}
                        </span>
                      </td>

                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPass(pass);
                            setShowSlipPrintModal(true);
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

        {/* RIGHT COLUMN: ACTIVE INSPECTION & GATE CONTROL SLIP */}
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '22px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {selectedPass ? (
            <div>
              {/* PASS HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    GATE PASS AUDIT &amp; CLEARANCE
                  </span>
                  <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                    {selectedPass.passNumber}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: selectedPass.status === 'GATE_OUT_CLEARED' ? '#ecfdf5' : selectedPass.status === 'DETENTION_WARNING' ? '#fee2e2' : '#e0f2fe',
                      color: selectedPass.status === 'GATE_OUT_CLEARED' ? '#059669' : selectedPass.status === 'DETENTION_WARNING' ? '#dc2626' : '#0284c7'
                    }}
                  >
                    {selectedPass.status.replace('_', ' ')}
                  </span>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                    {selectedPass.gateInTime}
                  </div>
                </div>
              </div>

              {/* QR CODE & VEHICLE DETAILS */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', background: '#f8fafc', padding: '14px', borderRadius: '12px', margin: '16px 0', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '64px', height: '64px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                  📱
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                    {selectedPass.vehicleNumber}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700 }}>
                    {selectedPass.driverName} • {selectedPass.driverPhone}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Transporter: {selectedPass.transporterName}
                  </div>
                </div>
              </div>

              {/* CONSIGNMENT & CONTAINER SEAL DETAILS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Consignment / LR</span>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedPass.consignmentNo}</div>
                  <small style={{ color: '#64748b' }}>{selectedPass.cargoWeightTon} Tonnes</small>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Container Seal ID</span>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedPass.sealNumber}</div>
                  <small style={{ color: '#059669', fontWeight: 700 }}>✓ Verified at Gate</small>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Dock Bay</span>
                  <div style={{ fontWeight: 800, color: '#0284c7' }}>{selectedPass.assignedBay}</div>
                  <small style={{ color: '#64748b' }}>Docked at {selectedPass.dockInTime || 'Waiting'}</small>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Odometer at Gate-In</span>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedPass.odometerReadingKm.toLocaleString('en-IN')} KM</div>
                  <small style={{ color: '#64748b' }}>Guard: {selectedPass.securityGuardName}</small>
                </div>
              </div>

              {/* TAT COUNTDOWN & DETENTION SECTION */}
              <div
                style={{
                  background: selectedPass.status === 'DETENTION_WARNING' ? '#fff1f2' : '#f0fdf4',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: selectedPass.status === 'DETENTION_WARNING' ? '#fecaca' : '#bbf7d0',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: selectedPass.status === 'DETENTION_WARNING' ? '#dc2626' : '#15803d' }}>
                    {selectedPass.status === 'DETENTION_WARNING' ? '⚠️ DETENTION CHARGES TRIGGERED' : '⏱️ TURNAROUND TIME (TAT) HEALTH'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: selectedPass.status === 'DETENTION_WARNING' ? '#dc2626' : '#15803d' }}>
                    {selectedPass.elapsedMinutes}m / {selectedPass.targetTatMinutes}m
                  </span>
                </div>
                {selectedPass.status === 'DETENTION_WARNING' ? (
                  <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: '#991b1b' }}>
                    Loading delayed by 25 mins. Auto-demurrage fine accrued: <strong>₹{selectedPass.demurrageChargesInr}</strong>.
                  </p>
                ) : (
                  <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: '#166534' }}>
                    Truck is operating comfortably within the 75-minute yard turnaround SLA.
                  </p>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedPass.status === 'DETENTION_WARNING' && (
                  <button
                    type="button"
                    onClick={() => handleExpediteDock(selectedPass.id)}
                    style={{
                      background: '#ea580c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>⚡</span> Expedite Unload &amp; Waive Detention
                  </button>
                )}

                {selectedPass.status !== 'GATE_OUT_CLEARED' && (
                  <button
                    type="button"
                    onClick={() => handleGateOutRelease(selectedPass.id)}
                    style={{
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🚪</span> Authorize Gate-Out Exit &amp; Print Slip
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowSlipPrintModal(true)}
                  style={{
                    background: '#f8fafc',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🖨️ View Official Digital Gate Pass Document
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Select a gate pass to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* NEW GATE-IN PASS MODAL */}
      {showNewGateInModal && (
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
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                🏷️ New Gate-In Entry Slip Generator
              </h3>
              <button
                type="button"
                onClick={() => setShowNewGateInModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGateIn} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newVehicle}
                    onChange={e => setNewVehicle(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Consignment / Bilty (LR) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newConsignment}
                    onChange={e => setNewConsignment(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDriver}
                    onChange={e => setNewDriver(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Driver Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Assigned Loading/Unloading Bay
                  </label>
                  <select
                    value={newBay}
                    onChange={e => setNewBay(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                  >
                    <option value="BAY-01">Bay 1 - Heavy Cargo Unload</option>
                    <option value="BAY-02">Bay 2 - Fast Express Cross-Dock</option>
                    <option value="BAY-03">Bay 3 - FMCG High Throughput</option>
                    <option value="BAY-04">Bay 4 - General Cargo Inbound (Vacant)</option>
                    <option value="BAY-05">Bay 5 - Reefer Cold-Chain Terminal</option>
                    <option value="BAY-06">Bay 6 - Staging &amp; Pre-Dispatch (Vacant)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Container Physical Seal No *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSealNo}
                    onChange={e => setNewSealNo(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Material Description
                  </label>
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={e => setNewMaterial(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Weight (Ton)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={e => setNewWeight(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Odometer (KM)
                  </label>
                  <input
                    type="number"
                    value={newOdo}
                    onChange={e => setNewOdo(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '11px', color: '#64748b' }}>
                🔒 Security Checklist: Driver sobriety checked, helmet worn, container seals intact, and fire extinguisher present.
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewGateInModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#f1f5f9', border: 'none', fontWeight: 700, cursor: 'pointer', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: '10px', borderRadius: '8px', background: '#059669', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  Confirm Gate-In &amp; Generate Barcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT SLIP MODAL */}
      {showSlipPrintModal && selectedPass && (
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
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              fontFamily: 'monospace'
            }}
          >
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900 }}>ASK TRANSPORT GROUP</div>
              <div style={{ fontSize: '11px' }}>HUB TERMINAL-01 PUNE LOGISTICS PARK</div>
              <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '4px' }}>OFFICIAL GATE IN/OUT PASS</div>
              <div style={{ fontSize: '11px' }}>PASS NO: {selectedPass.passNumber}</div>
            </div>

            <div style={{ padding: '16px 0', fontSize: '12px', lineHeight: '1.8', borderBottom: '2px dashed #000' }}>
              <div><strong>VEHICLE NO:</strong> {selectedPass.vehicleNumber}</div>
              <div><strong>DRIVER:</strong> {selectedPass.driverName} ({selectedPass.driverPhone})</div>
              <div><strong>TRANSPORTER:</strong> {selectedPass.transporterName}</div>
              <div><strong>BILTY / LR NO:</strong> {selectedPass.consignmentNo}</div>
              <div><strong>CARGO:</strong> {selectedPass.materialType} ({selectedPass.cargoWeightTon} Ton)</div>
              <div><strong>DOCK BAY:</strong> {selectedPass.assignedBay}</div>
              <div><strong>SEAL NO:</strong> {selectedPass.sealNumber} [VERIFIED INTACT]</div>
              <div><strong>ODOMETER:</strong> {selectedPass.odometerReadingKm} KM</div>
              <div><strong>GATE-IN:</strong> {selectedPass.gateInTime}</div>
              <div><strong>GATE-OUT:</strong> {selectedPass.gateOutTime || 'IN PROGRESS'}</div>
              <div><strong>GUARD:</strong> {selectedPass.securityGuardName}</div>
            </div>

            <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '2px dashed #000' }}>
              <div style={{ fontSize: '32px' }}>||| || ||||| |||| ||| ||</div>
              <div style={{ fontSize: '10px', marginTop: '4px' }}>*{selectedPass.passNumber}*</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowSlipPrintModal(false)}
                style={{ flex: 1, padding: '9px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowSlipPrintModal(false);
                }}
                style={{ flex: 1, padding: '9px', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                🖨️ Print Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
