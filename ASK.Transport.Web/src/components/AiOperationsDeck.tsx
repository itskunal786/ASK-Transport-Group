import { useState } from 'react';
import AiTruckLoadVisualizer from './AiTruckLoadVisualizer';
import AiOcrScannerModal from './AiOcrScannerModal';
import AiRouteCostPredictor from './AiRouteCostPredictor';

export default function AiOperationsDeck({
  onApplyOcrData
}: {
  onApplyOcrData?: (docType: string, data: Record<string, any>) => void;
}) {
  const [activeDeckTab, setActiveDeckTab] = useState<'3d_load' | 'ocr_scanner' | 'route_predictor'>('3d_load');
  const [showOcrModal, setShowOcrModal] = useState<boolean>(false);
  const [scannerType, setScannerType] = useState<'driving_license' | 'vehicle_rc' | 'physical_bilty'>('driving_license');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* TOP AI BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px -5px rgba(67, 56, 202, 0.4)'
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>
            <span>⚡</span> NEXT-GEN LOGISTICS AUTOMATION
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            AI Operations Deck &amp; Optimization Hub
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#c7d2fe', lineHeight: 1.5 }}>
            Harness real-time 3D bin packing, neural optical character recognition (OCR) for DL/RC/Bilty, and algorithmic highway route, Fastag toll &amp; fuel expense prediction.
          </p>
        </div>

        {/* QUICK OCR SCANNER LAUNCHERS */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setScannerType('driving_license');
              setShowOcrModal(true);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🪪</span> Scan Driver DL
          </button>

          <button
            type="button"
            onClick={() => {
              setScannerType('vehicle_rc');
              setShowOcrModal(true);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🚛</span> Scan Truck RC
          </button>

          <button
            type="button"
            onClick={() => {
              setScannerType('physical_bilty');
              setShowOcrModal(true);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: '#38bdf8',
              border: 'none',
              color: '#0f172a',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.35)'
            }}
          >
            <span>📜</span> Scan Physical Bilty (LR)
          </button>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border-color, #e2e8f0)', paddingBottom: '2px' }}>
        <button
          type="button"
          onClick={() => setActiveDeckTab('3d_load')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeDeckTab === '3d_load' ? '#2563eb' : '#64748b',
            borderBottom: activeDeckTab === '3d_load' ? '3px solid #2563eb' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🚛</span> 3D Truck Load &amp; Volumetric Space Optimizer
        </button>

        <button
          type="button"
          onClick={() => setActiveDeckTab('route_predictor')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeDeckTab === 'route_predictor' ? '#2563eb' : '#64748b',
            borderBottom: activeDeckTab === 'route_predictor' ? '3px solid #2563eb' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🛣️</span> Smart Highway Route, Fastag Toll &amp; Fuel Predictor
        </button>

        <button
          type="button"
          onClick={() => setActiveDeckTab('ocr_scanner')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeDeckTab === 'ocr_scanner' ? '#2563eb' : '#64748b',
            borderBottom: activeDeckTab === 'ocr_scanner' ? '3px solid #2563eb' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📄</span> AI OCR Document Extraction Studio
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

        {activeDeckTab === 'ocr_scanner' && (
          <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
              AI Document Scanner &amp; MoRTH Verification Studio
            </h3>
            <p style={{ margin: '0 auto 20px', maxWidth: '540px', fontSize: '13px', color: 'var(--text-secondary, #64748b)' }}>
              Select a document type below to open the live neural scanner. The system reads DLs, Truck RCs and offline Bilty notes, verifies validity via Govt databases, and auto-fills registration forms with zero manual typing.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setScannerType('driving_license');
                  setShowOcrModal(true);
                }}
                style={{ padding: '12px 22px', borderRadius: '10px', background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                🪪 Scan Driver Driving License
              </button>

              <button
                type="button"
                onClick={() => {
                  setScannerType('vehicle_rc');
                  setShowOcrModal(true);
                }}
                style={{ padding: '12px 22px', borderRadius: '10px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                🚛 Scan Truck RC Book
              </button>

              <button
                type="button"
                onClick={() => {
                  setScannerType('physical_bilty');
                  setShowOcrModal(true);
                }}
                style={{ padding: '12px 22px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                📜 Scan Physical Bilty (Waybill)
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
