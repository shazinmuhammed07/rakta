'use client';

import { useState, useEffect } from 'react';
import { Shield, Users, Activity, Trash2, CheckCircle2, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [data, setData] = useState({ users: [], requests: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const router = useRouter();

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const res = await fetch('/api/admin');
            if (res.ok) {
                const adminData = await res.json();
                setData(adminData);
            } else if (res.status === 401 || res.status === 403) {
                router.push('/dashboard');
            } else {
                setError('Failed to load admin data');
            }
        } catch (err) {
            setError('An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchAdminData();
            } else {
                alert('Failed to delete user');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-red-500 h-10 w-10" />
            </div>
        );
    }

    const filteredUsers = data.users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.includes(searchQuery)
    );

    return (
        <div className="flex-1 bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-900 text-white p-3 rounded-xl shadow-sm">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Control Panel</h1>
                            <p className="text-sm text-gray-500">Manage users and monitor blood requests.</p>
                        </div>
                    </div>

                    <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Users ({data.users.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'requests' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Requests ({data.requests.length})
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100">
                        {error}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Users size={18} className="text-gray-500" /> All Platform Users
                            </h2>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={14} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search name or phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 text-sm border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 w-full sm:w-64 bg-white"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Role & Status</th>
                                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-red-50 rounded-full flex items-center justify-center text-red-600 font-bold">
                                                        {u.bloodGroup}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-xs sm:text-sm font-medium text-gray-900">{u.name}</div>
                                                        <div className="text-xs sm:text-sm text-gray-500">{u.location}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 whitespace-nowrap">
                                                <div className="text-xs sm:text-sm text-gray-900">{u.phone}</div>
                                                <div className="text-xs text-gray-500">Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 whitespace-nowrap">
                                                <span className={`px-2 inline-flex flex-col gap-1 text-xs leading-5 font-semibold rounded-full`}>
                                                    <span className={`px-2 py-0.5 rounded-full capitalize w-max ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'requester' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                        {u.role}
                                                    </span>
                                                    {u.role === 'donor' && (
                                                        <span className={`px-2 py-0.5 rounded-full w-max ${u.isAvailable ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                            {u.isAvailable ? 'Available' : 'Unavailable'}
                                                        </span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                                                {u.role !== 'admin' && (
                                                    <button
                                                        onClick={() => deleteUser(u._id)}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                                                        title="Remove fake account"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No users found matching your search.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Activity size={18} className="text-gray-500" /> All Blood Requests
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient / Target</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location & Hospital</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.requests.map((r) => (
                                        <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{r.patientName}</div>
                                                <div className="text-xs text-gray-500">Req By: {r.requester?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-400">{r.requester?.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">{r.hospitalName}</div>
                                                <div className="text-xs text-gray-500">{r.location}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">{r.bloodGroup}</span>
                                                    <span className="text-sm text-gray-600">{r.unitsRequired} Units</span>
                                                </div>
                                                <div className="text-xs mt-1">
                                                    Urgency: <span className={r.urgencyLevel === 'Emergency' ? 'text-red-500 font-bold' : ''}>{r.urgencyLevel}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        r.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {r.status}
                                                </span>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {new Date(r.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.requests.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No blood requests have been made yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
