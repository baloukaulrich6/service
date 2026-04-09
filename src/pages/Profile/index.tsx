import { Sun, Moon, Download, Trash2, User } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { exportToCSV } from '../../services/portfolioService';
import type { Country, RiskTolerance, InvestmentHorizon, InvestmentGoal } from '../../types/user';
import type { Sector } from '../../types/market';
import toast from 'react-hot-toast';

const COUNTRIES: Country[] = ['Cameroun', "Côte d'Ivoire", 'Sénégal', 'Gabon', 'Other'];
const SECTORS: Sector[] = ['Telecommunications', 'Banking & Finance', 'Oil & Gas', 'Agriculture & Food', 'Industry', 'Water & Energy'];

export default function Profile() {
  const { profile, preferences, theme, riskProfileScore, updateProfile, updatePreferences, setTheme } = useUserStore();
  const { transactions, resetPortfolio } = usePortfolioStore();

  const handleExport = () => {
    const csv = exportToCSV(transactions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'portefeuille.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm('Réinitialiser toutes les données du portefeuille ?')) {
      resetPortfolio();
      toast.success('Portefeuille réinitialisé');
    }
  };

  const toggleSector = (sector: Sector) => {
    const current = preferences.sectors as Sector[];
    const next = current.includes(sector) ? current.filter((s) => s !== sector) : [...current, sector];
    updatePreferences({ sectors: next });
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-primary">Profil</h1>
        <p className="text-muted text-sm mt-1">Gérez vos préférences d'investissement</p>
      </div>

      {/* Personal Info */}
      <Card>
        <h2 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
          <User size={16} className="text-emerald-500" /> Informations personnelles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Nom</label>
            <input
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm outline-none focus:border-emerald-500"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => updateProfile({ email: e.target.value })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm outline-none focus:border-emerald-500"
              placeholder="email@exemple.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Pays</label>
            <select
              value={profile.country}
              onChange={(e) => {
                const country = e.target.value as Country;
                updateProfile({ country, preferredMarket: country === 'Cameroun' || country === 'Gabon' ? 'BVMAC' : country === 'Other' ? 'BOTH' : 'BRVM' });
              }}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm outline-none"
            >
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Marché prioritaire</label>
            <select
              value={profile.preferredMarket}
              onChange={(e) => updateProfile({ preferredMarket: e.target.value as typeof profile.preferredMarket })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm outline-none"
            >
              <option value="BVMAC">BVMAC (Afrique Centrale)</option>
              <option value="BRVM">BRVM (Afrique de l'Ouest)</option>
              <option value="BOTH">Les deux marchés</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Investment Preferences */}
      <Card>
        <h2 className="text-base font-semibold text-primary mb-4">Préférences d'investissement</h2>
        {riskProfileScore !== null && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400">
            Score de risque calculé : {riskProfileScore}/100
          </div>
        )}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Tolérance au risque</label>
              <div className="flex gap-2">
                {([['conservative', 'Conservateur'], ['moderate', 'Modéré'], ['aggressive', 'Agressif']] as [RiskTolerance, string][]).map(([k, l]) => (
                  <button key={k} onClick={() => updatePreferences({ riskTolerance: k })}
                    className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${preferences.riskTolerance === k ? 'bg-emerald-500 text-white' : 'bg-elevated text-secondary'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Horizon</label>
              <select value={preferences.investmentHorizon} onChange={(e) => updatePreferences({ investmentHorizon: e.target.value as InvestmentHorizon })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm outline-none">
                <option value="3months">3 mois</option>
                <option value="1year">1 an</option>
                <option value="3years">3 ans</option>
                <option value="5years+">5 ans et plus</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Budget mensuel (XAF)</label>
              <input type="number" value={preferences.monthlyBudget} onChange={(e) => updatePreferences({ monthlyBudget: Number(e.target.value) })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Objectif</label>
              <select value={preferences.investmentGoal} onChange={(e) => updatePreferences({ investmentGoal: e.target.value as InvestmentGoal })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm outline-none">
                <option value="income">Revenus réguliers</option>
                <option value="growth">Croissance du capital</option>
                <option value="balanced">Équilibré</option>
                <option value="capital_preservation">Préservation du capital</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Secteurs d'intérêt</label>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map((sector) => (
                <button key={sector} onClick={() => toggleSector(sector)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${(preferences.sectors as Sector[]).includes(sector) ? 'bg-emerald-500 text-white' : 'bg-elevated text-secondary hover:bg-elevated/80'}`}>
                  {sector}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <h2 className="text-base font-semibold text-primary mb-4">Apparence</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => setTheme('light')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'light' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-elevated text-secondary'}`}>
            <Sun size={16} /> Clair
          </button>
          <button onClick={() => setTheme('dark')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-elevated text-primary border border-border' : 'bg-elevated text-secondary'}`}>
            <Moon size={16} /> Sombre
          </button>
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <h2 className="text-base font-semibold text-primary mb-4">Gestion des données</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleExport}>
            <Download size={16} /> Exporter le portefeuille (CSV)
          </Button>
          <Button variant="danger" onClick={handleReset}>
            <Trash2 size={16} /> Réinitialiser le portefeuille
          </Button>
        </div>
        <p className="text-xs text-muted mt-3">Les données sont stockées localement dans votre navigateur. Aucune donnée n'est envoyée à un serveur.</p>
      </Card>
    </div>
  );
}
