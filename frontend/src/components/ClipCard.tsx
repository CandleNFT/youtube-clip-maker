'use client';

import { useState, useRef } from 'react';
import { Play, Download, Pause, Volume2, VolumeX } from 'lucide-react';
import { Clip, formatDuration } from '@/types';
import { cn, truncateText } from '@/lib/utils';

interface ClipCardProps {
  clip: Clip;
  onDownload: (clipId: string) => void;
  isDownloading?: boolean;
}

export function ClipCard({ clip, onDownload, isDownloading = false }: ClipCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (clip.videoUrl && videoRef.current) {
      setShowPreview(true);
      // Start playing after a short delay
      setTimeout(() => {
        if (videoRef.current && isHovered) {
          videoRef.current.play();
          setIsPlaying(true);
        }
      }, 300);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowPreview(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = () => {
    if (!isDownloading) {
      onDownload(clip.id);
    }
  };

  return (
    <div 
      className="clip-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail/Video Container */}
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        {/* Thumbnail Image */}
        <img
          src={clip.thumbnail}
          alt={clip.name}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            showPreview && clip.videoUrl ? "opacity-0" : "opacity-100"
          )}
        />

        {/* Video Preview */}
        {clip.videoUrl && (
          <video
            ref={videoRef}
            src={clip.videoUrl}
            muted={isMuted}
            loop
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
              showPreview ? "opacity-100" : "opacity-0"
            )}
            onEnded={() => setIsPlaying(false)}
          />
        )}

        {/* Overlay Controls */}
        <div className={cn(
          "absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          {clip.videoUrl && (
            <button
              onClick={handlePlayPause}
              className="bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </button>
          )}
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {formatDuration(clip.duration)}
        </div>

        {/* Mute Toggle */}
        {clip.videoUrl && showPreview && (
          <button
            onClick={toggleMute}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>
        )}

        {/* Quality Score */}
        {clip.score && (
          <div className="absolute top-2 left-2 bg-accent/90 text-white text-xs px-2 py-1 rounded-full font-medium">
            {Math.round(clip.score * 100)}% match
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-sm leading-tight flex-1 mr-2">
            {truncateText(clip.name, 60)}
          </h3>
        </div>

        {clip.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {truncateText(clip.description, 100)}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {formatDuration(clip.startTime)} - {formatDuration(clip.endTime)}
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={cn(
              "btn-primary text-xs px-3 py-1.5",
              "transition-all duration-200",
              isDownloading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isDownloading ? (
              <div className="flex items-center">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                Downloading...
              </div>
            ) : (
              <div className="flex items-center">
                <Download className="w-3 h-3 mr-1" />
                Download
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}