import { ReactNode } from 'react';

interface QuestionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function QuestionCard({ title, description, children }: QuestionCardProps) {
  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
