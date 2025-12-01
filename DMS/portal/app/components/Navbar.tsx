'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Logo = () => (
    <div className="relative w-28 h-9 sm:w-32 sm:h-10 md:w-36 md:h-10 transition-all duration-300">
        <Image
            src="/logo_medtech.png"
            alt="AM Medtech Logo"
            fill
            className="object-contain"
            priority
        />
    </div>
);

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    // Add scroll effect background
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-[#020617]/95 backdrop-blur-xl shadow-lg py-3 border-b border-white/5' : 'bg-[#020617]/90 backdrop-blur-md py-4 md:py-5'}`}>
            <div className="flex justify-between items-center px-4 sm:px-6 md:px-10 w-full max-w-[1600px] mx-auto">
                <Link href="/" className="relative z-50 block">
                    <Logo />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-6 xl:gap-8">
                    <Link href="/#services" className="text-slate-300 hover:text-[#00D4FF] text-sm font-medium transition-colors">Services</Link>
                    <Link href="/data-intelligence" className="text-slate-300 hover:text-[#00D4FF] text-sm font-medium transition-colors">Data Intelligence</Link>
                    <Link href="/case-studies/famfa" className="text-slate-300 hover:text-[#00D4FF] text-sm font-medium transition-colors">Case Studies</Link>
                    <Link href="/blog" className="text-slate-300 hover:text-[#00D4FF] text-sm font-medium transition-colors">Blog</Link>
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
                                <Link
                                    href="/#services"
                                    onClick={toggleMobileMenu}
                                    className="px-6 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5"
                                >
                                    Services
                                </Link>
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
                                    href="/blog"
                                    onClick={toggleMobileMenu}
                                    className="px-6 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5"
                                >
                                    Blog
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
            </div>
        </nav>
    );
};

export default Navbar;
