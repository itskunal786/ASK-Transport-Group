import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import {
  getAdminOperationsSummary,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserRole,
  changeUserStatus,
  getAllRights,
  getUserRights,
  updateUserRights,
  getAuditLogs,
  forceLogoutUser,
  getHubs,
  getSystemSettings,
  updateSystemSetting,
  type AdminOperationsSummary,
  type AdminUserData,
  type SystemPermissionItem,
  type AuditLogItem,
  type HubItem,
  type SystemSettingItem
} from '../../api/adminApi';
import ConsignmentLRModal, { type ConsignmentLRData } from '../../components/ConsignmentLRModal';
import './AdminDashboard.css';

interface BookingRow {
  bookingNo: string;
  customer: string;
  route: string;
  date: string;
  status: 'In Transit' | 'Delivered' | 'Pending' | 'Cancelled';
}

interface ShipmentRow {
  shipmentNo: string;
  bookingNo: string;
  customer: string;
  origin: string;
  destination: string;
  driver: string;
  vehicle: string;
  currentLocation: string;
  status: 'Pending' | 'Picked Up' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  updatedAt: string;
}

interface DriverRow {
  id: string;
  name: string;
  phone: string;
  licenseNo: string;
  licenseType: string;
  hub: string;
  status: 'Active' | 'On Trip' | 'Off Duty';
  assignedVehicle?: string;
  tripsCompleted: number;
}

interface VehicleRow {
  plateNo: string;
  model: string;
  type: string;
  capacityTons: number;
  currentHub: string;
  status: 'Available' | 'On Route' | 'Maintenance';
  fuelLevel: string;
}

const INITIAL_BOOKINGS: BookingRow[] = [
  { bookingNo: 'ASKB00123', customer: 'Rajesh Kumar', route: 'Delhi → Mumbai', date: '21 Sep 2026', status: 'In Transit' },
  { bookingNo: 'ASKB00122', customer: 'Priya Singh', route: 'Bangalore → Chennai', date: '18 Sep 2026', status: 'Delivered' },
  { bookingNo: 'ASKB00121', customer: 'Amit Patel', route: 'Pune → Hyderabad', date: '15 Sep 2026', status: 'Pending' },
  { bookingNo: 'ASKB00120', customer: 'Neha Jain', route: 'Delhi → Jaipur', date: '12 Sep 2026', status: 'Cancelled' },
  { bookingNo: 'ASKB00119', customer: 'Suresh Reddy', route: 'Kolkata → Patna', date: '10 Sep 2026', status: 'In Transit' },
  { bookingNo: 'ASKB00118', customer: 'Vikram Mehta', route: 'Ahmedabad → Surat', date: '08 Sep 2026', status: 'Delivered' },
];

const INITIAL_SHIPMENTS: ShipmentRow[] = [
  {
    shipmentNo: 'SHP-9901',
    bookingNo: 'ASKB00123',
    customer: 'Rajesh Kumar',
    origin: 'Delhi Hub',
    destination: 'Mumbai Nhava Sheva',
    driver: 'Ramesh Yadav',
    vehicle: 'DL-01-AB-1234 (32ft MXL)',
    currentLocation: 'Jaipur Expressway Toll Gate',
    status: 'In Transit',
    updatedAt: '10 mins ago'
  },
  {
    shipmentNo: 'SHP-9902',
    bookingNo: 'ASKB00122',
    customer: 'Priya Singh',
    origin: 'Bangalore Hub',
    destination: 'Chennai Port',
    driver: 'Murugan Swamy',
    vehicle: 'KA-05-CD-5678 (14ft Eicher)',
    currentLocation: 'Chennai Destination Terminal',
    status: 'Delivered',
    updatedAt: '2 hours ago'
  },
  {
    shipmentNo: 'SHP-9903',
    bookingNo: 'ASKB00121',
    customer: 'Amit Patel',
    origin: 'Pune MIDC',
    destination: 'Hyderabad Hub',
    driver: 'Santosh Shinde',
    vehicle: 'MH-12-EF-9012 (24ft Container)',
    currentLocation: 'Pune Origin Hub - Loading Bay',
    status: 'Pending',
    updatedAt: '35 mins ago'
  },
  {
    shipmentNo: 'SHP-9904',
    bookingNo: 'ASKB00119',
    customer: 'Suresh Reddy',
    origin: 'Kolkata Hub',
    destination: 'Patna Terminal',
    driver: 'Bijoy Das',
    vehicle: 'WB-02-GH-3456 (19ft Closed)',
    currentLocation: 'Asansol Highway Checkpoint',
    status: 'In Transit',
    updatedAt: '1 hour ago'
  },
  {
    shipmentNo: 'SHP-9905',
    bookingNo: 'ASKB00118',
    customer: 'Vikram Mehta',
    origin: 'Ahmedabad GIDC',
    destination: 'Surat Ring Road',
    driver: 'Harish Bhai',
    vehicle: 'GJ-01-JK-7890 (Tata 407)',
    currentLocation: 'Surat City Hub - Out for Delivery',
    status: 'Out for Delivery',
    updatedAt: '15 mins ago'
  }
];

const INITIAL_DRIVERS: DriverRow[] = [
  { id: 'DRV-101', name: 'Ramesh Yadav', phone: '9811223344', licenseNo: 'DL-042018001234', licenseType: 'Commercial Heavy (HMV)', hub: 'Delhi Hub', status: 'On Trip', assignedVehicle: 'DL-01-AB-1234', tripsCompleted: 142 },
  { id: 'DRV-102', name: 'Murugan Swamy', phone: '9840112233', licenseNo: 'TN-012019005678', licenseType: 'Commercial Medium (MMV)', hub: 'Bangalore Hub', status: 'Active', assignedVehicle: 'KA-05-CD-5678', tripsCompleted: 98 },
  { id: 'DRV-103', name: 'Santosh Shinde', phone: '9822334455', licenseNo: 'MH-122020009012', licenseType: 'Commercial Heavy (HMV)', hub: 'Pune Hub', status: 'Active', assignedVehicle: 'MH-12-EF-9012', tripsCompleted: 76 },
  { id: 'DRV-104', name: 'Bijoy Das', phone: '9833445566', licenseNo: 'WB-022017003456', licenseType: 'Commercial Medium (MMV)', hub: 'Kolkata Hub', status: 'On Trip', assignedVehicle: 'WB-02-GH-3456', tripsCompleted: 115 },
  { id: 'DRV-105', name: 'Harish Bhai', phone: '9879556677', licenseNo: 'GJ-012021007890', licenseType: 'Commercial Light (LMV)', hub: 'Ahmedabad Hub', status: 'On Trip', assignedVehicle: 'GJ-01-JK-7890', tripsCompleted: 64 },
  { id: 'DRV-106', name: 'Gurpreet Singh', phone: '9815001122', licenseNo: 'PB-102016009988', licenseType: 'Commercial Heavy (HMV)', hub: 'Delhi Hub', status: 'Off Duty', assignedVehicle: 'None', tripsCompleted: 210 }
];

const INITIAL_VEHICLES: VehicleRow[] = [
  { plateNo: 'DL-01-AB-1234', model: 'Tata Prima 4028.S', type: '32ft Multi-Axle (MXL)', capacityTons: 18.5, currentHub: 'Delhi Hub', status: 'On Route', fuelLevel: '82%' },
  { plateNo: 'KA-05-CD-5678', model: 'Eicher Pro 2110', type: '14ft Closed Body', capacityTons: 7.2, currentHub: 'Bangalore Hub', status: 'Available', fuelLevel: '95%' },
  { plateNo: 'MH-12-EF-9012', model: 'Ashok Leyland 1618', type: '24ft Container Truck', capacityTons: 12.0, currentHub: 'Pune Hub', status: 'Available', fuelLevel: '68%' },
  { plateNo: 'WB-02-GH-3456', model: 'BharatBenz 1217C', type: '19ft Heavy Medium', capacityTons: 9.5, currentHub: 'Kolkata Hub', status: 'On Route', fuelLevel: '74%' },
  { plateNo: 'GJ-01-JK-7890', model: 'Tata 407 Gold SFC', type: '8ft Express Pickup', capacityTons: 3.5, currentHub: 'Ahmedabad Hub', status: 'On Route', fuelLevel: '88%' },
  { plateNo: 'HR-26-LM-4321', model: 'Mahindra Blazo X 35', type: '32ft Multi-Axle (MXL)', capacityTons: 22.0, currentHub: 'Delhi Hub', status: 'Maintenance', fuelLevel: '45%' }
];

