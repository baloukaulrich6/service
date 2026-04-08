import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AlertRule, TriggeredAlert } from '../types/alerts';

interface AlertState {
  rules: AlertRule[];
  history: TriggeredAlert[];
  addRule: (rule: Omit<AlertRule, 'id' | 'createdAt'>) => void;
  toggleRule: (id: string) => void;
  deleteRule: (id: string) => void;
  addTriggered: (alert: Omit<TriggeredAlert, 'id'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearHistory: () => void;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set) => ({
      rules: [],
      history: [],

      addRule: (rule) =>
        set((state) => ({
          rules: [
            { ...rule, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
            ...state.rules,
          ],
        })),

      toggleRule: (id) =>
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)),
        })),

      deleteRule: (id) =>
        set((state) => ({ rules: state.rules.filter((r) => r.id !== id) })),

      addTriggered: (alert) =>
        set((state) => ({
          history: [{ ...alert, id: crypto.randomUUID() }, ...state.history].slice(0, 200),
        })),

      markRead: (id) =>
        set((state) => ({
          history: state.history.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
        })),

      markAllRead: () =>
        set((state) => ({ history: state.history.map((a) => ({ ...a, isRead: true })) })),

      clearHistory: () => set({ history: [] }),
    }),
    { name: 'afrimarket-alerts' }
  )
);
