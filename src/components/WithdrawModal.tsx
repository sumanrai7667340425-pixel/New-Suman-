import React, { useState } from 'react';
import { X, ArrowUpRight, Building2, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onSuccessWithdraw: (
    amount: number,
    destination: { upiId?: string; bankDetails?: { accountNumber: string; ifsc: string; holderName: string } }
  ) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  walletBalance,
  onSuccessWithdraw,
}) => {
  const [method, setMethod] = useState<'upi' | 'bank'>('upi');
  const [amount, setAmount] = useState<string>('200');
  const [upiId, setUpiId] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifsc, setIfsc] = useState<string>('');
  const [holderName, setHolderName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  if (!isOpen) return null;

  const minWithdraw = 100;
  const numAmount = parseFloat(amount) || 0;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (numAmount < minWithdraw) {
      setErrorMsg(`Minimum withdrawal amount is ₹${minWithdraw}`);
      return;
    }

    if (numAmount > walletBalance) {
      setErrorMsg(`Insufficient wallet balance. You only have ₹${walletBalance.toFixed(2)}`);
      return;
    }

    if (method === 'upi') {
      const cleanUpi = upiId.trim();
      if (!cleanUpi.includes('@') || cleanUpi.length < 5) {
        setErrorMsg('Please enter a valid recipient UPI ID (e.g., yourname@okhdfcbank)');
        return;
      }

      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        soundManager.playCashOut();
        onSuccessWithdraw(numAmount, { upiId: cleanUpi });
        setSuccessMsg(`Withdrawal of ₹${numAmount} successfully requested to ${cleanUpi}!`);
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
        }, 1500);
      }, 1000);
    } else {
      if (!accountNumber || accountNumber.length < 9) {
        setErrorMsg('Please enter a valid bank account number');
        return;
      }
      if (!ifsc || ifsc.length < 6) {
        setErrorMsg('Please enter a valid 11-character IFSC code');
        return;
      }
      if (!holderName || holderName.trim().length < 2) {
        setErrorMsg('Please enter the account holder name');
        return;
      }

      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        soundManager.playCashOut();
        onSuccessWithdraw(numAmount, {
          bankDetails: {
            accountNumber: accountNumber.trim(),
            ifsc: ifsc.trim().toUpperCase(),
            holderName: holderName.trim(),
          },
        });
        setSuccessMsg(`Withdrawal of ₹${numAmount} successfully requested to A/C ending in ${accountNumber.slice(-4)}!`);
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
        }, 1500);
      }, 1000);
    }
  };

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
    soundManager.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121319] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#171822]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">निकासी / Withdraw Funds</h2>
              <p className="text-[11px] text-slate-400">Direct to Bank Account or UPI</p>
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

        {/* Form Body */}
        <form onSubmit={handleWithdraw} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Wallet Balance Summary Card */}
          <div className="bg-[#171822] border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Available Balance</span>
              <span className="text-2xl font-black text-white font-display">₹{walletBalance.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={() => setAmount(Math.floor(walletBalance).toString())}
              className="text-xs font-bold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-colors"
            >
              Withdraw All
            </button>
          </div>

          {/* Payment Method Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-[#0c0d12] p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => {
                setMethod('upi');
                soundManager.playClick();
              }}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                method === 'upi'
                  ? 'bg-[#272935] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              UPI Instant
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod('bank');
                soundManager.playClick();
              }}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                method === 'bank'
                  ? 'bg-[#272935] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Bank Transfer
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block">
              Withdrawal Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min={minWithdraw}
                max={walletBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min ₹${minWithdraw}`}
                className="w-full bg-[#171822] border border-slate-700 rounded-xl py-2 pl-8 pr-3 text-white font-display font-bold text-lg focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Quick chips */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[200, 500, 1000, 2500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className={`py-1 rounded-lg text-xs font-bold transition-all ${
                    numAmount === amt
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-[#1b1c26] text-slate-300 border border-white/5 hover:bg-[#232532]'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Method Specific Fields */}
          {method === 'upi' ? (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Your UPI ID (VPA)
              </label>
              <input
                type="text"
                placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-[#171822] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs font-medium focus:outline-none focus:border-rose-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Amount will be sent instantly to this UPI address.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-0.5">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  placeholder="Full name as per bank record"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  className="w-full bg-[#171822] border border-slate-700 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-0.5">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  placeholder="11-16 digit account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#171822] border border-slate-700 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-0.5">
                  IFSC Code
                </label>
                <input
                  type="text"
                  maxLength={11}
                  placeholder="e.g. SBIN0001234 or HDFC0000456"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  className="w-full bg-[#171822] border border-slate-700 rounded-xl py-2 px-3 text-white text-xs uppercase font-display focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          {/* Fee & Net Payout Details */}
          <div className="bg-[#0e0f14] rounded-xl p-3 border border-white/5 space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Payout Amount</span>
              <span className="text-white font-semibold">₹{numAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Transfer Fee (0%)</span>
              <span className="text-emerald-400 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-1 font-bold text-white">
              <span>You will receive</span>
              <span className="text-emerald-400 font-display font-extrabold">₹{numAmount.toFixed(2)}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-950/40 border border-rose-600/30 rounded-xl text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing || numAmount <= 0 || numAmount > walletBalance}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-950 transition-all active:scale-98"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing Instant Payout...
              </span>
            ) : (
              <span>Confirm Withdrawal (₹{numAmount.toFixed(2)})</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
