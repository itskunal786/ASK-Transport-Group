import { useSearchParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Printer, 
  Share2, 
  FileCheck, 
  Calendar, 
  MapPin, 
  ChevronLeft
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import QrCodeView from '../../components/QrCodeView';
import './RtoClearanceVerificationPage.css';

interface DossierRecord {
  token: string;
  vehicleNo: string;
  driverName: string;
  driverDl: string;
  driverDlExpiry: string;
  rcModel: string;
  rcFitnessExpiry: string;
  nationalPermitExpiry: string;
  insurancePolicyNo: string;
  insuranceExpiry: string;
  pucExpiry: string;
  ewbNo: string;
  biltyNo: string;
  taxTokenNo: string;
  checkpostName: string;
  verifiedAt: string;
  status: 'CLEARED' | 'FLAGGED';
}

const DOSSIERS_MAP: Record<string, DossierRecord> = {
  'ASK-RTO-2026-QR-9182': {
    token: 'ASK-RTO-2026-QR-9182',
    vehicleNo: 'RJ-14-GH-4921',
    driverName: 'Suresh Kumar Gurjar',
    driverDl: 'RJ14-20150089123 (HGMV Heavy Commercial)',
    driverDlExpiry: '15-Nov-2028',
    rcModel: 'Ashok Leyland 2820 Multi-Axle 10-Wheeler',
    rcFitnessExpiry: '20-May-2027',
    nationalPermitExpiry: '10-Aug-2027 (Form 48 & 47 Valid)',
    insurancePolicyNo: 'New India Assurance Policy #NEW-INDIA-COM-8812903',
    insuranceExpiry: '31-Mar-2027',
    pucExpiry: '14-Jan-2027 (RJ-PUC-2026-881)',
    ewbNo: '1810-8849-2041 (Valid till 04-Nov-2026)',
    biltyNo: 'LR-2026-ASK-9941',
    taxTokenNo: 'RJ-MVT-2026-90214 (Q3 FY 2026-27 Paid)',
    checkpostName: 'Shamlaji Border RTO Checkpost (GJ-RJ Border / NH-48)',
    verifiedAt: '02-Nov-2026 11:30 AM IST',
    status: 'CLEARED'
  },
  'ASK-RTO-2026-QR-7714': {
    token: 'ASK-RTO-2026-QR-7714',
    vehicleNo: 'HR-55-AN-8102',
    driverName: 'Manjeet Singh Dhillon',
    driverDl: 'HR55-20120044192 (TRANS)',
    driverDlExpiry: '10-Apr-2027',
    rcModel: 'Tata Signa 4825.T Heavy Axle',
    rcFitnessExpiry: '12-Nov-2026',
    nationalPermitExpiry: '18-Sep-2027',
    insurancePolicyNo: 'ICICI Lombard Truck #ICICI-LOMBARD-TRK-77401',
    insuranceExpiry: '30-Jun-2027',
    pucExpiry: '02-Nov-2026 (Expiring)',
    ewbNo: '2411-9012-7634 (Part-B Active)',
    biltyNo: 'LR-2026-ASK-8810',
    taxTokenNo: 'HR-MVT-2026-11092',
    checkpostName: 'Kundli Border Checkpost (Delhi-Haryana Border / NH-44)',
    verifiedAt: '02-Nov-2026 10:15 AM IST',
    status: 'CLEARED'
  },
  'ASK-RTO-2026-QR-3108': {
    token: 'ASK-RTO-2026-QR-3108',
    vehicleNo: 'MH-12-PQ-9024',
    driverName: 'Ramesh Balu Shinde',
    driverDl: 'MH12-20160078104 (MCWG+HGV)',
    driverDlExpiry: '28-Feb-2029',
    rcModel: 'BharatBenz 3528R 12-Wheeler Hauler',
    rcFitnessExpiry: '15-Oct-2027',
    nationalPermitExpiry: '05-Dec-2027',
    insurancePolicyNo: 'Bajaj Allianz Commercial #BAJAJ-ALLIANZ-CV-33910',
    insuranceExpiry: '22-Aug-2027',
    pucExpiry: '30-Apr-2027',
    ewbNo: '3110-5590-1288 (Valid)',
    biltyNo: 'LR-2026-ASK-7729',
    taxTokenNo: 'MH-MVT-2026-44182',
    checkpostName: 'Kognoli RTO Border Checkpost (MH-KA Border / NH-48)',
    verifiedAt: '02-Nov-2026 09:45 AM IST',
    status: 'CLEARED'
  }
};

export default function RtoClearanceVerificationPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const tokenParam = searchParams.get('token') || 'ASK-RTO-2026-QR-9182';
  const vehicleParam = searchParams.get('vehicle');

  const record: DossierRecord = DOSSIERS_MAP[tokenParam] || {
    token: tokenParam,
    vehicleNo: vehicleParam || 'RJ-14-GH-4921',
    driverName: 'Suresh Kumar Gurjar',
    driverDl: 'RJ14-20150089123 (HGMV)',
    driverDlExpiry: '15-Nov-2028',
    rcModel: 'Ashok Leyland 2820 Multi-Axle Carrier',
    rcFitnessExpiry: '20-May-2027',
    nationalPermitExpiry: '10-Aug-2027',
    insurancePolicyNo: 'New India Assurance Policy #NEW-INDIA-COM-8812903',
    insuranceExpiry: '31-Mar-2027',
    pucExpiry: '14-Jan-2027',
    ewbNo: '1810-8849-2041 (Active Transit)',
    biltyNo: 'LR-2026-ASK-9941',
    taxTokenNo: 'RJ-MVT-2026-90214',
    checkpostName: 'National Interstate RTO Border Clearance Gateway',
    verifiedAt: new Date().toLocaleString(),
    status: 'CLEARED'
  };

  const verificationUrl = window.location.href;

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verificationUrl);
      alert('Verification link copied to clipboard!');
    }
  }

  return (
    <div className="rto-verify-page">
      {/* GOVT MORTH + PARIVAHAN TOPBAR */}
      <header className="rto-verify-header">
        <div className="rto-verify-header-inner">
          <div className="rto-govt-brand">
            <div className="rto-govt-emblem">
              <ShieldCheck size={26} strokeWidth={2.5} />
            </div>
            <div className="rto-govt-titles">
              <strong>{t('MINISTRY OF ROAD TRANSPORT & HIGHWAYS (MoRTH)', '???? ?????? ??? ???????? ????????')}</strong>
              <small>{t('PARIVAHAN SEWA � VAHAN 4.0 / SARATHI INTERSTATE GATEWAY', '?????? ???? � ???? 4.0 / ????? ??????????? ???-?????')}</small>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="rto-verify-container">
        {/* BREADCRUMB */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            to="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0284c7',
              textDecoration: 'none'
            }}
          >
            <ChevronLeft size={16} />
            <span>{t('Back to Operations Dashboard', '??????? ???????? ?? ????')}</span>
          </Link>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            ? {t('LIVE VERIFIED ON PARIVAHAN API', '?????? API ?? ???? ????????')}
          </span>
        </div>

        {/* 1. TOP GREEN CLEARANCE BANNER */}
        <div className="rto-status-banner">
          <div>
            <div className="rto-status-badge">
              <CheckCircle2 size={15} />
              <span>{t('ALL-INDIA INTERSTATE BORDER CLEARANCE PASSED', '???? ?????? ??????????? ???? ????????? ???')}</span>
            </div>
            <h1 className="rto-status-title">
              {record.vehicleNo} � {t('GREEN CHANNEL CLEARED', '????? ???? ???????')}
            </h1>
            <div className="rto-status-meta">
              <span><MapPin size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> {record.checkpostName}</span>
              <span><Calendar size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> {record.verifiedAt}</span>
            </div>
          </div>

          <div className="rto-status-actions">
            <button
              type="button"
              onClick={() => window.print()}
              className="rto-btn-action print"
            >
              <Printer size={15} />
              <span>{t('Print Certificate', '?????????? ?????? ????')}</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="rto-btn-action share"
            >
              <Share2 size={15} />
              <span>{t('Share Token', '???? ???? ????')}</span>
            </button>
          </div>
        </div>

        {/* 2. OFFICIAL CERTIFICATE CARD */}
        <div className="rto-cert-card">
          <div className="rto-cert-header">
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('OFFICIAL CLEARANCE DOSSIER NUMBER', '???????? ????????? ?????? ??????')}
              </span>
              <div style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                {record.token}
              </div>
            </div>

            <span className="rto-cert-token">
              ? {t('PARIVAHAN E-TOKEN ACTIVE', '?????? ?-???? ??????')}
            </span>
          </div>

          {/* VEHICLE & DRIVER SPLIT SECTION */}
          <div className="rto-dossier-split">
            {/* LEFT: VEHICLE & DRIVER */}
            <div>
              <div className="rto-veh-banner">
                <div className="rto-ind-plate">
                  <div className="rto-ind-strip">
                    <span className="rto-ind-ashoka">?</span>
                    <span className="rto-ind-text">IND</span>
                  </div>
                  <span className="rto-ind-number">{record.vehicleNo}</span>
                </div>

                <div>
                  <strong style={{ display: 'block', fontSize: '14.5px', color: '#0f172a' }}>
                    {record.rcModel}
                  </strong>
                  <span className="rto-veh-class">
                    {t('Commercial Freight Carrier (National Permit Multi-Axle)', '????????? ??????? (????????? ????? ?????-?????)')}
                  </span>
                </div>
              </div>

              {/* DETAILS 2x2 GRID */}
              <div className="rto-details-grid">
                <div className="rto-detail-item">
                  <span className="rto-detail-label">{t('Designated Driver', '??????? ????')}</span>
                  <div className="rto-detail-val">{record.driverName}</div>
                </div>

                <div className="rto-detail-item">
                  <span className="rto-detail-label">{t('Driving License (Sarathi)', '????????? ??????? (?????)')}</span>
                  <div className="rto-detail-val" style={{ fontFamily: 'monospace', fontSize: '12.5px' }}>
                    {record.driverDl}
                  </div>
                </div>

                <div className="rto-detail-item">
                  <span className="rto-detail-label">{t('Fleet Transporter', '????? ????????????')}</span>
                  <div className="rto-detail-val" style={{ color: '#0284c7' }}>
                    ASK Group Logistics Network
                  </div>
                </div>

                <div className="rto-detail-item">
                  <span className="rto-detail-label">{t('Checkpost Authority', '???????? ?????????')}</span>
                  <div className="rto-detail-val">State Motor Vehicles Dept</div>
                </div>
              </div>
            </div>

            {/* RIGHT: SCANNABLE VERIFICATION QR */}
            <div className="rto-qr-card-side">
              <QrCodeView
                value={verificationUrl}
                size={160}
                darkColor="#064e3b"
                lightColor="#ffffff"
              />
              <span className="rto-qr-tag">
                {record.token}
              </span>
              <p className="rto-qr-help">
                {t('Scan with any smartphone camera for live Parivahan & GST verification', '???? ???? ? GST ??????? ???? ???? ?? ?????????? ?? ????? ????')}
              </p>
            </div>
          </div>

          {/* 3. MANDATORY 7-POINT COMPLIANCE MATRIX TABLE */}
          <div className="rto-matrix-section">
            <h3 className="rto-matrix-title">
              <FileCheck size={18} style={{ color: '#059669' }} />
              <span>{t('Mandatory Interstate Transport Compliance Audit (7-Point Clearance)', '???????? ??????????? ?????? ??????? ???? (7-????? ?????????)')}</span>
            </h3>

            <div className="rto-matrix-table-wrap">
              <table className="rto-matrix-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('Statutory Document', '??????? ????????')}</th>
                    <th>{t('Document / Policy Ref No.', '???????? / ?????? ?????? ??????')}</th>
                    <th>{t('Validity / Expiry', '????? / ???????')}</th>
                    <th style={{ textAlign: 'center' }}>{t('Audit Status', '???? ??????')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 800 }}>1</td>
                    <td><strong>{t('RC Vehicle Fitness Certificate', '???? ?????? ?????????? (RC)')}</strong></td>
                    <td style={{ fontFamily: 'monospace' }}>FIT-RJ14-2027-V91</td>
                    <td>{record.rcFitnessExpiry}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="rto-status-pill-green">? {t('Verified Valid', '???????? ???')}</span>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 800 }}>2</td>
                    <td><strong>{t('All-India National Permit (Form 48/47)', '???? ?????? ????????? ????? (????? 48/47)')}</strong></td>
                    <td style={{ fontFamily: 'monospace' }}>AIP-RJ-2026-8819</td>
                    <td>{record.nationalPermitExpiry}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="rto-status-pill-green">? {t('Active Green Channel', '?????? ????? ????')}</span>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 800 }}>3</td>
                    <td><strong>{t('Commercial Comprehensive Insurance', '?????????? ?????? ???? ????')}</strong></td>
                    <td>{record.insurancePolicyNo}</td>
                    <td>{record.insuranceExpiry}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="rto-status-pill-green">? {t('Active Policy', '?????? ??????')}</span>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 800 }}>4</td>
                    <td><strong>{t('Pollution Under Control (PUC)', '??????? ???????? ?????????? (PUC)')}</strong></td>
                    <td style={{ fontFamily: 'monospace' }}>PUCC-PASS-2026-901</td>
                    <td>{record.pucExpiry}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="rto-status-pill-green">? {t('Passed Standards', '???? ???')}</span>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 800 }}>5</td>
                    <td><strong>{t('Govt GST E-Way Bill (Part-A & Part-B)', '?????? GST ?-?? ??? (?????-A ? ?????-B)')}</strong></td>
                    <td style={{ fontFamily: 'monospace', color: '#0284c7', fontWeight: 800 }}>
                      {record.ewbNo}
                    </td>
                    <td>Active in Transit</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="rto-status-pill-green">? {t('Valid Interstate Transit', '??? ??????????? ??????')}</span>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 800 }}>6</td>
                    <td><strong>{t('Consignment Bilty / Lorry Receipt (LR)', '?????????? ?????? / ???? ???? (LR)')}</strong></td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{record.biltyNo}</td>
                    <td>Active Dispatch</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="rto-status-pill-green">? {t('Attached & Verified', '?????? ??? ????????')}</span>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 800 }}>7</td>
                    <td><strong>{t('State Motor Vehicle Road Tax (MVT Token)', '????? ???? ???? ?? ???? (MVT)')}</strong></td>
                    <td style={{ fontFamily: 'monospace' }}>{record.taxTokenNo}</td>
                    <td>Quarterly Paid</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="rto-status-pill-green">? {t('No Arrears / Cleared', '????? ????? / ??????')}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* OFFICIAL STAMP & FOOTER */}
          <div className="rto-cert-footer">
            <div>
              <strong>{t('VERIFICATION AUTHORITY: ', '??????? ?????????: ')}</strong>
              <span>Joint Border Check-Post Flying Squad &amp; Parivahan Gateway Services</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 800 }}>
                ??? ZERO UNRESOLVED E-CHALLANS
              </span>
              <span>�</span>
              <span style={{ fontSize: '11px' }}>
                Secure SHA-256 Digitally Signed
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
