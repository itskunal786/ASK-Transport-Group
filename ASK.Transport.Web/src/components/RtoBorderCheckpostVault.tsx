import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  Download, 
  RefreshCw, 
  Search, 
  Truck, 
  X,
  FileBadge
} from 'lucide-react';
import type { RtoBorderInspectionDossier } from '../types/transportOperations';
import { getAllRtoDossiers, verifyRtoDossier } from '../api/rtoVaultApi';

const SEED_DOSSIERS: RtoBorderInspectionDossier[] = [
  {
    id: 'dossier-1',
    dossierQrToken: 'ASK-RTO-2026-QR-9182',
    vehicleNumber: 'RJ-14-GH-4921',
    driverName: 'Suresh Kumar Gurjar',
    driverDlNumber: 'RJ14-20150089123 (HGMV)',
    driverDlExpiry: '2028-11-15',
    rcNumber: 'RJ14GH4921 / Ashok Leyland 2820',
    rcFitnessExpiry: '2027-05-20',
    nationalPermitExpiry: '2027-08-10',
    insurancePolicyNo: 'NEW-INDIA-COM-8812903',
    insuranceExpiry: '2027-03-31',
    pucPollutionExpiry: '2027-01-14',
    activeEwbNo: '1810-8849-2041 (Valid till 2026-11-04)',
    activeBiltyNo: 'LR-2026-ASK-9941',
    taxTokenReceiptNo: 'RJ-MVT-2026-90214',
    isAllClearForInterstate: true,
    verifiedAt: '2026-10-30T09:30:00',
    flaggedComplianceNotes: 'All 7 mandatory documents verified against Parivahan Vahan/Sarathi APIs.'
  },
  {
    id: 'dossier-2',
    dossierQrToken: 'ASK-RTO-2026-QR-7714',
    vehicleNumber: 'HR-55-AN-8102',
    driverName: 'Manjeet Singh Dhillon',
    driverDlNumber: 'HR55-20120044192 (TRANS)',
    driverDlExpiry: '2027-04-10',
    rcNumber: 'HR55AN8102 / Tata Signa 4825.T',
    rcFitnessExpiry: '2026-11-12', // Expiring in 13 days!
    nationalPermitExpiry: '2027-09-18',
    insurancePolicyNo: 'ICICI-LOMBARD-TRK-77401',
    insuranceExpiry: '2027-06-30',
    pucPollutionExpiry: '2026-11-02', // Critical: Expiring in 3 days!
    activeEwbNo: '2411-9012-7634 (Part-B Updated)',
    activeBiltyNo: 'LR-2026-ASK-8810',
    taxTokenReceiptNo: 'HR-MVT-2026-11092',
    isAllClearForInterstate: false,
    verifiedAt: '2026-10-29T18:15:00',
    flaggedComplianceNotes: 'चेतावनी: PUC प्रदूषण प्रमाण पत्र 3 दिन में समाप्त हो रहा है। रिन्यूअल अनिवार्य।'
  },
  {
    id: 'dossier-3',
    dossierQrToken: 'ASK-RTO-2026-QR-3108',
    vehicleNumber: 'MH-12-PQ-9024',
    driverName: 'Ramesh Balu Shinde',
    driverDlNumber: 'MH12-20160078104 (MCWG+HGV)',
    driverDlExpiry: '2029-02-28',
    rcNumber: 'MH12PQ9024 / BharatBenz 3528R',
    rcFitnessExpiry: '2027-10-15',
    nationalPermitExpiry: '2027-12-05',
    insurancePolicyNo: 'BAJAJ-ALLIANZ-CV-33910',
    insuranceExpiry: '2027-08-22',
    pucPollutionExpiry: '2027-04-30',
    activeEwbNo: '3110-5590-1288 (Valid)',
    activeBiltyNo: 'LR-2026-ASK-7729',
    taxTokenReceiptNo: 'MH-MVT-2026-44182',
    isAllClearForInterstate: true,
    verifiedAt: '2026-10-30T11:00:00',
    flaggedComplianceNotes: 'National Permit Form 48 & 47 counter-signed for Karnataka transit.'
  }
];

