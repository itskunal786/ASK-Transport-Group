import {
  useEffect,
  useState
} from 'react';

import {
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../../api/paymentApi';

import '../../styles/Payment.css';


interface PaymentState {
  bookingNumber?: string;
  amount?: number;
}


export default function PaymentPage() {

  const navigate = useNavigate();
  const location = useLocation();

  const state =
    (location.state || {}) as PaymentState;


  const [bookingNumber, setBookingNumber] =
    useState(state.bookingNumber || '');

  const [amount, setAmount] =
    useState(state.amount || 0);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');


  useEffect(() => {

    if (state.bookingNumber) {
      setBookingNumber(
        state.bookingNumber
      );
    }

    if (state.amount) {
      setAmount(
        state.amount
      );
    }

  }, [
    state.bookingNumber,
    state.amount
  ]);


  function loadRazorpayScript() {

    return new Promise<boolean>(
      resolve => {

        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const script =
          document.createElement('script');

        script.src =
          'https://checkout.razorpay.com/v1/checkout.js';

        script.onload = () =>
          resolve(true);

        script.onerror = () =>
          resolve(false);

        document.body.appendChild(
          script
        );

      }
    );
  }


  async function handlePayment() {

    if (!bookingNumber.trim()) {

      setError(
        'Booking number is required.'
      );

      return;
    }


    try {

      setLoading(true);
      setError('');
      setSuccess('');


      const loaded =
        await loadRazorpayScript();


      if (!loaded) {

        throw new Error(
          'Unable to load Razorpay. Check your internet connection.'
        );
      }


      const order =
        await createRazorpayOrder(
          bookingNumber.trim()
        );


      const options: RazorpayOptions = {

        key:
          order.keyId,

        amount:
          order.amount,

        currency:
          order.currency,

        name:
          'ASK Transport',

        description:
          `Payment for ${order.bookingNumber}`,

        order_id:
          order.orderId,


        handler:
          async response => {

            try {

              setLoading(true);
              setError('');


              const result =
                await verifyRazorpayPayment({
                  bookingNumber:
                    order.bookingNumber,

                  razorpayOrderId:
                    response.razorpay_order_id,

                  razorpayPaymentId:
                    response.razorpay_payment_id,

                  razorpaySignature:
                    response.razorpay_signature
                });


              setSuccess(
                result.message ||
                'Payment successful'
              );


              setTimeout(() => {

                navigate(
                  '/bookings',
                  {
                    replace: true
                  }
                );

              }, 1500);


            } catch (err) {

              setError(
                err instanceof Error
                  ? err.message
                  : 'Payment verification failed.'
              );

              setLoading(false);

            }

          },


        modal: {

          ondismiss: () => {

            setLoading(false);

            setError(
              'Payment cancelled. Your booking is still unpaid.'
            );

          }

        },


        theme: {
          color: '#0b72ff'
        }

      };


      const razorpay =
        new window.Razorpay(
          options
        );


      razorpay.on(
        'payment.failed',
        response => {

          setLoading(false);

          setError(
            response.error?.description ||
            'Payment failed. Please try again.'
          );

        }
      );


      razorpay.open();


    } catch (err) {

      setLoading(false);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to start payment.'
      );

    }

  }


  return (
    <div className="payment-page">

      <div className="payment-top">

        <button
          className="payment-back"
          onClick={() =>
            navigate('/bookings')
          }
        >
          ← Back to My Bookings
        </button>

        <h1>
          Complete Payment
        </h1>

        <p>
          Pay securely using Razorpay.
        </p>

      </div>


      <div className="payment-layout">

        <div className="payment-card">

          <h2>
            Payment Details
          </h2>


          <label>
            Booking Number
          </label>

          <input
            value={bookingNumber}
            onChange={e =>
              setBookingNumber(
                e.target.value
              )
            }
            placeholder="Booking number"
            readOnly={
              !!state.bookingNumber
            }
          />


          {amount > 0 && (

            <div className="payment-amount">

              <span>
                Amount to Pay
              </span>

              <strong>
                ₹
                {amount.toLocaleString(
                  'en-IN',
                  {
                    minimumFractionDigits: 2
                  }
                )}
              </strong>

            </div>

          )}


          <div className="payment-gateway-info">

            <strong>
              Secure Online Payment
            </strong>

            <p>
              UPI, Cards, Net Banking and
              other available payment methods
              will open securely in Razorpay.
            </p>

          </div>


          {error && (

            <div className="payment-error">
              {error}
            </div>

          )}


          {success && (

            <div className="payment-success">
              ✓ {success}
            </div>

          )}


          <button
            className="pay-button"
            disabled={
              loading ||
              !bookingNumber.trim()
            }
            onClick={handlePayment}
          >

            {loading
              ? 'Opening Payment...'
              : amount > 0
                ? `Pay ₹${amount.toLocaleString(
                    'en-IN'
                  )}`
                : 'Proceed to Payment'
            }

          </button>

        </div>


        <div className="payment-summary">

          <h3>
            Secure Payment
          </h3>

          <p>
            Payment will only be marked
            successful after verification
            by ASK Transport.
          </p>


          <div className="summary-line">

            <span>
              Booking
            </span>

            <strong>
              {bookingNumber || '-'}
            </strong>

          </div>


          <div className="summary-line">

            <span>
              Status
            </span>

            <strong>
              Pending
            </strong>

          </div>


          {amount > 0 && (

            <div className="summary-line total">

              <span>
                Total
              </span>

              <strong>
                ₹
                {amount.toLocaleString(
                  'en-IN',
                  {
                    minimumFractionDigits: 2
                  }
                )}
              </strong>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}
