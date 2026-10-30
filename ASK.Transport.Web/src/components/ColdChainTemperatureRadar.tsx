import { useState } from 'react';
import {
  ThermometerSnowflake,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Radio,
  FileText,
  DoorClosed,
  DoorOpen,
  Thermometer,
  Droplets,
  Zap,
  MapPin,
  User,
  Clock,
  Download,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './ColdChainTemperatureRadar.css';

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
  const { t } = useLanguage();
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

    showToast(`CRITICAL COLD-CHAIN BREACH: ${targetPlate} temp surged to -6.2°C! Rear door open detected outside geofence.`);
    setTimeout(() => setIsAlertRinging(false), 5000);
  };

  const dispatchWhatsAppBreachAlert = (truck: ReeferTruckRecord) => {
    const text = `*ASK COLD-CHAIN CRITICAL BREACH ALERT*\n\n*Vehicle No:* ${truck.plateNo}\n*Driver:* ${truck.driverName} (${truck.driverPhone})\n*Cargo:* ${truck.cargoType} (Valued at ₹${(truck.cargoValueInr / 100000).toFixed(1)} Lakhs)\n*Temperature:* ${truck.currentTempCelsius}°C (Required: ${truck.targetTempMin}°C to ${truck.targetTempMax}°C)\n*Door Sensor:* ${truck.doorSensorStatus}\n*Location:* ${truck.currentLocation}\n\n*Action Required:* Driver contacted & emergency mobile reefer service dispatched immediately.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast(`Cold-Chain Breach Alert dispatched to Pharma Quality Auditor & SuperAdmin!`);
  };

  const filteredTrucks = reeferTrucks.filter(t => {
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    return true;
  });

  const criticalCount = reeferTrucks.filter(t => t.status === 'Critical Breach').length;

  return (
    <div className="coldchain-container">
      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div className="coldchain-toast">
          <AlertTriangle style={{ width: '18px', height: '18px', color: '#ef4444', flexShrink: 0 }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HERO BANNER */}
      <div
        className="coldchain-banner"
        style={isAlertRinging ? {
          background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #991b1b 100%)',
          borderColor: '#ef4444',
          boxShadow: '0 0 35px rgba(239, 68, 68, 0.7)'
        } : undefined}
      >
        <div>
          <div className="coldchain-tag">
            <ThermometerSnowflake style={{ width: '14px', height: '14px', color: '#bae6fd' }} />
            <span>{t('WHO-GDP COMPLIANT IOT COLD-CHAIN TELEMETRY RADAR', 'डब्ल्यूएचओ-जीडीपी प्रमाणित आईओटी कोल्ड-चेन रडार')}</span>
          </div>
          <h1>
            {t('IoT Cold-Chain & Perishable Temperature/Humidity Radar', 'आईओटी कोल्ड-चेन एवं तापमान/आर्द्रता रडार')}
          </h1>
          <p>
            {t(
              'Monitors real-time Reefer container temperatures (°C), humidity (RH%) and magnetic rear door open sensors. Triggers emergency alerts on temperature spikes and generates 15-minute interval compliance certificates for hospitals & dairy plants.',
              'रीफर कंटेनर तापमान (°C), आर्द्रता (RH%) एवं चुंबकीय रियर डोर सेंसर की लाइव निगरानी। तापमान बढ़ने पर आपातकालीन अलर्ट एवं 15 मिनट के अंतराल पर अनुपालन प्रमाण पत्र जारी करता है।'
            )}
          </p>
        </div>

        {/* DEMO SIMULATOR ACTION BUTTON */}
        <div>
          <button
            type="button"
            onClick={simulateTemperatureBreach}
            className="coldchain-btn-breach"
            title="Simulate temperature breach and door tamper to test live siren and WhatsApp alert"
          >
            <AlertTriangle style={{ width: '16px', height: '16px' }} />
            <span>{t('Simulate Temp Breach & Door Tamper', 'तापमान उल्लंघन व छेड़छाड़ सिम्युलेट करें')}</span>
          </button>
        </div>
      </div>

      {/* KPI TILES */}
      <div className="coldchain-kpis-grid">
        <div className="coldchain-kpi-card">
          <div className="coldchain-kpi-head">
            <span>{t('Active Reefer Fleet', 'सक्रिय रीफर फ्लीट')}</span>
            <span className="coldchain-kpi-badge" style={{ color: '#0284c7' }}>
              <ThermometerSnowflake style={{ width: '13px', height: '13px' }} /> IOT SENSORS
            </span>
          </div>
          <div className="coldchain-kpi-value">
            4 <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>{t('Reefer Units', 'रीफर यूनिट्स')}</span>
          </div>
          <span className="coldchain-kpi-sub" style={{ color: '#0284c7' }}>
            {t('100% Dual-Zone Sensors Active', '100% डुअल-ज़ोन सेंसर सक्रिय')}
          </span>
        </div>

        <div className="coldchain-kpi-card">
          <div className="coldchain-kpi-head">
            <span>{t('Breach & Tamper Radar', 'उल्लंघन एवं छेड़छाड़ रडार')}</span>
            <span className="coldchain-kpi-badge" style={{ color: criticalCount > 0 ? '#ef4444' : '#10b981' }}>
              <AlertTriangle style={{ width: '13px', height: '13px' }} /> ALERTS
            </span>
          </div>
          <div className="coldchain-kpi-value" style={{ color: criticalCount > 0 ? '#ef4444' : '#10b981' }}>
            {criticalCount} <span style={{ fontSize: '14px', fontWeight: 700 }}>{t('Breaches Flagged', 'उल्लंघन चिह्नित')}</span>
          </div>
          <span className="coldchain-kpi-sub" style={{ color: '#ef4444' }}>
            {t('1 Unauthorized Rear Door Open', '1 अनधिकृत रियर दरवाजा खुला')}
          </span>
        </div>

        <div className="coldchain-kpi-card">
          <div className="coldchain-kpi-head">
            <span>{t('Protected Cargo Value', 'सुरक्षित माल का मूल्य')}</span>
            <span className="coldchain-kpi-badge" style={{ color: '#10b981' }}>
              <Building2 style={{ width: '13px', height: '13px' }} /> PHARMA &amp; DAIRY
            </span>
          </div>
          <div className="coldchain-kpi-value" style={{ color: '#10b981' }}>
            ₹1.97 <span style={{ fontSize: '14px', fontWeight: 700 }}>{t('Crores', 'करोड़')}</span>
          </div>
          <span className="coldchain-kpi-sub" style={{ color: '#10b981' }}>
            {t('Zero Spoilage Insurance Claim', 'शून्य नुकसान बीमा दावा')}
          </span>
        </div>

        <div className="coldchain-kpi-card">
          <div className="coldchain-kpi-head">
            <span>{t('GDP Quality Score', 'जीडीपी गुणवत्ता स्कोर')}</span>
            <span className="coldchain-kpi-badge" style={{ color: '#0284c7' }}>
              <ShieldCheck style={{ width: '13px', height: '13px' }} /> WHO STANDARD
            </span>
          </div>
          <div className="coldchain-kpi-value">
            99.2%
          </div>
          <span className="coldchain-kpi-sub" style={{ color: '#0284c7' }}>
            {t('Grade A Certified Compliance', 'ग्रेड ए प्रमाणित अनुपालन')}
          </span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="coldchain-subtabs-row">
        <button
          type="button"
          onClick={() => setActiveView('live_telemetry')}
          className={`coldchain-subtab-btn ${activeView === 'live_telemetry' ? 'active-blue' : ''}`}
        >
          <Radio style={{ width: '16px', height: '16px' }} />
          <span>{t('Live Reefer Climate Telemetry', 'लाइव रीफर क्लाइमेट टेलीमेट्री')} ({reeferTrucks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('compliance_certificate')}
          className={`coldchain-subtab-btn ${activeView === 'compliance_certificate' ? 'active-green' : ''}`}
        >
          <FileText style={{ width: '16px', height: '16px' }} />
          <span>{t('Digital Cold-Chain Quality Certificate (WHO-GDP)', 'डिजिटल कोल्ड-चेन प्रमाण पत्र (WHO-GDP)')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('door_tamper_log')}
          className={`coldchain-subtab-btn ${activeView === 'door_tamper_log' ? 'active-red' : ''}`}
        >
          <AlertTriangle style={{ width: '16px', height: '16px', color: '#ef4444' }} />
          <span>{t('Door Tamper & Breach Log', 'डोर छेड़छाड़ एवं उल्लंघन लॉग')}</span>
          {criticalCount > 0 && (
            <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>
              CRITICAL
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: LIVE REEFER TELEMETRY */}
      {activeView === 'live_telemetry' && (
        <div className="coldchain-split-view">
          {/* LEFT: LIST OF REEFER TRUCKS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* FILTER BUTTONS */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['All', 'Critical Breach', 'Warning Near Ceiling', 'Compliant'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterStatus(f)}
                  className={`coldchain-filter-pill ${filterStatus === f ? 'active' : ''}`}
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
                    className={`coldchain-truck-card ${isSelected ? 'selected' : ''} ${isBreach ? 'breach-border' : isWarning ? 'warning-border' : ''}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '15px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{truck.plateNo}</strong>
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
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {truck.cargoType} • ₹{(truck.cargoValueInr / 100000).toFixed(1)}L Cargo Value
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
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          Target: {truck.targetTempMin}°C to {truck.targetTempMax}°C
                        </div>
                      </div>
                    </div>

                    {/* STATUS STRIP */}
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {truck.doorSensorStatus.includes('Open') ? (
                          <DoorOpen style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                        ) : (
                          <DoorClosed style={{ width: '14px', height: '14px', color: '#059669' }} />
                        )}
                        <span>Door: <strong style={{ color: truck.doorSensorStatus.includes('Open') ? '#ef4444' : '#059669' }}>{truck.doorSensorStatus}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Droplets style={{ width: '13px', height: '13px', color: '#0284c7' }} />
                        <span>Humidity: <strong>{truck.currentHumidityPercent}% RH</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Zap style={{ width: '13px', height: '13px', color: '#f59e0b' }} />
                        <span>Unit: <strong>{truck.coolingUnitState}</strong></span>
                      </div>
                    </div>

                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin style={{ width: '12px', height: '12px' }} />
                        <span>{truck.currentLocation}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User style={{ width: '12px', height: '12px' }} />
                        <span>{truck.driverName}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: SELECTED REEFER CLIMATE DETAIL & 15-MIN INTERVAL GRAPH */}
          {selectedTruck ? (
            <div className="coldchain-inspect-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{t('Reefer Climate Data Logger', 'रीफर क्लाइमेट डेटा लॉगर')}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Truck: <strong style={{ fontFamily: 'monospace' }}>{selectedTruck.plateNo}</strong> • {selectedTruck.coolingUnitModel}
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.3)' }}>
                  Compliance: {selectedTruck.complianceScorePercent}%
                </span>
              </div>

              {/* CURRENT LIVE READOUT CARD */}
              <div className="coldchain-readout-grid">
                <div>
                  <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase' }}>
                    {t('Internal Cargo Temp', 'आंतरिक माल तापमान')}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: selectedTruck.status === 'Critical Breach' ? '#ef4444' : '#0284c7', marginTop: '4px' }}>
                    {selectedTruck.currentTempCelsius > 0 ? `+${selectedTruck.currentTempCelsius}` : selectedTruck.currentTempCelsius}°C
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Target: {selectedTruck.targetTempMin}°C to {selectedTruck.targetTempMax}°C
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase' }}>
                    {t('Relative Humidity', 'सापेक्ष आर्द्रता')}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {selectedTruck.currentHumidityPercent}%
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Door: {selectedTruck.doorSensorStatus}
                  </div>
                </div>
              </div>

              {/* 15-MINUTE INTERVAL AUDIT TABLE */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800 }}>
                  {t('15-Minute Data Logger Audit Log (Trip History)', '15-मिनट डेटा लॉगर ऑडिट लॉग (ट्रिप हिस्ट्री)')}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                  {selectedTruck.tempHistory15Min.map((pt, idx) => (
                    <div
                      key={idx}
                      className={`coldchain-log-row ${!pt.compliance ? 'breach-alert' : ''}`}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock style={{ width: '12px', height: '12px' }} />
                        {pt.time}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Thermometer style={{ width: '12px', height: '12px' }} />
                        {pt.temp > 0 ? `+${pt.temp}` : pt.temp}°C
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Droplets style={{ width: '12px', height: '12px' }} />
                        {pt.humidity}%
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {pt.door.includes('Open') ? <DoorOpen style={{ width: '12px', height: '12px', color: '#ef4444' }} /> : <DoorClosed style={{ width: '12px', height: '12px', color: '#059669' }} />}
                        {pt.door}
                      </span>
                      <span>
                        {pt.compliance ? (
                          <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <CheckCircle2 style={{ width: '12px', height: '12px' }} /> Safe
                          </span>
                        ) : (
                          <span style={{ color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <AlertTriangle style={{ width: '12px', height: '12px' }} /> Breach
                          </span>
                        )}
                      </span>
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
                    padding: '12px 14px',
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
                    gap: '8px'
                  }}
                >
                  <MessageSquare style={{ width: '16px', height: '16px' }} />
                  <span>{t('Dispatch Emergency WhatsApp to Quality Controller', 'क्वालिटी कंट्रोलर को आपातकालीन व्हाट्सएप भेजें')}</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              {t('Select a reefer truck from the list to inspect its dual-zone temperature logger.', 'डुअल-ज़ोन तापमान लॉगर देखने के लिए रीफर ट्रक चुनें।')}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DIGITAL QUALITY CERTIFICATE (WHO-GDP COMPLIANCE) */}
      {activeView === 'compliance_certificate' && (
        <div className="coldchain-cert-card">
          {/* CERTIFICATE HEADER */}
          <div className="coldchain-cert-header">
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {t('OFFICIAL COLD-CHAIN INTEGRITY REPORT', 'आधिकारिक कोल्ड-चेन अखंडता रिपोर्ट')}
              </div>
              <h2 style={{ margin: '4px 0 2px', fontSize: '22px', fontWeight: 900 }}>
                {t('Digital Temperature Compliance Certificate', 'डिजिटल तापमान अनुपालन प्रमाण पत्र')}
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Issued under WHO Good Distribution Practices (GDP) &amp; US FDA 21 CFR Part 11
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 800 }}>
                Cert ID: <span style={{ color: '#0284c7', fontFamily: 'monospace' }}>{certificate.certificateId}</span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#10b981', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                <span>{t('Digitally Signed & Blockchain Verified', 'डिजिटल रूप से हस्ताक्षरित व ब्लॉकचेन सत्यापित')}</span>
              </div>
            </div>
          </div>

          {/* SHIPMENT METADATA GRID */}
          <div className="coldchain-cert-meta">
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t('Consignor (Sender):', 'प्रेषक (कंसाइनर):')}</div>
              <strong style={{ fontSize: '13px' }}>{certificate.consignor}</strong>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t('Consignee (Receiver):', 'प्राप्तकर्ता (कंसाइनी):')}</div>
              <strong style={{ fontSize: '13px' }}>{certificate.consignee}</strong>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t('Vehicle & Cargo:', 'वाहन एवं माल:')}</div>
              <strong style={{ fontSize: '13px' }}>{certificate.vehicleNo} • {certificate.cargoDescription}</strong>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t('Transit Corridor:', 'पारगमन कॉरिडोर:')}</div>
              <strong style={{ fontSize: '13px' }}>{certificate.totalTripKm} KM ({certificate.dispatchTime} to {certificate.deliveryTime})</strong>
            </div>
          </div>

          {/* CLIMATE AUDIT METRICS */}
          <div className="coldchain-cert-metrics">
            <div className="coldchain-cert-tile">
              <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 800 }}>{t('REQUIRED RANGE', 'आवश्यक सीमा')}</div>
              <div style={{ fontSize: '13px', fontWeight: 900, marginTop: '4px' }}>{certificate.requiredRange}</div>
            </div>
            <div className="coldchain-cert-tile">
              <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 800 }}>{t('AVERAGE TEMP', 'औसत तापमान')}</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#0284c7', marginTop: '4px' }}>{certificate.avgTempRecorded}°C</div>
            </div>
            <div className="coldchain-cert-tile">
              <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 800 }}>{t('MIN / MAX RECORDED', 'न्यूनतम / अधिकतम दर्ज')}</div>
              <div style={{ fontSize: '13.5px', fontWeight: 900, marginTop: '4px' }}>{certificate.minTempRecorded}°C / {certificate.maxTempRecorded}°C</div>
            </div>
            <div className="coldchain-cert-tile" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 800 }}>{t('COMPLIANCE SCORE', 'अनुपालन स्कोर')}</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>{certificate.complianceRating}% (Grade A)</div>
            </div>
          </div>

          {/* VERIFICATION SIGN OFF */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {t('Auditor:', 'लेखा परीक्षक:')} <strong style={{ color: 'var(--text-primary)' }}>{certificate.verifiedBy}</strong>
            </div>

            <button
              type="button"
              onClick={() => showToast(t('Official WHO-GDP Digital Compliance Certificate (PDF) generated!', 'आधिकारिक WHO-GDP डिजिटल प्रमाण पत्र (PDF) तैयार किया गया!'))}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
              }}
            >
              <Download style={{ width: '15px', height: '15px' }} />
              <span>{t('Download Official Certificate PDF', 'आधिकारिक प्रमाण पत्र डाउनलोड करें')}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: DOOR TAMPER & BREACH RADAR LOG */}
      {activeView === 'door_tamper_log' && (
        <div className="coldchain-tamper-card">
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle style={{ width: '18px', height: '18px', color: '#ef4444' }} />
            <span>{t('Cold-Chain Tamper & Door Sensor Alarm Feed', 'कोल्ड-चेन छेड़छाड़ एवं डोर सेंसर अलार्म फीड')}</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="coldchain-tamper-feed-item">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                    UNAUTHORIZED DOOR OPEN
                  </span>
                  <strong style={{ fontSize: '14px', fontFamily: 'monospace' }}>MH-04-CC-9912</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Today at 02:15 AM</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#dc2626', marginTop: '6px' }}>
                  {t(
                    'Rear cargo doors opened outside authorized geofenced delivery hub. Location: NH-48 Surat Highway Layby. Temp surged from -17.9°C to -4.8°C.',
                    'अधिकृत जियोफेंस से बाहर रियर दरवाजे खोले गए। स्थान: एनएच-48 सूरत हाईवे। तापमान -17.9°C से बढ़कर -4.8°C हो गया।'
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => dispatchWhatsAppBreachAlert(DEFAULT_REEFER_TRUCKS[0])}
                style={{ padding: '9px 16px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {t('Alert Security Desk', 'सुरक्षा डेस्क को अलर्ट करें')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
