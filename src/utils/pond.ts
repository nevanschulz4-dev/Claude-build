/** The home pond's starting radius, before any rating-based growth. */
export const POND_BASE_RADIUS = 6;
/** The largest the home pond can grow to at maximum pond rating. */
export const POND_MAX_RADIUS = 9.5;
/** Pond rating at which the pond reaches its maximum size. */
const RATING_FOR_MAX_SIZE = 90;

/** Computes the home pond's radius, which grows as the player unlocks more fish and decorations. */
export function getPondRadius(pondRating: number): number {
  const t = Math.min(1, Math.max(0, pondRating) / RATING_FOR_MAX_SIZE);
  return POND_BASE_RADIUS + t * (POND_MAX_RADIUS - POND_BASE_RADIUS);
}
