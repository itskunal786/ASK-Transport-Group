import { useState, useEffect } from 'react';
import {
  BookUser,
  Star,
  Search,
  Plus,
  MapPin,
  Phone,
  Building,
  Check,
  X,
  FileText
} from 'lucide-react';
import type { CustomerConsigneeDirectory } from '../types/transportOperations';
import { getCustomerConsignees, addCustomerConsignee, toggleConsigneeFavorite } from '../api/customerDirectoryApi';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectConsignee?: (consignee: CustomerConsigneeDirectory) => void;
  customerId?: string;
}

const SEED_CONSIGNEES: CustomerConsigneeDirectory[] = [
  {
    id: 'c-001',
    customerId: 'cust-default',
    consigneeLegalTitle: 'Tata Steel Tubes Division Ltd',
    tradeBrandName: 'Tata Steel Plant Dock 4',
    gstinNumber: '07AAACK1948Q1Z4',
    completeAddress: 'Plot 44-48, Ecotech III Industrial Area, Greater Noida',
    destinationCity: 'Greater Noida',
    pincode: '201306',
    stateCode: '09',
    contactPerson: 'Sanjay Kumar (Logistics Head)',
    contactPhone: '+91 98102 33441',
    contactEmail: 'sanjay.k@tatasteeltubes.com',
    dockUnloadingInstructions: 'Entry from Gate 2 only. Hard hat and safety shoes mandatory for drivers.',
    isFavorite: true
  },
  {
    id: 'c-002',
    customerId: 'cust-default',
    consigneeLegalTitle: 'Reliance Retail CDC Warehouse',
    tradeBrandName: 'Reliance Smart Central Hub',
    gstinNumber: '27AABCS1429B1Z8',
    completeAddress: 'Bhiwandi Logistics Park, Building C, Pipeline Road',
    destinationCity: 'Bhiwandi (Mumbai)',
    pincode: '421302',
    stateCode: '27',
    contactPerson: 'Mahesh Patil (Dock Supv)',
    contactPhone: '+91 99201 55662',
    contactEmail: 'mahesh.p@ril.com',
    dockUnloadingInstructions: 'Hydraulic ramp unloading available. Unloading hours 08:00 AM to 08:00 PM.',
    isFavorite: true
  },
  {
    id: 'c-003',
    customerId: 'cust-default',
    consigneeLegalTitle: 'UltraTech Cement Mother Depot',
    tradeBrandName: 'UltraTech Aslali Depot',
    gstinNumber: '24AAACU1190K1Z5',
    completeAddress: 'National Highway 8, Aslali Ring Road Junction',
    destinationCity: 'Ahmedabad',
    pincode: '382427',
    stateCode: '24',
    contactPerson: 'Kishore Parmar',
    contactPhone: '+91 94270 11982',
    contactEmail: 'kishore.p@adityabirla.com',
    dockUnloadingInstructions: 'Trailer parking bays 5 through 9 reserved for ASK Transport Group.',
    isFavorite: false
  }
];

