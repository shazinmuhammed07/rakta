'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Droplet, User, Phone, MapPin, Lock, Info, Loader2, Mail } from 'lucide-react';
import MapPicker from '@/components/MapPicker';

const InputWrapper = ({ icon: Icon, children }) => (
    <div className="mt-1 relative rounded-xl shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
        </div>
        {children}
    </div>
);

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bloodGroup: 'A+',
        location: { lat: null, lng: null, name: '' },
        password: '',
        role: 'donor',
        lastDonationDate: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Transform location to expected backend format if present
            const submitData = { ...formData };
            if (submitData.location.lat && submitData.location.lng) {
                submitData.location = {
                    type: 'Point',
                    coordinates: [submitData.location.lng, submitData.location.lat]
                };
                submitData.locationName = formData.location.name;
            } else {
                setError("Please select a location on the map.");
                setLoading(false);
                return;
            }

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to register');

            router.push('/dashboard');
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
            <div className="sm:mx-auto sm:w-full sm:max-w-md pt-8">
                <div className="flex justify-center">
                    <div className="bg-red-500 text-white p-3 rounded-2xl shadow-sm shadow-red-200">
                        <Droplet size={32} fill="currentColor" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create an account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Join the community of lifesavers
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md pb-12">
                <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-5" onSubmit={handleSubmit}>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl flex items-start gap-2">
                                <Info className="h-5 w-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Account Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'donor' })}
                                    className={`py-3 px-4 rounded-xl border font-medium text-sm flex items-center justify-center gap-2 transition-colors ${formData.role === 'donor'
                                        ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Droplet size={18} /> Blood Donor
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'requester' })}
                                    className={`py-3 px-4 rounded-xl border font-medium text-sm flex items-center justify-center gap-2 transition-colors ${formData.role === 'requester'
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Info size={18} /> Requester
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <InputWrapper icon={User}>
                                <input
                                    type="text"
                                    required
                                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 h-12 sm:text-sm border-gray-300 rounded-xl bg-white !text-black border focus:bg-white transition-colors"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </InputWrapper>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <InputWrapper icon={Mail}>
                                <input
                                    type="email"
                                    required
                                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 h-12 sm:text-sm border-gray-300 rounded-xl bg-white !text-black border focus:bg-white transition-colors"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </InputWrapper>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <InputWrapper icon={Phone}>
                                <input
                                    type="tel"
                                    required
                                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 h-12 sm:text-sm border-gray-300 rounded-xl bg-white !text-black border focus:bg-white transition-colors"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    placeholder="Enter 10 digit number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </InputWrapper>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                                <div className="mt-1">
                                    <select
                                        className="focus:ring-red-500 focus:border-red-500 block w-full h-12 sm:text-sm border-gray-300 rounded-xl bg-white !text-black border focus:bg-white transition-colors px-3 cursor-pointer"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        value={formData.bloodGroup}
                                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                    >
                                        {bloodGroups.map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                        </div>

                        {formData.role === 'donor' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Donation Date (Optional)</label>
                                <div className="mt-1">
                                    <input
                                        type="date"
                                        className="focus:ring-red-500 focus:border-red-500 block w-full h-12 sm:text-sm border-gray-300 rounded-xl bg-white !text-black border focus:bg-white transition-colors px-3 cursor-pointer"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        value={formData.lastDonationDate}
                                        max={new Date().toISOString().split('T')[0]} // Cannot be in the future
                                        onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Helps us determine your eligibility (56 days required between donations).
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Location</label>
                            <div className="h-[350px] w-full mt-1">
                                <MapPicker
                                    onLocationSelect={(loc) => setFormData({ ...formData, location: loc })}
                                    initialLocationName={formData.location.name}
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Required to find nearby blood requests or donors
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <InputWrapper icon={Lock}>
                                <input
                                    type="password"
                                    required
                                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 h-12 sm:text-sm border-gray-300 rounded-xl bg-white !text-black border focus:bg-white transition-colors"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    placeholder="Min 6 characters"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </InputWrapper>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
