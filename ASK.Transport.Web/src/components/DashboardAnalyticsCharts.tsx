import { useState, useMemo } from 'react';
import './DashboardAnalyticsCharts.css';

interface DataPoint {
  month: string;
  revenueLakhs: number;
  consignments: number;
  tonnageMt: number;
}

const DATA_7_DAYS: DataPoint[] = [
  { month: '29 Oct', revenueLakhs: 1.45, consignments: 38, tonnageMt: 165 },
  { month: '30 Oct', revenueLakhs: 1.62, consignments: 42, tonnageMt: 182 },
  { month: '31 Oct', revenueLakhs: 1.88, consignments: 49, tonnageMt: 215 },
  { month: '01 Nov', revenueLakhs: 1.54, consignments: 39, tonnageMt: 172 },
  { month: '02 Nov', revenueLakhs: 2.10, consignments: 54, tonnageMt: 238 },
  { month: '03 Nov', revenueLakhs: 1.95, consignments: 51, tonnageMt: 224 },
  { month: '04 Nov', revenueLakhs: 1.78, consignments: 46, tonnageMt: 198 }
];

const DATA_30_DAYS: DataPoint[] = [
  { month: '05 Oct', revenueLakhs: 7.4, consignments: 195, tonnageMt: 820 },
  { month: '11 Oct', revenueLakhs: 8.8, consignments: 228, tonnageMt: 960 },
  { month: '17 Oct', revenueLakhs: 9.6, consignments: 252, tonnageMt: 1080 },
  { month: '23 Oct', revenueLakhs: 8.9, consignments: 236, tonnageMt: 990 },
  { month: '29 Oct', revenueLakhs: 10.4, consignments: 275, tonnageMt: 1180 },
  { month: '04 Nov', revenueLakhs: 9.8, consignments: 258, tonnageMt: 1110 }
];

