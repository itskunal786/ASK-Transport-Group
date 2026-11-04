import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getWeighbridgeSlips, authorizeCrossDockDeLoad } from '../api/weighbridgeApi';
import './ElectronicWeighbridgeDeck.css';

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

const AXLE_CONFIG_MAP: Record<VehicleAxleCategory, { label: string; limitKg: number }> = {
  '2-AXLE_6WHEEL': { label: '2-Axle (6-Wheeler)', limitKg: 18500 },
  '3-AXLE_10WHEEL': { label: '3-Axle (10-Wheeler)', limitKg: 28000 },
  '4-AXLE_14WHEEL': { label: '4-Axle (14-Wheeler)', limitKg: 35000 },
  '5-AXLE_16WHEEL': { label: '5-Axle (16-Wheeler)', limitKg: 43500 },
  '6-AXLE_TRAILER': { label: '6-Axle (Trailer / 22-Wheel)', limitKg: 55000 },
};

export default function ElectronicWeighbridgeDeck() {
  const { t } = useLanguage();
  const [slips, setSlips] = useState<WeighbridgeSlipRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ask_weighbridge_slips');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return INITIAL_SLIPS;
  });
  const [selectedSlip, setSelectedSlip] = useState<WeighbridgeSlipRecord | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ask_weighbridge_slips');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[1] || parsed[0];
        } catch {}
      }
    }
    return INITIAL_SLIPS[1];
  });
  const [liveScaleReadingKg, setLiveScaleReadingKg] = useState<number>(34600);
  const [isScaleStabilized, setIsScaleStabilized] = useState<boolean>(true);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showCrossDockModal, setShowCrossDockModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add / Edit Vehicle Modal State
  const [showAddVehicleModal, setShowAddVehicleModal] = useState<boolean>(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState<boolean>(false);
  const [editingSlip, setEditingSlip] = useState<WeighbridgeSlipRecord | null>(null);

  // Form Fields for Add / Edit Vehicle
  const [formPlate, setFormPlate] = useState<string>('');
  const [formTruckModel, setFormTruckModel] = useState<string>('Tata Signa 4825.TK 16-Wheeler (40 Ton)');
  const [formAxleCategory, setFormAxleCategory] = useState<VehicleAxleCategory>('5-AXLE_16WHEEL');
  const [formDriverName, setFormDriverName] = useState<string>('');
  const [formDriverPhone, setFormDriverPhone] = useState<string>('+91 98');
  const [formTransporterName, setFormTransporterName] = useState<string>('ASK Transport Fleet');
  const [formConsignmentNo, setFormConsignmentNo] = useState<string>('');
  const [formMaterialName, setFormMaterialName] = useState<string>('Auto Components & Precision Spares');
  const [formTareWeightKg, setFormTareWeightKg] = useState<number>(12400);
  const [formGrossWeightKg, setFormGrossWeightKg] = useState<number>(36500);

  // Auto-sync slips to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && slips.length > 0) {
      try {
        localStorage.setItem('ask_weighbridge_slips', JSON.stringify(slips));
      } catch {}
    }
  }, [slips]);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('ask_weighbridge_slips')) {
      return;
    }
    getWeighbridgeSlips().then(data => {
      if (data && data.length > 0) {
        setSlips(data);
        setSelectedSlip(data[1] || data[0]);
      }
    }).catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------

  const handleOpenAddVehicleModal = () => {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    setFormPlate(`MH-12-AB-${randNum}`);
    setFormTruckModel('Tata Signa 4825.TK 16-Wheeler (40 Ton)');
    setFormAxleCategory('5-AXLE_16WHEEL');
    setFormDriverName('Ramesh Yadav');
    setFormDriverPhone('+91 98112 23344');
    setFormTransporterName('ASK Transport Fleet');
    setFormConsignmentNo(`ASK-LR-${randNum}`);
    setFormMaterialName('Auto Components & Precision Spares');
    setFormTareWeightKg(12400);
    setFormGrossWeightKg(36500);
    setShowAddVehicleModal(true);
  };

  const handleOpenEditVehicleModal = (slip: WeighbridgeSlipRecord) => {
    setEditingSlip(slip);
    setFormPlate(slip.vehicleNumber);
    setFormTruckModel(slip.truckModel);
    setFormAxleCategory(slip.axleCategory);
    setFormDriverName(slip.driverName);
    setFormDriverPhone(slip.driverPhone);
    setFormTransporterName(slip.transporterName);
    setFormConsignmentNo(slip.consignmentNo);
    setFormMaterialName(slip.materialName);
    setFormTareWeightKg(slip.tareWeightKg);
    setFormGrossWeightKg(slip.grossWeightKg);
    setShowEditVehicleModal(true);
  };

  const applyVehicleTemplate = (type: 'tata' | 'ashok' | 'bharatbenz' | 'eicher') => {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    if (type === 'tata') {
      setFormPlate(`MH-14-TG-${randNum}`);
      setFormTruckModel('Tata Signa 4825.TK 16-Wheeler (40 Ton)');
      setFormAxleCategory('5-AXLE_16WHEEL');
      setFormDriverName('Suresh Rawat');
      setFormDriverPhone('+91 98230 45678');
      setFormTransporterName('ASK SuperFleet Logistics');
      setFormConsignmentNo(`ASK-LR-${randNum}`);
      setFormMaterialName('Chassis Sub-Assemblies & Transmission Gears');
      setFormTareWeightKg(12400);
      setFormGrossWeightKg(41500);
    } else if (type === 'ashok') {
      setFormPlate(`RJ-14-TG-${randNum}`);
      setFormTruckModel('Ashok Leyland 4220 Cowl Body (42 Ton)');
      setFormAxleCategory('4-AXLE_14WHEEL');
      setFormDriverName('Mukesh Choudhary');
      setFormDriverPhone('+91 94140 88203');
      setFormTransporterName('Rajputana Roadways');
      setFormConsignmentNo(`ASK-LR-${randNum}`);
      setFormMaterialName('Marble Slabs & Heavy Vitrified Tiles');
      setFormTareWeightKg(11200);
      setFormGrossWeightKg(34800);
    } else if (type === 'bharatbenz') {
      setFormPlate(`DL-01-AB-${randNum}`);
      setFormTruckModel('BharatBenz 3528R Multi-Axle Rigid Truck');
      setFormAxleCategory('4-AXLE_14WHEEL');
      setFormDriverName('Manjeet Singh Dhillon');
      setFormDriverPhone('+91 98112 00112');
      setFormTransporterName('Northern Express Cargo');
      setFormConsignmentNo(`ASK-LR-${randNum}`);
      setFormMaterialName('Cold-Rolled High-Tensile Steel Coils');
      setFormTareWeightKg(10500);
      setFormGrossWeightKg(33500);
    } else {
      setFormPlate(`KA-01-AJ-${randNum}`);
      setFormTruckModel('Eicher Pro 6035 FTL High Deck (16 Ton)');
      setFormAxleCategory('3-AXLE_10WHEEL');
      setFormDriverName('Murugan Swamy');
      setFormDriverPhone('+91 97110 99887');
      setFormTransporterName('Deccan Fast Cargo');
      setFormConsignmentNo(`ASK-LR-${randNum}`);
      setFormMaterialName('Packaged FMCG & Consumer Electronics');
      setFormTareWeightKg(8200);
      setFormGrossWeightKg(26800);
    }
    showToast(`✓ Template loaded for ${type.toUpperCase()} truck!`);
  };

  const handleSaveAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlate.trim() || !formDriverName.trim()) {
      alert('Please provide Vehicle Registration and Driver Name.');
      return;
    }

    const axleInfo = AXLE_CONFIG_MAP[formAxleCategory] || { label: '5-Axle (16-Wheeler)', limitKg: 43500 };
    const tare = Math.max(1000, Number(formTareWeightKg) || 12000);
    const gross = Math.max(tare, Number(formGrossWeightKg) || 35000);
    const net = gross - tare;
    const limit = axleInfo.limitKg;
    const overload = Math.max(0, gross - limit);
    const overloadPct = overload > 0 ? (overload / limit) * 100 : 0;
    const isOverload = overload > 0;
    const potentialFine = isOverload ? 20000 + Math.ceil(overload / 1000) * 2000 : 0;
    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                   new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const newRecord: WeighbridgeSlipRecord = {
      id: `DK-REC-${Date.now()}`,
      slipNumber: `DK-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      vehicleNumber: formPlate.trim().toUpperCase(),
      truckModel: formTruckModel.trim(),
      axleCategory: formAxleCategory,
      axleLabel: axleInfo.label,
      driverName: formDriverName.trim(),
      driverPhone: formDriverPhone.trim(),
      transporterName: formTransporterName.trim(),
      consignmentNo: formConsignmentNo.trim() || `ASK-LR-${Math.floor(1000 + Math.random() * 9000)}`,
      materialName: formMaterialName.trim(),
      tareWeightKg: tare,
      grossWeightKg: gross,
      netCargoWeightKg: net,
      permissibleGvwKg: limit,
      overloadKg: overload,
      overloadPercent: parseFloat(overloadPct.toFixed(2)),
      status: isOverload ? 'OVERLOAD_CRITICAL' : 'LEGAL_COMPLIANT',
      potentialRtoFineInr: potentialFine,
      gatePassLocked: isOverload,
      weighedAt: nowStr,
      operatorName: 'Sunil Jagtap (Scale Op 01)',
      calibrationCertificateId: 'W&M-GOVT-PN-2026-90'
    };

    setSlips(prev => [newRecord, ...prev]);
    setSelectedSlip(newRecord);
    setLiveScaleReadingKg(gross);
    setShowAddVehicleModal(false);
    showToast(`✅ Vehicle ${newRecord.vehicleNumber} registered onto Dharam Kanta ramp!`);
  };

  const handleSaveEditVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlip) return;

    const axleInfo = AXLE_CONFIG_MAP[formAxleCategory] || { label: '5-Axle (16-Wheeler)', limitKg: 43500 };
    const tare = Math.max(1000, Number(formTareWeightKg) || 12000);
    const gross = Math.max(tare, Number(formGrossWeightKg) || 35000);
    const net = gross - tare;
    const limit = axleInfo.limitKg;
    const overload = Math.max(0, gross - limit);
    const overloadPct = overload > 0 ? (overload / limit) * 100 : 0;
    const isOverload = overload > 0;
    const potentialFine = isOverload ? 20000 + Math.ceil(overload / 1000) * 2000 : 0;

    const updatedSlip: WeighbridgeSlipRecord = {
      ...editingSlip,
      vehicleNumber: formPlate.trim().toUpperCase(),
      truckModel: formTruckModel.trim(),
      axleCategory: formAxleCategory,
      axleLabel: axleInfo.label,
      driverName: formDriverName.trim(),
      driverPhone: formDriverPhone.trim(),
      transporterName: formTransporterName.trim(),
      consignmentNo: formConsignmentNo.trim(),
      materialName: formMaterialName.trim(),
      tareWeightKg: tare,
      grossWeightKg: gross,
      netCargoWeightKg: net,
      permissibleGvwKg: limit,
      overloadKg: overload,
      overloadPercent: parseFloat(overloadPct.toFixed(2)),
      status: isOverload ? 'OVERLOAD_CRITICAL' : 'LEGAL_COMPLIANT',
      potentialRtoFineInr: potentialFine,
      gatePassLocked: isOverload
    };

    setSlips(prev => prev.map(s => s.id === editingSlip.id ? updatedSlip : s));
    if (selectedSlip?.id === editingSlip.id) {
      setSelectedSlip(updatedSlip);
      setLiveScaleReadingKg(gross);
    }
    setShowEditVehicleModal(false);
    setEditingSlip(null);
    showToast(`✓ Vehicle ${updatedSlip.vehicleNumber} weighment details updated!`);
  };

  const handleDeleteVehicle = (slipId: string) => {
    const toDelete = slips.find(s => s.id === slipId);
    if (!toDelete) return;
    if (window.confirm(`Are you sure you want to remove vehicle ${toDelete.vehicleNumber} from Dharam Kanta Weighbridge?`)) {
      const remaining = slips.filter(s => s.id !== slipId);
      setSlips(remaining);
      if (selectedSlip?.id === slipId) {
        setSelectedSlip(remaining[0] || null);
        setLiveScaleReadingKg(remaining[0] ? remaining[0].grossWeightKg : 0);
      }
      showToast(`🗑️ Vehicle ${toDelete.vehicleNumber} removed from Dharam Kanta queue.`);
    }
  };

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
    <div className="weighbridge-container">
      {/* 1. TOP HEADER BANNER */}
      <div className="weighbridge-banner">
        <div style={{ maxWidth: '640px' }}>
          <div className="weighbridge-banner-tag">
            <span>⚖️</span> {t('HUB WEIGHBRIDGE & RTO COMPLIANCE SHIELD', 'हब वेईब्रिज एवं आरटीओ अनुपालन शील्ड')}
          </div>
          <div className="weighbridge-banner-titles">
            <h1>{t('Electronic Weighbridge (Dharam Kanta) & Overload Shield', 'इलेक्ट्रॉनिक वेईब्रिज (धर्म कांटा) एवं ओवरलोड शील्ड')}</h1>
            <p>
              {t(
                'Govt calibrated digital load-cell telemetry, Gross / Tare / Net cargo validation, Motor Vehicles Act 1988 (Sec 113/194) permissible axle load limits, and automated exit gate-locks.',
                'सरकारी कैलिब्रेटेड डिजिटल लोड-सेल टेलीमेट्री, ग्रॉस / वेयर / नेट कार्गो सत्यापन, मोटर वाहन अधिनियम 1988 (धारा 113/194) अनुमेय एक्सल लोड सीमा और स्वचालित निकास गेट-लॉक।'
              )}
            </p>
          </div>
        </div>

        {/* TOP STATUS */}
        <div className="weighbridge-calib-badge">
          <span className="weighbridge-calib-sub">{t('Scale Calibration', 'कांटा कैलिब्रेशन')}</span>
          <div className="weighbridge-calib-val">{t('✓ W&M Govt Certified', '✓ विधिक माप विज्ञान प्रमाणित')}</div>
        </div>
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

      {/* 3. 4 KPI STATS ROW */}
      <div className="weighbridge-kpis-grid">
        <div className="weighbridge-kpi-card">
          <div className="weighbridge-kpi-head">
            <span className="weighbridge-kpi-label">{t('Overload Fine Shielded', 'बचत ओवरलोड जुर्माना')}</span>
            <span className="weighbridge-kpi-icon">🛡️</span>
          </div>
          <div className="weighbridge-kpi-value" style={{ color: '#dc2626' }}>
            ₹{totalOverloadFinesShielded.toLocaleString('en-IN')}{' '}
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444' }}>
              {t('Fine Prevented', 'जुर्माना रोका गया')}
            </span>
          </div>
          <span className="weighbridge-kpi-sub">
            {t('Sec 194 MV Act: ₹20k base + ₹2k/T', 'धारा 194 एमवी एक्ट: ₹20,000 मूल + ₹2,000/टन')}
          </span>
        </div>

        <div className="weighbridge-kpi-card">
          <div className="weighbridge-kpi-head">
            <span className="weighbridge-kpi-label">{t("Today's Total Tonnage Weighed", 'आज का कुल तौला गया भार')}</span>
            <span className="weighbridge-kpi-icon">⚖️</span>
          </div>
          <div className="weighbridge-kpi-value">
            163.4 {t('Tonnes', 'टन')}
          </div>
          <span className="weighbridge-kpi-sub">
            {t('4 Trucks completed • 1 on ramp', '4 ट्रक पूर्ण • 1 कांटे पर')}
          </span>
        </div>

        <div className="weighbridge-kpi-card">
          <div className="weighbridge-kpi-head">
            <span className="weighbridge-kpi-label">{t('RTO Compliance Ratio', 'आरटीओ अनुपालन दर')}</span>
            <span className="weighbridge-kpi-icon">📋</span>
          </div>
          <div className="weighbridge-kpi-value" style={{ color: '#16a34a' }}>
            75% {t('First-Pass', 'प्रथम पास')}
          </div>
          <span className="weighbridge-kpi-sub">
            {t('1 Overload blocked at Hub ramp', '1 ओवरलोड हब कांटे पर रोका गया')}
          </span>
        </div>

        <div className="weighbridge-kpi-card">
          <div className="weighbridge-kpi-head">
            <span className="weighbridge-kpi-label">{t('Scale Accuracy & Drift', 'कांटे की सटीकता')}</span>
            <span className="weighbridge-kpi-icon">🎯</span>
          </div>
          <div className="weighbridge-kpi-value" style={{ color: '#0284c7' }}>
            ±0.02% {t('Error', 'त्रुटि')}
          </div>
          <span className="weighbridge-kpi-sub">
            {t('Legal limit allowed: ±0.1%', 'कानूनी स्वीकार्य सीमा: ±0.1%')}
          </span>
        </div>
      </div>

      {/* 4. LIVE WEIGHBRIDGE ELECTRONIC SCALE PLATFORM */}
      <div className="weighbridge-console-card">
        <div className="weighbridge-console-head">
          <div>
            <h3>📟 {t('Live Weighbridge Digital Console (Hub-01 Pune Scale Ramp)', 'लाइव वेईब्रिज डिजिटल कंसोल (हब-01 पुणे कांटा रैंप)')}</h3>
            <small style={{ color: 'var(--text-secondary, #64748b)', fontSize: '12px' }}>
              {t('Real-time 60-Ton electronic pitless scale terminal with Avery Weigh-Tronix load cell interface', 'एवरी वे-ट्रॉनिक्स लोड सेल इंटरफेस के साथ रीयल-टाइम 60-टन इलेक्ट्रॉनिक पिटलेस स्केल टर्मिनल')}
            </small>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {slips.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSimulateWeighing(s.vehicleNumber)}
                className={`weighbridge-sim-pill ${selectedSlip?.vehicleNumber === s.vehicleNumber ? 'active' : ''}`}
              >
                🚛 {s.vehicleNumber}
              </button>
            ))}
            <button
              type="button"
              onClick={handleOpenAddVehicleModal}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}
            >
              <span>➕</span>
              <span>{t('+ Add Vehicle to Scale', '+ नया वाहन जोड़ें')}</span>
            </button>
          </div>
        </div>

        {/* SCALE HARDWARE LED DISPLAY SIMULATOR */}
        <div className="weighbridge-scale-led">
          <div>
            <div style={{ fontSize: '11px', color: '#a1a1aa', letterSpacing: '1px' }}>
              ELECTRONIC WEIGH SCALE • STATION #01 PUNE
            </div>
            <div style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '2px', color: isScaleStabilized ? '#22c55e' : '#f59e0b', marginTop: '4px' }}>
              {liveScaleReadingKg.toLocaleString('en-IN')} <span style={{ fontSize: '20px' }}>KG</span>
            </div>
            <div style={{ fontSize: '13px', color: '#e4e4e7', display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '4px' }}>
              <span>STATUS: {isScaleStabilized ? 'STABILIZED (✓)' : 'WEIGHING IN PROGRESS...'}</span>
              <span>TARE: {selectedSlip ? `${selectedSlip.tareWeightKg.toLocaleString('en-IN')} KG` : 'N/A'}</span>
              <span>NET: {selectedSlip ? `${selectedSlip.netCargoWeightKg.toLocaleString('en-IN')} KG` : 'N/A'}</span>
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
                🔄 {t('Re-Zero / Tare', 'री-ज़ीरो / वेयर')}
              </button>
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                style={{ flex: 1, padding: '8px', background: '#22c55e', color: '#000000', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
              >
                🖨️ {t('Print Slip', 'पर्ची प्रिंट')}
              </button>
            </div>

            {selectedSlip && (
              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={() => handleOpenEditVehicleModal(selectedSlip)}
                  style={{ flex: 1, padding: '6px', background: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  ✏️ {t('Edit Vehicle', 'वाहन एडिट')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteVehicle(selectedSlip.id)}
                  style={{ flex: 1, padding: '6px', background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  🗑️ {t('Delete Vehicle', 'वाहन हटाएं')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. TABLE OF SLIPS & RTO AXLE LOAD AUDIT */}
      <div className="weighbridge-split-row">
        {/* SLIPS TABLE */}
        <div className="weighbridge-card-left">
          <div className="weighbridge-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>📑 {t('Dharam Kanta Weighment Ledger', 'धर्म कांटा वजन बहीखाता')}</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)' }}>Govt Sec 113 / 194 MV Act</span>
            </div>
            <button
              type="button"
              onClick={handleOpenAddVehicleModal}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>➕</span>
              <span>{t('+ Add Vehicle', '+ वाहन जोड़ें')}</span>
            </button>
          </div>

          <div className="weighbridge-table-wrap">
            <table className="weighbridge-data-table">
              <thead>
                <tr>
                  <th>{t('SLIP NO', 'पर्ची सं.')}</th>
                  <th>{t('VEHICLE & AXLE', 'वाहन एवं एक्सल')}</th>
                  <th>{t('GROSS / PERMISSIBLE', 'सकल / अनुमेय')}</th>
                  <th>{t('NET CARGO', 'शुद्ध कार्गो')}</th>
                  <th>{t('COMPLIANCE', 'अनुपालन')}</th>
                  <th style={{ textAlign: 'right' }}>{t('ACTION', 'कार्रवाई')}</th>
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
                      className={`weighbridge-table-row ${isSelected ? 'selected' : ''}`}
                    >
                      <td>
                        <div className="weighbridge-slip-no">{slip.slipNumber}</div>
                        <small style={{ color: 'var(--text-secondary, #64748b)', fontSize: '10px' }}>{slip.weighedAt.split(',')[1]}</small>
                      </td>

                      <td>
                        <div className="weighbridge-plate-text">{slip.vehicleNumber}</div>
                        <div className="weighbridge-axle-text">{slip.axleLabel}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 800, color: isOverload ? '#dc2626' : 'var(--text-primary, #0f172a)' }}>
                          {(slip.grossWeightKg / 1000).toFixed(1)}T {t('Gross', 'सकल')}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)' }}>
                          {t('Limit:', 'सीमा:')} {(slip.permissibleGvwKg / 1000).toFixed(1)}T
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 800, color: '#059669' }}>
                          {(slip.netCargoWeightKg / 1000).toFixed(1)}T {t('Net', 'शुद्ध')}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)' }}>
                          {t('Tare:', 'वेयर:')} {(slip.tareWeightKg / 1000).toFixed(1)}T
                        </div>
                      </td>

                      <td>
                        <span className={`weighbridge-status-pill ${isOverload ? 'overload' : 'legal'}`}>
                          {isOverload ? `🚨 +${(slip.overloadKg / 1000).toFixed(1)}T ${t('Overload', 'ओवरलोड')}` : `✓ ${t('Legal Compliant', 'वैध अनुपालन')}`}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="weighbridge-btn-slip"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSlip(slip);
                              setShowPrintModal(true);
                            }}
                          >
                            🖨️ {t('Slip', 'पर्ची')}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditVehicleModal(slip);
                            }}
                            style={{
                              background: '#3b82f6',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Edit Vehicle"
                          >
                            ✏️ {t('Edit', 'एडिट')}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVehicle(slip.id);
                            }}
                            style={{
                              background: '#ef4444',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Delete Vehicle"
                          >
                            🗑️ {t('Delete', 'हटाएं')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: OVERLOAD SHIELD & GATE INTERLOCK */}
        <div className="weighbridge-card-right">
          {selectedSlip ? (
            <div>
              <div className="weighbridge-shield-head">
                <div>
                  <span className="weighbridge-shield-tag">
                    {t('AXLE LOAD & PENALTY SHIELD', 'एक्सल लोड एवं जुर्माना शील्ड')}
                  </span>
                  <div className="weighbridge-shield-title">
                    {selectedSlip.vehicleNumber}
                  </div>
                </div>
                <span className={`weighbridge-exit-badge ${selectedSlip.status === 'OVERLOAD_CRITICAL' ? 'locked' : 'cleared'}`}>
                  {selectedSlip.status === 'OVERLOAD_CRITICAL' ? `🚨 ${t('EXIT LOCKED', 'निकास लॉक')}` : `✓ ${t('EXIT CLEARED', 'निकास स्वीकृत')}`}
                </span>
              </div>

              {/* OVERLOAD ALERT BOX */}
              {selectedSlip.status === 'OVERLOAD_CRITICAL' ? (
                <div className="weighbridge-alert-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: '#b91c1c' }}>
                      ⚠️ {t('RTO MOTOR VEHICLE ACT OVERLOAD ALERT', 'आरटीओ मोटर वाहन अधिनियम ओवरलोड अलर्ट')}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#b91c1c' }}>
                      +{selectedSlip.overloadKg} KG (+{selectedSlip.overloadPercent}%)
                    </span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#991b1b', lineHeight: 1.5 }}>
                    {t('This vehicle exceeds the permissible Gross Vehicle Weight of', 'यह वाहन अनुमेय सकल भार')} {(selectedSlip.permissibleGvwKg / 1000).toFixed(1)}T {t('by', 'से')} <strong>{(selectedSlip.overloadKg / 1000).toFixed(1)} {t('Tonnes', 'टन')}</strong> {t('excess.', 'अधिक है।')}
                  </p>

                  <div className="weighbridge-challan-calc">
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)', fontWeight: 700 }}>
                      {t('POTENTIAL RTO CHALLAN IF DISPATCHED:', 'यदि रवाना किया गया तो संभावित आरटीओ चालान:')}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#dc2626', marginTop: '2px' }}>
                      ₹{selectedSlip.potentialRtoFineInr.toLocaleString('en-IN')} {t('Fine', 'जुर्माना')}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary, #71717a)' }}>
                      {t('Calculation: Section 194 MV Act ₹20,000 Base Penalty + ₹2,000/Tonne excess', 'गणना: धारा 194 एमवी एक्ट ₹20,000 मूल जुर्माना + ₹2,000/अतिरिक्त टन')}
                    </div>
                  </div>

                  <div style={{ marginTop: '14px' }}>
                    <button
                      type="button"
                      className="weighbridge-btn-deload"
                      onClick={() => setShowCrossDockModal(true)}
                    >
                      <span>🚜</span> {t('Authorize Forklift Cross-Dock De-Load', 'फोर्कलिफ्ट क्रॉस-डॉक डी-लोड अधिकृत करें')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="weighbridge-alert-box safe">
                  <div style={{ fontSize: '12px', fontWeight: 900, color: '#166534' }}>
                    ✓ {t('100% LEGAL & AXLE COMPLIANT', '100% वैध एवं एक्सल अनुपालन')}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#15803d' }}>
                    {t('Gross weight is', 'सकल भार')} {selectedSlip.permissibleGvwKg - selectedSlip.grossWeightKg} KG {t('safely under the legal permissible limit. Digital Gate-Out pass unlocked.', 'कानूनी सीमा के सुरक्षित अंतर्गत है। डिजिटल गेट-आउट पास अनलॉक है।')}
                  </p>
                </div>
              )}

              {/* WEIGHT BREAKDOWN GRID */}
              <div className="weighbridge-metrics-2x2">
                <div className="weighbridge-mini-tile">
                  <span>{t('Gross Weight (Loaded)', 'सकल भार (भरा हुआ)')}</span>
                  <strong>{selectedSlip.grossWeightKg.toLocaleString('en-IN')} KG</strong>
                  <small>{(selectedSlip.grossWeightKg / 1000).toFixed(2)} {t('Ton', 'टन')}</small>
                </div>

                <div className="weighbridge-mini-tile">
                  <span>{t('Tare Weight (Unloaded)', 'खाली भार (खाली गाड़ी)')}</span>
                  <strong>{selectedSlip.tareWeightKg.toLocaleString('en-IN')} KG</strong>
                  <small>{(selectedSlip.tareWeightKg / 1000).toFixed(2)} {t('Ton', 'टन')}</small>
                </div>

                <div className="weighbridge-mini-tile">
                  <span>{t('Net Cargo Pay-Load', 'शुद्ध माल भार')}</span>
                  <strong style={{ color: '#059669' }}>{selectedSlip.netCargoWeightKg.toLocaleString('en-IN')} KG</strong>
                  <small style={{ color: '#059669', fontWeight: 700 }}>{(selectedSlip.netCargoWeightKg / 1000).toFixed(2)} {t('Ton', 'टन')}</small>
                </div>

                <div className="weighbridge-mini-tile">
                  <span>{t('RTO Legal GVW Cap', 'आरटीओ कानूनी सीमा')}</span>
                  <strong style={{ color: '#0284c7' }}>{selectedSlip.permissibleGvwKg.toLocaleString('en-IN')} KG</strong>
                  <small>{(selectedSlip.permissibleGvwKg / 1000).toFixed(2)} {t('Ton Max', 'टन अधिकतम')}</small>
                </div>
              </div>

              {/* RTO AXLE REGULATIONS INFO */}
              <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-subtle, #f8fafc)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)', fontSize: '11px', color: 'var(--text-secondary, #64748b)' }}>
                <div style={{ fontWeight: 800, color: 'var(--text-primary, #334155)', marginBottom: '4px' }}>
                  📜 {t('Govt of India Gazette Notification S.O. 3467(E) Max Axle Norms:', 'भारत का राजपत्र अधिसूचना S.O. 3467(E) अधिकतम एक्सल मानक:')}
                </div>
                • 2-Axle (18.5T) | 3-Axle (28T) | 4-Axle (35T) | 5-Axle (43.5T) | 6-Axle Trailer (55T).
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary, #64748b)' }}>
              {t('Select a weighment slip to audit compliance.', 'अनुपालन जांचने के लिए वजन पर्ची का चयन करें।')}
            </div>
          )}
        </div>
      </div>

      {/* 6. CROSS DOCK DE-LOAD MODAL */}
      {showCrossDockModal && selectedSlip && (
        <div className="weighbridge-modal-overlay">
          <div className="weighbridge-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#dc2626' }}>
                🚜 {t('Cross-Dock Cargo De-Load Interlock', 'क्रॉस-डॉक कार्गो डी-लोड इंटरलॉक')}
              </h3>
              <button
                type="button"
                onClick={() => setShowCrossDockModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-secondary, #64748b)' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-primary, #334155)', lineHeight: 1.5 }}>
              {t('Vehicle', 'वाहन')} <strong>{selectedSlip.vehicleNumber}</strong> {t('has', 'में')} <strong>{selectedSlip.overloadKg} KG</strong> {t('excess cargo.', 'अतिरिक्त माल है।')}
              {' '}{t('Dispatching forklift team to transfer', 'फोर्कलिफ्ट टीम')} {(selectedSlip.overloadKg / 1000).toFixed(1)} {t('Tonnes of', 'टन')} {selectedSlip.materialName} {t('to', 'को')} <strong>{t('Hub Bay-4 (Cross-dock staging)', 'हब बे-4 (क्रॉस-डॉक स्टेजिंग)')}</strong> {t('for next scheduled convoy.', 'में स्थानांतरित कर रही है।')}
            </p>

            <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.25)', margin: '14px 0', fontSize: '12px', color: 'var(--text-primary, #334155)' }}>
              <strong>{t('Fine Shield Impact:', 'जुर्माना सुरक्षा प्रभाव:')}</strong> {t('Prevents', 'रोकता है')} <strong>₹{selectedSlip.potentialRtoFineInr.toLocaleString('en-IN')}</strong> {t('penalty and vehicle seizure at highway check-post.', 'का चालान एवं राजमार्ग चेक-पोस्ट पर वाहन जब्ती।')}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCrossDockModal(false)}
                style={{ flex: 1, padding: '10px', background: 'var(--bg-subtle, #f1f5f9)', border: '1px solid var(--border-color, #cbd5e1)', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-primary, #475569)' }}
              >
                {t('Cancel', 'रद्द करें')}
              </button>
              <button
                type="button"
                onClick={() => handleAuthorizeCrossDockDeload(selectedSlip.id)}
                style={{ flex: 2, padding: '10px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
              >
                {t('Confirm Cross-Dock & Unlock Gate-Out', 'क्रॉस-डॉक पुष्टि करें एवं गेट-आउट अनलॉक करें')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. PRINT OFFICIAL DHARAM KANTA SLIP MODAL */}
      {showPrintModal && selectedSlip && (
        <div className="weighbridge-modal-overlay">
          <div className="weighbridge-modal-card print-card">
            <div style={{ textAlign: 'center', borderBottom: '2px dashed var(--border-color, #000)', paddingBottom: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary, #0f172a)' }}>ASK ELECTRONIC WEIGHBRIDGE (DHARAM KANTA)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)' }}>HUB TERMINAL-01 PUNE (GOVT APPROVED 60-TON SCALE)</div>
              <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary, #0f172a)' }}>COMPUTERIZED WEIGHMENT CERTIFICATE</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)' }}>SLIP NO: {selectedSlip.slipNumber} • CALIB ID: {selectedSlip.calibrationCertificateId}</div>
            </div>

            <div style={{ padding: '16px 0', fontSize: '12px', lineHeight: '1.8', borderBottom: '2px dashed var(--border-color, #000)', color: 'var(--text-primary, #0f172a)' }}>
              <div><strong>TRUCK NO:</strong> {selectedSlip.vehicleNumber} ({selectedSlip.axleLabel})</div>
              <div><strong>DRIVER:</strong> {selectedSlip.driverName} ({selectedSlip.driverPhone})</div>
              <div><strong>CONSIGNMENT / BILTY:</strong> {selectedSlip.consignmentNo}</div>
              <div><strong>COMMODITY:</strong> {selectedSlip.materialName}</div>
              <div><strong>TIMESTAMP:</strong> {selectedSlip.weighedAt}</div>
              <hr style={{ border: 'none', borderTop: '1px dashed var(--border-color, #cbd5e1)', margin: '8px 0' }} />
              <div style={{ fontSize: '14px' }}><strong>GROSS WEIGHT:</strong> {selectedSlip.grossWeightKg.toLocaleString('en-IN')} KG</div>
              <div style={{ fontSize: '14px' }}><strong>TARE WEIGHT:</strong> {selectedSlip.tareWeightKg.toLocaleString('en-IN')} KG</div>
              <div style={{ fontSize: '15px', color: '#059669', fontWeight: 900 }}>
                <strong>NET CARGO WEIGHT:</strong> {selectedSlip.netCargoWeightKg.toLocaleString('en-IN')} KG ({(selectedSlip.netCargoWeightKg / 1000).toFixed(2)} Ton)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)' }}>PERMISSIBLE GVW: {selectedSlip.permissibleGvwKg.toLocaleString('en-IN')} KG (Sec 113 MV Act)</div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: selectedSlip.status === 'OVERLOAD_CRITICAL' ? '#dc2626' : '#059669' }}>
                STATUS: {selectedSlip.status === 'OVERLOAD_CRITICAL' ? '🚨 OVERLOAD EXCEEDED' : '✓ LEGAL COMPLIANT'}
              </div>
              <div><strong>SCALE OPERATOR:</strong> {selectedSlip.operatorName}</div>
            </div>

            <div style={{ textAlign: 'center', padding: '12px 0', borderBottom: '2px dashed var(--border-color, #000)', fontSize: '10px', color: 'var(--text-secondary, #64748b)' }}>
              [ SEAL OF ACCREDITATION: WEIGHTS &amp; MEASURES DEPT MAHARASHTRA ]
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                style={{ flex: 1, padding: '9px', background: 'var(--bg-subtle, #f1f5f9)', border: '1px solid var(--border-color, #cbd5e1)', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-primary, #0f172a)' }}
              >
                {t('Close', 'बंद करें')}
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                style={{ flex: 1, padding: '9px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                🖨️ {t('Print Dharam Kanta Slip', 'धर्म कांटा पर्ची प्रिंट करें')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL: ADD VEHICLE TO WEIGHBRIDGE RAMP */}
      {showAddVehicleModal && (
        <div className="weighbridge-modal-overlay" onClick={() => setShowAddVehicleModal(false)}>
          <div className="weighbridge-modal-card" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                  ➕ {t('Add Vehicle to Dharam Kanta Weighbridge', 'धर्म कांटा वेईब्रिज में नया वाहन जोड़ें')}
                </h3>
                <small style={{ color: '#64748b', fontSize: '12px' }}>
                  {t('Register on-ramp truck weighing, gross weight & axle compliance', 'कांटा रैंप पर ट्रक वजन, सकल भार एवं एक्सल अनुपालन दर्ज करें')}
                </small>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVehicleModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* QUICK PRESETS */}
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                ⚡ 1-Click Truck Presets:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                <button type="button" onClick={() => applyVehicleTemplate('tata')} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                  🚛 Tata 16-W (43.5T - Pune)
                </button>
                <button type="button" onClick={() => applyVehicleTemplate('ashok')} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                  🚛 Ashok Leyland 14-W (35T)
                </button>
                <button type="button" onClick={() => applyVehicleTemplate('bharatbenz')} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                  🚛 BharatBenz 14-W (Steel)
                </button>
                <button type="button" onClick={() => applyVehicleTemplate('eicher')} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                  🚛 Eicher 10-W (28T FMCG)
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveAddVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Vehicle Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPlate}
                    onChange={e => setFormPlate(e.target.value.toUpperCase())}
                    placeholder="e.g. MH-14-GH-6021"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', fontWeight: 800, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Truck Model &amp; Specification *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTruckModel}
                    onChange={e => setFormTruckModel(e.target.value)}
                    placeholder="e.g. Tata Signa 4825.TK 16-Wheeler"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Axle Category (RTO Limit) *
                  </label>
                  <select
                    value={formAxleCategory}
                    onChange={e => setFormAxleCategory(e.target.value as VehicleAxleCategory)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="2-AXLE_6WHEEL">2-Axle (6-Wheel) - Limit 18,500 KG (18.5T)</option>
                    <option value="3-AXLE_10WHEEL">3-Axle (10-Wheel) - Limit 28,000 KG (28.0T)</option>
                    <option value="4-AXLE_14WHEEL">4-Axle (14-Wheel) - Limit 35,000 KG (35.0T)</option>
                    <option value="5-AXLE_16WHEEL">5-Axle (16-Wheel) - Limit 43,500 KG (43.5T)</option>
                    <option value="6-AXLE_TRAILER">6-Axle (Trailer) - Limit 55,000 KG (55.0T)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Driver Name &amp; Phone *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <input
                      type="text"
                      required
                      value={formDriverName}
                      onChange={e => setFormDriverName(e.target.value)}
                      placeholder="Driver Name"
                      style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                    <input
                      type="text"
                      required
                      value={formDriverPhone}
                      onChange={e => setFormDriverPhone(e.target.value)}
                      placeholder="+91 Phone"
                      style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Transporter / Fleet Agency
                  </label>
                  <input
                    type="text"
                    value={formTransporterName}
                    onChange={e => setFormTransporterName(e.target.value)}
                    placeholder="e.g. Rajputana Roadways"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Consignment / Bilty No &amp; Material
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <input
                      type="text"
                      value={formConsignmentNo}
                      onChange={e => setFormConsignmentNo(e.target.value)}
                      placeholder="Bilty / LR No"
                      style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                    <input
                      type="text"
                      value={formMaterialName}
                      onChange={e => setFormMaterialName(e.target.value)}
                      placeholder="Material Name"
                      style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Tare Weight (Empty Truck KG) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formTareWeightKg}
                    onChange={e => setFormTareWeightKg(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Gross Scale Weight (Loaded Truck KG) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formGrossWeightKg}
                    onChange={e => setFormGrossWeightKg(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 800, color: '#0f172a', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* LIVE COMPUTATION SUMMARY */}
              <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>NET CARGO: </span>
                  <strong style={{ fontSize: '13px', color: '#15803d' }}>{Math.max(0, formGrossWeightKg - formTareWeightKg).toLocaleString('en-IN')} KG</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>RTO CAP: </span>
                  <strong style={{ fontSize: '13px', color: '#0369a1' }}>{(AXLE_CONFIG_MAP[formAxleCategory]?.limitKg || 43500).toLocaleString('en-IN')} KG</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>STATUS: </span>
                  <strong style={{ fontSize: '13px', color: formGrossWeightKg > (AXLE_CONFIG_MAP[formAxleCategory]?.limitKg || 43500) ? '#dc2626' : '#16a34a' }}>
                    {formGrossWeightKg > (AXLE_CONFIG_MAP[formAxleCategory]?.limitKg || 43500)
                      ? `🚨 OVERLOAD (+${(formGrossWeightKg - (AXLE_CONFIG_MAP[formAxleCategory]?.limitKg || 43500)).toLocaleString('en-IN')} KG)`
                      : '✓ LEGAL COMPLIANT'}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  style={{ padding: '10px 18px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                >
                  🚀 {t('Save & Place on Ramp', 'सेव करें एवं कांटा पर रखें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL: EDIT VEHICLE WEIGHMENT & AXLE RECORD */}
      {showEditVehicleModal && editingSlip && (
        <div className="weighbridge-modal-overlay" onClick={() => setShowEditVehicleModal(false)}>
          <div className="weighbridge-modal-card" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                  ✏️ {t('Edit Vehicle Weighment Record', 'वाहन वजन रिकॉर्ड एडिट करें')}
                </h3>
                <small style={{ color: '#64748b', fontSize: '12px' }}>
                  Slip: {editingSlip.slipNumber} • Truck: {editingSlip.vehicleNumber}
                </small>
              </div>
              <button
                type="button"
                onClick={() => setShowEditVehicleModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Vehicle Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPlate}
                    onChange={e => setFormPlate(e.target.value.toUpperCase())}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', fontWeight: 800, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Truck Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTruckModel}
                    onChange={e => setFormTruckModel(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Axle Category (RTO Limit) *
                  </label>
                  <select
                    value={formAxleCategory}
                    onChange={e => setFormAxleCategory(e.target.value as VehicleAxleCategory)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="2-AXLE_6WHEEL">2-Axle (6-Wheel) - Limit 18,500 KG (18.5T)</option>
                    <option value="3-AXLE_10WHEEL">3-Axle (10-Wheel) - Limit 28,000 KG (28.0T)</option>
                    <option value="4-AXLE_14WHEEL">4-Axle (14-Wheel) - Limit 35,000 KG (35.0T)</option>
                    <option value="5-AXLE_16WHEEL">5-Axle (16-Wheel) - Limit 43,500 KG (43.5T)</option>
                    <option value="6-AXLE_TRAILER">6-Axle (Trailer) - Limit 55,000 KG (55.0T)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Driver Name &amp; Phone *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <input
                      type="text"
                      required
                      value={formDriverName}
                      onChange={e => setFormDriverName(e.target.value)}
                      placeholder="Driver Name"
                      style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                    <input
                      type="text"
                      required
                      value={formDriverPhone}
                      onChange={e => setFormDriverPhone(e.target.value)}
                      placeholder="+91 Phone"
                      style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Tare Weight (Empty Truck KG) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formTareWeightKg}
                    onChange={e => setFormTareWeightKg(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Gross Weight (Loaded Truck KG) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formGrossWeightKg}
                    onChange={e => setFormGrossWeightKg(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 800, color: '#0f172a', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* LIVE COMPUTATION SUMMARY */}
              <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>NET CARGO: </span>
                  <strong style={{ fontSize: '13px', color: '#15803d' }}>{Math.max(0, formGrossWeightKg - formTareWeightKg).toLocaleString('en-IN')} KG</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>RTO CAP: </span>
                  <strong style={{ fontSize: '13px', color: '#0369a1' }}>{(AXLE_CONFIG_MAP[formAxleCategory]?.limitKg || 43500).toLocaleString('en-IN')} KG</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>STATUS: </span>
                  <strong style={{ fontSize: '13px', color: formGrossWeightKg > (AXLE_CONFIG_MAP[formAxleCategory]?.limitKg || 43500) ? '#dc2626' : '#16a34a' }}>
                    {formGrossWeightKg > (AXLE_CONFIG_MAP[formAxleCategory]?.limitKg || 43500)
                      ? `🚨 OVERLOAD (+${(formGrossWeightKg - (AXLE_CONFIG_MAP[formAxleCategory]?.limitKg || 43500)).toLocaleString('en-IN')} KG)`
                      : '✓ LEGAL COMPLIANT'}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditVehicleModal(false)}
                  style={{ padding: '10px 18px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 24px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                >
                  💾 {t('Save Vehicle Changes', 'परिवर्तन सेव करें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
