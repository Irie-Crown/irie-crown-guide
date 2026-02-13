import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { QuestionnaireProgress } from '@/components/questionnaire/QuestionnaireProgress';
import { QuestionCard } from '@/components/questionnaire/QuestionCard';
import { SelectionGrid } from '@/components/questionnaire/SelectionGrid';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

const stepLabels = [
  'Hair Type',
  'Hair Details',
  'Concerns',
  'Scalp',
  'Health',
  'Environment',
  'Lifestyle',
];

const hairTypeSystemOptions = [
  { value: 'AndreWalker', label: 'Curl Pattern', description: 'Classify by curl pattern (1A–4C)' },
  { value: 'Skip', label: 'Skip / I Don\'t Know', description: 'We\'ll use your other hair characteristics instead' },
];

const andreWalkerOptions = [
  { value: '1A', label: '1A', description: 'Stick-straight, fine' },
  { value: '1B', label: '1B', description: 'Straight with slight body' },
  { value: '1C', label: '1C', description: 'Straight with some wave' },
  { value: '2A', label: '2A', description: 'Loose, gentle waves' },
  { value: '2B', label: '2B', description: 'Defined S-shaped waves' },
  { value: '2C', label: '2C', description: 'Deep waves, almost curly' },
  { value: '3A', label: '3A', description: 'Loose, big curls' },
  { value: '3B', label: '3B', description: 'Bouncy ringlets' },
  { value: '3C', label: '3C', description: 'Tight corkscrew curls' },
  { value: '4A', label: '4A', description: 'Tight, springy coils' },
  { value: '4B', label: '4B', description: 'Z-shaped coils' },
  { value: '4C', label: '4C', description: 'Tightly packed coils' },
];

const textureOptions = [
  { value: 'Fine', label: 'Fine', description: 'Thin individual strands' },
  { value: 'Medium', label: 'Medium', description: 'Average strand thickness' },
  { value: 'Coarse', label: 'Coarse', description: 'Thick individual strands' },
];

const porosityOptions = [
  { value: 'Low', label: 'Low Porosity', description: 'Hair resists moisture, products sit on top' },
  { value: 'Normal', label: 'Normal Porosity', description: 'Absorbs and retains moisture well' },
  { value: 'High', label: 'High Porosity', description: 'Absorbs moisture quickly, loses it fast' },
];

const densityOptions = [
  { value: 'Low', label: 'Low', description: 'Scalp easily visible' },
  { value: 'Medium', label: 'Medium', description: 'Some scalp visible' },
  { value: 'High', label: 'High', description: 'Scalp barely visible' },
];

const lengthOptions = [
  { value: 'Short', label: 'Short', description: 'Above shoulders' },
  { value: 'Medium', label: 'Medium', description: 'Shoulder to mid-back' },
  { value: 'Long', label: 'Long', description: 'Below mid-back' },
];

const concernOptions = [
  { value: 'Dryness', label: 'Dryness' },
  { value: 'Breakage', label: 'Breakage' },
  { value: 'Shedding', label: 'Excessive Shedding' },
  { value: 'Frizz', label: 'Frizz' },
  { value: 'Shrinkage', label: 'Shrinkage' },
  { value: 'Tangles', label: 'Tangles & Knots' },
  { value: 'Lack of Definition', label: 'Lack of Definition' },
  { value: 'Slow Growth', label: 'Slow Growth' },
  { value: 'Thinning', label: 'Thinning' },
  { value: 'Heat Damage', label: 'Heat Damage' },
  { value: 'Color Damage', label: 'Color Damage' },
  { value: 'Product Buildup', label: 'Product Buildup' },
];

const scalpConditionOptions = [
  { value: 'Normal', label: 'Normal', description: 'Balanced, no issues' },
  { value: 'Dry', label: 'Dry', description: 'Tight, flaky feeling' },
  { value: 'Oily', label: 'Oily', description: 'Greasy, needs frequent washing' },
  { value: 'Sensitive', label: 'Sensitive', description: 'Easily irritated' },
  { value: 'Dandruff', label: 'Dandruff', description: 'Visible flaking' },
];

const scalpConcernOptions = [
  { value: 'Itchiness', label: 'Itchiness' },
  { value: 'Flaking', label: 'Flaking' },
  { value: 'Tenderness', label: 'Tenderness' },
  { value: 'Buildup', label: 'Product Buildup' },
  { value: 'Psoriasis', label: 'Psoriasis' },
  { value: 'Eczema', label: 'Eczema' },
];

