import { useState } from 'react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface ReeferTruckRecord {
  id: string;
  plateNo: string;
  driverName: string;
  driverPhone: string;
  cargoType: 'Vaccines & Biologics' | 'Frozen Dairy & Ice Cream' | 'Chilled Fresh Milk' | 'Oncology Pharma';
  targetTempMin: number;
  targetTempMax: number;
  currentTempCelsius: number;
  currentHumidityPercent: number;
  doorSensorStatus: 'Locked (Sealed)' | 'Door Open (Unauthorized)' | 'Dock Loading Open';
  coolingUnitModel: string;
  coolingUnitState: 'Active Eco' | 'High Chill' | 'Defrosting' | 'Compressor Failure Warning';
  currentLocation: string;
  lastPingTime: string;
  status: 'Compliant' | 'Critical Breach' | 'Warning Near Ceiling';
  complianceScorePercent: number;
  cargoValueInr: number;
  tempHistory15Min: { time: string; temp: number; humidity: number; door: string; compliance: boolean }[];
}

export interface ColdChainCertificate {
  certificateId: string;
  consignor: string;
  consignee: string;
  vehicleNo: string;
  cargoDescription: string;
  dispatchTime: string;
  deliveryTime: string;
  totalTripKm: number;
  requiredRange: string;
  minTempRecorded: number;
  maxTempRecorded: number;
  avgTempRecorded: number;
  complianceRating: number;
  auditStandard: string;
  verifiedBy: string;
}

