'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const CaseStudies = () => {
    return (
        <section id="case-studies" className="py-24 bg-[#0A192F] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/10 to-transparent pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                    <div>
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="text-cyan-400 font-semibold tracking-wider uppercase text-sm"
                        >
                            Success Stories
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold text-white mt-4"
                        >
                            Transforming <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                An Minh Group
                            </span>
                        </motion.h2>
                    </div>
                    <motion.button
                        whileHover={{ x: 5 }}
                        className="hidden md:flex items-center gap-2 text-slate-300 hover:text-white transition-colors mt-6 md:mt-0"
                    >
                        View all case studies <ArrowUpRight className="w-5 h-5" />
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Image/Visual Side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-900/20 group h-[500px]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-transparent to-transparent z-10" />

                        {/* Logo Background Area */}
                        <div className="absolute inset-0 bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                            <div className="relative w-64 h-64">
                                <Image
                                    src="/anminh-logo.webp"
                                    alt="An Minh Group Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>

                        <div className="absolute bottom-8 left-8 z-20">
                            <div className="flex gap-4 mb-4">
                                <Badge text="DMS" />
                                <Badge text="Real-time Tracking" />
                                <Badge text="+45% Efficiency" />
                            </div>
                            <h3 className="text-3xl font-bold text-[#0A192F] drop-shadow-md">An Minh Pharma</h3>
                            <p className="text-slate-600 font-medium">Comprehensive DMS Implementation</p>
                        </div>
                    </motion.div>

                    {/* Content Side */}
                    <div className="space-y-8">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-lg text-slate-400 leading-relaxed"
                        >
                            An Minh Group faced challenges in managing their field force and inventory across multiple provinces.
                            AM Medtech implemented a bespoke <strong>Distribution Management System (DMS)</strong> integrated with real-time GPS tracking and
                            smart route optimization.
                        </motion.p>

                        <div className="space-y-4">
                            <ResultItem text="Real-time visibility of 100+ Sales Reps" />
                            <ResultItem text="Automated order processing reducing errors by 90%" />
                            <ResultItem text="Smart inventory forecasting preventing stockouts" />
                            <ResultItem text="Seamless mobile app experience for field teams" />
                        </div>

                        <Link href="/case-studies/famfa">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white text-[#0A192F] font-bold rounded-full hover:bg-cyan-50 transition-colors"
                            >
                                Read Full Case Study
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Badge = ({ text }: { text: string }) => (
    <span className="px-3 py-1 bg-[#0A192F]/80 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium text-white shadow-sm">
        {text}
    </span>
);

const ResultItem = ({ text }: { text: string }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        className="flex items-start gap-4"
    >
        <div className="mt-1 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
        </div>
        <span className="text-slate-300">{text}</span>
    </motion.div>
);

export default CaseStudies;
