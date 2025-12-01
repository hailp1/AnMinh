'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const ContactPage = () => {
    return (
        <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
            <Navbar />

            <section className="pt-32 pb-20 bg-[#0A192F] relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
                        <span className="text-cyan-400 font-bold tracking-widest uppercase text-sm mb-4 block">Get in Touch</span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Let's Discuss Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Digital Transformation</span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                            Ready to optimize your pharmaceutical operations? Contact us today for a consultation or demo.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 bg-[#020617]">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="space-y-8">
                            <h2 className="text-3xl font-bold text-white mb-6">Contact Information</h2>
                            <div className="space-y-6">
                                <ContactItem icon={<Mail className="w-6 h-6 text-cyan-400" />} title="Email Us" desc="contact@ammedtech.com" />
                                <ContactItem icon={<Phone className="w-6 h-6 text-blue-400" />} title="Call Us" desc="+84 90 888 8888" />
                                <ContactItem icon={<MapPin className="w-6 h-6 text-purple-400" />} title="Visit Us" desc="Ho Chi Minh City, Vietnam" />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} className="bg-[#112240]/50 p-8 rounded-2xl border border-white/5">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input placeholder="First Name" />
                                    <Input placeholder="Last Name" />
                                </div>
                                <Input placeholder="Email Address" type="email" />
                                <Input placeholder="Phone Number" type="tel" />
                                <textarea
                                    className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors h-32 resize-none"
                                    placeholder="Tell us about your project..."
                                ></textarea>
                                <button className="w-full py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold tracking-wide hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2">
                                    Send Message <Send size={18} />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
};

const ContactItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-slate-400">{desc}</p>
        </div>
    </div>
);

const Input = ({ placeholder, type = "text" }: { placeholder: string, type?: string }) => (
    <input
        type={type}
        className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
        placeholder={placeholder}
    />
);

export default ContactPage;
