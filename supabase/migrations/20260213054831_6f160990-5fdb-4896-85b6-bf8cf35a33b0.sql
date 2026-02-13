
-- =============================================
-- PHASE 1: PRODUCT INTELLIGENCE DATABASE SCHEMA
-- =============================================

-- 1. Admin Role System
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles: admins can manage, users can read own
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Core Products Table (normalized, extensible)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  product_type TEXT,
  image_urls TEXT[] DEFAULT '{}',
  
  -- Manual override controls
  is_manual_entry BOOLEAN NOT NULL DEFAULT false,
  manual_override_active BOOLEAN NOT NULL DEFAULT false,
  auto_update_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Admin flags
  is_first_party BOOLEAN NOT NULL DEFAULT false,
  is_preferred BOOLEAN NOT NULL DEFAULT false,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  
  -- Extensible metadata (schema-agnostic)
  metadata JSONB DEFAULT '{}',
  
  -- Internal product identity for deduplication
  canonical_id TEXT UNIQUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Products: everyone can read active, admins can manage all
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  TO authenticated
  USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Retail Listings (multiple retailers per product)
CREATE TABLE public.retail_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  retailer TEXT NOT NULL,
  retailer_product_id TEXT,
  product_url TEXT,
  affiliate_url TEXT,
  price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  availability TEXT DEFAULT 'unknown',
  rating NUMERIC(3,2),
  review_count INTEGER DEFAULT 0,
  
  -- Raw retailer payload
  raw_data JSONB DEFAULT '{}',
  retailer_metadata JSONB DEFAULT '{}',
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.retail_listings ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_retail_listings_updated_at
  BEFORE UPDATE ON public.retail_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can view active listings"
  ON public.retail_listings FOR SELECT
  TO authenticated
  USING (is_active OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage listings"
  ON public.retail_listings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Product Ingredients (parsed, tagged)
CREATE TABLE public.product_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  raw_ingredients_text TEXT,
  parsed_ingredients JSONB DEFAULT '[]',
  
  -- Intelligence tags
  safety_flags JSONB DEFAULT '[]',
  compatibility_tags JSONB DEFAULT '{}',
  performance_tags JSONB DEFAULT '{}',
  formulation_characteristics JSONB DEFAULT '{}',
  
  -- Classifications
  moisture_protein_balance TEXT,
  weight_richness TEXT,
  scalp_friendliness TEXT,
  
  -- Admin enrichment
  admin_notes TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_product_ingredients_updated_at
  BEFORE UPDATE ON public.product_ingredients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can view ingredients"
  ON public.product_ingredients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage ingredients"
  ON public.product_ingredients FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Compatibility Scores (extensible scoring framework)
CREATE TABLE public.compatibility_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  hair_profile_id UUID REFERENCES public.hair_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Extensible scoring
  overall_score NUMERIC(5,2),
  score_breakdown JSONB DEFAULT '{}',
  score_explanation TEXT,
  
  -- Individual score dimensions
  ingredient_safety_score NUMERIC(5,2),
  performance_score NUMERIC(5,2),
  goal_alignment_score NUMERIC(5,2),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.compatibility_scores ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_compatibility_scores_updated_at
  BEFORE UPDATE ON public.compatibility_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can view their own scores"
  ON public.compatibility_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage scores"
  ON public.compatibility_scores FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 6. Purchase Pathways (flexible checkout)
CREATE TABLE public.purchase_pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  pathway_type TEXT NOT NULL,
  retailer TEXT,
  url TEXT,
  label TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_pathways ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_purchase_pathways_updated_at
  BEFORE UPDATE ON public.purchase_pathways
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can view active pathways"
  ON public.purchase_pathways FOR SELECT
  TO authenticated
  USING (is_active OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage pathways"
  ON public.purchase_pathways FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. User Product Feedback
CREATE TABLE public.product_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  would_repurchase BOOLEAN,
  review_text TEXT,
  outcome_tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

ALTER TABLE public.product_feedback ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_product_feedback_updated_at
  BEFORE UPDATE ON public.product_feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can manage their own feedback"
  ON public.product_feedback FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
  ON public.product_feedback FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 8. Product Click/Conversion Tracking
CREATE TABLE public.product_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  retailer TEXT,
  pathway_id UUID REFERENCES public.purchase_pathways(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own events"
  ON public.product_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own events"
  ON public.product_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_retail_listings_product ON public.retail_listings(product_id);
CREATE INDEX idx_retail_listings_retailer ON public.retail_listings(retailer);
CREATE INDEX idx_product_ingredients_product ON public.product_ingredients(product_id);
CREATE INDEX idx_compatibility_scores_product ON public.compatibility_scores(product_id);
CREATE INDEX idx_compatibility_scores_user ON public.compatibility_scores(user_id);
CREATE INDEX idx_purchase_pathways_product ON public.purchase_pathways(product_id);
CREATE INDEX idx_product_feedback_product ON public.product_feedback(product_id);
CREATE INDEX idx_product_events_product ON public.product_events(product_id);
CREATE INDEX idx_product_events_type ON public.product_events(event_type);
