# CLAUDE.md — Oneway2prospects (DeskOffer)

Guide pour Claude Code et pour l'équipe. À lire avant de coder. On initialise et on se répartit à 3.

## 1. C'est quoi

**DeskOffer** : un agent GTM qui transforme **1 rendez-vous physique en 3**. Quand un commercial a un RDV chez un client, l'agent trouve les autres décideurs à approcher (d'abord dans la MÊME entreprise, puis dans le bâtiment/quartier), trouve un déclencheur pour chacun, et rédige un message soft ("café de 10 min pendant que je suis sur place"). Objectif : plus de pipe sans plus de déplacements.

Contexte : **The Agentic GTM Hackathon** (Anthropic + FullEnrich + Sillage), Station F, 9 juillet 2026. Build 9h30-17h30, pitch 18h. Jury business.

Phrase clé : *"Ton agenda est déjà ta meilleure liste de prospection. On l'active."*

## 2. Les briques (obligatoire d'utiliser les 3 premières)

- **Claude** (Agent SDK) : raisonnement, rédaction, orchestration
- **FullEnrich** : enrichissement contacts (email + tel vérifiés, org)
- **Sillage** : signaux d'intent (job change, hiring, competitor, funding)
- **Folk** (bonus) : CRM warm (déjà connu ?)
- **M365 / Microsoft Graph** : agenda (lire) + drafts email (créer)
- **API Gouv recherche-entreprises + Google Maps** : boîtes voisines (rayon)
- **Gradium** (bonus) : TTS pour la fiche entreprise en audio

## 3. Le workflow produit (4 étapes)

1. Lire l'agenda Outlook, filtrer les **RDV physiques** (auto : `isOnlineMeeting` + `location`), identifier l'entreprise via le domaine email du contact.
2. **FullEnrich** : cartographier les décideurs pertinents dans la même entreprise + email/tel.
3. **Sillage** : signaux d'intent sur l'entreprise / la personne / le marché.
4. **Claude** : plan d'action + hooks café sur le top prospects, **validation humaine** avant de créer les drafts.

