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

export default function FleetTripExpenseManager() {
  const [expenses, setExpenses] = useState<TripExpense[]>([]);
  const [metrics, setMetrics] = useState<ExpenseMetrics | null>(null);
  const [pnl, setPnl] = useState<TripPnLResult | null>(null);
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
      setExpenses(res?.expenses || []);
      setMetrics(res?.metrics || null);

      // Load active trip P&L
      const pnlRes = await getTripPnL(101);
      setPnl(pnlRes);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* TOP P&L BANNER & EXPENSE METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>APPROVED EXPENSES</span>
          <strong style={{ fontSize: '22px', color: '#0f172a', display: 'block', margin: '4px 0' }}>
            ₹{metrics?.totalApproved.toLocaleString('en-IN') || 0}
          </strong>
          <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>{metrics?.approvedCount || 0} Claims Verified</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>PENDING REVIEW</span>
          <strong style={{ fontSize: '22px', color: '#b45309', display: 'block', margin: '4px 0' }}>
            ₹{metrics?.totalPending.toLocaleString('en-IN') || 0}
          </strong>
          <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700 }}>{metrics?.pendingCount || 0} Slips Require Action</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #2563eb' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>DIESEL PUMP EXPENSES</span>
          <strong style={{ fontSize: '22px', color: '#2563eb', display: 'block', margin: '4px 0' }}>
            ₹{metrics?.totalDiesel.toLocaleString('en-IN') || 0}
          </strong>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Highway Bulk Refueling</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #7c3aed' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>HIGHWAY TOLL TAX</span>
          <strong style={{ fontSize: '22px', color: '#7c3aed', display: 'block', margin: '4px 0' }}>
            ₹{metrics?.totalToll.toLocaleString('en-IN') || 0}
          </strong>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Fastag Corridor Deductions</span>
        </div>
      </div>

      {/* ACTIVE TRIP REAL-TIME P&L SHEET */}
      {pnl && (
        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#ffffff', borderRadius: '14px', padding: '20px 24px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
            <div>
              <span style={{ padding: '3px 8px', background: '#38bdf8', color: '#0f172a', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>LIVE TRIP P&amp;L</span>
              <strong style={{ fontSize: '16px', marginLeft: '10px' }}>{pnl.tripNumber} — {pnl.route}</strong>
            </div>
            <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>
              Truck: <strong style={{ color: '#ffffff' }}>{pnl.vehicleNumber}</strong> • Driver: <strong style={{ color: '#ffffff' }}>{pnl.driverName}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Gross Freight Revenue</span>
              <strong style={{ fontSize: '20px', color: '#ffffff', display: 'block' }}>₹{pnl.financials.grossFreightRevenue.toLocaleString('en-IN')}</strong>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#f87171', textTransform: 'uppercase' }}>Total Operating Expenses</span>
              <strong style={{ fontSize: '20px', color: '#f87171', display: 'block' }}>- ₹{pnl.financials.totalOperatingExpenses.toLocaleString('en-IN')}</strong>
              <small style={{ fontSize: '11px', color: '#94a3b8' }}>Diesel (₹{pnl.breakdown.dieselTotal}) + Toll (₹{pnl.breakdown.tollTotal})</small>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#4ade80', textTransform: 'uppercase' }}>Net Trip Profit</span>
              <strong style={{ fontSize: '22px', color: '#4ade80', display: 'block' }}>₹{pnl.financials.netProfit.toLocaleString('en-IN')}</strong>
              <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 700 }}>Margin: {pnl.financials.netMarginPercent}%</span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#c7d2fe', textTransform: 'uppercase' }}>Driver Petty Cash Balance</span>
              <strong style={{ fontSize: '20px', color: '#38bdf8', display: 'block' }}>₹{pnl.financials.driverPettyCashBalance.toLocaleString('en-IN')}</strong>
              <small style={{ fontSize: '11px', color: '#94a3b8' }}>Advance: ₹{pnl.financials.driverAdvanceGiven}</small>
            </div>
          </div>
        </div>
      )}

      {/* FILTER & ACTIONS BAR */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginRight: '6px' }}>STATUS:</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginRight: '6px' }}>EXPENSE TYPE:</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="All">All Types</option>
              <option value="Diesel">Diesel</option>
              <option value="Toll">Toll</option>
              <option value="DriverBhatta">Driver Bhatta</option>
              <option value="TyrePuncture">Tyre / Maintenance</option>
              <option value="BorderEntry">Border Entry</option>
            </select>
            {loading && <span style={{ fontSize: '11px', color: '#6366f1', marginLeft: '8px', fontWeight: 600 }}>Syncing...</span>}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{ padding: '8px 16px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
        >
          + Record Trip Expense
        </button>
      </div>

      {/* EXPENSE RECORDS TABLE */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
              <th style={{ padding: '10px 14px' }}>Trip #</th>
              <th style={{ padding: '10px 14px' }}>Driver &amp; Truck</th>
              <th style={{ padding: '10px 14px' }}>Type</th>
              <th style={{ padding: '10px 14px' }}>Details / Station</th>
              <th style={{ padding: '10px 14px' }}>Amount</th>
              <th style={{ padding: '10px 14px' }}>Slip / Receipt</th>
              <th style={{ padding: '10px 14px' }}>Status</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(expenses || []).length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  No trip expenses found for the selected filters.
                </td>
              </tr>
            ) : (
              (expenses || []).map(exp => (
                <tr key={exp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <strong style={{ color: '#2563eb' }}>{exp.tripNumber}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(exp.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <strong>{exp.driverName}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{exp.vehicleNumber}</div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: exp.expenseType === 'Diesel' ? '#eff6ff' : exp.expenseType === 'Toll' ? '#fef3c7' : '#f1f5f9', color: exp.expenseType === 'Diesel' ? '#1d4ed8' : exp.expenseType === 'Toll' ? '#b45309' : '#334155' }}>
                      {exp.expenseType}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 600 }}>{exp.fuelStationName || 'Direct Highway Expense'}</div>
                    {exp.liters && <span style={{ fontSize: '11px', color: '#64748b' }}>{exp.liters} Liters</span>}
                    {exp.odometerReading && <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>• Odo: {exp.odometerReading} km</span>}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>₹{exp.amount.toLocaleString('en-IN')}</strong>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {exp.receiptPhotoUrl ? (
                      <button
                        type="button"
                        onClick={() => setPreviewReceiptUrl(exp.receiptPhotoUrl!)}
                        style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        👁️ View Slip
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>No Slip</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        background: exp.status === 'Approved' ? '#dcfce7' : exp.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                        color: exp.status === 'Approved' ? '#15803d' : exp.status === 'Rejected' ? '#b91c1c' : '#b45309'
                      }}
                    >
                      {exp.status === 'Approved' ? '✓ Approved' : exp.status === 'Rejected' ? '✕ Rejected' : '⏳ Pending'}
                    </span>
                    {exp.rejectionReason && (
                      <div style={{ fontSize: '10.5px', color: '#b91c1c', marginTop: '2px' }}>{exp.rejectionReason}</div>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    {exp.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleApprove(exp.id)}
                          style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 700, background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectId(exp.id)}
                          style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 700, background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
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

      {/* RECEIPT PREVIEW MODAL */}
      {previewReceiptUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setPreviewReceiptUrl(null)}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', maxWidth: '480px', width: '100%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 10px', fontSize: '15px' }}>Diesel / Expense Slip Proof</h3>
            <img src={previewReceiptUrl} alt="Slip" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }} />
            <button type="button" onClick={() => setPreviewReceiptUrl(null)} style={{ marginTop: '12px', padding: '6px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setRejectId(null)}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', maxWidth: '420px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#b91c1c' }}>Reject Trip Expense #{rejectId}</h3>
            <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>Please specify a reason so the driver can re-submit a clear slip.</p>
            <input
              type="text"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '14px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setRejectId(null)} style={{ padding: '6px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleConfirmReject} style={{ padding: '6px 14px', background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowAddModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '22px', maxWidth: '480px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: '#0f172a' }}>Record Driver Trip Expense</h3>
            <form onSubmit={handleCreateManualExpense} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>TRIP #</label>
                <select value={newTripId} onChange={e => setNewTripId(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="101">TRIP-2026-98102 (Pune → Gurugram)</option>
                  <option value="102">TRIP-2026-98105 (Mumbai → Ahmedabad)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>EXPENSE TYPE</label>
                <select value={newExpType} onChange={e => setNewExpType(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="Diesel">Diesel</option>
                  <option value="Toll">Highway Fastag Toll</option>
                  <option value="DriverBhatta">Driver Daily Bhatta</option>
                  <option value="TyrePuncture">Tyre Puncture / Maintenance</option>
                  <option value="BorderEntry">Border / State Checking</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>AMOUNT (₹) *</label>
                <input type="number" placeholder="e.g. 4500" value={newAmount} onChange={e => setNewAmount(e.target.value)} required style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              {newExpType === 'Diesel' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Liters</label>
                    <input type="number" step="0.1" placeholder="e.g. 50" value={newLiters} onChange={e => setNewLiters(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Pump Station</label>
                    <input type="text" placeholder="e.g. HPCL Highway" value={newStation} onChange={e => setNewStation(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
