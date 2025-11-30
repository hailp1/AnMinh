'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/Footer';

const CaseStudiesPage = () => {
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
                        <Link href="/case-studies/famfa" className="text-cyan-400 text-sm font-medium transition-colors">Case Studies</Link>
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
                            desc="How Famfa optimized their supply chain and achieved 100% visibility with our DMS solution."
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
