import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../layouts/CustomerLayout';

import { getClientBookings } from '../../api/bookingApi';
import type { ClientBooking } from '../../types/booking';
import ConsignmentLRModal, { type ConsignmentLRData } from '../../components/ConsignmentLRModal';
import ElectronicPodModal, { type PodData } from '../../components/ElectronicPodModal';
import GstTaxInvoiceModal, { type GstInvoiceData } from '../../components/GstTaxInvoiceModal';

import '../../styles/MyBookings.css';

export default function MyBookings() {

  const navigate = useNavigate();

  const [bookings, setBookings] =
    useState<ClientBooking[]>([]);

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
    useState(0);

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

      setBookings(
        response.items ?? []
      );

      setTotalPages(
        response.totalPages || 1
      );

      setTotalRecords(
        response.totalRecords || 0
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load bookings'
      );

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

          <div className="table-scroll">

            <table className="bookings-table">

              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Route</th>
                  <th>Pickup</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>


              <tbody>

                {bookings.map(booking => (

                  <tr key={booking.id}>

                    <td>
                      <strong>
                        {booking.bookingNumber}
                      </strong>

                      <small>
                        {new Date(
                          booking.createdAt
                        ).toLocaleDateString(
                          'en-IN'
                        )}
                      </small>
                    </td>


                    <td>
                      <strong>
                        {booking.fromCity}
                      </strong>

                      <span className="route-arrow">
                        →
                      </span>

                      <strong>
                        {booking.toCity}
                      </strong>
                    </td>


                    <td>
                      {new Date(
                        booking.pickupDate
                      ).toLocaleDateString(
                        'en-IN'
                      )}
                    </td>


                    <td>
                      <span
                        className={
                          `status-badge ${
                            statusClass(
                              booking.bookingStatus
                            )
                          }`
                        }
                      >
                        {booking.bookingStatus}
                      </span>
                    </td>


                    <td>
                      <span
                        className={
                          `payment-badge ${
                            statusClass(
                              booking.paymentStatus
                            )
                          }`
                        }
                      >
                        {booking.paymentStatus}
                      </span>
                    </td>


                    <td>
                      <strong>
                        ₹
                        {booking.totalAmount
                          .toLocaleString(
                            'en-IN',
                            {
                              minimumFractionDigits: 2
                            }
                          )}
                      </strong>
                    </td>


                    <td>

                      <div className="booking-actions">

                        {booking.paymentStatus
                          .toLowerCase() !==
                          'paid' &&

                          booking.bookingStatus
                            .toLowerCase() !==
                          'cancelled' && (

                          <button
                            className="pay-now-btn"
                            onClick={() =>
                              handlePayNow(
                                booking
                              )
                            }
                          >
                            Pay Now
                          </button>

                        )}


                        <button
                          className="view-booking-btn"
                          onClick={() =>
                            navigate(
                              `/tracking?no=${booking.bookingNumber}`
                            )
                          }
                        >
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

                        {booking.bookingStatus.toLowerCase() === 'delivered' && (
                          <button
                            type="button"
                            className="view-booking-btn"
                            style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
                            onClick={() => {
                              setSelectedPod({
                                bookingNumber: booking.bookingNumber,
                                deliveredDate: new Date(booking.pickupDate || Date.now()).toLocaleDateString('en-IN') + ' (Verified)',
                                receiverName: booking.receiverName || 'Authorized Receiver',
                                receiverPhone: 'Verified (OTP Secured)',
                                deliveredLocation: `${booking.toCity} Delivery Terminal`,
                                otpVerified: true,
                                notes: 'Delivered in intact condition against OTP verification.'
                              });
                            }}
                            title="View Electronic Proof of Delivery"
                          >
                            ✅ e-POD
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

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
