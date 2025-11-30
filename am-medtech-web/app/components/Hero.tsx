'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Tablet, Brain, Facebook, Twitter, Youtube, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

const Logo = () => (
    <div className="relative w-32 h-10 sm:w-40 sm:h-11 md:w-48 md:h-12 transition-all duration-300">
        <Image
            src="/logo_medtech.png"
            alt="AM Medtech Logo"
            fill
            className="object-contain"
            priority
        />
    </div>
);

const Hero = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="relative min-h-screen w-full bg-[#020617] text-white overflow-hidden font-sans flex flex-col">
            <HexagonBackground />

            {/* Navbar */}
            <nav className="relative z-50 flex justify-between items-center px-4 sm:px-6 md:px-10 py-6 md:py-8 w-full max-w-[1600px] mx-auto">
                <Link href="/" className="z-50">
                    <Logo />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-6 xl:gap-8">
                    <a href="#services" className="text-slate-300 hover:text-[#00D4FF] text-sm font-medium transition-colors">Services</a>
                    <Link href="/data-intelligence" className="text-slate-300 hover:text-[#00D4FF] text-sm font-medium transition-colors">Data Intelligence</Link>
                    <Link href="/case-studies/famfa" className="text-slate-300 hover:text-[#00D4FF] text-sm font-medium transition-colors">Case Studies</Link>
                    <Link href="/about" className="text-slate-300 hover:text-[#00D4FF] text-sm font-medium transition-colors">About</Link>
                </div>

                <Link
                    href="/login"
                    className="hidden lg:flex px-6 py-2 xl:px-8 rounded-full border border-[#00D4FF] text-[#00D4FF] text-sm font-bold tracking-wider hover:bg-[#00D4FF] hover:text-[#020617] hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] transition-all duration-300"
                >
                    CLIENT LOGIN
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden z-50 p-2 text-white hover:text-[#00D4FF] transition-colors"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Mobile Menu Dropdown - Compact & Modern */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-full right-4 sm:right-6 md:right-10 mt-2 w-64 bg-[#0B1221]/95 backdrop-blur-xl border border-[#00D4FF]/20 rounded-2xl shadow-2xl z-50 lg:hidden overflow-hidden origin-top-right"
                        >
                            <div className="flex flex-col py-2">
                                <a
                                    href="#services"
                                    onClick={toggleMobileMenu}
                                    className="px-6 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5"
                                >
                                    Services
                                </a>
                                <Link
                                    href="/data-intelligence"
                                    onClick={toggleMobileMenu}
                                    className="px-6 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5"
                                >
                                    Data Intelligence
                                </Link>
                                <Link
                                    href="/case-studies/famfa"
                                    onClick={toggleMobileMenu}
                                    className="px-6 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5"
                                >
                                    Case Studies
                                </Link>
                                <Link
                                    href="/about"
                                    onClick={toggleMobileMenu}
                                    className="px-6 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    About
                                </Link>
                                <div className="p-4 bg-[#020617]/50">
                                    <Link
                                        href="/login"
                                        onClick={toggleMobileMenu}
                                        className="flex items-center justify-center w-full px-4 py-2 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] text-xs font-bold tracking-wider border border-[#00D4FF]/50 hover:bg-[#00D4FF] hover:text-[#020617] transition-all duration-300"
                                    >
                                        CLIENT LOGIN
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Main Content Area */}
            <div className="relative z-10 flex-grow flex flex-col justify-center px-4 sm:px-6 md:px-10 lg:px-20 py-10 md:py-0">
                {/* Hero Text */}
                <div className="mb-10 md:mb-16 max-w-4xl mx-auto md:mx-0 text-center md:text-left">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold leading-tight tracking-tight text-white"
                    >
                        ELEVATING <br className="hidden md:block" />
                        PHARMA <br className="hidden md:block" />
                        DISTRIBUTION
                    </motion.h1>
                </div>

                {/* Feature Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-[1400px] mx-auto md:mx-0">
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
        className="group relative p-5 sm:p-6 rounded-2xl bg-[#0B1221]/60 backdrop-blur-md border border-[#00D4FF]/30 hover:border-[#00D4FF] hover:bg-[#0B1221]/80 transition-all duration-300 overflow-hidden"
    >
        {/* Inner Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative z-10">
            <div className="mb-3 sm:mb-4 text-[#00D4FF]">
                {React.cloneElement(icon as any, { className: "w-8 h-8 sm:w-10 sm:h-10" })}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2 tracking-wide">{title}</h3>
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
