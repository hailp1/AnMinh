'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, Building2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [companyCode, setCompanyCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate API check
        const code = companyCode.toUpperCase().trim();

        if (code === 'AM' || code === 'ANMINH' || code === 'AMGROUP') {
            // Redirect to An Minh Admin Portal (Client App)
            window.location.href = 'https://dms.ammedtech.com/admin';

        } else if (code === 'AM01' || code === 'TDV001') {
            // Redirect to TDV Portal (Client App)
            window.location.href = 'https://dms.ammedtech.com/login-simple';

        } else if (code === 'TEST' || code === 'DEMO') {
            alert('Redirecting to Demo Portal...');
            setIsLoading(false);
        } else {
            setError('Invalid Company Code. Please contact your administrator.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex justify-center items-center">
            <div className="w-full max-w-[75%] min-h-screen bg-[#020c1b] flex flex-col items-center justify-center p-6 relative overflow-hidden shadow-2xl border-x border-slate-800/50">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#112240] via-[#020c1b] to-[#020c1b] z-0"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse z-0"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-cyan-900/20"
                >
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Activity className="text-white w-8 h-8" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-center text-white mb-2">Client Portal</h2>
                    <p className="text-slate-400 text-center mb-8">Enter your company code to access your dedicated workspace.</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Company Code / ID</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Building2 className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    value={companyCode}
                                    onChange={(e) => setCompanyCode(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-[#0A192F] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    placeholder="e.g. ANMINH"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm"
                            >
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    Access Portal <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-sm">
                            Need help? <a href="#" className="text-cyan-400 hover:underline">Contact Support</a>
                        </p>
                    </div>
                </motion.div>

                <div className="absolute bottom-6 text-slate-600 text-xs">
                    &copy; 2024 AM Medtech. Secure Login System.
                </div>
            </div>
        </div>
    );
}
