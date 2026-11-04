import React, { useEffect, useState } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  X,
  PlusCircle,
  Gavel,
  Truck,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  TrendingDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  getMarketplaceLoads,
  createMarketplaceLoad,
  placeMarketplaceBid,
  acceptWinningBid,
  type MarketplaceLoad,
  type MarketplaceBid
} from '../api/enterpriseApi';
import './FreightBiddingMarketplace.css';

export default function FreightBiddingMarketplace() {
  const { t } = useLanguage();
  const [loads, setLoads] = useState<MarketplaceLoad[]>([]);
  const [loading, setLoading] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);
  const [filterType, setFilterType] = useState('All');

  // New Load Modal
  const [showNewLoadModal, setShowNewLoadModal] = useState(false);
  const [newOrigin, setNewOrigin] = useState('Pune Chakan Hub, Maharashtra');
  const [newDestination, setNewDestination] = useState('Gurugram IMT Manesar Hub, Haryana');
  const [newDistance, setNewDistance] = useState('1450');
  const [newCargo, setNewCargo] = useState('Heavy Auto Transmission Gearboxes');
  const [newWeight, setNewWeight] = useState('16.5');
  const [newTruckType, setNewTruckType] = useState('32 Ft MXL Container (Multi-Axle)');
  const [newBudget, setNewBudget] = useState('85000');

  // Submit Bid Modal
  const [bidLoadId, setBidLoadId] = useState<number | null>(null);
  const [transporterName, setTransporterName] = useState('Jai Hind Express Logistics');
  const [transporterPhone, setTransporterPhone] = useState('+91 98210 44102');
  const [truckNumber, setTruckNumber] = useState('MH-04-AB-9921');
  const [offeredRate, setOfferedRate] = useState('');
  const [etaHours, setEtaHours] = useState('2');

  // Toast / Status Alerts
  const [lockAlert, setLockAlert] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 7000);
  };

  async function loadData(isManual: boolean = false) {
    try {
      setLoading(true);
      const data = await getMarketplaceLoads();
      setLoads(Array.isArray(data) ? data : []);
      if (isManual) {
        setJustRefreshed(true);
        setTimeout(() => setJustRefreshed(false), 2500);
      }
    } catch (err) {
      console.error('Failed to load marketplace loads:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(false);
    // 1-second interval to tick down countdown timers
    const timer = setInterval(() => {
      setLoads(prev =>
        (Array.isArray(prev) ? prev : []).map(l => {
          if (l.status === 'ActiveAuction' && l.secondsRemaining > 0) {
            return { ...l, secondsRemaining: l.secondsRemaining - 1 };
          }
          return l;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 1-Click Fast Fill Preset Templates
  const applyPreset = (preset: 'auto' | 'fmcg' | 'steel' | 'pharma') => {
    if (preset === 'auto') {
      setNewOrigin('Pune Chakan Hub, Maharashtra');
      setNewDestination('Gurugram IMT Manesar Hub, Haryana');
      setNewDistance('1450');
      setNewCargo('Heavy Auto Transmission Gearboxes & Sub-Assemblies');
      setNewWeight('16.5');
      setNewTruckType('32 Ft MXL Container (Multi-Axle)');
      setNewBudget('85000');
    } else if (preset === 'fmcg') {
      setNewOrigin('Bengaluru Hoskote CDC, Karnataka');
      setNewDestination('Chennai Sriperumbudur Hub, Tamil Nadu');
      setNewDistance('340');
      setNewCargo('Packaged Foods & Beverages (Palletized FMCG)');
      setNewWeight('10.0');
      setNewTruckType('24 Ft Multi-Axle Container');
      setNewBudget('32000');
    } else if (preset === 'steel') {
      setNewOrigin('Raigarh Heavy Steel Works, Chhattisgarh');
      setNewDestination('Faridabad Industrial Area, Haryana');
      setNewDistance('1220');
      setNewCargo('Cold Rolled Steel Coils (ODC Industrial Freight)');
      setNewWeight('28.0');
      setNewTruckType('40 Ft High-Bed Trailer (Triple-Axle)');
      setNewBudget('145000');
    } else {
      setNewOrigin('Hyderabad Genome Valley, Telangana');
      setNewDestination('Baddi Industrial Area, Himachal Pradesh');
      setNewDistance('1850');
      setNewCargo('Life-Saving Vaccines & Controlled Temperature Pharma');
      setNewWeight('8.5');
      setNewTruckType('32 Ft MXL Container (Multi-Axle)');
      setNewBudget('112000');
    }
  };

  async function handleCreateLoad(e: React.FormEvent) {
    e.preventDefault();
    if (!newBudget || Number(newBudget) <= 0) return;
    try {
      setLoading(true);
      const res = await createMarketplaceLoad({
        originHub: newOrigin,
        destinationHub: newDestination,
        distanceKm: Number(newDistance),
        cargoDescription: newCargo,
        weightTons: Number(newWeight),
        requiredTruckType: newTruckType,
        targetBudget: Number(newBudget)
      });
      setShowNewLoadModal(false);
      showNotification(`Load ${res.load.loadNumber} posted to Spot Reverse Auction successfully!`, 'success');
      loadData(false);
    } catch (err: any) {
      showNotification(err?.message || 'Failed to post load to marketplace', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handlePlaceBid(e: React.FormEvent) {
    e.preventDefault();
    if (!bidLoadId || !offeredRate || Number(offeredRate) <= 0) return;
    try {
      setLoading(true);
      const res = await placeMarketplaceBid(bidLoadId, {
        transporterName,
        transporterPhone,
        truckNumber,
        offeredRate: Number(offeredRate),
        etaPickupHours: Number(etaHours)
      });
      setBidLoadId(null);
      setOfferedRate('');
      showNotification(res.message, 'success');
      loadData(false);
    } catch (err: any) {
      showNotification(err?.response?.data?.message || err?.message || 'Failed to submit bid', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptBid(loadId: number, bidId: number) {
    try {
      setLoading(true);
      const res = await acceptWinningBid(loadId, { bidId });
      setLockAlert(res.message);
      setTimeout(() => setLockAlert(null), 9000);
      loadData(false);
    } catch (err: any) {
      showNotification(err?.message || 'Failed to accept bid', 'error');
    } finally {
      setLoading(false);
    }
  }

  function formatTime(seconds: number) {
    if (seconds <= 0) return t('Auction Closed', 'नीलामी समाप्त');
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }

  const safeLoads = Array.isArray(loads) ? loads : [];
  const filteredLoads = safeLoads.filter(l => {
    if (filterType === 'All') return true;
    return (l.requiredTruckType || '').toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <div className="fbm-container">
      {/* HEADER & CONTROLS */}
      <div className="fbm-header-card">
        <div>
          <h2 className="fbm-header-title">
            <Gavel size={22} style={{ color: '#2563eb' }} />
            <span>{t('Freight Bidding & Spot Reverse Auction Marketplace', 'फ्रेट बिडिंग व स्पॉट रिवर्स ऑक्शन मार्केटप्लेस')}</span>
          </h2>
          <p className="fbm-header-desc">
            {t(
              'When own fleet is unavailable, push loads to spot marketplace. Verified market truck operators place lowest competing bids; ASK Transport secures brokerage margin.',
              'जब अपनी गाड़ियां उपलब्ध न हों, लोड को स्पॉट मार्केट में नीलामी के लिए डालें। प्रमाणित ट्रांसपोर्टर्स न्यूनतम बोली लगाते हैं और ASK ट्रांसपोर्ट ब्रोकरेज मार्जिन कमाता है।'
            )}
          </p>
        </div>

        <div className="fbm-header-actions">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={loading}
            className="fbm-btn-refresh"
            style={
              justRefreshed
                ? {
                    background: '#059669',
                    borderColor: '#10b981',
                    color: '#ffffff',
                    boxShadow: '0 0 12px rgba(16, 185, 129, 0.45)'
                  }
                : undefined
            }
          >
            {justRefreshed ? (
              <>
                <CheckCircle2 size={15} />
                <span>{t('Rates Refreshed! ✓', 'दरें अपडेट हो गईं! ✓')}</span>
              </>
            ) : loading ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>{t('Syncing Rates...', 'दरें सिंक हो रही हैं...')}</span>
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                <span>{t('Refresh Rates', 'दरें रिफ्रेश करें')}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowNewLoadModal(true)}
            className="fbm-btn-post"
          >
            <PlusCircle size={16} />
            <span>{t('Post Open Freight Load', 'नया फ्रेट लोड पोस्ट करें')}</span>
          </button>
        </div>
      </div>

      {/* TOAST / NOTICE BANNER */}
      {notice && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background:
              notice.type === 'error'
                ? '#fef2f2'
                : notice.type === 'info'
                ? '#eff6ff'
                : '#ecfdf5',
            color:
              notice.type === 'error'
                ? '#991b1b'
                : notice.type === 'info'
                ? '#1e40af'
                : '#065f46',
            border:
              notice.type === 'error'
                ? '1px solid #fecaca'
                : notice.type === 'info'
                ? '1px solid #bfdbfe'
                : '1px solid #a7f3d0'
          }}
        >
          {notice.type === 'error' ? <X size={16} /> : <CheckCircle2 size={16} />}
          <span>{notice.message}</span>
        </div>
      )}

      {/* CONTRACT LOCKED ALERT */}
      {lockAlert && (
        <div
          style={{
            padding: '14px 20px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: '12px',
            color: '#10b981',
            fontSize: '13.5px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <ShieldCheck size={20} />
          <span>{lockAlert}</span>
        </div>
      )}

      {/* KPI METRICS */}
      <div className="fbm-kpi-grid">
        <div className="fbm-kpi-card amber">
          <span className="fbm-kpi-label">{t('ACTIVE SPOT AUCTIONS', 'सक्रिय स्पॉट नीलामी')}</span>
          <strong className="fbm-kpi-value amber">
            {safeLoads.filter(l => l.status === 'ActiveAuction').length} {t('Open Loads', 'खुले लोड')}
          </strong>
          <span className="fbm-kpi-sub">{t('Real-time reverse bidding live', 'लाइव रिवर्स बिडिंग जारी')}</span>
        </div>

        <div className="fbm-kpi-card emerald">
          <span className="fbm-kpi-label">{t('TOTAL COMPETING BIDS', 'कुल ट्रांसपोर्टर बोलियां')}</span>
          <strong className="fbm-kpi-value emerald">
            {safeLoads.reduce((acc, l) => acc + (l.bids || []).length, 0)} {t('Verified Quotes', 'प्रमाणित कोट्स')}
          </strong>
          <span className="fbm-kpi-sub">{t('From certified highway transporters', 'सत्यापित हाईवे ट्रांसपोर्टर्स से')}</span>
        </div>

        <div className="fbm-kpi-card blue">
          <span className="fbm-kpi-label">{t('AVG SHIPPER SAVINGS', 'औसत ग्राहक बचत')}</span>
          <strong className="fbm-kpi-value blue">
            ₹9,200 / Trip
          </strong>
          <span className="fbm-kpi-sub">{t('Below client target budget', 'ग्राहक के तय बजट से कम')}</span>
        </div>

        <div className="fbm-kpi-card purple">
          <span className="fbm-kpi-label">{t('PROJECTED BROKERAGE', 'अनुमानित ब्रोकरेज मार्जिन')}</span>
          <strong className="fbm-kpi-value purple">
            ₹{safeLoads.reduce((acc, l) => acc + (l.brokerageFeeEarned || (l.targetBudget - l.currentLowestBid)), 0).toLocaleString('en-IN')}
          </strong>
          <span className="fbm-kpi-sub">{t('ASK Transport gross commission', 'ASK ट्रांसपोर्ट का शुद्ध कमीशन')}</span>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="fbm-filter-row">
        <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', marginRight: '6px' }}>
          {t('TRUCK CATEGORY:', 'ट्रक का प्रकार:')}
        </span>
        {['All', '32 Ft', '40 Ft', '24 Ft'].map(tType => (
          <button
            key={tType}
            type="button"
            onClick={() => setFilterType(tType)}
            className={`fbm-filter-chip ${filterType === tType ? 'active' : ''}`}
          >
            {tType === 'All' ? t('All Fleets', 'सभी फ्लीट') : tType}
          </button>
        ))}
      </div>

      {/* AUCTION LOADS LIST */}
      <div className="fbm-loads-list">
        {filteredLoads.map((load: MarketplaceLoad) => {
          const savings = load.targetBudget - load.currentLowestBid;
          const isLocked = load.status === 'ContractLocked';

          return (
            <div
              key={load.id}
              className="fbm-load-card"
              style={isLocked ? { borderColor: '#10b981', borderLeftWidth: '5px' } : undefined}
            >
              {/* LOAD HEADER ROW */}
              <div className="fbm-load-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(37, 99, 235, 0.12)',
                      color: '#3b82f6',
                      fontSize: '12px',
                      fontWeight: 800
                    }}
                  >
                    {load.loadNumber}
                  </span>
                  <strong className="fbm-load-num">{load.cargoDescription}</strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>({load.weightTons} {t('Tons', 'टन')})</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isLocked ? (
                    <span
                      style={{
                        padding: '6px 14px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle2 size={14} />
                      <span>{t('Contract Locked with', 'अनुबंध तय:')} {load.winningTransporter}</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        padding: '6px 14px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Clock size={14} />
                      <span>{formatTime(load.secondsRemaining)}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* ROUTE & TRUCK DETAILS */}
              <div className="fbm-route-grid">
                <div>
                  <span className="fbm-form-label">{t('ORIGIN TO DESTINATION:', 'शुरुआत से गंतव्य:')}</span>
                  <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{load.originHub}</span>
                    <ArrowRight size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
                    <span>{load.destinationHub}</span>
                  </div>
                  <small style={{ color: '#3b82f6', fontSize: '11px', display: 'block', marginTop: '3px' }}>
                    {t('Highway Distance:', 'दूरी:')} {load.distanceKm} KM
                  </small>
                </div>

                <div>
                  <span className="fbm-form-label">{t('REQUIRED TRUCK TYPE:', 'आवश्यक ट्रक श्रेणी:')}</span>
                  <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={15} style={{ color: '#64748b' }} />
                    <span>{load.requiredTruckType}</span>
                  </div>
                  <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '3px' }}>
                    {t('Shipper:', 'शिपर:')} {load.shipperName}
                  </small>
                </div>

                <div>
                  <span className="fbm-form-label">{t('SHIPPER TARGET BUDGET:', 'ग्राहक का बजट:')}</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#64748b', marginTop: '2px' }}>
                    ₹{load.targetBudget.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <span className="fbm-form-label" style={{ color: '#10b981' }}>{t('CURRENT LOWEST BID:', 'न्यूनतम बोली:')}</span>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>
                    ₹{load.currentLowestBid.toLocaleString('en-IN')}
                  </div>
                  <small style={{ color: '#10b981', fontWeight: 700, fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <TrendingDown size={13} />
                    {savings > 0
                      ? `${t('Savings:', 'बचत:')} ₹${savings.toLocaleString('en-IN')}`
                      : t('At Target Budget', 'बजट के समान')}
                  </small>
                </div>
              </div>

              {/* COMPETING BIDS LIST */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b' }}>
                    {t('MARKET TRANSPORTER BIDS', 'ट्रांसपोर्टर्स की बोलियां')} ({(load.bids || []).length} {t('Offers', 'प्रस्ताव')})
                  </span>

                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => {
                        setBidLoadId(load.id);
                        setOfferedRate(String(Math.max(1000, load.currentLowestBid - 1500)));
                      }}
                      className="fbm-preset-chip"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <PlusCircle size={13} />
                      <span>{t('Place Competing Bid', 'बोली लगाएं')}</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(load.bids || []).map((bid: MarketplaceBid, index: number) => {
                    const isLowest = index === 0;

                    return (
                      <div
                        key={bid.id}
                        className={`fbm-bid-card ${bid.isSelected ? 'selected' : ''} ${isLowest ? 'lowest' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: isLowest ? '#10b981' : '#64748b',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 900
                            }}
                          >
                            {index + 1}
                          </span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '13.5px' }}>{bid.transporterName}</strong>
                              <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 800 }}>★ {bid.rating}</span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>
                                ({bid.totalTripsCompleted} {t('trips', 'ट्रिप्स')})
                              </span>
                            </div>
                            <span style={{ fontSize: '11.5px', color: '#3b82f6' }}>
                              {t('Truck:', 'ट्रक:')} <strong>{bid.truckNumber}</strong> • {t('ETA to Pickup:', 'पिकअप समय:')} {bid.etaPickupHours} hrs
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <strong style={{ fontSize: '16px', color: isLowest ? '#10b981' : undefined }}>
                              ₹{bid.offeredRate.toLocaleString('en-IN')}
                            </strong>
                            {isLowest && (
                              <span style={{ fontSize: '10.5px', color: '#10b981', display: 'block', fontWeight: 800 }}>
                                {t('Lowest Live Quote', 'सबसे कम बोली')}
                              </span>
                            )}
                          </div>

                          {!isLocked && (
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleAcceptBid(load.id, bid.id)}
                              style={{
                                padding: '7px 14px',
                                background: isLowest ? 'linear-gradient(135deg, #059669, #047857)' : '#334155',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '7px',
                                fontSize: '12px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <CheckCircle2 size={13} />
                              <span>{t('Accept & Lock', 'स्वीकार व लॉक करें')}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* POST NEW SPOT LOAD MODAL */}
      {showNewLoadModal && (
        <div className="fbm-modal-overlay">
          <div className="fbm-modal-card" style={{ background: 'var(--bg-surface, #0f172a)' }}>
            <div className="fbm-modal-header">
              <h3 className="fbm-modal-title">
                <Gavel size={20} style={{ color: '#2563eb' }} />
                <span>{t('Post Freight Load to Spot Reverse Auction', 'स्पॉट रिवर्स नीलामी में लोड पोस्ट करें')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewLoadModal(false)}
                className="fbm-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            {/* FAST FILL 1-CLICK PRESETS */}
            <div>
              <span className="fbm-form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} style={{ color: '#3b82f6' }} />
                <span>{t('1-CLICK FAST FILL PRESETS:', '1-क्लिक फास्ट-फिल टेम्पलेट:')}</span>
              </span>
              <div className="fbm-presets-bar">
                <button
                  type="button"
                  onClick={() => applyPreset('auto')}
                  className="fbm-preset-chip"
                >
                  ⚡ Auto Components (Pune→Manesar)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('fmcg')}
                  className="fbm-preset-chip"
                >
                  ⚡ FMCG Retail (BLR→Chennai)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('steel')}
                  className="fbm-preset-chip"
                >
                  ⚡ Steel Coils (Raigarh→Faridabad)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('pharma')}
                  className="fbm-preset-chip"
                >
                  ⚡ Pharma Cold (HYD→Baddi)
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateLoad} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="fbm-form-label">{t('ORIGIN HUB:', 'शुरुआती हब:')}</label>
                <input
                  type="text"
                  required
                  value={newOrigin}
                  onChange={e => setNewOrigin(e.target.value)}
                  className="fbm-form-input"
                />
              </div>

              <div>
                <label className="fbm-form-label">{t('DESTINATION HUB:', 'गंतव्य हब:')}</label>
                <input
                  type="text"
                  required
                  value={newDestination}
                  onChange={e => setNewDestination(e.target.value)}
                  className="fbm-form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="fbm-form-label">{t('DISTANCE (KM):', 'दूरी (किमी):')}</label>
                  <input
                    type="number"
                    required
                    value={newDistance}
                    onChange={e => setNewDistance(e.target.value)}
                    className="fbm-form-input"
                  />
                </div>
                <div>
                  <label className="fbm-form-label">{t('CARGO WEIGHT (TONS):', 'कार्गो वजन (टन):')}</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newWeight}
                    onChange={e => setNewWeight(e.target.value)}
                    className="fbm-form-input"
                  />
                </div>
              </div>

              <div>
                <label className="fbm-form-label">{t('CARGO MATERIAL DESCRIPTION:', 'माल का विवरण:')}</label>
                <input
                  type="text"
                  required
                  value={newCargo}
                  onChange={e => setNewCargo(e.target.value)}
                  className="fbm-form-input"
                />
              </div>

              <div>
                <label className="fbm-form-label">{t('REQUIRED TRUCK TYPE:', 'आवश्यक ट्रक प्रकार:')}</label>
                <select
                  value={newTruckType}
                  onChange={e => setNewTruckType(e.target.value)}
                  className="fbm-form-select"
                >
                  <option value="32 Ft MXL Container (Multi-Axle)">32 Ft MXL Container (Multi-Axle)</option>
                  <option value="40 Ft High-Bed Trailer (Triple-Axle)">40 Ft High-Bed Trailer (Triple-Axle)</option>
                  <option value="24 Ft Multi-Axle Container">24 Ft Multi-Axle Container</option>
                  <option value="19 Ft Open Truck">19 Ft Open Truck</option>
                </select>
              </div>

              <div>
                <label className="fbm-form-label">{t('SHIPPER TARGET BUDGET (₹):', 'ग्राहक का बजट (₹):')}</label>
                <input
                  type="number"
                  required
                  value={newBudget}
                  onChange={e => setNewBudget(e.target.value)}
                  className="fbm-form-input"
                  style={{ fontWeight: 800, color: '#3b82f6' }}
                />
              </div>

              <div className="fbm-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowNewLoadModal(false)}
                  className="fbm-btn-cancel"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="fbm-btn-submit"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>{t('Posting Load...', 'लोड पोस्ट हो रहा है...')}</span>
                    </>
                  ) : (
                    <span>{t('Start Reverse Auction', 'रिवर्स नीलामी शुरू करें')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLACE BID MODAL */}
      {bidLoadId && (
        <div className="fbm-modal-overlay">
          <div className="fbm-modal-card" style={{ maxWidth: '460px', background: 'var(--bg-surface, #0f172a)' }}>
            <div className="fbm-modal-header">
              <h3 className="fbm-modal-title">
                <TrendingDown size={20} style={{ color: '#10b981' }} />
                <span>{t('Place Lower Competing Bid', 'कम बोली दर्ज करें')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setBidLoadId(null)}
                className="fbm-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePlaceBid} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="fbm-form-label">{t('TRANSPORTER FIRM NAME:', 'ट्रांसपोर्टर का नाम:')}</label>
                <input
                  type="text"
                  required
                  value={transporterName}
                  onChange={e => setTransporterName(e.target.value)}
                  className="fbm-form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="fbm-form-label">{t('PHONE NUMBER:', 'फोन नंबर:')}</label>
                  <input
                    type="text"
                    required
                    value={transporterPhone}
                    onChange={e => setTransporterPhone(e.target.value)}
                    className="fbm-form-input"
                  />
                </div>
                <div>
                  <label className="fbm-form-label">{t('TRUCK NUMBER:', 'ट्रक नंबर:')}</label>
                  <input
                    type="text"
                    required
                    value={truckNumber}
                    onChange={e => setTruckNumber(e.target.value)}
                    className="fbm-form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                <div>
                  <label className="fbm-form-label">{t('OFFERED FREIGHT (₹):', 'बोली दर (₹):')}</label>
                  <input
                    type="number"
                    required
                    value={offeredRate}
                    onChange={e => setOfferedRate(e.target.value)}
                    placeholder={t('Must be lower', 'कम बोली डालें')}
                    className="fbm-form-input"
                    style={{ fontWeight: 800, color: '#10b981' }}
                  />
                </div>
                <div>
                  <label className="fbm-form-label">{t('ETA (HOURS):', 'पहुंचने का समय:')}</label>
                  <input
                    type="number"
                    required
                    value={etaHours}
                    onChange={e => setEtaHours(e.target.value)}
                    className="fbm-form-input"
                  />
                </div>
              </div>

              <div className="fbm-modal-actions">
                <button
                  type="button"
                  onClick={() => setBidLoadId(null)}
                  className="fbm-btn-cancel"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="fbm-btn-submit"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  {t('Submit Quote', 'बोली सबमिट करें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
