import { useState } from 'react';
import { Send, ExternalLink, CheckCircle2, MessageSquare, Copy, Check, Navigation } from 'lucide-react';
import { sendDriverWhatsAppDutySlip, type DutySlipRequest } from '../api/fleetApi';
import './DriverWhatsAppDutySlipDeck.css';

interface PreloadedDriver {
  id: number;
  name: string;
  phone: string;
  vehicleNumber: string;
  truckModel: string;
  originHub: string;
  destinationHub: string;
  cargo: string;
  dieselAdvance: number;
  bhatta: number;
  ewb: string;
  status: 'Dispatched' | 'Delivered' | 'En Route';
  sentAt: string;
}

const SAMPLE_DRIVERS: PreloadedDriver[] = [
  {
    id: 1,
    name: 'Murugan Swamy',
    phone: '+91 98450 12890',
    vehicleNumber: 'RJ-14-GH-4921',
    truckModel: 'Ashok Leyland 2820 (32ft MXL)',
    originHub: 'Delhi SuperHub (Okhla)',
    destinationHub: 'Mumbai Port (Nhava Sheva Terminal)',
    cargo: 'Tata Steel Heavy Tubes (24.5 MT)',
    dieselAdvance: 15000,
    bhatta: 2500,
    ewb: '2410-9921-8841',
    status: 'En Route',
    sentAt: 'Today, 08:30 AM'
  },
  {
    id: 2,
    name: 'Ramesh Singh Rawat',
    phone: '+91 98230 45812',
    vehicleNumber: 'MH-12-RN-7845',
    truckModel: 'BharatBenz 2823R (Heavy 28T)',
    originHub: 'Pune Chakan Industrial Hub',
    destinationHub: 'Gurugram IMT Manesar',
    cargo: 'Auto Parts & Engine Assemblies (18.2 MT)',
    dieselAdvance: 18500,
    bhatta: 3000,
    ewb: '2710-8841-3920',
    status: 'Dispatched',
    sentAt: 'Today, 10:15 AM'
  },
  {
    id: 3,
    name: 'Jaswinder Singh',
    phone: '+91 98112 34981',
    vehicleNumber: 'HR-55-AN-8102',
    truckModel: 'Tata Signa 4825.TK (Multi-Axle)',
    originHub: 'Ludhiana Cargo Logistics Park',
    destinationHub: 'Kandla Seaport Container Terminal',
    cargo: 'Hosiery & Textile Machinery (22.0 MT)',
    dieselAdvance: 16000,
    bhatta: 2800,
    ewb: '2810-7719-2041',
    status: 'En Route',
    sentAt: 'Yesterday, 04:45 PM'
  },
  {
    id: 4,
    name: 'Suresh Kumar Gurjar',
    phone: '+91 97820 65123',
    vehicleNumber: 'RJ-14-GH-4921',
    truckModel: 'Ashok Leyland 3520 (Multi-Axle 12W)',
    originHub: 'Jaipur Sitapura Industrial Zone',
    destinationHub: 'Bengaluru Peenya Central Hub',
    cargo: 'Marble Slabs & Industrial Tiles (26.4 MT)',
    dieselAdvance: 21000,
    bhatta: 3500,
    ewb: '1810-8849-2041',
    status: 'Delivered',
    sentAt: 'Yesterday, 11:20 AM'
  }
];

