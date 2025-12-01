'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Tablet, Brain } from 'lucide-react';

// Custom Hexagon Background Component
const HexagonBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Deep Blue Background */}
        <div className="absolute inset-0 bg-[#020617]"></div>

        {/* Generated Hexagon Background Image */}
        <div className="absolute inset-0 opacity-80 mix-blend-normal">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/banner.png')" }}
            ></div>
        </div>

        {/* Overlay Gradient for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent"></div>
    </div>
);

const Hero = () => {
    return (
        <div className="relative min-h-screen w-full bg-[#020617] text-white overflow-hidden font-sans flex flex-col">
            <HexagonBackground />

            {/* Main Content Area */}
            <div className="relative z-10 flex-grow flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 md:pb-20 lg:py-0">
                {/* Hero Text */}
                <div className="mb-8 sm:mb-12 md:mb-16 max-w-4xl mx-auto md:mx-0 text-center md:text-left">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] sm:leading-tight tracking-tight text-white mb-0"
                    >
                        ELEVATING <br className="hidden sm:block" />
                        PHARMA <br className="hidden sm:block" />
                        DISTRIBUTION
                    </motion.h1>
                </div>

                {/* Feature Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full max-w-[1400px] mx-auto md:mx-0">
                    <GlassCard
                        icon={<Settings strokeWidth={1.5} />}
                        title="DIGITAL TRANSFORMATION"
                        text="Streamline operations, optimize workflows, and embrace the future of connected healthcare solutions."
                        delay={0.2}
                    />
                    <GlassCard
                        icon={<Tablet strokeWidth={1.5} />}
                        title="DISTRIBUTION MANAGEMENT SYSTEM"
                        text="Intelligent Distribution Management Systems for secure, compliant, and efficient information flow."
                        delay={0.4}
                    />
                    <GlassCard
                        icon={<Brain strokeWidth={1.5} />}
                        title="DATA INTELLIGENCE"
                        text="Unlock actionable insights with advanced analytics and predictive modeling for informed decisions."
                        delay={0.6}
                    />
                </div>
            </div>


        </div>
    );
};

interface GlassCardProps {
    icon: React.ReactNode;
    title: string;
    text: string;
    delay: number;
}

const GlassCard = ({ icon, title, text, delay }: GlassCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        className="group relative p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-[#0B1221]/60 backdrop-blur-md border border-[#00D4FF]/30 hover:border-[#00D4FF] hover:bg-[#0B1221]/80 transition-all duration-300 overflow-hidden"
    >
        {/* Inner Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative z-10">
            <div className="mb-3 sm:mb-4 text-[#00D4FF]">
                {React.cloneElement(icon as any, { className: "w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" })}
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2 tracking-wide leading-tight">{title}</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed opacity-80">
                {text}
            </p>
        </div>

        {/* Bottom Glow Line */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
    </motion.div>
);

export default Hero;
