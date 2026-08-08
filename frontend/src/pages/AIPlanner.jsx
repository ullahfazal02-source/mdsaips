import React from 'react';
import { Bot, Sparkles, Cpu, Sliders, Calendar, DollarSign, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AIPlanner = () => {
  const handleGeneratePlan = (e) => {
    e.preventDefault();
    toast.success('AI Recommendation Engine query structure ready. Logic will connect in Phase 2.');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-400">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Intelligent Multi-Domain Planner</h1>
          <p className="text-xs text-slate-400">Automated multi-vendor itinerary generation based on constraints</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Parameters Form */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-accent-400" />
            <span>Planner Parameters</span>
          </h2>

          <form onSubmit={handleGeneratePlan} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Target Budget ($)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="number"
                  placeholder="5000"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-accent-500"
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Event Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-accent-500"
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Domains Required</label>
              <div className="space-y-2 pt-1 text-xs text-slate-300">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked disabled className="rounded border-slate-700 bg-slate-900" />
                  <span>Venue & Hall Allocation</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked disabled className="rounded border-slate-700 bg-slate-900" />
                  <span>Catering & Food Service</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked disabled className="rounded border-slate-700 bg-slate-900" />
                  <span>Transport & Logistics</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-600 via-brand-600 to-accent-600 text-white font-semibold text-sm shadow-glow hover:opacity-95 transition-opacity flex items-center justify-center space-x-2"
            >
              <Wand2 className="w-4 h-4" />
              <span>Generate AI Plan</span>
            </button>
          </form>
        </div>

        {/* AI Output Visualization Area */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-400">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white">AI Optimization Pipeline Ready</h3>
          <p className="text-xs text-slate-400 max-w-md">
            The constraint satisfaction algorithm, multi-domain itinerary generator, and real-time vendor matching modules will render optimal plans here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIPlanner;
