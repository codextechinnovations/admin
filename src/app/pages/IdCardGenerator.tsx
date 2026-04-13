import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, User, Building2, Phone, MapPin, Calendar, CreditCard, Printer, X, Download } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { adminService } from '../../services/adminService';

interface TenantData {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  aadhaar?: string;
  altPhone?: string;
  idProofType?: string;
  idProofNumber?: string;
  address?: string;
  permanent_address?: string;
  occupation?: string;
  checkInDate?: string;
  monthlyRent?: number;
  status: string;
  bed_number?: number;
  roomNumber?: string;
  userPhoto?: string;
  passportPhoto?: string;
  id_proof?: string;
  pgId?: {
    name?: string;
    address?: string;
    area?: string;
    city?: string;
  };
}

const isValidObjectId = (id: string): boolean => {
  return /^[a-fA-F0-9]{24}$/.test(id);
};

export function IdCardGenerator() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [tenantList, setTenantList] = useState<TenantData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a tenant ID, name, or phone number');
      return;
    }

    const query = searchQuery.trim();
    
    setLoading(true);
    setError('');
    setTenant(null);
    setTenantList([]);

    try {
      if (isValidObjectId(query)) {
        const response = await adminService.getTenantById(query);
        if (response.success && response.data) {
          setTenant(response.data);
        } else {
          setError('Tenant not found');
        }
      } else {
        const response = await adminService.getTenants({ search: query, limit: 10 });
        if (response.success && response.data && response.data.length > 0) {
          setTenantList(response.data);
          if (response.data.length === 1) {
            setTenant(response.data[0]);
            setTenantList([]);
          } else {
            setShowDropdown(true);
          }
        } else {
          setError('No tenants found matching your search');
        }
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Failed to fetch tenant data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectTenant = (selectedTenant: TenantData) => {
    setTenant(selectedTenant);
    setTenantList([]);
    setShowDropdown(false);
    setSearchQuery(selectedTenant.name + ' - ' + selectedTenant.phone);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const tenantId = tenant?._id?.slice(-8).toUpperCase() || 'N/A';
  const pgName = tenant?.pgId?.name || 'ManageYourPG';
  const issuedOn = formatDate(tenant?.checkInDate);
  const aadhaarFmt = tenant?.aadhaar
    ? tenant.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')
    : 'XXXX XXXX XXXX';

  return (
    <div>
      <PageHeader
        title="ID Card Generator"
        description="Generate ID cards for tenants by searching with ID, name, or phone number"
      />

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter Tenant ID, Name, or Phone Number"
              className="w-full pl-11 pr-4 py-3 bg-input rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTenant(null);
                  setTenantList([]);
                  setError('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Tip: You can search by MongoDB ObjectId (24 chars), tenant name, or phone number
        </p>

        {/* Dropdown Results */}
        {showDropdown && tenantList.length > 0 && (
          <div className="mt-4 border border-border rounded-lg overflow-hidden bg-background">
            <div className="p-2 bg-muted/50 border-b border-border">
              <span className="text-sm font-medium">{tenantList.length} tenants found</span>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {tenantList.map((t) => (
                <button
                  key={t._id}
                  onClick={() => selectTenant(t)}
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3 border-b border-border last:border-b-0"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {t.id_proof || t.userPhoto || t.passportPhoto ? (
                      <img src={t.id_proof || t.userPhoto || t.passportPhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.phone} {t.pgId?.name ? `• ${t.pgId.name}` : ''}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    t.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-700' : 
                    t.status?.toLowerCase() === 'inactive' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {t.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}
      </motion.div>

      {/* ID Card Preview */}
      {tenant && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          {/* Actions */}
          <div className="flex gap-3 mb-6 no-print">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print ID Card
            </button>
            <button
              onClick={() => {
                setTenant(null);
                setSearchQuery('');
                setError('');
              }}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search Another
            </button>
          </div>

          {/* ID Cards Wrapper */}
          <div className="id-card-wrapper">
            {/* FRONT CARD */}
            <div className="id-card id-card-front">
              {/* Header */}
              <div className="card-front-header">
                <div className="header-top">
                  <div className="logo-box">
                    <div className="logo-slash"></div>
                    <span className="logo-text">PG</span>
                  </div>
                  <div className="pg-title-wrap">
                    <div className="pg-title">{pgName}</div>
                    <div className="pg-sub">Tenant Identification Card</div>
                  </div>
                  <div className="active-badge">● ACTIVE</div>
                </div>
                <div className="id-card-label">
                  <div className="id-card-label-dot"></div>
                  <span className="id-card-label-text">Official ID Card</span>
                </div>
              </div>

              {/* Body */}
              <div className="card-front-body">
                <div className="photo-ring">
                  <div className="photo-inner">
                    {tenant.id_proof || tenant.userPhoto || tenant.passportPhoto ? (
                      <img src={tenant.id_proof || tenant.userPhoto || tenant.passportPhoto} alt={tenant.name} />
                    ) : (
                      <div className="photo-placeholder">👤</div>
                    )}
                  </div>
                </div>

                <div className="tenant-name">{tenant.name}</div>
                <div className="tenant-occ">{tenant.occupation || 'Resident'}</div>

                <div className="details-grid">
                  <div className="detail-item detail-item-accent">
                    <div className="detail-label">Tenant ID</div>
                    <div className="detail-value detail-value-blue">#{tenantId}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Status</div>
                    <div className="detail-value" style={{ color: '#15803d' }}>✓ Verified</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Mobile</div>
                    <div className="detail-value">{tenant.phone}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Check-In</div>
                    <div className="detail-value">{issuedOn}</div>
                  </div>
                  <div className="detail-item detail-item-full">
                    <div className="detail-label">Aadhaar</div>
                    <div className="detail-value">{aadhaarFmt}</div>
                  </div>
                </div>
              </div>

              {/* Bottom Strip */}
              <div className="card-front-strip">
                <div>
                  <div className="strip-left">Issued On</div>
                  <div className="strip-id">{issuedOn}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="strip-right">Powered by</div>
                  <div className="strip-id" style={{ fontSize: '10px', letterSpacing: '.5px' }}>Get Your Stay</div>
                </div>
              </div>
            </div>

            {/* BACK CARD */}
            <div className="id-card id-card-back">
              <div className="accent-bar"></div>
              
              <div className="card-back-header">
                <div>
                  <div className="back-title">{pgName}</div>
                  <div className="back-sub">Tenant ID — Reverse Side</div>
                </div>
                <div className="logo-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                  <div className="logo-slash"></div>
                  <span className="logo-text" style={{ fontSize: '11px' }}>PG</span>
                </div>
              </div>

              <div className="card-back-body">
                {/* QR Section */}
                <div>
                  <div className="back-section-title">Quick Verify</div>
                  <div className="qr-row">
                    <div className="qr-box">
                      <div className="qr-placeholder">
                        <span style={{ fontSize: '9px', fontWeight: 'bold' }}>QR CODE</span>
                      </div>
                    </div>
                    <div className="qr-info">
                      <div className="qr-title">Scan to Verify</div>
                      <div className="qr-detail">
                        {tenant.name}<br/>
                        ID: #{tenantId}<br/>
                        {pgName}<br/>
                        Ph: {tenant.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tenant Info */}
                <div>
                  <div className="back-section-title">Tenant Details</div>
                  <div className="back-info-grid">
                    <div className="back-info-item back-info-item-full">
                      <div className="back-info-label">Home Address</div>
                      <div className="back-info-value">{tenant.address || tenant.permanent_address || '—'}</div>
                    </div>
                    <div className="back-info-item">
                      <div className="back-info-label">Alt. Contact</div>
                      <div className="back-info-value">{tenant.alt_phone || '—'}</div>
                    </div>
                    <div className="back-info-item">
                      <div className="back-info-label">Email</div>
                      <div className="back-info-value" style={{ fontSize: '9.5px' }}>{tenant.email || '—'}</div>
                    </div>
                  </div>
                </div>

                {/* Rules */}
                <div>
                  <div className="back-section-title">Card Rules</div>
                  <div className="rules-list">
                    <div className="rule-item">
                      <div className="rule-dot"></div>
                      <span>Must be carried within premises at all times</span>
                    </div>
                    <div className="rule-item">
                      <div className="rule-dot"></div>
                      <span>This card is strictly non-transferable</span>
                    </div>
                    <div className="rule-item">
                      <div className="rule-dot"></div>
                      <span>Report loss or damage to manager immediately</span>
                    </div>
                    <div className="rule-item">
                      <div className="rule-dot"></div>
                      <span>Invalid if lamination is removed or card is defaced</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-back-footer">
                <div className="back-footer-left">
                  Issued: {issuedOn}<br/>
                  Powered by Codex Tech Innovations
                </div>
                <div className="back-footer-right">
                  <div className="sig-label">Authorised by</div>
                  <div className="sig-name">{pgName} Management</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Print Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        @media print {
          body * {
            visibility: hidden;
          }
          .id-card-wrapper, .id-card-wrapper * {
            visibility: visible;
          }
          .id-card-wrapper {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
          .no-print {
            display: none !important;
          }
        }
        
        .id-card-wrapper {
          display: flex;
          gap: 28px;
          align-items: flex-start;
        }
        
        .id-card {
          width: 330px;
          height: 510px;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 20px 60px rgba(26,26,78,0.25), 0 4px 16px rgba(0,0,0,0.1);
          flex-shrink: 0;
        }
        
        /* FRONT CARD */
        .id-card-front {
          background: #ffffff;
          display: flex;
          flex-direction: column;
        }
        
        .card-front-header {
          background: linear-gradient(135deg, #1a1a4e 0%, #2d2d7e 50%, #1e3a8a 100%);
          padding: 18px 18px 14px;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .card-front-header::before {
          content: '';
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          top: -60px;
          right: -40px;
        }
        
        .card-front-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #22c55e, #3b82f6, #8b5cf6);
        }
        
        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }
        
        .logo-box {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05));
          flex-shrink: 0;
        }
        
        .logo-slash {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 42%;
          background: linear-gradient(135deg, #22c55e, #15803d);
          opacity: 0.9;
          clip-path: polygon(0 60%, 100% 20%, 100% 100%, 0 100%);
        }
        
        .logo-text {
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: -0.5px;
          position: relative;
          z-index: 1;
        }
        
        .pg-title-wrap {
          flex: 1;
          padding: 0 10px;
        }
        
        .pg-title {
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }
        
        .pg-sub {
          color: rgba(255,255,255,0.55);
          font-size: 9px;
          font-weight: 500;
          margin-top: 1px;
        }
        
        .active-badge {
          background: rgba(34,197,94,0.2);
          border: 1px solid rgba(34,197,94,0.5);
          color: #4ade80;
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 20px;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        
        .id-card-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 6px;
          padding: 5px 12px;
          position: relative;
          z-index: 1;
        }
        
        .id-card-label-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
        }
        
        .id-card-label-text {
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        
        .card-front-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 18px 0;
        }
        
        .photo-ring {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg, #22c55e, #3b82f6, #8b5cf6);
          flex-shrink: 0;
          margin-bottom: 10px;
        }
        
        .photo-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #fff;
          background: #f1f5f9;
        }
        
        .photo-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .photo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: #94a3b8;
        }
        
        .tenant-name {
          font-size: 16px;
          font-weight: 800;
          color: #1a1a2e;
          letter-spacing: -0.4px;
          text-align: center;
          margin-bottom: 2px;
        }
        
        .tenant-occ {
          font-size: 10px;
          font-weight: 500;
          color: #64748b;
          text-align: center;
          margin-bottom: 14px;
        }
        
        .details-grid {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 10px;
        }
        
        .detail-item {
          background: #f8faff;
          border: 0.5px solid #e2e8f0;
          border-radius: 8px;
          padding: 7px 10px;
        }
        
        .detail-item-accent {
          background: #eff6ff;
          border-color: #bfdbfe;
        }
        
        .detail-item-full {
          grid-column: span 2;
        }
        
        .detail-label {
          font-size: 8px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        
        .detail-value {
          font-size: 11px;
          font-weight: 600;
          color: #1a1a2e;
        }
        
        .detail-value-blue {
          color: #1e40af;
        }
        
        .card-front-strip {
          background: linear-gradient(135deg, #1a1a4e, #1e3a8a);
          padding: 10px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        
        .strip-left {
          color: rgba(255,255,255,0.65);
          font-size: 9px;
          font-weight: 500;
        }
        
        .strip-right {
          color: rgba(255,255,255,0.65);
          font-size: 9px;
          font-weight: 500;
          text-align: right;
        }
        
        .strip-id {
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        
        /* BACK CARD */
        .id-card-back {
          background: linear-gradient(155deg, #0d0d2e 0%, #1a1a4e 40%, #1e3a8a 100%);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }
        
        .id-card-back::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
          top: -100px;
          right: -80px;
        }
        
        .id-card-back::after {
          content: '';
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(34,197,94,0.07);
          bottom: -60px;
          left: -40px;
        }
        
        .accent-bar {
          height: 3px;
          background: linear-gradient(90deg, #22c55e, #3b82f6, #8b5cf6);
          flex-shrink: 0;
        }
        
        .card-back-header {
          padding: 16px 18px 12px;
          border-bottom: 0.5px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }
        
        .back-title {
          color: #fff;
          font-size: 13px;
          font-weight: 700;
        }
        
        .back-sub {
          color: rgba(255,255,255,0.45);
          font-size: 9px;
          margin-top: 1px;
        }
        
        .card-back-body {
          flex: 1;
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          z-index: 1;
          overflow: hidden;
        }
        
        .qr-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        
        .qr-box {
          background: #fff;
          border-radius: 12px;
          padding: 6px;
          flex-shrink: 0;
        }
        
        .qr-placeholder {
          width: 90px;
          height: 90px;
          background: #f1f5f9;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .qr-info {
          flex: 1;
        }
        
        .qr-title {
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .qr-detail {
          color: rgba(255,255,255,0.55);
          font-size: 9.5px;
          line-height: 1.7;
        }
        
        .back-section-title {
          color: rgba(255,255,255,0.5);
          font-size: 8.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }
        
        .back-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        
        .back-info-item {
          background: rgba(255,255,255,0.07);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 7px 10px;
        }
        
        .back-info-item-full {
          grid-column: span 2;
        }
        
        .back-info-label {
          color: rgba(255,255,255,0.4);
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 2px;
        }
        
        .back-info-value {
          color: #fff;
          font-size: 10.5px;
          font-weight: 600;
        }
        
        .rules-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .rule-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.6);
          font-size: 9.5px;
        }
        
        .rule-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #22c55e;
          flex-shrink: 0;
        }
        
        .card-back-footer {
          padding: 10px 18px;
          border-top: 0.5px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }
        
        .back-footer-left {
          color: rgba(255,255,255,0.4);
          font-size: 8.5px;
        }
        
        .back-footer-right {
          text-align: right;
        }
        
        .sig-label {
          color: rgba(255,255,255,0.35);
          font-size: 8px;
        }
        
        .sig-name {
          color: rgba(255,255,255,0.75);
          font-size: 10px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
