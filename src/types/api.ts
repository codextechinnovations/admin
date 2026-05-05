export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface PG {
  _id: string;
  ownerId: string;
  name: string;
  type: 'male' | 'female' | 'colive';
  totalRooms: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  area?: string;
  price?: number;
  rating?: number;
  images?: string[];
  isVerified: boolean;
  isAvailable: boolean;
  phone?: string;
  description?: string;
  amenities?: string[];
  createdAt: string;
  updatedAt: string;
  status : string;
}

export interface Tenant {
  _id: string;
  ownerId: string;
  name: string;
  phone: string;
  email?: string;
  status: 'ACTIVE' | 'NOTICE_PERIOD' | 'LEFT';
  monthlyRent: number;
  securityDeposit?: number;
  joiningDate: string;
  roomId?: string;
  roomNumber?: string;
  bedNumber?: number;
  aadhaarCardPhoto?: string;
  userPhoto?: string;
  id_proof?: string;
  aadhaar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  pgId: string;
  tenantId: string;
  roomNumber: string;
  bedCount: number;
  checkInDate: string;
  expectedCheckOutDate?: string;
  actualCheckOutDate?: string;
  monthlyRent: number;
  securityDeposit: number;
  status: 'pending' | 'active' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  ownerId: string;
  tenantId: string;
  pgId?: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  category?: string;
  month: number;
  year: number;
  paymentDate: string;
  status: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  owner_id: string;
  pg_id: string;
  title: string;
  amount: number;
  category: string;
  expense_date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  _id: string;
  pgId: string;
  pgName: string;
  ifscCode?: string;
  bankName?: string;
  bankBranch?: string;
  accountNumber: string;
  upiId?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  activeTenants: number;
  vacantRooms: number;
  totalExpenses: number;
  totalPayments: number;
  expectedRent: number;
  profit: number;
  occupancyRate: number;
  collectedPercentage: number;
  totalBeds: number;
  occupiedBeds: number;
}

export interface PaymentSummary {
  month: number;
  year: number;
  tenants: {
    tenantId: string;
    name: string;
    phone: string;
    roomNumber: string;
    monthlyRent: number;
    monthsActive: number;
    totalExpected: number;
    totalPaid: number;
    balance: number;
    joiningDate: string;
  }[];
}