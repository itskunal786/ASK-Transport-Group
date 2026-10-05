import { useEffect, useState } from 'react';

import {
  getMyPayments
} from '../../api/paymentHistoryApi';

import type {
  PaymentHistoryItem
} from '../../types/payment';

import CustomerLayout from '../../layouts/CustomerLayout';

import '../../styles/payments.css';


export default function Payments() {

  const [payments, setPayments] =
    useState<PaymentHistoryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  useEffect(() => {
    loadPayments();
  }, []);


  async function loadPayments() {
    try {
      setLoading(true);
      setError('');

      const data =
        await getMyPayments();

      setPayments(data);
    } catch {
      setError(
        'Unable to load payment history.'
      );
    } finally {
      setLoading(false);
    }
  }


  function money(value: number) {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR'
      }
    ).format(value);
  }


  function formatDate(
    value?: string | null
  ) {
    if (!value) {
      return '-';
    }

    return new Date(value)
      .toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      );
  }


  const successfulPayments =
    payments.filter(
      payment =>
        payment.paymentStatus
          .toLowerCase() === 'success'
    );


  const totalPaid =
    successfulPayments.reduce(
      (total, payment) =>
        total + payment.amount,
      0
    );


  function statusClass(
    status: string
  ) {
    return status
      .toLowerCase()
      .replaceAll(' ', '-');
  }


  return (
    <CustomerLayout>

      <div className="payments-page">

        <div className="payments-top">

          <div>
            <span className="payments-label">
              BILLING
            </span>

            <h2>
              Payment Overview
            </h2>

            <p>
              Review your completed and
              recent payment transactions.
            </p>
          </div>

          <button
            type="button"
            className="payment-refresh"
            onClick={loadPayments}
            disabled={loading}
          >
            Refresh
          </button>

        </div>


        <section className="payment-summary">

          <div className="payment-summary-card">

            <div className="summary-icon">
              ₹
            </div>

            <div>
              <span>
                Total Paid
              </span>

              <strong>
                {money(totalPaid)}
              </strong>
            </div>

          </div>


          <div className="payment-summary-card">

            <div className="summary-icon">
              ✓
            </div>

            <div>
              <span>
                Successful Payments
              </span>

              <strong>
                {successfulPayments.length}
              </strong>
            </div>

          </div>


          <div className="payment-summary-card">

            <div className="summary-icon">
              #
            </div>

            <div>
              <span>
                Total Transactions
              </span>

              <strong>
                {payments.length}
              </strong>
            </div>

          </div>

        </section>


        <section className="payments-panel">

          <div className="payments-panel-header">

            <div>
              <span>
                TRANSACTIONS
              </span>

              <h2>
                Payment History
              </h2>
            </div>

          </div>


          {loading && (
            <div className="payments-state">
              Loading payments...
            </div>
          )}


          {!loading && error && (
            <div className="payments-state error">
              {error}
            </div>
          )}


          {!loading &&
            !error &&
            payments.length === 0 && (

              <div className="payments-state">

                <h3>
                  No payments found
                </h3>

                <p>
                  Your payment history
                  will appear here.
                </p>

              </div>
            )}


          {!loading &&
            !error &&
            payments.length > 0 && (

              <div className="payments-table-wrap">

                <table className="payments-table">

                  <thead>
                    <tr>
                      <th>Booking</th>
                      <th>Transaction ID</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Paid On</th>
                    </tr>
                  </thead>

                  <tbody>

                    {payments.map(
                      payment => (

                        <tr key={payment.id}>

                          <td>
                            <strong className="booking-number">
                              {payment.bookingNumber}
                            </strong>
                          </td>

                          <td>
                            <span className="transaction-id">
                              {payment.transactionId}
                            </span>
                          </td>

                          <td>
                            {payment.paymentMethod}
                          </td>

                          <td>
                            <strong className="payment-amount">
                              {money(payment.amount)}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={
                                'payment-status ' +
                                statusClass(
                                  payment.paymentStatus
                                )
                              }
                            >
                              <span className="status-dot" />

                              {payment.paymentStatus}
                            </span>
                          </td>

                          <td>
                            {formatDate(
                              payment.paidAt
                            )}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

        </section>

      </div>

    </CustomerLayout>
  );
}
