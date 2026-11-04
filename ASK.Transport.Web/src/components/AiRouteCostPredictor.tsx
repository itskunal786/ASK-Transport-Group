import React, { useEffect, useState } from 'react';
import {
  predictRouteAndCosts,
  calculateLocalRoutePrediction,
  type RouteCostPredictionResult
} from '../api/aiApi';
import { useLanguage } from '../context/LanguageContext';
import {
  Copy,
  CheckCircle2,
  Printer,
  Sparkles,
  Navigation
} from 'lucide-react';
import './AiRouteCostPredictor.css';

// ============================================================================
// ALL 29 INDIAN STATES & UNION TERRITORIES LOGISTICS HUBS
// ============================================================================

export const TOP_METRO_HUBS = [
  'Mumbai (Maharashtra)',
  'Delhi NCR (New Delhi)',
  'Bengaluru (Karnataka)',
  'Chennai (Tamil Nadu)',
  'Kolkata (West Bengal)',
  'Hyderabad (Telangana)',
  'Ahmedabad (Gujarat)',
  'Pune (Maharashtra)',
  'Jaipur (Rajasthan)',
  'Surat (Gujarat)',
  'Indore (Madhya Pradesh)',
  'Lucknow (Uttar Pradesh)',
  'Ludhiana (Punjab)',
  'Kochi (Kerala)',
  'Nagpur (Maharashtra)',
  'Patna (Bihar)',
  'Bhubaneswar (Odisha)',
  'Guwahati (Assam)'
];

export const ALL_29_STATES_AND_UTS = [
  'Andhra Pradesh - Visakhapatnam (Vizag Port) / Vijayawada',
  'Arunachal Pradesh - Itanagar / Naharlagun Hub',
  'Assam - Guwahati (Dispur / North-East Gateway)',
  'Bihar - Patna / Muzaffarpur / Hajipur',
  'Chhattisgarh - Raipur / Bhilai Logistics Complex',
  'Delhi NCR - New Delhi (Okhla / Kundli / Manesar)',
  'Goa - Panaji / Verna Industrial Estate / Vasco',
  'Gujarat - Ahmedabad (Sanand / Surat / Vadodara / Kandla)',
  'Haryana - Gurugram / Manesar / Panipat / Ambala',
  'Himachal Pradesh - Baddi / Solan Industrial Corridor',
  'Jharkhand - Ranchi / Jamshedpur / Bokaro / Dhanbad',
  'Karnataka - Bengaluru (Peenya / Hoskote / Hubli)',
  'Kerala - Kochi / Ernakulam / Kozhikode',
  'Madhya Pradesh - Indore (Pithampur / Bhopal / Gwalior)',
  'Maharashtra - Mumbai (JNPT Nhava Sheva / Pune / Nagpur)',
  'Manipur - Imphal (Trans-Asian Freight Corridor)',
  'Meghalaya - Shillong / Byrnihat Industrial Belt',
  'Mizoram - Aizawl Logistics Depot',
  'Nagaland - Dimapur (Railhead Multi-Modal Hub)',
  'Odisha - Bhubaneswar / Cuttack / Paradip Port',
  'Punjab - Ludhiana (Dry Port / Amritsar / Jalandhar)',
  'Rajasthan - Jaipur / Bhiwadi / Jodhpur / Udaipur',
  'Sikkim - Gangtok / Rangpo Pharma Hub',
  'Tamil Nadu - Chennai Port / Coimbatore / Salem / Madurai',
  'Telangana - Hyderabad / Shamshabad / Medchal',
  'Tripura - Agartala (Integrated Check Post)',
  'Uttar Pradesh - Noida / Greater Noida / Lucknow / Kanpur',
  'Uttarakhand - Dehradun / Rudrapur (SIDCUL) / Haridwar',
  'West Bengal - Kolkata (Dankuni) / Haldia Port / Siliguri',
  // Union Territories
  'Jammu & Kashmir (UT) - Jammu / Srinagar Transit Hub',
  'Ladakh (UT) - Leh High-Altitude Terminal',
  'Chandigarh (UT) - Chandigarh Tri-City Logistics Area',
  'Puducherry (UT) - Puducherry Mettupalayam Hub',
  'Dadra & Nagar Haveli and Daman & Diu (UT) - Daman / Silvassa',
  'Andaman & Nicobar Islands (UT) - Port Blair (Haddo Port)'
];

