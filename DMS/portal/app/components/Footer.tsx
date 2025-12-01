import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="bg-[#020617] border-t border-white/10 pt-12 sm:pt-16 pb-6 sm:pb-8">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">

                    {/* Brand Column */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="relative w-32 h-10 sm:w-40 sm:h-12">
                            <Image
                                src="/logo_medtech.png"
                                alt="AM Medtech"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Empowering pharmaceutical distribution with cutting-edge digital solutions. We bridge the gap between technology and healthcare logistics.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink icon={<Facebook size={18} />} href="#" />
                            <SocialLink icon={<Twitter size={18} />} href="#" />
                            <SocialLink icon={<Linkedin size={18} />} href="#" />
                            <SocialLink icon={<Instagram size={18} />} href="#" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Solutions</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link href="/solutions/dms-platform" className="hover:text-[#00D4FF] transition-colors">Distribution Management System</Link></li>
                            <li><Link href="/data-intelligence" className="hover:text-[#00D4FF] transition-colors">Data Intelligence</Link></li>
                            <li><Link href="/solutions/pharma-ecommerce" className="hover:text-[#00D4FF] transition-colors">Omnichannel Sales</Link></li>
                            <li><Link href="/solutions/distribution-development" className="hover:text-[#00D4FF] transition-colors">Supply Chain AI</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link href="/about" className="hover:text-[#00D4FF] transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-[#00D4FF] transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-[#00D4FF] transition-colors">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-[#00D4FF] transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start gap-2 sm:gap-3">
                                <MapPin size={16} className="text-[#00D4FF] shrink-0 mt-1 sm:w-[18px] sm:h-[18px]" />
                                <span className="text-xs sm:text-sm break-words">123 Innovation Drive, Tech Park, Ho Chi Minh City, Vietnam</span>
                            </li>
                            <li className="flex items-center gap-2 sm:gap-3">
                                <Phone size={16} className="text-[#00D4FF] shrink-0 sm:w-[18px] sm:h-[18px]" />
                                <span className="text-xs sm:text-sm">+84 28 1234 5678</span>
                            </li>
                            <li className="flex items-center gap-2 sm:gap-3">
                                <Mail size={16} className="text-[#00D4FF] shrink-0 sm:w-[18px] sm:h-[18px]" />
                                <span className="text-xs sm:text-sm break-all">contact@ammedtech.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} AM Medtech. All rights reserved.</p>
                    <div className="flex gap-4 sm:gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialLink = ({ icon, href }: { icon: React.ReactNode, href: string }) => (
    <a
        href={href}
        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-[#00D4FF] hover:text-[#020617] transition-all duration-300"
    >
        {icon}
    </a>
);

export default Footer;
