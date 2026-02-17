"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import EmailVerification from "@/src/component/EmailVerification";
import { ShieldAlert, User, Mail, Lock, ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function RegisterPage() {
    const { register } = useAuth();
    const { showError, showSuccess } = useToast();
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [agree, setAgree] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [pendingEmail, setPendingEmail] = useState("");

    const onSubmit = async () => {
        if (!agree) {
            showError("Terms Required", "Please accept the terms and conditions");
            return;
        }
        if (!name || !email || !password || !confirm) {
            showError("Missing fields", "Please fill out all fields");
            return;
        }
        if (password !== confirm) {
            showError("Password mismatch", "Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            await register(name, email, password);
            setPendingEmail(email);
            setShowVerification(true);
            showSuccess("Verification Sent", "Please check your email for a verification code");
        } catch (e: any) {
            showError("Registration Failed", e?.message || "Please try again");
        }
        setLoading(false);
    };

    const handleVerificationComplete = () => {
        setShowVerification(false);
        setPendingEmail("");
        // The AuthContext will handle the redirect to Dashboard
    };

    const handleBackToRegistration = () => {
        setShowVerification(false);
        setPendingEmail("");
    };

    // Show verification component if email verification is needed
    if (showVerification && pendingEmail) {
        return (
            <EmailVerification
                email={pendingEmail}
                onVerified={handleVerificationComplete}
                onBack={handleBackToRegistration}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 -z-0">
                <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-amber-200/30 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-orange-100/40 rounded-full blur-[120px]" />
            </div>

            {/* Neural Wave Glow Effect */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-amber-200/20 to-orange-200/20 blur-3xl" />
            </motion.div>

            <div className="relative w-full max-w-md z-10">
                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="backdrop-blur-3xl bg-white/70 border border-white/50 rounded-[48px] p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] w-full"
                >
                    {/* Logo and Header */}
                    <div className="text-center mb-8">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-black text-slate-900 mb-2 tracking-tighter"
                        >
                            Create account
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-2 text-slate-500 text-base font-medium"
                        >
                            Join the clinical safety intelligence platform
                        </motion.p>
                    </div>

                    {/* Form */}
                    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-5">
                        {/* Name Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-2"
                        >
                            <label className="text-sm font-bold text-slate-700 block">
                                Full Name
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-14 pr-4 py-4 bg-slate-100/50 border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                        </motion.div>

                        {/* Email Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-2"
                        >
                            <label className="text-sm font-bold text-slate-700 block">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-14 pr-4 py-4 bg-slate-100/50 border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </motion.div>

                        {/* Password Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="space-y-2"
                        >
                            <label className="text-sm font-bold text-slate-700 block">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input
                                    type={show1 ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-12 py-4 bg-slate-100/50 border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                                    placeholder="Create a password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-amber-600 transition-colors"
                                    onClick={() => setShow1(!show1)}
                                >
                                    {show1 ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Confirm Password Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="space-y-2"
                        >
                            <label className="text-sm font-bold text-slate-700 block">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <ShieldCheck className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input
                                    type={show2 ? "text" : "password"}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className="w-full pl-14 pr-12 py-4 bg-slate-100/50 border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                                    placeholder="Confirm password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-amber-600 transition-colors"
                                    onClick={() => setShow2(!show2)}
                                >
                                    {show2 ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Terms and Conditions */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="space-y-3"
                        >
                            <label className="flex items-start gap-4 text-sm text-slate-500 font-medium">
                                <div className="relative flex items-center mt-1">
                                    <input
                                        type="checkbox"
                                        checked={agree}
                                        onChange={(e) => setAgree(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${agree
                                        ? 'bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/20'
                                        : 'border-slate-200 hover:border-amber-500'
                                        }`}>
                                        {agree && (
                                            <ShieldCheck className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                </div>
                                <span className="leading-relaxed">
                                    I accept the{" "}
                                    <Link href="/Terms" className="text-slate-900 border-b border-amber-200 hover:border-amber-500 transition-colors">
                                        Terms of Service
                                    </Link>
                                    {" "}and{" "}
                                    <Link href="/Privacy" className="text-slate-900 border-b border-amber-200 hover:border-amber-500 transition-colors">
                                        Privacy Policy
                                    </Link>
                                </span>
                            </label>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            type="submit"
                            disabled={!agree || loading}
                            className="w-full bg-slate-900 text-white font-black py-4 px-4 rounded-[20px] shadow-xl shadow-slate-900/10 hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            whileHover={{ scale: 1.02 }}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating ID...
                                </>
                            ) : (
                                <>
                                    Create Account <ArrowRight size={20} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 }}
                        className="mt-8 mb-6"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-5 bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px]">Industrial Encryption</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sign In Link */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="text-center text-sm text-slate-500 font-medium"
                    >
                        Already registered?{" "}
                        <Link
                            href="/Login"
                            className="font-bold text-amber-600 hover:text-orange-600 transition-colors"
                        >
                            Sign in here
                        </Link>
                    </motion.p>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                    className="mt-8 text-center"
                >
                    <p className="text-xs text-slate-400 font-semibold" style={{ fontFamily: 'var(--font-inter)' }}>
                        Secure authentication powered by DDInter 2.0 <br />
                        <span className="mt-2 block text-slate-300">
                            Industrial-grade safety for polypharmacy.
                        </span>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
