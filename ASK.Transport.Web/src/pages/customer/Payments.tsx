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

  // Shipper Wallet & B2B Credit Ledger State
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('ask_shipper_wallet_bal');
    return saved ? parseFloat(saved) : 24500;
  });
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('5000');
  const [creditLimit] = useState(150000);
  const [usedCredit] = useState(45200);
  const availableCredit = creditLimit - usedCredit;

  function handleTopUp(e: React.FormEvent) {
    e.preventDefault();
    const add = parseFloat(topUpAmount) || 0;
    if (add <= 0) return;
    const newBal = walletBalance + add;
    setWalletBalance(newBal);
    localStorage.setItem('ask_shipper_wallet_bal', newBal.toString());
    setShowTopUpModal(false);
    alert(`✓ ₹${add.toLocaleString('en-IN')} successfully credited to your Shipper Wallet via instant UPI!`);
  }


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


        <section className="payment-summary" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>

          {/* 1. SHIPPER PREPAID WALLET */}
          <div className="payment-summary-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <div className="summary-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
              💳
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#166534', fontWeight: 700 }}>Shipper Wallet</span>
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(true)}
                  style={{ padding: '2px 8px', fontSize: '11px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}
                >
                  + Top-up
                </button>
              </div>
              <strong style={{ color: '#15803d', fontSize: '20px' }}>
                ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
              <small style={{ color: '#166534', fontSize: '10px' }}>Instant 0-Fee 1-Click Booking</small>
            </div>
          </div>

          {/* 2. 15-DAY CORPORATE CREDIT LINE */}
          <div className="payment-summary-card" style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}>
            <div className="summary-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
              📑
            </div>
            <div>
              <span style={{ color: '#6d28d9', fontWeight: 700 }}>15-Day Corporate Credit</span>
              <strong style={{ color: '#5b21b6', fontSize: '20px' }}>
                ₹{availableCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
              <small style={{ color: '#6d28d9', fontSize: '10px' }}>
                Limit: ₹1,50,000 | Used: ₹{usedCredit.toLocaleString('en-IN')} (Due 10 Nov)
              </small>
            </div>
          </div>

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

      {showTopUpModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }} onClick={() => setShowTopUpModal(false)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '460px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>💳 Top-Up Shipper Wallet</h3>
              <button
                type="button"
                onClick={() => setShowTopUpModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              Add funds directly into your instant zero-fee corporate prepaid wallet using UPI or NetBanking.
            </p>

            <form onSubmit={handleTopUp}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Enter Top-Up Amount (₹)
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={topUpAmount}
                  onChange={e => setTopUpAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #cbd5e1', borderRadius: '8px', fontSize: '16px', fontWeight: 800, boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                {['2000', '5000', '10000', '25000'].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: topUpAmount === amt ? '#16a34a' : '#cbd5e1',
                      background: topUpAmount === amt ? '#dcfce7' : '#ffffff',
                      color: topUpAmount === amt ? '#166534' : '#475569'
                    }}
                  >
                    +₹{parseInt(amt).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  style={{ padding: '8px 16px', background: '#e2e8f0', color: '#334155', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: '#16a34a', color: '#ffffff', borderRadius: '6px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  ✓ Confirm Instant Top-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </CustomerLayout>
  );
}
