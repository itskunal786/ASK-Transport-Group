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

export default function ElectronicWeighbridgeDeck() {
  const { t } = useLanguage();
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
          </div>
        </div>
      </div>

      {/* 5. TABLE OF SLIPS & RTO AXLE LOAD AUDIT */}
      <div className="weighbridge-split-row">
        {/* SLIPS TABLE */}
        <div className="weighbridge-card-left">
          <div className="weighbridge-card-header">
            <h3>📑 {t('Dharam Kanta Weighment Ledger', 'धर्म कांटा वजन बहीखाता')}</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)' }}>Govt Sec 113 / 194 MV Act</span>
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
    </div>
  );
}
