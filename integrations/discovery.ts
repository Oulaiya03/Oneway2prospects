// Dev B : decouverte des boites voisines (BONUS, apres le same-company).
// 100% API Gouv, gratuit, SANS cle :
//   1) Geocode l'adresse du RDV -> lat/long        (API Adresse / BAN)
//   2) Entreprises autour du point -> /near_point   (recherche-entreprises)
//   3) Distance reelle (Haversine) depuis le RDV, dedupe, tri, limite.

export type Neighbor = {
  name: string;
  address: string;
  distance_m: number;
  domain?: string; // non fourni par l'API Gouv (enrichissable via FullEnrich si besoin)
  siret?: string;
  commune?: string;
  category?: string; // GE | ETI | PME
  effectif?: string; // tranche d'effectif INSEE
  naf?: string; // code activite principale
};

const GEO_URL = "https://api-adresse.data.gouv.fr/search";
const NEAR_URL = "https://recherche-entreprises.api.gouv.fr/near_point";

async function geocode(address: string): Promise<{ lat: number; lon: number; label: string } | null> {
  const res = await fetch(`${GEO_URL}/?q=${encodeURIComponent(address)}&limit=1`);
  if (!res.ok) return null;
  const json: any = await res.json();
  const f = json.features?.[0];
  if (!f) return null;
  const [lon, lat] = f.geometry.coordinates;
  return { lat, lon, label: f.properties.label };
}

// Distance en metres entre 2 points GPS.
function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

// Geocode l'adresse puis liste les entreprises dans le rayon (defaut ~400m), triees par distance.
export async function neighbors(address: string, radiusM = 400, limit = 15): Promise<Neighbor[]> {
  const geo = await geocode(address);
  if (!geo) return []; // adresse introuvable -> pas de voisins

  const radiusKm = Math.max(0.1, radiusM / 1000);
  const res = await fetch(`${NEAR_URL}?lat=${geo.lat}&long=${geo.lon}&radius=${radiusKm}&per_page=25&page=1`);
  if (!res.ok) throw new Error(`near_point ${res.status}: ${await res.text()}`);
  const json: any = await res.json();

  const out: Neighbor[] = [];
  for (const r of json.results ?? []) {
    const e = r.matching_etablissements?.[0];
    if (!e || e.latitude == null || e.longitude == null) continue;
    out.push({
      name: r.nom_complet,
      address: e.adresse,
      distance_m: haversineM(geo.lat, geo.lon, Number(e.latitude), Number(e.longitude)),
      siret: e.siret,
      commune: e.libelle_commune ?? e.commune,
      category: r.categorie_entreprise,
      effectif: r.tranche_effectif_salarie,
      naf: r.activite_principale,
    });
  }

  // dedupe par nom + tri par distance croissante + limite
  const seen = new Set<string>();
  return out
    .filter((n) => (seen.has(n.name) ? false : (seen.add(n.name), true)))
    .sort((a, b) => a.distance_m - b.distance_m)
    .slice(0, limit);
}
