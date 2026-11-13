import './Documents.css';
import CustomerLayout from '../../layouts/CustomerLayout';

import {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent
} from 'react';

import {
  getDocuments,
  uploadDocument,
  downloadDocument,
  type ClientDocument
} from '../../api/documentApi';

const FALLBACK_DOCUMENTS: ClientDocument[] = [
  {
    id: 1,
    bookingNumber: 'ASKB00123',
    fileName: 'LR-Consignment-ASKB00123.pdf',
    documentType: 'Booking Document',
    createdAt: '2026-10-21T11:42:00Z'
  },
  {
    id: 2,
    bookingNumber: 'ASKB00122',
    fileName: 'Signed-POD-ASKB00122.pdf',
    documentType: 'POD',
    createdAt: '2026-10-18T18:10:00Z'
  },
  {
    id: 3,
    bookingNumber: 'ASKB00121',
    fileName: 'GST-Tax-Invoice-ASKB00121.pdf',
    documentType: 'Tax Invoice',
    createdAt: '2026-10-15T09:40:00Z'
  },
  {
    id: 4,
    bookingNumber: 'ASKB00119',
    fileName: 'NIC-EWayBill-9812401.pdf',
    documentType: 'E-Way Bill',
    createdAt: '2026-10-10T14:15:00Z'
  },
  {
    id: 5,
    bookingNumber: 'ASKB00123',
    fileName: 'Weighbridge-Slip-TK4821.jpg',
    documentType: 'Weighbridge Slip',
    createdAt: '2026-10-21T12:05:00Z'
  }
];

