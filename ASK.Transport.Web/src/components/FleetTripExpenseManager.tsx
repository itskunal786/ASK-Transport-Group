import './FleetTripExpenseManager.css';
import { useEffect, useState } from 'react';
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
    receiptPhotoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400',
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
    receiptPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
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
    receiptPhotoUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400',
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
  const [expenses, setExpenses] = useState<TripExpense[]>(DEFAULT_EXPENSES);
  const [metrics, setMetrics] = useState<ExpenseMetrics | null>(DEFAULT_METRICS);
  const [pnl, setPnl] = useState<TripPnLResult | null>(DEFAULT_PNL);
  const [loading, setLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Receipt Preview Modal
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

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

  async function handleApprove(id: number) {
    try {
      await reviewTripExpense(id, { status: 'Approved', adminNotes: 'Verified with fuel card POS slip' });
      loadData();
    } catch (err: any) {
      alert('Failed to approve expense: ' + err?.message);
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
        receiptPhotoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400'
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

      {/* EXPENSE RECORDS TABLE */}
      <div className="fleet-expense-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="fleet-expense-table">
            <thead>
              <tr>
                <th>Trip #</th>
                <th>Driver &amp; Truck</th>
                <th>Type</th>
                <th>Details / Station</th>
                <th>Amount</th>
                <th>Slip / Receipt</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No trip expenses found for the selected filters.
                  </td>
                </tr>
              ) : (
                safeExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td>
                      <strong className="fleet-expense-trip-no">{exp.tripNumber}</strong>
                      <div className="fleet-expense-date">
                        {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td>
                      <strong className="fleet-expense-driver-name">{exp.driverName}</strong>
                      <div className="fleet-expense-truck-no">{exp.vehicleNumber}</div>
                    </td>
                    <td>
                      <span className={`fleet-expense-badge ${
                        exp.expenseType === 'Diesel' ? 'diesel' :
                        exp.expenseType === 'Toll' ? 'toll' :
                        exp.expenseType === 'DriverBhatta' ? 'driver-bhatta' :
                        exp.expenseType === 'TyrePuncture' ? 'tyre' :
                        exp.expenseType === 'BorderEntry' ? 'border' : 'default'
                      }`}>
                        {exp.expenseType}
                      </span>
                    </td>
                    <td>
                      <div className="fleet-expense-station-title">{exp.fuelStationName || 'Direct Highway Expense'}</div>
                      <div className="fleet-expense-station-meta">
                        {exp.liters && <span>{exp.liters} Liters</span>}
                        {exp.odometerReading && <span>{exp.liters ? ' • ' : ''}Odo: {exp.odometerReading} km</span>}
                      </div>
                    </td>
                    <td>
                      <strong className="fleet-expense-amount">₹{(exp.amount ?? 0).toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      {exp.receiptPhotoUrl ? (
                        <button
                          type="button"
                          onClick={() => setPreviewReceiptUrl(exp.receiptPhotoUrl!)}
                          className="fleet-expense-btn-slip"
                        >
                          👁️ View Slip
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No Slip</span>
                      )}
                    </td>
                    <td>
                      <span className={`fleet-expense-status-badge ${
                        exp.status === 'Approved' ? 'approved' :
                        exp.status === 'Rejected' ? 'rejected' : 'pending'
                      }`}>
                        {exp.status === 'Approved' ? '✓ Approved' : exp.status === 'Rejected' ? '✕ Rejected' : '⏳ Pending'}
                      </span>
                      {exp.rejectionReason && (
                        <div style={{ fontSize: '10.5px', color: '#f87171', marginTop: '3px' }}>{exp.rejectionReason}</div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {exp.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleApprove(exp.id)}
                            className="fleet-expense-btn-approve"
                          >
                            ✓ Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectId(exp.id)}
                            className="fleet-expense-btn-reject"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      ) : (
                        <span className="fleet-expense-verified-tag">
                          {exp.status === 'Approved' ? 'Verified by Admin' : 'Closed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT PREVIEW MODAL */}
      {previewReceiptUrl && (
        <div className="fleet-expense-modal-overlay" onClick={() => setPreviewReceiptUrl(null)}>
          <div className="fleet-expense-modal-card" style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: 'var(--text-primary)' }}>Diesel / Expense Slip Proof</h3>
            <img src={previewReceiptUrl} alt="Slip" style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '8px', background: '#000' }} />
            <button type="button" onClick={() => setPreviewReceiptUrl(null)} className="fleet-expense-btn-cancel" style={{ marginTop: '14px' }}>Close</button>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="fleet-expense-btn-cancel">Cancel</button>
                <button type="submit" className="fleet-expense-btn-add">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
