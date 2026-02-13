import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreBar } from '@/components/scoring/ScoreDisplay';
import { ChevronRight, Star, Loader2 } from 'lucide-react';

interface ProductScore {
  product_id: string;
  overall_score: number;
  moisture_score: number | null;
  scalp_care_score: number | null;
  curl_definition_score: number | null;
  frizz_control_score: number | null;
  strength_repair_score: number | null;
  product_name: string;
  product_brand: string | null;
}

export function RecommendationsWidget() {
  const [topProducts, setTopProducts] = useState<ProductScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchTopProducts();
  }, [user]);

  const fetchTopProducts = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data: scores } = await supabase
        .from('compatibility_scores')
        .select('product_id, overall_score, moisture_score, scalp_care_score, curl_definition_score, frizz_control_score, strength_repair_score')
        .eq('user_id', user.id)
        .order('overall_score', { ascending: false })
        .limit(5);

      if (!scores || scores.length === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch product names
      const productIds = scores.map(s => s.product_id);
      const { data: products } = await supabase
        .from('products')
        .select('id, name, brand')
        .in('id', productIds);

      const productMap = new Map((products || []).map(p => [p.id, p]));

      const combined: ProductScore[] = scores.map(s => ({
        ...s,
        product_name: productMap.get(s.product_id)?.name || 'Unknown Product',
        product_brand: productMap.get(s.product_id)?.brand || null,
      }));

      setTopProducts(combined);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (topProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Top Matches
          </CardTitle>
          <CardDescription>
            Score products to see your best matches here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4 text-sm">
              Browse the product catalog to discover your best matches.
            </p>
            <Button variant="outline" onClick={() => navigate('/products')} className="gap-2">
              Browse Products
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Top Matches
            </CardTitle>
            <CardDescription>Your best-matched products</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/products')} className="gap-1">
            View All
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.map((product, i) => (
            <button
              key={product.product_id}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => navigate(`/products/${product.product_id}`)}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {product.overall_score}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm truncate">
                  {product.product_name}
                </h4>
                {product.product_brand && (
                  <p className="text-xs text-muted-foreground">{product.product_brand}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  product.overall_score >= 75 ? 'bg-secondary/20 text-secondary' :
                  product.overall_score >= 50 ? 'bg-primary/20 text-primary' :
                  'bg-destructive/20 text-destructive'
                }`}>
                  {product.overall_score >= 75 ? 'Great' : product.overall_score >= 50 ? 'Fair' : 'Poor'} Match
                </span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
