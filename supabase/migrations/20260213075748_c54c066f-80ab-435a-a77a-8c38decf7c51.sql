
-- Add unique constraint for upsert support on compatibility_scores
ALTER TABLE public.compatibility_scores
  ADD CONSTRAINT compatibility_scores_user_product_unique UNIQUE (user_id, product_id);
