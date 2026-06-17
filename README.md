# ManageMyPG Admin Panel

A modern, secure, and high-performance admin dashboard for ManageMyPG - a comprehensive PG (Paying Guest) management platform.

**Built by:** Codex Tech Innovations and Consultants LLP

## 🎨 Design Features

- **Premium Dark Theme** with glassmorphism effects
- **Custom Color Palette**: Primary gradient from `#1a1a4e` → `#2d2d7e` → `#1e3a8a`
- **Typography**: Poppins font family
- **Smooth Animations**: Powered by Framer Motion
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🚀 Tech Stack

- **Framework**: React with TypeScript
- **Routing**: React Router v7 (Data Router pattern)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── Sidebar.tsx      # Collapsible navigation sidebar
│   │   ├── Navbar.tsx       # Top navigation bar
│   │   ├── StatsCard.tsx    # Dashboard statistics cards
│   │   ├── DataTable.tsx    # Advanced data table with sorting/search
│   │   ├── PageHeader.tsx   # Page title headers
│   │   ├── LoadingSkeleton.tsx  # Loading states
│   │   ├── Toast.tsx        # Toast notifications
│   │   └── ProtectedRoute.tsx   # Route protection wrapper
│   │
│   ├── context/             # React context providers
│   │   └── AuthContext.tsx  # Authentication state management
│   │
│   ├── layouts/             # Layout components
│   │   └── DashboardLayout.tsx  # Main dashboard layout
│   │
│   ├── pages/               # Page components
│   │   ├── Login.tsx        # Authentication page
│   │   ├── Dashboard.tsx    # Main overview dashboard
│   │   ├── PGManagement.tsx # PG listings management
│   │   ├── Tenants.tsx      # Tenant management
│   │   ├── Bookings.tsx     # Booking management
│   │   ├── Payments.tsx     # Payment & revenue tracking
│   │   ├── Complaints.tsx   # Support ticket system
│   │   ├── Notifications.tsx # Push notification system
│   │   ├── AIAutomation.tsx # AI chat agents & automation
│   │   ├── Content.tsx      # Content management system
│   │   ├── Roles.tsx        # Admin role management
│   │   ├── Reports.tsx      # Analytics & reporting
│   │   ├── Settings.tsx     # Platform configuration
│   │   └── NotFound.tsx     # 404 error page
│   │
│   ├── routes.tsx           # Router configuration
│   └── App.tsx              # Root application component
│
└── styles/
    ├── fonts.css            # Font imports (Poppins)
    └── theme.css            # Custom theme variables
```

## 🔐 Authentication

The admin panel uses JWT-based authentication with role-based access control (RBAC):

- **Super Admin**: Full system access
- **Admin**: PG and tenant management
- **Operations**: Support and basic analytics

### Demo Credentials
- **Email**: admin@codextech.com
- **Password**: any password (mock authentication)

## 📊 Modules & Features

### 1. Dashboard Overview
- Total PGs, Tenants, Bookings, Revenue statistics
- Revenue & booking trend charts
- Occupancy status visualization
- Recent activities feed

### 2. PG Management
- View all registered PGs
- Approve/reject new listings
- Edit PG details
- Block/suspend PGs
- Revenue analytics per PG

### 3. Tenant Management
- View all platform tenants
- KYC verification status
- Check-in/check-out tracking
- Tenant history
- Flag suspicious users

### 4. Booking Management
- All bookings list
- Status filtering (active, pending, completed, cancelled)
- Manual booking override
- Refund/cancellation handling

### 5. Payments & Revenue
- Transaction tracking
- Platform commission (10%) calculation
- Revenue analytics with charts
- Export reports (CSV/PDF)

### 6. Complaints & Support
- Ticket management system
- Priority levels (high, medium, low)
- Status tracking (open, in-progress, resolved)
- Internal notes

### 7. Notifications System
- Send push notifications
- Target specific user groups
- Announcement broadcasting
- Notification history

### 8. AI & Automation
- Manage AI chat agents
- View AI interaction logs
- Configure automation rules
- Performance metrics

### 9. Content Management
- Banner management
- Announcements
- Website content control

### 10. Roles & Admin Management
- User role assignment
- Permission management (RBAC)
- Activity logs
- Admin user CRUD

### 11. Reports & Analytics
- Growth trend visualization
- Revenue analysis
- Downloadable reports
- Advanced filtering

### 12. Settings
- Platform configuration
- API keys management
- Notification preferences
- Security settings

## 🎯 Key Features

### UI/UX
- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Smooth Animations**: Page transitions, hover effects, loading states
- **Loading Skeletons**: Better perceived performance
- **Toast Notifications**: User feedback system
- **Responsive Tables**: Pagination, sorting, filtering, search

### Performance
- **Lazy Loading**: Code splitting for optimal load times
- **Optimized Animations**: GPU-accelerated transitions
- **Efficient Re-renders**: React context optimization

### Security
- **Protected Routes**: Authentication-based access control
- **Role-Based Permissions**: RBAC implementation
- **Session Management**: Auto-logout on inactivity
- **Secure Storage**: LocalStorage for auth tokens

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
# The Vite dev server is already running in this environment
```

### Login
Navigate to `/login` and use the demo credentials:
- Email: admin@codextech.com
- Password: any password

## 🎨 Customization

### Theme Colors
Edit `src/styles/theme.css` to customize the color scheme:
```css
--primary-start: #1a1a4e;
--primary-mid: #2d2d7e;
--primary-end: #1e3a8a;
```

### Fonts
Add font imports to `src/styles/fonts.css`

## 📱 Responsive Design

The admin panel is fully responsive:
- **Desktop**: Full sidebar with labels
- **Tablet**: Collapsible sidebar
- **Mobile**: Optimized touch targets and spacing

## 🔄 Data Flow

All pages use **mock data** for demonstration. In production:
1. Replace mock data with API calls
2. Implement real authentication endpoint
3. Connect to backend services
4. Add error handling and retry logic

## 🛠️ Development Notes

- **Router Pattern**: Uses React Router Data Router API
- **State Management**: React Context for auth, local state for UI
- **Styling**: Tailwind utility-first approach
- **Type Safety**: TypeScript for type checking
- **Code Organization**: Feature-based folder structure

## 📄 License

© 2026 Codex Tech Innovations and Consultants LLP. All rights reserved.

## 👥 Support

For issues or questions, contact: support@codextech.com

---

**Note**: This is an internal admin panel for ManageMyPG operations team only. Not for PG owners or tenants.

## Production Status

- All primary modules are wired to the backend API (`/api/admin/*`).
- TypeScript type checking is enabled (`npm run typecheck`).
- Push notifications are fully functional end-to-end via Expo.
- Pages without backend support (AI Automation, Content, Settings) show clear "Coming Soon" placeholders instead of mock data.

## Scripts

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build (includes type check)
npm run typecheck # TypeScript check only
```
