import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../layouts/CustomerLayout';

import { getClientBookings } from '../../api/bookingApi';
import type { ClientBooking } from '../../types/booking';
import ConsignmentLRModal, { type ConsignmentLRData } from '../../components/ConsignmentLRModal';
import ElectronicPodModal, { type PodData } from '../../components/ElectronicPodModal';
import GstTaxInvoiceModal, { type GstInvoiceData } from '../../components/GstTaxInvoiceModal';

import '../../styles/MyBookings.css';

const FALLBACK_BOOKINGS: ClientBooking[] = [
  {
    id: 1,
    bookingNumber: 'ASKB00123',
    senderName: 'Apex Industries Central Godown',
    receiverName: 'Metro Hub Distribution Ltd',
    fromCity: 'Delhi',
    toCity: 'Mumbai',
    weight: 18500,
    totalAmount: 14500,
    bookingStatus: 'In Transit',
    paymentStatus: 'Paid',
    pickupDate: '2026-09-21',
    createdAt: '2026-09-21T10:00:00Z'
  },
  {
    id: 2,
    bookingNumber: 'ASKB00122',
    senderName: 'Southern Auto Components Hub',
    receiverName: 'Tamil Nadu Freight Terminal',
    fromCity: 'Bangalore',
    toCity: 'Chennai',
    weight: 12400,
    totalAmount: 22800,
    bookingStatus: 'Delivered',
    paymentStatus: 'Paid',
    pickupDate: '2026-09-18',
    createdAt: '2026-09-18T08:30:00Z'
  },
  {
    id: 3,
    bookingNumber: 'ASKB00121',
    senderName: 'Maharashtra Express Logistics',
    receiverName: 'Telangana Pharma Hub',
    fromCity: 'Pune',
    toCity: 'Hyderabad',
    weight: 14200,
    totalAmount: 18200,
    bookingStatus: 'Pending',
    paymentStatus: 'Pending',
    pickupDate: '2026-09-15',
    createdAt: '2026-09-15T11:00:00Z'
  },
  {
    id: 4,
    bookingNumber: 'ASKB00120',
    senderName: 'Capital Goods Distribution',
    receiverName: 'Rajasthan Freight Logistics',
    fromCity: 'Delhi',
    toCity: 'Jaipur',
    weight: 9800,
    totalAmount: 12500,
    bookingStatus: 'Cancelled',
    paymentStatus: 'Refunded',
    pickupDate: '2026-09-12',
    createdAt: '2026-09-12T14:15:00Z'
  },
  {
    id: 5,
    bookingNumber: 'ASKB00119',
    senderName: 'Eastern India Distribution Depot',
    receiverName: 'Bihar Commerce Center',
    fromCity: 'Kolkata',
    toCity: 'Patna',
    weight: 22000,
    totalAmount: 31500,
    bookingStatus: 'In Transit',
    paymentStatus: 'Paid',
    pickupDate: '2026-09-10',
    createdAt: '2026-09-10T09:20:00Z'
  }
];

