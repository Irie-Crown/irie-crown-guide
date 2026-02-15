/**
 * Score category definitions with tooltips and context-aware labels.
 * Labels adapt based on hair type (e.g. 4c hair uses different terminology).
 */

export interface ScoreCategory {
  key: string;
  label: string;
  /** Alternate label for type 4 (4a–4c) coily hair */
  label4c?: string;
  tooltip: string;
  /** Alternate tooltip for type 4 hair */
  tooltip4c?: string;
  group: 'health' | 'style';
}

export const SCORE_CATEGORIES: ScoreCategory[] = [
  // Health & Safety group
  {
    key: 'ingredient_safety_score',
    label: 'Safety',
    tooltip: 'How gentle the ingredients are — low buildup, drying, and irritation risk based on your scalp and sensitivity profile.',
    group: 'health',
  },
  {
    key: 'scalp_care_score',
    label: 'Scalp Care',
    tooltip: 'How well the formula supports scalp health, including oil balance, soothing, and anti-inflammatory properties.',
    group: 'health',
  },
  {
    key: 'strength_repair_score',
    label: 'Strength & Repair',
    tooltip: 'Protein and bond-repair support to reduce breakage and improve elasticity — weighted to your hair density and damage concerns.',
    group: 'health',
  },
  {
    key: 'moisture_score',
    label: 'Moisture',
    tooltip: 'Hydration delivery and retention — how well the humectants, emollients, and occlusives match your porosity level.',
    group: 'health',
  },

  // Style & Utility group
  {
    key: 'curl_definition_score',
    label: 'Curl Definition',
    label4c: 'Coil Pattern',
    tooltip: 'How well this product defines curls and reduces undefined texture using hold agents and film-formers.',
    tooltip4c: 'How well this product supports coil clumping, elongation, and pattern visibility — not "curl" in the wavy sense.',
    group: 'style',
  },
  {
    key: 'frizz_control_score',
    label: 'Frizz Control',
    label4c: 'Shrinkage & Seal',
    tooltip: 'Anti-frizz and smoothing capability from silicones, oils, and humidity-resistant agents.',
    tooltip4c: 'How well the formula seals moisture and manages shrinkage — for coily hair, "frizz" is often just natural texture.',
    group: 'style',
  },
  {
    key: 'goal_alignment_score',
    label: 'Profile Match',
    tooltip: 'How well this product matches your specific hair profile — porosity, density, climate, and stated concerns.',
    group: 'style',
  },
  {
    key: 'performance_score',
    label: 'Performance',
    tooltip: 'Weighted composite of moisture, definition, frizz control, strength, and scalp care — your overall utility score.',
    group: 'style',
  },
];

/**
 * Returns whether a hair type is in the type 4 (coily) range.
 */
export function isType4Hair(hairType: string | null | undefined): boolean {
  if (!hairType) return false;
  const t = hairType.toLowerCase().trim();
  return t.startsWith('4') || t === 'coily' || t === 'kinky';
}

/**
 * Get the display label for a score category, adapting for hair type.
 */
export function getCategoryLabel(cat: ScoreCategory, hairType?: string | null): string {
  if (isType4Hair(hairType) && cat.label4c) return cat.label4c;
  return cat.label;
}

/**
 * Get the tooltip for a score category, adapting for hair type.
 */
export function getCategoryTooltip(cat: ScoreCategory, hairType?: string | null): string {
  if (isType4Hair(hairType) && cat.tooltip4c) return cat.tooltip4c;
  return cat.tooltip;
}
