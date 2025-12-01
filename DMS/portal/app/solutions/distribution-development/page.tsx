'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Network, BarChart2, Settings, Users, FileText, Activity, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../../components/Footer';

const DistributionDevelopmentPage = () => {
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
                    <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-green-900/10 rounded-full blur-[120px]"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
                        <span className="text-cyan-400 font-bold tracking-widest uppercase text-sm mb-4 block">Solutions</span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Distribution <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Development</span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto mb-8">
                            Build a robust, compliant, and high-performing distribution network. We assist in selecting, onboarding, and managing distributors to ensure seamless product availability across the market.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/contact" className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                                Optimize Your Network
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 bg-[#020617]">
                <div className="container mx-auto px-6">

                    {/* Intro */}
                    <div className="mb-20 max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">The Backbone of Pharma Success</h2>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            Your distributors are the extension of your brand. Their capability, financial health, and operational standards directly impact your market performance. AM Medtech provides end-to-end support in developing a professional distribution network that aligns with international standards and your business goals.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
                        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="space-y-8">
                            <h2 className="text-3xl font-bold text-white">Strengthen Your Supply Chain</h2>
                            <p className="text-slate-400 leading-relaxed">
                                We help you move from a transactional relationship to a strategic partnership with your distributors.
                            </p>
                            <div className="space-y-6">
                                <ServiceItem
                                    icon={<Users className="w-6 h-6 text-green-400" />}
                                    title="Distributor Selection & Assessment"
                                    desc="Rigorous evaluation of potential partners based on financial stability, infrastructure, reach, and compliance history."
                                />
                                <ServiceItem
                                    icon={<FileText className="w-6 h-6 text-cyan-400" />}
                                    title="Standard Operating Procedures (SOPs)"
                                    desc="Development and implementation of standardized processes for warehousing, logistics, and inventory management."
                                />
                                <ServiceItem
                                    icon={<Activity className="w-6 h-6 text-blue-400" />}
                                    title="Capability Building"
                                    desc="Training programs for distributor staff on product knowledge, sales techniques, and system usage."
                                />
                            </div>
                        </motion.div>
                        <div className="relative h-[500px] bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-2xl border border-white/10 p-8 flex items-center justify-center overflow-hidden">
                            {/* Road/Path */}
                            <div className="absolute w-full h-2 bg-white/5 top-1/2 -translate-y-1/2"></div>

                            {/* Moving Trucks */}
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute top-1/2 -translate-y-1/2"
                                    initial={{ x: -200, opacity: 0 }}
                                    animate={{ x: 400, opacity: [0, 1, 1, 0] }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        delay: i * 1.5,
                                        ease: "linear"
                                    }}
                                >
                                    <div className="relative">
                                        <Truck className="w-16 h-16 text-green-400" />
                                        <motion.div
                                            className="absolute -right-4 top-1/2 w-8 h-1 bg-green-400/50 blur-sm"
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                        />
                                    </div>
                                </motion.div>
                            ))}

                            {/* Warehouses/Nodes */}
                            <div className="absolute left-10 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#112240] border-2 border-green-500 rounded-lg flex items-center justify-center z-10">
                                <Settings className="w-8 h-8 text-green-400" />
                            </div>
                            <div className="absolute right-10 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#112240] border-2 border-cyan-500 rounded-lg flex items-center justify-center z-10">
                                <Users className="w-8 h-8 text-cyan-400" />
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="mb-24">
                        <h2 className="text-3xl font-bold text-white mb-12 text-center">Driving Performance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<Network className="w-8 h-8 text-cyan-400" />}
                                title="Network Optimization"
                                desc="Design an optimal network structure (Hub & Spoke, Direct) to minimize logistics costs and maximize service levels."
                            />
                            <FeatureCard
                                icon={<Settings className="w-8 h-8 text-blue-400" />}
                                title="Operational Excellence"
                                desc="Implement lean processes to reduce waste, improve fill rates, and ensure on-time delivery to customers."
                            />
                            <FeatureCard
                                icon={<BarChart2 className="w-8 h-8 text-purple-400" />}
                                title="KPI Monitoring"
                                desc="Track key metrics like Inventory Turnover, Days Sales Outstanding (DSO), and Order Fill Rate."
                            />
                        </div>
                    </div>

                    {/* Compliance Section */}
                    <div className="bg-[#112240]/30 rounded-3xl p-12 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-white mb-6">GSP & GDP Compliance</h2>
                                <p className="text-slate-400 leading-relaxed mb-6">
                                    Ensuring product quality throughout the supply chain is non-negotiable. We assist distributors in achieving and maintaining Good Storage Practices (GSP) and Good Distribution Practices (GDP).
                                </p>
                                <ul className="space-y-3">
                                    <ListItem text="Temperature monitoring systems setup" />
                                    <ListItem text="Cold chain management protocols" />
                                    <ListItem text="Mock audits and inspection readiness" />
                                </ul>
                            </div>
                            <div className="flex-shrink-0 p-6 bg-[#020617] rounded-full border border-cyan-500/30">
                                <Zap className="w-16 h-16 text-cyan-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[#0A192F]">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Build a World-Class Network</h2>
                    <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                        Partner with AM Medtech to elevate your distribution standards and capabilities.
                    </p>
                    <Link href="/contact" className="px-8 py-3 rounded-full bg-cyan-500 text-[#020617] font-bold hover:bg-cyan-400 transition-all">
                        Contact Our Experts
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
};

const ServiceItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="flex gap-4">
        <div className="mt-1 p-2 rounded-lg bg-white/5 h-fit">{icon}</div>
        <div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);

const ListItem = ({ text }: { text: string }) => (
    <li className="flex items-center gap-3 text-slate-300">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        {text}
    </li>
);

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="p-8 rounded-2xl bg-[#112240]/50 border border-white/5 hover:border-cyan-500/30 transition-all">
        <div className="mb-6">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

export default DistributionDevelopmentPage;
