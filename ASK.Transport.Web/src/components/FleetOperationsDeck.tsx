import { useState, useEffect } from 'react';
import FleetTripExpenseManager from './FleetTripExpenseManager';
import VehicleMaintenanceRadar from './VehicleMaintenanceRadar';
import FleetFuelAntiTheftRadar from './FleetFuelAntiTheftRadar';
import ColdChainTemperatureRadar from './ColdChainTemperatureRadar';
import TyreLifecycleTpmsRadar from './TyreLifecycleTpmsRadar';
import ErrorBoundary from './ErrorBoundary';

interface FleetOperationsDeckProps {
  initialTab?: 'expenses' | 'fuel_theft' | 'cold_chain' | 'maintenance' | 'mobile_driver' | 'tyre_radar';
}

export default function FleetOperationsDeck({ initialTab = 'expenses' }: FleetOperationsDeckProps) {
  const [activeTab, setActiveTab] = useState<'expenses' | 'fuel_theft' | 'cold_chain' | 'maintenance' | 'mobile_driver' | 'tyre_radar'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.4)'
        }}
      >
        <div style={{ maxWidth: '620px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>
            <span>🚛</span> FLEET, EXPENSE &amp; DRIVER AUTOMATION
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Fleet Petty Cash &amp; Trip P&amp;L Operations Deck
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#a7f3d0', lineHeight: 1.5 }}>
            Audit diesel pump receipts, Fastag tolls, driver food bhatta, and inspect real-time Trip Gross Margin vs Net Profit. Monitor fleet insurance, fitness, PUC and national permit expiration alerts.
          </p>
        </div>

        {/* DRIVER CONSOLE SHORTCUT */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href="/driver"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '11px 18px',
              borderRadius: '10px',
              background: '#ffffff',
              color: '#065f46',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <span>📱</span> Launch Mobile Driver App
          </a>
        </div>
      </div>

      {/* SUB-TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border-color, #e2e8f0)', paddingBottom: '2px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'expenses' ? '#059669' : '#64748b',
            borderBottom: activeTab === 'expenses' ? '3px solid #059669' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>⛽</span> Trip Petty Cash, Diesel &amp; Real-time P&amp;L
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fuel_theft')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'fuel_theft' ? '#dc2626' : '#64748b',
            borderBottom: activeTab === 'fuel_theft' ? '3px solid #dc2626' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🚨</span> Fuel Sensor &amp; Diesel Anti-Theft Radar
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cold_chain')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'cold_chain' ? '#0284c7' : '#64748b',
            borderBottom: activeTab === 'cold_chain' ? '3px solid #0284c7' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>❄️</span> IoT Cold-Chain &amp; Temp Radar
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('maintenance')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'maintenance' ? '#059669' : '#64748b',
            borderBottom: activeTab === 'maintenance' ? '3px solid #059669' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🛡️</span> Vehicle Fitness, Insurance &amp; Permit Renewal Radar
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tyre_radar')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'tyre_radar' ? '#ea580c' : '#64748b',
            borderBottom: activeTab === 'tyre_radar' ? '3px solid #ea580c' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🛞</span> Tyre &amp; TPMS Radar
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mobile_driver')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'mobile_driver' ? '#059669' : '#64748b',
            borderBottom: activeTab === 'mobile_driver' ? '3px solid #059669' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📱</span> Driver Mobile Mode Preview (Hindi/Bilingual)
        </button>
      </div>

      {/* VIEWPORT */}
      <div>
        {activeTab === 'expenses' && (
          <ErrorBoundary fallbackTitle="Driver Trip Expenses Error">
            <FleetTripExpenseManager />
          </ErrorBoundary>
        )}

        {activeTab === 'fuel_theft' && (
          <ErrorBoundary fallbackTitle="Diesel Anti-Theft Radar Error">
            <FleetFuelAntiTheftRadar />
          </ErrorBoundary>
        )}

        {activeTab === 'cold_chain' && (
          <ErrorBoundary fallbackTitle="Cold-Chain Temperature Radar Error">
            <ColdChainTemperatureRadar />
          </ErrorBoundary>
        )}

        {activeTab === 'maintenance' && (
          <ErrorBoundary fallbackTitle="Vehicle Maintenance Radar Error">
            <VehicleMaintenanceRadar />
          </ErrorBoundary>
        )}

        {activeTab === 'tyre_radar' && (
          <ErrorBoundary fallbackTitle="Tyre &amp; TPMS Radar Error">
            <TyreLifecycleTpmsRadar />
          </ErrorBoundary>
        )}

        {activeTab === 'mobile_driver' && (
          <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📱</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
              Dedicated Mobile Driver App Mode (Hindi + English)
            </h3>
            <p style={{ margin: '0 auto 20px', maxWidth: '540px', fontSize: '13px', color: 'var(--text-secondary, #64748b)' }}>
              A high-contrast mobile interface designed specifically for truck drivers on highway routes. Includes 1-tap Google Maps consignee navigation, Diesel &amp; Toll slip capture, Customer Delivery OTP verification, and Physical POD Bilty photo upload.
            </p>

            <a
              href="/driver"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 26px',
                background: '#059669',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)'
              }}
            >
              🚀 Open /driver Console in Mobile Viewport
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
