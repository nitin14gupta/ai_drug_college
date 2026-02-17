"use client";

import React, { useRef, useState, ReactNode } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
  useMotionValue,
  useAnimationFrame,
  AnimatePresence,
  MotionValue
} from 'framer-motion';
import { wrap } from 'framer-motion';
import {
  ShieldAlert,
  ScanLine,
  Mic,
  Zap,
  ArrowUpRight,
  Menu,
  X,
  Layers,
  HeartPulse,
  Info,
  CheckCircle2,
  Lock,
  Search
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 
 * UTILITY: Tailwind Class Merger 
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * COMPONENT: Modern Glass Navbar
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center backdrop-blur-2xl bg-white/40 border border-white/40 rounded-3xl px-8 py-4 shadow-[0_8px_32px_0_rgba(251,191,36,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ShieldAlert className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-slate-900 tracking-tighter text-2xl">PharmaGuard<span className="text-amber-600">.ai</span></span>
        </div>

        <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-700">
          <a href="#safety" className="hover:text-amber-600 transition-colors">Safety Layer</a>
          <a href="#clinical" className="hover:text-amber-600 transition-colors">Clinician Portal</a>
          <a href="#api" className="hover:text-amber-600 transition-colors">API Docs</a>
          <div className="flex items-center gap-4 border-l border-slate-200 pl-10">
            <a href="/Login" className="text-slate-600 hover:text-amber-600 transition-colors">Sign In</a>
            <a href="/Register" className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10">
              Get Started
            </a>
          </div>
        </div>

        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
};

/**
 * COMPONENT: Velocity Scrolling Marquee
 */
interface VelocityTextProps {
  children: string;
  baseVelocity: number;
}

const VelocityText = ({ children, baseVelocity = 5 }: VelocityTextProps) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  /**
   * This is a magic number for how much it should jump per frame,
   * it's been derived by manual testing and feel.
   */
  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    /**
     * This is what causes the velocity of the scroll to affect the speed of the marquee
     */
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  const skew = useTransform(smoothVelocity, [-1000, 1000], [-10, 10]);

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap py-12 bg-amber-50/50 border-y border-amber-100">
      <motion.div style={{ x, skew }} className="flex gap-12 text-[7vw] font-black uppercase tracking-tighter text-amber-900/10">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="flex gap-12">
            {children} <span className="text-amber-500/20">•</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

/**
 * COMPONENT: Hero Section with Parallax
 */
const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center pt-32 px-6 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[10%] left-[15%] w-72 h-72 bg-amber-200/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[15%] w-96 h-96 bg-orange-100/40 rounded-full blur-[120px]" />
      </div>

      <motion.div style={{ y, opacity }} className="text-center max-w-5xl">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-[110px] font-black text-slate-900 tracking-tight leading-[0.85] mb-12"
        >
          Safety for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700">
            Polypharmacy.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
        >
          An AI safety copilot that deciphers prescriptions and flags dangerous drug, food, and disease interactions in real-time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center"
        >
          <button className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-bold text-lg flex items-center gap-3 hover:bg-amber-600 transition-all group shadow-2xl shadow-amber-900/20">
            Analyze Prescription <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
          <button className="bg-white/80 backdrop-blur-xl border border-slate-200 text-slate-900 px-10 py-5 rounded-[24px] font-bold text-lg hover:border-amber-300 transition-all shadow-lg shadow-slate-200/50">
            Explore API Docs
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

/**
 * COMPONENT: Feature Cards
 */
interface FeatureProps {
  icon: ReactNode;
  title: string;
  desc: string;
}

const FeatureCard = ({ icon, title, desc }: FeatureProps) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    className="p-10 rounded-[40px] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(251,191,36,0.1)] transition-all flex flex-col items-start text-left"
  >
    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-8">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
  </motion.div>
);

/**
 * COMPONENT: Persona Switcher (The Interactive Logic)
 */
const PersonaSwitcher = () => {
  const [mode, setMode] = useState<'patient' | 'clinician'>('patient');

  return (
    <section id="clinical" className="py-32 px-6 bg-slate-50/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">One Intelligence. Two Perspectives.</h2>
          <div className="inline-flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-inner">
            <button
              onClick={() => setMode('patient')}
              className={cn(
                "px-8 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-wider",
                mode === 'patient' ? "bg-amber-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-800"
              )}
            >
              Patient Mode
            </button>
            <button
              onClick={() => setMode('clinician')}
              className={cn(
                "px-8 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-wider",
                mode === 'clinician' ? "bg-amber-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-800"
              )}
            >
              Clinician Mode
            </button>
          </div>
        </div>

        <div className="relative min-h-[500px] w-full max-w-5xl mx-auto backdrop-blur-3xl bg-white/70 border border-white/50 rounded-[48px] p-8 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
          <AnimatePresence mode="wait">
            {mode === 'patient' ? (
              <motion.div
                key="patient"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid md:grid-cols-2 gap-16 items-center"
              >
                <div>
                  <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block border border-red-100">
                    High Risk Interaction
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
                    "Do not take Warfarin with <span className="text-amber-600">Grapefruit</span>."
                  </h3>
                  <p className="text-slate-600 text-lg mb-8 leading-relaxed font-medium">
                    Grapefruit juice blocks the enzymes that break down your medicine. This causes the drug to build up in your body, which can lead to dangerous bleeding.
                  </p>
                  <ul className="space-y-4">
                    {['Avoid all citrus juices during this cycle', 'Contact doctor if bruising appears', 'Safe alternatives: Orange, Apple juice'].map((t) => (
                      <li key={t} className="flex items-center gap-3 font-semibold text-slate-700">
                        <CheckCircle2 className="text-amber-500 w-5 h-5" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-8 rounded-[32px] shadow-2xl border border-amber-100 flex flex-col gap-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <span className="font-bold text-slate-400">Medication Scan</span>
                    <Search className="text-slate-300" size={20} />
                  </div>
                  <div className="space-y-4">
                    <div className="p-5 bg-slate-50 rounded-2xl flex justify-between items-center group cursor-pointer hover:bg-white hover:shadow-md transition-all">
                      <span className="font-bold text-slate-800">Warfarin Sodium</span>
                      <span className="text-slate-400 text-sm">5mg Tablet</span>
                    </div>
                    <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex justify-between items-center animate-pulse">
                      <span className="font-bold text-red-900 italic">Grapefruit Juice</span>
                      <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded-md font-black uppercase tracking-tighter">Warning</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="clinician"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid md:grid-cols-2 gap-16 items-center"
              >
                <div>
                  <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block border border-blue-100">
                    Mechanism of Action
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
                    CYP3A4 Inhibition Detail
                  </h3>
                  <p className="text-slate-600 text-lg mb-8 leading-relaxed font-medium">
                    Interaction mediated by intestinal furanocoumarin-induced inhibition of CYP3A4. Resulting AUC increase for S-Warfarin may elevate INR significantly.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-mono">DDInter ID: 4022</div>
                    <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-xs font-mono font-bold">Severity: Major</div>
                  </div>
                </div>
                <div className="bg-slate-950 p-8 rounded-[32px] shadow-2xl text-amber-500 font-mono text-xs leading-relaxed overflow-hidden relative">
                  <div className="absolute top-4 right-6 text-slate-700">clinical_api_v2</div>
                  <pre className="text-slate-300">
                    {`{
  "drug_a": "Warfarin",
  "drug_b": "Grapefruit",
  "mechanism": "CYP3A4 Inhibition",
  "clinical_management": "Avoid co-administration.
   Switch to Apixaban if appropriate.",
  "evidence_base": "Grade A (Systematic)",
  "lab_monitor": ["PT/INR", "LFT"],
  "probability_score": 0.982
}`}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

/**
 * MAIN PAGE COMPONENT
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-amber-200">
      <Navbar />

      <main>
        <Hero />

        <VelocityText baseVelocity={-5}>Clinical Safety • Real-time Monitoring • DDInter 2.0 • Data Integrity</VelocityText>

        <section id="safety" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<ScanLine />}
                title="Prescription OCR"
                desc="Industrial-grade vision models extract chemical names, dosages, and prescribing doctors from mobile photos."
              />
              <FeatureCard
                icon={<Mic />}
                title="Contextual Voice"
                desc="Describe your lifestyle. Our AI understands that 'a couple of beers' or 'my daily multivitamin' creates risk."
              />
              <FeatureCard
                icon={<Layers />}
                title="Evidence-Based"
                desc="Powered by the DDInter 2.0 database, providing mechanistically detailed explanations for 2,000+ compounds."
              />
            </div>
          </div>
        </section>

        <PersonaSwitcher />

        {/* Value Prop Section */}
        <section className="py-32 px-6 bg-slate-900 text-white rounded-[60px] mx-4 my-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-black mb-10 leading-tight">Beyond "Drug-Drug" Checkers.</h2>
              <div className="space-y-10">
                {[
                  {
                    t: "Drug-Food Interactions",
                    d: "Detects risks with dairy, citrus, and leafy greens often missed by standard clinical alerts.",
                    icon: <Zap className="text-amber-500" />
                  },
                  {
                    t: "Drug-Disease Mapping",
                    d: "Flags meds that exacerbate pre-existing conditions like COPD, CKD, or hypertension.",
                    icon: <HeartPulse className="text-amber-500" />
                  },
                  {
                    t: "Developer Friendly API",
                    d: "Integrate our intelligence layer into any EHR or health app with simple REST endpoints.",
                    icon: <Lock className="text-amber-500" />
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="mt-1">{item.icon}</div>
                    <div>
                      <h4 className="text-2xl font-bold mb-2">{item.t}</h4>
                      <p className="text-slate-400 text-lg leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-amber-500/20 rounded-[40px] blur-2xl group-hover:bg-amber-500/30 transition-all" />
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000"
                alt="Clinical Safety"
                className="rounded-[40px] shadow-2xl relative z-10 border border-white/10"
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-amber-500 to-orange-600 p-16 md:p-24 rounded-[60px] shadow-2xl shadow-amber-500/30 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">Ready to secure the prescription chain?</h2>
            <p className="text-amber-50 text-xl md:text-2xl mb-12 font-medium">Join 50k+ patients and clinicians making polypharmacy safer.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-orange-600 px-12 py-6 rounded-[24px] font-black text-xl hover:scale-105 transition-transform shadow-xl">
                Get Started Free
              </button>
              <button className="bg-orange-700 text-white border-2 border-orange-400 px-12 py-6 rounded-[24px] font-black text-xl hover:bg-orange-800 transition-colors">
                Contact Enterprise
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="text-amber-600 w-6 h-6" />
              <span className="font-black text-xl tracking-tighter">PharmaGuard.ai</span>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed">
              Open-access AI safety copilot built for the future of clinical pharmacy.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16 text-sm">
            <div className="space-y-4">
              <p className="font-black uppercase tracking-widest text-slate-900">Product</p>
              <div className="flex flex-col gap-2 text-slate-500 font-semibold">
                <a href="#" className="hover:text-amber-600">Patient App</a>
                <a href="#" className="hover:text-amber-600">Clinician Portal</a>
                <a href="#" className="hover:text-amber-600">API Access</a>
              </div>
            </div>
            <div className="space-y-4">
              <p className="font-black uppercase tracking-widest text-slate-900">Safety</p>
              <div className="flex flex-col gap-2 text-slate-500 font-semibold">
                <a href="#" className="hover:text-amber-600">DDInter 2.0</a>
                <a href="#" className="hover:text-amber-600">Methodology</a>
                <a href="#" className="hover:text-amber-600">Clinical Board</a>
              </div>
            </div>
            <div className="space-y-4">
              <p className="font-black uppercase tracking-widest text-slate-900">Legal</p>
              <div className="flex flex-col gap-2 text-slate-500 font-semibold">
                <a href="#" className="hover:text-amber-600">Privacy Policy</a>
                <a href="#" className="hover:text-amber-600">Terms of Use</a>
                <a href="#" className="hover:text-amber-600">HIPAA Compliance</a>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-50 text-slate-400 text-xs text-center font-medium">
          &copy; {new Date().getFullYear()} PharmaGuard AI. All data sourced from DDInter 2.0 open database. Not a substitute for professional medical advice.
        </div>
      </footer>
    </div>
  );
}