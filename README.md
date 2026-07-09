# Oneway2prospects — DeskOffer

Un agent GTM qui transforme **1 rendez-vous physique en 3**. L'agent lit l'agenda du commercial, repère les décideurs à approcher (même entreprise d'abord, puis voisins), trouve un déclencheur pour chacun (signaux d'intent), enrichit les contacts, et rédige un message soft ("café de 10 min pendant que je suis sur place"). Plus de pipe, sans plus de déplacements.

> Hackathon Agentic GTM (Anthropic + FullEnrich + Sillage), Station F, 9 juil 2026.

## Les 3 briques
- **Claude** (Agent SDK) : raisonnement + rédaction + orchestration
- **FullEnrich** : enrichissement contacts (email + tel vérifiés)
- **Sillage** : signaux d'intent
- (bonus) Folk (CRM warm), Microsoft Graph (agenda + drafts), API Gouv + Maps (voisins), Gradium (fiche audio)

## Structure
```
web/           cockpit + admin (Next.js)          -> Dev C
agent/         boucle Claude Agent SDK + prompt    -> Dev A
integrations/  connecteurs (graph, fullenrich, sillage, folk, discovery) -> Dev B
data/          scenario demo (fictif)
```
Le contrat qui relie tout le monde = le JSON de sortie de l'agent (voir `CLAUDE.md` section 10).

## Lancer
```bash
cp .env.example .env    # remplir les cles en local
cd web && npx create-next-app@latest . --ts
npm run dev
```

## Règles
- Secrets uniquement dans `.env` (gitignored), jamais commités.
- Data fictive uniquement (pas de données réelles).
- Voir `CLAUDE.md` pour tout le détail (archi, répartition, specs des outils, pièges).
