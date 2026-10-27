import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';
import './LandingPage.css';

export default function ServicesPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-page-wrapper">
      <PublicNavbar />

      {/* SERVICES HERO */}
      <section className="landing-hero-section" style={{ padding: '60px 24px 60px' }}>
        <div className="landing-hero-bg-glow" />
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div className="landing-badge">
            <span className="badge-pulse" />
            END-TO-END FREIGHT &amp; SUPPLY CHAIN SOLUTIONS
          </div>
          <h1 className="landing-hero-title" style={{ fontSize: '3rem', marginBottom: '16px' }}>
            Comprehensive Multimodal Freight <br />
            <span className="highlight-text">Tailored for Every Business Need</span>
          </h1>
          <p className="landing-hero-subtitle" style={{ maxWidth: '760px', margin: '0 auto 32px', fontSize: '1.15rem' }}>
            From single pallet parcels and bulk LTL consignments to dedicated 32ft multi-axle freight containers,
            ASK Transport provides unmatched reliability, SLA guarantees, and live GPS tracking across India.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/book" className="hero-btn-primary">
              📦 Book a Consignment &rarr;
            </Link>
            <Link to="/register" className="hero-btn-secondary">
              Open Corporate Account &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES DETAILED GRID */}
      <section style={{ padding: '60px 24px 80px', background: 'var(--color-bg-primary, #ffffff)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px' }}>
          
          {/* Service 1: FTL */}
          <div className="service-card" style={{ padding: '32px' }}>
            <div className="service-icon-wrap icon-ftl">🚛</div>
            <h3 style={{ fontSize: '1.35rem', margin: '14px 0 8px' }}>Full Truckload (FTL)</h3>
            <p style={{ lineHeight: 1.6, color: 'var(--color-text-secondary, #64748b)', marginBottom: '18px' }}>
              Dedicated direct point-to-point vehicles for high-volume commercial shipments. Zero intermediate handling, zero offloading risk, and direct highway corridor transit.
            </p>
            <ul className="service-perks" style={{ marginBottom: '24px' }}>
              <li>✓ 32ft Multi-Axle (MXL - 18 to 24 MT capacity)</li>
              <li>✓ 24ft &amp; 19ft Closed Heavy Containers</li>
              <li>✓ Dedicated Sat-Nav GPS Tracking &amp; Electronic Seal Locks</li>
              <li>✓ Guaranteed Direct Point-to-Point Transit</li>
            </ul>
            <Link to="/book" className="hero-btn-primary" style={{ display: 'block', textAlign: 'center', padding: '10px 16px', fontSize: '0.88rem' }}>
              Book FTL Shipment &rarr;
            </Link>
          </div>

          {/* Service 2: PTL */}
          <div className="service-card highlight-card" style={{ padding: '32px' }}>
            <div className="service-badge-popular">Cost Effective</div>
            <div className="service-icon-wrap icon-ptl">📦</div>
            <h3 style={{ fontSize: '1.35rem', margin: '14px 0 8px' }}>Part Truckload (PTL / LTL)</h3>
            <p style={{ lineHeight: 1.6, color: 'var(--color-text-secondary, #64748b)', marginBottom: '18px' }}>
              Cost-effective cargo consolidation for small to medium freight batches. Pay only for the space and weight your goods occupy, with daily scheduled departures.
            </p>
            <ul className="service-perks" style={{ marginBottom: '24px' }}>
              <li>✓ Regular Scheduled Hub Departures Across India</li>
              <li>✓ Automated Barcode &amp; Consignment Tracking</li>
              <li>✓ Secure Hub Consolidation &amp; Doorstep Delivery</li>
              <li>✓ Transparent Per-KG Weight &amp; Volume Pricing</li>
            </ul>
            <Link to="/book" className="hero-btn-primary" style={{ display: 'block', textAlign: 'center', padding: '10px 16px', fontSize: '0.88rem' }}>
              Book PTL Cargo &rarr;
            </Link>
          </div>

          {/* Service 3: Express */}
          <div className="service-card" style={{ padding: '32px' }}>
            <div className="service-icon-wrap icon-express">⚡</div>
            <h3 style={{ fontSize: '1.35rem', margin: '14px 0 8px' }}>Express Priority Cargo</h3>
            <p style={{ lineHeight: 1.6, color: 'var(--color-text-secondary, #64748b)', marginBottom: '18px' }}>
              Time-critical deliveries with guaranteed dispatch windows and priority terminal clearance for urgent industrial spare parts, electronics, and medical goods.
            </p>
            <ul className="service-perks" style={{ marginBottom: '24px' }}>
              <li>✓ 24 to 48 Hours Guaranteed Metro Express</li>
              <li>✓ Priority Hub Clearance &amp; Rapid Dispatch</li>
              <li>✓ Real-Time SMS &amp; Email Delivery Alerts</li>
              <li>✓ Dedicated Express Support Desk</li>
            </ul>
            <Link to="/book" className="hero-btn-primary" style={{ display: 'block', textAlign: 'center', padding: '10px 16px', fontSize: '0.88rem' }}>
              Book Express Priority &rarr;
            </Link>
          </div>

          {/* Service 4: Bulk CSV Upload */}
          <div className="service-card" style={{ padding: '32px' }}>
            <div className="service-icon-wrap icon-ftl">📑</div>
            <h3 style={{ fontSize: '1.35rem', margin: '14px 0 8px' }}>B2B Bulk CSV Bookings</h3>
            <p style={{ lineHeight: 1.6, color: 'var(--color-text-secondary, #64748b)', marginBottom: '18px' }}>
              Enterprise portal feature allowing corporate dispatch teams to upload hundreds of consignments simultaneously via Excel/CSV with instant automated LR generation.
            </p>
            <ul className="service-perks" style={{ marginBottom: '24px' }}>
              <li>✓ 1-Click Excel / CSV Consignment Parser</li>
              <li>✓ Instant Indian PIN Code &amp; Phone Validation</li>
              <li>✓ Bulk Digital Bilty / LR Generation</li>
              <li>✓ Single Monthly GST Consolidated Billing</li>
            </ul>
            <Link to="/book" className="hero-btn-primary" style={{ display: 'block', textAlign: 'center', padding: '10px 16px', fontSize: '0.88rem' }}>
              Try Bulk CSV Upload &rarr;
            </Link>
          </div>

          {/* Service 5: Warehousing */}
          <div className="service-card" style={{ padding: '32px' }}>
            <div className="service-icon-wrap icon-wh">🏭</div>
            <h3 style={{ fontSize: '1.35rem', margin: '14px 0 8px' }}>Warehousing &amp; 3PL Fulfillment</h3>
            <p style={{ lineHeight: 1.6, color: 'var(--color-text-secondary, #64748b)', marginBottom: '18px' }}>
              Over 3,50,000 sq.ft of Grade-A modern warehousing infrastructure with automated inventory management, pallet racking, order packing, and reverse logistics.
            </p>
            <ul className="service-perks" style={{ marginBottom: '24px' }}>
              <li>✓ 24/7 CCTV &amp; Temperature Controlled Storage</li>
              <li>✓ Barcode Inventory &amp; Stock Level Alerts</li>
              <li>✓ Pick, Pack &amp; Last-Mile Handover</li>
              <li>✓ Seamless Reverse Logistics &amp; Returns</li>
            </ul>
            <Link to="/register" className="hero-btn-primary" style={{ display: 'block', textAlign: 'center', padding: '10px 16px', fontSize: '0.88rem' }}>
              Request 3PL Proposal &rarr;
            </Link>
          </div>

          {/* Service 6: Live Sat-Nav Telematics */}
          <div className="service-card" style={{ padding: '32px' }}>
            <div className="service-icon-wrap icon-ftl">🛰️</div>
            <h3 style={{ fontSize: '1.35rem', margin: '14px 0 8px' }}>Live GPS Telematics &amp; e-POD</h3>
            <p style={{ lineHeight: 1.6, color: 'var(--color-text-secondary, #64748b)', marginBottom: '18px' }}>
              Enterprise freight visibility platform providing interactive highway route maps, live speed meters, cold chain temperature monitors, and digital OTP delivery receipts.
            </p>
            <ul className="service-perks" style={{ marginBottom: '24px' }}>
              <li>✓ Interactive Satellite Highway Route Tracker</li>
              <li>✓ Dynamic Arrival ETA with High Confidence Scores</li>
              <li>✓ Secure OTP-Protected Delivery Handover</li>
              <li>✓ Downloadable Official Form No. 5 Bilty Lorry Receipt</li>
            </ul>
            <Link to="/tracking" className="hero-btn-primary" style={{ display: 'block', textAlign: 'center', padding: '10px 16px', fontSize: '0.88rem' }}>
              Track Live Shipment &rarr;
            </Link>
          </div>

        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
