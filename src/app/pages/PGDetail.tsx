import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Users, CheckCircle, Clock, Shield, Home, Building2,
  Snowflake, UserPlus, DoorOpen, AlertCircle, Loader2, PowerOff, Power, RefreshCw,
  Trash2, Phone, Mail, Calendar, Bed, Hash, FileText, Camera, Upload, X,
  Wind, Bath, Layers, Briefcase, MapPinned, Edit3, MessageCircle
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Modal, FormField, Badge } from '../../components/Modal';
import { useToast } from '../components/Toast';
import { adminService } from '../../services/adminService';
import { WhatsAppPreviewModal } from '../components/WhatsAppPreviewModal';
import { PG, PGRoom, Tenant } from '../../types/api';

type TabKey = 'overview' | 'tenants' | 'rooms' | 'freeze';

interface RoomForm {
  roomNumber: string;
  type: string;
  floor: string;
  beds: number;
  rentPerBed: number;
  status: string;
  ac: boolean;
  attachedBathroom: boolean;
  balcony: boolean;
  furnishing: string;
  deposit: number;
  maintenance: number;
  description: string;
  amenities: string;
}

interface TenantForm {
  name: string;
  phone: string;
  altPhone: string;
  email: string;
  pgId: string;
  roomId: string;
  bedNumber: string;
  monthlyRent: number;
  securityDeposit: number;
  aadhaar: string;
  occupation: string;
  address: string;
  joiningDate: string;
  userPhoto: string;
  aadhaarCardPhoto: string;
}

const ROOM_TYPES = [
  { value: 'single', label: 'Single Sharing', beds: 1 },
  { value: 'double', label: 'Double Sharing', beds: 2 },
  { value: 'triple', label: 'Triple Sharing', beds: 3 },
  { value: 'four', label: '4 Sharing', beds: 4 },
];

const emptyRoomForm: RoomForm = {
  roomNumber: '', type: 'double', floor: '1', beds: 2, rentPerBed: 0, status: 'available',
  ac: false, attachedBathroom: false, balcony: false,
  furnishing: 'unfurnished', deposit: 0, maintenance: 0,
  description: '', amenities: ''
};

const emptyTenantForm: TenantForm = {
  name: '', phone: '', altPhone: '', email: '', pgId: '', roomId: '', bedNumber: '',
  monthlyRent: 0, securityDeposit: 0, aadhaar: '',
  occupation: '', address: '', joiningDate: new Date().toISOString().split('T')[0],
  userPhoto: '', aadhaarCardPhoto: ''
};

const toNumber = (v: any): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v) || 0;
  if (typeof v === 'object') {
    if (typeof v.amount === 'number') return v.amount;
    if (typeof v.value === 'number') return v.value;
    if (typeof v.rent === 'number') return v.rent;
    if (typeof v.price === 'number') return v.price;
  }
  return 0;
};

const extractArray = (res: any): any[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.results)) return res.results;
  if (Array.isArray(res.tenants)) return res.tenants;
  if (Array.isArray(res.rooms)) return res.rooms;
  if (res.data && typeof res.data === 'object') {
    if (Array.isArray(res.data.results)) return res.data.results;
    if (Array.isArray(res.data.data)) return res.data.data;
  }
  return [];
};

