'use client';

import { useState, useEffect } from 'react';
import { Loader2, Droplet, User, MapPin, Phone, Activity, AlertCircle, CheckCircle2, Bell, ShieldCheck, ShieldAlert, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { requestNotificationPermissionAndToken } from '@/lib/firebaseClient';
import MapDisplay from '@/components/MapDisplay';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [eligibilityData, setEligibilityData] = useState({ eligible: true, daysRemaining: 0 });

    useEffect(() => {
        if (user && user.role === 'donor') {
            setupNotifications();
            calculateEligibility(user.lastDonationDate);
        }
    }, [user]);

    const calculateEligibility = (lastDateStr) => {
        if (!lastDateStr) {
            setEligibilityData({ eligible: true, daysRemaining: 0 });
            return;
        }

        const lastDate = new Date(lastDateStr);
        const today = new Date();
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays >= 56) {
            setEligibilityData({ eligible: true, daysRemaining: 0 });
        } else {
            setEligibilityData({ eligible: false, daysRemaining: 56 - diffDays });
        }
    };

    const setupNotifications = async () => {
        const token = await requestNotificationPermissionAndToken();
        if (token && token !== user.fcmToken) {
            // Save token to backend
            try {
                await fetch('/api/users/fcm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fcmToken: token })
                });
                setNotificationsEnabled(true);
            } catch (err) {
                console.error("Failed to save FCM token", err);
            }
        } else if (token) {
            setNotificationsEnabled(true);
        }
    };

    const fetchData = async () => {
        try {
            // Fetch user profile
            const userRes = await fetch('/api/auth/me');
            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData.user);
            } else {
                window.location.href = '/login';
                return;
            }

            // Fetch blood requests
            const reqRes = await fetch('/api/requests');
            if (reqRes.ok) {
                const reqData = await reqRes.json();
                setRequests(reqData.requests);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async () => {
        if (!user) return;
        setUpdating(true);
        try {
            const res = await fetch('/api/users/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: !user.isAvailable }),
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error('Update failed', error);
        } finally {
            setUpdating(false);
        }
    };

    const updateRequestStatus = async (id, status) => {
        try {
            const res = await fetch(`/api/requests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-red-500 h-10 w-10" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    // Filter requests based on role
    const myRequests = requests.filter(r => r.requester && (r.requester.id === user.id || r.requester._id === user.id));
    const openExternalRequests = requests.filter(r => r.status === 'pending' && r.requester && (r.requester.id !== user.id && r.requester._id !== user.id));

    return (
        <div className="flex-1 bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Profile Section */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0">
                            <User size={36} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1"><Droplet size={14} className="text-red-500" /> {user.bloodGroup}</span>
                                <span className="flex items-center gap-1"><MapPin size={14} /> {user.locationName || 'Unknown Location'}</span>
                                <span className="flex items-center gap-1"><Phone size={14} /> {user.phone}</span>
                                {notificationsEnabled && (
                                    <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 rounded-full py-0.5" title="Notifications Enabled"><Bell size={12} /></span>
                                )}
                                <span className="capitalize px-2.5 py-0.5 rounded-full bg-gray-100 font-medium text-xs">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {user.role === 'donor' && (
                        <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">

                            {/* Eligibility Badge */}
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${eligibilityData.eligible ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                {eligibilityData.eligible ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                                <div className="text-sm font-medium">
                                    {eligibilityData.eligible ? 'Eligible to Donate' : `Next eligible in ${eligibilityData.daysRemaining} days`}
                                </div>
                            </div>

                            {/* Availability Toggle */}
                            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 w-full md:w-auto">
                                <span className="text-sm font-medium text-gray-700">Available</span>
                                <button
                                    onClick={toggleAvailability}
                                    disabled={updating}
                                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${user.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <span className="sr-only">Toggle availability</span>
                                    <span
                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.isAvailable ? 'translate-x-7' : 'translate-x-0'}`}
                                    />
                                </button>
                                <span className={`text-xs font-semibold ${user.isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                                    {user.isAvailable ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dashboard Content based on role */}
                {user.role === 'requester' ? (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">My Active Blood Requests</h2>
                            <div className="flex gap-4">
                                <Link href="/search" className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
                                    Find Donors
                                </Link>
                                <Link href="/request" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition shadow-sm">
                                    New Request
                                </Link>
                            </div>
                        </div>

                        {myRequests.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                                <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No active requests</h3>
                                <p className="mt-1 text-gray-500">You haven't made any blood requests yet.</p>
                                <Link href="/request" className="mt-4 inline-block bg-red-50 text-red-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition">
                                    Create a Request Now
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myRequests.map((req) => (
                                    <div key={req.id || req._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-10 w-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold text-lg shrink-0">
                                                    {req.bloodGroup}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{req.patientName}</p>
                                                    <p className="text-xs text-gray-500">{req.unitsRequired} Units Required</p>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                req.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Activity size={16} className="text-gray-400" />
                                                Urgency: <span className={`font-medium ${req.urgencyLevel === 'Emergency' ? 'text-red-600' : ''}`}>{req.urgencyLevel}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin size={16} className="text-gray-400" />
                                                {req.hospitalName}, {req.locationName || 'Unknown Location'}
                                            </div>
                                        </div>

                                        {req.status === 'pending' && (
                                            <div className="flex gap-2 mb-4">
                                                <button
                                                    onClick={() => updateRequestStatus(req._id, 'fulfilled')}
                                                    className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition border border-green-200"
                                                >
                                                    Mark Fulfilled
                                                </button>
                                                <button
                                                    onClick={() => updateRequestStatus(req._id, 'cancelled')}
                                                    className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition border border-gray-200"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}

                                        {req.location && req.location.coordinates && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 mb-2">Request Location Map</p>
                                                <div className="h-[200px] w-full rounded-xl overflow-hidden shadow-inner border border-gray-200">
                                                    <MapDisplay
                                                        centerPosition={req.location.coordinates}
                                                        radius={req.urgencyLevel === 'Emergency' ? 5000 : 10000}
                                                        donorPositions={[]}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <AlertCircle className="text-red-500" /> Nearby Urgent Requests
                            </h2>
                        </div>

                        {openExternalRequests.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                                <CheckCircle2 className="mx-auto h-12 w-12 text-green-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">All clear</h3>
                                <p className="mt-1 text-gray-500">There are no pending blood requests near you at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {openExternalRequests.map((req) => (
                                    <div key={req.id || req._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-sm">
                                                {req.bloodGroup}
                                            </div>
                                            {req.urgencyLevel === 'Emergency' && (
                                                <span className="animate-pulse bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                                                    EMERGENCY
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-bold text-lg text-gray-900 mb-1">{req.hospitalName}</h3>
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin size={16} className="text-gray-400" />
                                                {req.locationName || 'Unknown location'}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <User size={16} className="text-gray-400" />
                                                {req.patientName} • {req.unitsRequired} Units
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone size={16} className="text-gray-400" />
                                                Contact: {req.requester?.phone || 'Hidden'}
                                            </div>
                                        </div>

                                        {eligibilityData.eligible ? (
                                            <a
                                                href={`tel:${req.requester?.phone}`}
                                                className="w-full bg-red-50 text-red-600 py-3 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-colors flex justify-center items-center gap-2"
                                            >
                                                <Phone size={16} /> Contact Requester
                                            </a>
                                        ) : (
                                            <div className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 cursor-not-allowed" title={`You must wait ${eligibilityData.daysRemaining} more days to donate.`}>
                                                <ShieldAlert size={16} /> Contact Requester (Ineligible)
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
