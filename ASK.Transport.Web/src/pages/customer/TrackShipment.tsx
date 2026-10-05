import { useState } from 'react';
import CustomerLayout from '../../layouts/CustomerLayout';

import {
  getShipment,
  getTimeline,
  getEta,
  type Shipment,
  type TrackingEvent,
  type Eta
} from '../../api/trackingApi';

import '../../styles/Tracking.css';

export default function TrackShipment() {

  const [trackingNumber, setTrackingNumber] = useState('');

  const [shipment, setShipment] =
    useState<Shipment | null>(null);

  const [timeline, setTimeline] =
    useState<TrackingEvent[]>([]);

  const [eta, setEta] =
    useState<Eta | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');


  async function handleTrack() {

    const number = trackingNumber.trim();

    if (!number) {
      setError('Enter tracking number.');
      return;
    }

    setLoading(true);
    setError('');
    setShipment(null);
    setTimeline([]);
    setEta(null);

    try {

      const shipmentResponse =
        await getShipment(number);

      const timelineResponse =
        await getTimeline(number);

      setShipment(shipmentResponse.data);
      setTimeline(timelineResponse.data || []);

      try {

        const etaResponse =
          await getEta(number);

        setEta(etaResponse.data);

      } catch {

        setEta(null);
      }

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to track shipment.'
      );

    } finally {

      setLoading(false);
    }
  }


  function formatDate(value?: string | null) {

    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleString(
      'en-IN',
      {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    );
  }


  function statusClass(status: string) {

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }


  return (
    <CustomerLayout>

      <div className="tracking-page">

        <section className="tracking-search-card">

          <div>

            <span className="tracking-label">
              SHIPMENT TRACKING
            </span>

            <h2>
              Track your shipment
            </h2>

            <p>
              Enter your tracking number to view
              shipment status, movement history and ETA.
            </p>

          </div>


          <div className="tracking-search">

            <input
              type="text"
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={(e) =>
                setTrackingNumber(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTrack();
                }
              }}
            />

            <button
              type="button"
              onClick={handleTrack}
              disabled={loading}
            >
              {loading
                ? 'Tracking...'
                : 'Track Shipment'}
            </button>

          </div>

        </section>


        {error && (
          <div className="tracking-error">
            {error}
          </div>
        )}


        {shipment && (

          <>

            <section className="tracking-summary">

              <div className="tracking-summary-card">

                <span>
                  Tracking Number
                </span>

                <strong>
                  {shipment.trackingNumber}
                </strong>

              </div>


              <div className="tracking-summary-card">

                <span>
                  Booking Number
                </span>

                <strong>
                  {shipment.bookingNumber}
                </strong>

              </div>


              <div className="tracking-summary-card">

                <span>
                  Current Status
                </span>

                <div
                  className={
                    `tracking-status ${statusClass(
                      shipment.status
                    )}`
                  }
                >
                  <i />
                  {shipment.status}
                </div>

              </div>


              <div className="tracking-summary-card">

                <span>
                  Estimated Delivery
                </span>

                <strong>
                  {eta?.estimatedArrivalAt
                    ? formatDate(
                        eta.estimatedArrivalAt
                      )
                    : 'Not available'}
                </strong>

              </div>

            </section>


            <div className="tracking-content">

              <section className="tracking-panel">

                <div className="tracking-panel-header">

                  <div>

                    <span>
                      MOVEMENT HISTORY
                    </span>

                    <h2>
                      Shipment Timeline
                    </h2>

                  </div>

                  <div className="tracking-current-status">
                    {shipment.status}
                  </div>

                </div>


                {timeline.length === 0 ? (

                  <div className="tracking-empty">

                    <h3>
                      No movement history yet
                    </h3>

                    <p>
                      Tracking updates will appear here
                      when the shipment starts moving.
                    </p>

                  </div>

                ) : (

                  <div className="tracking-timeline">

                    {timeline.map(
                      (item, index) => (

                        <div
                          className="tracking-event"
                          key={item.id}
                        >

                          <div className="tracking-marker">

                            <div
                              className={
                                index === 0
                                  ? 'tracking-dot active'
                                  : 'tracking-dot'
                              }
                            />

                            {index !==
                              timeline.length - 1 && (
                              <div className="tracking-line" />
                            )}

                          </div>


                          <div className="tracking-event-content">

                            <div className="tracking-event-top">

                              <strong>
                                {item.status}
                              </strong>

                              <span>
                                {formatDate(item.date)}
                              </span>

                            </div>


                            {item.location && (

                              <p className="tracking-location">
                                {item.location}
                              </p>

                            )}


                            {item.remarks && (

                              <p className="tracking-remarks">
                                {item.remarks}
                              </p>

                            )}

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>


              <aside className="tracking-side">

                <div className="tracking-info-card">

                  <span className="tracking-info-label">
                    SHIPMENT
                  </span>

                  <h3>
                    Shipment Details
                  </h3>


                  <div className="tracking-info-row">

                    <span>
                      Created
                    </span>

                    <strong>
                      {formatDate(
                        shipment.createdAt
                      )}
                    </strong>

                  </div>


                  <div className="tracking-info-row">

                    <span>
                      Last Updated
                    </span>

                    <strong>
                      {formatDate(
                        shipment.updatedAt
                      )}
                    </strong>

                  </div>


                  <div className="tracking-info-row">

                    <span>
                      Current Hub
                    </span>

                    <strong>
                      {shipment.currentHubId
                        ? `Hub ${shipment.currentHubId}`
                        : 'Not assigned'}
                    </strong>

                  </div>

                </div>


                <div className="tracking-info-card">

                  <span className="tracking-info-label">
                    ETA
                  </span>

                  <h3>
                    Delivery Estimate
                  </h3>


                  {eta ? (

                    <>

                      <div className="tracking-info-row">

                        <span>
                          Estimated Arrival
                        </span>

                        <strong>
                          {eta.estimatedArrivalAt
                            ? formatDate(
                                eta.estimatedArrivalAt
                              )
                            : 'Not available'}
                        </strong>

                      </div>


                      {eta.confidenceScore != null && (

                        <div className="tracking-info-row">

                          <span>
                            Confidence
                          </span>

                          <strong>
                            {eta.confidenceScore}%
                          </strong>

                        </div>

                      )}


                      {eta.calculationMethod && (

                        <div className="tracking-info-row">

                          <span>
                            Calculation
                          </span>

                          <strong>
                            {eta.calculationMethod}
                          </strong>

                        </div>

                      )}


                      {eta.message && (

                        <p className="tracking-eta-message">
                          {eta.message}
                        </p>

                      )}

                    </>

                  ) : (

                    <p className="tracking-eta-message">
                      ETA is not available for this
                      shipment yet.
                    </p>

                  )}

                </div>

              </aside>

            </div>

          </>

        )}

      </div>

    </CustomerLayout>
  );
}
