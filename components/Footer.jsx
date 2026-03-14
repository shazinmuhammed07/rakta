import Link from 'next/link';
import { Droplet, Heart, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">

                    <div className="col-span-1 sm:col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 group mb-4">
                            <div className="bg-red-500 text-white p-1.5 rounded-lg">
                                <Droplet size={20} fill="currentColor" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900">Rakta</span>
                        </Link>
                        <p className="text-gray-500 text-sm max-w-xs sm:max-w-sm mb-6 leading-relaxed">
                            Connecting generous blood donors with patients in urgent need. Our platform makes it easy to find and request blood in your local area.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                                <Github size={18} />
                            </a>
                            <a href="mailto:hello@rakta.org" className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link href="/search" className="text-sm text-gray-500 hover:text-red-600 transition-colors">Find Donors</Link></li>
                            <li><Link href="/request" className="text-sm text-gray-500 hover:text-red-600 transition-colors">Request Blood</Link></li>
                            <li><Link href="/register" className="text-sm text-gray-500 hover:text-red-600 transition-colors">Become a Donor</Link></li>
                            <li><Link href="/login" className="text-sm text-gray-500 hover:text-red-600 transition-colors">Log in</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
                        <ul className="space-y-3">
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-red-600 transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-red-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-red-600 transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-red-600 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} Rakta. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Made with</span>
                        <Heart size={14} className="text-red-500" fill="currentColor" />
                        <span>for the community</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
