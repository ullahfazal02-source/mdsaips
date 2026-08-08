import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Layers, ShieldCheck, Zap, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

export const Home = () => {
  const triggerNotification = () => {
    toast.success('MDSAIPS Core Gateway System Operational!');
  };

  return (
    <div className="space-y-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-14 border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Major Project Foundation Active</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Multi-Domain Service Aggregation & <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-accent-400 bg-clip-text text-transparent">Intelligent Planning</span> System
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            A production-ready, highly scalable multi-tenant architectural foundation powering multi-domain service discovery, dynamic scheduling, AI planning, and cross-vendor orchestration.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/ai-planner"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-semibold text-sm shadow-glow hover:scale-105 transition-all flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Explore AI Planner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <button
              onClick={triggerNotification}
              className="px-6 py-3.5 rounded-xl glass-card text-slate-200 hover:text-white font-semibold text-sm hover:bg-slate-800 transition-all border border-slate-700"
            >
              Test Notification System
            </button>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Multi-Domain Aggregation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Scalable architecture supporting venue, catering, logistics, entertainment, and custom service providers in a single unified system.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-400">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Intelligent AI Planning</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automated itinerary generation, budget constraint optimization, and schedule conflict resolution powered by AI models.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Enterprise Security</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Winston logging pipelines, Helmet security headers, rate limiting, and Redux Persist state management foundation.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
