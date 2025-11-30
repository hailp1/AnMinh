import React from 'react';
import { Activity, Mail, Phone, MapPin, Facebook, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="bg-[#020c1b] text-slate-400 py-16 border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="relative w-48 h-12 mb-6">
                            <Image
                                src="/logo_medtech.png"
                                alt="AM Medtech Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <p className="text-sm leading-relaxed mb-6">
                            Empowering the pharmaceutical industry with next-generation digital solutions.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Facebook className="w-5 h-5" />} />
                            <SocialIcon icon={<Linkedin className="w-5 h-5" />} />
                            <SocialIcon icon={<Twitter className="w-5 h-5" />} />
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Solutions</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/solutions/dms-platform" className="hover:text-cyan-400 transition-colors">DMS Platform</Link></li>
                            <li><Link href="/solutions/rtm-strategy" className="hover:text-cyan-400 transition-colors">RTM Strategy</Link></li>
                            <li><Link href="/solutions/distribution-development" className="hover:text-cyan-400 transition-colors">Distribution Development</Link></li>
                            <li><Link href="/solutions/pharma-ecommerce" className="hover:text-cyan-400 transition-colors">Pharma E-Commerce</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
                            <li><Link href="/case-studies" className="hover:text-cyan-400 transition-colors">Case Studies</Link></li>
                            <li><Link href="/careers" className="hover:text-cyan-400 transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-cyan-400" />
                                <span>contact@ammedtech.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-cyan-400" />
                                <span>+84 90 888 8888</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-cyan-400 mt-1" />
                                <span>Ho Chi Minh City, Vietnam</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} AM Medtech. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all">
        {icon}
    </a>
);

export default Footer;
