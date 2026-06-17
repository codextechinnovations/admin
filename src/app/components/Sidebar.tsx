import { Link, useLocation } from 'react-router';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  CreditCard,
  Receipt,
  MessageSquare,
  Bell,
  Bot,
  FileText,
  Shield,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  CreditCard as IdCard,
  Upload,
  UserCheck,
  Send,
  Smartphone,
  DoorOpen
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'PG Management', path: '/pg-management', icon: Building2 },
  { name: 'PG Onboarding', path: '/pg-onboarding', icon: Send },
  { name: 'PG CSV Upload', path: '/pg-csv-upload', icon: Upload },
  { name: 'Bulk Add Rooms', path: '/bulk-add-rooms', icon: DoorOpen },
  { name: 'PG Owner Verify', path: '/pg-owner-verification', icon: UserCheck },
  { name: 'Tenants', path: '/tenants', icon: Users },
  { name: 'Bookings', path: '/bookings', icon: Calendar },
  { name: 'Payments', path: '/payments', icon: CreditCard },
  { name: 'Expenses', path: '/expenses', icon: Receipt },
  { name: 'Complaints', path: '/complaints', icon: MessageSquare },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Admin Roles', path: '/roles', icon: Shield },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'ID Cards', path: '/id-card-generator', icon: IdCard },
  { name: 'App Version', path: '/app-version', icon: Smartphone },
  { name: 'Settings', path: '/settings', icon: Settings }
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      className="fixed left-0 top-0 h-screen bg-sidebar/50 backdrop-blur-xl border-r border-sidebar-border z-50"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              <span className="bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] bg-clip-text text-transparent font-semibold">
                ManageYourPG
              </span>
              <span className="text-[10px] text-muted-foreground">Admin Panel</span>
            </motion.div>
          )}
          <button
            onClick={() => onToggle(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`
                    relative flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg
                    transition-all duration-200 group
                    ${isActive
                      ? 'bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white shadow-lg shadow-primary/20'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium truncate">{item.name}</span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] rounded-lg -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-[10px] text-muted-foreground text-center">
            {!isCollapsed && (
              <>
                <div>Codex Tech Innovations LLP</div>
                <div>© 2026 All Rights Reserved</div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