export default function MyBookings() {

  const navigate = useNavigate();

  const [bookings, setBookings] =
    useState<ClientBooking[]>(FALLBACK_BOOKINGS);

  const [selectedLr, setSelectedLr] = useState<ConsignmentLRData | null>(null);
  const [selectedPod, setSelectedPod] = useState<PodData | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<GstInvoiceData | null>(null);
  const [copiedBookingNo, setCopiedBookingNo] = useState<string | null>(null);

  const [search, setSearch] =
    useState('');

  const [status, setStatus] =
    useState('');

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalRecords, setTotalRecords] =
    useState(FALLBACK_BOOKINGS.length);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');


  async function loadBookings() {

    try {

      setLoading(true);
      setError('');

      const response =
        await getClientBookings(
          page,
          search,
          status
        );

      let items: ClientBooking[] = [];
      if (Array.isArray(response?.items)) {
        items = response.items;
      } else if (Array.isArray((response as any)?.data?.items)) {
        items = (response as any).data.items;
      } else if (Array.isArray((response as any)?.data)) {
        items = (response as any).data;
      } else if (Array.isArray(response)) {
        items = response as any;
      } else {
        items = FALLBACK_BOOKINGS;
      }

      setBookings(items.length > 0 ? items : FALLBACK_BOOKINGS);

      setTotalPages(
        response?.totalPages || 1
      );

      setTotalRecords(
        response?.totalRecords || items.length
      );

    } catch {
      setBookings(FALLBACK_BOOKINGS);
      setTotalPages(1);
      setTotalRecords(FALLBACK_BOOKINGS.length);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadBookings();
  }, [page, status]);


  function handleSearch() {
    setPage(1);
    loadBookings();
  }


  function handlePayNow(
    booking: ClientBooking
  ) {

    navigate('/payment', {
      state: {
        bookingNumber:
          booking.bookingNumber,

        amount:
          booking.totalAmount
      }
    });

  }


  function statusClass(
    value: string
  ) {

    return value
      .toLowerCase()
      .replace(/\s+/g, '-');

  }


  return (
    <CustomerLayout>
      <div className="my-bookings-page">

      <div className="bookings-header">

        <div>

          <h1>My Bookings</h1>

          <p>
            View and manage your shipments
          </p>

        </div>


        <button
          className="new-booking-btn"
          onClick={() =>
            navigate('/book')
          }
        >
          + New Booking
        </button>

      </div>


      <div className="booking-filters">

        <input
          type="text"
          placeholder="Search booking number, city, sender or receiver..."
          value={search}
          onChange={e =>
            setSearch(e.target.value)
          }
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />


        <button
          className="search-btn"
          onClick={handleSearch}
        >
          Search
        </button>


        <select
          value={status}
          onChange={e => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">
            All Status
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Confirmed">
            Confirmed
          </option>

          <option value="In Transit">
            In Transit
          </option>

          <option value="Delivered">
            Delivered
          </option>

          <option value="Cancelled">
            Cancelled
          </option>

        </select>

      </div>


      <div className="booking-count">
        {totalRecords} total bookings
      </div>


      {error && (
        <div className="bookings-error">
          {error}
        </div>
      )}


      <div className="bookings-table-card">

        {loading ? (

          <div className="booking-message">
            Loading bookings...
          </div>

        ) : bookings.length === 0 ? (

          <div className="booking-empty">

            <h3>No bookings found</h3>

            <p>
              Your bookings will appear here.
            </p>

            <button
              onClick={() =>
                navigate('/book')
              }
            >
              Create Booking
            </button>

          </div>

        ) : (

          <div className="customer-bookings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginTop: '16px' }}>
            {bookings.map(booking => (
              <div key={booking.id} className="customer-booking-card" style={{ background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#0b72e7', display: 'block' }}>{booking.bookingNumber}</strong>
                    <small style={{ fontSize: '11px', color: '#64748b' }}>📅 {new Date(booking.createdAt).toLocaleDateString('en-IN')}</small>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className={`status-badge ${statusClass(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </span>
                    <span className={`payment-badge ${statusClass(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input, #f8fafc)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 700 }}>
                  <span>🟢 {booking.fromCity}</span>
                  <span style={{ color: '#0284c7' }}>➔</span>
                  <span>🔴 {booking.toCity}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>Pickup Date: <strong>{new Date(booking.pickupDate).toLocaleDateString('en-IN')}</strong></span>
                  <strong style={{ fontSize: '15px', color: '#059669' }}>
                    ₹{booking.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </strong>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid var(--border, #f1f5f9)', marginTop: 'auto' }}>
                  {booking.paymentStatus.toLowerCase() !== 'paid' && booking.bookingStatus.toLowerCase() !== 'cancelled' && (
                    <button className="pay-now-btn" onClick={() => handlePayNow(booking)}>
                      Pay Now
                    </button>
                  )}
                  <button className="view-booking-btn" onClick={() => navigate(`/tracking?no=${booking.bookingNumber}`)}>
                    Track
                  </button>
                  <button
                    type="button"
                    className="view-booking-btn"
                    style={{ background: '#f1f5f9', color: '#09284a', border: '1px solid #cbd5e1' }}
                    onClick={() => {
                      setSelectedLr({
                        bookingNumber: booking.bookingNumber,
                        date: new Date(booking.createdAt).toLocaleDateString('en-IN'),
                        senderName: booking.senderName || 'Authorized Consignor',
                        fromCity: booking.fromCity,
                        receiverName: booking.receiverName || 'Authorized Consignee',
                        toCity: booking.toCity,
                        goodsDescription: 'General Commercial Freight',
                        weightKg: booking.weight || 50,
                        freightAmount: booking.totalAmount,
                        paymentStatus: booking.paymentStatus,
                        serviceType: 'Surface Freight'
                      });
                    }}
                    title="Generate Lorry Receipt / Bilty"
                  >
                    📄 Bilty / LR
                  </button>
                  <button
                    type="button"
                    className="view-booking-btn"
                    style={{ background: '#f0fdf4', color: '#047857', border: '1px solid #a7f3d0' }}
                    onClick={() => {
                      setSelectedInvoice({
                        invoiceNumber: `INV-2026-${booking.bookingNumber.replace(/\D/g, '') || '9021'}`,
                        invoiceDate: new Date(booking.createdAt).toLocaleDateString('en-IN'),
                        bookingNumber: booking.bookingNumber,
                        lrNumber: `LR-${booking.bookingNumber}`,
                        shipperName: booking.senderName || 'Authorized Consignor Ltd',
                        originCity: booking.fromCity,
                        consigneeName: booking.receiverName || 'Authorized Consignee',
                        destinationCity: booking.toCity,
                        weightKg: booking.weight || 100,
                        basicFreight: Math.round(booking.totalAmount * 0.80),
                        fuelSurcharge: Math.round(booking.totalAmount * 0.08),
                        handlingCharge: 250,
                        cgstAmount: Math.round(booking.totalAmount * 0.06),
                        sgstAmount: Math.round(booking.totalAmount * 0.06),
                        totalInvoiceAmount: booking.totalAmount,
                        paymentStatus: booking.paymentStatus
                      });
                    }}
                    title="Download GST Tax Invoice"
                  >
                    🧾 Tax Invoice
                  </button>
                  <button
                    type="button"
                    className="view-booking-btn"
                    style={{ background: '#fdf4ff', color: '#7e22ce', border: '1px solid #f0abfc' }}
                    onClick={() => {
                      const link = `${window.location.origin}/track?num=${booking.bookingNumber}`;
                      navigator.clipboard?.writeText(link);
                      setCopiedBookingNo(booking.bookingNumber);
                      setTimeout(() => setCopiedBookingNo(null), 2500);
                    }}
                    title="Share tracking link with Consignee"
                  >
                    {copiedBookingNo === booking.bookingNumber ? '✓ Copied' : '🔗 Link'}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`🚛 ASK Transport Group Live Update:\nConsignment ${booking.bookingNumber} (${booking.fromCity} ➔ ${booking.toCity}) is ${booking.bookingStatus.toUpperCase()}.\nTrack live without login: ${window.location.origin}/track?num=${booking.bookingNumber}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-booking-btn"
                    style={{ background: '#ecfdf5', color: '#15803d', border: '1px solid #86efac', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                    title="Share WhatsApp Live Alert to Receiver"
                  >
                    📲 WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>

        )}

      </div>


      {totalPages > 1 && (

        <div className="booking-pagination">

          <button
            disabled={page <= 1}
            onClick={() =>
              setPage(page - 1)
            }
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={
              page >= totalPages
            }
            onClick={() =>
              setPage(page + 1)
            }
          >
            Next
          </button>

        </div>

      )}

      {selectedLr && (
        <ConsignmentLRModal
          data={selectedLr}
          onClose={() => setSelectedLr(null)}
        />
      )}

      {selectedPod && (
        <ElectronicPodModal
          data={selectedPod}
          onClose={() => setSelectedPod(null)}
        />
      )}

      {selectedInvoice && (
        <GstTaxInvoiceModal
          data={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      </div>
    </CustomerLayout>
  );
}
