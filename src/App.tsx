import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AviatorCanvas } from './components/AviatorCanvas';
import { BettingPanel } from './components/BettingPanel';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { WalletHistoryModal } from './components/WalletHistoryModal';
import { BetsFeed } from './components/BetsFeed';
import { Header } from './components/Header';
import {
  BetConfig,
  GameStatus,
  PlayerBet,
  RoundHistory,
  Transaction,
  WalletState,
} from './types';
import { soundManager } from './utils/audio';
import confetti from 'canvas-confetti';

// Initial simulated history matching real Aviator screenshot (1.42x, 4.08x, 1.59x, 1.29x, 1.09x, 4.22x, 1.48x...)
const INITIAL_HISTORY: RoundHistory[] = [
  { id: '1', multiplier: 1.48, timestamp: Date.now() - 30000 },
  { id: '2', multiplier: 4.22, timestamp: Date.now() - 60000 },
  { id: '3', multiplier: 1.09, timestamp: Date.now() - 90000 },
  { id: '4', multiplier: 1.29, timestamp: Date.now() - 120000 },
  { id: '5', multiplier: 1.59, timestamp: Date.now() - 150000 },
  { id: '6', multiplier: 4.08, timestamp: Date.now() - 180000 },
  { id: '7', multiplier: 1.42, timestamp: Date.now() - 210000 },
  { id: '8', multiplier: 2.15, timestamp: Date.now() - 240000 },
  { id: '9', multiplier: 10.34, timestamp: Date.now() - 270000 },
  { id: '10', multiplier: 1.88, timestamp: Date.now() - 300000 },
];

// Names for other simulated live players
const SIMULATED_PLAYERS = [
  'ro**91', 'vi**23', 'am**04', 'sk**88', 'ra**17', 'pu**62', 'ak**55', 'su**99',
  'de**33', 'ma**42', 'ku**19', 'an**77', 'pr**12', 'mo**50', 'sh**34', 'vi**08',
  'ne**71', 'ga**29', 'sa**64', 'ha**93', 'ch**15', 'ka**82', 'ba**39', 'dh**57'
];

