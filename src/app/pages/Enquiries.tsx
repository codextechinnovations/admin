import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Inbox, Search, RefreshCw, CheckCircle, XCircle, Clock, Eye,
  Mail, Phone, MapPin, Smartphone, Globe, Building2, User, FileText,
  AlertCircle, Loader2, MessageSquare, Filter, Trash2, Trash, MessageCircle
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Modal, FormField, Badge } from '../../components/Modal';
import { useToast } from '../components/Toast';
import { enquiryService, PgEnquiry, EnquiryStatus, EnquirySource } from '../../services/enquiryService';
import { openWhatsApp, enquiryWhatsAppTemplate } from '../../utils/whatsapp';

const SOURCE_META: Record<string, { label: string; color: string; icon: any }> = {
  'mobile-app': { label: 'Mobile App', color: 'bg-blue-500/10 text-blue-500', icon: Smartphone },
  'website':    { label: 'Website',    color: 'bg-purple-500/10 text-purple-500', icon: Globe },
  'admin':      { label: 'Admin',      color: 'bg-amber-500/10 text-amber-500', icon: User },
  'other':      { label: 'Other',      color: 'bg-muted text-muted-foreground', icon: MessageSquare },
};

const STATUS_META: Record<EnquiryStatus, { label: string; variant: any }> = {
  pending:  { label: 'Pending',  variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger'  },
};

export function Enquiries() {
  const { showToast } = useToast();

  const [enquiries, setEnquiries] = useState<PgEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<EnquirySource | 'all'>('all');

  const [selected, setSelected] = useState<PgEnquiry | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showDecision, setShowDecision] = useState(false);
  const [decisionStatus, setDecisionStatus] = useState<EnquiryStatus>('approved');
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showDeleteOne, setShowDeleteOne] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PgEnquiry | null>(null);
  const [deletingOne, setDeletingOne] = useState(false);

  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState('');
  const [deletingAll, setDeletingAll] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [stats, setStats] = useState<{ byStatus: Record<string, number>; bySource: Record<string, number> }>({
    byStatus: {},
    bySource: {}
  });

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await enquiryService.list({
        limit: 200,
        status: statusFilter,
        source: sourceFilter === 'all' ? undefined : sourceFilter,
        search: search.trim() || undefined
      });
      if (res.success) {
        setEnquiries(res.data || []);
        setStats(res.stats || { byStatus: {}, bySource: {} });
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter, sourceFilter]);

  const openDetail = async (e: PgEnquiry) => {
    setSelected(e);
    setShowDetail(true);
    setDetailLoading(true);
    try {
      const res = await enquiryService.getById(e._id);
      if (res.success && res.data) {
        setSelected(res.data);
      }
    } catch {
      // keep the list-row copy
    } finally {
      setDetailLoading(false);
    }
  };

  const openDecision = (status: EnquiryStatus) => {
    if (!selected) return;
    setDecisionStatus(status);
    setDecisionRemarks('');
    setShowDecision(true);
  };

  const submitDecision = async () => {
    if (!selected) return;
    if (decisionStatus === 'rejected' && !decisionRemarks.trim()) {
      showToast('error', 'Please provide a reason for rejection');
      return;
    }
    try {
      setSubmitting(true);
      const res = await enquiryService.updateStatus(selected._id, {
        status: decisionStatus,
        remarks: decisionRemarks.trim() || undefined
      });
      if (res.success) {
        showToast('success', `Enquiry ${decisionStatus}`);
        setShowDecision(false);
        setShowDetail(false);
        fetchEnquiries();
      } else {
        showToast('error', res.message || 'Failed to update enquiry');
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to update enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteOne = (e: PgEnquiry) => {
    setDeleteTarget(e);
    setShowDeleteOne(true);
  };

  const confirmDeleteOne = async () => {
    if (!deleteTarget) return;
    try {
      setDeletingOne(true);
      const res = await enquiryService.delete(deleteTarget._id);
      if (res.success) {
        showToast('success', 'Enquiry deleted');
        setShowDeleteOne(false);
        setShowDetail(false);
        setDeleteTarget(null);
        setSelectedIds((ids) => ids.filter((id) => id !== deleteTarget._id));
        fetchEnquiries();
      } else {
        showToast('error', res.message || 'Failed to delete enquiry');
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to delete enquiry');
    } finally {
      setDeletingOne(false);
    }
  };

  const targetCount = useMemo(() => {
    if (selectedIds.length > 0) return selectedIds.length;
    return enquiries.length;
  }, [selectedIds, enquiries]);

  const isFiltered = statusFilter !== 'all' || sourceFilter !== 'all' || search.trim() !== '';

  const buildBulkPayload = () => {
    if (selectedIds.length > 0) return { ids: selectedIds };
    return {
      all: true,
      status: statusFilter,
      source: sourceFilter === 'all' ? undefined : sourceFilter,
      search: search.trim() || undefined
    };
  };

  const openDeleteAll = () => {
    setDeleteAllConfirm('');
    setShowDeleteAll(true);
  };

  const confirmDeleteAll = async () => {
    if (deleteAllConfirm.trim() !== 'DELETE') {
      showToast('error', 'Type DELETE to confirm');
      return;
    }
    try {
      setDeletingAll(true);
      const payload = buildBulkPayload();
      const res = await enquiryService.deleteBulk(payload);
      if (res.success) {
        showToast('success', res.message || `${res.data?.deletedCount || 0} enquiries deleted`);
        setShowDeleteAll(false);
        setDeleteAllConfirm('');
        setSelectedIds([]);
        fetchEnquiries();
      } else {
        showToast('error', res.message || 'Failed to delete enquiries');
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to delete enquiries');
    } finally {
      setDeletingAll(false);
    }
  };

  const columns = [
    {
      key: 'ownerName',
      label: 'Applicant',
      sortable: true,
      render: (v: string, row: PgEnquiry) => (
        <button
          onClick={() => openDetail(row)}
          className="text-left hover:underline"
        >
          <p className="font-medium">{v}</p>
          <p className="text-xs text-muted-foreground">{row.pgName}</p>
        </button>
      )
    },
    {
      key: 'email',
      label: 'Contact',
      render: (v: string, row: PgEnquiry) => (
        <div className="text-xs space-y-0.5">
          <p className="flex items-center gap-1"><Mail className="w-3 h-3 text-muted-foreground" /> {v}</p>
          <p className="flex items-center gap-1 text-muted-foreground"><Phone className="w-3 h-3" /> {row.phone}</p>
        </div>
      )
    },
    {
      key: 'source',
      label: 'Source',
      render: (v: string) => {
        const meta = SOURCE_META[v] || SOURCE_META.other;
        const Icon = meta.icon;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
            <Icon className="w-3 h-3" />
            {meta.label}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: EnquiryStatus) => {
        const meta = STATUS_META[v] || STATUS_META.pending;
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      }
    },
    {
      key: 'createdAt',
      label: 'Received',
      sortable: true,
      render: (v: string) => (
        <div className="text-xs">
          <p>{v ? new Date(v).toLocaleDateString() : '-'}</p>
          <p className="text-muted-foreground">{v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: PgEnquiry) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openDetail(row)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(ev) => {
              ev.stopPropagation();
              openWhatsApp(row.phone, enquiryWhatsAppTemplate(row.ownerName));
            }}
            className="p-2 hover:bg-green-500/10 rounded-lg transition-colors text-green-500"
            title="Send WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            onClick={(ev) => { ev.stopPropagation(); openDeleteOne(row); }}
            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const totalCount = (stats.byStatus.pending || 0) + (stats.byStatus.approved || 0) + (stats.byStatus.rejected || 0);
  const pendingCount = stats.byStatus.pending || 0;
  const approvedCount = stats.byStatus.approved || 0;
  const rejectedCount = stats.byStatus.rejected || 0;

  return (
    <div>
      <PageHeader
        title="Enquiries"
        description="All PG enquiries from the mobile app and website. Approve, reject, or follow up with applicants."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchEnquiries}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={openDeleteAll}
              disabled={enquiries.length === 0}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={
                isFiltered
                  ? `Delete all ${enquiries.length} matching enquiries`
                  : `Delete all ${enquiries.length} enquiries`
              }
            >
              <Trash className="w-4 h-4" />
              {selectedIds.length > 0
                ? `Delete Selected (${selectedIds.length})`
                : isFiltered
                  ? 'Delete Filtered'
                  : 'Delete All'}
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl"><Inbox className="w-6 h-6 text-blue-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{totalCount}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-xl"><Clock className="w-6 h-6 text-yellow-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-semibold text-yellow-500">{pendingCount}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-xl"><CheckCircle className="w-6 h-6 text-green-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-semibold text-green-500">{approvedCount}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-xl"><XCircle className="w-6 h-6 text-red-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-semibold text-red-500">{rejectedCount}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, PG, email or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchEnquiries()}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="all">All Sources</option>
              <option value="mobile-app">Mobile App</option>
              <option value="website">Website</option>
              <option value="admin">Admin</option>
              <option value="other">Other</option>
            </select>
            <button
              onClick={fetchEnquiries}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white text-sm"
            >
              Search
            </button>
          </div>
        </div>
      </motion.div>

      {/* Selection action bar */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 mb-4 p-3 bg-primary/10 border border-primary/30 rounded-xl backdrop-blur-xl flex items-center justify-between gap-3 flex-wrap"
        >
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {selectedIds.length}
            </span>
            <p className="text-sm font-medium">
              {selectedIds.length} enquir{selectedIds.length === 1 ? 'y' : 'ies'} selected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Clear
            </button>
            <button
              onClick={openDeleteAll}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        {enquiries.length === 0 && !loading ? (
          <div className="text-center py-20 bg-card/50 backdrop-blur-xl rounded-xl border border-border">
            <Inbox className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="font-medium">No enquiries found</p>
            <p className="text-sm text-muted-foreground mt-1">Try clearing the filters or check back later</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={enquiries}
            loading={loading}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        )}
      </motion.div>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title="Enquiry Details"
        size="lg"
      >
        {detailLoading || !selected ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2d2d7e] to-[#1e3a8a] flex items-center justify-center text-white text-xl font-semibold">
                {selected.ownerName?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold">{selected.ownerName}</h3>
                  <Badge variant={STATUS_META[selected.status]?.variant || 'warning'}>
                    {STATUS_META[selected.status]?.label || selected.status}
                  </Badge>
                  {selected.source && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${SOURCE_META[selected.source]?.color || SOURCE_META.other.color}`}>
                      {(() => {
                        const Icon = SOURCE_META[selected.source!]?.icon || MessageSquare;
                        return <Icon className="w-3 h-3" />;
                      })()}
                      {SOURCE_META[selected.source!]?.label || selected.source}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Applied for {selected.pgName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Received {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Contact cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                <a href={`mailto:${selected.email}`} className="text-sm font-medium hover:underline">{selected.email}</a>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                <div className="flex items-center justify-between gap-2">
                  <a href={`tel:${selected.phone}`} className="text-sm font-medium hover:underline">{selected.phone}</a>
                  <button
                    type="button"
                    onClick={() => openWhatsApp(selected.phone, enquiryWhatsAppTemplate(selected.ownerName))}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500 text-white hover:bg-green-600 transition-colors shrink-0"
                    title="Open WhatsApp chat with pre-filled message"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg md:col-span-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {selected.source === 'website' ? 'Service Required' : 'Address'}</p>
                <p className="text-sm font-medium">{selected.address || '—'}</p>
              </div>
              {selected.source === 'website' && selected.projectName && (
                <div className="p-3 bg-muted/30 rounded-lg md:col-span-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" /> Project</p>
                  <p className="text-sm font-medium">{selected.projectName}</p>
                </div>
              )}
            </div>

            {/* Review info */}
            {(selected.reviewedAt || selected.remarks) && (
              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-500 font-medium flex items-center gap-1 mb-1"><FileText className="w-3 h-3" /> Review</p>
                {selected.reviewedAt && (
                  <p className="text-xs text-muted-foreground">Reviewed on {new Date(selected.reviewedAt).toLocaleString()}</p>
                )}
                {typeof selected.reviewedBy === 'object' && selected.reviewedBy?.name && (
                  <p className="text-xs text-muted-foreground">By {selected.reviewedBy.name}</p>
                )}
                {selected.remarks && (
                  <p className="text-sm mt-2"><span className="text-muted-foreground">Remarks:</span> {selected.remarks}</p>
                )}
              </div>
            )}

            {/* Actions */}
            {selected.status === 'pending' ? (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => openDecision('approved')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => openDecision('rejected')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => openDecision('pending')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Re-open as pending
                </button>
                <button
                  onClick={() => openDeleteOne(selected)}
                  className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* DECISION MODAL */}
      <Modal
        isOpen={showDecision}
        onClose={() => setShowDecision(false)}
        title={
          decisionStatus === 'approved' ? 'Approve Enquiry' :
          decisionStatus === 'rejected' ? 'Reject Enquiry' :
          'Reset Enquiry'
        }
        size="md"
      >
        <div className="space-y-4">
          <div className={`flex items-start gap-3 p-3 rounded-lg ${
            decisionStatus === 'approved' ? 'bg-green-500/10' :
            decisionStatus === 'rejected' ? 'bg-red-500/10' :
            'bg-amber-500/10'
          }`}>
            {decisionStatus === 'approved' ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" /> :
             decisionStatus === 'rejected' ? <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" /> :
             <Clock className="w-5 h-5 text-amber-500 mt-0.5" />}
            <div>
              <p className="font-medium">
                {decisionStatus === 'approved' && `Approve ${selected?.ownerName}'s enquiry?`}
                {decisionStatus === 'rejected' && `Reject ${selected?.ownerName}'s enquiry?`}
                {decisionStatus === 'pending' && `Mark this enquiry as pending again?`}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {decisionStatus === 'approved' && 'The applicant will receive an approval email.'}
                {decisionStatus === 'rejected' && 'The applicant will be notified by email. A reason is required.'}
                {decisionStatus === 'pending' && 'This enquiry will be moved back to the pending queue.'}
              </p>
            </div>
          </div>

          <FormField
            label={`Remarks${decisionStatus === 'rejected' ? ' *' : ''}`}
            required={decisionStatus === 'rejected'}
          >
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              value={decisionRemarks}
              onChange={(e) => setDecisionRemarks(e.target.value)}
              rows={3}
              placeholder={
                decisionStatus === 'approved' ? 'Optional welcome note…' :
                decisionStatus === 'rejected' ? 'Reason for rejection (sent to applicant)…' :
                'Optional reason for re-opening…'
              }
              required={decisionStatus === 'rejected'}
            />
          </FormField>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowDecision(false)}
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitDecision}
              disabled={submitting || (decisionStatus === 'rejected' && !decisionRemarks.trim())}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${
                decisionStatus === 'approved' ? 'bg-green-500 hover:bg-green-600' :
                decisionStatus === 'rejected' ? 'bg-red-500 hover:bg-red-600' :
                'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {decisionStatus === 'approved' ? 'Approve' :
               decisionStatus === 'rejected' ? 'Reject' :
               'Mark Pending'}
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE ONE MODAL */}
      {showDeleteOne && deleteTarget && (
        <Modal
          isOpen={showDeleteOne}
          onClose={() => { setShowDeleteOne(false); setDeleteTarget(null); }}
          title="Delete Enquiry"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10">
              <Trash2 className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium">Delete this enquiry permanently?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This action cannot be undone. The applicant will not be notified.
                </p>
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg space-y-1 text-sm">
              <p><span className="text-muted-foreground">Applicant:</span> <strong>{deleteTarget.ownerName}</strong></p>
              <p><span className="text-muted-foreground">PG:</span> {deleteTarget.pgName}</p>
              <p><span className="text-muted-foreground">Email:</span> {deleteTarget.email}</p>
              <p><span className="text-muted-foreground">Status:</span> {deleteTarget.status}</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteOne(false); setDeleteTarget(null); }}
                className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteOne}
                disabled={deletingOne}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
              >
                {deletingOne && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE ALL MODAL */}
      {showDeleteAll && (
        <Modal
          isOpen={showDeleteAll}
          onClose={() => { setShowDeleteAll(false); setDeleteAllConfirm(''); }}
          title={
            selectedIds.length > 0
              ? `Delete ${selectedIds.length} selected enquir${selectedIds.length === 1 ? 'y' : 'ies'}`
              : isFiltered
                ? 'Delete Filtered Enquiries'
                : 'Delete All Enquiries'
          }
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium">
                  {selectedIds.length > 0
                    ? `Permanently delete ${selectedIds.length} selected enquir${selectedIds.length === 1 ? 'y' : 'ies'}?`
                    : isFiltered
                      ? `Permanently delete all ${targetCount} enquir${targetCount === 1 ? 'y' : 'ies'} matching the current filters?`
                      : `Permanently delete ALL ${targetCount} enquir${targetCount === 1 ? 'y' : 'ies'} in the system?`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
              <p className="font-medium text-foreground">Scope:</p>
              {selectedIds.length > 0 ? (
                <p className="text-muted-foreground">{selectedIds.length} specific enquir{selectedIds.length === 1 ? 'y' : 'ies'} you selected</p>
              ) : (
                <>
                  {statusFilter !== 'all' && <p>Status: <strong>{statusFilter}</strong></p>}
                  {sourceFilter !== 'all' && <p>Source: <strong>{sourceFilter}</strong></p>}
                  {search.trim() && <p>Search: <strong>"{search.trim()}"</strong></p>}
                  {statusFilter === 'all' && sourceFilter === 'all' && !search.trim() && (
                    <p className="text-red-500 font-medium">⚠ All enquiries in the database</p>
                  )}
                </>
              )}
            </div>

            <FormField label={`Type DELETE to confirm *`} required>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={deleteAllConfirm}
                onChange={(e) => setDeleteAllConfirm(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
              />
            </FormField>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteAll(false); setDeleteAllConfirm(''); }}
                className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAll}
                disabled={deletingAll || deleteAllConfirm.trim() !== 'DELETE'}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingAll && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete {targetCount} enquir{targetCount === 1 ? 'y' : 'ies'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
