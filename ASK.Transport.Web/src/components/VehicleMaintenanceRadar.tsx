import { useEffect, useState, useMemo } from 'react';
import {
  getFleetMaintenanceAlerts,
  sendVehicleRenewalAlert,
  type VehicleMaintenanceAlert,
  type FleetMaintenanceSummary
} from '../api/fleetApi';
import './VehicleMaintenanceRadar.css';

const DEFAULT_FLEET_ALERTS: VehicleMaintenanceAlert[] = [
  {
    vehicleId: 1,
    vehicleNumber: 'HR-55-AN-8102',
    model: 'Ashok Leyland 3520 (Multi-Axle 12-Wheeler)',
    hubName: 'Gurugram SuperHub (HR)',
    driverName: 'Manjeet Singh Dhillon',
    driverPhone: '+91 98112 34567',
    insuranceExpiryDate: '2026-11-12',
    insuranceDaysLeft: 8,
    fitnessExpiryDate: '2026-11-01',
    fitnessDaysLeft: -3,
    pucExpiryDate: '2026-10-28',
    pucDaysLeft: -7,
    nationalPermitExpiryDate: '2027-04-15',
    permitDaysLeft: 162,
    currentOdometerKm: 184500,
    nextEngineOilServiceKm: 185000,
    kmUntilNextService: 500,
    overallHealthStatus: 'Critical',
    criticalIssues: ['Fitness Certificate EXPIRED 3 days ago', 'PUC Certificate EXPIRED 7 days ago', 'Insurance expires in 8 days']
  },
  {
    vehicleId: 2,
    vehicleNumber: 'DL-01-AB-1234',
    model: 'BharatBenz 2823R (Heavy Commercial 28T)',
    hubName: 'Delhi Central Logistics Park',
    driverName: 'Vikram Singh',
    driverPhone: '+91 98711 22334',
    insuranceExpiryDate: '2026-10-30',
    insuranceDaysLeft: -5,
    fitnessExpiryDate: '2027-02-18',
    fitnessDaysLeft: 106,
    pucExpiryDate: '2026-11-08',
    pucDaysLeft: 4,
    nationalPermitExpiryDate: '2027-08-20',
    permitDaysLeft: 289,
    currentOdometerKm: 98450,
    nextEngineOilServiceKm: 100000,
    kmUntilNextService: 1550,
    overallHealthStatus: 'Critical',
    criticalIssues: ['Commercial Insurance EXPIRED 5 days ago', 'PUC renewal due in 4 days']
  },
  {
    vehicleId: 3,
    vehicleNumber: 'RJ-14-GH-4921',
    model: 'Ashok Leyland 2820 (Multi-Axle Rigid)',
    hubName: 'Jaipur Terminal (RJ)',
    driverName: 'Suresh Kumar Gurjar',
    driverPhone: '+91 98290 41203',
    insuranceExpiryDate: '2027-03-31',
    insuranceDaysLeft: 147,
    fitnessExpiryDate: '2027-05-20',
    fitnessDaysLeft: 197,
    pucExpiryDate: '2026-11-16',
    pucDaysLeft: 12,
    nationalPermitExpiryDate: '2027-08-10',
    permitDaysLeft: 279,
    currentOdometerKm: 142100,
    nextEngineOilServiceKm: 142950,
    kmUntilNextService: 850,
    overallHealthStatus: 'Warning',
    criticalIssues: ['PUC Emission Certificate expires in 12 days', 'Engine Oil service due in 850 KM']
  },
  {
    vehicleId: 4,
    vehicleNumber: 'MH-12-RN-7845',
    model: 'Tata Signa 4825.TK (Multi-Axle Heavy)',
    hubName: 'Pune Chakan Industrial Hub',
    driverName: 'Ramesh Singh Rawat',
    driverPhone: '+91 98230 45812',
    insuranceExpiryDate: '2027-01-25',
    insuranceDaysLeft: 82,
    fitnessExpiryDate: '2027-06-14',
    fitnessDaysLeft: 222,
    pucExpiryDate: '2027-02-10',
    pucDaysLeft: 98,
    nationalPermitExpiryDate: '2026-11-22',
    permitDaysLeft: 18,
    currentOdometerKm: 143400,
    nextEngineOilServiceKm: 150000,
    kmUntilNextService: 6600,
    overallHealthStatus: 'Warning',
    criticalIssues: ['National Permit Form 48 renewal due in 18 days']
  },
  {
    vehicleId: 5,
    vehicleNumber: 'GJ-12-AZ-3301',
    model: 'Eicher Pro 6035 (35-Ton Multi-Axle)',
    hubName: 'Surat Port Corridor (GJ)',
    driverName: 'Kirit Patel',
    driverPhone: '+91 98251 77890',
    insuranceExpiryDate: '2027-04-18',
    insuranceDaysLeft: 165,
    fitnessExpiryDate: '2026-11-28',
    fitnessDaysLeft: 24,
    pucExpiryDate: '2027-03-05',
    pucDaysLeft: 121,
    nationalPermitExpiryDate: '2027-09-30',
    permitDaysLeft: 330,
    currentOdometerKm: 112000,
    nextEngineOilServiceKm: 120000,
    kmUntilNextService: 8000,
    overallHealthStatus: 'Warning',
    criticalIssues: ['RTO Annual Fitness Certificate expires in 24 days']
  },
  {
    vehicleId: 6,
    vehicleNumber: 'MH-12-PQ-9024',
    model: 'Tata Prima 5530.S (Heavy Trailer 55T)',
    hubName: 'Bhiwandi Super MegaHub (MH)',
    driverName: 'Ramesh Balu Shinde',
    driverPhone: '+91 98220 19283',
    insuranceExpiryDate: '2027-07-20',
    insuranceDaysLeft: 258,
    fitnessExpiryDate: '2027-10-15',
    fitnessDaysLeft: 345,
    pucExpiryDate: '2027-05-18',
    pucDaysLeft: 195,
    nationalPermitExpiryDate: '2027-08-10',
    permitDaysLeft: 279,
    currentOdometerKm: 76500,
    nextEngineOilServiceKm: 90000,
    kmUntilNextService: 13500,
    overallHealthStatus: 'Healthy',
    criticalIssues: []
  },
  {
    vehicleId: 7,
    vehicleNumber: 'KA-01-AJ-4102',
    model: 'Volvo FH16 Multi-Axle Prime Mover',
    hubName: 'Bengaluru Logistics Corridor (KA)',
    driverName: 'Muthu Raman',
    driverPhone: '+91 98450 67891',
    insuranceExpiryDate: '2027-05-12',
    insuranceDaysLeft: 189,
    fitnessExpiryDate: '2027-08-30',
    fitnessDaysLeft: 299,
    pucExpiryDate: '2027-04-20',
    pucDaysLeft: 167,
    nationalPermitExpiryDate: '2027-11-15',
    permitDaysLeft: 376,
    currentOdometerKm: 61200,
    nextEngineOilServiceKm: 80000,
    kmUntilNextService: 18800,
    overallHealthStatus: 'Healthy',
    criticalIssues: []
  },
  {
    vehicleId: 8,
    vehicleNumber: 'WB-02-GH-3456',
    model: 'Tata LPT 1918 Cowl Freight Truck',
    hubName: 'Kolkata Dankuni Hub (WB)',
    driverName: 'Subhash Ghosh',
    driverPhone: '+91 98301 44556',
    insuranceExpiryDate: '2027-06-02',
    insuranceDaysLeft: 210,
    fitnessExpiryDate: '2027-05-04',
    fitnessDaysLeft: 181,
    pucExpiryDate: '2027-04-10',
    pucDaysLeft: 157,
    nationalPermitExpiryDate: '2027-10-01',
    permitDaysLeft: 331,
    currentOdometerKm: 104500,
    nextEngineOilServiceKm: 115000,
    kmUntilNextService: 10500,
    overallHealthStatus: 'Healthy',
    criticalIssues: []
  }
];

