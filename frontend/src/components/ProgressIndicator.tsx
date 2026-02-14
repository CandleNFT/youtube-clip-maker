'use client';

import { CheckCircle, Circle, Loader2, AlertCircle } from 'lucide-react';
import { ProcessingStep, ProcessingStatus, PROCESSING_STEPS } from '@/types';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: ProcessingStep;
  status: ProcessingStatus;
  progress?: number;
  error?: string;
}

export function ProgressIndicator({ 
  currentStep, 
  status, 
  progress = 0,
  error 
}: ProgressIndicatorProps) {
  const getStepStatus = (step: ProcessingStep): 'pending' | 'active' | 'completed' | 'failed' => {
    if (status === 'failed') {
      const currentIndex = PROCESSING_STEPS.findIndex(s => s.key === currentStep);
      const stepIndex = PROCESSING_STEPS.findIndex(s => s.key === step);
      
      if (stepIndex < currentIndex) return 'completed';
      if (stepIndex === currentIndex) return 'failed';
      return 'pending';
    }

    if (status === 'completed') return 'completed';

    const currentIndex = PROCESSING_STEPS.findIndex(s => s.key === currentStep);
    const stepIndex = PROCESSING_STEPS.findIndex(s => s.key === step);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepIcon = (step: ProcessingStep) => {
    const stepStatus = getStepStatus(step);

    switch (stepStatus) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-accent" />;
      case 'active':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Overall Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-semibold">
            {status === 'failed' ? 'Processing Failed' : 
             status === 'completed' ? 'Processing Complete' : 
             'Processing Video'}
          </h2>
          <span className="text-sm text-muted-foreground">
            {progress}%
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              status === 'failed' ? "bg-destructive" : "bg-gradient-to-r from-primary to-accent"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PROCESSING_STEPS.map((step, index) => {
          const stepStatus = getStepStatus(step.key);
          
          return (
            <div
              key={step.key}
              className={cn(
                "progress-step",
                stepStatus === 'active' && "active",
                stepStatus === 'completed' && "completed",
                stepStatus === 'failed' && "border-destructive/20 bg-destructive/5"
              )}
            >
              <div className="flex-shrink-0">
                {getStepIcon(step.key)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-medium text-sm",
                  stepStatus === 'active' && "text-primary",
                  stepStatus === 'completed' && "text-accent",
                  stepStatus === 'failed' && "text-destructive",
                  stepStatus === 'pending' && "text-muted-foreground"
                )}>
                  {step.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {status === 'failed' && error && (
        <div className="mt-6 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-destructive mb-1">Processing Failed</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {status === 'completed' && (
        <div className="mt-6 p-4 rounded-lg border border-accent/20 bg-accent/5">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-accent mb-1">Processing Complete!</h3>
              <p className="text-sm text-muted-foreground">
                Your clips are ready. You can preview and download them below.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}