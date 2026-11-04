import React, { useEffect, useState } from 'react';
import {
  getDriverActiveTrip,
  startDriverTrip,
  verifyDeliveryOtp,
  submitDriverPod,
  createTripExpense,
  getTripPnL,
  type DriverActiveTrip,
  type TripPnLResult
} from '../../api/fleetApi';
import './MobileDriverConsole.css';

interface DriverPreset {
  id: number;
  name: string;
  phone: string;
  vehicleNumber: string;
  model: string;
  trip: DriverActiveTrip;
}

const DRIVER_PRESETS: DriverPreset[] = [
  {
    id: 1,
    name: 'Ramesh Singh Rawat',
    phone: '+91 98230 45812',
    vehicleNumber: 'MH-12-RN-7845',
    model: 'Tata Signa 4825.TK (Multi-Axle)',
    trip: {
      tripId: 101,
      tripNumber: 'TRIP-2026-98102',
      driverName: 'Ramesh Singh Rawat',
      driverPhone: '+91 98230 45812',
      vehicleNumber: 'MH-12-RN-7845',
      originHub: 'Pune Chakan SuperHub (MH)',
      destinationHub: 'Delhi-NCR Central Depot (HR)',
      consigneeName: 'Samsung India Electronics Pvt Ltd',
      consigneePhone: '+91 98110 44219',
      deliveryAddress: 'Plot 18, Sector 8, IMT Manesar, Gurugram, Haryana - 122050',
      goodsDescription: '320 Electronic Consumer Appliances Cartons',
      waybillLRNumber: 'LR-2026-ASK-9941',
      tripStatus: 'InTransit',
      startingOdometerKm: 142500,
      currentOdometerKm: 143400,
      endingOdometerKm: null,
      deliveryOtp: '4821',
      isOtpVerified: false,
      podPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      podSubmittedAt: null
    }
  },
  {
    id: 2,
    name: 'Suresh Kumar Gurjar',
    phone: '+91 98290 41203',
    vehicleNumber: 'RJ-14-GH-4921',
    model: 'Ashok Leyland 2820 (Multi-Axle Rigid)',
    trip: {
      tripId: 102,
      tripNumber: 'TRIP-2026-98105',
      driverName: 'Suresh Kumar Gurjar',
      driverPhone: '+91 98290 41203',
      vehicleNumber: 'RJ-14-GH-4921',
      originHub: 'Jaipur Terminal (RJ)',
      destinationHub: 'Bhiwandi Super MegaHub (MH)',
      consigneeName: 'Reliance Retail Central Logistics',
      consigneePhone: '+91 98220 33412',
      deliveryAddress: 'Building B-4, Indian Corporation Compound, Mankoli, Bhiwandi - 421302',
      goodsDescription: '450 FMCG Packaging Bundles (22.8T)',
      waybillLRNumber: 'LR-2026-ASK-7729',
      tripStatus: 'InTransit',
      startingOdometerKm: 141200,
      currentOdometerKm: 142100,
      endingOdometerKm: null,
      deliveryOtp: '9182',
      isOtpVerified: false,
      podPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      podSubmittedAt: null
    }
  },
  {
    id: 3,
    name: 'Manjeet Singh Dhillon',
    phone: '+91 98112 34567',
    vehicleNumber: 'HR-55-AN-8102',
    model: 'Ashok Leyland 3520 (12-Wheeler)',
    trip: {
      tripId: 103,
      tripNumber: 'TRIP-2026-98108',
      driverName: 'Manjeet Singh Dhillon',
      driverPhone: '+91 98112 34567',
      vehicleNumber: 'HR-55-AN-8102',
      originHub: 'Delhi Central Logistics Park',
      destinationHub: 'Ahmedabad Sanand GIDC (GJ)',
      consigneeName: 'Tata Motors Ancillary Depot',
      consigneePhone: '+91 98250 88912',
      deliveryAddress: 'Gate 3, Sanand Industrial Area Phase II, Ahmedabad - 382110',
      goodsDescription: 'Automobile Components & Heavy Sheet Metal',
      waybillLRNumber: 'LR-2026-ASK-8810',
      tripStatus: 'Planned',
      startingOdometerKm: 184500,
      currentOdometerKm: 184500,
      endingOdometerKm: null,
      deliveryOtp: '7714',
      isOtpVerified: false,
      podPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      podSubmittedAt: null
    }
  }
];

