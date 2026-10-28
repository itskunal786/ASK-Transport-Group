import { useEffect, useState } from 'react';
import {
  getErpSyncStatus,
  triggerErpSync,
  exportTallyXml,
  type ErpSyncStatusResponse,
  type ErpVoucherRecord
} from '../api/financeApi';

export default function TallyZohoErpSyncDeck() {
  const [data, setData] = useState<ErpSyncStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncAlert, setSyncAlert] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const res = await getErpSyncStatus();
      setData(res);
    } catch (err) {
      console.error('Failed to load ERP sync status:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleTriggerSync() {
    try {
      setSyncing(true);
      const res = await triggerErpSync();
      setSyncAlert(res.message);
      setTimeout(() => setSyncAlert(null), 8000);
      loadData();
    } catch (err: any) {
      alert('Failed to sync vouchers: ' + err?.message);
    } finally {
      setSyncing(false);
    }
  }

  async function handleExportTally() {
    try {
      const res = await exportTallyXml();
      const blob = new Blob([res.xmlContent], { type: 'application/xml;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', res.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert('Failed to export Tally XML: ' + err?.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER & CONTROLS */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔄</span> Tally Prime &amp; Zoho Books Accounting Bridge
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
            Zero manual accounting entry. Automatically translates freight bilties, bank collections &amp; market transporter hire debits into double-entry ledger vouchers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleExportTally}
            style={{ padding: '8px 14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>📥</span> Download Tally Prime XML
          </button>

          <button
            type="button"
            disabled={syncing || loading}
            onClick={handleTriggerSync}
            style={{
              padding: '8px 18px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
            }}
          >
            <span>⚡</span>
            {syncing ? 'Syncing to Tally & Zoho...' : 'Sync All Vouchers to ERP'}
          </button>
        </div>
      </div>

      {syncAlert && (
        <div style={{ padding: '14px 20px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', color: '#15803d', fontSize: '13.5px', fontWeight: 800 }}>
          {syncAlert}
        </div>
      )}

      {/* KPI METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #2563eb' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>ACCOUNTING VOUCHERS</span>
          <strong style={{ fontSize: '24px', color: '#0f172a', display: 'block', margin: '4px 0' }}>
            {data?.metrics.totalVouchers || 0} Records
          </strong>
          <span style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 700 }}>
            ✓ {data?.metrics.syncedCount || 0} Synced • ⏳ {data?.metrics.pendingCount || 0} Pending
          </span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>SYNCED REVENUE VALUE</span>
          <strong style={{ fontSize: '24px', color: '#16a34a', display: 'block', margin: '4px 0' }}>
            ₹{data?.metrics.totalSyncedValue.toLocaleString('en-IN') || 0}
          </strong>
          <span style={{ fontSize: '11.5px', color: '#059669' }}>Ledger balance posted</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TALLY PRIME STATUS</span>
          <strong style={{ fontSize: '20px', color: '#d97706', display: 'block', margin: '4px 0' }}>
            Port 9000 (Active)
          </strong>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>XML / ODBC Listener Ready</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #7c3aed' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>ZOHO BOOKS CLOUD</span>
          <strong style={{ fontSize: '20px', color: '#7c3aed', display: 'block', margin: '4px 0' }}>
            Live API Bridge
          </strong>
          <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 700 }}>● Auto-Sync Every 15 Mins</span>
        </div>
      </div>

      {/* VOUCHERS AUDIT TABLE */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '13px', color: '#0f172a' }}>Ledger Vouchers Dispatch Journal ({data?.vouchers.length || 0} Entries)</strong>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>All freight debits and credits synchronized with corporate chart of accounts</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
              <th style={{ padding: '10px 14px' }}>Voucher # &amp; Type</th>
              <th style={{ padding: '10px 14px' }}>Date</th>
              <th style={{ padding: '10px 14px' }}>Party / Account Ledger</th>
              <th style={{ padding: '10px 14px' }}>Contra / Sales Ledger</th>
              <th style={{ padding: '10px 14px' }}>Amount</th>
              <th style={{ padding: '10px 14px' }}>Tally Prime</th>
              <th style={{ padding: '10px 14px' }}>Zoho Books</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Sync Ref ID</th>
            </tr>
          </thead>
          <tbody>
            {(data?.vouchers || []).map((v: ErpVoucherRecord) => {
              const isTallySynced = v.tallySyncStatus === 'Synced';
              const isZohoSynced = v.zohoSyncStatus === 'Synced';

              return (
                <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <strong style={{ color: '#0f172a', display: 'block' }}>{v.voucherNumber}</strong>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700, background: v.voucherType === 'Sales' ? '#eff6ff' : v.voucherType === 'Receipt' ? '#dcfce7' : '#fef3c7', color: v.voucherType === 'Sales' ? '#1e40af' : v.voucherType === 'Receipt' ? '#166534' : '#92400e' }}>
                      {v.voucherType}
                    </span>
                  </td>

                  <td style={{ padding: '10px 14px', color: '#64748b' }}>
                    {new Date(v.date).toLocaleDateString()}
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <strong style={{ color: '#334155', display: 'block' }}>{v.partyLedgerName}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Ref: {v.referenceNumber}</span>
                  </td>

                  <td style={{ padding: '10px 14px', color: '#475569' }}>
                    <div>{v.salesLedgerName}</div>
                    {v.gstLedgerName !== 'N/A' && <span style={{ fontSize: '10.5px', color: '#7c3aed' }}>{v.gstLedgerName}</span>}
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>
                      ₹{v.amount.toLocaleString('en-IN')}
                    </strong>
                    {v.taxAmount > 0 && <div style={{ fontSize: '10.5px', color: '#64748b' }}>GST: ₹{v.taxAmount.toLocaleString('en-IN')}</div>}
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, background: isTallySynced ? '#dcfce7' : '#fef3c7', color: isTallySynced ? '#15803d' : '#b45309' }}>
                      {isTallySynced ? '✓ Synced' : '⏳ Pending'}
                    </span>
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, background: isZohoSynced ? '#dcfce7' : '#fef3c7', color: isZohoSynced ? '#15803d' : '#b45309' }}>
                      {isZohoSynced ? '✓ Synced' : '⏳ Pending'}
                    </span>
                  </td>

                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <code style={{ background: '#f8fafc', padding: '3px 6px', borderRadius: '4px', fontSize: '11px', color: '#64748b' }}>
                      {v.erpReferenceId || 'Awaiting Sync'}
                    </code>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
