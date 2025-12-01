'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, Database, PieChart, BarChart2 } from 'lucide-react';
import Link from 'next/link';

const DataGrowth = () => {
    return (
        <section id="growth" className="py-16 md:py-24 bg-[#0B1221] relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left Content */}
                    <div className="order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-6"
                        >
                            <Database className="w-3 h-3" /> DATA-DRIVEN GROWTH
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
                        >
                            Unlock Business Value with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                Intelligent Analytics
                            </span>
                        </motion.h2>

                        <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed">
                            Stop guessing. Start knowing. Our BI solutions transform raw data into actionable insights, helping you identify new revenue streams and optimize operational costs.
                        </p>

                        <div className="grid grid-cols-2 gap-4 md:gap-6 mb-10">
                            <StatItem value="35%" label="Revenue Increase" delay={0.1} />
                            <StatItem value="2.5x" label="Faster Decisions" delay={0.2} />
                            <StatItem value="40%" label="Cost Reduction" delay={0.3} />
                            <StatItem value="99%" label="Data Accuracy" delay={0.4} />
                        </div>

                        <Link href="/data-intelligence" className="w-full md:w-auto px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#020617] font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                            Explore Analytics <ArrowUpRight className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* Right Visuals (Charts) */}
                    <div className="relative order-1 lg:order-2">
                        {/* Abstract Background Glow */}
                        <div className="absolute inset-0 bg-cyan-500/10 blur-[80px] rounded-full"></div>

                        {/* Chart Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                                        <BarChart2 className="w-5 h-5 text-cyan-400" />
                                        Growth Trajectory
                                    </h4>
                                    <p className="text-slate-400 text-xs mt-1">Quarterly Performance Analysis</p>
                                </div>
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <PieChart className="w-5 h-5 text-cyan-400" />
                                </div>
                            </div>

                            {/* Simulated Bar Chart */}
                            <div className="flex items-end justify-between h-48 md:h-64 gap-3 md:gap-6 px-2 w-full">
                                {/* Y-Axis Lines (Background) */}
                                <div className="absolute inset-0 z-0 flex flex-col justify-between px-6 md:px-8 py-16 md:py-20 opacity-10 pointer-events-none">
                                    <div className="w-full h-px bg-white"></div>
                                    <div className="w-full h-px bg-white"></div>
                                    <div className="w-full h-px bg-white"></div>
                                    <div className="w-full h-px bg-white"></div>
                                </div>

                                <ChartBar height="40%" label="Q1" value="2.4M" delay={0.2} />
                                <ChartBar height="55%" label="Q2" value="3.8M" delay={0.3} />
                                <ChartBar height="45%" label="Q3" value="3.1M" delay={0.4} />
                                <ChartBar height="75%" label="Q4" value="5.2M" delay={0.5} />
                                <ChartBar height="90%" label="Q1 (Proj)" value="6.8M" active delay={0.6} />
                            </div>

                            {/* Floating Badge */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 z-20"
                            >
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold">Total Growth</p>
                                    <p className="text-slate-900 font-bold text-xl">+128%</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
};

const StatItem = ({ value, label, delay }: { value: string, label: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white/5 p-4 rounded-xl border border-white/5"
    >
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{value}</h3>
        <p className="text-slate-500 text-xs md:text-sm">{label}</p>
    </motion.div>
);

const ChartBar = ({ height, label, value, active, delay }: { height: string, label: string, value: string, active?: boolean, delay: number }) => (
    <div className="flex flex-col items-center justify-end gap-2 h-full flex-1 relative z-10 group">
        <motion.div
            initial={{ height: 0 }}
            whileInView={{ height }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay, type: "spring", stiffness: 50 }}
            className={`w-full max-w-[60px] rounded-t-lg relative flex justify-center ${active ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'bg-slate-700/80 hover:bg-slate-600'}`}
        >
            <span className="absolute -top-8 text-white text-[10px] md:text-xs font-bold bg-slate-800/90 px-2 py-1 rounded border border-white/10 opacity-100 transition-opacity whitespace-nowrap">
                {value}
            </span>
        </motion.div>
        <span className="text-slate-400 text-[10px] md:text-xs font-medium text-center h-4">{label}</span>
    </div>
);

export default DataGrowth;