// ==========================================
// MOCK DEFAULT DATA
// ==========================================
const DEFAULT_REEFER_TRUCKS: ReeferTruckRecord[] = [
  {
    id: 'RF-101',
    plateNo: 'MH-04-CC-9912',
    driverName: 'Balwant Singh',
    driverPhone: '+91 97110 99887',
    cargoType: 'Frozen Dairy & Ice Cream',
    targetTempMin: -20,
    targetTempMax: -15,
    currentTempCelsius: -4.8,
    currentHumidityPercent: 84,
    doorSensorStatus: 'Door Open (Unauthorized)',
    coolingUnitModel: 'Thermo King SLXi-400 Deep Freeze',
    coolingUnitState: 'Compressor Failure Warning',
    currentLocation: 'NH-48, KM 248, Highway Layby near Surat Bypass',
    lastPingTime: '1 min ago',
    status: 'Critical Breach',
    complianceScorePercent: 82.4,
    cargoValueInr: 3200000,
    tempHistory15Min: [
      { time: '01:00 AM', temp: -18.2, humidity: 58, door: 'Locked', compliance: true },
      { time: '01:30 AM', temp: -17.9, humidity: 60, door: 'Locked', compliance: true },
      { time: '02:00 AM', temp: -16.8, humidity: 62, door: 'Locked', compliance: true },
      { time: '02:15 AM', temp: -12.4, humidity: 74, door: 'Door Open', compliance: false },
      { time: '02:30 AM', temp: -7.5, humidity: 80, door: 'Door Open', compliance: false },
      { time: '02:45 AM', temp: -4.8, humidity: 84, door: 'Door Open', compliance: false }
    ]
  },
  {
    id: 'RF-102',
    plateNo: 'DL-01-RC-4011',
    driverName: 'Ramesh Yadav',
    driverPhone: '+91 98765 43210',
    cargoType: 'Vaccines & Biologics',
    targetTempMin: -22,
    targetTempMax: -16,
    currentTempCelsius: -19.4,
    currentHumidityPercent: 54,
    doorSensorStatus: 'Locked (Sealed)',
    coolingUnitModel: 'Carrier Transicold Vector 1950',
    coolingUnitState: 'Active Eco',
    currentLocation: 'Delhi-Jaipur Express Highway, KM 118',
    lastPingTime: '45 seconds ago',
    status: 'Compliant',
    complianceScorePercent: 99.8,
    cargoValueInr: 8500000,
    tempHistory15Min: [
      { time: '10:00 AM', temp: -19.8, humidity: 52, door: 'Locked', compliance: true },
      { time: '10:30 AM', temp: -19.5, humidity: 54, door: 'Locked', compliance: true },
      { time: '11:00 AM', temp: -19.2, humidity: 53, door: 'Locked', compliance: true },
      { time: '11:30 AM', temp: -19.4, humidity: 54, door: 'Locked', compliance: true }
    ]
  },
  {
    id: 'RF-103',
    plateNo: 'GJ-06-RF-2210',
    driverName: 'Murugan Swamy',
    driverPhone: '+91 98401 12233',
    cargoType: 'Chilled Fresh Milk',
    targetTempMin: 2,
    targetTempMax: 6,
    currentTempCelsius: 3.6,
    currentHumidityPercent: 68,
    doorSensorStatus: 'Locked (Sealed)',
    coolingUnitModel: 'Carrier Supra 850 Multi-Temp',
    coolingUnitState: 'Active Eco',
    currentLocation: 'Ahmedabad Anand Dairy Corridor, KM 45',
    lastPingTime: '2 mins ago',
    status: 'Compliant',
    complianceScorePercent: 99.2,
    cargoValueInr: 1800000,
    tempHistory15Min: [
      { time: '08:00 AM', temp: 3.4, humidity: 66, door: 'Locked', compliance: true },
      { time: '08:30 AM', temp: 3.5, humidity: 67, door: 'Locked', compliance: true },
      { time: '09:00 AM', temp: 3.6, humidity: 68, door: 'Locked', compliance: true }
    ]
  },
  {
    id: 'RF-104',
    plateNo: 'KA-01-PH-7788',
    driverName: 'Suresh Rawat',
    driverPhone: '+91 98230 45678',
    cargoType: 'Oncology Pharma',
    targetTempMin: 2,
    targetTempMax: 8,
    currentTempCelsius: 7.6,
    currentHumidityPercent: 71,
    doorSensorStatus: 'Locked (Sealed)',
    coolingUnitModel: 'Thermo King T-Series Whisper',
    coolingUnitState: 'High Chill',
    currentLocation: 'Bangalore-Hyderabad NH-44, KM 190',
    lastPingTime: '30 seconds ago',
    status: 'Warning Near Ceiling',
    complianceScorePercent: 94.6,
    cargoValueInr: 6200000,
    tempHistory15Min: [
      { time: '06:00 AM', temp: 5.2, humidity: 65, door: 'Locked', compliance: true },
      { time: '07:00 AM', temp: 6.1, humidity: 67, door: 'Locked', compliance: true },
      { time: '08:00 AM', temp: 7.1, humidity: 69, door: 'Locked', compliance: true },
      { time: '09:00 AM', temp: 7.6, humidity: 71, door: 'Locked', compliance: true }
    ]
  }
];

const DEFAULT_CERTIFICATE: ColdChainCertificate = {
  certificateId: 'WHO-GDP-CERT-2026-9021',
  consignor: 'Serum Institute of India / Tata Healthcare Bio-Hub, Pune',
  consignee: 'Apollo Specialty Hospitals & State Health Vaccine Depot, Delhi',
  vehicleNo: 'DL-01-RC-4011',
  cargoDescription: '120 Boxes COVID & Pediatric Cold-Chain Vaccines (WHO PQS Certified)',
  dispatchTime: '26 Oct 2026, 06:00 AM',
  deliveryTime: '28 Oct 2026, 11:30 AM',
  totalTripKm: 1410,
  requiredRange: '-22.0°C to -16.0°C (Deep Freeze)',
  minTempRecorded: -21.4,
  maxTempRecorded: -17.8,
  avgTempRecorded: -19.4,
  complianceRating: 99.8,
  auditStandard: 'WHO Good Distribution Practices (GDP) & US FDA 21 CFR Part 11 Compliant',
  verifiedBy: 'Dr. Alok Verma, Senior Quality Assurance Lead'
};

