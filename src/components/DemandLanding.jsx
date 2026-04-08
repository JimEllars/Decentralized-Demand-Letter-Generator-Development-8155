import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Terminal, ShieldCheck, Database, Map,
  ChevronDown, FileText, Briefcase, Home,
  DollarSign, Gavel, FileWarning, AlertTriangle, XOctagon
} from 'lucide-react';

const TerminalLine = ({ text, delay }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <div className="font-mono text-xs text-axim-teal leading-relaxed h-5">
      {displayedText}
    </div>
  );
};

const DemandLanding = () => {
  const [faqOpen, setFaqOpen] = useState(null);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const useCases = [
    { title: 'Personal Injury', icon: <FileWarning size={20} className="text-axim-teal" /> },
    { title: 'Breach of Contract', icon: <Briefcase size={20} className="text-axim-purple" /> },
    { title: 'Property Damage', icon: <Home size={20} className="text-axim-gold" /> },
    { title: 'Debt Collection', icon: <DollarSign size={20} className="text-axim-teal" /> },
    { title: 'Landlord/Tenant', icon: <Map size={20} className="text-axim-purple" /> },
    { title: 'Small Claims', icon: <Gavel size={20} className="text-axim-gold" /> },
    { title: 'Insurance Claims', icon: <AlertTriangle size={20} className="text-axim-teal" /> },
    { title: 'Cease & Desist', icon: <XOctagon size={20} className="text-axim-purple" /> },
  ];

  const faqs = [
    {
      question: "Is my data used for training?",
      answer: "Absolute Zero Retention. We use a Zero-Knowledge Architecture. All data resides securely in your browser and is destroyed upon session close. We don't possess your data, so it cannot be used for training or exposure."
    },
    {
      question: "Will it work in my state?",
      answer: "Yes. The AXiM engine cross-references procedural formatting bounds to generate structurally compliant letters across all 50 U.S. states and jurisdictions."
    },
    {
      question: "Are there hidden subscriptions?",
      answer: "No. Flat $4.00 per final rendered draft. We removed human operational overhead and pass the compute savings directly to you. No recurring fees, retainers, or hidden charges."
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-inter selection:bg-axim-gold selection:text-black overflow-x-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-32 px-4 flex flex-col items-center justify-center text-center min-h-[90vh]">
        {/* Background Grid & Radial Gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0 mask-radial-gradient"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-axim-gold/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2 bg-axim-gold/10 border border-axim-gold/20 rounded-full font-mono text-xs text-axim-gold mb-8 uppercase tracking-wider"
          >
            <div className="w-2 h-2 bg-axim-gold rounded-full animate-pulse shadow-[0_0_8px_rgba(255,234,0,0.8)]"></div>
            Systems Operational // Build 2026.4
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 uppercase"
          >
            Stop Drafting. <br/>
            <span className="text-axim-gold drop-shadow-[0_0_15px_rgba(255,234,0,0.3)]">Start Settling.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed"
          >
            Get quick, professional Demand Letters in 12 minutes. No hourly fees. No 7-day waits. Our system does the work for <strong className="text-white">$4.00 per draft.</strong>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center w-full sm:w-auto"
          >
            <Link
              to="/app/demand-generator"
              className="w-full sm:w-auto px-10 py-5 bg-axim-gold text-black font-bold uppercase tracking-[2px] text-sm hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 rounded-sm flex items-center justify-center gap-3 group"
            >
              START MY DEMAND LETTER
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <div className="mt-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              No Login Required <span className="w-1 h-1 bg-zinc-600 rounded-full"></span> Instant PDF Export
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Social Proof & Compliance Strip */}
      <section className="border-y border-white/5 bg-black/50 overflow-hidden relative z-10 py-4">
        <div className="flex gap-12 items-center justify-center animate-scroll whitespace-nowrap opacity-80 font-mono text-xs uppercase tracking-widest text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-axim-gold">★★★★★</span> Trusted by 2,500+ professionals
          </div>
          <span className="text-zinc-700">•</span>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-axim-teal" /> 256-Bit AES Encryption
          </div>
          <span className="text-zinc-700">•</span>
          <div className="flex items-center gap-2">
            <Database size={14} className="text-axim-purple" /> Zero Data Retention
          </div>
          <span className="text-zinc-700">•</span>
          <div className="flex items-center gap-2">
            <Map size={14} className="text-axim-gold" /> 50-State Jurisdictional Formatting
          </div>
          {/* Duplicate for infinite scroll effect if needed */}
        </div>
      </section>

      {/* 3. Operational Sequence */}
      <section className="py-24 px-4 relative z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-center mb-20">Operational Sequence</h2>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-axim-teal/30 to-transparent -translate-y-1/2 z-0"></div>

            {/* Steps */}
            {[
              { num: '01', title: 'Upload Evidence', desc: 'Drop records directly into the encrypted, zero-retention vault.' },
              { num: '02', title: 'AI Fact Extraction', desc: 'AXiM Intelligence maps data nodes and verifies chronological damages.' },
              { num: '03', title: 'State Formatting', desc: 'Automatically cross-references local jurisdictional requirements.' },
              { num: '04', title: 'Instant Download', desc: 'Receive a strictly formatted PDF ready for final deployment.' }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 bg-[#0A0A0A] border border-white/10 p-8 rounded-xl text-center shadow-xl group hover:border-white/20 transition-colors">
                <div className="absolute top-2 right-4 text-[80px] font-black font-mono text-white/[0.03] select-none pointer-events-none group-hover:text-white/[0.05] transition-colors">{step.num}</div>
                <div className="w-12 h-12 bg-black border border-white/10 rounded-full flex items-center justify-center font-mono text-axim-teal text-lg font-bold mx-auto mb-6 relative shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-bold mb-3 uppercase tracking-wide">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. The Arbitrage Matrix */}
      <section className="py-24 px-4 bg-white/[0.01] border-y border-white/5 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-4">Competitor Arbitrage</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Why $4.00? We removed human operational overhead and pass raw compute savings directly to you.</p>
          </div>

          <div className="overflow-x-auto pb-4">
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 font-mono text-xs text-zinc-500 uppercase tracking-widest">
                  <th className="py-4 px-6">Metric</th>
                  <th className="py-4 px-6 text-zinc-600">Legacy Drafters</th>
                  <th className="py-4 px-6 text-axim-gold bg-axim-gold/5 rounded-t-lg">AXiM Platform</th>
                </tr>
              </thead>
              <tbody className="text-sm font-inter">
                <tr className="border-b border-white/5 transition-colors hover:bg-white/5">
                  <td className="py-5 px-6 font-medium text-zinc-300">Cost</td>
                  <td className="py-5 px-6 text-zinc-600 font-mono">$300 - $850</td>
                  <td className="py-5 px-6 font-mono font-bold text-white bg-axim-gold/5">$4.00 FLAT</td>
                </tr>
                <tr className="border-b border-white/5 transition-colors hover:bg-white/5">
                  <td className="py-5 px-6 font-medium text-zinc-300">Velocity</td>
                  <td className="py-5 px-6 text-zinc-600">5-7 Business Days</td>
                  <td className="py-5 px-6 font-bold text-white bg-axim-gold/5">12 Minutes</td>
                </tr>
                <tr className="transition-colors hover:bg-white/5">
                  <td className="py-5 px-6 font-medium text-zinc-300">Security</td>
                  <td className="py-5 px-6 text-zinc-600">Unregulated PII Exposure</td>
                  <td className="py-5 px-6 font-bold text-axim-teal bg-axim-gold/5 flex items-center gap-2 rounded-b-lg">
                    <ShieldCheck size={16} /> Closed-Loop
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Supported Contexts */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-center mb-16">Supported Demands</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map((useCase, idx) => (
              <Link
                to="/app/demand-generator"
                key={idx}
                className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-lg flex flex-col items-center justify-center text-center gap-4 transition-all duration-300 hover:bg-white/10 hover:border-axim-gold/50 group"
              >
                <div className="p-3 bg-black/50 rounded-full border border-white/5 group-hover:scale-110 transition-transform duration-300">
                  {useCase.icon}
                </div>
                <span className="font-semibold text-sm text-zinc-300 group-hover:text-white transition-colors">{useCase.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Interactive App Teaser */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative"
          >
            {/* Terminal Header */}
            <div className="bg-black/80 px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <Terminal size={14} className="text-zinc-500" />
              <span className="font-mono text-xs text-zinc-500">AXiM_Engine_v2.0</span>
              <div className="ml-auto flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
              </div>
            </div>
            {/* Terminal Body */}
            <div className="p-6 relative min-h-[200px] overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-axim-teal/30 shadow-[0_0_10px_rgba(0,229,255,0.5)] animate-scanline z-10 pointer-events-none"></div>

              <TerminalLine text="> AXiM_ENGINE: Secure upload initiated... OK." delay={500} />
              <TerminalLine text="> EXTRACT: Parsing chronological facts & damages... OK." delay={2000} />
              <TerminalLine text="> VALIDATE: Cross-referencing state jurisdiction bounds... OK." delay={4500} />
              <TerminalLine text="> OUTPUT: demand_draft_final.pdf [READY FOR DOWNLOAD]" delay={7500} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="py-24 px-4 bg-white/[0.01] border-t border-white/5 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-center mb-12">Protocol Queries</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`bg-black/40 border border-white/10 rounded-lg overflow-hidden transition-all duration-300 ${faqOpen === idx ? 'border-l-2 border-l-axim-gold' : ''}`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-zinc-200 hover:bg-white/5 transition-colors focus:outline-none"
                >
                  {faq.question}
                  <ChevronDown
                    size={20}
                    className={`text-zinc-500 transition-transform duration-300 ${faqOpen === idx ? 'rotate-180 text-axim-gold' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {faqOpen === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-5 text-zinc-400 text-sm leading-relaxed"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Final Revenue Trigger */}
      <section className="py-32 px-4 relative z-10 flex flex-col items-center justify-center text-center min-h-[60vh] border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-axim-teal/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-10 uppercase text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Deploy Infrastructure <br/>
            <span className="text-zinc-500 text-3xl md:text-5xl mt-2 block">For $4.00</span>
          </h2>

          <Link
            to="/app/demand-generator"
            className="w-full sm:w-auto px-12 py-6 bg-axim-gold text-black font-bold uppercase tracking-[2px] text-sm hover:bg-white hover:shadow-[0_0_40px_rgba(255,234,0,0.5)] transition-all duration-300 rounded-sm flex items-center justify-center gap-3 group mx-auto"
          >
            START MY DEMAND LETTER
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default DemandLanding;