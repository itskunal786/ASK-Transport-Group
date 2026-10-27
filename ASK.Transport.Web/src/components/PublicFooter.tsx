import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
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
            Registered GSTIN &amp; IBA Approved Carrier.
          </p>
          <div className="footer-contact-item">
            <span>Email: support@asktransport.com</span>
            <span>Head Office: NH-8 Central Logistics Corridor, Gurugram, Haryana - 122001</span>
          </div>
        </div>

        <div className="footer-col">
          <h5>Solutions</h5>
          <ul>
            <li><Link to="/services">Full Truckload (FTL)</Link></li>
            <li><Link to="/services">Part Truckload (PTL)</Link></li>
            <li><Link to="/services">Express Cargo</Link></li>
            <li><Link to="/services">Warehousing &amp; 3PL</Link></li>
            <li><Link to="/book">Bulk Excel Booking</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Customer Access</h5>
          <ul>
            <li><Link to="/login">Client Portal Login</Link></li>
            <li><Link to="/register">Create Enterprise Account</Link></li>
            <li><Link to="/tracking">Track Consignment</Link></li>
            <li><Link to="/support">Support &amp; Helpdesk</Link></li>
            <li><Link to="/login?portal=admin">Admin Operations</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Company</h5>
          <ul>
            <li><Link to="/about">About ASK Group</Link></li>
            <li><Link to="/services">Fleet Specifications</Link></li>
            <li><Link to="/about#pillars">Our Regional Hubs</Link></li>
            <li><Link to="/about#certifications">IBA &amp; ISO Certifications</Link></li>
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
  );
}
