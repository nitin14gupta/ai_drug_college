"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { apiService } from "@/src/api/apiService";
import { useToast } from "@/src/context/ToastContext";
import { useAuth } from "@/src/context/AuthContext";
import { ShieldAlert, Mail, Lock, ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const router = useRouter();
    const { showError, showSuccess } = useToast();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    const onRequest = async () => {
        if (!email) {
            showError("Missing email", "Please enter your email");
            return;
        }
        setLoading(true);
        try {
            const res = await apiService.requestReset(email);
            if (res?.ok) {
                showSuccess("Code sent", "Check your inbox for the reset code");
                setStep(2);
            }
        } catch (e: any) {
            showError("Request failed", e?.message || "Please try again");
        }
        setLoading(false);
    };

    const onVerify = async () => {
        if (!email || !code) {
            showError("Missing fields", "Enter email and code");
            return;
        }
        setLoading(true);
        try {
            const res = await apiService.verifyReset(email, code);
            if (res?.ok) setStep(3);
        } catch (e: any) {
            showError("Invalid code", e?.message || "Please recheck the code");
        }
        setLoading(false);
    };

    const onConfirm = async () => {
        if (!email || !code || !newPassword || !confirm) {
            showError("Missing fields", "Fill all fields");
            return;
        }
        if (newPassword !== confirm) {
            showError("Password mismatch", "Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            const res = await apiService.confirmReset(email, code, newPassword);
            if (res?.ok) {
                showSuccess("Password updated", "You can now sign in");
                router.push("/Login");
            }
        } catch (e: any) {
            showError("Update failed", e?.message || "Please try again");
        }
        setLoading(false);
    };

    const stepLabels = [
        "Enter your email",
        "Verify your code",
        "Set new password"
    ];

    const handleNext = () => {
        if (step === 1) onRequest();
        else if (step === 2) onVerify();
        else if (step === 3) onConfirm();
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
                            Account Recovery
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-2 text-slate-500 text-base font-medium"
                        >
                            {step === 1 && "Start recovery for your clinical ID"}
                            {step === 2 && "Enter the verification code sent to your email"}
                            {step === 3 && "Secure your account with a new password"}
                        </motion.p>
                    </div>

                    {/* Progress Steps */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-center space-x-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${i <= step
                                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                            : 'bg-slate-100 border-2 border-slate-200 text-slate-400'
                                            }`}
                                    >
                                        {i < step ? (
                                            <ShieldCheck className="w-5 h-5" />
                                        ) : (
                                            i
                                        )}
                                    </motion.div>
                                    {i < 3 && (
                                        <div className={`w-8 h-0.5 mx-2 transition-colors duration-300 ${i < step ? 'bg-amber-500' : 'bg-slate-200'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Step 1: Email */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
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
                                        placeholder="Enter your clinical email"
                                        required
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Verification Code */}
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block">
                                    Verification Code
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full text-center text-3xl font-mono tracking-widest py-4 px-6 bg-slate-100/50 border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all outline-none text-slate-900 placeholder:text-slate-300 font-black"
                                        placeholder="000000"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-slate-400 text-center font-medium mt-2">
                                    Verified code helps secure the chain of custody.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block">
                                    New Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                    </div>
                                    <input
                                        type={show1 ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-14 pr-14 py-4 bg-slate-100/50 border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                                        placeholder="Enter new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-amber-500 transition-colors"
                                        onClick={() => setShow1(!show1)}
                                    >
                                        {show1 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block">
                                    Confirm New Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                    </div>
                                    <input
                                        type={show2 ? "text" : "password"}
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        className="w-full pl-14 pr-14 py-4 bg-slate-100/50 border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-amber-500 transition-colors"
                                        onClick={() => setShow2(!show2)}
                                    >
                                        {show2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        onClick={handleNext}
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-black py-4 px-4 rounded-[20px] shadow-xl shadow-slate-900/10 hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        whileHover={{ scale: 1.02 }}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                {step === 3 ? "Reset Password" : "Next Step"} <ArrowRight size={20} />
                            </>
                        )}
                    </motion.button>

                    {/* Back to Login */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="text-center mt-8"
                    >
                        <Link
                            href="/Login"
                            className="text-sm text-slate-500 hover:text-amber-600 font-bold transition-colors inline-flex items-center gap-2"
                        >
                            <ArrowRight size={16} className="rotate-180" /> Back to Login
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
