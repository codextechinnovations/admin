import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: LucideIcon;
  gradient?: string;
}

export function StatsCard({ title, value, change, changeType, icon: Icon, gradient }: StatsCardProps) {
  const gradientClass = gradient || 'from-[#2d2d7e] to-[#1e3a8a]';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative overflow-hidden bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Background Gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientClass} opacity-10 rounded-full blur-2xl`}></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 bg-gradient-to-br ${gradientClass} rounded-lg shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change && (
            <span className={`text-sm px-2 py-1 rounded ${
              changeType === 'increase' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {change}
            </span>
          )}
        </div>
        <h3 className="text-sm text-muted-foreground mb-1">{title}</h3>
        <p className="text-3xl font-semibold">{value}</p>
      </div>
    </motion.div>
  );
}
