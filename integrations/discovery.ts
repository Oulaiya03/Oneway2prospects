// Dev B : decouverte des boites voisines (BONUS). Cible le levier "1 RDV -> 3" :
//   - meme batiment (autres etages/boites de la tour)  = tier "same_building"
//   - perimetre court (meme dalle, 200-300m)            = tier "nearby"
// 100% API Gouv, gratuit, SANS cle :
//   1) Geocode l'adresse du RDV -> lat/long        (API Adresse / BAN)
//   2) Entreprises autour du point -> /near_point   (recherche-entreprises)
//   3) Distance Haversine, classement par tier, filtre "clients potentiels", tri.

export type NeighborTier = "same_building" | "nearby";

export type Neighbor = {
  name: string;
  address: string;
  distance_m: number;
  tier: NeighborTier;
  domain?: string; // non fourni par l'API Gouv (enrichissable via FullEnrich)
  siret?: string;
  commune?: string;
  category?: string; // GE | ETI | PME
  effectif?: string; // tranche d'effectif INSEE
  naf?: string; // code activite principale
};

export type NearbyOptions = {
  perimeterM?: number; // rayon max de la tournee (defaut 250m)
  categories?: string[]; // filtre "clients potentiels" (defaut GE + ETI). [] = pas de filtre
  limit?: number; // nb max de voisins renvoyes (defaut 20)
  excludeCompany?: string; // exclut les entites de l'entreprise visitee (ex: "Allianz")
};

// Extrait la cle "numero + rue" d'un label BAN ("1 Cours Michelet 92800 Puteaux" -> "1 COURS MICHELET").
function streetKey(label: string): string {
  return label.split(/\s\d{5}\s/)[0].trim().toUpperCase();
}

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

async function nearPoint(lat: number, lon: number, radiusKm: number): Promise<any[]> {
  const res = await fetch(`${NEAR_URL}?lat=${lat}&long=${lon}&radius=${radiusKm}&per_page=25&page=1`);
  if (!res.ok) throw new Error(`near_point ${res.status}: ${await res.text()}`);
  return (await res.json()).results ?? [];
}

// Coeur : renvoie les voisins classes par tier (same_building d'abord), filtres + tries.
// same_building = MEME adresse exacte que le RDV (autres etages de la tour).
// nearby        = dans le perimetre (la tournee).
export async function prospectsNearby(address: string, opts: NearbyOptions = {}): Promise<Neighbor[]> {
  const perimeterM = opts.perimeterM ?? 250;
  const categories = opts.categories ?? ["GE", "ETI"];
  const limit = opts.limit ?? 20;

  const geo = await geocode(address);
  if (!geo) return []; // adresse introuvable
  const key = streetKey(geo.label);
  const exclude = opts.excludeCompany?.toUpperCase();

  // 2 requetes : petit rayon (surface le meme batiment, l'API ne trie pas par distance)
  // + rayon perimetre (la tournee). On fusionne et dedupe.
  const [close, wide] = await Promise.all([
    nearPoint(geo.lat, geo.lon, 0.08),
    nearPoint(geo.lat, geo.lon, Math.max(0.1, perimeterM / 1000)),
  ]);

  const seen = new Set<string>();
  const out: Neighbor[] = [];
  for (const r of [...close, ...wide]) {
    const e = r.matching_etablissements?.[0];
    if (!e || e.latitude == null || e.longitude == null) continue;
    if (categories.length && !categories.includes(r.categorie_entreprise)) continue; // clients potentiels
    if (exclude && r.nom_complet?.toUpperCase().includes(exclude)) continue; // pas l'entreprise visitee
    if (r.siren && seen.has(r.siren)) continue;
    if (r.siren) seen.add(r.siren);

    const addr = (e.adresse ?? "").toUpperCase();
    const sameBuilding = key.length > 0 && addr.includes(key);
    const distance_m = haversineM(geo.lat, geo.lon, Number(e.latitude), Number(e.longitude));
    if (!sameBuilding && distance_m > perimeterM) continue; // hors perimetre et pas meme adresse

    out.push({
      name: r.nom_complet,
      address: e.adresse,
      distance_m,
      tier: sameBuilding ? "same_building" : "nearby",
      siret: e.siret,
      commune: e.libelle_commune ?? e.commune,
      category: r.categorie_entreprise,
      effectif: r.tranche_effectif_salarie,
      naf: r.activite_principale,
    });
  }

  // same_building d'abord, puis par distance croissante.
  return out
    .sort((a, b) =>
      a.tier === b.tier ? a.distance_m - b.distance_m : a.tier === "same_building" ? -1 : 1,
    )
    .slice(0, limit);
}

// Variante groupee, pratique pour le front / l'agent.
export async function prospectsGrouped(
  address: string,
  opts: NearbyOptions = {},
): Promise<{ same_building: Neighbor[]; nearby: Neighbor[] }> {
  const all = await prospectsNearby(address, opts);
  return {
    same_building: all.filter((n) => n.tier === "same_building"),
    nearby: all.filter((n) => n.tier === "nearby"),
  };
}

// Compat : ancienne signature (voisins tries par distance, sans filtre de categorie).
export async function neighbors(address: string, radiusM = 400, limit = 15): Promise<Neighbor[]> {
  return prospectsNearby(address, { perimeterM: radiusM, categories: [], limit });
}
