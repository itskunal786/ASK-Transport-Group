import { useState } from 'react';

// ============================================================================
// SPOT FREIGHT RATE & BROKER EXCHANGE MODELS
// ============================================================================

export interface FreightCorridorIndex {
  id: string;
  lane: string;
  originHub: string;
  destinationHub: string;
  distanceKm: number;
  bodyType: 'Container 32ft' | '16-Wheeler Open' | '22-Wheeler Trailer' | 'Reefer Cold';
  recommendedCapacityTon: number;
  
  // Real-time Market Index
  currentSpotRateInr: number;
  thirtyDayAvgRateInr: number;
  trendPercentage: number;
  trendDirection: 'UP' | 'DOWN' | 'STABLE';
  marketLorryAvailability: 'SURPLUS' | 'BALANCED' | 'DEFICIT_HIGH_DEMAND';
  dieselImpactNote: string;
}

export interface SpotBrokerBid {
  id: string;
  brokerName: string;
  contactPerson: string;
  phone: string;
  vehicleNumber: string;
  vehicleBody: string;
  quotedRateInr: number;
  varianceVsTargetInr: number;
  driverRating: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  bidReceivedTime: string;
}

// ============================================================================
// INITIAL MOCK DATA: MAJOR INDIAN FREIGHT HIGHWAY CORRIDORS
// ============================================================================

const INITIAL_CORRIDORS: FreightCorridorIndex[] = [
  {
    id: 'LANE-01',
    lane: 'Pune ➔ Kolkata (NH-53)',
    originHub: 'Pune Logistics Park (MH)',
    destinationHub: 'Dankuni Hub, Kolkata (WB)',
    distanceKm: 1840,
    bodyType: '16-Wheeler Open',
    recommendedCapacityTon: 22.0,
    currentSpotRateInr: 92000,
    thirtyDayAvgRateInr: 94500,
    trendPercentage: -2.6,
    trendDirection: 'DOWN',
    marketLorryAvailability: 'SURPLUS',
    dieselImpactNote: 'Surplus return empty lorries from Maharashtra manufacturing belt.'
  },
  {
    id: 'LANE-02',
    lane: 'Delhi ➔ Mumbai (NH-48)',
    originHub: 'Kundli Terminal, Delhi NCR',
    destinationHub: 'Bhiwandi Hub, Mumbai (MH)',
    distanceKm: 1420,
    bodyType: 'Container 32ft',
    recommendedCapacityTon: 20.0,
    currentSpotRateInr: 68500,
    thirtyDayAvgRateInr: 66200,
    trendPercentage: +3.4,
    trendDirection: 'UP',
    marketLorryAvailability: 'DEFICIT_HIGH_DEMAND',
    dieselImpactNote: 'Festive retail e-commerce surge. Lorry demand exceeds supply.'
  },
  {
    id: 'LANE-03',
    lane: 'Bengaluru ➔ Delhi (NH-44)',
    originHub: 'Nelamangala Hub, Bengaluru',
    destinationHub: 'Kundli Terminal, Delhi NCR',
    distanceKm: 2150,
    bodyType: '22-Wheeler Trailer',
    recommendedCapacityTon: 25.0,
    currentSpotRateInr: 112000,
    thirtyDayAvgRateInr: 110000,
    trendPercentage: +1.8,
    trendDirection: 'UP',
    marketLorryAvailability: 'BALANCED',
    dieselImpactNote: 'Steady South-North industrial electronics and textile flow.'
  },
  {
    id: 'LANE-04',
    lane: 'Ahmedabad ➔ Chennai (NH-48/NH-16)',
    originHub: 'Changodar Hub, Ahmedabad',
    destinationHub: 'Madhavaram Hub, Chennai',
    distanceKm: 1720,
    bodyType: '16-Wheeler Open',
    recommendedCapacityTon: 20.0,
    currentSpotRateInr: 88000,
    thirtyDayAvgRateInr: 87500,
    trendPercentage: +0.5,
    trendDirection: 'STABLE',
    marketLorryAvailability: 'BALANCED',
    dieselImpactNote: 'Chemical and pharma freight rates steady with minimal fluctuation.'
  }
];

