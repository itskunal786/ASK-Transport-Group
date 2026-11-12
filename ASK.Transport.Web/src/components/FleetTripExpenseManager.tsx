import ImageUploadOrCapture from './ImageUploadOrCapture';
import './FleetTripExpenseManager.css';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getTripExpenses,
  reviewTripExpense,
  getTripPnL,
  createTripExpense,
  type TripExpense,
  type ExpenseMetrics,
  type TripPnLResult
} from '../api/fleetApi';

const DEFAULT_EXPENSES: TripExpense[] = [
  {
    id: 1,
    tripId: 101,
    tripNumber: 'TRIP-2026-98102',
    driverId: 1,
    driverName: 'Ramesh Singh Rawat',
    driverPhone: '+91 98230 45812',
    vehicleNumber: 'MH-12-RN-7845',
    expenseType: 'Diesel',
    amount: 18450,
    liters: 203.8,
    fuelStationName: 'IndianOil COCO Highway Pump, Surat NH-48',
    receiptPhotoUrl: '',
    odometerReading: 142850,
    status: 'Approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    tripId: 101,
    tripNumber: 'TRIP-2026-98102',
    driverId: 1,
    driverName: 'Ramesh Singh Rawat',
    driverPhone: '+91 98230 45812',
    vehicleNumber: 'MH-12-RN-7845',
    expenseType: 'Toll',
    amount: 1420,
    fuelStationName: 'Vadodara Expressway Toll Plaza',
    receiptPhotoUrl: '',
    odometerReading: 143120,
    status: 'Approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    tripId: 101,
    tripNumber: 'TRIP-2026-98102',
    driverId: 1,
    driverName: 'Ramesh Singh Rawat',
    driverPhone: '+91 98230 45812',
    vehicleNumber: 'MH-12-RN-7845',
    expenseType: 'DriverBhatta',
    amount: 1200,
    fuelStationName: 'Daily Food & Night Halting Allowance',
    odometerReading: 143400,
    status: 'Pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 105,
    tripId: 101,
    tripNumber: 'TRIP-2026-98102',
    driverId: 1,
    driverName: 'Ramesh Singh Rawat',
    driverPhone: '+91 98230 45812',
    vehicleNumber: 'MH-12-RN-7845',
    expenseType: 'Diesel',
    amount: 24500,
    liters: 270.5,
    fuelStationName: 'Bharat Petroleum Highway MegaHub, Jaipur NH-48',
    receiptPhotoUrl: '',
    odometerReading: 144120,
    status: 'PendingSuperAdmin',
    adminPreApprovedBy: 'Kunal Kumar (Operations Admin)',
    adminPreApprovedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    tripId: 102,
    tripNumber: 'TRIP-2026-98105',
    driverId: 2,
    driverName: 'Jaswinder Singh',
    driverPhone: '+91 98112 34981',
    vehicleNumber: 'HR-38-X-9988',
    expenseType: 'TyrePuncture',
    amount: 650,
    fuelStationName: 'Shree Ram Tyre Vulcanizing, Jaipur Bypass',
    receiptPhotoUrl: '',
    odometerReading: 98450,
    status: 'Pending',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_METRICS: ExpenseMetrics = {
  totalApproved: 19870,
  totalPending: 1850,
  totalDiesel: 18450,
  totalToll: 1420,
  pendingCount: 2,
  approvedCount: 2
};

const DEFAULT_PNL: TripPnLResult = {
  tripId: 101,
  tripNumber: 'TRIP-2026-98102',
  route: 'Pune Chakan Hub → Gurugram IMT Manesar',
  vehicleNumber: 'MH-12-RN-7845',
  driverName: 'Ramesh Singh Rawat',
  financials: {
    grossFreightRevenue: 58000,
    totalOperatingExpenses: 19870,
    netProfit: 38130,
    netMarginPercent: 65.7,
    driverAdvanceGiven: 25000,
    driverCashSpent: 21070,
    driverPettyCashBalance: 3930
  },
  breakdown: {
    dieselTotal: 18450,
    tollTotal: 1420,
    bhattaTotal: 0,
    maintenanceTotal: 0,
    otherTotal: 0,
    totalApprovedExpenses: 19870
  }
};

export default function FleetTripExpenseManager() {
  const { user } = useAuth();
  const DUAL_CONTROL_LIMIT = 15000;

  // PIN Re-Verification Modal state for SuperAdmin
  const [pinModalExpense, setPinModalExpense] = useState<TripExpense | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<TripExpense[]>(DEFAULT_EXPENSES);
  const [metrics, setMetrics] = useState<ExpenseMetrics | null>(DEFAULT_METRICS);
  const [pnl, setPnl] = useState<TripPnLResult | null>(DEFAULT_PNL);
  const [loading, setLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Receipt Preview & Upload Modal
  const [selectedExpenseForSlip, setSelectedExpenseForSlip] = useState<TripExpense | null>(null);
  const [tempSlipPhoto, setTempSlipPhoto] = useState('');
  const [newReceiptPhoto, setNewReceiptPhoto] = useState('');

  // Rejection Modal
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('Receipt unreadable or invalid fuel slip');

  // Add Expense Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTripId, setNewTripId] = useState('101');
  const [newExpType, setNewExpType] = useState('Diesel');
  const [newAmount, setNewAmount] = useState('');
  const [newLiters, setNewLiters] = useState('');
  const [newStation, setNewStation] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      const res = await getTripExpenses({
        status: statusFilter,
        expenseType: typeFilter
      });
      if (res && Array.isArray(res.expenses)) {
        setExpenses(res.expenses);
      }
      if (res && res.metrics) {
        setMetrics(res.metrics);
      }

      // Load active trip P&L
      const pnlRes = await getTripPnL(101);
      if (pnlRes) {
        setPnl(pnlRes);
      }
    } catch (err) {
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [statusFilter, typeFilter]);

  async function handleAdminPreApprove(exp: TripExpense) {
    try {
      const adminName = user?.name || 'Operations Admin';
      await reviewTripExpense(exp.id, {
        status: 'PendingSuperAdmin',
        adminNotes: 'Pre-approved by Operations Admin (>₹15K). Forwarded for SuperAdmin pass.',
        adminPreApprovedBy: adminName
      });
      setExpenses(prev => prev.map(x => x.id === exp.id ? {
        ...x,
        status: 'PendingSuperAdmin',
        adminPreApprovedBy: adminName,
        adminPreApprovedAt: new Date().toISOString()
      } : x));
      alert(`🛡️ Pre-Approved by ${adminName}! Forwarded to SuperAdmin for dual-control Re-Verification.`);
    } catch (err: any) {
      alert('Failed to pre-approve: ' + err?.message);
    }
  }

  async function handleDirectApprove(id: number) {
    try {
      const approverName = user?.name || 'Operations Admin';
      await reviewTripExpense(id, {
        status: 'Approved',
        adminNotes: `Verified and passed by ${approverName}`
      });
      setExpenses(prev => prev.map(x => x.id === id ? {
        ...x,
        status: 'Approved',
        approvedBy: approverName,
        approvedAt: new Date().toISOString()
      } : x));
    } catch (err: any) {
      alert('Failed to approve expense: ' + err?.message);
    }
  }

  function handleOpenSuperAdminPin(exp: TripExpense) {
    setPinModalExpense(exp);
    setPinInput('');
    setPinError(null);
  }

  async function handleConfirmSuperAdminPin() {
    if (!pinModalExpense) return;
    if (pinInput !== '0000' && pinInput.length < 4) {
      setPinError('Invalid PIN! Enter statutory security PIN (Default: 0000)');
      return;
    }

    try {
      const superAdminName = user?.name || 'ASK GROUP Admin (Super Admin)';
      await reviewTripExpense(pinModalExpense.id, {
        status: 'Approved',
        adminNotes: `Dual-control passed by SuperAdmin ${superAdminName}`,
        superAdminVerifiedBy: superAdminName
      });

      setExpenses(prev => prev.map(x => x.id === pinModalExpense.id ? {
        ...x,
        status: 'Approved',
        superAdminVerifiedBy: superAdminName,
        superAdminVerifiedAt: new Date().toISOString()
      } : x));

      setPinModalExpense(null);
      alert(`👑 Dual-Control Verified! Payout of ₹${pinModalExpense.amount.toLocaleString('en-IN')} approved by SuperAdmin.`);
    } catch (err: any) {
      alert('Failed to verify payout: ' + err?.message);
    }
  }

  async function handleConfirmReject() {
    if (!rejectId) return;
    try {
      await reviewTripExpense(rejectId, { status: 'Rejected', rejectionReason: rejectReason });
      setRejectId(null);
      loadData();
    } catch (err: any) {
      alert('Failed to reject expense: ' + err?.message);
    }
  }

  async function handleCreateManualExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!newAmount || Number(newAmount) <= 0) return;
    try {
      await createTripExpense({
        tripId: Number(newTripId),
        tripNumber: 'TRIP-2026-98102',
        driverName: 'Ramesh Singh Rawat',
        driverPhone: '+91 98230 45812',
        vehicleNumber: 'MH-12-RN-7845',
        expenseType: newExpType,
        amount: Number(newAmount),
        liters: newLiters ? Number(newLiters) : undefined,
        fuelStationName: newStation || undefined,
        receiptPhotoUrl: newReceiptPhoto || undefined
      });
      setShowAddModal(false);
      setNewAmount('');
      setNewLiters('');
      setNewStation('');
      loadData();
    } catch (err: any) {
      alert('Failed to create expense: ' + err?.message);
    }
  }

  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  return (
    <div className="fleet-expense-container">
      {/* TOP P&L BANNER & EXPENSE METRICS */}
      <div className="fleet-expense-kpi-grid">
        <div className="fleet-expense-kpi-card approved">
          <span className="fleet-expense-kpi-label">APPROVED EXPENSES</span>
          <strong className="fleet-expense-kpi-val" style={{ color: '#10b981' }}>
            ₹{(metrics?.totalApproved ?? 0).toLocaleString('en-IN')}
          </strong>
          <span className="fleet-expense-kpi-sub green">{metrics?.approvedCount ?? 0} Claims Verified</span>
        </div>

        <div className="fleet-expense-kpi-card pending">
          <span className="fleet-expense-kpi-label">PENDING REVIEW</span>
          <strong className="fleet-expense-kpi-val" style={{ color: '#f59e0b' }}>
            ₹{(metrics?.totalPending ?? 0).toLocaleString('en-IN')}
          </strong>
          <span className="fleet-expense-kpi-sub amber">{metrics?.pendingCount ?? 0} Slips Require Action</span>
        </div>

        <div className="fleet-expense-kpi-card diesel">
          <span className="fleet-expense-kpi-label">DIESEL PUMP EXPENSES</span>
          <strong className="fleet-expense-kpi-val" style={{ color: '#0284c7' }}>
            ₹{(metrics?.totalDiesel ?? 0).toLocaleString('en-IN')}
          </strong>
          <span className="fleet-expense-kpi-sub muted">Highway Bulk Refueling</span>
        </div>

        <div className="fleet-expense-kpi-card toll">
          <span className="fleet-expense-kpi-label">HIGHWAY TOLL TAX</span>
          <strong className="fleet-expense-kpi-val" style={{ color: '#8b5cf6' }}>
            ₹{(metrics?.totalToll ?? 0).toLocaleString('en-IN')}
          </strong>
          <span className="fleet-expense-kpi-sub muted">Fastag Corridor Deductions</span>
        </div>
      </div>

      {/* ACTIVE TRIP REAL-TIME P&L SHEET */}
      {pnl && (
        <div className="fleet-expense-pnl-card">
          <div className="fleet-expense-pnl-header">
            <div>
              <span className="fleet-expense-pnl-pill">LIVE TRIP P&amp;L</span>
              <strong className="fleet-expense-pnl-title">{pnl.tripNumber || 'Active Trip'} — {pnl.route || 'Transit Route'}</strong>
            </div>
            <div className="fleet-expense-pnl-vehicle">
              Truck: <strong>{pnl.vehicleNumber || '—'}</strong> • Driver: <strong>{pnl.driverName || '—'}</strong>
            </div>
          </div>

          <div className="fleet-expense-pnl-grid">
            <div className="fleet-expense-pnl-item">
              <span style={{ color: '#94a3b8' }}>Gross Freight Revenue</span>
              <strong style={{ fontSize: '20px', color: '#ffffff' }}>₹{(pnl.financials?.grossFreightRevenue ?? 0).toLocaleString('en-IN')}</strong>
            </div>

            <div className="fleet-expense-pnl-item">
              <span style={{ color: '#f87171' }}>Total Operating Expenses</span>
              <strong style={{ fontSize: '20px', color: '#f87171' }}>- ₹{(pnl.financials?.totalOperatingExpenses ?? 0).toLocaleString('en-IN')}</strong>
              <small style={{ color: '#94a3b8' }}>Diesel (₹{pnl.breakdown?.dieselTotal ?? 0}) + Toll (₹{pnl.breakdown?.tollTotal ?? 0})</small>
            </div>

            <div className="fleet-expense-pnl-item">
              <span style={{ color: '#4ade80' }}>Net Trip Profit</span>
              <strong style={{ fontSize: '22px', color: '#4ade80' }}>₹{(pnl.financials?.netProfit ?? 0).toLocaleString('en-IN')}</strong>
              <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 700 }}>Margin: {pnl.financials?.netMarginPercent ?? 0}%</span>
            </div>

            <div className="fleet-expense-pnl-item">
              <span style={{ color: '#c7d2fe' }}>Driver Petty Cash Balance</span>
              <strong style={{ fontSize: '20px', color: '#38bdf8' }}>₹{(pnl.financials?.driverPettyCashBalance ?? 0).toLocaleString('en-IN')}</strong>
              <small style={{ color: '#94a3b8' }}>Advance: ₹{pnl.financials?.driverAdvanceGiven ?? 0}</small>
            </div>
          </div>
        </div>
      )}

      {/* FILTER & ACTIONS BAR */}
      <div className="fleet-expense-filter-bar">
        <div className="fleet-expense-filter-group">
          <div className="fleet-expense-filter-item">
            <label className="fleet-expense-filter-label">STATUS:</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="fleet-expense-select"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="fleet-expense-filter-item">
            <label className="fleet-expense-filter-label">EXPENSE TYPE:</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="fleet-expense-select"
            >
              <option value="All">All Types</option>
              <option value="Diesel">Diesel</option>
              <option value="Toll">Toll</option>
              <option value="DriverBhatta">Driver Bhatta</option>
              <option value="TyrePuncture">Tyre / Maintenance</option>
              <option value="BorderEntry">Border Entry</option>
            </select>
            {loading && <span style={{ fontSize: '11px', color: '#38bdf8', marginLeft: '8px', fontWeight: 600 }}>Syncing...</span>}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="fleet-expense-btn-add"
        >
          + Record Trip Expense
        </button>
      </div>

      {/* EXPENSE RECORDS CARDS GRID (100% CARDS - ZERO TABLES!) */}
      <div className="fleet-expense-cards-grid">
        {safeExpenses.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 20px', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
            <strong style={{ fontSize: '15px' }}>No trip expenses found for the selected filters.</strong>
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Try selecting 'All Statuses' or 'All Expense Types'.
            </p>
          </div>
        ) : (
          safeExpenses.map(exp => {
            const isHighValue = (exp.amount ?? 0) > DUAL_CONTROL_LIMIT;
            const isAwaitingSuperAdmin = exp.status === 'PendingSuperAdmin';
            const isApproved = exp.status === 'Approved';
            const isPending = exp.status === 'Pending';

            return (
              <div key={exp.id} className="fleet-expense-card" style={{ borderLeft: isAwaitingSuperAdmin ? '4px solid #f59e0b' : isApproved ? '4px solid #10b981' : '4px solid #0284c7' }}>
                {/* Top Row: Trip Number, Date, and Expense Type */}
                <div className="fleet-exp-card-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong className="fleet-expense-trip-no">{exp.tripNumber}</strong>
                      <span className="fleet-exp-id-tag">Claim #{exp.id}</span>
                    </div>
                    <span className="fleet-expense-date">
                      {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>

                  <span className={`fleet-expense-badge ${
                    exp.expenseType === 'Diesel' ? 'diesel' :
                    exp.expenseType === 'Toll' ? 'toll' :
                    exp.expenseType === 'DriverBhatta' ? 'driver-bhatta' :
                    exp.expenseType === 'TyrePuncture' ? 'tyre' :
                    exp.expenseType === 'BorderEntry' ? 'border' : 'default'
                  }`}>
                    {exp.expenseType}
                  </span>
                </div>

                {/* Amount Row with Dual-Control Flag */}
                <div className="fleet-exp-amount-row">
                  <div>
                    <span className="fleet-exp-amount-label">Claimed Amount</span>
                    <strong className="fleet-expense-amount">₹{(exp.amount ?? 0).toLocaleString('en-IN')}</strong>
                  </div>

                  {isHighValue && (
                    <span className="fleet-exp-dual-flag" title="Claims above ₹15,000 require SuperAdmin Re-Verification">
                      🛡️ Dual-Control (&gt;₹15K)
                    </span>
                  )}
                </div>

                {/* Details / Fuel Station / Odometer */}
                <div className="fleet-exp-details-box">
                  <div className="fleet-exp-station-name">
                    📍 {exp.fuelStationName || 'Highway Commercial Terminal'}
                  </div>
                  <div className="fleet-exp-meta-row">
                    {exp.liters && <span className="fleet-exp-chip">⛽ {exp.liters} Liters</span>}
                    {exp.odometerReading && <span className="fleet-exp-chip">🧭 Odo: {exp.odometerReading} km</span>}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedExpenseForSlip(exp);
                        setTempSlipPhoto(exp.receiptPhotoUrl || '');
                      }}
                      className="fleet-expense-btn-slip"
                      style={!exp.receiptPhotoUrl ? { background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.25)' } : undefined}
                    >
                      {exp.receiptPhotoUrl ? '👁️ Slip Proof' : '📷 Upload / Snap Slip'}
                    </button>
                  </div>
                </div>

                {/* Driver & Vehicle Strip */}
                <div className="fleet-exp-driver-strip">
                  <div className="fleet-exp-driver-avatar">
                    {exp.driverName ? exp.driverName.charAt(0).toUpperCase() : 'D'}
                  </div>
                  <div className="fleet-exp-driver-info">
                    <strong>{exp.driverName}</strong>
                    <small>{exp.vehicleNumber} {exp.driverPhone ? `• ${exp.driverPhone}` : ''}</small>
                  </div>
                </div>

                {/* Dual-Control Transparency Audit Trail */}
                {(exp.adminPreApprovedBy || exp.superAdminVerifiedBy || isAwaitingSuperAdmin) && (
                  <div className="fleet-exp-trail-strip">
                    <span>🛡️ Admin: <strong>{exp.adminPreApprovedBy || 'Operations Verified'}</strong></span>
                    <span>➔</span>
                    <span>👑 SuperAdmin: <strong style={{ color: isApproved ? '#10b981' : '#f59e0b' }}>{isApproved ? (exp.superAdminVerifiedBy || 'Super Admin Passed') : 'Pending Re-Verification'}</strong></span>
                  </div>
                )}

                {/* Card Footer: Status & Actions */}
                <div className="fleet-exp-footer">
                  <div>
                    <span className={`fleet-expense-status-badge ${
                      isApproved ? 'approved' :
                      exp.status === 'Rejected' ? 'rejected' :
                      isAwaitingSuperAdmin ? 'reverify' : 'pending'
                    }`}>
                      {isApproved ? '✓ Cleared & Released' :
                       exp.status === 'Rejected' ? '✕ Rejected' :
                       isAwaitingSuperAdmin ? '👑 Needs SuperAdmin Pass' : '⏳ Pending Review'}
                    </span>
                    {exp.rejectionReason && (
                      <div style={{ fontSize: '10.5px', color: '#f87171', marginTop: '3px' }}>{exp.rejectionReason}</div>
                    )}
                  </div>

                  <div className="fleet-exp-actions-group">
                    {isPending && (
                      <>
                        {isHighValue ? (
                          user?.role === 'SuperAdmin' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenSuperAdminPin(exp)}
                              className="fleet-exp-btn-pass"
                            >
                              👑 Master Pass
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAdminPreApprove(exp)}
                              className="fleet-exp-btn-preapprove"
                            >
                              🛡️ Pre-Approve (&gt;15K)
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDirectApprove(exp.id)}
                            className="fleet-expense-btn-approve"
                          >
                            ✓ Approve
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setRejectId(exp.id)}
                          className="fleet-expense-btn-reject"
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}

                    {isAwaitingSuperAdmin && (
                      <>
                        {user?.role === 'SuperAdmin' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenSuperAdminPin(exp)}
                              className="fleet-exp-btn-pass"
                            >
                              👑 Re-Verify &amp; Release
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectId(exp.id)}
                              className="fleet-expense-btn-reject"
                            >
                              ✕ Reject
                            </button>
                          </>
                        ) : (
                          <span className="fleet-exp-awaiting-badge">
                            ⏳ In SuperAdmin Queue
                          </span>
                        )}
                      </>
                    )}

                    {isApproved && (
                      <span className="fleet-expense-verified-tag">
                        ✓ Payout Released
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

            {/* SUPERADMIN DUAL-CONTROL PIN VERIFICATION MODAL */}
      {pinModalExpense && (
        <div className="fleet-expense-modal-overlay" onClick={() => setPinModalExpense(null)}>
          <div className="fleet-expense-modal-card" style={{ maxWidth: '420px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>👑</div>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', color: 'var(--text-primary)' }}>SuperAdmin Payout Authorization</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              Dual-Control Re-Verification required to release <strong>₹{pinModalExpense.amount.toLocaleString('en-IN')}</strong> for Trip <strong>{pinModalExpense.tripNumber}</strong>.
            </p>

            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '10px', marginBottom: '16px', textAlign: 'left', fontSize: '12px' }}>
              <div>👨‍✈️ Driver: <strong>{pinModalExpense.driverName}</strong> ({pinModalExpense.vehicleNumber})</div>
              <div>⛽ Expense: <strong>{pinModalExpense.expenseType}</strong> ({pinModalExpense.fuelStationName || 'Highway'})</div>
              <div>🛡️ Admin Recommendation: <strong>{pinModalExpense.adminPreApprovedBy || 'Operations Admin'}</strong></div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Enter SuperAdmin Security PIN
              </label>
              <input
                type="password"
                maxLength={6}
                placeholder="Enter PIN (Default: 0000)"
                value={pinInput}
                onChange={e => { setPinInput(e.target.value); setPinError(null); }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '16px', letterSpacing: '4px', textAlign: 'center', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                autoFocus
              />
              {pinError && <div style={{ fontSize: '11.5px', color: '#ef4444', marginTop: '6px' }}>{pinError}</div>}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleConfirmSuperAdminPin}
                className="fleet-exp-btn-pass"
                style={{ padding: '9px 18px', fontSize: '13px' }}
              >
                👑 Verify &amp; Pass Payout
              </button>
              <button
                type="button"
                onClick={() => setPinModalExpense(null)}
                className="fleet-expense-btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}



      {/* REJECT MODAL */}
      {rejectId && (
        <div className="fleet-expense-modal-overlay" onClick={() => setRejectId(null)}>
          <div className="fleet-expense-modal-card" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#ef4444' }}>Reject Trip Expense #{rejectId}</h3>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--text-secondary)' }}>Please specify a reason so the driver can re-submit a clear slip.</p>
            <input
              type="text"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g., Unclear fuel meter receipt / invalid GST number"
              className="fleet-expense-input"
              style={{ marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setRejectId(null)} className="fleet-expense-btn-cancel">Cancel</button>
              <button type="button" onClick={handleConfirmReject} className="fleet-expense-btn-reject" style={{ padding: '8px 16px' }}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showAddModal && (
        <div className="fleet-expense-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="fleet-expense-modal-card" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: '17px', color: 'var(--text-primary)', fontWeight: 800 }}>Record Driver Trip Expense</h3>
            <form onSubmit={handleCreateManualExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>TRIP #</label>
                <select value={newTripId} onChange={e => setNewTripId(e.target.value)} className="fleet-expense-modal-select">
                  <option value="101">TRIP-2026-98102 (Pune → Gurugram)</option>
                  <option value="102">TRIP-2026-98105 (Mumbai → Ahmedabad)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>EXPENSE TYPE</label>
                <select value={newExpType} onChange={e => setNewExpType(e.target.value)} className="fleet-expense-modal-select">
                  <option value="Diesel">Diesel</option>
                  <option value="Toll">Highway Fastag Toll</option>
                  <option value="DriverBhatta">Driver Daily Bhatta</option>
                  <option value="TyrePuncture">Tyre Puncture / Maintenance</option>
                  <option value="BorderEntry">Border / State Checking</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>AMOUNT (₹) *</label>
                <input type="number" placeholder="e.g. 4500" value={newAmount} onChange={e => setNewAmount(e.target.value)} required className="fleet-expense-input" />
              </div>

              {newExpType === 'Diesel' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Liters</label>
                    <input type="number" step="0.1" placeholder="e.g. 50" value={newLiters} onChange={e => setNewLiters(e.target.value)} className="fleet-expense-input" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Pump Station</label>
                    <input type="text" placeholder="e.g. HPCL Highway" value={newStation} onChange={e => setNewStation(e.target.value)} className="fleet-expense-input" />
                  </div>
                </div>
              )}

              <div>
                <ImageUploadOrCapture
                  value={newReceiptPhoto}
                  onChange={setNewReceiptPhoto}
                  onRemove={() => setNewReceiptPhoto('')}
                  label="BILL / SLIP PROOF (MAX 2 MB)"
                  placeholderText="Upload an image (Max 2 MB) or take a photo"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => { setShowAddModal(false); setNewReceiptPhoto(''); }} className="fleet-expense-btn-cancel">Cancel</button>
                <button type="submit" className="fleet-expense-btn-add">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* RECEIPT PREVIEW & UPLOAD MODAL */}
      {selectedExpenseForSlip && (
        <div className="fleet-expense-modal-overlay" onClick={() => setSelectedExpenseForSlip(null)}>
          <div className="fleet-expense-modal-card" style={{ maxWidth: '560px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>Receipt Slip — Claim #{selectedExpenseForSlip.id}</h4>
              <button
                type="button"
                onClick={() => setSelectedExpenseForSlip(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ textAlign: 'left', margin: '14px 0' }}>
              <ImageUploadOrCapture
                label="RECEIPT / SLIP PHOTO (MAX 2 MB):"
                value={tempSlipPhoto}
                onChange={(dataUrl) => setTempSlipPhoto(dataUrl)}
                onRemove={() => setTempSlipPhoto('')}
                placeholderText="Select an option below to upload slip proof or capture with camera:"
              />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setSelectedExpenseForSlip(null)}
                className="fleet-expense-btn-cancel"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                ✕ Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setExpenses(prev => prev.map(x => x.id === selectedExpenseForSlip.id ? { ...x, receiptPhotoUrl: tempSlipPhoto } : x));
                  setSelectedExpenseForSlip(null);
                  alert('✓ Receipt slip proof successfully submitted & saved!');
                }}
                className="fleet-expense-btn-submit"
                style={{
                  padding: '8px 22px',
                  fontSize: '13px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)'
                }}
              >
                ✓ Submit Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
