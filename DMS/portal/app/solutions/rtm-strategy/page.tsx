'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Map, TrendingUp, Users, Target, Compass, Layers, PieChart, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../../components/Footer';

const RTMStrategyPage = () => {
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

            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-[#0A192F] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px]"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
                        <span className="text-cyan-400 font-bold tracking-widest uppercase text-sm mb-4 block">Solutions</span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Strategic <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Route-to-Market</span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto mb-8">
                            Optimize your market coverage and penetration. We help you design and execute efficient route-to-market strategies tailored for the complex pharmaceutical landscape.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/contact" className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                                Start Your Strategy
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 bg-[#020617]">
                <div className="container mx-auto px-6">

                    {/* Introduction */}
                    <div className="mb-20 max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">Winning in the Last Mile</h2>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            An effective Route-to-Market (RTM) strategy is not just about logistics; it's about ensuring your products are available at the right place, at the right time, and recommended by the right professionals. We combine geospatial data, market intelligence, and channel expertise to build RTM models that maximize your reach while minimizing cost-to-serve.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
                        <div className="relative h-[450px] bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-white/10 p-8 flex items-center justify-center order-2 md:order-1 overflow-hidden">
                            {/* Central Hub */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="absolute w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center z-20 shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                            >
                                <Map className="w-10 h-10 text-white" />
                            </motion.div>

                            {/* Orbiting Nodes */}
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-full h-full flex items-center justify-center"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
                                >
                                    <motion.div
                                        className="w-12 h-12 bg-[#112240] border border-cyan-500/50 rounded-full flex items-center justify-center absolute"
                                        style={{ transform: `translateX(${120 + i * 15}px)` }}
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        transition={{ delay: i * 0.2 }}
                                    >
                                        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                                    </motion.div>
                                </motion.div>
                            ))}

                            {/* Connecting Lines (Simulated) */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                                <circle cx="50%" cy="50%" r="120" stroke="currentColor" strokeWidth="1" className="text-blue-500/30" fill="none" strokeDasharray="4 4" />
                                <circle cx="50%" cy="50%" r="160" stroke="currentColor" strokeWidth="1" className="text-purple-500/30" fill="none" strokeDasharray="4 4" />
                            </svg>
                        </div>
                        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} className="space-y-8 order-1 md:order-2">
                            <h2 className="text-3xl font-bold text-white">Maximize Market Reach</h2>
                            <p className="text-slate-400 leading-relaxed">
                                Don't leave market potential untapped. Our RTM strategies ensure your products reach the right pharmacies, hospitals, and clinics efficiently.
                            </p>
                            <div className="space-y-6">
                                <StrategyItem
                                    icon={<Compass className="w-6 h-6 text-cyan-400" />}
                                    title="Territory Planning & Optimization"
                                    desc="Use GIS mapping to define optimal sales territories, balancing workload and potential for your field force."
                                />
                                <StrategyItem
                                    icon={<Layers className="w-6 h-6 text-blue-400" />}
                                    title="Channel Segmentation"
                                    desc="Categorize outlets (Chain Pharmacies, Independent, Hospitals) to tailor service levels and trade marketing investment."
                                />
                                <StrategyItem
                                    icon={<Users className="w-6 h-6 text-purple-400" />}
                                    title="Sales Force Effectiveness"
                                    desc="Design the right team structure, KPIs, and incentive programs to drive behavior and results."
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Our Methodology */}
                    <div className="mb-24">
                        <h2 className="text-3xl font-bold text-white mb-12 text-center">Our 4-Step Methodology</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StepCard number="01" title="Diagnostics" desc="Analyze current distribution footprint, cost structures, and market gaps." />
                            <StepCard number="02" title="Design" desc="Develop future-state RTM models, channel strategies, and financial simulations." />
                            <StepCard number="03" title="Pilot" desc="Test the new model in select regions to validate assumptions and refine processes." />
                            <StepCard number="04" title="Scale & Sustain" desc="Roll out nationally with change management support and continuous monitoring." />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard icon={<TrendingUp className="w-8 h-8 text-cyan-400" />} title="Growth Acceleration" desc="Identify high-potential territories and white spaces to accelerate your top-line growth." />
                        <FeatureCard icon={<PieChart className="w-8 h-8 text-blue-400" />} title="Cost Optimization" desc="Reduce cost-to-serve by optimizing delivery routes and distributor margins." />
                        <FeatureCard icon={<Award className="w-8 h-8 text-purple-400" />} title="Partner Alignment" desc="Align distributor incentives with your strategic goals for a win-win partnership." />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[#0A192F]">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Unlock Your Market Potential</h2>
                    <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                        Let's design a route-to-market strategy that delivers sustainable competitive advantage.
                    </p>
                    <Link href="/contact" className="px-8 py-3 rounded-full bg-cyan-500 text-[#020617] font-bold hover:bg-cyan-400 transition-all">
                        Get a Strategy Audit
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
};

const StrategyItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="flex gap-4">
        <div className="mt-1 p-2 rounded-lg bg-white/5 h-fit">{icon}</div>
        <div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);

const StepCard = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
    <div className="p-6 rounded-2xl bg-[#112240]/30 border border-white/5 hover:border-cyan-500/30 transition-all relative overflow-hidden group">
        <span className="absolute top-0 right-0 text-6xl font-bold text-white/5 group-hover:text-cyan-500/10 transition-colors">{number}</span>
        <h3 className="text-xl font-bold text-white mb-3 relative z-10">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed relative z-10">{desc}</p>
    </div>
);

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="p-8 rounded-2xl bg-[#112240]/50 border border-white/5 hover:border-cyan-500/30 transition-all">
        <div className="mb-6">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

export default RTMStrategyPage;