const INITIAL_BIDS: SpotBrokerBid[] = [
  {
    id: 'BID-01',
    brokerName: 'Shree Ram Roadlines (Vapi)',
    contactPerson: 'Sukhwinder Singh',
    phone: '+91 98251 44021',
    vehicleNumber: 'GJ-15-AT-7819',
    vehicleBody: '16-Wheeler 28 Ton Multi-Axle',
    quotedRateInr: 89500,
    varianceVsTargetInr: -500,
    driverRating: 4.8,
    status: 'ACCEPTED',
    bidReceivedTime: '12 mins ago'
  },
  {
    id: 'BID-02',
    brokerName: 'Western Fleet Carrier (Thane)',
    contactPerson: 'Karan Sharma',
    phone: '+91 98200 99122',
    vehicleNumber: 'MH-04-HY-6612',
    vehicleBody: '16-Wheeler Tata Signa',
    quotedRateInr: 91000,
    varianceVsTargetInr: +1000,
    driverRating: 4.6,
    status: 'PENDING',
    bidReceivedTime: '18 mins ago'
  },
  {
    id: 'BID-03',
    brokerName: 'Balaji Transport Syndicate (Pune)',
    contactPerson: 'Mahesh Patil',
    phone: '+91 98901 33451',
    vehicleNumber: 'MH-12-PQ-8890',
    vehicleBody: '16-Wheeler Ashok Leyland',
    quotedRateInr: 93500,
    varianceVsTargetInr: +3500,
    driverRating: 4.9,
    status: 'PENDING',
    bidReceivedTime: '24 mins ago'
  }
];

