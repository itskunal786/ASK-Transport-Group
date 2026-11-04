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
  Flame,
  Activity,
  Layers
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

const CATEGORIES = [
  { id: 'ALL', label: 'All Settings', icon: Layers },
  { id: 'System', label: 'System & Platform', icon: ShieldCheck },
  { id: 'Pricing', label: 'Tariffs & Pricing', icon: IndianRupee },
  { id: 'Taxation', label: 'Taxation & GST', icon: Percent },
  { id: 'Compliance', label: 'Statutory & e-Way', icon: AlertTriangle },
  { id: 'Operations', label: 'Operational Rules', icon: Sliders },
];

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
  const [newGroup, setNewGroup] = useState<string>('Pricing');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newIsPublic, setNewIsPublic] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Key stats
  const totalCount = settingsList.length;
  const isMaintenanceMode = (editingSettings['SYSTEM_MAINTENANCE_MODE'] ?? 
    settingsList.find(s => s.key === 'SYSTEM_MAINTENANCE_MODE')?.value) === 'true';
  const fuelSurchargeVal = editingSettings['FREIGHT_FUEL_SURCHARGE_PCT'] ?? 
    settingsList.find(s => s.key === 'FREIGHT_FUEL_SURCHARGE_PCT')?.value ?? '10';
  const ewayThresholdVal = editingSettings['EWAY_BILL_THRESHOLD_INR'] ?? 
    settingsList.find(s => s.key === 'EWAY_BILL_THRESHOLD_INR')?.value ?? '50000';
  const gstRateVal = editingSettings['FREIGHT_GST_RATE_PCT'] ?? 
    settingsList.find(s => s.key === 'FREIGHT_GST_RATE_PCT')?.value ?? '18';

  // Copy to clipboard
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    showToast(`Key "${key}" copied to clipboard`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Stepper helper
  const handleStep = (key: string, delta: number, isPercent: boolean) => {
    const currentValStr = editingSettings[key] ?? settingsList.find(s => s.key === key)?.value ?? '0';
    let currentVal = parseFloat(currentValStr);
    if (isNaN(currentVal)) currentVal = 0;
    let nextVal = currentVal + delta;
    if (isPercent) {
      if (nextVal < 0) nextVal = 0;
      if (nextVal > 100) nextVal = 100;
    } else {
      if (nextVal < 0) nextVal = 0;
    }
    setEditingSettings(prev => ({
      ...prev,
      [key]: nextVal.toString()
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
    const sanitizedKey = newKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    if (!sanitizedKey) {
      showToast('Please provide a valid Parameter Key (e.g. HIGHWAY_NIGHT_HALT_RATE)');
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
      showToast(err?.message || 'Failed to add dynamic parameter');
    } finally {
      setIsAdding(false);
    }
  };

  // Delete parameter
  const handleDelete = async (item: SystemSettingItem) => {
    if (!item.id && !onDeleteSetting) {
      showToast(`Factory standard parameter "${item.key}" cannot be deleted.`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete parameter "${item.key}"? This action cannot be undone.`)) {
      return;
    }
    try {
      if (item.id) {
        await deleteSystemSetting(item.id);
      } else if (onDeleteSetting && item.id) {
        await onDeleteSetting(item.id);
      }
      showToast(`Parameter "${item.key}" deleted successfully`);
      await onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete setting');
    }
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all primary system settings to factory default values (10% Fuel Surcharge, 18% GST, ₹450 Base Fare, ₹50,000 e-Way Bill, Operational)?')) {
      return;
    }
    try {
      await updateSystemSetting({ key: 'FREIGHT_FUEL_SURCHARGE_PCT', value: '10', group: 'Pricing', isPublic: true, description: 'Percentage fuel surcharge applied on freight base rate' });
      await updateSystemSetting({ key: 'FREIGHT_GST_RATE_PCT', value: '18', group: 'Taxation', isPublic: true, description: 'Standard GST rate on road transport services (SAC 9965)' });
      await updateSystemSetting({ key: 'MINIMUM_BASE_FARE_INR', value: '450', group: 'Pricing', isPublic: true, description: 'Minimum base consignment charges' });
      await updateSystemSetting({ key: 'EWAY_BILL_THRESHOLD_INR', value: '50000', group: 'Compliance', isPublic: true, description: 'Mandatory e-Way bill consignment value limit' });
      await updateSystemSetting({ key: 'SYSTEM_MAINTENANCE_MODE', value: 'false', group: 'System', isPublic: true, description: 'Temporarily freeze customer bookings for system updates' });
      showToast('Primary platform parameters reset to factory defaults.');
      await onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to reset defaults');
    }
  };

  // Filter settings
  const filteredList = settingsList.filter(item => {
    // Category match
    const categoryMatch = selectedCategory === 'ALL' || item.group.toLowerCase() === selectedCategory.toLowerCase();
    // Search match
    const query = searchQuery.trim().toLowerCase();
    const searchMatch = !query || 
      item.key.toLowerCase().includes(query) || 
      item.group.toLowerCase().includes(query) || 
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
            <span>ENTERPRISE KERNEL CONFIGURATION</span>
          </div>
          <h1>Dynamic System Settings &amp; Platform Controls</h1>
          <p>
            Configure live freight tariffs, statutory GST rates, e-Way bill thresholds, and platform maintenance status without redeployment.
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
          >
            <RefreshCw size={15} className={settingsLoading ? 'animate-spin' : ''} />
            <span>{settingsLoading ? 'Syncing...' : 'Refresh Live Config'}</span>
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
          <div className="ssd-kpi-icon purple">
            <Flame size={22} />
          </div>
          <div className="ssd-kpi-meta">
            <span className="ssd-kpi-label">Fuel Surcharge Index</span>
            <span className="ssd-kpi-value">{fuelSurchargeVal}%</span>
            <span className="ssd-kpi-sub">National Diesel Baseline</span>
          </div>
        </div>

        <div className="ssd-kpi-card">
          <div className="ssd-kpi-icon amber">
            <AlertTriangle size={22} />
          </div>
          <div className="ssd-kpi-meta">
            <span className="ssd-kpi-label">e-Way Bill Floor</span>
            <span className="ssd-kpi-value">₹{parseInt(ewayThresholdVal, 10).toLocaleString('en-IN')}</span>
            <span className="ssd-kpi-sub">Statutory NIC Compliance</span>
          </div>
        </div>

        <div className="ssd-kpi-card">
          <div className="ssd-kpi-icon emerald">
            <Percent size={22} />
          </div>
          <div className="ssd-kpi-meta">
            <span className="ssd-kpi-label">Freight GST SAC 9965</span>
            <span className="ssd-kpi-value">{gstRateVal}%</span>
            <span className="ssd-kpi-sub">Standard Road Cargo</span>
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR: CATEGORY TABS & SEARCH */}
      <div className="ssd-toolbar">
        <div className="ssd-tabs">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const count = cat.id === 'ALL' 
              ? totalCount 
              : settingsList.filter(s => s.group.toLowerCase() === cat.id.toLowerCase()).length;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                className={`ssd-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
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
            placeholder="Search by key, category, or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="ssd-search-clear"
              onClick={() => setSearchQuery('')}
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
          <h3>No settings matching your search</h3>
          <p>Try adjusting your category filter or search keywords to locate system parameters.</p>
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
            const isPercent = item.key.includes('_PCT') || item.key.includes('_RATE');
            const isCurrency = item.key.includes('_INR') || item.key.includes('_FARE') || item.key.includes('_THRESHOLD');
            const isMaintenance = item.key === 'SYSTEM_MAINTENANCE_MODE';
            const groupClass = item.group.toLowerCase();

            return (
              <div key={item.key} className="ssd-card">
                <div>
                  <div className="ssd-card-header">
                    <span className={`ssd-group-badge ${groupClass}`}>
                      {item.group}
                    </span>

                    <div className="ssd-key-box" title="Click icon to copy parameter key">
                      <span>{item.key}</span>
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

                  <div className="ssd-card-body">
                    <p className="ssd-card-desc">
                      {item.description || item.key}
                    </p>

                    {/* Specialized Inputs */}
                    {isMaintenance ? (
                      <div className="ssd-toggle-container">
                        <div className="ssd-toggle-segmented">
                          <button
                            type="button"
                            className={`ssd-toggle-opt ${currentValue !== 'true' ? 'active-operational' : ''}`}
                            onClick={() => setEditingSettings({ ...editingSettings, [item.key]: 'false' })}
                          >
                            <CheckCircle2 size={14} />
                            <span>Operational</span>
                          </button>
                          <button
                            type="button"
                            className={`ssd-toggle-opt ${currentValue === 'true' ? 'active-maintenance' : ''}`}
                            onClick={() => setEditingSettings({ ...editingSettings, [item.key]: 'true' })}
                          >
                            <AlertTriangle size={14} />
                            <span>Freeze / Maintenance</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="ssd-input-group">
                        {isPercent && (
                          <button
                            type="button"
                            className="ssd-stepper-btn"
                            onClick={() => handleStep(item.key, -1, true)}
                            title="Decrement 1%"
                          >
                            -1%
                          </button>
                        )}
                        {isCurrency && (
                          <button
                            type="button"
                            className="ssd-stepper-btn"
                            onClick={() => handleStep(item.key, -500, false)}
                            title="Decrement ₹500"
                          >
                            -₹500
                          </button>
                        )}

                        <div className="ssd-input-wrapper">
                          {isCurrency && <span className="ssd-input-prefix">₹</span>}
                          {isPercent && <span className="ssd-input-prefix">%</span>}
                          <input
                            type="text"
                            className={`ssd-input ${(isCurrency || isPercent) ? 'has-prefix' : ''}`}
                            value={currentValue}
                            onChange={e => setEditingSettings({ ...editingSettings, [item.key]: e.target.value })}
                          />
                        </div>

                        {isPercent && (
                          <button
                            type="button"
                            className="ssd-stepper-btn"
                            onClick={() => handleStep(item.key, 1, true)}
                            title="Increment 1%"
                          >
                            +1%
                          </button>
                        )}
                        {isCurrency && (
                          <button
                            type="button"
                            className="ssd-stepper-btn"
                            onClick={() => handleStep(item.key, 500, false)}
                            title="Increment ₹500"
                          >
                            +₹500
                          </button>
                        )}

                        <button
                          type="button"
                          className={`ssd-save-btn ${isSaved ? 'saved' : ''}`}
                          onClick={() => handleSaveWithFeedback(item)}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : isSaved ? (
                            <>
                              <Check size={14} />
                              <span>Saved!</span>
                            </>
                          ) : (
                            <span>Save</span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Maintenance mode standalone save button */}
                    {isMaintenance && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                        <button
                          type="button"
                          className={`ssd-save-btn ${isSaved ? 'saved' : ''}`}
                          onClick={() => handleSaveWithFeedback(item)}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : isSaved ? (
                            <>
                              <Check size={14} />
                              <span>State Saved!</span>
                            </>
                          ) : (
                            <span>Update Platform State</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ssd-card-footer">
                  <div className="ssd-sync-badge">
                    {item.isPublic ? <Globe size={13} /> : <Lock size={13} />}
                    <span>{item.isPublic ? 'Public API Access' : 'Private Platform Core'}</span>
                  </div>

                  {item.id && (
                    <button
                      type="button"
                      className="ssd-delete-btn"
                      onClick={() => handleDelete(item)}
                      title="Delete dynamic setting"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  )}
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
                <label className="ssd-form-label">Parameter Key (Uppercase SNAKE_CASE)</label>
                <input
                  type="text"
                  className="ssd-form-input"
                  placeholder="e.g. HIGHWAY_NIGHT_HALT_RATE_INR"
                  value={newKey}
                  onChange={e => setNewKey(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
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
                  <option value="Pricing">Pricing &amp; Tariffs</option>
                  <option value="Taxation">Taxation &amp; GST</option>
                  <option value="Compliance">Statutory &amp; Compliance</option>
                  <option value="System">System &amp; Platform</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="ssd-form-group">
                <label className="ssd-form-label">Default Value</label>
                <input
                  type="text"
                  className="ssd-form-input"
                  placeholder="e.g. 1500 or true"
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
