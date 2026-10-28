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

export default function MobileDriverConsole() {
  const [trip, setTrip] = useState<DriverActiveTrip | null>(null);
  const [pnl, setPnl] = useState<TripPnLResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trip' | 'expense' | 'pod' | 'hisaab'>('trip');

  // Trip Start State
  const [odometerInput, setOdometerInput] = useState<string>('142500');

  // Expense Form State
  const [expenseType, setExpenseType] = useState<string>('Diesel');
  const [amount, setAmount] = useState<string>('');
  const [liters, setLiters] = useState<string>('');
  const [pumpName, setPumpName] = useState<string>('');
  const [expenseOdo, setExpenseOdo] = useState<string>('');
  const [expenseMsg, setExpenseMsg] = useState<string>('');
  const [expenseLoading, setExpenseLoading] = useState(false);

  // Delivery OTP State
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpMsg, setOtpMsg] = useState<string>('');
  const [otpLoading, setOtpLoading] = useState(false);

  // POD State
  const [podPhotoUrl, setPodPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400');
  const [podMsg, setPodMsg] = useState<string>('');
  const [podLoading, setPodLoading] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const tripData = await getDriverActiveTrip();
      setTrip(tripData);
      if (tripData?.tripId) {
        const pnlData = await getTripPnL(tripData.tripId);
        setPnl(pnlData);
      }
    } catch (err) {
      console.error('Driver Console Load Error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleStartTrip() {
    const odo = parseInt(odometerInput) || 142500;
    try {
      const res = await startDriverTrip(odo);
      setTrip(res.activeTrip);
      alert('🚀 Trip Shuru Ho Gaya! Happy & Safe Journey.');
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
      await createTripExpense({
        tripId: trip?.tripId || 101,
        tripNumber: trip?.tripNumber || 'TRIP-2026-98102',
        driverName: trip?.driverName || 'Ramesh Singh',
        driverPhone: trip?.driverPhone || '+91 98230 45812',
        vehicleNumber: trip?.vehicleNumber || 'MH-12-RN-7845',
        expenseType,
        amount: Number(amount),
        liters: liters ? Number(liters) : undefined,
        fuelStationName: pumpName || undefined,
        receiptPhotoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400',
        odometerReading: expenseOdo ? Number(expenseOdo) : undefined
      });
      setExpenseMsg('✓ Kharcha safalta-purvak add ho gaya! Admin review karega.');
      setAmount('');
      setLiters('');
      setPumpName('');
      loadData();
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
      const res = await verifyDeliveryOtp(otpInput);
      setOtpMsg(res.message);
      loadData();
    } catch (err: any) {
      setOtpMsg('❌ ' + (err?.response?.data?.message || err?.message || 'Galat OTP!'));
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleSubmitPod(e: React.FormEvent) {
    e.preventDefault();
    try {
      setPodLoading(true);
      setPodMsg('');
      const res = await submitDriverPod({
        photoUrl: podPhotoUrl,
        receiverNotes: 'Receiver signed & stamped physically upon full carton inspection.'
      });
      setPodMsg(res.message);
      loadData();
    } catch (err: any) {
      setPodMsg('Failed to submit POD: ' + err?.message);
    } finally {
      setPodLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '70px', position: 'relative' }}>
      {/* MOBILE TOP BAR */}
      <div style={{ background: '#1e293b', padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🚛</span>
          <div>
            <strong style={{ fontSize: '15px', color: '#38bdf8', display: 'block' }}>ASK Transport Driver App</strong>
            <small style={{ fontSize: '11px', color: '#94a3b8' }}>Dedicated Mobile Console • Hindi / English</small>
          </div>
        </div>
        <span style={{ padding: '4px 8px', background: '#16a34a', color: '#ffffff', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
          ONLINE
        </span>
      </div>

      {/* DRIVER PROFILE MINI STRIP */}
      <div style={{ background: 'linear-gradient(90deg, #1e1b4b, #312e81)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#c7d2fe', textTransform: 'uppercase' }}>CHALAK (DRIVER):</span>
          <strong style={{ fontSize: '14px', color: '#ffffff', display: 'block' }}>{trip?.driverName || 'Ramesh Singh Rawat'}</strong>
          <span style={{ fontSize: '11.5px', color: '#a5b4fc' }}>Truck: {trip?.vehicleNumber || 'MH-12-RN-7845'}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: '#c7d2fe' }}>TRIP STATUS</span>
          <div style={{ fontSize: '12px', fontWeight: 800, color: trip?.tripStatus === 'Completed' ? '#4ade80' : '#facc15' }}>
            {trip?.tripStatus === 'InTransit' ? '🛣️ Raste Mein (In Transit)' : trip?.tripStatus === 'Completed' ? '✓ Delivery Samapt' : trip?.tripStatus}
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ padding: '8px 16px', background: '#1e3a8a', color: '#bfdbfe', fontSize: '12px', textAlign: 'center' }}>
          Syncing trip details with central fleet server...
        </div>
      )}

      {/* TABS CONTAINER */}
      <div style={{ padding: '16px' }}>
        {/* ============================================================== */}
        {/* TAB 1: ACTIVE TRIP & MAPS NAVIGATION */}
        {/* ============================================================== */}
        {activeTab === 'trip' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* TRIP CARD */}
            <div style={{ background: '#1e293b', borderRadius: '14px', padding: '18px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700 }}>LR Bilty #{trip?.waybillLRNumber}</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Trip: {trip?.tripNumber}</span>
              </div>

              {/* ROUTE STEPS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '16px', color: '#22c55e' }}>🟢</span>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Kahan Se (Origin Hub):</span>
                    <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>{trip?.originHub}</strong>
                  </div>
                </div>

                <div style={{ paddingLeft: '8px', borderLeft: '2px dashed #475569', marginLeft: '6px', height: '14px' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '16px', color: '#ef4444' }}>🔴</span>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Kahan Tak (Destination Receiver):</span>
                    <strong style={{ fontSize: '13.5px', color: '#ffffff', display: 'block' }}>{trip?.consigneeName}</strong>
                    <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{trip?.deliveryAddress}</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <a
                  href={`tel:${trip?.consigneePhone || '+919811044219'}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '12px',
                    borderRadius: '10px',
                    background: '#2563eb',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}
                >
                  📞 Receiver Ko Call
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip?.deliveryAddress || 'IMT Manesar Gurugram')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '12px',
                    borderRadius: '10px',
                    background: '#059669',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}
                >
                  📍 Google Maps
                </a>
              </div>
            </div>

            {/* ODOMETER / START TRIP CARD */}
            {trip?.tripStatus === 'Planned' && (
              <div style={{ background: '#1e293b', borderRadius: '14px', padding: '18px', border: '1px solid #334155' }}>
                <strong style={{ fontSize: '14px', color: '#ffffff', display: 'block', marginBottom: '8px' }}>
                  🚀 Trip Shuru Karein (Start Trip)
                </strong>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px' }}>
                  Trip shuru karne se pehle truck ke meter ka Starting Odometer KM daalein.
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    value={odometerInput}
                    onChange={e => setOdometerInput(e.target.value)}
                    placeholder="Meter Reading (KM)"
                    style={{ flex: 1, padding: '12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '15px', fontWeight: 700 }}
                  />
                  <button
                    type="button"
                    onClick={handleStartTrip}
                    style={{ padding: '12px 20px', background: '#22c55e', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}
                  >
                    Start Trip
                  </button>
                </div>
              </div>
            )}

            {/* QUICK ACTIONS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('expense')}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#334155',
                  border: '1px solid #475569',
                  color: '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>⛽</div>
                <strong style={{ fontSize: '13.5px', display: 'block' }}>Diesel / Kharcha</strong>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Slip photo upload karein</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pod')}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#334155',
                  border: '1px solid #475569',
                  color: '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>🔐</div>
                <strong style={{ fontSize: '13.5px', display: 'block' }}>OTP &amp; POD Bilty</strong>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Delivery confirm karein</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: DIESEL SLIP & EXPENSE UPLOAD */}
        {/* ============================================================== */}
        {activeTab === 'expense' && (
          <div style={{ background: '#1e293b', borderRadius: '14px', padding: '18px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⛽</span> Trip Kharcha / Diesel Entry
            </h3>

            {expenseMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: expenseMsg.includes('✓') ? '#065f46' : '#7f1d1d', color: '#ffffff', fontSize: '12.5px', marginBottom: '14px' }}>
                {expenseMsg}
              </div>
            )}

            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>KHARCHE KA PRAKAR (EXPENSE TYPE)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {['Diesel', 'Toll', 'DriverBhatta', 'TyrePuncture', 'BorderEntry', 'Other'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setExpenseType(t)}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        border: expenseType === t ? '2px solid #38bdf8' : '1px solid #475569',
                        background: expenseType === t ? '#0284c7' : '#0f172a',
                        color: '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      {t === 'Diesel' ? '⛽ Diesel' : t === 'Toll' ? '💳 Toll' : t === 'DriverBhatta' ? '🍱 Bhatta' : t === 'TyrePuncture' ? '🔧 Tyre' : t === 'BorderEntry' ? '🛂 Border' : '📝 Other'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>RAQAM / RUPAYE (AMOUNT IN ₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '16px', fontWeight: 800 }}
                />
              </div>

              {expenseType === 'Diesel' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>LITERS</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 55.4"
                      value={liters}
                      onChange={e => setLiters(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>PUMP NAAM / LOCATION</label>
                    <input
                      type="text"
                      placeholder="e.g. IndianOil Surat"
                      value={pumpName}
                      onChange={e => setPumpName(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '11.5px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>METER READING (ODOMETER KM)</label>
                <input
                  type="number"
                  placeholder="e.g. 142980"
                  value={expenseOdo}
                  onChange={e => setExpenseOdo(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }}
                />
              </div>

              {/* RECEIPT ATTACHMENT */}
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px dashed #64748b', textAlign: 'center' }}>
                <span style={{ fontSize: '18px', display: 'block' }}>📸</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Slip / Receipt Photo Camera Se Kheenche</span>
                <div style={{ marginTop: '6px' }}>
                  <button type="button" onClick={() => alert('Photo attach ho gayi!')} style={{ padding: '6px 14px', background: '#334155', color: '#38bdf8', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    Capture Slip Photo
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={expenseLoading}
                style={{ padding: '14px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', marginTop: '6px' }}
              >
                {expenseLoading ? 'Uploading...' : '✓ Kharcha Submit Karein'}
              </button>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: DELIVERY OTP & POD PHOTO */}
        {/* ============================================================== */}
        {activeTab === 'pod' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* STEP 1: OTP VERIFY */}
            <div style={{ background: '#1e293b', borderRadius: '14px', padding: '18px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#38bdf8', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>1</span>
                <strong style={{ fontSize: '14px', color: '#ffffff' }}>Customer Delivery OTP Verification</strong>
              </div>

              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px' }}>
                Maal deliver hone par consignee ke phone par aaya 4-digit code yahan daalein (Demo code: <strong>4821</strong>).
              </p>

              {otpMsg && (
                <div style={{ padding: '10px', borderRadius: '8px', background: otpMsg.includes('✓') ? '#065f46' : '#7f1d1d', color: '#ffffff', fontSize: '12px', marginBottom: '12px' }}>
                  {otpMsg}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="4-digit OTP"
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  disabled={trip?.isOtpVerified}
                  style={{ flex: 1, padding: '12px', textAlign: 'center', letterSpacing: '4px', fontSize: '18px', fontWeight: 800, background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: '#ffffff' }}
                />
                <button
                  type="submit"
                  disabled={otpLoading || trip?.isOtpVerified}
                  style={{ padding: '12px 18px', background: trip?.isOtpVerified ? '#059669' : '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                >
                  {trip?.isOtpVerified ? '✓ Verified' : otpLoading ? 'Checking...' : 'Verify OTP'}
                </button>
              </form>
            </div>

            {/* STEP 2: POD PHOTO SUBMIT */}
            <div style={{ background: '#1e293b', borderRadius: '14px', padding: '18px', border: '1px solid #334155', opacity: trip?.isOtpVerified ? 1 : 0.65 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#38bdf8', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>2</span>
                <strong style={{ fontSize: '14px', color: '#ffffff' }}>Signed POD (Proof of Delivery) Upload</strong>
              </div>

              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px' }}>
                Receiver ke signature aur rubber stamp lagi hui physical Bilty/POD ki clear photo kheenche.
              </p>

              {podMsg && (
                <div style={{ padding: '10px', borderRadius: '8px', background: '#065f46', color: '#ffffff', fontSize: '12px', marginBottom: '12px' }}>
                  {podMsg}
                </div>
              )}

              {/* PREVIEW IMAGE */}
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <img
                  src={podPhotoUrl}
                  alt="POD Document"
                  style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #475569' }}
                />
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setPodPhotoUrl('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400');
                      alert('📸 Photo captured from device camera!');
                    }}
                    style={{ padding: '6px 12px', background: '#334155', color: '#38bdf8', border: 'none', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    📸 Retake / Capture Physical Slip Photo
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmitPod}
                disabled={podLoading || trip?.tripStatus === 'Completed'}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: trip?.tripStatus === 'Completed' ? '#16a34a' : '#22c55e',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                {trip?.tripStatus === 'Completed' ? '✓ POD Approved & Trip Completed' : podLoading ? 'Uploading POD...' : '📸 Submit POD & Finish Trip'}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: MERA HISAAB (PETTY CASH LEDGER) */}
        {/* ============================================================== */}
        {activeTab === 'hisaab' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#1e293b', borderRadius: '14px', padding: '18px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#38bdf8' }}>
                💰 Driver Petty Cash Hisaab-Kitab
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Trip Advance Mila:</span>
                  <strong style={{ fontSize: '18px', color: '#22c55e' }}>₹{(pnl?.financials?.driverAdvanceGiven ?? 15000).toLocaleString('en-IN')}</strong>
                </div>

                <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Cash Kharcha Hua:</span>
                  <strong style={{ fontSize: '18px', color: '#f87171' }}>₹{(pnl?.financials?.driverCashSpent ?? 0).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div style={{ background: '#1e1b4b', padding: '14px', borderRadius: '10px', border: '1px solid #4338ca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#c7d2fe', textTransform: 'uppercase' }}>Bacha Hua Cash Balance:</span>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#38bdf8' }}>
                    ₹{(pnl?.financials?.driverPettyCashBalance ?? 15000).toLocaleString('en-IN')}
                  </div>
                </div>
                <span style={{ padding: '4px 10px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                  Trip Settlement
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: '#1e293b', borderTop: '1px solid #334155', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '6px 0', zIndex: 100 }}>
        {[
          { id: 'trip', label: 'Trip', icon: '🛣️' },
          { id: 'expense', label: 'Kharcha', icon: '⛽' },
          { id: 'pod', label: 'OTP & POD', icon: '🔐' },
          { id: 'hisaab', label: 'Hisaab', icon: '💰' }
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id as any)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: activeTab === item.id ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span style={{ fontSize: '10.5px', fontWeight: activeTab === item.id ? 800 : 500 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
