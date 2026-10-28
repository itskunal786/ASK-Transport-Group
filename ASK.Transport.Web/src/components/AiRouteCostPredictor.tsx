import React, { useEffect, useState } from 'react';
import {
  predictRouteAndCosts,
  type RouteCostPredictionResult
} from '../api/aiApi';

export default function AiRouteCostPredictor() {
  const [origin, setOrigin] = useState('Mumbai');
  const [destination, setDestination] = useState('Delhi NCR');
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

  const hubs = [
    'Mumbai', 'Delhi NCR', 'Pune', 'Ahmedabad', 'Bengaluru',
    'Chennai', 'Hyderabad', 'Kolkata', 'Jaipur', 'Surat', 'Nagpur', 'Indore'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER & ROUTE SEARCH FORM */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)' }}>
        <h2 style={{ margin: '0 0 14px', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🛣️</span> Smart Highway Route, Fastag Toll &amp; Fuel Predictor
        </h2>

        <form onSubmit={handlePredict} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>ORIGIN HUB / CITY</label>
            <select
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              {hubs.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>DESTINATION HUB / CITY</label>
            <select
              value={destination}
              onChange={e => setDestination(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              {hubs.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>TRUCK FLEET CATEGORY</label>
            <select
              value={truckType}
              onChange={e => setTruckType(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="14ft_eicher">14ft Eicher (4.5T) - 5.2 km/L</option>
              <option value="19ft_container">19ft Container (8.5T) - 4.2 km/L</option>
              <option value="24ft_multiaxle">24ft Multi-Axle (14T) - 3.5 km/L</option>
              <option value="32ft_mxl_hq">32ft MXL HQ (21T) - 3.1 km/L</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>DIESEL RATE (₹/L)</label>
            <input
              type="number"
              step="0.5"
              value={dieselPrice}
              onChange={e => setDieselPrice(Number(e.target.value))}
              style={{ width: '100%', padding: '8px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '9px 18px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
          >
            {loading ? 'Calculating...' : '⚡ Predict Route & Costs'}
          </button>
        </form>
      </div>

      {data && (
        <>
          {/* TOP SUMMARY STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
            <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #2563eb' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>HIGHWAY DISTANCE</span>
              <strong style={{ fontSize: '22px', color: '#0f172a', display: 'block', margin: '4px 0' }}>
                {data.corridor.distanceKm} KM
              </strong>
              <span style={{ fontSize: '12px', color: '#2563eb' }}>Est. Transit: ~{data.corridor.transitTimeHours} Hours</span>
            </div>

            <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #059669' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>ESTIMATED DIESEL COST</span>
              <strong style={{ fontSize: '22px', color: '#059669', display: 'block', margin: '4px 0' }}>
                ₹{data.costBreakdown.dieselCost.toLocaleString('en-IN')}
              </strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{data.costBreakdown.dieselRequiredLiters} Liters @ ₹{data.costBreakdown.dieselPricePerLiter}/L</span>
            </div>

            <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>FASTAG TOLL CHARGES</span>
              <strong style={{ fontSize: '22px', color: '#b45309', display: 'block', margin: '4px 0' }}>
                ₹{data.costBreakdown.fastagTollCost.toLocaleString('en-IN')}
              </strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Across {data.costBreakdown.tollPlazaCount} NHAI Toll Plazas</span>
            </div>

            <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #7c3aed' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>RECOMMENDED FREIGHT</span>
              <strong style={{ fontSize: '22px', color: '#7c3aed', display: 'block', margin: '4px 0' }}>
                ₹{data.profitability.recommendedFreightQuote.toLocaleString('en-IN')}
              </strong>
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>Net Margin: ₹{data.profitability.netOperatingProfit.toLocaleString('en-IN')} ({data.profitability.marginPercentage}%)</span>
            </div>
          </div>

          {/* LOWER SECTION: EXPENSE BREAKDOWN & CITY RESTRICTIONS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            {/* TRIP COST BREAKDOWN TABLE */}
            <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                Detailed Operating Expense &amp; P&amp;L Analysis
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#475569' }}>⛽ Diesel Fuel Expense:</span>
                  <strong>₹{data.costBreakdown.dieselCost.toLocaleString('en-IN')}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#475569' }}>💳 Fastag Highway Tolls:</span>
                  <strong>₹{data.costBreakdown.fastagTollCost.toLocaleString('en-IN')}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#475569' }}>👤 Driver Trip Bhatta &amp; Food Allowance:</span>
                  <strong>₹{data.costBreakdown.driverAllowanceBhatta.toLocaleString('en-IN')}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#475569' }}>🔧 Incidental &amp; Tyre Wear Allowance:</span>
                  <strong>₹{data.costBreakdown.incidentalMaintenance.toLocaleString('en-IN')}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #cbd5e1', fontWeight: 800 }}>
                  <span style={{ color: '#0f172a' }}>TOTAL OPERATING EXPENSE:</span>
                  <span style={{ color: '#dc2626' }}>₹{data.costBreakdown.totalOperatingCost.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#dcfce7', borderRadius: '8px', color: '#15803d', fontWeight: 800, marginTop: '8px' }}>
                  <span>ESTIMATED NET TRIP PROFIT:</span>
                  <span>₹{data.profitability.netOperatingProfit.toLocaleString('en-IN')} ({data.profitability.marginPercentage}%)</span>
                </div>
              </div>
            </div>

            {/* CITY NO-ENTRY TIMINGS & CORRIDOR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* NO-ENTRY TIMING CARD */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '16px 18px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚠️</span> City No-Entry Commercial Windows
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.cityNoEntryRestrictions.map((item, idx) => (
                    <div key={idx} style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #fef3c7' }}>
                      <strong style={{ fontSize: '12.5px', color: '#92400e' }}>{item.city} No-Entry:</strong>
                      <div style={{ fontSize: '11.5px', color: '#dc2626', fontWeight: 700 }}>{item.timing}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>{item.rule}</div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>💡 {item.windowStatus}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOLL PLAZAS ITINERARY */}
              <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px 18px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                  NHAI Fastag Toll Plaza Itinerary
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {data.tollPlazas.map((t, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', fontSize: '11.5px', border: '1px solid #f1f5f9' }}>
                      <div>
                        <strong>{t.name}</strong>
                        <span style={{ fontSize: '10.5px', color: '#64748b', marginLeft: '6px' }}>({t.location})</span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#b45309' }}>₹{t.fastagCost}</span>
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
