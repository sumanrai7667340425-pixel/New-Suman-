import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Trophy, History, ShieldCheck, Wallet } from 'lucide-react';
import { Transaction, WalletState } from '../types';

interface WalletHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  transactions: Transaction[];
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export const WalletHistoryModal: React.FC<WalletHistoryModalProps> = ({
  isOpen,
  onClose,
  wallet,
  transactions,
  onOpenDeposit,
  onOpenWithdraw,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'GAME'>('ALL');

  if (!isOpen) return null;

  const filteredList = transactions.filter((tx) => {
    if (filter === 'ALL') return true;
    if (filter === 'DEPOSIT') return tx.type === 'DEPOSIT';
    if (filter === 'WITHDRAWAL') return tx.type === 'WITHDRAWAL';
    if (filter === 'GAME') return tx.type === 'BET' || tx.type === 'WIN';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121319] border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#171822]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Wallet & Passbook</h2>
              <p className="text-[11px] text-slate-400">Transaction history and balance breakdown</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-[#171822] p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Balance</span>
              <span className="text-lg font-black text-white font-display">₹{wallet.balance.toFixed(2)}</span>
            </div>
            <div className="bg-[#171822] p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-emerald-400 block font-semibold uppercase">Deposited</span>
              <span className="text-lg font-black text-emerald-400 font-display">₹{wallet.totalDeposited.toFixed(2)}</span>
            </div>
            <div className="bg-[#171822] p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-rose-400 block font-semibold uppercase">Withdrawn</span>
              <span className="text-lg font-black text-rose-400 font-display">₹{wallet.totalWithdrawn.toFixed(2)}</span>
            </div>
            <div className="bg-[#171822] p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-amber-400 block font-semibold uppercase">Won</span>
              <span className="text-lg font-black text-amber-400 font-display">₹{wallet.totalWon.toFixed(2)}</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDeposit();
              }}
              className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Deposit via UPI (7667340425@fam)
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenWithdraw();
              }}
              className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <ArrowUpRight className="w-4 h-4" />
              Withdraw Funds (निकासी)
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'DEPOSIT', label: 'Deposits (जमा)' },
              { id: 'WITHDRAWAL', label: 'Withdrawals (निकासी)' },
              { id: 'GAME', label: 'Game Bets & Wins' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as typeof filter)}
                className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                  filter === tab.id
                    ? 'bg-[#272935] text-white shadow-sm'
                    : 'bg-[#15161f] text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ledger List */}
          <div className="space-y-2">
            {filteredList.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No transactions found under this category.
              </div>
            ) : (
              filteredList.map((tx) => {
                const isPositive = tx.type === 'DEPOSIT' || tx.type === 'WIN';
                const formattedTime = new Date(tx.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div
                    key={tx.id}
                    className="bg-[#171822] border border-slate-800/80 rounded-xl p-3 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          tx.type === 'DEPOSIT'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : tx.type === 'WITHDRAWAL'
                            ? 'bg-rose-500/15 text-rose-400'
                            : tx.type === 'WIN'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-slate-700/30 text-slate-300'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' && <ArrowDownLeft className="w-4 h-4" />}
                        {tx.type === 'WITHDRAWAL' && <ArrowUpRight className="w-4 h-4" />}
                        {tx.type === 'WIN' && <Trophy className="w-4 h-4" />}
                        {tx.type === 'BET' && <span className="text-xs font-bold">✈</span>}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{tx.description}</span>
                          {tx.status === 'COMPLETED' && (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{formattedTime}</span>
                          {tx.utr && <span>• UTR: {tx.utr}</span>}
                          {tx.upiId && <span>• UPI: {tx.upiId}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-display font-black text-sm ${
                          isPositive ? 'text-emerald-400' : 'text-slate-300'
                        }`}
                      >
                        {isPositive ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </span>
                      <span
                        className={`block text-[9px] font-bold uppercase tracking-wider ${
                          tx.status === 'COMPLETED'
                            ? 'text-emerald-400'
                            : tx.status === 'PENDING'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
