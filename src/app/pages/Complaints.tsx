import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, MessageSquare, Clock, CheckCircle, AlertCircle, Trash2, Building2, User } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Modal, FormField, Badge } from '../../components/Modal';
import { adminService } from '../../services/adminService';

interface Complaint {
  _id: string;
  ownerId?: { _id: string; name: string; phone: string; email: string };
  pgId?: { _id: string; name: string };
  ownerName: string;
  ownerPhone?: string;
  title: string;
  issueType: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'open' | 'in-progress' | 'resolved';
  adminNotes?: string;
  image?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

const issueTypes = [
  'App Crash',
  'Payment Issue',
  'Login Problem',
  'Slow Performance',
  'Maintenance Issue',
  'Tenant Issue',
  'Other'
];

export function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pgs, setPgs] = useState<{_id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pgFilter, setPgFilter] = useState<string>('');
  const [issueTypeFilter, setIssueTypeFilter] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchComplaints();
    fetchPGs();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, pgFilter, issueTypeFilter]);

  const fetchPGs = async () => {
    try {
      const response = await adminService.getPGs({ limit: 100 });
      if (response.success) {
        setPgs(response.data.map((pg: any) => ({ _id: pg._id, name: pg.name })));
      }
    } catch (err) {
      console.error('Error fetching PGs:', err);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await adminService.getComplaints({
        limit: 100,
        status: statusFilter || undefined,
        pgId: pgFilter || undefined
      });
      if (response.success) {
        let data = response.data;
        if (issueTypeFilter) {
          data = data.filter((c: Complaint) => c.issueType === issueTypeFilter);
        }
        setComplaints(data);
      } else {
        setError(response.message || 'Failed to fetch complaints');
      }
    } catch (err) {
      setError('Failed to fetch complaints');
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminService.updateComplaintStatus(id, { status, adminNotes });
      setShowDetailModal(false);
      setAdminNotes('');
      fetchComplaints();
    } catch (err) {
      console.error('Error updating complaint:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await adminService.deleteComplaint(id);
      fetchComplaints();
    } catch (err) {
      console.error('Error deleting complaint:', err);
    }
  };

  const openDetailModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setAdminNotes(complaint.adminNotes || '');
    setShowDetailModal(true);
  };

  const getPriorityBadge = (priority: string) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
      priority === 'High' ? 'bg-red-500/10 text-red-500' :
      priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
      'bg-blue-500/10 text-blue-500'
    }`}>
      {priority}
    </span>
  );

  const getStatusBadge = (status: string) => (
    <Badge variant={
      status === 'open' ? 'warning' :
      status === 'in-progress' ? 'info' :
      'success'
    }>
      {status === 'open' && <AlertCircle className="w-3 h-3 mr-1" />}
      {status === 'in-progress' && <Clock className="w-3 h-3 mr-1" />}
      {status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
      {status === 'open' ? 'Open' : status === 'in-progress' ? 'In Progress' : 'Resolved'}
    </Badge>
  );

  const columns = [
    { 
      key: '_id', 
      label: 'Ticket ID', 
      render: (v: string) => <span className="font-mono text-xs">{v?.slice(-8)}</span> 
    },
    { key: 'ownerName', label: 'Owner Name', sortable: true },
    { 
      key: 'ownerPhone', 
      label: 'Phone', 
      render: (v: string) => v || '-'
    },
    { key: 'title', label: 'Title' },
    { key: 'issueType', label: 'Issue Type', render: (v: string) => (
      <span className="px-2 py-1 bg-muted rounded-md text-xs">{v}</span>
    )},
    {
      key: 'pgId',
      label: 'PG',
      render: (v: any) => (
        <div className="flex items-center gap-1">
          <Building2 className="w-3 h-3 text-muted-foreground" />
          {v?.name || '-'}
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (v: string) => getPriorityBadge(v)
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => getStatusBadge(v)
    },
    { key: 'createdAt', label: 'Date', sortable: true, render: (v: string) => new Date(v).toLocaleDateString() },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: Complaint) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openDetailModal(row)} className="p-2 hover:bg-accent rounded-lg transition-colors" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row._id)} className="p-2 hover:bg-accent rounded-lg transition-colors text-red-500" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const openComplaints = complaints.filter(c => c.status === 'open');
  const inProgressComplaints = complaints.filter(c => c.status === 'in-progress');
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved');

  return (
    <div>
      <PageHeader
        title="Complaints & Support Requests"
        description="Manage support requests from PG owners."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-semibold">{complaints.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-2xl font-semibold text-yellow-500">{openComplaints.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-semibold text-blue-500">{inProgressComplaints.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-semibold text-green-500">{resolvedComplaints.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Status:</label>
            <select
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Issue Type:</label>
            <select
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
              value={issueTypeFilter}
              onChange={(e) => setIssueTypeFilter(e.target.value)}
            >
              <option value="">All</option>
              {issueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">PG:</label>
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
          {(statusFilter || pgFilter || issueTypeFilter) && (
            <button onClick={() => { setStatusFilter(''); setPgFilter(''); setIssueTypeFilter(''); }} className="text-sm text-primary hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <DataTable columns={columns} data={complaints} loading={loading} />
      </motion.div>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Request Details" size="lg">
        {selectedComplaint && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-mono text-xs text-muted-foreground">#{selectedComplaint._id?.slice(-8)}</p>
                  <h3 className="text-lg font-semibold">{selectedComplaint.title}</h3>
                </div>
              </div>
              {getStatusBadge(selectedComplaint.status)}
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleUpdateStatus(selectedComplaint._id, 'open')}
                className={`px-3 py-1.5 rounded-lg text-sm ${selectedComplaint.status === 'open' ? 'bg-yellow-500 text-white' : 'bg-muted hover:bg-muted/80'}`}
              >
                Open
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedComplaint._id, 'in-progress')}
                className={`px-3 py-1.5 rounded-lg text-sm ${selectedComplaint.status === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-muted hover:bg-muted/80'}`}
              >
                In Progress
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedComplaint._id, 'resolved')}
                className={`px-3 py-1.5 rounded-lg text-sm ${selectedComplaint.status === 'resolved' ? 'bg-green-500 text-white' : 'bg-muted hover:bg-muted/80'}`}
              >
                Resolved
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Owner</p>
                </div>
                <p className="font-medium">{selectedComplaint.ownerName}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{selectedComplaint.ownerPhone || '-'}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Issue Type</p>
                <p className="font-medium">{selectedComplaint.issueType}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Priority</p>
                {getPriorityBadge(selectedComplaint.priority)}
              </div>
              {selectedComplaint.pgId && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">PG</p>
                  </div>
                  <p className="font-medium">{selectedComplaint.pgId.name}</p>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {selectedComplaint.description && (
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{selectedComplaint.description}</p>
              </div>
            )}

            {selectedComplaint.resolvedAt && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-xs text-green-500 font-medium">
                  Resolved on {new Date(selectedComplaint.resolvedAt).toLocaleDateString()}
                  {selectedComplaint.resolvedBy && ` by ${selectedComplaint.resolvedBy}`}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
