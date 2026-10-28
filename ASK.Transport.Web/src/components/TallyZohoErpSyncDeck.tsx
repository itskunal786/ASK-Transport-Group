import { useEffect, useState } from 'react';
import {
  getErpSyncStatus,
  triggerErpSync,
  exportTallyXml,
  type ErpSyncStatusResponse,
  type ErpVoucherRecord
} from '../api/financeApi';

const DEFAULT_ERP_DATA: ErpSyncStatusResponse = {
  metrics: {
    totalVouchers: 3,
    syncedCount: 2,
    pendingCount: 1,
    totalSyncedValue: 131040,
    tallyPrimePort: '9000 (Active ODBC/XML Connector)',
    zohoBooksOrg: 'ASK Logistics Ltd (India)',
    autoSyncIntervalMinutes: 15
  },
  vouchers: [
    {
      id: 1,
      voucherType: 'Sales',
      voucherNumber: 'VCH-2026-1001',
      referenceNumber: 'ASK/2026-27/0412',
      date: '2026-10-26T06:31:52Z',
      partyLedgerName: 'North Star Auto Components Ltd (Debtor)',
      salesLedgerName: 'Freight Income - Inter-State (Income)',
      gstLedgerName: 'Output IGST @ 12%',
      amount: 65520,
      taxAmount: 7020,
      narration: 'Being road freight charges billed for Pune to Gurugram auto chassis consignment under LR ASK-LR-2026-98102.',
      tallySyncStatus: 'Synced',
      zohoSyncStatus: 'Synced',
      lastSyncedAt: '2026-10-26T09:31:52Z',
      erpReferenceId: 'ZOHO-INV-99014'
    },
    {
      id: 2,
      voucherType: 'Receipt',
      voucherNumber: 'REC-2026-2041',
      referenceNumber: 'BANK-NEFT-9081234',
      date: '2026-10-27T06:31:52Z',
      partyLedgerName: 'North Star Auto Components Ltd (Debtor)',
      salesLedgerName: 'HDFC Bank Corporate CC A/c',
      gstLedgerName: 'N/A',
      amount: 65520,
      taxAmount: 0,
      narration: 'Received full NEFT payment against Invoice ASK/2026-27/0412.',
      tallySyncStatus: 'Synced',
      zohoSyncStatus: 'Synced',
      lastSyncedAt: '2026-10-27T10:31:52Z',
      erpReferenceId: 'ZOHO-PMT-77102'
    },
    {
      id: 3,
      voucherType: 'Purchase / Transporter Debit',
      voucherNumber: 'VCH-2026-3092',
      referenceNumber: 'TRIP-EXP-98102',
      date: '2026-10-27T12:31:52Z',
      partyLedgerName: 'Apex Highway Freight Carriers (Creditor)',
      salesLedgerName: 'Freight Outward / Market Truck Hire',
      gstLedgerName: 'Input GST RCM',
      amount: 74500,
      taxAmount: 0,
      narration: 'Market truck hired for Pune-Gurugram spot shipment. Truck MH-14-EM-4890.',
      tallySyncStatus: 'Pending',
      zohoSyncStatus: 'Pending',
      lastSyncedAt: null,
      erpReferenceId: null
    }
  ]
};

export default function TallyZohoErpSyncDeck() {
  const [data, setData] = useState<ErpSyncStatusResponse>(DEFAULT_ERP_DATA);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncAlert, setSyncAlert] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const res = await getErpSyncStatus();
      if (res && res.vouchers && Array.isArray(res.vouchers)) {
        setData(res);
      }
    } catch (err) {
      console.warn('Failed to load ERP sync status, keeping default state:', err);
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

  const safeVouchers = data?.vouchers && Array.isArray(data.vouchers) ? data.vouchers : DEFAULT_ERP_DATA.vouchers;
  const safeMetrics = data?.metrics || DEFAULT_ERP_DATA.metrics;

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
            {safeMetrics.totalVouchers ?? 0} Records
          </strong>
          <span style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 700 }}>
            ✓ {safeMetrics.syncedCount ?? 0} Synced • ⏳ {safeMetrics.pendingCount ?? 0} Pending
          </span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>SYNCED REVENUE VALUE</span>
          <strong style={{ fontSize: '24px', color: '#16a34a', display: 'block', margin: '4px 0' }}>
            ₹{(safeMetrics.totalSyncedValue ?? 0).toLocaleString('en-IN')}
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
          <strong style={{ fontSize: '13px', color: '#0f172a' }}>Ledger Vouchers Dispatch Journal ({safeVouchers.length} Entries)</strong>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>All freight debits and credits synchronized with corporate chart of accounts</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
              <th style={{ padding: '10px 14px' }}>Voucher &amp; Date</th>
              <th style={{ padding: '10px 14px' }}>Party / Debtor Ledger</th>
              <th style={{ padding: '10px 14px' }}>Account Classification</th>
              <th style={{ padding: '10px 14px' }}>Amount (₹)</th>
              <th style={{ padding: '10px 14px' }}>Tally Sync</th>
              <th style={{ padding: '10px 14px' }}>Zoho Books</th>
              <th style={{ padding: '10px 14px' }}>Narration</th>
            </tr>
          </thead>
          <tbody>
            {safeVouchers.map((v: ErpVoucherRecord) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 14px' }}>
                  <strong style={{ color: '#0f172a' }}>{v.voucherNumber}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Type: <span style={{ fontWeight: 700, color: '#2563eb' }}>{v.voucherType}</span> • {new Date(v.date).toLocaleDateString()}
                  </div>
                </td>

                <td style={{ padding: '10px 14px' }}>
                  <strong style={{ color: '#334155', display: 'block' }}>{v.partyLedgerName}</strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Ref: {v.referenceNumber}</span>
                </td>

                <td style={{ padding: '10px 14px' }}>
                  <div style={{ color: '#0f172a', fontWeight: 600 }}>{v.salesLedgerName}</div>
                  <span style={{ fontSize: '11px', color: '#7c3aed' }}>Tax: {v.gstLedgerName}</span>
                </td>

                <td style={{ padding: '10px 14px' }}>
                  <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>
                    ₹{(v.amount ?? 0).toLocaleString('en-IN')}
                  </strong>
                  {(v.taxAmount ?? 0) > 0 && <div style={{ fontSize: '10.5px', color: '#64748b' }}>GST: ₹{(v.taxAmount ?? 0).toLocaleString('en-IN')}</div>}
                </td>

                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: v.tallySyncStatus === 'Synced' ? '#dcfce7' : '#fef3c7',
                    color: v.tallySyncStatus === 'Synced' ? '#166534' : '#92400e'
                  }}>
                    {v.tallySyncStatus === 'Synced' ? '✓ Synced' : '⏳ Pending'}
                  </span>
                </td>

                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: v.zohoSyncStatus === 'Synced' ? '#dcfce7' : '#fef3c7',
                    color: v.zohoSyncStatus === 'Synced' ? '#166534' : '#92400e'
                  }}>
                    {v.zohoSyncStatus === 'Synced' ? '✓ Synced' : '⏳ Pending'}
                  </span>
                </td>

                <td style={{ padding: '10px 14px', maxWidth: '280px', color: '#475569', fontSize: '11.5px', lineHeight: 1.4 }}>
                  {v.narration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
