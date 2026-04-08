import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, InvestmentPreferences } from '../types/user';

interface UserState {
  profile: UserProfile;
  preferences: InvestmentPreferences;
  riskProfileScore: number | null;
  onboardingCompleted: boolean;
  theme: 'dark' | 'light';
  updateProfile: (profile: Partial<UserProfile>) => void;
  updatePreferences: (prefs: Partial<InvestmentPreferences>) => void;
  setRiskProfileScore: (score: number) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  completeOnboarding: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  country: 'Cameroun',
  preferredCurrency: 'XAF',
  preferredMarket: 'BVMAC',
};

const DEFAULT_PREFERENCES: InvestmentPreferences = {
  riskTolerance: 'moderate',
  investmentHorizon: '3years',
  monthlyBudget: 100000,
  investmentGoal: 'growth',
  sectors: [],
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      preferences: DEFAULT_PREFERENCES,
      riskProfileScore: null,
      onboardingCompleted: false,
      theme: 'dark',

      updateProfile: (profile) =>
        set((state) => ({ profile: { ...state.profile, ...profile } })),

      updatePreferences: (prefs) =>
        set((state) => ({ preferences: { ...state.preferences, ...prefs } })),

      setRiskProfileScore: (score) => set({ riskProfileScore: score }),

      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      completeOnboarding: () => set({ onboardingCompleted: true }),
    }),
    { name: 'afrimarket-user' }
  )
);