export default function ConsigneeAddressBookModal({
  isOpen,
  onClose,
  onSelectConsignee,
  customerId = 'cust-default'
}: Props) {
  const { t } = useLanguage();
  const [consignees, setConsignees] = useState<CustomerConsigneeDirectory[]>(SEED_CONSIGNEES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [newEntry, setNewEntry] = useState({
    consigneeLegalTitle: '',
    tradeBrandName: '',
    gstinNumber: '',
    completeAddress: '',
    destinationCity: '',
    pincode: '',
    stateCode: '07',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    dockUnloadingInstructions: '',
    isFavorite: false
  });

  useEffect(() => {
    if (isOpen) {
      getCustomerConsignees(customerId)
        .then(data => {
          if (data && data.length > 0) setConsignees(data);
        })
        .catch(() => {
          // fallback to seed
        });
    }
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await toggleConsigneeFavorite(id);
      setConsignees(consignees.map(c => (c.id === updated.id ? updated : c)));
    } catch {
      setConsignees(consignees.map(c => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c)));
    }
  };

  const handleCreateConsignee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.consigneeLegalTitle || !newEntry.destinationCity) return;

    try {
      const created = await addCustomerConsignee({ ...newEntry, customerId });
      setConsignees([created, ...consignees]);
    } catch {
      const fallback: CustomerConsigneeDirectory = {
        id: `consignee-${Date.now()}`,
        customerId,
        ...newEntry
      };
      setConsignees([fallback, ...consignees]);
    }

    setShowAddForm(false);
    setNewEntry({
      consigneeLegalTitle: '',
      tradeBrandName: '',
      gstinNumber: '',
      completeAddress: '',
      destinationCity: '',
      pincode: '',
      stateCode: '07',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      dockUnloadingInstructions: '',
      isFavorite: false
    });
  };

  const handleCopyDetails = (item: CustomerConsigneeDirectory, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${item.consigneeLegalTitle} (${item.tradeBrandName})\nGSTIN: ${item.gstinNumber}\nAddress: ${item.completeAddress}, ${item.destinationCity} - ${item.pincode}\nContact: ${item.contactPerson} (${item.contactPhone})\nInstructions: ${item.dockUnloadingInstructions}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filtered = consignees.filter(c =>
    c.consigneeLegalTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.destinationCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.gstinNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <BookUser className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('Consignee & Delivery Address Book', 'प्राप्तकर्ता एवं डिलीवरी पता पुस्तिका')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('Manage verified recipient parties, dock directions, and fast 1-click booking autofill.', 'सत्यापित प्राप्तकर्ताओं, डॉक निर्देशों और 1-क्लिक बुकिंग ऑटो-फ़िल का प्रबंधन करें।')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Filter Strip */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search consignee, GSTIN, city...', 'प्राप्तकर्ता, GSTIN, शहर से खोजें...')}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? t('Close Form', 'फ़ॉर्म बंद करें') : t('Add New Consignee', 'नया प्राप्तकर्ता जोड़ें')}
            </button>
          </div>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Add Form Drawer */}
          {showAddForm && (
            <form onSubmit={handleCreateConsignee} className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 rounded-xl space-y-3 text-xs mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-600" />
                {t('Add New Delivery Consignee Party', 'नया डिलीवरी प्राप्तकर्ता जोड़ें')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">{t('Legal Entity Name *', 'कानूनी नाम *')}</label>
                  <input
                    type="text"
                    required
                    value={newEntry.consigneeLegalTitle}
                    onChange={(e) => setNewEntry({ ...newEntry, consigneeLegalTitle: e.target.value })}
                    placeholder="e.g. Tata Steel Tubes Division Ltd"
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">{t('Trade / Dock Name', 'ट्रेड / डॉक का नाम')}</label>
                  <input
                    type="text"
                    value={newEntry.tradeBrandName}
                    onChange={(e) => setNewEntry({ ...newEntry, tradeBrandName: e.target.value })}
                    placeholder="e.g. Plant Dock 4"
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">{t('GSTIN (15 Digits)', 'GSTIN (15 अंक)')}</label>
                  <input
                    type="text"
                    value={newEntry.gstinNumber}
                    onChange={(e) => setNewEntry({ ...newEntry, gstinNumber: e.target.value.toUpperCase() })}
                    placeholder="07AAACK1948Q1Z4"
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 uppercase font-mono rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">{t('Destination City *', 'गंतव्य शहर *')}</label>
                  <input
                    type="text"
                    required
                    value={newEntry.destinationCity}
                    onChange={(e) => setNewEntry({ ...newEntry, destinationCity: e.target.value })}
                    placeholder="e.g. Greater Noida"
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">{t('Complete Address & Pincode', 'पूर्ण पता और पिनकोड')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newEntry.completeAddress}
                    onChange={(e) => setNewEntry({ ...newEntry, completeAddress: e.target.value })}
                    placeholder="Plot / Street / Area"
                    className="sm:col-span-2 p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    value={newEntry.pincode}
                    onChange={(e) => setNewEntry({ ...newEntry, pincode: e.target.value })}
                    placeholder="Pincode (e.g. 201306)"
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">{t('Contact Person & Phone', 'संपर्क व्यक्ति व फ़ोन')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newEntry.contactPerson}
                      onChange={(e) => setNewEntry({ ...newEntry, contactPerson: e.target.value })}
                      placeholder="Name"
                      className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                    />
                    <input
                      type="text"
                      value={newEntry.contactPhone}
                      onChange={(e) => setNewEntry({ ...newEntry, contactPhone: e.target.value })}
                      placeholder="+91 98100 00000"
                      className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">{t('Dock Unloading Instructions', 'डॉक अनलोडिंग निर्देश')}</label>
                  <input
                    type="text"
                    value={newEntry.dockUnloadingInstructions}
                    onChange={(e) => setNewEntry({ ...newEntry, dockUnloadingInstructions: e.target.value })}
                    placeholder="Gate #, crane availability, working hours..."
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                >
                  {t('Save Consignee', 'सहेजें')}
                </button>
              </div>
            </form>
          )}

          {/* Consignee List Cards */}
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <BookUser className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>{t('No consignees found matching your search.', 'कोई प्राप्तकर्ता नहीं मिला।')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          {item.consigneeLegalTitle}
                        </h4>
                        {item.tradeBrandName && (
                          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                            {item.tradeBrandName}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleToggleFavorite(item.id, e)}
                        className={`p-1 rounded-lg transition ${
                          item.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'
                        }`}
                        title={item.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
                      >
                        <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>

                    {item.gstinNumber && (
                      <div className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded w-fit">
                        GST: {item.gstinNumber}
                      </div>
                    )}

                    <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{item.completeAddress}, {item.destinationCity} - {item.pincode}</span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {item.contactPerson} ({item.contactPhone})
                      </span>
                    </div>

                    {item.dockUnloadingInstructions && (
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg text-[11px] text-amber-800 dark:text-amber-300">
                        <b>{t('Dock Rule:', 'डॉक नियम:')}</b> {item.dockUnloadingInstructions}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <button
                      onClick={(e) => handleCopyDetails(item, e)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">{t('Copied!', 'कॉपी हुआ!')}</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          <span>{t('Copy Details', 'विवरण कॉपी करें')}</span>
                        </>
                      )}
                    </button>

                    {onSelectConsignee && (
                      <button
                        onClick={() => {
                          onSelectConsignee(item);
                          onClose();
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-sm transition"
                      >
                        {t('Select for Shipment', 'शिपमेंट हेतु चुनें')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
