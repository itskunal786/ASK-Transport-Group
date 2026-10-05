import './Documents.css';

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

export default function Documents() {

  const [documents, setDocuments] =
    useState<ClientDocument[]>([]);

  const [bookingNumber, setBookingNumber] =
    useState('');

  const [searchBooking, setSearchBooking] =
    useState('');

  const [documentType, setDocumentType] =
    useState('');

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(0);

  const [totalRecords, setTotalRecords] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

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

      setDocuments(
        response.data.data
      );

      setTotalPages(
        response.data.totalPages
      );

      setTotalRecords(
        response.data.totalRecords
      );

    } catch (err) {

      setDocuments([]);

      setError(
        err instanceof Error
          ? err.message
          : 'Could not load documents.'
      );

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

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Could not open document.'
      );

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

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Could not download document.'
      );

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


  const bookingDocuments =
    documents.filter(
      x =>
        x.documentType ===
        'Booking Document'
    ).length;


  const podDocuments =
    documents.filter(
      x =>
        x.documentType === 'POD'
    ).length;


  return (

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

            <div className="doc-table-wrap">

              <table className="doc-table">

                <thead>

                  <tr>

                    <th>
                      File
                    </th>

                    <th>
                      Booking
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Added on
                    </th>

                    <th className="doc-action-heading">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {documents.map(
                    document => (

                    <tr key={document.id}>

                      <td>

                        <div className="doc-file-info">

                          <div className="doc-file-icon">
                            FILE
                          </div>

                          <div>

                            <strong>
                              {document.fileName}
                            </strong>

                            <small>
                              Document #{document.id}
                            </small>

                          </div>

                        </div>

                      </td>


                      <td>

                        <span className="doc-booking">
                          {document.bookingNumber}
                        </span>

                      </td>


                      <td>

                        <span className="doc-type-badge">
                          {document.documentType}
                        </span>

                      </td>


                      <td>
                        {formatDate(
                          document.createdAt
                        )}
                      </td>


                      <td>

                        <div className="doc-row-actions">

                          <button
                            type="button"
                            onClick={() =>
                              handleView(
                                document
                              )
                            }
                            disabled={
                              actionId ===
                              document.id
                            }
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="download"
                            onClick={() =>
                              handleDownload(
                                document
                              )
                            }
                            disabled={
                              actionId ===
                              document.id
                            }
                          >
                            {actionId ===
                            document.id
                              ? 'Please wait...'
                              : 'Download'}
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

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

  );
}

