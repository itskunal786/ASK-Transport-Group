import {
  useEffect,
  useState
} from 'react';

import {
  getMyInvoices,
  getInvoicePdfUrl
} from '../../api/invoiceApi';

import type {
  InvoiceItem
} from '../../types/invoice';

import CustomerLayout
  from '../../layouts/CustomerLayout';

import '../../styles/Invoices.css';


export default function Invoices() {

  const [invoices, setInvoices] =
    useState<InvoiceItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  useEffect(() => {
    loadInvoices();
  }, []);


  async function loadInvoices() {
    try {
      setLoading(true);
      setError('');

      const response =
        await getMyInvoices();

      setInvoices(
        response.data?.data ?? []
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load invoices.'
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


  function formatDate(value: string) {
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


  function statusClass(
    status: string
  ) {
    return status
      .toLowerCase()
      .replaceAll(' ', '-');
  }


  async function getPdf(
    invoiceNumber: string
  ) {
    const token =
      localStorage.getItem('token');

    if (!token) {
      throw new Error(
        'Please login again.'
      );
    }

    const response =
      await fetch(
        getInvoicePdfUrl(
          invoiceNumber
        ),
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    if (!response.ok) {

      let message =
        'Could not load invoice.';

      try {

        const data =
          await response.json();

        message =
          data.message ||
          message;

      } catch {
        // keep default message
      }

      throw new Error(message);
    }

    return response.blob();
  }


  async function viewInvoice(
    invoiceNumber: string
  ) {
    try {
      setError('');

      const blob =
        await getPdf(invoiceNumber);

      const pdfBlob =
        new Blob(
          [blob],
          {
            type: 'application/pdf'
          }
        );

      const url =
        URL.createObjectURL(pdfBlob);

      window.open(
        url,
        '_blank'
      );

      setTimeout(
        () =>
          URL.revokeObjectURL(url),
        60000
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Could not open invoice.'
      );
    }
  }


  async function downloadInvoice(
    invoiceNumber: string
  ) {
    try {
      setError('');

      const blob =
        await getPdf(invoiceNumber);

      const pdfBlob =
        new Blob(
          [blob],
          {
            type: 'application/pdf'
          }
        );

      const url =
        URL.createObjectURL(pdfBlob);

      const link =
        document.createElement('a');

      link.href = url;

      link.download =
        `${invoiceNumber}.pdf`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      URL.revokeObjectURL(url);

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Could not download invoice.'
      );
    }
  }


  const paidInvoices =
    invoices.filter(
      invoice =>
        invoice.paymentStatus
          .toLowerCase() === 'paid'
    );


  const totalAmount =
    invoices.reduce(
      (total, invoice) =>
        total + invoice.totalAmount,
      0
    );


  return (
    <CustomerLayout>

      <div className="invoices-page">

        <div className="invoices-top">

          <div>

            <span className="invoices-label">
              BILLING
            </span>

            <h2>
              Invoices
            </h2>

            <p>
              View and download invoices
              for your shipments.
            </p>

          </div>


          <button
            type="button"
            className="invoice-refresh"
            onClick={loadInvoices}
            disabled={loading}
          >
            Refresh
          </button>

        </div>


        <section className="invoice-summary">

          <div className="invoice-summary-card">

            <div className="invoice-summary-icon">
              #
            </div>

            <div>
              <span>
                Total Invoices
              </span>

              <strong>
                {invoices.length}
              </strong>
            </div>

          </div>


          <div className="invoice-summary-card">

            <div className="invoice-summary-icon">
              ✓
            </div>

            <div>
              <span>
                Paid Invoices
              </span>

              <strong>
                {paidInvoices.length}
              </strong>
            </div>

          </div>


          <div className="invoice-summary-card">

            <div className="invoice-summary-icon">
              ₹
            </div>

            <div>
              <span>
                Invoice Value
              </span>

              <strong>
                {money(totalAmount)}
              </strong>
            </div>

          </div>

        </section>


        <section className="invoice-panel">

          <div className="invoice-panel-header">

            <div>

              <span>
                INVOICE HISTORY
              </span>

              <h2>
                Your Invoices
              </h2>

            </div>

          </div>


          {loading && (
            <div className="invoice-state">
              Loading invoices...
            </div>
          )}


          {!loading && error && (
            <div className="invoice-state error">
              {error}
            </div>
          )}


          {!loading &&
            !error &&
            invoices.length === 0 && (

              <div className="invoice-state">

                <h3>
                  No invoices found
                </h3>

                <p>
                  Your generated invoices
                  will appear here.
                </p>

              </div>
            )}


          {!loading &&
            !error &&
            invoices.length > 0 && (

              <div className="invoice-table-wrap">

                <table className="invoice-table">

                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Booking</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>


                  <tbody>

                    {invoices.map(
                      invoice => (

                        <tr key={invoice.id}>

                          <td>
                            <strong className="invoice-number">
                              {invoice.invoiceNumber}
                            </strong>
                          </td>


                          <td>
                            <span className="invoice-booking">
                              {invoice.bookingNumber}
                            </span>
                          </td>


                          <td>
                            {formatDate(
                              invoice.createdAt
                            )}
                          </td>


                          <td>
                            <strong className="invoice-amount">
                              {money(
                                invoice.totalAmount
                              )}
                            </strong>
                          </td>


                          <td>

                            <span
                              className={
                                'invoice-status ' +
                                statusClass(
                                  invoice.paymentStatus
                                )
                              }
                            >
                              <span className="invoice-status-dot" />

                              {invoice.paymentStatus}
                            </span>

                          </td>


                          <td>

                            <div className="invoice-actions">

                              <button
                                type="button"
                                className="invoice-view"
                                onClick={() =>
                                  viewInvoice(
                                    invoice.invoiceNumber
                                  )
                                }
                              >
                                View
                              </button>


                              <button
                                type="button"
                                className="invoice-download"
                                onClick={() =>
                                  downloadInvoice(
                                    invoice.invoiceNumber
                                  )
                                }
                              >
                                Download PDF
                              </button>

                            </div>

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
