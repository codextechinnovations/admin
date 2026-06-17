import { useEffect, useState } from 'react';
import { Save, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { adminService } from '../../services/adminService';

interface AppVersion {
  _id?: string;
  platform: 'android' | 'ios';
  versionName: string;
  versionCode: number;
  forceUpdate: boolean;
  updateUrl: string;
  releaseNotes: string;
  isActive: boolean;
  updatedAt?: string;
}

const emptyVersion: AppVersion = {
  platform: 'android',
  versionName: '',
  versionCode: 1,
  forceUpdate: false,
  updateUrl: '',
  releaseNotes: '',
  isActive: true,
};

export function AppVersionSettings() {
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAppVersions();
      if (res.success) {
        setVersions(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load app versions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const ensureVersion = (platform: 'android' | 'ios'): AppVersion => {
    const existing = versions.find((v) => v.platform === platform);
    return existing ? { ...existing } : { ...emptyVersion, platform };
  };

  const updateField = <K extends keyof AppVersion>(platform: 'android' | 'ios', key: K, value: AppVersion[K]) => {
    setVersions((prev) => {
      const idx = prev.findIndex((v) => v.platform === platform);
      const base = idx >= 0 ? { ...prev[idx] } : { ...emptyVersion, platform };
      base[key] = value;
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = base;
        return copy;
      }
      return [...prev, base];
    });
  };

  const handleSave = async (platform: 'android' | 'ios') => {
    const v = ensureVersion(platform);
    if (!v.versionName || v.versionCode === undefined || v.versionCode === null) {
      toast.error('Version name and version code are required');
      return;
    }
    try {
      setSaving(platform);
      await adminService.updateAppVersion({
        platform,
        versionName: v.versionName,
        versionCode: Number(v.versionCode),
        forceUpdate: !!v.forceUpdate,
        updateUrl: v.updateUrl || '',
        releaseNotes: v.releaseNotes || '',
        isActive: v.isActive !== false,
      });
      toast.success(`${platform} version saved`);
      fetchVersions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save version');
    } finally {
      setSaving(null);
    }
  };

  const renderCard = (platform: 'android' | 'ios') => {
    const v = ensureVersion(platform);
    return (
      <motion.div
        key={platform}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold capitalize">{platform}</h2>
              <p className="text-sm text-muted-foreground">
                {platform === 'android'
                  ? 'Google Play Store build'
                  : 'Apple App Store build'}
              </p>
            </div>
          </div>
          {v.isActive ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
              <CheckCircle className="w-4 h-4" /> Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-500">
              Inactive
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Version Name</label>
            <input
              value={v.versionName}
              onChange={(e) => updateField(platform, 'versionName', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              placeholder="e.g. 1.0.8"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Version Code</label>
            <input
              type="number"
              value={v.versionCode}
              onChange={(e) => updateField(platform, 'versionCode', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              placeholder="e.g. 8"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Update URL (optional)</label>
            <input
              value={v.updateUrl}
              onChange={(e) => updateField(platform, 'updateUrl', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              placeholder={
                platform === 'android'
                  ? 'https://play.google.com/store/apps/details?id=com.manageyourpg.getyourstay'
                  : 'https://apps.apple.com/app/idYOUR_APP_ID'
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Release Notes</label>
            <textarea
              value={v.releaseNotes}
              onChange={(e) => updateField(platform, 'releaseNotes', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              rows={3}
              placeholder="What's new in this version"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id={`force-${platform}`}
              type="checkbox"
              checked={!!v.forceUpdate}
              onChange={(e) => updateField(platform, 'forceUpdate', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor={`force-${platform}`} className="text-sm font-medium">
              Force update (users must update to continue)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              id={`active-${platform}`}
              type="checkbox"
              checked={v.isActive !== false}
              onChange={(e) => updateField(platform, 'isActive', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor={`active-${platform}`} className="text-sm font-medium">
              Active (show update prompt for this platform)
            </label>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => handleSave(platform)}
            disabled={saving === platform}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving === platform ? 'Saving...' : 'Save'}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div>
      <PageHeader
        title="App Version Control"
        description="Manage the latest version available on each app store"
      />

      <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-600">
          The app compares its built-in version (versionCode/versionName) with the values set here.
          If a newer version is published, users will see a "New Version Available" prompt on next launch.
          Enable <strong>Force update</strong> for critical releases.
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderCard('android')}
          {renderCard('ios')}
        </div>
      )}
    </div>
  );
}
