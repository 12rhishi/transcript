
export interface AnalysisResult {
  transcript: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  sentiment: string;
}

export interface Recording {
  id: string;
  name: string;
  timestamp: Date;
  duration: number;
  videoUrl: string;
  audioUrl?: string;
  analysis?: AnalysisResult;
  status: 'recording' | 'processing' | 'completed' | 'failed';
}

export interface AppState {
  recordings: Recording[];
  activeRecordingId: string | null;
  isCapturing: boolean;
}
