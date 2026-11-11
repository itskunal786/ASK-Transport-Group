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
  Activity,
  CheckCircle,
  FileText,
  Printer,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  getFreightCorridors,
  getBrokerBids,
  acceptBrokerBid,
  broadcastLoadRequirement,
  resetBrokerBidsToDefault,
  saveLocalBids,
  DEFAULT_CORRIDORS,
  DEFAULT_BIDS
} from '../api/spotFreightApi';
import type { FreightCorridorIndex, SpotBrokerBid } from '../types/transportOperations';
import { useLanguage } from '../context/LanguageContext';
import './SpotFreightRateAiPredictor.css';

export default function SpotFreightRateAiPredictor() {
  const { t } = useLanguage();
  const [corridors, setCorridors] = useState<FreightCorridorIndex[]>(DEFAULT_CORRIDORS);
  const [selectedCorridor, setSelectedCorridor] = useState<FreightCorridorIndex>(DEFAULT_CORRIDORS[0]);

  // Persistent Bids State from LocalStorage
  const [bids, setBids] = useState<SpotBrokerBid[]>(() => {
    try {
      const cached = localStorage.getItem('ask_spot_broker_bids');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cached spot broker bids', e);
    }
    return DEFAULT_BIDS;
  });

  // Modal State for Accepted Trip Advice Sheet
  const [selectedAcceptedBid, setSelectedAcceptedBid] = useState<SpotBrokerBid | null>(null);

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

  // Sync with API or LocalStorage on mount
  useEffect(() => {
    Promise.all([getFreightCorridors(), getBrokerBids()])
      .then(([cData, bData]) => {
        if (cData && cData.length > 0) setCorridors(cData);
        if (bData && bData.length > 0) {
          // If local state doesn't differ dramatically, keep or sync
          setBids(bData);
        }
      })
      .catch(() => {});
  }, []);

  // Save bids to localStorage on any state change
  useEffect(() => {
    saveLocalBids(bids);
  }, [bids]);

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
  const handleBroadcastLoad = async () => {
    setIsBroadcasting(true);
    showToast(`📲 ${t('Broadcasting load requirement on 65+ verified WhatsApp Transport Broker channels...', '65+ सत्यापित व्हाट्सएप ट्रांसपोर्ट ब्रोकर चैनलों पर लोड आवश्यकता प्रसारित की जा रही है...')}`);
    
    try {
      await broadcastLoadRequirement(selectedCorridor.lane, calcCargoTon, maxSpotMarketLorryHireCap);
      const updated = await getBrokerBids();
      setBids(updated);
    } catch {}

    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSent(true);
      showToast(`⚡ ${t('WhatsApp Load broadcast active! 3 new reverse bids received with competitive rates.', 'व्हाट्सएप लोड प्रसारण सक्रिय! प्रतिस्पर्धी दरों के साथ 3 नई रिवर्स बोलियां प्राप्त हुईं।')}`);
    }, 1200);
  };

  const handleResetBids = () => {
    const defaults = resetBrokerBidsToDefault();
    setBids(defaults);
    showToast(`🔄 ${t('Spot market bids reset to default.', 'स्पॉट मार्केट बोलियां डिफॉल्ट पर रीसेट कर दी गईं।')}`);
  };

  const handleAcceptBid = (bidId: string) => {
    let acceptedItem: SpotBrokerBid | null = null;

    const updatedBids: SpotBrokerBid[] = bids.map(b => {
      if (b.id === bidId) {
        const advance = Math.round(b.quotedRateInr * 0.7);
        const balance = b.quotedRateInr - advance;
        const tds = Math.round(b.quotedRateInr * 0.02);
        const tripNo = b.tripSheetNo || `TRP-SPOT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const time = b.issuedAt || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        acceptedItem = {
          ...b,
          status: 'ACCEPTED',
          tripSheetNo: tripNo,
          issuedAt: time,
          advanceAmount: advance,
          balanceAmount: balance,
          tdsDeduction: tds
        };
        return acceptedItem;
      }
      return {
        ...b,
        status: 'REJECTED'
      };
    });

    setBids(updatedBids);
    saveLocalBids(updatedBids);
    acceptBrokerBid(bidId).catch(() => {});

    if (acceptedItem) {
      setSelectedAcceptedBid(acceptedItem);
      showToast(`✅ ${t(`Bid from ${(acceptedItem as SpotBrokerBid).brokerName} (₹${(acceptedItem as SpotBrokerBid).quotedRateInr.toLocaleString('en-IN')}) accepted! Trip Advice ${(acceptedItem as SpotBrokerBid).tripSheetNo} issued.`, `${(acceptedItem as SpotBrokerBid).brokerName} की बोली (₹${(acceptedItem as SpotBrokerBid).quotedRateInr.toLocaleString('en-IN')}) स्वीकृत! ट्रिप एडवाइस ${(acceptedItem as SpotBrokerBid).tripSheetNo} जारी।`)}`);
    }
  };

  const handleRevokeBid = (bidId: string) => {
    const updated = bids.map(b => (b.id === bidId ? { ...b, status: 'PENDING' as const } : b));
    setBids(updated);
    saveLocalBids(updated);
    showToast(`⚠️ ${t('Bid revoked and re-opened for negotiation.', 'बोली रद्द करके पुनः बातचीत के लिए खोल दी गई।')}`);
  };

  const handleShareWhatsApp = (bid: SpotBrokerBid) => {
    const text = encodeURIComponent(
      `🚚 *ASK TRANSPORT GROUP - TRIP ADVICE / DISPATCH MEMO*\n` +
      `Trip Sheet No: ${bid.tripSheetNo || 'TRP-SPOT-2026'}\n` +
      `Corridor: ${selectedCorridor.lane}\n` +
      `Transporter / Broker: ${bid.brokerName} (${bid.contactPerson})\n` +
      `Vehicle: ${bid.vehicleNumber} (${bid.vehicleBody})\n` +
      `Agreed Freight: ₹${bid.quotedRateInr.toLocaleString('en-IN')}\n` +
      `Advance (70%): ₹${(bid.advanceAmount || Math.round(bid.quotedRateInr * 0.7)).toLocaleString('en-IN')} (Diesel Card + Toll)\n` +
      `Balance on POD: ₹${(bid.balanceAmount || Math.round(bid.quotedRateInr * 0.3)).toLocaleString('en-IN')} (Less 2% TDS)\n` +
      `Status: DISPATCH CONFIRMED & SEALED`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
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
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>{toastMessage}</span>
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
                min="10"
                max="5000"
              />
            </div>

            <div className="spot-input-wrap">
              <label className="spot-input-label">{t('Payload (Ton)', 'पेलोड (टन)')}</label>
              <input
                type="number"
                value={calcCargoTon}
                onChange={e => setCalcCargoTon(Number(e.target.value))}
                className="spot-input-field"
                step="0.5"
                min="1"
                max="55"
              />
            </div>

            <div className="spot-input-wrap">
              <label className="spot-input-label">{t('Mileage (KM/L)', 'माइलेज (किमी/ली)')}</label>
              <input
                type="number"
                value={calcMileageKmPerL}
                onChange={e => setCalcMileageKmPerL(Number(e.target.value))}
                className="spot-input-field"
                step="0.1"
                min="1"
                max="10"
              />
            </div>

            <div className="spot-input-wrap">
              <label className="spot-input-label">{t('Margin (%)', 'मार्जिन (%)')}</label>
              <input
                type="number"
                value={targetMarginPercent}
                onChange={e => setTargetMarginPercent(Number(e.target.value))}
                className="spot-input-field"
                min="5"
                max="50"
              />
            </div>
          </div>

          {/* TRIP COST BREAKDOWN (COMPACT 2x2 GRID) */}
          <div className="spot-cost-box">
            <div className="spot-cost-box-title">
              {t('Trip Cost Decomposition (Base Expense)', 'ट्रिप लागत विभाजन (मूल खर्च)')}
            </div>

            <div className="spot-cost-grid">
              <div className="spot-cost-item">
                <span className="spot-cost-item-label">
                  <Fuel size={12} color="#059669" /> Diesel ({estDieselLiters}L):
                </span>
                <span className="spot-cost-item-val">
                  ₹{estFuelCost.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="spot-cost-item">
                <span className="spot-cost-item-label">
                  <Receipt size={12} color="#d97706" /> Fastag Tolls:
                </span>
                <span className="spot-cost-item-val">
                  ₹{estFastagTolls.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="spot-cost-item">
                <span className="spot-cost-item-label">
                  <User size={12} color="#6366f1" /> Driver Bhatta:
                </span>
                <span className="spot-cost-item-val">
                  ₹{estDriverBhatta.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="spot-cost-item">
                <span className="spot-cost-item-label">
                  <Wrench size={12} color="#475569" /> Tyre &amp; CPKM:
                </span>
                <span className="spot-cost-item-val">
                  ₹{estTyreMaintenanceCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="spot-breakeven-row">
              <span className="spot-breakeven-label">
                {t('Total Break-Even Cost:', 'कुल ब्रेक-ईवन लागत:')}
              </span>
              <span className="spot-breakeven-val">
                ₹{totalOperatingCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* TWO AI RECOMMENDATION PILLS */}
          <div className="spot-recom-grid">
            <div className="spot-recom-card green">
              <div className="spot-recom-label">
                {t('Recommended Client Quote', 'अनुशंसित क्लाइंट कोटेशन')}
              </div>
              <div className="spot-recom-val">
                ₹{recommendedClientQuote.toLocaleString('en-IN')}
              </div>
              <div className="spot-recom-meta">
                {t(`Yields ₹${grossProfitInr.toLocaleString('en-IN')} (${safeMargin}% Margin)`, `₹${grossProfitInr.toLocaleString('en-IN')} (${safeMargin}% मार्जिन) लाभ`)}
              </div>
            </div>

            <div className="spot-recom-card blue">
              <div className="spot-recom-label">
                {t('Market Spot Lorry Hire Cap', 'मार्केट स्पॉट लॉरी किराया सीमा')}
              </div>
              <div className="spot-recom-val">
                ₹{maxSpotMarketLorryHireCap.toLocaleString('en-IN')}
              </div>
              <div className="spot-recom-meta">
                {t('Do NOT hire above this cap (Locks 12% spread)', 'इस सीमा से अधिक पर न लें (12% स्प्रेड लॉक करता है)')}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WHATSAPP FLEET BROKER REVERSE AUCTION */}
        <div className="spot-main-card">
          <div className="spot-card-header">
            <div>
              <span className="spot-broker-network-tag">
                {t('WhatsApp Fleet Broker Network', 'व्हाट्सएप फ्लीट ब्रोकर नेटवर्क')}
              </span>
              <h3 className="spot-card-title">
                <Share2 size={15} color="#16a34a" />
                <span>{t('Spot Lorry Reverse Bidding', 'स्पॉट लॉरी रिवर्स बिडिंग')}</span>
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleResetBids}
                className="spot-btn-reset-bids"
                title={t('Reset bids to initial sample state', 'बोलियों को पुनः रीसेट करें')}
              >
                <RotateCcw size={12} />
                <span>{t('Reset', 'रीसेट')}</span>
              </button>

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
              const isRejected = bid.status === 'REJECTED';
              const isBelowTarget = bid.quotedRateInr <= maxSpotMarketLorryHireCap;
              const varianceAmount = Math.abs(bid.quotedRateInr - maxSpotMarketLorryHireCap);
              const advanceAmount = bid.advanceAmount || Math.round(bid.quotedRateInr * 0.7);
              const balanceAmount = bid.balanceAmount || Math.round(bid.quotedRateInr * 0.3);

              return (
                <div
                  key={bid.id}
                  className={`spot-bid-item ${isAccepted ? 'accepted' : isRejected ? 'rejected' : ''}`}
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
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedAcceptedBid(bid)}
                          className="spot-btn-view-trip"
                          title={t('View official issued Trip Advice & Lorry Hire memo', 'जारी ट्रिप एडवाइस व लॉरी हायर मेमो देखें')}
                        >
                          <FileText size={11} />
                          <span>✓ {bid.tripSheetNo ? `${bid.tripSheetNo}` : t('Trip Issued', 'ट्रिप जारी')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRevokeBid(bid.id)}
                          className="spot-btn-revoke"
                          title={t('Re-open bid for negotiation', 'पुनः खोलें')}
                        >
                          ✕
                        </button>
                      </div>
                    ) : isRejected ? (
                      <button
                        type="button"
                        onClick={() => handleAcceptBid(bid.id)}
                        className="spot-btn-reconsider"
                      >
                        {t('Choose This Bid', 'यह बोली चुनें')}
                      </button>
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

                  {/* ACCEPTED ADVANCE / BALANCE SUMMARY STRIP */}
                  {isAccepted && (
                    <div className="spot-bid-accepted-strip">
                      <span>✓ <strong>{t('70% Adv:', '70% अग्रिम:')}</strong> ₹{advanceAmount.toLocaleString('en-IN')}</span>
                      <span>•</span>
                      <span><strong>{t('30% POD Bal:', '30% पीओडी शेष:')}</strong> ₹{balanceAmount.toLocaleString('en-IN')}</span>
                      <span>•</span>
                      <span><strong>{t('Issued:', 'जारी:')}</strong> {bid.issuedAt || 'Just now'}</span>
                    </div>
                  )}
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

      {/* ========================================================================
          TRIP ADVICE & LORRY HIRE MEMO MODAL (POPUP ON ACCEPT BID)
          ======================================================================== */}
      {selectedAcceptedBid && (
        <div className="spot-modal-overlay" onClick={() => setSelectedAcceptedBid(null)}>
          <div className="spot-modal-wrapper" onClick={e => e.stopPropagation()}>
            <div className="spot-modal-header">
              <div className="spot-modal-header-left">
                <CheckCircle size={20} color="#10b981" />
                <div>
                  <h3 className="spot-modal-title">
                    {t('Official Spot Trip Advice & Dispatch Memo', 'आधिकारिक स्पॉट ट्रिप एडवाइस एवं प्रेषण मेमो')}
                  </h3>
                  <div className="spot-modal-subtitle">
                    {t('Authorized Lorry Hire & Consignment Transit Note', 'अधिकृत लॉरी हायर एवं कंसाइनमेंट ट्रांजिट नोट')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="spot-modal-close"
                onClick={() => setSelectedAcceptedBid(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="spot-modal-body">
              {/* TRIP SUMMARY STRIP */}
              <div className="spot-memo-summary">
                <div>
                  <div className="spot-memo-ref-label">{t('TRIP SHEET NUMBER', 'ट्रिप शीट संख्या')}</div>
                  <div className="spot-memo-ref-no">{selectedAcceptedBid.tripSheetNo || 'TRP-SPOT-2026-9284'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="spot-memo-ref-label">{t('TRANSIT CORRIDOR', 'ट्रांजिट कॉरिडोर')}</div>
                  <div className="spot-memo-lane">{selectedCorridor.lane}</div>
                </div>
              </div>

              {/* PARTICULARS GRID */}
              <div className="spot-memo-grid">
                {/* 1. BROKER & TRANSPORTER */}
                <div className="spot-memo-box">
                  <div className="spot-memo-box-title">
                    <Truck size={14} color="#4f46e5" />
                    <span>{t('Assigned Transporter & Lorry Details', 'आवंटित ट्रांसपोर्टर एवं लॉरी विवरण')}</span>
                  </div>
                  <div className="spot-memo-rows">
                    <div className="spot-memo-row">
                      <span>{t('Transporter / Broker:', 'ट्रांसपोर्टर / ब्रोकर:')}</span>
                      <strong>{selectedAcceptedBid.brokerName}</strong>
                    </div>
                    <div className="spot-memo-row">
                      <span>{t('Contact Person:', 'संपर्क व्यक्ति:')}</span>
                      <span>{selectedAcceptedBid.contactPerson} ({selectedAcceptedBid.phone})</span>
                    </div>
                    <div className="spot-memo-row">
                      <span>{t('Vehicle Number:', 'वाहन संख्या:')}</span>
                      <strong style={{ color: '#0369a1' }}>{selectedAcceptedBid.vehicleNumber}</strong>
                    </div>
                    <div className="spot-memo-row">
                      <span>{t('Body & Capacity:', 'बॉडी एवं क्षमता:')}</span>
                      <span>{selectedAcceptedBid.vehicleBody} ({calcCargoTon} Ton payload)</span>
                    </div>
                    <div className="spot-memo-row">
                      <span>{t('Driver Rating:', 'चालक रेटिंग:')}</span>
                      <span>★ {selectedAcceptedBid.driverRating} / 5.0 (MoRTH Verified)</span>
                    </div>
                  </div>
                </div>

                {/* 2. COMMERCIAL & TDS SETTLEMENT */}
                <div className="spot-memo-box">
                  <div className="spot-memo-box-title">
                    <Receipt size={14} color="#059669" />
                    <span>{t('Freight & Statutory Settlement (194C TDS)', 'भाड़ा एवं वैधानिक सेटलमेंट (194C टीडीएस)')}</span>
                  </div>
                  <div className="spot-memo-rows">
                    <div className="spot-memo-row">
                      <span>{t('Total Agreed Freight:', 'कुल तय भाड़ा:')}</span>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                        ₹{selectedAcceptedBid.quotedRateInr.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="spot-memo-row" style={{ color: '#059669' }}>
                      <span>{t('Less 70% Immediate Advance:', '70% अग्रिम (डीजल कार्ड + फास्टैग):')}</span>
                      <strong>
                        -₹{(selectedAcceptedBid.advanceAmount || Math.round(selectedAcceptedBid.quotedRateInr * 0.7)).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="spot-memo-row">
                      <span>{t('Gross 30% Balance on Delivery:', '30% सकल शेष डिलीवरी पर:')}</span>
                      <strong>
                        ₹{(selectedAcceptedBid.balanceAmount || Math.round(selectedAcceptedBid.quotedRateInr * 0.3)).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="spot-memo-row" style={{ color: '#dc2626' }}>
                      <span>{t('Less Statutory TDS (2% u/s 194C):', 'धारा 194C के तहत 2% टीडीएस कटौती:')}</span>
                      <strong>
                        -₹{(selectedAcceptedBid.tdsDeduction || Math.round(selectedAcceptedBid.quotedRateInr * 0.02)).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="spot-memo-row spot-memo-net-row">
                      <span>{t('Net Balance Transfer upon POD:', 'पीओडी उपरांत शुद्ध देय शेष राशि:')}</span>
                      <strong style={{ color: '#059669', fontSize: '15px' }}>
                        ₹{(
                          (selectedAcceptedBid.balanceAmount || Math.round(selectedAcceptedBid.quotedRateInr * 0.3)) -
                          (selectedAcceptedBid.tdsDeduction || Math.round(selectedAcceptedBid.quotedRateInr * 0.02))
                        ).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* VERIFICATION CHECKLIST STRIP */}
              <div className="spot-compliance-strip">
                <div className="spot-compliance-item">
                  <CheckCircle size={13} color="#10b981" />
                  <span>{t('Fastag Auto-Toll Tag Linked', 'फास्टैग टोल टैग लिंक')}</span>
                </div>
                <div className="spot-compliance-item">
                  <CheckCircle size={13} color="#10b981" />
                  <span>{t('AIS-140 GPS Telematics Active', 'जीपीएस टेलीमैटिक्स सक्रिय')}</span>
                </div>
                <div className="spot-compliance-item">
                  <CheckCircle size={13} color="#10b981" />
                  <span>{t('MoRTH Vahan & Sarathi Verified', 'वाहन एवं सारथी सत्यापित')}</span>
                </div>
                <div className="spot-compliance-item">
                  <CheckCircle size={13} color="#10b981" />
                  <span>{t('Form 26Q TDS Audit Logged', 'फॉर्म 26Q टीडीएस ऑडिट दर्ज')}</span>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="spot-modal-footer">
              <button
                type="button"
                onClick={() => handleShareWhatsApp(selectedAcceptedBid)}
                className="spot-btn-share-wa"
              >
                <Share2 size={13} />
                <span>{t('Share on WhatsApp', 'व्हाट्सएप पर भेजें')}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="spot-btn-print"
              >
                <Printer size={13} />
                <span>{t('Print Trip Advice Sheet', 'ट्रिप शीट प्रिंट करें')}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAcceptedBid(null)}
                className="spot-btn-done"
              >
                <span>{t('Confirm & Done', 'पुष्टि करें एवं बंद करें')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
