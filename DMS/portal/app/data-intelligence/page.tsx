'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Brain, Database, Link as LinkIcon, TrendingUp, ShieldCheck, Zap,
    Activity, Globe, Server, Map, Truck, Package, BarChart3,
    PieChart, ArrowRight, CheckCircle2, AlertCircle, ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const DataIntelligencePage = () => {
    return (
        <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
            {/* Navbar (Consistent with Home) */}
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-24 sm:pt-28 md:pt-32 lg:pt-48 pb-16 sm:pb-20 md:pb-24 lg:pb-32 px-4 sm:px-6">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="container mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest mb-6">
                            INTELLIGENT ECOSYSTEM
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                            Data-Driven <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                                Pharma Mastery
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-10">
                            From AI-powered demand forecasting to real-time logistics tracking.
                            We provide the visual intelligence you need to dominate the market.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 1. Supply Chain & Logistics Tracking */}
            <section className="py-16 sm:py-20 bg-slate-900/30 border-y border-white/5">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">End-to-End <span className="text-cyan-400">Logistics Visibility</span></h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Track every shipment in real-time. Our blockchain-backed ledger ensures transparency from warehouse to pharmacy.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Interactive Map Visualization */}
                        <div className="relative h-[300px] sm:h-[350px] md:h-[400px] bg-[#0B1221] rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 opacity-30 bg-[url('/map-pattern.svg')] bg-cover"></div>
                            {/* Simulated Route Lines */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                <motion.path
                                    d="M100,300 Q250,150 400,200 T700,100"
                                    fill="none"
                                    stroke="#06b6d4"
                                    strokeWidth="2"
                                    strokeDasharray="5 5"
                                    initial={{ pathLength: 0 }}
                                    whileInView={{ pathLength: 1 }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                                <motion.circle cx="100" cy="300" r="4" fill="#06b6d4">
                                    <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
                                </motion.circle>
                                <motion.circle cx="700" cy="100" r="4" fill="#ef4444" />
                            </svg>

                            {/* Floating Delivery Cards */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute top-10 left-10 bg-slate-800/90 backdrop-blur p-4 rounded-xl border border-cyan-500/30 shadow-lg"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Truck className="text-cyan-400 w-5 h-5" />
                                    <span className="font-bold text-sm">Vehicle #VN-8829</span>
                                </div>
                                <div className="text-xs text-slate-400">Route: HCM Warehouse → Da Nang</div>
                                <div className="text-xs text-green-400 mt-1">● On Time</div>
                            </motion.div>

                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="absolute bottom-10 right-10 bg-slate-800/90 backdrop-blur p-4 rounded-xl border border-purple-500/30 shadow-lg"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Package className="text-purple-400 w-5 h-5" />
                                    <span className="font-bold text-sm">Order #ORD-9921</span>
                                </div>
                                <div className="text-xs text-slate-400">Status: Out for Delivery</div>
                                <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                                    <div className="bg-purple-500 w-[80%] h-full"></div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Order Tracking Timeline */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Activity className="text-cyan-400" /> Tracking On-chain
                                </h3>
                                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono flex items-center gap-2">
                                    <LinkIcon size={12} /> Blockchain Verified
                                </span>
                            </div>

                            <OnChainTracking />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Regional Performance Analytics */}
            <section className="py-16 sm:py-20">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        <div className="lg:col-span-1">
                            <h2 className="text-3xl font-bold mb-6">Regional <br /><span className="text-blue-500">Performance</span></h2>
                            <p className="text-slate-400 mb-8">
                                Real-time dashboards provide granular visibility into sales performance across all branches. Identify top performers and underperforming territories instantly.
                            </p>
                            <div className="space-y-4">
                                <StatCard label="Total Active Regions" value="12" />
                                <StatCard label="Top Growth Region" value="North Central (+45%)" />
                                <StatCard label="Active Pharmacies" value="2,450+" />
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-slate-800/30 rounded-2xl sm:rounded-3xl border border-white/5 p-4 sm:p-6 md:p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="font-bold flex items-center gap-2">
                                    <BarChart3 className="text-blue-400" /> Sales by Region (Monthly)
                                </h3>
                                <div className="flex gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span> <span className="text-xs text-slate-400">Target</span>
                                    <span className="w-3 h-3 rounded-full bg-cyan-400"></span> <span className="text-xs text-slate-400">Actual</span>
                                </div>
                            </div>

                            {/* Custom Bar Chart Visualization */}
                            <div className="space-y-6">
                                <RegionBar region="Ho Chi Minh City" target={90} actual={95} />
                                <RegionBar region="Hanoi" target={85} actual={82} />
                                <RegionBar region="Da Nang" target={70} actual={78} />
                                <RegionBar region="Can Tho" target={60} actual={65} />
                                <RegionBar region="Hai Phong" target={50} actual={48} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. AI Forecasting Section */}
            <section className="py-24 bg-gradient-to-b from-slate-900 to-[#020617]">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-purple-400 font-bold tracking-wider text-sm">PREDICTIVE INTELLIGENCE</span>
                        <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6">AI-Driven <span className="text-purple-500">Inventory Forecasting</span></h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Stop overstocking and stockouts. Our AI analyzes historical data, seasonality, and market trends to predict purchasing needs with 98% accuracy.
                        </p>
                    </div>

                    <div className="relative max-w-5xl mx-auto h-[300px] sm:h-[350px] md:h-[400px] bg-[#0B1221] rounded-2xl sm:rounded-3xl border border-purple-500/20 p-4 sm:p-6 md:p-8 overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.1)]">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 grid grid-cols-12 gap-4 opacity-10 pointer-events-none p-8">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="border-r border-white/20 h-full"></div>
                            ))}
                        </div>

                        {/* Chart Area */}
                        <div className="relative h-full flex items-end pb-8 pl-8">
                            {/* Y-Axis Labels */}
                            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-slate-500 py-4">
                                <span>10k</span>
                                <span>5k</span>
                                <span>0</span>
                            </div>

                            {/* Historical Line (Solid) */}
                            <svg className="w-full h-full overflow-visible">
                                <motion.path
                                    d="M0,250 Q100,200 200,220 T400,150 T600,100"
                                    fill="none"
                                    stroke="#a855f7"
                                    strokeWidth="3"
                                    initial={{ pathLength: 0 }}
                                    whileInView={{ pathLength: 1 }}
                                    transition={{ duration: 2 }}
                                />
                                {/* Forecast Line (Dashed) */}
                                <motion.path
                                    d="M600,100 Q700,50 800,80 T1000,20"
                                    fill="none"
                                    stroke="#22d3ee"
                                    strokeWidth="3"
                                    strokeDasharray="8 8"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    whileInView={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 2, delay: 1 }}
                                />

                                {/* Points */}
                                <circle cx="600" cy="100" r="6" fill="#a855f7" className="animate-pulse" />
                                <text x="580" y="80" fill="white" fontSize="12" fontWeight="bold">Today</text>

                                <circle cx="900" cy="40" r="4" fill="#22d3ee" />
                                <text x="880" y="25" fill="#22d3ee" fontSize="12">AI Forecast</text>
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 text-center">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 backdrop-blur-sm">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Upgrade Your Intelligence?</h2>
                        <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                            Transform your raw data into a strategic asset. Schedule a demo to see our dashboard in action.
                        </p>
                        <Link
                            href="/#contact"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#020617] font-bold rounded-full transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                        >
                            Schedule a Demo <TrendingUp className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
};

