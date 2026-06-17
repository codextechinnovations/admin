import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, TrendingUp, Calendar, Building2, Users, DollarSign, TrendingDown } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminService } from '../../services/adminService';

export function Reports() {
  const [stats, setStats] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, monthlyRes] = await Promise.all([
        adminService.getReports(),
        adminService.getMonthlyReport(year)
      ]);
      
      if (statsRes.success) setStats(statsRes.data);
      if (monthlyRes.success) setMonthlyData(monthlyRes.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type: string) => {
    const url = adminService.exportReport(type);
    window.open(url, '_blank');
  };

  const totalRevenue = stats?.paymentStats?.total || 0;
  const totalExpenses = stats?.expenseStats?.total || 0;
  const totalPGs = stats?.pgStats?.reduce((sum: number, s: any) => sum + s.count, 0) || 0;
  const totalTenants = stats?.tenantStats?.reduce((sum: number, s: any) => sum + s.count, 0) || 0;

  const growthRate = monthlyData.length > 1
    ? Number(((((monthlyData[monthlyData.length - 1]?.revenue || 0) - (monthlyData[0]?.revenue || 0)) / (monthlyData[0]?.revenue || 1) * 100).toFixed(1)))
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Advanced insights and downloadable reports."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Building2 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total PGs</p>
              <p className="text-2xl font-semibold">{totalPGs}</p>
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
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tenants</p>
              <p className="text-2xl font-semibold">{totalTenants}</p>
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
            <div className="p-3 bg-green-500/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-semibold">₹{(totalRevenue / 100000).toFixed(1)}L</p>
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
            <div className="p-3 bg-pink-500/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Growth Rate</p>
              <p className="text-2xl font-semibold">{growthRate > 0 ? '+' : ''}{growthRate}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Year Selector */}
      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm text-muted-foreground">Select Year:</label>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        >
          {[2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
        >
          <h3 className="mb-4">Revenue & Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(26, 26, 78, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
              />
              <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
        >
          <h3 className="mb-4">Profit Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(26, 26, 78, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
              />
              <Line type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3>PG Types</h3>
            <Building2 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-2">
            {stats?.pgStats?.map((stat: any, i: number) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm capitalize">{stat._id || 'Unknown'}</span>
                <span className="font-medium">{stat.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3>Tenant Status</h3>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-2">
            {stats?.tenantStats?.map((stat: any, i: number) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm capitalize">{stat._id || 'Unknown'}</span>
                <span className="font-medium">{stat.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3>Complaints</h3>
            <FileText className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-2">
            {stats?.complaintStats?.map((stat: any, i: number) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm capitalize">{stat._id || 'Unknown'}</span>
                <span className="font-medium">{stat.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Export Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
      >
        <h3 className="mb-4">Export Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'PG Performance Report', description: 'Detailed analytics for all PGs', format: 'CSV', type: 'pgs' },
            { name: 'Tenant Report', description: 'Complete tenant listing', format: 'CSV', type: 'tenants' },
            { name: 'Payment Report', description: 'All payment transactions', format: 'CSV', type: 'payments' }
          ].map((report, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/30 hover:bg-accent/30 transition-colors">
              <p className="font-medium text-sm mb-1">{report.name}</p>
              <p className="text-xs text-muted-foreground mb-3">{report.description}</p>
              <button 
                onClick={() => handleExport(report.type)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg text-sm hover:shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                Download {report.format}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
