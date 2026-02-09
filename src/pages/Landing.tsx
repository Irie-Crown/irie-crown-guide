import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Crown, Leaf, Shield, ArrowRight, Check } from 'lucide-react';
import heroImage from '@/assets/hero-woman.jpg';

const features = [
  {
    icon: Crown,
    title: 'Personalized Routines',
    description: 'AI-powered routines tailored to your unique hair type, texture, porosity, and lifestyle.',
  },
  {
    icon: Shield,
    title: 'Ingredient Safety',
    description: 'Know exactly what\'s safe for your hair. Avoid harmful ingredients with our smart checker.',
  },
  {
    icon: Leaf,
    title: 'Holistic Approach',
    description: 'We consider your health, environment, and goals for truly effective hair care.',
  },
];

const benefits = [
  'End trial-and-error with products',
  'Understand your unique hair needs',
  'Get science-backed recommendations',
  'Learn what ingredients to avoid',
  'Build confidence in your hair journey',
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">
              Irie Crown
            </span>
          </div>
          <div className="flex items-center gap-4">
            {!loading && (
              isAuthenticated ? (
                <Button variant="default" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/auth')}>
                    Sign In
                  </Button>
                  <Button variant="hero" onClick={() => navigate('/auth')}>
                    Get Started
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="main-content" className="pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Crown className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Hair Intelligence™
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-foreground">
                Your Crown Deserves{' '}
                <span className="text-gradient-gold">Personalized</span> Care
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                AI-powered hair routines designed for textured hair. Get personalized 
                recommendations based on your unique hair profile, health, and environment.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="hero"
                  size="xl"
                  onClick={handleGetStarted}
                  className="gap-2"
                >
                  Build My Routine
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  onClick={() => navigate('/ingredient-checker')}
                >
                  Check Ingredients
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-3">
                  Designed for you:
                </p>
                <div className="flex flex-wrap gap-3">
                  {['3A-4C Hair Types', 'Science-Based', 'Culturally Affirming'].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative animate-slide-up lg:animate-fade-in">
              <div className="relative rounded-3xl overflow-hidden shadow-glow">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent z-10" />
                <img
                  src={heroImage}
                  alt="Beautiful woman with healthy textured hair"
                  className="w-full h-auto object-cover"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 md:bottom-8 md:-left-8 bg-card rounded-2xl p-4 shadow-medium animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Personalized</p>
                    <p className="text-sm text-muted-foreground">Just for your hair</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Hair Care, Reimagined
            </h2>
            <p className="text-lg text-muted-foreground">
              We combine AI intelligence with deep understanding of textured hair 
              to give you truly personalized guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
                Stop Guessing.{' '}
                <span className="text-primary">Start Glowing.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Tired of products that don't work? Irie Crown Hair Intelligence 
                takes the guesswork out of textured hair care.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="hero"
                size="lg"
                className="mt-8 gap-2"
                onClick={handleGetStarted}
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 rounded-3xl p-8 md:p-12">
              <div className="space-y-6">
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h4 className="font-semibold text-foreground mb-2">Your Profile</h4>
                  <p className="text-sm text-muted-foreground">
                    We analyze your hair type, porosity, density, scalp condition, 
                    health factors, climate, and lifestyle.
                  </p>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h4 className="font-semibold text-foreground mb-2">AI Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Our intelligent system processes your unique profile to create 
                    recommendations just for you.
                  </p>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h4 className="font-semibold text-foreground mb-2">Your Routine</h4>
                  <p className="text-sm text-muted-foreground">
                    Get a complete wash day, weekly, and monthly routine with 
                    ingredient guidance and tips.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Ready to Transform Your Hair Care?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of queens who've discovered their perfect hair routine. 
            It only takes a few minutes to get started.
          </p>
          <Button
            variant="hero"
            size="xl"
            onClick={handleGetStarted}
            className="gap-2"
          >
            Build My Routine – It's Free
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-display text-lg font-semibold text-foreground">
                Irie Crown
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Irie Crown Hair Intelligence™. Made with love for textured hair.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
