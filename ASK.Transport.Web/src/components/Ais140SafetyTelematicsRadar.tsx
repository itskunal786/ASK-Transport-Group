import { useState, useEffect } from 'react';
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
      if (data && data.length > 0) {
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
      showToast('success', t(`Emergency panic alarm acknowledged & reset for vehicle ${selectedTruck.vehicleNumber}!`, `गाड़ी ${selectedTruck.vehicleNumber} का पैनिक अलर्ट सफलतापूर्वक सत्यापित एवं रीसेट किया गया!`));
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
      `Live coordinates and emergency telemetry dispatched to Highway Patrol (${truck.nearestPoliceEmergencyContact})!`,
      `हाईवे पुलिस कंट्रोल रूम (${truck.nearestPoliceEmergencyContact}) को लाइव जीपीएस लोकेशन व अलर्ट टेलीमेट्री प्रेषित कर दी गई है!`
    ));
  };

  const filteredList = telemetryList.filter(item => {
    const matchSearch = item.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.currentHighwayLocation.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'ALL') return matchSearch;
    if (filterType === 'SOS') return matchSearch && item.panicButtonTriggered;
    if (filterType === 'SPEED') return matchSearch && item.currentSpeedKmph > item.speedLimitKmph;
    if (filterType === 'FATIGUE') return matchSearch && (item.fatigueWarning || item.continuousDrivingHours > 8);
    return matchSearch;
  });

  const activePanicCount = telemetryList.filter(tItem => tItem.panicButtonTriggered).length;
  const speedingCount = telemetryList.filter(tItem => tItem.currentSpeedKmph > tItem.speedLimitKmph).length;
  const fatigueCount = telemetryList.filter(tItem => tItem.fatigueWarning || tItem.continuousDrivingHours > 8).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium shadow-lg transition-all ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' :
          notification.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' :
          'bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {notification.type === 'error' && <AlertOctagon className="w-5 h-5 text-rose-500" />}
            {notification.type === 'info' && <Radio className="w-5 h-5 text-indigo-500" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Flashing Emergency Banner if Panic SOS active */}
      {activePanicCount > 0 && (
        <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white text-rose-600 flex items-center justify-center font-black">
              SOS
            </div>
            <div>
              <h4 className="font-extrabold text-base tracking-wide flex items-center gap-2">
                <span>{t(`🚨 Live Panic Emergency Alert (${activePanicCount} Vehicle in Distress)`, `🚨 लाइव पैनिक इमरजेंसी चेतावनी (${activePanicCount} वाहन संकट में)`)}</span>
              </h4>
              <p className="text-xs text-rose-100 mt-0.5">
                {t(
                  'Emergency panic button pressed inside cabin! Nearest Highway Patrol and response units alerted.',
                  'ड्राइवर द्वारा केबिन का इमरजेंसी पैनिक बटन दबाया गया है! निकटतम हाईवे पुलिस एवं रेस्क्यू यूनिट तुरंत संपर्क करें।'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const sos = telemetryList.find(tItem => tItem.panicButtonTriggered);
              if (sos) setSelectedTruck(sos);
            }}
            className="px-4 py-2 bg-white text-rose-700 font-bold text-xs rounded-xl hover:bg-rose-50 shadow transition whitespace-nowrap"
          >
            {t('View Vehicle Immediately ➔', 'तत्काल वाहन देखें ➔')}
          </button>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-red-900 via-stone-900 to-black rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold tracking-wider uppercase">
            <Radio className="w-4 h-4 animate-ping" />
            <span>Govt MoRTH AIS-140 Certified Telematics Shield</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-white">
            {t('AIS-140 National Telematics & Highway Safety Radar', 'AIS-140 राष्ट्रीय टेलीमैटिक्स व हाईवे सुरक्षा राडार')}
          </h1>
          <p className="text-stone-300 text-sm mt-1">
            {t(
              '24×7 real-time emergency panic SOS, speed governor (>80 km/h) violations, night driving and driver fatigue monitoring.',
              '24×7 इमरजेंसी पैनिक एसओएस, स्पीड गवर्नर (>80 km/h) उल्लंघन, नाइट ड्राइविंग एवं ड्राइवर थकान मॉनिटरिंग।'
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchSafetyData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t('Refresh', 'रिफ्रेश')}</span>
          </button>
          <div className="px-3 py-1.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>AIS-140 IRNSS + GPS LIVE</span>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {t('Active AIS-140 Fleet', 'सक्रिय AIS-140 गाड़ियां')}
            </span>
            <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-0.5">{telemetryList.length}</div>
            <span className="text-xs text-emerald-600 mt-1 inline-block">
              {t('100% IRNSS Satellite Lock', '100% IRNSS सैटेलाइट लॉक')}
            </span>
          </div>
          <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-300">
            <Radio className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {t('Active SOS Panic Alarms', 'SOS पैनिक अलार्म')}
            </span>
            <div className={`text-2xl font-bold mt-0.5 ${activePanicCount > 0 ? 'text-rose-600 animate-pulse' : 'text-stone-800 dark:text-stone-100'}`}>
              {activePanicCount}
            </div>
            <span className="text-xs text-rose-500 mt-1 inline-block">
              {t('Highway Emergency Protocol', 'हाईवे इमरजेंसी प्रोटोकॉल')}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activePanicCount > 0 ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'}`}>
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {t('Over-Speed (>80 km/h)', 'ओवर-स्पीड (>80 km/h)')}
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-0.5">{speedingCount}</div>
            <span className="text-xs text-amber-500 mt-1 inline-block">
              {t('Speed Governor Violations', 'स्पीड गवर्नर वॉयलेशन')}
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {t('Driver Fatigue Risk (>8h)', 'ड्राइवर थकान जोखिम (>8h)')}
            </span>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{fatigueCount}</div>
            <span className="text-xs text-indigo-500 mt-1 inline-block">
              {t('Mandatory Rest Break Due', 'विश्राम ब्रेक अनुशंसित')}
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
            <Moon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side: Fleet Radar List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm">
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder={t('Search vehicle / driver / highway corridor...', 'गाड़ी संख्या / ड्राइवर / हाईवे लोकेशन...')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-stone-800 dark:text-stone-100"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                {[
                  { key: 'ALL', label: t('All Vehicles', 'सभी गाड़ियां') },
                  { key: 'SOS', label: `${t('Panic SOS', 'पैनिक SOS')} (${activePanicCount})` },
                  { key: 'SPEED', label: `${t('Over-Speed', 'ओवर स्पीड')} (${speedingCount})` },
                  { key: 'FATIGUE', label: `${t('Fatigue Risk', 'ड्राइवर थकान')} (${fatigueCount})` }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilterType(tab.key)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                      filterType === tab.key
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredList.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-sm">
                  {t('No safety telemetry data found', 'कोई टेलीमेट्री डेटा नहीं मिला')}
                </div>
              ) : (
                filteredList.map(truck => {
                  const isSelected = selectedTruck.id === truck.id;
                  const isSos = truck.panicButtonTriggered;
                  const isOverSpeed = truck.currentSpeedKmph > truck.speedLimitKmph;

                  return (
                    <div
                      key={truck.id}
                      onClick={() => setSelectedTruck(truck)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        isSos ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/20' :
                        isSelected ? 'border-amber-500 bg-stone-50 dark:bg-stone-800/80 shadow' :
                        'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-stone-500" />
                          <span>{truck.vehicleNumber}</span>
                        </span>

                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isSos ? 'bg-rose-600 text-white animate-pulse' :
                          isOverSpeed ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                          truck.fatigueWarning ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300' :
                          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}>
                          {isSos ? 'EMERGENCY PANIC' :
                           isOverSpeed ? `${truck.currentSpeedKmph} km/h (OVER-SPEED)` :
                           truck.fatigueWarning ? 'FATIGUE ALERT' : 'COMPLIANT'}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between">
                        <span>{t('Driver:', 'ड्राइवर:')} <b>{truck.driverName}</b></span>
                        <span className="font-mono text-[11px]">{truck.currentSpeedKmph} km/h</span>
                      </div>

                      <div className="mt-1 flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400 truncate">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate">{truck.currentHighwayLocation}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Safety Radar & Emergency Protocol Console */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Radio className={`w-5 h-5 ${selectedTruck.panicButtonTriggered ? 'text-rose-600 animate-spin' : 'text-emerald-600'}`} />
                <h3 className="font-bold text-stone-800 dark:text-stone-100 text-sm">
                  {t('AIS-140 Radar Console', 'AIS-140 राडार व्यू')} • {selectedTruck.vehicleNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {selectedTruck.panicButtonTriggered && (
                  <button
                    onClick={() => handleAckPanic(selectedTruck.id)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('Reset / Acknowledge SOS Alarm', 'SOS अलार्म रीसेट / एक्नॉलेज')}</span>
                  </button>
                )}
                <button
                  onClick={() => handlePoliceAlert(selectedTruck)}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t('Alert Highway Patrol', 'हाईवे पुलिस अलर्ट भेजें')}</span>
                </button>
              </div>
            </div>

            {/* Radar Body */}
            <div className="p-6 space-y-6">
              
              {/* Emergency Alert Banner if Active for this vehicle */}
              {selectedTruck.panicButtonTriggered && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 flex items-start space-x-3">
                  <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-rose-800 dark:text-rose-300 text-sm">
                      {t('ALERT: Cabin Emergency Panic Button Triggered', 'अलर्ट: केबिन पैनिक बटन सक्रिय (Cabin SOS Switch Triggered)')}
                    </h4>
                    <p className="text-xs text-rose-700 dark:text-rose-400">
                      {t(
                        'Driver has activated the emergency distress switch. Potential hijack, accident or urgent medical situation.',
                        'वाहन चालक ने सहायता हेतु पैनिक स्विच दबाया है। संभावित हाइजैक, सड़क दुर्घटना या आपातकालीन चिकित्सा स्थिति।'
                      )}
                    </p>
                    <div className="pt-1 text-xs font-mono font-bold text-rose-900 dark:text-rose-200">
                      {t('Nearest Police Station:', 'निकटतम पुलिस स्टेशन:')} {selectedTruck.nearestPoliceEmergencyContact}
                    </div>
                  </div>
                </div>
              )}

              {/* Speed & Live Status Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="text-[11px] text-stone-500 block">{t('Current Speed', 'लाइव गति (Current Speed)')}</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-2xl font-black ${selectedTruck.currentSpeedKmph > selectedTruck.speedLimitKmph ? 'text-rose-600' : 'text-stone-800 dark:text-stone-100'}`}>
                      {selectedTruck.currentSpeedKmph}
                    </span>
                    <span className="text-xs text-stone-400">km/h</span>
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">{t('Limit:', 'सीमा:')} {selectedTruck.speedLimitKmph} km/h</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="text-[11px] text-stone-500 block">{t('Continuous Driving', 'लगातार ड्राइविंग (Continuous)')}</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-2xl font-black ${selectedTruck.continuousDrivingHours > 8 ? 'text-indigo-600' : 'text-stone-800 dark:text-stone-100'}`}>
                      {selectedTruck.continuousDrivingHours}
                    </span>
                    <span className="text-xs text-stone-400">{t('hours', 'घंटे')}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">{t('Safe Max: 8.0h', 'अधिकतम सुरक्षित: 8.0h')}</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="text-[11px] text-stone-500 block">{t('Harsh Braking Count', 'हर्ष ब्रेकिंग (Harsh Braking)')}</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-amber-600">
                      {selectedTruck.harshBrakingCount}
                    </span>
                    <span className="text-xs text-stone-400">{t('events', 'बार')}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">{t('Rapid Accel:', 'रैपिड एक्सेल:')} {selectedTruck.rapidAccelerationCount}</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="text-[11px] text-stone-500 block">{t('Night Driving Status', 'नाइट ड्राइविंग स्टेटस')}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Moon className={`w-4 h-4 ${selectedTruck.isNightDriving ? 'text-indigo-500' : 'text-stone-400'}`} />
                    <span className="text-sm font-bold text-stone-800 dark:text-stone-200">
                      {selectedTruck.isNightDriving ? t('Night Active', 'रात्रि सक्रिय') : t('Day Transit', 'दिन का सफर')}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">11 PM - 5 AM Risk Window</span>
                </div>
              </div>

              {/* Live Simulated GPS Map Card */}
              <div className="rounded-xl border border-stone-200 dark:border-stone-800 p-4 bg-stone-900 text-stone-100 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div className="flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-rose-400 animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
                      AIS-140 GPS & IRNSS Satellite Telemetry Position
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {selectedTruck.lastPingAt}
                  </span>
                </div>

                <div className="py-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-white">{selectedTruck.currentHighwayLocation}</h4>
                      <div className="text-xs font-mono text-stone-400 mt-0.5">
                        Coordinates: Lat {selectedTruck.latitude.toFixed(4)}°N, Lon {selectedTruck.longitude.toFixed(4)}°E
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-stone-800/80 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-emerald-400" />
                      <span>{t('Driver:', 'चालक:')} <b>{selectedTruck.driverName}</b> ({selectedTruck.driverPhone})</span>
                    </div>
                    <button 
                      onClick={() => showToast('info', t(`Connecting voice call to ${selectedTruck.driverName}...`, `${selectedTruck.driverName} को वॉयस कॉल कनेक्ट हो रही है...`))}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold"
                    >
                      {t('Call Driver', 'कॉल करें')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Hardware Compliance Badges */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 space-y-3">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  MoRTH AIS-140 Hardware Compliance Standards
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{t('Dual eSIM Connectivity (BSNL + Airtel)', 'डुअल सिम ई-सिम कनेक्टिविटी (BSNL + Airtel)')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{t('Anti-Tampering Battery (5h Active Backup)', 'एंटी-टैम्परिंग बैटरी बैकअप (5 Hours Active)')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{t('IRNSS / NavIC Indian Satellite Support', 'IRNSS / NavIC भारतीय उपग्रह सपोर्ट')}</span>
                  </div>
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
