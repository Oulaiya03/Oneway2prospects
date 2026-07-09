# DeskOffer — Oneway2prospects

> **Ton agenda est déjà ta meilleure liste de prospection. On l'active.**

**DeskOffer** est un agent go-to-market qui transforme **1 rendez-vous physique en 3**. Quand un commercial a un RDV chez un client, l'agent identifie les autres décideurs à approcher — d'abord dans la **même entreprise**, puis dans le **même bâtiment**, puis dans le **quartier** — détecte pour chacun un **déclencheur** (signal d'intention), et rédige un message soft : *« un café de 10 min pendant que je suis sur place »*. **Plus de pipe, sans plus de déplacements.**

🏆 Réalisé pour **The Agentic GTM Hackathon** (Anthropic × FullEnrich × Sillage) — Station F, 9 juillet 2026.

---

## 🎬 La démo en 30 secondes

**Scénario** : le commercial a un RDV avec *Viviane Lindenmann* (Responsable marque employeur, **Allianz France**, 1 Cours Michelet — La Défense) au sujet de la refonte du site carrière.

À partir de ce seul RDV, DeskOffer fait tourner sa boucle :

1. 📅 **Lit l'agenda** (Google Calendar), garde le RDV **physique**, identifie l'entreprise via le domaine email du contact
2. 👥 **FullEnrich** → cartographie les **autres décideurs Allianz** (Communication, DRH, Marketing…) avec **emails vérifiés**
3. 📡 **Sillage** → le « pourquoi maintenant » : signaux d'intention (recrutement, marque employeur, changement de poste…)
4. 🔥 **Folk** → « déjà dans notre CRM ? » → flag **warm** (contact chaud)
5. 🏢 **Discovery** → voisins : **même bâtiment** (ICADE Promotion…) + **périmètre** (EDF à 67 m, Société Générale à 216 m)
6. 🧠 **Claude (Agent SDK)** priorise (same-company > warm > hot > fit), sélectionne le **top 3** et rédige les **hooks café** en français
7. 🎧 **Gradium** → la fiche entreprise en **audio**, à écouter dans les transports
8. ✉️ Après **validation humaine** → **brouillons créés** dans Gmail (jamais d'envoi automatique)

**Résultat : 1 déplacement → 3 conversations.**

---

## 🏗️ Architecture (3 couches)

```
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND  web/            Cockpit commercial (Next.js 16)     │
│  Tableau de bord · Prospects · Séquences · Brief · Tournée     │
│  Login Google · cartes Google Maps · livraison des drafts      │
└───────────────────────────────┬──────────────────────────────┘
                                 │  /api/run · /api/meetings · /api/draft
┌───────────────────────────────▼──────────────────────────────┐
│  AGENT  agent/             Claude Agent SDK                    │
│  boucle + system prompt : enrichir → signaux → ranger →        │
│  rédiger, avec grading loop des hooks (validation humaine)     │
└───────────────────────────────┬──────────────────────────────┘
                                 │  tool calls
┌───────────────────────────────▼──────────────────────────────┐
│  DATA  integrations/       1 connecteur = 1 fonction testable  │
│  fullenrich · sillage · folk · discovery · google · gradium    │
└──────────────────────────────────────────────────────────────┘
```

Le contrat qui relie les 3 couches = **le JSON de sortie de l'agent** (`{ meeting, brief, tour[] }`), adapté vers les types du front dans `web/lib/adapt.ts`.

---

## 🔌 Les connecteurs (`integrations/`)

| Connecteur | Rôle | Source | Auth |
|---|---|---|---|
| `fullenrich.ts` | décideurs same-company + emails/tél vérifiés | FullEnrich REST (people search + bulk enrich async + poll) | clé API |
| `sillage.ts` | signaux d'intention (job change, posts LinkedIn…) | Sillage MCP (setup) + normalisation | MCP OAuth |
| `google.ts` | agenda (Calendar) + création de brouillons (Gmail) | Google APIs | NextAuth Google |
| `discovery.ts` | voisins : **même bâtiment** + **périmètre** (tournée) | API Gouv (géocodage + `near_point`) — **gratuit, sans clé** | — |
| `folk.ts` | warm — déjà connu dans le CRM ? | export CSV Folk (local) | — |
| `gradium.ts` | fiche entreprise en **audio** (TTS) | Gradium REST (voix flagship, réglages naturels) | clé API |

Chaque connecteur est une **fonction pure, testable seule en CLI**, et **ne casse pas le flux** s'il manque une clé (fallbacks prévus).

---

## 🧱 Stack technique

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind v4** — deploy **Vercel**
- **Claude Agent SDK** (`@anthropic-ai/sdk`) — raisonnement, orchestration, rédaction
- **NextAuth** (provider **Google**) — token Calendar + Gmail
- **Google Maps** (Embed API) — itinéraires réels sur le cockpit
- **FullEnrich** · **Sillage (MCP)** · **Folk** · **API Gouv recherche-entreprises** · **Gradium**
- Charte visuelle **Agence Mantu 2026** (Space Grotesk, violet `#2B0058`)

---

## 📁 Structure du repo

```
Oneway2prospects/
├── web/                    Front Next.js (cockpit) — déployé sur Vercel
│   ├── app/
│   │   ├── page.tsx                cockpit (dashboard → prospects → séquences → brief)
│   │   ├── components/             Dashboard, ProspectSelect, TripMap, AgentConsole…
│   │   └── api/
│   │       ├── auth/[...nextauth]/ login Google (NextAuth)
│   │       ├── meetings/           agenda Google réel
│   │       ├── run/                déclenche la boucle agent
│   │       └── draft/              création de brouillon Gmail
│   └── lib/                adapt.ts (agent → front), mock.ts, fromGoogle.ts, scoring.ts
├── agent/                  boucle Claude Agent SDK + system prompt
├── integrations/           les 6 connecteurs + leurs tests CLI (test-*.ts)
├── data/                   fixtures de démo (données réelles = gitignorées)
├── .env.example            toutes les variables (jamais de .env commité)
└── CLAUDE.md               guide équipe, specs des outils, pièges
```

---

## 🚀 Installation & lancement

### 1. Cloner
```bash
git clone https://github.com/Oulaiya03/Oneway2prospects.git
cd Oneway2prospects
```

### 2. Le front (cockpit)
```bash
cd web
npm install
cp ../.env.example .env.local     # puis remplir (voir tableau ci-dessous)
npm run dev                       # http://localhost:3000
```

### 3. L'agent + les connecteurs (racine — Node/tsx)
```bash
# à la racine
npm install
npm run agent:dev                 # lance la boucle agent (scénario de démo)
```

### 4. Tester un connecteur isolément
```bash
npm run test:fe          # FullEnrich  → décideurs + emails vérifiés
npm run test:sillage     # Sillage     → signaux
npm run test:discovery   # Voisins     → même bâtiment + périmètre
npm run test:gradium     # Gradium     → génère un .wav
npm run test:folk        # Folk        → base warm locale
npm run typecheck        # TypeScript strict
```

---

## 🔑 Variables d'environnement

À mettre dans `web/.env.local` (front) et/ou `.env` racine (agent) — **jamais commité**.

| Variable | Requis | Où l'obtenir |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | console.anthropic.com |
| `FULLENRICH_API_KEY` | ✅ | app.fullenrich.com/app/api |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ✅ (agenda/drafts) | Google Cloud → OAuth Client (Web) |
| `NEXTAUTH_SECRET` | ✅ | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL` | ✅ | `http://localhost:3000` en local · l'URL Vercel en prod |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ⭐ | Google Cloud (Maps Embed API activée) — sinon carte simulée |
| `GRADIUM_API_KEY` | bonus | gradium.ai (code promo `GTM-HACK`) |

Sillage se connecte en **MCP OAuth** (pas de clé) : `claude mcp add --transport http sillage https://api.getsillage.com/api/mcp/v2` puis `claude mcp login sillage`.

---

## 🔐 Login Google (Calendar + Gmail)

Dans **Google Cloud Console** :
1. Active **Google Calendar API** + **Gmail API**
2. **OAuth consent screen** → *External* → ajoute ton email en **Test user**
3. **Credentials → OAuth client ID → Web application**, avec les redirect URIs :
   ```
   http://localhost:3000/api/auth/callback/google
   https://<ton-url>.vercel.app/api/auth/callback/google
   ```
4. Reporte `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` dans l'env

Scopes utilisés : `calendar.readonly` (agenda) + `gmail.compose` (brouillons). Sans login, le cockpit affiche des données de démo (mock).

---

## ☁️ Déploiement (Vercel)

1. Importer le repo GitHub sur **vercel.com**
2. **Settings → Build and Deployment → Root Directory = `web`** (le front est dans le sous-dossier) — laisser *« Include files outside the root directory »* **activé** (l'app importe `../agent` et `../integrations`)
3. **Settings → Environment Variables** → ajouter toutes les clés (dont `NEXTAUTH_URL` = l'URL Vercel)
4. **Redeploy**
5. Ajouter le redirect URI de prod dans Google Cloud (voir ci-dessus)

> ⚠️ GitHub Pages ne convient pas : l'app a des routes serveur (agent, auth, drafts) → hébergeur avec runtime Node requis (Vercel).

---

## 🔒 Données & sécurité

- **Secrets** : uniquement dans `.env` / `.env.local` (gitignored). Jamais dans le code ni les logs.
- **Données réelles** (signaux LinkedIn, export CRM, audio) : fichiers **locaux uniquement**, gitignorés (`data/signals.json`, `data/*.csv`, `*.wav`). Historique git vérifié : aucun secret.
- **Human-in-the-loop** : l'agent crée des **brouillons**, n'envoie jamais. La validation humaine est un principe produit (et un argument RGPD).
- **Anti-hallucination** : l'agent n'invente jamais un contact, un email ou un signal — data des tools uniquement, sinon « à confirmer ».

---

## 📚 Aller plus loin

Répartition d'équipe, specs détaillées des APIs, pièges connus, barème du hackathon et scénario complet : voir **[CLAUDE.md](CLAUDE.md)**.
