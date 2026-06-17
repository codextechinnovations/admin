import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { UserCheck, X, Check, Search, Filter, AlertCircle, CheckCircle, XCircle, CreditCard, Snowflake } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Modal, Badge } from '../../components/Modal';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

interface PGOwner {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  status: 'pending' | 'approved' | 'rejected';
  isVerified: boolean;
  isTrial?: boolean;
  isPaid?: boolean;
  plan?: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  approved: 'bg-green-500/10 text-green-500',
  rejected: 'bg-red-500/10 text-red-500'
};

export function PGOwnerVerification() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [owners, setOwners] = useState<PGOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOwner, setSelectedOwner] = useState<PGOwner | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [approvalType, setApprovalType] = useState<'trial' | 'paid'>('trial');
  const [paymentForm, setPaymentForm] = useState({
    plan: 'monthly',
    subscriptionStartDate: today,
    subscriptionEndDate: nextMonth,
    paymentMethod: 'manual',
    transactionId: ''
  });
  const [subscribeOwner, setSubscribeOwner] = useState<PGOwner | null>(null);
  const [subscribeForm, setSubscribeForm] = useState({
    plan: 'monthly',
    subscriptionStartDate: today,
    subscriptionEndDate: nextMonth,
    paymentMethod: 'manual',
    transactionId: ''
  });
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [freezeLoading, setFreezeLoading] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, [statusFilter]);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPGOwners({ 
        status: statusFilter || undefined 
      });
      if (response.success) {
        setOwners(response.data);
      }
    } catch (err) {
      console.error('Error fetching owners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (owner: PGOwner, newStatus: 'approved' | 'rejected') => {
    try {
      const paymentPayload = newStatus === 'approved' && approvalType === 'paid'
        ? paymentForm
        : {};

      await adminService.verifyPGOwner(owner._id, {
        status: newStatus,
        isVerified: newStatus === 'approved',
        ...paymentPayload
      });
      fetchOwners();
      setShowModal(false);
      setSelectedOwner(null);
      setApprovalType('trial');
    } catch (err) {
      console.error('Error verifying owner:', err);
    }
  };

  const openSubscribe = (owner: PGOwner) => {
    setSubscribeOwner(owner);
    setSubscribeForm({
      plan: 'monthly',
      subscriptionStartDate: today,
      subscriptionEndDate: nextMonth,
      paymentMethod: 'manual',
      transactionId: ''
    });
  };

  const submitSubscribe = async () => {
    if (!subscribeOwner) return;
    try {
      setSubscribeLoading(true);
      await adminService.subscribePGOwner(subscribeOwner._id, subscribeForm);
      toast.success('Owner subscribed successfully');
      setSubscribeOwner(null);
      fetchOwners();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to subscribe owner');
    } finally {
      setSubscribeLoading(false);
    }
  };

  const submitFreeze = async (owner: PGOwner) => {
    if (!window.confirm(`Freeze ${owner.name}'s plan? They will be locked out of the app.`)) {
      return;
    }
    try {
      setFreezeLoading(true);
      await adminService.freezePGOwner(owner._id);
      toast.success('Owner frozen');
      fetchOwners();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to freeze owner');
    } finally {
      setFreezeLoading(false);
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Name', 
      sortable: true,
      render: (value: string, row: PGOwner) => (
        <button 
          onClick={() => navigate(`/pg-owner-verification/${row._id}`)}
          className="text-primary hover:underline font-medium"
        >
          {value}
        </button>
      )
    },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'email', label: 'Email', render: (v: string) => v || '-' },
    { key: 'city', label: 'City', render: (v: string) => v || '-' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-500/10 text-gray-500'}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Added Date',
      sortable: true,
      render: (v: string) => new Date(v).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: PGOwner) => (
        <div className="flex items-center gap-2">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => { setSelectedOwner(row); setApprovalType('trial'); setShowModal(true); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Verify
              </button>
            </>
          )}
          {row.status === 'approved' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openSubscribe(row)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors text-xs font-medium"
                title="Approve payment / activate plan"
              >
                <CreditCard className="w-4 h-4" />
                Subscribe
              </button>
              <button
                onClick={() => submitFreeze(row)}
                disabled={freezeLoading}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors text-xs font-medium disabled:opacity-50"
                title="Freeze account"
              >
                <Snowflake className="w-4 h-4" />
                Freeze
              </button>
            </div>
          )}
          {row.status === 'rejected' && (
            <span className="flex items-center gap-1 text-red-500 text-sm">
              <XCircle className="w-4 h-4" />
              Rejected
            </span>
          )}
        </div>
      )
    }
  ];

  const pendingCount = owners.filter(o => o.status === 'pending').length;
  const approvedCount = owners.filter(o => o.status === 'approved').length;
  const rejectedCount = owners.filter(o => o.status === 'rejected').length;

  return (
    <div>
      <PageHeader
        title="PG Owner Verification"
        description="Verify and manage PG owner requests"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-semibold">{pendingCount}</p>
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-semibold">{approvedCount}</p>
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-semibold">{rejectedCount}</p>
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <UserCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{owners.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }}
        className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4 mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <label className="text-sm text-muted-foreground">Filter:</label>
            <select
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }}
      >
        <DataTable columns={columns} data={owners} loading={loading} />
      </motion.div>

      {/* Verify Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Verify PG Owner" size="md">
        {selectedOwner && (
          <div>
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-lg mb-2">{selectedOwner.name}</h3>
              <p className="text-sm text-muted-foreground">Phone: {selectedOwner.phone}</p>
              <p className="text-sm text-muted-foreground">Email: {selectedOwner.email || 'Not provided'}</p>
              <p className="text-sm text-muted-foreground">Address: {selectedOwner.address}, {selectedOwner.city}</p>
            </div>
            
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Warning</span>
              </div>
              <p className="text-sm text-yellow-600/80 mt-1">
                Upon approval, all PGs added by this owner will be automatically verified and available.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Approval Type</label>
                <select
                  value={approvalType}
                  onChange={(e) => setApprovalType(e.target.value as 'trial' | 'paid')}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="trial">Free Trial - 7 days from account creation</option>
                  <option value="paid">Paid Plan - payment approved</option>
                </select>
              </div>

              {approvalType === 'paid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <label className="block text-sm font-medium mb-1">Plan</label>
                    <select
                      value={paymentForm.plan}
                      onChange={(e) => setPaymentForm({ ...paymentForm, plan: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Method</label>
                    <input
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                      placeholder="UPI / Cash / Bank"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      value={paymentForm.subscriptionStartDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, subscriptionStartDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      value={paymentForm.subscriptionEndDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, subscriptionEndDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Transaction ID / Reference</label>
                    <input
                      value={paymentForm.transactionId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                      placeholder="Optional payment reference"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleVerify(selectedOwner, 'approved')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Approve Owner
              </button>
              <button
                onClick={() => handleVerify(selectedOwner, 'rejected')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-500/90 transition-colors"
              >
                <XCircle className="w-5 h-5" />
                Reject Owner
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Subscribe / Activate Paid Plan */}
      <Modal isOpen={!!subscribeOwner} onClose={() => setSubscribeOwner(null)} title="Approve Payment & Activate Plan" size="md">
        {subscribeOwner && (
          <div>
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-lg mb-1">{subscribeOwner.name}</h3>
              <p className="text-sm text-muted-foreground">Phone: {subscribeOwner.phone}</p>
              <p className="text-sm text-muted-foreground">Email: {subscribeOwner.email || 'Not provided'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Plan</label>
                <select
                  value={subscribeForm.plan}
                  onChange={(e) => setSubscribeForm({ ...subscribeForm, plan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <input
                  value={subscribeForm.paymentMethod}
                  onChange={(e) => setSubscribeForm({ ...subscribeForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="UPI / Cash / Bank"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={subscribeForm.subscriptionStartDate}
                  onChange={(e) => setSubscribeForm({ ...subscribeForm, subscriptionStartDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={subscribeForm.subscriptionEndDate}
                  onChange={(e) => setSubscribeForm({ ...subscribeForm, subscriptionEndDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Transaction ID / Reference</label>
                <input
                  value={subscribeForm.transactionId}
                  onChange={(e) => setSubscribeForm({ ...subscribeForm, transactionId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="Optional payment reference"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSubscribeOwner(null)}
                className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitSubscribe}
                disabled={subscribeLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5" />
                {subscribeLoading ? 'Activating...' : 'Approve & Subscribe'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
