# DeskOffer — Oneway2prospects

> **Ton agenda est déjà ta meilleure liste de prospection. On l'active.**

Un agent GTM qui transforme **1 rendez-vous physique en 3**. Quand un commercial a un RDV chez un client, DeskOffer trouve les autres décideurs à approcher — d'abord dans la **même entreprise**, puis dans le **même bâtiment**, puis dans le **quartier** — détecte un déclencheur pour chacun (signaux d'intent), et rédige un message soft : *« café de 10 min pendant que je suis sur place »*. Plus de pipe, sans plus de déplacements.

🏆 **The Agentic GTM Hackathon** (Anthropic × FullEnrich × Sillage) — Station F, 9 juillet 2026.

---

## 🎬 La démo en 30 secondes

**Scénario** : RDV avec Viviane Lindenmann (Responsable marque employeur, **Allianz France**, 1 Cours Michelet, La Défense) sur la refonte du site carrière.

DeskOffer, tout seul :
1. 📅 Lit le RDV dans l'agenda Outlook, identifie Allianz via le domaine email
2. 👥 **FullEnrich** → les autres décideurs Allianz (Resp. Communication, DRH…) avec **emails vérifiés**
3. 📡 **Sillage** → le « pourquoi maintenant » : posts LinkedIn sur le recrutement / la marque employeur Allianz
4. 🔥 **Folk** → « déjà dans notre CRM » → prospect chaud (warm)
5. 🏢 **Discovery** → même tour : ICADE Promotion · à 67 m : EDF · à 216 m : Société Générale
6. 🧠 **Claude** range tout (same-company > warm > hot > fit), choisit le **top 3** et rédige les hooks café en français
7. 🎧 **Gradium** → la fiche entreprise en audio, à écouter dans les transports
8. ✉️ Après **validation humaine** → brouillons créés dans Outlook (jamais d'envoi auto)

**Résultat : 1 déplacement → 3 conversations.**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND  web/        cockpit commercial (Next.js)      │
│  Ma semaine · RDV optimisé (fiche + tournée) · Livraison │
└──────────────────────────┬──────────────────────────────┘
                           │ /api/run
┌──────────────────────────▼──────────────────────────────┐
│  AGENT  agent/          Claude Agent SDK                 │
│  boucle + system prompt : enrichir → signaux → ranger    │
│  → rédiger (validation humaine avant drafts)             │
└──────────────────────────┬──────────────────────────────┘
                           │ tool calls
┌──────────────────────────▼──────────────────────────────┐
│  DATA  integrations/    1 connecteur = 1 fonction testable│
│  fullenrich · sillage · folk · discovery · graph · gradium│
└─────────────────────────────────────────────────────────┘
```

Le contrat qui relie les 3 couches = **le JSON de sortie de l'agent** (`CLAUDE.md` §10) : `{ meeting, brief, tour[] }`.

## 🔌 Les connecteurs (`integrations/`)

| Connecteur | Rôle | Source | Testé sur |
|---|---|---|---|
| `fullenrich.ts` | décideurs + emails/tél vérifiés | REST FullEnrich (search + bulk enrich async + poll) | Allianz ✅ |
| `sillage.ts` | signaux d'intent (job change, posts…) | MCP Sillage (setup) + cache local normalisé | 7 signaux réels ✅ |
| `folk.ts` | warm — déjà connu dans le CRM ? | export CSV Folk (local) | 17 contacts ✅ |
| `discovery.ts` | voisins : même bâtiment + périmètre | API Gouv (geocode + near_point) — gratuit, sans clé | La Défense ✅ |
| `graph.ts` | agenda Outlook + création de drafts | Microsoft Graph (token NextAuth Azure AD) | — |
| `gradium.ts` | fiche entreprise en audio (TTS) | REST Gradium, voix flagship + réglages naturels | ✅ |

Chaque connecteur est une fonction pure, **testable seule en CLI** — aucun ne casse le flux s'il manque une clé (fallbacks prévus).

## 🚀 Lancer le projet

### 1. Cloner et configurer
```bash
git clone https://github.com/Oulaiya03/Oneway2prospects.git
cd Oneway2prospects
cp .env.example .env        # puis remplir les clés (voir ci-dessous)
npm install
```

### 2. Les clés (`.env` — jamais commité)
| Variable | Requis | Où l'obtenir |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | console.anthropic.com |
| `FULLENRICH_API_KEY` | ✅ | app.fullenrich.com/app/api |
| `AZURE_AD_CLIENT_ID` / `_SECRET` / `_TENANT_ID` | ✅ (agenda/drafts) | portail Azure — app registration, tenant `common` |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | ✅ (web) | `openssl rand -base64 32` / URL locale ou Vercel |
| `GRADIUM_API_KEY` | bonus | gradium.ai (code promo `GTM-HACK`) |
| `GOOGLE_MAPS_API_KEY` | optionnel | console.cloud.google.com (le fallback API Gouv marche sans) |

Sillage se connecte en **MCP OAuth** (pas de clé) : `claude mcp add --transport http sillage https://api.getsillage.com/api/mcp/v2` puis `claude mcp login sillage`.

### 3. Tester chaque connecteur (isolément)
```bash
npm run test:fe          # FullEnrich  → décideurs + emails vérifiés
npm run test:sillage     # Sillage     → signaux en cache
npm run test:discovery   # Voisins     → même bâtiment + périmètre
npm run test:gradium     # Gradium     → génère data/brief-allianz.wav
npm run test:folk        # Folk        → base warm locale
npm run test:graph       # Graph       → agenda (nécessite un token)
npm run typecheck        # TypeScript strict
```

### 4. Lancer l'app
```bash
cd web
npm install
npm run dev              # http://localhost:3000
```

## 🔒 Data & sécurité

- **Secrets** : uniquement dans `.env` (gitignored). Jamais dans le code, jamais loggés.
- **Données réelles** (signaux LinkedIn, export CRM, audio) : fichiers **locaux uniquement**, gitignorés (`data/signals.json`, `data/*.csv`, `*.wav`).
- **Human-in-the-loop** : l'agent crée des **brouillons**, n'envoie jamais. La validation humaine est un principe produit (et un argument RGPD), pas une contrainte.
- **Anti-hallucination** : l'agent n'invente jamais un contact, un email ou un signal — data des tools uniquement, sinon « à confirmer ».

## 🧰 Stack

Next.js (App Router) + TypeScript · Claude Agent SDK · NextAuth (Azure AD) · Vercel · FullEnrich · Sillage (MCP) · Folk · Microsoft Graph · API Gouv recherche-entreprises · Gradium

## 📚 Aller plus loin

Tout le détail (répartition d'équipe, specs des APIs, pièges connus, barème, scénario) : **[CLAUDE.md](CLAUDE.md)**.
