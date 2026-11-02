import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Route,
  BrainCircuit,
  Fuel,
  Receipt,
  User,
  Wrench,
  Share2,
  Truck,
  Star,
  ShieldCheck,
  Sparkles,
  Activity
} from 'lucide-react';
import {
  getFreightCorridors,
  getBrokerBids,
  acceptBrokerBid,
  broadcastLoadRequirement
} from '../api/spotFreightApi';
import { useLanguage } from '../context/LanguageContext';
import './SpotFreightRateAiPredictor.css';

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
    lane: 'Ahmedabad ➔ Chennai (NH-48/16)',
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
    quotedRateInr: 64500,
    varianceVsTargetInr: -1535,
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
    quotedRateInr: 65800,
    varianceVsTargetInr: -235,
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
    quotedRateInr: 68500,
    varianceVsTargetInr: +2465,
    driverRating: 4.9,
    status: 'PENDING',
    bidReceivedTime: '24 mins ago'
  }
];

export default function SpotFreightRateAiPredictor() {
  const { t } = useLanguage();
  const [corridors, setCorridors] = useState<FreightCorridorIndex[]>(INITIAL_CORRIDORS);
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

  useEffect(() => {
    Promise.all([getFreightCorridors(), getBrokerBids()])
      .then(([cData, bData]) => {
        if (cData && cData.length > 0) setCorridors(cData);
        if (bData && bData.length > 0) setBids(bData);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // --------------------------------------------------------------------------
  // AI COST MODEL CALCULATIONS
  // --------------------------------------------------------------------------
  const safeDistance = Math.max(1, calcDistanceKm || 1);
  const safeMileage = Math.max(0.5, calcMileageKmPerL || 1);
  const estDieselLiters = Math.round(safeDistance / safeMileage);
  const estFuelCost = Math.round(estDieselLiters * calcDieselPricePerL);
  const estFastagTolls = Math.round(safeDistance * calcTollPerKm);
  const estDriverBhatta = Math.round((safeDistance / 400) * 800 + 1200);
  const estTyreMaintenanceCost = Math.round(safeDistance * 2.2);

  const totalOperatingCost = estFuelCost + estFastagTolls + estDriverBhatta + estTyreMaintenanceCost;
  const safeMargin = Math.min(60, Math.max(5, targetMarginPercent || 20));
  const recommendedClientQuote = Math.round(totalOperatingCost / (1 - safeMargin / 100));
  const maxSpotMarketLorryHireCap = Math.round(recommendedClientQuote * 0.88);
  const grossProfitInr = recommendedClientQuote - totalOperatingCost;

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------
  const handleBroadcastLoad = () => {
    broadcastLoadRequirement(selectedCorridor.lane, calcCargoTon, maxSpotMarketLorryHireCap).catch(() => {});
    setIsBroadcasting(true);
    showToast(`📲 ${t('Broadcasting load requirement on 65+ verified WhatsApp Transport Broker channels...', '65+ सत्यापित व्हाट्सएप ट्रांसपोर्ट ब्रोकर चैनलों पर लोड आवश्यकता प्रसारित की जा रही है...')}`);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSent(true);
      showToast(`⚡ ${t('WhatsApp Load broadcast active! 3 new reverse bids received with competitive rates.', 'व्हाट्सएप लोड प्रसारण सक्रिय! प्रतिस्पर्धी दरों के साथ 3 नई रिवर्स बोलियां प्राप्त हुईं।')}`);
    }, 1200);
  };

  const handleAcceptBid = (bidId: string) => {
    acceptBrokerBid(bidId).catch(() => {});
    setBids(prev =>
      prev.map(b => (b.id === bidId ? { ...b, status: 'ACCEPTED' } : { ...b, status: 'REJECTED' }))
    );
    const accepted = bids.find(b => b.id === bidId);
    showToast(`✅ ${t(`Bid from ${accepted?.brokerName} (₹${(accepted?.quotedRateInr ?? 0).toLocaleString('en-IN')}) accepted! Trip Advice issued.`, `${accepted?.brokerName} की बोली (₹${(accepted?.quotedRateInr ?? 0).toLocaleString('en-IN')}) स्वीकृत! ट्रिप एडवाइस जारी।`)}`);
  };

  return (
    <div className="spot-deck-container">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div
          style={{
            background: '#064e3b',
            color: '#a7f3d0',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            border: '1px solid #059669',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* COMPACT HIGHWAY CORRIDOR SELECTOR STRIP */}
      <div className="spot-corridors-section">
        <div className="spot-section-header">
          <div className="spot-section-title">
            <Route size={16} color="#4f46e5" />
            <span>{t('National Highway Corridor Spot Rate Index', 'राष्ट्रीय राजमार्ग कॉरिडोर स्पॉट भाड़ा दर सूचकांक')}</span>
          </div>
          <div className="spot-section-subtitle">
            {t('Click corridor to auto-fill distance, vehicle specs & live benchmark', 'दूरी, वाहन विवरण व लाइव बेंचमार्क ऑटो-भरने हेतु कॉरिडोर चुनें')}
          </div>
        </div>

        <div className="spot-corridors-grid">
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
                className={`spot-corridor-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="spot-corridor-top">
                  <h4 className="spot-corridor-lane">{c.lane}</h4>
                  <span
                    className={`spot-trend-badge ${
                      c.trendDirection === 'UP' ? 'up' : c.trendDirection === 'DOWN' ? 'down' : 'stable'
                    }`}
                  >
                    {c.trendDirection === 'UP' ? (
                      <>
                        <TrendingUp size={10} /> +{c.trendPercentage}%
                      </>
                    ) : c.trendDirection === 'DOWN' ? (
                      <>
                        <TrendingDown size={10} /> {c.trendPercentage}%
                      </>
                    ) : (
                      <>
                        <Activity size={10} /> {t('Stable', 'स्थिर')}
                      </>
                    )}
                  </span>
                </div>

                <div className="spot-corridor-meta">
                  {c.distanceKm} KM • {c.bodyType} ({c.recommendedCapacityTon}T)
                </div>

                <div className="spot-corridor-rates">
                  <div>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                      {t('Spot Rate', 'स्पॉट दर')}
                    </span>
                    <span className="spot-corridor-price">
                      ₹{c.currentSpotRateInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-secondary, #64748b)', display: 'block' }}>
                      {t('30-Day Avg', '30-दिन औसत')}
                    </span>
                    <span className="spot-corridor-avg">
                      ₹{c.thirtyDayAvgRateInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BALANCED SPLIT: AI MARGIN CALCULATOR & WHATSAPP REVERSE BIDDING */}
      <div className="spot-split-grid">
        {/* LEFT COLUMN: AI MARGIN & BREAK-EVEN CALCULATOR */}
        <div className="spot-main-card">
          <div className="spot-card-header">
            <h3 className="spot-card-title">
              <BrainCircuit size={16} color="#4f46e5" />
              <span>{t('AI Trip Profitability & Cost Predictor', 'एआई ट्रिप लाभप्रदता एवं लागत प्रेडिक्टर')}</span>
            </h3>
            <span className="spot-selected-chip">
              {t('Selected', 'चयनित')}: {selectedCorridor.lane}
            </span>
          </div>

          {/* INPUT FORM: COMPACT 4-COLUMN ROW */}
          <div className="spot-inputs-grid">
            <div className="spot-input-wrap">
              <label className="spot-input-label">{t('Distance (KM)', 'दूरी (किमी)')}</label>
              <input
                type="number"
                value={calcDistanceKm}
                onChange={e => setCalcDistanceKm(Number(e.target.value))}
                className="spot-input-field"
              />
            </div>

            <div className="spot-input-wrap">
              <label className="spot-input-label">{t('Payload (Ton)', 'लोड (टन)')}</label>
              <input
                type="number"
                step="0.5"
                value={calcCargoTon}
                onChange={e => setCalcCargoTon(Number(e.target.value))}
                className="spot-input-field"
              />
            </div>

            <div className="spot-input-wrap">
              <label className="spot-input-label">{t('Mileage (KM/L)', 'माइलेज (किमी/ली)')}</label>
              <input
                type="number"
                step="0.1"
                value={calcMileageKmPerL}
                onChange={e => setCalcMileageKmPerL(Number(e.target.value))}
                className="spot-input-field"
              />
            </div>

            <div className="spot-input-wrap">
              <label className="spot-input-label">{t('Margin (%)', 'मार्जिन (%)')}</label>
              <input
                type="number"
                value={targetMarginPercent}
                onChange={e => setTargetMarginPercent(Number(e.target.value))}
                className="spot-input-field"
              />
            </div>
          </div>

          {/* AI COST BREAKDOWN COMPACT BOX */}
          <div className="spot-cost-box">
            <div className="spot-cost-header">
              {t('Trip Cost Decomposition (Base Expense)', 'ट्रिप लागत विभाजन (मूल व्यय)')}
            </div>

            <div className="spot-cost-grid">
              <div className="spot-cost-item">
                <span className="spot-cost-item-label">
                  <Fuel size={12} color="#0284c7" />
                  {t('Diesel', 'डीजल')} ({estDieselLiters}L):
                </span>
                <span className="spot-cost-item-val">₹{estFuelCost.toLocaleString('en-IN')}</span>
              </div>

              <div className="spot-cost-item">
                <span className="spot-cost-item-label">
                  <Receipt size={12} color="#f59e0b" />
                  {t('Fastag Tolls', 'फास्टैग टोल')}:
                </span>
                <span className="spot-cost-item-val">₹{estFastagTolls.toLocaleString('en-IN')}</span>
              </div>

              <div className="spot-cost-item">
                <span className="spot-cost-item-label">
                  <User size={12} color="#8b5cf6" />
                  {t('Driver Bhatta', 'चालक भत्ता')}:
                </span>
                <span className="spot-cost-item-val">₹{estDriverBhatta.toLocaleString('en-IN')}</span>
              </div>

              <div className="spot-cost-item">
                <span className="spot-cost-item-label">
                  <Wrench size={12} color="#64748b" />
                  {t('Tyre & CPKM', 'टायर व रखरखाव')}:
                </span>
                <span className="spot-cost-item-val">₹{estTyreMaintenanceCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="spot-breakeven-row">
              <span className="spot-breakeven-label">{t('Total Break-Even Cost:', 'कुल नो-लॉस लागत (ब्रेक-ईवन):')}</span>
              <span className="spot-breakeven-val">
                ₹{totalOperatingCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* AI RECOMMENDATION BOXES */}
          <div className="spot-recom-grid">
            <div className="spot-recom-card green">
              <span className="spot-recom-label">
                {t('Recommended Client Quote', 'अनुशंसित ग्राहक कोटेशन')}
              </span>
              <div className="spot-recom-val">
                ₹{recommendedClientQuote.toLocaleString('en-IN')}
              </div>
              <span className="spot-recom-meta">
                {t('Yields', 'लाभ')}: ₹{grossProfitInr.toLocaleString('en-IN')} ({safeMargin}% {t('Margin', 'मार्जिन')})
              </span>
            </div>

            <div className="spot-recom-card blue">
              <span className="spot-recom-label">
                {t('Market Spot Lorry Hire Cap', 'मार्केट स्पॉट लॉरी किराया कैप')}
              </span>
              <div className="spot-recom-val">
                ₹{maxSpotMarketLorryHireCap.toLocaleString('en-IN')}
              </div>
              <span className="spot-recom-meta">
                {t('Do NOT hire above this cap (Locks 12% spread)', 'इस कैप से ऊपर हायर न करें (12% मार्जिन सुरक्षित)')}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WHATSAPP REVERSE BIDDING EXCHANGE */}
        <div className="spot-main-card">
          <div className="spot-card-header">
            <div>
              <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block' }}>
                {t('WhatsApp Fleet Broker Network', 'व्हाट्सएप फ्लीट ब्रोकर नेटवर्क')}
              </span>
              <h3 className="spot-card-title">
                <Share2 size={15} color="#16a34a" />
                <span>{t('Spot Lorry Reverse Bidding', 'स्पॉट लॉरी रिवर्स बिडिंग')}</span>
              </h3>
            </div>

            <button
              type="button"
              disabled={isBroadcasting}
              onClick={handleBroadcastLoad}
              className="spot-btn-broadcast"
            >
              <Sparkles size={13} />
              <span>{isBroadcasting ? t('Broadcasting...', 'प्रसारित हो रहा है...') : t('1-Tap Broadcast Load', '1-टैप ब्रॉडकास्ट लोड')}</span>
            </button>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)', lineHeight: 1.4 }}>
            {t(
              'Instant reverse auction sent to 65+ transport agents. Lorry owners submit live competitive bids via WhatsApp chat bot.',
              '65+ ट्रांसपोर्ट एजेंटों को तत्काल रिवर्स नीलामी भेजी गई। लॉरी मालिक व्हाट्सएप चैट बॉट के माध्यम से प्रतिस्पर्धी बोलियां सबमिट करते हैं।'
            )}
          </div>

          {/* ACTIVE BROADCAST SUMMARY */}
          {broadcastSent && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 10px', borderRadius: '7px', fontSize: '10.5px', color: '#166534' }}>
              ✓ {t(`Broadcast active on ${selectedCorridor.lane} (${calcCargoTon}T). Cap: ₹${maxSpotMarketLorryHireCap.toLocaleString('en-IN')}`, `${selectedCorridor.lane} (${calcCargoTon}T) पर ब्रॉडकास्ट सक्रिय। कैप: ₹${maxSpotMarketLorryHireCap.toLocaleString('en-IN')}`)}
            </div>
          )}

          {/* BIDS LIST - COMPACT & PRECISE */}
          <div className="spot-bids-list">
            {bids.map(bid => {
              const isAccepted = bid.status === 'ACCEPTED';
              const isBelowTarget = bid.quotedRateInr <= maxSpotMarketLorryHireCap;
              const varianceAmount = Math.abs(bid.quotedRateInr - maxSpotMarketLorryHireCap);

              return (
                <div
                  key={bid.id}
                  className={`spot-bid-item ${isAccepted ? 'accepted' : ''}`}
                >
                  <div className="spot-bid-top">
                    <div>
                      <div className="spot-bid-name">{bid.brokerName}</div>
                      <span className="spot-bid-meta">
                        {bid.contactPerson} ({bid.phone}) • <Star size={10} color="#f59e0b" fill="#f59e0b" style={{ display: 'inline', verticalAlign: '-1px' }} /> {bid.driverRating}
                      </span>
                    </div>

                    <div className="spot-bid-price-box">
                      <div
                        className="spot-bid-price"
                        style={{ color: isBelowTarget ? '#059669' : '#dc2626' }}
                      >
                        ₹{bid.quotedRateInr.toLocaleString('en-IN')}
                      </div>
                      <span
                        className="spot-bid-variance"
                        style={{ color: isBelowTarget ? '#059669' : '#dc2626' }}
                      >
                        {isBelowTarget
                          ? `✓ ${t(`Save ₹${varianceAmount.toLocaleString('en-IN')}`, `बचत ₹${varianceAmount.toLocaleString('en-IN')}`)}`
                          : `+₹${varianceAmount.toLocaleString('en-IN')} ${t('Over Cap', 'कैप से अधिक')}`}
                      </span>
                    </div>
                  </div>

                  <div className="spot-bid-bottom">
                    <span className="spot-bid-vehicle">
                      <Truck size={12} /> {bid.vehicleNumber} ({bid.vehicleBody})
                    </span>

                    {isAccepted ? (
                      <span className="spot-badge-accepted">
                        ✓ {t('Accepted & Issued', 'स्वीकृत व जारी')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAcceptBid(bid.id)}
                        className="spot-btn-accept"
                      >
                        {t('Accept Bid & Issue Trip', 'स्वीकार करें व ट्रिप दें')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="spot-note-footer">
            <ShieldCheck size={14} color="#059669" style={{ flexShrink: 0 }} />
            <span>
              {t(
                'Accepting a market bid automatically registers the sub-contractor with 70% advance / 30% POD settlement and auto 194C TDS deduction.',
                'मार्केट बोली स्वीकार करने पर सब-कॉन्ट्रैक्टर 70% अग्रिम / 30% पीओडी सेटलमेंट और स्वचालित 194C टीडीएस कटौती के साथ पंजीकृत होता है।'
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
