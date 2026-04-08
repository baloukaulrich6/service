import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Position, Transaction } from '../types/portfolio';
import { applyBuy, applySell } from '../services/portfolioService';

interface PortfolioState {
  positions: Position[];
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  resetPortfolio: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      positions: [],
      transactions: [],

      addTransaction: (tx) => {
        const fullTx: Transaction = { ...tx, id: crypto.randomUUID() };
        set((state) => {
          const newPositions =
            tx.type === 'BUY'
              ? applyBuy(state.positions, fullTx)
              : applySell(state.positions, fullTx);
          return {
            positions: newPositions,
            transactions: [fullTx, ...state.transactions],
          };
        });
      },

      resetPortfolio: () => set({ positions: [], transactions: [] }),
    }),
    { name: 'afrimarket-portfolio' }
  )
);
