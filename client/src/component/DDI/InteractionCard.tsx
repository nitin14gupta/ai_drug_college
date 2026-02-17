"use client";

import React, { useState } from 'react';
import { useDDI, Interaction } from '@/src/hooks/useDDI';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, MessageSquare, Info } from 'lucide-react';

interface InteractionCardProps {
    interaction: Interaction;
    mode: 'patient' | 'clinician';
}

export const InteractionCard: React.FC<InteractionCardProps> = ({ interaction, mode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(interaction.explanation || null);
    const { getExplanation, loading } = useDDI();

    const handleExplain = async () => {
        if (!explanation) {
            const exp = await getExplanation(interaction, mode);
            setExplanation(exp);
        }
        setIsOpen(!isOpen);
    };

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'Major': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'Moderate': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-slate-300 shadow-sm">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getSeverityStyles(interaction.severity)}`}>
                        {interaction.severity}
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-slate-900 font-bold">{interaction.drug_a}</span>
                        <span className="text-slate-300 text-xs text-bold">×</span>
                        <span className="text-slate-900 font-bold">{interaction.drug_b}</span>
                    </div>
                </div>

                <button
                    onClick={handleExplain}
                    className="flex items-center space-x-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />
                    ) : (
                        <>
                            <Sparkles size={14} />
                            <span>{isOpen ? 'Hide Detail' : 'Ask AI'}</span>
                        </>
                    )}
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 bg-slate-50"
                    >
                        <div className="p-5 space-y-3">
                            <div className="flex items-start space-x-3 text-slate-600">
                                <MessageSquare size={16} className="mt-1 text-blue-500 shrink-0" />
                                <div className="text-sm leading-relaxed font-medium">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                                        {mode === 'patient' ? 'Patient Explanation' : 'Clinical Detail'}
                                    </span>
                                    {explanation}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-4 bg-white p-2 border border-slate-100 rounded-lg">
                                <Info size={12} />
                                <span>AI-generated summary based on DDInter 2.0. Always verify with medical literature.</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
