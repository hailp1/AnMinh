'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Lightbulb, Users, Briefcase, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const AboutPage = () => {
    return (
        <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
            {/* Navbar */}
            <Navbar />

            {/* About Content */}
            <section className="pt-32 pb-24 bg-[#0A192F] relative overflow-hidden min-h-screen">
                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px]"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    {/* Intro Section */}
                    <div className="max-w-4xl mx-auto text-center mb-24">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-cyan-400 font-bold tracking-widest uppercase text-sm mb-4 block"
                        >
                            Who We Are
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight"
                        >
                            Pioneering Digital <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                Pharma Transformation
                            </span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-slate-400 leading-relaxed"
                        >
                            AM Medtech stands at the forefront of pharmaceutical innovation, bridging the gap between traditional healthcare operations and cutting-edge technology. We don't just provide software; we engineer comprehensive growth ecosystems that empower pharma businesses to scale, optimize, and lead in a digital-first world.
                        </motion.p>
                    </div>

                    {/* Core Values Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                        <AboutCard
                            icon={<Target className="w-8 h-8 text-cyan-400" />}
                            title="Precision Focus"
                            desc="Exclusively specialized in the Pharma sector, with deep expertise in GSP/GDP regulations, distribution channels, and market dynamics."
                            delay={0.1}
                        />
                        <AboutCard
                            icon={<Lightbulb className="w-8 h-8 text-blue-400" />}
                            title="Innovation First"
                            desc="Leveraging AI, Big Data, and Cloud Computing to deliver predictive insights and automate complex operational workflows."
                            delay={0.2}
                        />
                        <AboutCard
                            icon={<Users className="w-8 h-8 text-purple-400" />}
                            title="Strategic Partnership"
                            desc="We act as your long-term technology partner, committed to sustainable growth and continuous system optimization."
                            delay={0.3}
                        />
                    </div>

                    {/* Core Team Section */}
                    <div className="mb-16">
                        <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="text-3xl font-bold text-white mb-16 text-center border-b border-cyan-500/30 pb-4 inline-block mx-auto relative left-1/2 -translate-x-1/2"
                        >
                            Core Team
                        </motion.h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <TeamMember
                                image="/team/hai.png"
                                name="Lê Phúc Hải"
                                experience="Over 10 years of experience in business administration, distribution channel development, and commercial capability at Coca-Cola Vietnam, Mondelez Kinh Do Vietnam, and Japfa Comfeed Vietnam. Former National Capability Manager at Mega Lifesciences. Digital Transformation Advisor for Ladophar."
                                education="PhD Candidate in Economics."
                                delay={0.1}
                            />
                            <TeamMember
                                image="/team/hung.png"
                                name="Phạm Thái Hưng"
                                experience="Over 15 years of experience in strategic management at major pharmaceutical corporations in Vietnam. Chairman of An Minh Pharmacy & Clinic System."
                                education="Master of Economics, Pharmacist."
                                delay={0.2}
                            />
                            <TeamMember
                                image="/image/duc.png"
                                name="Đức Trần"
                                experience="Over 10 years of experience managing software development teams. Former Head of Mobile App Development at Pharmacity."
                                education="Certified Chief Information Officer (CIO)."
                                delay={0.3}
                            />
                            <TeamMember
                                image="/team/chau.jpg"
                                name="Châu Carmen"
                                experience="Over 10 years of experience in B2B management consulting and management psychology. Author of 10 scientific papers on management, human resources, and organizational culture."
                                education="PhD Candidate in Business Management."
                                delay={0.4}
                            />
                            <TeamMember
                                image="/team/tin.jpg"
                                name="Tín Nguyễn"
                                experience="Over 10 years of experience in training management, capability development, and distribution channels at Coca-Cola Vietnam and Mondelez Kinh Do Vietnam."
                                education="Master of Economics."
                                delay={0.5}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
};

interface AboutCardProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
    delay: number;
}

const AboutCard = ({ icon, title, desc, delay }: AboutCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -5 }}
        className="p-8 rounded-2xl bg-[#112240]/50 backdrop-blur-sm border border-white/5 hover:border-cyan-500/30 transition-all group"
    >
        <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
);

interface TeamMemberProps {
    image: string;
    name: string;
    experience: string;
    education: string;
    delay: number;
}

const TeamMember = ({ image, name, experience, education, delay }: TeamMemberProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="group flex flex-col items-center text-center h-full"
    >
        {/* Image Container */}
        <div className="relative w-48 h-48 mb-6 rounded-full overflow-hidden border-4 border-[#112240] shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-500">

            <img
                src={image}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
        </div>

        {/* Content */}
        <div className="bg-[#112240]/50 backdrop-blur-sm border border-white/5 p-6 rounded-2xl w-full hover:border-cyan-500/30 transition-all flex flex-col flex-grow">
            <h4 className="text-xl font-bold text-white mb-3">{name}</h4>
            <div className="h-0.5 w-12 bg-cyan-500 mx-auto mb-6 rounded-full"></div>

            <div className="space-y-4 text-left">
                {/* Experience Section */}
                <div className="flex gap-3">
                    <div className="mt-1 min-w-[20px]">
                        <Briefcase size={18} className="text-blue-400" />
                    </div>
                    <div>
                        <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Experience</h5>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {experience}
                        </p>
                    </div>
                </div>

                {/* Education Section */}
                <div className="flex gap-3 pt-4 border-t border-white/5">
                    <div className="mt-1 min-w-[20px]">
                        <GraduationCap size={18} className="text-cyan-400" />
                    </div>
                    <div>
                        <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Education</h5>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {education}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

export default AboutPage;
