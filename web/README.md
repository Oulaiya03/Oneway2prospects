# web/ — Dev C (Oulaiya)

Le cockpit commercial + l'écran Admin (Next.js).

## Init (à faire dans ce dossier)
```bash
cd web
npx create-next-app@latest . --ts
npm i next-auth
```

## Écrans
- `app/page.tsx` — Ma semaine (les RDV physiques)
- `app/meeting/[id]/page.tsx` — RDV optimisé (fiche entreprise + tournée 1->3)
- `app/admin/page.tsx` — ICP + offre + comptes + clés (remplit `admin_config`)

## API
- `app/api/auth/[...nextauth]/route.ts` — NextAuth provider Azure AD -> récupère l'access_token Graph
- `app/api/run/route.ts` — reçoit un meetingId, appelle `agent/loop.ts` runDeskOffer(), renvoie le JSON

## Snippets prêts (dans `web/snippets/`)
Code déjà écrit pour le login Microsoft + les appels Graph. Après `create-next-app` :
- `snippets/nextauth-route.ts` -> copier dans `app/api/auth/[...nextauth]/route.ts` (login + token Graph)
- `snippets/graph-run.ts` -> copier dans `app/api/run/route.ts` (lire agenda physique + créer draft)
- deps : `npm i next-auth`
- Remplir les clés Azure AD dans `.env` (voir `.env.example`). `tenantId = "common"` pour comptes perso (évite l'admin consent).

Note : si `create-next-app .` râle à cause du dossier `snippets/`, déplace-le 2 min (`mv snippets /tmp`), init, puis remets-le.

## Astuce
Code contre `../data/demo.json` (le contrat JSON) tant que l'agent n'est pas prêt -> tu n'attends personne.
Scopes Graph : `openid profile email offline_access User.Read Calendars.Read Mail.ReadWrite`.
