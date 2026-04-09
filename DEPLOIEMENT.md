# AfriMarket – Guide de Déploiement

Plateforme d'analyse des marchés boursiers africains (BVMAC & BRVM).

---

## Sommaire

1. [Prérequis](#1-prérequis)
2. [Déploiement sur GitHub Pages](#2-déploiement-sur-github-pages)
3. [Configuration Supabase (données réelles)](#3-configuration-supabase-données-réelles)
4. [Pipeline de données quotidien](#4-pipeline-de-données-quotidien)
5. [Développement local](#5-développement-local)
6. [Variables d'environnement](#6-variables-denvironnement)
7. [Architecture](#7-architecture)

---

## 1. Prérequis

| Outil | Version minimale |
|---|---|
| Node.js | 20.x |
| npm | 10.x |
| Compte GitHub | — |
| Compte Supabase (optionnel) | — |
| Clé API EODHD (optionnel) | — |

> **Sans Supabase**, l'application fonctionne entièrement avec des données simulées (modèle GBM). Supabase n'est nécessaire que pour les données de marché réelles.

---

## 2. Déploiement sur GitHub Pages

### 2.1 Activer GitHub Pages

1. Aller dans **Settings → Pages** du dépôt
2. Source : **GitHub Actions**
3. Sauvegarder

### 2.2 Configurer les variables de build (si Supabase utilisé)

Dans **Settings → Secrets and variables → Actions → Variables** (pas Secrets), ajouter :

| Variable | Valeur |
|---|---|
| `VITE_SUPABASE_URL` | `https://xxxxxxxxxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |

Puis modifier `.github/workflows/static.yml` pour les passer au build :

```yaml
- name: Build
  run: npm run build
  env:
    VITE_SUPABASE_URL: ${{ vars.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ vars.VITE_SUPABASE_ANON_KEY }}
```

### 2.3 Déployer

Pousser sur la branche `master` déclenche automatiquement le workflow `Deploy AfriMarket to Pages` :

```bash
git push origin master
```

Le site sera disponible à l'adresse :
```
https://<votre-compte>.github.io/service/
```

---

## 3. Configuration Supabase (données réelles)

### 3.1 Créer un projet Supabase

1. Se connecter sur [supabase.com](https://supabase.com) et créer un projet (plan gratuit suffisant)
2. Choisir la région la plus proche (ex. **EU West** pour l'Afrique de l'Ouest)
3. Noter l'URL du projet et les clés API dans **Settings → API**

### 3.2 Créer les tables

Dans **SQL Editor** de Supabase, exécuter le fichier de migration :

```sql
-- Copier-coller le contenu de :
supabase/migrations/001_initial.sql
```

Ce script crée les tables :
- `market_data` — historique OHLCV (cours journaliers)
- `companies` — liste complète des sociétés cotées
- `announcements` — introductions en bourse et actualités
- `sgi_funds` — fonds OPCVM/FCP des SGI
- `recommendation_outcomes` — historique des signaux pour entraînement continu

### 3.3 Récupérer les clés API

| Clé | Où la trouver | Usage |
|---|---|---|
| **URL du projet** | Settings → API → Project URL | Frontend + pipeline |
| **anon (public)** | Settings → API → anon key | Frontend (lecture seule) |
| **service_role** | Settings → API → service_role key | Pipeline GitHub Actions (écriture) |

> ⚠️ La clé `service_role` bypasse les règles de sécurité. Ne jamais l'exposer côté client.

---

## 4. Pipeline de données quotidien

Le workflow `.github/workflows/data-pipeline.yml` s'exécute automatiquement chaque jour ouvré à **18h00 UTC** (après la clôture des marchés).

### 4.1 Ajouter les secrets GitHub

Dans **Settings → Secrets and variables → Actions → Secrets** :

| Secret | Description |
|---|---|
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_SERVICE_KEY` | Clé service_role Supabase |
| `EODHD_API_KEY` | Clé API EODHD (voir ci-dessous) |

### 4.2 Obtenir une clé EODHD

1. S'inscrire gratuitement sur [eodhd.com](https://eodhd.com)
2. Le plan gratuit donne **20 appels/jour** — suffisant pour les symboles BRVM
3. Récupérer la clé dans le tableau de bord → API Tokens

### 4.3 Déclencher manuellement

Dans **Actions → Market Data Pipeline → Run workflow**.

### 4.4 Données BVMAC

Les données BVMAC ne sont pas disponibles via EODHD (plan gratuit). Le script `scripts/fetchMarketData.mjs` les ignore pour l'instant. Pour les activer :
- Contacter la BVMAC pour un accès au flux de données officiel
- Ou utiliser un fournisseur de données agréé CEMAC

---

## 5. Développement local

### 5.1 Cloner et installer

```bash
git clone https://github.com/<votre-compte>/service.git
cd service
npm install
```

### 5.2 Configurer l'environnement (optionnel)

Créer un fichier `.env.local` à la racine :

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

Sans ce fichier, l'app utilise les données simulées (GBM).

### 5.3 Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:5173](http://localhost:5173).

### 5.4 Construire pour la production

```bash
npm run build      # compile TypeScript + bundle Vite → dist/
npm run preview    # prévisualise le build sur localhost:4173
```

---

## 6. Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Non | URL du projet Supabase. Sans cette variable, les données simulées sont utilisées. |
| `VITE_SUPABASE_ANON_KEY` | Non | Clé publique Supabase (lecture seule). |

> Les variables préfixées `VITE_` sont intégrées au bundle JavaScript au moment du build. Ne jamais y mettre la clé `service_role`.

---

## 7. Architecture

```
GitHub Pages (SPA statique)
│
├── Données simulées (par défaut)
│   └── Modèle GBM déterministe, PRNG mulberry32
│       → Identique à chaque rendu, aucune dépendance externe
│
└── Données réelles (si Supabase configuré)
    ├── Frontend → Supabase REST API (anon key, CORS activé)
    └── GitHub Actions (cron 18h UTC, lun–ven)
        └── EODHD API → Supabase (service key)
```

### Flux de données

```
[EODHD API]
    │  cours J-1 (BRVM)
    ▼
[GitHub Actions] ──── scripts/fetchMarketData.mjs
    │  upsert OHLCV
    ▼
[Supabase PostgreSQL]
    │  anon REST API
    ▼
[AfriMarket SPA]  ──── src/services/realDataService.ts
    │  fallback si indisponible
    ▼
[GBM simulation]  ──── src/services/marketDataService.ts
```

### Pages et routes

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Vue d'ensemble des marchés |
| `/markets` | Marchés | Liste filtrables de tous les titres |
| `/markets/:symbol` | Détail titre | Graphiques, indicateurs, recommandation |
| `/portfolio` | Portefeuille | Positions, P&L, allocation |
| `/analysis` | Analyse | Simulateur, profil de risque, screener |
| `/alerts` | Alertes | Règles d'alertes prix/RSI/MACD |
| `/announcements` | Annonces | IPO, dividendes, actualités |
| `/sgi` | Fonds SGI | OPCVM/FCP, performance, frais |
| `/profile` | Profil | Préférences, thème, export CSV |
