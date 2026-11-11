import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Percent,
  IndianRupee,
  Plus,
  RotateCcw,
  RefreshCw,
  Search,
  X,
  Copy,
  Check,
  Sliders,
  CheckCircle2,
  Trash2,
  Lock,
  Globe,
  Activity,
  Layers,
  Truck,
  Gauge,
  Zap
} from 'lucide-react';
import { type SystemSettingItem, updateSystemSetting, deleteSystemSetting } from '../api/adminApi';
import './SystemSettingsDeck.css';

export interface SystemSettingsDeckProps {
  settingsList: SystemSettingItem[];
  settingsLoading: boolean;
  editingSettings: { [key: string]: string };
  setEditingSettings: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  savingKey: string | null;
  onSaveSetting: (item: SystemSettingItem) => Promise<void>;
  onRefresh: () => Promise<void>;
  showToast: (msg: string) => void;
  onDeleteSetting?: (id: number) => Promise<void>;
}

// Convert technical key to clean human title
function formatHumanTitle(key: string): string {
  const map: Record<string, string> = {
    GlobalGstRate: 'Standard Freight GST Rate',
    DefaultCreditLimit: 'Default Corporate Client Credit Limit',
    FastagAutoRechargeThreshold: 'FASTag Auto-Recharge Balance Floor',
    Ais140OverspeedLimit: 'AIS-140 Highway Speed Limit Alert',
    PlatformMaintenanceMode: 'Platform Emergency Maintenance Freeze',
    FREIGHT_FUEL_SURCHARGE_PCT: 'National Diesel Fuel Surcharge Index',
    FREIGHT_GST_RATE_PCT: 'Statutory GST Rate on Cargo (SAC 9965)',
    MINIMUM_BASE_FARE_INR: 'Minimum Consignment Base Fare Floor',
    EWAY_BILL_THRESHOLD_INR: 'Mandatory NIC e-Way Bill Threshold',
    SYSTEM_MAINTENANCE_MODE: 'Platform Emergency Maintenance Freeze',
  };

  if (map[key]) return map[key];

  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b(Inr|Pct|Gst|Sac|Ais|Eway)\b/gi, m => m.toUpperCase())
    .trim();
}

