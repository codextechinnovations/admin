import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Users, Building2, UserCheck } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { notificationService } from '../../services/notificationService';

interface Notification {
  _id: string;
  title: string;
  body: string;
  userType: string;
  read: boolean;
  createdAt: string;
}

export function Notifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [recipientCount, setRecipientCount] = useState(0);

  useEffect(() => {
    fetchRecentNotifications();
  }, []);

  const fetchRecentNotifications = async () => {
    try {
      const response = await notificationService.getRecentNotifications();
      if (response.success) {
        setRecentNotifications(response.data);
        setRecipientCount(response.data.length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSending(true);
      const response = await notificationService.sendNotification({ title, message, target });
      if (response.success) {
        setTitle('');
        setMessage('');
        alert(`Notification sent to ${response.data?.count || 0} users`);
        fetchRecentNotifications();
      }
    } catch (err) {
      console.error('Error sending notification:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Notifications System"
        description="Send push notifications and announcements to users."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6">
          <h3 className="mb-4">Create Notification</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notification title"
                className="w-full px-4 py-2 bg-input rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter notification message"
                rows={4}
                className="w-full px-4 py-2 bg-input rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Target Audience</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full px-4 py-2 bg-input rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="all">All Users</option>
                <option value="tenants">All Tenants</option>
                <option value="owners">All PG Owners</option>
                <option value="active">Active Tenants Only</option>
              </select>
            </div>

            <button onClick={handleSendNotification} disabled={sending} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <div className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Recipients</p>
                <p className="text-2xl font-semibold">{recipientCount || '1,248'}</p>
              </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6">
            <h3 className="mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              {recentNotifications.length > 0 ? recentNotifications.slice(0, 5).map((notif) => (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-accent/30 transition-colors"
                >
                  <p className="font-medium text-sm">{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.body}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">{notif.userType}</span>
                  </div>
                </motion.div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent notifications</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
