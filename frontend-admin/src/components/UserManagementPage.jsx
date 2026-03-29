import { useState, useEffect } from 'react';
import { Search, ShieldAlert, ShieldCheck, UserX, UserCheck, Mail, Phone, Calendar } from 'lucide-react';
import { getUsers, toggleBlockUser } from '../api/users';
import useAuthStore from '../store/useAuthStore';
import { useNotification } from '../context/NotificationContext';

const UserManagementPage = () => {
    const { user: currentAdmin } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const { showNotification } = useNotification();
    const [blockingId, setBlockingId] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await getUsers();
            setUsers(res.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Failed to load users. Please check if the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleBlock = async (user) => {
        if (user.id === currentAdmin.id) {
            showNotification('error', 'You cannot block yourself');
            return;
        }

        const action = user.isBlocked ? 'unblock' : 'block';
        if (!window.confirm(`Are you sure you want to ${action} ${user.firstName}?`)) return;

        try {
            setBlockingId(user.id);
            await toggleBlockUser(user.id);
            showNotification('success', `User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`);
            fetchUsers();
        } catch (err) {
            showNotification('error', err.response?.data?.message || `Failed to ${action} user`);
        } finally {
            setBlockingId(null);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = 
            u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
            statusFilter === 'all' || 
            (statusFilter === 'active' && !u.isBlocked) || 
            (statusFilter === 'blocked' && u.isBlocked);
            
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-main tracking-tight">User Management</h1>
                    <p className="text-text-muted text-sm font-medium">Manage platform users and account access.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                <div className="relative w-full md:w-96 group text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider text-text-main cursor-pointer focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Members</option>
                        <option value="blocked">Blocked Accounts</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto text-left">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">User Details</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-full w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-full w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-full w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-full w-20"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-100 rounded-lg w-16 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-medium text-sm">No users found matching your search.</td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-all border-b border-slate-100 last:border-0">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="font-bold text-text-main text-sm">{user.firstName} {user.lastName}</div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-tighter mt-1">
                                                <Calendar size={12} />
                                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 min-w-[200px]">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-text-main">
                                                <Mail size={14} className="text-accent-blue" />
                                                {user.email}
                                            </div>
                                            {user.phoneNumber && (
                                                <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                                                    <Phone size={14} />
                                                    {user.phoneNumber}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                            user.role === 'ADMIN' 
                                            ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                            : 'bg-slate-50 text-slate-600 border-slate-100'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                                                !user.isBlocked ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${!user.isBlocked ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleToggleBlock(user)}
                                            disabled={blockingId === user.id || user.id === currentAdmin.id}
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm disabled:opacity-50 ${
                                                user.isBlocked 
                                                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                                                : 'bg-red-500 text-white hover:bg-red-600'
                                            } ${user.id === currentAdmin.id ? 'hidden' : ''}`}
                                        >
                                            {user.isBlocked ? <UserCheck size={14} /> : <UserX size={14} />}
                                            {user.isBlocked ? 'Unblock' : 'Block User'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-100">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="p-4 space-y-3 animate-pulse">
                                <div className="flex justify-between items-center">
                                    <div className="h-4 bg-slate-100 rounded-full w-32"></div>
                                    <div className="h-6 bg-slate-100 rounded-lg w-16"></div>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full w-48"></div>
                            </div>
                        ))
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center">
                            <UserX className="mx-auto text-slate-200 mb-4" size={48} />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No users found</p>
                        </div>
                    ) : (
                        filteredUsers.map(user => (
                            <div key={user.id} className="p-4 space-y-3 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-text-main text-sm">{user.firstName} {user.lastName}</h3>
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                            user.role === 'ADMIN' 
                                            ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                            : 'bg-slate-50 text-slate-600 border-slate-100'
                                        }`}>
                                            {user.role}
                                        </div>
                                    </div>
                                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                            !user.isBlocked ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                        <div className={`w-1 h-1 rounded-full ${!user.isBlocked ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                        {user.isBlocked ? 'Blocked' : 'Active'}
                                    </div>
                                </div>

                                <div className="space-y-2 py-3 border-y border-slate-50">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-text-main">
                                        <Mail size={14} className="text-accent-blue shrink-0" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    {user.phoneNumber && (
                                        <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                                            <Phone size={14} className="shrink-0" />
                                            {user.phoneNumber}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-tighter">
                                        <Calendar size={12} />
                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                    {user.id !== currentAdmin.id && (
                                        <button 
                                            onClick={() => handleToggleBlock(user)}
                                            disabled={blockingId === user.id}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm disabled:opacity-50 ${
                                                user.isBlocked 
                                                ? 'bg-emerald-500 text-white' 
                                                : 'bg-red-500 text-white'
                                            }`}
                                        >
                                            {user.isBlocked ? 'Unblock Account' : 'Block User'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagementPage;