const healthConditionOptions = [
  { value: 'None', label: 'None' },
  { value: 'Thyroid', label: 'Thyroid Issues' },
  { value: 'PCOS', label: 'PCOS' },
  { value: 'Anemia', label: 'Anemia' },
  { value: 'Autoimmune', label: 'Autoimmune Condition' },
  { value: 'Diabetes', label: 'Diabetes' },
];

const hormonalOptions = [
  { value: 'None', label: 'None / Not Applicable' },
  { value: 'Postpartum', label: 'Postpartum' },
  { value: 'Menopause', label: 'Menopause / Perimenopause' },
  { value: 'PCOS', label: 'PCOS' },
  { value: 'Pregnancy', label: 'Currently Pregnant' },
];

const climateOptions = [
  { value: 'Humid', label: 'Humid', description: 'High moisture in air' },
  { value: 'Dry', label: 'Dry', description: 'Low humidity, arid' },
  { value: 'Temperate', label: 'Temperate', description: 'Moderate, seasonal' },
  { value: 'Tropical', label: 'Tropical', description: 'Hot and humid year-round' },
];

const waterTypeOptions = [
  { value: 'Soft', label: 'Soft Water' },
  { value: 'Hard', label: 'Hard Water' },
  { value: 'Unknown', label: 'Not Sure' },
];

const sunExposureOptions = [
  { value: 'Low', label: 'Low', description: 'Mostly indoors' },
  { value: 'Moderate', label: 'Moderate', description: 'Some outdoor time' },
  { value: 'High', label: 'High', description: 'Frequently outdoors' },
];

const exerciseOptions = [
  { value: 'Rarely', label: 'Rarely', description: 'Little to no exercise' },
  { value: 'Weekly', label: 'Weekly', description: '1-3 times per week' },
  { value: 'Daily', label: 'Daily', description: '4+ times per week' },
];

const heatStylingOptions = [
  { value: 'Never', label: 'Never' },
  { value: 'Rarely', label: 'Rarely', description: 'Few times a year' },
  { value: 'Weekly', label: 'Weekly', description: '1-2 times per week' },
  { value: 'Daily', label: 'Daily', description: 'Most days' },
];

const budgetOptions = [
  { value: 'Budget', label: 'Budget-Friendly' },
  { value: 'Mid-range', label: 'Mid-Range' },
  { value: 'Premium', label: 'Premium / Luxury' },
];

const productPreferenceOptions = [
  { value: 'Natural', label: 'Natural / Organic' },
  { value: 'Silicone-free', label: 'Silicone-Free' },
  { value: 'Sulfate-free', label: 'Sulfate-Free' },
  { value: 'Fragrance-free', label: 'Fragrance-Free' },
  { value: 'Vegan', label: 'Vegan / Cruelty-Free' },
  { value: 'Black-owned', label: 'Black-Owned Brands' },
];

interface HairProfileData {
  hair_type_system: string;
  hair_type: string;
  hair_texture: string;
  hair_porosity: string;
  hair_density: string;
  hair_length: string;
  hair_concerns: string[];
  scalp_condition: string;
  scalp_concerns: string[];
  health_conditions: string[];
  allergies: string[];
  medications: string;
  hormonal_status: string;
  climate: string;
  water_type: string;
  sun_exposure: string;
  exercise_frequency: string;
  heat_styling_frequency: string;
  current_routine_frequency: string;
  budget_preference: string;
  product_preferences: string[];
}

