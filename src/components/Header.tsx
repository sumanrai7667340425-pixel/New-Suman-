import React, { useState } from 'react';
import { Plus, Volume2, VolumeX, History, ArrowUpRight, HelpCircle, Shield, Menu } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  balance: number;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  balance,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenHistory,
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  const toggleSound = () => {
    const nextState = soundManager.toggleSound();
    setSoundOn(nextState);
  };

  return (
    <>
      <header className="bg-[#0e0f14] border-b border-slate-800/80 sticky top-0 z-40 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-rose-500 drop-shadow-[0_2px_10px_rgba(244,63,94,0.4)]">
                Aviator
              </span>
              <span className="hidden md:inline-block text-[9px] bg-red-600/30 text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-500/30 uppercase">
                SPRIBE
              </span>
            </div>
          </div>

          {/* Right: Wallet Balance & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Withdraw Button */}
            <button
              type="button"
              onClick={onOpenWithdraw}
              className="hidden sm:flex items-center gap-1 bg-[#1b1c26] hover:bg-[#252736] text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/5 text-xs font-bold transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
              <span>निकासी (Withdraw)</span>
            </button>

            {/* Wallet Pill (As shown in screenshot) */}
            <div className="flex items-center bg-[#151722] border border-slate-700/80 rounded-full p-1 pl-2 gap-2 shadow-inner">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-xs shadow-sm">
                  ₹
                </span>
                <span className="font-display font-extrabold text-sm sm:text-base text-white tracking-wide">
                  {balance.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase hidden sm:inline">
                  INR
                </span>
              </div>

              {/* Deposit "+" Button */}
              <button
                type="button"
                onClick={onOpenDeposit}
                title="Deposit via UPI 7667340425@fam"
                className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black flex items-center justify-center font-black shadow-md transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* History / Passbook icon */}
            <button
              type="button"
              onClick={onOpenHistory}
              title="Passbook & Transactions"
              className="w-8 h-8 rounded-xl bg-[#1b1c26] hover:bg-[#252736] text-slate-300 hover:text-white flex items-center justify-center border border-white/5 transition-colors"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              title={soundOn ? 'Sound On' : 'Mute Sound'}
              className="w-8 h-8 rounded-xl bg-[#1b1c26] hover:bg-[#252736] text-slate-300 hover:text-white flex items-center justify-center border border-white/5 transition-colors"
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* How to Play Help */}
            <button
              type="button"
              onClick={() => setShowHowToPlay(true)}
              title="Game Rules"
              className="w-8 h-8 rounded-xl bg-[#1b1c26] hover:bg-[#252736] text-slate-300 hover:text-white flex items-center justify-center border border-white/5 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121319] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span className="text-red-500 font-black italic">Aviator</span> Rules & Help
              </h3>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-[#171822] rounded-xl border border-white/5">
                <span className="font-bold text-emerald-400 block mb-1">1. Place Your Bet</span>
                Set your bet amount (min ₹5) on either Panel 1 or Panel 2 before the countdown ends.
              </div>
              <div className="p-3 bg-[#171822] rounded-xl border border-white/5">
                <span className="font-bold text-amber-400 block mb-1">2. Plane Takes Off</span>
                The red airplane flies upward and the multiplier increases from 1.00x upwards.
              </div>
              <div className="p-3 bg-[#171822] rounded-xl border border-white/5">
                <span className="font-bold text-rose-400 block mb-1">3. Cash Out Before Crash</span>
                Press "Cash Out" before the plane flies away! If you cash out at 3.00x with a ₹100 bet, you win ₹300!
              </div>
              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/20 text-emerald-300">
                <span className="font-bold block mb-1">UPI Payments & Wallet</span>
                Deposit instantly using UPI ID <code className="bg-black/40 px-1 py-0.5 rounded text-white font-mono">7667340425@fam</code>. Withdrawals are processed 24/7 directly to your UPI ID or Bank account.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
