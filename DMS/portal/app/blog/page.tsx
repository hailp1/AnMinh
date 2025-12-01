'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';

const BlogPage = () => {
    return (
        <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-[#0A192F] relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px]"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-cyan-400 font-bold tracking-widest uppercase text-sm mb-4 block">Insights & News</span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            The Future of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                Pharma Tech
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                            Explore the latest trends, expert analysis, and success stories in pharmaceutical digital transformation.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-20 bg-[#020617]">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {/* Blog Post 1 */}
                        <BlogCard
                            image="/blog/digital-transformation.jpg"
                            category="Digital Strategy"
                            date="Dec 01, 2024"
                            title="5 Key Steps to Digital Transformation in Pharma Distribution"
                            desc="Learn how leading pharmaceutical companies are modernizing their supply chains and sales operations to stay competitive."
                            slug="digital-transformation-pharma"
                            delay={0.1}
                        />

                        {/* Blog Post 2 */}
                        <BlogCard
                            image="/blog/ai-supply-chain.jpg"
                            category="Artificial Intelligence"
                            date="Nov 28, 2024"
                            title="How AI is Revolutionizing Pharmaceutical Supply Chains"
                            desc="From predictive demand forecasting to route optimization, discover the impact of AI on logistics efficiency."
                            slug="ai-in-supply-chain"
                            delay={0.2}
                        />

                        {/* Blog Post 3 (Placeholder) */}
                        <BlogCard
                            image="/blog/omnichannel.jpg"
                            category="E-Commerce"
                            date="Nov 15, 2024"
                            title="Building an Omnichannel Strategy for B2B Pharma Sales"
                            desc="Why pharmacies expect a seamless B2B ordering experience and how to deliver it effectively."
                            slug="#"
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
};

const BlogCard = ({ image, category, date, title, desc, slug, delay }: { image: string, category: string, date: string, title: string, desc: string, slug: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="group bg-[#112240]/30 border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all hover:-translate-y-1"
    >
        {/* Image Placeholder */}
        <div className="relative h-48 bg-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#112240] to-transparent opacity-60 z-10"></div>
            {/* Ideally use Next/Image here, but using div for placeholder if image missing */}
            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-500">
                <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="absolute top-4 left-4 z-20">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold backdrop-blur-sm">
                    {category}
                </span>
            </div>
        </div>

        <div className="p-6">
            <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{date}</span>
                </div>
                <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>AM Medtech Team</span>
                </div>
            </div>

            <Link href={`/blog/${slug}`} className="block">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {title}
                </h3>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                {desc}
            </p>

            <Link href={`/blog/${slug}`} className="inline-flex items-center gap-2 text-cyan-400 text-sm font-bold hover:gap-3 transition-all">
                Read Article <ArrowRight size={16} />
            </Link>
        </div>
    </motion.div>
);

export default BlogPage;
