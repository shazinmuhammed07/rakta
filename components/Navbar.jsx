'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Droplet, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Check auth status
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            }
        };
        checkAuth();
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Find Donors', path: '/search' },
        { name: 'Request Blood', path: '/request' },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 md:h-20 items-center">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-red-500 text-white p-2 rounded-xl group-hover:bg-red-600 transition-colors shadow-sm shadow-red-200">
                            <Droplet size={24} fill="currentColor" />
                        </div>
                        <span className="font-bold text-xl sm:text-2xl tracking-tight text-gray-900">Rakta</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <div className="flex space-x-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    href={link.path}
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-red-600",
                                        pathname === link.path ? "text-red-600" : "text-gray-600"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center space-x-4 border-l pl-6 border-gray-200">
                            {user ? (
                                <>
                                    <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
                                        <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                            <UserIcon size={16} />
                                        </div>
                                        <span>{user.name?.split(' ')[0] || 'User'}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="text-sm font-medium bg-red-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full hover:bg-red-700 transition-all shadow-md shadow-red-200 hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 hover:text-red-600 focus:outline-none p-2"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    href={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "block px-3 py-3 rounded-xl text-base font-medium transition-colors",
                                        pathname === link.path
                                            ? "bg-red-50 text-red-600"
                                            : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                                {user ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600"
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
                                        >
                                            Log out
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-3 pt-2">
                                        <Link
                                            href="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="w-full text-center px-4 py-3 border border-gray-200 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={() => setIsOpen(false)}
                                            className="w-full text-center px-4 py-3 bg-red-600 rounded-xl text-base font-medium text-white hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
                                        >
                                            Sign up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
