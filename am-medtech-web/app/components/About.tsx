'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Lightbulb, Users, Award, Briefcase, GraduationCap } from 'lucide-react';

const About = () => {
    return (
        <section id="about" className="py-24 bg-[#0A192F] relative overflow-hidden">
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

                {/* Team Section */}
                <div className="mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TeamMember
                            image="/image/hai.png"
                            name="Lê Phúc Hải"
                            desc="Over 10 years of experience in business administration, distribution channel development, and commercial capability at Coca-Cola Vietnam, Mondelez Kinh Do Vietnam, and Japfa Comfeed Vietnam. Former National Capability Manager at Mega Lifesciences. Digital Transformation Advisor for Ladophar. PhD Candidate in Economics."
                            delay={0.1}
                        />
                        <TeamMember
                            image="/image/hai.png"
                            name="Phạm Thái Hưng"
                            desc="Over 15 years of experience in strategic management at major pharmaceutical corporations in Vietnam. Chairman of An Minh Pharmacy & Clinic System. Master's degree in Pharmacy."
                            delay={0.2}
                        />
                        <TeamMember
                            image="/image/duc.png"
                            name="Đức Trần"
                            desc="Over 10 years of experience managing software development teams. Former Head of Mobile App Development at Pharmacity. Certified Chief Information Officer (CIO)."
                            delay={0.3}
                        />
                        <TeamMember
                            image="/image/chau.jpg"
                            name="Châu Carmen"
                            desc="Over 10 years of experience in B2B management consulting and management psychology. Author of 10 scientific papers on management, human resources, and organizational culture. PhD Candidate in Business Management."
                            delay={0.4}
                        />
                        <TeamMember
                            image="/image/tin.jpg"
                            name="Tín Nguyễn"
                            desc="Over 10 years of experience in training management, capability development, and distribution channels at Coca-Cola Vietnam and Mondelez Kinh Do Vietnam. Master of Economics."
                            delay={0.5}
                        />
                    </div>
                </div>
            </div>
        </section>
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
    desc: string;
    delay: number;
}

const TeamMember = ({ image, name, desc, delay }: TeamMemberProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className="group relative bg-[#112240] rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col"
    >
        {/* Image Area */}
        <div className="relative h-72 w-full overflow-hidden bg-slate-800">
            <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                <Users size={48} />
            </div>
            <img
                src={image}
                alt={name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-transparent to-transparent opacity-90"></div>

            {/* Name Overlay */}
            <div className="absolute bottom-0 left-0 w-full p-6">
                <h4 className="text-2xl font-bold text-white mb-1">{name}</h4>
                <div className="h-1 w-12 bg-cyan-500 rounded-full"></div>
            </div>
        </div>

        {/* Content Area */}
        <div className="p-6 pt-2 flex-grow flex flex-col">
            <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
                {desc}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-auto">
                {desc.includes("PhD") || desc.includes("Master") || desc.includes("Degree") ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-cyan-300 bg-cyan-900/20 border border-cyan-500/20 px-2.5 py-1 rounded-full">
                        <GraduationCap size={12} /> Education
                    </div>
                ) : null}
                {desc.includes("years") ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-blue-300 bg-blue-900/20 border border-blue-500/20 px-2.5 py-1 rounded-full">
                        <Briefcase size={12} /> Experience
                    </div>
                ) : null}
            </div>
        </div>
    </motion.div>
);

export default About;
