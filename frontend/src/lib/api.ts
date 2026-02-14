import { ProcessingResponse, StatusResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        `API request failed: ${errorText || response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      'Network error or invalid response',
      undefined,
      error
    );
  }
}

export const api = {
  async startProcessing(youtubeUrl: string): Promise<ProcessingResponse> {
    return fetchApi<ProcessingResponse>('/api/process', {
      method: 'POST',
      body: JSON.stringify({ youtubeUrl }),
    });
  },

  async getStatus(jobId: string): Promise<StatusResponse> {
    return fetchApi<StatusResponse>(`/api/status/${jobId}`);
  },

  async downloadClip(clipId: string, filename?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/download/${clipId}`);
    
    if (!response.ok) {
      throw new ApiError('Failed to download clip', response.status);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename || `clip-${clipId}.mp4`;
    
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async downloadAllClips(jobId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/download/batch/${jobId}`);
    
    if (!response.ok) {
      throw new ApiError('Failed to download clips', response.status);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `clips-${jobId}.zip`;
    
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};

export const pollStatus = async (
  jobId: string,
  onUpdate: (job: any) => void,
  onComplete: (job: any) => void,
  onError: (error: Error) => void,
  intervalMs: number = 2000
): Promise<void> => {
  const poll = async () => {
    try {
      const response = await api.getStatus(jobId);
      const job = response.job;
      
      onUpdate(job);
      
      if (job.status === 'completed' || job.status === 'failed') {
        onComplete(job);
        return;
      }
      
      setTimeout(poll, intervalMs);
    } catch (error) {
      onError(error as Error);
    }
  };
  
  poll();
};