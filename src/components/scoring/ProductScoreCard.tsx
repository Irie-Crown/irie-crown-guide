import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreBar } from '@/components/scoring/ScoreDisplay';
import {
  SCORE_CATEGORIES,
  getCategoryLabel,
  getCategoryTooltip,
} from '@/components/scoring/scoreCategories';
import { Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  image_urls: string[] | null;
}

interface ProductScoreCardProps {
  product: Product;
  score?: ScoreData;
  isScoring: boolean;
  hairType?: string | null;
  onScore: (productId: string) => void;
}

export function ProductScoreCard({ product, score, isScoring, hairType, onScore }: ProductScoreCardProps) {
  const navigate = useNavigate();

  const healthCats = SCORE_CATEGORIES.filter(c => c.group === 'health');
  const styleCats = SCORE_CATEGORIES.filter(c => c.group === 'style');

  const getScoreValue = (key: string): number | null => {
    if (!score) return null;
    return (score as unknown as Record<string, unknown>)[key] as number | null;
  };

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow h-full">
      {/* Header with score circle */}
      <div className="p-4 pb-2 flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2"
          style={{
            borderColor: score
              ? score.overall_score >= 75 ? 'hsl(var(--secondary))'
              : score.overall_score >= 50 ? 'hsl(var(--primary))'
              : 'hsl(var(--destructive))'
              : 'hsl(var(--border))',
            backgroundColor: score
              ? score.overall_score >= 75 ? 'hsl(var(--secondary) / 0.1)'
              : score.overall_score >= 50 ? 'hsl(var(--primary) / 0.1)'
              : 'hsl(var(--destructive) / 0.1)'
              : 'hsl(var(--muted))',
          }}
        >
          {score ? (
            <span className={`text-base font-bold ${
              score.overall_score >= 75 ? 'text-secondary'
              : score.overall_score >= 50 ? 'text-primary'
              : 'text-destructive'
            }`}>
              {score.overall_score}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {product.brand && (
              <span className="text-xs text-muted-foreground">{product.brand}</span>
            )}
            {product.category && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {product.category}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      {score && (
        <CardContent className="px-4 pt-2 pb-3 flex-1 space-y-3">
          {/* Health & Safety */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
              Health & Safety
            </p>
            <div className="space-y-1.5">
              {healthCats.map(cat => {
                const val = getScoreValue(cat.key);
                if (val == null) return null;
                return (
                  <ScoreBar
                    key={cat.key}
                    label={getCategoryLabel(cat, hairType)}
                    score={val}
                    tooltip={getCategoryTooltip(cat, hairType)}
                  />
                );
              })}
            </div>
          </div>

          {/* Style & Utility */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
              Style & Utility
            </p>
            <div className="space-y-1.5">
              {styleCats.map(cat => {
                const val = getScoreValue(cat.key);
                if (val == null) return null;
                return (
                  <ScoreBar
                    key={cat.key}
                    label={getCategoryLabel(cat, hairType)}
                    score={val}
                    tooltip={getCategoryTooltip(cat, hairType)}
                  />
                );
              })}
            </div>
          </div>
        </CardContent>
      )}

      {/* Actions */}
      <div className="p-4 pt-2 mt-auto flex gap-2">
        <Button
          size="sm"
          variant={score ? 'outline' : 'default'}
          onClick={() => onScore(product.id)}
          disabled={isScoring}
          className="gap-1 flex-1"
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
    </Card>
  );
}
