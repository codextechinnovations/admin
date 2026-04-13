import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, TrendingDown, Receipt, Building2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Modal, FormField, Badge } from '../../components/Modal';
import { adminService } from '../../services/adminService';

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  expense_date: string;
  note?: string;
  pgId?: { name: string };
  createdAt: string;
}

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pgs, setPGs] = useState<{_id: string; name: string; ownerId?: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pgFilter, setPgFilter] = useState<string>('');

  const [newExpense, setNewExpense] = useState({
    pgId: '', title: '', amount: 0, category: 'MAINTENANCE', expense_date: new Date().toISOString().split('T')[0], note: ''
  });

  useEffect(() => {
    fetchExpenses();
    fetchPGs();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [pgFilter]);

  const fetchPGs = async () => {
    try {
      const response = await adminService.getPGs({ limit: 100 });
      if (response.success) {
        setPGs(response.data.map((pg: any) => ({ _id: pg._id, name: pg.name, ownerId: pg.ownerId?._id || pg.ownerId })));
      }
    } catch (err) {
      console.error('Error fetching PGs:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await adminService.getExpenses({ limit: 100, pgId: pgFilter || undefined });
      if (response.success) {
        setExpenses(response.data);
      } else {
        setError(response.message || 'Failed to fetch expenses');
      }
    } catch (err) {
      setError('Failed to fetch expenses');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedPg = pgs.find((pg) => pg._id === newExpense.pgId);
      await adminService.createExpense({
        ...newExpense,
        ownerId: selectedPg?.ownerId,
        expense_date: new Date(newExpense.expense_date)
      });
      setShowAddModal(false);
      setNewExpense({ pgId: '', title: '', amount: 0, category: 'MAINTENANCE', expense_date: new Date().toISOString().split('T')[0], note: '' });
      fetchExpenses();
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const categoryStats = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (v: string) => <span className="font-medium">{v}</span>
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (v: number) => <span className="font-semibold text-red-400">₹{v?.toLocaleString() || 0}</span>
    },
    {
      key: 'category',
      label: 'Category',
      render: (v: string) => (
        <Badge variant="warning">{v}</Badge>
      )
    },
    {
      key: 'expense_date',
      label: 'Date',
      sortable: true,
      render: (v: string) => new Date(v).toLocaleDateString()
    },
    {
      key: 'pgId',
      label: 'PG',
      render: (v: any) => {
        if (!v) return '-';
        if (typeof v === 'string') {
          return pgs.find((pg) => pg._id === v)?.name || v.slice(-6);
        }
        return v?.name || '-';
      }
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: Expense) => (
        <button onClick={() => { setSelectedExpense(row); setShowDetailModal(true); }} className="p-2 hover:bg-accent rounded-lg transition-colors">
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Expense Management"
        description="Track and manage all PG expenses."
        action={
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
              <p className="text-2xl font-semibold text-red-500">₹{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {Object.entries(categoryStats).slice(0, 3).map(([category, amount], index) => (
          <motion.div key={category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.1 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Receipt className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{category}</p>
                <p className="text-2xl font-semibold">₹{amount.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        ))}
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
        <DataTable columns={columns} data={expenses} loading={loading} />
      </motion.div>

      {/* Add Expense Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Expense" size="md">
        <form onSubmit={handleAddExpense}>
          <div className="space-y-4">
            <FormField label="Select PG *" required>
              <select
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newExpense.pgId}
                onChange={(e) => setNewExpense({ ...newExpense, pgId: e.target.value })}
                required
              >
                <option value="">Select PG</option>
                {pgs.map(pg => (
                  <option key={pg._id} value={pg._id}>{pg.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Title *">
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                placeholder="e.g., Plumbing repair"
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Amount (₹) *">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseInt(e.target.value) || 0 })}
                  required
                />
              </FormField>
              <FormField label="Category">
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                >
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="UTILITY">Utility</option>
                  <option value="GROCERY">Grocery</option>
                  <option value="SALARY">Salary</option>
                  <option value="REPAIR">Repair</option>
                  <option value="OTHER">Other</option>
                </select>
              </FormField>
            </div>

            <FormField label="Date *">
              <input
                type="date"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newExpense.expense_date}
                onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Note">
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newExpense.note}
                onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
                placeholder="Optional notes..."
                rows={2}
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg">
              Add Expense
            </button>
          </div>
        </form>
      </Modal>

      {/* Expense Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Expense Details" size="sm">
        {selectedExpense && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-500/10">
                <Receipt className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">₹{selectedExpense.amount?.toLocaleString()}</p>
                <Badge variant="warning">{selectedExpense.category}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Title</span>
                <span className="font-medium">{selectedExpense.title}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{new Date(selectedExpense.expense_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">PG</span>
                <span className="font-medium">
                  {typeof selectedExpense.pgId === 'string'
                    ? pgs.find((pg) => pg._id === selectedExpense.pgId)?.name || selectedExpense.pgId.slice(-6)
                    : selectedExpense.pgId?.name || '-'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Note</span>
                <span className="font-medium text-right">{selectedExpense.note || '-'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
