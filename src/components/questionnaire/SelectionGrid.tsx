import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectionOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface SelectionGridProps {
  options: SelectionOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  columns?: 2 | 3 | 4;
}

export const SelectionGrid = React.memo(function SelectionGrid({
  options,
  value,
  onChange,
  multiple = false,
  columns = 3,
}: SelectionGridProps) {
  const isSelected = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(optionValue);
    }
  };

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns])}>
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={cn(
              'relative p-4 md:p-6 rounded-xl border-2 text-left transition-all duration-200',
              'hover:shadow-soft hover:-translate-y-0.5',
              selected
                ? 'border-primary bg-primary/5 shadow-soft'
                : 'border-border bg-card hover:border-primary/50'
            )}
          >
            {selected && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
            {option.icon && (
              <div className="mb-3 text-primary">{option.icon}</div>
            )}
            <h3
              className={cn(
                'font-medium transition-colors',
                selected ? 'text-primary' : 'text-foreground'
              )}
            >
              {option.label}
            </h3>
            {option.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {option.description}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
});
