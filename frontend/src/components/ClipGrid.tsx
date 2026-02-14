'use client';

import { useState } from 'react';
import { Download, Grid3X3, List, SortAsc, SortDesc } from 'lucide-react';
import { Clip } from '@/types';
import { ClipCard } from './ClipCard';
import { cn } from '@/lib/utils';

interface ClipGridProps {
  clips: Clip[];
  onDownloadClip: (clipId: string) => void;
  onDownloadAll: () => void;
  downloadingClips: Set<string>;
  isDownloadingAll?: boolean;
}

type SortOption = 'order' | 'duration' | 'score' | 'name';
type ViewMode = 'grid' | 'list';

export function ClipGrid({ 
  clips, 
  onDownloadClip, 
  onDownloadAll, 
  downloadingClips,
  isDownloadingAll = false 
}: ClipGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>('order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const sortedClips = [...clips].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'duration':
        comparison = a.duration - b.duration;
        break;
      case 'score':
        comparison = (a.score || 0) - (b.score || 0);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'order':
      default:
        comparison = a.startTime - b.startTime;
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection(option === 'duration' || option === 'order' ? 'asc' : 'desc');
    }
  };

  if (clips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Grid3X3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No clips yet</h3>
        <p className="text-muted-foreground">
          Clips will appear here once processing is complete.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">
            Generated Clips ({clips.length})
          </h2>
          <p className="text-muted-foreground">
            Preview and download your AI-generated clips
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded transition-colors",
                viewMode === 'grid' 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded transition-colors",
                viewMode === 'list' 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Controls */}
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value as SortOption)}
            className="input text-sm h-10 w-32"
          >
            <option value="order">Timeline</option>
            <option value="score">Quality</option>
            <option value="duration">Duration</option>
            <option value="name">Name</option>
          </select>

          <button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="btn-secondary h-10 w-10 p-0"
          >
            {sortDirection === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </button>

          {/* Download All Button */}
          <button
            onClick={onDownloadAll}
            disabled={isDownloadingAll}
            className={cn(
              "btn-primary whitespace-nowrap",
              isDownloadingAll && "opacity-50 cursor-not-allowed"
            )}
          >
            {isDownloadingAll ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Preparing...
              </div>
            ) : (
              <div className="flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Download All
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Clips Grid/List */}
      <div className={cn(
        "transition-all duration-300",
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      )}>
        {sortedClips.map((clip, index) => (
          <div
            key={clip.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {viewMode === 'grid' ? (
              <ClipCard
                clip={clip}
                onDownload={onDownloadClip}
                isDownloading={downloadingClips.has(clip.id)}
              />
            ) : (
              <div className="clip-card flex items-center p-4">
                <div className="flex-shrink-0 w-32 h-18 rounded-lg overflow-hidden mr-4">
                  <img
                    src={clip.thumbnail}
                    alt={clip.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1 truncate">{clip.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                    {clip.description}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>Duration: {Math.floor(clip.duration / 60)}:{(clip.duration % 60).toString().padStart(2, '0')}</span>
                    {clip.score && (
                      <span className="ml-4">Quality: {Math.round(clip.score * 100)}%</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDownloadClip(clip.id)}
                  disabled={downloadingClips.has(clip.id)}
                  className={cn(
                    "btn-primary ml-4",
                    downloadingClips.has(clip.id) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {downloadingClips.has(clip.id) ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Downloading...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}