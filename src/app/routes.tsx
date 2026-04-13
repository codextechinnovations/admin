import { createBrowserRouter } from 'react-router';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { PGManagement } from './pages/PGManagement';
import { Tenants } from './pages/Tenants';
import { Bookings } from './pages/Bookings';
import { Payments } from './pages/Payments';
import { Expenses } from './pages/Expenses';
import { Complaints } from './pages/Complaints';
import { Notifications } from './pages/Notifications';
import { AIAutomation } from './pages/AIAutomation';
import { Content } from './pages/Content';
import { Roles } from './pages/Roles';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { IdCardGenerator } from './pages/IdCardGenerator';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: 'pg-management', Component: PGManagement },
      { path: 'tenants', Component: Tenants },
      { path: 'bookings', Component: Bookings },
      { path: 'payments', Component: Payments },
      { path: 'expenses', Component: Expenses },
      { path: 'complaints', Component: Complaints },
      { path: 'notifications', Component: Notifications },
      { path: 'ai-automation', Component: AIAutomation },
      { path: 'content', Component: Content },
      { path: 'roles', Component: Roles },
      { path: 'reports', Component: Reports },
      { path: 'settings', Component: Settings },
      { path: 'id-card-generator', Component: IdCardGenerator }
    ]
  },
  {
    path: '*',
    Component: NotFound
  }
]);
