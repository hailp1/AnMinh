'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Database, BarChart, ShieldCheck, Globe, CheckCircle, Server, Lock, Smartphone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';

const DMSPlatformPage = () => {
    return (
        <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-[#0A192F] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[100px]"></div>
                </div>
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <span className="text-cyan-400 font-bold tracking-widest uppercase text-sm mb-4 block">Solutions</span>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                            Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Distribution Management System</span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto mb-8">
                            Revolutionize your pharmaceutical distribution with our advanced Distribution Management System. Gain real-time visibility, automate complex workflows, and drive sales growth with data-driven insights.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                            <Link href="/contact" className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                                Request Demo
                            </Link>
                            <Link href="#features" className="px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-all font-medium">
                                Explore Features
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Detailed Content Section */}
            <section id="features" className="py-20 bg-[#020617]">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Introduction */}
                    <div className="mb-20 max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">Why Your Pharma Business Needs a Modern Distribution Management System</h2>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            In the fast-paced pharmaceutical industry, managing a fragmented distribution network is a major challenge. Lack of visibility into secondary sales, stockouts at distributor points, and manual claim processing can drain your profitability. AM Medtech's Distribution Management System is designed specifically for the unique complexities of the pharma supply chain, ensuring compliance, efficiency, and scalability.
                        </p>
                    </div>

                    {/* Key Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 md:gap-16 items-center mb-20 sm:mb-24">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <h2 className="text-3xl font-bold text-white">Complete Visibility & Control</h2>
                            <p className="text-slate-400 leading-relaxed">
                                Our Distribution Management System provides a unified view of your entire distribution network. From inventory levels at distributor warehouses to secondary sales data, gain complete transparency into your supply chain.
                            </p>
                            <div className="space-y-4">
                                <FeatureItem
                                    title="Real-time Inventory Tracking"
                                    desc="Monitor batch-wise stock levels, expiry dates, and stock movement across all distributors in real-time."
                                />
                                <FeatureItem
                                    title="Automated Order Processing"
                                    desc="Streamline primary and secondary order flows. Auto-replenishment suggestions based on sales velocity."
                                />
                                <FeatureItem
                                    title="Scheme & Promotion Management"
                                    desc="Configure complex trade schemes, discounts, and quantity offers. Automate claim settlement to reduce disputes."
                                />
                            </div>
                        </motion.div>
                        <div className="relative h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-white/10 p-6 sm:p-8 flex items-center justify-center">
                            <Database className="w-40 h-40 text-cyan-400 opacity-50" />
                            {/* Abstract UI representation could go here */}
                        </div>
                    </div>

                    {/* Technical Highlights */}
                    <div className="mb-24">
                        <h2 className="text-3xl font-bold text-white mb-12 text-center">Technical Excellence</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                            <TechCard
                                icon={<Globe className="w-8 h-8 text-cyan-400" />}
                                title="Cloud Native"
                                desc="Built on scalable cloud infrastructure ensuring 99.9% uptime and global accessibility."
                            />
                            <TechCard
                                icon={<ShieldCheck className="w-8 h-8 text-blue-400" />}
                                title="GSP/GDP Compliant"
                                desc="Designed to adhere to Good Storage and Distribution Practices with full audit trails."
                            />
                            <TechCard
                                icon={<Smartphone className="w-8 h-8 text-purple-400" />}
                                title="Mobile Ready"
                                desc="Dedicated mobile apps for sales reps and retailers for on-the-go operations."
                            />
                            <TechCard
                                icon={<Lock className="w-8 h-8 text-green-400" />}
                                title="Enterprise Security"
                                desc="Bank-grade encryption and role-based access control to protect sensitive sales data."
                            />
                        </div>
                    </div>

                    {/* Analytics Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="relative h-[300px] sm:h-[350px] md:h-[400px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-white/10 p-6 sm:p-8 flex items-center justify-center order-2 md:order-1 overflow-hidden">
                            {/* Animated Background Grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                            {/* Animated Bars */}
                            <div className="flex items-end gap-4 relative z-10 h-64 w-full max-w-sm justify-center">
                                {[40, 70, 50, 90, 60, 80].map((height, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ height: 0 }}
                                        whileInView={{ height: `${height}%` }}
                                        transition={{ duration: 1, delay: index * 0.1, ease: "backOut" }}
                                        className="w-12 bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-lg relative group"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            transition={{ delay: 1 + index * 0.1 }}
                                            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 px-2 py-1 rounded text-xs font-bold text-white"
                                        >
                                            {height}%
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Floating Data Points */}
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-3 h-3 bg-cyan-400 rounded-full blur-[2px]"
                                    initial={{ x: Math.random() * 300 - 150, y: Math.random() * 300 - 150, opacity: 0 }}
                                    animate={{
                                        y: [0, -20, 0],
                                        opacity: [0, 1, 0],
                                        scale: [0, 1.5, 0]
                                    }}
                                    transition={{
                                        duration: 3 + Math.random() * 2,
                                        repeat: Infinity,
                                        delay: Math.random() * 2
                                    }}
                                    style={{ left: '50%', top: '50%' }}
                                />
                            ))}
                        </div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="space-y-6 order-1 md:order-2"
                        >
                            <h2 className="text-3xl font-bold text-white">Data-Driven Decision Making</h2>
                            <p className="text-slate-400 leading-relaxed">
                                Transform raw data into actionable insights. Our built-in analytics engine helps you identify market trends, optimize sales performance, and forecast demand accurately.
                            </p>
                            <ul className="space-y-4">
                                <ListItem text="Sales performance dashboards by region, product, and team." />
                                <ListItem text="Distributor health scorecards and ROI analysis." />
                                <ListItem text="Predictive analytics for demand forecasting." />
                                <ListItem text="Outlet coverage and productivity reports." />
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[#0A192F]">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Distribution?</h2>
                    <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                        Join leading pharma companies who have optimized their supply chain with AM Medtech's Distribution Management System.
                    </p>
                    <Link href="/contact" className="px-8 py-3 rounded-full bg-cyan-500 text-[#020617] font-bold hover:bg-cyan-400 transition-all">
                        Schedule a Consultation
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
};

const ListItem = ({ text }: { text: string }) => (
    <li className="flex items-start gap-3 text-slate-300">
        <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
        <span>{text}</span>
    </li>
);

const FeatureItem = ({ title, desc }: { title: string, desc: string }) => (
    <div className="border-l-2 border-cyan-500/30 pl-4 hover:border-cyan-500 transition-colors">
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

const TechCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="p-6 rounded-2xl bg-[#112240]/50 border border-white/5 hover:border-cyan-500/30 transition-all">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

export default DMSPlatformPage;
