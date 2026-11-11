import { useState, useEffect } from 'react';
import FleetTripExpenseManager from './FleetTripExpenseManager';
import VehicleMaintenanceRadar from './VehicleMaintenanceRadar';
import FleetFuelAntiTheftRadar from './FleetFuelAntiTheftRadar';
import ColdChainTemperatureRadar from './ColdChainTemperatureRadar';
import TyreLifecycleTpmsRadar from './TyreLifecycleTpmsRadar';
import FastagTollReconciliationDeck from './FastagTollReconciliationDeck';
import ErrorBoundary from './ErrorBoundary';

interface FleetOperationsDeckProps {
  initialTab?: 'expenses' | 'fastag_reconcile' | 'fuel_theft' | 'cold_chain' | 'maintenance' | 'mobile_driver' | 'tyre_radar';
  onTabChange?: (tab: 'expenses' | 'fastag_reconcile' | 'fuel_theft' | 'cold_chain' | 'maintenance' | 'mobile_driver' | 'tyre_radar') => void;
}

export default function FleetOperationsDeck({ initialTab = 'expenses', onTabChange }: FleetOperationsDeckProps) {
  const [activeTab, setActiveTab] = useState<'expenses' | 'fastag_reconcile' | 'fuel_theft' | 'cold_chain' | 'maintenance' | 'mobile_driver' | 'tyre_radar'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabClick = (tab: 'expenses' | 'fastag_reconcile' | 'fuel_theft' | 'cold_chain' | 'maintenance' | 'mobile_driver' | 'tyre_radar') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

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
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>
            <span>🚛</span> FLEET, EXPENSE &amp; DRIVER AUTOMATION
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Fleet Petty Cash, FASTag &amp; Dual-Control Operations Deck
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#a7f3d0', lineHeight: 1.5 }}>
            Audit diesel pump receipts, Fastag tolls, driver bhatta, and execute Dual-Control SuperAdmin approvals. Monitor fleet Parivahan RC, fitness, insurance, and traffic e-challans in real-time.
          </p>
        </div>
      </div>

      {/* SUB-TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border-color, #e2e8f0)', paddingBottom: '2px', overflowX: 'auto' }}>
        <button
          type="button"
          onClick={() => handleTabClick('expenses')}
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
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <span>⛽</span> Trip Petty Cash &amp; Dual-Control P&amp;L
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('fastag_reconcile')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'fastag_reconcile' ? '#38bdf8' : 'var(--text-secondary, #94a3b8)',
            borderBottom: activeTab === 'fastag_reconcile' ? '3px solid #0284c7' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <span>🏷️</span> FASTag NETC Toll Reconciliation
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('fuel_theft')}
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
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <span>🚨</span> Fuel Sensor &amp; Diesel Anti-Theft
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('cold_chain')}
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
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <span>❄️</span> IoT Cold-Chain Temp Radar
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('maintenance')}
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
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <span>🛡️</span> Parivahan RC, Fitness &amp; Challan Radar
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('tyre_radar')}
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
            gap: '8px',
            whiteSpace: 'nowrap'
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

        {activeTab === 'fastag_reconcile' && (
          <ErrorBoundary fallbackTitle="FASTag Toll Reconciliation Error">
            <FastagTollReconciliationDeck />
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
