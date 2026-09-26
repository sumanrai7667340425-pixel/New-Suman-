export type GameStatus = 'WAITING' | 'FLYING' | 'CRASHED';

export interface BetConfig {
  id: 'panel1' | 'panel2';
  amount: number;
  autoBet: boolean;
  autoCashOut: boolean;
  autoCashOutMultiplier: number;
  isPlaced: boolean; // Placed for current or next round
  queuedForNextRound: boolean;
  hasCashedOut: boolean;
  cashOutMultiplier: number | null;
  winAmount: number | null;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'REJECTED';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  timestamp: number;
  description: string;
  utr?: string;
  upiId?: string;
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    holderName: string;
  };
}

export interface PlayerBet {
  id: string;
  username: string;
  avatar: string;
  betAmount: number;
  cashOutMultiplier: number | null;
  winAmount: number | null;
  hasCashedOut: boolean;
  targetMultiplier: number; // Simulated target for other players
}

export interface RoundHistory {
  id: string;
  multiplier: number;
  timestamp: number;
}

export interface WalletState {
  balance: number;
  bonus: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalWon: number;
}
