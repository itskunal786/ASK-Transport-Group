import { useState } from 'react';

// ============================================================================
// DATA MODELS & INTERFACES FOR HIRED FLEET & SECTION 194C TDS
// ============================================================================

export interface HiredFleetRecord {
  id: string;
  tripNo: string;
  biltyNo: string;
  vehiclePlate: string;
  vehicleType: string;
  capacityTons: number;
  
  // Transporter / Owner Info
  transporterName: string;
  ownerPhone: string;
  transporterType: 'Individual' | 'Company' | 'Exempt (194C(6))';
  panNumber: string;
  isPanVerified: boolean;
  has194CExemptionDeclaration: boolean; // Transporter owns <= 10 trucks
  bankDetails: {
    accountHolder: string;
    accountNo: string;
    ifsc: string;
    bankName: string;
    upiId: string;
  };
  
  // Trip & Route
  route: string;
  distanceKm: number;
  dispatchDate: string;
  deliveryDate?: string;
  consignor: string;
  consignee: string;
  cargoDescription: string;
  
  // Financial Breakdown (70:30 Rule)
  agreedFreightInr: number;
  
  // 70% Advance
  advanceAmountInr: number; // 70% of freight
  advanceDieselPumpInr: number; // e.g. Diesel fleet card
  advanceCashUpiInr: number; // Cash or UPI
  fuelCardPartner: string;
  advanceStatus: 'PAID' | 'PENDING';
  advancePaidDate?: string;
  advanceVoucherNo?: string;
  
  // 30% Balance & Deductions
  grossBalanceInr: number; // 30% of freight
  podStatus: 'VERIFIED_OK' | 'PENDING_PHYSICAL_COPY' | 'SHORTAGE_FLAGGED';
  podVerifiedDate?: string;
  podSignedPhotoUrl?: string;
  
  // Section 194C TDS
  tdsRatePercent: number; // 1% (Indiv), 2% (Company), 0% (Exempt), 20% (No PAN)
  tdsDeductedInr: number;
  challanBSRCode?: string;
  
  // Adjustments & Penalties
  shortageDamagePenaltyInr: number;
  haltingDetentionInr: number;
  netBalancePayableInr: number;
  balanceStatus: 'SETTLED' | 'READY_FOR_PAYMENT' | 'AWAITING_POD';
  balanceSettledDate?: string;
  balanceVoucherNo?: string;
  
  // Fastag Telematics
  fastagId: string;
  fastagBalanceInr: number;
  fastagLowAlert: boolean; // Balance < ₹1,000
  lastFastagRechargeDate?: string;
}

// ============================================================================
// REAL-WORLD MOCK HIRED FLEET LOGISTICS RECORDS
// ============================================================================

