'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, Star, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/Footer';

const CareersPage = () => {
    return (
        <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="relative w-32 md:w-40 h-8 md:h-10">
                        <Image src="/logo_medtech.png" alt="AM Medtech Logo" fill className="object-contain" />
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/#services" className="text-slate-300 hover:text-cyan-400 text-sm font-medium transition-colors">Services</Link>
                        <Link href="/data-intelligence" className="text-slate-300 hover:text-cyan-400 text-sm font-medium transition-colors">Data Intelligence</Link>
                        <Link href="/case-studies/famfa" className="text-slate-300 hover:text-cyan-400 text-sm font-medium transition-colors">Case Studies</Link>
                        <Link href="/about" className="text-slate-300 hover:text-cyan-400 text-sm font-medium transition-colors">About</Link>
                    </div>
                    <Link href="/login" className="hidden md:block px-6 py-2 rounded-full border border-cyan-500 text-cyan-500 text-xs md:text-sm font-bold tracking-wider hover:bg-cyan-500 hover:text-[#020617] transition-all duration-300">
                        CLIENT LOGIN
                    </Link>
                </div>
            </nav>

            <section className="pt-32 pb-20 bg-[#0A192F] relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
                        <span className="text-cyan-400 font-bold tracking-widest uppercase text-sm mb-4 block">Join Our Team</span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Build the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Pharma Tech</span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                            We are looking for passionate individuals to join our mission of transforming the pharmaceutical industry through technology.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 bg-[#020617]">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        <FeatureCard icon={<Star className="w-8 h-8 text-cyan-400" />} title="Innovation" desc="Work on cutting-edge technologies like AI, Big Data, and Cloud Computing." />
                        <FeatureCard icon={<Users className="w-8 h-8 text-blue-400" />} title="Collaboration" desc="Join a diverse team of experts from pharma, tech, and business backgrounds." />
                        <FeatureCard icon={<Heart className="w-8 h-8 text-purple-400" />} title="Impact" desc="Create solutions that directly improve healthcare access and efficiency." />
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-10 text-center">Open Positions</h2>
                        <div className="space-y-6">
                            <JobCard title="Senior Full Stack Developer" type="Full-time" location="Ho Chi Minh City" />
                            <JobCard title="Data Scientist" type="Full-time" location="Ho Chi Minh City" />
                            <JobCard title="Business Analyst (Pharma)" type="Full-time" location="Ho Chi Minh City" />
                            <JobCard title="Sales Manager" type="Full-time" location="Hanoi" />
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="p-8 rounded-2xl bg-[#112240]/50 border border-white/5 hover:border-cyan-500/30 transition-all text-center">
        <div className="mb-6 flex justify-center">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

const JobCard = ({ title, type, location }: { title: string, type: string, location: string }) => (
    <div className="p-6 rounded-xl bg-[#112240]/30 border border-white/5 hover:border-cyan-500/30 transition-all flex justify-between items-center group">
        <div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{title}</h3>
            <div className="flex gap-4 text-sm text-slate-400 mt-2">
                <span className="flex items-center gap-1"><Briefcase size={14} /> {type}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {location}</span>
            </div>
        </div>
        <button className="px-6 py-2 rounded-full border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500 hover:text-[#020617] transition-all">
            Apply Now
        </button>
    </div>
);

export default CareersPage;
