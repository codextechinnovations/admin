import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, UserPlus, Edit2, Trash2, Users } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Modal, FormField, Badge } from '../../components/Modal';
import { adminService } from '../../services/adminService';

const rolePermissions = {
  super_admin: ['All Permissions', 'User Management', 'System Configuration', 'Data Export'],
  admin: ['All Permissions', 'User Management', 'PG Management', 'Reports'],
  operations: ['Complaints', 'Support', 'Notifications', 'Basic Analytics'],
  support: ['Complaints', 'Support Tickets', 'User Queries']
};

const roleColors = {
  super_admin: 'bg-purple-500/10 text-purple-500',
  admin: 'bg-blue-500/10 text-blue-500',
  operations: 'bg-green-500/10 text-green-500',
  support: 'bg-orange-500/10 text-orange-500'
};

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'operations' | 'support';
  isActive: boolean;
  lastActive?: string;
  createdAt: string;
}

export function Roles() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');

  const [newUser, setNewUser] = useState({
    name: '', email: '', phone: '', password: '', role: 'admin' as const, permissions: [] as string[]
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdminUsers({ 
        limit: 100, 
        role: roleFilter || undefined 
      });
      if (response.success) {
        setUsers(response.data);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await adminService.createAdminUser(newUser);
      if (response.success) {
        setShowAddModal(false);
        setNewUser({ name: '', email: '', phone: '', password: '', role: 'admin', permissions: [] });
        fetchUsers();
      }
    } catch (err) {
      console.error('Error adding user:', err);
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      const response = await adminService.updateAdminUser(selectedUser._id, {
        name: selectedUser.name,
        phone: selectedUser.phone,
        role: selectedUser.role
      });
      if (response.success) {
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      await adminService.toggleAdminStatus(user._id);
      fetchUsers();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin user?')) return;
    try {
      await adminService.deleteAdminUser(id);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', render: (v: string) => v || '-' },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleColors[value as keyof typeof roleColors] || 'bg-gray-500/10 text-gray-500'}`}>
          {value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'lastActive',
      label: 'Last Active',
      sortable: true,
      render: (v: string) => v ? new Date(v).toLocaleDateString() : 'Never'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: AdminUser) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleEditUser(row)} className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleToggleStatus(row)} className="p-2 hover:bg-accent rounded-lg transition-colors" title={row.isActive ? 'Deactivate' : 'Activate'}>
            <Users className={`w-4 h-4 ${row.isActive ? 'text-green-500' : 'text-gray-400'}`} />
          </button>
          <button onClick={() => handleDeleteUser(row._id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const activeUsers = users.filter(u => u.isActive);
  const totalRoles = ['super_admin', 'admin', 'operations', 'support'].length;

  return (
    <div>
      <PageHeader
        title="Admin Roles & Management"
        description="Manage admin users and their permissions."
        action={
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg shadow-lg hover:shadow-xl transition-all">
            <UserPlus className="w-4 h-4" />
            Add Admin
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Admins</p>
              <p className="text-2xl font-semibold">{users.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold text-green-500">{activeUsers.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Roles</p>
              <p className="text-2xl font-semibold">{totalRoles}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="text-2xl font-semibold text-red-500">{users.length - activeUsers.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Role Permissions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(rolePermissions).map(([role, perms], i) => (
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <Shield className={`w-5 h-5 ${roleColors[role as keyof typeof roleColors]?.split(' ')[1] || 'text-gray-500'}`} />
              <h3 className="font-medium text-sm">{role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h3>
            </div>
            <div className="space-y-1">
              {perms.map((perm, j) => (
                <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Filter by Role:</label>
            <select
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="operations">Operations</option>
              <option value="support">Support</option>
            </select>
          </div>
          {roleFilter && (
            <button onClick={() => setRoleFilter('')} className="text-sm text-primary hover:underline">
              Clear filter
            </button>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <DataTable columns={columns} data={users} loading={loading} />
      </motion.div>

      {/* Add Admin Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Admin" size="md">
        <form onSubmit={handleAddUser}>
          <div className="space-y-4">
            <FormField label="Name *">
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Email *">
              <input
                type="email"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Phone">
              <input
                type="tel"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
            </FormField>

            <FormField label="Password *">
              <input
                type="password"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                minLength={6}
              />
            </FormField>

            <FormField label="Role *">
              <select
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="operations">Operations</option>
                <option value="support">Support</option>
              </select>
            </FormField>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg">
              Add Admin
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Admin Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Admin" size="md">
        {selectedUser && (
          <form onSubmit={handleUpdateUser}>
            <div className="space-y-4">
              <FormField label="Name *">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Phone">
                <input
                  type="tel"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={selectedUser.phone || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                />
              </FormField>

              <FormField label="Role *">
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as any })}
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="operations">Operations</option>
                  <option value="support">Support</option>
                </select>
              </FormField>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={selectedUser.isActive}
                  onChange={(e) => setSelectedUser({ ...selectedUser, isActive: e.target.checked })}
                />
                <label htmlFor="isActive">Active</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg">
                Update Admin
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
