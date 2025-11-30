'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, TrendingUp, FileWarning, Users, Database, Shuffle } from 'lucide-react';

const ChaosToOrder = () => {
    const [isOrdered, setIsOrdered] = useState(false);

    return (
        <section className="py-16 md:py-24 bg-[#020617] relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">

                <div className="text-center mb-12 md:mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-bold text-white mb-6"
                    >
                        Transform <span className="text-red-500">Chaos</span> into <span className="text-cyan-400">Growth</span>
                    </motion.h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg mb-8">
                        Disorganized structures and manual processes kill profitability. We standardize your operations to unlock efficiency and revenue.
                    </p>

                    <button
                        onClick={() => setIsOrdered(!isOrdered)}
                        className="px-6 py-3 md:px-8 md:py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all flex items-center gap-2 mx-auto text-sm md:text-base"
                    >
                        {isOrdered ? <Shuffle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        {isOrdered ? "See the Problem" : "See the Solution"}
                    </button>
                </div>

                <div className="relative h-[500px] md:h-[600px] bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden">
                    {/* Background Grid (Visible only in Order mode) */}
                    <motion.div
                        animate={{ opacity: isOrdered ? 0.2 : 0 }}
                        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
                    />

                    {/* Central Divider/Transition Line */}
                    <motion.div
                        animate={{
                            left: isOrdered ? '100%' : '0%',
                            opacity: isOrdered ? 0 : 1
                        }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-cyan-500 to-transparent z-20 shadow-[0_0_30px_rgba(6,182,212,0.8)]"
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* CHAOS STATE ELEMENTS */}
                        <AnimatePresence>
                            {!isOrdered && (
                                <>
                                    <ChaosNode text="Undefined Roles" x={-200} y={-150} rotate={-15} delay={0} />
                                    <ChaosNode text="Data Silos" x={250} y={-100} rotate={10} delay={0.1} />
                                    <ChaosNode text="Manual Excel" x={-150} y={150} rotate={-5} delay={0.2} />
                                    <ChaosNode text="Inventory Gaps" x={200} y={180} rotate={12} delay={0.3} />
                                    <ChaosNode text="High Staff Churn" x={0} y={-200} rotate={5} delay={0.4} />
                                    <ChaosNode text="Lost Revenue" x={0} y={200} rotate={-8} delay={0.5} />
                                    <ChaosNode text="Confusing KPIs" x={-250} y={0} rotate={-12} delay={0.6} />
                                    <ChaosNode text="No Accountability" x={280} y={50} rotate={8} delay={0.7} />

                                    {/* Floating Warning Icons */}
                                    <motion.div
                                        animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute text-red-500/20"
                                        style={{ top: '20%', left: '20%' }}
                                    >
                                        <AlertTriangle size={120} />
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                        {/* ORDER STATE ELEMENTS */}
                        <AnimatePresence>
                            {isOrdered && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 z-10 w-full max-w-4xl px-4 md:px-8">
                                    <OrderNode icon={<Users />} title="Standardized Org Chart" desc="Clear roles & responsibilities" />
                                    <OrderNode icon={<Database />} title="Centralized Data" desc="Single source of truth" />
                                    <OrderNode icon={<TrendingUp />} title="Automated KPIs" desc="Real-time performance tracking" />
                                    <OrderNode icon={<CheckCircle />} title="Optimized Workflow" desc="Streamlined processes" />

                                    {/* Central Profit Growth Node */}
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.5, type: "spring" }}
                                        className="col-span-1 md:col-span-1 md:row-span-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(6,182,212,0.4)]"
                                    >
                                        <TrendingUp className="w-8 h-8 md:w-12 md:h-12 text-white mb-2 md:mb-4" />
                                        <h3 className="text-lg md:text-2xl font-bold text-white">PROFIT MAXIMIZATION</h3>
                                        <p className="text-cyan-100 text-xs md:text-sm mt-2">+45% Efficiency</p>
                                    </motion.div>

                                    <OrderNode icon={<CheckCircle />} title="Inventory Control" desc="AI-driven forecasting" />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Overlay Text for Context */}
                    <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                        <motion.p
                            key={isOrdered ? "ordered" : "chaos"}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-lg md:text-xl font-bold ${isOrdered ? "text-cyan-400" : "text-red-400"}`}
                        >
                            {isOrdered ? "SYSTEMATIZED & SCALABLE" : "FRAGMENTED & INEFFICIENT"}
                        </motion.p>
                    </div>

                </div>
            </div>
        </section>
    );
};

const ChaosNode = ({ text, x, y, rotate, delay }: { text: string, x: number, y: number, rotate: number, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
            opacity: 1,
            scale: 1,
            x: [x, x + 10, x - 10, x],
            y: [y, y - 10, y + 10, y],
            rotate: rotate
        }}
        exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
        transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: delay
        }}
        className="absolute px-6 py-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg font-mono font-bold shadow-lg backdrop-blur-sm whitespace-nowrap"
        style={{ x, y }}
    >
        <div className="flex items-center gap-2">
            <FileWarning className="w-4 h-4" />
            {text}
        </div>
    </motion.div>
);

const OrderNode = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border border-cyan-500/20 p-6 rounded-xl backdrop-blur-md hover:border-cyan-500/50 transition-colors"
    >
        <div className="text-cyan-400 mb-3">{icon}</div>
        <h4 className="text-white font-bold mb-1">{title}</h4>
        <p className="text-slate-400 text-xs">{desc}</p>
    </motion.div>
);

export default ChaosToOrder;