export default function SpotFreightRateAiPredictor() {
  const [corridors] = useState<FreightCorridorIndex[]>(INITIAL_CORRIDORS);
  const [selectedCorridor, setSelectedCorridor] = useState<FreightCorridorIndex>(INITIAL_CORRIDORS[0]);
  const [bids, setBids] = useState<SpotBrokerBid[]>(INITIAL_BIDS);
  
  // Custom Route AI Calculator State
  const [calcDistanceKm, setCalcDistanceKm] = useState<number>(1840);
  const [calcCargoTon, setCalcCargoTon] = useState<number>(22.0);
  const [calcMileageKmPerL, setCalcMileageKmPerL] = useState<number>(3.8);
  const [calcDieselPricePerL] = useState<number>(89.62);
  const [calcTollPerKm] = useState<number>(4.2);
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(20);
  
  // Broadcaster State
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // --------------------------------------------------------------------------
  // AI COST MODEL CALCULATIONS
  // --------------------------------------------------------------------------
  const estDieselLiters = Math.round(calcDistanceKm / calcMileageKmPerL);
  const estFuelCost = Math.round(estDieselLiters * calcDieselPricePerL);
  const estFastagTolls = Math.round(calcDistanceKm * calcTollPerKm);
  const estDriverBhatta = Math.round((calcDistanceKm / 400) * 800 + 1200); // Daily bhatta + food
  const estTyreMaintenanceCost = Math.round(calcDistanceKm * 2.2); // Tyre & lube CPKM

  const totalOperatingCost = estFuelCost + estFastagTolls + estDriverBhatta + estTyreMaintenanceCost;
  const recommendedClientQuote = Math.round(totalOperatingCost / (1 - targetMarginPercent / 100));
  const maxSpotMarketLorryHireCap = Math.round(recommendedClientQuote * 0.88); // Locks min 12% margin if outsourced to market broker
  const grossProfitInr = recommendedClientQuote - totalOperatingCost;

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------
  const handleBroadcastLoad = () => {
    setIsBroadcasting(true);
    showToast(`📲 Broadcasting load requirement on 65+ verified WhatsApp Transport Broker channels...`);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSent(true);
      showToast(`⚡ WhatsApp Load broadcast active! 3 new reverse bids received with competitive rates.`);
    }, 1200);
  };

  const handleAcceptBid = (bidId: string) => {
    setBids(prev =>
      prev.map(b => (b.id === bidId ? { ...b, status: 'ACCEPTED' } : { ...b, status: 'REJECTED' }))
    );
    const accepted = bids.find(b => b.id === bidId);
    showToast(`✅ Bid from ${accepted?.brokerName} (₹${accepted?.quotedRateInr.toLocaleString('en-IN')}) accepted! Trip Advice issued with 70:30 market settlement.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px -5px rgba(67, 56, 202, 0.4)'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>
            <span>📈</span> SPOT FREIGHT INTELLIGENCE &amp; REVERSE BIDDING
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Dynamic Market Freight Rate AI Predictor &amp; Spot Lorry Exchange
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#c7d2fe', lineHeight: 1.5 }}>
            National highway spot freight index tracking, AI margin decomposition engine, automated reverse bidding load broadcasts across 65+ broker WhatsApp channels, and market hire price protection.
          </p>
        </div>

        {/* TOP METRIC */}
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700 }}>AI Margin Benchmark</span>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
            20% - 22% <span style={{ fontSize: '12px' }}>Gross Margin Target</span>
          </div>
        </div>
      </div>

      {/* TOAST ALERT */}
      {toastMessage && (
        <div
          style={{
            background: '#064e3b',
            color: '#a7f3d0',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            border: '1px solid #059669',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* NATIONAL HIGHWAY CORRIDOR SPOT RATE INDEX CARDS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
            🛣️ Live Highway Corridor Spot Rate Index (National Freight Benchmark)
          </h3>
          <small style={{ color: '#64748b', fontSize: '12px' }}>Real-time broker quotes vs 30-day moving average</small>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {corridors.map(c => {
            const isSelected = selectedCorridor.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCorridor(c);
                  setCalcDistanceKm(c.distanceKm);
                  setCalcCargoTon(c.recommendedCapacityTon);
                }}
                style={{
                  background: 'var(--bg-surface, #ffffff)',
                  border: isSelected ? '2px solid #4f46e5' : '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '14px',
                  padding: '16px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 14px rgba(79, 70, 229, 0.2)' : '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    {c.lane}
                  </h4>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: c.trendDirection === 'UP' ? '#fee2e2' : c.trendDirection === 'DOWN' ? '#ecfdf5' : '#f1f5f9',
                      color: c.trendDirection === 'UP' ? '#dc2626' : c.trendDirection === 'DOWN' ? '#059669' : '#475569'
                    }}
                  >
                    {c.trendDirection === 'UP' ? `▲ +${c.trendPercentage}%` : c.trendDirection === 'DOWN' ? `▼ ${c.trendPercentage}%` : 'Stable'}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {c.distanceKm} KM • {c.bodyType} ({c.recommendedCapacityTon}T)
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Live Spot Rate</span>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
                      ₹{c.currentSpotRateInr.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>30-Day Avg</span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>
                      ₹{c.thirtyDayAvgRateInr.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '8px', fontSize: '11px', color: '#475569', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                  💡 {c.dieselImpactNote}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SPLIT: AI MARGIN CALCULATOR & WHATSAPP REVERSE BIDDING */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(380px, 1fr)', gap: '20px', alignItems: 'start' }}>
        {/* LEFT COLUMN: AI MARGIN & BREAK-EVEN CALCULATOR */}
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '22px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
              🤖 AI Trip Profitability &amp; Cost Predictor
            </h3>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#4f46e5', background: '#e0e7ff', padding: '3px 8px', borderRadius: '12px' }}>
              Selected: {selectedCorridor.lane}
            </span>
          </div>

          {/* INPUT FORM SLIDERS & CONTROLS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Trip Distance (KM)
              </label>
              <input
                type="number"
                value={calcDistanceKm}
                onChange={e => setCalcDistanceKm(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Cargo Payload (Tonnes)
              </label>
              <input
                type="number"
                step="0.5"
                value={calcCargoTon}
                onChange={e => setCalcCargoTon(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Truck Mileage (KM / Liter)
              </label>
              <input
                type="number"
                step="0.1"
                value={calcMileageKmPerL}
                onChange={e => setCalcMileageKmPerL(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Target Gross Margin (%)
              </label>
              <input
                type="number"
                value={targetMarginPercent}
                onChange={e => setTargetMarginPercent(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
              />
            </div>
          </div>

          {/* AI COST BREAKDOWN ACCORDION */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Trip Cost Decomposition (Base Expense)
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>⛽ Diesel ({estDieselLiters} L @ ₹{calcDieselPricePerL}):</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>₹{estFuelCost.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>🛣️ Fastag Highway Tolls:</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>₹{estFastagTolls.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>👨‍✈️ Driver Bhatta &amp; Food:</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>₹{estDriverBhatta.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>🛞 Tyre &amp; Maintenance:</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>₹{estTyreMaintenanceCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '2px dashed #cbd5e1' }}>
              <span style={{ fontWeight: 800, color: '#334155' }}>Total Break-Even Cost:</span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#dc2626' }}>
                ₹{totalOperatingCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* AI RECOMMENDATION BOX */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                Recommended Client Quote
              </span>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#065f46', marginTop: '4px' }}>
                ₹{recommendedClientQuote.toLocaleString('en-IN')}
              </div>
              <small style={{ color: '#059669', fontWeight: 700 }}>
                Yields ₹{grossProfitInr.toLocaleString('en-IN')} ({targetMarginPercent}% Margin)
              </small>
            </div>

            <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>
                Market Spot Lorry Hire Cap
              </span>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#1e40af', marginTop: '4px' }}>
                ₹{maxSpotMarketLorryHireCap.toLocaleString('en-IN')}
              </div>
              <small style={{ color: '#1d4ed8', fontWeight: 700 }}>
                Do NOT hire above this cap (Locks 12% broker spread)
              </small>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WHATSAPP REVERSE BIDDING EXCHANGE */}
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '22px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                WHATSAPP FLEET BROKER NETWORK
              </span>
              <h3 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Spot Lorry Reverse Bidding
              </h3>
            </div>

            <button
              type="button"
              disabled={isBroadcasting}
              onClick={handleBroadcastLoad}
              style={{
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>📲</span> {isBroadcasting ? 'Broadcasting...' : '1-Tap Broadcast Load'}
            </button>
          </div>

          <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b' }}>
            Instant reverse auction sent to 65+ transport agents. Lorry owners submit live competitive bids via WhatsApp chat bot.
          </p>

          {/* ACTIVE BROADCAST SUMMARY */}
          {broadcastSent && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 12px', borderRadius: '8px', fontSize: '11px', color: '#166534', marginBottom: '14px' }}>
              ✓ Broadcast active on {selectedCorridor.lane} (22T). Target rate: ₹{maxSpotMarketLorryHireCap.toLocaleString('en-IN')}.
            </div>
          )}

          {/* BIDS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {bids.map(bid => {
              const isAccepted = bid.status === 'ACCEPTED';
              const isBelowTarget = bid.quotedRateInr <= maxSpotMarketLorryHireCap;

              return (
                <div
                  key={bid.id}
                  style={{
                    background: isAccepted ? 'rgba(5, 150, 105, 0.08)' : '#f8fafc',
                    border: '1px solid',
                    borderColor: isAccepted ? '#10b981' : '#e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                        {bid.brokerName}
                      </div>
                      <small style={{ color: '#64748b' }}>
                        {bid.contactPerson} ({bid.phone}) • ⭐ {bid.driverRating}
                      </small>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 900, color: isBelowTarget ? '#059669' : '#dc2626' }}>
                        ₹{bid.quotedRateInr.toLocaleString('en-IN')}
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: isBelowTarget ? '#059669' : '#dc2626'
                        }}
                      >
                        {isBelowTarget ? `✓ Under Cap (Save ₹${Math.abs(bid.varianceVsTargetInr)})` : `+₹${bid.varianceVsTargetInr} Over`}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '11px' }}>
                    <span style={{ color: '#475569' }}>
                      🚛 {bid.vehicleNumber} ({bid.vehicleBody})
                    </span>

                    {isAccepted ? (
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '12px', fontWeight: 800 }}>
                        ✓ Accepted &amp; Issued
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAcceptBid(bid.id)}
                        style={{
                          background: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Accept Bid &amp; Issue Trip
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '14px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b' }}>
            🔒 Accepting a market bid automatically registers the sub-contractor with <strong>70% advance / 30% POD settlement</strong> and auto 194C TDS deduction in the finance ledger.
          </div>
        </div>
      </div>
    </div>
  );
}
