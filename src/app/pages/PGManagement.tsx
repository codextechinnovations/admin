import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import {
  Plus, MapPin, Users, CheckCircle, Clock, Trash2, Shield, Home, Building2,
  Snowflake, ExternalLink
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Modal, FormField, Badge } from '../../components/Modal';
import { useToast } from '../components/Toast';
import { adminService } from '../../services/adminService';
import { PG } from '../../types/api';

export function PGManagement() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [pgs, setPGs] = useState<PG[]>([]);
  const [owners, setOwners] = useState<{_id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [newPG, setNewPG] = useState({
    name: '', type: 'male', ownerId: '', address: '', city: '', state: '', pincode: '',
    totalRooms: 0, longTermRent: 0, shortTermRent: 0, amenities: [] as string[], description: ''
  });

  useEffect(() => {
    fetchPGs();
    fetchOwners();
  }, []);

  useEffect(() => {
    fetchPGs();
  }, [ownerFilter]);

  const fetchOwners = async () => {
    try {
      const response = await adminService.getPGs({ limit: 100 });
      if (response.success) {
        const ownersMap = new Map<string, { _id: string; name: string }>();
        response.data.forEach((pg: any) => {
          if (pg.ownerId?._id && pg.ownerId?.name && !ownersMap.has(pg.ownerId._id)) {
            ownersMap.set(pg.ownerId._id, { _id: pg.ownerId._id, name: pg.ownerId.name });
          }
        });
        setOwners(Array.from(ownersMap.values()));
      }
    } catch (err) {
      console.error('Error fetching owners:', err);
    }
  };

  const fetchPGs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPGs({ limit: 100, ownerId: ownerFilter || undefined });
      if (response.success) {
        setPGs(response.data);
      } else {
        setError(response.message || 'Failed to fetch PGs');
      }
    } catch (err) {
      setError('Failed to fetch PGs');
      console.error('Error fetching PGs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (pgId: string, isVerified: boolean) => {
    const pg = pgs.find(p => p._id === pgId);
    if (pg?.isFrozen) {
      showToast('error', 'This PG is frozen. Unfreeze it before changing verification.');
      return;
    }
    try {
      await adminService.verifyPG(pgId, { isVerified });
      showToast('success', `PG ${isVerified ? 'verified' : 'unverified'}`);
      fetchPGs();
    } catch (err) {
      console.error('Error verifying PG:', err);
      showToast('error', 'Failed to update verification');
    }
  };

  const handleDelete = async (pgId: string) => {
    const pg = pgs.find(p => p._id === pgId);
    if (pg?.isFrozen) {
      showToast('error', 'Unfreeze this PG before deleting');
      return;
    }
    if (!confirm('Are you sure you want to delete this PG?')) return;
    try {
      setDeleteError(null);
      const response = await adminService.deletePG(pgId);
      if (response.success) {
        showToast('success', 'PG deleted');
        fetchPGs();
      } else {
        setDeleteError(response.message || 'Failed to delete PG');
      }
    } catch (err: any) {
      console.error('Error deleting PG:', err);
      setDeleteError(err.response?.data?.message || err.message || 'Failed to delete PG. Please try again.');
    }
  };

  const handleAddPG = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await adminService.createPG(newPG);
      if (response.success) {
        setShowAddModal(false);
        setNewPG({ name: '', type: 'male', ownerId: '', address: '', city: '', state: '', pincode: '', totalRooms: 0, longTermRent: 0, shortTermRent: 0, amenities: [], description: '' });
        showToast('success', 'PG created successfully');
        fetchPGs();
        fetchOwners();
      }
    } catch (err) {
      console.error('Error adding PG:', err);
      showToast('error', 'Failed to create PG');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'PG Name',
      sortable: true,
      render: (v: string, row: PG) => (
        <button
          onClick={() => navigate(`/pg-management/${row._id}`)}
          className="font-medium text-primary hover:underline flex items-center gap-1 text-left"
        >
          {v}
          <ExternalLink className="w-3 h-3 opacity-60" />
        </button>
      )
    },
    {
      key: 'ownerId',
      label: 'Owner',
      render: (v: any) => v?.name || '-'
    },
    { key: 'type', label: 'Type', sortable: true, render: (v: string) => <Badge variant="info">{v}</Badge> },
    {
      key: 'location',
      label: 'Location',
      render: (_: any, row: PG) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>{row.city || '-'}, {row.state || '-'}</span>
        </div>
      )
    },
    { key: 'totalRooms', label: 'Rooms', sortable: true, render: (v: number) => <span>{v || 0}</span> },
    {
      key: 'isVerified',
      label: 'Verified',
      render: (v: boolean) => v ? <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Yes</Badge> : <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
    },
    {
      key: 'isFrozen',
      label: 'Freeze',
      render: (v: boolean) => v
        ? <Badge variant="info"><Snowflake className="w-3 h-3 mr-1" /> Frozen</Badge>
        : <Badge variant="default">Active</Badge>
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => v === 'active' ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: PG) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/pg-management/${row._id}`)}
            className="p-2 hover:bg-accent rounded-lg transition-colors text-primary"
            title="Open Detail"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleVerify(row._id, !row.isVerified)}
            disabled={row.isFrozen}
            className="p-2 hover:bg-accent rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={row.isFrozen ? 'PG is frozen' : (row.isVerified ? 'Unverify' : 'Verify')}
          >
            <Shield className={`w-4 h-4 ${row.isVerified ? 'text-green-500' : 'text-yellow-500'}`} />
          </button>
          {row.status !== 'deleted' && (
            <button
              onClick={() => handleDelete(row._id)}
              disabled={row.isFrozen}
              className="p-2 hover:bg-accent rounded-lg transition-colors text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
              title={row.isFrozen ? 'PG is frozen' : 'Delete'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const activePGs = pgs.filter(pg => pg.isAvailable);
  const verifiedPGs = pgs.filter(pg => pg.isVerified);
  const frozenPGs = pgs.filter(pg => pg.isFrozen);
  const totalRooms = pgs.reduce((sum, pg) => sum + (pg.totalRooms || 0), 0);

  return (
    <div>
      {deleteError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex justify-between items-center">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>
      )}
      <PageHeader
        title="PG Management"
        description="Manage all PGs on the platform. Click a PG name to view full details, tenants, rooms, and freeze status."
        action={
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" />
            Add New PG
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Building2 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total PGs</p>
              <p className="text-2xl font-semibold">{pgs.length}</p>
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
              <p className="text-2xl font-semibold text-green-500">{activePGs.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <Shield className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified</p>
              <p className="text-2xl font-semibold text-yellow-500">{verifiedPGs.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 rounded-xl">
              <Snowflake className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Frozen</p>
              <p className="text-2xl font-semibold text-cyan-500">{frozenPGs.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Rooms</p>
              <p className="text-2xl font-semibold">{totalRooms}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Filter by Owner:</label>
            <select
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
            >
              <option value="">All Owners</option>
              {owners.map(owner => (
                <option key={owner._id} value={owner._id}>{owner.name}</option>
              ))}
            </select>
          </div>
          {ownerFilter && (
            <button onClick={() => setOwnerFilter('')} className="text-sm text-primary hover:underline">
              Clear filter
            </button>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <DataTable columns={columns} data={pgs} loading={loading} />
      </motion.div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New PG" size="lg">
        <form onSubmit={handleAddPG}>
          <div className="space-y-4">
            <FormField label="Select Owner *" required>
              <select
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newPG.ownerId}
                onChange={(e) => setNewPG({ ...newPG, ownerId: e.target.value })}
                required
              >
                <option value="">Select Owner</option>
                {owners.map(owner => (
                  <option key={owner._id} value={owner._id}>{owner.name}</option>
                ))}
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="PG Name *">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newPG.name}
                  onChange={(e) => setNewPG({ ...newPG, name: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Type *">
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newPG.type}
                  onChange={(e) => setNewPG({ ...newPG, type: e.target.value })}
                >
                  <option value="male">Male PG</option>
                  <option value="female">Female PG</option>
                  <option value="colive">Co-Live</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="City *">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newPG.city}
                  onChange={(e) => setNewPG({ ...newPG, city: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="State">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newPG.state}
                  onChange={(e) => setNewPG({ ...newPG, state: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Address">
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newPG.address}
                onChange={(e) => setNewPG({ ...newPG, address: e.target.value })}
                rows={2}
              />
            </FormField>

            <FormField label="Total Rooms">
              <input
                type="number"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newPG.totalRooms}
                onChange={(e) => setNewPG({ ...newPG, totalRooms: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Long Term Rent (₹/month)">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newPG.longTermRent}
                  onChange={(e) => setNewPG({ ...newPG, longTermRent: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </FormField>
              <FormField label="Short Term Rent (₹/day)">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newPG.shortTermRent}
                  onChange={(e) => setNewPG({ ...newPG, shortTermRent: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </FormField>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg">
              Add PG
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