const YEAR_2026_DATA: DataPoint[] = [
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

interface PeriodConfig {
  curveSubtitle: string;
  peakLabel: string;
  peakValue: string;
  speedLabel: string;
  speedValue: string;
  tonnageLabel: string;
  tonnageValue: string;
  activeShipmentsBadge: string;
  centerDefaultCount: string;
  centerDefaultLabel: string;
  networkSlaBadge: string;
  fleetBadge: string;
  fleetCenterDefaultCount: string;
  fleetCenterDefaultLabel: string;
  fleetStripUtil: string;
  fleetStripTat: string;
  fleetStripGps: string;
}

const PERIOD_CONFIG: Record<'7d' | '30d' | '2026', PeriodConfig> = {
  '7d': {
    curveSubtitle: 'Interactive 7-Day Velocity Curve (29 Oct – 04 Nov)',
    peakLabel: 'Peak Day Revenue',
    peakValue: '₹2.10 L (02 Nov)',
    speedLabel: 'Average Dispatch Speed',
    speedValue: '99.2% On-Time SLA',
    tonnageLabel: '7-Day Dispatched Tonnage',
    tonnageValue: '1,394 MT Dispatched',
    activeShipmentsBadge: '294 Active Bilties',
    centerDefaultCount: '294',
    centerDefaultLabel: '7-Day Bilties',
    networkSlaBadge: '✓ 99.1% 7-Day SLA',
    fleetBadge: '245 Monitored Vehicles',
    fleetCenterDefaultCount: '192',
    fleetCenterDefaultLabel: '7D Active Trips',
    fleetStripUtil: '91.4% 7D Fleet Utilization',
    fleetStripTat: '58 Mins Loading TAT',
    fleetStripGps: '100% MoRTH Connected'
  },
  '30d': {
    curveSubtitle: 'Interactive 30-Day Velocity Curve (05 Oct – 04 Nov)',
    peakLabel: 'Peak Week Revenue',
    peakValue: '₹10.4 L (W4 Oct)',
    speedLabel: 'Average Dispatch Speed',
    speedValue: '98.8% On-Time SLA',
    tonnageLabel: '30-Day Dispatched Tonnage',
    tonnageValue: '6,140 MT Dispatched',
    activeShipmentsBadge: '1,284 Active Shipments',
    centerDefaultCount: '1,284',
    centerDefaultLabel: '30-Day Bilties',
    networkSlaBadge: '✓ 98.1% Network SLA',
    fleetBadge: '245 Commercial Units',
    fleetCenterDefaultCount: '184',
    fleetCenterDefaultLabel: 'On Highway',
    fleetStripUtil: '88.2% Active Utilization',
    fleetStripTat: '68 Mins Loading TAT',
    fleetStripGps: '100% MoRTH Connected'
  },
  '2026': {
    curveSubtitle: 'Interactive 12-Month Pan-India Corridors Curve',
    peakLabel: 'Peak Month Revenue',
    peakValue: '₹46.2 L (Oct 2026)',
    speedLabel: 'Average Dispatch Speed',
    speedValue: '98.4% On-Time SLA',
    tonnageLabel: 'Annual Dispatched Tonnage',
    tonnageValue: '53,390 MT Dispatched',
    activeShipmentsBadge: '13,440 Total Bilties',
    centerDefaultCount: '13,440',
    centerDefaultLabel: 'Annual Bilties',
    networkSlaBadge: '✓ 97.8% Annual SLA',
    fleetBadge: '245 Heavy Trucks',
    fleetCenterDefaultCount: '184',
    fleetCenterDefaultLabel: 'Avg Active Units',
    fleetStripUtil: '89.6% Annual Utilization',
    fleetStripTat: '64 Mins Loading TAT',
    fleetStripGps: '100% MoRTH Connected'
  }
};

interface CargoCategory {
  name: string;
  pct: number;
  count: number;
  revenue: string;
  color: string;
}

const CARGO_CATEGORIES_BY_PERIOD: Record<'7d' | '30d' | '2026', CargoCategory[]> = {
  '7d': [
    { name: 'Heavy FTL Freight (32ft Multi-Axle)', pct: 38, count: 112, revenue: '₹38.2 L', color: '#0284c7' },
    { name: 'PTL Express Parcel & LTL', pct: 27, count: 79, revenue: '₹26.4 L', color: '#10b981' },
    { name: 'Reefer Cold-Chain & Pharma', pct: 18, count: 53, revenue: '₹17.8 L', color: '#f59e0b' },
    { name: 'Automotive Parts & Machinery', pct: 12, count: 35, revenue: '₹11.6 L', color: '#8b5cf6' },
    { name: 'ODC & Project Consignments', pct: 5, count: 15, revenue: '₹4.9 L', color: '#ec4899' }
  ],
  '30d': [
    { name: 'Heavy FTL Freight (32ft Multi-Axle)', pct: 38, count: 488, revenue: '₹1.61 Cr', color: '#0284c7' },
    { name: 'PTL Express Parcel & LTL', pct: 27, count: 346, revenue: '₹1.14 Cr', color: '#10b981' },
    { name: 'Reefer Cold-Chain & Pharma', pct: 18, count: 231, revenue: '₹76.5 L', color: '#f59e0b' },
    { name: 'Automotive Parts & Machinery', pct: 12, count: 154, revenue: '₹51.0 L', color: '#8b5cf6' },
    { name: 'ODC & Project Consignments', pct: 5, count: 65, revenue: '₹21.2 L', color: '#ec4899' }
  ],
  '2026': [
    { name: 'Heavy FTL Freight (32ft Multi-Axle)', pct: 38, count: 5107, revenue: '₹16.8 Cr', color: '#0284c7' },
    { name: 'PTL Express Parcel & LTL', pct: 27, count: 3628, revenue: '₹11.9 Cr', color: '#10b981' },
    { name: 'Reefer Cold-Chain & Pharma', pct: 18, count: 2419, revenue: '₹8.0 Cr', color: '#f59e0b' },
    { name: 'Automotive Parts & Machinery', pct: 12, count: 1613, revenue: '₹5.3 Cr', color: '#8b5cf6' },
    { name: 'ODC & Project Consignments', pct: 5, count: 673, revenue: '₹2.2 Cr', color: '#ec4899' }
  ]
};

interface CorridorStat {
  corridor: string;
  km: number;
  slaPct: number;
  avgSpeed: string;
  toll: string;
  trips: number;
  color: string;
}

const CORRIDOR_PERFORMANCE_BY_PERIOD: Record<'7d' | '30d' | '2026', CorridorStat[]> = {
  '7d': [
    {
      corridor: 'NH-48 (Delhi NCR ⟷ Mumbai Freightway)',
      km: 1420,
      slaPct: 99.4,
      avgSpeed: '47 km/h',
      toll: '₹2,840',
      trips: 92,
      color: '#0284c7'
    },
    {
      corridor: 'NH-44 (Delhi NCR ⟷ Bengaluru Tech Line)',
      km: 2150,
      slaPct: 98.2,
      avgSpeed: '44 km/h',
      toll: '₹4,150',
      trips: 74,
      color: '#10b981'
    },
    {
      corridor: 'NH-19 (Delhi NCR ⟷ Kolkata Eastern Trunk)',
      km: 1530,
      slaPct: 98.9,
      avgSpeed: '45 km/h',
      toll: '₹3,120',
      trips: 63,
      color: '#f59e0b'
    },
    {
      corridor: 'NH-65 (Pune ⟷ Hyderabad Industrial Route)',
      km: 860,
      slaPct: 99.6,
      avgSpeed: '48 km/h',
      toll: '₹1,680',
      trips: 44,
      color: '#8b5cf6'
    },
    {
      corridor: 'NH-16 (Chennai ⟷ Visakhapatnam Coastal Corridor)',
      km: 800,
      slaPct: 99.1,
      avgSpeed: '46 km/h',
      toll: '₹1,550',
      trips: 37,
      color: '#06b6d4'
    }
  ],
  '30d': [
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
  ],
  '2026': [
    {
      corridor: 'NH-48 (Delhi NCR ⟷ Mumbai Freightway)',
      km: 1420,
      slaPct: 98.0,
      avgSpeed: '44 km/h',
      toll: '₹2,840',
      trips: 4850,
      color: '#0284c7'
    },
    {
      corridor: 'NH-44 (Delhi NCR ⟷ Bengaluru Tech Line)',
      km: 2150,
      slaPct: 96.5,
      avgSpeed: '41 km/h',
      toll: '₹4,150',
      trips: 3910,
      color: '#10b981'
    },
    {
      corridor: 'NH-19 (Delhi NCR ⟷ Kolkata Eastern Trunk)',
      km: 1530,
      slaPct: 97.0,
      avgSpeed: '42 km/h',
      toll: '₹3,120',
      trips: 3340,
      color: '#f59e0b'
    },
    {
      corridor: 'NH-65 (Pune ⟷ Hyderabad Industrial Route)',
      km: 860,
      slaPct: 98.8,
      avgSpeed: '45 km/h',
      toll: '₹1,680',
      trips: 2280,
      color: '#8b5cf6'
    },
    {
      corridor: 'NH-16 (Chennai ⟷ Visakhapatnam Coastal Corridor)',
      km: 800,
      slaPct: 98.2,
      avgSpeed: '43 km/h',
      toll: '₹1,550',
      trips: 1980,
      color: '#06b6d4'
    }
  ]
};

interface FleetStatus {
  label: string;
  count: number;
  pct: number;
  color: string;
}

const FLEET_STATUS_BY_PERIOD: Record<'7d' | '30d' | '2026', FleetStatus[]> = {
  '7d': [
    { label: 'Active In-Transit on Highways', count: 192, pct: 78.4, color: '#10b981' },
    { label: 'Dock Inward / Hub Loading', count: 28, pct: 11.4, color: '#0284c7' },
    { label: 'Yard Staging / Ready for Booking', count: 16, pct: 6.5, color: '#f59e0b' },
    { label: 'Workshop Scheduled Maintenance', count: 9, pct: 3.7, color: '#ef4444' }
  ],
  '30d': [
    { label: 'Active In-Transit on Highways', count: 184, pct: 75.1, color: '#10b981' },
    { label: 'Dock Inward / Hub Loading', count: 32, pct: 13.1, color: '#0284c7' },
    { label: 'Yard Staging / Ready for Booking', count: 18, pct: 7.3, color: '#f59e0b' },
    { label: 'Workshop Scheduled Maintenance', count: 11, pct: 4.5, color: '#ef4444' }
  ],
  '2026': [
    { label: 'Active In-Transit on Highways', count: 184, pct: 75.1, color: '#10b981' },
    { label: 'Dock Inward / Hub Loading', count: 32, pct: 13.1, color: '#0284c7' },
    { label: 'Yard Staging / Ready for Booking', count: 18, pct: 7.3, color: '#f59e0b' },
    { label: 'Workshop Scheduled Maintenance', count: 11, pct: 4.5, color: '#ef4444' }
  ]
};

export default function DashboardAnalyticsCharts() {
  const [period, setPeriod] = useState<'7d' | '30d' | '2026'>('2026');
  const [graphMetric, setGraphMetric] = useState<'revenue' | 'consignments' | 'tonnage'>('revenue');
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [hoveredCategoryIdx, setHoveredCategoryIdx] = useState<number | null>(null);
  const [hoveredFleetIdx, setHoveredFleetIdx] = useState<number | null>(null);

  // Active dataset and configs according to selected period
  const activeDataset: DataPoint[] = useMemo(() => {
    if (period === '7d') return DATA_7_DAYS;
    if (period === '30d') return DATA_30_DAYS;
    return YEAR_2026_DATA;
  }, [period]);

  const periodConfig = PERIOD_CONFIG[period];
  const currentCategories = CARGO_CATEGORIES_BY_PERIOD[period];
  const currentCorridors = CORRIDOR_PERFORMANCE_BY_PERIOD[period];
  const currentFleet = FLEET_STATUS_BY_PERIOD[period];

  const handlePeriodChange = (newPeriod: '7d' | '30d' | '2026') => {
    setPeriod(newPeriod);
    setHoveredPointIdx(null); // Defaults to the latest point of selected timeframe
    setHoveredCategoryIdx(null);
    setHoveredFleetIdx(null);
  };

  // SVG Chart Geometry calculations
  const graphWidth = 620;
  const graphHeight = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;

  const currentValues = useMemo(() => {
    return activeDataset.map(d => {
      if (graphMetric === 'revenue') return d.revenueLakhs;
      if (graphMetric === 'consignments') return d.consignments;
      return d.tonnageMt;
    });
  }, [activeDataset, graphMetric]);

  const minVal = 0;
  const maxVal = useMemo(() => {
    const rawMax = Math.max(...currentValues, 1);
    if (rawMax <= 3) return 2.6;
    return Math.ceil(rawMax * 1.18);
  }, [currentValues]);

  const points = useMemo(() => {
    const usableWidth = graphWidth - padLeft - padRight;
    const usableHeight = graphHeight - padTop - padBottom;
    const stepX = activeDataset.length > 1 ? usableWidth / (activeDataset.length - 1) : usableWidth;

    return currentValues.map((val, idx) => {
      const x = padLeft + idx * stepX;
      const y = padTop + (1 - (val - minVal) / (maxVal - minVal || 1)) * usableHeight;
      return { x, y, val, month: activeDataset[idx].month };
    });
  }, [currentValues, maxVal, minVal, activeDataset]);

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

  // Hovered active point data (defaults to the latest item in timeframe)
  const activePoint = useMemo(() => {
    if (hoveredPointIdx !== null && activeDataset[hoveredPointIdx]) {
      return activeDataset[hoveredPointIdx];
    }
    return activeDataset[activeDataset.length - 1];
  }, [hoveredPointIdx, activeDataset]);

  const activePointIndex = hoveredPointIdx !== null ? hoveredPointIdx : activeDataset.length - 1;

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
              onClick={() => handlePeriodChange('7d')}
            >
              7 Days
            </button>
            <button
              type="button"
              className={`analytics-period-btn ${period === '30d' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('30d')}
            >
              30 Days
            </button>
            <button
              type="button"
              className={`analytics-period-btn ${period === '2026' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('2026')}
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
              <div className="analytics-card-sub">{periodConfig.curveSubtitle}</div>
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
          {activePoint && (
            <div className="graph-tooltip-box">
              <span>🗓️ {activePoint.month} {period === '2026' ? '2026' : '(Trailing 2026)'}</span>
              <strong>
                {graphMetric === 'revenue'
                  ? `₹${activePoint.revenueLakhs} Lakhs Gross`
                  : graphMetric === 'consignments'
                  ? `${activePoint.consignments.toLocaleString('en-IN')} Bilties`
                  : `${activePoint.tonnageMt.toLocaleString('en-IN')} Metric Tons`}
              </strong>
              <small style={{ color: '#94a3b8' }}>
                ₹{activePoint.revenueLakhs}L • {activePoint.consignments.toLocaleString('en-IN')} Bookings • {activePoint.tonnageMt.toLocaleString('en-IN')} MT
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
                const rawVal = maxVal - ratio * (maxVal - minVal);
                let labelText = '';
                if (graphMetric === 'revenue') {
                  labelText = maxVal <= 6 ? `₹${rawVal.toFixed(1)}L` : `₹${Math.round(rawVal)}L`;
                } else {
                  labelText = Math.round(rawVal).toLocaleString('en-IN');
                }
                return (
                  <g key={gIdx}>
                    <line x1={padLeft} y1={y} x2={graphWidth - padRight} y2={y} className="graph-grid-line" />
                    <text x={padLeft - 8} y={y + 4} textAnchor="end" className="graph-axis-label">
                      {labelText}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={areaPath} fill="url(#areaGradient)" />

              {/* Stroke line */}
              <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />

              {/* X Axis labels and interactive points */}
              {points.map((pt, pIdx) => {
                const isActive = activePointIndex === pIdx;
                return (
                  <g key={`${period}-${pIdx}`}>
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
                      onMouseEnter={() => setHoveredPointIdx(pIdx)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="graph-metrics-strip">
            <div className="strip-item">
              <small>{periodConfig.peakLabel}</small>
              <strong>{periodConfig.peakValue}</strong>
            </div>
            <div className="strip-item">
              <small>{periodConfig.speedLabel}</small>
              <strong style={{ color: '#10b981' }}>{periodConfig.speedValue}</strong>
            </div>
            <div className="strip-item">
              <small>{periodConfig.tonnageLabel}</small>
              <strong style={{ color: '#0284c7' }}>{periodConfig.tonnageValue}</strong>
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
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>
              {periodConfig.activeShipmentsBadge}
            </span>
          </div>

          <div className="pie-chart-content-wrap">
            {/* SVG DONUT CHART */}
            <div className="pie-svg-container">
              <svg viewBox="0 0 160 160" className="pie-svg">
                {(() => {
                  let accumulatedPct = 0;
                  const circumference = 2 * Math.PI * 50; // radius = 50

                  return currentCategories.map((cat, cIdx) => {
                    const strokeDasharray = `${(cat.pct / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((accumulatedPct / 100) * circumference);
                    accumulatedPct += cat.pct;
                    const isHovered = hoveredCategoryIdx === cIdx;

                    return (
                      <circle
                        key={`${period}-cat-${cIdx}`}
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
                <strong>
                  {hoveredCategoryIdx !== null
                    ? `${currentCategories[hoveredCategoryIdx].pct}%`
                    : periodConfig.centerDefaultCount}
                </strong>
                <small>
                  {hoveredCategoryIdx !== null
                    ? currentCategories[hoveredCategoryIdx].name.split(' ')[0]
                    : periodConfig.centerDefaultLabel}
                </small>
              </div>
            </div>

            {/* INTERACTIVE LEGEND LIST */}
            <div className="pie-legend-list">
              {currentCategories.map((cat, cIdx) => {
                const isHovered = hoveredCategoryIdx === cIdx;
                return (
                  <div
                    key={`${period}-legend-${cIdx}`}
                    className={`pie-legend-row ${isHovered ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredCategoryIdx(cIdx)}
                    onMouseLeave={() => setHoveredCategoryIdx(null)}
                  >
                    <div className="pie-legend-left">
                      <span className="pie-legend-dot" style={{ background: cat.color }}></span>
                      <span className="pie-legend-label" title={cat.name}>{cat.name}</span>
                    </div>
                    <div className="pie-legend-right">
                      <span className="pie-legend-val">{cat.revenue}</span>
                      <span className="pie-legend-pct" style={{ background: `${cat.color}22`, color: cat.color }}>
                        {cat.pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
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
              {periodConfig.networkSlaBadge}
            </span>
          </div>

          <div className="corridor-list-container">
            {currentCorridors.map((cor, crIdx) => (
              <div key={`${period}-cor-${crIdx}`} className="corridor-row">
                <div className="corridor-header">
                  <span className="corridor-name">
                    <span>📍</span> {cor.corridor}
                  </span>
                  <span className="corridor-meta">
                    <strong>{cor.trips.toLocaleString('en-IN')} Trips</strong> • Avg {cor.avgSpeed}
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
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0284c7' }}>
              {periodConfig.fleetBadge}
            </span>
          </div>

          <div className="pie-chart-content-wrap">
            {/* SVG DONUT CHART */}
            <div className="pie-svg-container">
              <svg viewBox="0 0 160 160" className="pie-svg">
                {(() => {
                  let accumulatedPct = 0;
                  const circumference = 2 * Math.PI * 50;

                  return currentFleet.map((item, fIdx) => {
                    const strokeDasharray = `${(item.pct / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((accumulatedPct / 100) * circumference);
                    accumulatedPct += item.pct;
                    const isHovered = hoveredFleetIdx === fIdx;

                    return (
                      <circle
                        key={`${period}-fleet-${fIdx}`}
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
                <strong>
                  {hoveredFleetIdx !== null
                    ? currentFleet[hoveredFleetIdx].count
                    : periodConfig.fleetCenterDefaultCount}
                </strong>
                <small>
                  {hoveredFleetIdx !== null ? 'Units' : periodConfig.fleetCenterDefaultLabel}
                </small>
              </div>
            </div>

            {/* LEGEND LIST */}
            <div className="pie-legend-list">
              {currentFleet.map((item, fIdx) => {
                const isHovered = hoveredFleetIdx === fIdx;
                return (
                  <div
                    key={`${period}-fleetleg-${fIdx}`}
                    className={`pie-legend-row ${isHovered ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredFleetIdx(fIdx)}
                    onMouseLeave={() => setHoveredFleetIdx(null)}
                  >
                    <div className="pie-legend-left">
                      <span className="pie-legend-dot" style={{ background: item.color }}></span>
                      <span className="pie-legend-label">{item.label}</span>
                    </div>
                    <div className="pie-legend-right">
                      <span className="pie-legend-val">{item.count} Trucks</span>
                      <span className="pie-legend-pct" style={{ background: `${item.color}22`, color: item.color }}>
                        {item.pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="graph-metrics-strip" style={{ marginTop: 'auto' }}>
            <div className="strip-item">
              <small>Fleet Utilization Ratio</small>
              <strong style={{ color: '#10b981' }}>{periodConfig.fleetStripUtil}</strong>
            </div>
            <div className="strip-item">
              <small>Average Turnaround Time</small>
              <strong>{periodConfig.fleetStripTat}</strong>
            </div>
            <div className="strip-item">
              <small>AIS-140 GPS Compliance</small>
              <strong style={{ color: '#0284c7' }}>{periodConfig.fleetStripGps}</strong>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
