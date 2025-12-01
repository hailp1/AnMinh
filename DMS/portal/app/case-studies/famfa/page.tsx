'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Settings, Users, Smartphone, BookOpen, BarChart3, ShoppingCart,
    Stethoscope, CheckCircle2, MapPin, ArrowRight, Activity,
    TrendingUp, ShieldCheck, Truck, Network, Package
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';

const FamfaPage = () => {
    return (
        <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="container mx-auto relative z-10">
                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-widest">
                                    CASE STUDY
                                </span>
                                <span className="h-px w-12 bg-slate-700"></span>
                                <span className="text-slate-400 font-semibold tracking-wide">FAMFA</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                                Total Digital <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                                    Transformation
                                </span>
                            </h1>
                            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                                How we helped FAMFA restructure operations, optimize distribution, and connect the healthcare ecosystem through advanced technology.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 1. Operational Excellence (OE) */}
            <section className="py-20 border-t border-white/5">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400">
                                <Settings size={24} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Operational Excellence <span className="text-slate-500">(OE)</span></h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                We implemented a complete restructuring of the pharmaceutical operations, standardizing logistics and warehousing processes to meet GSP/GDP standards. This foundation ensures efficiency and compliance at scale.
                            </p>
                            <ul className="space-y-4">
                                <ListItem text="Warehouse Layout Optimization" />
                                <ListItem text="Standard Operating Procedures (SOPs)" />
                                <ListItem text="Inventory Flow Management" />
                            </ul>
                        </div>
                        <div className="order-1 lg:order-2 relative h-[400px] bg-[#0B1221] rounded-3xl border border-white/10 overflow-hidden p-8 flex items-center justify-center perspective-1000">
                            {/* Isometric Warehouse Grid */}
                            <div className="relative w-full h-full flex items-center justify-center">
                                <div className="relative w-64 h-64 transform rotate-x-60 rotate-z-45">
                                    {/* Grid Floor */}
                                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-2">
                                        {Array.from({ length: 16 }).map((_, i) => (
                                            <div key={i} className="bg-slate-800/50 border border-white/5 rounded-sm"></div>
                                        ))}
                                    </div>
                                    {/* Moving Packages */}
                                    {[1, 2, 3].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-12 h-12 bg-blue-600/80 border border-blue-400 shadow-lg backdrop-blur-sm flex items-center justify-center z-10"
                                            animate={{
                                                x: [0, 100, 100, 0, 0],
                                                y: [0, 0, 100, 100, 0],
                                                z: [0, 20, 0, 20, 0]
                                            }}
                                            transition={{
                                                duration: 8,
                                                delay: i * 2,
                                                repeat: Infinity,
                                                ease: "linear"
                                            }}
                                        >
                                            <Package size={20} className="text-white" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. RTM & SFE */}
            <section className="py-20 bg-slate-900/20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative h-[400px] bg-slate-900/50 rounded-3xl border border-white/10 overflow-hidden p-8 flex flex-col justify-center">
                            {/* Market Coverage Map Background */}
                            <div className="absolute inset-0 opacity-30">
                                <div className="absolute inset-0 bg-[url('/map-pattern.svg')] bg-cover opacity-50"></div>
                                {/* Expanding Coverage Animation */}
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1.5, opacity: 1 }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
                                ></motion.div>
                            </div>

                            {/* Metrics Dashboard */}
                            <div className="relative z-10 grid grid-cols-2 gap-4">
                                <MetricBox label="ASO" value="98%" trend="+12%" color="text-green-400" delay={0} />
                                <MetricBox label="PC" value="85%" trend="+8%" color="text-blue-400" delay={0.2} />
                                <MetricBox label="LPPC" value="4.2" trend="+0.5" color="text-purple-400" delay={0.4} />
                                <MetricBox label="Focus SKU" value="12" trend="+3" color="text-orange-400" delay={0.6} />
                            </div>
                        </div>
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 text-cyan-400">
                                <Users size={24} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">RTM & SFE <span className="text-slate-500">Strategy</span></h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                Redefining Route-to-Market (RTM) and Sales Force Effectiveness (SFE).
                                Our strategy empowers the sales force to enhance their capabilities, significantly improving customer care efficiency and driving key performance metrics.
                            </p>
                            <ul className="space-y-4">
                                <ListItem text="Market Coverage Expansion" />
                                <ListItem text="Boosted ASO, PC, LPPC & Focus SKU" />
                                <ListItem text="Enhanced Sales Force Capability" />
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. DMS - Distribution Management System */}
            <section className="py-24 bg-[#0B1221] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-6 shadow-lg shadow-cyan-500/20">
                            <Smartphone className="text-white w-8 h-8" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Smart Distribution Management System <span className="text-cyan-400">Ecosystem</span></h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            Complete control over the distribution channel. Real-time tracking of sales activities, route compliance, and market coverage.
                        </p>
                    </div>

                    {/* Animated Map Visualization */}
                    <div className="relative max-w-5xl mx-auto h-[500px] bg-[#020617] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                        {/* Map Background Inside Container */}
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="/dms_map_bg.png"
                                alt="Map Background"
                                fill
                                className="object-cover opacity-30"
                            />
                            <div className="absolute inset-0 bg-[#020617]/60"></div>
                        </div>

                        {/* Map Points & Check-ins */}
                        <div className="absolute inset-0">
                            <MapPoint x="20%" y="30%" delay={0} label="Pharmacy A" />
                            <MapPoint x="50%" y="40%" delay={1.5} label="Clinic B" />
                            <MapPoint x="70%" y="20%" delay={3} label="Hospital C" />
                            <MapPoint x="30%" y="70%" delay={4.5} label="Pharmacy D" />
                            <MapPoint x="80%" y="60%" delay={6} label="Drugstore E" />

                            {/* Moving Agent */}
                            <motion.div
                                animate={{
                                    left: ["20%", "50%", "70%", "80%", "30%"],
                                    top: ["30%", "40%", "20%", "60%", "70%"]
                                }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute w-8 h-8 -ml-4 -mt-4 z-20"
                            >
                                <div className="w-full h-full bg-cyan-500 rounded-full border-2 border-white shadow-[0_0_20px_#06b6d4] flex items-center justify-center">
                                    <Smartphone size={14} className="text-white" />
                                </div>
                            </motion.div>
                        </div>

                        {/* UI Overlay */}
                        <div className="absolute top-6 left-6 bg-slate-800/90 backdrop-blur p-4 rounded-xl border border-white/10 shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm font-bold text-white">Live Field Activity</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs gap-8">
                                    <span className="text-slate-400">Active Agents</span>
                                    <span className="text-cyan-400 font-mono">142</span>
                                </div>
                                <div className="flex items-center justify-between text-xs gap-8">
                                    <span className="text-slate-400">Check-ins Today</span>
                                    <span className="text-cyan-400 font-mono">1,893</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Training & Development */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400">
                                <BookOpen size={24} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Competency <span className="text-purple-400">Development</span></h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                Empowering the workforce with specialized training programs. We developed a comprehensive competency framework covering product knowledge, pharmacy care processes, and soft skills.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <TrainingCard title="Product Mastery" desc="Deep dive into pharmacological properties" />
                                <TrainingCard title="Service Excellence" desc="Standardized care for pharmacies" />
                                <TrainingCard title="Sales Skills" desc="Consultative selling techniques" />
                                <TrainingCard title="Leadership" desc="Management training for supervisors" />
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 relative h-[400px] bg-[#0B1221]/50 rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center p-6">
                            {/* Animated Growth Chart */}
                            <div className="relative w-full h-full flex flex-col justify-end pb-8 pl-8 pr-4">
                                {/* Chart Grid & Axes */}
                                <div className="absolute inset-0 left-12 bottom-12 top-8 right-4 border-l border-b border-white/20">
                                    {/* Horizontal Grid Lines */}
                                    {[0.25, 0.5, 0.75].map((y) => (
                                        <div key={y} className="absolute w-full h-px bg-white/5" style={{ bottom: `${y * 100}%` }}></div>
                                    ))}
                                </div>

                                {/* Y-Axis Labels (Competency Factors) */}
                                <div className="absolute left-0 top-8 bottom-12 w-10 flex flex-col justify-between text-[10px] text-slate-400 font-medium py-2 text-right pr-2">
                                    <span className="text-purple-400">Mgmt</span>
                                    <span className="text-blue-400">Skills</span>
                                    <span className="text-cyan-400">Know-ledge</span>
                                </div>

                                {/* X-Axis Labels (Job Levels) */}
                                <div className="absolute left-12 right-4 bottom-2 flex justify-between text-xs text-slate-300 font-bold px-2">
                                    <span>MR</span>
                                    <span>SS</span>
                                    <span>ASM</span>
                                    <span>RSM</span>
                                    <span>NSM</span>
                                </div>

                                {/* SVG Curves */}
                                <svg className="absolute inset-0 left-12 bottom-12 top-8 right-4 w-[calc(100%-4rem)] h-[calc(100%-5rem)] overflow-visible">
                                    <defs>
                                        <linearGradient id="gradCompetency" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#22d3ee" />   {/* Cyan - Knowledge */}
                                            <stop offset="50%" stopColor="#3b82f6" />   {/* Blue - Skills */}
                                            <stop offset="100%" stopColor="#a855f7" />  {/* Purple - Management */}
                                        </linearGradient>
                                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    {/* Curve Path: Fluctuating Growth */}
                                    {/* MR(Start) -> SS(Up) -> ASM(Dip/Plateau) -> RSM(Up) -> NSM(Peak) */}
                                    <motion.path
                                        d="M0,280 C40,260 60,200 100,180 C140,160 180,200 220,150 C260,100 300,120 350,50 C380,10 420,0 450,0"
                                        fill="none"
                                        stroke="url(#gradCompetency)"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        filter="url(#glow)"
                                        initial={{ pathLength: 0 }}
                                        whileInView={{ pathLength: 1 }}
                                        transition={{ duration: 3, ease: "easeInOut" }}
                                    />

                                    {/* Points on Curve */}
                                    {[
                                        { cx: "0%", cy: "88%", label: "Basic" },
                                        { cx: "25%", cy: "56%", label: "Advanced" },
                                        { cx: "50%", cy: "47%", label: "Expert" },
                                        { cx: "75%", cy: "15%", label: "Strategic" },
                                        { cx: "100%", cy: "0%", label: "Visionary" }
                                    ].map((point, i) => (
                                        <motion.g key={i} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 1 + i * 0.5 }}>
                                            <circle cx={point.cx} cy={point.cy} r="6" fill="#020617" stroke="white" strokeWidth="2" />
                                        </motion.g>
                                    ))}
                                </svg>

                                {/* Floating Competency Tags */}
                                <div className="absolute inset-0 left-12 bottom-12 top-8 right-4 pointer-events-none">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}
                                        className="absolute left-[10%] bottom-[20%] bg-cyan-500/20 text-cyan-300 text-[10px] px-2 py-1 rounded border border-cyan-500/30"
                                    >
                                        Product Knowledge
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }}
                                        className="absolute left-[45%] bottom-[55%] bg-blue-500/20 text-blue-300 text-[10px] px-2 py-1 rounded border border-blue-500/30"
                                    >
                                        Sales Skills
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 3.5 }}
                                        className="absolute right-[5%] top-[10%] bg-purple-500/20 text-purple-300 text-[10px] px-2 py-1 rounded border border-purple-500/30"
                                    >
                                        Leadership
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Business Intelligence (BI) */}
            <section className="py-24 bg-slate-900/30">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg shadow-indigo-500/20">
                            <BarChart3 className="text-white w-8 h-8" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Strategic <span className="text-indigo-400">Intelligence</span></h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            Turning data into decisions. Our BI system monitors strategic indicators to drive business growth.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <ChartCard title="Revenue Growth" value="+145%" color="text-green-400">
                            <div className="h-32 flex items-end gap-2 mt-4">
                                {[30, 45, 35, 60, 55, 80, 75, 100].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        whileInView={{ height: `${h}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="flex-1 bg-green-500/20 rounded-t-sm border-t border-green-500/50"
                                    ></motion.div>
                                ))}
                            </div>
                        </ChartCard>
                        <ChartCard title="Market Penetration" value="85%" color="text-blue-400">
                            <div className="h-32 flex items-center justify-center mt-4 relative">
                                <svg className="w-28 h-28 transform -rotate-90">
                                    <circle cx="56" cy="56" r="50" stroke="#1e293b" strokeWidth="8" fill="none" />
                                    <motion.circle
                                        cx="56" cy="56" r="50"
                                        stroke="#3b82f6" strokeWidth="8" fill="none"
                                        strokeDasharray="314"
                                        initial={{ strokeDashoffset: 314 }}
                                        whileInView={{ strokeDashoffset: 314 * 0.15 }} // 85%
                                        transition={{ duration: 1.5 }}
                                    />
                                </svg>
                                <span className="absolute text-xl font-bold">85%</span>
                            </div>
                        </ChartCard>
                        <ChartCard title="Customer Retention" value="92%" color="text-purple-400">
                            <div className="h-32 mt-4 relative overflow-hidden">
                                <svg className="w-full h-full" preserveAspectRatio="none">
                                    <motion.path
                                        d="M0,100 C50,80 100,90 150,60 C200,30 250,40 300,10"
                                        fill="none"
                                        stroke="#a855f7"
                                        strokeWidth="3"
                                        initial={{ pathLength: 0 }}
                                        whileInView={{ pathLength: 1 }}
                                        transition={{ duration: 2 }}
                                    />
                                    <motion.path
                                        d="M0,100 C50,80 100,90 150,60 C200,30 250,40 300,10 L300,128 L0,128 Z"
                                        fill="url(#purpleGradient)"
                                        fillOpacity="0.2"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ duration: 2 }}
                                    />
                                    <defs>
                                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#a855f7" />
                                            <stop offset="100%" stopColor="transparent" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </ChartCard>
                    </div>
                </div>
            </section>

            {/* 6. B2B Portal */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative h-[400px] bg-slate-900/50 rounded-3xl border border-white/10 overflow-hidden p-8 flex items-center justify-center group">
                            {/* Dynamic Portal Interface */}
                            <div className="w-72 bg-[#0F172A] rounded-xl border border-slate-700 shadow-2xl overflow-hidden relative">
                                {/* Header */}
                                <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center px-4 justify-between">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">portal.ammedtech.com</div>
                                </div>
                                {/* Body */}
                                <div className="p-4 space-y-3">
                                    {/* Live Ticker */}
                                    <div className="flex overflow-hidden bg-slate-900/50 p-1 rounded border border-slate-700/50">
                                        <motion.div
                                            animate={{ x: "-50%" }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            className="flex gap-4 whitespace-nowrap text-[10px] text-green-400 font-mono min-w-max"
                                        >
                                            {/* Content duplicated for seamless loop */}
                                            <span>▲ PANADOL +2%</span>
                                            <span>▼ ASPIRIN -1%</span>
                                            <span>▲ VITAMIN C +5%</span>
                                            <span>▲ AUGMENTIN +1.5%</span>
                                            <span>▼ BERBERIN -0.5%</span>

                                            <span>▲ PANADOL +2%</span>
                                            <span>▼ ASPIRIN -1%</span>
                                            <span>▲ VITAMIN C +5%</span>
                                            <span>▲ AUGMENTIN +1.5%</span>
                                            <span>▼ BERBERIN -0.5%</span>
                                        </motion.div>
                                    </div>
                                    {/* Chart Area */}
                                    <div className="h-24 bg-slate-800/50 rounded-lg border border-slate-700/50 p-2 flex items-end gap-1">
                                        {[40, 70, 50, 90, 60, 80].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                whileInView={{ height: `${h}%` }}
                                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                                className="flex-1 bg-cyan-500/20 border-t border-cyan-500 rounded-t-sm"
                                            ></motion.div>
                                        ))}
                                    </div>
                                    {/* Order List */}
                                    <div className="space-y-1.5">
                                        {[1, 2, 3].map((i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + i * 0.2 }}
                                                className="h-8 bg-slate-800 rounded flex items-center px-2 justify-between"
                                            >
                                                <div className="w-16 h-2 bg-slate-600 rounded"></div>
                                                <div className="w-8 h-2 bg-green-500/20 rounded"></div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                                {/* Floating Notification */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 2, type: "spring" }}
                                    className="absolute bottom-4 right-4 left-4 bg-cyan-500 text-[#020617] p-3 rounded-lg shadow-lg flex items-center gap-3"
                                >
                                    <CheckCircle2 size={16} />
                                    <div>
                                        <div className="text-xs font-bold">Order #8821 Confirmed</div>
                                        <div className="text-[10px] opacity-80">Estimated Delivery: 2h</div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 text-orange-400">
                                <ShoppingCart size={24} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">B2B Trading <span className="text-orange-400">Portal</span></h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                A dedicated exchange platform for distribution partners. Pharmacies can proactively track delivery routes, check real-time pricing, and manage orders seamlessly.
                            </p>
                            <ul className="space-y-4">
                                <ListItem text="Real-time Price Updates" />
                                <ListItem text="Live Delivery Tracking" />
                                <ListItem text="Automated Ordering System" />
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Halo Doctor System */}
            <section className="py-24 bg-gradient-to-b from-[#020617] to-cyan-950/20 relative overflow-hidden">
                {/* ECG Background Effect */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <svg className="w-full h-full" preserveAspectRatio="none">
                        <motion.path
                            d="M0,500 L200,500 L220,450 L240,550 L260,500 L400,500 L420,400 L440,600 L460,500 L800,500 L820,450 L840,550 L860,500 L1200,500"
                            fill="none"
                            stroke="#22d3ee"
                            strokeWidth="2"
                            initial={{ x: -1000 }}
                            animate={{ x: 0 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-6 backdrop-blur-sm border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                            <Activity className="text-cyan-400 w-8 h-8" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Halo Doctor <span className="text-cyan-400">Network</span></h2>
                        <p className="text-slate-400 max-w-3xl mx-auto text-lg leading-relaxed">
                            A revolutionary platform maximizing healthcare potential.
                            <br className="hidden md:block" />
                            <span className="text-white font-medium">Doctors</span> can utilize their spare time to provide care for nearby patients.
                            <br className="hidden md:block" />
                            <span className="text-white font-medium">Patients</span> can easily find professional medical services and standardized medication consultation in their vicinity.
                        </p>
                    </div>

                    {/* Geo-Connection Visualization */}
                    <div className="relative max-w-5xl mx-auto h-[500px] bg-[#0B1221] rounded-3xl border border-cyan-500/20 overflow-hidden shadow-2xl shadow-cyan-900/10">
                        {/* Map Background */}
                        <div className="absolute inset-0 opacity-30 bg-[url('/map-pattern.svg')] bg-cover mix-blend-screen"></div>

                        {/* Radar Scan Effect */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[600px] h-[600px] border border-cyan-500/10 rounded-full animate-[spin_10s_linear_infinite] opacity-30 border-t-cyan-500/50"></div>
                            <div className="w-[400px] h-[400px] border border-cyan-500/20 rounded-full animate-ping opacity-20 animation-delay-500"></div>
                        </div>

                        {/* Nodes */}
                        <div className="absolute inset-0">
                            {/* Doctor Nodes */}
                            <DoctorNode x="20%" y="30%" name="Dr. Minh" status="Available" delay={0} />
                            <DoctorNode x="70%" y="60%" name="Dr. Lan" status="Available" delay={1} />
                            <DoctorNode x="40%" y="80%" name="Dr. Hung" status="Busy" delay={2} />

                            {/* Patient Nodes */}
                            <PatientNode x="25%" y="35%" name="Patient A" delay={3} />
                            <PatientNode x="65%" y="55%" name="Patient B" delay={4} />

                            {/* Connection Lines */}
                            <ConnectionLine x1="20%" y1="30%" x2="25%" y2="35%" delay={3.5} />
                            <ConnectionLine x1="70%" y1="60%" x2="65%" y2="55%" delay={4.5} />
                        </div>

                        {/* Match Notification */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 4.5 }}
                            className="absolute top-[10%] right-[5%] bg-slate-900/90 backdrop-blur border border-cyan-500/50 p-4 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-start gap-3 max-w-xs z-30"
                        >
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 animate-pulse">
                                <Activity size={16} className="text-cyan-400" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white mb-1">Medical Match Found</div>
                                <div className="text-xs text-slate-400">Dr. Lan is 0.5km away and available for immediate consultation.</div>
                                <div className="mt-2 flex gap-2">
                                    <button className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded transition-colors">Connect</button>
                                    <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded transition-colors">Dismiss</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
};

// --- Sub-components ---

const ListItem = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 size={14} className="text-cyan-400" />
        </div>
        <span className="text-slate-300">{text}</span>
    </div>
);

const MapPoint = ({ x, y, delay, label }: { x: string, y: string, delay: number, label: string }) => (
    <div className="absolute" style={{ left: x, top: y }}>
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay }}
            className="relative"
        >
            <div className="w-4 h-4 bg-cyan-500 rounded-full border-2 border-white shadow-lg relative z-10"></div>
            <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-75"></div>

            {/* Tooltip */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: -10 }}
                transition={{ delay: delay + 0.5 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded whitespace-nowrap border border-white/10"
            >
                {label}
                <div className="text-green-400 text-[8px]">Checked-in</div>
            </motion.div>
        </motion.div>
    </div>
);

const TrainingCard = ({ title, desc }: { title: string, desc: string }) => (
    <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
        <h4 className="font-bold text-white mb-1">{title}</h4>
        <p className="text-xs text-slate-400">{desc}</p>
    </div>
);

const SkillBar = ({ label, percent, color }: { label: string, percent: number, color: string }) => (
    <div>
        <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300">{label}</span>
            <span className="text-white font-bold">{percent}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${percent}%` }}
                transition={{ duration: 1.5 }}
                className={`h-full rounded-full ${color}`}
            ></motion.div>
        </div>
    </div>
);

