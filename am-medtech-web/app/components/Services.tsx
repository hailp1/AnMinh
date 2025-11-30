'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    TrendingUp,
    Target,
    BookOpen,
    Database,
    Smartphone,
    BarChart3,
    ShoppingCart,
    Layers,
    CheckCircle2
} from 'lucide-react';

const Services = () => {
    return (
        <section id="services" className="py-24 bg-[#020617] relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">

                {/* Section Header */}
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-cyan-400 font-semibold tracking-wider uppercase text-sm"
                    >
                        Our Expertise
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6"
                    >
                        Comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Pharma Solutions</span>
                    </motion.h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        From strategic consulting to cutting-edge digital tools, we provide the complete ecosystem for pharmaceutical growth.
                    </p>
                </div>

                {/* 1. Strategic Consulting Services */}
                <div className="mb-24">
                    <h3 className="text-2xl font-bold text-white mb-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Target className="w-6 h-6 text-blue-400" />
                        </div>
                        Strategic Consulting
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ServiceCard
                            icon={<Layers />}
                            title="Business Restructuring"
                            desc="Redesigning organizational structure and workflows for maximum agility and efficiency in the pharma sector."
                        />
                        <ServiceCard
                            icon={<Users />}
                            title="Competency Framework"
                            desc="Building detailed competency maps and KPIs to standardize and elevate your sales force performance."
                        />
                        <ServiceCard
                            icon={<TrendingUp />}
                            title="Channel Development"
                            desc="Strategic planning for distribution expansion, territory mapping, and partner relationship management."
                        />
                        <ServiceCard
                            icon={<BookOpen />}
                            title="Training & Development"
                            desc="Customized training programs to upskill your team in modern sales techniques and product knowledge."
                        />
                    </div>
                </div>

                {/* 2. Digital Transformation Solutions */}
                <div>
                    <h3 className="text-2xl font-bold text-white mb-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <Database className="w-6 h-6 text-cyan-400" />
                        </div>
                        Digital Transformation Solutions
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Tech Card 1: DMS & CRM */}
                        <TechCard
                            title="DMS & CRM Ecosystem"
                            features={[
                                "Real-time Inventory Tracking",
                                "GPS-based Sales Route Optimization",
                                "Automated Order Processing",
                                "360° Customer Relationship View"
                            ]}
                            icon={<Smartphone className="w-8 h-8 text-cyan-400" />}
                        />

                        {/* Tech Card 2: Business Intelligence */}
                        <TechCard
                            title="Business Intelligence (BI)"
                            features={[
                                "Predictive Sales Analytics",
                                "Market Trend Forecasting",
                                "Performance Dashboards",
                                "AI-Driven Decision Support"
                            ]}
                            icon={<BarChart3 className="w-8 h-8 text-purple-400" />}
                        />

                        {/* Tech Card 3: E-Commerce */}
                        <TechCard
                            title="Omnichannel E-Commerce"
                            features={[
                                "B2B Portal for Pharmacies/Hospitals",
                                "B2B2C & D2C Integration",
                                "Loyalty & Rewards Programs",
                                "Seamless ERP Integration"
                            ]}
                            icon={<ShoppingCart className="w-8 h-8 text-pink-400" />}
                        />
                    </div>
                </div>

            </div>
        </section>
    );
};

const ServiceCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300"
    >
        <div className="mb-4 text-cyan-400">
            {React.cloneElement(icon as any, { className: "w-8 h-8" })}
        </div>
        <h4 className="text-lg font-bold text-white mb-3">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
);

const TechCard = ({ title, features, icon }: { title: string, features: string[], icon: React.ReactNode }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden group"
    >
        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
            {icon}
        </div>
        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            {icon}
            {title}
        </h4>
        <ul className="space-y-4">
            {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0" />
                    {feature}
                </li>
            ))}
        </ul>
        <button className="mt-8 w-full py-3 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-cyan-400 font-semibold text-sm transition-colors border border-white/5 hover:border-cyan-500/50">
            Learn More
        </button>
    </motion.div>
);

export default Services;
