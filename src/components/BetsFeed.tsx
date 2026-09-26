import React, { useState } from 'react';
import { PlayerBet, RoundHistory, Transaction } from '../types';

interface BetsFeedProps {
  currentMultiplier: number;
  isFlying: boolean;
  history: RoundHistory[];
  liveBets: PlayerBet[];
  myTransactions: Transaction[];
}

export const BetsFeed: React.FC<BetsFeedProps> = ({
  currentMultiplier,
  isFlying,
  history,
  liveBets,
  myTransactions,
}) => {
  const [tab, setTab] = useState<'all' | 'my' | 'top'>('all');
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  const getMultiplierColor = (mult: number) => {
    if (mult < 2.0) {
      return 'bg-blue-950/80 text-blue-400 border-blue-800/50';
    } else if (mult < 10.0) {
      return 'bg-purple-950/80 text-purple-400 border-purple-800/50';
    } else {
      return 'bg-rose-950/80 text-rose-400 border-rose-800/50 font-black';
    }
  };

  const totalBetsVolume = liveBets.reduce((acc, curr) => acc + curr.betAmount, 0);

  const myBetsList = myTransactions
    .filter((tx) => tx.type === 'BET' || tx.type === 'WIN')
    .slice(0, 25);

  const topWins = [...liveBets]
    .filter((b) => b.hasCashedOut && b.winAmount)
    .sort((a, b) => (b.winAmount || 0) - (a.winAmount || 0))
    .slice(0, 15);

  return (
    <div className="bg-[#121319] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
      {/* Top Multiplier History Strip (Faithful to screenshot) */}
      <div className="px-3 py-2 bg-[#0c0d12] border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar scroll-smooth flex-1">
          {history.slice(0, 15).map((item) => (
            <span
              key={item.id}
              className={`px-2 py-0.5 rounded-full text-[11px] font-display font-bold border transition-all hover:scale-105 shrink-0 ${getMultiplierColor(
                item.multiplier
              )}`}
            >
              {item.multiplier.toFixed(2)}x
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowHistoryModal(!showHistoryModal)}
          className="px-2 py-0.5 rounded-lg bg-[#1b1c26] text-slate-400 hover:text-white text-xs border border-white/5 transition-colors shrink-0"
          title="Round History"
        >
          •••
        </button>
      </div>

      {/* History popover modal */}
      {showHistoryModal && (
        <div className="p-3 bg-[#171823] border-b border-slate-800 text-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-slate-200">Past Rounds Multiplier Log</span>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="text-slate-400 hover:text-white text-[10px]"
            >
              Close
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {history.map((h) => (
              <span
                key={h.id}
                className={`px-2 py-0.5 rounded-md text-[10px] font-display font-bold border ${getMultiplierColor(
                  h.multiplier
                )}`}
              >
                {h.multiplier.toFixed(2)}x
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table Navigation Header */}
      <div className="px-4 py-2.5 bg-[#171822] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[#0c0d12] p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              tab === 'all'
                ? 'bg-[#272935] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Bets ({liveBets.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('my')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              tab === 'my'
                ? 'bg-[#272935] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Bets
          </button>
          <button
            type="button"
            onClick={() => setTab('top')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              tab === 'top'
                ? 'bg-[#272935] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Top Wins
          </button>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[10px] text-slate-400 block">Total Round Volume</span>
          <span className="text-xs font-display font-bold text-white">₹{totalBetsVolume.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Bets Table Header */}
      <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-[#101117] border-b border-white/5">
        <span className="col-span-5">User</span>
        <span className="col-span-3 text-right">Bet (₹)</span>
        <span className="col-span-2 text-center">Mult</span>
        <span className="col-span-2 text-right">Cash Out</span>
      </div>

      {/* Bets List Content */}
      <div className="max-h-56 sm:max-h-64 overflow-y-auto divide-y divide-white/5">
        {tab === 'all' && (
          <>
            {liveBets.map((player) => {
              const cashed = player.hasCashedOut;
              return (
                <div
                  key={player.id}
                  className={`grid grid-cols-12 px-4 py-2 items-center text-xs transition-colors ${
                    cashed ? 'bg-emerald-950/20' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="col-span-5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] text-slate-300 flex items-center justify-center font-bold">
                      {player.avatar}
                    </span>
                    <span className="font-medium text-slate-300 text-xs truncate">
                      {player.username}
                    </span>
                  </div>

                  <div className="col-span-3 text-right font-display font-semibold text-white">
                    ₹{player.betAmount.toFixed(2)}
                  </div>

                  <div className="col-span-2 text-center">
                    {cashed && player.cashOutMultiplier ? (
                      <span className="px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400 text-[10px] font-display font-bold border border-blue-500/20">
                        {player.cashOutMultiplier.toFixed(2)}x
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[11px]">-</span>
                    )}
                  </div>

                  <div className="col-span-2 text-right font-display font-bold">
                    {cashed && player.winAmount ? (
                      <span className="text-emerald-400">
                        ₹{player.winAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[11px]">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {tab === 'my' && (
          <>
            {myBetsList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No bets placed yet. Use the betting panel above to play!
              </div>
            ) : (
              myBetsList.map((bet) => (
                <div
                  key={bet.id}
                  className="grid grid-cols-12 px-4 py-2.5 items-center text-xs hover:bg-white/[0.02]"
                >
                  <div className="col-span-5 font-semibold text-white">
                    {bet.type === 'WIN' ? '🏆 Won Cash' : '✈ Game Bet'}
                  </div>
                  <div className="col-span-3 text-right font-display font-semibold text-slate-300">
                    ₹{bet.amount.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-center text-[10px] font-semibold text-slate-400">
                    {new Date(bet.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="col-span-2 text-right font-display font-bold">
                    {bet.type === 'WIN' ? (
                      <span className="text-emerald-400">+₹{bet.amount.toFixed(2)}</span>
                    ) : (
                      <span className="text-rose-400">-₹{bet.amount.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {tab === 'top' && (
          <>
            {topWins.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Awaiting top wins this session!
              </div>
            ) : (
              topWins.map((win, idx) => (
                <div
                  key={win.id}
                  className="grid grid-cols-12 px-4 py-2.5 items-center text-xs bg-amber-950/10 hover:bg-amber-950/20"
                >
                  <div className="col-span-5 flex items-center gap-2">
                    <span className="font-black text-amber-400 text-xs">#{idx + 1}</span>
                    <span className="font-semibold text-white">{win.username}</span>
                  </div>
                  <div className="col-span-3 text-right font-display font-semibold text-slate-300">
                    ₹{win.betAmount.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-display font-bold border border-amber-500/30">
                      {win.cashOutMultiplier?.toFixed(2)}x
                    </span>
                  </div>
                  <div className="col-span-2 text-right font-display font-black text-amber-400">
                    ₹{win.winAmount?.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};
