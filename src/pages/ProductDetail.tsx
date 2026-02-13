import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreBar } from '@/components/scoring/ScoreDisplay';
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Target,
  Zap,
  Droplets,
  Leaf,
  Wind,
  FlaskConical,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  image_urls: string[] | null;
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
  score_breakdown: unknown;
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
  const [pathways, setPathways] = useState<PurchasePathway[]>([]);
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
      const queries = [
        supabase.from('products').select('id, name, brand, category, description, image_urls').eq('id', id).single(),
        supabase.from('purchase_pathways').select('id, url, retailer, label, is_primary').eq('product_id', id).eq('is_active', true),
      ];

      const [productRes, pathwayRes] = await Promise.all(queries);
      if (productRes.error) throw productRes.error;
      setProduct(productRes.data as Product);
      setPathways((pathwayRes.data as PurchasePathway[]) || []);

      // Fetch score if user is logged in
      if (user) {
        const { data: scoreData } = await supabase
          .from('compatibility_scores')
          .select('overall_score, moisture_score, scalp_care_score, curl_definition_score, frizz_control_score, strength_repair_score, ingredient_safety_score, goal_alignment_score, performance_score, score_breakdown, score_explanation')
          .eq('product_id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (scoreData) setScore(scoreData);
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
      setScore(response.data);
      toast({ title: 'Score updated!' });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) return null;

  const scoreCategories = score ? [
    { label: 'Moisture & Hydration', score: score.moisture_score ?? 0, icon: Droplets },
    { label: 'Scalp Care', score: score.scalp_care_score ?? 0, icon: Leaf },
    { label: 'Curl Definition', score: score.curl_definition_score ?? 0, icon: Wind },
    { label: 'Frizz Control', score: score.frizz_control_score ?? 0, icon: Sparkles },
    { label: 'Strength & Repair', score: score.strength_repair_score ?? 0, icon: FlaskConical },
    { label: 'Ingredient Safety', score: score.ingredient_safety_score ?? 0, icon: ShieldCheck },
    { label: 'Goal Alignment', score: score.goal_alignment_score ?? 0, icon: Target },
    { label: 'Performance', score: score.performance_score ?? 0, icon: Zap },
  ] : [];

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
            {score && (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 border-2" style={{
                borderColor: score.overall_score >= 75 ? 'hsl(var(--secondary))' :
                  score.overall_score >= 50 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
                backgroundColor: score.overall_score >= 75 ? 'hsl(var(--secondary) / 0.1)' :
                  score.overall_score >= 50 ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--destructive) / 0.1)',
              }}>
                <span className={`text-2xl font-bold ${
                  score.overall_score >= 75 ? 'text-secondary' :
                  score.overall_score >= 50 ? 'text-primary' : 'text-destructive'
                }`}>
                  {score.overall_score}
                </span>
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {product.brand && <span className="text-muted-foreground">{product.brand}</span>}
                {product.category && (
                  <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                    {product.category}
                  </span>
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

        {/* Score Breakdown */}
        {score && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display">Compatibility Breakdown</CardTitle>
              <CardDescription>How this product matches your hair profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {scoreCategories.map(cat => (
                  <div key={cat.label} className="flex items-center gap-3">
                    <cat.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <ScoreBar label={cat.label} score={cat.score} />
                    </div>
                  </div>
                ))}
              </div>
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
                    {(score.score_breakdown as Record<string, number>).matched_count ?? 0} / {(score.score_breakdown as Record<string, number>).total_count ?? 0}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Coverage</span>
                  <p className="font-semibold text-foreground">
                    {(score.score_breakdown as Record<string, number>).coverage_ratio ?? 0}%
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Confidence</span>
                  <p className="font-semibold text-foreground">
                    {(score.score_breakdown as Record<string, number>).avg_confidence ?? 0}%
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
