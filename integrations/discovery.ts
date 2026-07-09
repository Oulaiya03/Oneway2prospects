// Dev B : decouverte des boites voisines (bonus, apres le same-company).
// API Gouv (gratuite) : recherche-entreprises.api.gouv.fr (recherche par geo/adresse)
// Google Maps : geocode l'adresse du RDV.

export type Neighbor = { name: string; domain?: string; address: string; distance_m: number };

// Geocode l'adresse puis liste les entreprises dans le rayon (~400m).
export async function neighbors(address: string, radiusM = 400): Promise<Neighbor[]> {
  throw new Error("neighbors: a implementer (Dev B)");
}
