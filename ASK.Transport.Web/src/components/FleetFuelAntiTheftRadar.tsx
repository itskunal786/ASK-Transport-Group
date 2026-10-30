import { useState } from 'react';
import {
  Fuel,
  ShieldAlert,
  AlertTriangle,
  Radio,
  BarChart3,
  TrendingUp,
  Gauge,
  Award,
  User,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Zap,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './FleetFuelAntiTheftRadar.css';

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface FuelTruckRecord {
  id: string;
  plateNo: string;
  driverName: string;
  driverPhone: string;
  vehicleModel: string;
  tankCapacityLiters: number;
  currentFuelLiters: number;
  fuelPercent: number;
  sensorHealth: 'Optimal' | 'Calibrating' | 'Signal Lost';
  sensorType: 'Capacitive Digital Rod' | 'Ultrasonic High-Precision';
  engineStatus: 'Running (Highway)' | 'Idling' | 'Stopped (Parked)';
  speedKmH: number;
  currentLocation: string;
  lastPingTime: string;
  status: 'Normal' | 'Theft Alert' | 'Low Fuel' | 'Refuel Detected';
  tripGpsKm: number;
  tripFuelConsumedLiters: number;
  tripActualMileageKmpl: number;
  expectedBenchmarkKmpl: number;
  fuelTheftRisk: 'High' | 'Medium' | 'Low' | 'Critical Detected';
  fuelDrainHistory: { time: string; liters: number; event?: string }[];
}

export interface TheftIncidentLog {
  id: string;
  plateNo: string;
  driverName: string;
  driverPhone: string;
  timestamp: string;
  location: string;
  stolenLiters: number;
  estimatedLossInr: number;
  drainDurationMinutes: number;
  engineStateDuringDrop: string;
  status: 'Immediate Action Required' | 'Driver Interrogated' | 'Resolved / FIR Lodged';
  gpsCoordinates: { lat: number; lng: number };
}

export interface MileageAuditItem {
  plateNo: string;
  driverName: string;
  routeCorridor: string;
  gpsDistanceKm: number;
  fuelConsumedLiters: number;
  actualMileageKmpl: number;
  benchmarkKmpl: number;
  variancePercent: number;
  rank: number;
  badge: 'Gold Saver' | 'Silver Normal' | 'Heavy Foot' | 'Pilferage Suspect';
}

// ==========================================
// MOCK DEFAULT DATA
// ==========================================
const DEFAULT_THEFT_INCIDENTS: TheftIncidentLog[] = [
  {
    id: 'THEFT-9841',
    plateNo: 'MH-12-PQ-9081',
    driverName: 'Suresh Rawat',
    driverPhone: '+91 98230 45678',
    timestamp: 'Today at 02:42 AM',
    location: 'NH-48, KM 248, Hotel Highway King Dhaba Bypass, Surat',
    stolenLiters: 48,
    estimatedLossInr: 4416,
    drainDurationMinutes: 8,
    engineStateDuringDrop: 'Stopped (Ignition OFF)',
    status: 'Immediate Action Required',
    gpsCoordinates: { lat: 21.1702, lng: 72.8311 }
  },
  {
    id: 'THEFT-9820',
    plateNo: 'RJ-14-GH-3321',
    driverName: 'Balwant Singh',
    driverPhone: '+91 97110 99887',
    timestamp: 'Yesterday at 11:15 PM',
    location: 'NH-21, Bharatpur Roadside Layby, Dausa Corridor',
    stolenLiters: 35,
    estimatedLossInr: 3220,
    drainDurationMinutes: 12,
    engineStateDuringDrop: 'Engine Idling (AC Running)',
    status: 'Driver Interrogated',
    gpsCoordinates: { lat: 26.8924, lng: 76.3375 }
  }
];

const DEFAULT_FUEL_TRUCKS: FuelTruckRecord[] = [
  {
    id: 'FT-101',
    plateNo: 'MH-12-PQ-9081',
    driverName: 'Suresh Rawat',
    driverPhone: '+91 98230 45678',
    vehicleModel: 'Tata Signa 4825.TK (Multi-Axle Heavy)',
    tankCapacityLiters: 400,
    currentFuelLiters: 112,
    fuelPercent: 28,
    sensorHealth: 'Optimal',
    sensorType: 'Capacitive Digital Rod',
    engineStatus: 'Stopped (Parked)',
    speedKmH: 0,
    currentLocation: 'NH-48, KM 248, Surat Bypass Dhaba Parking',
    lastPingTime: '2 mins ago',
    status: 'Theft Alert',
    tripGpsKm: 380,
    tripFuelConsumedLiters: 145,
    tripActualMileageKmpl: 2.62,
    expectedBenchmarkKmpl: 4.10,
    fuelTheftRisk: 'Critical Detected',
    fuelDrainHistory: [
      { time: '01:00 AM', liters: 175 },
      { time: '02:00 AM', liters: 165 },
      { time: '02:40 AM', liters: 160, event: 'Parked at Dhaba' },
      { time: '02:48 AM', liters: 112, event: 'Sudden 48L Drop' },
      { time: '03:00 AM', liters: 112 }
    ]
  },
  {
    id: 'FT-102',
    plateNo: 'GJ-01-XY-9876',
    driverName: 'Ramesh Yadav',
    driverPhone: '+91 98765 43210',
    vehicleModel: 'BharatBenz 2823C (16-Wheeler Long Haul)',
    tankCapacityLiters: 380,
    currentFuelLiters: 298,
    fuelPercent: 78,
    sensorHealth: 'Optimal',
    sensorType: 'Capacitive Digital Rod',
    engineStatus: 'Running (Highway)',
    speedKmH: 58,
    currentLocation: 'Delhi-Jaipur Expressway, KM 112 (Near Neemrana)',
    lastPingTime: '30 seconds ago',
    status: 'Normal',
    tripGpsKm: 420,
    tripFuelConsumedLiters: 95,
    tripActualMileageKmpl: 4.42,
    expectedBenchmarkKmpl: 4.00,
    fuelTheftRisk: 'Low',
    fuelDrainHistory: [
      { time: '10:00 AM', liters: 340 },
      { time: '11:00 AM', liters: 325 },
      { time: '12:00 PM', liters: 310 },
      { time: '01:00 PM', liters: 298 }
    ]
  },
  {
    id: 'FT-103',
    plateNo: 'KA-05-CD-5678',
    driverName: 'Murugan Swamy',
    driverPhone: '+91 98401 12233',
    vehicleModel: 'Ashok Leyland 4220 HG (Heavy FTL)',
    tankCapacityLiters: 350,
    currentFuelLiters: 320,
    fuelPercent: 91,
    sensorHealth: 'Optimal',
    sensorType: 'Ultrasonic High-Precision',
    engineStatus: 'Idling',
    speedKmH: 0,
    currentLocation: 'Bangalore Electronic City Hub, Loading Bay #3',
    lastPingTime: '1 min ago',
    status: 'Refuel Detected',
    tripGpsKm: 510,
    tripFuelConsumedLiters: 122,
    tripActualMileageKmpl: 4.18,
    expectedBenchmarkKmpl: 3.90,
    fuelTheftRisk: 'Low',
    fuelDrainHistory: [
      { time: '08:00 AM', liters: 150 },
      { time: '09:00 AM', liters: 330, event: '+180L Bunk Refill' },
      { time: '10:00 AM', liters: 325 },
      { time: '11:00 AM', liters: 320 }
    ]
  },
  {
    id: 'FT-104',
    plateNo: 'RJ-14-GH-3321',
    driverName: 'Balwant Singh',
    driverPhone: '+91 97110 99887',
    vehicleModel: 'Eicher Pro 6028 FTL Box',
    tankCapacityLiters: 350,
    currentFuelLiters: 58,
    fuelPercent: 16,
    sensorHealth: 'Calibrating',
    sensorType: 'Capacitive Digital Rod',
    engineStatus: 'Running (Highway)',
    speedKmH: 42,
    currentLocation: 'Agra-Lucknow Expressway, KM 180 Toll approach',
    lastPingTime: '45 seconds ago',
    status: 'Low Fuel',
    tripGpsKm: 480,
    tripFuelConsumedLiters: 155,
    tripActualMileageKmpl: 3.09,
    expectedBenchmarkKmpl: 3.90,
    fuelTheftRisk: 'Medium',
    fuelDrainHistory: [
      { time: '06:00 AM', liters: 140 },
      { time: '08:00 AM', liters: 110 },
      { time: '10:00 AM', liters: 80 },
      { time: '12:00 PM', liters: 58 }
    ]
  }
];

const DEFAULT_MILEAGE_AUDIT: MileageAuditItem[] = [
  {
    plateNo: 'GJ-01-XY-9876',
    driverName: 'Ramesh Yadav',
    routeCorridor: 'Delhi -> Jaipur Express Corridor (420 KM)',
    gpsDistanceKm: 420,
    fuelConsumedLiters: 95,
    actualMileageKmpl: 4.42,
    benchmarkKmpl: 4.00,
    variancePercent: 10.5,
    rank: 1,
    badge: 'Gold Saver'
  },
  {
    plateNo: 'KA-05-CD-5678',
    driverName: 'Murugan Swamy',
    routeCorridor: 'Chennai -> Bangalore Tech Corridor (510 KM)',
    gpsDistanceKm: 510,
    fuelConsumedLiters: 122,
    actualMileageKmpl: 4.18,
    benchmarkKmpl: 3.90,
    variancePercent: 7.2,
    rank: 2,
    badge: 'Gold Saver'
  },
  {
    plateNo: 'RJ-14-GH-3321',
    driverName: 'Balwant Singh',
    routeCorridor: 'Jaipur -> Agra Express Cargo (480 KM)',
    gpsDistanceKm: 480,
    fuelConsumedLiters: 155,
    actualMileageKmpl: 3.09,
    benchmarkKmpl: 3.90,
    variancePercent: -20.7,
    rank: 3,
    badge: 'Heavy Foot'
  },
  {
    plateNo: 'MH-12-PQ-9081',
    driverName: 'Suresh Rawat',
    routeCorridor: 'Mumbai -> Surat Petro Industrial (380 KM)',
    gpsDistanceKm: 380,
    fuelConsumedLiters: 145,
    actualMileageKmpl: 2.62,
    benchmarkKmpl: 4.10,
    variancePercent: -36.1,
    rank: 4,
    badge: 'Pilferage Suspect'
  }
];

export default function FleetFuelAntiTheftRadar() {
  const { t } = useLanguage();
  const [trucksList, setTrucksList] = useState<FuelTruckRecord[]>(DEFAULT_FUEL_TRUCKS);
  const [theftIncidents, setTheftIncidents] = useState<TheftIncidentLog[]>(DEFAULT_THEFT_INCIDENTS);
  const [mileageAuditList] = useState<MileageAuditItem[]>(DEFAULT_MILEAGE_AUDIT);
  const [filterType, setFilterType] = useState<'All' | 'Theft Alert' | 'Low Fuel' | 'Normal'>('All');
  const [selectedTruck, setSelectedTruck] = useState<FuelTruckRecord | null>(DEFAULT_FUEL_TRUCKS[0]);
  const [activeSubTab, setActiveSubTab] = useState<'live_monitoring' | 'theft_incidents' | 'mileage_audit'>('live_monitoring');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);

  // Play synthesized audio siren safely
  const triggerAudioSiren = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      osc.frequency.setValueAtTime(650, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(950, audioCtx.currentTime + 0.3);
      osc.frequency.linearRampToValueAtTime(650, audioCtx.currentTime + 0.6);
      osc.frequency.linearRampToValueAtTime(950, audioCtx.currentTime + 0.9);
      osc.frequency.linearRampToValueAtTime(650, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.3);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Simulate Sudden Fuel Drop (Theft Alert Demo)
  const simulateDieselTheft = () => {
    triggerAudioSiren();
    setIsSirenActive(true);

    const targetPlate = 'GJ-01-XY-9876';
    const dropLiters = 42;
    const lossAmount = dropLiters * 92;

    setTrucksList(prev =>
      prev.map(t => {
        if (t.plateNo === targetPlate) {
          const newCurrent = Math.max(0, t.currentFuelLiters - dropLiters);
          const newPercent = Math.round((newCurrent / t.tankCapacityLiters) * 100);
          return {
            ...t,
            currentFuelLiters: newCurrent,
            fuelPercent: newPercent,
            status: 'Theft Alert',
            engineStatus: 'Stopped (Parked)',
            fuelTheftRisk: 'Critical Detected',
            fuelDrainHistory: [
              ...t.fuelDrainHistory,
              { time: 'Just Now', liters: newCurrent, event: `Sudden ${dropLiters}L Theft Drop` }
            ]
          };
        }
        return t;
      })
    );

    const newIncident: TheftIncidentLog = {
      id: `THEFT-${Math.floor(1000 + Math.random() * 9000)}`,
      plateNo: targetPlate,
      driverName: 'Ramesh Yadav',
      driverPhone: '+91 98765 43210',
      timestamp: 'Just now (Live Alert)',
      location: 'NH-48, KM 118, Highway Layby near Dhaba Rest Stop',
      stolenLiters: dropLiters,
      estimatedLossInr: lossAmount,
      drainDurationMinutes: 6,
      engineStateDuringDrop: 'Stopped (Ignition OFF)',
      status: 'Immediate Action Required',
      gpsCoordinates: { lat: 27.8182, lng: 76.3892 }
    };

    setTheftIncidents(prev => [newIncident, ...prev]);
    showToast(`CRITICAL: Sudden Diesel Drop (${dropLiters}L) detected on ${targetPlate}! Instant siren dispatched.`);
    setTimeout(() => setIsSirenActive(false), 5000);
  };

  const dispatchWhatsAppTheftAlert = (incident: TheftIncidentLog) => {
    const text = `*ASK TRANSPORT FLEET THEFT ALERT*\n\n*Vehicle No:* ${incident.plateNo}\n*Driver:* ${incident.driverName} (${incident.driverPhone})\n*Stolen Diesel:* ${incident.stolenLiters} Liters in ${incident.drainDurationMinutes} mins!\n*Estimated Financial Loss:* ₹${incident.estimatedLossInr.toLocaleString('en-IN')}\n*Location:* ${incident.location}\n*GPS Map:* https://maps.google.com/?q=${incident.gpsCoordinates.lat},${incident.gpsCoordinates.lng}\n\n*Action:* Driver phone ringing & security dispatched.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast(`WhatsApp Theft Alert dispatched to SuperAdmin & Fleet Owner!`);
  };

  const filteredTrucks = trucksList.filter(t => {
    if (filterType !== 'All' && t.status !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.plateNo.toLowerCase().includes(q) ||
        t.driverName.toLowerCase().includes(q) ||
        t.currentLocation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeTheftCount = trucksList.filter(t => t.status === 'Theft Alert').length;

  return (
    <div className="fuel-radar-container">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fuel-radar-toast">
          <AlertTriangle style={{ width: '18px', height: '18px', color: '#ef4444', flexShrink: 0 }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER RADAR HERO BANNER */}
      <div
        className="fuel-radar-banner"
        style={isSirenActive ? {
          background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #991b1b 100%)',
          borderColor: '#ef4444',
          boxShadow: '0 0 35px rgba(239, 68, 68, 0.7)'
        } : undefined}
      >
        <div>
          <div className="fuel-radar-tag">
            <ShieldAlert style={{ width: '14px', height: '14px', color: '#93c5fd' }} />
            <span>{t('IOT FUEL ROD SENSOR TELEMETRY & ANTI-PILFERAGE RADAR', 'आईओटी फ्यूल रॉड सेंसर टेलीमेट्री एवं एंटी-चोरी रडार')}</span>
          </div>
          <h1>
            {t('Fleet Fuel Sensor & Diesel Theft Detection Engine', 'फ्लीट फ्यूल सेंसर एवं डीजल चोरी पहचान इंजन')}
          </h1>
          <p>
            {t(
              'Digital Rod Sensors measure live Liters inside the diesel tank. Instant siren & WhatsApp alerts trigger if fuel drops unexpectedly while parked. Audits trip KM vs actual diesel burn for driver KM/L rankings.',
              'डिजिटल रॉड सेंसर डीजल टैंक के अंदर वास्तविक लीटर मापते हैं। पार्क किए जाने पर अचानक ईंधन कम होने पर त्वरित सायरन व व्हाट्सएप अलर्ट जारी होता है।'
            )}
          </p>
        </div>

        {/* CONTROLS & SIMULATOR BUTTON */}
        <div>
          <button
            type="button"
            onClick={simulateDieselTheft}
            className="fuel-btn-simulate"
            title="Simulate sudden 42L fuel theft on a parked truck to test instant siren and WhatsApp dispatch"
          >
            <AlertTriangle style={{ width: '16px', height: '16px' }} />
            <span>{t('Simulate Diesel Theft Alert', 'डीजल चोरी अलर्ट सिम्युलेट करें')}</span>
          </button>
        </div>
      </div>

      {/* METRIC KPI TILES */}
      <div className="fuel-kpis-grid">
        <div className="fuel-kpi-card">
          <div className="fuel-kpi-head">
            <span>{t('Total Fleet Fuel in Tanks', 'टैंकों में कुल फ्लीट ईंधन')}</span>
            <span className="fuel-kpi-badge" style={{ color: '#0284c7' }}>
              <Fuel style={{ width: '13px', height: '13px' }} /> LIVE
            </span>
          </div>
          <div className="fuel-kpi-value">
            788 <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>{t('Liters', 'लीटर')}</span>
          </div>
          <span className="fuel-kpi-sub" style={{ color: '#10b981' }}>
            {t('Across 4 Active Heavy Vehicles', '4 सक्रिय भारी वाहनों में')}
          </span>
        </div>

        <div className="fuel-kpi-card">
          <div className="fuel-kpi-head">
            <span>{t('Theft / Pilferage Alerts', 'चोरी / रिसाव अलर्ट')}</span>
            <span className="fuel-kpi-badge" style={{ color: activeTheftCount > 0 ? '#ef4444' : '#10b981' }}>
              <AlertTriangle style={{ width: '13px', height: '13px' }} /> RADAR
            </span>
          </div>
          <div className="fuel-kpi-value" style={{ color: activeTheftCount > 0 ? '#ef4444' : '#10b981' }}>
            {activeTheftCount} <span style={{ fontSize: '14px', fontWeight: 700 }}>{t('Trucks Flagged', 'वाहन चिह्नित')}</span>
          </div>
          <span className="fuel-kpi-sub" style={{ color: '#ef4444' }}>
            {theftIncidents.length} {t('Total Incidents Logged', 'कुल दर्ज घटनाएं')}
          </span>
        </div>

        <div className="fuel-kpi-card">
          <div className="fuel-kpi-head">
            <span>{t('Fleet Avg Mileage', 'फ्लीट औसत माइलेज')}</span>
            <span className="fuel-kpi-badge" style={{ color: '#0284c7' }}>
              <Gauge style={{ width: '13px', height: '13px' }} /> BENCHMARK
            </span>
          </div>
          <div className="fuel-kpi-value">
            3.58 <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>KM / Liter</span>
          </div>
          <span className="fuel-kpi-sub" style={{ color: '#0284c7' }}>
            Top: 4.42 KM/L (Ramesh Yadav)
          </span>
        </div>

        <div className="fuel-kpi-card">
          <div className="fuel-kpi-head">
            <span>{t('Monthly Fuel Savings', 'मासिक ईंधन बचत')}</span>
            <span className="fuel-kpi-badge" style={{ color: '#10b981' }}>
              <TrendingUp style={{ width: '13px', height: '13px' }} /> ROI GAIN
            </span>
          </div>
          <div className="fuel-kpi-value" style={{ color: '#10b981' }}>
            ₹92,400
          </div>
          <span className="fuel-kpi-sub" style={{ color: '#10b981' }}>
            {t('Saved via Zero Unauth Drains', 'अनधिकृत निकासी रोककर बचत')}
          </span>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="fuel-subtabs-row">
        <button
          type="button"
          onClick={() => setActiveSubTab('live_monitoring')}
          className={`fuel-subtab-btn ${activeSubTab === 'live_monitoring' ? 'active-blue' : ''}`}
        >
          <Radio style={{ width: '16px', height: '16px' }} />
          <span>{t('Live Fuel Rod Monitoring', 'लाइव फ्यूल रॉड मॉनिटरिंग')} ({trucksList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('theft_incidents')}
          className={`fuel-subtab-btn ${activeSubTab === 'theft_incidents' ? 'active-red' : ''}`}
        >
          <AlertTriangle style={{ width: '16px', height: '16px', color: '#ef4444' }} />
          <span>{t('Theft & Pilferage Radar Log', 'चोरी एवं रिसाव रडार लॉग')} ({theftIncidents.length})</span>
          {activeTheftCount > 0 && (
            <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>
              CRITICAL
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('mileage_audit')}
          className={`fuel-subtab-btn ${activeSubTab === 'mileage_audit' ? 'active-green' : ''}`}
        >
          <BarChart3 style={{ width: '16px', height: '16px' }} />
          <span>{t('Trip Mileage & Driver Efficiency Audit', 'ट्रिप माइलेज एवं ड्राइवर दक्षता ऑडिट')}</span>
        </button>
      </div>

      {/* TAB 1: LIVE FUEL SENSOR MONITORING */}
      {activeSubTab === 'live_monitoring' && (
        <div className="fuel-split-view">
          {/* LEFT: TRUCKS LIST & FILTERS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                <Search style={{ width: '15px', height: '15px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder={t('Search plate, driver, or highway...', 'गाड़ी नंबर, ड्राइवर या हाईवे खोजें...')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="fuel-search-input"
                  style={{ paddingLeft: '34px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['All', 'Theft Alert', 'Low Fuel', 'Normal'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilterType(f)}
                    className={`fuel-filter-pill ${filterType === f ? 'active' : ''}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* TRUCKS CARDS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredTrucks.map(truck => {
                const isSelected = selectedTruck?.id === truck.id;
                const isAlert = truck.status === 'Theft Alert';

                return (
                  <div
                    key={truck.id}
                    onClick={() => setSelectedTruck(truck)}
                    className={`fuel-truck-card ${isSelected ? 'selected' : ''} ${isAlert ? 'theft-border' : ''}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong className="fuel-plate-text">{truck.plateNo}</strong>
                          <span
                            style={{
                              background:
                                truck.status === 'Theft Alert'
                                  ? '#ef4444'
                                  : truck.status === 'Low Fuel'
                                  ? '#f59e0b'
                                  : truck.status === 'Refuel Detected'
                                  ? '#059669'
                                  : '#10b981',
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
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User style={{ width: '13px', height: '13px' }} />
                          <span>{truck.driverName} • {truck.vehicleModel}</span>
                        </div>
                      </div>

                      {/* CURRENT FUEL STATS */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: isAlert ? '#ef4444' : 'var(--text-primary)' }}>
                          {truck.currentFuelLiters} <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>/ {truck.tankCapacityLiters} L</span>
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: truck.fuelPercent < 20 ? '#ef4444' : '#10b981' }}>
                          {truck.fuelPercent}% Capacity
                        </div>
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div style={{ width: '100%', height: '8px', background: 'var(--border-color, #e2e8f0)', borderRadius: '4px', overflow: 'hidden', margin: '4px 0' }}>
                      <div
                        style={{
                          width: `${truck.fuelPercent}%`,
                          height: '100%',
                          background:
                            truck.fuelPercent < 20
                              ? '#ef4444'
                              : truck.status === 'Theft Alert'
                              ? '#dc2626'
                              : truck.fuelPercent > 70
                              ? '#10b981'
                              : '#0284c7',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>

                    {/* DETAILS ROW */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin style={{ width: '12px', height: '12px' }} />
                        <span>{truck.currentLocation}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Zap style={{ width: '12px', height: '12px', color: truck.speedKmH > 0 ? '#10b981' : '#f59e0b' }} />
                        <span>{truck.engineStatus} ({truck.speedKmH} km/h)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: SELECTED TRUCK TANK INSPECTOR */}
          {selectedTruck ? (
            <div className="fuel-inspect-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900 }}>{t('Digital Tank Visualizer', 'डिजिटल टैंक विजुअलाइज़र')}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Plate: <strong style={{ fontFamily: 'monospace' }}>{selectedTruck.plateNo}</strong>
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  {selectedTruck.sensorType}
                </span>
              </div>

              {/* TANK GRAPHIC */}
              <div className="fuel-gauge-box">
                <div
                  style={{
                    width: '90px',
                    height: '160px',
                    border: '3px solid #334155',
                    borderRadius: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${selectedTruck.fuelPercent}%`,
                      background: selectedTruck.status === 'Theft Alert' ? '#ef4444' : 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
                      transition: 'height 0.4s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 900
                    }}
                  >
                    {selectedTruck.fuelPercent}%
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: selectedTruck.status === 'Theft Alert' ? '#ef4444' : 'var(--text-primary)' }}>
                    {selectedTruck.currentFuelLiters} <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Liters</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Tank Full Mark: <strong>{selectedTruck.tankCapacityLiters} Liters</strong>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Sensor Accuracy: <strong>99.8% (Digital Capacitive)</strong>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone style={{ width: '12px', height: '12px', color: '#0284c7' }} />
                    <span>Driver: <strong>{selectedTruck.driverPhone}</strong></span>
                  </div>
                </div>
              </div>

              {/* DRAIN / REFUEL TIMELINE */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800 }}>
                  {t('Fuel Level Timeline (Last 6 Hours)', 'ईंधन स्तर टाइमलाइन (पिछले 6 घंटे)')}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedTruck.fuelDrainHistory.map((point, idx) => (
                    <div
                      key={idx}
                      className={`fuel-history-row ${point.event ? 'event-alert' : ''}`}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock style={{ width: '12px', height: '12px' }} />
                        {point.time}
                      </span>
                      <span>{point.liters} Liters</span>
                      {point.event && <span>{point.event}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION TRIGGER */}
              {selectedTruck.status === 'Theft Alert' && (
                <button
                  type="button"
                  onClick={() => {
                    const match = theftIncidents.find(i => i.plateNo === selectedTruck.plateNo);
                    if (match) dispatchWhatsAppTheftAlert(match);
                  }}
                  className="fuel-btn-whatsapp"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  <MessageSquare style={{ width: '16px', height: '16px' }} />
                  <span>{t('Dispatch Emergency WhatsApp to SuperAdmin', 'सुपर-एडमिन को आपातकालीन व्हाट्सएप भेजें')}</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              {t('Select a truck from the left to inspect its digital fuel rod sensor data.', 'डिजिटल फ्यूल रॉड सेंसर डेटा देखने के लिए बाईं ओर से ट्रक चुनें।')}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: THEFT & PILFERAGE RADAR LOG */}
      {activeSubTab === 'theft_incidents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '16px 20px', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle style={{ width: '20px', height: '20px', flexShrink: 0 }} />
            <div>
              <strong>{t('Anti-Theft Radar Principle:', 'एंटी-चोरी रडार सिद्धांत:') }</strong>{' '}
              {t(
                'If fuel levels suddenly drop more than 25 Liters within 10 minutes while the vehicle is parked (Ignition OFF), an automatic critical theft alert is triggered, siren sounds, and WhatsApp dispatch is initiated.',
                'यदि वाहन पार्क होने पर (इग्निशन बंद) 10 मिनट के अंदर ईंधन स्तर में 25 लीटर से अधिक की अचानक गिरावट होती है, तो स्वचालित सायरन और व्हाट्सएप डिस्पैच सक्रिय होता है।'
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {theftIncidents.map(incident => (
              <div key={incident.id} className="fuel-incident-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '6px' }}>
                        THEFT DETECTED
                      </span>
                      <strong style={{ fontSize: '15px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{incident.plateNo}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>({incident.timestamp})</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User style={{ width: '14px', height: '14px', color: '#0284c7' }} />
                      <span>{t('Driver:', 'ड्राइवर:')} <strong>{incident.driverName}</strong> ({incident.driverPhone})</span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#dc2626', marginTop: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin style={{ width: '13px', height: '13px' }} />
                      <span>{incident.location}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#dc2626' }}>
                      -{incident.stolenLiters} Liters
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Loss: ₹{incident.estimatedLossInr.toLocaleString('en-IN')} (@ ₹92/L)
                    </div>
                    <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700, marginTop: '2px' }}>
                      Drain Duration: {incident.drainDurationMinutes} mins
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Engine State: <strong style={{ color: 'var(--text-primary)' }}>{incident.engineStateDuringDrop}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => dispatchWhatsAppTheftAlert(incident)}
                      className="fuel-btn-whatsapp"
                    >
                      <MessageSquare style={{ width: '14px', height: '14px' }} />
                      <span>{t('Send WhatsApp Alert', 'व्हाट्सएप अलर्ट भेजें')}</span>
                    </button>

                    <a
                      href={`tel:${incident.driverPhone}`}
                      className="fuel-btn-call"
                    >
                      <Phone style={{ width: '14px', height: '14px' }} />
                      <span>{t('Call Driver Immediately', 'ड्राइवर को कॉल करें')}</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRIP MILEAGE & DRIVER EFFICIENCY AUDIT */}
      {activeSubTab === 'mileage_audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px 20px', color: '#059669', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Gauge style={{ width: '20px', height: '20px', flexShrink: 0 }} />
            <div>
              <strong>{t('Trip Mileage Audit Engine:', 'ट्रिप माइलेज ऑडिट इंजन:') }</strong>{' '}
              {t(
                'Calculates true KM/Liter by comparing official GPS odometer distance against fuel rod sensor consumption. Drivers who save diesel receive Gold status, while abnormal low mileage signals excessive AC idling or secret siphoning.',
                'आधिकारिक जीपीएस ओडोमीटर दूरी की तुलना फ्यूल रॉड सेंसर से करके वास्तविक माइलेज की गणना करता है। डीजल बचाने वाले ड्राइवरों को गोल्ड स्टेटस दिया जाता है।'
              )}
            </div>
          </div>

          <div className="fuel-audit-card">
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table className="fuel-audit-table">
                <thead>
                  <tr>
                    <th>{t('Rank', 'रैंक')}</th>
                    <th>{t('Vehicle & Driver', 'वाहन एवं चालक')}</th>
                    <th>{t('Route Corridor', 'रूट कॉरिडोर')}</th>
                    <th>{t('GPS KM', 'जीपीएस किमी')}</th>
                    <th>{t('Actual Diesel', 'वास्तविक डीजल')}</th>
                    <th>{t('Actual KM/L', 'वास्तविक किमी/लीटर')}</th>
                    <th>{t('Benchmark', 'बेंचमार्क')}</th>
                    <th>{t('Performance', 'प्रदर्शन')}</th>
                  </tr>
                </thead>
                <tbody>
                  {mileageAuditList.map(item => {
                    const isPositive = item.variancePercent >= 0;
                    return (
                      <tr key={item.plateNo}>
                        <td>
                          {item.rank === 1 ? (
                            <span className="fuel-rank-badge rank-gold">
                              <Award style={{ width: '16px', height: '16px', color: '#eab308' }} /> #1
                            </span>
                          ) : item.rank === 2 ? (
                            <span className="fuel-rank-badge rank-silver">
                              <Award style={{ width: '16px', height: '16px', color: '#94a3b8' }} /> #2
                            </span>
                          ) : (
                            <span className="fuel-rank-badge">
                              #{item.rank}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="fuel-plate-text">{item.plateNo}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <User style={{ width: '12px', height: '12px' }} />
                            <span>{item.driverName}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {item.routeCorridor}
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {item.gpsDistanceKm} KM
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {item.fuelConsumedLiters} L
                        </td>
                        <td style={{ fontWeight: 900, color: isPositive ? '#10b981' : '#dc2626' }}>
                          {item.actualMileageKmpl} KM/L
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {item.benchmarkKmpl} KM/L
                        </td>
                        <td>
                          <span
                            style={{
                              background:
                                item.badge === 'Gold Saver'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : item.badge === 'Silver Normal'
                                  ? 'rgba(2, 132, 199, 0.15)'
                                  : item.badge === 'Heavy Foot'
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(239, 68, 68, 0.15)',
                              color:
                                item.badge === 'Gold Saver'
                                  ? '#10b981'
                                  : item.badge === 'Silver Normal'
                                  ? '#0284c7'
                                  : item.badge === 'Heavy Foot'
                                  ? '#f59e0b'
                                  : '#ef4444',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {isPositive && <CheckCircle2 style={{ width: '12px', height: '12px' }} />}
                            {isPositive ? `+${item.variancePercent}% (${item.badge})` : `${item.variancePercent}% (${item.badge})`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
