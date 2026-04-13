# Atlas — Copilote intelligent de voyage

## Installation

```bash
# Extraire l'archive
tar xzf atlas-project.tar.gz
cd atlas

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`.

## Stack

- **Next.js 14** (App Router)
- **TypeScript** strict
- **React 18**
- Aucune dépendance tierce supplémentaire

## Structure

```
src/
├── app/                          7 routes (pages Next.js)
│   ├── layout.tsx
│   ├── page.tsx                  Home
│   ├── quiz/page.tsx             Quiz 6 questions
│   ├── results/page.tsx          Résultats scorés
│   ├── destination/[slug]/       Fiche destination (6 onglets)
│   ├── compare/                  Comparateur multi-critères
│   └── itinerary/[slug]/         Itinéraire jour par jour
├── components/                   12 composants
│   ├── layout/                   Nav, Hero
│   ├── quiz/                     QuizShell, QuizStep
│   ├── results/                  ResultsList, ResultCard
│   ├── destination/              FicheHero, TabPanels (6 panels)
│   ├── compare/                  ComparatorTable
│   ├── itinerary/                ItineraryOverview, DayView
│   └── ui/                       TabNav
├── data/                         Données structurées
│   ├── destinations.ts           5 destinations complètes
│   ├── quiz-questions.ts         6 questions + labels
│   └── ui-constants.ts           Couleurs, intensité, sévérité
├── lib/                          Logique métier
│   ├── types.ts                  Types partagés
│   └── scoring.ts                Moteur scoring (porté du backend)
└── styles/
    └── atlas.css                 Design system complet
```

## Routes fonctionnelles

| Route | Statut | Données |
|-------|--------|---------|
| `/` | Fonctionnel | Statique |
| `/quiz` | Fonctionnel | Client-side |
| `/results` | Fonctionnel | Scoring réel via `lib/scoring.ts` |
| `/destination/lisbonne` | Fonctionnel | Données complètes |
| `/destination/seville` | Fonctionnel | Données complètes |
| `/destination/marrakech` | Fonctionnel | Données complètes |
| `/destination/porto` | Fonctionnel | Données complètes |
| `/destination/naples` | Fonctionnel | Données complètes |
| `/compare?slugs=lisbonne,porto` | Fonctionnel | Multi-critères |
| `/itinerary/lisbonne` | Fonctionnel | 5 jours complets |
| `/itinerary/[autre]` | Page vide | Itinéraire non généré |

## Ce qui reste mocké

- Les quiz answers passent via `sessionStorage` (en production : DB via tRPC)
- L'itinéraire existe uniquement pour Lisbonne (5 jours)
- Les 4 autres destinations ont `itinerary: null`
- Sauvegarde et favoris : boutons présents, pas connectés
- Profil utilisateur : non implémenté
- Couche IA (synthèse) : non connectée
- Données en mémoire (pas de PostgreSQL/Supabase)
