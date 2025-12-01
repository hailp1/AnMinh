'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/Footer';

import Navbar from '../components/Navbar';

const CaseStudiesPage = () => {
    return (
        <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
            <Navbar />

            <section className="pt-32 pb-20 bg-[#0A192F] relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
                        <span className="text-cyan-400 font-bold tracking-widest uppercase text-sm mb-4 block">Success Stories</span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Proven Results in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Pharma</span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                            Explore how leading pharmaceutical companies are transforming their operations with AM Medtech.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 bg-[#020617]">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <CaseStudyCard
                            image="/banner.png" // Using banner as placeholder if no specific image
                            category="Distribution Management"
                            title="Famfa: Digitalizing Distribution for Growth"
                            desc="How Famfa optimized their supply chain and achieved 100% visibility with our Distribution Management System."
                            link="/case-studies/famfa"
                        />
                        {/* Placeholder for more case studies */}
                        <div className="rounded-2xl bg-[#112240]/20 border border-white/5 p-8 flex items-center justify-center text-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-500 mb-2">More Stories Coming Soon</h3>
                                <p className="text-slate-600">We are constantly helping partners achieve greatness.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
};

const CaseStudyCard = ({ image, category, title, desc, link }: { image: string, category: string, title: string, desc: string, link: string }) => (
    <Link href={link} className="group block rounded-2xl overflow-hidden bg-[#112240]/50 border border-white/5 hover:border-cyan-500/30 transition-all">
        <div className="relative h-64 overflow-hidden">
            <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute top-4 left-4 bg-cyan-500/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {category}
            </div>
        </div>
        <div className="p-8">
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">{title}</h3>
            <p className="text-slate-400 mb-6 leading-relaxed">{desc}</p>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
                Read Case Study <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    </Link>
);

export default CaseStudiesPage;
