/**
 * Relative score normalization.
 *
 * Given a set of scored products, linearly stretch each subscore so the
 * collection spans 50–100. The raw DB values are never mutated — this is
 * a display-only transform.
 *
 * When only one product is scored, or all products share the same raw
 * value for a subscore, that value is kept as-is (no artificial spread).
 */

/** Keys we normalize (must exist on ScoreData-like objects). */
const SCORE_KEYS = [
  'overall_score',
  'moisture_score',
  'scalp_care_score',
  'curl_definition_score',
  'frizz_control_score',
  'strength_repair_score',
  'ingredient_safety_score',
  'goal_alignment_score',
  'performance_score',
] as const;

export type ScoreKey = (typeof SCORE_KEYS)[number];

export interface NormalizableScore {
  product_id: string;
  overall_score: number;
  moisture_score: number | null;
  scalp_care_score: number | null;
  curl_definition_score: number | null;
  frizz_control_score: number | null;
  strength_repair_score: number | null;
  ingredient_safety_score: number | null;
  goal_alignment_score: number | null;
  performance_score: number | null;
  score_breakdown?: unknown;
}

/**
 * Return a **new** Map with normalised score objects.
 * Each subscore is linearly mapped so that, across all products:
 *   min raw → 50,  max raw → 100
 *
 * If fewer than 2 products are scored, or all values for a key are equal,
 * the raw value is preserved unchanged.
 */
export function normalizeScoresAcrossProducts<T extends NormalizableScore>(
  scoreMap: Map<string, T>,
): Map<string, T> {
  const entries = Array.from(scoreMap.values());
  if (entries.length < 2) return scoreMap; // nothing to normalise

  // Collect min/max per key
  const ranges: Record<string, { min: number; max: number }> = {};
  for (const key of SCORE_KEYS) {
    const vals = entries.map(e => (e as Record<string, unknown>)[key] as number | null).filter((v): v is number => v != null);
    if (vals.length < 2) continue;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    if (max - min < 1) continue; // effectively equal – skip
    ranges[key] = { min, max };
  }

  // Build normalised map
  const result = new Map<string, T>();
  for (const [pid, raw] of scoreMap.entries()) {
    const normalised = { ...raw };
    for (const key of SCORE_KEYS) {
      const r = ranges[key];
      if (!r) continue;
      const v = (raw as Record<string, unknown>)[key] as number | null;
      if (v == null) continue;
      // Linear map: raw min → 50, raw max → 100
      (normalised as Record<string, unknown>)[key] = Math.round(
        50 + ((v - r.min) / (r.max - r.min)) * 50,
      );
    }
    result.set(pid, normalised);
  }

  return result;
}

/**
 * Convenience: normalise a single product's scores given the full collection.
 * Returns the normalised score object for `productId`, or null.
 */
export function getNormalizedScore<T extends NormalizableScore>(
  scoreMap: Map<string, T>,
  productId: string,
): T | undefined {
  const normed = normalizeScoresAcrossProducts(scoreMap);
  return normed.get(productId);
}
