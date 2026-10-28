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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER & SUMMARY COUNTERS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>CRITICAL / EXPIRED</span>
          <strong style={{ fontSize: '24px', color: '#dc2626', display: 'block', margin: '4px 0' }}>
            {data?.summary?.criticalCount ?? 0} Trucks
          </strong>
          <span style={{ fontSize: '11.5px', color: '#ef4444', fontWeight: 700 }}>Immediate RTO Penalty Risk!</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>EXPIRING IN 30 DAYS</span>
          <strong style={{ fontSize: '24px', color: '#d97706', display: 'block', margin: '4px 0' }}>
            {data?.summary?.warningCount ?? 0} Trucks
          </strong>
          <span style={{ fontSize: '11.5px', color: '#b45309' }}>Action required within 4 weeks</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>COMPLIANT &amp; HEALTHY</span>
          <strong style={{ fontSize: '24px', color: '#16a34a', display: 'block', margin: '4px 0' }}>
            {data?.summary?.healthyCount ?? 0} Trucks
          </strong>
          <span style={{ fontSize: '11.5px', color: '#059669' }}>Fully road-worthy &amp; insured</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #38bdf8' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL ACTIVE FLEET</span>
          <strong style={{ fontSize: '24px', color: '#0f172a', display: 'block', margin: '4px 0' }}>
            {data?.summary?.totalVehicles ?? 0} Trucks
          </strong>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>Monitored Across India</span>
        </div>
      </div>

      {alertSuccessMsg && (
        <div style={{ padding: '12px 18px', borderRadius: '8px', background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', fontSize: '13px', fontWeight: 700 }}>
          {alertSuccessMsg}
        </div>
      )}

      {/* FILTER TABS */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginRight: '6px' }}>FILTER STATUS:</span>
        {(['All', 'Critical', 'Warning', 'Healthy'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterHealth(tab)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: filterHealth === tab ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: filterHealth === tab ? '#eff6ff' : '#ffffff',
              color: filterHealth === tab ? '#1d4ed8' : '#475569'
            }}
          >
            {tab}
          </button>
        ))}
        {loading && <span style={{ fontSize: '11px', color: '#6366f1', marginLeft: '6px', fontWeight: 600 }}>Scanning fleet...</span>}
      </div>

      {/* VEHICLES COMPLIANCE TABLE */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
              <th style={{ padding: '10px 14px' }}>Truck &amp; Driver</th>
              <th style={{ padding: '10px 14px' }}>Fitness Certificate</th>
              <th style={{ padding: '10px 14px' }}>Commercial Insurance</th>
              <th style={{ padding: '10px 14px' }}>PUC Certificate</th>
              <th style={{ padding: '10px 14px' }}>National Permit</th>
              <th style={{ padding: '10px 14px' }}>Next Oil Service</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Compliance Alert</th>
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
                <tr key={v.vehicleId} style={{ borderBottom: '1px solid #f1f5f9', background: status === 'Critical' ? '#fff5f5' : status === 'Warning' ? '#fffbeb' : '#ffffff' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{status === 'Critical' ? '🔴' : status === 'Warning' ? '🟡' : '🟢'}</span>
                      <div>
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>{v.vehicleNumber}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{v.model}</div>
                        <div style={{ fontSize: '11px', color: '#2563eb' }}>{v.driverName} ({v.driverPhone})</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <strong style={{ color: fitDays <= 0 ? '#dc2626' : fitDays <= 30 ? '#d97706' : '#16a34a' }}>
                      {fitDays <= 0 ? `EXPIRED (${Math.abs(fitDays)}d ago)` : `${fitDays} days left`}
                    </strong>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                      {v.fitnessExpiryDate ? new Date(v.fitnessExpiryDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <strong style={{ color: insDays <= 0 ? '#dc2626' : insDays <= 30 ? '#d97706' : '#16a34a' }}>
                      {insDays <= 0 ? `EXPIRED (${Math.abs(insDays)}d ago)` : `${insDays} days left`}
                    </strong>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                      {v.insuranceExpiryDate ? new Date(v.insuranceExpiryDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <strong style={{ color: pucDays <= 0 ? '#dc2626' : pucDays <= 15 ? '#d97706' : '#16a34a' }}>
                      {pucDays <= 0 ? 'EXPIRED' : `${pucDays} days left`}
                    </strong>
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <strong style={{ color: permitDays <= 30 ? '#d97706' : '#16a34a' }}>
                      {permitDays} days
                    </strong>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>All-India Permit</div>
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <strong>{kmLeft} KM</strong>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>At {v.nextEngineOilServiceKm} KM</div>
                  </td>

                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <button
                      type="button"
                      disabled={sendingId === v.vehicleId}
                      onClick={() => handleSendAlert(v)}
                      style={{
                        padding: '6px 12px',
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
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
  );
}
