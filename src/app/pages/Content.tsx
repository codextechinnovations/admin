import { motion } from 'motion/react';
import { FileText, Image, Plus, Info } from 'lucide-react';
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3"
      >
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-500">Content Management Coming Soon</p>
          <p className="text-xs text-muted-foreground mt-1">
            Banner and announcement management will be available once the content backend is integrated.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Image className="w-6 h-6 text-blue-500" />
            <h3>Banner Management</h3>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            <Image className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No banners configured yet</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-purple-500" />
            <h3>Announcements</h3>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No announcements yet</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
