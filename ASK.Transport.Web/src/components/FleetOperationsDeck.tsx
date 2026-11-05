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
            color: activeTab === 'expenses' ? '#10b981' : 'var(--text-secondary, #94a3b8)',
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
            color: activeTab === 'fuel_theft' ? '#ef4444' : 'var(--text-secondary, #94a3b8)',
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
            color: activeTab === 'cold_chain' ? '#38bdf8' : 'var(--text-secondary, #94a3b8)',
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
            color: activeTab === 'maintenance' ? '#10b981' : 'var(--text-secondary, #94a3b8)',
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
            color: activeTab === 'tyre_radar' ? '#f97316' : 'var(--text-secondary, #94a3b8)',
            borderBottom: activeTab === 'tyre_radar' ? '3px solid #ea580c' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🛞</span> Tyre &amp; TPMS Radar
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

        
      </div>
    </div>
  );
}