const INITIAL_HIRED_FLEETS: HiredFleetRecord[] = [
  {
    id: 'MKT-7821',
    tripNo: 'TRIP-2026-9041',
    biltyNo: 'ASK-LR-90412',
    vehiclePlate: 'RJ-14-GH-3321',
    vehicleType: '16-Wheeler 35-Ton Multi-Axle Taurus',
    capacityTons: 35,
    transporterName: 'Choudhary Roadlines & Freight Carriers',
    ownerPhone: '+91 97110 99887',
    transporterType: 'Company',
    panNumber: 'AABCC7821M',
    isPanVerified: true,
    has194CExemptionDeclaration: false,
    bankDetails: {
      accountHolder: 'Choudhary Roadlines Pvt Ltd',
      accountNo: '50200088192019',
      ifsc: 'HDFC0000123',
      bankName: 'HDFC Bank, Jaipur Main Branch',
      upiId: 'choudharyroadlines@okhdfc'
    },
    route: 'Delhi Okhla Hub ➔ Kolkata Salt Lake DC',
    distanceKm: 1480,
    dispatchDate: '24-Oct-2026',
    deliveryDate: '27-Oct-2026',
    consignor: 'Speedcraft Heavy Engineering Ltd',
    consignee: 'Kolkata Mega Industrial Depot',
    cargoDescription: 'Forged Automobile Camshafts & Diesel Assemblies',
    agreedFreightInr: 72000,
    
    // 70% Advance
    advanceAmountInr: 50400,
    advanceDieselPumpInr: 35000,
    advanceCashUpiInr: 15400,
    fuelCardPartner: 'IOCL XtraPower Fleet Fleet Card',
    advanceStatus: 'PAID',
    advancePaidDate: '24-Oct-2026',
    advanceVoucherNo: 'VCHR-ADV-2026-9041',
    
    // 30% Balance
    grossBalanceInr: 21600,
    podStatus: 'VERIFIED_OK',
    podVerifiedDate: '28-Oct-2026',
    podSignedPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
    tdsRatePercent: 2, // 2% for Corporate Carrier
    tdsDeductedInr: 1440, // 2% of ₹72,000
    challanBSRCode: '0210041/2026/0019',
    shortageDamagePenaltyInr: 0,
    haltingDetentionInr: 1500, // 1 Day Halting at Unloading Dock
    netBalancePayableInr: 21660, // 21,600 - 1,440 + 1,500
    balanceStatus: 'READY_FOR_PAYMENT',
    
    // Fastag
    fastagId: 'NETC-TAG-8821901',
    fastagBalanceInr: 420, // Low balance alert!
    fastagLowAlert: true,
    lastFastagRechargeDate: '24-Oct-2026'
  },
  {
    id: 'MKT-7822',
    tripNo: 'TRIP-2026-9042',
    biltyNo: 'ASK-LR-90415',
    vehiclePlate: 'MH-12-PQ-9081',
    vehicleType: '14-Wheeler 28-Ton High Deck Truck',
    capacityTons: 28,
    transporterName: 'Gurmeet Singh (Single Truck Owner)',
    ownerPhone: '+91 98220 11223',
    transporterType: 'Exempt (194C(6))',
    panNumber: 'BKFPS9021E',
    isPanVerified: true,
    has194CExemptionDeclaration: true, // Submitted Form 194C(6) Declaration
    bankDetails: {
      accountHolder: 'Gurmeet Singh',
      accountNo: '309928172635',
      ifsc: 'SBIN0001829',
      bankName: 'State Bank of India, Pune Camp',
      upiId: 'gurmeet.singh@oksbi'
    },
    route: 'Pune MIDC ➔ Bhiwandi Mega Hub',
    distanceKm: 180,
    dispatchDate: '26-Oct-2026',
    deliveryDate: '27-Oct-2026',
    consignor: 'Tata Motors Commercial Division',
    consignee: 'Reliance Retail Logistics Bhiwandi',
    cargoDescription: 'Commercial Vehicle Sub-Chassis Modules',
    agreedFreightInr: 24000,
    
    // 70% Advance
    advanceAmountInr: 16800,
    advanceDieselPumpInr: 10000,
    advanceCashUpiInr: 6800,
    fuelCardPartner: 'BPCL SmartFleet Card',
    advanceStatus: 'PAID',
    advancePaidDate: '26-Oct-2026',
    advanceVoucherNo: 'VCHR-ADV-2026-9042',
    
    // 30% Balance
    grossBalanceInr: 7200,
    podStatus: 'VERIFIED_OK',
    podVerifiedDate: '27-Oct-2026',
    podSignedPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
    tdsRatePercent: 0, // 0% TDS under Section 194C(6) Exemption
    tdsDeductedInr: 0,
    shortageDamagePenaltyInr: 0,
    haltingDetentionInr: 0,
    netBalancePayableInr: 7200,
    balanceStatus: 'SETTLED',
    balanceSettledDate: '27-Oct-2026 04:30 PM',
    balanceVoucherNo: 'VCHR-BAL-2026-8819',
    
    // Fastag
    fastagId: 'NETC-TAG-7719200',
    fastagBalanceInr: 2840,
    fastagLowAlert: false,
    lastFastagRechargeDate: '26-Oct-2026'
  },
  {
    id: 'MKT-7823',
    tripNo: 'TRIP-2026-9043',
    biltyNo: 'ASK-LR-90418',
    vehiclePlate: 'HR-55-XY-7711',
    vehicleType: '12-Wheeler 21-Ton Container Truck',
    capacityTons: 21,
    transporterName: 'Yadav Freight Logistics (Indiv. Proprietor)',
    ownerPhone: '+91 98112 55667',
    transporterType: 'Individual',
    panNumber: 'AFIPY3321N',
    isPanVerified: true,
    has194CExemptionDeclaration: false,
    bankDetails: {
      accountHolder: 'Satish Yadav',
      accountNo: '002101556677',
      ifsc: 'ICIC0000021',
      bankName: 'ICICI Bank, Gurugram Cyber City',
      upiId: 'satish.yadav@icici'
    },
    route: 'Gurugram Maruti Hub ➔ Ahmedabad DC',
    distanceKm: 920,
    dispatchDate: '27-Oct-2026',
    consignor: 'Maruti Suzuki Auto Components',
    consignee: 'Adani Logistics Multi-modal Park',
    cargoDescription: 'Pressed Steel Body Panels & Bumpers',
    agreedFreightInr: 48000,
    
    // 70% Advance
    advanceAmountInr: 33600,
    advanceDieselPumpInr: 22000,
    advanceCashUpiInr: 11600,
    fuelCardPartner: 'HPCL DriveTrack Plus',
    advanceStatus: 'PENDING', // Advance not released yet!
    
    // 30% Balance
    grossBalanceInr: 14400,
    podStatus: 'PENDING_PHYSICAL_COPY',
    tdsRatePercent: 1, // 1% for Individual PAN
    tdsDeductedInr: 480, // 1% of ₹48,000
    shortageDamagePenaltyInr: 0,
    haltingDetentionInr: 0,
    netBalancePayableInr: 13920,
    balanceStatus: 'AWAITING_POD',
    
    // Fastag
    fastagId: 'NETC-TAG-4412998',
    fastagBalanceInr: 650, // Low balance alert!
    fastagLowAlert: true,
    lastFastagRechargeDate: '20-Oct-2026'
  },
  {
    id: 'MKT-7824',
    tripNo: 'TRIP-2026-9044',
    biltyNo: 'ASK-LR-90422',
    vehiclePlate: 'GJ-06-ZZ-4019',
    vehicleType: '10-Wheeler 16-Ton Closed Body Truck',
    capacityTons: 16,
    transporterName: 'Baroda Transport Syndicate',
    ownerPhone: '+91 98250 88990',
    transporterType: 'Company',
    panNumber: 'AABCB4019K',
    isPanVerified: true,
    has194CExemptionDeclaration: false,
    bankDetails: {
      accountHolder: 'Baroda Transport Syndicate Ltd',
      accountNo: '201991827364',
      ifsc: 'BARB0VADODA',
      bankName: 'Bank of Baroda, Alkapuri',
      upiId: 'barodatransport@barodampay'
    },
    route: 'Vadodara GIDC ➔ Bangalore Whitefield',
    distanceKm: 1380,
    dispatchDate: '23-Oct-2026',
    deliveryDate: '26-Oct-2026',
    consignor: 'Apollo Tyres Radial Plant',
    consignee: 'TVS Motor Company Central Yard',
    cargoDescription: 'Commercial Radial Tyres (10.00R20)',
    agreedFreightInr: 64000,
    
    // 70% Advance
    advanceAmountInr: 44800,
    advanceDieselPumpInr: 30000,
    advanceCashUpiInr: 14800,
    fuelCardPartner: 'IOCL XtraPower Fleet Card',
    advanceStatus: 'PAID',
    advancePaidDate: '23-Oct-2026',
    advanceVoucherNo: 'VCHR-ADV-2026-9044',
    
    // 30% Balance
    grossBalanceInr: 19200,
    podStatus: 'SHORTAGE_FLAGGED',
    podVerifiedDate: '27-Oct-2026',
    podSignedPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
    tdsRatePercent: 2, // 2% Company
    tdsDeductedInr: 1280, // 2% of ₹64,000
    shortageDamagePenaltyInr: 3500, // 1 tyre carton torn during transit
    haltingDetentionInr: 0,
    netBalancePayableInr: 14420, // 19,200 - 1,280 - 3,500
    balanceStatus: 'READY_FOR_PAYMENT',
    
    // Fastag
    fastagId: 'NETC-TAG-3310022',
    fastagBalanceInr: 3120,
    fastagLowAlert: false,
    lastFastagRechargeDate: '25-Oct-2026'
  }
];

