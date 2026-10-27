import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';
import './LandingPage.css';

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-page-wrapper">
      <PublicNavbar />

      {/* HERO SECTION FOR ABOUT */}
      <section className="landing-hero-section" style={{ padding: '60px 24px 70px' }}>
        <div className="landing-hero-bg-glow" />
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div className="landing-badge">
            <span className="badge-pulse" />
            ISO 9001:2015 CERTIFIED &amp; IBA APPROVED CARRIER
          </div>
          <h1 className="landing-hero-title" style={{ fontSize: '3rem', marginBottom: '16px' }}>
            Transforming Indian Logistics Through <br />
            <span className="highlight-text">Technology, Speed &amp; Integrity</span>
          </h1>
          <p className="landing-hero-subtitle" style={{ maxWidth: '780px', margin: '0 auto 32px', fontSize: '1.15rem' }}>
            At ASK Transport Group, we bridge the gap between businesses and their destinations across India.
            Operating over 500 dedicated commercial vehicles across 19,000+ PinCodes, we deliver certainty,
            transparency, and digital excellence to supply chains nationwide.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="hero-btn-primary">
              Open Enterprise Account &rarr;
            </Link>
            <Link to="/services" className="hero-btn-secondary">
              Explore Our Fleet Solutions &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* KEY METRICS BANNER */}
      <section style={{ background: 'var(--color-bg-secondary, #f8fafc)', padding: '40px 24px', borderTop: '1px solid var(--color-border, #e2e8f0)', borderBottom: '1px solid var(--color-border, #e2e8f0)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', textAlign: 'center' }}>
          <div>
            <strong style={{ fontSize: '2.4rem', color: '#0284c7', display: 'block', fontWeight: 900 }}>19,000+</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary, #64748b)', fontWeight: 600 }}>PinCodes Serviced Across India</span>
          </div>
          <div>
            <strong style={{ fontSize: '2.4rem', color: '#10b981', display: 'block', fontWeight: 900 }}>99.4%</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary, #64748b)', fontWeight: 600 }}>On-Time Transit SLA Guaranteed</span>
          </div>
          <div>
            <strong style={{ fontSize: '2.4rem', color: '#f59e0b', display: 'block', fontWeight: 900 }}>500+</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary, #64748b)', fontWeight: 600 }}>GPS Sat-Nav Freight Trucks</span>
          </div>
          <div>
            <strong style={{ fontSize: '2.4rem', color: '#8b5cf6', display: 'block', fontWeight: 900 }}>10,000+</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary, #64748b)', fontWeight: 600 }}>Corporate &amp; MSME Clients</span>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section style={{ padding: '70px 24px', background: 'var(--color-bg-primary, #ffffff)' }} id="mission">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px' }}>
          <div style={{
            background: 'var(--color-bg-card, #ffffff)',
            padding: '36px',
            borderRadius: '16px',
            border: '1px solid var(--color-border, #e2e8f0)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '14px' }}>🎯</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 12px 0', color: 'var(--color-text-primary, #0f172a)' }}>
              Our Core Mission
            </h3>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary, #475569)', fontSize: '0.95rem' }}>
              To engineer the most reliable, accountable, and technologically transparent road freight network
              in India. We eliminate supply chain blind spots through automated milestone tracking, electronic
              consignment bilty notes, instant e-POD verifications, and zero-compromise driver safety.
            </p>
          </div>

          <div style={{
            background: 'var(--color-bg-card, #ffffff)',
            padding: '36px',
            borderRadius: '16px',
            border: '1px solid var(--color-border, #e2e8f0)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '14px' }}>👁️</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 12px 0', color: 'var(--color-text-primary, #0f172a)' }}>
              Our Strategic Vision
            </h3>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary, #475569)', fontSize: '0.95rem' }}>
              To be India's benchmark multimodal logistics enterprise by 2030, empowering manufacturers,
              e-commerce pioneers, and FMCG distributors with seamless logistics automation, green freight
              corridors, and unmatched customer satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* FOUR PILLARS */}
      <section style={{ padding: '70px 24px', background: 'var(--color-bg-secondary, #f8fafc)', borderTop: '1px solid var(--color-border, #e2e8f0)' }} id="pillars">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-tag">WHY ENTERPRISES TRUST US</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text-primary, #0f172a)', margin: '8px 0' }}>
              The Four Pillars of ASK Excellence
            </h2>
            <p style={{ color: 'var(--color-text-secondary, #64748b)', fontSize: '1rem' }}>
              How we guarantee speed, security, and precision on every single shipment.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            <div className="service-card">
              <div className="service-icon-wrap icon-ftl">📡</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>100% GPS Satellite Tracking</h3>
              <p>Every commercial vehicle in our fleet is synced with 5G NavIC satellite telemetry for real-time highway corridor visibility.</p>
            </div>

            <div className="service-card">
              <div className="service-icon-wrap icon-ptl">📄</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Instant Digital LR &amp; e-POD</h3>
              <p>Government Form No. 5 Consignment Note generation with QR authentication and delivery OTP seals on completion.</p>
            </div>

            <div className="service-card">
              <div className="service-icon-wrap icon-express">🛡️</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Comprehensive Transit Cover</h3>
              <p>Full carrier risk coverage with verified background-checked commercial heavy drivers for total cargo peace of mind.</p>
            </div>

            <div className="service-card">
              <div className="service-icon-wrap icon-wh">🏭</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>National Mega-Hub Network</h3>
              <p>Over 3,50,000 sq.ft of modern Grade-A sorting terminals located across Delhi, Mumbai, Bengaluru, Kolkata and Ahmedabad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: '60px 24px', background: 'var(--color-bg-primary, #ffffff)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', borderRadius: '16px', padding: '40px 36px', color: '#ffffff', textAlign: 'center', boxShadow: '0 12px 30px rgba(2,132,199,0.3)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 12px 0' }}>
            Ready to Upgrade Your Enterprise Logistics?
          </h2>
          <p style={{ color: '#e0f2fe', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto 28px' }}>
            Sign up for a business account today to access custom corporate freight tariffs, B2B bulk bookings, and dedicated account management.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '12px 28px', background: '#ffffff', color: '#0284c7', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
              Create Business Account &rarr;
            </Link>
            <Link to="/services" style={{ padding: '12px 24px', border: '1px solid rgba(255,255,255,0.4)', color: '#ffffff', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
              View Fleet Services &rarr;
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
