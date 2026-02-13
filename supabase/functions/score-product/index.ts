import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface IngredientRule {
  normalized_name: string;
  category: string | null;
  porosity_low_score: number;
  porosity_medium_score: number;
  porosity_high_score: number;
  density_thin_score: number;
  density_medium_score: number;
  density_thick_score: number;
  moisture_score: number;
  protein_score: number;
  scalp_health_score: number;
  curl_definition_score: number;
  frizz_control_score: number;
  buildup_risk: number;
  drying_risk: number;
  irritation_risk: number;
  breakage_impact: number;
  thinning_impact: number;
  dandruff_impact: number;
  color_treated_impact: number;
  heat_damage_impact: number;
  humid_climate_modifier: number;
  dry_climate_modifier: number;
  confidence: number;
}

interface HairProfile {
  hair_porosity: string;
  hair_density: string;
  hair_concerns: string[] | null;
  scalp_condition: string;
  climate: string;
  hair_type: string | null;
}

interface ScoreResult {
  overall_score: number;
  moisture_score: number;
  scalp_care_score: number;
  curl_definition_score: number;
  frizz_control_score: number;
  strength_repair_score: number;
  ingredient_safety_score: number;
  goal_alignment_score: number;
  performance_score: number;
  score_breakdown: Record<string, unknown>;
  score_explanation: string;
  missing_ingredients: string[];
}

function normalizeIngredientName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s\-]/g, '').trim();
}

function getPorosityScore(rule: IngredientRule, porosity: string): number {
  switch (porosity.toLowerCase()) {
    case 'low': return rule.porosity_low_score;
    case 'medium': case 'normal': return rule.porosity_medium_score;
    case 'high': return rule.porosity_high_score;
    default: return rule.porosity_medium_score;
  }
}

function getDensityScore(rule: IngredientRule, density: string): number {
  switch (density.toLowerCase()) {
    case 'thin': case 'fine': return rule.density_thin_score;
    case 'medium': return rule.density_medium_score;
    case 'thick': case 'coarse': return rule.density_thick_score;
    default: return rule.density_medium_score;
  }
}

function getClimateModifier(rule: IngredientRule, climate: string): number {
  const c = climate.toLowerCase();
  if (c.includes('humid') || c.includes('tropical')) return rule.humid_climate_modifier;
  if (c.includes('dry') || c.includes('arid')) return rule.dry_climate_modifier;
  return 0;
}

function getConcernImpact(rule: IngredientRule, concerns: string[]): number {
  let total = 0;
  let count = 0;
  for (const concern of concerns) {
    const c = concern.toLowerCase();
    if (c.includes('breakage') || c.includes('breaking')) { total += rule.breakage_impact; count++; }
    if (c.includes('thinning') || c.includes('thin')) { total += rule.thinning_impact; count++; }
    if (c.includes('dandruff') || c.includes('flak')) { total += rule.dandruff_impact; count++; }
    if (c.includes('color') || c.includes('dye')) { total += rule.color_treated_impact; count++; }
    if (c.includes('heat') || c.includes('damage')) { total += rule.heat_damage_impact; count++; }
  }
  return count > 0 ? total / count : 0;
}

function clampScore(score: number, min = 0, max = 100): number {
  return Math.round(Math.max(min, Math.min(max, score)));
}

