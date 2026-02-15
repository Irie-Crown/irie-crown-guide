import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { useAdminRole } from '@/hooks/useAdminRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { RecommendationsWidget } from '@/components/scoring/RecommendationsWidget';
import {
  Sparkles,
  LogOut,
  Calendar,
  FlaskConical,
  User,
  Plus,
  Crown,
  CheckCircle,
  Shield,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface Routine {
  id: string;
  routine_name: string;
  created_at: string;
  is_active: boolean;
}

interface HairProfile {
  id: string;
  hair_type: string;
  hair_texture: string;
  created_at: string;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [hairProfile, setHairProfile] = useState<HairProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user, signOut, isAuthenticated, loading } = useAuth();
  const { isAdmin } = useAdminRole();
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
      const [profileResult, routinesResult, hairProfileResult] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').eq('user_id', user.id).maybeSingle(),
        supabase.from('routines').select('id, routine_name, created_at, is_active').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('hair_profiles').select('id, hair_type, hair_texture, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (profileResult.data) setProfile(profileResult.data);
      if (routinesResult.data) setRoutines(routinesResult.data);
      if (hairProfileResult.data) setHairProfile(hairProfileResult.data);
    } catch (error) {
      toast({ title: 'Failed to load dashboard', description: 'Please check your connection and try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: 'Sign out failed', description: error.message, variant: 'destructive' });
    } else {
      navigate('/');
    }
  };

  if (loading || isLoading) {
    return <DashboardSkeleton />;
  }

  const hasHairProfile = !!hairProfile;
  const hasRoutine = routines.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <a href="#main-content" className="skip-to-main">Skip to main content</a>

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">Irie Crown</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="outline" className="gap-2" onClick={() => navigate('/admin/products')}>
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            )}
            <Button variant="ghost" className="gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/12 via-accent/8 to-secondary/10 p-6 md:p-8 mb-8 border border-primary/10">
          <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-secondary/8 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow flex-shrink-0">
                <Crown className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                  Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
                </h1>
                <p className="text-muted-foreground text-sm">Your personalized hair care journey</p>
              </div>
            </div>

            {hairProfile && (
              <div className="flex flex-wrap gap-2 mt-4">
                {hairProfile.hair_type && (
                  <span className="px-3 py-1.5 bg-primary/15 text-primary rounded-full text-sm font-medium border border-primary/20">
                    {hairProfile.hair_type}
                  </span>
                )}
                <span className="px-3 py-1.5 bg-secondary/15 text-secondary rounded-full text-sm font-medium border border-secondary/20">
                  {hairProfile.hair_texture} Texture
                </span>
              </div>
            )}

            {/* Journey Progress */}
            <div className="flex items-center gap-2 mt-6 flex-wrap">
              <div className={`flex items-center gap-1.5 text-xs font-medium ${hasHairProfile ? 'text-secondary' : 'text-muted-foreground'}`}>
                <CheckCircle className={`h-4 w-4 ${hasHairProfile ? '' : 'opacity-30'}`} />
                Hair Profile
              </div>
              <div className="w-6 h-px bg-border" />
              <div className={`flex items-center gap-1.5 text-xs font-medium ${hasRoutine ? 'text-secondary' : 'text-muted-foreground'}`}>
                <CheckCircle className={`h-4 w-4 ${hasRoutine ? '' : 'opacity-30'}`} />
                Routine
              </div>
              <div className="w-6 h-px bg-border" />
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Product Matches
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <button
            onClick={() => navigate(hasHairProfile ? '/results' : '/questionnaire')}
            className="group relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 md:p-5 text-left transition-all hover:shadow-glow hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors" />
            <Crown className="h-7 w-7 text-primary mb-3 relative" />
            <h3 className="font-semibold text-foreground text-sm">{hasRoutine ? 'View Routine' : 'Create Routine'}</h3>
            <p className="text-[11px] text-muted-foreground mt-1">{hasRoutine ? 'Your personalized care' : 'Get started'}</p>
          </button>

          <button
            onClick={() => navigate('/ingredient-checker')}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 md:p-5 text-left transition-all hover:shadow-medium hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors" />
            <FlaskConical className="h-7 w-7 text-accent mb-3 relative" />
            <h3 className="font-semibold text-foreground text-sm">Check Ingredients</h3>
            <p className="text-[11px] text-muted-foreground mt-1">Analyze any product</p>
          </button>

          <button
            onClick={() => navigate('/questionnaire')}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 md:p-5 text-left transition-all hover:shadow-medium hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors" />
            <User className="h-7 w-7 text-secondary mb-3 relative" />
            <h3 className="font-semibold text-foreground text-sm">{hasHairProfile ? 'Update Profile' : 'Create Profile'}</h3>
            <p className="text-[11px] text-muted-foreground mt-1">{hasHairProfile ? 'Adjust settings' : 'Start your journey'}</p>
          </button>

          <button
            onClick={() => navigate('/products')}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 md:p-5 text-left transition-all hover:shadow-medium hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors" />
            <ShoppingBag className="h-7 w-7 text-primary mb-3 relative" />
            <h3 className="font-semibold text-foreground text-sm">Browse Products</h3>
            <p className="text-[11px] text-muted-foreground mt-1">Find your match</p>
          </button>
        </div>

        {/* Top Product Matches */}
        <div className="mb-8">
          <RecommendationsWidget />
        </div>

        {/* Saved Routines */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Your Routines
            </CardTitle>
            <CardDescription>
              {routines.length > 0
                ? `You have ${routines.length} saved routine${routines.length > 1 ? 's' : ''}`
                : 'No routines yet. Create your first one!'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {routines.length > 0 ? (
              <div className="space-y-3">
                {routines.map((routine) => (
                  <button
                    key={routine.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={() => navigate('/results')}
                  >
                    <div>
                      <h4 className="font-medium text-foreground">{routine.routine_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(routine.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {routine.is_active && (
                        <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Get your first personalized hair routine
                </p>
                <Button onClick={() => navigate('/questionnaire')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Routine
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
