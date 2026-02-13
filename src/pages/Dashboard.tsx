import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { useAdminRole } from '@/hooks/useAdminRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  LogOut,
  Loader2,
  Calendar,
  FlaskConical,
  User,
  Plus,
  ChevronRight,
  Crown,
  CheckCircle,
  Shield,
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
        supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('routines')
          .select('id, routine_name, created_at, is_active')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('hair_profiles')
          .select('id, hair_type, hair_texture, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (profileResult.data) setProfile(profileResult.data);
      if (routinesResult.data) setRoutines(routinesResult.data);
      if (hairProfileResult.data) setHairProfile(hairProfileResult.data);
    } catch (error) {
      toast({
        title: 'Failed to load dashboard',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive',
      });
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
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">
              Irie Crown
            </span>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Your personalized hair care dashboard
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button
            className="group w-full text-left cursor-pointer hover:shadow-medium transition-all hover:-translate-y-1 border-primary/20 rounded-xl border bg-card p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => navigate(hasHairProfile ? '/results' : '/questionnaire')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {hasRoutine ? 'View Routine' : 'Create Routine'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {hasRoutine ? 'See your personalized care' : 'Get personalized guidance'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </button>

          <button
            className="group w-full text-left cursor-pointer hover:shadow-medium transition-all hover:-translate-y-1 rounded-xl border bg-card p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => navigate('/ingredient-checker')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <FlaskConical className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Check Ingredients</h3>
                    <p className="text-sm text-muted-foreground">Analyze any product</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
            </CardContent>
          </button>

          <button
            className="group w-full text-left cursor-pointer hover:shadow-medium transition-all hover:-translate-y-1 rounded-xl border bg-card p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => navigate('/questionnaire')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                    <Plus className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {hasHairProfile ? 'Update Profile' : 'Create Profile'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {hasHairProfile ? 'Adjust your hair profile' : 'Start your journey'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors" />
              </div>
            </CardContent>
          </button>
        </div>

        {/* Hair Profile Summary */}
        {hairProfile && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Your Hair Profile
              </CardTitle>
              <CardDescription>
                Last updated: {new Date(hairProfile.created_at).toLocaleDateString()}
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
              </div>
            </CardContent>
          </Card>
        )}

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
                <p className="text-muted-foreground mb-4">
                  Get your first personalized hair routine
                </p>
                <Button
                  variant="hero"
                  onClick={() => navigate('/questionnaire')}
                  className="gap-2"
                >
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
