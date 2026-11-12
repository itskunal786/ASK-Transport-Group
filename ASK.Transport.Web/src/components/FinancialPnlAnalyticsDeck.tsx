import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Fuel,
  Percent,
  Download,
  Printer,
  FileSpreadsheet,
  Building2,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import './FinancialPnlAnalyticsDeck.css';

interface FinancialPnlAnalyticsDeckProps {
  onExportPnl: () => void;
  onExportBookings: () => void;
  onExportRevenue: () => void;
  onExportDrivers: () => void;
  onExportVehicles: () => void;
  showToast: (msg: string) => void;
}

export const FinancialPnlAnalyticsDeck: React.FC<FinancialPnlAnalyticsDeckProps> = ({
  onExportPnl,
  onExportBookings,
  onExportRevenue,
  onExportDrivers,
  onExportVehicles,
  showToast
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'MTD' | 'Q2' | 'YTD'>('MTD');

  // Multipliers by period for realistic interactivity
  const periodMultiplier = selectedPeriod === 'MTD' ? 1.0 : selectedPeriod === 'Q2' ? 2.85 : 6.4;

  const turnover = Math.round(4250000 * periodMultiplier);
  const realized = Math.round(3680000 * periodMultiplier);
  const debtors = Math.round(570000 * periodMultiplier);
  const fleetCost = Math.round(1840000 * periodMultiplier);
  const ebitda = Math.round(1840000 * periodMultiplier);

  // 6-Month Turnover & EBITDA Trend
  const MONTHLY_TREND = [
    { month: 'May 26', turnoverLakh: 32.4, ebitdaLakh: 13.6, heightTurnover: 65, heightEbitda: 42 },
    { month: 'Jun 26', turnoverLakh: 34.8, ebitdaLakh: 14.9, heightTurnover: 70, heightEbitda: 46 },
    { month: 'Jul 26', turnoverLakh: 36.2, ebitdaLakh: 15.8, heightTurnover: 74, heightEbitda: 50 },
    { month: 'Aug 26', turnoverLakh: 38.5, ebitdaLakh: 16.7, heightTurnover: 80, heightEbitda: 54 },
    { month: 'Sep 26', turnoverLakh: 40.1, ebitdaLakh: 17.4, heightTurnover: 86, heightEbitda: 58 },
    { month: 'Oct 26 (Live)', turnoverLakh: 42.5, ebitdaLakh: 18.4, heightTurnover: 95, heightEbitda: 64 }
  ];

  const CORRIDORS = [
    { route: 'Delhi ↔ Mumbai', highway: 'NH-48 Golden Quadrilateral', mode: 'FTL 32ft MXL', billing: '₹58,900', margin: '₹28,400', marginPct: '48.2%', badge: 'super' },
    { route: 'Pune ↔ Hyderabad', highway: 'NH-65 Expressway Corridor', mode: 'Express PTL', billing: '₹28,800', margin: '₹12,800', marginPct: '44.5%', badge: 'high' },
    { route: 'Ahmedabad ↔ Surat', highway: 'NE-1 Industrial Surface', mode: 'Industrial 24ft', billing: '₹21,800', margin: '₹8,500', marginPct: '39.0%', badge: 'high' },
    { route: 'Chennai ↔ Bengaluru', highway: 'NH-48 Tech Freight Spine', mode: 'Short Haul PTL', billing: '₹16,800', margin: '₹6,200', marginPct: '36.8%', badge: 'high' },
    { route: 'Kolkata ↔ Patna', highway: 'NH-19 East Gateway', mode: '19ft Container', billing: '₹24,500', margin: '₹9,100', marginPct: '37.1%', badge: 'high' }
  ];

  return (
    <div className="pnl-deck-container">
      {/* 1. HERO HEADER BANNER */}
      <div className="pnl-hero">
        <div className="pnl-hero-left">
          <div className="pnl-hero-badge">
            <TrendingUp size={13} className="animate-pulse" />
            <span>Audited Statutory Financial &amp; P&amp;L Intelligence</span>
          </div>
          <h1 className="pnl-hero-title">
            <TrendingUp size={24} style={{ color: '#38bdf8' }} />
            <span>Financial &amp; P&amp;L Performance Analytics Deck</span>
          </h1>
          <p className="pnl-hero-desc">
            Consolidated commercial turnover, net cash realization, sundry debtor ageing, terminal hub revenue split, and corridor gross margins.
          </p>
        </div>

        <div className="pnl-hero-actions">
          {/* Period Selector Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.1)', padding: '4px', borderRadius: '10px', gap: '4px' }}>
            {[
              { id: 'MTD', label: 'Oct 2026 (MTD)' },
              { id: 'Q2', label: 'Q2 FY 2026' },
              { id: 'YTD', label: 'FY 2026-27 YTD' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedPeriod(tab.id as any);
                  showToast(`Switched view to ${tab.label}`);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  border: 'none',
                  background: selectedPeriod === tab.id ? '#0284c7' : 'transparent',
                  color: selectedPeriod === tab.id ? '#ffffff' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="pnl-btn-download"
            onClick={onExportPnl}
            title="Download Full Audited P&L Statement (CSV)"
          >
            <Download size={15} />
            <span>Download P&amp;L Statement (CSV)</span>
          </button>

          <button
            type="button"
            className="pnl-btn-print"
            onClick={() => window.print()}
            title="Print Executive Financial Summary"
          >
            <Printer size={15} />
            <span>Print Briefing</span>
          </button>
        </div>
      </div>

      {/* 2. FIVE-COLUMN BALANCED FINANCIAL KPI GRID */}
      <div className="pnl-kpi-grid-5">
        <div className="pnl-kpi-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="pnl-kpi-head">
            <span className="pnl-kpi-label">GROSS TURNOVER</span>
            <div className="pnl-kpi-icon-box" style={{ background: '#f0f9ff', color: '#0284c7' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className="pnl-kpi-amount" style={{ color: '#0284c7' }}>
            ₹{turnover.toLocaleString('en-IN')}
          </div>
          <div className="pnl-kpi-trend" style={{ color: '#10b981' }}>
            ↑ 14.8% vs last month
          </div>
          <div className="pnl-kpi-subtext">Target: ₹40.00L (106% Met)</div>
        </div>

        <div className="pnl-kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="pnl-kpi-head">
            <span className="pnl-kpi-label">CASH REALIZED</span>
            <div className="pnl-kpi-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="pnl-kpi-amount" style={{ color: '#10b981' }}>
            ₹{realized.toLocaleString('en-IN')}
          </div>
          <div className="pnl-kpi-trend" style={{ color: '#10b981' }}>
            86.5% Collection Rate
          </div>
          <div className="pnl-kpi-subtext">Avg Settlement: 14.2 Days</div>
        </div>

        <div className="pnl-kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="pnl-kpi-head">
            <span className="pnl-kpi-label">SUNDRY DEBTORS</span>
            <div className="pnl-kpi-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
              <CreditCard size={16} />
            </div>
          </div>
          <div className="pnl-kpi-amount" style={{ color: '#d97706' }}>
            ₹{debtors.toLocaleString('en-IN')}
          </div>
          <div className="pnl-kpi-trend" style={{ color: '#b45309' }}>
            13.5% Receivables (B2B 30-Day)
          </div>
          <div className="pnl-kpi-subtext">0 Accounts in Bad Debt / NPA</div>
        </div>

        <div className="pnl-kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="pnl-kpi-head">
            <span className="pnl-kpi-label">FLEET FUEL &amp; TOLL</span>
            <div className="pnl-kpi-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <Fuel size={16} />
            </div>
          </div>
          <div className="pnl-kpi-amount" style={{ color: '#7c3aed' }}>
            ₹{fleetCost.toLocaleString('en-IN')}
          </div>
          <div className="pnl-kpi-trend" style={{ color: '#6d28d9' }}>
            43.3% Cost of Operations
          </div>
          <div className="pnl-kpi-subtext">Diesel: ₹13.2L | Fastag: ₹5.2L</div>
        </div>

        <div className="pnl-kpi-card" style={{ borderLeft: '4px solid #059669' }}>
          <div className="pnl-kpi-head">
            <span className="pnl-kpi-label">EBITDA NET MARGIN</span>
            <div className="pnl-kpi-icon-box" style={{ background: '#dcfce7', color: '#059669' }}>
              <Percent size={16} />
            </div>
          </div>
          <div className="pnl-kpi-amount" style={{ color: '#059669' }}>
            ₹{ebitda.toLocaleString('en-IN')}
          </div>
          <div className="pnl-kpi-trend" style={{ color: '#059669' }}>
            43.2% Profit Margin
          </div>
          <div className="pnl-kpi-subtext">Healthy Post-Fuel Surplus</div>
        </div>
      </div>

      {/* 3. SIX-MONTH TURNOVER & EBITDA GROWTH BAR CHART */}
      <div className="pnl-chart-box">
        <div className="pnl-chart-header">
          <div>
            <h3 className="pnl-chart-title">
              <TrendingUp size={18} style={{ color: '#0284c7' }} />
              <span>Trailing 6-Month Gross Turnover &amp; Net Profit Progression</span>
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Revenue growth trajectory tracking steady compound margin expansion across all major corridors.
            </span>
          </div>

          <div className="pnl-chart-legend">
            <div className="pnl-legend-item">
              <span className="pnl-legend-dot" style={{ background: '#0284c7' }}></span>
              <span>Gross Turnover (₹ Lakhs)</span>
            </div>
            <div className="pnl-legend-item">
              <span className="pnl-legend-dot" style={{ background: '#10b981' }}></span>
              <span>EBITDA Net Profit (₹ Lakhs)</span>
            </div>
          </div>
        </div>

        <div className="pnl-bars-flex">
          {MONTHLY_TREND.map(item => (
            <div key={item.month} className="pnl-bar-col">
              <div className="pnl-bar-amt-tag">₹{item.turnoverLakh}L</div>
              <div className="pnl-bar-pair">
                <div
                  className="pnl-bar-pill rev"
                  style={{ height: `${item.heightTurnover}%` }}
                  title={`Turnover: ₹${item.turnoverLakh} Lakhs`}
                />
                <div
                  className="pnl-bar-pill ebitda"
                  style={{ height: `${item.heightEbitda}%` }}
                  title={`EBITDA Profit: ₹${item.ebitdaLakh} Lakhs`}
                />
              </div>
              <div className="pnl-bar-month">{item.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SPLIT GRID: PAN-INDIA HUBS & HIGH-MARGIN CORRIDORS */}
      <div className="pnl-split-grid">
        {/* Hub Revenue Share Card */}
        <div className="pnl-section-card">
          <h3 className="pnl-card-title">
            <Building2 size={18} style={{ color: '#0284c7' }} />
            <span>Pan-India Hub Revenue Distribution</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="pnl-hub-row">
              <div className="pnl-hub-head">
                <span>Delhi Central Hub (HUB-DEL-01)</span>
                <strong>₹{Math.round(1615000 * periodMultiplier).toLocaleString('en-IN')} (38%)</strong>
              </div>
              <div className="pnl-hub-track">
                <div className="pnl-hub-fill" style={{ width: '38%', background: '#0284c7' }} />
              </div>
            </div>

            <div className="pnl-hub-row">
              <div className="pnl-hub-head">
                <span>Mumbai JNPT Terminal (HUB-MUM-02)</span>
                <strong>₹{Math.round(1317500 * periodMultiplier).toLocaleString('en-IN')} (31%)</strong>
              </div>
              <div className="pnl-hub-track">
                <div className="pnl-hub-fill" style={{ width: '31%', background: '#10b981' }} />
              </div>
            </div>

            <div className="pnl-hub-row">
              <div className="pnl-hub-head">
                <span>Bengaluru Tech Cargo Park (HUB-BLR-03)</span>
                <strong>₹{Math.round(765000 * periodMultiplier).toLocaleString('en-IN')} (18%)</strong>
              </div>
              <div className="pnl-hub-track">
                <div className="pnl-hub-fill" style={{ width: '18%', background: '#f59e0b' }} />
              </div>
            </div>

            <div className="pnl-hub-row">
              <div className="pnl-hub-head">
                <span>Kolkata East Logistics Gateway (HUB-CCU-04)</span>
                <strong>₹{Math.round(552500 * periodMultiplier).toLocaleString('en-IN')} (13%)</strong>
              </div>
              <div className="pnl-hub-track">
                <div className="pnl-hub-fill" style={{ width: '13%', background: '#8b5cf6' }} />
              </div>
            </div>
          </div>
        </div>

        {/* High-Margin Corridors Table */}
        <div className="pnl-section-card">
          <h3 className="pnl-card-title">
            <MapPin size={18} style={{ color: '#059669' }} />
            <span>Top High-Margin Freight Corridors</span>
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="pnl-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Route Corridor</th>
                  <th style={{ textAlign: 'left' }}>Freight Mode</th>
                  <th style={{ textAlign: 'right' }}>Avg Trip Margin</th>
                  <th style={{ textAlign: 'right' }}>Margin %</th>
                </tr>
              </thead>
              <tbody>
                {CORRIDORS.map(c => (
                  <tr key={c.route}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{c.route}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>{c.highway}</div>
                    </td>
                    <td style={{ color: '#64748b', fontWeight: 600 }}>{c.mode}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                      {c.margin}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`pnl-margin-badge ${c.badge}`}>
                        {c.marginPct}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. DOWNLOADABLE DATA LEDGERS (4 COMPLIANCE CARDS) */}
      <div>
        <h3 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSpreadsheet size={18} style={{ color: '#0284c7' }} />
          <span>Export Structured Compliance Ledgers &amp; Statutory Reports</span>
        </h3>

        <div className="pnl-export-grid">
          <div className="pnl-export-card">
            <h4 className="pnl-export-title">
              <FileSpreadsheet size={16} style={{ color: '#0284c7' }} />
              <span>Bookings Ledger (CSV)</span>
            </h4>
            <p className="pnl-export-desc">
              Full consignment records, pickup/drop addresses, status, and client booking history.
            </p>
            <button
              type="button"
              className="pnl-export-btn"
              onClick={onExportBookings}
            >
              <Download size={13} />
              <span>Download Bookings CSV</span>
            </button>
          </div>

          <div className="pnl-export-card">
            <h4 className="pnl-export-title">
              <FileSpreadsheet size={16} style={{ color: '#10b981' }} />
              <span>Revenue &amp; GST Ledger (CSV)</span>
            </h4>
            <p className="pnl-export-desc">
              Monthly billing summary, freight revenue, and 18% SAC 9965 GST collected for tax filing.
            </p>
            <button
              type="button"
              className="pnl-export-btn"
              onClick={onExportRevenue}
            >
              <Download size={13} />
              <span>Download Revenue CSV</span>
            </button>
          </div>

          <div className="pnl-export-card">
            <h4 className="pnl-export-title">
              <FileSpreadsheet size={16} style={{ color: '#d97706' }} />
              <span>Fleet &amp; Drivers Report (CSV)</span>
            </h4>
            <p className="pnl-export-desc">
              Verified commercial drivers, Aadhaar/DL verification numbers, and active truck assignments.
            </p>
            <button
              type="button"
              className="pnl-export-btn"
              onClick={onExportDrivers}
            >
              <Download size={13} />
              <span>Download Drivers CSV</span>
            </button>
          </div>

          <div className="pnl-export-card">
            <h4 className="pnl-export-title">
              <FileSpreadsheet size={16} style={{ color: '#7c3aed' }} />
              <span>Vehicle Registry (CSV)</span>
            </h4>
            <p className="pnl-export-desc">
              Active commercial vehicles, RC fitness, National Permit validity, and fuel levels.
            </p>
            <button
              type="button"
              className="pnl-export-btn"
              onClick={onExportVehicles}
            >
              <Download size={13} />
              <span>Download Vehicles CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialPnlAnalyticsDeck;
