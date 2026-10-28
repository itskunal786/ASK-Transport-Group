import { useState } from 'react';

// ============================================================================
// DATA MODELS & INTERFACES FOR GOVT NIC E-WAY BILL SYSTEM
// ============================================================================

export interface PartBVehicleHistory {
  mode: 'Road' | 'Rail' | 'Air' | 'Ship';
  vehicleNo: string;
  vehicleType: 'Regular' | 'ODC (Over-Dimensional)';
  fromPlace: string;
  fromState: string;
  fromPincode: string;
  enteredDate: string;
  enteredBy: string; // GSTIN or Transporter ID
  transporterDocNo: string; // LR No
  reasonForChange: string;
}

export interface EwayBillItem {
  id: string;
  ewbNo: string;
  ewbDate: string;
  validFrom: string;
  validUntil: string;
  hoursRemaining: number; // e.g. 2.5
  status: 'CRITICAL_EXPIRING' | 'WARNING_EXPIRING' | 'ACTIVE_SAFE' | 'EXPIRED' | 'EXTENDED';
  
  // PART-A Details
  supplierName: string;
  supplierGstin: string;
  supplierPlace: string;
  supplierPincode: string;
  recipientName: string;
  recipientGstin: string;
  recipientPlace: string;
  recipientPincode: string;
  docNo: string;
  docDate: string;
  hsnCode: string;
  cargoDescription: string;
  cargoValue: number;
  taxAmount: number; // GST 18%
  
  // PART-B Current Vehicle & Telematics
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  totalDistanceKm: number;
  remainingDistanceKm: number;
  currentLocationName: string;
  currentPincode: string;
  highwayCorridor: string;
  speedKmH: number;
  transitDelayReason?: string;
  
  // Extension & Part-B History
  extensionCount: number;
  lastExtensionAck?: string;
  lastExtensionTimestamp?: string;
  partBHistory: PartBVehicleHistory[];
  
  // WhatsApp Notification Status
  driverNotified: boolean;
}

// ============================================================================
// REALISTIC HIGH-VALUE LOGISTICS E-WAY BILL RECORDS
// ============================================================================

const INITIAL_EWAY_BILLS: EwayBillItem[] = [
  {
    id: 'EWB-001',
    ewbNo: '2410-9876-5432',
    ewbDate: '26-Oct-2026 11:30 AM',
    validFrom: '26-Oct-2026 11:30 AM',
    validUntil: '28-Oct-2026 05:30 PM',
    hoursRemaining: 2.8, // < 4 hours - CRITICAL
    status: 'CRITICAL_EXPIRING',
    supplierName: 'Tata Motors Commercial Hub',
    supplierGstin: '27AAACT2727Q1ZT',
    supplierPlace: 'Pune MIDC, Maharashtra',
    supplierPincode: '411018',
    recipientName: 'Reliance Retail Mega DC',
    recipientGstin: '24AABCR2424P1Z3',
    recipientPlace: 'Sanand Industrial Estate, Ahmedabad',
    recipientPincode: '382110',
    docNo: 'INV-2026-TM-9081',
    docDate: '26-Oct-2026',
    hsnCode: '8708.29.00',
    cargoDescription: 'Precision Chassis Sub-Assemblies & Transmission Units',
    cargoValue: 3450000, // ₹34.50 Lakhs
    taxAmount: 621000, // ₹6.21 Lakhs GST
    vehicleNo: 'MH-12-PQ-9081',
    driverName: 'Suresh Rawat',
    driverPhone: '+91 98230 45678',
    totalDistanceKm: 650,
    remainingDistanceKm: 145,
    currentLocationName: 'NH-48 KM 182, Kasara Ghat / Valsad Border Checkpost',
    currentPincode: '396001',
    highwayCorridor: 'Mumbai-Ahmedabad Golden Quadrilateral (NH-48)',
    speedKmH: 0,
    transitDelayReason: 'Kasara Ghat 6-Hour Tanker Breakdown Gridlock + Heavy Rains',
    extensionCount: 0,
    partBHistory: [
      {
        mode: 'Road',
        vehicleNo: 'MH-12-PQ-9081',
        vehicleType: 'Regular',
        fromPlace: 'Pune MIDC',
        fromState: 'Maharashtra (27)',
        fromPincode: '411018',
        enteredDate: '26-Oct-2026 11:45 AM',
        enteredBy: '27AABCA1234F1Z8 (ASK Transport)',
        transporterDocNo: 'ASK-LR-90812',
        reasonForChange: 'Original Dispatch Load'
      }
    ],
    driverNotified: false
  },
  {
    id: 'EWB-002',
    ewbNo: '1812-4321-9988',
    ewbDate: '25-Oct-2026 09:15 AM',
    validFrom: '25-Oct-2026 09:15 AM',
    validUntil: '28-Oct-2026 09:15 PM',
    hoursRemaining: 6.5, // 4-8 hours - WARNING
    status: 'WARNING_EXPIRING',
    supplierName: 'Speedcraft Heavy Engineering',
    supplierGstin: '07AAACS7788R1ZW',
    supplierPlace: 'Okhla Phase-III, New Delhi',
    supplierPincode: '110020',
    recipientName: 'Bajaj Auto Plant Gateway',
    recipientGstin: '27AABCB1919N1ZV',
    recipientPlace: 'Waluj Industrial Area, Aurangabad',
    recipientPincode: '431136',
    docNo: 'TX-ENG-7721',
    docDate: '25-Oct-2026',
    hsnCode: '8409.99.90',
    cargoDescription: 'Heavy Diesel Engine Blocks & Forged Camshafts',
    cargoValue: 2890000, // ₹28.90 Lakhs
    taxAmount: 520200, // ₹5.20 Lakhs GST
    vehicleNo: 'DL-01-AB-1234',
    driverName: 'Ramesh Yadav',
    driverPhone: '+91 98112 23344',
    totalDistanceKm: 1240,
    remainingDistanceKm: 260,
    currentLocationName: 'NH-52, Near Dhule Bypass Bypass Interchange',
    currentPincode: '424001',
    highwayCorridor: 'Delhi-Mumbai Freight Expressway / NH-52',
    speedKmH: 22,
    transitDelayReason: 'State Border Inter-checkpost RTO Scrutiny Delay',
    extensionCount: 0,
    partBHistory: [
      {
        mode: 'Road',
        vehicleNo: 'DL-01-AB-1234',
        vehicleType: 'Regular',
        fromPlace: 'Okhla, New Delhi',
        fromState: 'Delhi (07)',
        fromPincode: '110020',
        enteredDate: '25-Oct-2026 09:30 AM',
        enteredBy: '27AABCA1234F1Z8 (ASK Transport)',
        transporterDocNo: 'ASK-LR-88201',
        reasonForChange: 'Original Dispatch Load'
      }
    ],
    driverNotified: false
  },
  {
    id: 'EWB-003',
    ewbNo: '3310-7766-1122',
    ewbDate: '27-Oct-2026 04:00 PM',
    validFrom: '27-Oct-2026 04:00 PM',
    validUntil: '28-Oct-2026 04:00 AM',
    hoursRemaining: -10.3, // Expired
    status: 'EXPIRED',
    supplierName: 'Apollo Tyres Radial Plant',
    supplierGstin: '24AAACA0928H1Z5',
    supplierPlace: 'Limda Industrial Estate, Vadodara',
    supplierPincode: '391760',
    recipientName: 'TVS Motor Company Central Yard',
    recipientGstin: '33AAACT1938K1ZN',
    recipientPlace: 'Hosur Plant-2, Tamil Nadu',
    recipientPincode: '635109',
    docNo: 'AP-INV-4401',
    docDate: '27-Oct-2026',
    hsnCode: '4011.20.10',
    cargoDescription: 'Radial Heavy Commercial Truck Tyres (10.00R20)',
    cargoValue: 1980000,
    taxAmount: 554400, // 28% GST
    vehicleNo: 'GJ-06-ZZ-4019',
    driverName: 'Vikram Gurjar',
    driverPhone: '+91 97234 11223',
    totalDistanceKm: 1420,
    remainingDistanceKm: 380,
    currentLocationName: 'NH-48, Satara Ghat Halt Station',
    currentPincode: '415001',
    highwayCorridor: 'Mumbai-Bengaluru Corridor (NH-48)',
    speedKmH: 0,
    transitDelayReason: 'Major Differential Axle Fracture & Breakdown at Midnight',
    extensionCount: 0,
    partBHistory: [
      {
        mode: 'Road',
        vehicleNo: 'GJ-06-ZZ-4019',
        vehicleType: 'Regular',
        fromPlace: 'Vadodara Hub',
        fromState: 'Gujarat (24)',
        fromPincode: '391760',
        enteredDate: '27-Oct-2026 04:15 PM',
        enteredBy: '27AABCA1234F1Z8 (ASK Transport)',
        transporterDocNo: 'ASK-LR-77190',
        reasonForChange: 'Original Dispatch Load'
      }
    ],
    driverNotified: false
  },
  {
    id: 'EWB-004',
    ewbNo: '5521-8899-0011',
    ewbDate: '27-Oct-2026 08:00 AM',
    validFrom: '27-Oct-2026 08:00 AM',
    validUntil: '30-Oct-2026 11:59 PM',
    hoursRemaining: 55.6, // Safe Active
    status: 'ACTIVE_SAFE',
    supplierName: 'Serum Institute Cold Logistics',
    supplierGstin: '27AAACS1122K1Z9',
    supplierPlace: 'Hadapsar, Pune',
    supplierPincode: '411028',
    recipientName: 'Kolkata Central Vaccine Depot',
    recipientGstin: '19AAACK8899L1ZU',
    recipientPlace: 'Sector V, Salt Lake, Kolkata',
    recipientPincode: '700091',
    docNo: 'SI-MED-9921',
    docDate: '27-Oct-2026',
    hsnCode: '3002.20.19',
    cargoDescription: 'WHO-Certified Temp-Controlled Vaccines (-20°C Reefer)',
    cargoValue: 5600000,
    taxAmount: 672000,
    vehicleNo: 'MH-14-CW-5544',
    driverName: 'Manpreet Singh',
    driverPhone: '+91 98765 43210',
    totalDistanceKm: 1850,
    remainingDistanceKm: 1100,
    currentLocationName: 'NH-53, Near Nagpur Logistics Hub Interchange',
    currentPincode: '440001',
    highwayCorridor: 'East-West Corridor (NH-53)',
    speedKmH: 64,
    extensionCount: 0,
    partBHistory: [
      {
        mode: 'Road',
        vehicleNo: 'MH-14-CW-5544',
        vehicleType: 'Regular',
        fromPlace: 'Pune Reefer Facility',
        fromState: 'Maharashtra (27)',
        fromPincode: '411028',
        enteredDate: '27-Oct-2026 08:20 AM',
        enteredBy: '27AABCA1234F1Z8 (ASK Transport)',
        transporterDocNo: 'ASK-LR-99321',
        reasonForChange: 'Original Dispatch Load'
      }
    ],
    driverNotified: false
  }
];

