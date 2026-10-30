import {
  useEffect,
  useState,
  type FormEvent
} from 'react';

import {
  Link
} from 'react-router-dom';
import CustomerLayout from '../../layouts/CustomerLayout';

import {
  createBooking,
  getTransportServices
} from '../../api/createBookingApi';

import type {
  CreatedBooking,
  TransportService
} from '../../types/createBooking';


import {
  lookupPinCode
} from '../../api/pinCodeApi';

import type {
  PinCodeDetails
} from '../../types/pinCode';
import BulkBookingUpload from '../../components/BulkBookingUpload';
import ConsigneeAddressBookModal from '../../components/ConsigneeAddressBookModal';
import ConsignmentLRModal, { type ConsignmentLRData } from '../../components/ConsignmentLRModal';
import GstTaxInvoiceModal, { type GstInvoiceData } from '../../components/GstTaxInvoiceModal';

export interface PackageItem {
  id: string;
  label: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  deadWeightKg: number;
  quantity: number;
}

export interface SavedAddressItem {
  id: string;
  label: string;
  contactName: string;
  phone: string;
  address: string;
  pinCode: string;
  type: 'pickup' | 'delivery';
}

const DEFAULT_PICKUP_GODOWNS: SavedAddressItem[] = [
  {
    id: 'pg-1',
    label: 'Delhi Central Godown (110042)',
    contactName: 'Apex Industries Central Godown',
    phone: '9811022334',
    address: 'Plot 42, Sanjay Gandhi Transport Nagar, GT Karnal Road',
    pinCode: '110042',
    type: 'pickup'
  },
  {
    id: 'pg-2',
    label: 'Okhla Phase-III (110020)',
    contactName: 'Apex Logistics Okhla Depot',
    phone: '9876543210',
    address: 'Phase III, Okhla Industrial Estate',
    pinCode: '110020',
    type: 'pickup'
  }
];

const DEFAULT_DELIVERY_CONSIGNEES: SavedAddressItem[] = [
  {
    id: 'dc-1',
    label: 'Mumbai Bhiwandi DC (421302)',
    contactName: 'Shreenath Logistics Hub Bhiwandi',
    phone: '9822114477',
    address: 'Gala #14, Building B2, Arihant Commercial Complex, Purna',
    pinCode: '421302',
    type: 'delivery'
  },
  {
    id: 'dc-2',
    label: 'Bangalore Electronic City (560100)',
    contactName: 'Karnataka Tech Distribution Depot',
    phone: '9845012345',
    address: 'Plot 88, Electronic City Phase-I',
    pinCode: '560100',
    type: 'delivery'
  }
];