const ChartCard = ({ title, value, color, children }: { title: string, value: string, color: string, children: React.ReactNode }) => (
    <div className="p-6 bg-slate-800/50 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
        <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        {children}
    </div>
);

export default FamfaPage;

const MetricBox = ({ label, value, trend, color, delay }: { label: string, value: string, trend: string, color: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-slate-800/80 backdrop-blur border border-white/10 p-4 rounded-xl flex flex-col items-center justify-center hover:border-white/20 transition-colors"
    >
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</div>
        <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
            <TrendingUp size={10} className="text-green-500" />
            <span className="text-green-500">{trend}</span> vs last month
        </div>
    </motion.div>
);

const DoctorNode = ({ x, y, name, status, delay }: { x: string, y: string, name: string, status: string, delay: number }) => (
    <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ delay }}
        className="absolute flex flex-col items-center z-20"
        style={{ left: x, top: y }}
    >
        <div className="relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${status === 'Available' ? 'bg-cyan-600 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-slate-700 border-slate-500'}`}>
                <Stethoscope size={20} className="text-white" />
            </div>
            {status === 'Available' && (
                <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-50"></div>
            )}
        </div>
        <div className="mt-2 bg-slate-900/90 px-3 py-1.5 rounded-lg text-[10px] border border-cyan-500/30 whitespace-nowrap backdrop-blur-sm shadow-lg">
            <div className="font-bold text-white text-xs">{name}</div>
            <div className={status === 'Available' ? 'text-cyan-400 font-medium' : 'text-slate-400'}>● {status}</div>
        </div>
    </motion.div>
);