// Available Fleet Standby Trucks for Part-B Swap
const AVAILABLE_STANDBY_VEHICLES = [
  { plateNo: 'NL-01-AD-8921', model: 'Tata Signa 4825.TK 16-Wheeler (40 Ton)', location: 'Valsad Hub Yard', driver: 'Gurdeep Singh (+91 98112 00112)' },
  { plateNo: 'MH-04-KF-7788', model: 'BharatBenz 3528R Multi-Axle (35 Ton)', location: 'Thane Central Terminal', driver: 'Dinesh Patil (+91 98220 33445)' },
  { plateNo: 'HR-55-XY-7711', model: 'Ashok Leyland 4220 Cowl Body', location: 'Navi Mumbai DC', driver: 'Satish Verma (+91 98101 44556)' },
  { plateNo: 'RJ-14-GH-3321', model: 'Eicher Pro 6035 FTL High Deck', location: 'Surat Ring Road Yard', driver: 'Balwant Singh (+91 97110 99887)' }
];

export default function NicEwayBillAutoExtensionSuite() {
  const [ewayBills, setEwayBills] = useState<EwayBillItem[]>(INITIAL_EWAY_BILLS);
  const [filterTab, setFilterTab] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'EXTENDED' | 'EXPIRED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Extension Modal State
  const [selectedForExtension, setSelectedForExtension] = useState<EwayBillItem | null>(null);
  const [extReasonCode, setExtReasonCode] = useState<string>('2 - Road Blockage / Traffic Jam / Highway Congestion');
  const [extRemarks, setExtRemarks] = useState<string>('Kasara Ghat multi-vehicle gridlock since early morning. Traffic clearance delayed by local NHAI authorities.');
  const [extCurrentPincode, setExtCurrentPincode] = useState<string>('');
  const [extCurrentPlace, setExtCurrentPlace] = useState<string>('');
  const [extRemainingKm, setExtRemainingKm] = useState<number>(145);
  const [isSubmittingExtension, setIsSubmittingExtension] = useState(false);
  const [extensionAckModal, setExtensionAckModal] = useState<{
    ewbNo: string;
    ackNo: string;
    newValidUntil: string;
    extendedDays: number;
    distanceAllowedKm: number;
    gstin: string;
  } | null>(null);

  // Part-B Vehicle Change Modal State
  const [selectedForPartB, setSelectedForPartB] = useState<EwayBillItem | null>(null);
  
  // Instant E-Way Bill Auto-Fetch State
  const [ewbFetchInput, setEwbFetchInput] = useState('');
  const [isFetchingGovtData, setIsFetchingGovtData] = useState(false);
  const [partBReason, setPartBReason] = useState<string>('Breakdown / Mechanical Engine Failure');
  const [newVehiclePlate, setNewVehiclePlate] = useState<string>('NL-01-AD-8921');
  const [isCustomVehicle, setIsCustomVehicle] = useState(false);
  const [customVehicleInput, setCustomVehicleInput] = useState('');
  const [partBFromPlace, setPartBFromPlace] = useState<string>('Valsad Bypass Transshipment Yard');
  const [partBFromState, setPartBFromState] = useState<string>('Gujarat (24)');
  const [partBFromPincode, setPartBFromPincode] = useState<string>('396001');
  const [newTransporterDocNo, setNewTransporterDocNo] = useState<string>('');
  const [isSubmittingPartB, setIsSubmittingPartB] = useState(false);
  const [partBAckModal, setPartBAckModal] = useState<{
    ewbNo: string;
    oldVehicle: string;
    newVehicle: string;
    ackNo: string;
    updatedTimestamp: string;
    fromPlace: string;
  } | null>(null);

  // Document Official NIC Printable Modal State
  const [selectedForPrint, setSelectedForPrint] = useState<EwayBillItem | null>(null);

  // Quick Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // --------------------------------------------------------------------------
  // STATS & TOTALS
  // --------------------------------------------------------------------------
  const criticalCount = ewayBills.filter(e => e.status === 'CRITICAL_EXPIRING').length;
  const warningCount = ewayBills.filter(e => e.status === 'WARNING_EXPIRING').length;
  const expiredCount = ewayBills.filter(e => e.status === 'EXPIRED').length;
  const extendedCount = ewayBills.filter(e => e.status === 'EXTENDED').length;
  const totalCargoValueProtected = ewayBills.reduce((acc, curr) => acc + curr.cargoValue, 0);
  const totalTaxAtRisk = ewayBills.reduce((acc, curr) => acc + (curr.status !== 'ACTIVE_SAFE' && curr.status !== 'EXTENDED' ? curr.taxAmount * 2 : 0), 0);

  // --------------------------------------------------------------------------
  // FILTERING
  // --------------------------------------------------------------------------
  const filteredEwbList = ewayBills.filter(e => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      e.ewbNo.toLowerCase().includes(q) ||
      e.vehicleNo.toLowerCase().includes(q) ||
      e.supplierName.toLowerCase().includes(q) ||
      e.recipientName.toLowerCase().includes(q) ||
      e.docNo.toLowerCase().includes(q) ||
      e.currentLocationName.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterTab === 'CRITICAL') return e.status === 'CRITICAL_EXPIRING';
    if (filterTab === 'WARNING') return e.status === 'WARNING_EXPIRING';
    if (filterTab === 'EXTENDED') return e.status === 'EXTENDED';
    if (filterTab === 'EXPIRED') return e.status === 'EXPIRED';
    return true;
  });

  // --------------------------------------------------------------------------
  // AUTO-FETCH FROM GOVT NIC PORTAL
  // --------------------------------------------------------------------------
  const handleFetchFromGovtNIC = (overrideNumber?: string) => {
    const target = (overrideNumber || ewbFetchInput).trim();
    if (!target) {
      showToast('⚠️ Please enter a 12-digit E-Way Bill Number');
      return;
    }

    setIsFetchingGovtData(true);
    setTimeout(() => {
      setIsFetchingGovtData(false);
      const existing = ewayBills.find(e => e.ewbNo.includes(target) || target.includes(e.ewbNo));
      if (existing) {
        showToast(`✓ E-Way Bill ${existing.ewbNo} already synced from NIC portal!`);
        setSearchQuery(existing.ewbNo);
      } else {
        const newRecord: EwayBillItem = {
          id: `EWB-${Date.now()}`,
          ewbNo: target,
          ewbDate: '28-Oct-2026 10:00 AM',
          validFrom: '28-Oct-2026 10:00 AM',
          validUntil: '29-Oct-2026 10:00 AM',
          hoursRemaining: 19.5,
          status: 'ACTIVE_SAFE',
          supplierName: 'Bharat Forge Precision Components',
          supplierGstin: '27AAACB1928L1Z6',
          supplierPlace: 'Mundhwa, Pune',
          supplierPincode: '411036',
          recipientName: 'Hero MotoCorp Haridwar Complex',
          recipientGstin: '05AAACH8822M1ZQ',
          recipientPlace: 'Ranipur, Haridwar, Uttarakhand',
          recipientPincode: '249403',
          docNo: `BF-INV-${Math.floor(1000 + Math.random() * 9000)}`,
          docDate: '28-Oct-2026',
          hsnCode: '8714.10.90',
          cargoDescription: 'Forged Two-Wheeler Crankshafts & Connecting Rods',
          cargoValue: 2450000,
          taxAmount: 441000,
          vehicleNo: 'NL-01-AD-8921',
          driverName: 'Gurdeep Singh',
          driverPhone: '+91 98112 00112',
          totalDistanceKm: 1490,
          remainingDistanceKm: 890,
          currentLocationName: 'NH-44, Near Agra-Bypass Expressway',
          currentPincode: '282001',
          highwayCorridor: 'Delhi-Agra Transit Corridor (NH-44)',
          speedKmH: 58,
          extensionCount: 0,
          partBHistory: [
            {
              mode: 'Road',
              vehicleNo: 'NL-01-AD-8921',
              vehicleType: 'Regular',
              fromPlace: 'Pune MIDC Hub',
              fromState: 'Maharashtra (27)',
              fromPincode: '411036',
              enteredDate: '28-Oct-2026 10:15 AM',
              enteredBy: '27AABCA1234F1Z8 (ASK Transport)',
              transporterDocNo: 'ASK-LR-99120',
              reasonForChange: 'Original Dispatch Load'
            }
          ],
          driverNotified: false
        };
        setEwayBills(prev => [newRecord, ...prev]);
        setSearchQuery(target);
        showToast(`✓ E-Way Bill ${target} fetched live from National NIC GST Portal!`);
      }
    }, 700);
  };

  // --------------------------------------------------------------------------
  // OPEN EXTENSION MODAL
  // --------------------------------------------------------------------------
  const handleOpenExtension = (item: EwayBillItem) => {
    setSelectedForExtension(item);
    setExtRemainingKm(item.remainingDistanceKm);
    setExtCurrentPlace(item.currentLocationName);
    setExtCurrentPincode(item.currentPincode);
    setExtRemarks(item.transitDelayReason || 'Vehicle delayed due to heavy highway congestion. Requesting validity extension.');
  };

  // --------------------------------------------------------------------------
  // SUBMIT AUTO-EXTENSION TO GOVT NIC
  // --------------------------------------------------------------------------
  const handleExecuteNicExtension = () => {
    if (!selectedForExtension) return;
    setIsSubmittingExtension(true);

    setTimeout(() => {
      // Calculate extended validity (1 extra day per 200km or 24 hours base)
      const daysToAdd = Math.max(1, Math.ceil(extRemainingKm / 200));
      const now = new Date();
      now.setDate(now.getDate() + daysToAdd);
      const extendedUntilStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 11:59 PM';
      const ackNumber = `NIC-EXT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      setEwayBills(prev => prev.map(e => {
        if (e.id === selectedForExtension.id) {
          return {
            ...e,
            validUntil: extendedUntilStr,
            hoursRemaining: daysToAdd * 24 + 4,
            status: 'EXTENDED',
            extensionCount: e.extensionCount + 1,
            lastExtensionAck: ackNumber,
            lastExtensionTimestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            transitDelayReason: extRemarks
          };
        }
        return e;
      }));

      setIsSubmittingExtension(false);
      setExtensionAckModal({
        ewbNo: selectedForExtension.ewbNo,
        ackNo: ackNumber,
        newValidUntil: extendedUntilStr,
        extendedDays: daysToAdd,
        distanceAllowedKm: extRemainingKm,
        gstin: '27AABCA1234F1Z8'
      });
      setSelectedForExtension(null);
      showToast(`⚡ NIC E-Way Bill ${selectedForExtension.ewbNo} Extended Successfully! New Validity: ${extendedUntilStr}`);
    }, 1200);
  };

  // --------------------------------------------------------------------------
  // OPEN PART-B MODAL
  // --------------------------------------------------------------------------
  const handleOpenPartB = (item: EwayBillItem) => {
    setSelectedForPartB(item);
    setNewVehiclePlate(AVAILABLE_STANDBY_VEHICLES[0].plateNo);
    setIsCustomVehicle(false);
    setCustomVehicleInput('');
    setPartBFromPlace(item.currentLocationName);
    setPartBFromPincode(item.currentPincode);
    setNewTransporterDocNo(`ASK-LR-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  // --------------------------------------------------------------------------
  // SUBMIT PART-B VEHICLE UPDATE TO GOVT NIC
  // --------------------------------------------------------------------------
  const handleExecutePartBUpdate = () => {
    if (!selectedForPartB) return;
    const finalPlate = isCustomVehicle ? customVehicleInput.trim().toUpperCase() : newVehiclePlate;
    if (!finalPlate) {
      alert('Please select or specify a valid Vehicle Registration Number.');
      return;
    }

    setIsSubmittingPartB(true);

    setTimeout(() => {
      const ackNumber = `NIC-PB-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
                     new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      const newHistoryEntry: PartBVehicleHistory = {
        mode: 'Road',
        vehicleNo: finalPlate,
        vehicleType: 'Regular',
        fromPlace: partBFromPlace,
        fromState: partBFromState,
        fromPincode: partBFromPincode,
        enteredDate: nowStr,
        enteredBy: '27AABCA1234F1Z8 (ASK Transport)',
        transporterDocNo: newTransporterDocNo,
        reasonForChange: partBReason
      };

      setEwayBills(prev => prev.map(e => {
        if (e.id === selectedForPartB.id) {
          return {
            ...e,
            vehicleNo: finalPlate,
            transitDelayReason: `Vehicle Swapped: ${selectedForPartB.vehicleNo} ➔ ${finalPlate} (${partBReason})`,
            partBHistory: [newHistoryEntry, ...e.partBHistory]
          };
        }
        return e;
      }));

      setIsSubmittingPartB(false);
      setPartBAckModal({
        ewbNo: selectedForPartB.ewbNo,
        oldVehicle: selectedForPartB.vehicleNo,
        newVehicle: finalPlate,
        ackNo: ackNumber,
        updatedTimestamp: nowStr,
        fromPlace: partBFromPlace
      });
      setSelectedForPartB(null);
      showToast(`🚀 Part-B Updated on Govt Portal! Active Vehicle: ${finalPlate} (Ack: ${ackNumber})`);
    }, 1200);
  };

  // --------------------------------------------------------------------------
  // WHATSAPP PDF DISPATCH TO DRIVER
  // --------------------------------------------------------------------------
  const handleDispatchWhatsAppToDriver = (item: EwayBillItem) => {
    const message = encodeURIComponent(
      `🚨 *ASK TRANSPORT FLEET COMPLIANCE NOTICE*\n\n` +
      `Namaste Driver *${item.driverName}*,\n` +
      `Aapke truck *${item.vehicleNo}* ka Government E-Way Bill update kar diya gaya hai:\n\n` +
      `📄 *EWB No:* ${item.ewbNo}\n` +
      `⏳ *Extended Validity:* ${item.validUntil}\n` +
      `📍 *Route:* ${item.supplierPlace} ➔ ${item.recipientPlace}\n` +
      `📦 *Consignment:* ${item.cargoDescription}\n\n` +
      `✅ *RTO Checkpost Par Dikhaane Hetu Digital Copy Link:*\n` +
      `https://asktransport.com/ewb/verify/${item.ewbNo.replace(/-/g, '')}\n\n` +
      `_Safe Drive & Happy Journey! - ASK Fleet Control Room (HQ)_`
    );

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${item.driverPhone.replace(/[^0-9]/g, '')}&text=${message}`;
    window.open(whatsappUrl, '_blank');

    setEwayBills(prev => prev.map(e => e.id === item.id ? { ...e, driverNotified: true } : e));
    showToast(`📱 WhatsApp E-Way Bill link dispatched to Driver ${item.driverName} (${item.driverPhone})`);
  };

  return (
    <div className="admin-content-pad" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '14px 22px',
          borderRadius: '10px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 600,
          borderLeft: '4px solid #10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}>
              NIC 1.03
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
                Govt NIC E-Way Bill Auto-Extension &amp; Part-B Suite
              </h1>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
                Automated highway validity extension, instant Part-B vehicle transshipment swap &amp; 100% zero RTO seizure penalty protection under Rule 138 CGST
              </p>
            </div>
          </div>
        </div>

        {/* GOVT API STATUS PILL */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#ffffff',
          padding: '8px 16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              display: 'inline-block'
            }}></span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857' }}>NIC GST API Gateway: Active</span>
          </div>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
            TRANSIN: <strong style={{ color: '#0f172a' }}>27AABCA1234F1Z8</strong>
          </span>
        </div>
      </div>

      {/* COMPLIANCE WARNING & RTO PENALTY RADAR HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Protected Consignment Value
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>
              ₹{(totalCargoValueProtected / 100000).toFixed(2)} Lakhs
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
              Covered under ASK Live Telematics &amp; EWB Sync
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Potential RTO Section 129 Penalty At Risk
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#f87171', marginTop: '4px' }}>
              ₹{(totalTaxAtRisk / 100000).toFixed(2)} Lakhs
            </div>
            <div style={{ fontSize: '12px', color: '#fda4af', marginTop: '4px' }}>
              200% GST Penalty if truck moves with expired validity
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Urgent Auto-Extension Radar
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{
                background: criticalCount > 0 ? '#ef4444' : '#10b981',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 800
              }}>
                {criticalCount} Critical (&lt;4 Hrs)
              </span>
              <span style={{
                background: '#f59e0b',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 800
              }}>
                {warningCount} Warning (&lt;8 Hrs)
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>
              {criticalCount > 0 ? '⚠️ Immediate 1-Click Extension recommended to avert seizure' : '✓ All running fleets within compliance corridor'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '10px 14px',
              borderRadius: '10px',
              width: '100%'
            }}>
              <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 700 }}>
                💡 CGST RULE 138 EXTENSION WINDOW:
              </div>
              <div style={{ fontSize: '11px', color: '#e2e8f0', marginTop: '3px' }}>
                Validity can be extended <strong>within 8 hours before expiry</strong> or up to <strong>8 hours after expiry</strong> by declaring current location &amp; reason.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INSTANT NIC AUTO-FETCH & VERIFICATION TOOLBAR */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              🔍 Instant Govt E-Way Bill Auto-Fetch &amp; Sync Engine
            </span>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              Direct national GST portal pull by 12-digit E-Way Bill number with Part-A &amp; Part-B validation
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Quick Demos:</span>
            <button
              type="button"
              onClick={() => {
                setEwbFetchInput('2410-9876-5432');
                handleFetchFromGovtNIC('2410-9876-5432');
              }}
              style={{ padding: '3px 8px', fontSize: '11px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
            >
              🔴 Kasara Ghat (Critical &lt;3h)
            </button>
            <button
              type="button"
              onClick={() => {
                setEwbFetchInput('1812-4321-9988');
                handleFetchFromGovtNIC('1812-4321-9988');
              }}
              style={{ padding: '3px 8px', fontSize: '11px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
            >
              🟡 Dhule Bypass (Warning &lt;7h)
            </button>
            <button
              type="button"
              onClick={() => {
                setEwbFetchInput('3310-7766-1122');
                handleFetchFromGovtNIC('3310-7766-1122');
              }}
              style={{ padding: '3px 8px', fontSize: '11px', background: '#f3f4f6', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
            >
              ❌ Satara Axle Breakdown
            </button>
            <button
              type="button"
              onClick={() => {
                setEwbFetchInput('9988-1122-3344');
                handleFetchFromGovtNIC('9988-1122-3344');
              }}
              style={{ padding: '3px 8px', fontSize: '11px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
            >
              ⚡ New NIC Load
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Enter 12-digit E-Way Bill Number (e.g. 2410-9876-5432)"
            value={ewbFetchInput}
            onChange={e => setEwbFetchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFetchFromGovtNIC()}
            style={{
              flex: 1,
              minWidth: '280px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '2px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'monospace'
            }}
          />
          <button
            type="button"
            onClick={() => handleFetchFromGovtNIC()}
            disabled={isFetchingGovtData}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 22px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
            }}
          >
            {isFetchingGovtData ? 'Connecting to NIC Portal...' : '🔍 Auto-Fetch from Govt Portal'}
          </button>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px'
      }}>
        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilterTab('ALL')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: filterTab === 'ALL' ? '#0284c7' : '#cbd5e1',
              background: filterTab === 'ALL' ? '#0284c7' : '#ffffff',
              color: filterTab === 'ALL' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            All Active Bills ({ewayBills.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('CRITICAL')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: filterTab === 'CRITICAL' ? '#ef4444' : '#fecaca',
              background: filterTab === 'CRITICAL' ? '#ef4444' : '#fef2f2',
              color: filterTab === 'CRITICAL' ? '#ffffff' : '#b91c1c',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            🔴 Critical &lt;4h ({criticalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('WARNING')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: filterTab === 'WARNING' ? '#f59e0b' : '#fde68a',
              background: filterTab === 'WARNING' ? '#f59e0b' : '#fffbeb',
              color: filterTab === 'WARNING' ? '#ffffff' : '#b45309',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            🟡 Expiring 4-8h ({warningCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('EXTENDED')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: filterTab === 'EXTENDED' ? '#10b981' : '#a7f3d0',
              background: filterTab === 'EXTENDED' ? '#10b981' : '#ecfdf5',
              color: filterTab === 'EXTENDED' ? '#ffffff' : '#047857',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            ✓ NIC Extended ({extendedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('EXPIRED')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: filterTab === 'EXPIRED' ? '#64748b' : '#e2e8f0',
              background: filterTab === 'EXPIRED' ? '#64748b' : '#f1f5f9',
              color: filterTab === 'EXPIRED' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            ❌ Expired ({expiredCount})
          </button>
        </div>

        {/* SEARCH BOX */}
        <div style={{ minWidth: '280px', flex: '1', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search E-Way Bill #, Vehicle, Consignor, Route..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              background: '#ffffff',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* E-WAY BILLS TABLE & ACTION CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredEwbList.map((item) => {
          const isCritical = item.status === 'CRITICAL_EXPIRING';
          const isWarning = item.status === 'WARNING_EXPIRING';
          const isExpired = item.status === 'EXPIRED';
          const isExtended = item.status === 'EXTENDED';

          return (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid',
                borderColor: isCritical ? '#fca5a5' : isWarning ? '#fde68a' : isExpired ? '#fecaca' : '#e2e8f0',
                boxShadow: isCritical ? '0 4px 16px rgba(239, 68, 68, 0.12)' : '0 2px 8px rgba(0,0,0,0.03)',
                padding: '20px',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              {/* TOP STRIP: EWB # + COUNTDOWN + QUICK STATUS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '0.04em'
                  }}>
                    EWB: <span style={{ color: '#0284c7' }}>{item.ewbNo}</span>
                  </div>

                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Doc: <strong>{item.docNo}</strong> ({item.docDate})
                  </span>

                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    HSN: <strong>{item.hsnCode}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* EXPIRY BADGE / COUNTDOWN */}
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isCritical ? '#fef2f2' : isWarning ? '#fffbeb' : isExpired ? '#f3f4f6' : '#ecfdf5',
                    color: isCritical ? '#dc2626' : isWarning ? '#b45309' : isExpired ? '#475569' : '#059669',
                    border: '1px solid',
                    borderColor: isCritical ? '#fecaca' : isWarning ? '#fde68a' : isExpired ? '#e2e8f0' : '#a7f3d0'
                  }}>
                    {isCritical && <span>🚨 EXPIRES IN {item.hoursRemaining} HOURS</span>}
                    {isWarning && <span>⚠️ EXPIRES IN {item.hoursRemaining} HOURS</span>}
                    {isExpired && <span>❌ EXPIRED ({Math.abs(item.hoursRemaining)}h AGO)</span>}
                    {isExtended && <span>✓ EXTENDED (Valid Until {item.validUntil})</span>}
                    {item.status === 'ACTIVE_SAFE' && <span>🟢 VALID ({item.hoursRemaining}h remaining)</span>}
                  </div>

                  {item.extensionCount > 0 && (
                    <span style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #bfdbfe'
                    }}>
                      Extended {item.extensionCount}x
                    </span>
                  )}
                </div>
              </div>

              {/* BODY: ROUTE & CARGO GRID */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginTop: '16px'
              }}>
                {/* CONSIGNOR -> CONSIGNEE */}
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Consignor &amp; Consignee Route
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                    {item.supplierName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    GSTIN: <span style={{ fontFamily: 'monospace' }}>{item.supplierGstin}</span> ({item.supplierPlace})
                  </div>
                  <div style={{ margin: '6px 0', fontSize: '12px', color: '#0284c7', fontWeight: 700 }}>
                    ➔ {item.recipientName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    GSTIN: <span style={{ fontFamily: 'monospace' }}>{item.recipientGstin}</span> ({item.recipientPlace})
                  </div>
                </div>

                {/* CARGO & VALUE */}
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Cargo &amp; Tax Value
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                    {item.cargoDescription}
                  </div>
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: 800, marginTop: '4px' }}>
                    Declared Value: ₹{item.cargoValue.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 600, marginTop: '2px' }}>
                    Applicable Tax: ₹{item.taxAmount.toLocaleString('en-IN')} (Penalty: ₹{(item.taxAmount * 2).toLocaleString('en-IN')})
                  </div>
                </div>

                {/* CURRENT TELEMATICS & DELAY REASON */}
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Part-B Vehicle &amp; Location
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{
                      background: '#f1f5f9',
                      color: '#0f172a',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px'
                    }}>
                      🚛 {item.vehicleNo}
                    </span>
                    <span style={{ fontSize: '12px', color: '#475569' }}>
                      Driver: <strong>{item.driverName}</strong>
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '6px' }}>
                    📍 {item.currentLocationName} (PIN: {item.currentPincode})
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Remaining: <strong>{item.remainingDistanceKm} KM</strong> of {item.totalDistanceKm} KM
                  </div>
                  {item.transitDelayReason && (
                    <div style={{
                      marginTop: '6px',
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#9f1239',
                      fontWeight: 600
                    }}>
                      ⚠️ Delay: {item.transitDelayReason}
                    </div>
                  )}
                </div>
              </div>

              {/* BOTTOM ACTIONS BAR */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px dashed #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedForPrint(item)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>📄 View E-Way Bill (EWB-01)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDispatchWhatsAppToDriver(item)}
                    style={{
                      background: item.driverNotified ? '#f0fdf4' : '#ffffff',
                      border: '1px solid',
                      borderColor: item.driverNotified ? '#86efac' : '#cbd5e1',
                      borderRadius: '8px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: item.driverNotified ? '#166534' : '#25d366',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>💬 {item.driverNotified ? '✓ Link Sent via WhatsApp' : 'WhatsApp Link to Driver'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* PART-B VEHICLE UPDATE TRIGGER */}
                  <button
                    type="button"
                    onClick={() => handleOpenPartB(item)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #0284c7',
                      color: '#0284c7',
                      borderRadius: '8px',
                      padding: '7px 16px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🔄 Update Part-B Vehicle</span>
                  </button>

                  {/* 1-CLICK AUTO-EXTEND VALIDITY TRIGGER */}
                  <button
                    type="button"
                    onClick={() => handleOpenExtension(item)}
                    style={{
                      background: isCritical ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '7px 18px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: isCritical ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 4px 12px rgba(2, 132, 199, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>⚡ 1-Click NIC Auto-Extend</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: 1-CLICK NIC VALIDITY AUTO-EXTENSION MODAL */}
      {/* ===================================================================== */}
      {selectedForExtension && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '640px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            overflow: 'hidden'
          }}>
            {/* MODAL HEADER */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>⚡</span>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                    Govt NIC E-Way Bill Auto-Extension Dispatch
                  </h3>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  Direct Transmission to NIC API Gateway (Rule 138 GST Compliance)
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedForExtension(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY */}
            <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* CURRENT BILL META SUMMARY */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '14px',
                borderRadius: '10px',
                marginBottom: '18px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                fontSize: '12px'
              }}>
                <div>
                  <span style={{ color: '#64748b' }}>EWB Number:</span>
                  <div style={{ fontWeight: 800, color: '#0284c7' }}>{selectedForExtension.ewbNo}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Current Vehicle:</span>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedForExtension.vehicleNo}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Expiry Deadline:</span>
                  <div style={{ fontWeight: 800, color: '#dc2626' }}>{selectedForExtension.validUntil}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Protected Value:</span>
                  <div style={{ fontWeight: 800, color: '#059669' }}>₹{selectedForExtension.cargoValue.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* FORM FIELDS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* REASON FOR EXTENSION (MANDATORY GOVT FIELD) */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Extension Reason Code (Govt NIC Form EWB-01): <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={extReasonCode}
                    onChange={e => setExtReasonCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                      fontWeight: 600
                    }}
                  >
                    <option value="1 - Natural Calamity / Monsoon Road Washout">1 - Natural Calamity / Heavy Monsoon Flooding</option>
                    <option value="2 - Road Blockage / Traffic Jam / Highway Congestion">2 - Road Blockage / Highway Traffic Jam / Kasara Ghat Congestion</option>
                    <option value="3 - Vehicle Breakdown / Mechanical Axle Failure">3 - Vehicle Breakdown / Engine / Transmission Failure</option>
                    <option value="4 - Transshipment / Linehaul Hub Load Delay">4 - Transshipment Terminal Load Consolidation Delay</option>
                    <option value="5 - Law & Order / Border RTO Strike / Checking Queue">5 - Law &amp; Order / Border RTO Inter-state Checking Queue</option>
                  </select>
                </div>

                {/* CURRENT LOCATION & PINCODE (AUTO DETECTED VIA GPS) */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Current Highway Location (GPS Telematics):
                    </label>
                    <input
                      type="text"
                      value={extCurrentPlace}
                      onChange={e => setExtCurrentPlace(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Current PIN Code: <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={extCurrentPincode}
                      onChange={e => setExtCurrentPincode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        fontFamily: 'monospace',
                        fontWeight: 700
                      }}
                    />
                  </div>
                </div>

                {/* REMAINING DISTANCE & ESTIMATED COMPUTATION */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Remaining Distance to Destination (KM):
                  </label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={extRemainingKm}
                      onChange={e => setExtRemainingKm(Number(e.target.value))}
                      style={{
                        width: '120px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        fontWeight: 800
                      }}
                    />
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#166534',
                      flex: 1
                    }}>
                      ⚡ NIC Formula: <strong>{extRemainingKm} KM</strong> allows <strong>+{Math.max(1, Math.ceil(extRemainingKm / 200))} Day Extension</strong> (200 KM / Day Norm)
                    </div>
                  </div>
                </div>

                {/* REMARKS (GOVT AUDIT LOG) */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Official NIC Extension Remarks:
                  </label>
                  <textarea
                    rows={3}
                    value={extRemarks}
                    onChange={e => setExtRemarks(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                  <small style={{ color: '#64748b', fontSize: '11px' }}>
                    This text is permanently recorded on the National Informatics Centre (NIC) GST audit trail.
                  </small>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div style={{
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={() => setSelectedForExtension(null)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteNicExtension}
                disabled={isSubmittingExtension}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                }}
              >
                {isSubmittingExtension ? 'Transmitting to NIC Portal...' : '🚀 Submit Extension to Govt Portal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: EXTENSION ACKNOWLEDGEMENT CERTIFICATE */}
      {/* ===================================================================== */}
      {extensionAckModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            textAlign: 'center'
          }}>
            <div style={{ background: '#ecfdf5', padding: '24px 20px', borderBottom: '1px solid #a7f3d0' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#10b981',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.3)'
              }}>
                ✓
              </div>
              <h2 style={{ margin: '14px 0 4px', fontSize: '20px', fontWeight: 900, color: '#065f46' }}>
                Govt NIC Extension Approved!
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
                Validity extended on GST E-Way Bill National Server
              </p>
            </div>

            <div style={{ padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>E-Way Bill Number:</span>
                <strong style={{ fontSize: '13px', color: '#0284c7' }}>{extensionAckModal.ewbNo}</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>NIC Ack Number:</span>
                <strong style={{ fontSize: '13px', color: '#0f172a', fontFamily: 'monospace' }}>{extensionAckModal.ackNo}</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>New Extended Validity:</span>
                <strong style={{ fontSize: '13px', color: '#16a34a' }}>{extensionAckModal.newValidUntil}</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Additional Days Granted:</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>+{extensionAckModal.extendedDays} Days ({extensionAckModal.distanceAllowedKm} KM allowed)</strong>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px 24px', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setExtensionAckModal(null)}
                style={{
                  width: '100%',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Close &amp; Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: PART-B VEHICLE UPDATE & TRANSSHIPMENT MODAL */}
      {/* ===================================================================== */}
      {selectedForPartB && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '640px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            overflow: 'hidden'
          }}>
            {/* HEADER */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🔄</span>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                    Govt Part-B Vehicle Transshipment Update
                  </h3>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  Replace breakdown or hub transit vehicle on Govt NIC Server
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedForPartB(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* CURRENT VS NEW VEHICLE COMPARISON */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '14px',
                borderRadius: '10px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                    Old Vehicle Plate:
                  </small>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#dc2626' }}>
                    {selectedForPartB.vehicleNo}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Driver: {selectedForPartB.driverName}
                  </div>
                </div>

                <div style={{ fontSize: '20px', color: '#94a3b8' }}>➔</div>

                <div>
                  <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                    Target Vehicle:
                  </small>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#0284c7' }}>
                    {isCustomVehicle ? (customVehicleInput.toUpperCase() || 'ENTER PLATE') : newVehiclePlate}
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                    ✓ Ready for NIC Transmission
                  </div>
                </div>
              </div>

              {/* FORM */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* REASON FOR VEHICLE UPDATE */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Reason for Part-B Vehicle Change: <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={partBReason}
                    onChange={e => setPartBReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                      fontWeight: 600
                    }}
                  >
                    <option value="Breakdown / Mechanical Engine Failure">Breakdown / Mechanical Engine / Axle Failure</option>
                    <option value="Transshipment Hub Load Consolidation">Transshipment Hub Load Consolidation</option>
                    <option value="First Mile Feeder to Linehaul Long Route Shift">First Mile Feeder to Linehaul Long Route Shift</option>
                    <option value="RTO Axle Load Split / Weight Rebalance">RTO Axle Load Split / Weight Rebalance</option>
                    <option value="Others / Emergency Fleet Substitution">Others / Emergency Fleet Substitution</option>
                  </select>
                </div>

                {/* SELECT FROM FLEET OR CUSTOM TRUCK */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      Assign New Standby Truck:
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomVehicle(!isCustomVehicle)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0284c7',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isCustomVehicle ? '← Pick from Standby Fleet' : '+ Enter Market Truck Plate'}
                    </button>
                  </div>

                  {!isCustomVehicle ? (
                    <select
                      value={newVehiclePlate}
                      onChange={e => setNewVehiclePlate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        background: '#ffffff',
                        fontWeight: 700
                      }}
                    >
                      {AVAILABLE_STANDBY_VEHICLES.map(v => (
                        <option key={v.plateNo} value={v.plateNo}>
                          {v.plateNo} — {v.model} ({v.location})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. MH-04-AZ-9988"
                      value={customVehicleInput}
                      onChange={e => setCustomVehicleInput(e.target.value.toUpperCase())}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        fontWeight: 800,
                        boxSizing: 'border-box'
                      }}
                    />
                  )}
                </div>

                {/* TRANSSHIPMENT HUB / LOCATION */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Transshipment Place / Hub:
                    </label>
                    <input
                      type="text"
                      value={partBFromPlace}
                      onChange={e => setPartBFromPlace(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Transshipment State:
                    </label>
                    <select
                      value={partBFromState}
                      onChange={e => setPartBFromState(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        background: '#ffffff',
                        boxSizing: 'border-box',
                        fontWeight: 600
                      }}
                    >
                      <option value="Gujarat (24)">Gujarat (24)</option>
                      <option value="Maharashtra (27)">Maharashtra (27)</option>
                      <option value="Delhi (07)">Delhi (07)</option>
                      <option value="Rajasthan (08)">Rajasthan (08)</option>
                      <option value="Uttar Pradesh (09)">Uttar Pradesh (09)</option>
                      <option value="Haryana (06)">Haryana (06)</option>
                      <option value="Tamil Nadu (33)">Tamil Nadu (33)</option>
                      <option value="West Bengal (19)">West Bengal (19)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Transshipment PIN:
                    </label>
                    <input
                      type="text"
                      value={partBFromPincode}
                      onChange={e => setPartBFromPincode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        fontFamily: 'monospace',
                        fontWeight: 700
                      }}
                    />
                  </div>
                </div>

                {/* TRANSPORTER DOC / LR NO */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Transporter Document No (New Bilty / LR #):
                  </label>
                  <input
                    type="text"
                    value={newTransporterDocNo}
                    onChange={e => setNewTransporterDocNo(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      fontWeight: 700
                    }}
                  />
                  <small style={{ color: '#64748b', fontSize: '11px' }}>
                    Auto-generated internal consignment note for multi-vehicle transit.
                  </small>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div style={{
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={() => setSelectedForPartB(null)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecutePartBUpdate}
                disabled={isSubmittingPartB}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                }}
              >
                {isSubmittingPartB ? 'Transmitting Part-B to NIC...' : '🚀 Transmit Part-B Update to Govt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: PART-B ACKNOWLEDGEMENT DIALOG */}
      {/* ===================================================================== */}
      {partBAckModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            textAlign: 'center'
          }}>
            <div style={{ background: '#ecfdf5', padding: '24px 20px', borderBottom: '1px solid #a7f3d0' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#10b981',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.3)'
              }}>
                ✓
              </div>
              <h2 style={{ margin: '14px 0 4px', fontSize: '20px', fontWeight: 900, color: '#065f46' }}>
                Part-B Vehicle Successfully Updated!
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
                Govt NIC Server updated with new vehicle plate
              </p>
            </div>

            <div style={{ padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>E-Way Bill Number:</span>
                <strong style={{ fontSize: '13px', color: '#0284c7' }}>{partBAckModal.ewbNo}</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Replaced Vehicle:</span>
                <span style={{ fontSize: '13px', textDecoration: 'line-through', color: '#dc2626' }}>{partBAckModal.oldVehicle}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Active New Vehicle:</span>
                <strong style={{ fontSize: '14px', color: '#16a34a' }}>{partBAckModal.newVehicle}</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>NIC Part-B Ack:</span>
                <strong style={{ fontSize: '13px', color: '#0f172a', fontFamily: 'monospace' }}>{partBAckModal.ackNo}</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Timestamp:</span>
                <span style={{ fontSize: '12px', color: '#475569' }}>{partBAckModal.updatedTimestamp}</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px 24px', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setPartBAckModal(null)}
                style={{
                  width: '100%',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Close &amp; Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: OFFICIAL PRINTABLE FORM GST EWB-01 DOCUMENT */}
      {/* ===================================================================== */}
      {selectedForPrint && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '780px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden'
          }}>
            {/* ACTION BAR */}
            <div style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '12px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>
                Official Government Format: Form GST EWB-01 (Rule 138)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    background: '#0284c7',
                    border: 'none',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🖨️ Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedForPrint(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* PRINTABLE CONTENT */}
            <div style={{ padding: '28px', maxHeight: '80vh', overflowY: 'auto', background: '#fff', color: '#000', fontSize: '12px' }}>
              {/* GOVT HEADER */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase' }}>Government of India</div>
                <div style={{ fontSize: '12px', fontWeight: 800 }}>National Informatics Centre (NIC) - E-Way Bill System</div>
                <div style={{ fontSize: '16px', fontWeight: 900, marginTop: '6px', letterSpacing: '0.05em' }}>
                  E-WAY BILL: {selectedForPrint.ewbNo}
                </div>
              </div>

              {/* CORE VALIDITY DATES */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', border: '1px solid #000' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', background: '#f3f4f6', fontWeight: 700, width: '25%' }}>E-Way Bill Date:</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', width: '25%' }}>{selectedForPrint.ewbDate}</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', background: '#f3f4f6', fontWeight: 700, width: '25%' }}>Generated By:</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', width: '25%' }}>{selectedForPrint.supplierGstin}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', background: '#f3f4f6', fontWeight: 700 }}>Valid From:</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>{selectedForPrint.validFrom}</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', background: '#f3f4f6', fontWeight: 700 }}>Valid Until:</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', fontWeight: 800, color: '#047857' }}>{selectedForPrint.validUntil}</td>
                  </tr>
                </tbody>
              </table>

              {/* PART-A */}
              <div style={{ fontWeight: 900, fontSize: '13px', background: '#e5e7eb', padding: '4px 8px', border: '1px solid #000', borderBottom: 'none' }}>
                PART-A: Details of Goods &amp; Consignment
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', border: '1px solid #000' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', width: '30%', fontWeight: 700 }}>1. GSTIN of Supplier:</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', width: '70%' }}>
                      <strong>{selectedForPrint.supplierGstin}</strong> — {selectedForPrint.supplierName} ({selectedForPrint.supplierPlace})
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', fontWeight: 700 }}>2. GSTIN of Recipient:</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>
                      <strong>{selectedForPrint.recipientGstin}</strong> — {selectedForPrint.recipientName} ({selectedForPrint.recipientPlace})
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', fontWeight: 700 }}>3. Place of Delivery:</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>{selectedForPrint.recipientPlace} (PIN: {selectedForPrint.recipientPincode})</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', fontWeight: 700 }}>4. Document No &amp; Date:</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>Tax Invoice No: <strong>{selectedForPrint.docNo}</strong> dated {selectedForPrint.docDate}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', fontWeight: 700 }}>5. Value of Goods (₹):</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>
                      <strong>₹{selectedForPrint.cargoValue.toLocaleString('en-IN')}</strong> (Tax: ₹{selectedForPrint.taxAmount.toLocaleString('en-IN')})
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', fontWeight: 700 }}>6. HSN Code &amp; Description:</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>
                      HSN <strong>{selectedForPrint.hsnCode}</strong> — {selectedForPrint.cargoDescription}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', fontWeight: 700 }}>7. Reason for Transportation:</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>Supply / Outward Movement for Commercial Delivery</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid #000', fontWeight: 700 }}>8. Transporter ID:</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #000' }}>
                      <strong>27AABCA1234F1Z8</strong> — ASK TRANSPORT GROUP CORP
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* PART-B MULTI-VEHICLE AUDIT LOG */}
              <div style={{ fontWeight: 900, fontSize: '13px', background: '#e5e7eb', padding: '4px 8px', border: '1px solid #000', borderBottom: 'none' }}>
                PART-B: Vehicle Movement &amp; Transshipment History
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '6px', border: '1px solid #000' }}>Mode</th>
                    <th style={{ padding: '6px', border: '1px solid #000' }}>Vehicle No</th>
                    <th style={{ padding: '6px', border: '1px solid #000' }}>From Place</th>
                    <th style={{ padding: '6px', border: '1px solid #000' }}>Entered Date &amp; Time</th>
                    <th style={{ padding: '6px', border: '1px solid #000' }}>Doc / LR No</th>
                    <th style={{ padding: '6px', border: '1px solid #000' }}>Reason for Change</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedForPrint.partBHistory.map((h, idx) => (
                    <tr key={idx} style={{ background: idx === 0 ? '#f0fdf4' : '#fff' }}>
                      <td style={{ padding: '6px', border: '1px solid #000' }}>{h.mode}</td>
                      <td style={{ padding: '6px', border: '1px solid #000', fontWeight: 800 }}>
                        {h.vehicleNo} {idx === 0 && <span style={{ color: '#16a34a', fontSize: '10px' }}>[CURRENT]</span>}
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #000' }}>{h.fromPlace}</td>
                      <td style={{ padding: '6px', border: '1px solid #000' }}>{h.enteredDate}</td>
                      <td style={{ padding: '6px', border: '1px solid #000' }}>{h.transporterDocNo}</td>
                      <td style={{ padding: '6px', border: '1px solid #000' }}>{h.reasonForChange}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* OFFICIAL QR CODE & STAMP */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#000',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    textAlign: 'center',
                    padding: '4px',
                    fontWeight: 700
                  }}>
                    OFFICIAL NIC QR VERIFIED
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800 }}>DIGITALLY SIGNED BY NIC</div>
                    <div style={{ fontSize: '10px', color: '#475569' }}>Transporter: ASK Transport Group Corp</div>
                    <div style={{ fontSize: '10px', color: '#475569' }}>RTO Section 129 Compliance: VERIFIED</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#047857' }}>✓ ZERO PENALTY COMPLIANCE GUARANTEE</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Generated via ASK Transport Enterprise Suite 4.0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
