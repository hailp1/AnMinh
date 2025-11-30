'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, User, AlertCircle, Check, Mail, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type ViewState = 'login' | 'forgot-password';

export default function AdminLoginPage() {
    const [view, setView] = useState<ViewState>('login');

    // Login State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Forgot Password State
    const [email, setEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);

    // Shared State
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate API check
        setTimeout(() => {
            if (username && password) {
                console.log('Logging in with:', { username, rememberMe });
                window.location.href = 'https://dms.ammedtech.com/admin/dashboard';
            } else {
                setError('Invalid credentials. Please try again.');
                setIsLoading(false);
            }
        }, 1000);
    };

    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate API call
        setTimeout(() => {
            if (email && email.includes('@')) {
                setResetSent(true);
                setIsLoading(false);
            } else {
                setError('Please enter a valid email address.');
                setIsLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#020c1b] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#112240] via-[#020c1b] to-[#020c1b] z-0"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse z-0"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse z-0 animation-delay-1000"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md bg-slate-900/50 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-cyan-900/20"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 shadow-lg p-4">
                        {/* Logo An Minh */}
                        <div className="relative w-full h-full">
                            <Image
                                src="/anminh-logo.webp"
                                alt="An Minh Logo"
                                fill
                                className="object-contain"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        {view === 'login' ? 'Admin Portal' : 'Reset Password'}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {view === 'login' ? 'Sign in to An Minh DMS Administration' : 'Enter your email to receive instructions'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {view === 'login' ? (
                        <motion.form
                            key="login-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleLogin}
                            className="space-y-5"
                        >
                            {/* Username */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-[#0B1221] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-[#0B1221] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Remember & Forgot */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600 bg-transparent group-hover:border-slate-500'}`}>
                                        {rememberMe && <Check size={10} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setView('forgot-password');
                                        setError('');
                                    }}
                                    className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        Sign In <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="forgot-password-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleForgotPassword}
                            className="space-y-5"
                        >
                            {!resetSent ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-[#0B1221] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                                                placeholder="name@company.com"
                                                required
                                            />
                                        </div>
                                        <p className="text-slate-500 text-xs mt-2">
                                            We'll send a password reset link to this email address if it matches an existing admin account.
                                        </p>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm"
                                        >
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            {error}
                                        </motion.div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                Send Reset Link <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center"
                                >
                                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-6 h-6 text-green-400" />
                                    </div>
                                    <h3 className="text-white font-bold mb-2">Check your email</h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        We've sent password reset instructions to <span className="text-white font-medium">{email}</span>
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setResetSent(false);
                                            setEmail('');
                                            setView('login');
                                        }}
                                        className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                                    >
                                        Back to Login
                                    </button>
                                </motion.div>
                            )}

                            {!resetSent && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setView('login');
                                        setError('');
                                    }}
                                    className="w-full py-3 bg-transparent border border-slate-700 hover:bg-slate-800 rounded-xl font-medium text-slate-300 transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Login
                                </button>
                            )}
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-slate-500 text-xs">
                        By signing in, you agree to our <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a> and <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>.
                    </p>
                </div>
            </motion.div>

            <div className="absolute bottom-6 text-slate-600 text-xs text-center">
                &copy; 2024 An Minh Medtech. All rights reserved.<br />
                <span className="opacity-50">DMS Admin Portal v2.0</span>
            </div>
        </div>
    );
}