function calculateScores(
  rules: IngredientRule[],
  profile: HairProfile,
  totalIngredientCount: number
): ScoreResult {
  const concerns = profile.hair_concerns || [];
  
  // Accumulate raw scores across all matched ingredients
  let totalMoisture = 0;
  let totalProtein = 0;
  let totalScalpHealth = 0;
  let totalCurlDef = 0;
  let totalFrizzControl = 0;
  let totalPorosityFit = 0;
  let totalDensityFit = 0;
  let totalClimateFit = 0;
  let totalConcernFit = 0;
  let totalBuildup = 0;
  let totalDrying = 0;
  let totalIrritation = 0;
  let totalConfidence = 0;
  
  // Weight ingredients by position (first ingredients have higher concentration)
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    // Position weight: first ingredient = 1.0, decays to 0.3 for later ones
    const positionWeight = Math.max(0.3, 1.0 - (i / totalIngredientCount) * 0.7);
    const w = positionWeight * rule.confidence;
    
    totalMoisture += rule.moisture_score * w;
    totalProtein += rule.protein_score * w;
    totalScalpHealth += rule.scalp_health_score * w;
    totalCurlDef += rule.curl_definition_score * w;
    totalFrizzControl += rule.frizz_control_score * w;
    totalPorosityFit += getPorosityScore(rule, profile.hair_porosity) * w;
    totalDensityFit += getDensityScore(rule, profile.hair_density) * w;
    totalClimateFit += getClimateModifier(rule, profile.climate) * w;
    totalConcernFit += getConcernImpact(rule, concerns) * w;
    totalBuildup += rule.buildup_risk * positionWeight;
    totalDrying += rule.drying_risk * positionWeight;
    totalIrritation += rule.irritation_risk * positionWeight;
    totalConfidence += rule.confidence;
  }
  
  const n = rules.length || 1;
  const avgConfidence = totalConfidence / n;
  
  // Normalize raw scores to 0-100 scale
  // Raw scores range roughly -5*n to +5*n, normalize by dividing by max possible
  const maxRaw = 5 * n;
  const norm = (raw: number) => clampScore(50 + (raw / maxRaw) * 50);
  
  const moistureScore = norm(totalMoisture);
  const strengthRepairScore = norm(totalProtein);
  const scalpCareScore = norm(totalScalpHealth);
  const curlDefScore = norm(totalCurlDef);
  const frizzControlScore = norm(totalFrizzControl);
  
  // Safety score: penalized by risks (buildup, drying, irritation)
  const maxRisk = 5 * n;
  const safetyPenalty = ((totalBuildup + totalDrying + totalIrritation) / (3 * maxRisk)) * 50;
  const ingredientSafetyScore = clampScore(100 - safetyPenalty);
  
  // Goal alignment: combination of porosity fit + density fit + concern impact + climate
  const goalRaw = totalPorosityFit + totalDensityFit + totalConcernFit + totalClimateFit;
  const goalAlignmentScore = norm(goalRaw);
  
  // Performance: weighted average of subcategory scores
  const performanceScore = clampScore(
    moistureScore * 0.25 +
    curlDefScore * 0.2 +
    frizzControlScore * 0.15 +
    strengthRepairScore * 0.2 +
    scalpCareScore * 0.2
  );
  
  // Coverage penalty: if we only matched a small fraction of ingredients
  const coverageRatio = rules.length / totalIngredientCount;
  const coveragePenalty = coverageRatio < 0.5 ? (1 - coverageRatio) * 10 : 0;
  
  // Overall score: weighted combination
  const overallScore = clampScore(
    ingredientSafetyScore * 0.25 +
    goalAlignmentScore * 0.25 +
    performanceScore * 0.3 +
    moistureScore * 0.1 +
    scalpCareScore * 0.1 -
    coveragePenalty
  );
  
  // Build explanation
  const explanations: string[] = [];
  if (ingredientSafetyScore >= 80) explanations.push("Ingredients are generally safe for your hair type.");
  else if (ingredientSafetyScore < 50) explanations.push("Some ingredients may be problematic — check buildup and drying risks.");
  
  if (goalAlignmentScore >= 75) explanations.push("Good match for your porosity, density, and concerns.");
  else if (goalAlignmentScore < 50) explanations.push("This product may not align well with your hair profile.");
  
  if (coverageRatio < 0.5) {
    explanations.push(`Only ${Math.round(coverageRatio * 100)}% of ingredients have been analyzed. Score confidence is lower.`);
  }

  return {
    overall_score: overallScore,
    moisture_score: moistureScore,
    scalp_care_score: scalpCareScore,
    curl_definition_score: curlDefScore,
    frizz_control_score: frizzControlScore,
    strength_repair_score: strengthRepairScore,
    ingredient_safety_score: ingredientSafetyScore,
    goal_alignment_score: goalAlignmentScore,
    performance_score: performanceScore,
    score_breakdown: {
      coverage_ratio: Math.round(coverageRatio * 100),
      avg_confidence: Math.round(avgConfidence * 100),
      matched_count: rules.length,
      total_count: totalIngredientCount,
      risk_summary: {
        buildup: Math.round((totalBuildup / maxRisk) * 100),
        drying: Math.round((totalDrying / maxRisk) * 100),
        irritation: Math.round((totalIrritation / maxRisk) * 100),
      },
    },
    score_explanation: explanations.join(" "),
    missing_ingredients: [],
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // === Auth middleware ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    // === End auth middleware ===

    const body = await req.json();
    const { product_id } = body;

    if (!product_id || typeof product_id !== 'string') {
      return new Response(
        JSON.stringify({ error: "product_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch hair profile, product ingredients, and ingredient rules in parallel
    const [profileRes, ingredientsRes] = await Promise.all([
      supabase
        .from('hair_profiles')
        .select('id, hair_porosity, hair_density, hair_concerns, scalp_condition, climate, hair_type')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('product_ingredients')
        .select('raw_ingredients_text, parsed_ingredients')
        .eq('product_id', product_id)
        .maybeSingle(),
    ]);

    if (!profileRes.data) {
      return new Response(
        JSON.stringify({ error: "No hair profile found. Complete the questionnaire first." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!ingredientsRes.data) {
      return new Response(
        JSON.stringify({ error: "No ingredients data for this product." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profile = profileRes.data as HairProfile;
    const ingredientData = ingredientsRes.data;

    // Parse ingredient names from product
    let ingredientNames: string[] = [];
    if (ingredientData.parsed_ingredients && Array.isArray(ingredientData.parsed_ingredients)) {
      ingredientNames = (ingredientData.parsed_ingredients as Array<{ name?: string }>)
        .map((i) => i.name || '')
        .filter(Boolean);
    } else if (ingredientData.raw_ingredients_text) {
      ingredientNames = ingredientData.raw_ingredients_text
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    if (ingredientNames.length === 0) {
      return new Response(
        JSON.stringify({ error: "No parseable ingredients found for this product." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize and look up rules
    const normalizedNames = ingredientNames.map(normalizeIngredientName);
    const { data: rules } = await supabase
      .from('ingredient_rules')
      .select('*')
      .in('normalized_name', normalizedNames);

    const matchedRules = rules || [];
    const matchedNames = new Set(matchedRules.map((r: IngredientRule) => r.normalized_name));
    const missingIngredients = normalizedNames.filter(n => !matchedNames.has(n));

    // Calculate deterministic scores
    // Order matched rules by their position in the original ingredient list
    const orderedRules = normalizedNames
      .map(n => matchedRules.find((r: IngredientRule) => r.normalized_name === n))
      .filter(Boolean) as IngredientRule[];

    const scores = calculateScores(orderedRules, profile, ingredientNames.length);
    scores.missing_ingredients = missingIngredients;

    // Upsert the score
    const { error: upsertError } = await supabase
      .from('compatibility_scores')
      .upsert({
        user_id: userId,
        product_id,
        hair_profile_id: profileRes.data.id || '',
        overall_score: scores.overall_score,
        performance_score: scores.performance_score,
        ingredient_safety_score: scores.ingredient_safety_score,
        goal_alignment_score: scores.goal_alignment_score,
        moisture_score: scores.moisture_score,
        scalp_care_score: scores.scalp_care_score,
        curl_definition_score: scores.curl_definition_score,
        frizz_control_score: scores.frizz_control_score,
        strength_repair_score: scores.strength_repair_score,
        score_breakdown: scores.score_breakdown,
        score_explanation: scores.score_explanation,
      }, {
        onConflict: 'user_id,product_id',
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error("Failed to save score:", upsertError);
      // Still return scores even if save fails
    }

    // If there are missing ingredients, trigger rule discovery async (fire and forget)
    if (missingIngredients.length > 0) {
      const discoverUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/discover-ingredient-rules`;
      fetch(discoverUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients: missingIngredients }),
      }).catch(err => console.error("Failed to trigger rule discovery:", err));
    }

    console.log(`Scored product ${product_id} for user ${userId}: ${scores.overall_score}/100 (${matchedRules.length}/${ingredientNames.length} ingredients matched)`);

    return new Response(JSON.stringify(scores), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("score-product error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
