import React, { useEffect, useState } from 'react';
import {
  getCreditLedgers,
  updateCreditLimit,
  toggleCreditFreeze,
  generateConsolidatedStatement,
  sendWhatsAppPaymentReminder,
  type CustomerCreditLedger,
  type CreditLedgersResponse
} from '../api/financeApi';

export default function CustomerCreditLedgerManager() {
  const [data, setData] = useState<CreditLedgersResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Edit Limit Modal
  const [editClient, setEditClient] = useState<CustomerCreditLedger | null>(null);
  const [newLimit, setNewLimit] = useState('');
  const [newTerms, setNewTerms] = useState('30 Days Net');

  // Statement Modal
  const [statementData, setStatementData] = useState<any | null>(null);

  // Success alert
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const res = await getCreditLedgers();
      setData(res);
    } catch (err) {
      console.error('Failed to load credit ledgers:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSaveLimit(e: React.FormEvent) {
    e.preventDefault();
    if (!editClient || !newLimit || Number(newLimit) <= 0) return;
    try {
      setLoading(true);
      const res = await updateCreditLimit(editClient.clientId, {
        creditLimit: Number(newLimit),
        paymentTerms: newTerms
      });
      setEditClient(null);
      setAlertMsg(res.message);
      setTimeout(() => setAlertMsg(null), 6000);
      loadData();
    } catch (err: any) {
      alert('Failed to update limit: ' + err?.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleFreeze(clientId: number) {
    try {
      setLoading(true);
      const res = await toggleCreditFreeze(clientId);
      setAlertMsg(res.message);
      setTimeout(() => setAlertMsg(null), 6000);
      loadData();
    } catch (err: any) {
      alert('Failed to toggle freeze: ' + err?.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateStatement(clientId: number) {
    try {
      setLoading(true);
      const res = await generateConsolidatedStatement(clientId);
      setStatementData(res.statement);
      loadData();
    } catch (err: any) {
      alert('Failed to generate statement: ' + err?.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendReminder(clientId: number) {
    try {
      setLoading(true);
      const res = await sendWhatsAppPaymentReminder(clientId);
      setAlertMsg(res.message);
      setTimeout(() => setAlertMsg(null), 7000);
      loadData();
    } catch (err: any) {
      alert('Failed to send reminder: ' + err?.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER & CONTROLS */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💳</span> Customer Credit Ledgers &amp; Auto Invoicing Cycle
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
            Enterprise credit monitoring, automated credit limit freeze, 15/30-day consolidated statements, and 1-click WhatsApp payment reminders.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          style={{ padding: '8px 14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
        >
          🔄 Refresh Ledgers
        </button>
      </div>

      {alertMsg && (
        <div style={{ padding: '14px 20px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', color: '#15803d', fontSize: '13.5px', fontWeight: 800 }}>
          {alertMsg}
        </div>
      )}

      {/* KPI METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #2563eb' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL CREDIT OUTSTANDING</span>
          <strong style={{ fontSize: '24px', color: '#2563eb', display: 'block', margin: '4px 0' }}>
            ₹{((data?.summary.totalCreditExposure || 0) / 100000).toFixed(2)} Lakhs
          </strong>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
            Across {data?.clients.length || 0} Corporate Accounts
          </span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>OVERDUE AMOUNT</span>
          <strong style={{ fontSize: '24px', color: '#dc2626', display: 'block', margin: '4px 0' }}>
            ₹{((data?.summary.totalOverdue || 0) / 100000).toFixed(2)} Lakhs
          </strong>
          <span style={{ fontSize: '11.5px', color: '#b91c1c', fontWeight: 700 }}>
            {data?.summary.frozenClientsCount || 0} Accounts Frozen
          </span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL APPROVED CREDIT</span>
          <strong style={{ fontSize: '24px', color: '#16a34a', display: 'block', margin: '4px 0' }}>
            ₹{((data?.summary.totalCreditLimitAllowed || 0) / 100000).toFixed(2)} Lakhs
          </strong>
          <span style={{ fontSize: '11.5px', color: '#059669' }}>Combined Credit Sanctioned</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>CREDIT STATUS</span>
          <strong style={{ fontSize: '20px', color: '#d97706', display: 'block', margin: '4px 0' }}>
            {data?.summary.warningClientsCount || 0} Approaching Limit
          </strong>
          <span style={{ fontSize: '11.5px', color: '#b45309' }}>Requires payment follow-up</span>
        </div>
      </div>

      {/* CLIENT CREDIT CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {(data?.clients || []).map((client: CustomerCreditLedger) => {
          const cid = client.clientId;
          const isFrozen = client.accountStatus === 'Credit_Frozen';
          const isWarning = client.accountStatus === 'Credit_Warning';
          const util = client.creditUtilizationPercent;

          return (
            <div
              key={cid}
              style={{
                background: 'var(--bg-surface, #ffffff)',
                borderRadius: '14px',
                border: isFrozen ? '2px solid #ef4444' : isWarning ? '1.5px solid #f59e0b' : '1px solid var(--border-color, #e2e8f0)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              {/* TOP HEADER */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>{client.companyName}</strong>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: isFrozen ? '#fee2e2' : isWarning ? '#fef3c7' : '#dcfce7',
                      color: isFrozen ? '#dc2626' : isWarning ? '#b45309' : '#15803d'
                    }}>
                      {isFrozen ? '🔒 CREDIT FROZEN (AUTO-LOCK)' : isWarning ? '⚠ NEAR LIMIT' : '✓ HEALTHY ACCOUNT'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                    GSTIN: <strong>{client.gstin}</strong> • Terms: <strong>{client.paymentTerms}</strong> ({client.billingCycle})
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditClient(client);
                      setNewLimit(String(client.creditLimit));
                      setNewTerms(client.paymentTerms);
                    }}
                    style={{ padding: '6px 12px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    📝 Adjust Limit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleFreeze(cid)}
                    style={{
                      padding: '6px 12px',
                      background: isFrozen ? '#10b981' : '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isFrozen ? '🔓 Unfreeze Account' : '🔒 Freeze Credit'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateStatement(cid)}
                    style={{ padding: '6px 14px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    📄 Generate Statement
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendReminder(cid)}
                    style={{ padding: '6px 14px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>📲</span> WhatsApp Reminder
                  </button>
                </div>
              </div>

              {/* FINANCIAL BREAKDOWN */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>CREDIT LIMIT:</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    ₹{client.creditLimit.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>CURRENT OUTSTANDING:</span>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: isFrozen ? '#dc2626' : '#2563eb', marginTop: '2px' }}>
                    ₹{client.currentOutstanding.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700 }}>OVERDUE AMOUNT:</span>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: client.overdueAmount > 0 ? '#dc2626' : '#16a34a', marginTop: '2px' }}>
                    ₹{client.overdueAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>UNBILLED TRIPS:</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                    {client.unbilledTripsCount} Trips (₹{client.unbilledTripsValue.toLocaleString('en-IN')})
                  </div>
                </div>
              </div>

              {/* CREDIT UTILIZATION PROGRESS BAR */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#475569' }}>Credit Limit Utilization:</span>
                  <strong style={{ color: util > 100 ? '#dc2626' : util > 85 ? '#d97706' : '#16a34a' }}>
                    {util}% Used
                  </strong>
                </div>

                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(util, 100)}%`,
                      height: '100%',
                      background: util > 100 ? '#dc2626' : util > 85 ? '#f59e0b' : '#10b981',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>

              {/* CONTACT & BILLING STRIP */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#64748b' }}>
                <div>
                  Contact: <strong>{client.contactPerson}</strong> ({client.contactPhone}) • Address: {client.billingAddress}
                </div>
                <div>
                  {client.lastReminderSent && <span>Last WhatsApp Alert: {new Date(client.lastReminderSent).toLocaleTimeString()}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADJUST LIMIT MODAL */}
      {editClient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '22px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: '#0f172a' }}>
              📝 Adjust Corporate Credit Limit
            </h3>
            <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
              Client: <strong>{editClient.companyName}</strong>
            </p>

            <form onSubmit={handleSaveLimit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>APPROVED CREDIT LIMIT (₹):</label>
                <input
                  type="number"
                  value={newLimit}
                  onChange={e => setNewLimit(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 800, color: '#2563eb' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>PAYMENT TERMS:</label>
                <select
                  value={newTerms}
                  onChange={e => setNewTerms(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                >
                  <option value="15 Days Net">15 Days Net (Fortnightly)</option>
                  <option value="30 Days Net">30 Days Net (Monthly)</option>
                  <option value="45 Days Net">45 Days Net</option>
                  <option value="Immediate / COD">Immediate / COD (0 Days)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditClient(null)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '8px 20px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONSOLIDATED STATEMENT MODAL */}
      {statementData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '640px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                  📄 Consolidated Billing Statement #{statementData.statementNumber}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Period: {statementData.period} • {statementData.billingCycle}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatementData(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <span>Client Name:</span>
                <strong>{statementData.clientName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                <span>GSTIN:</span>
                <strong>{statementData.gstin}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                <span>Total Consignments Billed:</span>
                <strong>{statementData.totalConsignments} Bilties</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                <span>Total Taxable Freight:</span>
                <strong>₹{statementData.totalTaxableFreight.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                <span>GST ({statementData.gstRate}):</span>
                <strong>₹{statementData.gstAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '15px' }}>
                <strong style={{ color: '#166534' }}>Net Amount Payable:</strong>
                <strong style={{ color: '#15803d' }}>₹{statementData.grandTotal.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', textAlign: 'right' }}>
                Payment Due Date: <strong>{statementData.dueDate}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ padding: '8px 16px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                🖨️ Print Statement
              </button>
              <button
                type="button"
                onClick={() => setStatementData(null)}
                style={{ padding: '8px 18px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
