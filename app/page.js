'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Heart, Shield, Users } from 'lucide-react';

export default function Home() {
  const stats = [
    { label: 'Registered Donors', value: '10,000+' },
    { label: 'Lives Saved', value: '25,000+' },
    { label: 'Hospital Partners', value: '150+' },
    { label: 'Active Requests', value: '45' },
  ];

  const steps = [
    {
      title: 'Register Profile',
      description: 'Sign up as a donor and provide your blood group and location details.',
      icon: <Users className="w-6 h-6 text-red-500" />
    },
    {
      title: 'Receive Request',
      description: 'Get notified when someone in your area urgently needs your blood type.',
      icon: <Activity className="w-6 h-6 text-red-500" />
    },
    {
      title: 'Donate Blood',
      description: 'Visit the specified hospital or blood bank to complete your donation safely.',
      icon: <Heart className="w-6 h-6 text-red-500" />
    },
    {
      title: 'Save a Life',
      description: 'Your contribution directly helps a patient in a critical medical emergency.',
      icon: <Shield className="w-6 h-6 text-red-500" />
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-50 py-20 sm:py-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fecdd3_1px,transparent_1px),linear-gradient(to_bottom,#fecdd3_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 font-medium text-sm mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Urgent requirement for O- blood in Mumbai
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8"
            >
              Give the gift of <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Life</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              Rakta connects generous blood donors with people in urgent need.
              Join our community today and make a vital difference when it matters most.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-red-600 text-white rounded-full font-semibold text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/30 hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Donate Blood
                <Heart size={20} className="fill-current text-red-200" />
              </Link>
              <Link
                href="/request"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Need Blood?
                <ArrowRight size={20} className="text-gray-400" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-gray-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Rakta Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A streamlined process designed to securely connect donors and patients in record time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 bg-red-50 rounded-xl flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-red-600">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-500 via-transparent to-transparent opacity-50"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to become a hero?
          </h2>
          <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto">
            Your single donation can save up to three lives. Join our network of thousands of donors today.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:-translate-y-1"
          >
            Join Rakta Now
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
