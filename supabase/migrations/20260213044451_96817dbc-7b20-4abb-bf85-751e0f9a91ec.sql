
-- Add hair_type_system column to track which classification system was used
-- Existing users with 3A-4C values are automatically Andre Walker users
ALTER TABLE public.hair_profiles
ADD COLUMN hair_type_system text DEFAULT NULL;

-- Make hair_type nullable so users can skip it
ALTER TABLE public.hair_profiles
ALTER COLUMN hair_type DROP NOT NULL;

-- Backfill existing profiles: they all used Andre Walker system
UPDATE public.hair_profiles
SET hair_type_system = 'AndreWalker'
WHERE hair_type IS NOT NULL AND hair_type != '';
