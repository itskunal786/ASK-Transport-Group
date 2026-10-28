import { useState } from 'react';

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
      { time: '02:48 AM', liters: 112, event: '🚨 Sudden 48L Drop' },
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
      { time: '09:00 AM', liters: 330, event: '⛽ +180L Bunk Refill' },
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
              { time: 'Just Now', liters: newCurrent, event: `🚨 Sudden ${dropLiters}L Theft Drop` }
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
    showToast(`🚨 CRITICAL: Sudden Diesel Drop (${dropLiters}L) detected on ${targetPlate}! Instant siren dispatched.`);
    setTimeout(() => setIsSirenActive(false), 5000);
  };

  const dispatchWhatsAppTheftAlert = (incident: TheftIncidentLog) => {
    const text = `🚨 *ASK TRANSPORT FLEET THEFT ALERT* 🚨\n\n*Vehicle No:* ${incident.plateNo}\n*Driver:* ${incident.driverName} (${incident.driverPhone})\n*Stolen Diesel:* ${incident.stolenLiters} Liters in ${incident.drainDurationMinutes} mins!\n*Estimated Financial Loss:* ₹${incident.estimatedLossInr.toLocaleString('en-IN')}\n*Location:* ${incident.location}\n*GPS Map:* https://maps.google.com/?q=${incident.gpsCoordinates.lat},${incident.gpsCoordinates.lng}\n\n*Action:* Driver phone ringing & security dispatched.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast(`✓ WhatsApp Theft Alert dispatched to SuperAdmin & Fleet Owner!`);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            background: '#07192b',
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

      {/* HEADER RADAR HERO BANNER */}
      <div
        style={{
          background: isSirenActive
            ? 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #991b1b 100%)'
            : 'linear-gradient(135deg, #091b2e 0%, #0f2c4a 50%, #1e3a5f 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: isSirenActive ? '0 0 35px rgba(239, 68, 68, 0.7)' : '0 10px 25px -5px rgba(15, 44, 74, 0.4)',
          transition: 'all 0.3s ease',
          border: isSirenActive ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(4px)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.6px',
              marginBottom: '8px'
            }}
          >
            <span>🛡️</span> IOT FUEL ROD SENSOR TELEMETRY &amp; ANTI-PILFERAGE RADAR
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Fleet Fuel Sensor &amp; Diesel Theft Detection Engine
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#93c5fd', lineHeight: 1.5 }}>
            Digital Rod Sensors measure live Liters inside the diesel tank. Instant siren &amp; WhatsApp alerts trigger if fuel drops unexpectedly while parked. Audits trip KM vs actual diesel burn for driver KM/L rankings.
          </p>
        </div>

        {/* CONTROLS & SIMULATOR BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={simulateDieselTheft}
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
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.45)',
              transition: 'transform 0.15s ease'
            }}
            title="Simulate sudden 42L fuel theft on a parked truck to test instant siren and WhatsApp dispatch"
          >
            <span>🚨</span> Simulate Diesel Theft Alert
          </button>
        </div>
      </div>

      {/* METRIC KPI TILES */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
            <span>Total Fleet Fuel in Tanks</span>
            <span>⛽ LIVE</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
            788 <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>Liters</span>
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>
            Across 4 Active Heavy Vehicles
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
            <span>Theft / Pilferage Alerts</span>
            <span style={{ color: activeTheftCount > 0 ? '#ef4444' : '#10b981' }}>🔴 RADAR</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: activeTheftCount > 0 ? '#ef4444' : '#10b981', marginTop: '6px' }}>
            {activeTheftCount} <span style={{ fontSize: '14px', fontWeight: 700 }}>Trucks Flagged</span>
          </div>
          <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700, marginTop: '4px' }}>
            {theftIncidents.length} Total Incidents Logged
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
            <span>Fleet Avg Mileage</span>
            <span>🛣️ BENCHMARK</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
            3.58 <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>KM / Liter</span>
          </div>
          <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 700, marginTop: '4px' }}>
            Top: 4.42 KM/L (Ramesh Yadav)
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
            <span>Monthly Fuel Savings</span>
            <span>💰 ROI GAIN</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#059669', marginTop: '6px' }}>
            ₹92,400
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginTop: '4px' }}>
            Saved via Zero Unauth Drains
          </div>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border-color, #e2e8f0)', paddingBottom: '2px' }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('live_monitoring')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeSubTab === 'live_monitoring' ? '#0b72e7' : '#64748b',
            borderBottom: activeSubTab === 'live_monitoring' ? '3px solid #0b72e7' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📡</span> Live Fuel Rod Monitoring ({trucksList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('theft_incidents')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeSubTab === 'theft_incidents' ? '#ef4444' : '#64748b',
            borderBottom: activeSubTab === 'theft_incidents' ? '3px solid #ef4444' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🚨</span> Theft &amp; Pilferage Radar Log ({theftIncidents.length})
          {activeTheftCount > 0 && (
            <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>
              CRITICAL
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('mileage_audit')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeSubTab === 'mileage_audit' ? '#10b981' : '#64748b',
            borderBottom: activeSubTab === 'mileage_audit' ? '3px solid #10b981' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📊</span> Trip Mileage &amp; Driver Efficiency Audit
        </button>
      </div>

      {/* TAB 1: LIVE FUEL SENSOR MONITORING */}
      {activeSubTab === 'live_monitoring' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          {/* LEFT: TRUCKS LIST & FILTERS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search plate, driver, or highway..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  fontSize: '13px',
                  outline: 'none',
                  background: 'var(--bg-surface, #ffffff)',
                  color: 'inherit'
                }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['All', 'Theft Alert', 'Low Fuel', 'Normal'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilterType(f)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      background: filterType === f ? '#0b72e7' : 'var(--bg-surface, #ffffff)',
                      color: filterType === f ? '#ffffff' : '#64748b'
                    }}
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
                    style={{
                      background: isAlert
                        ? 'rgba(239, 68, 68, 0.08)'
                        : isSelected
                        ? 'rgba(11, 114, 231, 0.06)'
                        : 'var(--bg-surface, #ffffff)',
                      border: isAlert
                        ? '2px solid #ef4444'
                        : isSelected
                        ? '2px solid #0b72e7'
                        : '1px solid var(--border-color, #e2e8f0)',
                      borderRadius: '12px',
                      padding: '16px 18px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '15px', color: 'var(--text-primary, #0f172a)' }}>{truck.plateNo}</strong>
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
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', marginTop: '2px' }}>
                          👨‍✈️ {truck.driverName} • {truck.vehicleModel}
                        </div>
                      </div>

                      {/* CURRENT FUEL STATS */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: isAlert ? '#ef4444' : '#0f172a' }}>
                          {truck.currentFuelLiters} <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>/ {truck.tankCapacityLiters} L</span>
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: truck.fuelPercent < 20 ? '#ef4444' : '#10b981' }}>
                          {truck.fuelPercent}% Capacity
                        </div>
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', margin: '8px 0' }}>
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
                              : '#3b82f6',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>

                    {/* DETAILS ROW */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', marginTop: '6px' }}>
                      <div>📍 {truck.currentLocation}</div>
                      <div>⚡ {truck.engineStatus} ({truck.speedKmH} km/h)</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: SELECTED TRUCK TANK INSPECTOR */}
          {selectedTruck ? (
            <div
              style={{
                background: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Digital Tank Visualizer</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Plate: {selectedTruck.plateNo}</div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                  Sensor: {selectedTruck.sensorType}
                </span>
              </div>

              {/* TANK GRAPHIC */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
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
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Current Diesel Level:</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: selectedTruck.status === 'Theft Alert' ? '#ef4444' : '#0f172a' }}>
                    {selectedTruck.currentFuelLiters} <span style={{ fontSize: '14px', color: '#64748b' }}>Liters</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Tank Full Mark: <strong>{selectedTruck.tankCapacityLiters} Liters</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Sensor Accuracy: <strong>99.8% (Digital Capacitive)</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Driver Contact: <strong>{selectedTruck.driverPhone}</strong>
                  </div>
                </div>
              </div>

              {/* DRAIN / REFUEL TIMELINE */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: '#334155' }}>
                  Fuel Level Timeline (Last 6 Hours)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedTruck.fuelDrainHistory.map((point, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        padding: '6px 10px',
                        background: point.event ? 'rgba(239, 68, 68, 0.1)' : '#f1f5f9',
                        borderRadius: '6px',
                        color: point.event ? '#b91c1c' : '#334155',
                        fontWeight: point.event ? 700 : 500
                      }}
                    >
                      <span>{point.time}</span>
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
                  <span>📲</span> Dispatch Emergency WhatsApp to SuperAdmin
                </button>
              )}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Select a truck from the left to inspect its digital fuel rod sensor data.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: THEFT & PILFERAGE RADAR LOG */}
      {activeSubTab === 'theft_incidents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px 20px', color: '#991b1b', fontSize: '13px' }}>
            <strong>Anti-Theft Radar Principle:</strong> If fuel levels suddenly drop more than 25 Liters within 10 minutes while the vehicle is parked (Ignition OFF), an automatic critical theft alert is triggered, siren sounds, and WhatsApp dispatch is initiated.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {theftIncidents.map(incident => (
              <div
                key={incident.id}
                style={{
                  background: 'var(--bg-surface, #ffffff)',
                  border: '1px solid #f87171',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '6px' }}>
                        THEFT DETECTED
                      </span>
                      <strong style={{ fontSize: '15px', color: '#0f172a' }}>{incident.plateNo}</strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>({incident.timestamp})</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                      👨‍✈️ Driver: <strong>{incident.driverName}</strong> ({incident.driverPhone})
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#b91c1c', marginTop: '4px', fontWeight: 600 }}>
                      📍 Location: {incident.location}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#dc2626' }}>
                      -{incident.stolenLiters} Liters
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                      Loss: ₹{incident.estimatedLossInr.toLocaleString('en-IN')} (@ ₹92/L)
                    </div>
                    <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>
                      Drain Duration: {incident.drainDurationMinutes} mins
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #fee2e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Engine State: <strong>{incident.engineStateDuringDrop}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => dispatchWhatsAppTheftAlert(incident)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        background: '#25D366',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>📲</span> Send WhatsApp Alert
                    </button>

                    <a
                      href={`tel:${incident.driverPhone}`}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        background: '#0b72e7',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>📞</span> Call Driver Immediately
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
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px 20px', color: '#166534', fontSize: '13px' }}>
            <strong>Trip Mileage Audit Engine:</strong> Calculates true KM/Liter by comparing official GPS odometer distance against fuel rod sensor consumption. Drivers who save diesel receive Gold status, while abnormal low mileage signals excessive AC idling or secret siphoning.
          </div>

          <div style={{ background: 'var(--bg-surface, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Rank</th>
                  <th style={{ padding: '12px 16px' }}>Vehicle &amp; Driver</th>
                  <th style={{ padding: '12px 16px' }}>Route Corridor</th>
                  <th style={{ padding: '12px 16px' }}>GPS KM</th>
                  <th style={{ padding: '12px 16px' }}>Actual Diesel</th>
                  <th style={{ padding: '12px 16px' }}>Actual KM/L</th>
                  <th style={{ padding: '12px 16px' }}>Benchmark</th>
                  <th style={{ padding: '12px 16px' }}>Performance</th>
                </tr>
              </thead>
              <tbody>
                {mileageAuditList.map(item => {
                  const isPositive = item.variancePercent >= 0;
                  return (
                    <tr key={item.plateNo} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 800 }}>
                        {item.rank === 1 ? '🥇 #1' : item.rank === 2 ? '🥈 #2' : `#${item.rank}`}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>{item.plateNo}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>👨‍✈️ {item.driverName}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>
                        {item.routeCorridor}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                        {item.gpsDistanceKm} KM
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                        {item.fuelConsumedLiters} L
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 900, color: isPositive ? '#059669' : '#dc2626' }}>
                        {item.actualMileageKmpl} KM/L
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>
                        {item.benchmarkKmpl} KM/L
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            background:
                              item.badge === 'Gold Saver'
                                ? 'rgba(5, 150, 105, 0.15)'
                                : item.badge === 'Silver Normal'
                                ? 'rgba(59, 130, 246, 0.15)'
                                : item.badge === 'Heavy Foot'
                                ? 'rgba(245, 158, 11, 0.15)'
                                : 'rgba(239, 68, 68, 0.15)',
                            color:
                              item.badge === 'Gold Saver'
                                ? '#059669'
                                : item.badge === 'Silver Normal'
                                ? '#2563eb'
                                : item.badge === 'Heavy Foot'
                                ? '#d97706'
                                : '#dc2626',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 800
                          }}
                        >
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
      )}
    </div>
  );
}
