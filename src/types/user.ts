import type { Exchange, Sector } from './market';

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';
export type InvestmentHorizon = '3months' | '1year' | '3years' | '5years+';
export type InvestmentGoal = 'income' | 'growth' | 'balanced' | 'capital_preservation';
export type Country = 'Cameroun' | "Côte d'Ivoire" | 'Sénégal' | 'Gabon' | 'Other';

export interface UserProfile {
  name: string;
  email: string;
  country: Country;
  preferredCurrency: 'XAF' | 'XOF';
  preferredMarket: Exchange | 'BOTH';
}

export interface InvestmentPreferences {
  riskTolerance: RiskTolerance;
  investmentHorizon: InvestmentHorizon;
  monthlyBudget: number;
  investmentGoal: InvestmentGoal;
  sectors: Sector[];
}