// --- Sub-components ---

const OnChainTracking = () => {
    const steps = [
        { status: "Order Created", hash: "0x7f...3a9", time: "09:30:05", icon: <ShoppingCart size={16} /> },
        { status: "Smart Contract Verified", hash: "0x8a...2b1", time: "09:30:12", icon: <ShieldCheck size={16} /> },
        { status: "Warehouse Picked", hash: "0x1c...9d4", time: "10:15:00", icon: <Package size={16} /> },
        { status: "In Transit", hash: "0x4e...5f2", time: "14:00:00", icon: <Truck size={16} /> },
        { status: "Delivered", hash: "Pending...", time: "--:--:--", icon: <CheckCircle2 size={16} /> }
    ];

    const [activeStep, setActiveStep] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative bg-slate-900/50 rounded-2xl border border-white/10 p-6 overflow-hidden">
            {/* Connecting Line */}
            <div className="absolute left-[2.25rem] top-8 bottom-8 w-0.5 bg-slate-800"></div>

            {/* Animated Progress Line */}
            <motion.div
                className="absolute left-[2.25rem] top-8 w-0.5 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
                animate={{ height: `${(activeStep / (steps.length - 1)) * 80}%` }}
                transition={{ duration: 0.5 }}
            />

            <div className="space-y-6 relative z-10">
                {steps.map((step, index) => {
                    const isActive = index <= activeStep;
                    const isCurrent = index === activeStep;

                    return (
                        <div key={index} className="flex items-center gap-4">
                            {/* Icon Circle */}
                            <motion.div
                                animate={{
                                    backgroundColor: isActive ? 'rgba(6, 182, 212, 0.2)' : 'rgba(30, 41, 59, 1)',
                                    borderColor: isActive ? 'rgba(6, 182, 212, 0.5)' : 'rgba(51, 65, 85, 1)',
                                    scale: isCurrent ? 1.1 : 1
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors duration-300 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}
                            >
                                {step.icon}
                            </motion.div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-500'}`}>{step.status}</h4>
                                    <span className="text-xs font-mono text-slate-500">{step.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-600 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-white/5">
                                        TX: {step.hash}
                                    </span>
                                    {isActive && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-[10px] text-green-500 flex items-center gap-1"
                                        >
                                            <CheckCircle2 size={10} /> Confirmed
                                        </motion.span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const StatCard = ({ label, value }: { label: string, value: string }) => (
    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
        <div className="text-slate-400 text-xs mb-1">{label}</div>
        <div className="text-xl font-bold text-white">{value}</div>
    </div>
);

const RegionBar = ({ region, target, actual }: { region: string, target: number, actual: number }) => (
    <div>
        <div className="flex justify-between text-sm mb-2">
            <span className="text-white font-medium">{region}</span>
            <span className="text-slate-400">{actual}% / {target}%</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden relative">
            {/* Target Marker (Ghost Bar) */}
            <div className="absolute top-0 bottom-0 bg-blue-500/30" style={{ width: `${target}%` }}></div>
            {/* Actual Bar */}
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${actual}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`h-full rounded-full ${actual >= target ? 'bg-cyan-400' : 'bg-yellow-500'}`}
            ></motion.div>
        </div>
    </div>
);

export default DataIntelligencePage;