export default function ColdChainTemperatureRadar() {
  const [reeferTrucks, setReeferTrucks] = useState<ReeferTruckRecord[]>(DEFAULT_REEFER_TRUCKS);
  const [selectedTruck, setSelectedTruck] = useState<ReeferTruckRecord | null>(DEFAULT_REEFER_TRUCKS[0]);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Critical Breach' | 'Warning Near Ceiling' | 'Compliant'>('All');
  const [activeView, setActiveView] = useState<'live_telemetry' | 'compliance_certificate' | 'door_tamper_log'>('live_telemetry');
  const [certificate] = useState<ColdChainCertificate>(DEFAULT_CERTIFICATE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAlertRinging, setIsAlertRinging] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Safe synthesized audio alert for temperature breach
  const playTempBreachSiren = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.25);
      osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.5);
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.75);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.0);
    } catch {
      // Audio fallback
    }
  };

  // Simulate Temperature Breach and Door Tamper Alert
  const simulateTemperatureBreach = () => {
    playTempBreachSiren();
    setIsAlertRinging(true);

    const targetPlate = 'DL-01-RC-4011';
    setReeferTrucks(prev =>
      prev.map(t => {
        if (t.plateNo === targetPlate) {
          return {
            ...t,
            currentTempCelsius: -6.2,
            currentHumidityPercent: 88,
            doorSensorStatus: 'Door Open (Unauthorized)',
            coolingUnitState: 'Compressor Failure Warning',
            status: 'Critical Breach',
            complianceScorePercent: 78.5,
            tempHistory15Min: [
              ...t.tempHistory15Min,
              { time: 'Just Now', temp: -6.2, humidity: 88, door: 'Door Open (Breach)', compliance: false }
            ]
          };
        }
        return t;
      })
    );

    showToast(`🚨 CRITICAL COLD-CHAIN BREACH: ${targetPlate} temp surged to -6.2°C! Rear door open detected outside geofence.`);
    setTimeout(() => setIsAlertRinging(false), 5000);
  };

  const dispatchWhatsAppBreachAlert = (truck: ReeferTruckRecord) => {
    const text = `🚨 *ASK COLD-CHAIN CRITICAL BREACH ALERT* 🚨\n\n*Vehicle No:* ${truck.plateNo}\n*Driver:* ${truck.driverName} (${truck.driverPhone})\n*Cargo:* ${truck.cargoType} (Valued at ₹${(truck.cargoValueInr / 100000).toFixed(1)} Lakhs)\n*Temperature:* ${truck.currentTempCelsius}°C (Required: ${truck.targetTempMin}°C to ${truck.targetTempMax}°C)\n*Door Sensor:* ${truck.doorSensorStatus}\n*Location:* ${truck.currentLocation}\n\n*Action Required:* Driver contacted & emergency mobile reefer service dispatched immediately.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast(`✓ Cold-Chain Breach Alert dispatched to Pharma Quality Auditor & SuperAdmin!`);
  };

  const filteredTrucks = reeferTrucks.filter(t => {
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    return true;
  });

  const criticalCount = reeferTrucks.filter(t => t.status === 'Critical Breach').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            background: '#0c4a6e',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 99999,
            fontSize: '13px',
            fontWeight: 700,
            borderLeft: '4px solid #ef4444'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* HERO BANNER */}
      <div
        style={{
          background: isAlertRinging
            ? 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #991b1b 100%)'
            : 'linear-gradient(135deg, #075985 0%, #0369a1 50%, #0284c7 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: isAlertRinging ? '0 0 35px rgba(239, 68, 68, 0.7)' : '0 10px 25px -5px rgba(3, 105, 161, 0.4)',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(4px)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.6px',
              marginBottom: '8px'
            }}
          >
            <span>❄️</span> WHO-GDP COMPLIANT IOT COLD-CHAIN TELEMETRY RADAR
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            IoT Cold-Chain &amp; Perishable Temperature/Humidity Radar
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#e0f2fe', lineHeight: 1.5 }}>
            Monitors real-time Reefer container temperatures (°C), humidity (RH%) and magnetic rear door open sensors. Triggers emergency alerts on temperature spikes and generates 15-minute interval compliance certificates for hospitals &amp; dairy plants.
          </p>
        </div>

        {/* DEMO SIMULATOR ACTION BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={simulateTemperatureBreach}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.45)'
            }}
            title="Simulate temperature breach and door tamper to test live siren and WhatsApp alert"
          >
            <span>🚨</span> Simulate Temp Breach &amp; Door Tamper
          </button>
        </div>
      </div>

      {/* KPI TILES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
            <span>Active Reefer Fleet</span>
            <span>❄️ IOT SENSORS</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
            4 <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>Reefer Units</span>
          </div>
          <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 700, marginTop: '4px' }}>
            100% Dual-Zone Sensors Active
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
            <span>Breach &amp; Tamper Radar</span>
            <span style={{ color: criticalCount > 0 ? '#ef4444' : '#10b981' }}>🔴 ALERTS</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: criticalCount > 0 ? '#ef4444' : '#10b981', marginTop: '6px' }}>
            {criticalCount} <span style={{ fontSize: '14px', fontWeight: 700 }}>Breaches Flagged</span>
          </div>
          <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700, marginTop: '4px' }}>
            1 Unauthorized Rear Door Open
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
            <span>Protected Cargo Value</span>
            <span>🏥 PHARMA &amp; DAIRY</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#059669', marginTop: '6px' }}>
            ₹1.97 <span style={{ fontSize: '14px', fontWeight: 700 }}>Crores</span>
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginTop: '4px' }}>
            Zero Spoilage Insurance Claim
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
            <span>GDP Quality Score</span>
            <span>⭐ WHO STANDARD</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0284c7', marginTop: '6px' }}>
            99.2%
          </div>
          <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 700, marginTop: '4px' }}>
            Grade A Certified Compliance
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border-color, #e2e8f0)', paddingBottom: '2px' }}>
        <button
          type="button"
          onClick={() => setActiveView('live_telemetry')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeView === 'live_telemetry' ? '#0284c7' : '#64748b',
            borderBottom: activeView === 'live_telemetry' ? '3px solid #0284c7' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📡</span> Live Reefer Climate Telemetry ({reeferTrucks.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveView('compliance_certificate')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeView === 'compliance_certificate' ? '#059669' : '#64748b',
            borderBottom: activeView === 'compliance_certificate' ? '3px solid #059669' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📜</span> Digital Cold-Chain Quality Certificate (WHO-GDP)
        </button>

        <button
          type="button"
          onClick={() => setActiveView('door_tamper_log')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeView === 'door_tamper_log' ? '#ef4444' : '#64748b',
            borderBottom: activeView === 'door_tamper_log' ? '3px solid #ef4444' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🚨</span> Door Tamper &amp; Breach Log
          {criticalCount > 0 && (
            <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>
              CRITICAL
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: LIVE REEFER TELEMETRY */}
      {activeView === 'live_telemetry' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          {/* LEFT: LIST OF REEFER TRUCKS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* FILTER BUTTONS */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['All', 'Critical Breach', 'Warning Near Ceiling', 'Compliant'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterStatus(f)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: filterStatus === f ? '#0284c7' : 'var(--bg-surface, #ffffff)',
                    color: filterStatus === f ? '#ffffff' : '#64748b'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* TRUCKS CARDS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredTrucks.map(truck => {
                const isSelected = selectedTruck?.id === truck.id;
                const isBreach = truck.status === 'Critical Breach';
                const isWarning = truck.status === 'Warning Near Ceiling';

                return (
                  <div
                    key={truck.id}
                    onClick={() => setSelectedTruck(truck)}
                    style={{
                      background: isBreach
                        ? 'rgba(239, 68, 68, 0.08)'
                        : isWarning
                        ? 'rgba(245, 158, 11, 0.08)'
                        : isSelected
                        ? 'rgba(2, 132, 199, 0.06)'
                        : 'var(--bg-surface, #ffffff)',
                      border: isBreach
                        ? '2px solid #ef4444'
                        : isWarning
                        ? '2px solid #f59e0b'
                        : isSelected
                        ? '2px solid #0284c7'
                        : '1px solid var(--border-color, #e2e8f0)',
                      borderRadius: '12px',
                      padding: '16px 18px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '15px', color: 'var(--text-primary, #0f172a)' }}>{truck.plateNo}</strong>
                          <span
                            style={{
                              background: isBreach ? '#ef4444' : isWarning ? '#f59e0b' : '#059669',
                              color: '#ffffff',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '10px'
                            }}
                          >
                            {truck.status.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          📦 {truck.cargoType} • ₹{(truck.cargoValueInr / 100000).toFixed(1)}L Cargo Value
                        </div>
                      </div>

                      {/* TEMPERATURE GAUGE PILL */}
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontSize: '22px',
                            fontWeight: 900,
                            color: isBreach ? '#ef4444' : isWarning ? '#d97706' : '#0284c7'
                          }}
                        >
                          {truck.currentTempCelsius > 0 ? `+${truck.currentTempCelsius}` : truck.currentTempCelsius}°C
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Target: {truck.targetTempMin}°C to {truck.targetTempMax}°C
                        </div>
                      </div>
                    </div>

                    {/* STATUS STRIP */}
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#334155' }}>
                      <div>
                        🚪 Door: <strong style={{ color: truck.doorSensorStatus.includes('Open') ? '#ef4444' : '#059669' }}>{truck.doorSensorStatus}</strong>
                      </div>
                      <div>
                        💧 Humidity: <strong>{truck.currentHumidityPercent}% RH</strong>
                      </div>
                      <div>
                        ⚡ Unit: <strong>{truck.coolingUnitState}</strong>
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                      📍 {truck.currentLocation} • 👨‍✈️ Driver: {truck.driverName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: SELECTED REEFER CLIMATE DETAIL & 15-MIN INTERVAL GRAPH */}
          {selectedTruck ? (
            <div style={{ background: 'var(--bg-surface, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Reefer Climate Data Logger</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Truck: {selectedTruck.plateNo} • {selectedTruck.coolingUnitModel}</div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
                  Compliance: {selectedTruck.complianceScorePercent}%
                </span>
              </div>

              {/* CURRENT LIVE READOUT CARD */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>Internal Cargo Temp</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: selectedTruck.status === 'Critical Breach' ? '#ef4444' : '#0284c7' }}>
                    {selectedTruck.currentTempCelsius > 0 ? `+${selectedTruck.currentTempCelsius}` : selectedTruck.currentTempCelsius}°C
                  </div>
                  <div style={{ fontSize: '11px', color: '#0369a1' }}>
                    Target: {selectedTruck.targetTempMin}°C to {selectedTruck.targetTempMax}°C
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>Relative Humidity</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>
                    {selectedTruck.currentHumidityPercent}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#0369a1' }}>
                    Door: {selectedTruck.doorSensorStatus}
                  </div>
                </div>
              </div>

              {/* 15-MINUTE INTERVAL AUDIT TABLE */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: '#334155' }}>
                  15-Minute Data Logger Audit Log (Trip History)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                  {selectedTruck.tempHistory15Min.map((pt, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: !pt.compliance ? '#fee2e2' : '#f8fafc',
                        color: !pt.compliance ? '#b91c1c' : '#334155',
                        fontWeight: !pt.compliance ? 700 : 500,
                        border: !pt.compliance ? '1px solid #fca5a5' : '1px solid #f1f5f9'
                      }}
                    >
                      <span>⏱️ {pt.time}</span>
                      <span>🌡️ {pt.temp > 0 ? `+${pt.temp}` : pt.temp}°C</span>
                      <span>💧 {pt.humidity}%</span>
                      <span>🚪 {pt.door}</span>
                      <span>{pt.compliance ? '✅ Safe' : '🚨 Breach'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              {selectedTruck.status === 'Critical Breach' && (
                <button
                  type="button"
                  onClick={() => dispatchWhatsAppBreachAlert(selectedTruck)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>📲</span> Dispatch Emergency WhatsApp to Quality Controller
                </button>
              )}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Select a reefer truck from the list to inspect its dual-zone temperature logger.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DIGITAL QUALITY CERTIFICATE (WHO-GDP COMPLIANCE) */}
      {activeView === 'compliance_certificate' && (
        <div style={{ background: 'var(--bg-surface, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '16px', padding: '32px', maxWidth: '850px', margin: '0 auto', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
          {/* CERTIFICATE HEADER */}
          <div style={{ borderBottom: '3px solid #0284c7', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', letterSpacing: '1px', textTransform: 'uppercase' }}>
                OFFICIAL COLD-CHAIN INTEGRITY REPORT
              </div>
              <h2 style={{ margin: '4px 0 2px', fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>
                Digital Temperature Compliance Certificate
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Issued under WHO Good Distribution Practices (GDP) &amp; US FDA 21 CFR Part 11
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                Cert ID: <span style={{ color: '#0284c7' }}>{certificate.certificateId}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>
                ✓ Digitally Signed &amp; Blockchain Verified
              </div>
            </div>
          </div>

          {/* SHIPMENT METADATA GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Consignor (Sender):</div>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{certificate.consignor}</strong>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Consignee (Receiver):</div>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{certificate.consignee}</strong>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Vehicle &amp; Cargo:</div>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{certificate.vehicleNo} • {certificate.cargoDescription}</strong>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Transit Corridor:</div>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{certificate.totalTripKm} KM ({certificate.dispatchTime} to {certificate.deliveryTime})</strong>
            </div>
          </div>

          {/* CLIMATE AUDIT METRICS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#f0f9ff', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: 700 }}>REQUIRED RANGE</div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{certificate.requiredRange}</div>
            </div>
            <div style={{ background: '#f0f9ff', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: 700 }}>AVERAGE TEMP</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#0284c7', marginTop: '4px' }}>{certificate.avgTempRecorded}°C</div>
            </div>
            <div style={{ background: '#f0f9ff', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: 700 }}>MIN / MAX RECORDED</div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{certificate.minTempRecorded}°C / {certificate.maxTempRecorded}°C</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>COMPLIANCE SCORE</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>{certificate.complianceRating}% (Grade A)</div>
            </div>
          </div>

          {/* VERIFICATION SIGN OFF */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Auditor: <strong>{certificate.verifiedBy}</strong>
            </div>

            <button
              type="button"
              onClick={() => showToast('✓ Official WHO-GDP Digital Compliance Certificate (PDF) generated!')}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
              }}
            >
              <span>📥</span> Download Official Certificate PDF
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: DOOR TAMPER & BREACH RADAR LOG */}
      {activeView === 'door_tamper_log' && (
        <div style={{ background: 'var(--bg-surface, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800 }}>🚨 Cold-Chain Tamper &amp; Door Sensor Alarm Feed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                    UNAUTHORIZED DOOR OPEN
                  </span>
                  <strong style={{ fontSize: '14px' }}>MH-04-CC-9912</strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Today at 02:15 AM</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#991b1b', marginTop: '4px' }}>
                  Rear cargo doors opened outside authorized geofenced delivery hub. Location: NH-48 Surat Highway Layby. Temp surged from -17.9°C to -4.8°C.
                </div>
              </div>
              <button
                type="button"
                onClick={() => dispatchWhatsAppBreachAlert(DEFAULT_REEFER_TRUCKS[0])}
                style={{ padding: '8px 14px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Alert Security Desk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
