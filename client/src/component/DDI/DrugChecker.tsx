"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useDDI } from '@/src/hooks/useDDI';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Pill, X, AlertTriangle, ShieldCheck, Mic, MicOff, Loader2, Save, Activity } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { InteractionCard } from './InteractionCard';

interface Drug {
    id: string;
    name: string;
}

interface DrugCheckerProps {
    mode?: 'patient' | 'clinician';
}

export const DrugChecker: React.FC<DrugCheckerProps> = ({ mode = 'patient' }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Drug[]>([]);
    const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
    const [interactions, setInteractions] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [searching, setSearching] = useState(false);
    const [patientContext, setPatientContext] = useState({
        age: 30,
        hasKidneyIssues: false,
        consumesAlcohol: false
    });
    const { user } = useAuth();
    const { searchDrugs, checkInteractions, saveMedication, loading } = useDDI();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        const handler = setTimeout(async () => {
            // Remove typical NL filler words and split by separators
            const cleanQuery = query.replace(/["']|and|or/gi, ',').split(',').map(s => s.trim()).filter(s => s.length >= 2);
            const activeInput = cleanQuery[cleanQuery.length - 1] || '';

            if (activeInput.length >= 2) {
                setSearching(true);
                const drugs = await searchDrugs(activeInput);
                setResults(drugs);
                setSearching(false);
            } else {
                setResults([]);
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [query, searchDrugs]);

    useEffect(() => {
        if (selectedDrugs.length >= 2) {
            const ids = selectedDrugs.map(d => d.id);
            const context = {
                age: patientContext.age,
                conditions: patientContext.hasKidneyIssues ? ["CKD"] : [],
                lifestyle: { alcohol: patientContext.consumesAlcohol ? "moderate" : "none" }
            };
            checkInteractions(ids, user?.id, context).then((res: any) => {
                if (res) {
                    setInteractions(res.interactions);
                    setSummary(res.summary);
                }
            });
        } else {
            setInteractions([]);
            setSummary(null);
        }
    }, [selectedDrugs, checkInteractions, user?.id, patientContext]);

    const addDrug = (drug: Drug) => {
        if (!selectedDrugs.find(d => d.id === drug.id)) {
            setSelectedDrugs([...selectedDrugs, drug]);
        }
        // Don't clear query if it's a list, just move to next part
        const parts = query.split(/and|or|,/gi);
        if (parts.length > 1) {
            setQuery(parts.slice(0, -1).join(', ') + ', ');
        } else {
            setQuery('');
        }
        setResults([]);
    };

    const removeDrug = (id: string) => {
        setSelectedDrugs(selectedDrugs.filter(d => d.id !== id));
    };

    const startVoiceSearch = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error("Speech Error:", event.error);
            setIsListening(false);
        };
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuery(transcript);
        };

        recognition.start();
    };

    const handleSaveAll = async () => {
        if (!user) {
            alert("Please login to save your medications.");
            return;
        }
        for (const drug of selectedDrugs) {
            if (user?.id) await saveMedication(user.id, drug.id, drug.name);
        }
        alert("Medications saved to your profile!");
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
            {/* Search Bar */}
            <div className="relative" ref={dropdownRef}>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input
                        type="text"
                        className="w-full pl-12 pr-12 py-5 bg-white border border-slate-200 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-slate-800 font-bold placeholder:text-slate-400 placeholder:font-normal shadow-sm"
                        placeholder="Search meds or type a list (e.g. Warfarin, Aspirin)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter' && results.length > 0) {
                                addDrug(results[0]);
                            }
                        }}
                    />
                    <button
                        onClick={startVoiceSearch}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                    >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                </div>

                {/* Integrated Clinical Toggles */}
                <div className="mt-3 flex flex-wrap items-center gap-2 pl-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                        <Activity size={12} className="text-slate-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Patient Factors</span>
                    </div>

                    <button
                        onClick={() => setPatientContext(prev => ({ ...prev, age: prev.age > 65 ? 30 : 70 }))}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-2 border ${patientContext.age > 65 ? 'bg-amber-100 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${patientContext.age > 65 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-slate-200'}`} />
                        Age {'>'} 65
                    </button>

                    <button
                        onClick={() => setPatientContext(prev => ({ ...prev, hasKidneyIssues: !prev.hasKidneyIssues }))}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-2 border ${patientContext.hasKidneyIssues ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${patientContext.hasKidneyIssues ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-slate-200'}`} />
                        Kidney Risk
                    </button>

                    <button
                        onClick={() => setPatientContext(prev => ({ ...prev, consumesAlcohol: !prev.consumesAlcohol }))}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-2 border ${patientContext.consumesAlcohol ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${patientContext.consumesAlcohol ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-200'}`} />
                        Alcohol Use
                    </button>
                </div>

                <AnimatePresence>
                    {(results.length > 0 || searching || (query.length >= 2 && results.length === 0 && !searching)) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute w-full mt-2 bg-white border border-slate-200 rounded-2xl overflow-hidden z-[100] shadow-2xl min-h-[50px]"
                        >
                            {searching ? (
                                <div className="p-4 flex items-center justify-center text-slate-400 space-x-2">
                                    <Loader2 className="animate-spin" size={16} />
                                    <span className="text-sm font-medium">Analyzing database...</span>
                                </div>
                            ) : results.length > 0 ? (
                                results.map((drug) => (
                                    <button
                                        key={drug.id}
                                        onClick={() => addDrug(drug)}
                                        className="w-full px-4 py-3 text-left hover:bg-amber-50 text-slate-700 hover:text-amber-700 transition-colors flex items-center justify-between group"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                                                <Pill size={16} className="text-amber-600" />
                                            </div>
                                            <span className="font-bold">{drug.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-amber-500">Add Medication</span>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center">
                                    <p className="text-sm font-bold text-slate-400">No medications found matching "{query}"</p>
                                    <p className="text-[10px] text-slate-300 uppercase mt-1">Try a different spelling or single brand name</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Selected Drugs */}
            <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                    {selectedDrugs.map((drug) => (
                        <motion.span
                            key={drug.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold shadow-sm"
                        >
                            <Pill size={14} className="text-blue-500" />
                            <span>{drug.name}</span>
                            <button
                                onClick={() => removeDrug(drug.id)}
                                className="ml-1 text-slate-300 hover:text-red-500 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </motion.span>
                    ))}
                </AnimatePresence>
            </div>

            {/* Results Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Risk Score Card */}
                <div className="col-span-1 bg-slate-50 border border-slate-200 p-8 rounded-[32px] flex flex-col items-center justify-center space-y-6 shadow-sm">
                    <div className="relative w-36 h-36">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="72" cy="72" r="64"
                                className="stroke-slate-200 fill-none"
                                strokeWidth="12"
                            />
                            <motion.circle
                                cx="72" cy="72" r="64"
                                className={`fill-none transition-all duration-1000 ${summary?.score > 50 ? 'stroke-red-500' : summary?.score > 20 ? 'stroke-yellow-500' : 'stroke-emerald-500'
                                    }`}
                                strokeWidth="12"
                                strokeDasharray={402}
                                initial={{ strokeDashoffset: 402 }}
                                animate={{ strokeDashoffset: 402 - (402 * (summary?.score || 0)) / 100 }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-slate-900">{summary?.score || 0}</span>
                            <span className="text-[10px] uppercase font-black tracking-tighter text-slate-400">Total Risk Index</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className={`font-black uppercase tracking-tighter text-sm ${summary?.score > 50 ? 'text-red-600' : summary?.score > 20 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {summary?.score > 50 ? 'Critical Risk' : summary?.score > 20 ? 'Moderate Risk' : 'Low Risk'}
                        </h3>
                    </div>
                </div>

                {/* Risk Breakdown Section (Analytical YAML Style) */}
                <div className="col-span-1 bg-[#0F172A] text-slate-100 p-8 rounded-[32px] space-y-6 shadow-2xl border border-slate-800 scale-[1.02] z-10 font-mono">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                            <Activity className="text-pink-400" size={18} />
                        </div>
                        <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Clinical Reasoning</h3>
                    </div>

                    <div className="space-y-3 text-[11px] leading-relaxed">
                        <div className="flex justify-between items-center text-slate-400 group">
                            <span className="group-hover:text-slate-200 transition-colors">Drug Interaction Risk:</span>
                            <span className="font-bold text-pink-400">{summary?.breakdown?.drug_interaction_risk || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 group">
                            <span className="group-hover:text-slate-200 transition-colors">Age Risk Factor:</span>
                            <span className="font-bold text-amber-400">+{summary?.breakdown?.age_risk || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 group">
                            <span className="group-hover:text-slate-200 transition-colors">Kidney Risk Factor:</span>
                            <span className="font-bold text-blue-400">+{summary?.breakdown?.kidney_risk || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 group">
                            <span className="group-hover:text-slate-200 transition-colors">Alcohol Risk Factor:</span>
                            <span className="font-bold text-emerald-400">+{summary?.breakdown?.alcohol_risk || 0}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-700/50 flex justify-between items-center text-white text-sm">
                            <span className="font-bold uppercase tracking-widest text-[9px] text-slate-500">Net Total Index:</span>
                            <span className="font-black text-lg text-white">{summary?.breakdown?.total || 0}</span>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-tight mb-2">Internal Logic Trace:</p>
                        <div className="flex gap-1.5">
                            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${summary?.breakdown?.drug_interaction_risk ? 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.4)]' : 'bg-slate-700'}`} />
                            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${summary?.breakdown?.age_risk ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-slate-700'}`} />
                            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${summary?.breakdown?.kidney_risk ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-slate-700'}`} />
                            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${summary?.breakdown?.alcohol_risk ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-700'}`} />
                        </div>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="col-span-1 bg-slate-50 border border-slate-200 p-8 rounded-[32px] space-y-6 flex flex-col shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${summary?.score > 20 ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                            {summary?.score > 20 ? <AlertTriangle className="text-amber-600" size={18} /> : <ShieldCheck className="text-emerald-600" size={18} />}
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">Security Policy</h3>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed font-bold italic">
                        "{summary?.summary || "Add at least two medications to generate a safety assessment."}"
                    </p>

                    <button
                        onClick={handleSaveAll}
                        className="mt-auto w-full py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center gap-2 group"
                    >
                        <Save size={14} className="group-hover:scale-110 transition-transform" />
                        Save to Prescriptions
                    </button>
                </div>

                {/* Interactions Detail Full Width */}
                {interactions.length > 0 && (
                    <div className="col-span-1 md:col-span-3 pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                Clinical Interaction Matrix ({interactions.length})
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {interactions.map((inter, i) => (
                                <InteractionCard key={i} interaction={inter} mode={mode} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
