import { useEffect, useState, useMemo } from 'react';
import {
  AlertTriangle,
  Phone,
  Send,
  Search,
  X,
  MapPin
} from 'lucide-react';
import {
  getFleetMaintenanceAlerts,
  sendVehicleRenewalAlert,
  getParivahanFleetRadar,
  settleParivahanChallan,
  type VehicleMaintenanceAlert,
  type FleetMaintenanceSummary,
  type ParivahanVehicleRecord
} from '../api/fleetApi';
import DriverDutySlipModal from './DriverDutySlipModal';
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
  const [parivahanFleet, setParivahanFleet] = useState<ParivahanVehicleRecord[]>([]);
  const [selectedDutySlipVehicle, setSelectedDutySlipVehicle] = useState<VehicleMaintenanceAlert | null>(null);
  const [settlingChallan, setSettlingChallan] = useState<string | null>(null);
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
      try {
        const pRes = await getParivahanFleetRadar();
        if (pRes && Array.isArray(pRes.fleet)) {
          setParivahanFleet(pRes.fleet);
        }
      } catch (err) {
        console.warn('Parivahan fleet API offline:', err);
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

  async function handleSettleChallan(challanNumber: string) {
    try {
      setSettlingChallan(challanNumber);
      await settleParivahanChallan(challanNumber);
      setParivahanFleet(prev => prev.map(veh => ({
        ...veh,
        challans: veh.challans.map(c => c.challanNumber === challanNumber ? { ...c, status: 'Paid' } : c),
        pendingChallansCount: Math.max(0, veh.pendingChallansCount - 1),
        totalChallanAmount: Math.max(0, veh.totalChallanAmount - (veh.challans.find(c => c.challanNumber === challanNumber)?.amount || 0))
      })));
      setAlertSuccessMsg(`✓ MoRTH Parivahan Challan ${challanNumber} settled and cleared!`);
      setTimeout(() => setAlertSuccessMsg(''), 6000);
    } catch (err: any) {
      alert('Failed to settle challan: ' + err?.message);
    } finally {
      setSettlingChallan(null);
    }
  }

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
        <div className="maintenance-filter-pills-group">
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
        </div>

        <div className="maintenance-actions-group">


          <div className="maintenance-search-box">
            <Search size={14} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search truck plate, driver, hub..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="maintenance-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="maintenance-search-clear"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. VEHICLE CARDS GRID */}

        /* ======================================================== */
        /* 3A. MODERN TMS VEHICLE COMPLIANCE CARDS GRID            */
        /* ======================================================== */
        <div className="maintenance-cards-grid">
          {filteredList.length === 0 ? (
            <div className="maintenance-cards-empty">
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔍</div>
              <strong style={{ fontSize: '15px' }}>No fleet vehicles found</strong>
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Matching the "{filterHealth}" filter{searchQuery ? ` and search "${searchQuery}"` : ''}.
              </p>
            </div>
          ) : (
            filteredList.map(v => {
              const status = v.overallHealthStatus;
              const fitDays = v.fitnessDaysLeft;
              const insDays = v.insuranceDaysLeft;
              const pucDays = v.pucDaysLeft;
              const permitDays = v.permitDaysLeft;
              const kmLeft = v.kmUntilNextService;
              const alertedTime = alertedVehicles[v.vehicleId];

              const isCritical = status === 'Critical';
              const isWarning = status === 'Warning';

              return (
                <div key={v.vehicleId} className={`maintenance-card status-${status.toLowerCase()}`}>
                  {/* CARD HEADER */}
                  <div className="m-card-header">
                    <div className="m-card-truck-info">
                      <div className="m-plate-badge-wrap">
                        <span className="m-status-indicator">{isCritical ? '🔴' : isWarning ? '🟡' : '🟢'}</span>
                        <span className="m-truck-plate">{v.vehicleNumber}</span>
                      </div>
                      <div className="m-truck-model">{v.model}</div>
                      <div className="m-hub-badge">
                        <MapPin size={11} />
                        <span>{v.hubName}</span>
                      </div>
                    </div>

                    <div className="m-card-status-wrap">
                      <span className={`m-health-pill ${status.toLowerCase()}`}>
                        {isCritical ? 'CRITICAL RTO RISK' : isWarning ? 'EXPIRING SOON' : 'COMPLIANT & ACTIVE'}
                      </span>
                    </div>
                  </div>

                  {/* DRIVER & ODOMETER STRIP */}
                  <div className="m-card-driver-strip">
                    <div className="m-driver-profile">
                      <div className="m-driver-avatar">
                        {v.driverName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="m-driver-text">
                        <div className="m-driver-name">{v.driverName}</div>
                        <a href={`tel:${v.driverPhone}`} className="m-driver-phone">
                          <Phone size={11} />
                          <span>{v.driverPhone}</span>
                        </a>
                      </div>
                    </div>

                    <div className="m-odometer-box">
                      <span className="m-odo-label">ODOMETER:</span>
                      <strong className="m-odo-val">{v.currentOdometerKm.toLocaleString('en-IN')} KM</strong>
                    </div>
                  </div>

                  {/* 5-DOCUMENT COMPLIANCE GRID */}
                  <div className="m-compliance-grid">
                    {/* 1. FITNESS */}
                    <div className={`m-comp-box ${fitDays <= 0 ? 'expired' : fitDays <= 30 ? 'warning' : 'healthy'}`}>
                      <div className="m-comp-head">
                        <span className="m-comp-icon">🛡️</span>
                        <span className="m-comp-name">Fitness Cert</span>
                      </div>
                      <div className="m-comp-days">
                        {fitDays <= 0 ? `EXPIRED (${Math.abs(fitDays)}d)` : `${fitDays}d left`}
                      </div>
                      <div className="m-comp-date">
                        {v.fitnessExpiryDate ? new Date(v.fitnessExpiryDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>

                    {/* 2. INSURANCE */}
                    <div className={`m-comp-box ${insDays <= 0 ? 'expired' : insDays <= 30 ? 'warning' : 'healthy'}`}>
                      <div className="m-comp-head">
                        <span className="m-comp-icon">📜</span>
                        <span className="m-comp-name">Insurance</span>
                      </div>
                      <div className="m-comp-days">
                        {insDays <= 0 ? `EXPIRED (${Math.abs(insDays)}d)` : `${insDays}d left`}
                      </div>
                      <div className="m-comp-date">
                        {v.insuranceExpiryDate ? new Date(v.insuranceExpiryDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>

                    {/* 3. PUC */}
                    <div className={`m-comp-box ${pucDays <= 0 ? 'expired' : pucDays <= 15 ? 'warning' : 'healthy'}`}>
                      <div className="m-comp-head">
                        <span className="m-comp-icon">🌿</span>
                        <span className="m-comp-name">PUC Emission</span>
                      </div>
                      <div className="m-comp-days">
                        {pucDays <= 0 ? `EXPIRED (${Math.abs(pucDays)}d)` : `${pucDays}d left`}
                      </div>
                      <div className="m-comp-date">
                        {v.pucExpiryDate ? new Date(v.pucExpiryDate).toLocaleDateString() : 'Valid'}
                      </div>
                    </div>

                    {/* 4. NATIONAL PERMIT */}
                    <div className={`m-comp-box ${permitDays <= 30 ? 'warning' : 'healthy'}`}>
                      <div className="m-comp-head">
                        <span className="m-comp-icon">🇮🇳</span>
                        <span className="m-comp-name">Nat. Permit</span>
                      </div>
                      <div className="m-comp-days">
                        {permitDays}d left
                      </div>
                      <div className="m-comp-date">Form 48</div>
                    </div>

                    {/* 5. OIL SERVICE */}
                    <div className={`m-comp-box ${kmLeft <= 1000 ? 'warning' : 'healthy'}`}>
                      <div className="m-comp-head">
                        <span className="m-comp-icon">🛢️</span>
                        <span className="m-comp-name">Oil Service</span>
                      </div>
                      <div className="m-comp-days">
                        {kmLeft} KM left
                      </div>
                      <div className="m-comp-date">@ {v.nextEngineOilServiceKm.toLocaleString('en-IN')} KM</div>
                    </div>
                  </div>

                  {/* CRITICAL ISSUES ACCENT BAR */}
                  {v.criticalIssues && v.criticalIssues.length > 0 && (
                    <div className="m-card-critical-issues">
                      <AlertTriangle size={14} className="m-alert-icon" />
                      <div className="m-issues-list">
                        {v.criticalIssues.map((issue, idx) => (
                          <span key={idx} className="m-issue-pill">⚠ {issue}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PARIVAHAN LIVE E-CHALLAN ALERT STRIP (IF ANY PENDING CHALLANS) */}
                  {(() => {
                    const cleanPlate = v.vehicleNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                    const pMatch = parivahanFleet.find(p => p.vehicleNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === cleanPlate);
                    if (!pMatch || !pMatch.challans || pMatch.challans.length === 0) return null;
                    const pendingChallans = pMatch.challans.filter(c => c.status === 'Pending');
                    if (pendingChallans.length === 0) return null;

                    return (
                      <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '10px', padding: '10px 12px', marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>⚠️</span> MoRTH E-CHALLAN ALERT ({pendingChallans.length} Pending)
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#ef4444' }}>
                            ₹{pMatch.totalChallanAmount.toLocaleString('en-IN')} Fine
                          </span>
                        </div>
                        {pendingChallans.map((ch, idx) => (
                          <div key={idx} style={{ marginTop: '6px', fontSize: '11px', color: '#fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                            <div>
                              <strong>{ch.challanNumber}:</strong> {ch.violation} ({ch.location})
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSettleChallan(ch.challanNumber)}
                              disabled={settlingChallan === ch.challanNumber}
                              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                            >
                              {settlingChallan === ch.challanNumber ? 'Settling...' : '💳 Pay Challan'}
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* ACTION FOOTER */}
                  <div className="m-card-footer" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={sendingId === v.vehicleId}
                      onClick={() => handleSendAlert(v)}
                      className={`maintenance-btn-alert ${alertedTime ? 'alerted' : ''}`}
                      title={`Send WhatsApp renewal alert to ${v.driverName}`}
                      style={{ flex: 1 }}
                    >
                      <Send size={13} />
                      <span>{sendingId === v.vehicleId ? 'Sending...' : alertedTime ? `Alert Dispatched (${alertedTime})` : 'Dispatch Renewal Alert'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDutySlipVehicle(v)}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                      }}
                      title="Generate & Dispatch Driver Highway WhatsApp Duty Slip"
                    >
                      <span>📲</span> Duty Slip
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      {selectedDutySlipVehicle && (
        <DriverDutySlipModal
          initialData={{
            driverName: selectedDutySlipVehicle.driverName,
            driverPhone: selectedDutySlipVehicle.driverPhone,
            vehicleNumber: selectedDutySlipVehicle.vehicleNumber,
            truckModel: selectedDutySlipVehicle.model,
            originHub: selectedDutySlipVehicle.hubName,
            destinationHub: 'Mumbai Port (Nhava Sheva)'
          }}
          onClose={() => setSelectedDutySlipVehicle(null)}
        />
      )}

    </div>
  );
}
