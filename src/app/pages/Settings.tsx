import { motion } from 'motion/react';
import { Settings as SettingsIcon, Key, Bell, Shield, Info } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

export function Settings() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure platform settings and preferences."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3"
      >
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-500">Configuration via Environment</p>
          <p className="text-xs text-muted-foreground mt-1">
            Platform settings such as API keys, notification providers, and security policies are currently managed
            through backend environment variables. A settings API will be available soon.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="w-6 h-6 text-blue-500" />
            <h3>General Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Platform Name</label>
              <input
                type="text"
                defaultValue="ManageYourPG"
                disabled
                className="w-full px-4 py-2 bg-input rounded-lg border border-border opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Support Email</label>
              <input
                type="email"
                defaultValue="support@managemypg.com"
                disabled
                className="w-full px-4 py-2 bg-input rounded-lg border border-border opacity-60 cursor-not-allowed"
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <p className="text-sm font-medium">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Enable platform maintenance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" disabled />
                <div className="w-11 h-6 bg-switch-background rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all opacity-60 cursor-not-allowed"></div>
              </label>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-6 h-6 text-purple-500" />
            <h3>API Configuration</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Payment Gateway Key</label>
              <input
                type="password"
                defaultValue="Configured via environment"
                disabled
                className="w-full px-4 py-2 bg-input rounded-lg border border-border opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">SMS Gateway API Key</label>
              <input
                type="password"
                defaultValue="Configured via environment"
                disabled
                className="w-full px-4 py-2 bg-input rounded-lg border border-border opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Email Service Key</label>
              <input
                type="password"
                defaultValue="Configured via environment"
                disabled
                className="w-full px-4 py-2 bg-input rounded-lg border border-border opacity-60 cursor-not-allowed"
              />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-green-500" />
            <h3>Notification Settings</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Email Notifications', description: 'Receive email alerts' },
              { label: 'SMS Notifications', description: 'Receive SMS alerts' },
              { label: 'Push Notifications', description: 'Mobile push notifications' },
              { label: 'Slack Integration', description: 'Send alerts to Slack' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" disabled />
                  <div className="w-11 h-6 bg-switch-background rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all opacity-60 cursor-not-allowed"></div>
                </label>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-orange-500" />
            <h3>Security Settings</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Two-Factor Authentication', description: 'Enable 2FA for admin accounts' },
              { label: 'Session Timeout', description: 'Auto logout after inactivity' },
              { label: 'IP Whitelist', description: 'Restrict access by IP' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" disabled />
                  <div className="w-11 h-6 bg-switch-background rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all opacity-60 cursor-not-allowed"></div>
                </label>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6">
        <button disabled className="px-6 py-3 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg shadow-lg opacity-50 cursor-not-allowed">
          Save Changes (Coming Soon)
        </button>
      </motion.div>
    </div>
  );
}
