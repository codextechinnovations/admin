import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, Users, CheckCircle, Clock, Eye, Trash2, Shield, Home, Building2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Modal, FormField, Badge } from '../../components/Modal';
import { adminService } from '../../services/adminService';
import { PG } from '../../types/api';

export function PGManagement() {
  const [pgs, setPGs] = useState<PG[]>([]);
  const [owners, setOwners] = useState<{_id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPG, setSelectedPG] = useState<PG | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pgDetails, setPgDetails] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<string>('');

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

  const fetchPGDetails = async (id: string) => {
    try {
      setDetailLoading(true);
      const response = await adminService.getPGById(id);
      if (response.success) {
        setPgDetails(response.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error fetching PG details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDetails = (pg: PG) => {
    setSelectedPG(pg);
    fetchPGDetails(pg._id);
  };

  const handleVerify = async (pgId: string, isVerified: boolean) => {
    try {
      await adminService.verifyPG(pgId, { isVerified });
      fetchPGs();
    } catch (err) {
      console.error('Error verifying PG:', err);
    }
  };

  const handleDelete = async (pgId: string) => {
    if (!confirm('Are you sure you want to delete this PG?')) return;
    try {
      await adminService.deletePG(pgId);
      fetchPGs();
    } catch (err) {
      console.error('Error deleting PG:', err);
    }
  };

  const handleAddPG = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await adminService.createPG(newPG);
      if (response.success) {
        setShowAddModal(false);
        setNewPG({ name: '', type: 'male', ownerId: '', address: '', city: '', state: '', pincode: '', totalRooms: 0, longTermRent: 0, shortTermRent: 0, amenities: [], description: '' });
        fetchPGs();
        fetchOwners();
      }
    } catch (err) {
      console.error('Error adding PG:', err);
    }
  };

  const columns = [
    { key: 'name', label: 'PG Name', sortable: true },
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
      key: 'longTermRent',
      label: 'Long Term',
      sortable: true,
      render: (v: number) => v ? `₹${v?.toLocaleString()}` : '-'
    },
    {
      key: 'shortTermRent',
      label: 'Short Term',
      sortable: true,
      render: (v: number) => v ? `₹${v?.toLocaleString()}` : '-'
    },
    {
      key: 'isVerified',
      label: 'Verified',
      render: (v: boolean) => v ? <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Yes</Badge> : <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
    },
    {
      key: 'isAvailable',
      label: 'Status',
      render: (v: boolean) => v ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: PG) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleViewDetails(row)} className="p-2 hover:bg-accent rounded-lg transition-colors" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => handleVerify(row._id, !row.isVerified)} className="p-2 hover:bg-accent rounded-lg transition-colors" title={row.isVerified ? 'Unverify' : 'Verify'}>
            <Shield className={`w-4 h-4 ${row.isVerified ? 'text-green-500' : 'text-yellow-500'}`} />
          </button>
          <button onClick={() => handleDelete(row._id)} className="p-2 hover:bg-accent rounded-lg transition-colors text-red-500" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const activePGs = pgs.filter(pg => pg.isAvailable);
  const verifiedPGs = pgs.filter(pg => pg.isVerified);
  const totalRooms = pgs.reduce((sum, pg) => sum + (pg.totalRooms || 0), 0);

  return (
    <div>
      <PageHeader
        title="PG Management"
        description="Manage all PGs on the platform. Assign owners and verify listings."
        action={
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" />
            Add New PG
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="PG Details" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : pgDetails ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{pgDetails.name}</h3>
                <p className="text-sm text-muted-foreground">{pgDetails.address}, {pgDetails.city}</p>
              </div>
            </div>

            {pgDetails.ownerId && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-xs text-blue-500 font-medium mb-1">Owner</p>
                <p className="font-medium">{pgDetails.ownerId.name}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{pgDetails.type}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Total Rooms</p>
                <p className="font-medium">{pgDetails.totalRooms}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Long Term Rent</p>
                <p className="font-medium">₹{pgDetails.longTermRent?.toLocaleString() || 0}/mo</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Short Term Rent</p>
                <p className="font-medium">₹{pgDetails.shortTermRent?.toLocaleString() || 0}/day</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={pgDetails.isAvailable ? 'success' : 'danger'}>
                  {pgDetails.isAvailable ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Verified</p>
                <Badge variant={pgDetails.isVerified ? 'success' : 'warning'}>
                  {pgDetails.isVerified ? 'Yes' : 'Pending'}
                </Badge>
              </div>
            </div>

            {pgDetails.rooms && pgDetails.rooms.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Rooms ({pgDetails.rooms.length})</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {pgDetails.rooms.map((room: any) => (
                    <div key={room._id} className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                      <span>Room {room.roomNumber}</span>
                      <Badge variant={room.status === 'available' ? 'success' : 'warning'}>{room.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

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
