import React, { useState } from 'react';
import { Minus, Plus, Zap, Check } from 'lucide-react';
import { BetConfig, GameStatus } from '../types';

interface BettingPanelProps {
  panelId: 'panel1' | 'panel2';
  title?: string;
  config: BetConfig;
  status: GameStatus;
  currentMultiplier: number;
  walletBalance: number;
  onUpdateConfig: (newConfig: Partial<BetConfig>) => void;
  onPlaceBet: (amount: number) => void;
  onCancelBet: () => void;
  onCashOut: () => void;
}

export const BettingPanel: React.FC<BettingPanelProps> = ({
  panelId,
  config,
  status,
  currentMultiplier,
  walletBalance,
  onUpdateConfig,
  onPlaceBet,
  onCancelBet,
  onCashOut,
}) => {
  const [activeTab, setActiveTab] = useState<'bet' | 'auto'>('bet');

  const presets = [10, 50, 100, 500, 1000];

  const handleAdjustAmount = (delta: number) => {
    if (config.isPlaced) return;
    const next = Math.max(5, Math.round((config.amount + delta) * 100) / 100);
    onUpdateConfig({ amount: next });
  };

  const handleSetAmount = (val: number) => {
    if (config.isPlaced) return;
    onUpdateConfig({ amount: val });
  };

  const isFlying = status === 'FLYING';
  const isWaiting = status === 'WAITING';

  // Live cashout calculation
  const potentialWin = Math.floor(config.amount * currentMultiplier * 100) / 100;

  return (
    <div
      id={`betting-${panelId}`}
      className="bg-[#14151b] border border-slate-800/80 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-lg relative overflow-hidden"
    >
      {/* Top Controls: Bet / Auto Tab switcher */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center bg-[#0d0e12] p-1 rounded-xl border border-white/5 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('bet')}
            className={`px-5 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'bet'
                ? 'bg-[#272935] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bet
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('auto')}
            className={`px-5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'auto'
                ? 'bg-[#272935] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            Auto
          </button>
        </div>

        {/* Panel indicator tag */}
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {panelId === 'panel1' ? 'Panel 1' : 'Panel 2'}
        </span>
      </div>

      {/* Main Grid: Left amount controls, Right big action button */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Left: Amount input and quick select buttons (col-span-7) */}
        <div className="sm:col-span-7 flex flex-col gap-2">
          {/* Amount Stepper */}
          <div className="flex items-center bg-[#0c0d12] rounded-xl border border-slate-800/90 p-1.5 justify-between">
            <button
              type="button"
              disabled={config.isPlaced || config.amount <= 5}
              onClick={() => handleAdjustAmount(-5)}
              className="w-9 h-9 rounded-lg bg-[#1f212a] hover:bg-[#2c2f3d] disabled:opacity-40 text-white flex items-center justify-center transition-colors active:scale-95"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center flex-1 px-2">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Amount (₹)</span>
              <input
                type="number"
                disabled={config.isPlaced}
                value={config.amount}
                min={5}
                step={5}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  onUpdateConfig({ amount: Math.max(0, val) });
                }}
                className="w-full bg-transparent text-center text-lg sm:text-xl font-extrabold text-white font-display focus:outline-none"
              />
            </div>

            <button
              type="button"
              disabled={config.isPlaced}
              onClick={() => handleAdjustAmount(5)}
              className="w-9 h-9 rounded-lg bg-[#1f212a] hover:bg-[#2c2f3d] disabled:opacity-40 text-white flex items-center justify-center transition-colors active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="grid grid-cols-5 gap-1.5">
            {presets.map((amt) => (
              <button
                key={amt}
                type="button"
                disabled={config.isPlaced}
                onClick={() => handleSetAmount(amt)}
                className={`py-1 rounded-lg text-xs font-bold transition-all ${
                  config.amount === amt
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-[#1b1d25] hover:bg-[#242732] text-slate-300 border border-white/5'
                } disabled:opacity-40`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          {/* Auto Options Drawer (visible if Auto tab active) */}
          {activeTab === 'auto' && (
            <div className="bg-[#0c0d12] rounded-xl p-2.5 border border-amber-500/20 flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Auto Bet</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoBet}
                    onChange={(e) => onUpdateConfig({ autoBet: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                <span className="text-slate-300 font-medium">Auto Cash Out</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="1.1"
                    value={config.autoCashOutMultiplier}
                    onChange={(e) =>
                      onUpdateConfig({
                        autoCashOutMultiplier: Math.max(1.1, parseFloat(e.target.value) || 1.1),
                      })
                    }
                    className="w-16 bg-[#1b1d25] border border-slate-700 rounded px-2 py-0.5 text-center font-display font-bold text-amber-400 text-xs focus:outline-none"
                  />
                  <span className="text-slate-400 font-bold">x</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoCashOut}
                      onChange={(e) => onUpdateConfig({ autoCashOut: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Big Action Button (col-span-5) */}
        <div className="sm:col-span-5 h-full flex flex-col justify-center">
          {/* Case 1: Currently In Flight & Bet Placed & Not Yet Cashed Out -> CASH OUT BUTTON */}
          {isFlying && config.isPlaced && !config.hasCashedOut && (
            <button
              type="button"
              onClick={onCashOut}
              className="w-full min-h-[88px] sm:h-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-98 text-white rounded-2xl font-black flex flex-col items-center justify-center p-3 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all animate-pulse"
            >
              <span className="text-xs sm:text-sm uppercase tracking-wider font-extrabold text-amber-100">
                CASH OUT
              </span>
              <span className="text-xl sm:text-2xl font-display font-extrabold mt-0.5">
                ₹{potentialWin.toFixed(2)}
              </span>
              <span className="text-[11px] font-semibold text-amber-200">
                at {currentMultiplier.toFixed(2)}x
              </span>
            </button>
          )}

          {/* Case 2: Currently In Flight & Has Cashed Out -> Cashed Out Badge */}
          {isFlying && config.isPlaced && config.hasCashedOut && (
            <div className="w-full min-h-[88px] sm:h-full bg-emerald-950/70 border-2 border-emerald-500/70 text-emerald-300 rounded-2xl flex flex-col items-center justify-center p-3">
              <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Check className="w-4 h-4" /> Won
              </span>
              <span className="text-xl sm:text-2xl font-display font-extrabold text-white">
                ₹{config.winAmount?.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">
                @{config.cashOutMultiplier?.toFixed(2)}x
              </span>
            </div>
          )}

          {/* Case 3: Waiting State & Bet Placed -> Cancel Bet Option */}
          {isWaiting && config.isPlaced && (
            <button
              type="button"
              onClick={onCancelBet}
              className="w-full min-h-[88px] sm:h-full bg-rose-600/90 hover:bg-rose-500 text-white rounded-2xl font-bold flex flex-col items-center justify-center p-3 transition-all active:scale-98 border border-rose-400/40 shadow-lg"
            >
              <span className="text-xs uppercase tracking-wider font-semibold text-rose-200">
                Bet Placed
              </span>
              <span className="text-xl font-display font-extrabold my-0.5">CANCEL</span>
              <span className="text-xs text-rose-200">₹{config.amount.toFixed(2)} INR</span>
            </button>
          )}

          {/* Case 4: Not placed or Round active but bet queued for next round */}
          {(!config.isPlaced || (isFlying && config.queuedForNextRound)) && (
            <button
              type="button"
              onClick={() => onPlaceBet(config.amount)}
              disabled={walletBalance < config.amount}
              className={`w-full min-h-[88px] sm:h-full rounded-2xl font-extrabold flex flex-col items-center justify-center p-3 transition-all active:scale-98 shadow-lg ${
                config.queuedForNextRound
                  ? 'bg-amber-600 text-white border border-amber-400'
                  : walletBalance < config.amount
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-[#28a745] hover:bg-[#23923d] text-white border border-emerald-400/40 shadow-[0_4px_16px_rgba(40,167,69,0.4)]'
              }`}
            >
              <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
                {config.queuedForNextRound
                  ? 'Queued for Next'
                  : isFlying
                  ? 'Bet for Next Round'
                  : 'Bet'}
              </span>
              <span className="text-xl sm:text-2xl font-display font-extrabold my-0.5">
                {config.amount.toFixed(2)} INR
              </span>
              {walletBalance < config.amount && (
                <span className="text-[10px] text-rose-400 font-bold">Insufficient Balance</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
