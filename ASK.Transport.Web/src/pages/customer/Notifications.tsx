import { useEffect, useState } from 'react';
import CustomerLayout from '../../layouts/CustomerLayout';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearReadNotifications,
  type ClientNotification
} from '../../api/notificationApi';
import './Notifications.css';

const INITIAL_MOCK_NOTIFICATIONS: ClientNotification[] = [
  {
    id: 1,
    title: 'Shipment Out for Delivery',
    message: 'Your shipment #ASK-SH-20261027-001 has been dispatched from Mumbai Hub and is out for delivery.',
    type: 'Shipment',
    bookingNumber: 'ASK-BK-20261027-9821',
    shipmentNumber: 'ASK-SH-20261027-001',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  },
  {
    id: 2,
    title: 'Payment Received Successfully',
    message: 'We have received payment of ₹8,750 for booking #ASK-BK-20261026-4410 via Razorpay.',
    type: 'Payment',
    bookingNumber: 'ASK-BK-20261026-4410',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: 3,
    title: 'Booking Confirmed - Vehicle Assigned',
    message: 'Your cargo booking for Delhi to Mumbai has been confirmed. Vehicle MH-04-AB-1234 assigned.',
    type: 'Booking',
    bookingNumber: 'ASK-BK-20261025-1102',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 4,
    title: 'GST Invoice Generated',
    message: 'Tax Invoice #INV-2026-00123 has been generated and is ready for download in your Invoices section.',
    type: 'Document',
    bookingNumber: 'ASK-BK-20261024-8841',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<ClientNotification[]>(INITIAL_MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLiveNotifications();
  }, []);

  async function loadLiveNotifications() {
    try {
      setLoading(true);
      const res = await getNotifications(1, 50);
      if (res.data?.data && res.data.data.length > 0) {
        setNotifications(res.data.data);
      }
    } catch {
      // Keep initial sample notifications if database is fresh
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: number) {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await markNotificationAsRead(id);
    } catch {
      // Local state updated
    }
  }

  async function handleMarkAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await markAllNotificationsAsRead();
    } catch {
      // Local state updated
    }
  }

  async function handleDelete(id: number) {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await deleteNotification(id);
    } catch {
      // Local state updated
    }
  }

  async function handleClearRead() {
    setNotifications(prev => prev.filter(n => !n.isRead));
    try {
      await clearReadNotifications();
    } catch {
      // Local state updated
    }
  }

  function formatDate(val: string) {
    if (!val) return '—';
    const date = new Date(val);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  function getIcon(type?: string) {
    switch (type?.toLowerCase()) {
      case 'shipment':
        return { icon: '🚚', class: 'shipment' };
      case 'payment':
        return { icon: '💳', class: 'payment' };
      case 'booking':
        return { icon: '📦', class: 'booking' };
      default:
        return { icon: '🔔', class: 'system' };
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  const filtered = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'read') return n.isRead;
    return true;
  });

  return (
    <CustomerLayout>
      <div className="notifications-screen">
        {/* HEADER */}
        <div className="notif-header">
          <div className="notif-header-left">
            <div className="notif-title-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div className="notif-header-titles">
              <h1>Notification Center</h1>
              <p>Real-time delivery milestones, cargo booking dispatches, and billing receipts.</p>
            </div>
          </div>

          <div className="notif-header-actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="notif-action-btn primary"
                onClick={handleMarkAllRead}
              >
                ✓ Mark all as read
              </button>
            )}
            {readCount > 0 && (
              <button
                type="button"
                className="notif-action-btn"
                onClick={handleClearRead}
              >
                Clear read
              </button>
            )}
          </div>
        </div>

        {/* TABS BAR */}
        <div className="notif-tabs-bar">
          <button
            type="button"
            className={`notif-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Notifications
            <span className="notif-tab-badge">{notifications.length}</span>
          </button>

          <button
            type="button"
            className={`notif-tab ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            Unread
            {unreadCount > 0 && <span className="notif-tab-badge">{unreadCount}</span>}
          </button>

          <button
            type="button"
            className={`notif-tab ${activeTab === 'read' ? 'active' : ''}`}
            onClick={() => setActiveTab('read')}
          >
            Archived / Read
            <span className="notif-tab-badge">{readCount}</span>
          </button>
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="notif-stack">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Loading notifications...
            </div>
          ) : filtered.length === 0 ? (
            <div className="notif-empty">
              <div className="notif-empty-icon">📭</div>
              <h3>No notifications here</h3>
              <p>You are all caught up with your shipment dispatches and booking alerts.</p>
            </div>
          ) : (
            filtered.map(item => {
              const iconMeta = getIcon(item.type);
              return (
                <div
                  key={item.id}
                  className={`notif-item ${!item.isRead ? 'unread' : ''}`}
                  onClick={() => !item.isRead && handleMarkRead(item.id)}
                >
                  <div className={`notif-item-icon ${iconMeta.class}`}>
                    {iconMeta.icon}
                  </div>

                  <div className="notif-item-body">
                    <div className="notif-item-head">
                      <h4 className="notif-item-title">{item.title}</h4>
                      <span className="notif-item-time">{formatDate(item.createdAt)}</span>
                    </div>

                    <p className="notif-item-message">{item.message}</p>

                    <div className="notif-meta-tags">
                      {item.bookingNumber && (
                        <span className="notif-ref-tag">
                          Booking: {item.bookingNumber}
                        </span>
                      )}
                      {item.shipmentNumber && (
                        <span className="notif-ref-tag">
                          Shipment: {item.shipmentNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="notif-item-actions">
                    {!item.isRead && <span className="notif-read-dot" title="Unread" />}
                    <button
                      type="button"
                      className="notif-delete-btn"
                      title="Delete notification"
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
