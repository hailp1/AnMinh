'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Smartphone, CreditCard, Box, Layout, RefreshCw, MessageCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';

const PharmaEcommercePage = () => {
    return (
        <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-[#0A192F] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-pink-900/20 rounded-full blur-[100px]"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
                        <span className="text-cyan-400 font-bold tracking-widest uppercase text-sm mb-4 block">Solutions</span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Pharma <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">E-Commerce</span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto mb-8">
                            Empower your B2B and B2C sales with our specialized e-commerce solutions. Seamless ordering, digital payments, and personalized experiences for pharmacies and patients.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/contact" className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                                Launch Your Store
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
                        <h2 className="text-3xl font-bold text-white mb-6">Digital Sales Transformation</h2>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            The future of pharma sales is digital. Pharmacies and hospitals expect the same convenience in B2B ordering as they do in their personal lives. Our E-Commerce platform bridges the gap between you and your customers, offering a 24/7 self-service portal that integrates seamlessly with your existing ERP and Distribution Management System.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
                        <div className="relative h-[500px] bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-2xl border border-white/10 p-8 flex items-center justify-center order-2 md:order-1">
                            <ShoppingCart className="w-40 h-40 text-pink-400 opacity-50" />
                        </div>
                        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} className="space-y-8 order-1 md:order-2">
                            <h2 className="text-3xl font-bold text-white">B2B Ordering Portal</h2>
                            <p className="text-slate-400 leading-relaxed">
                                Enable pharmacies to place orders anytime, anywhere. Reduce the dependency on sales rep visits for routine order taking.
                            </p>
                            <div className="space-y-6">
                                <FeatureItem
                                    icon={<Layout className="w-6 h-6 text-pink-400" />}
                                    title="Smart Catalog & Search"
                                    desc="Intelligent search with chemical names, brand names, and substitutes. Real-time stock visibility."
                                />
                                <FeatureItem
                                    icon={<RefreshCw className="w-6 h-6 text-purple-400" />}
                                    title="Quick Reorder"
                                    desc="One-click reordering based on purchase history. Predictive order suggestions."
                                />
                                <FeatureItem
                                    icon={<MessageCircle className="w-6 h-6 text-cyan-400" />}
                                    title="Digital Promotions"
                                    desc="Targeted schemes and offers displayed directly on the dashboard to drive upsell."
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Mobile & Integration */}
                    <div className="mb-24">
                        <h2 className="text-3xl font-bold text-white mb-12 text-center">Seamless Ecosystem</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<Smartphone className="w-8 h-8 text-cyan-400" />}
                                title="Mobile First Experience"
                                desc="Native mobile apps (iOS & Android) designed for pharmacists on the go. Scan barcodes to add to cart."
                            />
                            <FeatureCard
                                icon={<CreditCard className="w-8 h-8 text-blue-400" />}
                                title="Integrated Payments"
                                desc="Secure payment gateway integration supporting credit limits, bank transfers, and digital wallets."
                            />
                            <FeatureCard
                                icon={<Box className="w-8 h-8 text-purple-400" />}
                                title="Order Tracking"
                                desc="Live order status updates from processing to delivery. Integration with logistics partners."
                            />
                        </div>
                    </div>

                    {/* Security Badge */}
                    <div className="flex flex-col items-center text-center p-10 bg-[#112240]/30 rounded-2xl border border-white/5">
                        <Shield className="w-16 h-16 text-green-400 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-4">Secure & Compliant</h3>
                        <p className="text-slate-400 max-w-2xl">
                            Our platform ensures data privacy and security, complying with industry regulations for handling pharmaceutical transactions and patient data (for B2C modules).
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[#0A192F]">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Start Selling Digitally</h2>
                    <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                        Transform your sales channel with AM Medtech's E-Commerce solution.
                    </p>
                    <Link href="/contact" className="px-8 py-3 rounded-full bg-cyan-500 text-[#020617] font-bold hover:bg-cyan-400 transition-all">
                        Request a Demo
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
};

const FeatureItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="flex gap-4">
        <div className="mt-1 p-2 rounded-lg bg-white/5 h-fit">{icon}</div>
        <div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="p-8 rounded-2xl bg-[#112240]/50 border border-white/5 hover:border-cyan-500/30 transition-all">
        <div className="mb-6">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

export default PharmaEcommercePage;
