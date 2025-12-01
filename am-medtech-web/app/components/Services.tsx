'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, BarChart3, Globe, ShieldCheck, Zap, Users, ArrowRight } from 'lucide-react';

const Services = () => {
    return (
        <section id="services" className="py-16 md:py-24 bg-[#020617] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#00D4FF]/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">

                {/* Section Header */}
                <div className="text-center mb-12 md:mb-20 max-w-3xl mx-auto">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[#00D4FF] font-semibold tracking-wider text-sm uppercase mb-4 block"
                    >
                        Our Expertise
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
                    >
                        Comprehensive Digital <br /> Solutions for Pharma
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-base md:text-lg leading-relaxed"
                    >
                        We combine deep pharmaceutical industry knowledge with cutting-edge technology to drive growth, efficiency, and compliance.
                    </motion.p>
                </div>

                {/* Service Category 1: Strategic Consulting */}
                <div className="mb-16 md:mb-24">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-8 border-l-4 border-[#00D4FF] pl-4">Strategic Consulting</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ServiceCard
                            icon={<Globe />}
                            title="Route-to-Market Strategy"
                            desc="Optimize distribution channels and market entry strategies for maximum reach."
                            delay={0}
                        />
                        <ServiceCard
                            icon={<BarChart3 />}
                            title="Commercial Excellence"
                            desc="Enhance sales force effectiveness and commercial operations performance."
                            delay={0.1}
                        />
                        <ServiceCard
                            icon={<Users />}
                            title="Organizational Design"
                            desc="Structure your teams and processes for agility and digital readiness."
                            delay={0.2}
                        />
                        <ServiceCard
                            icon={<ShieldCheck />}
                            title="Regulatory Compliance"
                            desc="Navigate complex pharma regulations with digital compliance frameworks."
                            delay={0.3}
                        />
                    </div>
                </div>

                {/* Service Category 2: Digital Solutions */}
                <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-8 border-l-4 border-blue-600 pl-4">Digital Transformation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        <TechCard
                            title="Next-Gen Distribution Management System"
                            desc="Advanced Distribution Management System tailored for pharma workflows, ensuring data integrity and seamless collaboration."
                            features={['Automated Workflows', 'Version Control', 'Audit Trails', 'Secure Sharing']}
                            delay={0.2}
                        />
                        <TechCard
                            title="Data Intelligence Platform"
                            desc="Turn raw data into actionable insights with our AI-powered analytics platform designed for commercial decision-making."
                            features={['Predictive Analytics', 'Real-time Dashboards', 'Sales Forecasting', 'Market Trend Analysis']}
                            delay={0.3}
                            highlight
                        />
                        <TechCard
                            title="Omnichannel Ecosystem"
                            desc="Integrate offline and online channels to provide a unified experience for HCPs, pharmacies, and patients."
                            features={['E-commerce Integration', 'CRM Sync', 'Multi-channel Marketing', 'Customer 360 View']}
                            delay={0.4}
                        />
                    </div>
                </div>

            </div>
        </section>
    );
};

const ServiceCard = ({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className="bg-[#0B1221] p-6 rounded-xl border border-white/5 hover:border-[#00D4FF]/50 transition-all duration-300 group hover:-translate-y-1"
    >
        <div className="w-12 h-12 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] mb-4 group-hover:bg-[#00D4FF] group-hover:text-[#020617] transition-colors duration-300">
            {icon}
        </div>
        <h4 className="text-lg font-bold text-white mb-3">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
);

const TechCard = ({ title, desc, features, delay, highlight }: { title: string, desc: string, features: string[], delay: number, highlight?: boolean }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className={`relative p-6 md:p-8 rounded-2xl border ${highlight ? 'bg-gradient-to-b from-[#0B1221] to-[#00D4FF]/5 border-[#00D4FF]/30' : 'bg-[#0B1221] border-white/5'} hover:border-[#00D4FF]/50 transition-all duration-300 group`}
    >
        {highlight && (
            <div className="absolute top-0 right-0 bg-[#00D4FF] text-[#020617] text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
            </div>
        )}
        <div className="mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 mb-4">
                <Zap size={24} />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">{title}</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{desc}</p>
        </div>
        <ul className="space-y-3 mb-8">
            {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]"></div>
                    {feature}
                </li>
            ))}
        </ul>
        <button className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${highlight ? 'bg-[#00D4FF] text-[#020617] hover:bg-[#00D4FF]/90' : 'bg-white/5 text-white hover:bg-white/10'}`}>
            Learn More <ArrowRight size={16} />
        </button>
    </motion.div>
);

export default Services;
