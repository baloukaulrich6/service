import type { StockMeta } from '../types/market';

export const STOCKS_METADATA: StockMeta[] = [
  // ─── BVMAC – Bourse des Valeurs Mobilières de l'Afrique Centrale (XAF) ───
  {
    id: 'SNH', name: 'Société Nationale des Hydrocarbures',
    exchange: 'BVMAC', sector: 'Oil & Gas', assetType: 'stock', currency: 'XAF',
    basePrice: 45000, marketCap: 850000, sharesOutstanding: 18888889,
    dividendYield: 4.2, peRatio: 12.5, country: 'Cameroun',
    description: 'Compagnie pétrolière nationale du Cameroun. Gère la production, le raffinage et la distribution des hydrocarbures dans la sous-région CEMAC.',
    annualDrift: 0.06, annualVolatility: 0.28,
  },
  {
    id: 'SEMC', name: 'Société des Eaux Minérales du Cameroun',
    exchange: 'BVMAC', sector: 'Agriculture & Food', assetType: 'stock', currency: 'XAF',
    basePrice: 8500, marketCap: 42500, sharesOutstanding: 5000000,
    dividendYield: 5.8, peRatio: 9.2, country: 'Cameroun',
    description: 'Leader de la production eaux minérales et boissons gazeuses au Cameroun avec la marque Tangui. Présence commerciale dans toute Afrique Centrale.',
    annualDrift: 0.07, annualVolatility: 0.18,
  },
  {
    id: 'SAFACAM', name: 'Société Africaine Forestière et Agricole du Cameroun',
    exchange: 'BVMAC', sector: 'Agriculture & Food', assetType: 'stock', currency: 'XAF',
    basePrice: 32000, marketCap: 96000, sharesOutstanding: 3000000,
    dividendYield: 6.1, peRatio: 8.7, country: 'Cameroun',
    description: 'SAFACAM exploite des plantations hévéas et palmiers à huile au Cameroun. Produit du caoutchouc naturel et huile de palme brute à destination des marchés mondiaux.',
    annualDrift: 0.05, annualVolatility: 0.19,
  },
  {
    id: 'SOCAPALM', name: 'Société Camerounaise de Palmeraies',
    exchange: 'BVMAC', sector: 'Agriculture & Food', assetType: 'stock', currency: 'XAF',
    basePrice: 56000, marketCap: 280000, sharesOutstanding: 5000000,
    dividendYield: 7.3, peRatio: 11.4, country: 'Cameroun',
    description: 'Principal producteur huile de palme au Cameroun. SOCAPALM gère plus de 30 000 hectares de plantations et fournit industrie alimentaire locale et régionale.',
    annualDrift: 0.08, annualVolatility: 0.22,
  },
  {
    id: 'SEBC', name: "Société d'Exploitation du Bois du Cameroun",
    exchange: 'BVMAC', sector: 'Industry', assetType: 'stock', currency: 'XAF',
    basePrice: 12000, marketCap: 36000, sharesOutstanding: 3000000,
    dividendYield: 3.5, peRatio: 7.8, country: 'Cameroun',
    description: 'SEBC opère dans exploitation forestière durable et transformation du bois au Cameroun. Exporte vers Europe et Asie des bois tropicaux certifiés.',
    annualDrift: 0.04, annualVolatility: 0.25,
  },

  // ─── BRVM – Bourse Régionale des Valeurs Mobilières (XOF) ───
  // Télécommunications
  {
    id: 'SONATEL', name: 'Sonatel SA',
    exchange: 'BRVM', sector: 'Telecommunications', assetType: 'stock', currency: 'XOF',
    basePrice: 15600, marketCap: 3120000, sharesOutstanding: 200000000,
    dividendYield: 8.2, peRatio: 14.3, country: 'Sénégal',
    description: 'Opérateur de télécommunications leader en Afrique de Ouest (filiale Orange). Couvre Sénégal, Mali, Guinée et Sierra Leone avec plus de 30 millions abonnés.',
    annualDrift: 0.10, annualVolatility: 0.16,
  },
  {
    id: 'ONTBF', name: 'ONATEL SA – Office National des Télécommunications du Burkina Faso',
    exchange: 'BRVM', sector: 'Telecommunications', assetType: 'stock', currency: 'XOF',
    basePrice: 3950, marketCap: 197500, sharesOutstanding: 50000000,
    dividendYield: 6.4, peRatio: 11.2, country: 'Burkina Faso',
    description: 'Opérateur national de télécommunications du Burkina Faso, filiale de Maroc Telecom. Services fixe, mobile (Telmob) et internet.',
    annualDrift: 0.07, annualVolatility: 0.19,
  },

  // Banques & Finance
  {
    id: 'SGBCI', name: "Société Générale de Banques en Côte d'Ivoire",
    exchange: 'BRVM', sector: 'Banking & Finance', assetType: 'stock', currency: 'XOF',
    basePrice: 10250, marketCap: 512500, sharesOutstanding: 50000000,
    dividendYield: 5.4, peRatio: 10.8, country: "Côte d'Ivoire",
    description: "Première banque de Côte d'Ivoire, filiale du groupe Société Générale. Services bancaires complets aux particuliers, PME et grandes entreprises.",
    annualDrift: 0.07, annualVolatility: 0.17,
  },
  {
    id: 'ECOBANK', name: 'Ecobank Transnational Incorporated',
    exchange: 'BRVM', sector: 'Banking & Finance', assetType: 'stock', currency: 'XOF',
    basePrice: 6850, marketCap: 1370000, sharesOutstanding: 200000000,
    dividendYield: 4.8, peRatio: 9.5, country: 'Togo',
    description: 'Première banque panafricaine avec présence dans 33 pays africains. Siège à Lomé, services bancaires détail, corporate et investment banking.',
    annualDrift: 0.08, annualVolatility: 0.20,
  },
  {
    id: 'CORIS', name: 'Coris Bank International',
    exchange: 'BRVM', sector: 'Banking & Finance', assetType: 'stock', currency: 'XOF',
    basePrice: 9200, marketCap: 460000, sharesOutstanding: 50000000,
    dividendYield: 5.1, peRatio: 11.8, country: 'Burkina Faso',
    description: 'Banque privée burkinabè présente dans 8 pays Afrique de Ouest. Forte croissance grâce au financement PME et microfinance.',
    annualDrift: 0.09, annualVolatility: 0.18,
  },
  {
    id: 'BOABF', name: 'Bank of Africa Burkina Faso',
    exchange: 'BRVM', sector: 'Banking & Finance', assetType: 'stock', currency: 'XOF',
    basePrice: 5800, marketCap: 290000, sharesOutstanding: 50000000,
    dividendYield: 4.2, peRatio: 9.8, country: 'Burkina Faso',
    description: 'Filiale du groupe Bank of Africa (BOA) au Burkina Faso. Services bancaires universels et financement des entreprises locales.',
    annualDrift: 0.06, annualVolatility: 0.20,
  },
  {
    id: 'BOAS', name: 'Bank of Africa Sénégal',
    exchange: 'BRVM', sector: 'Banking & Finance', assetType: 'stock', currency: 'XOF',
    basePrice: 6400, marketCap: 192000, sharesOutstanding: 30000000,
    dividendYield: 3.9, peRatio: 10.2, country: 'Sénégal',
    description: 'Filiale du groupe BOA en Sénégal. Réseau agences en croissance avec stratégie bancarisation de masse.',
    annualDrift: 0.06, annualVolatility: 0.21,
  },
  {
    id: 'BOAM', name: 'Bank of Africa Mali',
    exchange: 'BRVM', sector: 'Banking & Finance', assetType: 'stock', currency: 'XOF',
    basePrice: 4200, marketCap: 126000, sharesOutstanding: 30000000,
    dividendYield: 3.4, peRatio: 8.7, country: 'Mali',
    description: 'Filiale du groupe BOA au Mali. Banque universelle avec forte présence dans financement agriculture et commerce.',
    annualDrift: 0.05, annualVolatility: 0.23,
  },
  {
    id: 'BOACI', name: "Bank of Africa Côte d'Ivoire",
    exchange: 'BRVM', sector: 'Banking & Finance', assetType: 'stock', currency: 'XOF',
    basePrice: 7800, marketCap: 312000, sharesOutstanding: 40000000,
    dividendYield: 4.6, peRatio: 10.5, country: "Côte d'Ivoire",
    description: "Filiale du groupe BOA en Côte d'Ivoire. Banque de développement et de financement des PME ivoiriennes.",
    annualDrift: 0.07, annualVolatility: 0.18,
  },
  {
    id: 'SIB', name: "Société Ivoirienne de Banque",
    exchange: 'BRVM', sector: 'Banking & Finance', assetType: 'stock', currency: 'XOF',
    basePrice: 4650, marketCap: 139500, sharesOutstanding: 30000000,
    dividendYield: 4.0, peRatio: 9.1, country: "Côte d'Ivoire",
    description: "Banque ivoirienne filiale d'Attijariwafa Bank Maroc. Services bancaires complets entreprises et particuliers.",
    annualDrift: 0.06, annualVolatility: 0.18,
  },
  {
    id: 'BICI', name: "Banque Internationale pour le Commerce et l'Industrie de Côte d'Ivoire",
    exchange: 'BRVM', sector: 'Banking & Finance', assetType: 'stock', currency: 'XOF',
    basePrice: 5200, marketCap: 260000, sharesOutstanding: 50000000,
    dividendYield: 3.8, peRatio: 10.0, country: "Côte d'Ivoire",
    description: "BICI-CI est la banque du groupe BNP Paribas en Côte d'Ivoire. Spécialisée dans le financement du commerce international.",
    annualDrift: 0.06, annualVolatility: 0.17,
  },
  {
    id: 'NSIA', name: "NSIA Banque Côte d'Ivoire",
    exchange: 'BRVM', sector: 'Banking & Finance', assetType: 'stock', currency: 'XOF',
    basePrice: 5600, marketCap: 168000, sharesOutstanding: 30000000,
    dividendYield: 4.3, peRatio: 9.6, country: "Côte d'Ivoire",
    description: "Filiale bancaire du groupe NSIA, acteur majeur des assurances et services financiers en Afrique de Ouest.",
    annualDrift: 0.07, annualVolatility: 0.19,
  },
  {
    id: 'ORAGROUP', name: 'Oragroup SA',
    exchange: 'BRVM', sector: 'Banking & Finance', assetType: 'stock', currency: 'XOF',
    basePrice: 3200, marketCap: 96000, sharesOutstanding: 30000000,
    dividendYield: 2.9, peRatio: 8.4, country: 'Togo',
    description: 'Holding bancaire présente dans 12 pays africains via ses filiales. Anciennement Banque Atlantique.',
    annualDrift: 0.05, annualVolatility: 0.22,
  },
  {
    id: 'BDK', name: 'Banque Populaire de Développement du Sénégal',
    exchange: 'BRVM', sector: 'Banking & Finance', assetType: 'stock', currency: 'XOF',
    basePrice: 3800, marketCap: 76000, sharesOutstanding: 20000000,
    dividendYield: 3.2, peRatio: 8.9, country: 'Sénégal',
    description: 'Banque de développement axée sur le financement des PME et du secteur agricole sénégalais.',
    annualDrift: 0.05, annualVolatility: 0.23,
  },

  // Pétrole & Gaz
  {
    id: 'TOTALCI', name: "TotalEnergies Marketing Côte d'Ivoire",
    exchange: 'BRVM', sector: 'Oil & Gas', assetType: 'stock', currency: 'XOF',
    basePrice: 2480, marketCap: 124000, sharesOutstanding: 50000000,
    dividendYield: 6.9, peRatio: 13.2, country: "Côte d'Ivoire",
    description: "Filiale TotalEnergies pour distribution produits pétroliers en Côte d'Ivoire. Réseau 200+ stations-service et lubrifiants industriels.",
    annualDrift: 0.06, annualVolatility: 0.21,
  },
  {
    id: 'VIVO', name: "Vivo Energy Côte d'Ivoire",
    exchange: 'BRVM', sector: 'Oil & Gas', assetType: 'stock', currency: 'XOF',
    basePrice: 1850, marketCap: 74000, sharesOutstanding: 40000000,
    dividendYield: 5.8, peRatio: 12.0, country: "Côte d'Ivoire",
    description: "Distributeur de carburants Shell en Afrique de Ouest. Réseau de stations-service et activités LPG.",
    annualDrift: 0.05, annualVolatility: 0.22,
  },

  // Agriculture & Alimentation
  {
    id: 'NESTLECI', name: "Nestlé Côte d'Ivoire",
    exchange: 'BRVM', sector: 'Agriculture & Food', assetType: 'stock', currency: 'XOF',
    basePrice: 8030, marketCap: 481800, sharesOutstanding: 60000000,
    dividendYield: 9.1, peRatio: 16.8, country: "Côte d'Ivoire",
    description: 'Nestlé CI produit et commercialise produits alimentaires marque mondiale (Maggi, Nescafé, Milo) en Afrique Ouest. Leader bouillons et boissons chaudes.',
    annualDrift: 0.09, annualVolatility: 0.14,
  },
  {
    id: 'SAPH', name: "Société Africaine de Plantations d'Hévéas",
    exchange: 'BRVM', sector: 'Agriculture & Food', assetType: 'stock', currency: 'XOF',
    basePrice: 4200, marketCap: 126000, sharesOutstanding: 30000000,
    dividendYield: 6.5, peRatio: 8.3, country: "Côte d'Ivoire",
    description: "Premier producteur caoutchouc naturel en Côte d'Ivoire. 23 000 hectares plantations hévéas contribuant au leadership mondial de la CI.",
    annualDrift: 0.07, annualVolatility: 0.19,
  },
  {
    id: 'SOGB', name: "Société des Caoutchoucs de Grand-Béréby",
    exchange: 'BRVM', sector: 'Agriculture & Food', assetType: 'stock', currency: 'XOF',
    basePrice: 2900, marketCap: 87000, sharesOutstanding: 30000000,
    dividendYield: 5.9, peRatio: 8.0, country: "Côte d'Ivoire",
    description: "Producteur caoutchouc naturel et huile de palme dans la région Bas-Sassandra en Côte d'Ivoire.",
    annualDrift: 0.06, annualVolatility: 0.20,
  },
  {
    id: 'PALMC', name: "Palm Côte d'Ivoire",
    exchange: 'BRVM', sector: 'Agriculture & Food', assetType: 'stock', currency: 'XOF',
    basePrice: 6200, marketCap: 186000, sharesOutstanding: 30000000,
    dividendYield: 7.0, peRatio: 9.5, country: "Côte d'Ivoire",
    description: "Producteur huile de palme et dérivés. Filiale du groupe PALMCI exploitant les palmeraies du centre ivoirien.",
    annualDrift: 0.07, annualVolatility: 0.18,
  },
  {
    id: 'SUCRIVOIRE', name: "Sucrivoire SA",
    exchange: 'BRVM', sector: 'Agriculture & Food', assetType: 'stock', currency: 'XOF',
    basePrice: 1200, marketCap: 36000, sharesOutstanding: 30000000,
    dividendYield: 4.5, peRatio: 7.2, country: "Côte d'Ivoire",
    description: "Producteur de sucre de canne en Côte d'Ivoire. Gère les complexes sucriers de Ferké et de Borotou.",
    annualDrift: 0.04, annualVolatility: 0.24,
  },
  {
    id: 'SIFCA', name: "Société Internationale Financière pour les Investissements et le Développement en Afrique",
    exchange: 'BRVM', sector: 'Agriculture & Food', assetType: 'stock', currency: 'XOF',
    basePrice: 4750, marketCap: 237500, sharesOutstanding: 50000000,
    dividendYield: 6.2, peRatio: 10.8, country: "Côte d'Ivoire",
    description: "Holding agro-industriel leader en Côte d'Ivoire. Actif dans hévéaculture, palmiculture, sucrerie à travers SAPH, SOGB, PALMCI, SUCRIVOIRE.",
    annualDrift: 0.08, annualVolatility: 0.17,
  },
  {
    id: 'SITAB', name: "Société Ivoirienne de Tabac",
    exchange: 'BRVM', sector: 'Agriculture & Food', assetType: 'stock', currency: 'XOF',
    basePrice: 3100, marketCap: 93000, sharesOutstanding: 30000000,
    dividendYield: 7.8, peRatio: 9.0, country: "Côte d'Ivoire",
    description: "Filiale BAT Africa pour production et commercialisation du tabac en Côte d'Ivoire.",
    annualDrift: 0.05, annualVolatility: 0.16,
  },

  // Industrie
  {
    id: 'SETAO', name: "Société des Études et de Travaux d'Afrique de l'Ouest",
    exchange: 'BRVM', sector: 'Industry', assetType: 'stock', currency: 'XOF',
    basePrice: 2100, marketCap: 63000, sharesOutstanding: 30000000,
    dividendYield: 3.0, peRatio: 8.5, country: "Côte d'Ivoire",
    description: "Entreprise de BTP et travaux publics présente en Côte d'Ivoire et Afrique de Ouest.",
    annualDrift: 0.04, annualVolatility: 0.26,
  },
  {
    id: 'SICABLE', name: "Société Ivoirienne de Câbles",
    exchange: 'BRVM', sector: 'Industry', assetType: 'stock', currency: 'XOF',
    basePrice: 2450, marketCap: 73500, sharesOutstanding: 30000000,
    dividendYield: 4.8, peRatio: 8.2, country: "Côte d'Ivoire",
    description: "Fabricant de câbles électriques en Côte d'Ivoire. Fournit les réseaux électriques et projets infrastructure de la sous-région.",
    annualDrift: 0.05, annualVolatility: 0.22,
  },
  {
    id: 'FILTISAC', name: "Filtisac SA",
    exchange: 'BRVM', sector: 'Industry', assetType: 'stock', currency: 'XOF',
    basePrice: 1870, marketCap: 56100, sharesOutstanding: 30000000,
    dividendYield: 3.5, peRatio: 7.8, country: "Côte d'Ivoire",
    description: "Producteur de sacs en toile de jute et emballages industriels en Côte d'Ivoire. Fournisseur agricole régional.",
    annualDrift: 0.04, annualVolatility: 0.24,
  },
  {
    id: 'CAPH', name: "Caisse Autonome de Prêts Hypothécaires",
    exchange: 'BRVM', sector: 'Banking & Finance', assetType: 'stock', currency: 'XOF',
    basePrice: 4900, marketCap: 98000, sharesOutstanding: 20000000,
    dividendYield: 4.1, peRatio: 11.0, country: "Côte d'Ivoire",
    description: "Institution financière spécialisée dans le crédit immobilier et le financement logement en Côte d'Ivoire.",
    annualDrift: 0.06, annualVolatility: 0.20,
  },

  // Eau & Energie
  {
    id: 'CIE', name: "Compagnie Ivoirienne d'Electricité",
    exchange: 'BRVM', sector: 'Water & Energy', assetType: 'stock', currency: 'XOF',
    basePrice: 2150, marketCap: 107500, sharesOutstanding: 50000000,
    dividendYield: 7.8, peRatio: 11.6, country: "Côte d'Ivoire",
    description: "Concessionnaire distribution électricité en Côte d'Ivoire depuis 1990. Réseau couvrant tout le territoire, plus de 2 millions abonnés.",
    annualDrift: 0.06, annualVolatility: 0.17,
  },
  {
    id: 'SODECI', name: "Société de Distribution d'Eau de la Côte d'Ivoire",
    exchange: 'BRVM', sector: 'Water & Energy', assetType: 'stock', currency: 'XOF',
    basePrice: 4100, marketCap: 123000, sharesOutstanding: 30000000,
    dividendYield: 6.8, peRatio: 12.0, country: "Côte d'Ivoire",
    description: "Concessionnaire eau potable en Côte d'Ivoire. Filiale du groupe Eranove, couvre 72 villes ivoiriennes.",
    annualDrift: 0.06, annualVolatility: 0.15,
  },
  {
    id: 'BERNABE', name: "Bernabé Côte d'Ivoire",
    exchange: 'BRVM', sector: 'Water & Energy', assetType: 'stock', currency: 'XOF',
    basePrice: 1380, marketCap: 41400, sharesOutstanding: 30000000,
    dividendYield: 4.2, peRatio: 7.5, country: "Côte d'Ivoire",
    description: "Distribution matériaux de construction et équipements électriques en Afrique de Ouest.",
    annualDrift: 0.04, annualVolatility: 0.25,
  },

  // Distribution
  {
    id: 'CFAO', name: "CFAO Motors Côte d'Ivoire",
    exchange: 'BRVM', sector: 'Distribution', assetType: 'stock', currency: 'XOF',
    basePrice: 3500, marketCap: 105000, sharesOutstanding: 30000000,
    dividendYield: 5.2, peRatio: 9.8, country: "Côte d'Ivoire",
    description: "Distributeur automobiles et équipements en Afrique. Filiale du groupe CFAO (Toyota, Volkswagen, Yamaha).",
    annualDrift: 0.05, annualVolatility: 0.21,
  },
  {
    id: 'TRACTAFRIC', name: "Tractafric Motors Côte d'Ivoire",
    exchange: 'BRVM', sector: 'Distribution', assetType: 'stock', currency: 'XOF',
    basePrice: 2800, marketCap: 84000, sharesOutstanding: 30000000,
    dividendYield: 4.4, peRatio: 9.0, country: "Côte d'Ivoire",
    description: "Importateur distributeur véhicules et équipements lourds en Côte d'Ivoire. Représente CAT, Mercedes-Benz Trucks.",
    annualDrift: 0.05, annualVolatility: 0.22,
  },
  {
    id: 'MOVIS', name: "Movis SA",
    exchange: 'BRVM', sector: 'Distribution', assetType: 'stock', currency: 'XOF',
    basePrice: 1650, marketCap: 49500, sharesOutstanding: 30000000,
    dividendYield: 3.6, peRatio: 8.2, country: "Côte d'Ivoire",
    description: "Distribution et maintenance équipements informatiques et télécoms en Afrique de Ouest.",
    annualDrift: 0.04, annualVolatility: 0.26,
  },
  {
    id: 'CROWN', name: "Crown Siem Côte d'Ivoire",
    exchange: 'BRVM', sector: 'Distribution', assetType: 'stock', currency: 'XOF',
    basePrice: 2100, marketCap: 63000, sharesOutstanding: 30000000,
    dividendYield: 3.9, peRatio: 8.5, country: "Côte d'Ivoire",
    description: "Spécialiste emballages métalliques (boîtes de conserve, boîtes aérosol) en Côte d'Ivoire.",
    annualDrift: 0.04, annualVolatility: 0.23,
  },

  // Transport
  {
    id: 'BOLLORE', name: "Bolloré Transport & Logistics CI",
    exchange: 'BRVM', sector: 'Transport', assetType: 'stock', currency: 'XOF',
    basePrice: 2950, marketCap: 147500, sharesOutstanding: 50000000,
    dividendYield: 3.8, peRatio: 12.5, country: "Côte d'Ivoire",
    description: "Logistique portuaire et transport en Afrique de Ouest. Gestionnaire du terminal à conteneurs du Port d'Abidjan.",
    annualDrift: 0.06, annualVolatility: 0.20,
  },
];

export const STOCKS_BY_ID: Record<string, StockMeta> = Object.fromEntries(
  STOCKS_METADATA.map((s) => [s.id, s])
);

export const BVMAC_STOCKS = STOCKS_METADATA.filter((s) => s.exchange === 'BVMAC');
export const BRVM_STOCKS = STOCKS_METADATA.filter((s) => s.exchange === 'BRVM');