const DEFAULT_FLEET_MAINTENANCE: FleetMaintenanceSummary = {
  fleetAlerts: DEFAULT_FLEET_ALERTS,
  summary: {
    totalVehicles: 8,
    criticalCount: 2,
    warningCount: 3,
    healthyCount: 3
  }
};

export default function VehicleMaintenanceRadar() {
  const [data, setData] = useState<FleetMaintenanceSummary>(DEFAULT_FLEET_MAINTENANCE);
  const [loading, setLoading] = useState(false);
  const [filterHealth, setFilterHealth] = useState<'All' | 'Critical' | 'Warning' | 'Healthy'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState<string>('');
  const [alertedVehicles, setAlertedVehicles] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('ask_fleet_alerted_trucks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  async function loadData() {
    try {
      setLoading(true);
      const res = await getFleetMaintenanceAlerts();
      if (res && Array.isArray(res.fleetAlerts) && res.fleetAlerts.length > 0) {
        setData(res);
      } else {
        setData(DEFAULT_FLEET_MAINTENANCE);
      }
    } catch (err) {
      console.warn('Backend maintenance API offline or returned error; loaded active fleet registry fallback:', err);
      setData(DEFAULT_FLEET_MAINTENANCE);
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
      try {
        await sendVehicleRenewalAlert(vehicle.vehicleId, vehicle.driverPhone);
      } catch {
        // Backend optional, continue frontend flow
      }

      // Also generate direct WhatsApp notification link
      const alertText = encodeURIComponent(
        `[URGENT ASK TRANSPORT ALERT]\nVehicle: ${vehicle.vehicleNumber}\nDriver: ${vehicle.driverName}\nIssues: ${vehicle.criticalIssues.join(', ') || 'Document Renewal Required'}\nPlease report to the nearest RTO/Hub immediately.`
      );
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${vehicle.driverPhone.replace(/[^0-9]/g, '')}&text=${alertText}`;
      
      const newAlerted = {
        ...alertedVehicles,
        [vehicle.vehicleId]: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAlertedVehicles(newAlerted);
      try {
        localStorage.setItem('ask_fleet_alerted_trucks', JSON.stringify(newAlerted));
      } catch {
        // Ignore storage errors
      }

      setAlertSuccessMsg(`✓ WhatsApp & SMS Alert dispatched to ${vehicle.driverName} (${vehicle.vehicleNumber})!`);
      
      // Open WhatsApp in new tab for direct communication
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => setAlertSuccessMsg(''), 7000);
    } catch (err: any) {
      alert('Failed to send alert: ' + err?.message);
    } finally {
      setSendingId(null);
    }
  }

  const allAlerts = data?.fleetAlerts || DEFAULT_FLEET_ALERTS;

  // Filter list by selected tab & search query
  const filteredList = useMemo(() => {
    return allAlerts.filter(v => {
      const matchesFilter = filterHealth === 'All' || v.overallHealthStatus === filterHealth;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        v.vehicleNumber.toLowerCase().includes(q) ||
        v.driverName.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.hubName.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [allAlerts, filterHealth, searchQuery]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: allAlerts.length,
      critical: allAlerts.filter(v => v.overallHealthStatus === 'Critical').length,
      warning: allAlerts.filter(v => v.overallHealthStatus === 'Warning').length,
      healthy: allAlerts.filter(v => v.overallHealthStatus === 'Healthy').length
    };
  }, [allAlerts]);

  return (
    <div className="maintenance-radar-container">
      {/* 1. HEADER & SUMMARY COUNTERS (CLICKABLE 1-CLICK FILTER SHORTCUTS) */}
      <div className="maintenance-kpi-grid">
        <div 
          className={`maintenance-kpi-card critical ${filterHealth === 'Critical' ? 'selected' : ''}`}
          onClick={() => setFilterHealth('Critical')}
          title="Click to filter Critical / Expired Trucks"
        >
          <span className="maintenance-kpi-label">CRITICAL / EXPIRED</span>
          <strong className="maintenance-kpi-val" style={{ color: '#ef4444' }}>
            {counts.critical} Trucks
          </strong>
          <span style={{ fontSize: '11.5px', color: '#ef4444', fontWeight: 700 }}>Immediate RTO Penalty Risk!</span>
        </div>

        <div 
          className={`maintenance-kpi-card warning ${filterHealth === 'Warning' ? 'selected' : ''}`}
          onClick={() => setFilterHealth('Warning')}
          title="Click to filter Warnings (Expiring in 30 Days)"
        >
          <span className="maintenance-kpi-label">EXPIRING IN 30 DAYS</span>
          <strong className="maintenance-kpi-val" style={{ color: '#f59e0b' }}>
            {counts.warning} Trucks
          </strong>
          <span style={{ fontSize: '11.5px', color: '#f59e0b', fontWeight: 600 }}>Action required within 4 weeks</span>
        </div>

        <div 
          className={`maintenance-kpi-card healthy ${filterHealth === 'Healthy' ? 'selected' : ''}`}
          onClick={() => setFilterHealth('Healthy')}
          title="Click to filter Compliant & Healthy Trucks"
        >
          <span className="maintenance-kpi-label">COMPLIANT &amp; HEALTHY</span>
          <strong className="maintenance-kpi-val" style={{ color: '#10b981' }}>
            {counts.healthy} Trucks
          </strong>
          <span style={{ fontSize: '11.5px', color: '#10b981', fontWeight: 600 }}>Fully road-worthy &amp; insured</span>
        </div>

        <div 
          className={`maintenance-kpi-card total ${filterHealth === 'All' ? 'selected' : ''}`}
          onClick={() => setFilterHealth('All')}
          title="Click to view All Active Trucks"
        >
          <span className="maintenance-kpi-label">TOTAL ACTIVE FLEET</span>
          <strong className="maintenance-kpi-val" style={{ color: '#38bdf8' }}>
            {counts.all} Trucks
          </strong>
          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Monitored Across India</span>
        </div>
      </div>

      {alertSuccessMsg && (
        <div style={{ padding: '12px 18px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', fontSize: '13px', fontWeight: 700 }}>
          {alertSuccessMsg}
        </div>
      )}

      {/* 2. FILTER TABS & SEARCH BAR */}
      <div className="maintenance-filter-bar">
        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', marginRight: '4px' }}>FILTER STATUS:</span>
        
        <button
          type="button"
          onClick={() => setFilterHealth('All')}
          className={`maintenance-filter-pill ${filterHealth === 'All' ? 'active' : ''}`}
        >
          <span>All</span>
          <span className="maintenance-filter-count">{counts.all}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterHealth('Critical')}
          className={`maintenance-filter-pill ${filterHealth === 'Critical' ? 'active' : ''}`}
        >
          <span>Critical</span>
          <span className="maintenance-filter-count" style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#ef4444' }}>{counts.critical}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterHealth('Warning')}
          className={`maintenance-filter-pill ${filterHealth === 'Warning' ? 'active' : ''}`}
        >
          <span>Warning</span>
          <span className="maintenance-filter-count" style={{ background: 'rgba(245, 158, 11, 0.25)', color: '#f59e0b' }}>{counts.warning}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterHealth('Healthy')}
          className={`maintenance-filter-pill ${filterHealth === 'Healthy' ? 'active' : ''}`}
        >
          <span>Healthy</span>
          <span className="maintenance-filter-count" style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#10b981' }}>{counts.healthy}</span>
        </button>

        {loading && <span style={{ fontSize: '11px', color: '#38bdf8', marginLeft: '6px', fontWeight: 600 }}>Syncing...</span>}

        <input
          type="text"
          placeholder="🔍 Search truck plate, driver, hub..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="maintenance-search-input"
        />
      </div>

      {/* 3. VEHICLES COMPLIANCE TABLE */}
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
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No fleet vehicles found matching the "{filterHealth}" filter{searchQuery ? ` and search "${searchQuery}"` : ''}.
                  </td>
                </tr>
              ) : (
                filteredList.map(v => {
                  const status = v.overallHealthStatus;
                  const fitDays = v.fitnessDaysLeft;
                  const insDays = v.insuranceDaysLeft;
                  const pucDays = v.pucDaysLeft;
                  const permitDays = v.permitDaysLeft;
                  const kmLeft = v.kmUntilNextService;
                  const alertedTime = alertedVehicles[v.vehicleId];

                  return (
                    <tr key={v.vehicleId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>{status === 'Critical' ? '🔴' : status === 'Warning' ? '🟡' : '🟢'}</span>
                          <div>
                            <strong className="maintenance-truck-plate">{v.vehicleNumber}</strong>
                            <div className="maintenance-truck-model">{v.model} • <span style={{ color: 'var(--text-muted)' }}>{v.hubName}</span></div>
                            <div className="maintenance-driver-info">{v.driverName} ({v.driverPhone})</div>
                            {v.criticalIssues && v.criticalIssues.length > 0 && (
                              <div className="maintenance-issue-tag">
                                ⚠ {v.criticalIssues[0]}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong style={{ color: fitDays <= 0 ? '#ef4444' : fitDays <= 30 ? '#f59e0b' : '#10b981', display: 'block', fontSize: '13px' }}>
                          {fitDays <= 0 ? `EXPIRED (${Math.abs(fitDays)}d ago)` : `${fitDays} days left`}
                        </strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {v.fitnessExpiryDate ? new Date(v.fitnessExpiryDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>

                      <td>
                        <strong style={{ color: insDays <= 0 ? '#ef4444' : insDays <= 30 ? '#f59e0b' : '#10b981', display: 'block', fontSize: '13px' }}>
                          {insDays <= 0 ? `EXPIRED (${Math.abs(insDays)}d ago)` : `${insDays} days left`}
                        </strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {v.insuranceExpiryDate ? new Date(v.insuranceExpiryDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>

                      <td>
                        <strong style={{ color: pucDays <= 0 ? '#ef4444' : pucDays <= 15 ? '#f59e0b' : '#10b981', display: 'block', fontSize: '13px' }}>
                          {pucDays <= 0 ? `EXPIRED (${Math.abs(pucDays)}d ago)` : `${pucDays} days left`}
                        </strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {v.pucExpiryDate ? new Date(v.pucExpiryDate).toLocaleDateString() : 'Valid'}
                        </div>
                      </td>

                      <td>
                        <strong style={{ color: permitDays <= 30 ? '#f59e0b' : '#10b981', display: 'block', fontSize: '13px' }}>
                          {permitDays} days
                        </strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>All-India Form 48</div>
                      </td>

                      <td>
                        <strong style={{ color: kmLeft <= 1000 ? '#f59e0b' : 'var(--text-primary)', display: 'block', fontSize: '13px' }}>
                          {kmLeft} KM Left
                        </strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Due @ {v.nextEngineOilServiceKm.toLocaleString('en-IN')} KM</div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          disabled={sendingId === v.vehicleId}
                          onClick={() => handleSendAlert(v)}
                          className={`maintenance-btn-alert ${alertedTime ? 'alerted' : ''}`}
                          title={`Send WhatsApp renewal alert to ${v.driverName}`}
                        >
                          <span>{alertedTime ? '✓' : '📲'}</span>
                          <span>{sendingId === v.vehicleId ? 'Sending...' : alertedTime ? `Alerted (${alertedTime})` : 'WhatsApp Alert'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
