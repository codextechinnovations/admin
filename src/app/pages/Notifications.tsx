import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Send,
  Users,
  Bell,
  Smartphone,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { notificationService } from "../../services/notificationService";
import { useToast } from "../components/Toast";

interface Notification {
  _id: string;
  title: string;
  body: string;
  userType: string;
  data?: { target?: string };
  createdAt: string;
}

interface RecipientCounts {
  all: number;
  owners: number;
  tenants: number;
  active: number;
  admins: number;
  pushTokens: number;
}

const targetOptions = [
  {
    value: "all",
    label: "All Users",
    description: "Owners + Tenants + Admins",
  },
  { value: "tenants", label: "All Tenants" },
  { value: "owners", label: "All PG Owners" },
  { value: "active", label: "Active Tenants Only" },
  { value: "admins", label: "All Admins" },
];

export function Notifications() {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [sending, setSending] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<
    Notification[]
  >([]);
  const [recipientCounts, setRecipientCounts] =
    useState<RecipientCounts | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    fetchRecentNotifications();
    fetchRecipientCounts();
  }, []);

  const fetchRecentNotifications = async () => {
    try {
      setLoadingHistory(true);
      const response = await notificationService.getRecentNotifications();
      if (response.success) {
        setRecentNotifications(response.data || []);
      }
    } catch (err: any) {
      showToast(
        "error",
        err.response?.data?.message || "Failed to load notification history",
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchRecipientCounts = async () => {
    try {
      setLoadingCounts(true);
      const response = await notificationService.getRecipientCounts();
      if (response.success) {
        // Cast through unknown — the backend may omit some fields; treat
        // any partial object as the full shape so setState accepts it.
        setRecipientCounts(response.data as unknown as RecipientCounts);
      }
    } catch (err: any) {
      showToast(
        "error",
        err.response?.data?.message || "Failed to load recipient counts",
      );
    } finally {
      setLoadingCounts(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      showToast("error", "Please enter both title and message");
      return;
    }

    try {
      setSending(true);
      const response = await notificationService.sendNotification({
        title: title.trim(),
        message: message.trim(),
        target,
      });
      if (response.success) {
        setTitle("");
        setMessage("");
        showToast(
          "success",
          `Notification sent to ${response.data?.recipients || 0} devices (${response.data?.delivered || 0} delivered)`,
        );
        fetchRecentNotifications();
        fetchRecipientCounts();
      } else {
        showToast("error", response.message || "Failed to send notification");
      }
    } catch (err: any) {
      console.error("Error sending notification:", err);
      showToast(
        "error",
        err.response?.data?.message ||
          err.message ||
          "Failed to send notification",
      );
    } finally {
      setSending(false);
    }
  };

  const currentTargetLabel =
    targetOptions.find((o) => o.value === target)?.label || "All Users";
  const estimatedRecipients = recipientCounts
    ? target === "all"
      ? recipientCounts.all
      : target === "owners"
        ? recipientCounts.owners
        : target === "tenants"
          ? recipientCounts.tenants
          : target === "admins"
            ? recipientCounts.admins
            : recipientCounts.active
    : 0;

  return (
    <div>
      <PageHeader
        title="Notifications System"
        description="Send push notifications and announcements to app users."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Notification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Create Notification
          </h3>

          <form onSubmit={handleSendNotification} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={title}
                maxLength={100}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notification title"
                className="w-full px-4 py-2 bg-input rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {title.length}/100
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={message}
                maxLength={500}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter notification message"
                rows={5}
                className="w-full px-4 py-2 bg-input rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {message.length}/500
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Target Audience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {targetOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTarget(option.value)}
                    className={`flex flex-col items-start p-3 rounded-lg border transition-all text-left ${
                      target === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <span className="font-medium text-sm">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                This will send a push notification to{" "}
                <strong>{estimatedRecipients.toLocaleString()}</strong>{" "}
                registered users in the <strong>{currentTargetLabel}</strong>{" "}
                group.
              </p>
            </div>

            <button
              type="submit"
              disabled={sending || !title.trim() || !message.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Notification
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Stats + History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Audience Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-semibold">
                    {loadingCounts ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      (recipientCounts?.all || 0).toLocaleString()
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-600 to-green-800 rounded-lg">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Push Tokens
                  </p>
                  <p className="text-2xl font-semibold">
                    {loadingCounts ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      (recipientCounts?.pushTokens || 0).toLocaleString()
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentNotifications.length > 0 ? (
                recentNotifications.slice(0, 20).map((notif, idx) => (
                  <motion.div
                    key={notif._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-accent/30 transition-colors border border-border/50"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notif.body}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded capitalize">
                            {notif.data?.target || notif.userType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications sent yet</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