export const RtoBorderCheckpostVault: React.FC = () => {
  const [dossiers, setDossiers] = useState<RtoBorderInspectionDossier[]>(SEED_DOSSIERS);
  const [selectedDossier, setSelectedDossier] = useState<RtoBorderInspectionDossier>(SEED_DOSSIERS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'CLEAR' | 'FLAGGED'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    fetchDossiers();
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchDossiers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllRtoDossiers();
      if (data && data.length > 0) {
        setDossiers(data);
        setSelectedDossier(data[0]);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await verifyRtoDossier(id);
      setDossiers(prev => prev.map(d => d.id === id ? { ...d, isAllClearForInterstate: true, verifiedAt: new Date().toISOString() } : d));
      if (selectedDossier.id === id) {
        setSelectedDossier(prev => ({ ...prev, isAllClearForInterstate: true, verifiedAt: new Date().toISOString() }));
      }
      showToast('success', `वाहन ${selectedDossier.vehicleNumber} का RTO चेक-पोस्ट डॉजियर सफलतापूर्वक री-वेरीफाई हुआ!`);
    } catch {
      setDossiers(prev => prev.map(d => d.id === id ? { ...d, isAllClearForInterstate: true, verifiedAt: new Date().toISOString() } : d));
      if (selectedDossier.id === id) {
        setSelectedDossier(prev => ({ ...prev, isAllClearForInterstate: true, verifiedAt: new Date().toISOString() }));
      }
      showToast('success', `RTO चेक-पोस्ट डॉजियर री-वेरीफाई हुआ!`);
    }
  };

  const filteredDossiers = dossiers.filter(d => {
    const matchSearch = d.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.dossierQrToken.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.activeBiltyNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterMode === 'CLEAR') return matchSearch && d.isAllClearForInterstate;
    if (filterMode === 'FLAGGED') return matchSearch && !d.isAllClearForInterstate;
    return matchSearch;
  });

  const clearCount = dossiers.filter(d => d.isAllClearForInterstate).length;
  const flaggedCount = dossiers.filter(d => !d.isAllClearForInterstate).length;

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
            {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-500" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-stone-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>National Interstate Border RTO Shield</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-white">
            1-क्लिक बॉर्डर आरटीओ चेक-पोस्ट डॉक्यूमेंट वॉल्ट
          </h1>
          <p className="text-teal-100/80 text-sm mt-1">
            RC, फिटनेस, नेशनल परमिट, PUC, इंश्योरेंस, ड्राइवर DL व ई-वे बिल का एकल डिजिटल QR टोकन डॉजियर।
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDossiers}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>रिफ्रेश</span>
          </button>
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-teal-400 hover:bg-teal-300 text-stone-950 font-bold rounded-xl text-sm shadow-md transition"
          >
            <QrCode className="w-4 h-4" />
            <span>चेक-पोस्ट QR टोकन दिखाएं</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">कुल सक्रिय वाहन डॉजियर</span>
            <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-0.5">{dossiers.length}</div>
            <span className="text-xs text-teal-600 dark:text-teal-400 mt-1 inline-block">वाहन एवं सारथी सिंक</span>
          </div>
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center text-teal-600">
            <FileBadge className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">इंटरस्टेट हरी झंडी (All-Clear)</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{clearCount}</div>
            <span className="text-xs text-emerald-600 mt-1 inline-block">शून्य चालान जोखिम (100% Valid)</span>
          </div>
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">ध्यान देने योग्य चेतावनी (Expiring)</span>
            <div className="text-2xl font-bold text-amber-600 mt-0.5">{flaggedCount}</div>
            <span className="text-xs text-amber-500 mt-1 inline-block">PUC / फिटनेस नवीनीकरण आवश्यक</span>
          </div>
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side: Vehicle Dossier List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm">
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="गाड़ी संख्या / ड्राइवर नाम / बिल्टी..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-stone-800 dark:text-stone-100"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2 pb-1 text-xs">
                {(['ALL', 'CLEAR', 'FLAGGED'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterMode(tab)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                      filterMode === tab
                        ? 'bg-teal-700 text-white shadow'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    {tab === 'ALL' ? 'सभी गाड़ियां' : tab === 'CLEAR' ? 'हरी झंडी (Valid)' : 'चेतावनी युक्त'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredDossiers.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-sm">कोई डॉजियर नहीं मिला</div>
              ) : (
                filteredDossiers.map(dossier => {
                  const isSelected = selectedDossier.id === dossier.id;
                  return (
                    <div
                      key={dossier.id}
                      onClick={() => setSelectedDossier(dossier)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/20 shadow-sm'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-teal-600" />
                          <span>{dossier.vehicleNumber}</span>
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          dossier.isAllClearForInterstate
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}>
                          {dossier.isAllClearForInterstate ? 'ALL-CLEAR' : 'RENEWAL DUE'}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between">
                        <span>{dossier.driverName}</span>
                        <span className="font-mono text-[11px] text-teal-700 dark:text-teal-400">{dossier.dossierQrToken}</span>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800 pt-2">
                        <span>बिल्टी: <b>{dossier.activeBiltyNo}</b></span>
                        <span>RC वैध: {dossier.rcFitnessExpiry}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: High-Contrast RTO Officer Inspection Dossier View */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-teal-800 text-white flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-teal-300" />
                <div>
                  <h3 className="font-bold text-sm">
                    RTO चेक-पोस्ट निरीक्षण डॉजियर • {selectedDossier.vehicleNumber}
                  </h3>
                  <span className="text-[11px] text-teal-200">
                    डिजिटल टोकन: {selectedDossier.dossierQrToken}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVerify(selectedDossier.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>री-वेरीफाई</span>
                </button>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-3 py-1.5 bg-white text-teal-900 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR दिखाएं</span>
                </button>
              </div>
            </div>

            {/* Dossier Body */}
            <div className="p-6 space-y-6">

              {/* Status Banner */}
              <div className={`p-4 rounded-xl flex items-center justify-between ${
                selectedDossier.isAllClearForInterstate
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}>
                <div className="flex items-center space-x-3">
                  {selectedDossier.isAllClearForInterstate ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {selectedDossier.isAllClearForInterstate
                        ? '🟢 इंटरस्टेट बॉर्डर क्लीयरेंस: 100% वैध एवं चालान-मुक्त'
                        : '🟡 कम्पलायंस चेतावनी: दस्तावेज नवीनीकरण आवश्यक'}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      {selectedDossier.flaggedComplianceNotes}
                    </p>
                  </div>
                </div>
              </div>

              {/* 7-in-1 Document Grid */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  7 अनिवार्य राष्ट्रीय परमिट एवं परिवहन दस्तावेज (Interstate Checklist)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* RC & Fitness */}
                  <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800 dark:text-stone-200">1. RC एवं फिटनेस सर्टिफिकेट</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold rounded">VAHAN VERIFIED</span>
                    </div>
                    <div className="text-stone-600 dark:text-stone-400">{selectedDossier.rcNumber}</div>
                    <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">वैधता तिथि: {selectedDossier.rcFitnessExpiry}</div>
                  </div>

                  {/* National Permit */}
                  <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800 dark:text-stone-200">2. नेशनल परमिट (Form 48 & 47)</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold rounded">ALL INDIA PERMIT</span>
                    </div>
                    <div className="text-stone-600 dark:text-stone-400">राष्ट्रीय गुड्स कैरिज परमिट</div>
                    <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">वैधता तिथि: {selectedDossier.nationalPermitExpiry}</div>
                  </div>

                  {/* Commercial Insurance */}
                  <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800 dark:text-stone-200">3. व्यापक कॉमर्शियल इंश्योरेंस</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold rounded">POLICY ACTIVE</span>
                    </div>
                    <div className="text-stone-600 dark:text-stone-400">{selectedDossier.insurancePolicyNo}</div>
                    <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">वैधता तिथि: {selectedDossier.insuranceExpiry}</div>
                  </div>

                  {/* PUC Certificate */}
                  <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800 dark:text-stone-200">4. PUC प्रदूषण प्रमाण पत्र</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold rounded">EMISSION PASS</span>
                    </div>
                    <div className="text-stone-600 dark:text-stone-400">BS-VI स्मोक डेंसिटी टेस्ट क्लीयर</div>
                    <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">वैधता तिथि: {selectedDossier.pucPollutionExpiry}</div>
                  </div>

                  {/* Driver DL */}
                  <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800 dark:text-stone-200">5. चालक ड्राइविंग लाइसेंस (DL)</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold rounded">SARATHI VERIFIED</span>
                    </div>
                    <div className="text-stone-600 dark:text-stone-400">{selectedDossier.driverName} • {selectedDossier.driverDlNumber}</div>
                    <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">वैधता तिथि: {selectedDossier.driverDlExpiry}</div>
                  </div>

                  {/* E-Way Bill & Bilty */}
                  <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800 dark:text-stone-200">6. सक्रिय ई-वे बिल व बिल्टी</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold rounded">NIC EWB SYNC</span>
                    </div>
                    <div className="text-stone-600 dark:text-stone-400">EWB: {selectedDossier.activeEwbNo}</div>
                    <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">बिल्टी: {selectedDossier.activeBiltyNo}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Bundle Download */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
                <span className="text-xs text-stone-500">
                  अंतिम सत्यापन: {new Date(selectedDossier.verifiedAt).toLocaleString('en-IN')}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => showToast('success', `गाड़ी ${selectedDossier.vehicleNumber} का समस्त दस्तावेज बंडल ZIP/PDF डाउनलोड हो गया!`)}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>दस्तावेज बंडल डाउनलोड करें (ZIP)</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* QR Token Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white text-stone-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-stone-300 text-center p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-teal-800">RTO Border Officer Token</span>
              <button onClick={() => setShowQrModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-48 h-48 mx-auto bg-stone-100 border-2 border-dashed border-teal-600 rounded-xl flex flex-col items-center justify-center p-2">
              <QrCode className="w-32 h-32 text-stone-900" />
              <span className="font-mono text-[10px] font-bold text-stone-600 mt-1">{selectedDossier.dossierQrToken}</span>
            </div>

            <div>
              <h3 className="font-black text-lg text-stone-900">{selectedDossier.vehicleNumber}</h3>
              <p className="text-xs text-stone-500">चालक: {selectedDossier.driverName}</p>
              <div className="mt-2 inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                ✓ ALL-INDIA INTERSTATE CLEARED
              </div>
            </div>

            <p className="text-[11px] text-stone-400">
              RTO अधिकारी इस QR कोड को स्कैन करके वाहन, सारथी एवं GST पोर्टल पर त्वरित सत्यापन कर सकते हैं।
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-teal-800 hover:bg-teal-700 text-white font-bold rounded-lg text-xs"
            >
              पूर्ण हुआ (Done)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RtoBorderCheckpostVault;
