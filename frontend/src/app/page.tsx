'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { UrlInput } from '@/components/UrlInput';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { ClipGrid } from '@/components/ClipGrid';
import { ProcessingJob, ProcessingStatus } from '@/types';
import { api, pollStatus, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

type AppState = 'input' | 'processing' | 'completed' | 'error';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('input');
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadingClips, setDownloadingClips] = useState<Set<string>>(new Set());
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const resetApp = () => {
    setAppState('input');
    setCurrentJob(null);
    setError(null);
    setDownloadingClips(new Set());
    setIsDownloadingAll(false);
  };

  const handleUrlSubmit = async (url: string) => {
    try {
      setError(null);
      setAppState('processing');
      
      const response = await api.startProcessing(url);
      
      if (!response.success || !response.jobId) {
        throw new Error(response.error || 'Failed to start processing');
      }

      // Start polling for status
      pollStatus(
        response.jobId,
        (job: ProcessingJob) => {
          setCurrentJob(job);
          
          // Update app state based on job status
          if (job.status === 'completed') {
            setAppState('completed');
          } else if (job.status === 'failed') {
            setAppState('error');
            setError(job.error || 'Processing failed');
          }
        },
        (job: ProcessingJob) => {
          setCurrentJob(job);
          if (job.status === 'completed') {
            setAppState('completed');
          }
        },
        (error: Error) => {
          setAppState('error');
          setError(error.message || 'Failed to get processing status');
        }
      );

    } catch (err) {
      setAppState('error');
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to start processing. Please try again.');
      }
    }
  };

  const handleDownloadClip = async (clipId: string) => {
    try {
      setDownloadingClips(prev => new Set([...prev, clipId]));
      
      const clip = currentJob?.clips.find(c => c.id === clipId);
      const filename = clip ? `${clip.name}.mp4` : undefined;
      
      await api.downloadClip(clipId, filename);
    } catch (err) {
      console.error('Failed to download clip:', err);
      // You might want to show a toast notification here
    } finally {
      setDownloadingClips(prev => {
        const newSet = new Set(prev);
        newSet.delete(clipId);
        return newSet;
      });
    }
  };

  const handleDownloadAll = async () => {
    if (!currentJob?.id) return;

    try {
      setIsDownloadingAll(true);
      await api.downloadAllClips(currentJob.id);
    } catch (err) {
      console.error('Failed to download all clips:', err);
      // You might want to show a toast notification here
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const retryProcessing = () => {
    if (currentJob?.youtubeUrl) {
      handleUrlSubmit(currentJob.youtubeUrl);
    } else {
      resetApp();
    }
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="container">
        {/* Back Button */}
        {appState !== 'input' && (
          <button
            onClick={resetApp}
            className="btn-secondary mb-8 inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Start Over
          </button>
        )}

        {/* Content based on app state */}
        {appState === 'input' && (
          <div className="flex items-center justify-center min-h-[80vh]">
            <UrlInput onSubmit={handleUrlSubmit} />
          </div>
        )}

        {appState === 'processing' && currentJob && (
          <div className="space-y-8">
            <ProgressIndicator
              currentStep={currentJob.currentStep}
              status={currentJob.status}
              progress={currentJob.progress}
              error={currentJob.error}
            />
            
            {/* Show partial clips if any are ready */}
            {currentJob.clips.length > 0 && (
              <ClipGrid
                clips={currentJob.clips}
                onDownloadClip={handleDownloadClip}
                onDownloadAll={handleDownloadAll}
                downloadingClips={downloadingClips}
                isDownloadingAll={isDownloadingAll}
              />
            )}
          </div>
        )}

        {appState === 'completed' && currentJob && (
          <div className="space-y-8">
            <ProgressIndicator
              currentStep={currentJob.currentStep}
              status={currentJob.status}
              progress={100}
            />
            
            <ClipGrid
              clips={currentJob.clips}
              onDownloadClip={handleDownloadClip}
              onDownloadAll={handleDownloadAll}
              downloadingClips={downloadingClips}
              isDownloadingAll={isDownloadingAll}
            />
          </div>
        )}

        {appState === 'error' && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-destructive" />
              </div>
              
              <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
              
              <p className="text-muted-foreground mb-6">
                {error || 'An unexpected error occurred while processing your video.'}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={retryProcessing}
                  className="btn-primary w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                
                <button
                  onClick={resetApp}
                  className="btn-secondary w-full"
                >
                  Start Over
                </button>
              </div>

              {/* Partial results if available */}
              {currentJob && currentJob.clips.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">
                    Some clips were generated before the error occurred:
                  </p>
                  <ClipGrid
                    clips={currentJob.clips}
                    onDownloadClip={handleDownloadClip}
                    onDownloadAll={handleDownloadAll}
                    downloadingClips={downloadingClips}
                    isDownloadingAll={isDownloadingAll}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}