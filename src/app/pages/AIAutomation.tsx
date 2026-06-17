import { motion } from 'motion/react';
import { Bot, MessageSquare, Zap, TrendingUp, Info } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';

interface AIInteraction {
  id: string;
  user: string;
  query: string;
  response: string;
  time: string;
  satisfaction: 'positive' | 'neutral' | 'negative';
}

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

  const interactions: AIInteraction[] = [];

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
          <p className="text-2xl font-semibold">0</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-green-600 to-green-800 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
          <p className="text-2xl font-semibold">-</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
          </div>
          <p className="text-2xl font-semibold">-</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-pink-600 to-pink-800 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">Automation Rules</p>
          </div>
          <p className="text-2xl font-semibold">0</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3"
      >
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-500">AI Automation Coming Soon</p>
          <p className="text-xs text-muted-foreground mt-1">
            AI chat agents and automation rules will be configurable here once the backend AI service is integrated.
          </p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h3 className="mb-4">Recent AI Interactions</h3>
        <DataTable columns={columns} data={interactions} itemsPerPage={5} />
      </motion.div>
    </div>
  );
}
