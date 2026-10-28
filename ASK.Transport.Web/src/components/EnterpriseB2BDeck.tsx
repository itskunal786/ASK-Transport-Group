import { useState } from 'react';
import BulkExcelBookingEngine from './BulkExcelBookingEngine';
import FreightBiddingMarketplace from './FreightBiddingMarketplace';
import ReverseLogisticsRtoManager from './ReverseLogisticsRtoManager';

export default function EnterpriseB2BDeck() {
  const [activeTab, setActiveTab] = useState<'bulk' | 'marketplace' | 'reverse'>('bulk');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ENTERPRISE MASTER HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff',
        padding: '24px 28px',
        borderRadius: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            <span>🏢</span> Enterprise &amp; Corporate Shipper Suite
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            B2B Logistics, Spot Marketplace &amp; RTO Suite
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
            Automate high-volume corporate factory consignments, monetize unassigned freight on spot reverse auctions, and manage damaged consignment returns with automated reverse LR tracking.
          </p>
        </div>

        {/* TABS NAVIGATION */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.08)', padding: '5px', borderRadius: '12px', gap: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('bulk')}
            style={{
              padding: '9px 18px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'bulk' ? '#2563eb' : 'transparent',
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
            <span>📊</span> Bulk Excel / CSV
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('marketplace')}
            style={{
              padding: '9px 18px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'marketplace' ? '#2563eb' : 'transparent',
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
            <span>🏷️</span> Spot Reverse Auction
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reverse')}
            style={{
              padding: '9px 18px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'reverse' ? '#2563eb' : 'transparent',
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
            <span>🔄</span> Reverse Logistics (RTO)
          </button>
        </div>
      </div>

      {/* RENDER CURRENT VIEW */}
      {activeTab === 'bulk' && <BulkExcelBookingEngine />}
      {activeTab === 'marketplace' && <FreightBiddingMarketplace />}
      {activeTab === 'reverse' && <ReverseLogisticsRtoManager />}
    </div>
  );
}
