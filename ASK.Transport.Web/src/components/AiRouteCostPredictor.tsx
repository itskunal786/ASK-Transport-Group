import React, { useEffect, useState } from 'react';
import {
  predictRouteAndCosts,
  type RouteCostPredictionResult
} from '../api/aiApi';
import { useLanguage } from '../context/LanguageContext';
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

export default function AiRouteCostPredictor() {
  const { t } = useLanguage();
  const [origin, setOrigin] = useState('Mumbai (Maharashtra)');
  const [destination, setDestination] = useState('Delhi NCR (New Delhi)');
  const [truckType, setTruckType] = useState('19ft_container');
  const [dieselPrice, setDieselPrice] = useState(90.5);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RouteCostPredictionResult | null>(null);

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
    } catch (err) {
      console.error('Route prediction error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handlePredict();
  }, [origin, destination, truckType]);

  function handleSwap() {
    const prevOrigin = origin;
    setOrigin(destination);
    setDestination(prevOrigin);
  }

  return (
    <div className="ai-predictor-container">
      {/* HEADER & ROUTE SEARCH FORM */}
      <div className="ai-predictor-card">
        <h2 className="ai-predictor-title">
          <span>🛣️</span> {t('Smart Highway Route, Fastag Toll & Fuel Predictor', 'स्मार्ट हाईवे रूट, फ़ास्टैग टोल एवं ईंधन पूर्वानुमान')}
        </h2>

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
              <span className="ai-kpi-sub" style={{ color: '#059669', fontWeight: 700 }}>
                {t('Net Margin:', 'शुद्ध लाभ:')} ₹{data.profitability.netOperatingProfit.toLocaleString('en-IN')} ({data.profitability.marginPercentage}%)
              </span>
            </div>
          </div>

          {/* LOWER SECTION: EXPENSE BREAKDOWN & CITY RESTRICTIONS */}
          <div className="ai-details-grid">
            {/* TRIP COST BREAKDOWN TABLE */}
            <div className="ai-predictor-card">
              <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
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
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚠️</span> {t('City No-Entry Commercial Windows', 'शहर नो-एंट्री वाणिज्यिक समय-सीमा')}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.cityNoEntryRestrictions.map((item, idx) => (
                    <div key={idx} className="ai-noentry-item">
                      <strong style={{ fontSize: '12.5px', color: '#92400e' }}>{item.city} {t('No-Entry:', 'नो-एंट्री:')}</strong>
                      <div style={{ fontSize: '11.5px', color: '#dc2626', fontWeight: 700 }}>{item.timing}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)', marginTop: '3px' }}>{item.rule}</div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>💡 {item.windowStatus}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOLL PLAZAS ITINERARY */}
              <div className="ai-predictor-card">
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                  {t('NHAI Fastag Toll Plaza Itinerary', 'NHAI फास्टैग टोल प्लाजा सूची')}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {data.tollPlazas.map((tItem, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: 'var(--bg-alt, #f8fafc)', borderRadius: '6px', fontSize: '11.5px', border: '1px solid var(--border-color, #f1f5f9)' }}>
                      <div>
                        <strong>{tItem.name}</strong>
                        <span style={{ fontSize: '10.5px', color: '#64748b', marginLeft: '6px' }}>({tItem.location})</span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#b45309' }}>₹{tItem.fastagCost}</span>
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