export function PGDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [pg, setPG] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const [pgTenants, setPgTenants] = useState<Tenant[]>([]);
  const [pgRooms, setPgRooms] = useState<PGRoom[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomForm, setRoomForm] = useState<RoomForm>(emptyRoomForm);
  const [savingRoom, setSavingRoom] = useState(false);

  const [showAddTenant, setShowAddTenant] = useState(false);
  const [tenantForm, setTenantForm] = useState<TenantForm>(emptyTenantForm);
  const [savingTenant, setSavingTenant] = useState(false);

  const [showFreezeDialog, setShowFreezeDialog] = useState(false);
  const [freezeReason, setFreezeReason] = useState('');
  const [freezing, setFreezing] = useState(false);

  const [showVerifyConfirm, setShowVerifyConfirm] = useState(false);

  const [whatsAppTarget, setWhatsAppTarget] = useState<{ name: string; phone: string; label: string } | null>(null);

  const tenantPhotoRef = useRef<HTMLInputElement>(null);
  const tenantAadhaarRef = useRef<HTMLInputElement>(null);

  const handleTenantImage = (e: React.ChangeEvent<HTMLInputElement>, field: 'userPhoto' | 'aadhaarCardPhoto') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setTenantForm((prev) => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const fetchPG = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await adminService.getPGById(id);
      if (res.success) {
        setPG(res.data);
      } else {
        showToast('error', res.message || 'Failed to load PG');
        navigate('/pg-management');
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to load PG');
      navigate('/pg-management');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPG();
  }, [id]);

  const loadTabData = async (tab: TabKey) => {
    if (!id) return;
    setLoadingTab(true);
    try {
      if (tab === 'tenants') {
        const inline = extractArray(pg?.tenants);
        if (inline.length > 0) {
          setPgTenants(inline);
        } else {
          const res = await adminService.getPGTenants(id);
          setPgTenants(extractArray(res));
        }
      } else if (tab === 'rooms') {
        const inline = extractArray(pg?.rooms);
        if (inline.length > 0) {
          setPgRooms(inline);
        } else {
          const res = await adminService.getPGRooms(id);
          setPgRooms(extractArray(res));
        }
      }
    } catch (err) {
      console.error(`Error loading ${tab}:`, err);
      showToast('error', `Failed to load ${tab}`);
    } finally {
      setLoadingTab(false);
    }
  };

  useEffect(() => {
    if (pg && (activeTab === 'tenants' || activeTab === 'rooms')) {
      loadTabData(activeTab);
    }
  }, [activeTab, pg?._id, pg?.tenants?.length, pg?.rooms?.length]);

  const handleVerify = async () => {
    if (!pg?._id) return;
    if (pg.isFrozen) {
      showToast('error', 'Unfreeze this PG before changing verification');
      return;
    }
    try {
      await adminService.verifyPG(pg._id, { isVerified: !pg.isVerified });
      showToast('success', `PG ${!pg.isVerified ? 'verified' : 'unverified'}`);
      setShowVerifyConfirm(false);
      fetchPG();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to update verification');
    }
  };

  const handleDelete = async () => {
    if (!pg?._id) return;
    if (pg.isFrozen) {
      showToast('error', 'Unfreeze this PG before deleting');
      return;
    }
    if (!confirm(`Delete "${pg.name}"? This action cannot be undone.`)) return;
    try {
      const res = await adminService.deletePG(pg._id);
      if (res.success) {
        showToast('success', 'PG deleted');
        navigate('/pg-management');
      } else {
        showToast('error', res.message || 'Failed to delete PG');
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to delete PG');
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (pg?.isFrozen) {
      showToast('error', 'Cannot add rooms to a frozen PG');
      return;
    }
    try {
      setSavingRoom(true);
      const res = await adminService.addRoom(id, {
        roomNumber: roomForm.roomNumber,
        type: roomForm.type,
        floor: roomForm.floor,
        beds: Number(roomForm.beds),
        capacity: Number(roomForm.beds),
        rentPerBed: Number(roomForm.rentPerBed),
        status: roomForm.status,
        ac: roomForm.ac,
        attachedBathroom: roomForm.attachedBathroom,
        attached_bathroom: roomForm.attachedBathroom,
        balcony: roomForm.balcony,
        furnishing: roomForm.furnishing,
        deposit: Number(roomForm.deposit),
        securityDeposit: Number(roomForm.deposit),
        maintenance: Number(roomForm.maintenance),
        description: roomForm.description,
        amenities: roomForm.amenities
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
      });
      if (res.success) {
        showToast('success', 'Room added');
        setShowAddRoom(false);
        setRoomForm(emptyRoomForm);
        loadTabData('rooms');
        fetchPG();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to add room');
    } finally {
      setSavingRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!id) return;
    if (!confirm('Delete this room? Occupied beds will block this action.')) return;
    try {
      const res = await adminService.deleteRoom(id, roomId);
      if (res.success) {
        showToast('success', 'Room deleted');
        loadTabData('rooms');
        fetchPG();
      } else {
        showToast('error', res.message || 'Failed to delete room');
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (pg?.isFrozen) {
      showToast('error', 'Cannot add tenants to a frozen PG');
      return;
    }
    try {
      setSavingTenant(true);
      const payload: any = {
        name: tenantForm.name,
        phone: tenantForm.phone,
        alt_phone: tenantForm.altPhone || undefined,
        email: tenantForm.email || undefined,
        pgId: id,
        roomId: tenantForm.roomId || undefined,
        bedNumber: tenantForm.bedNumber ? Number(tenantForm.bedNumber) : undefined,
        monthlyRent: Number(tenantForm.monthlyRent),
        securityDeposit: Number(tenantForm.securityDeposit),
        aadhaar: tenantForm.aadhaar || undefined,
        occupation: tenantForm.occupation || undefined,
        address: tenantForm.address || undefined,
        permanent_address: tenantForm.address || undefined,
        joiningDate: tenantForm.joiningDate
          ? new Date(tenantForm.joiningDate).toISOString()
          : new Date().toISOString(),
        userPhoto: tenantForm.userPhoto || undefined,
        aadhaarCardPhoto: tenantForm.aadhaarCardPhoto || undefined,
        id_proof: tenantForm.aadhaarCardPhoto || tenantForm.userPhoto || undefined,
        status: 'ACTIVE',
      };
      const res = await adminService.createTenant(payload);
      if (res.success) {
        showToast('success', 'Tenant added');
        setShowAddTenant(false);
        setTenantForm(emptyTenantForm);
        loadTabData('tenants');
        fetchPG();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to add tenant');
    } finally {
      setSavingTenant(false);
    }
  };

  const handleFreezeToggle = async () => {
    if (!id) return;
    const isFrozen = !!pg?.isFrozen;
    if (!isFrozen && !freezeReason.trim()) {
      showToast('error', 'Please provide a reason to freeze the PG');
      return;
    }
    try {
      setFreezing(true);
      const res = await adminService.freezePG(id, {
        freeze: !isFrozen,
        reason: freezeReason || undefined,
      });
      if (res.success) {
        showToast('success', `PG ${!isFrozen ? 'frozen' : 'unfrozen'} successfully`);
        setShowFreezeDialog(false);
        setFreezeReason('');
        fetchPG();
      } else {
        showToast('error', res.message || 'Failed to update freeze status');
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to update freeze status');
    } finally {
      setFreezing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pg) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Top breadcrumb / back */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/pg-management" className="hover:text-primary flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to PG Management
        </Link>
        <span>/</span>
        <span className="text-foreground">{pg.name}</span>
      </div>

      <PageHeader
        title={pg.name}
        description={`${pg.address || ''}${pg.address ? ', ' : ''}${pg.city || ''}${pg.state ? ', ' + pg.state : ''}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setShowFreezeDialog(true);
                setFreezeReason(pg.freezeReason || '');
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                pg.isFrozen
                  ? 'bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border border-cyan-500/30'
                  : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/30'
              }`}
            >
              {pg.isFrozen ? <><Power className="w-4 h-4" /> Unfreeze</> : <><PowerOff className="w-4 h-4" /> Freeze</>}
            </button>
            <button
              onClick={() => setShowVerifyConfirm(true)}
              disabled={pg.isFrozen}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-border hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Shield className={`w-4 h-4 ${pg.isVerified ? 'text-green-500' : 'text-yellow-500'}`} />
              {pg.isVerified ? 'Unverify' : 'Verify'}
            </button>
            <button
              onClick={handleDelete}
              disabled={pg.isFrozen}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        }
      />

      {/* Status badges row */}
      <div className="flex flex-wrap items-center gap-2">
        {pg.isFrozen && (
          <Badge variant="info">
            <Snowflake className="w-3 h-3 mr-1" /> Frozen
          </Badge>
        )}
        <Badge variant={pg.isVerified ? 'success' : 'warning'}>
          {pg.isVerified ? <><CheckCircle className="w-3 h-3 mr-1" /> Verified</> : <><Clock className="w-3 h-3 mr-1" /> Pending Verification</>}
        </Badge>
        <Badge variant={pg.isAvailable ? 'success' : 'danger'}>
          {pg.isAvailable ? 'Active' : 'Inactive'}
        </Badge>
        <Badge variant="info">{pg.type}</Badge>
      </div>

      {pg.isFrozen && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 flex items-start gap-3">
          <Snowflake className="w-5 h-5 text-cyan-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-cyan-500">This PG is frozen</p>
            {pg.freezeReason && (
              <p className="text-xs text-muted-foreground mt-1">Reason: {pg.freezeReason}</p>
            )}
            {pg.frozenAt && (
              <p className="text-xs text-muted-foreground">Since: {new Date(pg.frozenAt).toLocaleString()}</p>
            )}
          </div>
        </div>
      )}

      {/* Mini stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-semibold capitalize">{pg.type}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DoorOpen className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Rooms</p>
              <p className="font-semibold">{pg.totalRooms || 0}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tenants</p>
              <p className="font-semibold">{pgTenants.length || (pg.tenantsCount ?? '-')}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Home className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Occupancy</p>
              <p className="font-semibold">{pg.occupancyRate ? `${Math.round(pg.occupancyRate)}%` : '-'}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* TABS */}
      <div className="bg-card/50 backdrop-blur-xl rounded-xl border border-border overflow-hidden">
        <div className="flex gap-1 border-b border-border overflow-x-auto px-2">
          {([
            { key: 'overview', label: 'Overview', icon: Home },
            { key: 'tenants', label: `Tenants (${pgTenants.length})`, icon: Users },
            { key: 'rooms', label: `Rooms (${pgRooms.length})`, icon: DoorOpen },
            { key: 'freeze', label: 'Freeze', icon: Snowflake },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as TabKey)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6 min-h-[300px]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Property Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm font-medium">{pg.address || '-'}</p>
                        <p className="text-xs text-muted-foreground">{pg.city || '-'}, {pg.state || '-'} {pg.pincode || ''}</p>
                        {pg.area && <p className="text-xs text-muted-foreground">{pg.area}</p>}
                      </div>
                    </div>
                    {pg.phone && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm font-medium">{pg.phone}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWhatsAppTarget({ name: pg.name, phone: pg.phone, label: 'PG' })}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500 text-white hover:bg-green-600 transition-colors shrink-0"
                          title="Open WhatsApp chat with pre-filled message"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </button>
                      </div>
                    )}
                    {pg.ownerId && (
                      <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <Users className="w-4 h-4 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-blue-500">Owner</p>
                          <p className="text-sm font-medium">{pg.ownerId.name || '-'}</p>
                          {pg.ownerId.phone && <p className="text-xs text-muted-foreground">{pg.ownerId.phone}</p>}
                        </div>
                        {pg.ownerId.phone && (
                          <button
                            type="button"
                            onClick={() => setWhatsAppTarget({
                              name: pg.ownerId.name || 'Owner',
                              phone: pg.ownerId.phone,
                              label: 'PG Owner'
                            })}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500 text-white hover:bg-green-600 transition-colors shrink-0"
                            title="Open WhatsApp chat with pre-filled message"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Pricing & Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Long Term Rent</p>
                      <p className="text-lg font-semibold">₹{toNumber(pg.longTermRent).toLocaleString()}<span className="text-xs text-muted-foreground">/mo</span></p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Short Term Rent</p>
                      <p className="text-lg font-semibold">₹{toNumber(pg.shortTermRent).toLocaleString()}<span className="text-xs text-muted-foreground">/day</span></p>
                    </div>
                    {pg.price && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground">Base Price</p>
                        <p className="text-lg font-semibold">₹{toNumber(pg.price).toLocaleString()}</p>
                      </div>
                    )}
                    {pg.rating !== undefined && pg.rating !== null && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground">Rating</p>
                        <p className="text-lg font-semibold">⭐ {toNumber(pg.rating) || 0}</p>
                      </div>
                    )}
                  </div>

                  {pg.amenities && pg.amenities.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-1.5">
                        {pg.amenities.map((a: string) => (
                          <span key={a} className="px-2 py-1 text-xs bg-muted/50 rounded-md">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {pg.description && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Description</h3>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm leading-relaxed">{pg.description}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">{pg.createdAt ? new Date(pg.createdAt).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">{pg.updatedAt ? new Date(pg.updatedAt).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">PG ID</p>
                  <p className="text-sm font-mono text-muted-foreground">#{pg._id?.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium capitalize">{pg.status || 'active'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Tenants</h3>
                  <p className="text-sm text-muted-foreground">{pgTenants.length} tenant(s) at this PG</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadTabData('tenants')}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setTenantForm(emptyTenantForm);
                      setShowAddTenant(true);
                    }}
                    disabled={pg.isFrozen}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Tenant
                  </button>
                </div>
              </div>

              {loadingTab ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : pgTenants.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No tenants yet</p>
                  <p className="text-sm mt-1">Add the first tenant to this PG</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pgTenants.map((t) => (
                    <div key={t._id} className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {t.userPhoto || t.id_proof ? (
                            <img src={t.userPhoto || t.id_proof} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-border" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg shrink-0">
                              {t.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate">{t.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {t.phone}</span>
                              {t.alt_phone && <span className="flex items-center gap-1">Alt: {t.alt_phone}</span>}
                            </div>
                            {t.email && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                                <Mail className="w-3 h-3 shrink-0" /> {t.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-sm">₹{toNumber(t.monthlyRent).toLocaleString()}<span className="text-xs text-muted-foreground">/mo</span></p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Room {(t.roomId as any)?.roomNumber || t.roomNumber || 'Unassigned'} • {t.status}
                          </p>
                          {t.joiningDate && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                              <Calendar className="w-3 h-3" /> {new Date(t.joiningDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {(t.occupation || t.address || t.permanent_address || t.aadhaar) && (
                        <div className="pt-3 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {t.occupation && (
                            <p className="flex items-center gap-1.5 text-muted-foreground">
                              <Briefcase className="w-3 h-3 shrink-0" /> <span className="truncate">{t.occupation}</span>
                            </p>
                          )}
                          {t.aadhaar && (
                            <p className="flex items-center gap-1.5 text-muted-foreground">
                              <Hash className="w-3 h-3 shrink-0" /> {t.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                            </p>
                          )}
                          {(t.address || t.permanent_address) && (
                            <p className="flex items-start gap-1.5 text-muted-foreground md:col-span-2">
                              <MapPinned className="w-3 h-3 mt-0.5 shrink-0" /> <span className="line-clamp-2">{t.address || t.permanent_address}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Rooms</h3>
                  <p className="text-sm text-muted-foreground">{pgRooms.length} room(s) configured • {pg.totalRooms || 0} total capacity</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadTabData('rooms')}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setRoomForm(emptyRoomForm);
                      setShowAddRoom(true);
                    }}
                    disabled={pg.isFrozen}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <DoorOpen className="w-4 h-4" />
                    Add Room
                  </button>
                </div>
              </div>

              {loadingTab ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : pgRooms.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  <DoorOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No rooms yet</p>
                  <p className="text-sm mt-1">Add the first room to this PG</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pgRooms.map((room) => {
                    const hasAc = room.ac || room.AC;
                    const hasBath = room.attachedBathroom || room.attached_bathroom;
                    const hasBalcony = room.balcony;
                    const amenities: string[] = Array.isArray(room.amenities)
                      ? room.amenities
                      : typeof room.amenities === 'string'
                      ? room.amenities.split(',').map((a: string) => a.trim()).filter(Boolean)
                      : [];
                    const depositAmt = toNumber(room.deposit ?? room.securityDeposit);
                    const maintAmt = toNumber(room.maintenance);
                    return (
                      <div key={room._id} className="p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4 text-muted-foreground" />
                              <p className="font-semibold">Room {room.roomNumber}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 capitalize">{room.type || 'standard'} sharing{room.furnishing ? ` • ${String(room.furnishing).replace('-', ' ')}` : ''}</p>
                          </div>
                          <Badge variant={room.status === 'available' ? 'success' : room.status === 'occupied' ? 'warning' : 'default'}>
                            {room.status || 'available'}
                          </Badge>
                        </div>

                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">Floor</span>
                            <span className="font-medium">{room.floor || '-'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">Beds</span>
                            <span className="font-medium flex items-center gap-1">
                              <Bed className="w-3 h-3" /> {room.occupiedBeds || 0} / {room.beds}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">Rent/bed</span>
                            <span className="font-medium text-green-500">₹{toNumber(room.rentPerBed).toLocaleString()}</span>
                          </div>
                          {depositAmt > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground text-xs">Deposit</span>
                              <span className="font-medium">₹{depositAmt.toLocaleString()}</span>
                            </div>
                          )}
                          {maintAmt > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground text-xs">Maintenance</span>
                              <span className="font-medium">₹{maintAmt.toLocaleString()}/mo</span>
                            </div>
                          )}
                        </div>

                        {(hasAc || hasBath || hasBalcony || amenities.length > 0) && (
                          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
                            {hasAc && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-500/10 text-blue-500 rounded">
                                <Wind className="w-3 h-3" /> AC
                              </span>
                            )}
                            {hasBath && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-cyan-500/10 text-cyan-500 rounded">
                                <Bath className="w-3 h-3" /> Attached Bath
                              </span>
                            )}
                            {hasBalcony && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-500/10 text-purple-500 rounded">
                                <Layers className="w-3 h-3" /> Balcony
                              </span>
                            )}
                            {amenities.map((a) => (
                              <span key={a} className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded">
                                {a}
                              </span>
                            ))}
                          </div>
                        )}

                        {room.description && (
                          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50 line-clamp-2">
                            {room.description}
                          </p>
                        )}

                        <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                          <button
                            onClick={() => handleDeleteRoom(room._id)}
                            disabled={pg.isFrozen}
                            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'freeze' && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="text-lg font-semibold">Freeze Management</h3>

              <div className={`rounded-lg p-5 ${pg.isFrozen ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-blue-500/10 border border-blue-500/30'}`}>
                <div className="flex items-start gap-3">
                  {pg.isFrozen ? (
                    <Snowflake className="w-6 h-6 text-cyan-500 mt-0.5" />
                  ) : (
                    <PowerOff className="w-6 h-6 text-blue-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      {pg.isFrozen ? 'PG is currently frozen' : 'PG is currently active'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {pg.isFrozen
                        ? 'No new tenants, rooms, or verification changes can be made. Existing operations continue.'
                        : 'Freezing blocks new tenant/room additions and verification changes for this PG.'}
                    </p>
                    {pg.freezeReason && (
                      <div className="mt-3 p-3 bg-background/50 rounded">
                        <p className="text-xs text-muted-foreground mb-1">Reason on file:</p>
                        <p className="text-sm">{pg.freezeReason}</p>
                      </div>
                    )}
                    {pg.frozenAt && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Frozen on: {new Date(pg.frozenAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowFreezeDialog(true);
                  setFreezeReason(pg.freezeReason || '');
                }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  pg.isFrozen
                    ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {pg.isFrozen ? (
                  <><Power className="w-4 h-4" /> Unfreeze this PG</>
                ) : (
                  <><Snowflake className="w-4 h-4" /> Freeze this PG</>
                )}
              </button>

              <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">What happens when a PG is frozen?</p>
                <ul className="space-y-1 list-disc list-inside text-xs">
                  <li>New tenants cannot be added</li>
                  <li>New rooms cannot be added or deleted</li>
                  <li>Verification status cannot be changed</li>
                  <li>The PG cannot be deleted</li>
                  <li>Existing tenants, payments, and bookings continue normally</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD ROOM MODAL */}
      {showAddRoom && (
        <Modal isOpen={showAddRoom} onClose={() => setShowAddRoom(false)} title={`Add Room to ${pg.name}`} size="lg">
          <form onSubmit={handleAddRoom}>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Room Number *" required>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    placeholder="e.g., 101"
                    required
                  />
                </FormField>
                <FormField label="Floor">
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                    placeholder="e.g., 1"
                  />
                </FormField>
                <FormField label="Status">
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={roomForm.status}
                    onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Sharing Type *" required>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={roomForm.type}
                    onChange={(e) => {
                      const t = ROOM_TYPES.find(r => r.value === e.target.value);
                      setRoomForm({ ...roomForm, type: e.target.value, beds: t?.beds || roomForm.beds });
                    }}
                  >
                    {ROOM_TYPES.map(rt => (
                      <option key={rt.value} value={rt.value}>{rt.label} ({rt.beds} bed{rt.beds > 1 ? 's' : ''})</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Furnishing">
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={roomForm.furnishing}
                    onChange={(e) => setRoomForm({ ...roomForm, furnishing: e.target.value })}
                  >
                    <option value="unfurnished">Unfurnished</option>
                    <option value="semi-furnished">Semi-furnished</option>
                    <option value="fully-furnished">Fully furnished</option>
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField label="Beds" required>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={roomForm.beds}
                    onChange={(e) => setRoomForm({ ...roomForm, beds: parseInt(e.target.value) || 1 })}
                    min="1"
                    required
                  />
                </FormField>
                <FormField label="Rent / Bed (₹)">
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={roomForm.rentPerBed}
                    onChange={(e) => setRoomForm({ ...roomForm, rentPerBed: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </FormField>
                <FormField label="Deposit (₹)">
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={roomForm.deposit}
                    onChange={(e) => setRoomForm({ ...roomForm, deposit: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </FormField>
              </div>

              <FormField label="Maintenance (₹/mo)">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={roomForm.maintenance}
                  onChange={(e) => setRoomForm({ ...roomForm, maintenance: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </FormField>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Amenities</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'ac' as const, label: 'AC', icon: Wind },
                    { key: 'attachedBathroom' as const, label: 'Attached Bath', icon: Bath },
                    { key: 'balcony' as const, label: 'Balcony', icon: Layers },
                  ].map(({ key, label, icon: Icon }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        roomForm[key]
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-muted/20 hover:bg-muted/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={roomForm[key]}
                        onChange={(e) => setRoomForm({ ...roomForm, [key]: e.target.checked })}
                      />
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <FormField label="Other Amenities (comma-separated)">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={roomForm.amenities}
                  onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })}
                  placeholder="e.g., WiFi, TV, Wardrobe, Geyser"
                />
              </FormField>

              <FormField label="Description / Notes">
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  rows={2}
                  placeholder="Any special notes about this room..."
                />
              </FormField>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowAddRoom(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingRoom}
                className="px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg disabled:opacity-50"
              >
                {savingRoom ? 'Adding...' : 'Add Room'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD TENANT MODAL */}
      {showAddTenant && (
        <Modal isOpen={showAddTenant} onClose={() => setShowAddTenant(false)} title={`Add Tenant to ${pg.name}`} size="lg">
          <form onSubmit={handleAddTenant}>
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-xs text-blue-500 font-medium">PG</p>
                <p className="font-medium">{pg.name}</p>
              </div>

              {/* Photos */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Passport Size Photo">
                  <div className="flex items-center gap-3">
                    {tenantForm.userPhoto ? (
                      <div className="relative">
                        <img src={tenantForm.userPhoto} alt="Preview" className="w-20 h-24 object-cover rounded-lg border border-border" />
                        <button
                          type="button"
                          onClick={() => setTenantForm({ ...tenantForm, userPhoto: '' })}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => tenantPhotoRef.current?.click()}
                        className="w-20 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        <Camera className="w-5 h-5" />
                        <span className="text-xs mt-1">Photo</span>
                      </button>
                    )}
                    <input
                      ref={tenantPhotoRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleTenantImage(e, 'userPhoto')}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">Upload passport size photo</p>
                  </div>
                </FormField>

                <FormField label="Aadhaar Card Photo">
                  <div className="flex items-center gap-3">
                    {tenantForm.aadhaarCardPhoto ? (
                      <div className="relative">
                        <img src={tenantForm.aadhaarCardPhoto} alt="Aadhaar Preview" className="w-20 h-24 object-cover rounded-lg border border-border" />
                        <button
                          type="button"
                          onClick={() => setTenantForm({ ...tenantForm, aadhaarCardPhoto: '' })}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => tenantAadhaarRef.current?.click()}
                        className="w-20 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        <Upload className="w-5 h-5" />
                        <span className="text-xs mt-1">Aadhaar</span>
                      </button>
                    )}
                    <input
                      ref={tenantAadhaarRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleTenantImage(e, 'aadhaarCardPhoto')}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">Upload Aadhaar card photo</p>
                  </div>
                </FormField>
              </div>

              {/* Personal info */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Full Name *" required>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={tenantForm.name}
                    onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                    required
                  />
                </FormField>
                <FormField label="Phone *" required>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={tenantForm.phone}
                    onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Alternate Phone">
                  <input
                    type="tel"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={tenantForm.altPhone}
                    onChange={(e) => setTenantForm({ ...tenantForm, altPhone: e.target.value })}
                    placeholder="Optional"
                  />
                </FormField>
                <FormField label="Email">
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={tenantForm.email}
                    onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                    placeholder="Optional"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Occupation">
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background"
                      value={tenantForm.occupation}
                      onChange={(e) => setTenantForm({ ...tenantForm, occupation: e.target.value })}
                      placeholder="e.g., Student, Software Engineer"
                    />
                  </div>
                </FormField>
                <FormField label="Joining Date">
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={tenantForm.joiningDate}
                    onChange={(e) => setTenantForm({ ...tenantForm, joiningDate: e.target.value })}
                  />
                </FormField>
              </div>

              <FormField label="Permanent Address">
                <div className="relative">
                  <MapPinned className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <textarea
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background"
                    value={tenantForm.address}
                    onChange={(e) => setTenantForm({ ...tenantForm, address: e.target.value })}
                    rows={2}
                    placeholder="Home / permanent address"
                  />
                </div>
              </FormField>

              {/* Room assignment */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Assign Room">
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={tenantForm.roomId}
                    onChange={(e) => setTenantForm({ ...tenantForm, roomId: e.target.value })}
                  >
                    <option value="">— No room yet —</option>
                    {pgRooms.filter(r => r.status !== 'maintenance').map(r => (
                      <option key={r._id} value={r._id}>
                        Room {r.roomNumber} ({r.type}, {r.beds} beds)
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Bed Number">
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={tenantForm.bedNumber}
                    onChange={(e) => setTenantForm({ ...tenantForm, bedNumber: e.target.value })}
                    min="1"
                    placeholder="e.g., 1"
                  />
                </FormField>
              </div>

              {/* Financials */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Monthly Rent (₹)">
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={tenantForm.monthlyRent}
                    onChange={(e) => setTenantForm({ ...tenantForm, monthlyRent: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </FormField>
                <FormField label="Security Deposit (₹)">
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={tenantForm.securityDeposit}
                    onChange={(e) => setTenantForm({ ...tenantForm, securityDeposit: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </FormField>
              </div>

              <FormField label="Aadhaar Number">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={tenantForm.aadhaar}
                  onChange={(e) => setTenantForm({ ...tenantForm, aadhaar: e.target.value })}
                  placeholder="12-digit Aadhaar"
                  maxLength={12}
                />
              </FormField>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowAddTenant(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingTenant}
                className="px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg disabled:opacity-50"
              >
                {savingTenant ? 'Adding...' : 'Add Tenant'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* FREEZE CONFIRM DIALOG */}
      {showFreezeDialog && (
        <Modal isOpen={showFreezeDialog} onClose={() => { setShowFreezeDialog(false); setFreezeReason(''); }} title={pg.isFrozen ? 'Unfreeze PG' : 'Freeze PG'} size="md">
          <div className="space-y-4">
            <div className={`flex items-start gap-3 p-3 rounded-lg ${pg.isFrozen ? 'bg-cyan-500/10' : 'bg-amber-500/10'}`}>
              {pg.isFrozen ? (
                <Power className="w-5 h-5 text-cyan-500 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              )}
              <div>
                <p className="font-medium">
                  {pg.isFrozen ? `Unfreeze "${pg.name}"?` : `Freeze "${pg.name}"?`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {pg.isFrozen
                    ? 'The PG will return to normal operation. New tenants, rooms, and verification changes will be allowed.'
                    : 'After freezing, the PG owner will not be able to add new tenants or rooms. Verification and deletion will be blocked.'}
                </p>
              </div>
            </div>

            {!pg.isFrozen && (
              <FormField label="Reason for freezing *" required>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  rows={3}
                  placeholder="e.g., Payment overdue, compliance issue, owner request..."
                  required
                />
              </FormField>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowFreezeDialog(false); setFreezeReason(''); }}
                className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFreezeToggle}
                disabled={freezing || (!pg.isFrozen && !freezeReason.trim())}
                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${
                  pg.isFrozen ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {freezing && <Loader2 className="w-4 h-4 animate-spin" />}
                {pg.isFrozen ? 'Unfreeze' : 'Freeze PG'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* VERIFY CONFIRM DIALOG */}
      {showVerifyConfirm && (
        <Modal isOpen={showVerifyConfirm} onClose={() => setShowVerifyConfirm(false)} title={pg.isVerified ? 'Unverify PG' : 'Verify PG'} size="md">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10">
              <Shield className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">
                  {pg.isVerified ? `Unverify "${pg.name}"?` : `Verify "${pg.name}"?`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {pg.isVerified
                    ? 'The PG will lose its verified badge and may not be featured in the app.'
                    : 'The PG will receive a verified badge and gain trust from tenants.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowVerifyConfirm(false)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerify}
                className="px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg"
              >
                {pg.isVerified ? 'Unverify' : 'Verify'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* WHATSAPP PREVIEW / EDIT MODAL */}
      {whatsAppTarget && (
        <WhatsAppPreviewModal
          open={!!whatsAppTarget}
          onClose={() => setWhatsAppTarget(null)}
          phone={whatsAppTarget.phone}
          ownerName={whatsAppTarget.name}
          context={`Recipient: ${whatsAppTarget.label}`}
        />
      )}
    </div>
  );
}