export default function DriverWhatsAppDutySlipDeck() {
  const [selectedDriverId, setSelectedDriverId] = useState<number>(1);
  const selectedDriver = SAMPLE_DRIVERS.find(d => d.id === selectedDriverId) || SAMPLE_DRIVERS[0];

  const [formData, setFormData] = useState<DutySlipRequest>({
    tripId: selectedDriver.id + 100,
    tripNumber: `TRIP-2026-9810${selectedDriver.id}`,
    driverName: selectedDriver.name,
    driverPhone: selectedDriver.phone,
    vehicleNumber: selectedDriver.vehicleNumber,
    truckModel: selectedDriver.truckModel,
    originHub: selectedDriver.originHub,
    destinationHub: selectedDriver.destinationHub,
    cargoDescription: selectedDriver.cargo,
    dieselAdvance: selectedDriver.dieselAdvance,
    bhattaAmount: selectedDriver.bhatta,
    ewayBillNumber: selectedDriver.ewb
  });

  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{
    whatsappUrl: string;
    messagePreview: string;
  } | null>(null);

  // When changing driver selection from list
  const handleSelectDriver = (d: PreloadedDriver) => {
    setSelectedDriverId(d.id);
    setFormData({
      tripId: d.id + 100,
      tripNumber: `TRIP-2026-9810${d.id}`,
      driverName: d.name,
      driverPhone: d.phone,
      vehicleNumber: d.vehicleNumber,
      truckModel: d.truckModel,
      originHub: d.originHub,
      destinationHub: d.destinationHub,
      cargoDescription: d.cargo,
      dieselAdvance: d.dieselAdvance,
      bhattaAmount: d.bhatta,
      ewayBillNumber: d.ewb
    });
    setDispatchResult(null);
  };

  const rawPhone = (formData.driverPhone || '').replace(/\D/g, '');

  const generatedMessage =
    `🚛 *ASK TRANSPORT HIGHWAY LOAD ASSIGNMENT*\n` +
    `--------------------------------\n` +
    `नमस्ते *${formData.driverName}* जी,\n` +
    `आपकी आज की गाड़ी ड्यूटी असाइन कर दी गई है:\n\n` +
    `📍 *गाड़ी नंबर:* ${formData.vehicleNumber} (${formData.truckModel})\n` +
    `📦 *रूट:* ${formData.originHub} ➔ ${formData.destinationHub}\n` +
    `🏷️ *माल विवरण:* ${formData.cargoDescription}\n` +
    `⛽ *डीजल एडवांस:* ₹${formData.dieselAdvance.toLocaleString('en-IN')} (IOCL Fleet Card loaded)\n` +
    `💵 *रास्ते का भत्ता (Bhatta):* ₹${formData.bhattaAmount.toLocaleString('en-IN')}\n` +
    `📜 *E-Way Bill:* ${formData.ewayBillNumber}\n\n` +
    `🗺️ *Google Maps Highway Route:* https://maps.google.com/?q=${encodeURIComponent(formData.destinationHub)}\n` +
    `📑 *Digital Bilty & Gate Pass QR:* https://track.asktransport.com/bilty/${formData.tripNumber}\n\n` +
    `⚠️ *इमरजेंसी / 24x7 SOS हेल्पलाइन:* 1800-ASK-TRAN\n` +
    `सुरक्षित यात्रा! जय हिन्द! 🇮🇳`;

  const directWhatsAppUrl = `https://api.whatsapp.com/send?phone=${rawPhone}&text=${encodeURIComponent(generatedMessage)}`;

  async function handleDispatch() {
    try {
      setSending(true);
      const res = await sendDriverWhatsAppDutySlip(formData);
      setDispatchResult({
        whatsappUrl: res.whatsappUrl || directWhatsAppUrl,
        messagePreview: res.messagePreview || generatedMessage
      });
    } catch (err: any) {
      alert('Failed to dispatch: ' + err?.message);
    } finally {
      setSending(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="duty-slip-deck-container">
      {/* 1. TOP HEADER BANNER */}
      <div className="duty-slip-hero-banner">
        <div>
          <div className="duty-slip-hero-pill">
            <MessageSquare size={13} />
            <span>META WHATSAPP BUSINESS CLOUD API</span>
          </div>
          <h1>Driver WhatsApp Highway Duty Slip &amp; Dispatch Console</h1>
          <p>
            1-Click bilingual load assignment dispatch to commercial drivers. Dispatches fuel card advances,
            highway bhatta vouchers, E-Way Bill numbers, Google Maps navigation routes, and digital QR bilties.
          </p>
        </div>
      </div>

      {/* 2. TOP METRICS STRIP */}
      <div className="duty-slip-kpi-grid">
        <div className="duty-slip-kpi-card">
          <span className="duty-slip-kpi-label">TOTAL DUTY SLIPS DISPATCHED</span>
          <strong className="duty-slip-kpi-val" style={{ color: '#10b981' }}>28 Slips</strong>
          <span className="duty-slip-kpi-sub green">✓ 100% Delivery on WhatsApp</span>
        </div>

        <div className="duty-slip-kpi-card">
          <span className="duty-slip-kpi-label">DIESEL ADVANCES LOADED</span>
          <strong className="duty-slip-kpi-val" style={{ color: '#0284c7' }}>₹4,12,500</strong>
          <span className="duty-slip-kpi-sub blue">IOCL &amp; HPCL Fleet Cards</span>
        </div>

        <div className="duty-slip-kpi-card">
          <span className="duty-slip-kpi-label">HIGHWAY BHATTA RELEASED</span>
          <strong className="duty-slip-kpi-val" style={{ color: '#f59e0b' }}>₹68,500</strong>
          <span className="duty-slip-kpi-sub amber">Driver Petty Cash Handover</span>
        </div>

        <div className="duty-slip-kpi-card">
          <span className="duty-slip-kpi-label">HIGHWAY SAFETY SCORE</span>
          <strong className="duty-slip-kpi-val" style={{ color: '#a855f7' }}>98.6%</strong>
          <span className="duty-slip-kpi-sub purple">Vahan &amp; Sarathi Verified</span>
        </div>
      </div>

      {/* 3. MAIN 2-COLUMN DISPATCH ARENA */}
      <div className="duty-slip-arena-grid">
        {/* LEFT COLUMN: DUTY SLIP COMPOSITION CARD */}
        <div className="duty-slip-compose-card">
          <div className="duty-slip-card-header">
            <div>
              <h3><span>📋</span> Duty Slip Assignment Parameters</h3>
              <p>Configure load details, fuel card advance, and pilot driver</p>
            </div>
          </div>

          {/* Quick Select Driver Strip */}
          <div className="duty-slip-form-group">
            <label className="duty-slip-label">Select Pilot Driver from Fleet:</label>
            <div className="duty-slip-driver-chips">
              {SAMPLE_DRIVERS.map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleSelectDriver(d)}
                  className={`duty-slip-driver-chip ${selectedDriverId === d.id ? 'active' : ''}`}
                >
                  <span className="chip-avatar">{d.name.charAt(0)}</span>
                  <div className="chip-info">
                    <strong>{d.name}</strong>
                    <small>{d.vehicleNumber}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="duty-slip-form-grid">
            <div className="duty-slip-field">
              <label className="duty-slip-label">Driver Full Name</label>
              <input
                type="text"
                value={formData.driverName}
                onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                className="duty-slip-input"
              />
            </div>

            <div className="duty-slip-field">
              <label className="duty-slip-label">Driver Phone (WhatsApp)</label>
              <input
                type="text"
                value={formData.driverPhone}
                onChange={e => setFormData({ ...formData, driverPhone: e.target.value })}
                className="duty-slip-input"
              />
            </div>

            <div className="duty-slip-field">
              <label className="duty-slip-label">Vehicle Plate Number</label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                className="duty-slip-input monospace"
              />
            </div>

            <div className="duty-slip-field">
              <label className="duty-slip-label">Truck Model &amp; Axle</label>
              <input
                type="text"
                value={formData.truckModel}
                onChange={e => setFormData({ ...formData, truckModel: e.target.value })}
                className="duty-slip-input"
              />
            </div>

            <div className="duty-slip-field">
              <label className="duty-slip-label">Origin Hub</label>
              <input
                type="text"
                value={formData.originHub}
                onChange={e => setFormData({ ...formData, originHub: e.target.value })}
                className="duty-slip-input"
              />
            </div>

            <div className="duty-slip-field">
              <label className="duty-slip-label">Destination Hub</label>
              <input
                type="text"
                value={formData.destinationHub}
                onChange={e => setFormData({ ...formData, destinationHub: e.target.value })}
                className="duty-slip-input"
              />
            </div>

            <div className="duty-slip-field">
              <label className="duty-slip-label">Diesel Advance (₹)</label>
              <input
                type="number"
                value={formData.dieselAdvance}
                onChange={e => setFormData({ ...formData, dieselAdvance: Number(e.target.value) })}
                className="duty-slip-input font-bold text-emerald"
              />
            </div>

            <div className="duty-slip-field">
              <label className="duty-slip-label">Highway Bhatta (₹)</label>
              <input
                type="number"
                value={formData.bhattaAmount}
                onChange={e => setFormData({ ...formData, bhattaAmount: Number(e.target.value) })}
                className="duty-slip-input font-bold text-amber"
              />
            </div>

            <div className="duty-slip-field full-width">
              <label className="duty-slip-label">Cargo Consignment Description</label>
              <input
                type="text"
                value={formData.cargoDescription}
                onChange={e => setFormData({ ...formData, cargoDescription: e.target.value })}
                className="duty-slip-input"
              />
            </div>

            <div className="duty-slip-field full-width">
              <label className="duty-slip-label">Statutory E-Way Bill Number</label>
              <input
                type="text"
                value={formData.ewayBillNumber}
                onChange={e => setFormData({ ...formData, ewayBillNumber: e.target.value })}
                className="duty-slip-input monospace"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE WHATSAPP CHAT SIMULATOR CARD */}
        <div className="duty-slip-preview-card">
          <div className="duty-slip-card-header">
            <div>
              <h3><span>💬</span> Live WhatsApp Message Simulation</h3>
              <p>Exact bilingual dispatch preview delivered to pilot driver's phone</p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="duty-slip-btn-copy"
              title="Copy duty slip text"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>

          {/* SIMULATED WHATSAPP DEVICE FRAME */}
          <div className="whatsapp-device-frame">
            <div className="whatsapp-chat-header">
              <div className="whatsapp-avatar">🚛</div>
              <div className="whatsapp-header-text">
                <strong>ASK Transport Highway Control</strong>
                <small>Official Verified Business • Online</small>
              </div>
            </div>

            <div className="whatsapp-chat-body">
              <div className="whatsapp-bubble">
                <div className="whatsapp-bubble-title">
                  🚛 ASK TRANSPORT HIGHWAY LOAD ASSIGNMENT
                </div>
                <div className="whatsapp-salutation">
                  नमस्ते <strong>{formData.driverName}</strong> जी,
                </div>
                <div className="whatsapp-line">
                  आपकी आज की गाड़ी ड्यूटी असाइन कर दी गई है:
                </div>

                <div className="whatsapp-spec-box">
                  <div>📍 <strong>गाड़ी नंबर:</strong> {formData.vehicleNumber} ({formData.truckModel})</div>
                  <div>📦 <strong>रूट:</strong> {formData.originHub} ➔ {formData.destinationHub}</div>
                  <div>🏷️ <strong>माल:</strong> {formData.cargoDescription}</div>
                  <div>⛽ <strong>डीजल एडवांस:</strong> ₹{formData.dieselAdvance.toLocaleString('en-IN')} (IOCL Card loaded)</div>
                  <div>💵 <strong>रास्ते का भत्ता:</strong> ₹{formData.bhattaAmount.toLocaleString('en-IN')}</div>
                  <div>📜 <strong>E-Way Bill:</strong> {formData.ewayBillNumber}</div>
                </div>

                <div className="whatsapp-links-box">
                  <div>🗺️ <strong>Google Maps Route:</strong> <span>Open Live Navigation</span></div>
                  <div>📑 <strong>Digital Bilty &amp; QR:</strong> <span>track.asktransport.com/bilty/{formData.tripNumber}</span></div>
                  <div>⚠️ <strong>24x7 SOS Toll-Free:</strong> <span>1800-ASK-TRAN</span></div>
                </div>

                <div className="whatsapp-footer-line">
                  सुरक्षित यात्रा! जय हिन्द! 🇮🇳
                  <span className="whatsapp-time">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DISPATCH ACTION BUTTONS */}
          <div className="duty-slip-action-bar">
            <button
              type="button"
              onClick={handleDispatch}
              disabled={sending}
              className="duty-slip-btn-dispatch"
            >
              <Send size={15} />
              <span>{sending ? 'Dispatching via Meta Cloud API...' : '📲 Dispatch WhatsApp Duty Slip Now'}</span>
            </button>

            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="duty-slip-btn-web"
            >
              <ExternalLink size={15} />
              <span>Open in WhatsApp Web</span>
            </a>
          </div>

          {dispatchResult && (
            <div className="duty-slip-success-banner">
              <CheckCircle2 size={24} color="#10b981" />
              <div>
                <strong>Duty Slip Dispatched Successfully!</strong>
                <p>Delivered to driver {formData.driverName} ({formData.driverPhone}) via Meta WhatsApp Cloud API.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. BOTTOM ACTIVE DRIVERS LOAD ASSIGNMENT CARDS (100% CARDS) */}
      <div className="duty-slip-recent-section">
        <div className="duty-slip-section-header">
          <div>
            <h3><span>🚛</span> Active Fleet Drivers &amp; Highway Load Registry</h3>
            <p>1-Click instant dispatch to any assigned commercial driver</p>
          </div>
        </div>

        <div className="duty-slip-cards-grid">
          {SAMPLE_DRIVERS.map(d => (
            <div key={d.id} className="duty-slip-driver-card">
              <div className="duty-slip-card-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="driver-card-avatar">{d.name.charAt(0)}</div>
                  <div>
                    <strong className="driver-card-name">{d.name}</strong>
                    <div className="driver-card-phone">{d.phone}</div>
                  </div>
                </div>
                <span className={`duty-slip-status-pill ${d.status.toLowerCase().replace(' ', '-')}`}>
                  {d.status === 'En Route' ? '🚛 En Route' : d.status === 'Dispatched' ? '✓ Dispatched' : '🏁 Delivered'}
                </span>
              </div>

              <div className="duty-slip-card-route">
                <Navigation size={14} className="text-emerald" />
                <span>{d.originHub}</span>
                <span className="route-arrow">➔</span>
                <span>{d.destinationHub}</span>
              </div>

              <div className="duty-slip-card-details">
                <div>
                  <small>VEHICLE</small>
                  <strong>{d.vehicleNumber}</strong>
                </div>
                <div>
                  <small>DIESEL ADVANCE</small>
                  <strong className="text-emerald">₹{d.dieselAdvance.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <small>BHATTA</small>
                  <strong className="text-amber">₹{d.bhatta.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="duty-slip-card-footer">
                <span className="duty-slip-sent-time">Dispatched: {d.sentAt}</span>
                <button
                  type="button"
                  onClick={() => handleSelectDriver(d)}
                  className="duty-slip-btn-reassign"
                >
                  <MessageSquare size={13} />
                  <span>Send Duty Slip</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
