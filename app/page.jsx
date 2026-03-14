'use client';

import Link from 'next/link';
import { ArrowRight, Droplet, Heart, Activity, Globe2, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div className={`p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-xl shadow-red-900/5 transition-all duration-700 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'} hover:-translate-y-2 hover:shadow-2xl hover:bg-white/90 group`}>
            <div className="w-14 h-14 rounded-2xl bg-red-100/80 flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{title}</h3>
            <p className="text-gray-600 leading-relaxed font-medium">{description}</p>
        </div>
    );
};

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-center">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-400/20 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-rose-400/20 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-orange-300/20 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>
            </div>

            <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 flex-1 flex flex-col items-center justify-center">
                
                {/* Hero Section */}
                <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ease-out ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-200/50 bg-white/50 backdrop-blur-md mb-8 shadow-sm">
                        <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                        <span className="text-sm font-semibold text-red-700 tracking-wide uppercase">Save a Life Today</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-8">
                        Connect with donors.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
                            Give the gift of life.
                        </span>
                    </h1>
                    
                    <p className="mt-4 text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                        Rakta is a modern platform that bridging the gap between blood donors and those in urgent need. Fast, reliable, and built to save lives.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                        <Link 
                            href="/login" 
                            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-full overflow-hidden shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
                        >
                            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                            <span className="relative z-10 flex items-center gap-2">
                                Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                        
                        <Link 
                            href="#features" 
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-700 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 w-full sm:w-auto"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <div id="features" className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
                    <FeatureCard 
                        icon={Heart} 
                        title="Donate Blood" 
                        description="Register as a donor and be notified instantly when someone nearby needs your blood type."
                        delay={200}
                    />
                    <FeatureCard 
                        icon={Activity} 
                        title="Urgent Requests" 
                        description="Post a verified blood request. We instantly match and alert eligible donors in your area."
                        delay={400}
                    />
                    <FeatureCard 
                        icon={ShieldCheck} 
                        title="Safe & Verified" 
                        description="Your privacy and health data are securely managed. Every request and donor is authenticated."
                        delay={600}
                    />
                </div>
            </main>
        </div>
    );
}