Deux leviers : **A. Maximiser** le RDV (fiche entreprise, arriver préparé) · **B. Multiplier** (1 RDV -> 3, same-company d'abord, voisins en bonus).

## 4. Architecture (3 couches)

```
FRONTEND (web/)        cockpit commercial + admin
   |  appelle
AGENT (agent/)         Claude Agent SDK : boucle + system prompt
   |  tool calls
DATA/OUTILS (integrations/)  FullEnrich · Sillage · Folk · Graph · gouv/maps · Gradium
```

Flux runtime : `RDV (agenda) -> agent -> enrich + signaux + warm + voisins -> range -> rédige -> drafts`.

## 5. Structure du repo

```
Oneway2prospects/
├── CLAUDE.md                 <- ce fichier
├── README.md                 pitch + comment lancer
├── .env.example              les cles (JAMAIS .env commite)
├── .gitignore
├── web/                      Dev C : Next.js (cockpit + admin + NextAuth Graph)
│   └── app/
│       ├── page.tsx                  Ma semaine
│       ├── meeting/[id]/page.tsx     RDV optimise (fiche + tournee)
│       ├── admin/page.tsx            ICP + offre + comptes + cles
│       └── api/
│           ├── auth/[...nextauth]/   NextAuth Azure AD (token Graph)
│           └── run/route.ts          declenche l'agent pour un RDV
├── agent/                    Dev A : le cerveau
│   ├── loop.ts                       boucle Claude Agent SDK
│   ├── prompt.ts                     le system prompt
│   └── tools/                        wrappers custom (gouv, maps, gradium)
├── integrations/             Dev B : les connecteurs (1 fonction testable / outil)
│   ├── graph.ts                      calendarView + create draft
│   ├── fullenrich.ts                 enrich async + poll
│   ├── sillage.ts                    persona, accounts, signal_run, list_signals
│   ├── folk.ts                       search_contacts (warm)
│   └── discovery.ts                  gouv entreprises + maps
└── data/
    └── demo.json                     scenario fictif (jamais data Mantu reelle)
```

## 6. Répartition à 3 (qui code quoi)

- **Dev A (Johanna)** : `agent/` -> la boucle + le system prompt + brancher les tools. Vise le chemin **same-company** en premier.
- **Dev B (Oulaiya)** : `integrations/` -> les 5 connecteurs, chacun une fonction pure testable seule.
- **Dev C (Nico)** : `web/` -> les écrans + **NextAuth (token Graph)** + l'appel à `/api/run`.
- **Nicolas Daveux** : business -> scénario démo, pitch, slides Gamma, vidéo, posts viraux (pas de code).

**Le contrat qui vous relie = le JSON de sortie de l'agent (section 10).** Dev C code contre ce format pendant que Dev A/B le remplissent -> zéro blocage.

## 7. Stack

- **Next.js (App Router) + TypeScript**, deploy **Vercel** (l'URL = preuve "deployable")
- **Claude Agent SDK** (TS) pour l'agent
- **NextAuth** (provider Azure AD) pour le token Microsoft Graph
- DB : rien d'obligatoire pour le MVP (state en mémoire / demo.json). Supabase si besoin.

## 8. Guide par module

### agent/ (Dev A)
- `prompt.ts` : exporte le SYSTEM_PROMPT (déjà rédigé, voir section 9).
- `loop.ts` : instancie l'agent, déclare les tools (via MCP ou fonctions `integrations/`), reçoit un `meeting` + `admin_config`, retourne le JSON (section 10).
- Ordre de priorité : same-company (org FullEnrich + Sillage enrich_company + signaux) AVANT les voisins.

### integrations/ (Dev B)
Chaque fichier = des fonctions pures, testables avec un `console.log`.
- `graph.ts` : `getPhysicalMeetings()`, `createDraft(to, subject, body)`
- `fullenrich.ts` : `searchPeople(company, titles)`, `enrich(contacts)` (async -> poll)
- `sillage.ts` : `upsertPersona(icp)`, `addTopAccounts([...])`, `enrichCompany(domain)`, `launchSignalRun()`, `listSignals()`
- `folk.ts` : `searchContacts(name|company)` -> warm ?
- `discovery.ts` : `neighbors(address, radius)` (gouv + maps)

### web/ (Dev C)
- 3 écrans (Ma semaine / RDV optimisé / Admin) + Livraison (les drafts).
- `NextAuth` Azure AD -> récupérer l'`access_token` Graph dans la session.
- `api/run/route.ts` -> reçoit un meetingId, appelle l'agent, renvoie le JSON au front.
- L'écran Admin remplit `admin_config` (ICP + offre) que l'agent consomme.

## 9. Le system prompt (le cerveau)

Vit dans `agent/prompt.ts`. Résumé des règles :
- ROLE : transformer 1 RDV physique en 3.
- Inputs : `meeting {company, address, contact_name, datetime}` + `admin_config {icp, offer}`.
- Procédure : same-company d'abord -> voisins -> signaux Sillage -> enrich FullEnrich -> warm Folk -> ranking (same-company > warm > hot > fit) -> top 3 -> hooks + fiche -> drafts (jamais envoyer).
- HOOK : café informel, ancré sur UN vrai signal, 3-4 phrases, EN FRANÇAIS.
- ANTI-HALLU : jamais inventer contact/email/client/signal ; data des tools uniquement ; sinon "à confirmer".
- Sortie : JSON strict (section 10).
(Le texte complet du prompt est fourni séparément, à coller dans `prompt.ts`.)

## 10. Le contrat d'interface (JSON de sortie de l'agent)

```json
{
  "meeting": { "company": "", "datetime": "" },
  "brief":   { "company": "", "bullets": ["..."], "audio_text": "" },
  "tour": [
    { "name": "", "title": "", "company": "",
      "location": "same_company | same_building | nearby",
      "why": "<signal>", "warm": true,
      "email": "", "phone": "", "hook": "<message francais>" }
  ]
}
```
Tout le monde code contre ce format.

## 11. Conventions (IMPORTANTES)

- **Secrets** : `client_secret`, tokens, clés API -> UNIQUEMENT dans `.env` (gitignored). Jamais dans un commit, jamais loggés (screenshare = fuite).
- **Commits** : messages clairs. **JAMAIS de trailer `Co-Authored-By: Claude`** (règle absolue).
- **Data** : scénario DÉMO fictif. Jamais le Folk interne réel ni des clients Mantu réels.
- **Outputs client** (hooks, fiche) en **français**.
- **Ne pas mentionner Mantu** dans le produit / le pitch (framer universel).

## 12. Commandes

```bash
# setup
cd web && npx create-next-app@latest . --ts
# deps : @anthropic-ai/... (Agent SDK), next-auth
cp .env.example .env    # remplir en local
# dev
npm run dev
```

## 13. Specs des outils (référence rapide)

### FullEnrich
- Auth REST : `Authorization: Bearer {FULLENRICH_API_KEY}` · MCP (OAuth) : `https://mcp.fullenrich.com/mcp`
- Bulk enrich (ASYNC) : `POST https://app.fullenrich.com/api/v2/contact/enrich/bulk`
  body : `{ name, data:[{first_name,last_name, company_name|domain | linkedin_url, enrich_fields:["contact.work_emails","contact.phones"]}], webhook_url }`
  -> `{ "enrichment_id": "uuid" }`. Résultats via webhook (mieux) ou `GET .../bulk/{id}`.
- Crédits : email pro=1, perso=3, **mobile=10** (limiter en démo). People search : `POST /api/v2/people/search`.

### Sillage (MCP)
- URL : `https://api.getsillage.com/api/mcp/v2` (OAuth, PAS de clé). Claude Code : `claude mcp add --transport http sillage https://api.getsillage.com/api/mcp/v2`. 20 comptes trackés max.
- Tools clés (`sillage_v2_`) : `upsert_persona`, `add_top_accounts`, `enrich_company`, `launch_signal_run`, `list_signals`, `get_signal`, `create_agent`, `bind_agent_watchlist`.
- Nuance : les signaux viennent d'un **signal_run** ou d'un **agent**, pas d'un simple get.

### Microsoft Graph (M365) — via NextAuth Azure AD
- Scopes : `openid profile email offline_access User.Read Calendars.Read Mail.ReadWrite`
- Agenda : `GET https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=...&endDateTime=...` (filtrer via `isOnlineMeeting`, `location.address`)
- Draft : `POST https://graph.microsoft.com/v1.0/me/messages` (crée un brouillon non envoyé)
- GOTCHA : en tenant corporate, scopes délégués peuvent exiger admin consent -> pour la démo, compte perso / tenant de test.

### Folk (MCP)
- OAuth, `search_contacts` -> la personne/boîte est-elle déjà connue (warm) ?

### Discovery (voisins)
- `recherche-entreprises.api.gouv.fr` (gratuit, recherche par géo/adresse) + Google Maps (geocode/Places).

### Gradium (bonus)
- Code promo `GTM-HACK`. TTS -> `brief.audio_text` en audio.

## 14. Scénario démo + scoring

- Scénario fictif : RDV chez **Nexity, La Défense** (data publique/fictive, pas de data Mantu).
- Barème (100 pts, 4x25) : Business impact · Depth AI/workflow (Anthropic) · **Depth data (FullEnrich + Sillage)** · Présentation.
- Montrer en démo : **plusieurs signaux Sillage** + **FullEnrich riche** (org + enrich) = les 25 pts data.
- Side challenges : Gamma (slides), Gradium (audio), viral LinkedIn/X (#agenticgtm, tag les 3), creative GTM angle, crowd favorite.

## 15. Règles hackathon + les 3 pièges

- **No prior commits** : tout le code se fait pendant l'event.
- **Livrable** : app qui tourne (webhook + vrais tool calls + livraison) + vidéo 2 min + repo + description, soumis AVANT 17h30.
- **Consentement / data** : contacts business uniquement, pas d'envoi 100% auto sans validation.
- Pièges à dérisquer avant midi : (1) **OAuth Graph** (tester tôt, fallback Google/mock), (2) **FullEnrich async** (poll/webhook + timeout + fallback "non trouvé"), (3) **Sillage** = signal_run/agent.

## 16. Definition of Done (le hero à faire tourner)

`RDV physique (agenda) -> FullEnrich (décideurs same-company + email/tel) -> Sillage (signaux) -> Claude (top 3 + hooks café) -> drafts créés dans Outlook`, en RÉEL, sur le scénario Nexity. Le reste (voisins, Gradium, audio) = bonus après le freeze de 15h.
