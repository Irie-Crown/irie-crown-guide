import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  ArrowLeft,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';

interface IngredientResult {
  name: string;
  status: 'safe' | 'caution' | 'avoid';
  reason: string;
  alternatives?: string[];
}

interface AnalysisResult {
  summary: string;
  ingredients: IngredientResult[];
  overallRating: 'good' | 'fair' | 'poor';
}

export default function IngredientChecker() {
  const [productName, setProductName] = useState('');
  const [ingredientsList, setIngredientsList] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!ingredientsList.trim()) {
      toast({
        title: 'Enter ingredients',
        description: 'Please paste or type the ingredient list to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await supabase.functions.invoke('analyze-ingredients', {
        body: {
          productName: productName.trim() || 'Unknown Product',
          ingredients: ingredientsList.trim(),
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setResult(response.data);

      toast({
        title: 'Analysis complete!',
        description: 'Check the results below.',
      });
    } catch (error) {
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusIcon = (status: IngredientResult['status']) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="h-5 w-5 text-secondary" />;
      case 'caution':
        return <AlertCircle className="h-5 w-5 text-accent" />;
      case 'avoid':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusColor = (status: IngredientResult['status']) => {
    switch (status) {
      case 'safe':
        return 'border-secondary/30 bg-secondary/5';
      case 'caution':
        return 'border-accent/30 bg-accent/5';
      case 'avoid':
        return 'border-destructive/30 bg-destructive/5';
    }
  };

  const getRatingColor = (rating: AnalysisResult['overallRating']) => {
    switch (rating) {
      case 'good':
        return 'bg-secondary text-secondary-foreground';
      case 'fair':
        return 'bg-accent text-accent-foreground';
      case 'poor':
        return 'bg-destructive text-destructive-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-display text-xl font-semibold text-foreground">
                Ingredient Checker
              </span>
            </div>
          </div>
          {isAuthenticated && (
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-display">Check Product Ingredients</CardTitle>
            <CardDescription>
              Paste the ingredient list from any hair product to see what's safe for your hair.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name (Optional)</Label>
              <Input
                id="productName"
                placeholder="e.g., Shea Moisture Coconut & Hibiscus Curl Enhancing Smoothie"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredient List</Label>
              <Textarea
                id="ingredients"
                placeholder="Paste the full ingredient list here, exactly as it appears on the product..."
                value={ingredientsList}
                onChange={(e) => setIngredientsList(e.target.value)}
                className="bg-background min-h-[150px]"
              />
            </div>

            <Button
              variant="hero"
              size="lg"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !ingredientsList.trim()}
              className="w-full gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Analyze Ingredients
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Overall Rating */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display">Analysis Results</CardTitle>
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-semibold capitalize ${getRatingColor(
                      result.overallRating
                    )}`}
                  >
                    {result.overallRating}
                  </span>
                </div>
                <CardDescription>{result.summary}</CardDescription>
              </CardHeader>
            </Card>

            {/* Ingredients Breakdown */}
            <div className="space-y-4">
              <h3 className="font-display text-xl font-semibold text-foreground">
                Ingredient Breakdown
              </h3>

              {/* Group by status */}
              {(['avoid', 'caution', 'safe'] as const).map((status) => {
                const statusIngredients = result.ingredients.filter(
                  (i) => i.status === status
                );
                if (statusIngredients.length === 0) return null;

                return (
                  <div key={status} className="space-y-3">
                    <h4 className="font-medium text-foreground flex items-center gap-2 capitalize">
                      {getStatusIcon(status)}
                      {status === 'safe' ? 'Safe Ingredients' : status === 'caution' ? 'Use with Caution' : 'Ingredients to Avoid'}
                      <span className="text-sm text-muted-foreground font-normal">
                        ({statusIngredients.length})
                      </span>
                    </h4>

                    <div className="grid gap-3">
                      {statusIngredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${getStatusColor(
                            ingredient.status
                          )}`}
                        >
                          <div className="flex items-start gap-3">
                            {getStatusIcon(ingredient.status)}
                            <div className="flex-1">
                              <h5 className="font-medium text-foreground">
                                {ingredient.name}
                              </h5>
                              <p className="text-sm text-muted-foreground mt-1">
                                {ingredient.reason}
                              </p>
                              {ingredient.alternatives &&
                                ingredient.alternatives.length > 0 && (
                                  <div className="mt-2 flex items-center gap-2 text-sm">
                                    <Info className="h-4 w-4 text-primary" />
                                    <span className="text-primary">
                                      Try instead: {ingredient.alternatives.join(', ')}
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Card when no results */}
        {!result && !isAnalyzing && (
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    How It Works
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Copy and paste the ingredient list from any hair product. Our AI will 
                    analyze each ingredient and tell you if it's safe, needs caution, or 
                    should be avoided based on common concerns for textured hair.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