export default function App() {
  // Wallet State with LocalStorage persistence
  const [wallet, setWallet] = useState<WalletState>(() => {
    try {
      const saved = localStorage.getItem('aviator_wallet');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      balance: 500, // ₹500 initial demo starting balance
      bonus: 50,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalWon: 0,
    };
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('aviator_transactions');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'init-1',
        type: 'DEPOSIT',
        amount: 500,
        status: 'COMPLETED',
        timestamp: Date.now() - 3600000,
        description: 'Welcome Bonus Deposit (7667340425@fam)',
        utr: 'UTR892019482012',
      },
    ];
  });

  // Save wallet to local storage
  useEffect(() => {
    localStorage.setItem('aviator_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('aviator_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Round History
  const [history, setHistory] = useState<RoundHistory[]>(INITIAL_HISTORY);

  // Game Flight Engine State
  const [status, setStatus] = useState<GameStatus>('WAITING');
  const [countdown, setCountdown] = useState<number>(5.0);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [finalMultiplier, setFinalMultiplier] = useState<number>(1.0);
  const crashPointRef = useRef<number>(2.0);
  const flightStartTimeRef = useRef<number>(0);

  // Dual Betting Panels Config
  const [panel1, setPanel1] = useState<BetConfig>({
    id: 'panel1',
    amount: 5,
    autoBet: false,
    autoCashOut: false,
    autoCashOutMultiplier: 2.0,
    isPlaced: false,
    queuedForNextRound: false,
    hasCashedOut: false,
    cashOutMultiplier: null,
    winAmount: null,
  });

  const [panel2, setPanel2] = useState<BetConfig>({
    id: 'panel2',
    amount: 5,
    autoBet: false,
    autoCashOut: false,
    autoCashOutMultiplier: 2.0,
    isPlaced: false,
    queuedForNextRound: false,
    hasCashedOut: false,
    cashOutMultiplier: null,
    winAmount: null,
  });

  // Simulated active players for this round
  const [liveBets, setLiveBets] = useState<PlayerBet[]>([]);

  // Generate a realistic crash multiplier
  const generateCrashMultiplier = useCallback((): number => {
    const rand = Math.random();
    // 4% instant crash between 1.00x and 1.15x
    if (rand < 0.04) {
      return 1.0 + Math.random() * 0.15;
    }
    // 55% between 1.15x and 2.50x
    if (rand < 0.59) {
      return 1.15 + Math.random() * 1.35;
    }
    // 25% between 2.50x and 6.00x
    if (rand < 0.84) {
      return 2.50 + Math.random() * 3.5;
    }
    // 12% between 6.00x and 15.00x
    if (rand < 0.96) {
      return 6.00 + Math.random() * 9.0;
    }
    // 4% high flights (15x - 85x)
    return 15.00 + Math.random() * 70.0;
  }, []);

  // Generate random simulated bets for the current round
  const generateSimulatedBets = useCallback(() => {
    const count = 20 + Math.floor(Math.random() * 15);
    const bets: PlayerBet[] = [];
    const usedUsers = new Set<string>();

    for (let i = 0; i < count; i++) {
      let username = SIMULATED_PLAYERS[Math.floor(Math.random() * SIMULATED_PLAYERS.length)];
      if (usedUsers.has(username)) {
        username = username + Math.floor(Math.random() * 9);
      }
      usedUsers.add(username);

      const betAmt = [10, 20, 50, 100, 200, 500, 1000][Math.floor(Math.random() * 7)];
      const targetMult = 1.1 + Math.random() * (crashPointRef.current * 1.2);

      bets.push({
        id: `sim-${i}-${Date.now()}`,
        username,
        avatar: username.slice(0, 1).toUpperCase(),
        betAmount: betAmt,
        cashOutMultiplier: null,
        winAmount: null,
        hasCashedOut: false,
        targetMultiplier: targetMult,
      });
    }

    setLiveBets(bets);
  }, []);

  // Handle Cashout Action for a panel
  const handleCashOut = useCallback(
    (panelId: 'panel1' | 'panel2') => {
      const isP1 = panelId === 'panel1';
      const targetConfig = isP1 ? panel1 : panel2;

      if (!targetConfig.isPlaced || targetConfig.hasCashedOut || status !== 'FLYING') {
        return;
      }

      const currentMult = multiplier;
      const win = Math.round(targetConfig.amount * currentMult * 100) / 100;

      // Update panel config state
      const updateData: Partial<BetConfig> = {
        hasCashedOut: true,
        cashOutMultiplier: currentMult,
        winAmount: win,
      };

      if (isP1) {
        setPanel1((prev) => ({ ...prev, ...updateData }));
      } else {
        setPanel2((prev) => ({ ...prev, ...updateData }));
      }

      // Update wallet balance
      setWallet((prev) => ({
        ...prev,
        balance: prev.balance + win,
        totalWon: prev.totalWon + (win - targetConfig.amount),
      }));

      // Record transaction
      const newTx: Transaction = {
        id: `win-${Date.now()}-${panelId}`,
        type: 'WIN',
        amount: win,
        status: 'COMPLETED',
        timestamp: Date.now(),
        description: `Aviator Win (${currentMult.toFixed(2)}x on ${isP1 ? 'Panel 1' : 'Panel 2'})`,
      };
      setTransactions((prev) => [newTx, ...prev]);

      // Sound and confetti celebration
      soundManager.playCashOut();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    },
    [panel1, panel2, status, multiplier]
  );

  // Core Game Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (status === 'WAITING') {
      soundManager.stopEngine();
      const interval = 100; // ms
      timer = setInterval(() => {
        setCountdown((prev) => {
          const next = prev - interval / 1000;
          if (Math.abs(Math.round(next) - next) < 0.05) {
            soundManager.playTick();
          }
          if (next <= 0) {
            clearInterval(timer);
            // Prepare Flight
            const crash = generateCrashMultiplier();
            crashPointRef.current = crash;
            flightStartTimeRef.current = Date.now();
            setMultiplier(1.0);
            setStatus('FLYING');
            soundManager.startEngine();
            generateSimulatedBets();

            // Deduct placed bets from wallet
            setPanel1((p1) => {
              if (p1.isPlaced || p1.queuedForNextRound || p1.autoBet) {
                setWallet((w) => ({ ...w, balance: Math.max(0, w.balance - p1.amount) }));
                setTransactions((txs) => [
                  {
                    id: `bet-${Date.now()}-1`,
                    type: 'BET',
                    amount: p1.amount,
                    status: 'COMPLETED',
                    timestamp: Date.now(),
                    description: `Aviator Flight Bet (Panel 1)`,
                  },
                  ...txs,
                ]);
                return {
                  ...p1,
                  isPlaced: true,
                  queuedForNextRound: false,
                  hasCashedOut: false,
                  cashOutMultiplier: null,
                  winAmount: null,
                };
              }
              return { ...p1, isPlaced: false, hasCashedOut: false };
            });

            setPanel2((p2) => {
              if (p2.isPlaced || p2.queuedForNextRound || p2.autoBet) {
                setWallet((w) => ({ ...w, balance: Math.max(0, w.balance - p2.amount) }));
                setTransactions((txs) => [
                  {
                    id: `bet-${Date.now()}-2`,
                    type: 'BET',
                    amount: p2.amount,
                    status: 'COMPLETED',
                    timestamp: Date.now(),
                    description: `Aviator Flight Bet (Panel 2)`,
                  },
                  ...txs,
                ]);
                return {
                  ...p2,
                  isPlaced: true,
                  queuedForNextRound: false,
                  hasCashedOut: false,
                  cashOutMultiplier: null,
                  winAmount: null,
                };
              }
              return { ...p2, isPlaced: false, hasCashedOut: false };
            });

            return 0;
          }
          return next;
        });
      }, interval);

      return () => clearInterval(timer);
    }

    if (status === 'FLYING') {
      const stepInterval = 40; // 25fps calculation for smooth rising
      timer = setInterval(() => {
        const elapsedSec = (Date.now() - flightStartTimeRef.current) / 1000;
        // Exponential flight curve
        const currentM = 1.0 + Math.pow(elapsedSec * 0.42, 1.7);

        soundManager.updateEnginePitch(currentM);

        // Check if crashed
        if (currentM >= crashPointRef.current) {
          const finalM = crashPointRef.current;
          clearInterval(timer);
          setMultiplier(finalM);
          setFinalMultiplier(finalM);
          setStatus('CRASHED');
          soundManager.playCrash();

          // Add to multiplier history
          setHistory((prev) => [
            { id: `round-${Date.now()}`, multiplier: finalM, timestamp: Date.now() },
            ...prev.slice(0, 40),
          ]);

          // Transition to WAITING after 3.2 seconds
          setTimeout(() => {
            setCountdown(5.0);
            setStatus('WAITING');
            setMultiplier(1.0);
          }, 3200);

          return;
        }

        setMultiplier(currentM);

        // Auto Cash Out verification for Panel 1
        if (
          panel1.isPlaced &&
          !panel1.hasCashedOut &&
          panel1.autoCashOut &&
          currentM >= panel1.autoCashOutMultiplier
        ) {
          handleCashOut('panel1');
        }

        // Auto Cash Out verification for Panel 2
        if (
          panel2.isPlaced &&
          !panel2.hasCashedOut &&
          panel2.autoCashOut &&
          currentM >= panel2.autoCashOutMultiplier
        ) {
          handleCashOut('panel2');
        }

        // Update simulated players cashing out
        setLiveBets((prev) =>
          prev.map((player) => {
            if (!player.hasCashedOut && currentM >= player.targetMultiplier) {
              const win = Math.round(player.betAmount * player.targetMultiplier * 100) / 100;
              return {
                ...player,
                hasCashedOut: true,
                cashOutMultiplier: player.targetMultiplier,
                winAmount: win,
              };
            }
            return player;
          })
        );
      }, stepInterval);

      return () => clearInterval(timer);
    }
  }, [status, generateCrashMultiplier, generateSimulatedBets, panel1, panel2, handleCashOut]);

  // Place bet action (handles waiting vs in-flight queueing)
  const handlePlaceBet = (panelId: 'panel1' | 'panel2', amount: number) => {
    soundManager.playClick();

    if (wallet.balance < amount) {
      setIsDepositOpen(true);
      return;
    }

    if (panelId === 'panel1') {
      if (status === 'WAITING') {
        setPanel1((prev) => ({ ...prev, isPlaced: true, queuedForNextRound: false }));
      } else {
        setPanel1((prev) => ({ ...prev, queuedForNextRound: true }));
      }
    } else {
      if (status === 'WAITING') {
        setPanel2((prev) => ({ ...prev, isPlaced: true, queuedForNextRound: false }));
      } else {
        setPanel2((prev) => ({ ...prev, queuedForNextRound: true }));
      }
    }
  };

  const handleCancelBet = (panelId: 'panel1' | 'panel2') => {
    soundManager.playClick();
    if (panelId === 'panel1') {
      setPanel1((prev) => ({ ...prev, isPlaced: false, queuedForNextRound: false }));
    } else {
      setPanel2((prev) => ({ ...prev, isPlaced: false, queuedForNextRound: false }));
    }
  };

  // UPI Deposit Success Handler
  const handleSuccessDeposit = (amount: number, utr: string) => {
    setWallet((prev) => ({
      ...prev,
      balance: prev.balance + amount,
      totalDeposited: prev.totalDeposited + amount,
    }));

    const newTx: Transaction = {
      id: `dep-${Date.now()}`,
      type: 'DEPOSIT',
      amount,
      status: 'COMPLETED',
      timestamp: Date.now(),
      description: 'UPI Deposit to 7667340425@fam',
      utr,
      upiId: '7667340425@fam',
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Withdrawal Success Handler
  const handleSuccessWithdraw = (
    amount: number,
    destination: { upiId?: string; bankDetails?: { accountNumber: string; ifsc: string; holderName: string } }
  ) => {
    setWallet((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - amount),
      totalWithdrawn: prev.totalWithdrawn + amount,
    }));

    const newTx: Transaction = {
      id: `wth-${Date.now()}`,
      type: 'WITHDRAWAL',
      amount,
      status: 'COMPLETED',
      timestamp: Date.now(),
      description: destination.upiId
        ? `UPI Withdrawal to ${destination.upiId}`
        : `Bank Transfer A/C ***${destination.bankDetails?.accountNumber.slice(-4)}`,
      upiId: destination.upiId,
      bankDetails: destination.bankDetails,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar with Wallet Balance, Deposit, Withdraw, Audio */}
      <Header
        balance={wallet.balance}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Game Stage Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 space-y-3">
        {/* Aviator Radar Canvas */}
        <AviatorCanvas
          status={status}
          multiplier={multiplier}
          finalMultiplier={finalMultiplier}
          countdown={countdown}
        />

        {/* Dual Betting Controls (Panel 1 and Panel 2 identical to Aviator screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <BettingPanel
            panelId="panel1"
            config={panel1}
            status={status}
            currentMultiplier={multiplier}
            walletBalance={wallet.balance}
            onUpdateConfig={(newConfig) => setPanel1((prev) => ({ ...prev, ...newConfig }))}
            onPlaceBet={(amt) => handlePlaceBet('panel1', amt)}
            onCancelBet={() => handleCancelBet('panel1')}
            onCashOut={() => handleCashOut('panel1')}
          />

          <BettingPanel
            panelId="panel2"
            config={panel2}
            status={status}
            currentMultiplier={multiplier}
            walletBalance={wallet.balance}
            onUpdateConfig={(newConfig) => setPanel2((prev) => ({ ...prev, ...newConfig }))}
            onPlaceBet={(amt) => handlePlaceBet('panel2', amt)}
            onCancelBet={() => handleCancelBet('panel2')}
            onCashOut={() => handleCashOut('panel2')}
          />
        </div>

        {/* Live Active Player Bets, Past Round History & Leaderboard */}
        <BetsFeed
          currentMultiplier={multiplier}
          isFlying={status === 'FLYING'}
          history={history}
          liveBets={liveBets}
          myTransactions={transactions}
        />
      </main>

      {/* Footer Notice */}
      <footer className="py-3 px-4 text-center border-t border-slate-900 bg-[#07080c] text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Aviator Provably Fair Crash Gaming • 18+ Play Responsibly</span>
          <div className="flex items-center gap-2">
            <span>UPI Gateway: <span className="text-emerald-400 font-mono font-semibold">7667340425@fam</span></span>
            <span>•</span>
            <button
              onClick={() => setIsDepositOpen(true)}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Deposit (जमा)
            </button>
            <span>•</span>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="text-rose-400 hover:underline font-semibold"
            >
              Withdraw (निकासी)
            </button>
          </div>
        </div>
      </footer>

      {/* UPI Deposit Modal (7667340425@fam) */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccessDeposit={handleSuccessDeposit}
      />

      {/* Instant Withdrawal Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        walletBalance={wallet.balance}
        onSuccessWithdraw={handleSuccessWithdraw}
      />

      {/* Transaction & Wallet Passbook Modal */}
      <WalletHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        wallet={wallet}
        transactions={transactions}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
      />
    </div>
  );
}
