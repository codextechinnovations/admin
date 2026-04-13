import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, Calendar, CheckCircle, XCircle, Bed, IndianRupee, Building2, User } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Modal, FormField, Badge } from '../../components/Modal';
import { adminService } from '../../services/adminService';
import { Booking } from '../../types/api';

export function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [pgs, setPGs] = useState<{_id: string; name: string}[]>([]);
  const [tenants, setTenants] = useState<{_id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [pgFilter, setPgFilter] = useState<string>('');

  const [newBooking, setNewBooking] = useState({
    pgId: '', tenantId: '', roomNumber: '', bedCount: 1, monthlyRent: 0, securityDeposit: 0,
    checkInDate: new Date().toISOString().split('T')[0], expectedCheckOutDate: '', rentalType: 'longTerm'
  });

  useEffect(() => {
    fetchBookings();
    fetchPGs();
    fetchTenants();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [pgFilter]);

  const fetchPGs = async () => {
    try {
      const response = await adminService.getPGs({ limit: 100 });
      if (response.success) {
        setPGs(response.data.map((pg: any) => ({ _id: pg._id, name: pg.name })));
      }
    } catch (err) {
      console.error('Error fetching PGs:', err);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await adminService.getTenants({ limit: 100, status: 'active' });
      if (response.success) {
        setTenants(response.data.map((t: any) => ({ _id: t._id, name: t.name })));
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBookings({ limit: 100, pgId: pgFilter || undefined });
      if (response.success) {
        setBookings(response.data);
      } else {
        setError(response.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string, paymentStatus?: string) => {
    try {
      await adminService.updateBookingStatus(id, { status, paymentStatus });
      fetchBookings();
      if (showDetailModal && selectedBooking?._id === id) {
        const updated = await adminService.getBookingById(id);
        if (updated.success) setSelectedBooking(updated.data);
      }
    } catch (err) {
      console.error('Error updating booking:', err);
    }
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createBooking(newBooking);
      setShowAddModal(false);
      setNewBooking({ pgId: '', tenantId: '', roomNumber: '', bedCount: 1, monthlyRent: 0, securityDeposit: 0, checkInDate: new Date().toISOString().split('T')[0], expectedCheckOutDate: '', rentalType: 'longTerm' });
      fetchBookings();
    } catch (err) {
      console.error('Error adding booking:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'pending': return <Calendar className="w-3 h-3 mr-1" />;
      case 'completed': return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'cancelled': return <XCircle className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'info' | 'danger' => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'danger';
      default: return 'info';
    }
  };

  const columns = [
    {
      key: '_id',
      label: 'Booking ID',
      render: (v: string) => <span className="font-mono text-xs">{v?.slice(-8) || '-'}</span>
    },
    { 
      key: 'pgId', 
      label: 'PG', 
      render: (v: any) => v?.name || '-' 
    },
    { 
      key: 'tenantId', 
      label: 'Tenant', 
      render: (v: any) => v?.name || '-' 
    },
    { key: 'roomNumber', label: 'Room', sortable: true },
    { key: 'bedCount', label: 'Beds', sortable: true, render: (v: number) => <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {v}</span> },
    { 
      key: 'monthlyRent', 
      label: 'Rent', 
      sortable: true, 
      render: (v: number) => `₹${v?.toLocaleString() || 0}` 
    },
    { key: 'checkInDate', label: 'Check-in', sortable: true, render: (v: string) => new Date(v).toLocaleDateString() },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <Badge variant={getStatusVariant(v)}>
          {getStatusIcon(v)}
          {v?.charAt(0).toUpperCase() + v?.slice(1) || 'Unknown'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: any) => (
        <button onClick={() => { setSelectedBooking(row); setShowDetailModal(true); }} className="p-2 hover:bg-accent rounded-lg transition-colors">
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  const activeBookings = bookings.filter(b => b.status === 'active');
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = activeBookings.reduce((sum, b) => sum + (b.monthlyRent || 0), 0);

  return (
    <div>
      <PageHeader
        title="Booking Management"
        description="Track and manage all bookings across PGs. Assign PG and tenant for each booking."
        action={
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-semibold">{bookings.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold text-green-500">{activeBookings.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <Calendar className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-semibold text-yellow-500">{pendingBookings.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <IndianRupee className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-semibold">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Filter by PG:</label>
            <select
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
              value={pgFilter}
              onChange={(e) => setPgFilter(e.target.value)}
            >
              <option value="">All PGs</option>
              {pgs.map(pg => (
                <option key={pg._id} value={pg._id}>{pg.name}</option>
              ))}
            </select>
          </div>
          {pgFilter && (
            <button onClick={() => setPgFilter('')} className="text-sm text-primary hover:underline">
              Clear filter
            </button>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <DataTable columns={columns} data={bookings} loading={loading} />
      </motion.div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Booking" size="lg">
        <form onSubmit={handleAddBooking}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Select PG *" required>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newBooking.pgId}
                  onChange={(e) => setNewBooking({ ...newBooking, pgId: e.target.value })}
                  required
                >
                  <option value="">Select PG</option>
                  {pgs.map(pg => (
                    <option key={pg._id} value={pg._id}>{pg.name}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Select Tenant *" required>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newBooking.tenantId}
                  onChange={(e) => setNewBooking({ ...newBooking, tenantId: e.target.value })}
                  required
                >
                  <option value="">Select Tenant</option>
                  {tenants.map(tenant => (
                    <option key={tenant._id} value={tenant._id}>{tenant.name}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Room Number *">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newBooking.roomNumber}
                  onChange={(e) => setNewBooking({ ...newBooking, roomNumber: e.target.value })}
                  placeholder="e.g., 101"
                  required
                />
              </FormField>
              <FormField label="Number of Beds">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newBooking.bedCount}
                  onChange={(e) => setNewBooking({ ...newBooking, bedCount: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Monthly Rent (₹)">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newBooking.monthlyRent}
                  onChange={(e) => setNewBooking({ ...newBooking, monthlyRent: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </FormField>
              <FormField label="Security Deposit (₹)">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newBooking.securityDeposit}
                  onChange={(e) => setNewBooking({ ...newBooking, securityDeposit: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Check-in Date *">
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newBooking.checkInDate}
                  onChange={(e) => setNewBooking({ ...newBooking, checkInDate: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Expected Check-out">
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newBooking.expectedCheckOutDate}
                  onChange={(e) => setNewBooking({ ...newBooking, expectedCheckOutDate: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Rental Type">
              <select
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newBooking.rentalType}
                onChange={(e) => setNewBooking({ ...newBooking, rentalType: e.target.value })}
              >
                <option value="longTerm">Long Term (Monthly)</option>
                <option value="shortTerm">Short Term (Daily)</option>
              </select>
            </FormField>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg">
              Create Booking
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Booking Details" size="lg">
        {selectedBooking && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-mono text-xs text-muted-foreground">#{selectedBooking._id?.slice(-8)}</p>
                  <h3 className="text-lg font-semibold">Room {selectedBooking.roomNumber}</h3>
                </div>
              </div>
              <Badge variant={getStatusVariant(selectedBooking.status)}>
                {getStatusIcon(selectedBooking.status)}
                {selectedBooking.status?.charAt(0).toUpperCase() + selectedBooking.status?.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {selectedBooking.pgId && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <p className="text-xs text-blue-500 font-medium">PG</p>
                  </div>
                  <p className="font-medium">{selectedBooking.pgId.name}</p>
                </div>
              )}
              {selectedBooking.tenantId && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-green-500" />
                    <p className="text-xs text-green-500 font-medium">Tenant</p>
                  </div>
                  <p className="font-medium">{selectedBooking.tenantId.name}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={() => handleUpdateStatus(selectedBooking._id, 'active')} className={`px-3 py-1.5 rounded-lg text-sm ${selectedBooking.status === 'active' ? 'bg-green-500 text-white' : 'bg-muted hover:bg-muted/80'}`}>
                Active
              </button>
              <button onClick={() => handleUpdateStatus(selectedBooking._id, 'pending')} className={`px-3 py-1.5 rounded-lg text-sm ${selectedBooking.status === 'pending' ? 'bg-yellow-500 text-white' : 'bg-muted hover:bg-muted/80'}`}>
                Pending
              </button>
              <button onClick={() => handleUpdateStatus(selectedBooking._id, 'completed')} className={`px-3 py-1.5 rounded-lg text-sm ${selectedBooking.status === 'completed' ? 'bg-blue-500 text-white' : 'bg-muted hover:bg-muted/80'}`}>
                Completed
              </button>
              <button onClick={() => handleUpdateStatus(selectedBooking._id, 'cancelled')} className={`px-3 py-1.5 rounded-lg text-sm ${selectedBooking.status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-muted hover:bg-muted/80'}`}>
                Cancelled
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Beds</p>
                <p className="font-medium">{selectedBooking.bedCount}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Monthly Rent</p>
                <p className="font-medium text-green-500">₹{selectedBooking.monthlyRent?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Check-in</p>
                <p className="font-medium">{new Date(selectedBooking.checkInDate).toLocaleDateString()}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Expected Check-out</p>
                <p className="font-medium">
                  {selectedBooking.expectedCheckOutDate ? new Date(selectedBooking.expectedCheckOutDate).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
