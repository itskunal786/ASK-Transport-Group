import { useState, useEffect } from 'react';
import WhatsAppAiLogisticsBot from './WhatsAppAiLogisticsBot';
import AiTruckLoadVisualizer from './AiTruckLoadVisualizer';
import AiOcrScannerModal from './AiOcrScannerModal';
import AiRouteCostPredictor from './AiRouteCostPredictor';
import SpotFreightRateAiPredictor from './SpotFreightRateAiPredictor';
import { useLanguage } from '../context/LanguageContext';

export default function AiOperationsDeck({
  initialDeckTab = '3d_load',
  onApplyOcrData
}: {
  initialDeckTab?: '3d_load' | 'ocr_scanner' | 'route_predictor' | 'whatsapp_bot' | 'spot_rate_ai';
  onApplyOcrData?: (docType: string, data: Record<string, any>) => void;
}) {
  const { t } = useLanguage();
  const [activeDeckTab, setActiveDeckTab] = useState<'3d_load' | 'ocr_scanner' | 'route_predictor' | 'whatsapp_bot' | 'spot_rate_ai'>(initialDeckTab);

  useEffect(() => {
    if (initialDeckTab) {
      setActiveDeckTab(initialDeckTab);
    }
  }, [initialDeckTab]);
  const [showOcrModal, setShowOcrModal] = useState<boolean>(false);
  const [scannerType, setScannerType] = useState<'driving_license' | 'vehicle_rc' | 'physical_bilty'>('driving_license');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* TOP AI BANNER (COMPACT & BALANCED SIZING) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          borderRadius: '14px',
          padding: '16px 20px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 8px 20px -5px rgba(67, 56, 202, 0.35)'
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)', padding: '3px 10px', borderRadius: '16px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '6px' }}>
            <span>⚡</span> {t('NEXT-GEN LOGISTICS AUTOMATION', 'नेक्स्ट-जेन लॉजिस्टिक्स ऑटोमेशन')}
          </div>
          <h1 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 900, letterSpacing: '-0.4px' }}>
            {t('AI Operations Deck & Optimization Hub', 'एआई ऑपरेशंस डेक एवं ऑप्टिमाइज़ेशन हब')}
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#c7d2fe', lineHeight: 1.4 }}>
            {t(
              'Harness real-time 3D bin packing, neural optical character recognition (OCR) for DL/RC/Bilty, and algorithmic highway route, Fastag toll & fuel expense prediction.',
              'रियल-टाइम 3D बिन पैकिंग, डीएल/आरसी/बिल्टी हेतु न्यूरल ओसीआर, और एल्गोरिद्मिक हाईवे रूट, फास्टैग टोल व ईंधन व्यय पूर्वानुमान का उपयोग करें।'
            )}
          </p>
        </div>

        {/* QUICK OCR SCANNER LAUNCHERS */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setScannerType('driving_license');
              setShowOcrModal(true);
            }}
            style={{
              padding: '7px 13px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🪪</span> {t('Scan Driver DL', 'ड्राइवर डीएल स्कैन')}
          </button>

          <button
            type="button"
            onClick={() => {
              setScannerType('vehicle_rc');
              setShowOcrModal(true);
            }}
            style={{
              padding: '7px 13px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🚛</span> {t('Scan Truck RC', 'ट्रक आरसी स्कैन')}
          </button>

          <button
            type="button"
            onClick={() => {
              setScannerType('physical_bilty');
              setShowOcrModal(true);
            }}
            style={{
              padding: '7px 13px',
              borderRadius: '8px',
              background: '#38bdf8',
              border: 'none',
              color: '#0f172a',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 3px 10px rgba(56, 189, 248, 0.35)'
            }}
          >
            <span>📜</span> {t('Scan Physical Bilty', 'फिजिकल बिल्टी स्कैन')}
          </button>
        </div>
      </div>

      {/* TABS SELECTOR (COMPACT) */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '2px solid var(--border-color, #e2e8f0)', paddingBottom: '2px', overflowX: 'auto' }}>
        <button
          type="button"
          onClick={() => setActiveDeckTab('3d_load')}
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeDeckTab === '3d_load' ? '#2563eb' : '#64748b',
            borderBottom: activeDeckTab === '3d_load' ? '3px solid #2563eb' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          {t('3D Truck Load Optimizer', '3D ट्रक लोड ऑप्टिमाइज़र')}
        </button>

        <button
          type="button"
          onClick={() => setActiveDeckTab('route_predictor')}
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeDeckTab === 'route_predictor' ? '#2563eb' : '#64748b',
            borderBottom: activeDeckTab === 'route_predictor' ? '3px solid #2563eb' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          {t('Route & Fastag Predictor', 'रूट व फास्टैग प्रेडिक्टर')}
        </button>

        <button
          type="button"
          onClick={() => setActiveDeckTab('ocr_scanner')}
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeDeckTab === 'ocr_scanner' ? '#2563eb' : '#64748b',
            borderBottom: activeDeckTab === 'ocr_scanner' ? '3px solid #2563eb' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          {t('AI OCR Document Studio', 'एआई ओसीआर डॉक्यूमेंट स्टूडियो')}
        </button>

        <button
          type="button"
          onClick={() => setActiveDeckTab('spot_rate_ai')}
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeDeckTab === 'spot_rate_ai' ? '#4f46e5' : '#64748b',
            borderBottom: activeDeckTab === 'spot_rate_ai' ? '3px solid #4f46e5' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          {t('Spot Freight Rate AI', 'स्पॉट भाड़ा दर एआई')}
        </button>

        <button
          type="button"
          onClick={() => setActiveDeckTab('whatsapp_bot')}
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeDeckTab === 'whatsapp_bot' ? '#075e54' : '#64748b',
            borderBottom: activeDeckTab === 'whatsapp_bot' ? '3px solid #075e54' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          {t('WhatsApp AI Bot', 'व्हाट्सएप एआई बॉट')}
        </button>
      </div>

      {/* ACTIVE TAB VIEW */}
      <div>
        {activeDeckTab === '3d_load' && (
          <AiTruckLoadVisualizer />
        )}

        {activeDeckTab === 'route_predictor' && (
          <AiRouteCostPredictor />
        )}

        {activeDeckTab === 'whatsapp_bot' && (
          <WhatsAppAiLogisticsBot />
        )}

        {activeDeckTab === 'spot_rate_ai' && (
          <SpotFreightRateAiPredictor />
        )}

        {activeDeckTab === 'ocr_scanner' && (
          <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
              {t('AI Document Scanner & MoRTH Verification Studio', 'एआई डॉक्यूमेंट स्कैनर एवं MoRTH सत्यापन स्टूडियो')}
            </h3>
            <p style={{ margin: '0 auto 20px', maxWidth: '540px', fontSize: '13px', color: 'var(--text-secondary, #64748b)' }}>
              {t(
                'Select a document type below to open the live neural scanner. The system reads DLs, Truck RCs and offline Bilty notes, verifies validity via Govt databases, and auto-fills registration forms with zero manual typing.',
                'लाइव न्यूरल स्कैनर खोलने के लिए नीचे एक दस्तावेज़ प्रकार चुनें। सिस्टम डीएल, ट्रक आरसी और ऑफलाइन बिल्टी नोट्स पढ़ता है, सरकारी डेटाबेस के माध्यम से वैधता सत्यापित करता है, और शून्य मैनुअल टाइपिंग के साथ फॉर्म ऑटो-फिल करता है।'
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setScannerType('driving_license');
                  setShowOcrModal(true);
                }}
                style={{ padding: '10px 20px', borderRadius: '10px', background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                🪪 {t('Scan Driver Driving License', 'ड्राइवर ड्राइविंग लाइसेंस स्कैन करें')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setScannerType('vehicle_rc');
                  setShowOcrModal(true);
                }}
                style={{ padding: '10px 20px', borderRadius: '10px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                🚛 {t('Scan Truck RC Book', 'ट्रक आरसी बुक स्कैन करें')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setScannerType('physical_bilty');
                  setShowOcrModal(true);
                }}
                style={{ padding: '10px 20px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                📜 {t('Scan Physical Bilty (Waybill)', 'फिजिकल बिल्टी (वेबिल) स्कैन करें')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* OCR MODAL LAUNCHER */}
      {showOcrModal && (
        <AiOcrScannerModal
          initialDocType={scannerType}
          onClose={() => setShowOcrModal(false)}
          onApplyExtractedData={(type, extracted) => {
            if (onApplyOcrData) onApplyOcrData(type, extracted);
          }}
        />
      )}
    </div>
  );
}