export default function MobileDriverConsole() {
  const [selectedDriverId, setSelectedDriverId] = useState<number>(1);
  const [showDriverModal, setShowDriverModal] = useState<boolean>(false);
  const [showSosModal, setShowSosModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const currentPreset = DRIVER_PRESETS.find(d => d.id === selectedDriverId) || DRIVER_PRESETS[0];

  const [trip, setTrip] = useState<DriverActiveTrip>(() => {
    try {
      const saved = localStorage.getItem(`ask_driver_trip_${selectedDriverId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return currentPreset.trip;
  });

  const [pnl, setPnl] = useState<TripPnLResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'trip' | 'expense' | 'pod' | 'hisaab'>('trip');

  // Trip Start State
  const [odometerInput, setOdometerInput] = useState<string>(String(trip.startingOdometerKm || 142500));

  // Expense Form State
  const [expenseType, setExpenseType] = useState<string>('Diesel');
  const [amount, setAmount] = useState<string>('');
  const [liters, setLiters] = useState<string>('');
  const [pumpName, setPumpName] = useState<string>('');
  const [expenseOdo, setExpenseOdo] = useState<string>('');
  const [expenseMsg, setExpenseMsg] = useState<string>('');
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState<Array<{ id: string; type: string; amount: number; time: string; status: string }>>([
    { id: '1', type: 'Diesel', amount: 18450, time: 'Surat NH-48 (203.8L)', status: 'Approved' },
    { id: '2', type: 'Toll', amount: 1420, time: 'Vadodara Expressway Fastag', status: 'Approved' }
  ]);

  // Delivery OTP State
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpMsg, setOtpMsg] = useState<string>('');
  const [otpLoading, setOtpLoading] = useState(false);

  // POD State
  const [podPhotoUrl, setPodPhotoUrl] = useState<string>(trip.podPhotoUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400');
  const [podMsg, setPodMsg] = useState<string>('');
  const [podLoading, setPodLoading] = useState(false);

  // Switch driver preset
  function handleSelectDriver(id: number) {
    setSelectedDriverId(id);
    const preset = DRIVER_PRESETS.find(d => d.id === id) || DRIVER_PRESETS[0];
    try {
      const saved = localStorage.getItem(`ask_driver_trip_${id}`);
      if (saved) {
        setTrip(JSON.parse(saved));
      } else {
        setTrip(preset.trip);
      }
    } catch {
      setTrip(preset.trip);
    }
    setOdometerInput(String(preset.trip.startingOdometerKm));
    setShowDriverModal(false);
    triggerToast(`Chalak badal gaya: ${preset.name}`);
  }

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  }

  async function loadData() {
    try {
      setLoading(true);
      const tripData = await getDriverActiveTrip();
      if (tripData && tripData.tripNumber) {
        setTrip(tripData);
      }
      if (trip?.tripId) {
        const pnlData = await getTripPnL(trip.tripId);
        setPnl(pnlData);
      }
    } catch {
      // Backend optional; preset fallback loaded smoothly
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedDriverId]);

  // Persist trip changes
  function updateTripState(updated: DriverActiveTrip) {
    setTrip(updated);
    try {
      localStorage.setItem(`ask_driver_trip_${selectedDriverId}`, JSON.stringify(updated));
    } catch {}
  }

  async function handleStartTrip() {
    const odo = parseInt(odometerInput) || trip.startingOdometerKm;
    try {
      try {
        await startDriverTrip(odo);
      } catch {}
      const updated: DriverActiveTrip = {
        ...trip,
        tripStatus: 'InTransit',
        startingOdometerKm: odo,
        currentOdometerKm: odo
      };
      updateTripState(updated);
      triggerToast('🚀 Trip Safalta-purvak Shuru Ho Gaya! Shubh Yatra.');
    } catch (err: any) {
      alert(err?.message || 'Failed to start trip');
    }
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    try {
      setExpenseLoading(true);
      setExpenseMsg('');
      try {
        await createTripExpense({
          tripId: trip.tripId,
          tripNumber: trip.tripNumber,
          driverName: trip.driverName,
          driverPhone: trip.driverPhone,
          vehicleNumber: trip.vehicleNumber,
          expenseType,
          amount: Number(amount),
          liters: liters ? Number(liters) : undefined,
          fuelStationName: pumpName || undefined,
          receiptPhotoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400',
          odometerReading: expenseOdo ? Number(expenseOdo) : undefined
        });
      } catch {}

      const newExp = {
        id: String(Date.now()),
        type: expenseType,
        amount: Number(amount),
        time: pumpName || `${expenseType} Entry (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
        status: 'Pending Verification'
      };
      setRecentExpenses([newExp, ...recentExpenses]);

      setExpenseMsg('✓ Kharcha safalta-purvak jama ho gaya! Admin verify karenge.');
      setAmount('');
      setLiters('');
      setPumpName('');
      triggerToast('₹' + Number(amount).toLocaleString('en-IN') + ' Kharcha Record Kiya Gaya');
    } catch (err: any) {
      setExpenseMsg('Error adding expense: ' + (err?.message || 'Failed'));
    } finally {
      setExpenseLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otpInput) return;
    try {
      setOtpLoading(true);
      setOtpMsg('');
      try {
        await verifyDeliveryOtp(otpInput);
      } catch {
        // Backend optional
      }
      const expectedOtp = trip.deliveryOtp || '4821';
      if (otpInput.trim() === expectedOtp) {
        const updated: DriverActiveTrip = {
          ...trip,
          isOtpVerified: true,
          tripStatus: 'ArrivedAtDestination'
        };
        updateTripState(updated);
        setOtpMsg('✓ OTP Manya Hua! Delivery verification 100% safal.');
        triggerToast('✓ OTP Verified! Ab Signed POD photo upload karein.');
      } else {
        setOtpMsg(`❌ Galat OTP! Kripya Receiver se sahi code poochein (Demo code: ${expectedOtp}).`);
      }
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleSubmitPod(e: React.FormEvent) {
    e.preventDefault();
    try {
      setPodLoading(true);
      setPodMsg('');
      try {
        await submitDriverPod({
          photoUrl: podPhotoUrl,
          receiverNotes: 'Receiver signed & stamped physically upon full carton inspection.'
        });
      } catch {}

      const updated: DriverActiveTrip = {
        ...trip,
        tripStatus: 'Completed',
        endingOdometerKm: (trip.currentOdometerKm || 142500) + 148,
        podPhotoUrl,
        podSubmittedAt: new Date().toISOString()
      };
      updateTripState(updated);
      setPodMsg('✓ POD jama ho gaya! Consignment delivery complete.');
      triggerToast('🎉 Badhai Ho! Consignment Delivery Purna Ho Gayi.');
    } catch (err: any) {
      setPodMsg('Failed to submit POD: ' + err?.message);
    } finally {
      setPodLoading(false);
    }
  }

  return (
    <div className="driver-app-container">
      {/* 1. TOP MOBILE APP HEADER */}
      <div className="driver-header">
        <div className="driver-logo-box">
          <span className="driver-logo-icon">🚛</span>
          <div>
            <strong className="driver-app-title">ASK Transport Driver App</strong>
            <span className="driver-app-subtitle">Chalak Mobile Console • Hindi / English</span>
          </div>
        </div>

        <div className="driver-header-actions">
          <button
            type="button"
            onClick={() => setShowSosModal(true)}
            className="driver-sos-pill"
            title="Emergency Highway Helpline / Breakdown SOS"
          >
            <span>🚨</span>
            <span>SOS</span>
          </button>

          <div className="driver-online-pill">
            <span className="driver-online-dot" />
            <span>ONLINE</span>
          </div>
        </div>
      </div>

      {/* 2. CHALAK (DRIVER) PROFILE MINI STRIP */}
      <div className="driver-profile-strip">
        <div>
          <span className="driver-label-mini">CHALAK (DRIVER):</span>
          <strong className="driver-name-title">{trip.driverName || currentPreset.name}</strong>
          <div className="driver-truck-badge">
            <span>Truck: {trip.vehicleNumber || currentPreset.vehicleNumber}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowDriverModal(true)}
            className="driver-switch-btn"
          >
            🔄 Chalak Badlein (Switch Driver)
          </button>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span className="driver-label-mini" style={{ display: 'block', marginBottom: '4px' }}>TRIP STATUS</span>
          <div className={`driver-status-badge ${
            trip.tripStatus === 'Completed' ? 'completed' :
            trip.tripStatus === 'InTransit' ? 'intransit' : 'planned'
          }`}>
            <span>{trip.tripStatus === 'Completed' ? '🟢' : trip.tripStatus === 'InTransit' ? '🚚' : '⏳'}</span>
            <span>
              {trip.tripStatus === 'InTransit' ? 'Raste Mein (In Transit)' :
               trip.tripStatus === 'Completed' ? 'Delivery Samapt' : 'Start Pending'}
            </span>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '6px 12px', fontSize: '11px', textAlign: 'center', fontWeight: 600 }}>
          🔄 Live satellite telemetry syncing...
        </div>
      )}
      {toastMessage && (
        <div style={{ background: '#0284c7', color: '#ffffff', padding: '10px 16px', fontSize: '12px', fontWeight: 700, textAlign: 'center', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)' }}>
          {toastMessage}
        </div>
      )}

      {/* 3. TABS CONTAINER */}
      <div style={{ padding: '16px' }}>

        {/* ============================================================== */}
        {/* TAB 1: ACTIVE TRIP & MAPS NAVIGATION                           */}
        {/* ============================================================== */}
        {activeTab === 'trip' && (
          <div>
            {/* HIGHWAY PROGRESS STEPPER */}
            <div className="driver-stepper-card">
              <div className="driver-progress-header">
                <span>🛣️ Highway Corridor Progress</span>
                <strong style={{ color: '#38bdf8' }}>
                  {trip.tripStatus === 'Completed' ? '100% Completed' : trip.tripStatus === 'InTransit' ? '72% Covered' : '0% (Ready)'}
                </strong>
              </div>

              <div className="driver-progress-track">
                <div
                  className="driver-progress-fill"
                  style={{
                    width: trip.tripStatus === 'Completed' ? '100%' : trip.tripStatus === 'InTransit' ? '72%' : '8%'
                  }}
                />
              </div>

              <div className="driver-milestones-row">
                <div className={`driver-milestone-point ${trip.tripStatus !== 'Planned' ? 'done' : 'active'}`}>
                  <span>🟢 Loaded</span>
                  <small>Hub Depart</small>
                </div>
                <div className={`driver-milestone-point ${trip.tripStatus === 'InTransit' ? 'active' : trip.tripStatus === 'Completed' ? 'done' : ''}`}>
                  <span>🚚 Corridor</span>
                  <small>NH-48 Transit</small>
                </div>
                <div className={`driver-milestone-point ${trip.isOtpVerified ? 'done' : ''}`}>
                  <span>🔐 Delivery</span>
                  <small>Consignee Gate</small>
                </div>
                <div className={`driver-milestone-point ${trip.tripStatus === 'Completed' ? 'done' : ''}`}>
                  <span>✓ Signed</span>
                  <small>POD Stamped</small>
                </div>
              </div>
            </div>

            {/* TELEMETRY METRICS RIBBON */}
            <div className="driver-telemetry-grid">
              <div className="driver-telemetry-tile">
                <div className="driver-telemetry-icon">💳</div>
                <strong className="driver-telemetry-val" style={{ color: '#34d399' }}>₹4,250</strong>
                <span className="driver-telemetry-label">Fastag</span>
              </div>
              <div className="driver-telemetry-tile">
                <div className="driver-telemetry-icon">⚡</div>
                <strong className="driver-telemetry-val" style={{ color: '#38bdf8' }}>58 km/h</strong>
                <span className="driver-telemetry-label">Speed</span>
              </div>
              <div className="driver-telemetry-tile">
                <div className="driver-telemetry-icon">⛽</div>
                <strong className="driver-telemetry-val" style={{ color: '#fbbf24' }}>72%</strong>
                <span className="driver-telemetry-label">Diesel</span>
              </div>
              <div className="driver-telemetry-tile">
                <div className="driver-telemetry-icon">🛞</div>
                <strong className="driver-telemetry-val" style={{ color: '#34d399' }}>120 PSI</strong>
                <span className="driver-telemetry-label">TPMS</span>
              </div>
            </div>

            {/* TRIP ROUTE CARD */}
            <div className="driver-card">
              <div className="driver-card-header">
                <span className="driver-card-title">
                  <span>📄</span>
                  <span>LR Bilty #{trip.waybillLRNumber || 'LR-2026-ASK-9941'}</span>
                </span>
                <span className="driver-card-tag">Trip: {trip.tripNumber || 'TRIP-2026-98102'}</span>
              </div>

              {/* TIMELINE */}
              <div className="driver-route-timeline">
                <div className="driver-route-line" />

                <div className="driver-route-node">
                  <div className="driver-route-indicator origin" />
                  <div>
                    <span className="driver-node-label">Kahan Se (Origin Hub):</span>
                    <strong className="driver-node-title">{trip.originHub || 'Pune Chakan SuperHub'}</strong>
                    <span className="driver-node-desc">Departed with cargo inspection clearance</span>
                  </div>
                </div>

                <div className="driver-route-node">
                  <div className="driver-route-indicator dest" />
                  <div>
                    <span className="driver-node-label">Kahan Tak (Destination Receiver):</span>
                    <strong className="driver-node-title">{trip.consigneeName || 'Samsung India Electronics Pvt Ltd'}</strong>
                    <div className="driver-node-desc">{trip.deliveryAddress || 'Plot 18, Sector 8, IMT Manesar, Gurugram'}</div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="driver-actions-grid">
                <a
                  href={`tel:${trip.consigneePhone || '+919811044219'}`}
                  className="driver-btn-call"
                >
                  <span>📞</span>
                  <span>Receiver Ko Call</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.deliveryAddress || 'IMT Manesar Gurugram')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="driver-btn-maps"
                >
                  <span>📍</span>
                  <span>Google Maps</span>
                </a>
              </div>

              {/* CARGO DOSSIER MINI CHIP */}
              <div className="driver-cargo-chip">
                <div className="driver-cargo-left">
                  <span>Mal Ka Vivran (Cargo):</span>
                  <strong>{trip.goodsDescription || '320 Electronic Appliances (18.4T)'}</strong>
                </div>
                <span className="driver-cargo-pill">E-Way Bill Active</span>
              </div>
            </div>

            {/* ODOMETER / START TRIP CARD (IF PLANNED) */}
            {trip.tripStatus === 'Planned' && (
              <div className="driver-card" style={{ border: '2px solid #0284c7' }}>
                <strong style={{ fontSize: '15px', color: '#38bdf8', display: 'block', marginBottom: '8px' }}>
                  🚀 Yatra Shuru Karein (Start Trip)
                </strong>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 14px' }}>
                  Trip shuru karne se pehle truck ka starting meter reading (KM) darj karein:
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    value={odometerInput}
                    onChange={e => setOdometerInput(e.target.value)}
                    placeholder="Meter Reading (KM)"
                    className="driver-input large"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleStartTrip}
                    className="driver-btn-success"
                    style={{ width: 'auto', padding: '12px 20px', whiteSpace: 'nowrap' }}
                  >
                    Start Trip
                  </button>
                </div>
              </div>
            )}

            {/* HIGHWAY QUICK LOGS */}
            <div className="driver-card">
              <span className="driver-node-label" style={{ display: 'block', marginBottom: '10px' }}>⚡ Raste Ke Quick Actions:</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => triggerToast('💳 Fastag Toll ₹420 deducted automatically at Surat Naka')}
                  style={{ padding: '10px 4px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#cbd5e1', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  💳 Toll Naka
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('☕ 20 Min Chai/Khana Halt Logged in Fleet GPS')}
                  style={{ padding: '10px 4px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#cbd5e1', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  ☕ Dhaba Halt
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('⚠️ Highway Traffic Jam Reported to Control Room')}
                  style={{ padding: '10px 4px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#cbd5e1', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  ⚠️ Jam Alert
                </button>
              </div>
            </div>

            {/* BIG ACTION TILES */}
            <div className="driver-tile-grid">
              <button
                type="button"
                onClick={() => setActiveTab('expense')}
                className="driver-tile-btn"
              >
                <div className="driver-tile-icon">⛽</div>
                <strong className="driver-tile-title">Fuel &amp; Expenses</strong>
                <span className="driver-tile-desc">Diesel slip ya kharcha jodein</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pod')}
                className="driver-tile-btn"
              >
                <div className="driver-tile-icon">🔐</div>
                <strong className="driver-tile-title">Delivery OTP &amp; POD</strong>
                <span className="driver-tile-desc">Receiver OTP aur signed slip</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: DIESEL SLIP & EXPENSE UPLOAD                            */}
        {/* ============================================================== */}
        {activeTab === 'expense' && (
          <div className="driver-card">
            <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⛽</span>
              <span>Trip Expense &amp; Fuel Slip Entry</span>
            </h3>

            {expenseMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: expenseMsg.includes('✓') ? '#065f46' : '#7f1d1d', color: '#ffffff', fontSize: '12.5px', marginBottom: '14px' }}>
                {expenseMsg}
              </div>
            )}

            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 700 }}>KHARCHE KA PRAKAR (EXPENSE TYPE)</label>
                <div className="driver-type-selector">
                  {[
                    { key: 'Diesel', label: '⛽ Diesel' },
                    { key: 'Toll', label: '💳 Fastag' },
                    { key: 'DriverBhatta', label: '🍱 Bhatta' },
                    { key: 'TyrePuncture', label: '🔧 Puncture' },
                    { key: 'BorderEntry', label: '🛂 Border' },
                    { key: 'Other', label: '📝 Any Other' }
                  ].map(t => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setExpenseType(t.key)}
                      className={`driver-type-pill ${expenseType === t.key ? 'active' : ''}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 700 }}>RAQAM / RUPAYE (AMOUNT IN ₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 4500"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  className="driver-input large"
                />
              </div>

              {expenseType === 'Diesel' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 700 }}>LITERS</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 52.4"
                      value={liters}
                      onChange={e => setLiters(e.target.value)}
                      className="driver-input"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 700 }}>PUMP NAAM / LOCATION</label>
                    <input
                      type="text"
                      placeholder="e.g. IndianOil Surat NH-48"
                      value={pumpName}
                      onChange={e => setPumpName(e.target.value)}
                      className="driver-input"
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 700 }}>METER READING (ODOMETER KM)</label>
                <input
                  type="number"
                  placeholder="e.g. 143400"
                  value={expenseOdo}
                  onChange={e => setExpenseOdo(e.target.value)}
                  className="driver-input"
                />
              </div>

              {/* RECEIPT ATTACHMENT */}
              <div 
                className="driver-receipt-box"
                onClick={() => triggerToast('📸 Receipt photo captured from device camera!')}
              >
                <span style={{ fontSize: '24px', display: 'block' }}>📸</span>
                <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block', marginTop: '4px' }}>Capture Slip / Receipt Photo</strong>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Tap to take photo or choose from gallery</span>
              </div>

              <button
                type="submit"
                disabled={expenseLoading}
                className="driver-btn-primary"
              >
                {expenseLoading ? 'Uploading...' : '✓ Submit Expense Entry'}
              </button>
            </form>

            {/* RECENT EXPENSES */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #1f2937', paddingTop: '16px' }}>
              <span className="driver-node-label" style={{ display: 'block', marginBottom: '8px' }}>Is Trip Ke Recent Kharch:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentExpenses.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1f2937', padding: '10px 12px', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '12.5px', color: '#ffffff' }}>{item.type}</strong>
                      <span style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block' }}>{item.time}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '13px', color: '#38bdf8' }}>₹{item.amount.toLocaleString('en-IN')}</strong>
                      <span style={{ fontSize: '10px', color: item.status === 'Approved' ? '#34d399' : '#fbbf24', display: 'block' }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: DELIVERY OTP & POD PHOTO                                */}
        {/* ============================================================== */}
        {activeTab === 'pod' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* STEP 1: OTP VERIFY */}
            <div className="driver-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#38bdf8', color: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>1</span>
                <strong style={{ fontSize: '15px', color: '#ffffff' }}>Receiver Delivery OTP Verification</strong>
              </div>

              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.4 }}>
                Cargo handover karte waqt receiver ke phone par aya 4-digit secret OTP yahan darj karein:
              </p>

              {otpMsg && (
                <div style={{ padding: '10px', borderRadius: '8px', background: otpMsg.includes('✓') ? '#065f46' : '#7f1d1d', color: '#ffffff', fontSize: '12px', marginBottom: '12px' }}>
                  {otpMsg}
                </div>
              )}

              {/* DEMO AUTOFILL SHORTCUT */}
              {!trip.isOtpVerified && (
                <button
                  type="button"
                  onClick={() => setOtpInput(trip.deliveryOtp || '4821')}
                  style={{ padding: '4px 10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', marginBottom: '12px' }}
                >
                  ⚡ Autofill Demo OTP ({trip.deliveryOtp || '4821'})
                </button>
              )}

              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="4-digit OTP"
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  disabled={trip.isOtpVerified}
                  className="driver-input large"
                  style={{ flex: 1, textAlign: 'center', letterSpacing: '6px' }}
                />
                <button
                  type="submit"
                  disabled={otpLoading || trip.isOtpVerified}
                  className={trip.isOtpVerified ? 'driver-btn-success' : 'driver-btn-primary'}
                  style={{ width: 'auto', padding: '12px 20px', whiteSpace: 'nowrap' }}
                >
                  {trip.isOtpVerified ? '✓ Verified' : otpLoading ? 'Checking...' : 'Verify OTP'}
                </button>
              </form>
            </div>

            {/* STEP 2: POD PHOTO SUBMIT */}
            <div className="driver-card" style={{ opacity: trip.isOtpVerified ? 1 : 0.65 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#38bdf8', color: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>2</span>
                <strong style={{ fontSize: '15px', color: '#ffffff' }}>Signed POD (Proof of Delivery) Upload</strong>
              </div>

              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.4 }}>
                Receiver dwara sign aur stamp ki gayi physical Bilty / POD ki saaf photo kheench kar submit karein:
              </p>

              {podMsg && (
                <div style={{ padding: '10px', borderRadius: '8px', background: '#065f46', color: '#ffffff', fontSize: '12px', marginBottom: '12px' }}>
                  {podMsg}
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <img
                  src={podPhotoUrl}
                  alt="POD Document"
                  style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #374151' }}
                />
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setPodPhotoUrl('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400');
                      triggerToast('📸 Physical POD stamped photo captured from camera!');
                    }}
                    style={{ padding: '7px 14px', background: '#1f2937', color: '#38bdf8', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    📸 Retake / Capture Physical Slip Photo
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmitPod}
                disabled={podLoading || trip.tripStatus === 'Completed'}
                className={trip.tripStatus === 'Completed' ? 'driver-btn-success' : 'driver-btn-primary'}
              >
                {trip.tripStatus === 'Completed' ? '✓ POD Approved & Consignment Finished' : podLoading ? 'Uploading POD...' : '📸 Submit POD & Finish Trip'}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: MERA HISAAB (PETTY CASH LEDGER)                         */}
        {/* ============================================================== */}
        {activeTab === 'hisaab' && (
          <div className="driver-card">
            <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💰</span>
              <span>Chalak Bhatta &amp; Petty Cash Hisaab</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <span style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Advance Received:</span>
                <strong style={{ fontSize: '18px', color: '#34d399' }}>₹{(pnl?.financials?.driverAdvanceGiven ?? 15000).toLocaleString('en-IN')}</strong>
                <small style={{ fontSize: '10px', color: '#64748b' }}>By Fleet Cash/UPI</small>
              </div>

              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <span style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Cash Expense Spent:</span>
                <strong style={{ fontSize: '18px', color: '#f87171' }}>₹{(pnl?.financials?.driverCashSpent ?? 3920).toLocaleString('en-IN')}</strong>
                <small style={{ fontSize: '10px', color: '#64748b' }}>Toll + Bhatta + Puncture</small>
              </div>
            </div>

            {/* BREAKDOWN LIST */}
            <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #1f2937', marginBottom: '14px' }}>
              <span className="driver-node-label" style={{ display: 'block', marginBottom: '10px' }}>Hisaab Breakdown:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#cbd5e1' }}>Driver Food Bhatta (3 Days @ ₹600):</span>
                  <strong>₹1,800</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#cbd5e1' }}>Cash Highway Fastag Tolls:</span>
                  <strong>₹1,420</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#cbd5e1' }}>Tyre Puncture &amp; Air Check:</span>
                  <strong>₹700</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1f2937', paddingTop: '8px', color: '#38bdf8' }}>
                  <span>Total Cash Outflow:</span>
                  <strong>₹3,920</strong>
                </div>
              </div>
            </div>

            {/* BALANCE REMAINING */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '16px', borderRadius: '12px', border: '1px solid #4338ca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#c7d2fe', textTransform: 'uppercase', fontWeight: 700 }}>Bachi Hui Rokad (Cash Balance):</span>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#38bdf8' }}>
                  ₹{(pnl?.financials?.driverPettyCashBalance ?? 11080).toLocaleString('en-IN')}
                </div>
                <small style={{ fontSize: '10.5px', color: '#a5b4fc' }}>Hub Manager ko wapas karni hai</small>
              </div>
              <button
                type="button"
                onClick={() => triggerToast('📲 Hisaab Slip WhatsApp par share ho gayi!')}
                style={{ padding: '8px 14px', background: '#38bdf8', color: '#090d16', border: 'none', borderRadius: '8px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                Share Slip
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. DRIVER SWITCHER MODAL */}
      {showDriverModal && (
        <div className="driver-modal-overlay" onClick={() => setShowDriverModal(false)}>
          <div className="driver-modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <strong style={{ fontSize: '16px', color: '#38bdf8' }}>🔄 Chalak Chunein (Switch Driver)</strong>
              <button type="button" onClick={() => setShowDriverModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 14px' }}>
              Test / Demo ke liye kisi bhi chalak ki profile chun sakte hain:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {DRIVER_PRESETS.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectDriver(preset.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: preset.id === selectedDriverId ? '2px solid #38bdf8' : '1px solid #374151',
                    background: preset.id === selectedDriverId ? 'rgba(56, 189, 248, 0.12)' : '#1f2937',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '14px', color: '#ffffff' }}>{preset.name}</strong>
                    <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>{preset.vehicleNumber}</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '3px' }}>
                    {preset.trip.originHub.split(' ')[0]} → {preset.trip.destinationHub.split(' ')[0]} ({preset.trip.tripStatus})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. EMERGENCY SOS MODAL */}
      {showSosModal && (
        <div className="driver-modal-overlay" onClick={() => setShowSosModal(false)}>
          <div className="driver-modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <strong style={{ fontSize: '16px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🚨</span>
                <span>Emergency Highway SOS Helpline</span>
              </strong>
              <button type="button" onClick={() => setShowSosModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 14px', lineHeight: 1.4 }}>
              Kisi bhi durghatna, breakdown ya emergency mein turant 1-click se call karein:
            </p>

            <a href="tel:1033" className="driver-sos-btn-row highway">
              <span style={{ fontSize: '20px' }}>🚨</span>
              <div>
                <div>1033 - NHAI Highway Helpline</div>
                <small style={{ fontSize: '10.5px', color: '#94a3b8' }}>24x7 Ambulance &amp; Crane Rescue</small>
              </div>
            </a>

            <a href="tel:112" className="driver-sos-btn-row police">
              <span style={{ fontSize: '20px' }}>🚓</span>
              <div>
                <div>112 - Police National Emergency</div>
                <small style={{ fontSize: '10.5px', color: '#94a3b8' }}>Suraksha &amp; Law Enforcement</small>
              </div>
            </a>

            <a href="tel:+919823000100" className="driver-sos-btn-row control">
              <span style={{ fontSize: '20px' }}>🏢</span>
              <div>
                <div>ASK Transport 24x7 Control Room</div>
                <small style={{ fontSize: '10.5px', color: '#94a3b8' }}>Central Fleet Dispatch Desk</small>
              </div>
            </a>

            <button
              type="button"
              onClick={() => {
                const text = encodeURIComponent(`[HIGHWAY EMERGENCY SOS]\nTruck: ${trip.vehicleNumber}\nDriver: ${trip.driverName} (${trip.driverPhone})\nLocation: NH-48 Corridor\nNeed Immediate Road Assistance!`);
                window.open(`https://api.whatsapp.com/send?phone=+919823000100&text=${text}`, '_blank');
              }}
              className="driver-btn-primary"
              style={{ marginTop: '10px' }}
            >
              📍 Share Live GPS Coordinates via WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* 6. MOBILE BOTTOM FIXED NAVIGATION BAR */}
      <div className="driver-bottom-nav">
        {[
          { id: 'trip', label: 'Trip', icon: '🛣️' },
          { id: 'expense', label: 'Expenses', icon: '⛽' },
          { id: 'pod', label: 'OTP & POD', icon: '🔐' },
          { id: 'hisaab', label: 'Ledger', icon: '💰' }
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id as any)}
            className={`driver-nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <span className="driver-nav-icon">{item.icon}</span>
            <span className="driver-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
