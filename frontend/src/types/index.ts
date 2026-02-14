export interface Clip {
  id: string;
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  thumbnail: string;
  videoUrl?: string;
  downloadUrl?: string;
  description?: string;
  score?: number;
}

export interface ProcessingJob {
  id: string;
  youtubeUrl: string;
  status: ProcessingStatus;
  progress: number;
  currentStep: ProcessingStep;
  clips: Clip[];
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export type ProcessingStatus = 'pending' | 'downloading' | 'transcribing' | 'analyzing' | 'cutting' | 'completed' | 'failed';

export type ProcessingStep = 'downloading' | 'transcribing' | 'analyzing' | 'cutting';

export interface ProcessingResponse {
  success: boolean;
  jobId?: string;
  error?: string;
}

export interface StatusResponse {
  job: ProcessingJob;
}

export interface VideoMetadata {
  title: string;
  duration: number;
  thumbnail: string;
  channelName: string;
  uploadDate: string;
}

export const PROCESSING_STEPS: { key: ProcessingStep; label: string; description: string }[] = [
  {
    key: 'downloading',
    label: 'Downloading',
    description: 'Fetching video from YouTube'
  },
  {
    key: 'transcribing',
    label: 'Transcribing',
    description: 'Converting audio to text with timestamps'
  },
  {
    key: 'analyzing',
    label: 'Analyzing',
    description: 'Finding the best moments with AI'
  },
  {
    key: 'cutting',
    label: 'Cutting',
    description: 'Creating individual clip files'
  }
];

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const isValidYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+(&[\w=]*)?$/;
  return youtubeRegex.test(url);
};