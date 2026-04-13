import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, Trash2, CheckCircle, XCircle, UserPlus, Building2, AlertCircle, Camera, Upload, X } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Modal, FormField, Badge } from '../../components/Modal';
import { adminService } from '../../services/adminService';
import { Tenant } from '../../types/api';

export function Tenants() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [pgs, setPGs] = useState<{_id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [tenantDetails, setTenantDetails] = useState<any>(null);
  console.log(tenantDetails);
  
  const [detailLoading, setDetailLoading] = useState(false);
  const [pgFilter, setPgFilter] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const aadharInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editAadharInputRef = useRef<HTMLInputElement>(null);

  const [newTenant, setNewTenant] = useState({
    name: '', phone: '', email: '', pgId: '', roomNumber: '', monthlyRent: 0, securityDeposit: 0, aadhaarNumber: '', userPhoto: '', aadharCardPhoto: ''
  });

  const [editTenant, setEditTenant] = useState({
    name: '', phone: '', email: '', roomNumber: '', monthlyRent: 0, securityDeposit: 0, aadhaarNumber: '', userPhoto: '', aadharCardPhoto: ''
  });

  useEffect(() => {
    fetchTenants();
    fetchPGs();
  }, []);

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
      setLoading(true);
      const response = await adminService.getTenants({ limit: 100, pgId: pgFilter || undefined });
      if (response.success) {
        setTenants(response.data);
      } else {
        setError(response.message || 'Failed to fetch tenants');
      }
    } catch (err) {
      setError('Failed to fetch tenants');
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [pgFilter]);

  const fetchTenantDetails = async (id: string) => {
    try {
      setDetailLoading(true);
      const response = await adminService.getTenantById(id);
      if (response.success) {
        setTenantDetails(response.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error fetching tenant details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEditTenant = (tenant: any) => {
    setEditingTenant(tenant);
    setEditTenant({
      name: tenant.name || '',
      phone: tenant.phone || '',
      email: tenant.email || '',
      roomNumber: tenant.roomId?.roomNumber || '',
      monthlyRent: tenant.monthlyRent || 0,
      securityDeposit: tenant.securityDeposit || 0,
      aadhaarNumber: tenant.aadhaar || '',
      userPhoto: tenant.id_proof || '',
      aadharCardPhoto: tenant.id_proof || ''
    });
    setShowEditModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'userPhoto' | 'aadharCardPhoto', isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (isEdit) {
        setEditTenant(prev => ({ ...prev, [type]: base64 }));
      } else {
        setNewTenant(prev => ({ ...prev, [type]: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    
    try {
      setUploading(true);
      const response = await adminService.updateTenant(editingTenant._id, editTenant);
      if (response.success) {
        setShowEditModal(false);
        fetchTenants();
        fetchTenantDetails(editingTenant._id);
      }
    } catch (err) {
      console.error('Error updating tenant:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminService.updateTenantStatus(id, status);
      fetchTenants();
      if (showDetailModal) fetchTenantDetails(id);
    } catch (err) {
      console.error('Error updating tenant status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return;
    try {
      await adminService.deleteTenant(id);
      fetchTenants();
    } catch (err) {
      console.error('Error deleting tenant:', err);
    }
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await adminService.createTenant({
        ...newTenant,
        status: 'active',
        joiningDate: new Date()
      });
      if (response.success) {
        setShowAddModal(false);
        setNewTenant({ name: '', phone: '', email: '', pgId: '', roomNumber: '', monthlyRent: 0, securityDeposit: 0, aadhaarNumber: '' });
        fetchTenants();
      }
    } catch (err) {
      console.error('Error adding tenant:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'inactive': return <Badge variant="warning"><AlertCircle className="w-3 h-3 mr-1" /> Notice</Badge>;
      case 'moved_out': return <Badge variant="danger"><XCircle className="w-3 h-3 mr-1" /> Left</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const columns = [
    { 
      key: '_id', 
      label: 'ID', 
      render: (v: string) => <span className="font-mono text-xs text-muted-foreground">#{v?.slice(-8).toUpperCase() || '-'}</span>
    },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'phone', label: 'Phone' },
    { 
      key: 'pgId', 
      label: 'PG', 
      render: (v: any) => v?.name || '-'
    },
    { 
      key: 'roomId', 
      label: 'Room', 
      render: (v: any) => v?.roomNumber || '-'
    },
    { 
      key: 'bed_number', 
      label: 'Bed',
      render: (v: number) => v ? `Bed ${v}` : '-'
    },
    { key: 'monthlyRent', label: 'Monthly Rent', sortable: true, render: (v: number) => `₹${v?.toLocaleString() || 0}` },
    { key: 'joiningDate', label: 'Joining Date', sortable: true, render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => getStatusBadge(v)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleEditTenant(row)} className="p-2 hover:bg-accent rounded-lg transition-colors text-blue-500" title="Edit">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => fetchTenantDetails(row._id)} className="p-2 hover:bg-accent rounded-lg transition-colors" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row._id)} className="p-2 hover:bg-accent rounded-lg transition-colors text-red-500" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const activeTenants = tenants.filter(t => t.status === 'active');
  const noticePeriodTenants = tenants.filter(t => t.status === 'inactive');
  const leftTenants = tenants.filter(t => t.status === 'moved_out');
  const totalRent = tenants.reduce((sum, t) => sum + (t.monthlyRent || 0), 0);

  return (
    <div>
      <PageHeader
        title="Tenant Management"
        description="Manage all tenants across PGs. Assign PGs and track tenant status."
        action={
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg shadow-lg hover:shadow-xl transition-all">
            <UserPlus className="w-4 h-4" />
            Add Tenant
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <UserPlus className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tenants</p>
              <p className="text-2xl font-semibold">{tenants.length}</p>
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
              <p className="text-2xl font-semibold text-green-500">{activeTenants.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Notice Period</p>
              <p className="text-2xl font-semibold text-yellow-500">{noticePeriodTenants.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <Building2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Monthly Rent</p>
              <p className="text-2xl font-semibold">₹{totalRent.toLocaleString()}</p>
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
        <DataTable columns={columns} data={tenants} loading={loading} />
      </motion.div>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Tenant Details" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tenantDetails ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                {tenantDetails.id_proof ? (
                  <img 
                    src={tenantDetails.id_proof} 
                    alt={tenantDetails.name}
                    className="w-24 h-28 object-cover rounded-lg border-2 border-border"
                  />
                ) : (
                  <div className="w-24 h-28 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                    <UserPlus className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <button
                  onClick={() => handleEditTenant(tenantDetails)}
                  className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{tenantDetails.name}</h3>
                <p className="text-sm text-muted-foreground">ID: {tenantDetails._id?.slice(-8)}</p>
                {getStatusBadge(tenantDetails.status)}
              </div>
            </div>

            {tenantDetails.pgId && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-xs text-blue-500 font-medium mb-1">PG</p>
                <p className="font-medium">{tenantDetails.pgId.name}</p>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleUpdateStatus(tenantDetails._id, 'active')}
                className={`px-3 py-1.5 rounded-lg text-sm ${tenantDetails.status === 'active' ? 'bg-green-500 text-white' : 'bg-muted hover:bg-muted/80'}`}
              >
                Active
              </button>
              <button
                onClick={() => handleUpdateStatus(tenantDetails._id, 'inactive')}
                className={`px-3 py-1.5 rounded-lg text-sm ${tenantDetails.status === 'inactive' ? 'bg-yellow-500 text-white' : 'bg-muted hover:bg-muted/80'}`}
              >
                Notice Period
              </button>
              <button
                onClick={() => handleUpdateStatus(tenantDetails._id, 'moved_out')}
                className={`px-3 py-1.5 rounded-lg text-sm ${tenantDetails.status === 'moved_out' ? 'bg-red-500 text-white' : 'bg-muted hover:bg-muted/80'}`}
              >
                Left
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{tenantDetails.phone}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Alt Phone</p>
                <p className="font-medium">{tenantDetails.alt_phone || '-'}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{tenantDetails.email || '-'}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Occupation</p>
                <p className="font-medium">{tenantDetails.occupation || '-'}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Room</p>
                <p className="font-medium">{tenantDetails.roomId?.roomNumber || '-'}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Bed</p>
                <p className="font-medium">{tenantDetails.bed_number ? `Bed ${tenantDetails.bed_number}` : '-'}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Aadhaar</p>
                <p className="font-medium">{tenantDetails.aadhaar ? tenantDetails.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '-'}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Monthly Rent</p>
                <p className="font-medium text-green-500">₹{tenantDetails.monthlyRent?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Security Deposit</p>
                <p className="font-medium">₹{tenantDetails.securityDeposit?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Joining Date</p>
                <p className="font-medium">{tenantDetails.joiningDate ? new Date(tenantDetails.joiningDate).toLocaleDateString() : '-'}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 col-span-2">
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="font-medium">{tenantDetails.address || tenantDetails.permanent_address || '-'}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                {getStatusBadge(tenantDetails.status)}
              </div>
            </div>

            {tenantDetails.payments && tenantDetails.payments.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Payment History</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tenantDetails.payments.slice(0, 5).map((payment: any) => (
                    <div key={payment._id} className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm">₹{payment.amount?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={payment.status === 'success' ? 'success' : 'warning'}>{payment.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Tenant" size="md">
        <form onSubmit={handleAddTenant}>
          <div className="space-y-4">
            <FormField label="Select PG *" required>
              <select
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newTenant.pgId}
                onChange={(e) => setNewTenant({ ...newTenant, pgId: e.target.value })}
                required
              >
                <option value="">Select PG</option>
                {pgs.map(pg => (
                  <option key={pg._id} value={pg._id}>{pg.name}</option>
                ))}
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Full Name *">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Phone *">
                <input
                  type="tel"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newTenant.phone}
                  onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                  required
                />
              </FormField>
            </div>

            <FormField label="Email">
              <input
                type="email"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newTenant.email}
                onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Room Number">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newTenant.roomNumber}
                  onChange={(e) => setNewTenant({ ...newTenant, roomNumber: e.target.value })}
                  placeholder="e.g., 101"
                />
              </FormField>
              <FormField label="Monthly Rent (₹)">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newTenant.monthlyRent}
                  onChange={(e) => setNewTenant({ ...newTenant, monthlyRent: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </FormField>
            </div>

            <FormField label="Security Deposit (₹)">
              <input
                type="number"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newTenant.securityDeposit}
                onChange={(e) => setNewTenant({ ...newTenant, securityDeposit: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </FormField>

            <FormField label="Passport Size Photo">
              <div className="flex items-center gap-4">
                {newTenant.userPhoto ? (
                  <div className="relative">
                    <img src={newTenant.userPhoto} alt="Preview" className="w-20 h-24 object-cover rounded-lg border border-border" />
                    <button
                      type="button"
                      onClick={() => setNewTenant({ ...newTenant, userPhoto: '' })}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-xs mt-1">Photo</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'userPhoto', false)}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">Upload passport size photo</p>
              </div>
            </FormField>

            <FormField label="Aadhaar Card Photo">
              <div className="flex items-center gap-4">
                {newTenant.aadharCardPhoto ? (
                  <div className="relative">
                    <img src={newTenant.aadharCardPhoto} alt="Aadhaar Preview" className="w-20 h-24 object-cover rounded-lg border border-border" />
                    <button
                      type="button"
                      onClick={() => setNewTenant({ ...newTenant, aadharCardPhoto: '' })}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => aadharInputRef.current?.click()}
                    className="w-20 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-xs mt-1">Aadhaar</span>
                  </button>
                )}
                <input
                  ref={aadharInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'aadharCardPhoto', false)}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">Upload Aadhaar card photo</p>
              </div>
            </FormField>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg">
              Add Tenant
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={`Edit Tenant: ${editingTenant?.name}`} size="md">
        <form onSubmit={handleUpdateTenant}>
          <div className="space-y-4">
            <FormField label="Passport Size Photo">
              <div className="flex items-center gap-4">
                {editTenant.userPhoto ? (
                  <div className="relative">
                    <img src={editTenant.userPhoto} alt="Preview" className="w-24 h-28 object-cover rounded-lg border border-border" />
                    <button
                      type="button"
                      onClick={() => setEditTenant({ ...editTenant, userPhoto: '' })}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="w-24 h-28 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-xs mt-1">Upload Photo</span>
                  </button>
                )}
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'userPhoto', true)}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">Current: {editingTenant?.id_proof ? 'Photo uploaded' : 'No photo'}</p>
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Full Name *">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={editTenant.name}
                  onChange={(e) => setEditTenant({ ...editTenant, name: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Phone *">
                <input
                  type="tel"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={editTenant.phone}
                  onChange={(e) => setEditTenant({ ...editTenant, phone: e.target.value })}
                  required
                />
              </FormField>
            </div>

            <FormField label="Email">
              <input
                type="email"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={editTenant.email}
                onChange={(e) => setEditTenant({ ...editTenant, email: e.target.value })}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Room Number">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={editTenant.roomNumber}
                  onChange={(e) => setEditTenant({ ...editTenant, roomNumber: e.target.value })}
                  placeholder="e.g., 101"
                />
              </FormField>
              <FormField label="Monthly Rent (₹)">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={editTenant.monthlyRent}
                  onChange={(e) => setEditTenant({ ...editTenant, monthlyRent: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </FormField>
            </div>

            <FormField label="Security Deposit (₹)">
              <input
                type="number"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={editTenant.securityDeposit}
                onChange={(e) => setEditTenant({ ...editTenant, securityDeposit: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </FormField>

            <FormField label="Aadhaar Card Photo">
              <div className="flex items-center gap-4">
                {editTenant.aadharCardPhoto ? (
                  <div className="relative">
                    <img src={editTenant.aadharCardPhoto} alt="Aadhaar Preview" className="w-20 h-24 object-cover rounded-lg border border-border" />
                    <button
                      type="button"
                      onClick={() => setEditTenant({ ...editTenant, aadharCardPhoto: '' })}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => editAadharInputRef.current?.click()}
                    className="w-20 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-xs mt-1">Aadhaar</span>
                  </button>
                )}
                <input
                  ref={editAadharInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'aadharCardPhoto', true)}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">Upload Aadhaar card photo</p>
              </div>
            </FormField>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={uploading}
              className="px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg disabled:opacity-50"
            >
              {uploading ? 'Updating...' : 'Update Tenant'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
