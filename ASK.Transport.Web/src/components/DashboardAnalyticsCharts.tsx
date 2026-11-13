import { useState, useMemo } from 'react';
import './DashboardAnalyticsCharts.css';

interface MonthlyDataPoint {
  month: string;
  revenueLakhs: number;
  consignments: number;
  tonnageMt: number;
}

const YEAR_2026_DATA: MonthlyDataPoint[] = [
  { month: 'Jan', revenueLakhs: 28.4, consignments: 820, tonnageMt: 3250 },
  { month: 'Feb', revenueLakhs: 31.2, consignments: 890, tonnageMt: 3510 },
  { month: 'Mar', revenueLakhs: 35.8, consignments: 980, tonnageMt: 3920 },
  { month: 'Apr', revenueLakhs: 33.6, consignments: 940, tonnageMt: 3740 },
  { month: 'May', revenueLakhs: 37.1, consignments: 1040, tonnageMt: 4180 },
  { month: 'Jun', revenueLakhs: 39.5, consignments: 1120, tonnageMt: 4460 },
  { month: 'Jul', revenueLakhs: 38.2, consignments: 1080, tonnageMt: 4310 },
  { month: 'Aug', revenueLakhs: 41.0, consignments: 1190, tonnageMt: 4720 },
  { month: 'Sep', revenueLakhs: 43.4, consignments: 1240, tonnageMt: 4980 },
  { month: 'Oct', revenueLakhs: 46.2, consignments: 1350, tonnageMt: 5410 },
  { month: 'Nov', revenueLakhs: 42.5, consignments: 1284, tonnageMt: 5120 },
  { month: 'Dec (Est)', revenueLakhs: 44.8, consignments: 1310, tonnageMt: 5240 }
];

const CARGO_CATEGORIES = [
  { name: 'Heavy FTL Freight', sub: '32ft Multi-Axle • 488 Bilties', pct: 38, count: 488, revenue: '₹1.61 Cr', color: '#0284c7' },
  { name: 'PTL Express Parcel', sub: 'Part Truckload • 346 Bilties', pct: 27, count: 346, revenue: '₹1.14 Cr', color: '#10b981' },
  { name: 'Reefer Cold-Chain', sub: 'Pharma & Perishables • 231 Bilties', pct: 18, count: 231, revenue: '₹76.5 L', color: '#f59e0b' },
  { name: 'Automotive Machinery', sub: 'OEM Spares & Parts • 154 Bilties', pct: 12, count: 154, revenue: '₹51.0 L', color: '#8b5cf6' },
  { name: 'ODC Project Cargo', sub: 'Over-Dimensional • 65 Bilties', pct: 5, count: 65, revenue: '₹21.2 L', color: '#ec4899' }
];

const CORRIDOR_PERFORMANCE = [
  {
    corridor: 'NH-48 (Delhi NCR ⟷ Mumbai Freightway)',
    km: 1420,
    slaPct: 98.4,
    avgSpeed: '45 km/h',
    toll: '₹2,840',
    trips: 412,
    color: '#0284c7'
  },
  {
    corridor: 'NH-44 (Delhi NCR ⟷ Bengaluru Tech Line)',
    km: 2150,
    slaPct: 96.8,
    avgSpeed: '42 km/h',
    toll: '₹4,150',
    trips: 328,
    color: '#10b981'
  },
  {
    corridor: 'NH-19 (Delhi NCR ⟷ Kolkata Eastern Trunk)',
    km: 1530,
    slaPct: 97.2,
    avgSpeed: '43 km/h',
    toll: '₹3,120',
    trips: 284,
    color: '#f59e0b'
  },
  {
    corridor: 'NH-65 (Pune ⟷ Hyderabad Industrial Route)',
    km: 860,
    slaPct: 99.1,
    avgSpeed: '46 km/h',
    toll: '₹1,680',
    trips: 195,
    color: '#8b5cf6'
  },
  {
    corridor: 'NH-16 (Chennai ⟷ Visakhapatnam Coastal Corridor)',
    km: 800,
    slaPct: 98.6,
    avgSpeed: '44 km/h',
    toll: '₹1,550',
    trips: 165,
    color: '#06b6d4'
  }
];

