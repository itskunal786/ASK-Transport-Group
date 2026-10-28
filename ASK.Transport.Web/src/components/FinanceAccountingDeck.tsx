import { useState, useEffect } from 'react';
import GovtEInvoiceManager from './GovtEInvoiceManager';
import TallyZohoErpSyncDeck from './TallyZohoErpSyncDeck';
import CustomerCreditLedgerManager from './CustomerCreditLedgerManager';
import MarketFleetSettlementDeck from './MarketFleetSettlementDeck';
import ErrorBoundary from './ErrorBoundary';

export interface FinanceAccountingDeckProps {
  initialSubTab?: 'einv' | 'erp' | 'credit' | 'settlement';
}

export default function FinanceAccountingDeck({ initialSubTab = 'einv' }: FinanceAccountingDeckProps) {
  const [activeTab, setActiveTab] = useState<'einv' | 'erp' | 'credit' | 'settlement'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* FINANCE MASTER HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
        color: '#ffffff',
        padding: '24px 28px',
        borderRadius: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.4)'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            <span>💳</span> Finance, GST &amp; Accounting Automation
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            GST E-Invoice, Tally/Zoho ERP &amp; Hired Fleet Settlement
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#a7f3d0', lineHeight: 1.5 }}>
            Automate statutory NIC E-Invoicing (Rule 48(4) CGST), synchronize ledgers directly with Tally Prime and Zoho Books, manage 70:30 hired fleet payouts with Section 194C TDS, and control corporate credit cycles.
          </p>
        </div>

        {/* TABS NAVIGATION */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.08)', padding: '5px', borderRadius: '12px', gap: '6px', border: '1px solid rgba(255, 255, 255, 0.1)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('settlement')}
            style={{
              padding: '9px 18px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'settlement' ? '#059669' : 'transparent',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span>🤝</span> Hired Fleet &amp; 194C TDS
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('einv')}
            style={{
              padding: '9px 18px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'einv' ? '#059669' : 'transparent',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span>🏛️</span> Govt E-Invoice &amp; IRN
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('erp')}
            style={{
              padding: '9px 18px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'erp' ? '#059669' : 'transparent',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span>🔄</span> Tally &amp; Zoho Sync
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('credit')}
            style={{
              padding: '9px 18px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'credit' ? '#059669' : 'transparent',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span>💳</span> Credit Ledgers &amp; Cycles
          </button>
        </div>
      </div>

      {/* RENDER CURRENT VIEW */}
      {activeTab === 'settlement' && (
        <ErrorBoundary fallbackTitle="Market Fleet Settlement Error">
          <MarketFleetSettlementDeck />
        </ErrorBoundary>
      )}
      {activeTab === 'einv' && (
        <ErrorBoundary fallbackTitle="Govt E-Invoice Manager Error">
          <GovtEInvoiceManager />
        </ErrorBoundary>
      )}
      {activeTab === 'erp' && (
        <ErrorBoundary fallbackTitle="Tally & Zoho ERP Sync Error">
          <TallyZohoErpSyncDeck />
        </ErrorBoundary>
      )}
      {activeTab === 'credit' && (
        <ErrorBoundary fallbackTitle="Customer Credit Ledger Error">
          <CustomerCreditLedgerManager />
        </ErrorBoundary>
      )}
    </div>
  );
}
