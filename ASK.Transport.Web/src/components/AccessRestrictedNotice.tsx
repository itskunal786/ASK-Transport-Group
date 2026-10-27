import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AccessRestrictedNotice.css';

interface AccessRestrictedNoticeProps {
  moduleName: string;
  moduleDesc?: string;
}

export default function AccessRestrictedNotice({
  moduleName,
  moduleDesc
}: AccessRestrictedNoticeProps) {
  const { user } = useAuth();

  return (
    <div className="access-restricted-container">
      <div className="access-restricted-card">
        {/* TOP SHIELD ICON */}
        <div className="access-shield-icon-wrap">
          <svg
            width="54"
            height="54"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* STATUS PILL */}
        <div className="access-status-pill">
          <span className="pill-dot" />
          Approval Pending • Basic Access Only
        </div>

        {/* HEADLINE */}
        <h1 className="access-restricted-title">
          {moduleName} Is Currently Restricted
        </h1>

        {moduleDesc && (
          <p className="access-module-desc">{moduleDesc}</p>
        )}

        {/* NOTICE EXPLANATION */}
        <div className="access-notice-box">
          <div className="access-notice-header">
            <strong>⚠️ Security Notice &amp; Role Clearance:</strong>
          </div>
          <p>
            Namaste <strong>{user?.name || 'Shipper'}</strong>, aapka account successfully registered hai. Hamari security policy ke tahat naye accounts ko shuruat mein sirf <strong>Shipment Booking</strong> aur <strong>Live Tracking</strong> ka access diya jata hai.
          </p>
          <p style={{ marginTop: '8px' }}>
            <strong>Payments, GST Invoices, aur Regulatory Documents</strong> access karne ke liye <strong>Admin</strong> ya <strong>Super Admin</strong> dwara role verification &amp; approval required hai. Approval milte hi yeh module auto-unlock ho jayega.
          </p>
        </div>

        {/* ALLOWED QUICK ACTIONS */}
        <div className="access-allowed-heading">
          Aap abhi in features ko bina kisi rukawat ke use kar sakte hain:
        </div>

        <div className="access-actions-grid">
          <Link to="/book" className="access-action-card primary">
            <div className="action-card-icon">📦</div>
            <div>
              <strong>Book a Shipment</strong>
              <small>Doorstep pickup and national FTL/PTL booking</small>
            </div>
            <span className="action-arrow">→</span>
          </Link>

          <Link to="/tracking" className="access-action-card">
            <div className="action-card-icon">🔍</div>
            <div>
              <strong>Track Consignments</strong>
              <small>Live GPS telematics and milestone updates</small>
            </div>
            <span className="action-arrow">→</span>
          </Link>

          <Link to="/bookings" className="access-action-card">
            <div className="action-card-icon">📋</div>
            <div>
              <strong>My Bookings</strong>
              <small>Review your existing order history and status</small>
            </div>
            <span className="action-arrow">→</span>
          </Link>
        </div>

        {/* HELPDESK FOOTER */}
        <div className="access-helpdesk-footer">
          <div>
            <strong>Need Immediate Full Role Access for Commercial Billing?</strong>
            <p>Admin team se sampark karein account clearance approve karwane ke liye:</p>
          </div>
          <div className="helpdesk-contact-pills">
            <a href="tel:+919876543210" className="helpdesk-pill">
              📞 +91 98765 43210
            </a>
            <Link to="/support" className="helpdesk-pill support-desk">
              💬 Support Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
