'use client';

import { useState } from 'react';
import { Youtube, Loader2, Sparkles } from 'lucide-react';
import { isValidYouTubeUrl } from '@/types';
import { cn } from '@/lib/utils';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function UrlInput({ onSubmit, isLoading = false, disabled = false }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value.trim()) {
      setIsValid(isValidYouTubeUrl(value));
    } else {
      setIsValid(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && url.trim() && !isLoading && !disabled) {
      onSubmit(url.trim());
    }
  };

  const canSubmit = isValid && url.trim() && !isLoading && !disabled;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
          <Youtube className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
          YouTube Clip Maker
        </h1>
        <p className="text-muted-foreground text-lg">
          Transform your YouTube videos into engaging clips with AI-powered analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Youtube className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <input
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Paste your YouTube URL here..."
            disabled={disabled || isLoading}
            className={cn(
              "input pl-10 pr-4 py-4 text-lg w-full",
              "transition-all duration-200",
              isValid === false && "border-destructive focus-visible:ring-destructive",
              isValid === true && "border-accent focus-visible:ring-accent"
            )}
          />
          
          {isValid !== null && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isValid ? "bg-accent" : "bg-destructive"
                )}
              />
            </div>
          )}
        </div>

        {url.trim() && isValid === false && (
          <p className="text-sm text-destructive flex items-center">
            <span className="w-1 h-1 bg-destructive rounded-full mr-2" />
            Please enter a valid YouTube URL
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "btn-primary w-full py-4 text-lg font-semibold",
            "transition-all duration-200",
            canSubmit 
              ? "hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25" 
              : "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Create Clips
            </div>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Supports YouTube videos up to 2 hours • Free tier includes 3 clips per video
        </p>
      </div>
    </div>
  );
}