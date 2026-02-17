"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import { apiService } from "@/src/api/apiService";
import { ShieldAlert, Mail, ArrowRight } from "lucide-react";

interface EmailVerificationProps {
    email: string;
    onVerified: () => void;
    onBack: () => void;
}

export default function EmailVerification({ email, onVerified, onBack }: EmailVerificationProps) {
    const { verifyEmail } = useAuth();
    const { showError, showSuccess } = useToast();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

    // Countdown timer
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVerify = async () => {
        if (!code || code.length !== 6) {
            showError("Invalid Code", "Please enter a 6-digit verification code");
            return;
        }

        setLoading(true);
        try {
            await verifyEmail(email, code);
            // The AuthContext will handle the redirect to Dashboard
            onVerified();
        } catch (e: any) {
            // Error is already handled in AuthContext
        }
        setLoading(false);
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            await apiService.resendVerification(email);
            showSuccess("Code Sent", "A new verification code has been sent to your email");
            setTimeLeft(15 * 60); // Reset timer
        } catch (e: any) {
            showError("Resend Failed", e?.message || "Failed to resend verification code");
        }
        setResendLoading(false);
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setCode(value);
    };

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
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-amber-500 flex items-center justify-center glow-azure"
                        >
                            <ShieldAlert className="text-white w-8 h-8" />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-black text-slate-900 mb-2 tracking-tighter"
                        >
                            Verify Email
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-2 text-slate-500 text-base font-medium"
                        >
                            A secure entry code has been dispatched to
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-amber-600 font-black mt-1"
                        >
                            {email}
                        </motion.p>
                    </div>

                    {/* Verification Code Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 block text-center">
                                Enter 6-Digit Code
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={handleCodeChange}
                                    className="w-full text-center text-4xl font-mono tracking-[0.5em] py-5 px-6 bg-slate-100/50 border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all outline-none text-slate-900 placeholder:text-slate-300 font-black shadow-inner"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                />
                            </div>
                        </div>

                        {/* Timer */}
                        {timeLeft > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="text-center"
                            >
                                <p className="text-sm text-slate-500 font-medium">
                                    Code expires in{" "}
                                    <span className="font-black text-amber-600">
                                        {formatTime(timeLeft)}
                                    </span>
                                </p>
                            </motion.div>
                        )}

                        {/* Verify Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            onClick={handleVerify}
                            disabled={!code || code.length !== 6 || loading}
                            className="w-full bg-slate-900 text-white font-black py-4 px-4 rounded-[20px] shadow-xl shadow-slate-900/10 hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            whileHover={{ scale: 1.02 }}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Verifying Security...
                                </>
                            ) : (
                                <>
                                    Verify Email <ArrowRight size={20} />
                                </>
                            )}
                        </motion.button>

                        {/* Resend Code */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="text-center"
                        >
                            <p className="text-sm text-slate-500 mb-2 font-medium">
                                Didn&apos;t receive the code?
                            </p>
                            <button
                                onClick={handleResend}
                                disabled={resendLoading || timeLeft > 0}
                                className="text-amber-600 hover:text-orange-600 font-bold text-sm transition-colors disabled:opacity-50"
                            >
                                {resendLoading ? "Sending..." : "Resend Code"}
                            </button>
                        </motion.div>

                        {/* Back Button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-center"
                        >
                            <button
                                onClick={onBack}
                                className="text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors inline-flex items-center gap-2"
                            >
                                <ArrowRight size={16} className="rotate-180" /> Back to Registration
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* Help Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 }}
                        className="mt-8 p-5 bg-amber-50 rounded-[24px] border border-amber-100"
                    >
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                <Mail className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="text-sm text-slate-600 font-medium">
                                <p className="font-black mb-1 text-slate-900">Check your inbox</p>
                                <p className="leading-relaxed">Verify your clinical ID by entering the code sent. Check your spam if it doesn&apos;t arrive in 2 minutes.</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
