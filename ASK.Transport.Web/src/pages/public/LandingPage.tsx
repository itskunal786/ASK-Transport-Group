import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import './LandingPage.css';

interface TrackingResult {
  bookingNo: string;
  sender: string;
  receiver: string;
  origin: string;
  destination: string;
  status: 'In Transit' | 'Delivered' | 'Pending' | 'Picked Up' | 'Out for Delivery';
  eta: string;
  currentLocation: string;
  milestones: { step: string; location: string; time: string; completed: boolean }[];
}

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Hero Tabs: 'track' | 'quote'
  const [activeHeroTab, setActiveHeroTab] = useState<'track' | 'quote'>('track');

  // Quick Tracking State
  const [trackNumber, setTrackNumber] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState<TrackingResult | null>(null);
  const [trackError, setTrackError] = useState('');

  // Rate Calculator State
  const [originPincode, setOriginPincode] = useState('');
  const [destPincode, setDestPincode] = useState('');
  const [weightKg, setWeightKg] = useState('50');
  const [serviceType, setServiceType] = useState('Standard Surface');
  const [calcResult, setCalcResult] = useState<{
    baseFreight: number;
    fuelSurcharge: number;
    gst: number;
    totalAmount: number;
    estimatedDays: string;
  } | null>(null);

  // Quick Tracking submit
  function handleQuickTrack(e?: FormEvent, overrideNumber?: string) {
    if (e) e.preventDefault();
    const queryNum = overrideNumber || trackNumber;
    if (!queryNum.trim()) {
      setTrackError('Please enter a valid Booking or Tracking Number');
      return;
    }

    setTrackLoading(true);
    setTrackError('');
    setTrackResult(null);

    // Simulate / fetch tracking details
    setTimeout(() => {
      setTrackLoading(false);
      const q = queryNum.trim().toUpperCase();

      // Demo result matching realistic consignment data
      setTrackResult({
        bookingNo: q.startsWith('ASK') ? q : `ASKB-${q}`,
        sender: 'ASK Logistics Client (Delhi Hub)',
        receiver: 'Destination Consignee (Mumbai Hub)',
        origin: 'Delhi Central Hub (110001)',
        destination: 'Mumbai Nhava Sheva (400707)',
        status: 'In Transit',
        eta: 'Tomorrow, 5:30 PM',
        currentLocation: 'Jaipur Logistics Hub - Checkpoint Passed (Speed: 62 km/h)',
        milestones: [
          { step: 'Order Booked & Picked Up', location: 'Delhi Hub', time: '26 Oct, 10:30 AM', completed: true },
          { step: 'Departed Origin Hub', location: 'Delhi Hub', time: '26 Oct, 04:00 PM', completed: true },
          { step: 'In Transit (On Highway)', location: 'Jaipur Highway Checkpoint', time: '27 Oct, 06:15 AM', completed: true },
          { step: 'Arrived at Destination Hub', location: 'Mumbai Terminal', time: 'Expected 28 Oct, 09:00 AM', completed: false },
          { step: 'Out for Delivery & Handover', location: 'Consignee Doorstep', time: 'Expected 28 Oct, 05:30 PM', completed: false }
        ]
      });
    }, 500);
  }

  // Rate Calculator submit
  function handleCalculateRate(e: FormEvent) {
    e.preventDefault();
    const wt = parseFloat(weightKg) || 10;
    let ratePerKg = 18; // Base rate
    let days = '2 - 3 Days';

    if (serviceType === 'Express Cargo') {
      ratePerKg = 32;
      days = 'Next Day Delivery';
    } else if (serviceType === 'Full Truckload (FTL)') {
      ratePerKg = 12;
      days = '3 - 4 Days';
    }

    const baseFreight = Math.max(wt * ratePerKg, 450);
    const fuelSurcharge = Math.round(baseFreight * 0.10);
    const subtotal = baseFreight + fuelSurcharge;
    const gst = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + gst;

    setCalcResult({
      baseFreight,
      fuelSurcharge,
      gst,
      totalAmount,
      estimatedDays: days
    });
  }

  return (
    <div className="landing-page-wrapper">
      {/* 1. TOP NAVBAR */}
      <header className="landing-header">
        <div className="landing-nav-container">
          <Link to="/" className="landing-brand">
            <div className="landing-brand-logo">
              <span />
              <span />
              <span />
            </div>
            <div className="landing-brand-titles">
              <strong>ASK TRANSPORT</strong>
              <small>LOGISTICS &amp; SUPPLY CHAIN</small>
            </div>
          </Link>

          <nav className="landing-nav-links">
            <a href="#services">Services</a>
            <button
              type="button"
              className="landing-nav-link-btn"
              onClick={() => {
                setActiveHeroTab('quote');
                document.getElementById('tracking')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Rate Calculator
            </button>
            <a href="#network">Pan-India Network</a>
            <button
              type="button"
              className="landing-nav-link-btn"
              onClick={() => {
                setActiveHeroTab('track');
                document.getElementById('tracking')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Track Consignment
            </button>
            <a href="#about">About Us</a>
          </nav>

          <div className="landing-header-actions">
            <ThemeToggle />

            {user ? (
              <Link to="/" className="landing-btn-dashboard">
                Go to Portal &rarr;
              </Link>
            ) : (
              <>
                <Link to="/login" className="landing-btn-login">
                  Sign In
                </Link>
                <Link to="/register" className="landing-btn-register">
                  Open Account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="landing-hero-section">
        <div className="landing-hero-bg-glow" />
        <div className="landing-hero-container">
          <div className="landing-hero-content">
            <div className="landing-badge">
              <span className="badge-pulse" />
              Trusted Logistics Partner for 10,000+ Businesses Across India
            </div>
            <h1 className="landing-hero-title">
              Move Together.<br />
              <span className="highlight-text">Grow Further.</span>
            </h1>
            <p className="landing-hero-subtitle">
              Fast, secure, and digitally tracked freight transportation. Full Truckload (FTL),
              Part Truckload (PTL), and Express Cargo across 19,000+ PinCodes with real-time GPS tracking.
            </p>

            <div className="hero-cta-buttons">
              <Link to={user ? "/book" : "/login"} className="hero-btn-primary">
                📦 Book a Shipment &rarr;
              </Link>
              <button
                type="button"
                className="hero-btn-secondary"
                onClick={() => {
                  setActiveHeroTab('quote');
                  document.getElementById('tracking')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                ⚡ Calculate Tariff &rarr;
              </button>
            </div>

            <div className="landing-hero-stats">
              <div className="hero-stat-item">
                <strong>19,000+</strong>
                <span>PinCodes Covered</span>
              </div>
              <div className="hero-stat-sep" />
              <div className="hero-stat-item">
                <strong>99.4%</strong>
                <span>On-Time Delivery</span>
              </div>
              <div className="hero-stat-sep" />
              <div className="hero-stat-item">
                <strong>500+</strong>
                <span>Fleet Vehicles</span>
              </div>
            </div>
          </div>

          {/* HERO INTERACTIVE WIDGET (TRACK & CALCULATOR) */}
          <div className="landing-hero-widget-box" id="tracking">
            <div className="widget-tab-headers">
              <button
                type="button"
                className={`widget-tab-btn ${activeHeroTab === 'track' ? 'active' : ''}`}
                onClick={() => setActiveHeroTab('track')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
                Track Shipment
              </button>

              <button
                type="button"
                className={`widget-tab-btn ${activeHeroTab === 'quote' ? 'active' : ''}`}
                onClick={() => setActiveHeroTab('quote')}
                id="calculator"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <line x1="6" y1="8" x2="6" y2="8" />
                  <line x1="10" y1="8" x2="10" y2="8" />
                  <line x1="14" y1="8" x2="18" y2="8" />
                  <line x1="6" y1="12" x2="6" y2="12" />
                  <line x1="10" y1="12" x2="10" y2="12" />
                  <line x1="14" y1="12" x2="18" y2="12" />
                </svg>
                Rate Calculator
              </button>
            </div>

            <div className="widget-body">
              {activeHeroTab === 'track' ? (
                <div className="widget-track-panel">
                  <form onSubmit={handleQuickTrack} className="quick-track-form">
                    <label>Enter Waybill, Bilty, or Booking Number</label>
                    <div className="quick-track-input-group">
                      <input
                        type="text"
                        placeholder="e.g. ASKB00123 or TRK987654"
                        value={trackNumber}
                        onChange={(e) => setTrackNumber(e.target.value)}
                        required
                      />
                      <button type="submit" className="quick-track-submit-btn" disabled={trackLoading}>
                        {trackLoading ? 'Searching...' : 'Track Now →'}
                      </button>
                    </div>

                    {/* Quick Demo Pills */}
                    <div className="quick-demo-pills">
                      <span>Quick Demo:</span>
                      {['ASKB00123', 'ASKB00122', 'ASKB00121'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          className="demo-pill-btn"
                          onClick={() => {
                            setTrackNumber(num);
                            handleQuickTrack(undefined, num);
                          }}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </form>

                  {trackError && <div className="widget-alert-error">{trackError}</div>}

                  {trackResult && (
                    <div className="widget-track-result-card">
                      <div className="track-res-header">
                        <div>
                          <span className="track-res-label">WAYBILL NO.</span>
                          <h4>{trackResult.bookingNo}</h4>
                        </div>
                        <span className="track-res-badge status-in-transit">{trackResult.status}</span>
                      </div>

                      <div className="track-res-route">
                        <div className="track-point">
                          <small>ORIGIN</small>
                          <strong>{trackResult.origin}</strong>
                        </div>
                        <div className="track-arrow">➔</div>
                        <div className="track-point">
                          <small>DESTINATION</small>
                          <strong>{trackResult.destination}</strong>
                        </div>
                      </div>

                      <div className="track-res-loc-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>Current Checkpoint: <strong>{trackResult.currentLocation}</strong></span>
                      </div>

                      <div className="track-res-milestones">
                        {trackResult.milestones.map((m, idx) => (
                          <div key={idx} className={`milestone-item ${m.completed ? 'completed' : 'upcoming'}`}>
                            <div className="milestone-dot" />
                            <div className="milestone-text">
                              <span className="milestone-title">{m.step}</span>
                              <span className="milestone-sub">{m.location} • {m.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="widget-quote-panel">
                  <form onSubmit={handleCalculateRate} className="quick-quote-form">
                    <div className="quote-grid-2">
                      <div className="quote-field">
                        <label>Pickup PinCode</label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 110001 (Delhi)"
                          value={originPincode}
                          onChange={(e) => setOriginPincode(e.target.value)}
                          required
                        />
                      </div>
                      <div className="quote-field">
                        <label>Delivery PinCode</label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 400001 (Mumbai)"
                          value={destPincode}
                          onChange={(e) => setDestPincode(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="quote-grid-2">
                      <div className="quote-field">
                        <label>Weight (kg)</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="50"
                          value={weightKg}
                          onChange={(e) => setWeightKg(e.target.value)}
                          required
                        />
                      </div>
                      <div className="quote-field">
                        <label>Service Mode</label>
                        <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                          <option>Standard Surface</option>
                          <option>Express Cargo</option>
                          <option>Full Truckload (FTL)</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="quick-quote-submit-btn">
                      Calculate Instant Estimate &rarr;
                    </button>
                  </form>

                  {calcResult && (
                    <div className="widget-quote-result-card">
                      <div className="quote-res-row">
                        <span>Base Freight ({weightKg} kg):</span>
                        <strong>₹{calcResult.baseFreight.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="quote-res-row">
                        <span>Fuel Surcharge &amp; Handling:</span>
                        <strong>₹{calcResult.fuelSurcharge.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="quote-res-row">
                        <span>GST (18%):</span>
                        <strong>₹{calcResult.gst.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="quote-res-total">
                        <div>
                          <span>Estimated Cost</span>
                          <h3>₹{calcResult.totalAmount.toLocaleString('en-IN')}</h3>
                        </div>
                        <div className="quote-eta-badge">
                          <span>Transit Time</span>
                          <strong>{calcResult.estimatedDays}</strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="quote-book-cta-btn"
                        onClick={() => navigate(user ? '/book' : '/login')}
                      >
                        {user ? 'Proceed to Book Now →' : 'Sign In to Book with this Rate →'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE SERVICES SECTION */}
      <section className="landing-services-section" id="services">
        <div className="landing-section-container">
          <div className="landing-section-header">
            <span className="section-tag">COMPREHENSIVE LOGISTICS</span>
            <h2>Our Core Transport Solutions</h2>
            <p>From single pallet parcels to dedicated multi-axle freight containers across India.</p>
          </div>

          <div className="services-cards-grid">
            <div className="service-card">
              <div className="service-icon-wrap icon-ftl">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <h3>Full Truckload (FTL)</h3>
              <p>Dedicated direct point-to-point vehicles for high-volume commercial shipments. Zero handling transshipments.</p>
              <ul className="service-perks">
                <li>✓ 32ft MXL, 24ft, 14ft &amp; 19ft Available</li>
                <li>✓ Dedicated GPS Tracking &amp; Seal Locks</li>
                <li>✓ Direct Transit without En-route Offloading</li>
              </ul>
            </div>

            <div className="service-card highlight-card">
              <div className="service-badge-popular">Most Popular</div>
              <div className="service-icon-wrap icon-ptl">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3>Part Truckload (PTL / LTL)</h3>
              <p>Cost-effective consolidation for small to medium cargo. Pay only for the space and weight your goods occupy.</p>
              <ul className="service-perks">
                <li>✓ Regular Scheduled Departures</li>
                <li>✓ Automated Barcode &amp; Consignment Tracking</li>
                <li>✓ Safe Hub Consolidation &amp; Delivery</li>
              </ul>
            </div>

            <div className="service-card">
              <div className="service-icon-wrap icon-express">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3>Express Air &amp; Surface Cargo</h3>
              <p>Time-critical deliveries with guaranteed dispatch windows and priority hub clearance for urgent consignments.</p>
              <ul className="service-perks">
                <li>✓ 24-48 Hours Express Delivery to Metros</li>
                <li>✓ Priority Handling &amp; SMS/Email Alerts</li>
                <li>✓ Fragile &amp; High-Value Freight Security</li>
              </ul>
            </div>

            <div className="service-card">
              <div className="service-icon-wrap icon-wh">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 7v14M21 7v14M6 3h12l3 4H3l3-4zM9 10h6M9 14h6M9 18h6" />
                </svg>
              </div>
              <h3>Warehousing &amp; 3PL Solutions</h3>
              <p>Grade-A modern storage, inventory management, palletizing, order fulfillment, and last-mile distribution.</p>
              <ul className="service-perks">
                <li>✓ 24/7 CCTV &amp; Temperature Controlled</li>
                <li>✓ Barcode Inventory Management</li>
                <li>✓ Reverse Logistics &amp; Return Processing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PAN-INDIA NETWORK & HUBS */}
      <section className="landing-network-section" id="network">
        <div className="landing-section-container">
          <div className="landing-section-header">
            <span className="section-tag">NATIONWIDE REACH</span>
            <h2>Pan-India Logistics Infrastructure</h2>
            <p>Strategically located central hubs ensuring seamless interstate freight transit.</p>
          </div>

          <div className="network-grid">
            <div className="network-hub-card">
              <div className="hub-header">
                <div className="hub-badge-circle">NORTH</div>
                <h4>Delhi NCR &amp; Jaipur Central Hub</h4>
              </div>
              <p>Key transit gateway connecting Punjab, Haryana, Rajasthan, Uttar Pradesh &amp; Jammu.</p>
              <div className="hub-stats">
                <span>Coverage: <strong>120+ Daily Routes</strong></span>
                <span>Hub Space: <strong>85,000 sq.ft</strong></span>
              </div>
            </div>

            <div className="network-hub-card">
              <div className="hub-header">
                <div className="hub-badge-circle">WEST</div>
                <h4>Mumbai &amp; Ahmedabad Terminal</h4>
              </div>
              <p>Port connectivity via Nhava Sheva (JNPT) and express freight corridor linking Gujarat &amp; Maharashtra.</p>
              <div className="hub-stats">
                <span>Coverage: <strong>180+ Daily Routes</strong></span>
                <span>Hub Space: <strong>1,10,000 sq.ft</strong></span>
              </div>
            </div>

            <div className="network-hub-card">
              <div className="hub-header">
                <div className="hub-badge-circle">SOUTH</div>
                <h4>Bengaluru, Chennai &amp; Hyderabad</h4>
              </div>
              <p>Tech and manufacturing logistics corridor serving Karnataka, Tamil Nadu, Andhra Pradesh &amp; Kerala.</p>
              <div className="hub-stats">
                <span>Coverage: <strong>150+ Daily Routes</strong></span>
                <span>Hub Space: <strong>95,000 sq.ft</strong></span>
              </div>
            </div>

            <div className="network-hub-card">
              <div className="hub-header">
                <div className="hub-badge-circle">EAST</div>
                <h4>Kolkata &amp; Patna Logistics Park</h4>
              </div>
              <p>Connecting Eastern and North-Eastern economic zones, West Bengal, Bihar, Odisha &amp; Assam.</p>
              <div className="hub-stats">
                <span>Coverage: <strong>90+ Daily Routes</strong></span>
                <span>Hub Space: <strong>60,000 sq.ft</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE ASK TRANSPORT */}
      <section className="landing-why-section" id="about">
        <div className="landing-section-container">
          <div className="why-content-split">
            <div className="why-text">
              <span className="section-tag">THE ASK ADVANTAGE</span>
              <h2>Built for Enterprise Reliability &amp; Transparency</h2>
              <p>
                We eliminate the uncertainty of freight transport with digital milestones,
                automated billing, zero-hidden costs, and dedicated relationship managers for every booking.
              </p>

              <div className="why-features-list">
                <div className="why-feature-item">
                  <div className="why-icon">📡</div>
                  <div>
                    <h4>Live GPS Telematics on Every Truck</h4>
                    <p>Track your truck's real-time coordinates, average speed, and estimated time of arrival 24/7.</p>
                  </div>
                </div>

                <div className="why-feature-item">
                  <div className="why-icon">📄</div>
                  <div>
                    <h4>Instant Digital POD &amp; E-Invoices</h4>
                    <p>Proof of Delivery (POD) uploaded within 2 hours of delivery with instant GST-compliant PDF invoices.</p>
                  </div>
                </div>

                <div className="why-feature-item">
                  <div className="why-icon">🛡️</div>
                  <div>
                    <h4>Comprehensive Transit Insurance</h4>
                    <p>All consignments backed by comprehensive carrier risk cover and verified background-checked drivers.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="why-banner-card">
              <div className="why-cta-box">
                <h3>Ready to streamline your logistics?</h3>
                <p>Open an enterprise account today or talk to our logistics coordinator for bulk contract pricing.</p>
                <div className="why-cta-actions">
                  <Link to="/register" className="why-cta-primary">
                    Create Free Account &rarr;
                  </Link>
                  <a href="tel:+919876543210" className="why-cta-secondary">
                    Call: +91 98765 43210
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="landing-footer">
        <div className="landing-footer-container">
          <div className="footer-col-brand">
            <div className="landing-brand">
              <div className="landing-brand-logo">
                <span />
                <span />
                <span />
              </div>
              <div className="landing-brand-titles">
                <strong>ASK TRANSPORT</strong>
                <small>GROUP OF COMPANIES</small>
              </div>
            </div>
            <p className="footer-brand-desc">
              India's premier technology-driven multimodal logistics and surface transportation enterprise.
              Registered GSTIN &amp; IBA Approved.
            </p>
            <div className="footer-contact-item">
              <span>Email: support@askgroup.com</span>
              <span>Head Office: NH-8 Logistics Hub, Gurugram, Haryana - 122001</span>
            </div>
          </div>

          <div className="footer-col">
            <h5>Solutions</h5>
            <ul>
              <li><a href="#services">Full Truckload (FTL)</a></li>
              <li><a href="#services">Part Truckload (PTL)</a></li>
              <li><a href="#services">Express Cargo</a></li>
              <li><a href="#services">Warehousing &amp; 3PL</a></li>
              <li><a href="#calculator">Freight Estimator</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Customer Access</h5>
            <ul>
              <li><Link to="/login">Client Portal Login</Link></li>
              <li><Link to="/register">Create Enterprise Account</Link></li>
              <li><a href="#tracking">Track Consignment</a></li>
              <li><Link to="/support">Support &amp; Helpdesk</Link></li>
              <li><Link to="/admin">Admin Operations</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#about">About ASK Group</a></li>
              <li><a href="#network">Our Hubs &amp; Network</a></li>
              <li><a href="#services">Fleet Specifications</a></li>
              <li><a href="#about">Privacy Policy &amp; Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} ASK Transport Group. All Rights Reserved. Move Together. Grow Further.</p>
          <div className="footer-bottom-links">
            <span>ISO 9001:2015 Certified</span>
            <span>•</span>
            <span>IBA Approved Carrier</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
