import './VehicleMaintenanceRadar.css';
import { useEffect, useState } from 'react';
import {
  getFleetMaintenanceAlerts,
  sendVehicleRenewalAlert,
  type VehicleMaintenanceAlert,
  type FleetMaintenanceSummary
} from '../api/fleetApi';

export default function VehicleMaintenanceRadar() {
  const [data, setData] = useState<FleetMaintenanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterHealth, setFilterHealth] = useState<'All' | 'Critical' | 'Warning' | 'Healthy'>('All');
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState<string>('');

  async function loadData() {
    try {
      setLoading(true);
      const res = await getFleetMaintenanceAlerts();
      setData(res);
    } catch (err) {
      console.error('Error loading maintenance alerts:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSendAlert(vehicle: VehicleMaintenanceAlert) {
    try {
      setSendingId(vehicle.vehicleId);
      await sendVehicleRenewalAlert(vehicle.vehicleId, vehicle.driverPhone);
      setAlertSuccessMsg(`✓ WhatsApp & SMS Alert dispatched to ${vehicle.driverName} (${vehicle.vehicleNumber})!`);
      setTimeout(() => setAlertSuccessMsg(''), 6000);
    } catch (err: any) {
      alert('Failed to send alert: ' + err?.message);
    } finally {
      setSendingId(null);
    }
  }

  const list = (data?.fleetAlerts || []).filter(v => {
    if (filterHealth === 'All') return true;
    return v.overallHealthStatus === filterHealth;
  });

  return (
    <div className="maintenance-radar-container">
      {/* HEADER & SUMMARY COUNTERS */}
      <div className="maintenance-kpi-grid">
        <div className="maintenance-kpi-card critical">
          <span className="maintenance-kpi-label">CRITICAL / EXPIRED</span>
          <strong className="maintenance-kpi-val" style={{ color: '#ef4444' }}>
            {data?.summary?.criticalCount ?? 0} Trucks
          </strong>
          <span style={{ fontSize: '11.5px', color: '#ef4444', fontWeight: 700 }}>Immediate RTO Penalty Risk!</span>
        </div>

        <div className="maintenance-kpi-card warning">
          <span className="maintenance-kpi-label">EXPIRING IN 30 DAYS</span>
          <strong className="maintenance-kpi-val" style={{ color: '#f59e0b' }}>
            {data?.summary?.warningCount ?? 0} Trucks
          </strong>
          <span style={{ fontSize: '11.5px', color: '#f59e0b', fontWeight: 600 }}>Action required within 4 weeks</span>
        </div>

        <div className="maintenance-kpi-card healthy">
          <span className="maintenance-kpi-label">COMPLIANT &amp; HEALTHY</span>
          <strong className="maintenance-kpi-val" style={{ color: '#10b981' }}>
            {data?.summary?.healthyCount ?? 0} Trucks
          </strong>
          <span style={{ fontSize: '11.5px', color: '#10b981', fontWeight: 600 }}>Fully road-worthy &amp; insured</span>
        </div>

        <div className="maintenance-kpi-card total">
          <span className="maintenance-kpi-label">TOTAL ACTIVE FLEET</span>
          <strong className="maintenance-kpi-val" style={{ color: '#38bdf8' }}>
            {data?.summary?.totalVehicles ?? 0} Trucks
          </strong>
          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Monitored Across India</span>
        </div>
      </div>

      {alertSuccessMsg && (
        <div style={{ padding: '12px 18px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', fontSize: '13px', fontWeight: 700 }}>
          {alertSuccessMsg}
        </div>
      )}

      {/* FILTER TABS */}
      <div className="maintenance-filter-bar">
        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', marginRight: '6px' }}>FILTER STATUS:</span>
        {(['All', 'Critical', 'Warning', 'Healthy'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterHealth(tab)}
            className={`maintenance-filter-pill ${filterHealth === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
        {loading && <span style={{ fontSize: '11px', color: '#38bdf8', marginLeft: '6px', fontWeight: 600 }}>Scanning fleet...</span>}
      </div>

      {/* VEHICLES COMPLIANCE TABLE */}
      <div className="maintenance-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="maintenance-table">
            <thead>
              <tr>
                <th>Truck &amp; Driver</th>
                <th>Fitness Certificate</th>
                <th>Commercial Insurance</th>
                <th>PUC Certificate</th>
                <th>National Permit</th>
                <th>Next Oil Service</th>
                <th style={{ textAlign: 'right' }}>Compliance Alert</th>
              </tr>
            </thead>
            <tbody>
              {list.map(v => {
                const status = v.overallHealthStatus;
                const fitDays = v.fitnessDaysLeft;
                const insDays = v.insuranceDaysLeft;
                const pucDays = v.pucDaysLeft;
                const permitDays = v.permitDaysLeft;
                const kmLeft = v.kmUntilNextService;

                return (
                  <tr key={v.vehicleId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{status === 'Critical' ? '🔴' : status === 'Warning' ? '🟡' : '🟢'}</span>
                        <div>
                          <strong className="maintenance-truck-plate">{v.vehicleNumber}</strong>
                          <div className="maintenance-truck-model">{v.model}</div>
                          <div className="maintenance-driver-info">{v.driverName} ({v.driverPhone})</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong style={{ color: fitDays <= 0 ? '#ef4444' : fitDays <= 30 ? '#f59e0b' : '#10b981', display: 'block' }}>
                        {fitDays <= 0 ? `EXPIRED (${Math.abs(fitDays)}d ago)` : `${fitDays} days left`}
                      </strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {v.fitnessExpiryDate ? new Date(v.fitnessExpiryDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>

                    <td>
                      <strong style={{ color: insDays <= 0 ? '#ef4444' : insDays <= 30 ? '#f59e0b' : '#10b981', display: 'block' }}>
                        {insDays <= 0 ? `EXPIRED (${Math.abs(insDays)}d ago)` : `${insDays} days left`}
                      </strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {v.insuranceExpiryDate ? new Date(v.insuranceExpiryDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>

                    <td>
                      <strong style={{ color: pucDays <= 0 ? '#ef4444' : pucDays <= 15 ? '#f59e0b' : '#10b981', display: 'block' }}>
                        {pucDays <= 0 ? 'EXPIRED' : `${pucDays} days left`}
                      </strong>
                    </td>

                    <td>
                      <strong style={{ color: permitDays <= 30 ? '#f59e0b' : '#10b981', display: 'block' }}>
                        {permitDays} days
                      </strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>All-India Permit</div>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{kmLeft} KM</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>At {v.nextEngineOilServiceKm} KM</div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        disabled={sendingId === v.vehicleId}
                        onClick={() => handleSendAlert(v)}
                        style={{
                          padding: '6px 14px',
                          background: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>📲</span>
                        {sendingId === v.vehicleId ? 'Sending...' : 'WhatsApp Alert'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