// Format numbers in Indian currency style
function formatInr(val: number): string {
  if (isNaN(val)) return '₹0';
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Crore`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
}

// Intelligent type detector for any setting key/value
type SettingType = 'boolean' | 'percentage' | 'currency' | 'speed' | 'number' | 'text';

function getSettingType(key: string, value: string): SettingType {
  const k = key.toLowerCase();
  const v = String(value).toLowerCase().trim();

  // Boolean check
  if (
    v === 'true' ||
    v === 'false' ||
    k.includes('maintenance') ||
    k.includes('freeze') ||
    k.includes('enable') ||
    k.includes('disable') ||
    k.includes('mode')
  ) {
    if (v === 'true' || v === 'false' || !v || isNaN(Number(v))) {
      return 'boolean';
    }
  }

  // Percentage check
  if (
    k.includes('rate') ||
    k.includes('pct') ||
    k.includes('percent') ||
    k.includes('gst') ||
    k.includes('tax') ||
    k.includes('margin') ||
    k.includes('surcharge')
  ) {
    return 'percentage';
  }

  // Speed check
  if (k.includes('speed') || k.includes('overspeed') || k.includes('kmph') || k.includes('kmh')) {
    return 'speed';
  }

  // Currency check
  if (
    k.includes('limit') ||
    k.includes('credit') ||
    k.includes('threshold') ||
    k.includes('fare') ||
    k.includes('amount') ||
    k.includes('inr') ||
    k.includes('fee') ||
    k.includes('price') ||
    k.includes('cost') ||
    k.includes('recharge')
  ) {
    return 'currency';
  }

  // Number check
  if (!isNaN(Number(v)) && v !== '') {
    return 'number';
  }

  return 'text';
}

export const SystemSettingsDeck: React.FC<SystemSettingsDeckProps> = ({
  settingsList,
  settingsLoading,
  editingSettings,
  setEditingSettings,
  savingKey,
  onSaveSetting,
  onRefresh,
  showToast,
  onDeleteSetting,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [justSavedKey, setJustSavedKey] = useState<string | null>(null);

  // Add Custom Parameter Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newKey, setNewKey] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [newGroup, setNewGroup] = useState<string>('Taxation');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newIsPublic, setNewIsPublic] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Calculate live platform status & stats
  const totalCount = settingsList.length;
  const publicCount = settingsList.filter(s => s.isPublic).length;
  const privateCount = settingsList.filter(s => !s.isPublic).length;

  // Check maintenance state across any maintenance key
  const maintenanceSetting = settingsList.find(s => 
    s.key === 'PlatformMaintenanceMode' || s.key === 'SYSTEM_MAINTENANCE_MODE'
  );
  const currentMaintenanceVal = maintenanceSetting
    ? (editingSettings[maintenanceSetting.key] ?? maintenanceSetting.value)
    : 'false';
  const isMaintenanceMode = currentMaintenanceVal === 'true';

  // Discover dynamic categories
  const discoveredGroups = Array.from(new Set(settingsList.map(s => s.group))).filter(Boolean);
  const allGroups = Array.from(new Set([...discoveredGroups, 'Taxation', 'Finance', 'Fleet', 'Safety', 'System']));

  const getGroupIcon = (group: string) => {
    const g = group.toLowerCase();
    if (g.includes('tax') || g.includes('gst')) return Percent;
    if (g.includes('finance') || g.includes('pricing') || g.includes('credit')) return IndianRupee;
    if (g.includes('fleet') || g.includes('truck')) return Truck;
    if (g.includes('safety') || g.includes('speed') || g.includes('ais')) return Gauge;
    if (g.includes('system') || g.includes('core')) return ShieldCheck;
    if (g.includes('compliance') || g.includes('eway')) return AlertTriangle;
    return Sliders;
  };

  // Copy to clipboard
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    showToast(`Key "${key}" copied to clipboard`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Step handler
  const handleStep = (key: string, delta: number, type: SettingType) => {
    const currentValStr = editingSettings[key] ?? settingsList.find(s => s.key === key)?.value ?? '0';
    let currentVal = parseFloat(currentValStr);
    if (isNaN(currentVal)) currentVal = 0;
    let nextVal = currentVal + delta;

    if (type === 'percentage') {
      if (nextVal < 0) nextVal = 0;
      if (nextVal > 100) nextVal = 100;
    } else if (type === 'currency' || type === 'speed' || type === 'number') {
      if (nextVal < 0) nextVal = 0;
    }

    setEditingSettings(prev => ({
      ...prev,
      [key]: String(nextVal)
    }));
  };

  // Save handler with visual feedback
  const handleSaveWithFeedback = async (item: SystemSettingItem) => {
    await onSaveSetting(item);
    setJustSavedKey(item.key);
    setTimeout(() => {
      setJustSavedKey(null);
    }, 2500);
  };

  // Add new parameter
  const handleAddParameter = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedKey = newKey.trim();
    if (!sanitizedKey) {
      showToast('Please provide a valid Parameter Key');
      return;
    }
    if (!newValue.trim()) {
      showToast('Please provide a Parameter Value');
      return;
    }

    try {
      setIsAdding(true);
      await updateSystemSetting({
        key: sanitizedKey,
        value: newValue.trim(),
        group: newGroup,
        description: newDescription.trim() || undefined,
        isPublic: newIsPublic,
      });
      showToast(`Dynamic parameter "${sanitizedKey}" added successfully!`);
      setShowAddModal(false);
      setNewKey('');
      setNewValue('');
      setNewDescription('');
      await onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to create parameter');
    } finally {
      setIsAdding(false);
    }
  };

  // Delete handler
  const handleDelete = async (item: SystemSettingItem) => {
    if (!item.id) {
      showToast('This core parameter cannot be deleted.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete parameter "${item.key}"? This may impact downstream pricing and operations.`)) {
      try {
        if (onDeleteSetting) {
          await onDeleteSetting(item.id);
        } else {
          await deleteSystemSetting(item.id);
        }
        showToast(`Parameter "${item.key}" deleted.`);
        await onRefresh();
      } catch (err: any) {
        showToast(err?.message || 'Failed to delete parameter');
      }
    }
  };

  // Reset defaults handler
  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all primary system parameters to enterprise factory standards?')) {
      return;
    }
    try {
      await updateSystemSetting({ key: 'GlobalGstRate', value: '18', group: 'Taxation', isPublic: true, description: 'Standard GST rate % applied to freight and forwarding services' });
      await updateSystemSetting({ key: 'DefaultCreditLimit', value: '500000', group: 'Finance', isPublic: false, description: 'Default credit limit granted to new verified corporate clients (INR)' });
      await updateSystemSetting({ key: 'FastagAutoRechargeThreshold', value: '1500', group: 'Fleet', isPublic: false, description: 'Low balance threshold to trigger automated FASTag top-up (INR)' });
      await updateSystemSetting({ key: 'Ais140OverspeedLimit', value: '65', group: 'Safety', isPublic: true, description: 'Maximum commercial highway convoy speed (km/h) before alerting command centre' });
      await updateSystemSetting({ key: 'PlatformMaintenanceMode', value: 'false', group: 'System', isPublic: false, description: 'Emergency lock to disable external shipper booking submissions' });
      showToast('✓ Platform parameters synchronized to standard factory configuration.');
      await onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to reset defaults');
    }
  };

  // Filter settings
  const filteredList = settingsList.filter(item => {
    const categoryMatch = selectedCategory === 'ALL' || item.group.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const searchMatch = !query || 
      item.key.toLowerCase().includes(query) || 
      item.group.toLowerCase().includes(query) || 
      formatHumanTitle(item.key).toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query));

    return categoryMatch && searchMatch;
  });

  return (
    <div className="ssd-container">
      {/* 1. HERO HEADER */}
      <div className="ssd-hero">
        <div className="ssd-hero-left">
          <div className="ssd-hero-badge">
            <span className="ssd-pulse-dot" />
            <span>ENTERPRISE RUNTIME CONTROLS</span>
          </div>
          <h1>System Settings &amp; Platform Configuration</h1>
          <p>
            Configure live freight tariffs, statutory GST rates, FASTag automation, highway speed thresholds, and emergency maintenance controls in real-time.
          </p>
        </div>

        <div className="ssd-hero-actions">
          <button
            type="button"
            className="ssd-btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            <span>+ Add Dynamic Parameter</span>
          </button>

          <button
            type="button"
            className="ssd-btn-secondary"
            onClick={onRefresh}
            disabled={settingsLoading}
            title="Reload settings from database"
          >
            <RefreshCw size={15} className={settingsLoading ? 'animate-spin' : ''} />
            <span>{settingsLoading ? 'Syncing...' : 'Refresh Config'}</span>
          </button>

          <button
            type="button"
            className="ssd-btn-ghost"
            onClick={handleResetDefaults}
            title="Reset standard values to factory defaults"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* 2. PLATFORM STATUS KPI STRIP */}
      <div className="ssd-kpi-strip">
        <div className="ssd-kpi-card">
          <div className="ssd-kpi-icon blue">
            <Layers size={22} />
          </div>
          <div className="ssd-kpi-meta">
            <span className="ssd-kpi-label">Active Parameters</span>
            <span className="ssd-kpi-value">{totalCount} Configs</span>
            <span className="ssd-kpi-sub">Runtime hot-reloaded</span>
          </div>
        </div>

        <div className="ssd-kpi-card">
          <div className={`ssd-kpi-icon ${isMaintenanceMode ? 'amber' : 'emerald'}`}>
            <Activity size={22} />
          </div>
          <div className="ssd-kpi-meta">
            <span className="ssd-kpi-label">Platform State</span>
            <span className="ssd-kpi-value" style={{ color: isMaintenanceMode ? '#ef4444' : '#10b981' }}>
              {isMaintenanceMode ? '🔴 Maintenance' : '🟢 Operational'}
            </span>
            <span className="ssd-kpi-sub">
              {isMaintenanceMode ? 'Public Bookings Paused' : 'All Portals Live'}
            </span>
          </div>
        </div>

        <div className="ssd-kpi-card">
          <div className="ssd-kpi-icon emerald">
            <Globe size={22} />
          </div>
          <div className="ssd-kpi-meta">
            <span className="ssd-kpi-label">API Visibility</span>
            <span className="ssd-kpi-value">{publicCount} Public / {privateCount} Core</span>
            <span className="ssd-kpi-sub">Zero-Trust IAM Protected</span>
          </div>
        </div>

        <div className="ssd-kpi-card">
          <div className="ssd-kpi-icon purple">
            <Zap size={22} />
          </div>
          <div className="ssd-kpi-meta">
            <span className="ssd-kpi-label">Hot-Swap Latency</span>
            <span className="ssd-kpi-value">&lt; 10ms</span>
            <span className="ssd-kpi-sub">Zero Microservice Downtime</span>
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR: DYNAMIC CATEGORY TABS & SEARCH */}
      <div className="ssd-toolbar">
        <div className="ssd-tabs">
          <button
            type="button"
            className={`ssd-tab-btn ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            <Layers size={14} />
            <span>All Settings</span>
            <span className="ssd-tab-count">{totalCount}</span>
          </button>

          {allGroups.map(group => {
            const Icon = getGroupIcon(group);
            const count = settingsList.filter(s => s.group.toLowerCase() === group.toLowerCase()).length;
            const isActive = selectedCategory.toLowerCase() === group.toLowerCase();

            return (
              <button
                key={group}
                type="button"
                className={`ssd-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(group)}
              >
                <Icon size={14} />
                <span>{group}</span>
                <span className="ssd-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="ssd-search-box">
          <Search size={15} className="ssd-search-icon" />
          <input
            type="text"
            className="ssd-search-input"
            placeholder="Search parameter, group, or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="ssd-search-clear"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 4. SETTINGS GRID */}
      {filteredList.length === 0 ? (
        <div className="ssd-empty">
          <Sliders size={40} style={{ color: '#94a3b8' }} />
          <h3>No settings matching your query</h3>
          <p>Try clearing your category filter or adjusting search terms.</p>
          <button
            type="button"
            className="ssd-btn-secondary"
            onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="ssd-grid">
          {filteredList.map(item => {
            const currentValue = editingSettings[item.key] ?? item.value;
            const isSaving = savingKey === item.key;
            const isSaved = justSavedKey === item.key;
            const isDirty = currentValue !== item.value;
            const type = getSettingType(item.key, currentValue);
            const humanTitle = formatHumanTitle(item.key);
            const groupClass = item.group.toLowerCase();

            return (
              <div key={item.key} className={`ssd-card ${isDirty ? 'is-dirty' : ''}`}>
                <div className="ssd-card-top-region">
                  {/* Category Pill + Technical Key */}
                  <div className="ssd-card-header">
                    <span className={`ssd-group-badge ${groupClass}`}>
                      {item.group}
                    </span>

                    <div className="ssd-key-box" title="Click icon to copy parameter key">
                      <code>{item.key}</code>
                      <button
                        type="button"
                        className="ssd-key-copy"
                        onClick={() => handleCopyKey(item.key)}
                        title="Copy Key"
                      >
                        {copiedKey === item.key ? (
                          <Check size={12} color="#10b981" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Human Title & Description */}
                  <div className="ssd-card-body">
                    <h3 className="ssd-card-human-title">{humanTitle}</h3>
                    <p className="ssd-card-desc">
                      {item.description || `Controls runtime logic for ${humanTitle}.`}
                    </p>

                    {/* Specialized Interactive Controls */}
                    {type === 'boolean' ? (
                      /* 1. BOOLEAN / MAINTENANCE TOGGLE */
                      <div className="ssd-boolean-container">
                        <div className="ssd-toggle-segmented">
                          <button
                            type="button"
                            className={`ssd-toggle-opt ${currentValue !== 'true' ? 'active-operational' : ''}`}
                            onClick={() => setEditingSettings({ ...editingSettings, [item.key]: 'false' })}
                          >
                            <CheckCircle2 size={15} />
                            <span>Operational / Active</span>
                          </button>
                          <button
                            type="button"
                            className={`ssd-toggle-opt ${currentValue === 'true' ? 'active-maintenance' : ''}`}
                            onClick={() => setEditingSettings({ ...editingSettings, [item.key]: 'true' })}
                          >
                            <AlertTriangle size={15} />
                            <span>Freeze / Maintenance</span>
                          </button>
                        </div>
                        <div className="ssd-val-preview">
                          Status: <strong style={{ color: currentValue === 'true' ? '#ef4444' : '#10b981' }}>
                            {currentValue === 'true' ? 'LOCKED / DISABLED' : 'LIVE / ACCEPTING BOOKINGS'}
                          </strong>
                        </div>
                      </div>
                    ) : type === 'currency' ? (
                      /* 2. CURRENCY / CREDIT LIMIT / FASTAG FLOOR */
                      <div className="ssd-input-wrapper-block">
                        <div className="ssd-input-group">
                          <button
                            type="button"
                            className="ssd-stepper-btn"
                            onClick={() => handleStep(item.key, parseFloat(currentValue) >= 50000 ? -25000 : -500, 'currency')}
                            title="Decrement"
                          >
                            {parseFloat(currentValue) >= 50000 ? '-₹25K' : '-₹500'}
                          </button>

                          <div className="ssd-input-wrapper">
                            <span className="ssd-input-prefix">₹</span>
                            <input
                              type="number"
                              className="ssd-input has-prefix"
                              value={currentValue}
                              onChange={e => setEditingSettings({ ...editingSettings, [item.key]: e.target.value })}
                            />
                          </div>

                          <button
                            type="button"
                            className="ssd-stepper-btn"
                            onClick={() => handleStep(item.key, parseFloat(currentValue) >= 50000 ? 25000 : 500, 'currency')}
                            title="Increment"
                          >
                            {parseFloat(currentValue) >= 50000 ? '+₹25K' : '+₹500'}
                          </button>
                        </div>

                        {/* Quick Presets & Formatted Value */}
                        <div className="ssd-presets-row">
                          <span className="ssd-preset-summary">
                            Formatted: <strong>{formatInr(parseFloat(currentValue))}</strong>
                          </span>
                          <div className="ssd-preset-chips">
                            {parseFloat(currentValue) >= 50000 ? (
                              [100000, 250000, 500000, 1000000, 2500000].map(amt => (
                                <button
                                  key={amt}
                                  type="button"
                                  className={`ssd-preset-chip ${parseFloat(currentValue) === amt ? 'active' : ''}`}
                                  onClick={() => setEditingSettings({ ...editingSettings, [item.key]: String(amt) })}
                                >
                                  {amt >= 100000 ? `₹${amt / 100000}L` : `₹${amt}`}
                                </button>
                              ))
                            ) : (
                              [500, 1000, 1500, 2500, 5000].map(amt => (
                                <button
                                  key={amt}
                                  type="button"
                                  className={`ssd-preset-chip ${parseFloat(currentValue) === amt ? 'active' : ''}`}
                                  onClick={() => setEditingSettings({ ...editingSettings, [item.key]: String(amt) })}
                                >
                                  ₹{amt}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    ) : type === 'percentage' ? (
                      /* 3. PERCENTAGE / GST RATE */
                      <div className="ssd-input-wrapper-block">
                        <div className="ssd-input-group">
                          <button
                            type="button"
                            className="ssd-stepper-btn"
                            onClick={() => handleStep(item.key, -1, 'percentage')}
                            title="Decrement 1%"
                          >
                            -1%
                          </button>

                          <div className="ssd-input-wrapper">
                            <input
                              type="number"
                              className="ssd-input has-suffix"
                              value={currentValue}
                              onChange={e => setEditingSettings({ ...editingSettings, [item.key]: e.target.value })}
                            />
                            <span className="ssd-input-suffix">%</span>
                          </div>

                          <button
                            type="button"
                            className="ssd-stepper-btn"
                            onClick={() => handleStep(item.key, 1, 'percentage')}
                            title="Increment 1%"
                          >
                            +1%
                          </button>
                        </div>

                        {/* Standard GST / Surcharge Chips */}
                        <div className="ssd-presets-row">
                          <span className="ssd-preset-summary">Standard Slabs:</span>
                          <div className="ssd-preset-chips">
                            {[0, 5, 12, 18, 28].map(rate => (
                              <button
                                key={rate}
                                type="button"
                                className={`ssd-preset-chip ${parseFloat(currentValue) === rate ? 'active' : ''}`}
                                onClick={() => setEditingSettings({ ...editingSettings, [item.key]: String(rate) })}
                              >
                                {rate}% {rate === 18 ? '(Std)' : rate === 5 ? '(RCM)' : ''}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : type === 'speed' ? (
                      /* 4. SPEED LIMIT / AIS-140 */
                      <div className="ssd-input-wrapper-block">
                        <div className="ssd-input-group">
                          <button
                            type="button"
                            className="ssd-stepper-btn"
                            onClick={() => handleStep(item.key, -5, 'speed')}
                            title="Decrement 5 km/h"
                          >
                            -5
                          </button>

                          <div className="ssd-input-wrapper">
                            <input
                              type="number"
                              className="ssd-input has-suffix"
                              value={currentValue}
                              onChange={e => setEditingSettings({ ...editingSettings, [item.key]: e.target.value })}
                            />
                            <span className="ssd-input-suffix">km/h</span>
                          </div>

                          <button
                            type="button"
                            className="ssd-stepper-btn"
                            onClick={() => handleStep(item.key, 5, 'speed')}
                            title="Increment 5 km/h"
                          >
                            +5
                          </button>
                        </div>

                        {/* Highway Speed Limit Chips */}
                        <div className="ssd-presets-row">
                          <span className="ssd-preset-summary">Highway Convoy Limits:</span>
                          <div className="ssd-preset-chips">
                            {[40, 50, 60, 65, 80].map(spd => (
                              <button
                                key={spd}
                                type="button"
                                className={`ssd-preset-chip ${parseFloat(currentValue) === spd ? 'active' : ''}`}
                                onClick={() => setEditingSettings({ ...editingSettings, [item.key]: String(spd) })}
                              >
                                {spd} km/h
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 5. GENERIC NUMBER / TEXT */
                      <div className="ssd-input-wrapper-block">
                        <div className="ssd-input-wrapper">
                          <input
                            type="text"
                            className="ssd-input"
                            value={currentValue}
                            onChange={e => setEditingSettings({ ...editingSettings, [item.key]: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Visibility Tag + Save Button + Delete */}
                <div className="ssd-card-footer">
                  <div className="ssd-footer-left">
                    {item.isPublic ? (
                      <span className="ssd-tag-public" title="Exposed via public API endpoint (/api/system-settings/public)">
                        <Globe size={13} />
                        <span>Public API Access</span>
                      </span>
                    ) : (
                      <span className="ssd-tag-private" title="Private platform internal parameter">
                        <Lock size={13} />
                        <span>Private Platform Core</span>
                      </span>
                    )}
                  </div>

                  <div className="ssd-footer-right">
                    {/* Save Button */}
                    <button
                      type="button"
                      className={`ssd-save-btn ${isDirty ? 'is-dirty' : ''} ${isSaved ? 'is-saved' : ''}`}
                      disabled={isSaving}
                      onClick={() => handleSaveWithFeedback(item)}
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : isSaved ? (
                        <>
                          <Check size={13} />
                          <span>Saved!</span>
                        </>
                      ) : isDirty ? (
                        <>
                          <Zap size={13} />
                          <span>Save Changes</span>
                        </>
                      ) : (
                        <span>Save</span>
                      )}
                    </button>

                    {/* Delete (if removable) */}
                    {item.id && (
                      <button
                        type="button"
                        className="ssd-delete-btn"
                        onClick={() => handleDelete(item)}
                        title="Delete parameter"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. ADD PARAMETER MODAL */}
      {showAddModal && (
        <div className="ssd-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="ssd-modal" onClick={e => e.stopPropagation()}>
            <div className="ssd-modal-header">
              <div className="ssd-modal-title">
                <Sliders size={20} color="#2563eb" />
                <h2>Add Dynamic Platform Parameter</h2>
              </div>
              <button
                type="button"
                className="ssd-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddParameter} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="ssd-form-group">
                <label className="ssd-form-label">Parameter Key</label>
                <input
                  type="text"
                  className="ssd-form-input"
                  placeholder="e.g. MaxConsignmentWeightTons or NightHighwayHaltRate"
                  value={newKey}
                  onChange={e => setNewKey(e.target.value.replace(/\s+/g, ''))}
                  required
                />
              </div>

              <div className="ssd-form-group">
                <label className="ssd-form-label">Category Group</label>
                <select
                  className="ssd-form-select"
                  value={newGroup}
                  onChange={e => setNewGroup(e.target.value)}
                >
                  <option value="Taxation">Taxation &amp; GST</option>
                  <option value="Finance">Finance &amp; Credit</option>
                  <option value="Fleet">Fleet &amp; FASTag</option>
                  <option value="Safety">Safety &amp; Telematics</option>
                  <option value="System">System &amp; Platform</option>
                  <option value="Compliance">Statutory &amp; e-Way</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="ssd-form-group">
                <label className="ssd-form-label">Default Value</label>
                <input
                  type="text"
                  className="ssd-form-input"
                  placeholder="e.g. 1500, 18, or false"
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  required
                />
              </div>

              <div className="ssd-form-group">
                <label className="ssd-form-label">Human Description / Purpose</label>
                <textarea
                  className="ssd-form-input"
                  rows={2}
                  placeholder="Explain what this configuration controls in the logistics engine..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="ssdIsPublicCheck"
                  checked={newIsPublic}
                  onChange={e => setNewIsPublic(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                />
                <label htmlFor="ssdIsPublicCheck" style={{ fontSize: '13px', cursor: 'pointer', color: 'var(--text-secondary, #64748b)' }}>
                  Expose via Public API (<code style={{ fontSize: '11px' }}>/api/system-settings/public</code>)
                </label>
              </div>

              <div className="ssd-modal-footer">
                <button
                  type="button"
                  className="ssd-btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ssd-btn-primary"
                  disabled={isAdding}
                >
                  {isAdding ? 'Adding...' : 'Create Parameter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettingsDeck;
