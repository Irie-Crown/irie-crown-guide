import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreBar } from '@/components/scoring/ScoreDisplay';
import {
  SCORE_CATEGORIES,
  getCategoryLabel,
  getCategoryTooltip,
} from '@/components/scoring/scoreCategories';
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Leaf,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { normalizeScoresAcrossProducts, type NormalizableScore } from '@/lib/normalizeScores';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  image_urls: string[] | null;
}

interface IngredientContribution {
  ingredient: string;
  score: number;
}

interface SubcategoryDetail {
  score: number;
  positive_contributors: IngredientContribution[];
}

interface ScoreData {
  overall_score: number;
  moisture_score: number | null;
  scalp_care_score: number | null;
  curl_definition_score: number | null;
  frizz_control_score: number | null;
  strength_repair_score: number | null;
  ingredient_safety_score: number | null;
  goal_alignment_score: number | null;
  performance_score: number | null;
  score_breakdown: {
    coverage_ratio?: number;
    avg_confidence?: number;
    matched_count?: number;
    total_count?: number;
    subcategory_details?: Record<string, SubcategoryDetail>;
  } | null;
  score_explanation: string | null;
}

interface PurchasePathway {
  id: string;
  url: string | null;
  retailer: string | null;
  label: string | null;
  is_primary: boolean;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [score, setScore] = useState<ScoreData | null>(null);
  const [allScores, setAllScores] = useState<Map<string, NormalizableScore>>(new Map());
  const [pathways, setPathways] = useState<PurchasePathway[]>([]);
  const [hairType, setHairType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScoring, setIsScoring] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) fetchProduct();
  }, [id, user]);

  const fetchProduct = async () => {
    if (!id) return;
    setIsLoading(true);

    try {
      const productQuery = supabase.from('products').select('id, name, brand, category, description, image_urls').eq('id', id).single();
      const pathwayQuery = supabase.from('purchase_pathways').select('id, url, retailer, label, is_primary').eq('product_id', id).eq('is_active', true);
      const profileQuery = user
        ? supabase.from('hair_profiles').select('hair_type').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
        : null;

      const [productRes, pathwayRes, profileRes] = await Promise.all([
        productQuery,
        pathwayQuery,
        profileQuery,
      ]);

      if (productRes.error) throw productRes.error;
      setProduct(productRes.data);
      setPathways(pathwayRes.data || []);

      if (profileRes?.data?.hair_type) {
        setHairType(profileRes.data.hair_type);
      }

      if (user) {
        const [scoreRes, allScoreRes] = await Promise.all([
          supabase
            .from('compatibility_scores')
            .select('overall_score, moisture_score, scalp_care_score, curl_definition_score, frizz_control_score, strength_repair_score, ingredient_safety_score, goal_alignment_score, performance_score, score_breakdown, score_explanation')
            .eq('product_id', id)
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('compatibility_scores')
            .select('product_id, overall_score, moisture_score, scalp_care_score, curl_definition_score, frizz_control_score, strength_repair_score, ingredient_safety_score, goal_alignment_score, performance_score')
            .eq('user_id', user.id),
        ]);

        if (scoreRes.data) setScore(scoreRes.data as unknown as ScoreData);

        if (allScoreRes.data) {
          const map = new Map<string, NormalizableScore>();
          allScoreRes.data.forEach(s => map.set(s.product_id, s as NormalizableScore));
          setAllScores(map);
        }
      }
    } catch (error) {
      toast({ title: 'Product not found', variant: 'destructive' });
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScore = async () => {
    if (!id || !user) return;
    setIsScoring(true);

    try {
      const response = await supabase.functions.invoke('score-product', {
        body: { product_id: id },
      });

      if (response.error) throw new Error(response.error.message);
      const newScore = response.data;
      setScore(newScore);

      // Update allScores so normalization recalculates immediately
      setAllScores(prev => {
        const next = new Map(prev);
        next.set(id, {
          product_id: id,
          overall_score: newScore.overall_score,
          moisture_score: newScore.moisture_score,
          scalp_care_score: newScore.scalp_care_score,
          curl_definition_score: newScore.curl_definition_score,
          frizz_control_score: newScore.frizz_control_score,
          strength_repair_score: newScore.strength_repair_score,
          ingredient_safety_score: newScore.ingredient_safety_score,
          goal_alignment_score: newScore.goal_alignment_score,
          performance_score: newScore.performance_score,
        } as NormalizableScore);
        return next;
      });

      toast({ title: 'Score updated!', description: `Overall match: ${newScore.overall_score}/100` });
    } catch (error) {
      toast({
        title: 'Scoring failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsScoring(false);
    }
  };

  // Normalize scores relative to all scored products (must be before early returns)
  const normalizedScores = useMemo(() => normalizeScoresAcrossProducts(allScores), [allScores]);
  const normalizedCurrent = id ? normalizedScores.get(id) : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) return null;

  const healthCats = SCORE_CATEGORIES.filter(c => c.group === 'health');
  const styleCats = SCORE_CATEGORIES.filter(c => c.group === 'style');

  const getScoreValue = (key: string): number | null => {
    if (!score) return null;
    if (normalizedCurrent) {
      const normed = (normalizedCurrent as unknown as Record<string, unknown>)[key] as number | null;
      if (normed != null) return normed;
    }
    return (score as unknown as Record<string, unknown>)[key] as number | null;
  };

  const getOverallScore = (): number => {
    if (normalizedCurrent) return normalizedCurrent.overall_score;
    return score?.overall_score ?? 0;
  };

  const getContributors = (key: string): IngredientContribution[] => {
    const details = score?.score_breakdown?.subcategory_details;
    if (!details || !details[key]) return [];
    return details[key].positive_contributors || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/products')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Button>
          <Button
            variant={score ? 'outline' : 'default'}
            onClick={handleScore}
            disabled={isScoring}
            className="gap-2"
          >
            {isScoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {score ? 'Rescore' : 'Check Compatibility'}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Product Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            {score && (() => {
              const os = getOverallScore();
              return (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 border-2" style={{
                  borderColor: os >= 75 ? 'hsl(var(--secondary))' :
                    os >= 50 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
                  backgroundColor: os >= 75 ? 'hsl(var(--secondary) / 0.1)' :
                    os >= 50 ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--destructive) / 0.1)',
                }}>
                  <span className={`text-2xl font-bold ${
                    os >= 75 ? 'text-secondary' :
                    os >= 50 ? 'text-primary' : 'text-destructive'
                  }`}>
                    {os}
                  </span>
                </div>
              );
            })()}
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {product.brand && <span className="text-muted-foreground">{product.brand}</span>}
                {product.category && (
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                )}
              </div>
              {product.description && (
                <p className="text-muted-foreground mt-2 text-sm">{product.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Score Explanation */}
        {score?.score_explanation && (
          <Card className="mb-6 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-0">
            <CardContent className="pt-6">
              <p className="text-foreground">{score.score_explanation}</p>
            </CardContent>
          </Card>
        )}

        {/* Score Breakdown - Health & Safety */}
        {score && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Health & Safety</CardTitle>
              <CardDescription>Clinical and ingredient safety metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthCats.map(cat => {
                const val = getScoreValue(cat.key);
                if (val == null) return null;
                const contributors = getContributors(cat.key);
                return (
                  <div key={cat.key}>
                    <ScoreBar
                      label={getCategoryLabel(cat, hairType)}
                      score={val}
                      tooltip={getCategoryTooltip(cat, hairType)}
                    />
                    {contributors.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5 ml-0.5">
                        {contributors.map(c => (
                          <TooltipProvider key={c.ingredient} delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-secondary/10 text-secondary rounded-full cursor-help hover:bg-secondary/20 transition-colors">
                                  <Leaf className="h-2.5 w-2.5" />
                                  {c.ingredient}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[220px] text-xs">
                                Boosts {getCategoryLabel(cat, hairType).toLowerCase()} (+{c.score})
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Score Breakdown - Style & Utility */}
        {score && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Style & Utility</CardTitle>
              <CardDescription>How well this product serves your styling needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {styleCats.map(cat => {
                const val = getScoreValue(cat.key);
                if (val == null) return null;
                const contributors = getContributors(cat.key);
                return (
                  <div key={cat.key}>
                    <ScoreBar
                      label={getCategoryLabel(cat, hairType)}
                      score={val}
                      tooltip={getCategoryTooltip(cat, hairType)}
                    />
                    {contributors.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5 ml-0.5">
                        {contributors.map(c => (
                          <TooltipProvider key={c.ingredient} delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-secondary/10 text-secondary rounded-full cursor-help hover:bg-secondary/20 transition-colors">
                                  <Leaf className="h-2.5 w-2.5" />
                                  {c.ingredient}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[220px] text-xs">
                                Boosts {getCategoryLabel(cat, hairType).toLowerCase()} (+{c.score})
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Coverage Info */}
        {score?.score_breakdown && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-base">Analysis Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Ingredients Analyzed</span>
                  <p className="font-semibold text-foreground">
                    {score.score_breakdown.matched_count ?? 0} / {score.score_breakdown.total_count ?? 0}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Coverage</span>
                  <p className="font-semibold text-foreground">
                    {score.score_breakdown.coverage_ratio ?? 0}%
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Confidence</span>
                  <p className="font-semibold text-foreground">
                    {score.score_breakdown.avg_confidence ?? 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Links */}
        {pathways.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Where to Buy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pathways.map(p => (
                  <a
                    key={p.id}
                    href={p.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div>
                      <span className="font-medium text-foreground">
                        {p.label || p.retailer || 'Buy Now'}
                      </span>
                      {p.is_primary && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Score CTA */}
        {!score && (
          <Card className="border-primary/20">
            <CardContent className="text-center py-8">
              <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Check Compatibility
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                See how well this product matches your hair profile with our scoring engine.
              </p>
              <Button onClick={handleScore} disabled={isScoring} className="gap-2">
                {isScoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Score This Product
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