export default function Questionnaire() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<HairProfileData>({
    hair_type_system: '',
    hair_type: '',
    hair_texture: '',
    hair_porosity: '',
    hair_density: '',
    hair_length: '',
    hair_concerns: [],
    scalp_condition: '',
    scalp_concerns: [],
    health_conditions: [],
    allergies: [],
    medications: '',
    hormonal_status: '',
    climate: '',
    water_type: '',
    sun_exposure: '',
    exercise_frequency: '',
    heat_styling_frequency: '',
    current_routine_frequency: '',
    budget_preference: '',
    product_preferences: [],
  });
  const [allergiesInput, setAllergiesInput] = useState('');

  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateField = useCallback(<K extends keyof HairProfileData>(
    field: K,
    value: HairProfileData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const canProceedValue = useMemo(() => {
    switch (step) {
      case 0:
        return formData.hair_type_system === 'Skip' || (formData.hair_type_system === 'AndreWalker' && formData.hair_type !== '');
      case 1:
        return (
          formData.hair_texture !== '' &&
          formData.hair_porosity !== '' &&
          formData.hair_density !== '' &&
          formData.hair_length !== ''
        );
      case 2:
        return formData.hair_concerns.length > 0;
      case 3:
        return formData.scalp_condition !== '';
      case 4:
        return formData.hormonal_status !== '';
      case 5:
        return (
          formData.climate !== '' &&
          formData.water_type !== '' &&
          formData.sun_exposure !== ''
        );
      case 6:
        return (
          formData.exercise_frequency !== '' &&
          formData.heat_styling_frequency !== ''
        );
      default:
        return true;
    }
  }, [step, formData]);

  const handleNext = useCallback(() => {
    setStep((s) => (s < stepLabels.length - 1 ? s + 1 : s));
  }, []);

  const handleBack = useCallback(() => {
    setStep((s) => (s > 0 ? s - 1 : s));
  }, []);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to save your hair profile.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    // Parse and validate allergies from input
    const sanitizedAllergies = allergiesInput.slice(0, 1000);
    const allergiesArray = sanitizedAllergies
      .split(',')
      .map((a) => a.trim().slice(0, 100))
      .filter((a) => a.length > 0)
      .slice(0, 20);

    const sanitizedMedications = formData.medications.trim().slice(0, 500);

    const profileData = {
      ...formData,
      user_id: user.id,
      allergies: allergiesArray,
      medications: sanitizedMedications,
      hair_type_system: formData.hair_type_system === 'Skip' ? null : formData.hair_type_system,
      hair_type: formData.hair_type_system === 'Skip' ? null : formData.hair_type,
    };

    try {
      const { error } = await supabase.from('hair_profiles').insert(profileData);

      if (error) {
        toast({
          title: 'Error saving profile',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Profile saved!',
        description: 'Generating your personalized routine...',
      });

      navigate('/results');
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: 'Could not save your profile. Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">
              Irie Crown
            </span>
          </div>
          {isAuthenticated && (
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          )}
        </div>
      </header>

      {/* Progress */}
      <div className="container mx-auto px-4 py-6">
        <QuestionnaireProgress
          currentStep={step}
          totalSteps={stepLabels.length}
          stepLabels={stepLabels}
        />
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Step 0: Hair Type */}
        {step === 0 && (
          <div className="space-y-10">
            <QuestionCard
              title="How would you like to classify your hair?"
              description="Choose a classification system, or skip if you're unsure."
            >
              <SelectionGrid
                options={hairTypeSystemOptions}
                value={formData.hair_type_system}
                onChange={(v) => {
                  const system = v as string;
                  updateField('hair_type_system', system);
                  if (system === 'Skip') {
                    updateField('hair_type', '');
                  }
                }}
                columns={2}
              />
            </QuestionCard>

            {formData.hair_type_system === 'AndreWalker' && (
              <QuestionCard
                title="Select your curl pattern"
                description="Choose the type that best matches your hair."
              >
                <SelectionGrid
                  options={andreWalkerOptions}
                  value={formData.hair_type}
                  onChange={(v) => updateField('hair_type', v as string)}
                  columns={4}
                />
              </QuestionCard>
            )}
          </div>
        )}

        {/* Step 1: Hair Details */}
        {step === 1 && (
          <div className="space-y-10">
            <QuestionCard
              title="Let's get into the details"
              description="These characteristics help us understand your hair's unique needs."
            >
              <div className="space-y-8">
                <div>
                  <h3 className="font-medium text-foreground mb-4">Hair Texture</h3>
                  <SelectionGrid
                    options={textureOptions}
                    value={formData.hair_texture}
                    onChange={(v) => updateField('hair_texture', v as string)}
                    columns={3}
                  />
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-4">Hair Porosity</h3>
                  <SelectionGrid
                    options={porosityOptions}
                    value={formData.hair_porosity}
                    onChange={(v) => updateField('hair_porosity', v as string)}
                    columns={3}
                  />
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-4">Hair Density</h3>
                  <SelectionGrid
                    options={densityOptions}
                    value={formData.hair_density}
                    onChange={(v) => updateField('hair_density', v as string)}
                    columns={3}
                  />
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-4">Hair Length</h3>
                  <SelectionGrid
                    options={lengthOptions}
                    value={formData.hair_length}
                    onChange={(v) => updateField('hair_length', v as string)}
                    columns={3}
                  />
                </div>
              </div>
            </QuestionCard>
          </div>
        )}

        {/* Step 2: Concerns */}
        {step === 2 && (
          <QuestionCard
            title="What are your main hair concerns?"
            description="Select all that apply. We'll prioritize these in your routine."
          >
            <SelectionGrid
              options={concernOptions}
              value={formData.hair_concerns}
              onChange={(v) => updateField('hair_concerns', v as string[])}
              multiple
              columns={3}
            />
          </QuestionCard>
        )}

        {/* Step 3: Scalp */}
        {step === 3 && (
          <div className="space-y-10">
            <QuestionCard
              title="How would you describe your scalp?"
              description="Scalp health is the foundation of healthy hair."
            >
              <SelectionGrid
                options={scalpConditionOptions}
                value={formData.scalp_condition}
                onChange={(v) => updateField('scalp_condition', v as string)}
                columns={3}
              />
            </QuestionCard>

            <QuestionCard
              title="Any specific scalp concerns?"
              description="Select all that apply (optional)."
            >
              <SelectionGrid
                options={scalpConcernOptions}
                value={formData.scalp_concerns}
                onChange={(v) => updateField('scalp_concerns', v as string[])}
                multiple
                columns={3}
              />
            </QuestionCard>
          </div>
        )}

        {/* Step 4: Health */}
        {step === 4 && (
          <div className="space-y-10">
            <QuestionCard
              title="Any health conditions that affect your hair?"
              description="This helps us avoid recommending anything that could interfere."
            >
              <SelectionGrid
                options={healthConditionOptions}
                value={formData.health_conditions}
                onChange={(v) => updateField('health_conditions', v as string[])}
                multiple
                columns={3}
              />
            </QuestionCard>

            <QuestionCard
              title="Hormonal considerations"
              description="Hormones significantly impact hair health."
            >
              <SelectionGrid
                options={hormonalOptions}
                value={formData.hormonal_status}
                onChange={(v) => updateField('hormonal_status', v as string)}
                columns={2}
              />
            </QuestionCard>

            <QuestionCard
              title="Allergies & Sensitivities"
              description="List any known allergies to ingredients (comma-separated)."
            >
              <div className="space-y-4">
                <Textarea
                  placeholder="e.g., coconut, lanolin, fragrance"
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                  className="bg-card"
                />
                <div className="space-y-2">
                  <Label>Current medications (optional)</Label>
                  <Input
                    placeholder="Any medications that might affect hair"
                    value={formData.medications}
                    onChange={(e) => updateField('medications', e.target.value)}
                    className="bg-card"
                  />
                </div>
              </div>
            </QuestionCard>
          </div>
        )}

        {/* Step 5: Environment */}
        {step === 5 && (
          <div className="space-y-10">
            <QuestionCard
              title="What's your climate like?"
              description="Environment plays a big role in hair care needs."
            >
              <SelectionGrid
                options={climateOptions}
                value={formData.climate}
                onChange={(v) => updateField('climate', v as string)}
                columns={2}
              />
            </QuestionCard>

            <QuestionCard
              title="What type of water do you have?"
              description="Hard water can affect how products work on your hair."
            >
              <SelectionGrid
                options={waterTypeOptions}
                value={formData.water_type}
                onChange={(v) => updateField('water_type', v as string)}
                columns={3}
              />
            </QuestionCard>

            <QuestionCard
              title="How much sun exposure do you get?"
              description="UV damage is real for textured hair too!"
            >
              <SelectionGrid
                options={sunExposureOptions}
                value={formData.sun_exposure}
                onChange={(v) => updateField('sun_exposure', v as string)}
                columns={3}
              />
            </QuestionCard>
          </div>
        )}

        {/* Step 6: Lifestyle */}
        {step === 6 && (
          <div className="space-y-10">
            <QuestionCard
              title="How often do you exercise?"
              description="Sweat and activity affect how often you need to cleanse."
            >
              <SelectionGrid
                options={exerciseOptions}
                value={formData.exercise_frequency}
                onChange={(v) => updateField('exercise_frequency', v as string)}
                columns={3}
              />
            </QuestionCard>

            <QuestionCard
              title="How often do you use heat styling tools?"
              description="Blow dryers, flat irons, curling wands, etc."
            >
              <SelectionGrid
                options={heatStylingOptions}
                value={formData.heat_styling_frequency}
                onChange={(v) => updateField('heat_styling_frequency', v as string)}
                columns={4}
              />
            </QuestionCard>

            <QuestionCard
              title="Budget preference"
              description="Optional - helps us tailor product recommendations."
            >
              <SelectionGrid
                options={budgetOptions}
                value={formData.budget_preference}
                onChange={(v) => updateField('budget_preference', v as string)}
                columns={3}
              />
            </QuestionCard>

            <QuestionCard
              title="Product preferences"
              description="Select any that are important to you."
            >
              <SelectionGrid
                options={productPreferenceOptions}
                value={formData.product_preferences}
                onChange={(v) => updateField('product_preferences', v as string[])}
                multiple
                columns={3}
              />
            </QuestionCard>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-8 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {step < stepLabels.length - 1 ? (
            <Button
              variant="hero"
              onClick={handleNext}
              disabled={!canProceedValue}
              className="gap-2"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="hero"
              onClick={handleSubmit}
              disabled={!canProceedValue || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Generate My Routine
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
