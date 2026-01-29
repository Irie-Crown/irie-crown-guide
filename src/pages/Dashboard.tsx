import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, loading, isAuthenticated, navigate]);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Fetch routines
    const { data: routinesData } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (routinesData) {
      setRoutines(routinesData);
    }

    // Fetch hair profile
    const { data: hairProfileData } = await supabase
      .from('hair_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (hairProfileData) {
      setHairProfile(hairProfileData);
    }

    setIsLoading(false);
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasHairProfile = !!hairProfile;
  const hasRoutine = routines.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
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
            <Button variant="ghost" className="gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
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
          <Card
            className="group cursor-pointer hover:shadow-medium transition-all hover:-translate-y-1 border-primary/20"
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
          </Card>

          <Card
            className="group cursor-pointer hover:shadow-medium transition-all hover:-translate-y-1"
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
          </Card>

          <Card
            className="group cursor-pointer hover:shadow-medium transition-all hover:-translate-y-1"
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
          </Card>
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
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {hairProfile.hair_type}
                </span>
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
                  <div
                    key={routine.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
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
                        <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-medium">
                          Active
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
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
