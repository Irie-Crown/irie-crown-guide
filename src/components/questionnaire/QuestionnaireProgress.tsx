import React from 'react';
import { Check } from 'lucide-react';

interface QuestionnaireProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const QuestionnaireProgress = React.memo(function QuestionnaireProgress({
  currentStep,
  totalSteps,
  stepLabels,
}: QuestionnaireProgressProps) {
  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="hidden md:flex justify-between">
        {stepLabels.map((label, index) => (
          <div
            key={label}
            className={`flex items-center gap-2 text-sm transition-colors ${
              index <= currentStep ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                index < currentStep
                  ? 'bg-primary text-primary-foreground'
                  : index === currentStep
                  ? 'bg-primary/20 text-primary border-2 border-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {index < currentStep ? (
                <Check className="h-3 w-3" />
              ) : (
                index + 1
              )}
            </div>
            <span className="hidden lg:inline">{label}</span>
          </div>
        ))}
      </div>

      {/* Mobile Step Label */}
      <div className="md:hidden text-center">
        <span className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}:{' '}
          <span className="text-primary font-medium">{stepLabels[currentStep]}</span>
        </span>
      </div>
    </div>
  );
});
