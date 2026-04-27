import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  UserCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { adminService } from '../../services/adminService';
import { get } from '../../services/apiClient';

interface PGOwner {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'approved' | 'rejected';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PG {
  _id: string;
  name: string;
  type: string;
  totalRooms: number;
  address: string;
  city: string;
  isVerified: boolean;
  isAvailable: boolean;
}

export function PGOwnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [owner, setOwner] = useState<PGOwner | null>(null);
  const [pgs, setPgs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ownerRes, pgsRes] = await Promise.all([
        get<{ success: boolean; data: PGOwner }>(`/admin/pg-owners/${id}`),
        get<{ success: boolean; data: PG[] }>(`/admin/pg-owners/${id}/pgs`)
      ]);
      if (ownerRes.success) setOwner(ownerRes.data);
      if (pgsRes.success) setPgs(pgsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (status: 'approved' | 'rejected') => {
    if (!owner) return;
    setActionLoading(true);
    try {
      await adminService.verifyPGOwner(owner._id, {
        status,
        isVerified: status === 'approved'
      });
      navigate('/pg-owner-verification');
    } catch (err) {
      console.error('Error verifying:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Owner Not Found</h2>
        <button onClick={() => navigate('/pg-owner-verification')} className="mt-4 text-primary hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const statusConfig = {
    pending: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending', icon: Clock },
    approved: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Approved', icon: CheckCircle },
    rejected: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Rejected', icon: XCircle }
  };
  const status = statusConfig[owner.status];
  const StatusIcon = status.icon;

  return (
    <div>
      <button 
        onClick={() => navigate('/pg-owner-verification')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Verification
      </button>

      <PageHeader
        title={owner.name}
        description="PG Owner Details"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Owner Info */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Owner Information
              </h2>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{owner.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{owner.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{owner.email || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered Date</p>
                  <p className="font-medium">{new Date(owner.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {owner.address}, {owner.city}, {owner.state} - {owner.pincode}
                  </p>
                  {owner.latitude && owner.longitude && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Lat: {owner.latitude}, Lng: {owner.longitude}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* PGs Added */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5" />
              PG Properties ({pgs.length})
            </h2>

            {pgs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No PGs added yet
              </div>
            ) : (
              <div className="space-y-4">
                {pgs.map((pg) => (
                  <div key={pg._id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                    {pg.images && pg.images.length > 0 ? (
                      <div 
                        className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => { setSelectedImages(pg.images); setCurrentImageIndex(0); }}
                      >
                        <img 
                          src={pg.images[0]} 
                          alt={pg.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{pg.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {pg.type} • {pg.totalRooms} rooms • {pg.city}
                      </p>
                      {pg.images && pg.images.length > 1 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          +{pg.images.length - 1} more photos
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pg.isVerified 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {pg.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            
            {owner.status === 'pending' ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Approve this owner to make their PGs available for tenants.
                </p>
                <button
                  onClick={() => handleVerify('approved')}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  {actionLoading ? 'Processing...' : 'Approve Owner'}
                </button>
                <button
                  onClick={() => handleVerify('rejected')}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Owner
                </button>
              </div>
            ) : owner.status === 'approved' ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-medium text-green-500">Owner Verified</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Approved on {new Date(owner.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="font-medium text-red-500">Owner Rejected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Rejected on {new Date(owner.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-yellow-500/10 rounded-xl border border-yellow-500/20 p-6"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-600">Warning</h3>
                <p className="text-sm text-yellow-600/80 mt-1">
                  Upon approval, all {pgs.length} PG properties will be automatically verified and made available for booking.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {selectedImages.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setSelectedImages([])}
        >
          <button 
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            onClick={() => setSelectedImages([])}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <button 
            className="absolute left-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((currentImageIndex - 1 + selectedImages.length) % selectedImages.length); }}
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
          
          <img 
            src={selectedImages[currentImageIndex]} 
            alt={`Image ${currentImageIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          <button 
            className="absolute right-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((currentImageIndex + 1) % selectedImages.length); }}
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full">
            <p className="text-white text-sm">{currentImageIndex + 1} / {selectedImages.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}