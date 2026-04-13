import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Users, Calendar, AlertCircle, IndianRupee, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatsCard } from '../components/StatsCard';
import { PageHeader } from '../components/PageHeader';
import { adminService } from '../../services/adminService';

interface DashboardOverview {
  totalPGs: number;
  totalTenants: number;
  totalBookings: number;
  totalPayments: number;
  pendingComplaints: number;
  pendingRequests: number;
  monthlyCollection: number;
  monthlyCollectionCount: number;
}

const defaultStats: DashboardOverview = {
  totalPGs: 0,
  totalTenants: 0,
  totalBookings: 0,
  totalPayments: 0,
  pendingComplaints: 0,
  pendingRequests: 0,
  monthlyCollection: 0,
  monthlyCollectionCount: 0
};

export function Dashboard() {
  const [stats, setStats] = useState<DashboardOverview>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await adminService.getDashboardStats();
        if (response.success) {
          setStats({ ...defaultStats, ...response.data });
        } else {
          setError(response.message || 'Failed to fetch dashboard stats');
        }
      } catch (err) {
        setError('Failed to fetch dashboard stats');
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const summaryChartData = useMemo(() => ([
    { name: 'PGs', value: stats.totalPGs },
    { name: 'Tenants', value: stats.totalTenants },
    { name: 'Bookings', value: stats.totalBookings },
    { name: 'Payments', value: stats.totalPayments }
  ]), [stats]);

  const alertsChartData = useMemo(() => {
    const pending = stats.pendingComplaints + stats.pendingRequests;
    const active = Math.max(stats.totalBookings - pending, 0);
    return [
      { name: 'Pending', value: pending, color: '#ef4444' },
      { name: 'In Progress', value: active, color: '#22c55e' }
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        description="Live platform snapshot based on current backend data."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard title="Total PGs" value={stats.totalPGs} icon={Building2} gradient="from-blue-600 to-blue-800" />
        <StatsCard title="Total Tenants" value={stats.totalTenants} icon={Users} gradient="from-purple-600 to-purple-800" />
        <StatsCard title="Total Bookings" value={stats.totalBookings} icon={Calendar} gradient="from-pink-600 to-pink-800" />
        <StatsCard title="Pending Complaints" value={stats.pendingComplaints} icon={AlertCircle} gradient="from-red-600 to-red-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
        >
          <h3 className="mb-4">Core Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summaryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(26, 26, 78, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
        >
          <h3 className="mb-4">Operational Load</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={alertsChartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
                dataKey="value"
              >
                {alertsChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(26, 26, 78, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Collection</p>
              <p className="text-2xl font-bold">₹{stats.monthlyCollection.toLocaleString()}</p>
            </div>
            <IndianRupee className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Transactions</p>
              <p className="text-2xl font-bold">{stats.monthlyCollectionCount}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="text-2xl font-bold">{stats.pendingRequests}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
