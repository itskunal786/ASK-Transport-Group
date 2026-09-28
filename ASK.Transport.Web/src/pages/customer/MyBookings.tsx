import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getClientBookings } from '../../api/bookingApi';
import type { ClientBooking } from '../../types/booking';

import '../../styles/MyBookings.css';

export default function MyBookings() {

  const navigate = useNavigate();

  const [bookings, setBookings] =
    useState<ClientBooking[]>([]);

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
                              `/bookings/${
                                booking.bookingNumber
                              }`
                            )
                          }
                        >
                          View
                        </button>

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

    </div>
  );
}