type AdminTab = 'dashboard' | 'bookings' | 'customers' | 'shipments' | 'drivers' | 'vehicles' | 'hubs' | 'audit' | 'settings' | 'reports' | 'access';

export default function Dashboard() {
  const { user, logout } = useAuth();

  // Active view in Admin Panel
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Digital LR Modal Preview
  const [selectedLr, setSelectedLr] = useState<ConsignmentLRData | null>(null);

  // Hubs State
  const [hubsList, setHubsList] = useState<HubItem[]>([]);
  const [hubsLoading, setHubsLoading] = useState(false);

  // Security & Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [forceLoggingOutId, setForceLoggingOutId] = useState<number | null>(null);

  // Dynamic System Settings State
  const [settingsList, setSettingsList] = useState<SystemSettingItem[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [editingSettings, setEditingSettings] = useState<{ [key: string]: string }>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Dashboard API data
  const [summary, setSummary] = useState<AdminOperationsSummary | null>(null);
  const [activeMonthHover, setActiveMonthHover] = useState<number | null>(7); // Aug default

  // Bookings list state
  const [bookingsList, setBookingsList] = useState<BookingRow[]>(INITIAL_BOOKINGS);
  const [bookingFilterStatus, setBookingFilterStatus] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');

  // Live Users & Customer Management State
  const [adminUsers, setAdminUsers] = useState<AdminUserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Edit User State
  const [editingUser, setEditingUser] = useState<AdminUserData | null>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserName, setEditUserName] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserActive, setEditUserActive] = useState(true);
  const [editUserLoading, setEditUserLoading] = useState(false);

  // Role Assignment State (SuperAdmin Only)
  const [roleModalUser, setRoleModalUser] = useState<AdminUserData | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [targetRole, setTargetRole] = useState<'User' | 'Admin' | 'SuperAdmin'>('User');
  const [roleUpdating, setRoleUpdating] = useState(false);

  // Rights Delegation State (SuperAdmin Only)
  const [rightsModalUser, setRightsModalUser] = useState<AdminUserData | null>(null);
  const [showRightsModal, setShowRightsModal] = useState(false);
  const [allSystemRights, setAllSystemRights] = useState<SystemPermissionItem[]>([]);
  const [grantedIds, setGrantedIds] = useState<number[]>([]);
  const [revokedIds, setRevokedIds] = useState<number[]>([]);
  const [rightsLoading, setRightsLoading] = useState(false);
  const [rightsSaving, setRightsSaving] = useState(false);

  // Shipments state
  const [shipmentsList, setShipmentsList] = useState<ShipmentRow[]>(INITIAL_SHIPMENTS);
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [shipmentFilterStatus, setShipmentFilterStatus] = useState('All');
  const [showUpdateShipmentModal, setShowUpdateShipmentModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentRow | null>(null);
  const [newStatus, setNewStatus] = useState<'Pending' | 'Picked Up' | 'In Transit' | 'Out for Delivery' | 'Delivered'>('In Transit');
  const [newLocation, setNewLocation] = useState('');
  const [milestoneNote, setMilestoneNote] = useState('');

  // Drivers state
  const [driversList, setDriversList] = useState<DriverRow[]>(INITIAL_DRIVERS);
  const [driverSearch, setDriverSearch] = useState('');
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverDL, setNewDriverDL] = useState('');
  const [newDriverType, setNewDriverType] = useState('Commercial Heavy (HMV)');
  const [newDriverHub, setNewDriverHub] = useState('Delhi Hub');

  // Vehicles state
  const [vehiclesList, setVehiclesList] = useState<VehicleRow[]>(INITIAL_VEHICLES);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newPlateNo, setNewPlateNo] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('32ft Multi-Axle (MXL)');
  const [newVehicleCapacity, setNewVehicleCapacity] = useState('16');
  const [newVehicleHub, setNewVehicleHub] = useState('Delhi Hub');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAdminOperationsSummary();
        setSummary(data);
      } catch (err) {
        console.warn('Backend summary fallback:', err);
      }
    }
    loadData();
    loadUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'hubs') loadHubs();
    if (activeTab === 'audit') loadAuditLogs();
    if (activeTab === 'settings') loadSettings();
  }, [activeTab]);

  async function loadHubs() {
    try {
      setHubsLoading(true);
      const data = await getHubs();
      setHubsList(data);
    } catch (err) {
      console.warn('Backend hubs load error:', err);
    } finally {
      setHubsLoading(false);
    }
  }

  async function loadAuditLogs() {
    try {
      setAuditLoading(true);
      const data = await getAuditLogs({ search: auditSearch });
      if (data && data.data) {
        setAuditLogs(data.data);
      }
    } catch (err) {
      console.warn('Backend audit load error:', err);
    } finally {
      setAuditLoading(false);
    }
  }

  async function handleForceLogout(userId: number, email?: string) {
    if (!window.confirm(`Emergency Kill Switch: Revoke all active bearer tokens and session cookies for user #${userId} (${email || 'Account'}) immediately?`)) {
      return;
    }
    try {
      setForceLoggingOutId(userId);
      const res = await forceLogoutUser(userId);
      showToast(res.message || `Session revoked for user #${userId}`);
      loadAuditLogs();
    } catch (err: any) {
      showToast(err?.message || 'Failed to revoke session');
    } finally {
      setForceLoggingOutId(null);
    }
  }

  async function loadSettings() {
    try {
      setSettingsLoading(true);
      const data = await getSystemSettings();
      setSettingsList(data);
      const mapped: { [key: string]: string } = {};
      data.forEach(s => { mapped[s.key] = s.value; });
      setEditingSettings(mapped);
    } catch (err) {
      console.warn('Backend settings load error:', err);
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleSaveSetting(item: SystemSettingItem) {
    try {
      setSavingKey(item.key);
      const newVal = editingSettings[item.key] ?? item.value;
      const res = await updateSystemSetting({
        key: item.key,
        value: newVal,
        group: item.group,
        description: item.description,
        isPublic: item.isPublic,
      });
      showToast(res.message || `System setting "${item.key}" updated to "${newVal}"`);
      loadSettings();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update setting');
    } finally {
      setSavingKey(null);
    }
  }

  async function loadUsers() {
    try {
      setUsersLoading(true);
      const res = await getAdminUsers({ search: customerSearch });
      if (res && res.data) {
        setAdminUsers(res.data);
      }
    } catch (err) {
      console.warn('Backend users load error:', err);
    } finally {
      setUsersLoading(false);
    }
  }

  function handleOpenEditUser(u: AdminUserData) {
    setEditingUser(u);
    setEditUserName(u.name);
    setEditUserPhone(u.phone);
    setEditUserEmail(u.email);
    setEditUserActive(u.isActive);
    setShowEditUserModal(true);
  }

  async function handleSaveUserEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setEditUserLoading(true);
      const res = await updateAdminUser(editingUser.id, {
        name: editUserName,
        phone: editUserPhone,
        email: editUserEmail,
        isActive: editUserActive
      });
      showToast(res.message || 'User data updated successfully!');
      setShowEditUserModal(false);
      loadUsers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update user');
    } finally {
      setEditUserLoading(false);
    }
  }

  function handleOpenRoleModal(u: AdminUserData) {
    setRoleModalUser(u);
    setTargetRole(u.role);
    setShowRoleModal(true);
  }

  async function handleSaveRole(e: React.FormEvent) {
    e.preventDefault();
    if (!roleModalUser) return;
    try {
      setRoleUpdating(true);
      const res = await updateAdminUserRole(roleModalUser.id, targetRole);
      showToast(res.message || `Role updated to ${targetRole}!`);
      setShowRoleModal(false);
      loadUsers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update role');
    } finally {
      setRoleUpdating(false);
    }
  }

  async function handleOpenRightsModal(u: AdminUserData) {
    setRightsModalUser(u);
    setShowRightsModal(true);
    setRightsLoading(true);
    try {
      const [allRights, userRights] = await Promise.all([
        getAllRights(),
        getUserRights(u.id)
      ]);
      setAllSystemRights(allRights);
      setGrantedIds(userRights.grantedPermissionIds || []);
      setRevokedIds(userRights.revokedPermissionIds || []);
    } catch (err: any) {
      showToast('Failed to load user permissions');
    } finally {
      setRightsLoading(false);
    }
  }

  async function handleSaveRights() {
    if (!rightsModalUser) return;
    try {
      setRightsSaving(true);
      const res = await updateUserRights(rightsModalUser.id, {
        grantedPermissionIds: grantedIds,
        revokedPermissionIds: revokedIds
      });
      showToast(res.message || 'Rights successfully updated!');
      setShowRightsModal(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to update rights');
    } finally {
      setRightsSaving(false);
    }
  }

  async function handleToggleUserStatus(u: AdminUserData) {
    try {
      const newStatus = !u.isActive;
      await changeUserStatus(u.id, newStatus);
      showToast(`User ${u.name} ${newStatus ? 'activated' : 'suspended'}!`);
      loadUsers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status');
    }
  }

  // CSV Exporters
  function exportBookingsToCSV() {
    const headers = 'BookingNo,Customer,Route,Date,Status';
    const rows = bookingsList.map(b => `"${b.bookingNo}","${b.customer}","${b.route}","${b.date}","${b.status}"`);
    downloadCSV([headers, ...rows].join('\n'), `ASK_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Bookings report exported to CSV!');
  }

  function exportRevenueToCSV() {
    const headers = 'Month,BookingsCount,RevenueINR,GSTCollectedINR,OnTimeRate';
    const rows = [
      '"Jan 2026","42","385000","69300","99.2%"',
      '"Feb 2026","58","520000","93600","99.5%"',
      '"Mar 2026","65","610000","109800","99.1%"',
      '"Apr 2026","72","690000","124200","99.4%"',
      '"May 2026","80","765000","137700","99.6%"',
      '"Jun 2026","88","840000","151200","99.3%"',
      '"Jul 2026","92","895000","161100","99.7%"',
      '"Aug 2026","98","955000","171900","99.8%"',
      '"Sep 2026","85","820000","147600","99.4%"'
    ];
    downloadCSV([headers, ...rows].join('\n'), `ASK_Revenue_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Revenue ledger exported to CSV!');
  }

  function exportDriversToCSV() {
    const headers = 'DriverID,Name,Phone,LicenseNo,Type,Hub,Status,TripsCompleted';
    const rows = driversList.map(d => `"${d.id}","${d.name}","${d.phone}","${d.licenseNo}","${d.licenseType}","${d.hub}","${d.status}","${d.tripsCompleted}"`);
    downloadCSV([headers, ...rows].join('\n'), `ASK_Drivers_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Driver logs exported to CSV!');
  }

  function exportVehiclesToCSV() {
    const headers = 'PlateNo,Model,Type,CapacityTons,Hub,Status,Fuel';
    const rows = vehiclesList.map(v => `"${v.plateNo}","${v.model}","${v.type}","${v.capacityTons}","${v.currentHub}","${v.status}","${v.fuelLevel}"`);
    downloadCSV([headers, ...rows].join('\n'), `ASK_Fleet_Vehicles_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Fleet registry exported to CSV!');
  }

  function downloadCSV(content: string, filename: string) {
    const csvContent = 'data:text/csv;charset=utf-8,' + content;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Handle Add Customer
  function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!newCustName.trim() || !newCustEmail.trim()) return;

    const newCust: AdminUserData = {
      id: Date.now(),
      name: newCustName.trim(),
      email: newCustEmail.trim(),
      phone: newCustPhone.trim() || '9876543210',
      role: 'User',
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setAdminUsers(prev => [newCust, ...prev]);
    setShowAddCustomerModal(false);
    setNewCustName('');
    setNewCustEmail('');
    setNewCustPhone('');
    showToast(`Customer "${newCust.name}" added successfully!`);
  }

  // Handle Shipment Status Update
  function openUpdateShipmentModal(s: ShipmentRow) {
    setSelectedShipment(s);
    setNewStatus(s.status);
    setNewLocation(s.currentLocation);
    setMilestoneNote('');
    setShowUpdateShipmentModal(true);
  }

  function handleSaveShipmentStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedShipment) return;

    setShipmentsList(prev =>
      prev.map(item =>
        item.shipmentNo === selectedShipment.shipmentNo
          ? {
              ...item,
              status: newStatus,
              currentLocation: newLocation.trim() || item.currentLocation,
              updatedAt: 'Just now'
            }
          : item
      )
    );

    // Also update corresponding booking status if matched
    setBookingsList(prev =>
      prev.map(b =>
        b.bookingNo === selectedShipment.bookingNo
          ? { ...b, status: newStatus === 'Delivered' ? 'Delivered' : newStatus === 'Pending' ? 'Pending' : 'In Transit' }
          : b
      )
    );

    setShowUpdateShipmentModal(false);
    showToast(`Shipment ${selectedShipment.shipmentNo} status updated to "${newStatus}"!`);
  }

  // Handle Add Driver
  function handleAddDriver(e: React.FormEvent) {
    e.preventDefault();
    if (!newDriverName.trim() || !newDriverPhone.trim() || !newDriverDL.trim()) return;

    const newDrv: DriverRow = {
      id: `DRV-${Math.floor(100 + Math.random() * 900)}`,
      name: newDriverName.trim(),
      phone: newDriverPhone.trim(),
      licenseNo: newDriverDL.trim(),
      licenseType: newDriverType,
      hub: newDriverHub,
      status: 'Active',
      tripsCompleted: 0
    };

    setDriversList(prev => [newDrv, ...prev]);
    setShowAddDriverModal(false);
    setNewDriverName('');
    setNewDriverPhone('');
    setNewDriverDL('');
    showToast(`Driver ${newDrv.name} registered successfully!`);
  }

  // Handle Add Vehicle
  function handleAddVehicle(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlateNo.trim() || !newVehicleModel.trim()) return;

    const newVeh: VehicleRow = {
      plateNo: newPlateNo.trim().toUpperCase(),
      model: newVehicleModel.trim(),
      type: newVehicleType,
      capacityTons: parseFloat(newVehicleCapacity) || 10,
      currentHub: newVehicleHub,
      status: 'Available',
      fuelLevel: '100%'
    };

    setVehiclesList(prev => [newVeh, ...prev]);
    setShowAddVehicleModal(false);
    setNewPlateNo('');
    setNewVehicleModel('');
    showToast(`Vehicle ${newVeh.plateNo} registered into fleet!`);
  }

  // Monthly trends data for Bookings Trend chart
  const monthlyTrends = [
    { month: 'Jan', count: 42 },
    { month: 'Feb', count: 58 },
    { month: 'Mar', count: 65 },
    { month: 'Apr', count: 72 },
    { month: 'May', count: 80 },
    { month: 'Jun', count: 88 },
    { month: 'Jul', count: 92 },
    { month: 'Aug', count: 98 },
    { month: 'Sep', count: 85 }
  ];

  const filteredBookings = bookingsList.filter(b => {
    if (bookingFilterStatus !== 'All' && b.status !== bookingFilterStatus) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      return (
        b.bookingNo.toLowerCase().includes(q) ||
        b.customer.toLowerCase().includes(q) ||
        b.route.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredShipments = shipmentsList.filter(s => {
    if (shipmentFilterStatus !== 'All' && s.status !== shipmentFilterStatus) return false;
    if (shipmentSearch.trim()) {
      const q = shipmentSearch.toLowerCase();
      return (
        s.shipmentNo.toLowerCase().includes(q) ||
        s.bookingNo.toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q) ||
        s.origin.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.driver.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredDrivers = driversList.filter(d => {
    if (driverSearch.trim()) {
      const q = driverSearch.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.licenseNo.toLowerCase().includes(q) ||
        d.hub.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredVehicles = vehiclesList.filter(v => {
    if (vehicleSearch.trim()) {
      const q = vehicleSearch.toLowerCase();
      return (
        v.plateNo.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q) ||
        v.currentHub.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="admin-layout-container">
      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          background: '#07192b',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 600,
          borderLeft: '4px solid #10b981'
        }}>
          {toastMessage}
        </div>
      )}

      {/* 1. DARK ADMIN SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">A</div>
          <div className="admin-brand-text">
            <strong>ASK TRANSPORT</strong>
            <small>LOGISTICS &amp; SUPPLY CHAIN</small>
          </div>
        </div>

        <nav className="admin-nav-menu">
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            Dashboard
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Bookings
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            User Management
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'shipments' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipments')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            Shipments &amp; Dispatch
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'drivers' ? 'active' : ''}`}
            onClick={() => setActiveTab('drivers')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            </svg>
            Drivers
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => setActiveTab('vehicles')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            Fleet &amp; Vehicles
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'hubs' ? 'active' : ''}`}
            onClick={() => setActiveTab('hubs')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Hubs &amp; Terminals
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            Security &amp; Audit Trail
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            System Settings
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Reports &amp; Export
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'access' ? 'active' : ''}`}
            onClick={() => setActiveTab('access')}
            style={user?.role === 'SuperAdmin' ? { borderLeft: '3px solid #f59e0b', color: '#fef3c7' } : {}}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {user?.role === 'SuperAdmin' ? '👑 Rights & Delegation' : 'Staff Access'}
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/landing" className="admin-switch-link" style={{ marginBottom: '8px' }}>
            🌐 Public Website
          </Link>

          <Link to="/dashboard" className="admin-switch-link">
            ← Switch to Customer Portal
          </Link>

          <button type="button" onClick={logout} className="admin-logout-btn">
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT */}
      <main className="admin-main-viewport">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="admin-top-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={
                activeTab === 'bookings'
                  ? bookingSearch
                  : activeTab === 'customers'
                  ? customerSearch
                  : activeTab === 'shipments'
                  ? shipmentSearch
                  : activeTab === 'drivers'
                  ? driverSearch
                  : activeTab === 'vehicles'
                  ? vehicleSearch
                  : ''
              }
              onChange={e => {
                const val = e.target.value;
                if (activeTab === 'bookings') setBookingSearch(val);
                else if (activeTab === 'customers') setCustomerSearch(val);
                else if (activeTab === 'shipments') setShipmentSearch(val);
                else if (activeTab === 'drivers') setDriverSearch(val);
                else if (activeTab === 'vehicles') setVehicleSearch(val);
              }}
            />
          </div>

          <div className="admin-top-profile">
            <ThemeToggle />

            <div className="admin-profile-pill">
              <div
                className="admin-user-avatar"
                style={user?.role === 'SuperAdmin' ? { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' } : {}}
              >
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="admin-user-names">
                <strong>{user?.name || 'Administrator'}</strong>
                <small style={user?.role === 'SuperAdmin' ? { color: '#f59e0b', fontWeight: 700 } : {}}>
                  {user?.role === 'SuperAdmin' ? '👑 Super Admin • Full Rights' : 'Admin • Operations Access'}
                </small>
              </div>
            </div>
          </div>
        </header>

        {/* ============================================================== */}
        {/* VIEW 1: DASHBOARD TAB */}
        {/* ============================================================== */}
        {activeTab === 'dashboard' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Operations Command Center</h1>
                <p>Real-time analytics and freight fleet monitoring</p>
              </div>

              <div className="admin-title-actions">
                <button type="button" className="admin-btn-export" onClick={exportBookingsToCSV}>
                  Export CSV
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => setActiveTab('bookings')}
                >
                  Manage Bookings →
                </button>
              </div>
            </div>

            {/* 4 TOP METRIC BOXES */}
            <div className="admin-metrics-grid">
              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon bookings">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div className="admin-box-content">
                    <strong>{summary?.totalBookings && summary.totalBookings > 0 ? summary.totalBookings : 1284}</strong>
                    <span>Total Bookings</span>
                  </div>
                </div>
                <div className="admin-box-delta green">
                  ↑ 12.5% vs previous 30 days
                </div>
              </div>

              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon transit">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                    </svg>
                  </div>
                  <div className="admin-box-content">
                    <strong>{summary?.inTransitShipments && summary.inTransitShipments > 0 ? summary.inTransitShipments : 184}</strong>
                    <span>Active In-Transit</span>
                  </div>
                </div>
                <div className="admin-box-delta green">
                  ↑ 5.2% on highways
                </div>
              </div>

              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon delivered">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div className="admin-box-content">
                    <strong>{summary?.deliveredBookings && summary.deliveredBookings > 0 ? summary.deliveredBookings : 1032}</strong>
                    <span>Delivered (Month)</span>
                  </div>
                </div>
                <div className="admin-box-delta green">
                  99.4% on-time SLA
                </div>
              </div>

              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon pending">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className="admin-box-content">
                    <strong>₹{(summary?.successfulPaymentAmount && summary.successfulPaymentAmount > 0 ? summary.successfulPaymentAmount : 4250000).toLocaleString('en-IN')}</strong>
                    <span>Gross Revenue</span>
                  </div>
                </div>
                <div className="admin-box-delta green">
                  ↑ 18.2% GST Invoiced
                </div>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="admin-charts-grid">
              <div className="admin-chart-card">
                <div className="admin-chart-head">
                  <h3>Monthly Bookings Trend</h3>
                  <div className="admin-chart-sub">Showing 2026 Monthly Volume</div>
                </div>

                <div className="admin-bar-chart-container">
                  {monthlyTrends.map((item, idx) => {
                    const isHovered = activeMonthHover === idx;
                    const maxVal = 100;
                    const heightPercent = Math.round((item.count / maxVal) * 100);

                    return (
                      <div
                        key={idx}
                        className="admin-bar-col"
                        onMouseEnter={() => setActiveMonthHover(idx)}
                      >
                        {isHovered && (
                          <div className="admin-bar-tooltip">
                            <strong>{item.count}</strong>
                            <span>bookings</span>
                          </div>
                        )}
                        <div
                          className={`admin-bar-fill ${isHovered ? 'active' : ''}`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="admin-bar-label">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="admin-chart-card">
                <div className="admin-chart-head">
                  <h3>Shipment Status Breakdown</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>245 Active Units</span>
                </div>

                <div className="admin-donut-wrapper">
                  <div className="admin-donut-svg-wrap">
                    <svg viewBox="0 0 36 36" width="100%" height="100%">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="3.8"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="4"
                        strokeDasharray="40, 100"
                        strokeDashoffset="25"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#0b72e7"
                        strokeWidth="4"
                        strokeDasharray="35, 100"
                        strokeDashoffset="-15"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="4"
                        strokeDasharray="15, 100"
                        strokeDashoffset="-50"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="4"
                        strokeDasharray="10, 100"
                        strokeDashoffset="-65"
                      />
                    </svg>

                    <div className="admin-donut-center">
                      <strong>245</strong>
                      <small>Total Units</small>
                    </div>
                  </div>

                  <div className="admin-donut-legend">
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot delivered" />
                      <span>Delivered</span>
                      <strong className="admin-legend-val">40%</strong>
                    </div>
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot transit" />
                      <span>In Transit</span>
                      <strong className="admin-legend-val">35%</strong>
                    </div>
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot pending" />
                      <span>Pending</span>
                      <strong className="admin-legend-val">15%</strong>
                    </div>
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot cancelled" />
                      <span>Cancelled</span>
                      <strong className="admin-legend-val">10%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: BOOKINGS TAB */}
        {/* ============================================================== */}
        {activeTab === 'bookings' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Manage Customer Bookings</h1>
                <p>Consignments, schedules, and carrier allocations</p>
              </div>

              <div className="admin-title-actions">
                <button type="button" className="admin-btn-export" onClick={exportBookingsToCSV}>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="admin-table-card">
              <div className="admin-table-toolbar">
                <div className="admin-toolbar-search">
                  <input
                    type="text"
                    placeholder="Search by Booking #, Customer, or Route..."
                    value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                  />
                </div>

                <div className="admin-toolbar-filter">
                  {['All', 'In Transit', 'Delivered', 'Pending', 'Cancelled'].map(st => (
                    <button
                      key={st}
                      type="button"
                      className={`admin-filter-pill ${bookingFilterStatus === st ? 'active' : ''}`}
                      onClick={() => setBookingFilterStatus(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Booking No</th>
                    <th>Customer</th>
                    <th>Route</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b, i) => (
                    <tr key={i}>
                      <td><strong style={{ color: '#0b72e7' }}>{b.bookingNo}</strong></td>
                      <td style={{ fontWeight: 600 }}>{b.customer}</td>
                      <td>{b.route}</td>
                      <td style={{ color: '#64748b' }}>{b.date}</td>
                      <td>
                        <span
                          className="admin-badge-status"
                          style={{
                            background:
                              b.status === 'Delivered' ? '#edfdf4' :
                              b.status === 'In Transit' ? '#e0f2fe' :
                              b.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                            color:
                              b.status === 'Delivered' ? '#10b981' :
                              b.status === 'In Transit' ? '#0b72e7' :
                              b.status === 'Pending' ? '#d97706' : '#dc2626'
                          }}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="admin-btn-view"
                            onClick={() => {
                              const foundShip = shipmentsList.find(s => s.bookingNo === b.bookingNo);
                              if (foundShip) {
                                openUpdateShipmentModal(foundShip);
                              } else {
                                alert(`Booking: ${b.bookingNo}\nCustomer: ${b.customer}\nRoute: ${b.route}\nStatus: ${b.status}`);
                              }
                            }}
                          >
                            Update Status
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLr({
                                bookingNumber: b.bookingNo,
                                consignmentNumber: `LR-${b.bookingNo}`,
                                bookingDate: b.date,
                                fromCity: b.route.split('→')[0]?.trim() || 'Origin Hub',
                                toCity: b.route.split('→')[1]?.trim() || 'Destination Terminal',
                                senderName: b.customer,
                                senderPhone: '9876543210',
                                receiverName: 'Authorized Consignee',
                                receiverPhone: '9812345678',
                                goodsType: 'Commercial Goods',
                                weight: 450,
                                quantity: 10,
                                freightAmount: 8500,
                                gstAmount: 1530,
                                totalAmount: 10030,
                                status: b.status,
                              });
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #bfdbfe',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            📄 View LR
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: USER MANAGEMENT & UPDATION TAB */}
        {/* ============================================================== */}
        {activeTab === 'customers' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>User Directory &amp; Data Management</h1>
                <p>Manage user profiles, edit contact information, toggle account status, and delegate administrative roles</p>
              </div>

              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-export"
                  onClick={loadUsers}
                  disabled={usersLoading}
                >
                  {usersLoading ? 'Refreshing...' : '🔄 Refresh Users'}
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => setShowAddCustomerModal(true)}
                >
                  + Add User
                </button>
              </div>
            </div>

            <div className="admin-table-card">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>User &amp; ID</th>
                    <th>Email Address</th>
                    <th>Mobile Phone</th>
                    <th>Assigned Role</th>
                    <th>Account Status</th>
                    <th>Actions &amp; Updation</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.length > 0 ? (
                    adminUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                          <small style={{ color: '#94a3b8', fontSize: '11px' }}>ID: #{u.id}</small>
                        </td>
                        <td style={{ color: '#0b72e7', fontWeight: 500 }}>{u.email}</td>
                        <td style={{ color: '#475569' }}>{u.phone || '—'}</td>
                        <td>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background:
                                u.role === 'SuperAdmin'
                                  ? '#fef3c7'
                                  : u.role === 'Admin'
                                  ? '#ede9fe'
                                  : '#e0f2fe',
                              color:
                                u.role === 'SuperAdmin'
                                  ? '#b45309'
                                  : u.role === 'Admin'
                                  ? '#6d28d9'
                                  : '#0284c7'
                            }}
                          >
                            {u.role === 'SuperAdmin' ? '👑 Super Admin' : u.role === 'Admin' ? '⚡ Admin' : '👤 User'}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: u.isActive ? '#edfdf4' : '#fee2e2',
                              color: u.isActive ? '#10b981' : '#dc2626'
                            }}
                          >
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="admin-btn-view"
                              onClick={() => handleOpenEditUser(u)}
                              title="Edit user details"
                            >
                              ✏️ Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u)}
                              style={{
                                padding: '4px 8px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                background: u.isActive ? '#fff1f2' : '#f0fdf4',
                                color: u.isActive ? '#e11d48' : '#16a34a',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              title={u.isActive ? 'Suspend User' : 'Activate User'}
                            >
                              {u.isActive ? 'Suspend' : 'Activate'}
                            </button>

                            {user?.role === 'SuperAdmin' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenRoleModal(u)}
                                  style={{
                                    padding: '4px 8px',
                                    border: '1px solid #fde68a',
                                    borderRadius: '6px',
                                    background: '#fffbeb',
                                    color: '#b45309',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                  title="Change User Role (SuperAdmin Only)"
                                >
                                  👑 Role
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenRightsModal(u)}
                                  style={{
                                    padding: '4px 8px',
                                    border: '1px solid #c7d2fe',
                                    borderRadius: '6px',
                                    background: '#eef2ff',
                                    color: '#4338ca',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                  title="Delegate or Revoke Specific Rights (SuperAdmin Only)"
                                >
                                  🛡️ Rights
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        {usersLoading ? 'Loading users...' : 'No users found matching your query.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: SHIPMENTS & DISPATCH (NEW) */}
        {/* ============================================================== */}
        {activeTab === 'shipments' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Live Shipments &amp; Dispatch</h1>
                <p>Real-time vehicle tracking, driver allocation, and milestone updater</p>
              </div>

              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => {
                    const first = shipmentsList[0];
                    if (first) openUpdateShipmentModal(first);
                  }}
                >
                  ⚡ Quick Status Update
                </button>
              </div>
            </div>

            <div className="admin-table-card">
              <div className="admin-table-toolbar">
                <div className="admin-toolbar-search">
                  <input
                    type="text"
                    placeholder="Search by Shipment #, Driver, or Hub..."
                    value={shipmentSearch}
                    onChange={e => setShipmentSearch(e.target.value)}
                  />
                </div>

                <div className="admin-toolbar-filter">
                  {['All', 'In Transit', 'Out for Delivery', 'Delivered', 'Pending'].map(st => (
                    <button
                      key={st}
                      type="button"
                      className={`admin-filter-pill ${shipmentFilterStatus === st ? 'active' : ''}`}
                      onClick={() => setShipmentFilterStatus(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Shipment ID</th>
                    <th>Booking / Client</th>
                    <th>Origin → Destination</th>
                    <th>Driver &amp; Vehicle</th>
                    <th>Current Checkpoint</th>
                    <th>Status</th>
                    <th>Dispatch Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.map((s, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong style={{ color: '#0b72e7' }}>{s.shipmentNo}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{s.updatedAt}</div>
                      </td>
                      <td>
                        <strong>{s.customer}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Waybill: {s.bookingNo}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.origin}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>→ {s.destination}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.driver}</div>
                        <div style={{ fontSize: '11px', color: '#0b72e7' }}>{s.vehicle}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>
                          📍 {s.currentLocation}
                        </span>
                      </td>
                      <td>
                        <span
                          className="admin-badge-status"
                          style={{
                            background:
                              s.status === 'Delivered' ? '#edfdf4' :
                              s.status === 'Out for Delivery' ? '#e0f2fe' :
                              s.status === 'In Transit' ? '#eff6ff' : '#fef3c7',
                            color:
                              s.status === 'Delivered' ? '#10b981' :
                              s.status === 'Out for Delivery' ? '#0369a1' :
                              s.status === 'In Transit' ? '#0b72e7' : '#d97706'
                          }}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn-view"
                          onClick={() => openUpdateShipmentModal(s)}
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 5: DRIVERS (NEW) */}
        {/* ============================================================== */}
        {activeTab === 'drivers' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Drivers &amp; Operators Directory</h1>
                <p>Commercial license records, hub allocations, and availability</p>
              </div>

              <div className="admin-title-actions">
                <button type="button" className="admin-btn-export" onClick={exportDriversToCSV}>
                  Export Drivers CSV
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => setShowAddDriverModal(true)}
                >
                  + Add Driver
                </button>
              </div>
            </div>

            <div className="admin-table-card">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Driver ID &amp; Name</th>
                    <th>Contact Phone</th>
                    <th>Driving License (DL)</th>
                    <th>Base Hub</th>
                    <th>Assigned Vehicle</th>
                    <th>Status</th>
                    <th>Trips</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((d, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{d.name}</strong>
                        <div style={{ fontSize: '11px', color: '#0b72e7' }}>{d.id}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#334155' }}>{d.phone}</td>
                      <td>
                        <div>{d.licenseNo}</div>
                        <small style={{ color: '#64748b' }}>{d.licenseType}</small>
                      </td>
                      <td>{d.hub}</td>
                      <td style={{ color: '#0b72e7', fontWeight: 600 }}>{d.assignedVehicle || 'Unassigned'}</td>
                      <td>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background:
                              d.status === 'Active' ? '#edfdf4' :
                              d.status === 'On Trip' ? '#e0f2fe' : '#fee2e2',
                            color:
                              d.status === 'Active' ? '#10b981' :
                              d.status === 'On Trip' ? '#0b72e7' : '#dc2626'
                          }}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td><strong>{d.tripsCompleted}</strong> trips</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 6: FLEET & VEHICLES (NEW) */}
        {/* ============================================================== */}
        {activeTab === 'vehicles' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Fleet &amp; Heavy Vehicles Registry</h1>
                <p>Commercial transport trucks, container trailers, and maintenance logs</p>
              </div>

              <div className="admin-title-actions">
                <button type="button" className="admin-btn-export" onClick={exportVehiclesToCSV}>
                  Export Fleet CSV
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => setShowAddVehicleModal(true)}
                >
                  + Add Vehicle
                </button>
              </div>
            </div>

            <div className="admin-table-card">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Registration No.</th>
                    <th>Model &amp; Chassis</th>
                    <th>Body / Container Type</th>
                    <th>Payload Capacity</th>
                    <th>Assigned Terminal</th>
                    <th>Fuel Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((v, idx) => (
                    <tr key={idx}>
                      <td><strong style={{ color: '#0b72e7' }}>{v.plateNo}</strong></td>
                      <td style={{ fontWeight: 600 }}>{v.model}</td>
                      <td>{v.type}</td>
                      <td><strong>{v.capacityTons}</strong> Tons</td>
                      <td>{v.currentHub}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981' }}>{v.fuelLevel}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background:
                              v.status === 'Available' ? '#edfdf4' :
                              v.status === 'On Route' ? '#e0f2fe' : '#fee2e2',
                            color:
                              v.status === 'Available' ? '#10b981' :
                              v.status === 'On Route' ? '#0b72e7' : '#dc2626'
                          }}
                        >
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 7: REPORTS & EXPORT (NEW) */}
        {/* ============================================================== */}
        {activeTab === 'reports' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Operations &amp; Financial Reports</h1>
                <p>Download structured CSV ledgers for tax compliance, audits, and fleet reviews</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div className="admin-kpi-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
                <div className="admin-kpi-icon-wrap" style={{ background: '#e0f2fe', color: '#0b72e7', marginBottom: '16px' }}>
                  📊
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>Bookings Ledger</h3>
                <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
                  Complete consignment records, routes, status, and client bookings history.
                </p>
                <button type="button" className="admin-btn-primary" onClick={exportBookingsToCSV} style={{ width: '100%' }}>
                  Download Bookings CSV
                </button>
              </div>

              <div className="admin-kpi-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
                <div className="admin-kpi-icon-wrap" style={{ background: '#edfdf4', color: '#10b981', marginBottom: '16px' }}>
                  💰
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>Revenue &amp; GST Ledger</h3>
                <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
                  Monthly billing summary, freight revenue, and 18% GST collected for filing.
                </p>
                <button type="button" className="admin-btn-primary" onClick={exportRevenueToCSV} style={{ width: '100%' }}>
                  Download Revenue CSV
                </button>
              </div>

              <div className="admin-kpi-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
                <div className="admin-kpi-icon-wrap" style={{ background: '#fef3c7', color: '#d97706', marginBottom: '16px' }}>
                  🚛
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>Fleet &amp; Drivers Report</h3>
                <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
                  Complete list of commercial drivers, license numbers, and truck assignments.
                </p>
                <button type="button" className="admin-btn-primary" onClick={exportDriversToCSV} style={{ width: '100%' }}>
                  Download Drivers CSV
                </button>
              </div>

              <div className="admin-kpi-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
                <div className="admin-kpi-icon-wrap" style={{ background: '#f3e8ff', color: '#7c3aed', marginBottom: '16px' }}>
                  🗂️
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>Vehicle Registry</h3>
                <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
                  Active vehicle models, tonnage capacity, assigned terminals, and fuel levels.
                </p>
                <button type="button" className="admin-btn-primary" onClick={exportVehiclesToCSV} style={{ width: '100%' }}>
                  Download Vehicles CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 8: SUPER ADMIN CONTROL & RIGHTS DELEGATION TAB */}
        {/* ============================================================== */}
        {activeTab === 'access' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>👑 Super Admin Control Center &amp; Rights Delegation</h1>
                <p>Governing role assignments, administrative privileges, and granular module access control</p>
              </div>

              {user?.role === 'SuperAdmin' && (
                <div className="admin-title-actions">
                  <span style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    color: '#92400e',
                    fontSize: '13px',
                    fontWeight: 700
                  }}>
                    👑 Super Admin Master Mode Active
                  </span>
                </div>
              )}
            </div>

            {/* SUPER ADMIN NOTICE */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #f59e0b',
              borderRadius: '12px',
              padding: '18px 22px',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '15px', fontWeight: 700 }}>
                Hierarchical Security Architecture:
              </h3>
              <p style={{ margin: 0, color: '#475569', fontSize: '13px', lineHeight: 1.6 }}>
                1. <strong>Super Admin</strong>: Holds unrestricted master permissions across all backend APIs, database tables, financial reconciliations, and security settings. Only the Super Admin can promote users to Admin or grant/revoke specific rights.<br />
                2. <strong>Admin</strong>: Manages day-to-day user data, shipment tracking, consignments, drivers, and operations strictly based on rights delegated by the Super Admin.<br />
                3. <strong>User / Customer</strong>: Accesses their personal shipper panel to book cargo, track consignments, and update their account credentials.
              </p>
            </div>

            {/* KPI STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="admin-kpi-card">
                <div className="admin-kpi-icon-wrap" style={{ background: '#fef3c7', color: '#b45309' }}>👑</div>
                <div className="admin-kpi-text">
                  <span>Super Admins</span>
                  <strong>{adminUsers.filter(u => u.role === 'SuperAdmin').length || 1}</strong>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-icon-wrap" style={{ background: '#ede9fe', color: '#6d28d9' }}>⚡</div>
                <div className="admin-kpi-text">
                  <span>Operational Admins</span>
                  <strong>{adminUsers.filter(u => u.role === 'Admin').length}</strong>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-icon-wrap" style={{ background: '#e0f2fe', color: '#0284c7' }}>👥</div>
                <div className="admin-kpi-text">
                  <span>Registered Users</span>
                  <strong>{adminUsers.filter(u => u.role === 'User').length}</strong>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-icon-wrap" style={{ background: '#edfdf4', color: '#16a34a' }}>🛡️</div>
                <div className="admin-kpi-text">
                  <span>Delegable Modules</span>
                  <strong>8 Core Modules</strong>
                </div>
              </div>
            </div>

            {/* STAFF TABLE */}
            <div className="admin-table-card">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                <h2 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>System Staff &amp; Administrative Personnel</h2>
              </div>

              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Personnel</th>
                    <th>Email Address</th>
                    <th>Role Privilege</th>
                    <th>Status</th>
                    <th>Super Admin Rights Delegation</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers
                    .filter(u => u.role === 'Admin' || u.role === 'SuperAdmin')
                    .map(staff => (
                      <tr key={staff.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{staff.name}</div>
                          <small style={{ color: '#64748b' }}>Staff ID: #{staff.id}</small>
                        </td>
                        <td style={{ color: '#0b72e7' }}>{staff.email}</td>
                        <td>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: staff.role === 'SuperAdmin' ? '#fef3c7' : '#ede9fe',
                              color: staff.role === 'SuperAdmin' ? '#b45309' : '#6d28d9'
                            }}
                          >
                            {staff.role === 'SuperAdmin' ? '👑 Super Admin' : '⚡ Operational Admin'}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: staff.isActive ? '#edfdf4' : '#fee2e2',
                              color: staff.isActive ? '#10b981' : '#dc2626'
                            }}
                          >
                            {staff.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td>
                          {user?.role === 'SuperAdmin' ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenRightsModal(staff)}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #c7d2fe',
                                  background: '#eef2ff',
                                  color: '#4338ca',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                🛡️ Manage Rights
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenRoleModal(staff)}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #fde68a',
                                  background: '#fffbeb',
                                  color: '#b45309',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                👑 Change Role
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                              Governed by Super Admin
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 9: MULTI-CITY HUBS & TERMINALS */}
        {/* ============================================================== */}
        {activeTab === 'hubs' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Multi-City Logistics Hubs &amp; Terminals</h1>
                <p>National hub infrastructure, sorting centers, cargo throughput, and operational status</p>
              </div>
              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-export"
                  onClick={loadHubs}
                  disabled={hubsLoading}
                >
                  {hubsLoading ? 'Refreshing...' : '🔄 Refresh Hubs'}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {hubsList.map(h => (
                <div
                  key={h.id}
                  style={{
                    background: 'var(--bg-card, #ffffff)',
                    border: '1px solid var(--border, #e2e8f0)',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: '#2563eb',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}>
                        {h.code}
                      </span>
                      <span style={{
                        background: h.isActive ? '#edfdf4' : '#fee2e2',
                        color: h.isActive ? '#10b981' : '#dc2626',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '12px'
                      }}>
                        {h.isActive ? '● Operational' : '○ Standby'}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: 'var(--text-primary, #0f172a)' }}>
                      {h.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary, #64748b)' }}>
                      📍 {h.city}, {h.state}
                    </p>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border, #f1f5f9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)', display: 'block' }}>DAILY THROUGHPUT</span>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary, #0f172a)' }}>{h.capacity?.toLocaleString('en-IN') || 2500} MT / Day</strong>
                    </div>
                    <span style={{ fontSize: '12px', color: '#0b72e7', fontWeight: 600 }}>Active Gate ➔</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 10: SECURITY AUDIT TRAIL & ACCESS CONTROLS */}
        {/* ============================================================== */}
        {activeTab === 'audit' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Security Audit Trail &amp; Access Controls</h1>
                <p>Live immutable event log of all administrative actions, authentication attempts, and emergency kill-switch controls</p>
              </div>
              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-export"
                  onClick={loadAuditLogs}
                  disabled={auditLoading}
                >
                  {auditLoading ? 'Refreshing...' : '🔄 Refresh Trail'}
                </button>
              </div>
            </div>

            <div className="admin-table-card">
              <div className="admin-table-toolbar">
                <div className="admin-toolbar-search">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search action, actor email, or IP address..."
                    value={auditSearch}
                    onChange={e => setAuditSearch(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') loadAuditLogs(); }}
                  />
                </div>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={loadAuditLogs}
                >
                  Filter Logs
                </button>
              </div>

              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Timestamp</th>
                    <th>Action Event</th>
                    <th>Actor / User</th>
                    <th>IP / Origin</th>
                    <th>Details / Metadata</th>
                    <th>Emergency Kill-Switch</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                        No audit events recorded for current query.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map(log => (
                      <tr key={log.id}>
                        <td><code style={{ fontSize: '11px', color: '#64748b' }}>#{log.id}</code></td>
                        <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' })}
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: log.action.includes('Delete') || log.action.includes('Force') ? '#fee2e2' :
                                        log.action.includes('Role') || log.action.includes('Rights') ? '#fef3c7' : '#e0f2fe',
                            color: log.action.includes('Delete') || log.action.includes('Force') ? '#b91c1c' :
                                   log.action.includes('Role') || log.action.includes('Rights') ? '#b45309' : '#0369a1'
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '12px' }}>{log.userEmail || `User #${log.userId || '-'}`}</div>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>
                            {log.ipAddress || '127.0.0.1'}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.details || '-'}
                        </td>
                        <td>
                          {log.userId ? (
                            <button
                              type="button"
                              onClick={() => handleForceLogout(log.userId!, log.userEmail)}
                              disabled={forceLoggingOutId === log.userId}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: '1px solid #fecaca',
                                background: '#fef2f2',
                                color: '#dc2626',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                              title="Instantly revoke all active sessions for this user"
                            >
                              {forceLoggingOutId === log.userId ? 'Revoking...' : '⚡ Force Logout'}
                            </button>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>System Event</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 11: DYNAMIC SYSTEM SETTINGS */}
        {/* ============================================================== */}
        {activeTab === 'settings' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Dynamic System Settings &amp; Platform Controls</h1>
                <p>Configure live tariffs, fuel surcharges, taxation rates, and platform maintenance status without redeploying</p>
              </div>
              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-export"
                  onClick={loadSettings}
                  disabled={settingsLoading}
                >
                  {settingsLoading ? 'Refreshing...' : '🔄 Refresh Settings'}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              {settingsList.map(item => (
                <div
                  key={item.key}
                  style={{
                    background: 'var(--bg-card, #ffffff)',
                    border: '1px solid var(--border, #e2e8f0)',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      background: 'rgba(37, 99, 235, 0.08)',
                      color: '#2563eb',
                      fontWeight: 700,
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '4px'
                    }}>
                      {item.group}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                      {item.key}
                    </span>
                  </div>

                  <p style={{ margin: '8px 0 16px 0', fontSize: '13px', color: 'var(--text-secondary, #475569)', minHeight: '38px' }}>
                    {item.description || item.key}
                  </p>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {item.key === 'SYSTEM_MAINTENANCE_MODE' ? (
                      <select
                        value={editingSettings[item.key] ?? item.value}
                        onChange={e => setEditingSettings({ ...editingSettings, [item.key]: e.target.value })}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border, #cbd5e1)', background: 'var(--bg-card, #fff)', color: 'var(--text-primary, #0f172a)' }}
                      >
                        <option value="false">🟢 Operational (Normal Booking Active)</option>
                        <option value="true">🔴 Maintenance Mode (Freeze Bookings)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={editingSettings[item.key] ?? item.value}
                        onChange={e => setEditingSettings({ ...editingSettings, [item.key]: e.target.value })}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border, #cbd5e1)', background: 'var(--bg-card, #fff)', color: 'var(--text-primary, #0f172a)' }}
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => handleSaveSetting(item)}
                      disabled={savingKey === item.key}
                      style={{
                        padding: '8px 16px',
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: savingKey === item.key ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {savingKey === item.key ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 1: ADD CUSTOMER MODAL */}
        {/* ============================================================== */}
        {showAddCustomerModal && (
          <div className="st-modal-overlay" onClick={() => setShowAddCustomerModal(false)}>
            <div className="st-drawer-box" onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2>Add New Customer</h2>
                  <p>Register a verified client account</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowAddCustomerModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddCustomer}>
                <div className="st-drawer-body">
                  <div className="st-form-field">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Vikram Singhania"
                      value={newCustName}
                      onChange={e => setNewCustName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g., vikram@company.com"
                      value={newCustEmail}
                      onChange={e => setNewCustEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Mobile Number *</label>
                    <input
                      type="text"
                      placeholder="e.g., 9876543210"
                      value={newCustPhone}
                      onChange={e => setNewCustPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowAddCustomerModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit">
                    Save Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 2: UPDATE SHIPMENT STATUS MODAL (NEW) */}
        {/* ============================================================== */}
        {showUpdateShipmentModal && selectedShipment && (
          <div className="st-modal-overlay" onClick={() => setShowUpdateShipmentModal(false)}>
            <div className="st-drawer-box" onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2>Update Shipment Status</h2>
                  <p>Shipment: {selectedShipment.shipmentNo} ({selectedShipment.customer})</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowUpdateShipmentModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveShipmentStatus}>
                <div className="st-drawer-body">
                  <div className="st-form-field">
                    <label>Current Status</label>
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: '#ffffff'
                      }}
                    >
                      <option value="Pending">Pending (Awaiting Pickup)</option>
                      <option value="Picked Up">Picked Up (At Origin Hub)</option>
                      <option value="In Transit">In Transit (On Highway)</option>
                      <option value="Out for Delivery">Out for Delivery (Last Mile)</option>
                      <option value="Delivered">Delivered (Completed)</option>
                    </select>
                  </div>

                  <div className="st-form-field">
                    <label>Current Checkpoint / Location *</label>
                    <input
                      type="text"
                      placeholder="e.g., Jaipur Logistics Terminal or Delhi Ring Road"
                      value={newLocation}
                      onChange={e => setNewLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Milestone Notes / Driver Remarks</label>
                    <textarea
                      placeholder="e.g., Consignment inspected, seal locks intact, departed terminal."
                      value={milestoneNote}
                      onChange={e => setMilestoneNote(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
                    <div>Driver Assigned: <strong>{selectedShipment.driver}</strong></div>
                    <div>Vehicle Assigned: <strong>{selectedShipment.vehicle}</strong></div>
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowUpdateShipmentModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit">
                    Update Status &amp; Notify Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 3: ADD DRIVER MODAL (NEW) */}
        {/* ============================================================== */}
        {showAddDriverModal && (
          <div className="st-modal-overlay" onClick={() => setShowAddDriverModal(false)}>
            <div className="st-drawer-box" onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2>Register New Driver</h2>
                  <p>Add commercial fleet operator to system</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowAddDriverModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddDriver}>
                <div className="st-drawer-body">
                  <div className="st-form-field">
                    <label>Driver Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Jaswinder Singh"
                      value={newDriverName}
                      onChange={e => setNewDriverName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Mobile Number *</label>
                    <input
                      type="text"
                      placeholder="e.g., 9811223344"
                      value={newDriverPhone}
                      onChange={e => setNewDriverPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Driving License (DL) Number *</label>
                    <input
                      type="text"
                      placeholder="e.g., DL-042022001928"
                      value={newDriverDL}
                      onChange={e => setNewDriverDL(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>License Class</label>
                    <select
                      value={newDriverType}
                      onChange={e => setNewDriverType(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option>Commercial Heavy (HMV)</option>
                      <option>Commercial Medium (MMV)</option>
                      <option>Commercial Light (LMV)</option>
                    </select>
                  </div>

                  <div className="st-form-field">
                    <label>Base Terminal / Hub</label>
                    <select
                      value={newDriverHub}
                      onChange={e => setNewDriverHub(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option>Delhi Hub</option>
                      <option>Mumbai Hub</option>
                      <option>Bangalore Hub</option>
                      <option>Kolkata Hub</option>
                      <option>Ahmedabad Hub</option>
                      <option>Pune Hub</option>
                    </select>
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowAddDriverModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit">
                    Save Driver
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 4: ADD VEHICLE MODAL (NEW) */}
        {/* ============================================================== */}
        {showAddVehicleModal && (
          <div className="st-modal-overlay" onClick={() => setShowAddVehicleModal(false)}>
            <div className="st-drawer-box" onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2>Register Fleet Vehicle</h2>
                  <p>Add commercial transport truck or trailer</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowAddVehicleModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddVehicle}>
                <div className="st-drawer-body">
                  <div className="st-form-field">
                    <label>Registration Plate Number *</label>
                    <input
                      type="text"
                      placeholder="e.g., HR-55-XY-9876"
                      value={newPlateNo}
                      onChange={e => setNewPlateNo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Model &amp; Make *</label>
                    <input
                      type="text"
                      placeholder="e.g., Tata Signa 4825.TK or Eicher Pro 3019"
                      value={newVehicleModel}
                      onChange={e => setNewVehicleModel(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Vehicle Configuration</label>
                    <select
                      value={newVehicleType}
                      onChange={e => setNewVehicleType(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option>32ft Multi-Axle (MXL)</option>
                      <option>24ft Container Truck</option>
                      <option>19ft Heavy Medium</option>
                      <option>14ft Closed Body</option>
                      <option>8ft Express Pickup</option>
                    </select>
                  </div>

                  <div className="st-form-field">
                    <label>Payload Capacity (Tons)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="16"
                      value={newVehicleCapacity}
                      onChange={e => setNewVehicleCapacity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Assigned Terminal</label>
                    <select
                      value={newVehicleHub}
                      onChange={e => setNewVehicleHub(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option>Delhi Hub</option>
                      <option>Mumbai Hub</option>
                      <option>Bangalore Hub</option>
                      <option>Kolkata Hub</option>
                      <option>Ahmedabad Hub</option>
                      <option>Pune Hub</option>
                    </select>
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowAddVehicleModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit">
                    Save Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 5: EDIT USER DATA MODAL */}
        {/* ============================================================== */}
        {showEditUserModal && editingUser && (
          <div className="st-modal-overlay" onClick={() => setShowEditUserModal(false)}>
            <div className="st-drawer-box" onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2>Edit User Profile Data</h2>
                  <p>User #{editingUser.id} ({editingUser.email})</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowEditUserModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveUserEdit}>
                <div className="st-drawer-body">
                  <div className="st-form-field">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={editUserName}
                      onChange={e => setEditUserName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={editUserPhone}
                      onChange={e => setEditUserPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={editUserEmail}
                      onChange={e => setEditUserEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Account Status</label>
                    <select
                      value={editUserActive ? 'active' : 'suspended'}
                      onChange={e => setEditUserActive(e.target.value === 'active')}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="active">Active (Access Allowed)</option>
                      <option value="suspended">Suspended (Access Blocked)</option>
                    </select>
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowEditUserModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit" disabled={editUserLoading}>
                    {editUserLoading ? 'Saving...' : 'Save User Updates'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 6: ROLE ASSIGNMENT MODAL (SUPERADMIN ONLY) */}
        {/* ============================================================== */}
        {showRoleModal && roleModalUser && (
          <div className="st-modal-overlay" onClick={() => setShowRoleModal(false)}>
            <div className="st-drawer-box" onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2 style={{ color: '#b45309' }}>👑 Assign System Role</h2>
                  <p>Target User: {roleModalUser.name} ({roleModalUser.email})</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowRoleModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveRole}>
                <div className="st-drawer-body">
                  <div style={{ background: '#fef3c7', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fde68a', color: '#92400e', fontSize: '12px', marginBottom: '16px' }}>
                    Super Admin Privilege: Promoting a user to <strong>Admin</strong> grants them operational dashboard access. Promoting to <strong>SuperAdmin</strong> grants master rights.
                  </div>

                  <div className="st-form-field">
                    <label>Select Role *</label>
                    <select
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value as any)}
                      style={{ width: '100%', padding: '12px', border: '2px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', fontWeight: 600 }}
                    >
                      <option value="User">👤 Customer / Standard User (Shipping &amp; Tracking)</option>
                      <option value="Admin">⚡ Administrator (Operations, Bookings, Fleet &amp; Users)</option>
                      <option value="SuperAdmin">👑 Super Admin (Full Unrestricted Master Rights &amp; Delegation)</option>
                    </select>
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowRoleModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit" disabled={roleUpdating}>
                    {roleUpdating ? 'Assigning...' : 'Confirm Role Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 7: RIGHTS DELEGATION MODAL (SUPERADMIN ONLY) */}
        {/* ============================================================== */}
        {showRightsModal && rightsModalUser && (
          <div className="st-modal-overlay" onClick={() => setShowRightsModal(false)}>
            <div className="st-drawer-box" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2 style={{ color: '#4338ca' }}>🛡️ Super Admin Rights Delegation</h2>
                  <p>Assign specific permissions for: {rightsModalUser.name} ({rightsModalUser.role})</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowRightsModal(false)}
                >
                  &times;
                </button>
              </div>

              <div className="st-drawer-body">
                {rightsLoading ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Loading permissions registry...
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                      Toggle individual rights to grant or revoke access to specific subsystems:
                    </p>

                    <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '6px' }}>
                      {allSystemRights.map(perm => {
                        const isRevoked = revokedIds.includes(perm.id);
                        const isExplicitlyGranted = grantedIds.includes(perm.id);

                        return (
                          <div
                            key={perm.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px'
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{perm.code}</strong>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                [{perm.module}] {perm.description || perm.action}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  // Toggle grant
                                  if (isExplicitlyGranted) {
                                    setGrantedIds(prev => prev.filter(x => x !== perm.id));
                                  } else {
                                    setGrantedIds(prev => [...prev, perm.id]);
                                    setRevokedIds(prev => prev.filter(x => x !== perm.id));
                                  }
                                }}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: '1px solid #10b981',
                                  background: isExplicitlyGranted ? '#10b981' : '#ffffff',
                                  color: isExplicitlyGranted ? '#ffffff' : '#10b981'
                                }}
                              >
                                {isExplicitlyGranted ? '✓ Granted' : 'Grant'}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  // Toggle revoke
                                  if (isRevoked) {
                                    setRevokedIds(prev => prev.filter(x => x !== perm.id));
                                  } else {
                                    setRevokedIds(prev => [...prev, perm.id]);
                                    setGrantedIds(prev => prev.filter(x => x !== perm.id));
                                  }
                                }}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: '1px solid #ef4444',
                                  background: isRevoked ? '#ef4444' : '#ffffff',
                                  color: isRevoked ? '#ffffff' : '#ef4444'
                                }}
                              >
                                {isRevoked ? '✕ Revoked' : 'Revoke'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="st-drawer-actions">
                <button
                  type="button"
                  className="st-btn-cancel"
                  onClick={() => setShowRightsModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="st-btn-submit"
                  onClick={handleSaveRights}
                  disabled={rightsSaving}
                >
                  {rightsSaving ? 'Saving Rights...' : 'Save Rights Delegation'}
                </button>
              </div>
            </div>
          </div>
        )}
        {selectedLr && (
          <ConsignmentLRModal
            data={selectedLr}
            onClose={() => setSelectedLr(null)}
          />
        )}
      </main>
    </div>
  );
}
