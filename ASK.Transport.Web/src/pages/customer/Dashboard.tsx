import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../layouts/CustomerLayout';
import { getClientBookings } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import ConsignmentLRModal, { type ConsignmentLRData } from '../../components/ConsignmentLRModal';
import ElectronicPodModal, { type PodData } from '../../components/ElectronicPodModal';
import GstTaxInvoiceModal, { type GstInvoiceData } from '../../components/GstTaxInvoiceModal';
import '../../styles/DashboardHome.css';

interface DisplayShipment {
  id: number;
  bookingNumber: string;
  lrNumber: string;
  from: string;
  fromAddress?: string;
  to: string;
  toAddress?: string;
  distanceKm: number;
  status: 'In Transit' | 'Delivered' | 'Pending' | 'Cancelled';
  date: string;
  vehiclePlate: string;
  truckModel?: string;
  driverName: string;
  driverPhone: string;
  cargoType: string;
  weightKg: number;
  freightAmount: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  currentLocation?: string;
  speed?: string;
  eta?: string;
  invoiceNo?: string;
  deliveredDate?: string;
}

const SEED_SHIPMENTS: DisplayShipment[] = [
  {
    id: 1,
    bookingNumber: 'ASKB00123',
    lrNumber: 'ASK-LR-2026-98102',
    from: 'Delhi NCR (Central Godown)',
    fromAddress: 'Plot 42, Sanjay Gandhi Transport Nagar, GT Karnal Road, Delhi - 110042',
    to: 'Mumbai (Bhiwandi SuperHub)',
    toAddress: 'Bhiwandi Logistics Hub, Mumbai-Nashik Expressway, Thane - 421302',
    distanceKm: 1420,
    status: 'In Transit',
    date: '21 Sep 2026',
    vehiclePlate: 'MH 12 RN 7845',
    truckModel: 'Tata Signa 4825.T · 40 FT Multi-Axle',
    driverName: 'Ramesh Singh Rawat',
    driverPhone: '+91 98230 45812',
    cargoType: 'Industrial Heavy Equipment & Precision Machine Parts',
    weightKg: 18500,
    freightAmount: 12288,
    totalAmount: 14500,
    paymentStatus: 'Paid',
    currentLocation: 'Cruising NH-48 Express Corridor (Surat Bypass Toll)',
    speed: '58 km/h',
    eta: 'Tomorrow, 10:30 AM',
    invoiceNo: 'INV-2026-00123'
  },
  {
    id: 2,
    bookingNumber: 'ASKB00122',
    lrNumber: 'ASK-LR-2026-98099',
    from: 'Bangalore (Peenya Depot)',
    fromAddress: 'Phase 1, Peenya Industrial Area, Bengaluru, Karnataka - 560058',
    to: 'Chennai (Guindy Terminal)',
    toAddress: 'Guindy Industrial Estate, Chennai, Tamil Nadu - 600032',
    distanceKm: 345,
    status: 'Delivered',
    date: '18 Sep 2026',
    deliveredDate: '18 Sep 2026, 04:30 PM',
    vehiclePlate: 'MH 12 EF 9012',
    truckModel: 'Ashok Leyland 3520 · 32 FT Multi-Axle',
    driverName: 'Sanjay Deshmukh',
    driverPhone: '+91 98223 99887',
    cargoType: 'Automotive Engine Castings & Transmission Units',
    weightKg: 12400,
    freightAmount: 19322,
    totalAmount: 22800,
    paymentStatus: 'Paid',
    currentLocation: 'Delivered at Guindy Dock Yard · POD Verified',
    speed: '0 km/h',
    eta: 'Delivered',
    invoiceNo: 'INV-2026-00122'
  },
  {
    id: 3,
    bookingNumber: 'ASKB00121',
    lrNumber: 'ASK-LR-2026-98096',
    from: 'Pune (Chakan Auto Cluster)',
    fromAddress: 'Phase 2 MIDC Chakan, Pune, Maharashtra - 410501',
    to: 'Hyderabad (Cherlapally Hub)',
    toAddress: 'Cherlapally Industrial Terminal, Hyderabad, Telangana - 500051',
    distanceKm: 560,
    status: 'Pending',
    date: '15 Sep 2026',
    vehiclePlate: 'MP 04 QF 56978',
    truckModel: 'BharatBenz 2823C · 28 FT High-Deck',
    driverName: 'Kishan Gurjar',
    driverPhone: '+91 98980 44332',
    cargoType: 'Bulk Pharma Raw Materials & Formulations',
    weightKg: 14200,
    freightAmount: 15423,
    totalAmount: 18200,
    paymentStatus: 'Pending',
    currentLocation: 'Awaiting Shipper Payment Settlement · Bay 04',
    speed: '0 km/h',
    eta: 'Scheduled upon Payment',
    invoiceNo: 'INV-2026-00121'
  },
  {
    id: 4,
    bookingNumber: 'ASKB00120',
    lrNumber: 'ASK-LR-2026-98094',
    from: 'Delhi (SGTN Logistics)',
    fromAddress: 'Sanjay Gandhi Transport Nagar, Delhi - 110042',
    to: 'Jaipur (VKI Industrial Area)',
    toAddress: 'Road No 14, VKIA, Jaipur, Rajasthan - 302013',
    distanceKm: 270,
    status: 'Cancelled',
    date: '12 Sep 2026',
    vehiclePlate: 'RJ 14 GB 4120',
    truckModel: 'Tata 1616 LPT Freightliner',
    driverName: 'Mohan Singh',
    driverPhone: '+91 98110 55667',
    cargoType: 'Consumer Electrical Appliances & Lighting Hardware',
    weightKg: 9800,
    freightAmount: 10593,
    totalAmount: 12500,
    paymentStatus: 'Refunded',
    currentLocation: 'Consignment Cancelled by Shipper · Refund Processed',
    speed: '0 km/h',
    eta: 'N/A'
  },
  {
    id: 5,
    bookingNumber: 'ASKB00119',
    lrNumber: 'ASK-LR-2026-98091',
    from: 'Kolkata (Dankuni Freight)',
    fromAddress: 'Dankuni Terminal Complex, Hooghly, West Bengal - 712311',
    to: 'Patna (Fatuha Multi-Modal Hub)',
    toAddress: 'Fatuha Industrial Growth Centre, Patna, Bihar - 803201',
    distanceKm: 590,
    status: 'In Transit',
    date: '10 Sep 2026',
    vehiclePlate: 'HR 26 LM 4321',
    truckModel: 'Eicher Pro 6028 · 30 FT Multi-Axle Container',
    driverName: 'Balwant Singh',
    driverPhone: '+91 98112 00412',
    cargoType: 'Commercial Steel Wire Coils & Fastener Hardware',
    weightKg: 22000,
    freightAmount: 26694,
    totalAmount: 31500,
    paymentStatus: 'Paid',
    currentLocation: 'Approaching Asansol Corridor NH-19',
    speed: '52 km/h',
    eta: 'Today, 09:00 PM',
    invoiceNo: 'INV-2026-00119'
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [shipments] = useState<DisplayShipment[]>(SEED_SHIPMENTS);
  const [activeTab, setActiveTab] = useState<'all' | 'in-transit' | 'delivered' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [selectedLr, setSelectedLr] = useState<ConsignmentLRData | null>(null);
  const [selectedPod, setSelectedPod] = useState<PodData | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<GstInvoiceData | null>(null);

  // Shipper Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('ask_shipper_wallet_bal');
    return saved ? parseFloat(saved) : 24500;
  });
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('5000');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if live bookings exist to sync counters
    getClientBookings().catch(() => {});
  }, []);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function handleCopy(text: string) {
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    triggerToast(`✓ Copied ${text} to clipboard!`);
    setTimeout(() => setCopiedId(null), 2500);
  }

  function handleTopUpSubmit(e: React.FormEvent) {
    e.preventDefault();
    const add = parseFloat(topUpAmount) || 0;
    if (add <= 0) return;
    const newBal = walletBalance + add;
    setWalletBalance(newBal);
    localStorage.setItem('ask_shipper_wallet_bal', newBal.toString());
    setShowTopUpModal(false);
    triggerToast(`✓ ₹${add.toLocaleString('en-IN')} added to Shipper Wallet via instant UPI!`);
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  // Filter shipments
  const filteredShipments = shipments.filter(s => {
    const matchesTab =
      activeTab === 'all' ? true :
      activeTab === 'in-transit' ? s.status === 'In Transit' :
      activeTab === 'delivered' ? s.status === 'Delivered' :
      s.status === 'Pending';

    const matchesSearch =
      searchTerm.trim() === '' ||
      s.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cargoType.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Open LR Bilty Modal
  function handleOpenLr(s: DisplayShipment) {
    const lrData: ConsignmentLRData = {
      bookingNumber: s.bookingNumber,
      consignmentNumber: s.lrNumber,
      bookingDate: s.date,
      date: s.date,
      senderName: user?.name || 'Sandeep Verma (Shipper)',
      senderPhone: user?.phone || '+91 98110 22334',
      fromAddress: s.fromAddress || s.from,
      fromCity: s.from.split('(')[0].trim(),
      receiverName: 'Apex Consignee Industrial Hub',
      receiverPhone: '+91 98765 00000',
      toAddress: s.toAddress || s.to,
      toCity: s.to.split('(')[0].trim(),
      goodsType: s.cargoType,
      goodsDescription: `${s.cargoType} · Packed in Wooden Crates`,
      weightKg: s.weightKg,
      weight: s.weightKg,
      vehicleNumber: s.vehiclePlate,
      driverName: s.driverName,
      freightAmount: s.freightAmount,
      totalAmount: s.totalAmount,
      status: s.status,
      paymentStatus: s.paymentStatus
    };
    setSelectedLr(lrData);
  }

  // Open e-POD Modal
  function handleOpenPod(s: DisplayShipment) {
    const podData: PodData = {
      bookingNumber: s.bookingNumber,
      shipmentNumber: `SHP-${s.bookingNumber}`,
      deliveredDate: s.deliveredDate || '18 Sep 2026, 04:30 PM',
      receiverName: 'M. Sundaram (Warehouse Receiving Head)',
      receiverPhone: '+91 98401 22345',
      deliveredLocation: s.toAddress || s.to,
      otpVerified: true,
      notes: 'Received all 24 pallets in sealed, undamaged condition. Weighed & cleared.',
      driverName: s.driverName,
      photoMeta: {
        fileName: `Stamped-POD-${s.bookingNumber}.pdf`,
        fileSize: '1.8 MB',
        uploadedAt: s.deliveredDate || '18 Sep 2026',
        source: 'Mobile Driver App (Geotagged & Timestamped)'
      }
    };
    setSelectedPod(podData);
  }

  // Open GST Invoice Modal
  function handleOpenInvoice(s: DisplayShipment) {
    const invData: GstInvoiceData = {
      invoiceNumber: s.invoiceNo || `INV-2026-${s.bookingNumber}`,
      invoiceDate: s.date,
      bookingNumber: s.bookingNumber,
      lrNumber: s.lrNumber,
      shipperName: user?.name || 'Sandeep Verma (Enterprise Shipper)',
      shipperGstin: '07AAAAA0000A1Z5',
      shipperAddress: s.fromAddress || s.from,
      consigneeName: 'Apex Consignee Logistics Ltd',
      consigneeAddress: s.toAddress || s.to,
      originCity: s.from.split('(')[0].trim(),
      destinationCity: s.to.split('(')[0].trim(),
      weightKg: s.weightKg,
      packagesCount: 24,
      basicFreight: s.freightAmount,
      fuelSurcharge: Math.round(s.freightAmount * 0.10),
      handlingCharge: 500,
      cgstAmount: Math.round(s.freightAmount * 0.09),
      sgstAmount: Math.round(s.freightAmount * 0.09),
      totalInvoiceAmount: s.totalAmount,
      paymentStatus: s.paymentStatus
    };
    setSelectedInvoice(invData);
  }

  const inTransitCount = shipments.filter(s => s.status === 'In Transit').length;
  const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;
  const pendingCount = shipments.filter(s => s.status === 'Pending').length;

  return (
    <CustomerLayout>
      <div className="db-home-screen">

        {/* 1. EXECUTIVE HERO COMMAND BANNER */}
        <section className="db-executive-hero">
          <div className="db-hero-main">
            <div className="db-hero-badge-row">
              <span className="db-hero-pill-corp">
                🏢 ASK ENTERPRISE SHIPPER
              </span>
              <span className="db-hero-pill-id">
                ID: ASK-CUST-40004
              </span>
              <span className="db-hero-pill-status">
                <span className="status-live-dot" />
                Verified B2B Account
              </span>
            </div>

            <h1 className="db-hero-title">
              {getGreeting()}, {user?.name || 'Sandeep Verma'}! 🚛
            </h1>
            <p className="db-hero-subtitle">
              Pan-India Commercial Freight Command · Active Highway Corridors · Instant Bilty &amp; e-POD Vault
            </p>

            <div className="db-hero-quick-stats">
              <div className="db-quick-stat-item">
                <span className="qs-label">Shipper Wallet:</span>
                <strong className="qs-value">₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="db-quick-stat-divider" />
              <div className="db-quick-stat-item">
                <span className="qs-label">In-Transit Freight:</span>
                <strong className="qs-value">{inTransitCount} Active Trucks</strong>
              </div>
              <div className="db-quick-stat-divider" />
              <div className="db-quick-stat-item">
                <span className="qs-label">Delivery SLA:</span>
                <strong className="qs-value" style={{ color: '#10b981' }}>99.4% On-Time</strong>
              </div>
            </div>
          </div>

          <div className="db-hero-actions">
            <Link to="/book" className="db-hero-btn primary">
              <span className="btn-icon">📦</span>
              <span>+ Book New Freight</span>
            </Link>

            <button
              type="button"
              className="db-hero-btn secondary"
              onClick={() => setShowTopUpModal(true)}
            >
              <span className="btn-icon">⚡</span>
              <span>Top-Up Wallet</span>
            </button>

            <Link to="/tracking" className="db-hero-btn tertiary">
              <span className="btn-icon">🎯</span>
              <span>Live Radar Map</span>
            </Link>
          </div>
        </section>

        {/* 2. TOP METRIC STATS (4 HIGH-GLOSS CARDS) */}
        <section className="db-stats-grid">
          {/* TOTAL BOOKINGS */}
          <div className="db-stat-box" style={{ borderLeft: '4px solid #0284c7' }}>
            <div className="db-stat-header">
              <div className="db-stat-avatar bookings">
                <span>📦</span>
              </div>
              <div className="db-stat-numbers">
                <strong>12</strong>
                <span>Total Consignments</span>
              </div>
            </div>
            <div className="db-stat-footer">
              <span className="db-delta-tag green">+20% MoM Growth</span>
              <Link to="/bookings" className="db-stat-link">View All →</Link>
            </div>
          </div>

          {/* IN TRANSIT */}
          <div className="db-stat-box" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div className="db-stat-header">
              <div className="db-stat-avatar in-transit">
                <span>🚚</span>
              </div>
              <div className="db-stat-numbers">
                <strong>{inTransitCount} Units</strong>
                <span>Highway In-Transit</span>
              </div>
            </div>
            <div className="db-stat-footer">
              <span className="db-delta-tag purple">● 58 km/h Avg Speed</span>
              <Link to="/tracking" className="db-stat-link">Track GPS →</Link>
            </div>
          </div>

          {/* DELIVERED */}
          <div className="db-stat-box" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="db-stat-header">
              <div className="db-stat-avatar delivered">
                <span>✅</span>
              </div>
              <div className="db-stat-numbers">
                <strong>{deliveredCount} Delivered</strong>
                <span>Completed Shipments</span>
              </div>
            </div>
            <div className="db-stat-footer">
              <span className="db-delta-tag green">100% Stamped PODs</span>
              <Link to="/documents" className="db-stat-link">View Proofs →</Link>
            </div>
          </div>

          {/* PENDING ACTIONS */}
          <div className="db-stat-box" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div className="db-stat-header">
              <div className="db-stat-avatar pending">
                <span>⏳</span>
              </div>
              <div className="db-stat-numbers">
                <strong>{pendingCount} Pending</strong>
                <span>Action / Pay Required</span>
              </div>
            </div>
            <div className="db-stat-footer">
              <span className="db-delta-tag amber">₹18,200 Payment Due</span>
              <Link to="/payments" className="db-stat-link">Settle Now →</Link>
            </div>
          </div>
        </section>

        {/* 3. MAIN DASHBOARD CONTENT (SPLIT LAYOUT) */}
        <div className="db-main-split">

          {/* LEFT COLUMN: ACTIVE CONSIGNMENTS DECK + LIVE RADAR */}
          <div className="db-left-section">

            {/* A. CONSIGNMENT OPERATIONS DECK */}
            <div className="db-section-card">
              <div className="db-card-head">
                <div>
                  <h2 className="db-section-heading">Active Freight &amp; Consignment Deck</h2>
                  <p className="db-section-sub">Monitor live commercial shipments, dispatch Bilty notes &amp; certified e-POD receipts</p>
                </div>

                <div className="db-toolbar-actions">
                  <div className="db-search-input-wrap">
                    <span>🔍</span>
                    <input
                      type="text"
                      placeholder="Filter by Bilty ASKB..., city, cargo or vehicle..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button type="button" className="clear-search-btn" onClick={() => setSearchTerm('')}>×</button>
                    )}
                  </div>
                </div>
              </div>

              {/* FILTER TABS */}
              <div className="db-filter-tabs">
                <button
                  type="button"
                  className={`db-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All Shipments ({shipments.length})
                </button>
                <button
                  type="button"
                  className={`db-tab-btn ${activeTab === 'in-transit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('in-transit')}
                >
                  🚚 Highway In-Transit ({inTransitCount})
                </button>
                <button
                  type="button"
                  className={`db-tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
                  onClick={() => setActiveTab('delivered')}
                >
                  ✅ Delivered ({deliveredCount})
                </button>
                <button
                  type="button"
                  className={`db-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pending')}
                >
                  ⏳ Pending Settlement ({pendingCount})
                </button>
              </div>

              {/* SHIPMENT CARDS GRID */}
              <div className="db-shipments-deck-grid">
                {filteredShipments.map(s => {
                  const statusClass = s.status.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <div key={s.id} className="db-shipment-card-unit">
                      {/* CARD HEAD */}
                      <div className="db-sc-head">
                        <div className="db-sc-ids">
                          <button
                            type="button"
                            className="db-bilty-badge"
                            onClick={() => handleCopy(s.bookingNumber)}
                            title="Click to copy Bilty Number"
                          >
                            <span>📋 {s.bookingNumber}</span>
                            <span className="copy-hint">{copiedId === s.bookingNumber ? '✓ Copied' : 'Copy'}</span>
                          </button>

                          <span className="db-lr-pill">{s.lrNumber}</span>
                        </div>

                        <div className="db-sc-status-wrap">
                          <span className={`db-status-pill ${statusClass}`}>
                            {s.status === 'In Transit' && <span className="pulse-dot" />}
                            {s.status}
                          </span>
                        </div>
                      </div>

                      {/* ROUTE CORRIDOR */}
                      <div className="db-sc-route-box">
                        <div className="route-terminal">
                          <span className="terminal-dot origin" />
                          <div className="terminal-info">
                            <strong>{s.from}</strong>
                            <small>Dispatch Point</small>
                          </div>
                        </div>

                        <div className="route-transit-line">
                          <span className="transit-distance">{s.distanceKm} KM</span>
                          <div className="line-bar" />
                          <span className="transit-arrow">➔</span>
                        </div>

                        <div className="route-terminal">
                          <span className="terminal-dot dest" />
                          <div className="terminal-info">
                            <strong>{s.to}</strong>
                            <small>Destination Hub</small>
                          </div>
                        </div>
                      </div>

                      {/* VEHICLE & TELEMATICS META */}
                      <div className="db-sc-meta-row">
                        <div className="meta-chip vehicle">
                          <span>🚛</span>
                          <strong>{s.vehiclePlate}</strong>
                          <small>({s.truckModel?.split('·')[0].trim() || 'Heavy Multi-Axle'})</small>
                        </div>

                        <div className="meta-chip driver">
                          <span>👤</span>
                          <span>{s.driverName}</span>
                          <a href={`tel:${s.driverPhone}`} className="driver-call" title="Call Driver">📞</a>
                        </div>

                        <div className="meta-chip cargo">
                          <span>⚖️</span>
                          <strong>{(s.weightKg / 1000).toFixed(1)} MT</strong>
                          <span className="cargo-text" title={s.cargoType}>· {s.cargoType}</span>
                        </div>
                      </div>

                      {/* LIVE TELEMETRY STATUS BAR */}
                      {s.currentLocation && (
                        <div className="db-sc-telemetry-bar">
                          <div className="telemetry-pin">
                            <span className="gps-live-dot" />
                            <strong>Current Transit Point:</strong>
                            <span>{s.currentLocation}</span>
                          </div>
                          {s.speed && <span className="speed-badge">⚡ {s.speed}</span>}
                          {s.eta && <span className="eta-badge">⏱️ ETA: {s.eta}</span>}
                        </div>
                      )}

                      {/* CARD FOOTER ACTIONS */}
                      <div className="db-sc-footer">
                        <div className="db-sc-pricing">
                          <span className="pricing-label">Freight Bilty Total:</span>
                          <strong className="pricing-amount">₹{s.totalAmount.toLocaleString('en-IN')}</strong>
                          <span className={`payment-pill ${s.paymentStatus.toLowerCase()}`}>{s.paymentStatus}</span>
                        </div>

                        <div className="db-sc-actions">
                          {s.status === 'In Transit' && (
                            <Link to={`/tracking?bilty=${s.bookingNumber}`} className="db-btn-quick live">
                              <span>🎯 Live Radar</span>
                            </Link>
                          )}

                          <button
                            type="button"
                            className="db-btn-quick bilty"
                            onClick={() => handleOpenLr(s)}
                            title="View Official Consignment Note (Motor Tariff 57)"
                          >
                            <span>📄 Bilty (LR)</span>
                          </button>

                          {s.status === 'Delivered' && (
                            <button
                              type="button"
                              className="db-btn-quick pod"
                              onClick={() => handleOpenPod(s)}
                              title="View Verified Stamped Electronic POD"
                            >
                              <span>📑 Stamped POD</span>
                            </button>
                          )}

                          {s.invoiceNo && (
                            <button
                              type="button"
                              className="db-btn-quick invoice"
                              onClick={() => handleOpenInvoice(s)}
                              title="View GST Tax Invoice"
                            >
                              <span>🧾 Tax Invoice</span>
                            </button>
                          )}

                          {s.paymentStatus === 'Pending' && (
                            <Link to="/payments" className="db-btn-quick pay">
                              <span>💳 Pay ₹{s.totalAmount.toLocaleString('en-IN')}</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* B. NATIONAL FREIGHT CORRIDOR RADAR WIDGET */}
            <div className="db-section-card">
              <div className="db-card-head">
                <div>
                  <h2 className="db-section-heading">National Freightway Telemetry · NH-48 Express Corridor</h2>
                  <p className="db-section-sub">Consignment #ASKB00123 active transit radar from Delhi NCR to Mumbai Hub</p>
                </div>
                <Link to="/tracking" className="db-link-btn">Full Live Map ↗</Link>
              </div>

              <div className="db-corridor-pipeline">
                <div className="corridor-milestone completed">
                  <div className="ms-marker">✓</div>
                  <div className="ms-info">
                    <strong>Delhi Central Godown</strong>
                    <small>Dispatched &amp; Weighed (21 Sep, 10:00 AM)</small>
                  </div>
                </div>

                <div className="corridor-connector active" />

                <div className="corridor-milestone completed">
                  <div className="ms-marker">✓</div>
                  <div className="ms-info">
                    <strong>Jaipur Bypass NH-48 Toll</strong>
                    <small>Fastag Cleared (21 Sep, 03:40 PM)</small>
                  </div>
                </div>

                <div className="corridor-connector active" />

                <div className="corridor-milestone in-progress">
                  <div className="ms-marker live">🚛</div>
                  <div className="ms-info">
                    <strong>Surat Bypass Corridor</strong>
                    <small className="live-speed">Cruising at 58 km/h · Safe Convoy</small>
                  </div>
                </div>

                <div className="corridor-connector" />

                <div className="corridor-milestone pending">
                  <div className="ms-marker">⏳</div>
                  <div className="ms-info">
                    <strong>Mumbai Bhiwandi SuperHub</strong>
                    <small>Expected Tomorrow, 10:30 AM</small>
                  </div>
                </div>
              </div>

              <div className="db-corridor-footer">
                <div className="corridor-meta-item">
                  <span>📍 AIS-140 GPS Lock:</span>
                  <strong>Lat 21.1702° N, Long 72.8311° E</strong>
                </div>
                <div className="corridor-meta-item">
                  <span>⛽ Diesel Reserve:</span>
                  <strong style={{ color: '#10b981' }}>78% Full Tank</strong>
                </div>
                <div className="corridor-meta-item">
                  <span>🌡️ Ambient Reefer Temp:</span>
                  <strong>+4.2° C (Optimal)</strong>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PREPAID WALLET & QUICK ACTIONS HUB */}
          <div className="db-right-section">

            {/* 1. SHIPPER PREPAID WALLET & B2B CREDIT LEDGER */}
            <div className="db-wallet-card-luxury">
              <div className="wallet-card-top">
                <div className="wallet-brand">
                  <div className="chip-graphic" />
                  <span>ASK LOGISTICS CORPORATE PASS</span>
                </div>
                <span className="wallet-network-logo">VISA / RUPAY B2B</span>
              </div>

              <div className="wallet-balance-box">
                <span className="wallet-label">Prepaid Shipper Wallet</span>
                <h3 className="wallet-amount">
                  ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <small className="wallet-subtext">Instant 1-Click Freight Checkout · Zero Processing Fees</small>
              </div>

              <div className="wallet-credit-meter">
                <div className="credit-meter-header">
                  <span>B2B Credit Line: ₹1,50,000</span>
                  <strong style={{ color: '#38bdf8' }}>69.8% Available</strong>
                </div>
                <div className="credit-progress-bar">
                  <div className="progress-fill" style={{ width: '69.8%' }} />
                </div>
                <small className="credit-terms">Net 30-Day Billing Cycle · Next Statement on 1st Oct</small>
              </div>

              <div className="wallet-card-buttons">
                <button
                  type="button"
                  className="wallet-btn topup"
                  onClick={() => setShowTopUpModal(true)}
                >
                  ⚡ Instant UPI Top-up
                </button>
                <Link to="/payments" className="wallet-btn ledger">
                  View Ledger ↗
                </Link>
              </div>
            </div>

            {/* 2. RAPID SHIPPER OPERATIONS HUB */}
            <div className="db-quick-actions-card">
              <div className="qa-header">
                <h3>Shipper Operations Hub</h3>
                <span className="qa-badge">6 Tools</span>
              </div>

              <div className="db-qa-grid">
                <Link to="/book" className="db-qa-tile">
                  <div className="qa-tile-icon book">📦</div>
                  <div className="qa-tile-text">
                    <strong>Book Shipment</strong>
                    <span>FTL &amp; PTL freight pickup</span>
                  </div>
                </Link>

                <Link to="/tracking" className="db-qa-tile">
                  <div className="qa-tile-icon track">🎯</div>
                  <div className="qa-tile-text">
                    <strong>Track Cargo</strong>
                    <span>Live satellite telematics</span>
                  </div>
                </Link>

                <Link to="/payments" className="db-qa-tile">
                  <div className="qa-tile-icon pay">💳</div>
                  <div className="qa-tile-text">
                    <strong>Make Payment</strong>
                    <span>Razorpay &amp; instant UPI</span>
                  </div>
                </Link>

                <Link to="/invoices" className="db-qa-tile">
                  <div className="qa-tile-icon invoice">📄</div>
                  <div className="qa-tile-text">
                    <strong>GST Invoices</strong>
                    <span>Download tax bilty bills</span>
                  </div>
                </Link>

                <Link to="/documents" className="db-qa-tile">
                  <div className="qa-tile-icon doc">📁</div>
                  <div className="qa-tile-text">
                    <strong>POD Documents</strong>
                    <span>Stamped delivery proof</span>
                  </div>
                </Link>

                <Link to="/support" className="db-qa-tile">
                  <div className="qa-tile-icon support">🎧</div>
                  <div className="qa-tile-text">
                    <strong>Escalations Desk</strong>
                    <span>24/7 dedicated helpline</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* 3. VERIFIED SHIPPER COMPLIANCE SUMMARY */}
            <div className="db-compliance-card">
              <h4>🛡️ Regulatory Compliance &amp; Vault</h4>
              <ul className="compliance-list">
                <li>
                  <span className="comp-check">✓</span>
                  <span><strong>GSTIN Verified:</strong> 07AAAAA0000A1Z5</span>
                </li>
                <li>
                  <span className="comp-check">✓</span>
                  <span><strong>NIC E-Way Bill:</strong> Part-A &amp; Part-B Active</span>
                </li>
                <li>
                  <span className="comp-check">✓</span>
                  <span><strong>Goods in Transit Insurance:</strong> Up to ₹50 Lakhs</span>
                </li>
                <li>
                  <span className="comp-check">✓</span>
                  <span><strong>Motor Tariff 57:</strong> Official LR Bilty Compliant</span>
                </li>
              </ul>
            </div>

            {/* 4. 24/7 HELPLINE DIRECTORY */}
            <div className="db-helpline-card">
              <div className="helpline-header">
                <span className="pulse-beacon-dot" />
                <strong>24/7 Logistics Command Centre</strong>
              </div>
              <p>Direct priority line for shipment rerouting, driver coordination &amp; gate queries:</p>
              <div className="helpline-buttons">
                <a href="tel:+919876543210" className="hp-call-btn">
                  📞 +91 98765 43210
                </a>
                <Link to="/support" className="hp-chat-btn">
                  💬 Support Desk
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            MODALS: CONSIGNMENT LR, e-POD, GST INVOICE & WALLET TOP-UP
            ======================================================== */}

        {/* 1. LR CONSIGNMENT BILTY MODAL */}
        {selectedLr && (
          <ConsignmentLRModal
            data={selectedLr}
            onClose={() => setSelectedLr(null)}
          />
        )}

        {/* 2. ELECTRONIC PROOF OF DELIVERY (e-POD) MODAL */}
        {selectedPod && (
          <ElectronicPodModal
            data={selectedPod}
            onClose={() => setSelectedPod(null)}
          />
        )}

        {/* 3. GST TAX INVOICE MODAL */}
        {selectedInvoice && (
          <GstTaxInvoiceModal
            data={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
          />
        )}

        {/* 4. INSTANT SHIPPER WALLET TOP-UP MODAL */}
        {showTopUpModal && (
          <div className="lr-modal-overlay" onClick={() => setShowTopUpModal(false)}>
            <div className="wallet-modal-box" onClick={e => e.stopPropagation()}>
              <div className="wallet-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>⚡</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#ffffff' }}>Instant Shipper Wallet Top-up</h3>
                    <small style={{ color: '#94a3b8' }}>Zero-Fee Instant Credit via UPI / QR / NetBanking</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setShowTopUpModal(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleTopUpSubmit} className="wallet-modal-body">
                <div className="wallet-modal-balance-row">
                  <span>Current Available Balance:</span>
                  <strong>₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>

                <div className="wallet-input-group">
                  <label htmlFor="topup-amount-input">Select or Enter Top-up Amount (INR ₹):</label>
                  <div className="amount-input-wrap">
                    <span className="currency-symbol">₹</span>
                    <input
                      id="topup-amount-input"
                      type="number"
                      min="500"
                      step="500"
                      value={topUpAmount}
                      onChange={e => setTopUpAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="quick-amount-pills">
                  {['2000', '5000', '10000', '25000', '50000'].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      className={`pill-btn ${topUpAmount === amt ? 'active' : ''}`}
                      onClick={() => setTopUpAmount(amt)}
                    >
                      +₹{Number(amt).toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                <div className="payment-options-row">
                  <span className="pay-tag active">⚡ Google Pay / PhonePe UPI</span>
                  <span className="pay-tag">🏦 Corporate Net Banking</span>
                  <span className="pay-tag">💳 Commercial Credit Card</span>
                </div>

                <div className="wallet-modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setShowTopUpModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-confirm-topup">
                    Proceed to Pay ₹{Number(topUpAmount || 0).toLocaleString('en-IN')} →
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 5. FLOATING CONFIRMATION TOAST */}
        {toastMessage && (
          <div className="db-floating-toast">
            <span>{toastMessage}</span>
          </div>
        )}

      </div>
    </CustomerLayout>
  );
}