export const POPULAR_CORRIDORS = [
  { label: 'Mumbai ➔ Delhi NCR (1,420 KM)', orig: 'Mumbai (Maharashtra)', dest: 'Delhi NCR (New Delhi)' },
  { label: 'Mumbai ➔ Bengaluru (980 KM)', orig: 'Mumbai (Maharashtra)', dest: 'Bengaluru (Karnataka)' },
  { label: 'Delhi NCR ➔ Kolkata (1,530 KM)', orig: 'Delhi NCR (New Delhi)', dest: 'Kolkata (West Bengal)' },
  { label: 'Ahmedabad ➔ Kolkata (1,980 KM)', orig: 'Ahmedabad (Gujarat)', dest: 'Kolkata (West Bengal)' },
  { label: 'Pune ➔ Chennai (1,150 KM)', orig: 'Pune (Maharashtra)', dest: 'Chennai (Tamil Nadu)' }
];

export default function AiRouteCostPredictor() {
  const { t } = useLanguage();
  const [origin, setOrigin] = useState('Mumbai (Maharashtra)');
  const [destination, setDestination] = useState('Delhi NCR (New Delhi)');
  const [truckType, setTruckType] = useState('19ft_container');
  const [dieselPrice, setDieselPrice] = useState(90.5);

  const [loading, setLoading] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Initialize immediately with full calculation so data is NEVER blank!
  const [data, setData] = useState<RouteCostPredictionResult>(() =>
    calculateLocalRoutePrediction({
      originCity: 'Mumbai (Maharashtra)',
      destinationCity: 'Delhi NCR (New Delhi)',
      truckCategory: '19ft_container',
      dieselPricePerLiter: 90.5
    })
  );

  async function handlePredict(e?: React.FormEvent) {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const res = await predictRouteAndCosts({
        originCity: origin,
        destinationCity: destination,
        truckCategory: truckType,
        dieselPricePerLiter: dieselPrice
      });
      setData(res);
      setToastMsg(`⚡ Route ${res.corridor.originCity} ➔ ${res.corridor.destinationCity} predicted (${res.corridor.distanceKm} KM)!`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch {
      const localRes = calculateLocalRoutePrediction({
        originCity: origin,
        destinationCity: destination,
        truckCategory: truckType,
        dieselPricePerLiter: dieselPrice
      });
      setData(localRes);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handlePredict();
  }, [origin, destination, truckType, dieselPrice]);

  function handleSwap() {
    const prevOrigin = origin;
    setOrigin(destination);
    setDestination(prevOrigin);
  }

  const handleCopySummary = () => {
    if (!data) return;
    const text = `================================================
ASK TRANSPORT & LOGISTICS - HIGHWAY ROUTE & TOLL ITINERARY
================================================
Corridor:            ${data.corridor.originCity} ➔ ${data.corridor.destinationCity}
National Highway:    ${data.corridor.highwayName}
Distance & Transit:  ${data.corridor.distanceKm} KM (~${data.corridor.transitTimeHours} Hours @ 42 km/h convoy speed)
Fleet Vehicle Type:  ${truckType.replace('_', ' ').toUpperCase()} (${data.costBreakdown.mileageKmPerLiter} km/L)
------------------------------------------------
1. Estimated Diesel: ₹${data.costBreakdown.dieselCost.toLocaleString('en-IN')} (${data.costBreakdown.dieselRequiredLiters} Liters @ ₹${data.costBreakdown.dieselPricePerLiter}/L)
2. Fastag Tolls:     ₹${data.costBreakdown.fastagTollCost.toLocaleString('en-IN')} (Across ${data.costBreakdown.tollPlazaCount} NHAI Toll Plazas)
3. Driver Allowance: ₹${data.costBreakdown.driverAllowanceBhatta.toLocaleString('en-IN')} (Trip Bhatta & Night Halts)
4. Incidentals:      ₹${data.costBreakdown.incidentalMaintenance.toLocaleString('en-IN')} (Tyres & Maintenance Reserve)
------------------------------------------------
TOTAL OPERATING EXPENSE: ₹${data.costBreakdown.totalOperatingCost.toLocaleString('en-IN')}
RECOMMENDED FREIGHT:     ₹${data.profitability.recommendedFreightQuote.toLocaleString('en-IN')}
PROJECTED NET PROFIT:    ₹${data.profitability.netOperatingProfit.toLocaleString('en-IN')} (${data.profitability.marginPercentage}%)
------------------------------------------------
* Generated via ASK AI Smart Highway Route & Toll Predictor
* 100% AIS-140 GPS Synced & GST E-Way Bill Ready`;

    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setToastMsg('📋 Official Route & Cost Itinerary copied to clipboard!');
    setTimeout(() => {
      setCopiedQuote(false);
      setToastMsg(null);
    }, 3000);
  };

  return (
    <div className="ai-predictor-container">
      {/* TOAST MESSAGE */}
      {toastMsg && (
        <div style={{
          padding: '12px 18px',
          background: '#0284c7',
          color: '#ffffff',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
        }}>
          <Sparkles size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER & ROUTE SEARCH FORM */}
      <div className="ai-predictor-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <h2 className="ai-predictor-title" style={{ margin: 0 }}>
            <span>🛣️</span> {t('Smart Highway Route, Fastag Toll & Fuel Predictor', 'स्मार्ट हाईवे रूट, फ़ास्टैग टोल एवं ईंधन पूर्वानुमान')}
          </h2>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCopySummary}
              className="ai-predictor-secondary-btn"
              title="Copy Formatted Quotation & Route Summary"
            >
              {copiedQuote ? <CheckCircle2 size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
              <span>{copiedQuote ? 'Copied!' : 'Copy Route Quote'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="ai-predictor-secondary-btn"
              title="Print Route Dispatch Itinerary"
            >
              <Printer size={14} />
              <span>Print Slip</span>
            </button>
          </div>
        </div>

        {/* QUICK POPULAR CORRIDORS */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', alignSelf: 'center' }}>
            Quick Routes:
          </span>
          {POPULAR_CORRIDORS.map(corridor => (
            <button
              key={corridor.label}
              type="button"
              onClick={() => {
                setOrigin(corridor.orig);
                setDestination(corridor.dest);
              }}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '16px',
                border: '1px solid #cbd5e1',
                background: origin === corridor.orig && destination === corridor.dest ? '#0284c7' : '#f1f5f9',
                color: origin === corridor.orig && destination === corridor.dest ? '#ffffff' : '#334155',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {corridor.label}
            </button>
          ))}
        </div>

        <form onSubmit={handlePredict} className="ai-predictor-form">
          <div className="ai-predictor-field">
            <label>{t('ORIGIN HUB / CITY', 'प्रस्थान हब / शहर (Origin)')}</label>
            <select
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              className="ai-predictor-select"
            >
              <optgroup label={t('⭐ Popular Freight Metro Hubs', '⭐ प्रमुख मेट्रो एवं फ्रेट हब')}>
                {TOP_METRO_HUBS.map(h => (
                  <option key={`orig-metro-${h}`} value={h}>{h}</option>
                ))}
              </optgroup>
              <optgroup label={t('🇮🇳 All 29 States & Union Territories', '🇮🇳 सभी 29 राज्य एवं केंद्र शासित प्रदेश')}>
                {ALL_29_STATES_AND_UTS.map(s => (
                  <option key={`orig-state-${s}`} value={s}>{s}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <button
            type="button"
            className="ai-predictor-swap-btn"
            onClick={handleSwap}
            title={t('Swap Origin and Destination', 'प्रस्थान एवं गंतव्य बदलें (Swap)')}
          >
            ⇄
          </button>

          <div className="ai-predictor-field">
            <label>{t('DESTINATION HUB / CITY', 'गंतव्य हब / शहर (Destination)')}</label>
            <select
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="ai-predictor-select"
            >
              <optgroup label={t('⭐ Popular Freight Metro Hubs', '⭐ प्रमुख मेट्रो एवं फ्रेट हब')}>
                {TOP_METRO_HUBS.map(h => (
                  <option key={`dest-metro-${h}`} value={h}>{h}</option>
                ))}
              </optgroup>
              <optgroup label={t('🇮🇳 All 29 States & Union Territories', '🇮🇳 सभी 29 राज्य एवं केंद्र शासित प्रदेश')}>
                {ALL_29_STATES_AND_UTS.map(s => (
                  <option key={`dest-state-${s}`} value={s}>{s}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="ai-predictor-field">
            <label>{t('TRUCK FLEET CATEGORY', 'ट्रक श्रेणी (Fleet Category)')}</label>
            <select
              value={truckType}
              onChange={e => setTruckType(e.target.value)}
              className="ai-predictor-select"
            >
              <option value="14ft_eicher">14ft Eicher (4.5T) - 5.2 km/L</option>
              <option value="19ft_container">19ft Container (8.5T) - 4.2 km/L</option>
              <option value="24ft_multiaxle">24ft Multi-Axle (14T) - 3.5 km/L</option>
              <option value="32ft_mxl_hq">32ft MXL HQ (21T) - 3.1 km/L</option>
            </select>
          </div>

          <div className="ai-predictor-field">
            <label>{t('DIESEL RATE (₹/L)', 'डीजल दर (₹/लीटर)')}</label>
            <input
              type="number"
              step="0.5"
              value={dieselPrice}
              onChange={e => setDieselPrice(Number(e.target.value))}
              className="ai-predictor-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="ai-predictor-btn-submit"
          >
            {loading ? t('Calculating...', 'गणना जारी...') : `⚡ ${t('Predict Route & Costs', 'रूट व लागत का अनुमान लगाएं')}`}
          </button>
        </form>

        {/* HIGHWAY CORRIDOR BADGE */}
        {data && (
          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: 'rgba(2, 132, 199, 0.08)',
            border: '1px solid rgba(2, 132, 199, 0.25)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: 800 }}>
              <Navigation size={15} />
              <span>{data.corridor.highwayName}</span>
            </div>
            <div style={{ color: '#64748b', fontWeight: 600 }}>
              Speed: <b>{data.corridor.commercialConvoySpeedKmh} km/h convoy avg</b> • Transit: <b>~{data.corridor.transitTimeHours}h</b>
            </div>
          </div>
        )}
      </div>

      {data && (
        <>
          {/* TOP SUMMARY STATS */}
          <div className="ai-kpi-grid">
            <div className="ai-kpi-card kpi-blue">
              <span className="ai-kpi-label">{t('HIGHWAY DISTANCE', 'हाईवे दूरी (KM)')}</span>
              <strong className="ai-kpi-value">
                {data.corridor.distanceKm} KM
              </strong>
              <span className="ai-kpi-sub">
                {t('Est. Transit:', 'अनुमानित समय:')} ~{data.corridor.transitTimeHours} {t('Hours', 'घंटे')}
              </span>
            </div>

            <div className="ai-kpi-card kpi-green">
              <span className="ai-kpi-label">{t('ESTIMATED DIESEL COST', 'अनुमानित डीजल खर्च')}</span>
              <strong className="ai-kpi-value">
                ₹{data.costBreakdown.dieselCost.toLocaleString('en-IN')}
              </strong>
              <span className="ai-kpi-sub">
                {data.costBreakdown.dieselRequiredLiters} {t('Liters @', 'लीटर @')} ₹{data.costBreakdown.dieselPricePerLiter}/L
              </span>
            </div>

            <div className="ai-kpi-card kpi-amber">
              <span className="ai-kpi-label">{t('FASTAG TOLL CHARGES', 'फास्टैग टोल शुल्क')}</span>
              <strong className="ai-kpi-value">
                ₹{data.costBreakdown.fastagTollCost.toLocaleString('en-IN')}
              </strong>
              <span className="ai-kpi-sub">
                {t('Across', 'कुल')} {data.costBreakdown.tollPlazaCount} {t('NHAI Toll Plazas', 'NHAI टोल प्लाजा')}
              </span>
            </div>

            <div className="ai-kpi-card kpi-purple">
              <span className="ai-kpi-label">{t('RECOMMENDED FREIGHT', 'अनुशंसित भाड़ा (Freight Quote)')}</span>
              <strong className="ai-kpi-value">
                ₹{data.profitability.recommendedFreightQuote.toLocaleString('en-IN')}
              </strong>
              <span className="ai-kpi-sub ai-kpi-margin-sub">
                {t('Net Margin:', 'शुद्ध लाभ:')} ₹{data.profitability.netOperatingProfit.toLocaleString('en-IN')} ({data.profitability.marginPercentage}%)
              </span>
            </div>
          </div>

          {/* LOWER SECTION: EXPENSE BREAKDOWN & CITY RESTRICTIONS */}
          <div className="ai-details-grid">
            {/* TRIP COST BREAKDOWN TABLE */}
            <div className="ai-predictor-card">
              <h3 className="ai-section-heading">
                {t('Detailed Operating Expense & P&L Analysis', 'विस्तृत परिचालन व्यय एवं लाभ-हानि विश्लेषण')}
              </h3>

              <div className="ai-expense-table">
                <div className="ai-expense-row">
                  <span className="ai-expense-label">⛽ {t('Diesel Fuel Expense:', 'डीजल ईंधन खर्च:')}</span>
                  <strong className="ai-expense-value">₹{data.costBreakdown.dieselCost.toLocaleString('en-IN')}</strong>
                </div>

                <div className="ai-expense-row">
                  <span className="ai-expense-label">💳 {t('Fastag Highway Tolls:', 'फास्टैग हाईवे टोल:')}</span>
                  <strong className="ai-expense-value">₹{data.costBreakdown.fastagTollCost.toLocaleString('en-IN')}</strong>
                </div>

                <div className="ai-expense-row">
                  <span className="ai-expense-label">👤 {t('Driver Trip Bhatta & Food Allowance:', 'चालक भत्ता व भोजन व्यय:')}</span>
                  <strong className="ai-expense-value">₹{data.costBreakdown.driverAllowanceBhatta.toLocaleString('en-IN')}</strong>
                </div>

                <div className="ai-expense-row">
                  <span className="ai-expense-label">🔧 {t('Incidental & Tyre Wear Allowance:', 'टायर घिसाव व रख-रखाव भत्ता:')}</span>
                  <strong className="ai-expense-value">₹{data.costBreakdown.incidentalMaintenance.toLocaleString('en-IN')}</strong>
                </div>

                <div className="ai-expense-total">
                  <span>{t('TOTAL OPERATING EXPENSE:', 'कुल परिचालन व्यय:')}</span>
                  <span style={{ color: '#dc2626' }}>₹{data.costBreakdown.totalOperatingCost.toLocaleString('en-IN')}</span>
                </div>

                <div className="ai-profit-banner">
                  <span>{t('ESTIMATED NET TRIP PROFIT:', 'अनुमानित शुद्ध यात्रा लाभ:')}</span>
                  <span>₹{data.profitability.netOperatingProfit.toLocaleString('en-IN')} ({data.profitability.marginPercentage}%)</span>
                </div>
              </div>
            </div>

            {/* CITY NO-ENTRY TIMINGS & CORRIDOR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* NO-ENTRY TIMING CARD */}
              <div className="ai-noentry-card">
                <h4 className="ai-noentry-heading">
                  <span>⚠️</span> {t('City No-Entry Commercial Windows', 'शहर नो-एंट्री वाणिज्यिक समय-सीमा')}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.cityNoEntryRestrictions.map((item, idx) => (
                    <div key={idx} className="ai-noentry-item">
                      <strong className="ai-noentry-city-title">{item.city} {t('No-Entry:', 'नो-एंट्री:')}</strong>
                      <div className="ai-noentry-timing">{item.timing}</div>
                      <div className="ai-noentry-rule">{item.rule}</div>
                      <div className="ai-noentry-status">💡 {item.windowStatus}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOLL PLAZAS ITINERARY */}
              <div className="ai-predictor-card">
                <h4 className="ai-toll-heading">
                  {t('NHAI Fastag Toll Plaza Itinerary', 'NHAI फास्टैग टोल प्लाजा सूची')}
                </h4>

                <div className="ai-toll-list">
                  {data.tollPlazas.map((tItem, idx) => (
                    <div key={idx} className="ai-toll-item">
                      <div className="ai-toll-info">
                        <strong className="ai-toll-name">{tItem.name}</strong>
                        <span className="ai-toll-location">({tItem.location})</span>
                      </div>
                      <span className="ai-toll-cost">₹{tItem.fastagCost}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
