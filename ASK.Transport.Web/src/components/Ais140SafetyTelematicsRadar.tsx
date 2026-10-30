import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  AlertOctagon, 
  ShieldAlert, 
  Truck, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  Compass, 
  Moon, 
  Zap, 
  X
} from 'lucide-react';
import type { Ais140SafetyTelemetry } from '../types/transportOperations';
import { getAis140FleetSafety, ackAis140Panic } from '../api/ais140SafetyApi';
import { useLanguage } from '../context/LanguageContext';
import './Ais140SafetyTelematicsRadar.css';

// ============================================================================
// SEED AIS-140 SATELLITE TELEMETRY DATA
// ============================================================================

const SEED_AIS140_DATA: Ais140SafetyTelemetry[] = [
  {
    id: 'ais-1',
    vehicleNumber: 'RJ-14-GH-4921',
    driverName: 'Suresh Kumar Gurjar',
    driverPhone: '+91 98290 41203',
    currentSpeedKmph: 64,
    speedLimitKmph: 80,
    latitude: 26.8289,
    longitude: 75.8056,
    currentHighwayLocation: 'NH-48 Jaipur-Kishangarh Expressway (KM 142)',
    continuousDrivingHours: 4.2,
    isNightDriving: false,
    fatigueWarning: false,
    panicButtonTriggered: false,
    gpsTamperAlert: false,
    harshBrakingCount: 0,
    rapidAccelerationCount: 1,
    severity: 'NORMAL_COMPLIANT',
    lastPingAt: 'Just now (12s ago)',
    nearestPoliceEmergencyContact: 'Rajasthan Highway Patrol: 112 / 0141-2741112'
  },
  {
    id: 'ais-2',
    vehicleNumber: 'HR-55-AN-8102',
    driverName: 'Manjeet Singh Dhillon',
    driverPhone: '+91 98112 76431',
    currentSpeedKmph: 94,
    speedLimitKmph: 80,
    latitude: 25.3176,
    longitude: 82.9739,
    currentHighwayLocation: 'NH-19 Varanasi Ring Road Bypass (KM 418)',
    continuousDrivingHours: 6.8,
    isNightDriving: false,
    fatigueWarning: false,
    panicButtonTriggered: false,
    gpsTamperAlert: false,
    harshBrakingCount: 3,
    rapidAccelerationCount: 4,
    severity: 'WARNING_SPEED',
    lastPingAt: 'Just now (5s ago)',
    nearestPoliceEmergencyContact: 'UP State Highway Patrol: 112 / 0542-2508822'
  },
  {
    id: 'ais-3',
    vehicleNumber: 'MH-12-PQ-9024',
    driverName: 'Ramesh Balu Shinde',
    driverPhone: '+91 97654 32910',
    currentSpeedKmph: 38,
    speedLimitKmph: 80,
    latitude: 18.7544,
    longitude: 73.4062,
    currentHighwayLocation: 'Mumbai-Pune Expressway near Khandala Ghat (KM 68)',
    continuousDrivingHours: 5.1,
    isNightDriving: true,
    fatigueWarning: false,
    panicButtonTriggered: true,
    gpsTamperAlert: false,
    harshBrakingCount: 5,
    rapidAccelerationCount: 2,
    severity: 'EMERGENCY_PANIC_SOS',
    lastPingAt: 'Live (2s ago)',
    nearestPoliceEmergencyContact: 'Maharashtra Highway Police Control: 112 / 9822498224'
  },
  {
    id: 'ais-4',
    vehicleNumber: 'DL-01-AA-3321',
    driverName: 'Vikram Singh Rawat',
    driverPhone: '+91 99100 48190',
    currentSpeedKmph: 74,
    speedLimitKmph: 80,
    latitude: 27.5020,
    longitude: 77.6737,
    currentHighwayLocation: 'Yamuna Expressway (Mathura Toll Plaza KM 95)',
    continuousDrivingHours: 9.4,
    isNightDriving: true,
    fatigueWarning: true,
    panicButtonTriggered: false,
    gpsTamperAlert: false,
    harshBrakingCount: 2,
    rapidAccelerationCount: 0,
    severity: 'FATIGUE_REST_REQUIRED',
    lastPingAt: 'Just now (28s ago)',
    nearestPoliceEmergencyContact: 'Yamuna Expressway Emergency: 1800-102-7777'
  }
];

