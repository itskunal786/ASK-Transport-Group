import { useState } from 'react';
import { Building2, FileSpreadsheet, Gavel, RotateCcw } from 'lucide-react';
import BulkExcelBookingEngine from './BulkExcelBookingEngine';
import FreightBiddingMarketplace from './FreightBiddingMarketplace';
import ReverseLogisticsRtoManager from './ReverseLogisticsRtoManager';
import { useLanguage } from '../context/LanguageContext';
import './EnterpriseB2BDeck.css';

export default function EnterpriseB2BDeck() {
  const [activeTab, setActiveTabState] = useState<'bulk' | 'marketplace' | 'reverse'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlSub = params.get('subtab') as any;
      if (urlSub && ['bulk', 'marketplace', 'reverse'].includes(urlSub)) return urlSub;
      const saved = localStorage.getItem('ask_admin_b2b_subtab') as any;
      if (saved && ['bulk', 'marketplace', 'reverse'].includes(saved)) return saved;
    } catch {
      // ignore
    }
    return 'reverse'; // default to reverse logistics since active
  });

  const setActiveTab = (tab: 'bulk' | 'marketplace' | 'reverse') => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('ask_admin_b2b_subtab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('subtab', tab);
      window.history.replaceState(null, '', url.toString());
    } catch {
      // ignore
    }
  };
  const { t } = useLanguage();

  return (
    <div className="enterprise-deck-container">
      {/* ENTERPRISE MASTER HEADER */}
      <div className="enterprise-master-banner">
        <div className="enterprise-banner-content">
          <div className="enterprise-banner-badge">
            <Building2 size={14} />
            <span>{t('Enterprise & Corporate Shipper Suite', 'एंटरप्राइज एवं कॉर्पोरेट शिपर सुइट')}</span>
          </div>
          <h1 className="enterprise-banner-title">
            {t('B2B Logistics, Spot Marketplace & RTO Suite', 'बी2बी लॉजिस्टिक्स, स्पॉट मार्केटप्लेस एवं आरटीओ सुइट')}
          </h1>
          <p className="enterprise-banner-sub">
            {t(
              'Automate high-volume corporate factory consignments, monetize unassigned freight on spot reverse auctions, and manage damaged consignment returns with automated reverse LR tracking.',
              'उच्च-मात्रा कॉर्पोरेट फैक्ट्री कंसाइनमेंट्स को स्वचालित करें, स्पॉट रिवर्स ऑक्शन पर अतिरिक्त माल ढुलाई प्रबंधित करें, और रिवर्स एलआर ट्रैकिंग के साथ क्षतिग्रस्त माल वापसी का प्रबंधन करें।'
            )}
          </p>
        </div>

        {/* TABS NAVIGATION */}
        <div className="enterprise-tabs-nav">
          <button
            type="button"
            onClick={() => setActiveTab('bulk')}
            className={`enterprise-tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}
          >
            <FileSpreadsheet size={15} />
            <span>{t('Bulk Excel / CSV', 'बल्क एक्सेल / सीएसवी')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('marketplace')}
            className={`enterprise-tab-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
          >
            <Gavel size={15} />
            <span>{t('Spot Reverse Auction', 'स्पॉट रिवर्स ऑक्शन')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reverse')}
            className={`enterprise-tab-btn ${activeTab === 'reverse' ? 'active' : ''}`}
          >
            <RotateCcw size={15} />
            <span>{t('Reverse Logistics (RTO)', 'रिवर्स लॉजिस्टिक्स (आरटीओ)')}</span>
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
