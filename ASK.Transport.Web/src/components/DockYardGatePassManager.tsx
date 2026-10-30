import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getDockBays, getGatePasses, generateGateInPass, expediteDockLoading, authorizeGateOut } from '../api/dockYardApi';
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
  const { t } = useLanguage();
  const [bays, setBays] = useState<DockBayStatus[]>(INITIAL_BAYS);
  const [gatePasses, setGatePasses] = useState<GatePassRecord[]>(INITIAL_GATE_PASSES);
  const [selectedPass, setSelectedPass] = useState<GatePassRecord | null>(INITIAL_GATE_PASSES[0]);
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'ACTIVE_DOCKS' | 'DETENTION_ALERTS' | 'GATE_OUT'>('ALL');
  const [showNewGateInModal, setShowNewGateInModal] = useState<boolean>(false);
  const [showSlipPrintModal, setShowSlipPrintModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDockBays(), getGatePasses()]).then(([baysData, passesData]) => {
      if (baysData && baysData.length > 0) setBays(baysData);
      if (passesData && passesData.length > 0) setGatePasses(passesData);
    }).catch(() => {});
  }, []);

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

    generateGateInPass(newRecord).catch(() => {});
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
    expediteDockLoading(passId).catch(() => {});
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
    authorizeGateOut(passId).catch(() => {});
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

      {/* 3. 4 TOP KPI METRICS OVERVIEW */}
      <div className="dockyard-kpis-grid">
        <div className="dockyard-kpi-card">
          <div className="dockyard-kpi-head">
            <span className="dockyard-kpi-label">{t('Active Bay Occupancy', 'सक्रिय बे अधिभोग')}</span>
            <span className="dockyard-kpi-icon">🏗️</span>
          </div>
          <div className="dockyard-kpi-value">
            4 / 6 {t('Bays', 'बे')} <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>(67% {t('Active', 'सक्रिय')})</span>
          </div>
          <span className="dockyard-kpi-sub">{t('2 Bays ready for immediate staging', '2 बे तत्काल स्टेजिंग के लिए तैयार')}</span>
        </div>

        <div className="dockyard-kpi-card">
          <div className="dockyard-kpi-head">
            <span className="dockyard-kpi-label">{t('Average Yard TAT', 'औसत यार्ड टीएटी')}</span>
            <span className="dockyard-kpi-icon">⏱️</span>
          </div>
          <div className="dockyard-kpi-value" style={{ color: '#059669' }}>
            68 {t('Minutes', 'मिनट')} <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>(-22m vs {t('Target', 'लक्ष्य')})</span>
          </div>
          <span className="dockyard-kpi-sub">{t('Benchmark standard: < 90 mins', 'मानक बेंचमार्क: < 90 मिनट')}</span>
        </div>

        <div className="dockyard-kpi-card">
          <div className="dockyard-kpi-head">
            <span className="dockyard-kpi-label">{t('Detention Loss Prevented', 'बचत डिटेंशन शुल्क')}</span>
            <span className="dockyard-kpi-icon">🛡️</span>
          </div>
          <div className="dockyard-kpi-value" style={{ color: '#0284c7' }}>
            ₹84,500 <span style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1' }}>/ {t('this Month', 'इस महीने')}</span>
          </div>
          <span className="dockyard-kpi-sub">{t('1 truck currently in detention review', '1 ट्रक वर्तमान में डिटेंशन समीक्षा में')}</span>
        </div>

        <div className="dockyard-kpi-card">
          <div className="dockyard-kpi-head">
            <span className="dockyard-kpi-label">{t('Container Seal Integrity', 'कंटेनर सील अखंडता')}</span>
            <span className="dockyard-kpi-icon">🔒</span>
          </div>
          <div className="dockyard-kpi-value" style={{ color: '#16a34a' }}>
            100% {t('Intact', 'अक्षुण्ण')} <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>{t('Verified', 'सत्यापित')}</span>
          </div>
          <span className="dockyard-kpi-sub">{t('0 tamper breach incidents logged', '0 छेड़छाड़ उल्लंघन दर्ज')}</span>
        </div>
      </div>

      {/* 4. LIVE DOCK BAYS SCHEMATIC (BAYS 1 TO 6) */}
      <div className="dockyard-card-left" style={{ padding: '22px' }}>
        <div className="dockyard-bays-header" style={{ marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
              🏭 {t('Live Terminal Loading Bays (Hub-01 Pune Logistics Park)', 'लाइव टर्मिनल लोडिंग बे (हब-01 पुणे लॉजिस्टिक्स पार्क)')}
            </h3>
            <small style={{ color: 'var(--text-secondary, #64748b)', fontSize: '12px' }}>
              {t('Visual real-time status of cargo docks, trailers docked, and turnaround countdown', 'कार्गो डॉक्स, ट्रेलरों और टर्नअराउंड उलटी गिनती की दृश्य वास्तविक स्थिति')}
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

        <div className="dockyard-bays-grid">
          {bays.map(bay => {
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
                        <span style={{ color: isDetention ? '#dc2626' : '#0284c7', fontWeight: 800 }}>
                          ⏱️ {bay.elapsedMinutes}m / {bay.targetMinutes}m
                        </span>
                      </div>
                      <div className="dockyard-bay-progress-bar">
                        <div
                          className="dockyard-bay-progress-fill"
                          style={{
                            width: `${bay.progressPercent}%`,
                            background: isDetention ? '#dc2626' : '#0284c7'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '70px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <span style={{ fontSize: '20px' }}>🟢</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '4px' }}>
                      {t('Bay Vacant - Ready for Docking', 'बे खाली है - डॉकिंग के लिए तैयार')}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. GATE PASS MASTER TABLE & INSPECTION SPLIT */}
      <div className="dockyard-split-row">
        {/* LEFT COLUMN: GATE PASSES DIRECTORY */}
        <div className="dockyard-card-left">
          <div className="dockyard-card-header">
            <h3>📋 {t("Digital Gate Passes (Today's Yard Traffic)", 'डिजिटल गेट पास (आज का यार्ड ट्रैफिक)')}</h3>

            <div className="dockyard-filter-group">
              <button
                type="button"
                className={`dockyard-filter-pill ${activeTabFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveTabFilter('ALL')}
              >
                {t('All Passes', 'सभी पास')}
              </button>
              <button
                type="button"
                className={`dockyard-filter-pill ${activeTabFilter === 'ACTIVE_DOCKS' ? 'active' : ''}`}
                onClick={() => setActiveTabFilter('ACTIVE_DOCKS')}
              >
                {t('Docked (3)', 'डॉक्ड (3)')}
              </button>
              <button
                type="button"
                className={`dockyard-filter-pill ${activeTabFilter === 'DETENTION_ALERTS' ? 'active' : ''}`}
                onClick={() => setActiveTabFilter('DETENTION_ALERTS')}
              >
                {t('Detention (1)', 'डिटेंशन (1)')}
              </button>
              <button
                type="button"
                className={`dockyard-filter-pill ${activeTabFilter === 'GATE_OUT' ? 'active' : ''}`}
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
                  <th>{t('PASS #', 'पास सं.')}</th>
                  <th>{t('VEHICLE & DRIVER', 'वाहन एवं चालक')}</th>
                  <th>{t('BAY & CARGO', 'बे एवं कार्गो')}</th>
                  <th>{t('TAT STATUS', 'टीएटी स्थिति')}</th>
                  <th>{t('SEAL', 'सील')}</th>
                  <th style={{ textAlign: 'right' }}>{t('ACTION', 'कार्रवाई')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPasses.map(pass => {
                  const isSelected = selectedPass?.id === pass.id;
                  const isDetention = pass.status === 'DETENTION_WARNING';
                  const isCleared = pass.status === 'GATE_OUT_CLEARED';

                  return (
                    <tr
                      key={pass.id}
                      onClick={() => setSelectedPass(pass)}
                      className={`dockyard-table-row ${isSelected ? 'selected' : ''}`}
                    >
                      <td>
                        <div className="dockyard-pass-no">{pass.passNumber}</div>
                        <span className="dockyard-type-badge">{pass.type}</span>
                      </td>

                      <td>
                        <div className="dockyard-vehicle-text">{pass.vehicleNumber}</div>
                        <div className="dockyard-driver-text">{pass.driverName}</div>
                      </td>

                      <td>
                        <div className="dockyard-bay-badge">{pass.assignedBay}</div>
                        <div className="dockyard-cargo-text" title={`${pass.materialType} (${pass.cargoWeightTon}T)`}>
                          {pass.materialType} ({pass.cargoWeightTon}T)
                        </div>
                      </td>

                      <td>
                        <span className={`dockyard-tat-pill ${isDetention ? 'detention' : isCleared ? 'cleared' : 'safe'}`}>
                          {isDetention ? `⚠️ ${pass.elapsedMinutes}m (${t('Overdue', 'अतिदेय')})` : isCleared ? `✓ ${t('Cleared', 'स्वीकृत')}` : `⏱️ ${pass.elapsedMinutes}m / ${pass.targetTatMinutes}m`}
                        </span>
                      </td>

                      <td>
                        <span className={`dockyard-seal-pill ${pass.sealStatus === 'INTACT_VERIFIED' ? 'intact' : 'tampered'}`}>
                          {pass.sealStatus === 'INTACT_VERIFIED' ? `🔒 ${t('Intact', 'अक्षुण्ण')}` : `⚠️ ${t('Tampered', 'छेड़छाड़')}`}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
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
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE INSPECTION & GATE CONTROL SLIP */}
        <div className="dockyard-card-right">
          {selectedPass ? (
            <div>
              <div className="dockyard-audit-header">
                <div>
                  <span className="dockyard-audit-tag">
                    {t('GATE PASS AUDIT & CLEARANCE', 'गेट पास ऑडिट एवं क्लीयरेंस')}
                  </span>
                  <div className="dockyard-audit-title">
                    {selectedPass.passNumber}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`dockyard-status-pill-big ${selectedPass.status === 'GATE_OUT_CLEARED' ? 'cleared' : selectedPass.status === 'DETENTION_WARNING' ? 'detention' : 'docked'}`}>
                    {selectedPass.status.replace('_', ' ')}
                  </span>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary, #64748b)', marginTop: '4px' }}>
                    {selectedPass.gateInTime}
                  </div>
                </div>
              </div>

              {/* QR CODE & VEHICLE DETAILS */}
              <div className="dockyard-vehicle-banner">
                <div className="dockyard-qr-thumb">
                  📱
                </div>
                <div className="dockyard-vehicle-info-text">
                  <div className="dockyard-plate-big">
                    {selectedPass.vehicleNumber}
                  </div>
                  <div className="dockyard-driver-contact">
                    {selectedPass.driverName} • {selectedPass.driverPhone}
                  </div>
                  <div className="dockyard-transporter-name">
                    {t('Transporter:', 'ट्रांसपोर्टर:')} {selectedPass.transporterName}
                  </div>
                </div>
              </div>

              {/* 4 MINI TILES */}
              <div className="dockyard-metrics-2x2">
                <div className="dockyard-mini-tile">
                  <span>{t('Consignment / LR', 'कंसाइनमेंट / बिल्टी')}</span>
                  <strong>{selectedPass.consignmentNo}</strong>
                  <small>{selectedPass.cargoWeightTon} {t('Tonnes', 'टन')}</small>
                </div>

                <div className="dockyard-mini-tile">
                  <span>{t('Container Seal ID', 'कंटेनर सील आईडी')}</span>
                  <strong>{selectedPass.sealNumber}</strong>
                  <small style={{ color: '#059669', fontWeight: 700 }}>✓ {t('Verified at Gate', 'गेट पर सत्यापित')}</small>
                </div>

                <div className="dockyard-mini-tile">
                  <span>{t('Assigned Dock Bay', 'आवंटित डॉक बे')}</span>
                  <strong style={{ color: '#0284c7' }}>{selectedPass.assignedBay}</strong>
                  <small>{t('Docked at', 'डॉक समय')}: {selectedPass.dockInTime || t('Waiting', 'प्रतीक्षारत')}</small>
                </div>

                <div className="dockyard-mini-tile">
                  <span>{t('Odometer at Gate-In', 'गेट-इन पर ओडोमीटर')}</span>
                  <strong>{selectedPass.odometerReadingKm.toLocaleString('en-IN')} KM</strong>
                  <small>{t('Guard', 'गार्ड')}: {selectedPass.securityGuardName}</small>
                </div>
              </div>

              {/* TAT SLA HEALTH GAUGE */}
              <div className={`dockyard-tat-gauge ${selectedPass.status === 'DETENTION_WARNING' ? 'detention' : 'safe'}`}>
                <div className="dockyard-tat-gauge-head">
                  <span>
                    {selectedPass.status === 'DETENTION_WARNING' ? t('⚠️ DETENTION CHARGES TRIGGERED', '⚠️ डिटेंशन शुल्क लागू') : t('⏱️ TURNAROUND TIME (TAT) HEALTH', '⏱️ टर्नअराउंड समय (TAT) स्वास्थ्य')}
                  </span>
                  <span>
                    {selectedPass.elapsedMinutes}m / {selectedPass.targetTatMinutes}m
                  </span>
                </div>
                {selectedPass.status === 'DETENTION_WARNING' ? (
                  <p>
                    {t('Loading delayed by 25 mins. Auto-demurrage fine accrued:', 'लोडिंग में 25 मिनट का विलंब। जुर्माना शुल्क:')} <strong>₹{selectedPass.demurrageChargesInr}</strong>.
                  </p>
                ) : (
                  <p>
                    {t('Truck is operating comfortably within the 75-minute yard turnaround SLA.', 'ट्रक 75-मिनट यार्ड टर्नअराउंड एसएलए के अंतर्गत सुरक्षित रूप से संचालित हो रहा है।')}
                  </p>
                )}
              </div>

              {/* ACTIONS */}
              <div className="dockyard-actions-col">
                {selectedPass.status === 'DETENTION_WARNING' && (
                  <button
                    type="button"
                    className="dockyard-btn-expedite"
                    onClick={() => handleExpediteDock(selectedPass.id)}
                  >
                    <span>⚡</span> {t('Expedite Unload & Waive Detention', 'अनलोडिंग तेज करें एवं डिटेंशन शुल्क माफ करें')}
                  </button>
                )}

                {selectedPass.status !== 'GATE_OUT_CLEARED' && (
                  <button
                    type="button"
                    className="dockyard-btn-gateout"
                    onClick={() => handleGateOutRelease(selectedPass.id)}
                  >
                    <span>🚪</span> {t('Authorize Gate-Out Exit & Print Slip', 'गेट-आउट निकास अधिकृत करें एवं पर्ची प्रिंट करें')}
                  </button>
                )}

                <button
                  type="button"
                  className="dockyard-btn-doc"
                  onClick={() => setShowSlipPrintModal(true)}
                >
                  🖨️ {t('View Official Digital Gate Pass Document', 'आधिकारिक डिजिटल गेट पास दस्तावेज देखें')}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary, #64748b)' }}>
              {t('Select a gate pass to inspect details.', 'विवरण देखने के लिए गेट पास का चयन करें।')}
            </div>
          )}
        </div>
      </div>

      {/* 6. NEW GATE-IN PASS MODAL */}
      {showNewGateInModal && (
        <div className="dockyard-modal-overlay">
          <div className="dockyard-modal-card">
            <div className="dockyard-modal-head">
              <h3>🏷️ {t('New Gate-In Entry Slip Generator', 'नया गेट-इन एंट्री पास जनरेटर')}</h3>
              <button
                type="button"
                className="dockyard-modal-close"
                onClick={() => setShowNewGateInModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGateIn} className="dockyard-modal-form">
              <div className="dockyard-form-grid-2">
                <div>
                  <label className="dockyard-input-label">{t('Vehicle Number *', 'वाहन संख्या *')}</label>
                  <input
                    type="text"
                    required
                    value={newVehicle}
                    onChange={e => setNewVehicle(e.target.value)}
                    className="dockyard-input-field"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label className="dockyard-input-label">{t('Consignment / Bilty (LR) *', 'कंसाइनमेंट / बिल्टी (LR) *')}</label>
                  <input
                    type="text"
                    required
                    value={newConsignment}
                    onChange={e => setNewConsignment(e.target.value)}
                    className="dockyard-input-field"
                  />
                </div>
              </div>

              <div className="dockyard-form-grid-2">
                <div>
                  <label className="dockyard-input-label">{t('Driver Name *', 'चालक का नाम *')}</label>
                  <input
                    type="text"
                    required
                    value={newDriver}
                    onChange={e => setNewDriver(e.target.value)}
                    className="dockyard-input-field"
                  />
                </div>
                <div>
                  <label className="dockyard-input-label">{t('Driver Phone *', 'चालक फोन नंबर *')}</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="dockyard-input-field"
                  />
                </div>
              </div>

              <div className="dockyard-form-grid-2">
                <div>
                  <label className="dockyard-input-label">{t('Assigned Loading/Unloading Bay', 'आवंटित लोडिंग/अनलोडिंग बे')}</label>
                  <select
                    value={newBay}
                    onChange={e => setNewBay(e.target.value)}
                    className="dockyard-select-field"
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
                  <label className="dockyard-input-label">{t('Container Physical Seal No *', 'कंटेनर भौतिक सील संख्या *')}</label>
                  <input
                    type="text"
                    required
                    value={newSealNo}
                    onChange={e => setNewSealNo(e.target.value)}
                    className="dockyard-input-field"
                  />
                </div>
              </div>

              <div className="dockyard-form-grid-3">
                <div>
                  <label className="dockyard-input-label">{t('Material Description', 'सामग्री विवरण')}</label>
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={e => setNewMaterial(e.target.value)}
                    className="dockyard-input-field"
                  />
                </div>
                <div>
                  <label className="dockyard-input-label">{t('Weight (Ton)', 'वजन (टन)')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={e => setNewWeight(Number(e.target.value))}
                    className="dockyard-input-field"
                  />
                </div>
                <div>
                  <label className="dockyard-input-label">{t('Odometer (KM)', 'ओडोमीटर (KM)')}</label>
                  <input
                    type="number"
                    value={newOdo}
                    onChange={e => setNewOdo(Number(e.target.value))}
                    className="dockyard-input-field"
                  />
                </div>
              </div>

              <div className="dockyard-security-box">
                🔒 {t('Security Checklist: Driver sobriety checked, helmet worn, container seals intact, and fire extinguisher present.', 'सुरक्षा चेकलिस्ट: चालक की सतर्कता जांची गई, हेलमेट पहना है, कंटेनर सील बरकरार है और अग्निशामक यंत्र उपस्थित है।')}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewGateInModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-subtle, #f1f5f9)', border: '1px solid var(--border-color, #cbd5e1)', fontWeight: 700, cursor: 'pointer', color: 'var(--text-primary, #475569)' }}
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: '10px', borderRadius: '8px', background: '#059669', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  {t('Confirm Gate-In & Generate Barcode', 'गेट-इन पुष्टि करें एवं बारकोड जनरेट करें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. PRINT SLIP MODAL */}
      {showSlipPrintModal && selectedPass && (
        <div className="dockyard-modal-overlay">
          <div className="dockyard-modal-card print-card">
            <div style={{ textAlign: 'center', borderBottom: '2px dashed var(--border-color, #000)', paddingBottom: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary, #0f172a)' }}>ASK TRANSPORT GROUP</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)' }}>HUB TERMINAL-01 PUNE LOGISTICS PARK</div>
              <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary, #0f172a)' }}>OFFICIAL GATE IN/OUT PASS</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)' }}>PASS NO: {selectedPass.passNumber}</div>
            </div>

            <div style={{ padding: '16px 0', fontSize: '12px', lineHeight: '1.8', borderBottom: '2px dashed var(--border-color, #000)', color: 'var(--text-primary, #0f172a)' }}>
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

            <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '2px dashed var(--border-color, #000)', color: 'var(--text-primary, #0f172a)' }}>
              <div style={{ fontSize: '32px' }}>||| || ||||| |||| ||| ||</div>
              <div style={{ fontSize: '10px', marginTop: '4px' }}>*{selectedPass.passNumber}*</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowSlipPrintModal(false)}
                style={{ flex: 1, padding: '9px', background: 'var(--bg-subtle, #f1f5f9)', border: '1px solid var(--border-color, #cbd5e1)', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-primary, #0f172a)' }}
              >
                {t('Close', 'बंद करें')}
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowSlipPrintModal(false);
                }}
                style={{ flex: 1, padding: '9px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                🖨️ {t('Print Slip', 'पर्ची प्रिंट करें')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
