import { useEffect, useState } from 'react';
import { Megaphone, TrendingUp, Newspaper, DollarSign, Calendar } from 'lucide-react';
import { fetchAnnouncements } from '../../services/realDataService';
import { Card } from '../../components/ui/Card';
import { getExchangeBg } from '../../utils/colorScale';
import type { Announcement } from '../../types/market';

const TYPE_CONFIG: Record<Announcement['type'], { label: string; icon: React.ElementType; color: string }> = {
  ipo: { label: 'Introduction', icon: TrendingUp, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  news: { label: 'Actualité', icon: Newspaper, color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  dividend: { label: 'Dividende', icon: DollarSign, color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  delisting: { label: 'Retrait', icon: Megaphone, color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
};

type TabType = 'all' | 'ipo' | 'news' | 'dividend';

export default function Announcements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [tab, setTab] = useState<TabType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const filtered = tab === 'all' ? items : items.filter((a) => a.type === tab);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'ipo', label: 'Introductions' },
    { key: 'news', label: 'Actualités' },
    { key: 'dividend', label: 'Dividendes' },
  ];

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Megaphone size={22} className="text-emerald-500" /> Annonces de marché
        </h1>
        <p className="text-muted text-sm mt-1">Introductions en bourse, dividendes et actualités BVMAC & BRVM</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-elevated rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-secondary'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <Megaphone size={32} className="mx-auto mb-3 opacity-40" />
          <p>Aucune annonce dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const cfg = TYPE_CONFIG[item.type];
            const Icon = cfg.icon;
            return (
              <Card key={item.id}>
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 p-2 rounded-lg border ${cfg.color} shrink-0`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {item.exchange && (
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${getExchangeBg(item.exchange)}`}>
                          {item.exchange}
                        </span>
                      )}
                      {item.symbol && (
                        <span className="text-xs text-muted font-mono">{item.symbol}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-primary leading-snug mb-1">{item.title}</h3>
                    {item.body && (
                      <p className="text-xs text-muted leading-relaxed line-clamp-3">{item.body}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        Publié le {new Date(item.publishedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      {item.expectedDate && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Calendar size={11} />
                          Date prévue : {new Date(item.expectedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