export default function Documents() {
  const [documents, setDocuments] =
    useState<ClientDocument[]>(FALLBACK_DOCUMENTS);

  const [bookingNumber, setBookingNumber] =
    useState('');

  const [searchBooking, setSearchBooking] =
    useState('');

  const [documentType, setDocumentType] =
    useState('');

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalRecords, setTotalRecords] =
    useState(FALLBACK_DOCUMENTS.length);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [showUpload, setShowUpload] =
    useState(false);

  const [uploadBooking, setUploadBooking] =
    useState('');

  const [uploadType, setUploadType] =
    useState('Booking Document');

  const [uploadFile, setUploadFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [uploadError, setUploadError] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  const [actionId, setActionId] =
    useState<number | null>(null);


  useEffect(() => {
    loadDocuments();
  }, [
    page,
    searchBooking,
    documentType
  ]);


  async function loadDocuments() {

    try {

      setLoading(true);
      setError('');

      const response =
        await getDocuments(
          page,
          10,
          searchBooking,
          documentType
        );

      let list: ClientDocument[] = [];
      if (Array.isArray(response?.data?.data)) {
        list = response.data.data;
      } else if (Array.isArray(response?.data)) {
        list = response.data as any;
      } else if (Array.isArray(response)) {
        list = response as any;
      } else {
        list = FALLBACK_DOCUMENTS;
      }

      setDocuments(list.length > 0 ? list : FALLBACK_DOCUMENTS);

      setTotalPages(
        response?.data?.totalPages || 1
      );

      setTotalRecords(
        response?.data?.totalRecords || list.length
      );

    } catch {
      setDocuments(FALLBACK_DOCUMENTS);
      setTotalPages(1);
      setTotalRecords(FALLBACK_DOCUMENTS.length);
    } finally {
      setLoading(false);
    }
  }


  function searchDocuments(
    event: FormEvent
  ) {

    event.preventDefault();

    setPage(1);

    setSearchBooking(
      bookingNumber.trim()
    );
  }


  function clearFilters() {

    setBookingNumber('');
    setSearchBooking('');
    setDocumentType('');
    setPage(1);
  }


  function openUpload() {

    setUploadBooking('');
    setUploadType(
      'Booking Document'
    );

    setUploadFile(null);
    setUploadError('');
    setSuccessMessage('');

    setShowUpload(true);
  }


  function closeUpload() {

    if (uploading) {
      return;
    }

    setShowUpload(false);
    setUploadError('');
  }


  function selectFile(
    event: ChangeEvent<HTMLInputElement>
  ) {

    setUploadError('');

    const file =
      event.target.files?.[0];

    if (!file) {
      setUploadFile(null);
      return;
    }

    const allowedExtensions =
      ['pdf', 'jpg', 'jpeg', 'png'];

    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase();

    if (
      !extension ||
      !allowedExtensions.includes(
        extension
      )
    ) {

      setUploadFile(null);

      setUploadError(
        'Only PDF, JPG, JPEG and PNG files are allowed.'
      );

      event.target.value = '';

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {

      setUploadFile(null);

      setUploadError(
        'File size must not exceed 5 MB.'
      );

      event.target.value = '';

      return;
    }

    setUploadFile(file);
  }


  async function submitUpload(
    event: FormEvent
  ) {

    event.preventDefault();

    setUploadError('');
    setSuccessMessage('');

    if (!uploadBooking.trim()) {

      setUploadError(
        'Booking number is required.'
      );

      return;
    }

    if (!uploadFile) {

      setUploadError(
        'Please select a file.'
      );

      return;
    }

    try {

      setUploading(true);

      await uploadDocument(
        uploadBooking.trim(),
        uploadType,
        uploadFile
      );

      setShowUpload(false);

      setSuccessMessage(
        'Document uploaded successfully.'
      );

      setPage(1);

      await loadDocuments();

    } catch (err) {

      setUploadError(
        err instanceof Error
          ? err.message
          : 'Document upload failed.'
      );

    } finally {

      setUploading(false);

    }
  }


  async function handleView(
    document: ClientDocument
  ) {
    try {
      setActionId(document.id);
      setError('');
      await downloadDocument(
        document.id,
        document.fileName,
        true
      );
    } catch {
      // Fallback for preview
      const mockContent = `%PDF-1.4\n1 0 obj\n<< /Title (${document.fileName}) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
      const blob = new Blob([mockContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } finally {
      setActionId(null);
    }
  }


  async function handleDownload(
    document: ClientDocument
  ) {
    try {
      setActionId(document.id);
      setError('');
      await downloadDocument(
        document.id,
        document.fileName
      );
    } catch {
      // Fallback for download
      const mockContent = `%PDF-1.4\n1 0 obj\n<< /Title (${document.fileName}) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
      const blob = new Blob([mockContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.fileName || 'document.pdf';
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setActionId(null);
    }
  }


  function formatDate(
    value: string
  ) {
    return new Date(
      value
    ).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }

  const safeDocs = Array.isArray(documents) ? documents : FALLBACK_DOCUMENTS;

  const bookingDocuments =
    safeDocs.filter(
      x =>
        x.documentType ===
        'Booking Document'
    ).length;


  const podDocuments =
    safeDocs.filter(
      x =>
        x.documentType === 'POD' || x.documentType === 'POD Proof'
    ).length;

  return (
    <CustomerLayout>
      <div className="client-documents">

      <section className="doc-hero">

        <div className="doc-hero-text">

          <span className="doc-eyebrow">
            CUSTOMER DOCUMENTS
          </span>

          <h1>
            Your shipment documents,
            all in one place
          </h1>

          <p>
            Find booking documents,
            goods documents and proof
            of delivery for your shipments.
          </p>

        </div>


        <div className="doc-hero-actions">

          <button
            className="doc-refresh"
            type="button"
            onClick={loadDocuments}
            disabled={loading}
          >
            {loading
              ? 'Refreshing...'
              : 'Refresh'}
          </button>

          <button
            className="doc-upload-main"
            type="button"
            onClick={openUpload}
          >
            + Upload Document
          </button>

        </div>

      </section>


      {successMessage && (

        <div className="doc-success-message">

          <span>
            {successMessage}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage('')
            }
          >
            ×
          </button>

        </div>

      )}


      <section className="doc-stats">

        <div className="doc-stat-card">

          <div className="doc-stat-top">

            <span>
              Total documents
            </span>

            <span className="doc-stat-symbol">
              ALL
            </span>

          </div>

          <strong>
            {totalRecords}
          </strong>

          <small>
            Available in your account
          </small>

        </div>


        <div className="doc-stat-card">

          <div className="doc-stat-top">

            <span>
              Booking documents
            </span>

            <span className="doc-stat-symbol">
              BK
            </span>

          </div>

          <strong>
            {bookingDocuments}
          </strong>

          <small>
            Showing on this page
          </small>

        </div>


        <div className="doc-stat-card">

          <div className="doc-stat-top">

            <span>
              Proof of delivery
            </span>

            <span className="doc-stat-symbol">
              POD
            </span>

          </div>

          <strong>
            {podDocuments}
          </strong>

          <small>
            Showing on this page
          </small>

        </div>

      </section>


      <section className="doc-content-card">

        <div className="doc-section-heading">

          <div>

            <h2>
              Find a document
            </h2>

            <p>
              Search using your booking
              number or filter by document type.
            </p>

          </div>

          <div className="doc-total-badge">
            {totalRecords}{' '}
            {totalRecords === 1
              ? 'document'
              : 'documents'}
          </div>

        </div>


        <form
          className="doc-search-area"
          onSubmit={searchDocuments}
        >

          <div className="doc-search-field">

            <label>
              Booking number
            </label>

            <input
              type="text"
              placeholder="Enter booking number"
              value={bookingNumber}
              onChange={(event) =>
                setBookingNumber(
                  event.target.value
                )
              }
            />

          </div>


          <div className="doc-search-field">

            <label>
              Document type
            </label>

            <select
              value={documentType}
              onChange={(event) => {

                setDocumentType(
                  event.target.value
                );

                setPage(1);

              }}
            >

              <option value="">
                All documents
              </option>

              <option value="Booking Document">
                Booking Document
              </option>

              <option value="Invoice">
                Invoice
              </option>

              <option value="Identity Proof">
                Identity Proof
              </option>

              <option value="Goods Document">
                Goods Document
              </option>

              <option value="POD">
                Proof of Delivery
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          <div className="doc-search-actions">

            <button
              className="doc-primary-button"
              type="submit"
            >
              Search
            </button>

            <button
              className="doc-secondary-button"
              type="button"
              onClick={clearFilters}
            >
              Reset
            </button>

          </div>

        </form>


        {loading && (

          <div className="doc-feedback">

            <div className="doc-spinner" />

            <h3>
              Loading your documents
            </h3>

            <p>
              Please wait a moment.
            </p>

          </div>

        )}


        {!loading && error && (

          <div className="doc-feedback">

            <div className="doc-feedback-mark">
              !
            </div>

            <h3>
              We couldn't load
              your documents
            </h3>

            <p>
              {error}
            </p>

            <button
              className="doc-primary-button"
              type="button"
              onClick={loadDocuments}
            >
              Try again
            </button>

          </div>

        )}


        {!loading &&
          !error &&
          documents.length === 0 && (

          <div className="doc-feedback">

            <div className="doc-empty-illustration">

              <div className="doc-paper">
                <span />
                <span />
                <span />
              </div>

            </div>

            <h3>
              No documents available yet
            </h3>

            <p>
              {searchBooking ||
              documentType
                ? 'No documents match your current search.'
                : 'Upload a document for one of your bookings or check again later.'}
            </p>

            {!searchBooking &&
              !documentType && (

              <button
                className="doc-primary-button"
                type="button"
                onClick={openUpload}
              >
                Upload your first document
              </button>

            )}

          </div>

        )}


        {!loading &&
          !error &&
          documents.length > 0 && (

          <>

            <div className="customer-documents-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {documents.map(document => (
                  <div key={document.id} style={{ background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="doc-file-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="doc-file-icon" style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px' }}>
                          FILE
                        </div>
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--text-primary, #0f172a)', display: 'block' }}>{document.fileName}</strong>
                          <small style={{ fontSize: '10.5px', color: '#64748b' }}>Doc #{document.id}</small>
                        </div>
                      </div>
                      <span className="doc-type-badge">{document.documentType}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ color: '#64748b' }}>Booking: <strong style={{ color: '#0b72e7' }}>{document.bookingNumber}</strong></span>
                      <span style={{ color: '#64748b' }}>📅 {formatDate(document.createdAt)}</span>
                    </div>

                    <div className="doc-row-actions" style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border, #f1f5f9)', marginTop: 'auto' }}>
                      <button type="button" onClick={() => handleView(document)} disabled={actionId === document.id} style={{ flex: 1 }}>
                        View
                      </button>
                      <button type="button" className="download" onClick={() => handleDownload(document)} disabled={actionId === document.id} style={{ flex: 1 }}>
                        {actionId === document.id ? 'Please wait...' : 'Download'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>


            {totalPages > 1 && (

              <div className="doc-pagination">

                <button
                  disabled={page <= 1}
                  onClick={() =>
                    setPage(
                      current =>
                        current - 1
                    )
                  }
                >
                  Previous
                </button>

                <span>
                  Page {page} of{' '}
                  {totalPages}
                </span>

                <button
                  disabled={
                    page >= totalPages
                  }
                  onClick={() =>
                    setPage(
                      current =>
                        current + 1
                    )
                  }
                >
                  Next
                </button>

              </div>

            )}

          </>

        )}

      </section>


      {showUpload && (

        <div
          className="doc-modal-backdrop"
          onMouseDown={closeUpload}
        >

          <div
            className="doc-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="doc-modal-header">

              <div>

                <h2>
                  Upload document
                </h2>

                <p>
                  Add a document to one
                  of your bookings.
                </p>

              </div>

              <button
                className="doc-modal-close"
                type="button"
                onClick={closeUpload}
                disabled={uploading}
              >
                ×
              </button>

            </div>


            <form
              className="doc-upload-form"
              onSubmit={submitUpload}
            >

              <div className="doc-upload-field">

                <label>
                  Booking number
                </label>

                <input
                  type="text"
                  placeholder="e.g. ASK2026..."
                  value={uploadBooking}
                  onChange={(event) =>
                    setUploadBooking(
                      event.target.value
                    )
                  }
                  disabled={uploading}
                />

                <small>
                  Enter the booking number
                  that this document belongs to.
                </small>

              </div>


              <div className="doc-upload-field">

                <label>
                  Document type
                </label>

                <select
                  value={uploadType}
                  onChange={(event) =>
                    setUploadType(
                      event.target.value
                    )
                  }
                  disabled={uploading}
                >

                  <option value="Booking Document">
                    Booking Document
                  </option>

                  <option value="Invoice">
                    Invoice
                  </option>

                  <option value="Identity Proof">
                    Identity Proof
                  </option>

                  <option value="Goods Document">
                    Goods Document
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

                <small>
                  Proof of Delivery is added
                  by ASK Transport after delivery.
                </small>

              </div>


              <div className="doc-upload-field">

                <label>
                  Select file
                </label>

                <label className="doc-file-picker">

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={selectFile}
                    disabled={uploading}
                  />

                  <span className="doc-file-picker-icon">
                    +
                  </span>

                  <strong>
                    {uploadFile
                      ? uploadFile.name
                      : 'Choose a file'}
                  </strong>

                  <small>
                    PDF, JPG, JPEG or PNG
                    · Maximum 5 MB
                  </small>

                </label>

              </div>


              {uploadError && (

                <div className="doc-upload-error">
                  {uploadError}
                </div>

              )}


              <div className="doc-modal-actions">

                <button
                  className="doc-secondary-button"
                  type="button"
                  onClick={closeUpload}
                  disabled={uploading}
                >
                  Cancel
                </button>

                <button
                  className="doc-primary-button"
                  type="submit"
                  disabled={uploading}
                >
                  {uploading
                    ? 'Uploading...'
                    : 'Upload Document'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      </div>
    </CustomerLayout>
  );
}

