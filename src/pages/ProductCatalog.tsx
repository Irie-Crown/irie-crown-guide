import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScoreBar } from '@/components/scoring/ScoreDisplay';
import {
  Sparkles,
  Search,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Filter,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  image_urls: string[] | null;
}

interface ScoreData {
  product_id: string;
  overall_score: number;
  moisture_score: number | null;
  scalp_care_score: number | null;
  curl_definition_score: number | null;
  frizz_control_score: number | null;
  strength_repair_score: number | null;
  ingredient_safety_score: number | null;
  goal_alignment_score: number | null;
  performance_score: number | null;
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [scores, setScores] = useState<Map<string, ScoreData>>(new Map());
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [scoringId, setScoringId] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, brand, category, image_urls')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setProducts(data || []);

      // Fetch existing scores for this user
      if (user) {
        const { data: scoreData } = await supabase
          .from('compatibility_scores')
          .select('product_id, overall_score, moisture_score, scalp_care_score, curl_definition_score, frizz_control_score, strength_repair_score, ingredient_safety_score, goal_alignment_score, performance_score')
          .eq('user_id', user.id);

        if (scoreData) {
          const map = new Map<string, ScoreData>();
          scoreData.forEach(s => map.set(s.product_id, s));
          setScores(map);
        }
      }
    } catch (error) {
      toast({
        title: 'Failed to load products',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scoreProduct = async (productId: string) => {
    if (!user) {
      toast({ title: 'Please sign in', variant: 'destructive' });
      return;
    }

    setScoringId(productId);
    try {
      const response = await supabase.functions.invoke('score-product', {
        body: { product_id: productId },
      });

      if (response.error) throw new Error(response.error.message);

      const scoreData = response.data;
      setScores(prev => {
        const next = new Map(prev);
        next.set(productId, { product_id: productId, ...scoreData });
        return next;
      });

      toast({ title: 'Score calculated!', description: `Overall: ${scoreData.overall_score}/100` });
    } catch (error) {
      toast({
        title: 'Scoring failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setScoringId(null);
    }
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || (p.brand?.toLowerCase().includes(q));
  });

  // Sort: scored products first (by score desc), then unscored
  const sorted = [...filtered].sort((a, b) => {
    const sa = scores.get(a.id)?.overall_score ?? -1;
    const sb = scores.get(b.id)?.overall_score ?? -1;
    return sb - sa;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">
              Product Catalog
            </span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name or brand..."
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
          <span>{products.length} products</span>
          <span>{scores.size} scored</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {search ? 'No products match your search.' : 'No products available yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map(product => {
              const score = scores.get(product.id);
              const isScoring = scoringId === product.id;

              return (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Score Circle */}
                      <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2" style={{
                        borderColor: score ? (
                          score.overall_score >= 75 ? 'hsl(var(--secondary))' :
                          score.overall_score >= 50 ? 'hsl(var(--primary))' :
                          'hsl(var(--destructive))'
                        ) : 'hsl(var(--border))',
                        backgroundColor: score ? (
                          score.overall_score >= 75 ? 'hsl(var(--secondary) / 0.1)' :
                          score.overall_score >= 50 ? 'hsl(var(--primary) / 0.1)' :
                          'hsl(var(--destructive) / 0.1)'
                        ) : 'hsl(var(--muted))',
                      }}>
                        {score ? (
                          <span className={`text-lg font-bold ${
                            score.overall_score >= 75 ? 'text-secondary' :
                            score.overall_score >= 50 ? 'text-primary' :
                            'text-destructive'
                          }`}>
                            {score.overall_score}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          {product.brand && (
                            <span className="text-sm text-muted-foreground">{product.brand}</span>
                          )}
                          {product.category && (
                            <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                              {product.category}
                            </span>
                          )}
                        </div>

                        {/* Score Bars */}
                        {score && (
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
                            <ScoreBar label="Moisture" score={score.moisture_score ?? 0} />
                            <ScoreBar label="Scalp Care" score={score.scalp_care_score ?? 0} />
                            <ScoreBar label="Curl Definition" score={score.curl_definition_score ?? 0} />
                            <ScoreBar label="Frizz Control" score={score.frizz_control_score ?? 0} />
                            <ScoreBar label="Strength" score={score.strength_repair_score ?? 0} />
                            <ScoreBar label="Safety" score={score.ingredient_safety_score ?? 0} />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant={score ? 'outline' : 'default'}
                          onClick={() => scoreProduct(product.id)}
                          disabled={isScoring}
                          className="gap-1"
                        >
                          {isScoring ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          {score ? 'Rescore' : 'Score'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="gap-1"
                        >
                          Details
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
