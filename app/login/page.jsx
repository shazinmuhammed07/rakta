'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Droplet, Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to login');

            router.push('/dashboard');
            router.refresh(); // Refresh to update navbar state
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-red-500 text-white p-3 rounded-2xl shadow-sm shadow-red-200">
                        <Droplet size={32} fill="currentColor" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Welcome back
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sign in to access your Rakta dashboard
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <div className="mt-1 relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 h-12 sm:text-sm border-gray-300 rounded-xl bg-white !text-black border focus:bg-white transition-colors"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1 relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 h-12 sm:text-sm border-gray-300 rounded-xl bg-white !text-black border focus:bg-white transition-colors"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    placeholder="Your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <a href="#" className="font-medium text-red-600 hover:text-red-500">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Log in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-medium text-red-600 hover:text-red-500">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
