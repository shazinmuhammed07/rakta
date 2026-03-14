'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, User, MapPin, Building2, Droplet, Hash, AlertTriangle, Loader2 } from 'lucide-react';
import MapPicker from '@/components/MapPicker';

const InputWrapper = ({ icon: Icon, children }) => (
    <div className="mt-1 relative rounded-xl shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
        </div>
        {children}
    </div>
);

export default function SubmitRequest() {
    const [formData, setFormData] = useState({
        patientName: '',
        bloodGroup: 'A+',
        unitsRequired: 1,
        hospitalName: '',
        location: { lat: null, lng: null, name: '' },
        urgencyLevel: 'Normal',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const urgencies = ['Normal', 'Urgent', 'Emergency'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const submitData = { ...formData };
            if (submitData.location.lat && submitData.location.lng) {
                submitData.location = {
                    type: 'Point',
                    coordinates: [submitData.location.lng, submitData.location.lat]
                };
                submitData.locationName = formData.location.name;
            } else {
                setError("Please select the hospital location on the map.");
                setLoading(false);
                return;
            }

            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit request');

            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="flex-1 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">

                <div className="mb-8 text-center">
                    <div className="mx-auto h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-red-50">
                        <Activity className="h-8 w-8 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Request Blood</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Submit a request and we'll notify nearby available donors immediately.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Patient Name</label>
                                <InputWrapper icon={User}>
                                    <input
                                        type="text"
                                        required
                                        className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 h-12 sm:text-sm border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:bg-white transition-colors"
                                        placeholder="Full name of the patient"
                                        value={formData.patientName}
                                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                    />
                                </InputWrapper>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Group Required</label>
                                <div className="mt-1 relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Droplet className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 h-12 sm:text-sm border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:bg-white transition-colors cursor-pointer appearance-none"
                                        value={formData.bloodGroup}
                                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                    >
                                        {bloodGroups.map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Units Required (Pints)</label>
                                <InputWrapper icon={Hash}>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        required
                                        className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 h-12 sm:text-sm border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:bg-white transition-colors"
                                        value={formData.unitsRequired}
                                        onChange={(e) => setFormData({ ...formData, unitsRequired: parseInt(e.target.value) || 1 })}
                                    />
                                </InputWrapper>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Hospital Name & Address</label>
                                <InputWrapper icon={Building2}>
                                    <input
                                        type="text"
                                        required
                                        className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 h-12 sm:text-sm border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:bg-white transition-colors"
                                        placeholder="e.g. City Hospital, Ward 3"
                                        value={formData.hospitalName}
                                        onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                                    />
                                </InputWrapper>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Hospital / Request Location</label>
                                <div className="h-[350px] w-full mt-1">
                                    <MapPicker
                                        onLocationSelect={(loc) => setFormData({ ...formData, location: loc })}
                                        initialLocationName={formData.location.name}
                                    />
                                </div>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Urgency Level</label>
                                <div className="mt-1 relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <AlertTriangle className={`h-5 w-5 ${formData.urgencyLevel === 'Emergency' ? 'text-red-500' :
                                            formData.urgencyLevel === 'Urgent' ? 'text-yellow-500' : 'text-green-500'
                                            }`} />
                                    </div>
                                    <select
                                        className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 h-12 sm:text-sm border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:bg-white transition-colors cursor-pointer appearance-none"
                                        value={formData.urgencyLevel}
                                        onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                                    >
                                        {urgencies.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 transition-all hover:-translate-y-0.5"
                            >
                                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Submit Blood Request'}
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-4 font-medium">
                                By submitting this request, you confirm that the details provided are accurate and the requirement is genuine.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