const PatientNode = ({ x, y, name, delay }: { x: string, y: string, name: string, delay: number }) => (
    <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ delay }}
        className="absolute flex flex-col items-center z-20"
        style={{ left: x, top: y }}
    >
        <div className="relative">
            <div className="w-10 h-10 rounded-full bg-red-500 border-2 border-red-300 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                <Users size={16} className="text-white" />
            </div>
            <div className="absolute inset-0 rounded-full border border-red-400 animate-ping opacity-50"></div>
        </div>
        <div className="mt-2 bg-slate-900/90 px-3 py-1.5 rounded-lg text-[10px] border border-red-500/30 whitespace-nowrap backdrop-blur-sm shadow-lg">
            <div className="font-bold text-white text-xs">{name}</div>
            <div className="text-red-400 font-medium flex items-center gap-1">
                <Activity size={8} /> Needs Care
            </div>
        </div>
    </motion.div>
);

const ConnectionLine = ({ x1, y1, x2, y2, delay }: { x1: string, y1: string, x2: string, y2: string, delay: number }) => (
    <>
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <motion.line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 4"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                transition={{ delay, duration: 1.5, ease: "easeInOut" }}
            />
            <motion.circle
                cx={x2} cy={y2} r="4" fill="#22d3ee"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 1.5 }}
            />
        </svg>
        <motion.div
            className="absolute w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.6)] z-30 border-2 border-white"
            style={{
                left: `calc((${x1} + ${x2}) / 2)`,
                top: `calc((${y1} + ${y2}) / 2)`,
                transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.8, type: "spring", stiffness: 200, damping: 10 }}
        >
            <Network size={12} className="text-white" />
        </motion.div>
    </>
);
