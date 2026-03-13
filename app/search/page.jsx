'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Droplet, User, Phone, Filter, Loader2 } from 'lucide-react';

export default function SearchDonors() {
    const [bloodGroup, setBloodGroup] = useState('');
    const [location, setLocation] = useState('');
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    useEffect(() => {
        fetchDonors();
    }, []);

    const fetchDonors = async () => {
        setSearching(true);
        try {
            const queryParams = new URLSearchParams();
            if (bloodGroup) queryParams.append('bloodGroup', bloodGroup);
            if (location) queryParams.append('location', location);

            const res = await fetch(`/api/users?${queryParams.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setDonors(data.donors);
            }
        } catch (error) {
            console.error('Failed to fetch donors', error);
        } finally {
            setLoading(false);
            setSearching(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDonors();
    };

    // Initial load
    if (loading && donors.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-red-500 h-10 w-10" />
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-50">

            {/* Search Header */}
            <div className="bg-red-600 py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Find Blood Donors</h1>
                    <p className="text-red-100 text-lg max-w-2xl mx-auto">
                        Search our network of verified donors by blood group and location to find immediate help.
                    </p>
                </div>
            </div>

            {/* Search Bar Container */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-12">
                <div className="bg-white rounded-2xl p-4 shadow-lg shadow-red-100 border border-gray-100">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 h-12 sm:text-sm border-gray-300 rounded-xl bg-gray-50 text-gray-900 border focus:bg-white transition-colors cursor-pointer"
                                value={bloodGroup}
                                onChange={(e) => setBloodGroup(e.target.value)}
                            >
                                <option value="">Any Blood Group</option>
                                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                            </select>
                        </div>

                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter city or location..."
                                className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 h-12 sm:text-sm border-gray-300 rounded-xl bg-gray-50 text-gray-900 border focus:bg-white transition-colors"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={searching}
                            className="px-8 flex items-center justify-center gap-2 h-12 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-md disabled:opacity-70"
                        >
                            {searching ? <Loader2 className="animate-spin h-5 w-5" /> : <><Search size={18} /> Search</>}
                        </button>
                    </form>
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

                <div className="mb-6 flex justify-between items-center text-sm text-gray-500">
                    <span>Found <strong className="text-gray-900">{donors.length}</strong> available donors</span>
                </div>

                {donors.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No donors found</h3>
                        <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                            We couldn't find any available donors matching your current search criteria. Please try adjusting your filters.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {donors.map((donor) => (
                            <div key={donor._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="h-12 w-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-lg font-bold">
                                        {donor.bloodGroup}
                                    </div>
                                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div> Available
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-4 truncate">{donor.name}</h3>

                                <div className="space-y-3 mb-6 flex-1">
                                    <div className="flex items-center text-sm text-gray-600 gap-3">
                                        <div className="bg-gray-50 p-1.5 rounded-lg text-gray-400 group-hover:text-red-500 group-hover:bg-red-50 transition-colors">
                                            <MapPin size={16} />
                                        </div>
                                        <span className="truncate">{donor.location}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 gap-3">
                                        <div className="bg-gray-50 p-1.5 rounded-lg text-gray-400 group-hover:text-red-500 group-hover:bg-red-50 transition-colors">
                                            <Phone size={16} />
                                        </div>
                                        <span>{donor.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}</span>
                                    </div>
                                </div>

                                <a
                                    href={`tel:${donor.phone}`}
                                    className="w-full block text-center py-3 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-900 hover:text-white transition-colors"
                                >
                                    Contact Donor
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
