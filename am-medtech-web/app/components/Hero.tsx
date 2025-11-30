'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Tablet, Brain, Facebook, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

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

import Image from 'next/image';

const Logo = () => (
    <div className="relative w-48 h-12">
        <Image
            src="/logo_medtech.png"
            alt="AM Medtech Logo"
            fill
            className="object-contain"
        />
    </div>
);

const Hero = () => {
    return (
        <div className="relative h-screen w-full bg-[#020617] text-white overflow-hidden font-sans flex flex-col">
            <HexagonBackground />

            {/* Navbar */}
            <nav className="relative z-50 flex justify-between items-center px-10 py-8 w-full max-w-[1600px] mx-auto">
                <Link href="/">
                    <Logo />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="#services" className="text-slate-300 hover:text-[#00D4FF] text-sm font-medium transition-colors">Services</a>
                    <a href="#growth" className="text-slate-300 hover:text-[#00D4FF] text-sm font-medium transition-colors">Data Intelligence</a>
                    <a href="#case-studies" className="text-slate-300 hover:text-[#00D4FF] text-sm font-medium transition-colors">Case Studies</a>
                    <a href="#about" className="text-slate-300 hover:text-[#00D4FF] text-sm font-medium transition-colors">About</a>
                </div>

                <Link
                    href="/login"
                    className="px-8 py-2 rounded-full border border-[#00D4FF] text-[#00D4FF] text-sm font-bold tracking-wider hover:bg-[#00D4FF] hover:text-[#020617] hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] transition-all duration-300"
                >
                    CLIENT LOGIN
                </Link>
            </nav>

            {/* Main Content Area */}
            <div className="relative z-10 flex-grow flex flex-col justify-center px-10 md:px-20">
                {/* Hero Text */}
                <div className="mb-16 max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight text-white"
                    >
                        ELEVATING <br />
                        PHARMA <br />
                        DISTRIBUTION
                    </motion.h1>
                </div>

                {/* Feature Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1400px]">
                    <GlassCard
                        icon={<Settings strokeWidth={1.5} />}
                        title="DIGITAL TRANSFORMATION"
                        text="Streamline operations, optimize workflows, and embrace the future of connected healthcare solutions."
                        delay={0.2}
                    />
                    <GlassCard
                        icon={<Tablet strokeWidth={1.5} />}
                        title="SMART DMS"
                        text="Intelligent Document Management Systems for secure, compliant, and efficient information flow."
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

            {/* Footer */}
            <footer className="relative z-10 px-10 py-6 flex justify-between items-center text-xs text-slate-400">
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors">About us</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Accessibility</a>
                    <a href="#" className="hover:text-white transition-colors">Contact us</a>
                </div>
                <div className="flex gap-4">
                    <SocialIcon icon={<Facebook size={16} />} />
                    <SocialIcon icon={<Twitter size={16} />} />
                    <SocialIcon icon={<Youtube size={16} />} />
                </div>
            </footer>
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
        className="group relative p-6 rounded-2xl bg-[#0B1221]/60 backdrop-blur-md border border-[#00D4FF]/30 hover:border-[#00D4FF] hover:bg-[#0B1221]/80 transition-all duration-300 overflow-hidden"
    >
        {/* Inner Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative z-10">
            <div className="mb-4 text-[#00D4FF]">
                {React.cloneElement(icon as any, { className: "w-10 h-10" })}
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">{title}</h3>
            <p className="text-slate-300 text-xs leading-relaxed opacity-80">
                {text}
            </p>
        </div>

        {/* Bottom Glow Line */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
    </motion.div>
);

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
    <a href="#" className="text-slate-400 hover:text-[#00D4FF] transition-colors">
        {icon}
    </a>
);

export default Hero;
