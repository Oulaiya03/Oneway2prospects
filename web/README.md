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

## Astuce
Code contre `../data/demo.json` (le contrat JSON) tant que l'agent n'est pas prêt -> tu n'attends personne.
Scopes Graph : `openid profile email offline_access User.Read Calendars.Read Mail.ReadWrite`.
