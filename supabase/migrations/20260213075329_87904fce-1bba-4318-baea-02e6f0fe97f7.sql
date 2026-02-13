
-- Ingredient rules table: stores deterministic scoring rules per ingredient
-- AI discovers these rules, then the scoring algorithm uses them deterministically
CREATE TABLE public.ingredient_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL, -- lowercase, trimmed for matching
  category TEXT, -- e.g. 'sulfate', 'silicone', 'oil', 'protein', 'humectant', 'preservative'
  
  -- Porosity compatibility scores (-5 to +5)
  porosity_low_score INTEGER NOT NULL DEFAULT 0,
  porosity_medium_score INTEGER NOT NULL DEFAULT 0,
  porosity_high_score INTEGER NOT NULL DEFAULT 0,
  
  -- Density compatibility scores (-5 to +5)
  density_thin_score INTEGER NOT NULL DEFAULT 0,
  density_medium_score INTEGER NOT NULL DEFAULT 0,
  density_thick_score INTEGER NOT NULL DEFAULT 0,
  
  -- Subcategory scores (-5 to +5, used in marketable scoring categories)
  moisture_score INTEGER NOT NULL DEFAULT 0,       -- Moisture & Hydration
  protein_score INTEGER NOT NULL DEFAULT 0,        -- Strength & Repair
  scalp_health_score INTEGER NOT NULL DEFAULT 0,   -- Scalp Care
  curl_definition_score INTEGER NOT NULL DEFAULT 0, -- Curl Definition & Hold
  frizz_control_score INTEGER NOT NULL DEFAULT 0,  -- Frizz Control
  
  -- Risk flags
  buildup_risk INTEGER NOT NULL DEFAULT 0,         -- 0-5 scale
  drying_risk INTEGER NOT NULL DEFAULT 0,          -- 0-5 scale
  irritation_risk INTEGER NOT NULL DEFAULT 0,      -- 0-5 scale
  
  -- Concern-specific impact (negative = bad for this concern)
  breakage_impact INTEGER NOT NULL DEFAULT 0,
  thinning_impact INTEGER NOT NULL DEFAULT 0,
  dandruff_impact INTEGER NOT NULL DEFAULT 0,
  color_treated_impact INTEGER NOT NULL DEFAULT 0,
  heat_damage_impact INTEGER NOT NULL DEFAULT 0,
  
  -- Climate modifiers
  humid_climate_modifier INTEGER NOT NULL DEFAULT 0,
  dry_climate_modifier INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  source TEXT NOT NULL DEFAULT 'ai', -- 'ai' or 'manual'
  confidence NUMERIC NOT NULL DEFAULT 0.8, -- 0-1, how confident the AI was
  notes TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(normalized_name)
);

-- Enable RLS
ALTER TABLE public.ingredient_rules ENABLE ROW LEVEL SECURITY;

-- Everyone can read rules (they're reference data)
CREATE POLICY "Anyone can view ingredient rules"
  ON public.ingredient_rules FOR SELECT
  USING (true);

-- Only admins can manage rules
CREATE POLICY "Admins can manage ingredient rules"
  ON public.ingredient_rules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Index for fast lookups
CREATE INDEX idx_ingredient_rules_normalized_name ON public.ingredient_rules (normalized_name);
CREATE INDEX idx_ingredient_rules_category ON public.ingredient_rules (category);

-- Trigger for updated_at
CREATE TRIGGER update_ingredient_rules_updated_at
  BEFORE UPDATE ON public.ingredient_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Also add scoring subcategory columns to compatibility_scores for marketable breakdowns
ALTER TABLE public.compatibility_scores
  ADD COLUMN IF NOT EXISTS moisture_score NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS scalp_care_score NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS curl_definition_score NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS frizz_control_score NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS strength_repair_score NUMERIC DEFAULT NULL;
