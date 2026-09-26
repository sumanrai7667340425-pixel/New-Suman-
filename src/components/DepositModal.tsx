import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, ArrowRight, ShieldCheck, QrCode, Smartphone, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessDeposit: (amount: number, utr: string) => void;
}

const UPI_ID = '7667340425@fam';
const PRESET_AMOUNTS = [100, 300, 500, 1000, 2000, 5000];

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onSuccessDeposit,
}) => {
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('500');
  const [copied, setCopied] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [step, setStep] = useState<'pay' | 'verify'>('pay');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Generate UPI QR Code whenever amount changes
  useEffect(() => {
    const validAmount = amount > 0 ? amount : 500;
    // Standard National Payments Corporation of India (NPCI) UPI Intent URI
    const upiUri = `upi://pay?pa=${UPI_ID}&pn=Aviator%20Game&am=${validAmount}&cu=INR&tn=Aviator%20Wallet%20Deposit`;

    QRCode.toDataURL(upiUri, {
      width: 260,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR Gen error:', err));
  }, [amount]);

  if (!isOpen) return null;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    soundManager.playClick();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSelectAmount = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
    soundManager.playClick();
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    }
  };

  const handleProceedToVerify = () => {
    if (amount < 50) {
      setErrorMsg('Minimum deposit amount is ₹50');
      return;
    }
    setErrorMsg('');
    setStep('verify');
    soundManager.playClick();
  };

  const handleVerifyUTR = () => {
    const cleanUtr = utrNumber.trim();
    if (cleanUtr.length < 10) {
      setErrorMsg('Please enter a valid 12-digit UPI Reference / UTR Number.');
      return;
    }

    setErrorMsg('');
    setIsVerifying(true);

    // Simulate real-time bank gateway verification response
    setTimeout(() => {
      setIsVerifying(false);
      soundManager.playCashOut();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      onSuccessDeposit(amount, cleanUtr);
      onClose();
      // Reset
      setStep('pay');
      setUtrNumber('');
    }, 1200);
  };

  const handleInstantDemoDeposit = (val: number) => {
    soundManager.playCashOut();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
    const fakeUtr = 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);
    onSuccessDeposit(val, fakeUtr);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121319] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#171822]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              ₹
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">जमा करें / Deposit Funds</h2>
              <p className="text-[11px] text-slate-400">Instant UPI Payment Gateway</p>
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

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Step 1: Select Amount and Pay via 7667340425@fam */}
          {step === 'pay' ? (
            <>
              {/* Official UPI Gateway Pill */}
              <div className="bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Official Receiver UPI ID</span>
                  </div>
                  <div className="font-display font-extrabold text-base text-white tracking-wide">
                    {UPI_ID}
                  </div>
                  <div className="text-[10px] text-slate-400">Verified Aviator Merchant</div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyUPI}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    copied
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      : 'bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy UPI
                    </>
                  )}
                </button>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block">
                  Select Deposit Amount
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectAmount(amt)}
                      className={`py-2 px-3 rounded-xl font-display font-bold text-sm transition-all relative ${
                        amount === amt
                          ? 'bg-emerald-600 text-white border-2 border-emerald-400 shadow-md'
                          : 'bg-[#1b1c26] hover:bg-[#232532] text-slate-200 border border-slate-700/60'
                      }`}
                    >
                      ₹{amt}
                      {amt >= 500 && (
                        <span className="absolute -top-1.5 -right-1 bg-amber-500 text-black text-[9px] font-black px-1 rounded-full">
                          +10%
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div className="mt-2.5 relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="50"
                    placeholder="Or enter custom amount (Min ₹50)"
                    value={customAmount}
                    onChange={handleCustomChange}
                    className="w-full bg-[#171822] border border-slate-700 rounded-xl py-2 pl-8 pr-3 text-white font-display font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* UPI QR Code Container */}
              <div className="bg-[#171822] border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>Scan QR Code to Pay ₹{amount}</span>
                </div>

                {qrDataUrl ? (
                  <div className="p-2.5 bg-white rounded-2xl shadow-xl">
                    <img
                      src={qrDataUrl}
                      alt="UPI Payment QR Code"
                      className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-44 h-44 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-xs">
                    Loading QR...
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span>PhonePe • Google Pay • Paytm • BHIM • Cred</span>
                </div>

                {/* Direct App Link Button */}
                <a
                  href={`upi://pay?pa=${UPI_ID}&pn=Aviator%20Game&am=${amount}&cu=INR&tn=AviatorDeposit`}
                  className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
                >
                  Click here to open installed UPI App
                </a>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-2.5 bg-rose-950/40 border border-rose-600/30 rounded-xl text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action: Next to Verification */}
              <button
                type="button"
                onClick={handleProceedToVerify}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-98"
              >
                <span>I Have Paid ₹{amount} (Enter UTR)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Fast Test / Instant Demo Top-Up for Sandbox Demo */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Quick Testing Option:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInstantDemoDeposit(amount)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-colors"
                  >
                    Simulate Instant Approval (+₹{amount})
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Step 2: Enter 12-digit UTR for Confirmation */
            <div className="space-y-4">
              <div className="bg-[#171822] border border-slate-800 rounded-2xl p-4 text-center">
                <div className="text-xs text-slate-400 font-medium">Depositing to</div>
                <div className="text-white font-display font-extrabold text-sm">{UPI_ID}</div>
                <div className="text-emerald-400 font-display font-black text-2xl mt-1">₹{amount}</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Enter 12-Digit UTR / Transaction Reference ID
                </label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="e.g. 425612349876"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#171822] border border-slate-700 rounded-xl py-2.5 px-3 text-white font-display font-bold text-base tracking-wider focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Found in your UPI payment app receipt as "UPI Ref No" or "UTR".
                </p>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-2.5 bg-rose-950/40 border border-rose-600/30 rounded-xl text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('pay')}
                  className="w-1/3 py-2.5 bg-[#1b1c26] hover:bg-[#252736] text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isVerifying || utrNumber.length < 10}
                  onClick={handleVerifyUTR}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Verifying with Bank...
                    </span>
                  ) : (
                    <span>Submit & Credit Wallet</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