export default function BookShipment() {

  const isMaintenance = localStorage.getItem('ask_system_maintenance') === 'true';
  const [bookingMode, setBookingMode] = useState<'single' | 'bulk'>('single');
  const [step, setStep] = useState(1);

  // Saved Address Book State
  const [savedPickupGodowns, setSavedPickupGodowns] = useState<SavedAddressItem[]>(() => {
    try {
      const raw = localStorage.getItem('ask_saved_pickup_godowns');
      return raw ? JSON.parse(raw) : DEFAULT_PICKUP_GODOWNS;
    } catch {
      return DEFAULT_PICKUP_GODOWNS;
    }
  });

  const [savedDeliveryConsignees, setSavedDeliveryConsignees] = useState<SavedAddressItem[]>(() => {
    try {
      const raw = localStorage.getItem('ask_saved_delivery_consignees');
      return raw ? JSON.parse(raw) : DEFAULT_DELIVERY_CONSIGNEES;
    } catch {
      return DEFAULT_DELIVERY_CONSIGNEES;
    }
  });

  // Modal State for adding new Address Book item
  const [showAddAddressModal, setShowAddAddressModal] = useState<'pickup' | 'delivery' | null>(null);
  const [showConsigneeDirectoryModal, setShowConsigneeDirectoryModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrAddress, setNewAddrAddress] = useState('');
  const [newAddrPin, setNewAddrPin] = useState('');

  // Inline "Save this address" toggle state
  const [saveCurrentPickupToBook, setSaveCurrentPickupToBook] = useState(false);
  const [currentPickupLabel, setCurrentPickupLabel] = useState('');
  const [saveCurrentDeliveryToBook, setSaveCurrentDeliveryToBook] = useState(false);
  const [currentDeliveryLabel, setCurrentDeliveryLabel] = useState('');

  // Multi-Box / Multi-Item Consignment State
  const [packagesList, setPackagesList] = useState<PackageItem[]>([
    {
      id: 'PKG-1',
      label: 'Box #1: Commercial Cargo',
      lengthCm: 50,
      widthCm: 40,
      heightCm: 30,
      deadWeightKg: 25,
      quantity: 1
    }
  ]);

  // Payment Method: Wallet, 15-Day Corporate Credit, or Online Gateway
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'credit' | 'online'>('wallet');

  // WhatsApp & SMS Live Alerts Opt-in
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);

  // Document Modals on Completion
  const [selectedLr, setSelectedLr] = useState<ConsignmentLRData | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<GstInvoiceData | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [services, setServices] =
    useState<TransportService[]>([]);

  const [loadingServices, setLoadingServices] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState('');

  const [result, setResult] =
    useState<CreatedBooking | null>(null);


  const [pickupLocation, setPickupLocation] =
    useState<PinCodeDetails | null>(null);

  const [deliveryLocation, setDeliveryLocation] =
    useState<PinCodeDetails | null>(null);

  const [pickupPinLoading, setPickupPinLoading] =
    useState(false);

  const [deliveryPinLoading, setDeliveryPinLoading] =
    useState(false);

  const [pickupPinError, setPickupPinError] =
    useState('');

  const [deliveryPinError, setDeliveryPinError] =
    useState('');


  const [senderName, setSenderName] =
    useState('');

  const [senderPhone, setSenderPhone] =
    useState('');

  const [fromAddress, setFromAddress] =
    useState('');

  const [fromPinCode, setFromPinCode] =
    useState('');


  const [receiverName, setReceiverName] =
    useState('');

  const [receiverPhone, setReceiverPhone] =
    useState('');

  const [toAddress, setToAddress] =
    useState('');

  const [toPinCode, setToPinCode] =
    useState('');


  const [goodsType, setGoodsType] =
    useState('');

  const [weight, setWeight] =
    useState('');

  const [quantity, setQuantity] =
    useState('1');

  const [goodsDescription, setGoodsDescription] =
    useState('');


  const [transportServiceId, setTransportServiceId] =
    useState('');

  const [pickupDate, setPickupDate] =
    useState('');

  const [notes, setNotes] =
    useState('');




  useEffect(() => {
    loadServices();
  }, []);


  async function loadServices() {
    try {
      setLoadingServices(true);

      const data =
        await getTransportServices();

      setServices(data);

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Could not load transport services.'
      );

    } finally {
      setLoadingServices(false);
    }
  }


  async function checkPickupPin(pin: string) {
    setPickupLocation(null);
    setPickupPinError('');

    const clean = pin.trim();
    if (clean.length !== 6) {
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(clean)) {
      setPickupPinError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    try {
      setPickupPinLoading(true);
      const data = await lookupPinCode(clean);
      setPickupLocation(data);
    } catch (err: any) {
      setPickupLocation(null);
      setPickupPinError(err?.message || 'Invalid Indian PIN code.');
    } finally {
      setPickupPinLoading(false);
    }
  }

  async function checkDeliveryPin(pin: string) {
    setDeliveryLocation(null);
    setDeliveryPinError('');

    const clean = pin.trim();
    if (clean.length !== 6) {
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(clean)) {
      setDeliveryPinError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    try {
      setDeliveryPinLoading(true);
      const data = await lookupPinCode(clean);
      setDeliveryLocation(data);
    } catch (err: any) {
      setDeliveryLocation(null);
      setDeliveryPinError(err?.message || 'Invalid Indian PIN code.');
    } finally {
      setDeliveryPinLoading(false);
    }
  }

  function handleSelectPickupGodown(item: SavedAddressItem) {
    setSenderName(item.contactName);
    setSenderPhone(item.phone);
    setFromAddress(item.address);
    setFromPinCode(item.pinCode);
    checkPickupPin(item.pinCode);
  }

  function handleSelectDeliveryConsignee(item: SavedAddressItem) {
    setReceiverName(item.contactName);
    setReceiverPhone(item.phone);
    setToAddress(item.address);
    setToPinCode(item.pinCode);
    checkDeliveryPin(item.pinCode);
  }

  function handleDeletePickupGodown(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = savedPickupGodowns.filter(g => g.id !== id);
    setSavedPickupGodowns(updated);
    localStorage.setItem('ask_saved_pickup_godowns', JSON.stringify(updated));
  }

  function handleDeleteDeliveryConsignee(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = savedDeliveryConsignees.filter(c => c.id !== id);
    setSavedDeliveryConsignees(updated);
    localStorage.setItem('ask_saved_delivery_consignees', JSON.stringify(updated));
  }

  function handleSaveCurrentPickupAddress() {
    if (!fromAddress.trim() || !fromPinCode.trim()) {
      alert('Please enter Address and PIN code first to save this godown.');
      return;
    }
    const label = currentPickupLabel.trim() || `${fromAddress.slice(0, 24)} (${fromPinCode})`;
    const newItem: SavedAddressItem = {
      id: `pg-${Date.now()}`,
      label,
      contactName: senderName.trim() || 'Godown Manager',
      phone: senderPhone.trim() || '9800000000',
      address: fromAddress.trim(),
      pinCode: fromPinCode.trim(),
      type: 'pickup'
    };
    const updated = [newItem, ...savedPickupGodowns];
    setSavedPickupGodowns(updated);
    localStorage.setItem('ask_saved_pickup_godowns', JSON.stringify(updated));
    setCurrentPickupLabel('');
    setSaveCurrentPickupToBook(false);
    alert(`✓ "${label}" saved to your Saved Godowns Book!`);
  }

  function handleSaveCurrentDeliveryAddress() {
    if (!toAddress.trim() || !toPinCode.trim()) {
      alert('Please enter Address and PIN code first to save this consignee.');
      return;
    }
    const label = currentDeliveryLabel.trim() || `${toAddress.slice(0, 24)} (${toPinCode})`;
    const newItem: SavedAddressItem = {
      id: `dc-${Date.now()}`,
      label,
      contactName: receiverName.trim() || 'Receiving Store Manager',
      phone: receiverPhone.trim() || '9800000000',
      address: toAddress.trim(),
      pinCode: toPinCode.trim(),
      type: 'delivery'
    };
    const updated = [newItem, ...savedDeliveryConsignees];
    setSavedDeliveryConsignees(updated);
    localStorage.setItem('ask_saved_delivery_consignees', JSON.stringify(updated));
    setCurrentDeliveryLabel('');
    setSaveCurrentDeliveryToBook(false);
    alert(`✓ "${label}" saved to your Saved Consignees Book!`);
  }

  function handleModalSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!newAddrLabel.trim() || !newAddrAddress.trim() || !newAddrPin.trim()) {
      alert('Please enter Label, Address, and 6-digit PIN code.');
      return;
    }
    if (showAddAddressModal === 'pickup') {
      const newItem: SavedAddressItem = {
        id: `pg-${Date.now()}`,
        label: newAddrLabel.trim(),
        contactName: newAddrName.trim() || 'Godown Manager',
        phone: newAddrPhone.trim() || '9800000000',
        address: newAddrAddress.trim(),
        pinCode: newAddrPin.trim(),
        type: 'pickup'
      };
      const updated = [newItem, ...savedPickupGodowns];
      setSavedPickupGodowns(updated);
      localStorage.setItem('ask_saved_pickup_godowns', JSON.stringify(updated));
      handleSelectPickupGodown(newItem);
    } else {
      const newItem: SavedAddressItem = {
        id: `dc-${Date.now()}`,
        label: newAddrLabel.trim(),
        contactName: newAddrName.trim() || 'Receiving Store Manager',
        phone: newAddrPhone.trim() || '9800000000',
        address: newAddrAddress.trim(),
        pinCode: newAddrPin.trim(),
        type: 'delivery'
      };
      const updated = [newItem, ...savedDeliveryConsignees];
      setSavedDeliveryConsignees(updated);
      localStorage.setItem('ask_saved_delivery_consignees', JSON.stringify(updated));
      handleSelectDeliveryConsignee(newItem);
    }
    setShowAddAddressModal(null);
    setNewAddrLabel('');
    setNewAddrName('');
    setNewAddrPhone('');
    setNewAddrAddress('');
    setNewAddrPin('');
  }

  function validateStep1() {

    if (
      !senderName.trim() ||
      !senderPhone.trim() ||
      !fromAddress.trim() ||
      !fromPinCode.trim()
    ) {
      setError(
        'Complete all pickup details.'
      );

      return false;
    }


    if (!/^[0-9]{10}$/.test(senderPhone)) {
      setError(
        'Enter valid 10 digit sender mobile number.'
      );

      return false;
    }


    if (!/^[0-9]{6}$/.test(fromPinCode)) {
      setError(
        'Pickup PIN code must be 6 digits.'
      );

      return false;
    }


    if (
      !receiverName.trim() ||
      !receiverPhone.trim() ||
      !toAddress.trim() ||
      !toPinCode.trim()
    ) {
      setError(
        'Complete all delivery details.'
      );

      return false;
    }


    if (!/^[0-9]{10}$/.test(receiverPhone)) {
      setError(
        'Enter valid 10 digit receiver mobile number.'
      );

      return false;
    }


    if (!/^[0-9]{6}$/.test(toPinCode)) {
      setError(
        'Delivery PIN code must be 6 digits.'
      );

      return false;
    }


    if (fromPinCode === toPinCode) {
      setError(
        'Pickup and delivery PIN cannot be same.'
      );

      return false;
    }


    if (!pickupLocation) {
      setError(
        'Please enter a valid serviceable pickup PIN code.'
      );

      return false;
    }


    if (!deliveryLocation) {
      setError(
        'Please enter a valid serviceable delivery PIN code.'
      );

      return false;
    }


    return true;
  }


  function validateStep2() {

    if (!goodsType) {
      setError('Select goods type.');
      return false;
    }


    if (
      !weight ||
      Number(weight) <= 0
    ) {
      setError(
        'Enter valid shipment weight.'
      );

      return false;
    }


    if (
      !quantity ||
      Number(quantity) < 1
    ) {
      setError(
        'Quantity must be at least 1.'
      );

      return false;
    }


    return true;
  }


  function validateStep3() {

    if (!transportServiceId) {
      setError(
        'Select transport service.'
      );

      return false;
    }


    if (!pickupDate) {
      setError(
        'Select pickup date.'
      );

      return false;
    }


    const selected =
      new Date(
        pickupDate + 'T00:00:00'
      );

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );


    if (selected < today) {
      setError(
        'Pickup date cannot be in the past.'
      );

      return false;
    }


    return true;
  }


  function nextStep() {

    setError('');


    if (
      step === 1 &&
      !validateStep1()
    ) {
      return;
    }


    if (
      step === 2 &&
      !validateStep2()
    ) {
      return;
    }


    if (
      step === 3 &&
      !validateStep3()
    ) {
      return;
    }


    setStep(
      (current) =>
        Math.min(current + 1, 4)
    );
  }


  function previousStep() {
    setError('');

    setStep(
      (current) =>
        Math.max(current - 1, 1)
    );
  }


  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError('');

    if (isMaintenance) {
      setError('Consignment bookings are paused due to scheduled system maintenance. Please call support.');
      return;
    }


    if (
      !validateStep1() ||
      !validateStep2() ||
      !validateStep3()
    ) {
      return;
    }


    try {

      setSubmitting(true);


      const response =
        await createBooking({

          orderType: 'Single',

          senderName:
            senderName.trim(),

          senderPhone,

          fromAddress:
            fromAddress.trim(),

          fromPinCode,


          receiverName:
            receiverName.trim(),

          receiverPhone,

          toAddress:
            toAddress.trim(),

          toPinCode,


          goodsType,

          weight:
            Number(weight),

          quantity:
            Number(quantity),

          goodsDescription:
            goodsDescription.trim() ||
            undefined,


          transportServiceId:
            Number(transportServiceId),

          pickupDate,

          discountAmount: 0,

          notes:
            notes.trim() ||
            undefined,

          items: []
        });


      setResult(
        response.booking
      );


    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Booking could not be created.'
      );

    } finally {
      setSubmitting(false);
    }
  }


  const today =
    new Date()
      .toLocaleDateString('en-CA');


  const selectedService =
    services.find(
      (service) =>
        service.id ===
        Number(transportServiceId)
    );


  if (result) {
    return (
      <CustomerLayout>
        <div className="booking-page">
          <main className="booking-success">

          <div className="success-check">
            OK
          </div>

          <span className="success-label">
            BOOKING CONFIRMED
          </span>

          <h1>
            Shipment booked successfully
          </h1>

          <p>
            Your shipment has been created
            and is ready for processing.
          </p>


          <div className="success-number">
            <span>
              Booking Number
            </span>

            <strong>
              {result.bookingNumber}
            </strong>
          </div>


          <div className="success-route">

            <div>
              <small>FROM</small>
              <strong>
                {result.fromCity}
              </strong>
            </div>

            <span>
              TO
            </span>

            <div>
              <small>DELIVERY</small>
              <strong>
                {result.toCity}
              </strong>
            </div>

          </div>


          <div className="success-grid">

            <div>
              <span>
                Service
              </span>

              <strong>
                {result.service}
              </strong>
            </div>


            <div>
              <span>
                Status
              </span>

              <strong>
                {result.bookingStatus}
              </strong>
            </div>


            <div>
              <span>
                Weight
              </span>

              <strong>
                {result.weight} kg
              </strong>
            </div>


            <div>
              <span>
                Quantity
              </span>

              <strong>
                {result.quantity}
              </strong>
            </div>


            <div>
              <span>
                Freight
              </span>

              <strong>
                ₹{result.freightAmount
                  .toLocaleString('en-IN')}
              </strong>
            </div>


            <div>
              <span>
                GST
              </span>

              <strong>
                ₹{result.gstAmount
                  .toLocaleString('en-IN')}
              </strong>
            </div>


            <div className="success-total">
              <span>
                Total Amount
              </span>

              <strong>
                ₹{result.totalAmount
                  .toLocaleString('en-IN')}
              </strong>
            </div>

          </div>


          <div className="success-payment-box">

            <div>
              <span>PAYMENT</span>

              <h3>
                Complete your payment
              </h3>

              <p>
                Your booking is confirmed.
                You can pay now or pay later
                from My Bookings.
              </p>
            </div>

            <strong>
              ₹{result.totalAmount
                .toLocaleString(
                  'en-IN',
                  {
                    minimumFractionDigits: 2
                  }
                )}
            </strong>

          </div>


          <div className="success-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              className="success-secondary"
              style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 700 }}
              onClick={() => {
                setSelectedLr({
                  bookingNumber: result.bookingNumber,
                  consignmentNumber: `LR-${result.bookingNumber}`,
                  bookingDate: new Date().toLocaleDateString('en-IN'),
                  senderName: senderName || 'Authorized Consignor',
                  senderPhone: senderPhone || '9876543210',
                  fromCity: result.fromCity,
                  receiverName: receiverName || 'Authorized Consignee',
                  receiverPhone: receiverPhone || '9812345678',
                  toCity: result.toCity,
                  goodsDescription: goodsDescription || 'Commercial Freight',
                  weightKg: result.weight,
                  quantity: result.quantity,
                  freightAmount: result.freightAmount,
                  gstAmount: result.gstAmount,
                  totalAmount: result.totalAmount,
                  paymentStatus: paymentMethod === 'wallet' ? 'Paid via Wallet' : paymentMethod === 'credit' ? 'B2B 15-Day Credit' : 'Payment Pending',
                  serviceType: result.service
                });
              }}
            >
              📄 Download Bilty (LR)
            </button>

            <button
              type="button"
              className="success-secondary"
              style={{ background: '#f0fdf4', color: '#047857', border: '1px solid #a7f3d0', fontWeight: 700 }}
              onClick={() => {
                setSelectedInvoice({
                  invoiceNumber: `INV-2026-${result.bookingNumber.replace(/\D/g, '') || '9021'}`,
                  invoiceDate: new Date().toLocaleDateString('en-IN'),
                  bookingNumber: result.bookingNumber,
                  lrNumber: `LR-${result.bookingNumber}`,
                  shipperName: senderName || 'Authorized Shipper Ltd',
                  shipperAddress: fromAddress || `${result.fromCity} Industrial Area`,
                  consigneeName: receiverName || 'Authorized Consignee',
                  consigneeAddress: toAddress || `${result.toCity} Delivery Depot`,
                  originCity: result.fromCity,
                  destinationCity: result.toCity,
                  weightKg: result.weight,
                  packagesCount: result.quantity,
                  basicFreight: result.freightAmount,
                  fuelSurcharge: Math.round(result.freightAmount * 0.10),
                  handlingCharge: 250,
                  cgstAmount: Math.round(result.gstAmount / 2),
                  sgstAmount: Math.round(result.gstAmount / 2),
                  totalInvoiceAmount: result.totalAmount,
                  paymentStatus: paymentMethod === 'wallet' ? 'Paid via Wallet' : paymentMethod === 'credit' ? '15-Day Credit Ledger' : 'Pending'
                });
              }}
            >
              🧾 Download GST Invoice
            </button>

            <button
              type="button"
              className="success-secondary"
              style={{ background: '#fdf4ff', color: '#7e22ce', border: '1px solid #f0abfc', fontWeight: 700 }}
              onClick={() => {
                const link = `${window.location.origin}/track?num=${result.bookingNumber}`;
                navigator.clipboard?.writeText(link);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 3000);
              }}
            >
              {copiedLink ? '✓ Copied Link!' : '🔗 Share Consignee Link'}
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(`🚛 ASK Transport Group Alert:\nYour shipment ${result.bookingNumber} (${result.fromCity} ➔ ${result.toCity}) is confirmed.\nTrack live without login: ${window.location.origin}/track?num=${result.bookingNumber}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="success-secondary"
              style={{ background: '#ecfdf5', color: '#15803d', border: '1px solid #86efac', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              📲 Send WhatsApp to Receiver
            </a>

            <Link
              className="success-primary"
              to="/payment"
              state={{
                bookingNumber:
                  result.bookingNumber,

                amount:
                  result.totalAmount
              }}
            >
              Pay Now
            </Link>

            <Link
              className="success-secondary"
              to="/bookings"
            >
              My Bookings
            </Link>

            <Link
              className="success-secondary"
              to="/dashboard"
            >
              Back to Dashboard
            </Link>

          </div>
        </main>
      </div>

      {selectedLr && (
        <ConsignmentLRModal
          data={selectedLr}
          onClose={() => setSelectedLr(null)}
        />
      )}

      {selectedInvoice && (
        <GstTaxInvoiceModal
          data={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </CustomerLayout>
  );
}

return (
  <CustomerLayout>
    <div className="booking-page">
      <main className="booking-container">

        <div className="booking-heading">

          <span>
            NEW SHIPMENT
          </span>

          <h1>
            Book a Shipment
          </h1>

          <p>
            Enter shipment details and
            confirm your booking.
          </p>

        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '28px' }}>
          <button
            type="button"
            onClick={() => setBookingMode('single')}
            style={{
              padding: '10px 22px',
              borderRadius: '24px',
              border: bookingMode === 'single' ? '2px solid #2563eb' : '1px solid var(--border, #cbd5e1)',
              background: bookingMode === 'single' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-card, #ffffff)',
              color: bookingMode === 'single' ? '#2563eb' : 'var(--text-secondary, #64748b)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.92rem',
              transition: 'all 0.2s',
            }}
          >
            📦 Single Consignment Form
          </button>
          <button
            type="button"
            onClick={() => setBookingMode('bulk')}
            style={{
              padding: '10px 22px',
              borderRadius: '24px',
              border: bookingMode === 'bulk' ? '2px solid #2563eb' : '1px solid var(--border, #cbd5e1)',
              background: bookingMode === 'bulk' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-card, #ffffff)',
              color: bookingMode === 'bulk' ? '#2563eb' : 'var(--text-secondary, #64748b)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.92rem',
              transition: 'all 0.2s',
            }}
          >
            📑 B2B Bulk Excel / CSV Upload
          </button>
        </div>

        {bookingMode === 'bulk' ? (
          <BulkBookingUpload services={services} />
        ) : (
          <>
        <div className="booking-progress">

          {[1, 2, 3, 4].map(
            (number) => (

              <div
                key={number}
                className={
                  'progress-step ' +
                  (
                    step >= number
                      ? 'active'
                      : ''
                  )
                }
              >
                <div>
                  {number}
                </div>

                <span>
                  {number === 1 &&
                    'Addresses'}

                  {number === 2 &&
                    'Goods'}

                  {number === 3 &&
                    'Service'}

                  {number === 4 &&
                    'Review'}
                </span>
              </div>

            )
          )}

        </div>


        {error && (
          <div className="booking-error">
            {error}
          </div>
        )}

        {isMaintenance && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            color: '#991b1b',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            fontWeight: 600
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <strong>Emergency Maintenance Active:</strong> Online consignment bookings are temporarily paused by administration.
              Please contact central operations at <strong>+91 98765 43210</strong> or check back shortly.
            </div>
          </div>
        )}

        <form
          className="booking-form"
          onSubmit={handleSubmit}
        >

          {/* STEP 1 */}

          {step === 1 && (

            <div className="booking-step">

              <div className="step-title">
                <span>STEP 01</span>

                <h2>
                  Pickup & Delivery
                </h2>

                <p>
                  Enter sender and receiver
                  information.
                </p>
              </div>


              <div className="address-columns">

                <section className="address-card">

                  <div className="address-card-title">
                    <span>P</span>

                    <div>
                      <strong>
                        Pickup Details
                      </strong>

                      <small>
                        Sender information
                      </small>
                    </div>
                  </div>

                  {/* SAVED PICKUP GODOWNS CHIPS */}
                  <div style={{
                    background: 'var(--surface-color, #f0f9ff)',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color, #bae6fd)',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary, #0369a1)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        📖 Saved Pickup Godowns ({savedPickupGodowns.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewAddrLabel('');
                          setNewAddrName(senderName || '');
                          setNewAddrPhone(senderPhone || '');
                          setNewAddrAddress(fromAddress || '');
                          setNewAddrPin(fromPinCode || '');
                          setShowAddAddressModal('pickup');
                        }}
                        style={{
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="Add and save a new pickup godown"
                      >
                        + Add / Save Godown
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {savedPickupGodowns.map(g => (
                        <div
                          key={g.id}
                          onClick={() => handleSelectPickupGodown(g)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 9px',
                            fontSize: '11px',
                            background: fromPinCode === g.pinCode ? '#0284c7' : 'var(--input-bg, #ffffff)',
                            color: fromPinCode === g.pinCode ? '#ffffff' : 'var(--text-primary, #0369a1)',
                            border: '1px solid #7dd3fc',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.15s'
                          }}
                          title={`Click to fill: ${g.address}`}
                        >
                          <span>🏭 {g.label}</span>
                          <span
                            onClick={(e) => handleDeletePickupGodown(g.id, e)}
                            style={{
                              marginLeft: '2px',
                              opacity: 0.7,
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                            title="Remove from saved godowns"
                          >
                            &times;
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="booking-field">
                    <label>
                      Sender Name *
                    </label>

                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) =>
                        setSenderName(
                          e.target.value
                        )
                      }
                      placeholder="Enter sender name"
                    />
                  </div>


                  <div className="booking-field">
                    <label>
                      Mobile Number *
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      value={senderPhone}
                      onChange={(e) =>
                        setSenderPhone(
                          e.target.value
                            .replace(/\D/g, '')
                        )
                      }
                      placeholder="10 digit mobile number"
                    />
                  </div>


                  <div className="booking-field">
                    <label>
                      Pickup Address *
                    </label>

                    <textarea
                      value={fromAddress}
                      onChange={(e) =>
                        setFromAddress(
                          e.target.value
                        )
                      }
                      placeholder="House, street, area"
                    />
                  </div>


                  <div className="booking-field">
                    <label>
                      PIN Code *
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={fromPinCode}
                      onChange={(e) => {

                        const pin =
                          e.target.value
                            .replace(/\D/g, '');

                        setFromPinCode(pin);

                        setPickupLocation(null);
                        setPickupPinError('');

                        if (pin.length === 6) {
                          checkPickupPin(pin);
                        }
                      }}
                      placeholder="6 digit PIN code"
                    />

                    {pickupPinLoading && (
                      <div className="pin-loading">
                        Checking PIN code...
                      </div>
                    )}

                    {pickupLocation && (
                      <div className="pin-success">

                        <div className="pin-status">
                          SERVICEABLE
                        </div>

                        <strong>
                          {pickupLocation.city}
                        </strong>

                        <span>
                          {pickupLocation.district}
                          {pickupLocation.district &&
                           pickupLocation.state
                            ? ', '
                            : ''}
                          {pickupLocation.state}
                        </span>

                        <small>
                          Estimated base delivery:
                          {' '}
                          {pickupLocation.deliveryDays}
                          {' '}
                          day
                          {pickupLocation.deliveryDays === 1
                            ? ''
                            : 's'}
                        </small>

                      </div>
                    )}

                    {pickupPinError && (
                      <div className="pin-error">
                        {pickupPinError}
                      </div>
                    )}
                  </div>

                  {/* INLINE SAVE TO ADDRESS BOOK OPTION */}
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    background: 'rgba(2, 132, 199, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(2, 132, 199, 0.2)'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
                      <input
                        type="checkbox"
                        checked={saveCurrentPickupToBook}
                        onChange={(e) => setSaveCurrentPickupToBook(e.target.checked)}
                      />
                      <span>💾 Save this address to Saved Godowns Book (for 1-click future bookings)</span>
                    </label>
                    {saveCurrentPickupToBook && (
                      <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          placeholder="Enter godown nickname (e.g. Okhla Depot #2)"
                          value={currentPickupLabel}
                          onChange={(e) => setCurrentPickupLabel(e.target.value)}
                          style={{ flex: 1, padding: '6px 10px', fontSize: '11px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                        <button
                          type="button"
                          onClick={handleSaveCurrentPickupAddress}
                          style={{ padding: '6px 12px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          Save Godown
                        </button>
                      </div>
                    )}
                  </div>

                </section>


                <section className="address-card">

                  <div className="address-card-title delivery">
                    <span>D</span>

                    <div>
                      <strong>
                        Delivery Details
                      </strong>

                      <small>
                        Receiver information
                      </small>
                    </div>
                  </div>

                  {/* SAVED DELIVERY CONSIGNEES CHIPS */}
                  <div style={{
                    background: 'var(--surface-color, #f0fdf4)',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color, #bbf7d0)',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary, #166534)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        📖 Saved Delivery Consignees ({savedDeliveryConsignees.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewAddrLabel('');
                          setNewAddrName(receiverName || '');
                          setNewAddrPhone(receiverPhone || '');
                          setNewAddrAddress(toAddress || '');
                          setNewAddrPin(toPinCode || '');
                          setShowAddAddressModal('delivery');
                        }}
                        style={{
                          background: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="Add and save a new delivery consignee"
                      >
                        + Add / Save Consignee
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {savedDeliveryConsignees.map(c => (
                        <div
                          key={c.id}
                          onClick={() => handleSelectDeliveryConsignee(c)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 9px',
                            fontSize: '11px',
                            background: toPinCode === c.pinCode ? '#16a34a' : 'var(--input-bg, #ffffff)',
                            color: toPinCode === c.pinCode ? '#ffffff' : 'var(--text-primary, #166534)',
                            border: '1px solid #86efac',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.15s'
                          }}
                          title={`Click to fill: ${c.address}`}
                        >
                          <span>🏪 {c.label}</span>
                          <span
                            onClick={(e) => handleDeleteDeliveryConsignee(c.id, e)}
                            style={{
                              marginLeft: '2px',
                              opacity: 0.7,
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                            title="Remove from saved consignees"
                          >
                            &times;
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="booking-field">
                    <label>
                      Receiver Name *
                    </label>

                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) =>
                        setReceiverName(
                          e.target.value
                        )
                      }
                      placeholder="Enter receiver name"
                    />
                  </div>


                  <div className="booking-field">
                    <label>
                      Mobile Number *
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      value={receiverPhone}
                      onChange={(e) =>
                        setReceiverPhone(
                          e.target.value
                            .replace(/\D/g, '')
                        )
                      }
                      placeholder="10 digit mobile number"
                    />
                  </div>


                  <div className="booking-field">
                    <label>
                      Delivery Address *
                    </label>

                    <textarea
                      value={toAddress}
                      onChange={(e) =>
                        setToAddress(
                          e.target.value
                        )
                      }
                      placeholder="House, street, area"
                    />
                  </div>


                  <div className="booking-field">
                    <label>
                      PIN Code *
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={toPinCode}
                      onChange={(e) => {

                        const pin =
                          e.target.value
                            .replace(/\D/g, '');

                        setToPinCode(pin);

                        setDeliveryLocation(null);
                        setDeliveryPinError('');

                        if (pin.length === 6) {
                          checkDeliveryPin(pin);
                        }
                      }}
                      placeholder="6 digit PIN code"
                    />

                    {deliveryPinLoading && (
                      <div className="pin-loading">
                        Checking PIN code...
                      </div>
                    )}

                    {deliveryLocation && (
                      <div className="pin-success">

                        <div className="pin-status">
                          SERVICEABLE
                        </div>

                        <strong>
                          {deliveryLocation.city}
                        </strong>

                        <span>
                          {deliveryLocation.district}
                          {deliveryLocation.district &&
                           deliveryLocation.state
                            ? ', '
                            : ''}
                          {deliveryLocation.state}
                        </span>

                        <small>
                          Estimated base delivery:
                          {' '}
                          {deliveryLocation.deliveryDays}
                          {' '}
                          day
                          {deliveryLocation.deliveryDays === 1
                            ? ''
                            : 's'}
                        </small>

                      </div>
                    )}

                    {deliveryPinError && (
                      <div className="pin-error">
                        {deliveryPinError}
                      </div>
                    )}
                  </div>

                  {/* INLINE SAVE DELIVERY CONSIGNEE OPTION */}
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    background: 'rgba(34, 197, 94, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
                      <input
                        type="checkbox"
                        checked={saveCurrentDeliveryToBook}
                        onChange={(e) => setSaveCurrentDeliveryToBook(e.target.checked)}
                      />
                      <span>💾 Save this address to Saved Consignees Book (for 1-click future bookings)</span>
                    </label>
                    {saveCurrentDeliveryToBook && (
                      <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          placeholder="Enter consignee nickname (e.g. Bhiwandi DC #3)"
                          value={currentDeliveryLabel}
                          onChange={(e) => setCurrentDeliveryLabel(e.target.value)}
                          style={{ flex: 1, padding: '6px 10px', fontSize: '11px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                        <button
                          type="button"
                          onClick={handleSaveCurrentDeliveryAddress}
                          style={{ padding: '6px 12px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          Save Consignee
                        </button>
                      </div>
                    )}
                  </div>

                </section>

              </div>

            </div>

          )}


          {/* STEP 2 */}

          {step === 2 && (

            <div className="booking-step">

              <div className="step-title">
                <span>STEP 02</span>

                <h2>
                  Goods Details
                </h2>

                <p>
                  Tell us what you are shipping.
                </p>
              </div>


              <div className="booking-grid">

                <div className="booking-field">
                  <label>
                    Goods Type *
                  </label>

                  <select
                    value={goodsType}
                    onChange={(e) =>
                      setGoodsType(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select goods type
                    </option>

                    <option value="Documents">
                      Documents
                    </option>

                    <option value="Electronics">
                      Electronics
                    </option>

                    <option value="Clothing">
                      Clothing
                    </option>

                    <option value="Food">
                      Food
                    </option>

                    <option value="Furniture">
                      Furniture
                    </option>

                    <option value="Machinery">
                      Machinery
                    </option>

                    <option value="Automobile Parts">
                      Automobile Parts
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>


                <div className="booking-field">
                  <label>
                    Total Weight (kg) *
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={weight}
                    onChange={(e) =>
                      setWeight(
                        e.target.value
                      )
                    }
                    placeholder="Example: 25"
                  />
                </div>


                <div className="booking-field">
                  <label>
                    Quantity *
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        e.target.value
                      )
                    }
                  />
                </div>


                <div className="booking-field full">
                  <label>
                    Goods Description
                  </label>

                  <textarea
                    value={goodsDescription}
                    onChange={(e) =>
                      setGoodsDescription(
                        e.target.value
                      )
                    }
                    placeholder="Describe the goods"
                  />
                </div>

                {/* MULTI-BOX / MULTI-ITEM CONSIGNMENT BUILDER */}
                <div style={{ gridColumn: 'span 2', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>📦 Multi-Box / Multi-Package Consignment Slabs</strong>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                        Specify multiple cartons with custom dimensions (L × W × H) for B2B volumetric CFT &amp; dead weight billing.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `PKG-${packagesList.length + 1}`;
                        setPackagesList(prev => [
                          ...prev,
                          {
                            id: newId,
                            label: `Box #${prev.length + 1}: Commercial Carton`,
                            lengthCm: 40,
                            widthCm: 30,
                            heightCm: 25,
                            deadWeightKg: 15,
                            quantity: 1
                          }
                        ]);
                      }}
                      style={{
                        padding: '6px 12px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      + Add Box Slab
                    </button>
                  </div>

                  {/* PACKAGE LIST TABLE */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {packagesList.map((pkg) => {
                      const volWeight = Math.round(((pkg.lengthCm * pkg.widthCm * pkg.heightCm) / 5000) * 10) / 10;

                      return (
                        <div
                          key={pkg.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.4fr 1.6fr 1fr 0.8fr auto',
                            gap: '8px',
                            alignItems: 'center',
                            background: '#ffffff',
                            padding: '10px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        >
                          <div>
                            <input
                              type="text"
                              value={pkg.label}
                              onChange={e => {
                                const val = e.target.value;
                                setPackagesList(prev => prev.map(p => p.id === pkg.id ? { ...p, label: val } : p));
                              }}
                              style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <input
                              type="number"
                              title="Length (cm)"
                              placeholder="L"
                              value={pkg.lengthCm}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 1;
                                setPackagesList(prev => prev.map(p => p.id === pkg.id ? { ...p, lengthCm: val } : p));
                              }}
                              style={{ width: '45px', padding: '6px 4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }}
                            />
                            <span>×</span>
                            <input
                              type="number"
                              title="Width (cm)"
                              placeholder="W"
                              value={pkg.widthCm}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 1;
                                setPackagesList(prev => prev.map(p => p.id === pkg.id ? { ...p, widthCm: val } : p));
                              }}
                              style={{ width: '45px', padding: '6px 4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }}
                            />
                            <span>×</span>
                            <input
                              type="number"
                              title="Height (cm)"
                              placeholder="H"
                              value={pkg.heightCm}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 1;
                                setPackagesList(prev => prev.map(p => p.id === pkg.id ? { ...p, heightCm: val } : p));
                              }}
                              style={{ width: '45px', padding: '6px 4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }}
                            />
                            <span style={{ fontSize: '10px', color: '#64748b' }}>(cm)</span>
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                title="Dead Weight (kg)"
                                value={pkg.deadWeightKg}
                                onChange={e => {
                                  const val = parseFloat(e.target.value) || 1;
                                  setPackagesList(prev => prev.map(p => p.id === pkg.id ? { ...p, deadWeightKg: val } : p));
                                }}
                                style={{ width: '60px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                              />
                              <span style={{ fontSize: '11px', color: '#64748b' }}>KG</span>
                            </div>
                            <div style={{ fontSize: '10px', color: '#0369a1' }}>
                              Vol: {volWeight} kg
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>Qty:</span>
                              <input
                                type="number"
                                min={1}
                                value={pkg.quantity}
                                onChange={e => {
                                  const val = parseInt(e.target.value) || 1;
                                  setPackagesList(prev => prev.map(p => p.id === pkg.id ? { ...p, quantity: val } : p));
                                }}
                                style={{ width: '45px', padding: '6px 4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', textAlign: 'center' }}
                              />
                            </div>
                          </div>

                          {packagesList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setPackagesList(prev => prev.filter(p => p.id !== pkg.id))}
                              style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: '16px' }}
                              title="Delete Box Slab"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', padding: '8px 12px', borderRadius: '6px', border: '1px solid #a7f3d0', fontSize: '12px' }}>
                    <span style={{ color: '#065f46', fontWeight: 700 }}>
                      ✓ Multi-Box Total: {packagesList.reduce((acc, p) => acc + p.quantity, 0)} Packages
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const totalKg = packagesList.reduce((acc, p) => {
                          const volWeight = (p.lengthCm * p.widthCm * p.heightCm) / 5000;
                          return acc + (Math.max(volWeight, p.deadWeightKg) * p.quantity);
                        }, 0);
                        const totalQty = packagesList.reduce((acc, p) => acc + p.quantity, 0);
                        setWeight(Math.round(totalKg).toString());
                        setQuantity(totalQty.toString());
                        setGoodsDescription(packagesList.map(p => `${p.quantity}x ${p.label} (${p.lengthCm}x${p.widthCm}x${p.heightCm}cm, ${p.deadWeightKg}kg)`).join('; '));
                      }}
                      style={{ padding: '4px 10px', background: '#059669', color: '#ffffff', borderRadius: '4px', border: 'none', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}
                    >
                      Sync Weight &amp; Quantity ({Math.round(packagesList.reduce((acc, p) => acc + (Math.max((p.lengthCm * p.widthCm * p.heightCm) / 5000, p.deadWeightKg) * p.quantity), 0))} KG)
                    </button>
                  </div>
                </div>

              </div>

            </div>

          )}


          {/* STEP 3 */}

          {step === 3 && (

            <div className="booking-step">

              <div className="step-title">
                <span>STEP 03</span>

                <h2>
                  Service & Pickup
                </h2>

                <p>
                  Choose transport service
                  and pickup date.
                </p>
              </div>


              <div className="booking-grid">

                <div className="booking-field full">
                  <label>
                    Transport Service *
                  </label>

                  <select
                    value={transportServiceId}
                    onChange={(e) =>
                      setTransportServiceId(
                        e.target.value
                      )
                    }
                    disabled={loadingServices}
                  >

                    <option value="">
                      {loadingServices
                        ? 'Loading services...'
                        : 'Select transport service'}
                    </option>


                    {services.map(
                      (service) => (

                        <option
                          key={service.id}
                          value={service.id}
                        >
                          {service.name}
                        </option>

                      )
                    )}

                  </select>
                </div>


                <div className="booking-field">
                  <label>
                    Pickup Date *
                  </label>

                  <input
                    type="date"
                    min={today}
                    value={pickupDate}
                    onChange={(e) =>
                      setPickupDate(
                        e.target.value
                      )
                    }
                  />
                </div>


                <div className="booking-field full">
                  <label>
                    Booking Notes
                  </label>

                  <textarea
                    value={notes}
                    onChange={(e) =>
                      setNotes(
                        e.target.value
                      )
                    }
                    placeholder="Optional instructions"
                  />
                </div>

                {/* 1. WHATSAPP & SMS LIVE ALERTS OPT-IN */}
                <div style={{ gridColumn: 'span 2', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 14px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, color: '#166534', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={whatsappAlerts}
                      onChange={e => setWhatsappAlerts(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#16a34a' }}
                    />
                    <span>📲 Send Real-Time Automated WhatsApp &amp; SMS Milestone Alerts to Consignor &amp; Consignee</span>
                  </label>
                  <p style={{ margin: '4px 0 0 28px', fontSize: '11px', color: '#15803d' }}>
                    Automated push notifications triggered on: Consignment Pickup, In-Transit Highway Tracking, Out for Delivery, and Delivery Sealed.
                  </p>
                </div>

                {/* 2. SHIPPER WALLET & 15-DAY CORPORATE CREDIT LINE */}
                <div style={{ gridColumn: 'span 2', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', marginTop: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    💳 Commercial Payment &amp; Credit Ledger Mode
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <label style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '2px solid',
                      borderColor: paymentMethod === 'wallet' ? '#0b72e7' : '#cbd5e1',
                      background: paymentMethod === 'wallet' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="radio"
                          name="payMethod"
                          value="wallet"
                          checked={paymentMethod === 'wallet'}
                          onChange={() => setPaymentMethod('wallet')}
                        />
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>Shipper Prepaid Wallet</strong>
                      </div>
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, marginTop: '4px', marginLeft: '24px' }}>
                        Available Balance: ₹24,500.00 (Instant 0-Fee)
                      </span>
                    </label>

                    <label style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '2px solid',
                      borderColor: paymentMethod === 'credit' ? '#0b72e7' : '#cbd5e1',
                      background: paymentMethod === 'credit' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="radio"
                          name="payMethod"
                          value="credit"
                          checked={paymentMethod === 'credit'}
                          onChange={() => setPaymentMethod('credit')}
                        />
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>15-Day Corporate Credit Line</strong>
                      </div>
                      <span style={{ fontSize: '11px', color: '#4338ca', fontWeight: 700, marginTop: '4px', marginLeft: '24px' }}>
                        Available Credit: ₹1,04,800.00 (Monthly Ledger)
                      </span>
                    </label>

                    <label style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '2px solid',
                      borderColor: paymentMethod === 'online' ? '#0b72e7' : '#cbd5e1',
                      background: paymentMethod === 'online' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="radio"
                          name="payMethod"
                          value="online"
                          checked={paymentMethod === 'online'}
                          onChange={() => setPaymentMethod('online')}
                        />
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>UPI / NetBanking / Gateway</strong>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', marginLeft: '24px' }}>
                        Standard Payment Gateway
                      </span>
                    </label>
                  </div>
                </div>

              </div>

            </div>

          )}


          {/* STEP 4 */}

          {step === 4 && (

            <div className="booking-step">

              <div className="step-title">
                <span>STEP 04</span>

                <h2>
                  Review Booking
                </h2>

                <p>
                  Check your shipment details
                  before confirming.
                </p>
              </div>


              <div className="review-grid">

                <section>
                  <span>PICKUP</span>

                  <strong>
                    {senderName}
                  </strong>

                  <p>
                    {senderPhone}
                  </p>

                  <p>
                    {fromAddress}
                  </p>

                  <p>
                    PIN: {fromPinCode}
                  </p>
                </section>


                <section>
                  <span>DELIVERY</span>

                  <strong>
                    {receiverName}
                  </strong>

                  <p>
                    {receiverPhone}
                  </p>

                  <p>
                    {toAddress}
                  </p>

                  <p>
                    PIN: {toPinCode}
                  </p>
                </section>


                <section>
                  <span>SHIPMENT</span>

                  <strong>
                    {goodsType}
                  </strong>

                  <p>
                    Weight: {weight} kg
                  </p>

                  <p>
                    Quantity: {quantity}
                  </p>
                </section>


                <section>
                  <span>SERVICE</span>

                  <strong>
                    {selectedService?.name ||
                      '-'}
                  </strong>

                  <p>
                    Pickup: {pickupDate}
                  </p>
                </section>

              </div>


              <div className="review-note">
                Final freight and GST will be
                calculated automatically by the
                ASK Transport server when you
                confirm this booking.
              </div>

            </div>

          )}


          {/* ACTIONS */}

          <div className="booking-form-actions">

            {step > 1 && (
              <button
                type="button"
                className="booking-back"
                onClick={previousStep}
                disabled={submitting}
              >
                Previous
              </button>
            )}


            <div className="booking-action-right">

              <Link
                to="/dashboard"
                className="booking-cancel"
              >
                Cancel
              </Link>


              {step < 4 ? (

                <button
                  type="button"
                  className="booking-next"
                  onClick={nextStep}
                >
                  Continue
                </button>

              ) : (

                <button
                  type="submit"
                  className="booking-next"
                  disabled={submitting || isMaintenance}
                  style={isMaintenance ? { background: '#94a3b8', cursor: 'not-allowed' } : undefined}
                >
                  {isMaintenance
                    ? 'Bookings Paused (Maintenance)'
                    : submitting
                    ? 'Creating Booking...'
                    : 'Confirm Booking'}
                </button>

              )}

            </div>

          </div>

        </form>
        </>
        )}
      </main>
    </div>

    {selectedLr && (
      <ConsignmentLRModal
        data={selectedLr}
        onClose={() => setSelectedLr(null)}
      />
    )}

    {selectedInvoice && (
      <GstTaxInvoiceModal
        data={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    )}

    {showAddAddressModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }} onClick={() => setShowAddAddressModal(null)}>
        <div style={{
          background: 'var(--surface-color, #ffffff)',
          color: 'var(--text-primary, #0f172a)',
          width: '100%',
          maxWidth: '520px',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-color, #e2e8f0)'
        }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                {showAddAddressModal === 'pickup' ? '🏭 Add New Saved Pickup Godown' : '🏪 Add New Saved Delivery Consignee'}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                Save your warehouse / consignee address for 1-click auto-fill in future bookings
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAddressModal(null)}
              style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b' }}
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleModalSaveAddress}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                  Label / Nickname *
                </label>
                <input
                  type="text"
                  required
                  placeholder={showAddAddressModal === 'pickup' ? 'e.g. Delhi Central Hub (110042)' : 'e.g. Bhiwandi DC Unit 4'}
                  value={newAddrLabel}
                  onChange={e => setNewAddrLabel(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={newAddrName}
                    onChange={e => setNewAddrName(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="10-digit number"
                    value={newAddrPhone}
                    onChange={e => setNewAddrPhone(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                  Complete Street / Building Address *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Plot / Gala / House number, Street, Industrial Area"
                  value={newAddrAddress}
                  onChange={e => setNewAddrAddress(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                  6-Digit Postal PIN Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 110042"
                  value={newAddrPin}
                  onChange={e => setNewAddrPin(e.target.value.replace(/\D/g, ''))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: showAddAddressModal === 'pickup' ? '#0284c7' : '#16a34a', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  💾 Save &amp; Auto-Fill Form
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )}

    {showConsigneeDirectoryModal && (
      <ConsigneeAddressBookModal
        isOpen={showConsigneeDirectoryModal}
        onClose={() => setShowConsigneeDirectoryModal(false)}
        onSelectConsignee={(item) => {
          setReceiverName(item.contactPerson || item.consigneeLegalTitle);
          setReceiverPhone(item.contactPhone);
          setToAddress(item.completeAddress);
          setToPinCode(item.pincode);
          checkDeliveryPin(item.pincode);
        }}
      />
    )}
  </CustomerLayout>
);
}


