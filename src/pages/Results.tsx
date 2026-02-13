import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResultsSkeleton } from '@/components/skeletons/ResultsSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  Loader2,
  Calendar,
  Clock,
  Droplets,
  Leaf,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface RoutineData {
  id: string;
  routine_name: string;
  wash_day_routine: unknown;
  weekly_routine: unknown;
  monthly_routine: unknown;
  dos: string[];
  donts: string[];
  ingredient_guidance: unknown;
  educational_tips: string[];
  created_at: string;
}

interface HairProfile {
  id: string;
  hair_type: string;
  hair_texture: string;
  hair_porosity: string;
  hair_density: string;
  hair_length: string;
  hair_concerns: string[];
  scalp_condition: string;
  climate: string;
}

export default function Results() {
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [hairProfile, setHairProfile] = useState<HairProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'wash' | 'weekly' | 'monthly'>('wash');

  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const [profileResult, routineResult] = await Promise.all([
        supabase
          .from('hair_profiles')
          .select('id, hair_type, hair_texture, hair_porosity, hair_density, hair_length, hair_concerns, scalp_condition, scalp_concerns, health_conditions, allergies, hormonal_status, climate, water_type, sun_exposure, exercise_frequency, heat_styling_frequency, budget_preference, product_preferences')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('routines')
          .select('id, routine_name, wash_day_routine, weekly_routine, monthly_routine, dos, donts, ingredient_guidance, educational_tips, created_at')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (!profileResult.data) {
        toast({
          title: 'No profile found',
          description: 'Please complete the hair profile questionnaire first.',
        });
        navigate('/questionnaire');
        return;
      }

      setHairProfile(profileResult.data);

      if (routineResult.data) {
        setRoutine(routineResult.data);
        setIsLoading(false);
      } else {
        await generateRoutine(profileResult.data);
      }
    } catch (error) {
      toast({
        title: 'Failed to load results',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const generateRoutine = async (profile: HairProfile) => {
    if (!user) return;

    setIsGenerating(true);

    try {
      const response = await supabase.functions.invoke('generate-routine', {
        body: { hairProfile: profile },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const routineContent = response.data;

      // Save the generated routine
      const { data: savedRoutine, error: saveError } = await supabase
        .from('routines')
        .insert({
          user_id: user.id,
          hair_profile_id: profile.id,
          routine_name: 'My Personalized Routine',
          wash_day_routine: routineContent.washDay || {},
          weekly_routine: routineContent.weekly || {},
          monthly_routine: routineContent.monthly || {},
          dos: routineContent.dos || [],
          donts: routineContent.donts || [],
          ingredient_guidance: routineContent.ingredients || {},
          educational_tips: routineContent.tips || [],
        })
        .select()
        .single();

      if (saveError) {
        throw saveError;
      }

      setRoutine(savedRoutine);
      toast({
        title: 'Routine generated!',
        description: 'Your personalized hair routine is ready.',
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const regenerateRoutine = async () => {
    if (!hairProfile || !user) return;

    try {
      await supabase
        .from('routines')
        .update({ is_active: false })
        .eq('user_id', user.id);

      await generateRoutine(hairProfile);
    } catch (error) {
      toast({
        title: 'Regeneration failed',
        description: 'Could not regenerate your routine. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading || isLoading) {
    return <ResultsSkeleton isGenerating={isGenerating} />;
  }

  const renderRoutineSection = (data: unknown) => {
    const routineData = data as Record<string, unknown> | null;
    if (!routineData || typeof routineData !== 'object' || Object.keys(routineData).length === 0) {
      return (
        <p className="text-muted-foreground text-center py-8">
          No routine data available yet.
        </p>
      );
    }

    return (
      <div className="space-y-6">
        {Object.entries(routineData).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <h4 className="font-semibold text-foreground capitalize">
              {key.replace(/_/g, ' ')}
            </h4>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {typeof value === 'string' ? (
                <ReactMarkdown>{value}</ReactMarkdown>
              ) : (
                <p>{JSON.stringify(value, null, 2)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">
              Your Routine
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="outline" onClick={regenerateRoutine} disabled={isGenerating} className="gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Summary */}
        {hairProfile && (
          <Card className="mb-8 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-0">
            <CardHeader>
              <CardTitle className="font-display">Your Hair Profile</CardTitle>
              <CardDescription>
                Routine customized for your unique hair
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {hairProfile.hair_type ? (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {hairProfile.hair_type}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                    No curl pattern set
                  </span>
                )}
                <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm font-medium">
                  {hairProfile.hair_texture} Texture
                </span>
                <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
                  {hairProfile.hair_porosity} Porosity
                </span>
                <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                  {hairProfile.climate} Climate
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Routine Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'wash', label: 'Wash Day', icon: Droplets },
            { id: 'weekly', label: 'Weekly Care', icon: Calendar },
            { id: 'monthly', label: 'Monthly Treatments', icon: Clock },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="gap-2 flex-shrink-0"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Routine Content */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            {activeTab === 'wash' && renderRoutineSection(routine?.wash_day_routine || {})}
            {activeTab === 'weekly' && renderRoutineSection(routine?.weekly_routine || {})}
            {activeTab === 'monthly' && renderRoutineSection(routine?.monthly_routine || {})}
          </CardContent>
        </Card>

        {/* Do's and Don'ts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-secondary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-secondary">
                <CheckCircle className="h-5 w-5" />
                Do's
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {routine?.dos?.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Leaf className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                )) || (
                  <li className="text-muted-foreground">No recommendations yet.</li>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Don'ts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {routine?.donts?.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                )) || (
                  <li className="text-muted-foreground">No warnings yet.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Educational Tips */}
        {routine?.educational_tips && routine.educational_tips.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Hair Knowledge
              </CardTitle>
              <CardDescription>
                Tips and education tailored to your hair journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {routine.educational_tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </span>
                    <p className="text-muted-foreground">{tip}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
