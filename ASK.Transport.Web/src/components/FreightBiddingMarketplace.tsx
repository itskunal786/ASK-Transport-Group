import React, { useEffect, useState } from 'react';
import {
  getMarketplaceLoads,
  createMarketplaceLoad,
  placeMarketplaceBid,
  acceptWinningBid,
  type MarketplaceLoad,
  type MarketplaceBid
} from '../api/enterpriseApi';

export default function FreightBiddingMarketplace() {
  const [loads, setLoads] = useState<MarketplaceLoad[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Contract Locked Alert
  const [lockAlert, setLockAlert] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getMarketplaceLoads();
      setLoads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load marketplace loads:', err);
      setLoads([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
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

  async function handleCreateLoad(e: React.FormEvent) {
    e.preventDefault();
    if (!newBudget || Number(newBudget) <= 0) return;
    try {
      setLoading(true);
      await createMarketplaceLoad({
        originHub: newOrigin,
        destinationHub: newDestination,
        distanceKm: Number(newDistance),
        cargoDescription: newCargo,
        weightTons: Number(newWeight),
        requiredTruckType: newTruckType,
        targetBudget: Number(newBudget)
      });
      setShowNewLoadModal(false);
      loadData();
    } catch (err: any) {
      alert('Failed to post load: ' + err?.message);
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
      alert(res.message);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to submit bid');
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptBid(loadId: number, bidId: number) {
    try {
      setLoading(true);
      const res = await acceptWinningBid(loadId, { bidId });
      setLockAlert(res.message);
      setTimeout(() => setLockAlert(null), 8000);
      loadData();
    } catch (err: any) {
      alert('Failed to accept bid: ' + err?.message);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(seconds: number) {
    if (seconds <= 0) return 'Auction Closed';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER & CONTROLS */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏷️</span> Freight Bidding &amp; Spot Reverse Auction Marketplace
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
            When own fleet is unavailable, push loads to spot marketplace. Verified market truck operators place lowest competing bids; ASK Transport secures brokerage margin.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={loadData}
            style={{ padding: '8px 14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            🔄 Refresh Rates
          </button>

          <button
            type="button"
            onClick={() => setShowNewLoadModal(true)}
            style={{ padding: '8px 16px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>+</span> Post Open Freight Load
          </button>
        </div>
      </div>

      {lockAlert && (
        <div style={{ padding: '14px 20px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', color: '#15803d', fontSize: '13.5px', fontWeight: 800 }}>
          {lockAlert}
        </div>
      )}

      {/* KPI METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>ACTIVE SPOT AUCTIONS</span>
          <strong style={{ fontSize: '24px', color: '#d97706', display: 'block', margin: '4px 0' }}>
            {safeLoads.filter(l => l.status === 'ActiveAuction').length} Open Loads
          </strong>
          <span style={{ fontSize: '11.5px', color: '#b45309' }}>Real-time reverse bidding live</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL COMPETING BIDS</span>
          <strong style={{ fontSize: '24px', color: '#16a34a', display: 'block', margin: '4px 0' }}>
            {safeLoads.reduce((acc, l) => acc + (l.bids || []).length, 0)} Verified Quotes
          </strong>
          <span style={{ fontSize: '11.5px', color: '#059669' }}>From certified transporters</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #2563eb' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>AVG SHIPPER SAVINGS</span>
          <strong style={{ fontSize: '24px', color: '#2563eb', display: 'block', margin: '4px 0' }}>
            ₹9,200 / Trip
          </strong>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>Below client target budget</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #7c3aed' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>PROJECTED BROKERAGE</span>
          <strong style={{ fontSize: '24px', color: '#7c3aed', display: 'block', margin: '4px 0' }}>
            ₹24,500
          </strong>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>ASK Transport gross margin</span>
        </div>
      </div>

      {/* FILTER TABS */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginRight: '6px' }}>TRUCK TYPE:</span>
        {['All', '32 Ft', '40 Ft', '24 Ft'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setFilterType(t)}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: filterType === t ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: filterType === t ? '#eff6ff' : '#ffffff',
              color: filterType === t ? '#1d4ed8' : '#475569'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* AUCTION LOADS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredLoads.map((load: MarketplaceLoad) => {
          const savings = load.targetBudget - load.currentLowestBid;
          const isLocked = load.status === 'ContractLocked';

          return (
            <div
              key={load.id}
              style={{
                background: 'var(--bg-surface, #ffffff)',
                borderRadius: '14px',
                border: isLocked ? '2px solid #10b981' : '1px solid var(--border-color, #e2e8f0)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              {/* LOAD HEADER ROW */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#eff6ff', color: '#1e40af', fontSize: '12px', fontWeight: 800 }}>
                    {load.loadNumber}
                  </span>
                  <strong style={{ fontSize: '15px', color: '#0f172a' }}>{load.cargoDescription}</strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>({load.weightTons} Tons)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isLocked ? (
                    <span style={{ padding: '6px 14px', background: '#dcfce7', color: '#15803d', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ✓ Contract Locked with {load.winningTransporter}
                    </span>
                  ) : (
                    <span style={{ padding: '6px 14px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>⏱️</span> {formatTime(load.secondsRemaining)}
                    </span>
                  )}
                </div>
              </div>

              {/* ROUTE & TRUCK DETAILS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>ORIGIN TO DESTINATION:</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {load.originHub} → {load.destinationHub}
                  </div>
                  <small style={{ color: '#2563eb', fontSize: '11px' }}>Highway Distance: {load.distanceKm} KM</small>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>REQUIRED TRUCK TYPE:</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                    🚛 {load.requiredTruckType}
                  </div>
                  <small style={{ color: '#64748b', fontSize: '11px' }}>Shipper: {load.shipperName}</small>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>SHIPPER TARGET BUDGET:</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#64748b', marginTop: '2px' }}>
                    ₹{load.targetBudget.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#166534', fontWeight: 800 }}>CURRENT LOWEST BID:</span>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>
                    ₹{load.currentLowestBid.toLocaleString('en-IN')}
                  </div>
                  <small style={{ color: '#059669', fontWeight: 700, fontSize: '11px' }}>
                    {savings > 0 ? `Savings: ₹${savings.toLocaleString('en-IN')}` : 'At Target Budget'}
                  </small>
                </div>
              </div>

              {/* COMPETING BIDS LIST */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>
                    MARKET TRANSPORTER BIDS ({load.bids.length} Offers)
                  </span>

                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => {
                        setBidLoadId(load.id);
                        setOfferedRate(String(load.currentLowestBid - 1500));
                      }}
                      style={{ padding: '4px 10px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Place Competing Bid
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {load.bids.map((bid: MarketplaceBid, index: number) => {
                    const isLowest = index === 0;

                    return (
                      <div
                        key={bid.id}
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: bid.isSelected ? '2px solid #10b981' : isLowest ? '1px solid #86efac' : '1px solid #e2e8f0',
                          background: bid.isSelected ? '#f0fdf4' : isLowest ? '#f0fdf4' : '#ffffff'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: isLowest ? '#16a34a' : '#94a3b8', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                            {index + 1}
                          </span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{bid.transporterName}</strong>
                              <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 700 }}>★ {bid.rating}</span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>({bid.totalTripsCompleted} trips)</span>
                            </div>
                            <span style={{ fontSize: '11px', color: '#2563eb' }}>
                              Truck: <strong>{bid.truckNumber}</strong> • ETA to Pickup: {bid.etaPickupHours} hrs
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <strong style={{ fontSize: '16px', color: isLowest ? '#16a34a' : '#0f172a' }}>
                              ₹{bid.offeredRate.toLocaleString('en-IN')}
                            </strong>
                            {isLowest && <span style={{ fontSize: '10.5px', color: '#16a34a', display: 'block', fontWeight: 700 }}>Lowest Quote</span>}
                          </div>

                          {!isLocked && (
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleAcceptBid(load.id, bid.id)}
                              style={{
                                padding: '6px 14px',
                                background: isLowest ? '#059669' : '#334155',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              ✓ Accept &amp; Lock Truck
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '540px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '17px', color: '#0f172a' }}>
              📢 Post Freight Load to Spot Reverse Auction
            </h3>

            <form onSubmit={handleCreateLoad} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>ORIGIN HUB:</label>
                <input
                  type="text"
                  value={newOrigin}
                  onChange={e => setNewOrigin(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>DESTINATION HUB:</label>
                <input
                  type="text"
                  value={newDestination}
                  onChange={e => setNewDestination(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>DISTANCE (KM):</label>
                  <input
                    type="number"
                    value={newDistance}
                    onChange={e => setNewDistance(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>CARGO WEIGHT (TONS):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newWeight}
                    onChange={e => setNewWeight(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>CARGO MATERIAL DESCRIPTION:</label>
                <input
                  type="text"
                  value={newCargo}
                  onChange={e => setNewCargo(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>REQUIRED TRUCK TYPE:</label>
                <select
                  value={newTruckType}
                  onChange={e => setNewTruckType(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                >
                  <option value="32 Ft MXL Container (Multi-Axle)">32 Ft MXL Container (Multi-Axle)</option>
                  <option value="40 Ft High-Bed Trailer (Triple-Axle)">40 Ft High-Bed Trailer (Triple-Axle)</option>
                  <option value="24 Ft Multi-Axle Container">24 Ft Multi-Axle Container</option>
                  <option value="19 Ft Open Truck">19 Ft Open Truck</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>SHIPPER TARGET BUDGET (₹):</label>
                <input
                  type="number"
                  value={newBudget}
                  onChange={e => setNewBudget(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, color: '#2563eb' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewLoadModal(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '8px 20px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Start Reverse Auction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLACE BID MODAL */}
      {bidLoadId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '17px', color: '#0f172a' }}>
              💰 Place Lower Competing Bid
            </h3>

            <form onSubmit={handlePlaceBid} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>TRANSPORTER FIRM NAME:</label>
                <input
                  type="text"
                  value={transporterName}
                  onChange={e => setTransporterName(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>PHONE NUMBER:</label>
                  <input
                    type="text"
                    value={transporterPhone}
                    onChange={e => setTransporterPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>TRUCK NUMBER:</label>
                  <input
                    type="text"
                    value={truckNumber}
                    onChange={e => setTruckNumber(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>OFFERED FREIGHT (₹):</label>
                  <input
                    type="number"
                    value={offeredRate}
                    onChange={e => setOfferedRate(e.target.value)}
                    placeholder="Must be lower than lowest bid"
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 800, color: '#16a34a' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>ETA (HOURS):</label>
                  <input
                    type="number"
                    value={etaHours}
                    onChange={e => setEtaHours(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setBidLoadId(null)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '8px 20px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Submit Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
