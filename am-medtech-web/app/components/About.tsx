'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Lightbulb, Users } from 'lucide-react';

const About = () => {
    return (
        <section id="about" className="py-24 bg-[#0A192F] relative">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-white mb-6"
                    >
                        We Bridge the Gap Between <br />
                        <span className="text-cyan-400">Pharma & Technology</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400"
                    >
                        At AM Medtech, we don't just build software; we engineer growth ecosystems specifically designed for the pharmaceutical industry's unique challenges.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <AboutCard
                        icon={<Target className="w-10 h-10 text-cyan-400" />}
                        title="Precision Focus"
                        desc="We specialize exclusively in the Pharma sector, understanding regulations, distribution channels, and market dynamics."
                    />
                    <AboutCard
                        icon={<Lightbulb className="w-10 h-10 text-blue-400" />}
                        title="Innovation First"
                        desc="Leveraging AI, Big Data, and Cloud Computing to keep your business ahead of the digital curve."
                    />
                    <AboutCard
                        icon={<Users className="w-10 h-10 text-purple-400" />}
                        title="Client Partnership"
                        desc="We act as your strategic technology partner, committed to your long-term success and scalability."
                    />
                </div>
            </div>
        </section>
    );
};

interface AboutCardProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
}

const AboutCard = ({ icon, title, desc }: AboutCardProps) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="p-10 rounded-3xl bg-[#112240] border border-white/5 hover:border-cyan-500/30 transition-all text-center group"
    >
        <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{desc}</p>
    </motion.div>
);

export default About;