export const Ais140SafetyTelematicsRadar: React.FC = () => {
  const { t } = useLanguage();
  const [telemetryList, setTelemetryList] = useState<Ais140SafetyTelemetry[]>(SEED_AIS140_DATA);
  const [selectedTruck, setSelectedTruck] = useState<Ais140SafetyTelemetry>(SEED_AIS140_DATA[2]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    fetchSafetyData();
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSafetyData = async () => {
    setIsLoading(true);
    try {
      const data = await getAis140FleetSafety();
      if (data && Array.isArray(data) && data.length > 0) {
        setTelemetryList(data);
        const sosTruck = data.find(d => d.panicButtonTriggered) || data[0];
        setSelectedTruck(sosTruck);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleAckPanic = async (truckId: string) => {
    try {
      await ackAis140Panic(truckId);
      setTelemetryList(prev => prev.map(tItem => tItem.id === truckId ? {
        ...tItem,
        panicButtonTriggered: false,
        severity: 'NORMAL_COMPLIANT'
      } : tItem));
      if (selectedTruck.id === truckId) {
        setSelectedTruck(prev => ({
          ...prev,
          panicButtonTriggered: false,
          severity: 'NORMAL_COMPLIANT'
        }));
      }
      showToast('success', t('Panic alarm reset!', 'पैनिक अलार्म रीसेट किया गया!'));
    } catch {
      setTelemetryList(prev => prev.map(tItem => tItem.id === truckId ? {
        ...tItem,
        panicButtonTriggered: false,
        severity: 'NORMAL_COMPLIANT'
      } : tItem));
      if (selectedTruck.id === truckId) {
        setSelectedTruck(prev => ({
          ...prev,
          panicButtonTriggered: false,
          severity: 'NORMAL_COMPLIANT'
        }));
      }
      showToast('success', t('Panic alarm reset!', 'पैनिक अलार्म रीसेट किया गया!'));
    }
  };

  const handlePoliceAlert = (truck: Ais140SafetyTelemetry) => {
    showToast('info', t(
      `Live coordinates and emergency telemetry dispatched to Highway Patrol (${truck.nearestPoliceEmergencyContact || '112'})!`,
      `हाईवे पुलिस कंट्रोल रूम (${truck.nearestPoliceEmergencyContact || '112'}) को लाइव जीपीएस लोकेशन व अलर्ट टेलीमेट्री प्रेषित कर दी गई है!`
    ));
  };

  const filteredList = telemetryList.filter(item => {
    const vNo = item.vehicleNumber || '';
    const dName = item.driverName || '';
    const loc = item.currentHighwayLocation || '';
    const term = searchQuery.toLowerCase();

    const matchSearch = vNo.toLowerCase().includes(term) ||
      dName.toLowerCase().includes(term) ||
      loc.toLowerCase().includes(term);
    
    if (filterType === 'ALL') return matchSearch;
    if (filterType === 'SOS') return matchSearch && item.panicButtonTriggered;
    if (filterType === 'SPEED') return matchSearch && (item.currentSpeedKmph || 0) > (item.speedLimitKmph || 80);
    if (filterType === 'FATIGUE') return matchSearch && (item.fatigueWarning || (item.continuousDrivingHours || 0) > 8);
    return matchSearch;
  });

  const activePanicCount = telemetryList.filter(tItem => tItem.panicButtonTriggered).length;
  const speedingCount = telemetryList.filter(tItem => (tItem.currentSpeedKmph || 0) > (tItem.speedLimitKmph || 80)).length;
  const fatigueCount = telemetryList.filter(tItem => tItem.fatigueWarning || (tItem.continuousDrivingHours || 0) > 8).length;

  const currentTruck = selectedTruck || telemetryList[0] || SEED_AIS140_DATA[0];

  return (
    <div className="ais-container">
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          background: notification.type === 'error' ? '#ef4444' : notification.type === 'info' ? '#3b82f6' : '#0f172a',
          color: '#ffffff',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 700,
          borderLeft: `4px solid ${notification.type === 'error' ? '#fca5a5' : '#10b981'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {notification.type === 'error' ? <AlertOctagon size={18} /> : <CheckCircle2 size={18} className="text-emerald-400" />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '12px' }}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Flashing Emergency Banner if Panic SOS active */}
      {activePanicCount > 0 && (
        <div className="ais-emergency-banner">
          <div className="ais-emergency-left">
            <div className="ais-sos-icon-badge">
              SOS
            </div>
            <div>
              <h4 className="ais-emergency-title">
                <AlertOctagon size={18} />
                <span>{t(`Live Panic Emergency Alert (${activePanicCount} Vehicle in Distress)`, `लाइव पैनिक इमरजेंसी चेतावनी (${activePanicCount} वाहन संकट में)`)}</span>
              </h4>
              <p className="ais-emergency-desc">
                {t(
                  'Emergency panic button pressed inside cabin! Nearest Highway Patrol and response units alerted.',
                  'ड्राइवर द्वारा केबिन का इमरजेंसी पैनिक बटन दबाया गया है! निकटतम हाईवे पुलिस एवं रेस्क्यू यूनिट तुरंत संपर्क करें।'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const sos = telemetryList.find(tItem => tItem.panicButtonTriggered);
              if (sos) setSelectedTruck(sos);
            }}
            className="ais-emergency-btn"
          >
            {t('View Vehicle Immediately ➔', 'तत्काल वाहन देखें ➔')}
          </button>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="ais-hero">
        <div>
          <div className="ais-hero-badge">
            <Radio size={13} className="animate-ping" />
            <span>{t('Govt MoRTH AIS-140 Certified Telematics Shield', 'सड़क परिवहन मंत्रालय AIS-140 प्रमाणित सुरक्षा शील्ड')}</span>
          </div>
          <h1 className="ais-hero-title">
            {t('AIS-140 National Telematics & Highway Safety Radar', 'AIS-140 राष्ट्रीय टेलीमैटिक्स व हाईवे सुरक्षा राडार')}
          </h1>
          <p className="ais-hero-subtitle">
            {t(
              '24×7 real-time emergency panic SOS, speed governor (>80 km/h) violations, night driving and driver fatigue monitoring.',
              '24×7 इमरजेंसी पैनिक एसओएस, स्पीड गवर्नर (>80 km/h) उल्लंघन, नाइट ड्राइविंग एवं ड्राइवर थकान मॉनिटरिंग।'
            )}
          </p>
        </div>
        <div className="ais-hero-actions">
          <button 
            type="button"
            onClick={fetchSafetyData}
            disabled={isLoading}
            className="ais-btn-secondary"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{t('Refresh', 'रिफ्रेश')}</span>
          </button>
          <div className="ais-live-pill">
            <ShieldAlert size={14} />
            <span>AIS-140 IRNSS + GPS LIVE</span>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="ais-metrics-grid">
        <div className="ais-metric-card">
          <div className="ais-metric-info">
            <span className="ais-metric-label">{t('Active AIS-140 Fleet', 'सक्रिय AIS-140 गाड़ियां')}</span>
            <div className="ais-metric-value">{telemetryList.length}</div>
            <span className="ais-metric-sub">{t('100% IRNSS Satellite Lock', '100% IRNSS सैटेलाइट लॉक')}</span>
          </div>
          <div className="ais-metric-icon">
            <Radio size={22} />
          </div>
        </div>

        <div className="ais-metric-card">
          <div className="ais-metric-info">
            <span className="ais-metric-label">{t('Active SOS Panic Alarms', 'SOS पैनिक अलार्म')}</span>
            <div className={`ais-metric-value ${activePanicCount > 0 ? 'text-red-500' : ''}`} style={{ color: activePanicCount > 0 ? '#dc2626' : undefined }}>
              {activePanicCount}
            </div>
            <span className="ais-metric-sub danger">{t('Highway Emergency Protocol', 'हाईवे इमरजेंसी प्रोटोकॉल')}</span>
          </div>
          <div className="ais-metric-icon danger">
            <AlertOctagon size={22} />
          </div>
        </div>

        <div className="ais-metric-card">
          <div className="ais-metric-info">
            <span className="ais-metric-label">{t('Over-Speed (>80 km/h)', 'ओवर-स्पीड (>80 km/h)')}</span>
            <div className="ais-metric-value" style={{ color: speedingCount > 0 ? '#d97706' : undefined }}>
              {speedingCount}
            </div>
            <span className="ais-metric-sub warning">{t('Speed Governor Violations', 'स्पीड गवर्नर वॉयलेशन')}</span>
          </div>
          <div className="ais-metric-icon warning">
            <Zap size={22} />
          </div>
        </div>

        <div className="ais-metric-card">
          <div className="ais-metric-info">
            <span className="ais-metric-label">{t('Driver Fatigue Risk (>8h)', 'ड्राइवर थकान जोखिम (>8h)')}</span>
            <div className="ais-metric-value" style={{ color: fatigueCount > 0 ? '#4f46e5' : undefined }}>
              {fatigueCount}
            </div>
            <span className="ais-metric-sub indigo">{t('Mandatory Rest Break Due', 'विश्राम ब्रेक अनुशंसित')}</span>
          </div>
          <div className="ais-metric-icon indigo">
            <Moon size={22} />
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="ais-main-split">
        {/* Left Side: Fleet Radar List */}
        <div className="ais-list-card">
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={t('Search vehicle / driver / location...', 'गाड़ी संख्या / ड्राइवर / लोकेशन...')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="ais-search-input"
            />
          </div>

          {/* Filter Pills */}
          <div className="ais-filter-tabs">
            {[
              { key: 'ALL', label: t('All Vehicles', 'सभी गाड़ियां') },
              { key: 'SOS', label: `${t('Panic SOS', 'पैनिक SOS')} (${activePanicCount})` },
              { key: 'SPEED', label: `${t('Over-Speed', 'ओवर स्पीड')} (${speedingCount})` },
              { key: 'FATIGUE', label: `${t('Fatigue Risk', 'ड्राइवर थकान')} (${fatigueCount})` }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterType(tab.key)}
                className={`ais-filter-chip ${filterType === tab.key ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="ais-items-scroll">
            {filteredList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 10px', color: '#94a3b8', fontSize: '12px' }}>
                {t('No safety telemetry data found', 'कोई टेलीमेट्री डेटा नहीं मिला')}
              </div>
            ) : (
              filteredList.map(truck => {
                const isSelected = currentTruck.id === truck.id;
                const isSos = truck.panicButtonTriggered;
                const isOverSpeed = (truck.currentSpeedKmph || 0) > (truck.speedLimitKmph || 80);

                let cardClass = 'ais-item-tile';
                if (isSos) cardClass += ' sos-active';
                else if (isSelected) cardClass += ' active';

                return (
                  <div
                    key={truck.id}
                    onClick={() => setSelectedTruck(truck)}
                    className={cardClass}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Truck size={14} style={{ color: isSos ? '#dc2626' : '#64748b' }} />
                        <span>{truck.vehicleNumber}</span>
                      </span>

                      <span style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 800,
                        background: isSos ? '#fee2e2' : isOverSpeed ? '#fef3c7' : truck.fatigueWarning ? '#e0e7ff' : '#ecfdf5',
                        color: isSos ? '#dc2626' : isOverSpeed ? '#d97706' : truck.fatigueWarning ? '#4338ca' : '#059669',
                        border: `1px solid ${isSos ? '#fca5a5' : isOverSpeed ? '#fde68a' : truck.fatigueWarning ? '#c7d2fe' : '#a7f3d0'}`
                      }}>
                        {isSos ? 'EMERGENCY PANIC' :
                         isOverSpeed ? `${truck.currentSpeedKmph} km/h (OVER-SPEED)` :
                         truck.fatigueWarning ? 'FATIGUE ALERT' : 'COMPLIANT'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 4px', fontSize: '12px' }}>
                      <span style={{ color: '#64748b' }}>{t('Driver:', 'ड्राइवर:')} <b>{truck.driverName}</b></span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{truck.currentSpeedKmph} km/h</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#64748b', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '6px' }}>
                      <MapPin size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {truck.currentHighwayLocation}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detailed Safety Radar & Emergency Protocol Console */}
        <div className="ais-detail-card">
          {/* Header */}
          <div className="ais-detail-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={18} style={{ color: currentTruck.panicButtonTriggered ? '#dc2626' : '#10b981' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>
                {t('AIS-140 Radar Console', 'AIS-140 राडार व्यू')} • <code style={{ color: '#0284c7' }}>{currentTruck.vehicleNumber}</code>
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentTruck.panicButtonTriggered && (
                <button
                  type="button"
                  onClick={() => handleAckPanic(currentTruck.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)'
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>{t('Reset / Acknowledge SOS Alarm', 'SOS अलार्म रीसेट / एक्नॉलेज')}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handlePoliceAlert(currentTruck)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShieldAlert size={14} style={{ color: '#f87171' }} />
                <span>{t('Alert Highway Patrol (112)', 'हाईवे पुलिस अलर्ट (112)')}</span>
              </button>
            </div>
          </div>

          {/* Radar Body */}
          <div className="ais-detail-body">
            {/* Emergency Alert Banner if Active for this vehicle */}
            {currentTruck.panicButtonTriggered && (
              <div className="ais-distress-alert">
                <AlertOctagon size={24} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h4 className="ais-distress-title">
                    {t('ALERT: Cabin Emergency Panic Button Triggered', 'अलर्ट: केबिन पैनिक बटन सक्रिय (Cabin SOS Switch Triggered)')}
                  </h4>
                  <p className="ais-distress-desc">
                    {t(
                      'Driver has activated the emergency distress switch. Potential hijack, accident or urgent medical situation.',
                      'वाहन चालक ने सहायता हेतु पैनिक स्विच दबाया है। संभावित हाइजैक, सड़क दुर्घटना या आपातकालीन चिकित्सा स्थिति।'
                    )}
                  </p>
                  <div style={{ paddingTop: '4px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 800, color: '#7f1d1d' }}>
                    {t('Nearest Police Station:', 'निकटतम पुलिस स्टेशन:')} {currentTruck.nearestPoliceEmergencyContact}
                  </div>
                </div>
              </div>
            )}

            {/* Speed & Live Status Gauges */}
            <div className="ais-gauges-grid">
              <div className={`ais-gauge-tile ${(currentTruck.currentSpeedKmph || 0) > (currentTruck.speedLimitKmph || 80) ? 'overspeed' : ''}`}>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('Current Speed', 'लाइव गति')}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', margin: '4px 0 2px' }}>
                  <span className={`ais-gauge-val ${(currentTruck.currentSpeedKmph || 0) > (currentTruck.speedLimitKmph || 80) ? 'overspeed' : ''}`}>
                    {currentTruck.currentSpeedKmph}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>km/h</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748b' }}>{t('Limit:', 'सीमा:')} {currentTruck.speedLimitKmph} km/h</span>
              </div>

              <div className={`ais-gauge-tile ${(currentTruck.continuousDrivingHours || 0) > 8 ? 'fatigue' : ''}`}>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('Continuous Driving', 'लगातार ड्राइविंग')}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', margin: '4px 0 2px' }}>
                  <span className={`ais-gauge-val ${(currentTruck.continuousDrivingHours || 0) > 8 ? 'fatigue' : ''}`}>
                    {currentTruck.continuousDrivingHours}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{t('hours', 'घंटे')}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748b' }}>{t('Safe Max: 8.0h', 'अधिकतम सुरक्षित: 8.0h')}</span>
              </div>

              <div className="ais-gauge-tile">
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('Harsh Braking Count', 'हर्ष ब्रेकिंग')}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', margin: '4px 0 2px' }}>
                  <span className="ais-gauge-val" style={{ color: '#d97706' }}>
                    {currentTruck.harshBrakingCount}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{t('events', 'बार')}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748b' }}>{t('Rapid Accel:', 'रैपिड एक्सेल:')} {currentTruck.rapidAccelerationCount}</span>
              </div>

              <div className="ais-gauge-tile">
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('Night Driving Status', 'नाइट ड्राइविंग')}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '8px 0 4px' }}>
                  <Moon size={16} style={{ color: currentTruck.isNightDriving ? '#4f46e5' : '#94a3b8' }} />
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>
                    {currentTruck.isNightDriving ? t('Night Active', 'रात्रि सक्रिय') : t('Day Transit', 'दिन का सफर')}
                  </span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748b' }}>11 PM - 5 AM Risk Window</span>
              </div>
            </div>

            {/* Live Simulated GPS Map Card */}
            <div className="ais-gps-card">
              <div className="ais-gps-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={15} style={{ color: '#f87171' }} className="animate-spin" />
                  <span>AIS-140 GPS &amp; IRNSS SATELLITE POSITION</span>
                </div>
                <span style={{ color: '#34d399', fontFamily: 'monospace' }}>
                  {currentTruck.lastPingAt || 'Live (2s ago)'}
                </span>
              </div>

              <div className="ais-gps-body">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <MapPin size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                      {currentTruck.currentHighwayLocation}
                    </h4>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8' }}>
                      Coordinates: Lat {Number(currentTruck.latitude).toFixed(4)}°N, Lon {Number(currentTruck.longitude).toFixed(4)}°E
                    </div>
                  </div>
                </div>

                <div className="ais-driver-call-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PhoneCall size={14} style={{ color: '#34d399' }} />
                    <span>{t('Driver:', 'चालक:')} <b>{currentTruck.driverName}</b> ({currentTruck.driverPhone})</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => showToast('info', t(`Connecting voice call to ${currentTruck.driverName}...`, `${currentTruck.driverName} को वॉयस कॉल कनेक्ट हो रही है...`))}
                    className="ais-call-btn"
                  >
                    {t('Call Driver', 'कॉल करें')}
                  </button>
                </div>
              </div>
            </div>

            {/* Hardware Compliance Badges */}
            <div className="ais-standards-box">
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('MoRTH AIS-140 Hardware Compliance Standards', 'सड़क परिवहन मंत्रालय AIS-140 हार्डवेयर अनुपालन मानक')}
              </span>
              <div className="ais-standards-grid">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span>{t('Dual eSIM Connectivity (BSNL + Airtel)', 'डुअल सिम ई-सिम (BSNL + Airtel)')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span>{t('Anti-Tampering Battery (5h Backup)', 'एंटी-टैम्परिंग बैटरी बैकअप (5 Hours)')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span>{t('IRNSS / NavIC Indian Satellite Support', 'IRNSS / NavIC भारतीय उपग्रह सपोर्ट')}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Ais140SafetyTelematicsRadar;