export default function MarketFleetSettlementDeck() {
  const [fleets, setFleets] = useState<HiredFleetRecord[]>(INITIAL_HIRED_FLEETS);
  const [filterTab, setFilterTab] = useState<'ALL' | 'ADVANCE_PENDING' | 'POD_PENDING' | 'READY_BALANCE' | 'SETTLED' | 'FASTAG_LOW'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [selectedForAdvance, setSelectedForAdvance] = useState<HiredFleetRecord | null>(null);
  const [advanceDieselAmt, setAdvanceDieselAmt] = useState<number>(0);
  const [advanceCashAmt, setAdvanceCashAmt] = useState<number>(0);
  const [fuelCardPartner, setFuelCardPartner] = useState<string>('IOCL XtraPower Fleet Fleet Card');
  const [isProcessingAdvance, setIsProcessingAdvance] = useState(false);

  const [selectedForBalance, setSelectedForBalance] = useState<HiredFleetRecord | null>(null);
  const [balanceShortageDeduction, setBalanceShortageDeduction] = useState<number>(0);
  const [balanceHaltingBhatta, setBalanceHaltingBhatta] = useState<number>(0);
  const [isProcessingBalance, setIsProcessingBalance] = useState(false);

  // Fastag Recharge Modal
  const [selectedForFastag, setSelectedForFastag] = useState<HiredFleetRecord | null>(null);
  const [fastagRechargeAmount, setFastagRechargeAmount] = useState<number>(2000);
  const [isRechargingFastag, setIsRechargingFastag] = useState(false);

  // TDS 26AS Audit View Modal
  const [showTdsReportModal, setShowTdsReportModal] = useState(false);

  // Quick Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // --------------------------------------------------------------------------
  // FINANCIAL METRICS TOTALS
  // --------------------------------------------------------------------------
  const totalAgreedFreight = fleets.reduce((acc, f) => acc + f.agreedFreightInr, 0);
  const totalAdvancePaid = fleets.filter(f => f.advanceStatus === 'PAID').reduce((acc, f) => acc + f.advanceAmountInr, 0);
  const totalBalancePending = fleets.filter(f => f.balanceStatus !== 'SETTLED').reduce((acc, f) => acc + f.netBalancePayableInr, 0);
  const totalTdsDeducted = fleets.reduce((acc, f) => acc + f.tdsDeductedInr, 0);
  const fastagLowCount = fleets.filter(f => f.fastagLowAlert).length;
  const readyForBalanceCount = fleets.filter(f => f.balanceStatus === 'READY_FOR_PAYMENT').length;
  const advancePendingCount = fleets.filter(f => f.advanceStatus === 'PENDING').length;

  // --------------------------------------------------------------------------
  // FILTERING
  // --------------------------------------------------------------------------
  const filteredFleets = fleets.filter(f => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      f.vehiclePlate.toLowerCase().includes(q) ||
      f.transporterName.toLowerCase().includes(q) ||
      f.biltyNo.toLowerCase().includes(q) ||
      f.panNumber.toLowerCase().includes(q) ||
      f.route.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterTab === 'ADVANCE_PENDING') return f.advanceStatus === 'PENDING';
    if (filterTab === 'POD_PENDING') return f.podStatus === 'PENDING_PHYSICAL_COPY';
    if (filterTab === 'READY_BALANCE') return f.balanceStatus === 'READY_FOR_PAYMENT';
    if (filterTab === 'SETTLED') return f.balanceStatus === 'SETTLED';
    if (filterTab === 'FASTAG_LOW') return f.fastagLowAlert;
    return true;
  });

  // --------------------------------------------------------------------------
  // DISBURSE 70% ADVANCE
  // --------------------------------------------------------------------------
  const handleOpenAdvance = (f: HiredFleetRecord) => {
    setSelectedForAdvance(f);
    const standardDiesel = Math.round(f.advanceAmountInr * 0.65);
    setAdvanceDieselAmt(standardDiesel);
    setAdvanceCashAmt(f.advanceAmountInr - standardDiesel);
    setFuelCardPartner(f.fuelCardPartner);
  };

  const handleExecuteAdvance = () => {
    if (!selectedForAdvance) return;
    setIsProcessingAdvance(true);

    setTimeout(() => {
      const vchr = `VCHR-ADV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      setFleets(prev => prev.map(f => {
        if (f.id === selectedForAdvance.id) {
          return {
            ...f,
            advanceStatus: 'PAID',
            advancePaidDate: nowStr,
            advanceVoucherNo: vchr,
            advanceDieselPumpInr: advanceDieselAmt,
            advanceCashUpiInr: advanceCashAmt,
            fuelCardPartner
          };
        }
        return f;
      }));

      setIsProcessingAdvance(false);
      setSelectedForAdvance(null);
      showToast(`⚡ 70% Advance Disbursed for ${selectedForAdvance.vehiclePlate} (₹${selectedForAdvance.advanceAmountInr.toLocaleString('en-IN')}) via IMPS/Diesel Card! Voucher: ${vchr}`);
    }, 1000);
  };

  // --------------------------------------------------------------------------
  // SETTLE 30% FINAL BALANCE WITH SECTION 194C TDS
  // --------------------------------------------------------------------------
  const handleOpenBalance = (f: HiredFleetRecord) => {
    setSelectedForBalance(f);
    setBalanceShortageDeduction(f.shortageDamagePenaltyInr);
    setBalanceHaltingBhatta(f.haltingDetentionInr);
  };

  const handleExecuteBalanceSettlement = () => {
    if (!selectedForBalance) return;
    setIsProcessingBalance(true);

    setTimeout(() => {
      const vchr = `VCHR-BAL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
                     new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      const recomputedNet = selectedForBalance.grossBalanceInr - selectedForBalance.tdsDeductedInr - balanceShortageDeduction + balanceHaltingBhatta;

      setFleets(prev => prev.map(f => {
        if (f.id === selectedForBalance.id) {
          return {
            ...f,
            shortageDamagePenaltyInr: balanceShortageDeduction,
            haltingDetentionInr: balanceHaltingBhatta,
            netBalancePayableInr: recomputedNet,
            balanceStatus: 'SETTLED',
            balanceSettledDate: nowStr,
            balanceVoucherNo: vchr,
            challanBSRCode: f.challanBSRCode || `0210041/2026/${Math.floor(1000 + Math.random() * 9000)}`
          };
        }
        return f;
      }));

      setIsProcessingBalance(false);
      setSelectedForBalance(null);
      showToast(`✓ 30% Balance Settled for ${selectedForBalance.transporterName}! Net Paid: ₹${recomputedNet.toLocaleString('en-IN')} (TDS 194C: ₹${selectedForBalance.tdsDeductedInr})`);
    }, 1200);
  };

  // --------------------------------------------------------------------------
  // INSTANT FASTAG AUTO-RECHARGE
  // --------------------------------------------------------------------------
  const handleOpenFastag = (f: HiredFleetRecord) => {
    setSelectedForFastag(f);
    setFastagRechargeAmount(2000);
  };

  const handleExecuteFastagRecharge = () => {
    if (!selectedForFastag) return;
    setIsRechargingFastag(true);

    setTimeout(() => {
      const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      setFleets(prev => prev.map(f => {
        if (f.id === selectedForFastag.id) {
          const newBal = f.fastagBalanceInr + fastagRechargeAmount;
          return {
            ...f,
            fastagBalanceInr: newBal,
            fastagLowAlert: newBal < 1000,
            lastFastagRechargeDate: nowStr
          };
        }
        return f;
      }));

      setIsRechargingFastag(false);
      const vehicle = selectedForFastag.vehiclePlate;
      setSelectedForFastag(null);
      showToast(`⚡ Fastag Recharge Successful for ${vehicle}! +₹${fastagRechargeAmount.toLocaleString('en-IN')} credited via BBPS NETC.`);
    }, 900);
  };

  // --------------------------------------------------------------------------
  // WHATSAPP SETTLEMENT ADVICE DISPATCH
  // --------------------------------------------------------------------------
  const handleDispatchWhatsAppAdvice = (f: HiredFleetRecord) => {
    const text = encodeURIComponent(
      `🧾 *ASK TRANSPORT GROUP - HIRED FLEET SETTLEMENT ADVICE*\n\n` +
      `Respected Transporter *${f.transporterName}*,\n` +
      `Aapke Truck *${f.vehiclePlate}* ka trip hisaab settle kar diya gaya hai:\n\n` +
      `📋 *Bilty No:* ${f.biltyNo} | *Trip:* ${f.tripNo}\n` +
      `📍 *Route:* ${f.route}\n` +
      `💰 *Total Agreed Freight:* ₹${f.agreedFreightInr.toLocaleString('en-IN')}\n\n` +
      `──────── MILESTONE BREAKUP ────────\n` +
      `1️⃣ *70% Advance Paid:* ₹${f.advanceAmountInr.toLocaleString('en-IN')}\n` +
      `   • Diesel Voucher: ₹${f.advanceDieselPumpInr.toLocaleString('en-IN')} (${f.fuelCardPartner})\n` +
      `   • Cash/UPI: ₹${f.advanceCashUpiInr.toLocaleString('en-IN')}\n` +
      `2️⃣ *30% Balance:* ₹${f.grossBalanceInr.toLocaleString('en-IN')}\n` +
      `   • Section 194C TDS (${f.tdsRatePercent}%): -₹${f.tdsDeductedInr.toLocaleString('en-IN')}\n` +
      (f.shortageDamagePenaltyInr > 0 ? `   • Shortage Deduction: -₹${f.shortageDamagePenaltyInr.toLocaleString('en-IN')}\n` : '') +
      (f.haltingDetentionInr > 0 ? `   • Halting Bhatta: +₹${f.haltingDetentionInr.toLocaleString('en-IN')}\n` : '') +
      `✅ *NET BANK TRANSFERRED:* *₹${f.netBalancePayableInr.toLocaleString('en-IN')}*\n\n` +
      `🏦 *Bank A/c:* ${f.bankDetails.accountNo.slice(-4).padStart(f.bankDetails.accountNo.length, '*')} (${f.bankDetails.ifsc})\n` +
      `📜 *Form 16A TDS Credit:* Reconciled under PAN ${f.panNumber}\n\n` +
      `_Thank you for partnering with ASK Transport Group Corp._`
    );

    const url = `https://api.whatsapp.com/send?phone=${f.ownerPhone.replace(/[^0-9]/g, '')}&text=${text}`;
    window.open(url, '_blank');
    showToast(`📱 WhatsApp Payment Advice sent to ${f.transporterName} (${f.ownerPhone})`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

      {/* HERO BANNER & KPI CARDS */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '24px 28px',
        boxShadow: '0 10px 25px -5px rgba(30, 27, 75, 0.35)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(129, 140, 248, 0.2)', color: '#a5b4fc', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
              <span>🤝</span> 70:30 Hired Fleet Settlement &amp; Statutory TDS
            </div>
            <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 900 }}>
              Market Transporter Settlement &amp; Section 194C TDS Engine
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#c7d2fe' }}>
              Automate 70% loading advance (diesel slip + cash), 30% physical POD clearance, Section 194C 1%/2% TDS deduction &amp; instant Fastag auto-topup.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTdsReportModal(true)}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📜</span> View Section 194C Form 26AS Summary
          </button>
        </div>

        {/* STATS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Hired Freight</span>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>
              ₹{(totalAgreedFreight / 1000).toFixed(1)}k
            </div>
            <small style={{ color: '#cbd5e1', fontSize: '11px' }}>{fleets.length} Hired Trucks Active</small>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>70% Advance Disbursed</span>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#34d399', marginTop: '4px' }}>
              ₹{(totalAdvancePaid / 1000).toFixed(1)}k
            </div>
            <small style={{ color: '#cbd5e1', fontSize: '11px' }}>Diesel Pump + Driver UPI</small>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>30% Balance Pending</span>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#fbbf24', marginTop: '4px' }}>
              ₹{(totalBalancePending / 1000).toFixed(1)}k
            </div>
            <small style={{ color: '#cbd5e1', fontSize: '11px' }}>{readyForBalanceCount} Ready for Release</small>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Section 194C TDS Deducted</span>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#c084fc', marginTop: '4px' }}>
              ₹{totalTdsDeducted.toLocaleString('en-IN')}
            </div>
            <small style={{ color: '#cbd5e1', fontSize: '11px' }}>1% / 2% Auto-Reconciled</small>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ fontSize: '11px', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 700 }}>Fastag Low Balance</span>
            <div style={{ fontSize: '22px', fontWeight: 900, color: fastagLowCount > 0 ? '#f87171' : '#34d399', marginTop: '4px' }}>
              {fastagLowCount} Trucks &lt; ₹1k
            </div>
            <small style={{ color: '#cbd5e1', fontSize: '11px' }}>Instant UPI Top-up Active</small>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS & SEARCH BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilterTab('ALL')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: filterTab === 'ALL' ? '#4f46e5' : '#cbd5e1',
              background: filterTab === 'ALL' ? '#4f46e5' : '#ffffff',
              color: filterTab === 'ALL' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            All Hired Trips ({fleets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('ADVANCE_PENDING')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: filterTab === 'ADVANCE_PENDING' ? '#f59e0b' : '#fde68a',
              background: filterTab === 'ADVANCE_PENDING' ? '#f59e0b' : '#fffbeb',
              color: filterTab === 'ADVANCE_PENDING' ? '#ffffff' : '#b45309',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            ⏳ Advance Pending ({advancePendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('READY_BALANCE')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: filterTab === 'READY_BALANCE' ? '#059669' : '#a7f3d0',
              background: filterTab === 'READY_BALANCE' ? '#059669' : '#ecfdf5',
              color: filterTab === 'READY_BALANCE' ? '#ffffff' : '#047857',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            ⚡ Balance Ready ({readyForBalanceCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('SETTLED')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: filterTab === 'SETTLED' ? '#64748b' : '#e2e8f0',
              background: filterTab === 'SETTLED' ? '#64748b' : '#f1f5f9',
              color: filterTab === 'SETTLED' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            ✓ Fully Settled
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('FASTAG_LOW')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: filterTab === 'FASTAG_LOW' ? '#ef4444' : '#fecaca',
              background: filterTab === 'FASTAG_LOW' ? '#ef4444' : '#fef2f2',
              color: filterTab === 'FASTAG_LOW' ? '#ffffff' : '#b91c1c',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            🔴 Fastag Low ({fastagLowCount})
          </button>
        </div>

        <div style={{ minWidth: '280px', flex: '1', maxWidth: '380px' }}>
          <input
            type="text"
            placeholder="Search Transporter, Truck #, PAN, Bilty..."
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

      {/* HIRED FLEET SETTLEMENT CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredFleets.map(item => {
          const isAdvPending = item.advanceStatus === 'PENDING';
          const isBalReady = item.balanceStatus === 'READY_FOR_PAYMENT';
          const isSettled = item.balanceStatus === 'SETTLED';

          return (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid',
                borderColor: isAdvPending ? '#fde68a' : isBalReady ? '#bbf7d0' : isSettled ? '#e2e8f0' : '#e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                padding: '20px',
                transition: 'all 0.2s'
              }}
            >
              {/* TOP STRIP: VEHICLE + TRANSPORTER + STATUS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: '#1e1b4b',
                    color: '#ffffff',
                    fontWeight: 900,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    letterSpacing: '0.04em'
                  }}>
                    🚛 {item.vehiclePlate}
                  </span>

                  <div>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>{item.transporterName}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      PAN: <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{item.panNumber}</strong> ({item.transporterType})
                      {item.has194CExemptionDeclaration && <span style={{ marginLeft: '6px', color: '#047857', fontWeight: 700 }}>✓ Sec 194C(6) Exempt (0% TDS)</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* FASTAG STATUS PILL */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: item.fastagLowAlert ? '#fef2f2' : '#f0fdf4',
                    color: item.fastagLowAlert ? '#b91c1c' : '#166534',
                    border: '1px solid',
                    borderColor: item.fastagLowAlert ? '#fecaca' : '#bbf7d0'
                  }}>
                    <span>🏷️ Fastag:</span>
                    <strong>₹{item.fastagBalanceInr.toLocaleString('en-IN')}</strong>
                    {item.fastagLowAlert && <span style={{ color: '#ef4444', fontWeight: 900 }}>[LOW &lt; ₹1k]</span>}
                  </div>

                  {/* OVERALL TRIP STATUS */}
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    background: isSettled ? '#f1f5f9' : isBalReady ? '#ecfdf5' : isAdvPending ? '#fffbeb' : '#eff6ff',
                    color: isSettled ? '#475569' : isBalReady ? '#059669' : isAdvPending ? '#b45309' : '#1d4ed8',
                    border: '1px solid',
                    borderColor: isSettled ? '#cbd5e1' : isBalReady ? '#a7f3d0' : isAdvPending ? '#fde68a' : '#bfdbfe'
                  }}>
                    {isSettled ? '✓ 100% Settled' : isBalReady ? '⚡ 30% Balance Ready' : isAdvPending ? '⏳ 70% Advance Pending' : 'In Transit'}
                  </div>
                </div>
              </div>

              {/* ROUTE & MILESTONES 70:30 BREAKDOWN */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '18px',
                marginTop: '16px'
              }}>
                {/* 1. ROUTE & CONSIGNMENT DETAILS */}
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Route &amp; Booking Info
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                    {item.route} ({item.distanceKm} KM)
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    LR: <strong>{item.biltyNo}</strong> | Trip: <strong>{item.tripNo}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    Cargo: <strong>{item.cargoDescription}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#1e1b4b', fontWeight: 900, marginTop: '8px' }}>
                    Agreed Total Freight: ₹{item.agreedFreightInr.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* 2. 70% ADVANCE MILESTONE */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                      1️⃣ 70% Advance Stage
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: item.advanceStatus === 'PAID' ? '#dcfce7' : '#fef3c7',
                      color: item.advanceStatus === 'PAID' ? '#15803d' : '#b45309'
                    }}>
                      {item.advanceStatus === 'PAID' ? '✓ Disbursed' : '⏳ Pending'}
                    </span>
                  </div>

                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
                    ₹{item.advanceAmountInr.toLocaleString('en-IN')}
                  </div>

                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div>• Diesel Slip: <strong>₹{item.advanceDieselPumpInr.toLocaleString('en-IN')}</strong> ({item.fuelCardPartner})</div>
                    <div>• Driver Cash/UPI: <strong>₹{item.advanceCashUpiInr.toLocaleString('en-IN')}</strong></div>
                    {item.advanceVoucherNo && (
                      <div style={{ color: '#0284c7', fontWeight: 700, marginTop: '4px' }}>
                        Ref: {item.advanceVoucherNo} ({item.advancePaidDate})
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. 30% BALANCE & 194C TDS MILESTONE */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                      2️⃣ 30% Balance &amp; TDS
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isSettled ? '#e2e8f0' : isBalReady ? '#dcfce7' : '#fee2e2',
                      color: isSettled ? '#475569' : isBalReady ? '#15803d' : '#b91c1c'
                    }}>
                      {item.podStatus === 'VERIFIED_OK' ? '✓ POD Verified' : '⏳ POD Pending'}
                    </span>
                  </div>

                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#16a34a', marginTop: '6px' }}>
                    Net: ₹{item.netBalancePayableInr.toLocaleString('en-IN')}
                  </div>

                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div>• Gross Balance (30%): ₹{item.grossBalanceInr.toLocaleString('en-IN')}</div>
                    <div>• Sec 194C TDS ({item.tdsRatePercent}%): <strong style={{ color: '#b91c1c' }}>-₹{item.tdsDeductedInr.toLocaleString('en-IN')}</strong></div>
                    {item.shortageDamagePenaltyInr > 0 && (
                      <div style={{ color: '#dc2626' }}>• Shortage Deduction: -₹{item.shortageDamagePenaltyInr.toLocaleString('en-IN')}</div>
                    )}
                    {item.haltingDetentionInr > 0 && (
                      <div style={{ color: '#059669' }}>• Halting Bhatta: +₹{item.haltingDetentionInr.toLocaleString('en-IN')}</div>
                    )}
                    {item.balanceVoucherNo && (
                      <div style={{ color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                        Settled: {item.balanceVoucherNo}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS ROW */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* FASTAG TOP-UP */}
                  <button
                    type="button"
                    onClick={() => handleOpenFastag(item)}
                    style={{
                      background: item.fastagLowAlert ? '#fef2f2' : '#ffffff',
                      border: '1px solid',
                      borderColor: item.fastagLowAlert ? '#fca5a5' : '#cbd5e1',
                      color: item.fastagLowAlert ? '#b91c1c' : '#334155',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>⚡ Top-up Fastag</span>
                  </button>

                  {/* WHATSAPP ADVICE */}
                  <button
                    type="button"
                    onClick={() => handleDispatchWhatsAppAdvice(item)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#25d366',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>💬 WhatsApp Settlement Slip</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* RELEASE 70% ADVANCE BUTTON */}
                  {item.advanceStatus === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => handleOpenAdvance(item)}
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 18px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      ⚡ Release 70% Advance (₹{item.advanceAmountInr.toLocaleString('en-IN')})
                    </button>
                  )}

                  {/* RELEASE 30% FINAL BALANCE WITH TDS */}
                  {item.advanceStatus === 'PAID' && item.balanceStatus !== 'SETTLED' && (
                    <button
                      type="button"
                      onClick={() => handleOpenBalance(item)}
                      style={{
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 18px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                      }}
                    >
                      💳 Settle 30% Balance &amp; TDS (₹{item.netBalancePayableInr.toLocaleString('en-IN')})
                    </button>
                  )}

                  {isSettled && (
                    <span style={{
                      background: '#f1f5f9',
                      color: '#059669',
                      fontWeight: 800,
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      border: '1px solid #bbf7d0'
                    }}>
                      ✓ Closed &amp; Form 26AS Reconciled
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: RELEASE 70% ADVANCE MODAL */}
      {/* ===================================================================== */}
      {selectedForAdvance && (
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
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              color: '#ffffff',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                  ⚡ Disburse 70% Loading Advance
                </h3>
                <small style={{ color: '#c7d2fe', fontSize: '12px' }}>
                  Truck: {selectedForAdvance.vehiclePlate} — {selectedForAdvance.transporterName}
                </small>
              </div>
              <button
                type="button"
                onClick={() => setSelectedForAdvance(null)}
                style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Total Agreed Freight:</span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>₹{selectedForAdvance.agreedFreightInr.toLocaleString('en-IN')}</strong>
              </div>

              <div style={{ background: '#eff6ff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: 700 }}>70% Advance Payable:</span>
                <strong style={{ fontSize: '16px', color: '#1d4ed8' }}>₹{selectedForAdvance.advanceAmountInr.toLocaleString('en-IN')}</strong>
              </div>

              {/* DIESEL SLIP VS CASH SPLIT */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Diesel Card Voucher (₹):
                  </label>
                  <input
                    type="number"
                    value={advanceDieselAmt}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setAdvanceDieselAmt(v);
                      setAdvanceCashAmt(selectedForAdvance.advanceAmountInr - v);
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Cash / UPI to Driver (₹):
                  </label>
                  <input
                    type="number"
                    value={advanceCashAmt}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setAdvanceCashAmt(v);
                      setAdvanceDieselAmt(selectedForAdvance.advanceAmountInr - v);
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Fuel Partner Fleet Card:
                </label>
                <select
                  value={fuelCardPartner}
                  onChange={e => setFuelCardPartner(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600, background: '#fff' }}
                >
                  <option value="IOCL XtraPower Fleet Card">IOCL XtraPower Fleet Card</option>
                  <option value="BPCL SmartFleet Card">BPCL SmartFleet Card</option>
                  <option value="HPCL DriveTrack Plus">HPCL DriveTrack Plus</option>
                  <option value="Direct Fuel Pump Cash Slip">Direct Highway Pump Cash Slip</option>
                </select>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '11px', color: '#475569' }}>
                Bank UPI Target: <strong>{selectedForAdvance.bankDetails.upiId}</strong> ({selectedForAdvance.bankDetails.bankName})
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedForAdvance(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAdvance}
                disabled={isProcessingAdvance}
                style={{
                  background: '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 22px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
              >
                {isProcessingAdvance ? 'Disbursing Payment...' : '✓ Confirm & Disburse 70% Advance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: 30% BALANCE SETTLEMENT & 194C TDS CALCULATION */}
      {/* ===================================================================== */}
      {selectedForBalance && (
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
            maxWidth: '620px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
              color: '#ffffff',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                  💳 Settle 30% Final Balance &amp; Section 194C TDS
                </h3>
                <small style={{ color: '#a7f3d0', fontSize: '12px' }}>
                  Verified POD Settlement for {selectedForBalance.transporterName} ({selectedForBalance.vehiclePlate})
                </small>
              </div>
              <button
                type="button"
                onClick={() => setSelectedForBalance(null)}
                style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* PAN & STATUTORY TDS RATE INFO */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '12px 16px',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#166534', fontWeight: 700 }}>
                    Income Tax PAN: <span style={{ fontFamily: 'monospace' }}>{selectedForBalance.panNumber}</span> ({selectedForBalance.transporterType})
                  </div>
                  <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px' }}>
                    {selectedForBalance.has194CExemptionDeclaration
                      ? '✓ Form 194C(6) Transporter Exemption (0% TDS applied)'
                      : `Statutory Rate: ${selectedForBalance.tdsRatePercent}% under Section 194C`}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>TDS Deducted:</span>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#dc2626' }}>
                    -₹{selectedForBalance.tdsDeductedInr.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* FINANCIAL AUDIT BREAKDOWN */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Total Agreed Freight:</span>
                  <strong style={{ color: '#0f172a' }}>₹{selectedForBalance.agreedFreightInr.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>Less 70% Advance Already Paid:</span>
                  <strong>-₹{selectedForBalance.advanceAmountInr.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Gross 30% Balance Receivable:</span>
                  <span>₹{selectedForBalance.grossBalanceInr.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                  <span>Less Section 194C TDS ({selectedForBalance.tdsRatePercent}%):</span>
                  <strong>-₹{selectedForBalance.tdsDeductedInr.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* ADJUSTMENTS: SHORTAGE & HALTING BHATTA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Shortage / Cargo Damage Penalty (₹):
                  </label>
                  <input
                    type="number"
                    value={balanceShortageDeduction}
                    onChange={e => setBalanceShortageDeduction(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Halting / Detention Bhatta (₹):
                  </label>
                  <input
                    type="number"
                    value={balanceHaltingBhatta}
                    onChange={e => setBalanceHaltingBhatta(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* NET DISBURSEMENT CARD */}
              <div style={{
                background: '#ecfdf5',
                border: '2px solid #a7f3d0',
                padding: '14px 18px',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#065f46', fontWeight: 800, textTransform: 'uppercase' }}>
                    Net Amount to Transfer via IMPS / NEFT:
                  </span>
                  <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
                    Beneficiary: {selectedForBalance.bankDetails.accountHolder} ({selectedForBalance.bankDetails.bankName})
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#047857' }}>
                  ₹{(selectedForBalance.grossBalanceInr - selectedForBalance.tdsDeductedInr - balanceShortageDeduction + balanceHaltingBhatta).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedForBalance(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBalanceSettlement}
                disabled={isProcessingBalance}
                style={{
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 24px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                }}
              >
                {isProcessingBalance ? 'Releasing Bank Payment...' : '🚀 Release Net Balance via IMPS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: FASTAG 1-CLICK INSTANT AUTO-RECHARGE */}
      {/* ===================================================================== */}
      {selectedForFastag && (
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
            maxWidth: '480px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#ffffff',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  ⚡ Instant Fastag NETC Toll Recharge
                </h3>
                <small style={{ color: '#94a3b8' }}>Vehicle: {selectedForFastag.vehiclePlate}</small>
              </div>
              <button
                type="button"
                onClick={() => setSelectedForFastag(null)}
                style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#991b1b', fontWeight: 700 }}>Current Fastag Balance:</span>
                <strong style={{ fontSize: '16px', color: '#dc2626' }}>₹{selectedForFastag.fastagBalanceInr.toLocaleString('en-IN')}</strong>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Select Top-up Amount:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[1000, 2000, 3000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFastagRechargeAmount(amt)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: fastagRechargeAmount === amt ? '#4f46e5' : '#cbd5e1',
                        background: fastagRechargeAmount === amt ? '#e0e7ff' : '#ffffff',
                        color: fastagRechargeAmount === amt ? '#4338ca' : '#334155',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      +₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '11px', color: '#64748b' }}>
                Fastag ID: <strong>{selectedForFastag.fastagId}</strong> (Integrated with NPCI Bharat BillPay Gateway)
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedForFastag(null)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteFastagRecharge}
                disabled={isRechargingFastag}
                style={{
                  background: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isRechargingFastag ? 'Recharging...' : `Recharge ₹${fastagRechargeAmount.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: SECTION 194C FORM 26AS AUDIT REPORT */}
      {/* ===================================================================== */}
      {showTdsReportModal && (
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
            maxWidth: '820px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                  📜 Income Tax Section 194C &amp; Form 26AS Reconciliation Register
                </h3>
                <small style={{ color: '#94a3b8' }}>
                  Quarterly Transporter Contractor TDS Deduction &amp; Form 16A Audit
                </small>
              </div>
              <button
                type="button"
                onClick={() => setShowTdsReportModal(false)}
                style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Total Contractor Base</small>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>₹{totalAgreedFreight.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Total TDS Deposited</small>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#7c3aed', marginTop: '2px' }}>₹{totalTdsDeducted.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>TDS Return Filing Status</small>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>✓ Form 26Q Reconciled</div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>Transporter / Payee</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>PAN Number</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>Gross Freight</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>Sec 194C Rate</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>TDS Deducted</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>Challan BSR</th>
                  </tr>
                </thead>
                <tbody>
                  {fleets.map(f => (
                    <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 10px' }}>
                        <strong>{f.transporterName}</strong>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Truck: {f.vehiclePlate}</div>
                      </td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                        {f.panNumber}
                      </td>
                      <td style={{ padding: '8px 10px' }}>₹{f.agreedFreightInr.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700 }}>
                        {f.has194CExemptionDeclaration ? (
                          <span style={{ color: '#059669' }}>0% (Exempt)</span>
                        ) : (
                          `${f.tdsRatePercent}%`
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 800, color: '#dc2626' }}>
                        ₹{f.tdsDeductedInr.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '11px', color: '#64748b' }}>
                        {f.challanBSRCode || 'Pending Deposit'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  showToast('✓ Form 26AS Audit CSV exported for Chartered Accountant review!');
                  setShowTdsReportModal(false);
                }}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                📥 Export Form 26AS CSV
              </button>
              <button
                type="button"
                onClick={() => setShowTdsReportModal(false)}
                style={{
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
