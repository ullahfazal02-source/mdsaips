import React from 'react';
import { Sparkles, Trophy, Star, Gift, TrendingUp, RotateCcw } from 'lucide-react';

/**
 * LoyaltyPointsPanel - Displays customer loyalty tier, points balance, and transaction history
 * Loyalty Rules: 1 point per ₹100 spent | 100 points = ₹50 discount
 */
const LoyaltyPointsPanel = ({ user }) => {
  const loyaltyPoints = user?.loyaltyPoints || { current: 0, earned: 0, redeemed: 0 };
  const loyaltyHistory = user?.loyaltyHistory || [];

  const currentPoints = loyaltyPoints.current || 0;
  const totalEarned = loyaltyPoints.earned || 0;
  const totalRedeemed = loyaltyPoints.redeemed || 0;

  // Tier calculation (client-side display only)
  const getTier = (points) => {
    if (points >= 5000) return { name: 'Platinum', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', icon: '💎' };
    if (points >= 2000) return { name: 'Gold', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: '🥇' };
    if (points >= 500) return { name: 'Silver', color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/30', icon: '🥈' };
    return { name: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: '🥉' };
  };

  const tier = getTier(currentPoints);

  const nextTierPoints = currentPoints >= 5000 ? null
    : currentPoints >= 2000 ? 5000
    : currentPoints >= 500 ? 2000
    : 500;

  const progressPercent = nextTierPoints
    ? Math.min(100, Math.round((currentPoints / nextTierPoints) * 100))
    : 100;

  const cashValue = Math.floor(currentPoints * 0.5); // 100pts = ₹50

  return (
    <div className="space-y-6">
      {/* Tier Card */}
      <div className={`p-6 rounded-3xl border ${tier.border} ${tier.bg} relative overflow-hidden`}>
        <div className="absolute -right-8 -top-8 text-[80px] opacity-10 select-none">{tier.icon}</div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${tier.bg} border ${tier.border} mb-3`}>
                <Trophy className={`w-4 h-4 ${tier.color}`} />
                <span className={`text-xs font-extrabold ${tier.color} uppercase tracking-wide`}>{tier.name} Member</span>
              </div>
              <p className="text-4xl font-black text-white">{currentPoints.toLocaleString('en-IN')}</p>
              <p className="text-sm text-slate-400">Loyalty Points</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Redeemable Value</p>
              <p className="text-2xl font-extrabold text-brand-400">₹{cashValue.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-500">100 pts = ₹50 discount</p>
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTierPoints && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{currentPoints.toLocaleString()} pts</span>
                <span className={tier.color}>{nextTierPoints.toLocaleString()} pts → Next Tier</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    tier.name === 'Bronze' ? 'bg-orange-500' :
                    tier.name === 'Silver' ? 'bg-slate-400' :
                    tier.name === 'Gold' ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {(nextTierPoints - currentPoints).toLocaleString()} more points needed for next tier
              </p>
            </div>
          )}
          {!nextTierPoints && (
            <div className="text-xs text-cyan-400 font-bold flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Maximum Platinum tier reached! You're a VIP customer.</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
          <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto" />
          <p className="text-xl font-extrabold text-white">{totalEarned.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400">Total Earned</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
          <Star className="w-5 h-5 text-brand-400 mx-auto fill-brand-400/20" />
          <p className="text-xl font-extrabold text-white">{currentPoints.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400">Available Now</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
          <Gift className="w-5 h-5 text-purple-400 mx-auto" />
          <p className="text-xl font-extrabold text-white">{totalRedeemed.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400">Redeemed</p>
        </div>
      </div>

      {/* How it works */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>How Loyalty Points Work</span>
        </h4>
        <ul className="space-y-2">
          {[
            { icon: '💰', text: 'Earn 1 point for every ₹100 spent on completed bookings.' },
            { icon: '🎁', text: '100 points = ₹50 discount on your next booking.' },
            { icon: '⚡', text: 'Points are awarded automatically when a service is completed.' },
            { icon: '🏆', text: 'Higher tiers unlock exclusive benefits and priority support.' },
          ].map((item, i) => (
            <li key={i} className="flex items-start space-x-2.5 text-xs text-slate-400">
              <span className="shrink-0 mt-0.5">{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Transaction History */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center space-x-2">
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Points History ({loyaltyHistory.length})</span>
        </h4>
        {loyaltyHistory.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl border border-slate-800 text-center space-y-2">
            <Trophy className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No loyalty transactions yet. Complete a paid booking to start earning!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {loyaltyHistory.slice().reverse().map((tx, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">{tx.description || (tx.type === 'earned' ? 'Points Earned' : 'Points Redeemed')}</p>
                  <p className="text-slate-400">{tx.timestamp ? new Date(tx.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</p>
                </div>
                <span className={`font-extrabold text-sm ${tx.type === 'earned' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tx.type === 'earned' ? '+' : '-'}{tx.points} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltyPointsPanel;
