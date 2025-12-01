'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, Star, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const CareersPage = () => {
    return (
        <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
            <Navbar />

            <section className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 bg-[#0A192F] relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
                        <span className="text-cyan-400 font-bold tracking-widest uppercase text-sm mb-4 block">Join Our Team</span>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                            Build the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Pharma Tech</span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                            We are looking for passionate individuals to join our mission of transforming the pharmaceutical industry through technology.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="py-16 sm:py-20 bg-[#020617]">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
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
    <div className="p-4 sm:p-6 rounded-xl bg-[#112240]/30 border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
        <div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{title}</h3>
            <div className="flex gap-4 text-sm text-slate-400 mt-2">
                <span className="flex items-center gap-1"><Briefcase size={14} /> {type}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {location}</span>
            </div>
        </div>
        <button className="w-full sm:w-auto px-6 py-2 rounded-full border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500 hover:text-[#020617] transition-all">
            Apply Now
        </button>
    </div>
);

export default CareersPage;