const FLEET_STATUS_BREAKDOWN = [
  { label: 'Active on Highways', sub: 'Interstate Long-Haul Trips', count: 184, pct: 75.1, color: '#10b981' },
  { label: 'Dock Inward / Hub', sub: 'Cross-Dock Terminal Load', count: 32, pct: 13.1, color: '#0284c7' },
  { label: 'Yard Staging Ready', sub: 'Available for Immediate Dispatch', count: 18, pct: 7.3, color: '#f59e0b' },
  { label: 'Workshop Service', sub: 'Preventive Fleet Maintenance', count: 11, pct: 4.5, color: '#ef4444' }
];

export default function DashboardAnalyticsCharts() {
  const [period, setPeriod] = useState<'7d' | '30d' | '2026'>('2026');
  const [graphMetric, setGraphMetric] = useState<'revenue' | 'consignments' | 'tonnage'>('revenue');
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(10); // Default to Nov
  const [hoveredCategoryIdx, setHoveredCategoryIdx] = useState<number | null>(null);
  const [hoveredFleetIdx, setHoveredFleetIdx] = useState<number | null>(null);

  // SVG Chart Geometry calculations
  const graphWidth = 620;
  const graphHeight = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;

  const currentValues = useMemo(() => {
    return YEAR_2026_DATA.map(d => {
      if (graphMetric === 'revenue') return d.revenueLakhs;
      if (graphMetric === 'consignments') return d.consignments;
      return d.tonnageMt;
    });
  }, [graphMetric]);

  const minVal = 0;
  const maxVal = useMemo(() => {
    const rawMax = Math.max(...currentValues);
    return Math.ceil(rawMax * 1.15);
  }, [currentValues]);

  const points = useMemo(() => {
    const usableWidth = graphWidth - padLeft - padRight;
    const usableHeight = graphHeight - padTop - padBottom;
    const stepX = usableWidth / (YEAR_2026_DATA.length - 1);

    return currentValues.map((val, idx) => {
      const x = padLeft + idx * stepX;
      const y = padTop + (1 - (val - minVal) / (maxVal - minVal)) * usableHeight;
      return { x, y, val, month: YEAR_2026_DATA[idx].month };
    });
  }, [currentValues, maxVal]);

  // Generate smooth SVG curve path (cubic bezier)
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  // Generate area fill path
  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const bottomY = graphHeight - padBottom;
    return `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
  }, [linePath, points]);

  // Hovered active point data
  const activeMonthData = hoveredMonthIdx !== null && YEAR_2026_DATA[hoveredMonthIdx] ? YEAR_2026_DATA[hoveredMonthIdx] : YEAR_2026_DATA[10];

  return (
    <section className="dashboard-analytics-suite" aria-label="Operations Analytics and Visual Radar">
      {/* 1. SUITE HEADER CONTROLS */}
      <div className="analytics-suite-header">
        <div className="analytics-title-group">
          <h2>
            <span>📊</span> Executive Logistics Analytics &amp; Visual Radar
          </h2>
          <p>Real-time telemetry on revenue growth, freight category distribution, and highway corridor SLA metrics</p>
        </div>

        <div className="analytics-controls-group">
          <div className="analytics-period-toggle">
            <button
              type="button"
              className={`analytics-period-btn ${period === '7d' ? 'active' : ''}`}
              onClick={() => setPeriod('7d')}
            >
              7 Days
            </button>
            <button
              type="button"
              className={`analytics-period-btn ${period === '30d' ? 'active' : ''}`}
              onClick={() => setPeriod('30d')}
            >
              30 Days
            </button>
            <button
              type="button"
              className={`analytics-period-btn ${period === '2026' ? 'active' : ''}`}
              onClick={() => setPeriod('2026')}
            >
              Year 2026 (Live)
            </button>
          </div>

          <div className="analytics-live-tag">
            <span className="analytics-pulse-dot"></span>
            <span>LIVE TELEMETRY</span>
          </div>
        </div>
      </div>

      {/* 2. 2x2 GRAPHS & CHARTS GRID */}
      <div className="analytics-charts-grid">

        {/* ------------------------------------------------------------- */}
        {/* CHART 1: REVENUE & FREIGHT VOLUME AREA GRAPH */}
        {/* ------------------------------------------------------------- */}
        <div className="analytics-card">
          <div className="analytics-card-head">
            <div>
              <h3>
                <span>📈</span> Freight Revenue &amp; Volume Trajectory
              </h3>
              <div className="analytics-card-sub">Interactive 12-Month Pan-India Corridors Curve</div>
            </div>

            <div className="analytics-card-tabs">
              <button
                type="button"
                className={`analytics-tab-btn ${graphMetric === 'revenue' ? 'active' : ''}`}
                onClick={() => setGraphMetric('revenue')}
              >
                ₹ Revenue
              </button>
              <button
                type="button"
                className={`analytics-tab-btn ${graphMetric === 'consignments' ? 'active' : ''}`}
                onClick={() => setGraphMetric('consignments')}
              >
                📦 Bilties
              </button>
              <button
                type="button"
                className={`analytics-tab-btn ${graphMetric === 'tonnage' ? 'active' : ''}`}
                onClick={() => setGraphMetric('tonnage')}
              >
                ⚖️ Tonnage (MT)
              </button>
            </div>
          </div>

          {/* DYNAMIC HOVER TOOLTIP */}
          {activeMonthData && (
            <div className="graph-tooltip-box">
              <span>🗓️ {activeMonthData.month} 2026</span>
              <strong>
                {graphMetric === 'revenue'
                  ? `₹${activeMonthData.revenueLakhs} Lakhs Gross`
                  : graphMetric === 'consignments'
                  ? `${activeMonthData.consignments.toLocaleString('en-IN')} Bilties`
                  : `${activeMonthData.tonnageMt.toLocaleString('en-IN')} Metric Tons`}
              </strong>
              <small style={{ color: '#94a3b8' }}>
                ₹{activeMonthData.revenueLakhs}L • {activeMonthData.consignments} Bookings • {activeMonthData.tonnageMt} MT
              </small>
            </div>
          )}

          {/* SVG AREA GRAPH */}
          <div className="analytics-graph-container">
            <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="analytics-graph-svg">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>

              {/* Background horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, gIdx) => {
                const y = padTop + ratio * (graphHeight - padTop - padBottom);
                const labelVal = Math.round(maxVal - ratio * (maxVal - minVal));
                return (
                  <g key={gIdx}>
                    <line x1={padLeft} y1={y} x2={graphWidth - padRight} y2={y} className="graph-grid-line" />
                    <text x={padLeft - 8} y={y + 4} textAnchor="end" className="graph-axis-label">
                      {graphMetric === 'revenue' ? `₹${labelVal}L` : labelVal.toLocaleString()}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={areaPath} fill="url(#areaGradient)" />

              {/* Stroke line */}
              <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />

              {/* X Axis month labels and interactive points */}
              {points.map((pt, pIdx) => {
                const isActive = hoveredMonthIdx === pIdx;
                return (
                  <g key={pIdx}>
                    <text
                      x={pt.x}
                      y={graphHeight - 12}
                      textAnchor="middle"
                      className="graph-axis-label"
                      style={{ fontWeight: isActive ? 800 : 600, fill: isActive ? '#0284c7' : undefined }}
                    >
                      {pt.month}
                    </text>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? 6 : 4}
                      fill={isActive ? '#38bdf8' : '#0284c7'}
                      stroke={isActive ? '#ffffff' : 'transparent'}
                      strokeWidth={isActive ? 2.5 : 0}
                      className={`graph-data-point ${isActive ? 'active' : ''}`}
                      onMouseEnter={() => setHoveredMonthIdx(pIdx)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="graph-metrics-strip">
            <div className="strip-item">
              <small>Peak Month Revenue</small>
              <strong>₹46.2 L (Oct 2026)</strong>
            </div>
            <div className="strip-item">
              <small>Average Dispatch Speed</small>
              <strong style={{ color: '#10b981' }}>98.4% On-Time SLA</strong>
            </div>
            <div className="strip-item">
              <small>Annual Dispatched Tonnage</small>
              <strong style={{ color: '#0284c7' }}>53,390 MT Dispatched</strong>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CHART 2: CARGO CATEGORY FREIGHT PIE / DONUT CHART */}
        {/* ------------------------------------------------------------- */}
        <div className="analytics-card">
          <div className="analytics-card-head">
            <div>
              <h3>
                <span>🥧</span> Freight Category Distribution
              </h3>
              <div className="analytics-card-sub">Volume and revenue share across vehicle segments</div>
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.25)' }}>
              1,284 Active Shipments
            </span>
          </div>

          <div className="pie-chart-content-wrap">
            {/* SVG DONUT CHART */}
            <div className="pie-svg-container">
              <svg viewBox="0 0 160 160" className="pie-svg">
                {(() => {
                  let accumulatedPct = 0;
                  const circumference = 2 * Math.PI * 50; // radius = 50

                  return CARGO_CATEGORIES.map((cat, cIdx) => {
                    const strokeDasharray = `${((cat.pct / 100) * circumference) - 2} ${circumference}`;
                    const strokeDashoffset = -((accumulatedPct / 100) * circumference);
                    accumulatedPct += cat.pct;
                    const isHovered = hoveredCategoryIdx === cIdx;

                    return (
                      <circle
                        key={cIdx}
                        cx="80"
                        cy="80"
                        r="50"
                        stroke={cat.color}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className={`pie-segment-path ${isHovered ? 'active' : ''}`}
                        onMouseEnter={() => setHoveredCategoryIdx(cIdx)}
                        onMouseLeave={() => setHoveredCategoryIdx(null)}
                      />
                    );
                  });
                })()}
              </svg>

              <div className="pie-center-badge">
                <span className="pie-center-sup">
                  {hoveredCategoryIdx !== null ? 'SELECTED' : 'TOTAL'}
                </span>
                <strong>
                  {hoveredCategoryIdx !== null ? `${CARGO_CATEGORIES[hoveredCategoryIdx].pct}%` : '1,284'}
                </strong>
                <small title={hoveredCategoryIdx !== null ? CARGO_CATEGORIES[hoveredCategoryIdx].name : 'Active Bilties'}>
                  {hoveredCategoryIdx !== null ? CARGO_CATEGORIES[hoveredCategoryIdx].name : 'Active Bilties'}
                </small>
              </div>
            </div>

            {/* INTERACTIVE LEGEND LIST */}
            <div className="pie-legend-list">
              {CARGO_CATEGORIES.map((cat, cIdx) => {
                const isHovered = hoveredCategoryIdx === cIdx;
                return (
                  <div
                    key={cIdx}
                    className={`pie-legend-row ${isHovered ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredCategoryIdx(cIdx)}
                    onMouseLeave={() => setHoveredCategoryIdx(null)}
                  >
                    <div className="pie-legend-left">
                      <span className="pie-legend-dot" style={{ background: cat.color }}></span>
                      <div className="pie-legend-text">
                        <span className="pie-legend-title">{cat.name}</span>
                        <span className="pie-legend-sub">{cat.sub}</span>
                      </div>
                    </div>
                    <div className="pie-legend-right">
                      <span className="pie-legend-val">{cat.revenue}</span>
                      <span className="pie-legend-pct" style={{ background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}40` }}>
                        {cat.pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="graph-metrics-strip" style={{ marginTop: 'auto' }}>
            <div className="strip-item">
              <small>Top Category Share</small>
              <strong style={{ color: '#0284c7' }}>Heavy FTL (38%)</strong>
            </div>
            <div className="strip-item">
              <small>Cumulative Revenue</small>
              <strong style={{ color: '#10b981' }}>₹4.24 Cr Invoiced</strong>
            </div>
            <div className="strip-item">
              <small>Active Consignments</small>
              <strong style={{ color: '#f59e0b' }}>1,284 Bilties</strong>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CHART 3: PAN-INDIA CORRIDOR TRANSIT PERFORMANCE (BAR GRAPH) */}
        {/* ------------------------------------------------------------- */}
        <div className="analytics-card">
          <div className="analytics-card-head">
            <div>
              <h3>
                <span>🛣️</span> National Freight Corridor Speed &amp; SLA
              </h3>
              <div className="analytics-card-sub">Golden Quadrilateral corridor efficiency and Fastag toll density</div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
              ✓ 98.1% Network SLA
            </span>
          </div>

          <div className="corridor-list-container">
            {CORRIDOR_PERFORMANCE.map((cor, crIdx) => (
              <div key={crIdx} className="corridor-row">
                <div className="corridor-header">
                  <span className="corridor-name">
                    <span>📍</span> {cor.corridor}
                  </span>
                  <span className="corridor-meta">
                    <strong>{cor.trips} Trips</strong> • Avg {cor.avgSpeed}
                  </span>
                </div>

                <div className="corridor-bar-track">
                  <div
                    className="corridor-bar-fill"
                    style={{
                      width: `${cor.slaPct}%`,
                      background: `linear-gradient(90deg, ${cor.color} 0%, #38bdf8 100%)`
                    }}
                  />
                </div>

                <div className="corridor-footer-meta">
                  <span>{cor.km} KM Interstate Distance</span>
                  <span>Fastag NHAI Toll: <strong>{cor.toll}</strong></span>
                  <span style={{ color: cor.slaPct >= 98 ? '#10b981' : '#f59e0b', fontWeight: 800 }}>
                    {cor.slaPct}% On-Time
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CHART 4: FLEET REAL-TIME OPERATIONAL ASSET STATUS (PIE/DONUT) */}
        {/* ------------------------------------------------------------- */}
        <div className="analytics-card">
          <div className="analytics-card-head">
            <div>
              <h3>
                <span>🚛</span> Real-Time Fleet Operational Health
              </h3>
              <div className="analytics-card-sub">Active highway dispatch, dock inward turnaround, and yard readiness</div>
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.25)' }}>
              245 Heavy Trucks
            </span>
          </div>

          <div className="pie-chart-content-wrap">
            {/* SVG DONUT CHART */}
            <div className="pie-svg-container">
              <svg viewBox="0 0 160 160" className="pie-svg">
                {(() => {
                  let accumulatedPct = 0;
                  const circumference = 2 * Math.PI * 50;

                  return FLEET_STATUS_BREAKDOWN.map((item, fIdx) => {
                    const strokeDasharray = `${((item.pct / 100) * circumference) - 2} ${circumference}`;
                    const strokeDashoffset = -((accumulatedPct / 100) * circumference);
                    accumulatedPct += item.pct;
                    const isHovered = hoveredFleetIdx === fIdx;

                    return (
                      <circle
                        key={fIdx}
                        cx="80"
                        cy="80"
                        r="50"
                        stroke={item.color}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className={`pie-segment-path ${isHovered ? 'active' : ''}`}
                        onMouseEnter={() => setHoveredFleetIdx(fIdx)}
                        onMouseLeave={() => setHoveredFleetIdx(null)}
                      />
                    );
                  });
                })()}
              </svg>

              <div className="pie-center-badge">
                <span className="pie-center-sup">
                  {hoveredFleetIdx !== null ? 'FLEET SHARE' : 'TOTAL FLEET'}
                </span>
                <strong>
                  {hoveredFleetIdx !== null ? FLEET_STATUS_BREAKDOWN[hoveredFleetIdx].count : '245'}
                </strong>
                <small title={hoveredFleetIdx !== null ? `${FLEET_STATUS_BREAKDOWN[hoveredFleetIdx].pct}% • ${FLEET_STATUS_BREAKDOWN[hoveredFleetIdx].label}` : 'Heavy Trucks'}>
                  {hoveredFleetIdx !== null ? `${FLEET_STATUS_BREAKDOWN[hoveredFleetIdx].pct}% • ${FLEET_STATUS_BREAKDOWN[hoveredFleetIdx].label}` : 'Heavy Trucks'}
                </small>
              </div>
            </div>

            {/* LEGEND LIST */}
            <div className="pie-legend-list">
              {FLEET_STATUS_BREAKDOWN.map((item, fIdx) => {
                const isHovered = hoveredFleetIdx === fIdx;
                return (
                  <div
                    key={fIdx}
                    className={`pie-legend-row ${isHovered ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredFleetIdx(fIdx)}
                    onMouseLeave={() => setHoveredFleetIdx(null)}
                  >
                    <div className="pie-legend-left">
                      <span className="pie-legend-dot" style={{ background: item.color }}></span>
                      <div className="pie-legend-text">
                        <span className="pie-legend-title">{item.label}</span>
                        <span className="pie-legend-sub">{item.sub}</span>
                      </div>
                    </div>
                    <div className="pie-legend-right">
                      <span className="pie-legend-val">{item.count} Trucks</span>
                      <span className="pie-legend-pct" style={{ background: `${item.color}20`, color: item.color, border: `1px solid ${item.color}40` }}>
                        {item.pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LIVE SEGMENTED FLEET HEALTH PROGRESS BAR */}
          <div className="fleet-live-progress-wrap">
            <div className="fleet-segmented-bar">
              {FLEET_STATUS_BREAKDOWN.map((item, idx) => (
                <div
                  key={idx}
                  className="fleet-bar-segment"
                  style={{
                    width: `${item.pct}%`,
                    background: item.color,
                  }}
                  title={`${item.label}: ${item.count} trucks (${item.pct}%)`}
                />
              ))}
            </div>
            <div className="fleet-quick-pills">
              {FLEET_STATUS_BREAKDOWN.map((item, idx) => (
                <span
                  key={idx}
                  className={`fleet-quick-pill ${hoveredFleetIdx === idx ? 'active' : ''}`}
                  style={{
                    color: item.color,
                    background: `${item.color}15`,
                    borderColor: `${item.color}35`,
                  }}
                  onMouseEnter={() => setHoveredFleetIdx(idx)}
                  onMouseLeave={() => setHoveredFleetIdx(null)}
                >
                  <span className="pill-dot" style={{ background: item.color }} />
                  {item.count} {item.label.split(' ')[0]} ({item.pct}%)
                </span>
              ))}
            </div>
          </div>

          <div className="graph-metrics-strip" style={{ marginTop: 'auto' }}>
            <div className="strip-item">
              <small>Fleet Utilization Ratio</small>
              <strong style={{ color: '#10b981' }}>88.2% Active Utilization</strong>
            </div>
            <div className="strip-item">
              <small>Average Turnaround Time</small>
              <strong>68 Mins Loading TAT</strong>
            </div>
            <div className="strip-item">
              <small>AIS-140 GPS Compliance</small>
              <strong style={{ color: '#0284c7' }}>100% MoRTH Connected</strong>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
