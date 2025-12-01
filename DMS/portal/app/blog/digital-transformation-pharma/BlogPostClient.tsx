'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import { Calendar, User, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';

const BlogPostClient = () => {
    return (
        <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-10 md:pb-12 bg-[#0A192F] relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-8 transition-colors">
                            <ArrowLeft size={16} /> Back to Blog
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
                                    Digital Strategy
                                </span>
                                <span className="flex items-center gap-2 text-slate-400 text-xs">
                                    <Calendar size={14} /> Dec 01, 2024
                                </span>
                                <span className="flex items-center gap-2 text-slate-400 text-xs">
                                    <Clock size={14} /> 5 min read
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8 leading-tight">
                                5 Key Steps to Digital Transformation in Pharma Distribution
                            </h1>

                            <div className="flex items-center justify-between border-t border-white/10 pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                                        <Image src="/team/hai.png" alt="Author" width={40} height={40} className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Lê Phúc Hải</div>
                                        <div className="text-xs text-slate-400">CEO, AM Medtech</div>
                                    </div>
                                </div>
                                <div className="flex gap-2 sm:gap-3">
                                    <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                                        <Facebook size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                    <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-all">
                                        <Twitter size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                    <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-700 hover:text-white transition-all">
                                        <Linkedin size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 bg-[#020617]">
                <div className="container mx-auto px-6">
                    <article className="max-w-3xl mx-auto prose prose-invert prose-lg prose-cyan">
                        <div className="relative w-full h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px] mb-8 sm:mb-10 md:mb-12 rounded-xl sm:rounded-2xl overflow-hidden">
                            <Image
                                src="/blog/digital-transformation.jpg"
                                alt="Digital Transformation in Pharma"
                                fill
                                className="object-cover"
                            />
                        </div>

                        <p className="lead text-xl text-slate-300 mb-8">
                            The pharmaceutical industry is at a pivotal crossroads. Traditional distribution models, reliant on manual processes and fragmented data, are no longer sufficient to meet the demands of a rapidly evolving market. Digital transformation is not just a buzzword; it's a survival strategy.
                        </p>

                        <h2>1. Digitize Your Inventory Management</h2>
                        <p>
                            The foundation of any efficient supply chain is real-time visibility. Moving from spreadsheet-based tracking to a cloud-based <strong>Distribution Management System (DMS)</strong> allows for:
                        </p>
                        <ul>
                            <li>Real-time stock monitoring across multiple warehouses.</li>
                            <li>Automated expiry alerts to reduce wastage (FEFO - First Expired, First Out).</li>
                            <li>Batch tracking for rapid recall management if necessary.</li>
                        </ul>

                        <h2>2. Empower Your Sales Force with Data</h2>
                        <p>
                            Your sales representatives are your frontline warriors. Equipping them with mobile tools that provide instant access to:
                        </p>
                        <ul>
                            <li>Customer purchase history and credit limits.</li>
                            <li>Live stock availability to prevent unfulfillable orders.</li>
                            <li>Personalized scheme and discount recommendations.</li>
                        </ul>
                        <p>
                            This shifts their role from mere "order takers" to strategic consultants for pharmacies.
                        </p>

                        <div className="my-12 p-8 bg-[#112240] rounded-2xl border-l-4 border-cyan-500">
                            <h4 className="text-xl font-bold text-white mb-2">Did You Know?</h4>
                            <p className="text-slate-300 mb-0">
                                Companies that implement AI-driven sales tools see an average revenue increase of <strong>15-20%</strong> within the first year of adoption.
                            </p>
                        </div>

                        <h2>3. Adopt an Omnichannel Approach</h2>
                        <p>
                            Pharmacies and hospitals now expect the same B2B buying experience as B2C consumers. An integrated e-commerce portal allows customers to place orders 24/7, track deliveries, and manage invoices without waiting for a sales visit. This hybrid model ensures you capture sales even when your reps are offline.
                        </p>

                        <h2>4. Leverage Predictive Analytics</h2>
                        <p>
                            Don't just react to market changes; anticipate them. Advanced analytics can help you:
                        </p>
                        <ul>
                            <li>Forecast demand spikes for seasonal medications (e.g., flu season).</li>
                            <li>Optimize route planning to reduce fuel costs and delivery times.</li>
                            <li>Identify churn risks among pharmacy clients before they leave.</li>
                        </ul>

                        <h2>5. Ensure GSP/GDP Compliance via Tech</h2>
                        <p>
                            Compliance is non-negotiable. Digital systems automatically generate audit trails, monitor temperature conditions for cold-chain products (IoT integration), and ensure that every step of the distribution process adheres to Good Storage and Distribution Practices.
                        </p>

                        <hr className="my-12 border-white/10" />

                        <h3>Conclusion</h3>
                        <p>
                            Digital transformation is a journey, not a destination. By starting with these five core areas, pharmaceutical distributors can build a resilient, efficient, and customer-centric operation ready for the future.
                        </p>
                        <p>
                            At <strong>AM Medtech</strong>, we specialize in guiding pharma businesses through this transition with our tailored ecosystem of solutions.
                        </p>
                    </article>
                </div>
            </section>

            <Footer />
        </main>
    );
};

export default BlogPostClient;
