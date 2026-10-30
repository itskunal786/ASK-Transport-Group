import { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  Lock,
  MessageCircle,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import type { ShareableTrackingSession } from '../types/transportOperations';
import { generateWhatsAppTrackSession } from '../api/customerDirectoryApi';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  consignmentNo: string;
  defaultReceiverName?: string;
  defaultReceiverPhone?: string;
  routeInfo?: string;
}

export default function WhatsAppTrackShareModal({
  isOpen,
  onClose,
  consignmentNo,
  defaultReceiverName = '',
  defaultReceiverPhone = '',
  routeInfo = 'Delhi NCR → Mumbai SuperHub'
}: Props) {
  const { t } = useLanguage();
  const [receiverName, setReceiverName] = useState(defaultReceiverName);
  const [receiverPhone, setReceiverPhone] = useState(defaultReceiverPhone);
  const [session, setSession] = useState<ShareableTrackingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  if (!isOpen) return null;

  const handleGenerateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await generateWhatsAppTrackSession(
        consignmentNo,
        receiverPhone || '9876543210',
        receiverName || 'Recipient Partner'
      );
      setSession(result);
    } catch {
      // Local fallback session
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      const token = `trk-tok-${Date.now()}`;
      setSession({
        id: `sess-${Date.now()}`,
        consignmentNo,
        secureAccessPin: pin,
        shareToken: token,
        publicUrlSlug: `https://asktransport.in/track/share?token=${token}`,
        receiverPartyName: receiverName || 'Consignee Receiver',
        receiverPhone: receiverPhone || '+91 98000 00000',
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
        isActive: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!session) return;
    const text = `${session.publicUrlSlug}&pin=${session.secureAccessPin}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPin = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.secureAccessPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    if (!session) return;
    const cleanPhone = receiverPhone.replace(/\D/g, '');
    const phoneParam = cleanPhone.length >= 10 ? (cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone) : '';
    const shareMessage = `📦 *Live Shipment Tracking - ASK Transport Group*\n\n` +
      `Dear ${receiverName || 'Partner'},\n` +
      `Your consignment *${consignmentNo}* (${routeInfo}) is en route.\n\n` +
      `🔗 *Live GPS Tracking Link:* ${session.publicUrlSlug}\n` +
      `🔑 *Secure Access PIN:* ${session.secureAccessPin}\n\n` +
      `Track real-time GPS location, ETA & digital e-POD proof.\n` +
      `_Powered by ASK Transport Enterprise Telematics_`;

    const encoded = encodeURIComponent(shareMessage);
    const waUrl = phoneParam ? `https://wa.me/${phoneParam}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t('1-Click WhatsApp Live Track Share', '1-क्लिक व्हाट्सएप लाइव ट्रैक शेयर')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('Generate secure PIN-protected tracking link for consignees & clients.', 'प्राप्तकर्ताओं व ग्राहकों हेतु पिन-सुरक्षित ट्रैकिंग लिंक बनाएं।')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Consignment summary chip */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">{consignmentNo}</span>
          </div>
          <span className="text-slate-500">{routeInfo}</span>
        </div>

        {!session ? (
          <form onSubmit={handleGenerateShare} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                {t('Receiver / Consignee Person Name', 'प्राप्तकर्ता व्यक्ति का नाम')}
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="e.g. Ramesh Patel (Warehouse Incharge)"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                {t('Receiver WhatsApp Phone Number', 'प्राप्तकर्ता व्हाट्सएप मोबाइल नंबर')}
              </label>
              <input
                type="text"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                placeholder="+91 98290 12345"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>
                {t('Link includes 4-digit security PIN so only authorized consignee can unlock live telematics.', 'लिंक में 4-अंकीय सुरक्षा पिन शामिल है ताकि केवल अधिकृत व्यक्ति लाइव ट्रैकिंग देख सके।')}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {t('Cancel', 'रद्द करें')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-md transition flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                {loading ? t('Generating...', 'बनाया जा रहा है...') : t('Generate Tracking Session', 'ट्रैकिंग लिंक बनाएं')}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Created Session Card */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {t('Live Share Session Active', 'लाइव शेयर सत्र सक्रिय है')}
                </span>
                <span className="text-[10px] text-slate-500">
                  {t('Valid till:', 'वैधता:')} {session.expiresAt}
                </span>
              </div>

              {/* Public URL Box */}
              <div>
                <label className="text-slate-500 text-[11px] block mb-1">{t('Tracking URL:', 'ट्रैकिंग URL:')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={session.publicUrlSlug}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 font-mono text-[11px] rounded-lg outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                    title={t('Copy Link', 'लिंक कॉपी करें')}
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Secure PIN Box */}
              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{t('Security PIN:', 'सुरक्षा पिन:')}</span>
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white tracking-widest">
                    {session.secureAccessPin}
                  </span>
                </div>
                <button
                  onClick={handleCopyPin}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
                >
                  {copiedPin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPin ? t('Copied', 'कॉपी किया') : t('Copy PIN', 'पिन कॉपी')}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleOpenWhatsApp}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition"
              >
                <MessageCircle className="w-4 h-4" />
                {t('Send via WhatsApp Now', 'व्हाट्सएप पर तुरंत भेजें')}
              </button>

              <button
                onClick={() => setSession(null)}
                className="px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {t('Create Another Link', 'अन्य लिंक बनाएं')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
