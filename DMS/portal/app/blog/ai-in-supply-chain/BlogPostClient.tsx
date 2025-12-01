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
            <section className="pt-32 pb-12 bg-[#0A192F] relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-8 transition-colors">
                            <ArrowLeft size={16} /> Back to Blog
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex flex-wrap gap-4 mb-6">
                                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold">
                                    Artificial Intelligence
                                </span>
                                <span className="flex items-center gap-2 text-slate-400 text-xs">
                                    <Calendar size={14} /> Nov 28, 2024
                                </span>
                                <span className="flex items-center gap-2 text-slate-400 text-xs">
                                    <Clock size={14} /> 6 min read
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                                How AI is Revolutionizing Pharmaceutical Supply Chains
                            </h1>

                            <div className="flex items-center justify-between border-t border-white/10 pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                                        <Image src="/team/hung.png" alt="Author" width={40} height={40} className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Phạm Thái Hưng</div>
                                        <div className="text-xs text-slate-400">Chairman, AM Medtech</div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                                        <Facebook size={16} />
                                    </button>
                                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-all">
                                        <Twitter size={16} />
                                    </button>
                                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-700 hover:text-white transition-all">
                                        <Linkedin size={16} />
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
                    <article className="max-w-3xl mx-auto prose prose-invert prose-lg prose-purple">
                        <div className="relative w-full h-[400px] mb-12 rounded-2xl overflow-hidden">
                            <Image
                                src="/blog/ai-supply-chain.jpg"
                                alt="AI in Pharma Supply Chain"
                                fill
                                className="object-cover"
                            />
                        </div>

                        <p className="lead text-xl text-slate-300 mb-8">
                            Supply chain disruptions can be catastrophic in the pharmaceutical industry, where a delayed shipment isn't just a lost sale—it's a patient denied critical medication. Artificial Intelligence (AI) is emerging as the ultimate tool to build resilience and efficiency into these complex networks.
                        </p>

                        <h2>The Shift from Reactive to Proactive</h2>
                        <p>
                            Traditionally, supply chain management has been reactive: fixing problems after they occur. AI shifts this paradigm to proactive management. By analyzing vast amounts of historical data, weather patterns, and even social media trends, AI algorithms can predict disruptions before they happen.
                        </p>

                        <h2>1. Demand Forecasting with Precision</h2>
                        <p>
                            Overstocking leads to expired drugs and financial loss, while understocking risks patient health. AI models can analyze:
                        </p>
                        <ul>
                            <li>Historical sales data down to the SKU level.</li>
                            <li>Epidemiological data (e.g., predicting a flu outbreak in a specific region).</li>
                            <li>Market trends and competitor activities.</li>
                        </ul>
                        <p>
                            This allows distributors to optimize inventory levels dynamically, reducing holding costs while maintaining high service levels.
                        </p>

                        <h2>2. Intelligent Route Optimization</h2>
                        <p>
                            Last-mile delivery is often the most expensive part of the supply chain. AI-powered logistics platforms can calculate the most efficient delivery routes in real-time, considering:
                        </p>
                        <ul>
                            <li>Traffic conditions.</li>
                            <li>Fuel consumption.</li>
                            <li>Vehicle capacity and cold-chain requirements.</li>
                            <li>Delivery time windows.</li>
                        </ul>

                        <div className="my-12 p-8 bg-[#112240] rounded-2xl border-l-4 border-purple-500">
                            <h4 className="text-xl font-bold text-white mb-2">Case in Point</h4>
                            <p className="text-slate-300 mb-0">
                                By implementing AI route planning, one of our partners reduced their monthly fuel costs by <strong>12%</strong> and improved on-time delivery rates to <strong>99.5%</strong>.
                            </p>
                        </div>

                        <h2>3. Automated Quality Control</h2>
                        <p>
                            In warehouses, computer vision systems can inspect packaging for damage or label errors at speeds human inspectors cannot match. This ensures that only compliant, safe products leave the facility, protecting the brand's reputation and patient safety.
                        </p>

                        <h2>4. Predictive Maintenance</h2>
                        <p>
                            For cold-chain logistics, equipment failure is a nightmare. AI sensors on refrigeration units can detect anomalies (like slight temperature fluctuations or vibration patterns) that indicate a potential failure. Maintenance teams can be alerted to fix the issue <em>before</em> the equipment breaks down and spoils valuable inventory.
                        </p>

                        <hr className="my-12 border-white/10" />

                        <h3>The Road Ahead</h3>
                        <p>
                            AI is not replacing human decision-makers; it is augmenting them. By handling the complex data analysis, AI frees up supply chain managers to focus on strategic relationships and crisis management. As we move forward, the integration of AI into the pharma supply chain will become the standard for operational excellence.
                        </p>
                    </article>
                </div>
            </section>

            <Footer />
        </main>
    );
};

export default BlogPostClient;
