import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import {
  getAdminOperationsSummary,
  type AdminOperationsSummary
} from '../../api/adminApi';
import './AdminDashboard.css';

interface BookingRow {
  bookingNo: string;
  customer: string;
  route: string;
  date: string;
  status: 'In Transit' | 'Delivered' | 'Pending' | 'Cancelled';
}

interface CustomerRow {
  name: string;
  email: string;
  mobile: string;
  status: 'Active' | 'Inactive';
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

const INITIAL_CUSTOMERS: CustomerRow[] = [
  { name: 'Rajesh Kumar', email: 'rajesh@example.com', mobile: '9876543210', status: 'Active' },
  { name: 'Priya Singh', email: 'priya@example.com', mobile: '9876543211', status: 'Active' },
  { name: 'Amit Patel', email: 'amit@example.com', mobile: '9876543212', status: 'Inactive' },
  { name: 'Neha Jain', email: 'neha@example.com', mobile: '9876543213', status: 'Active' },
  { name: 'Suresh Reddy', email: 'suresh@example.com', mobile: '9876543214', status: 'Active' },
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

type AdminTab = 'dashboard' | 'bookings' | 'customers' | 'shipments' | 'drivers' | 'vehicles' | 'reports';

export default function Dashboard() {
  const { user, logout } = useAuth();

  // Active view in Admin Panel
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Dashboard API data
  const [summary, setSummary] = useState<AdminOperationsSummary | null>(null);
  const [activeMonthHover, setActiveMonthHover] = useState<number | null>(7); // Aug default

  // Bookings list state
  const [bookingsList, setBookingsList] = useState<BookingRow[]>(INITIAL_BOOKINGS);
  const [bookingFilterStatus, setBookingFilterStatus] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');

  // Customer state
  const [customerList, setCustomerList] = useState<CustomerRow[]>(INITIAL_CUSTOMERS);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

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
  }, []);

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

    const newCust: CustomerRow = {
      name: newCustName.trim(),
      email: newCustEmail.trim(),
      mobile: newCustPhone.trim() || '9876543210',
      status: 'Active'
    };

    setCustomerList(prev => [newCust, ...prev]);
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

  const filteredCustomers = customerList.filter(c => {
    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.mobile.includes(q)
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
            Customers
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
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/landing" className="admin-switch-link" style={{ marginBottom: '8px' }}>
            🌐 Public Website
          </Link>

          <Link to="/" className="admin-switch-link">
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
          <div className="admin-topbar-search">
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

          <div className="admin-topbar-actions">
            <ThemeToggle />

            <div className="admin-user-profile-badge">
              <div className="admin-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="admin-user-details">
                <strong>{user?.name || 'Administrator'}</strong>
                <small>{user?.role || 'Admin'} • Super Access</small>
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

            {/* KPI STATS ROW */}
            <div className="admin-kpi-row">
              <div className="admin-kpi-card">
                <div className="admin-kpi-icon-wrap" style={{ background: '#e0f2fe', color: '#0b72e7' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div className="admin-kpi-content">
                  <span className="admin-kpi-title">Total Bookings</span>
                  <div className="admin-kpi-val-row">
                    <h2>{summary?.totalBookings ?? 1284}</h2>
                    <span className="admin-kpi-trend up">↑ 12.5%</span>
                  </div>
                  <small>vs previous 30 days</small>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                  </svg>
                </div>
                <div className="admin-kpi-content">
                  <span className="admin-kpi-title">Active In-Transit</span>
                  <div className="admin-kpi-val-row">
                    <h2>{summary?.inTransitShipments ?? 184}</h2>
                    <span className="admin-kpi-trend up">↑ 5.2%</span>
                  </div>
                  <small>Real-time on highways</small>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-icon-wrap" style={{ background: '#edfdf4', color: '#10b981' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="admin-kpi-content">
                  <span className="admin-kpi-title">Delivered (Month)</span>
                  <div className="admin-kpi-val-row">
                    <h2>{summary?.deliveredBookings ?? 1032}</h2>
                    <span className="admin-kpi-trend up">99.4% on-time</span>
                  </div>
                  <small>Zero cargo loss SLA</small>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-icon-wrap" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="admin-kpi-content">
                  <span className="admin-kpi-title">Gross Revenue</span>
                  <div className="admin-kpi-val-row">
                    <h2>₹{(summary?.successfulPaymentAmount ?? 4250000).toLocaleString('en-IN')}</h2>
                    <span className="admin-kpi-trend up">↑ 18.2%</span>
                  </div>
                  <small>GST Invoiced Total</small>
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: CUSTOMERS TAB */}
        {/* ============================================================== */}
        {activeTab === 'customers' && (
          <div className="admin-content-pad">
            <div className="admin-page-title-row">
              <div>
                <h1>Client Accounts Directory</h1>
                <p>Manage corporate shippers and enterprise accounts</p>
              </div>

              <div className="admin-title-actions">
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => setShowAddCustomerModal(true)}
                >
                  + Add Customer
                </button>
              </div>
            </div>

            <div className="admin-table-card">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Mobile Phone</th>
                    <th>Account Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td style={{ color: '#0b72e7' }}>{c.email}</td>
                      <td style={{ color: '#64748b' }}>{c.mobile}</td>
                      <td>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: c.status === 'Active' ? '#edfdf4' : '#fee2e2',
                            color: c.status === 'Active' ? '#10b981' : '#dc2626'
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn-view"
                          onClick={() => alert(`Client Profile:\nName: ${c.name}\nEmail: ${c.email}\nPhone: ${c.mobile}\nStatus: ${c.status}`)}
                        >
                          View Profile
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
      </main>
    </div>
  );
}
