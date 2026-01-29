-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create hair_profiles table for questionnaire responses
CREATE TABLE public.hair_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Hair characteristics
  hair_type TEXT NOT NULL, -- 3A, 3B, 3C, 4A, 4B, 4C
  hair_texture TEXT NOT NULL, -- Fine, Medium, Coarse
  hair_porosity TEXT NOT NULL, -- Low, Normal, High
  hair_density TEXT NOT NULL, -- Low, Medium, High
  hair_length TEXT NOT NULL, -- Short, Medium, Long
  -- Hair concerns (stored as array)
  hair_concerns TEXT[] DEFAULT '{}',
  -- Scalp conditions
  scalp_condition TEXT NOT NULL, -- Normal, Dry, Oily, Sensitive, Dandruff
  scalp_concerns TEXT[] DEFAULT '{}',
  -- Health context
  health_conditions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  medications TEXT,
  hormonal_status TEXT, -- None, Postpartum, Menopause, PCOS, etc.
  -- Environment
  climate TEXT NOT NULL, -- Humid, Dry, Temperate, Tropical
  water_type TEXT NOT NULL, -- Soft, Hard, Unknown
  sun_exposure TEXT NOT NULL, -- Low, Moderate, High
  -- Lifestyle
  exercise_frequency TEXT NOT NULL, -- Rarely, Weekly, Daily
  heat_styling_frequency TEXT NOT NULL, -- Never, Rarely, Weekly, Daily
  current_routine_frequency TEXT, -- How often they wash
  budget_preference TEXT, -- Budget, Mid-range, Premium
  product_preferences TEXT[] DEFAULT '{}', -- Natural, Silicone-free, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hair_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for hair_profiles
CREATE POLICY "Users can view their own hair profile" ON public.hair_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own hair profile" ON public.hair_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own hair profile" ON public.hair_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own hair profile" ON public.hair_profiles FOR DELETE USING (auth.uid() = user_id);

-- Create routines table for AI-generated routines
CREATE TABLE public.routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hair_profile_id UUID REFERENCES public.hair_profiles(id) ON DELETE SET NULL,
  routine_name TEXT NOT NULL DEFAULT 'My Hair Routine',
  -- Routine content (JSON for flexibility)
  wash_day_routine JSONB NOT NULL DEFAULT '{}',
  weekly_routine JSONB NOT NULL DEFAULT '{}',
  monthly_routine JSONB NOT NULL DEFAULT '{}',
  -- Recommendations
  dos TEXT[] DEFAULT '{}',
  donts TEXT[] DEFAULT '{}',
  ingredient_guidance JSONB DEFAULT '{}',
  educational_tips TEXT[] DEFAULT '{}',
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  ai_generated BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- Policies for routines
CREATE POLICY "Users can view their own routines" ON public.routines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own routines" ON public.routines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own routines" ON public.routines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own routines" ON public.routines FOR DELETE USING (auth.uid() = user_id);

-- Create ingredient_checks table for ingredient compatibility history
CREATE TABLE public.ingredient_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT,
  ingredients_input TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  flagged_ingredients JSONB DEFAULT '[]',
  safe_ingredients JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ingredient_checks ENABLE ROW LEVEL SECURITY;

-- Policies for ingredient_checks
CREATE POLICY "Users can view their own ingredient checks" ON public.ingredient_checks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ingredient checks" ON public.ingredient_checks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ingredient checks" ON public.ingredient_checks FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hair_profiles_updated_at BEFORE UPDATE ON public.hair_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON public.routines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();