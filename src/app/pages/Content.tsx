import { motion } from 'motion/react';
import { FileText, Image, Plus } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

export function Content() {
  return (
    <div>
      <PageHeader
        title="Content Management System"
        description="Manage website content, banners, and announcements."
        action={
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" />
            Create Content
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Image className="w-6 h-6 text-blue-500" />
            <h3>Banner Management</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Homepage Hero Banner', status: 'active', views: 15234 },
              { name: 'Promotional Offer Banner', status: 'active', views: 8456 },
              { name: 'Seasonal Campaign', status: 'inactive', views: 3421 }
            ].map((banner, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/30 hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{banner.name}</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    banner.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    {banner.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{banner.views.toLocaleString()} views</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-purple-500" />
            <h3>Announcements</h3>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Platform Maintenance Notice', date: '2025-04-01', priority: 'high' },
              { title: 'New Feature Launch', date: '2025-03-28', priority: 'medium' },
              { title: 'Holiday Greetings', date: '2025-03-25', priority: 'low' }
            ].map((announcement, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/30 hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{announcement.title}</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    announcement.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                    announcement.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{announcement.date}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
