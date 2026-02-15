import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductScoreCard } from '@/components/scoring/ProductScoreCard';
import { normalizeScoresAcrossProducts } from '@/lib/normalizeScores';
import { Sparkles, Search, Loader2, ArrowLeft } from 'lucide-react';

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
  const [hairType, setHairType] = useState<string | null>(null);

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

      if (user) {
        // Fetch scores and hair profile in parallel
        const [scoreRes, profileRes] = await Promise.all([
          supabase
            .from('compatibility_scores')
            .select('product_id, overall_score, moisture_score, scalp_care_score, curl_definition_score, frizz_control_score, strength_repair_score, ingredient_safety_score, goal_alignment_score, performance_score')
            .eq('user_id', user.id),
          supabase
            .from('hair_profiles')
            .select('hair_type')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (scoreRes.data) {
          const map = new Map<string, ScoreData>();
          scoreRes.data.forEach(s => map.set(s.product_id, s));
          setScores(map);
        }

        if (profileRes.data?.hair_type) {
          setHairType(profileRes.data.hair_type);
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

  // Normalise scores so subscores spread across 50-100 relative to each other
  const normalizedScores = useMemo(() => normalizeScoresAcrossProducts(scores), [scores]);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || (p.brand?.toLowerCase().includes(q));
  });

  const sorted = [...filtered].sort((a, b) => {
    const sa = normalizedScores.get(a.id)?.overall_score ?? -1;
    const sb = normalizedScores.get(b.id)?.overall_score ?? -1;
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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map(product => (
              <ProductScoreCard
                key={product.id}
                product={product}
                score={normalizedScores.get(product.id)}
                isScoring={scoringId === product.id}
                hairType={hairType}
                onScore={scoreProduct}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
