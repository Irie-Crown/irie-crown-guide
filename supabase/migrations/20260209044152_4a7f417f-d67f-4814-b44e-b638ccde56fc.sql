-- Add missing UPDATE policy for ingredient_checks table
CREATE POLICY "Users can update their own ingredient checks"
ON public.ingredient_checks
FOR UPDATE
USING (auth.uid() = user_id);