import {
  useEffect,
  useState,
  type FormEvent
} from 'react';

import {
  Link
} from 'react-router-dom';

import {
  createBooking,
  getTransportServices
} from '../../api/createBookingApi';

import type {
  CreatedBooking,
  TransportService
} from '../../types/createBooking';


import {
  getPinCode
} from '../../api/pinCodeApi';

import type {
  PinCodeDetails
} from '../../types/pinCode';

export default function BookShipment() {

  const [step, setStep] = useState(1);

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

    if (pin.length !== 6) {
      return;
    }

    try {

      setPickupPinLoading(true);

      const data =
        await getPinCode(pin);

      if (!data.serviceable) {

        setPickupPinError(
          'Pickup service is not available for this PIN code.'
        );

        return;
      }

      setPickupLocation(data);

    } catch {

      setPickupPinError(
        'PIN code not available in service database.'
      );

    } finally {

      setPickupPinLoading(false);
    }
  }


  async function checkDeliveryPin(pin: string) {

    setDeliveryLocation(null);
    setDeliveryPinError('');

    if (pin.length !== 6) {
      return;
    }

    try {

      setDeliveryPinLoading(true);

      const data =
        await getPinCode(pin);

      if (!data.serviceable) {

        setDeliveryPinError(
          'Delivery service is not available for this PIN code.'
        );

        return;
      }

      setDeliveryLocation(data);

    } catch {

      setDeliveryPinError(
        'PIN code not available in service database.'
      );

    } finally {

      setDeliveryPinLoading(false);
    }
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
      <div className="booking-page">

        <header className="booking-topbar">

          <Link
            className="booking-brand"
            to="/"
          >
            <div className="booking-brand-logo">
              <span />
              <span />
              <span />
            </div>

            <div>
              <strong>
                ASK TRANSPORT
              </strong>

              <small>
                LOGISTICS
              </small>
            </div>
          </Link>


          <Link
            className="back-dashboard"
            to="/"
          >
            Dashboard
          </Link>

        </header>


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


          <div className="success-actions">

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
              Pay Later
            </Link>

            <Link
              className="success-secondary"
              to="/"
            >
              Back to Dashboard
            </Link>

          </div>

        </main>

      </div>
    );
  }


  return (
    <div className="booking-page">

      <header className="booking-topbar">

        <Link
          className="booking-brand"
          to="/"
        >
          <div className="booking-brand-logo">
            <span />
            <span />
            <span />
          </div>

          <div>
            <strong>
              ASK TRANSPORT
            </strong>

            <small>
              LOGISTICS
            </small>
          </div>
        </Link>


        <Link
          className="back-dashboard"
          to="/"
        >
          Back to Dashboard
        </Link>

      </header>


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
                to="/"
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
                  disabled={submitting}
                >
                  {submitting
                    ? 'Creating Booking...'
                    : 'Confirm Booking'}
                </button>

              )}

            </div>

          </div>

        </form>

      </main>

    </div>
  );
}


