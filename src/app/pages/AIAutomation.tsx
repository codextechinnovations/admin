import { motion } from 'motion/react';
import { Bot, MessageSquare, Zap, TrendingUp } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';

const mockInteractions = [
  { id: 1, user: 'Rahul Sharma', query: 'What are the available PGs?', response: 'AI provided 5 PG recommendations', time: '2025-03-30 10:30', satisfaction: 'positive' },
  { id: 2, user: 'Priya Singh', query: 'How to make payment?', response: 'AI guided through payment process', time: '2025-03-30 11:15', satisfaction: 'positive' },
  { id: 3, user: 'Amit Kumar', query: 'Check-in procedure', response: 'AI explained check-in steps', time: '2025-03-30 12:00', satisfaction: 'neutral' }
];

export function AIAutomation() {
  const columns = [
    { key: 'user', label: 'User', sortable: true },
    { key: 'query', label: 'Query' },
    { key: 'response', label: 'AI Response' },
    { key: 'time', label: 'Time', sortable: true },
    {
      key: 'satisfaction',
      label: 'Feedback',
      render: (value: string) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
          value === 'positive' ? 'bg-green-500/10 text-green-500' :
          value === 'neutral' ? 'bg-yellow-500/10 text-yellow-500' :
          'bg-red-500/10 text-red-500'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="AI & Automation Control"
        description="Manage AI chat agents and automation rules."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">Total Interactions</p>
          </div>
          <p className="text-2xl font-semibold">1,547</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-green-600 to-green-800 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
          <p className="text-2xl font-semibold">94%</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
          </div>
          <p className="text-2xl font-semibold">1.2s</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-pink-600 to-pink-800 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">Automation Rules</p>
          </div>
          <p className="text-2xl font-semibold">12</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6">
        <h3 className="mb-4">AI Chat Agent Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'General Queries Agent', status: 'active', queries: 847 },
            { name: 'Booking Assistant', status: 'active', queries: 523 },
            { name: 'Support Agent', status: 'active', queries: 177 }
          ].map((agent, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">{agent.name}</h4>
                <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full">
                  {agent.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{agent.queries} queries handled</p>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-1.5 text-xs bg-accent hover:bg-accent/70 rounded-lg transition-colors">
                  Configure
                </button>
                <button className="flex-1 px-3 py-1.5 text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors">
                  Disable
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h3 className="mb-4">Recent AI Interactions</h3>
        <DataTable columns={columns} data={mockInteractions} itemsPerPage={5} />
      </motion.div>
    </div>
  );
}
