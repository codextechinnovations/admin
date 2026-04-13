import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingUp, Plus, Eye, IndianRupee, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Modal, FormField, Badge } from '../../components/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminService } from '../../services/adminService';
import { Payment } from '../../types/api';

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pgs, setPgs] = useState<{ _id: string; name: string; ownerId?: string }[]>([]);
  const [tenants, setTenants] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [newPayment, setNewPayment] = useState({
    tenantId: '', pgId: '', amount: 0, type: 'rent', category: 'RENT', month: new Date().getMonth() + 1, year: new Date().getFullYear(), note: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchPGs();
    fetchTenants();
  }, []);

  const fetchPGs = async () => {
    try {
      const response = await adminService.getPGs({ limit: 100 });
      if (response.success) {
        setPgs(response.data.map((pg: any) => ({ _id: pg._id, name: pg.name, ownerId: pg.ownerId?._id || pg.ownerId })));
      }
    } catch (err) {
      console.error('Error fetching PGs:', err);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await adminService.getTenants({ limit: 100 });
      if (response.success) {
        setTenants(response.data.map((tenant: any) => ({ _id: tenant._id, name: tenant.name })));
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPayments({ limit: 100 });
      if (response.success) {
        setPayments(response.data);
      } else {
        setError(response.message || 'Failed to fetch payments');
      }
    } catch (err) {
      setError('Failed to fetch payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedPg = pgs.find((pg) => pg._id === newPayment.pgId);
      const paymentDate = new Date();

      await adminService.createPayment({
        ...newPayment,
        paymentDate,
        payment_date: paymentDate,
        tenant_id: newPayment.tenantId,
        pg_id: newPayment.pgId,
        owner_id: selectedPg?.ownerId
      });

      setShowAddModal(false);
      setNewPayment({ tenantId: '', pgId: '', amount: 0, type: 'rent', category: 'RENT', month: new Date().getMonth() + 1, year: new Date().getFullYear(), note: '' });
      fetchPayments();
    } catch (err) {
      console.error('Error adding payment:', err);
    }
  };

  const creditPayments = payments.filter(p => ['CREDIT', 'rent', 'deposit'].includes((p.type || '').toString()));
  const debitPayments = payments.filter(p => ['DEBIT', 'expense'].includes((p.type || '').toString()));
  const totalCredit = creditPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalDebit = debitPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const successPayments = payments.filter(p => ['success', 'paid'].includes((p.status || '').toLowerCase()));
  const pendingPayments = payments.filter(p => ['pending', 'unpaid'].includes((p.status || '').toLowerCase()));

  const columns = [
    {
      key: '_id',
      label: 'Payment ID',
      render: (v: string) => <span className="font-mono text-xs">{v.slice(-8)}</span>
    },
    { key: 'amount', label: 'Amount', sortable: true, render: (v: number) => <span className="font-semibold">₹{v?.toLocaleString() || 0}</span> },
    {
      key: 'type',
      label: 'Type',
      render: (v: string) => (
        <Badge variant={['CREDIT', 'rent', 'deposit'].includes(v) ? 'success' : 'danger'}>
          {['CREDIT', 'rent', 'deposit'].includes(v) ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {v?.toString().toUpperCase()}
        </Badge>
      )
    },
    { key: 'category', label: 'Category' },
    {
      key: 'paymentDate',
      label: 'Date',
      sortable: true,
      render: (_: string, row: any) => new Date(row.paymentDate || row.payment_date || row.createdAt).toLocaleDateString()
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <Badge variant={['success', 'paid'].includes((v || '').toLowerCase()) ? 'success' : ['pending', 'unpaid'].includes((v || '').toLowerCase()) ? 'warning' : 'danger'}>
          {v}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: Payment) => (
        <button onClick={() => { setSelectedPayment(row); setShowDetailModal(true); }} className="p-2 hover:bg-accent rounded-lg transition-colors">
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000, commission: 4500 },
    { month: 'Feb', revenue: 52000, commission: 5200 },
    { month: 'Mar', revenue: 48000, commission: 4800 },
    { month: 'Apr', revenue: 61000, commission: 6100 }
  ];

  return (
    <div>
      <PageHeader
        title="Payments & Revenue"
        description="Track all transactions and platform commission."
        action={
          <div className="flex gap-3">
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4" />
              Add Payment
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Credit</p>
              <p className="text-2xl font-semibold text-green-500">₹{totalCredit.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl">
              <ArrowUpRight className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Debit</p>
              <p className="text-2xl font-semibold text-red-500">₹{totalDebit.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl">
              <ArrowDownRight className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
              <p className="text-2xl font-semibold text-blue-500">
                {payments.length > 0 ? ((successPayments.length / payments.length) * 100).toFixed(0) : 0}%
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-2xl font-semibold text-yellow-500">{pendingPayments.length}</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <CreditCard className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3>Revenue Analytics</h3>
            <p className="text-sm text-muted-foreground">Monthly revenue and commission breakdown</p>
          </div>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(26, 26, 78, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            <Bar dataKey="revenue" fill="#6366f1" name="Revenue (₹)" />
            <Bar dataKey="commission" fill="#ec4899" name="Commission (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <DataTable columns={columns} data={payments} loading={loading} />
      </motion.div>

      {/* Add Payment Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Payment" size="md">
        <form onSubmit={handleAddPayment}>
          <div className="space-y-4">
            <FormField label="PG *">
              <select
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newPayment.pgId}
                onChange={(e) => setNewPayment({ ...newPayment, pgId: e.target.value })}
                required
              >
                <option value="">Select PG</option>
                {pgs.map((pg) => (
                  <option key={pg._id} value={pg._id}>{pg.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Tenant *">
              <select
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newPayment.tenantId}
                onChange={(e) => setNewPayment({ ...newPayment, tenantId: e.target.value })}
                required
              >
                <option value="">Select Tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant._id} value={tenant._id}>{tenant.name}</option>
                ))}
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Amount (₹)">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: parseInt(e.target.value) || 0 })}
                  required
                />
              </FormField>
              <FormField label="Type">
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newPayment.type}
                  onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}
                >
                  <option value="rent">Rent</option>
                  <option value="deposit">Deposit</option>
                  <option value="expense">Expense</option>
                </select>
              </FormField>
            </div>
            <FormField label="Category">
              <select
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newPayment.category}
                onChange={(e) => setNewPayment({ ...newPayment, category: e.target.value })}
              >
                <option value="RENT">Rent</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="UTILITY">Utility</option>
                <option value="OTHER">Other</option>
              </select>
            </FormField>
            <FormField label="Note">
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newPayment.note}
                onChange={(e) => setNewPayment({ ...newPayment, note: e.target.value })}
                rows={2}
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg">
              Add Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* Payment Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Payment Details" size="sm">
        {selectedPayment && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${['CREDIT', 'rent', 'deposit'].includes(selectedPayment.type) ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <IndianRupee className={`w-6 h-6 ${['CREDIT', 'rent', 'deposit'].includes(selectedPayment.type) ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{selectedPayment.amount?.toLocaleString()}</p>
                <Badge variant={['CREDIT', 'rent', 'deposit'].includes(selectedPayment.type) ? 'success' : 'danger'}>{selectedPayment.type}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{selectedPayment.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{new Date(selectedPayment.paymentDate || selectedPayment.payment_date || selectedPayment.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={['success', 'paid'].includes((selectedPayment.status || '').toLowerCase()) ? 'success' : 'warning'}>{selectedPayment.status}</Badge>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Month/Year</span>
                <span className="font-medium">{selectedPayment.month}/{selectedPayment.year}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
