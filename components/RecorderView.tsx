
import React, { useState, useRef, useEffect } from 'react';
import { Recording } from '../types';
import { formatDuration } from '../utils/mediaUtils';

interface RecorderViewProps {
  onRecordingComplete: (videoBlob: Blob, audioBlob: Blob, duration: number) => void;
}

const RecorderView: React.FC<RecorderViewProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      // Capture Screen & Audio
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: true
      });

      // Capture Mic Audio (optional but recommended for calls)
      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        console.warn("No microphone access, using only system audio.");
      }

      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...(micStream ? micStream.getAudioTracks() : screenStream.getAudioTracks())
      ]);

      streamRef.current = combinedStream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = combinedStream;
      }

      // Video Recorder
      const videoChunks: Blob[] = [];
      const videoRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp8,opus' });
      videoRecorder.ondataavailable = (e) => e.data.size > 0 && videoChunks.push(e.data);
      
      // Audio-only Recorder (for easier AI processing)
      const audioChunks: Blob[] = [];
      const audioOnlyStream = new MediaStream(combinedStream.getAudioTracks());
      const audioRecorder = new MediaRecorder(audioOnlyStream, { mimeType: 'audio/webm;codecs=opus' });
      audioRecorder.ondataavailable = (e) => e.data.size > 0 && audioChunks.push(e.data);

      videoRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        onRecordingComplete(videoBlob, audioBlob, duration);
        stopAllTracks();
      };

      mediaRecorderRef.current = videoRecorder;
      audioRecorderRef.current = audioRecorder;
      
      videoRecorder.start();
      audioRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Handle user stopping share via browser bar
      screenStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

    } catch (err: any) {
      setError(err.message || "Failed to start recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      audioRecorderRef.current?.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const stopAllTracks = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAllTracks();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border shadow-sm h-full">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-800">Ready to Capture?</h2>
          <p className="text-slate-500">Record your screen, a specific window, or a video call tab. We'll handle the rest.</p>
        </div>

        <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden border-4 border-slate-50 shadow-inner group">
          <video 
            ref={videoPreviewRef} 
            autoPlay 
            muted 
            className="w-full h-full object-cover"
          />
          {!isRecording && !streamRef.current && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              LIVE • {formatDuration(duration)}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          {!isRecording ? (
            <button 
              onClick={startRecording}
              className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-red-100 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <div className="w-4 h-4 bg-white rounded-full"></div>
              Start Session Recording
            </button>
          ) : (
            <button 
              onClick={stopRecording}
              className="bg-slate-800 hover:bg-slate-900 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-slate-200 transition-all flex items-center gap-3"
            >
              <div className="w-4 h-4 bg-white rounded-sm"></div>
              Stop and Process
            </button>
          )}
          
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <p className="text-xs text-slate-400">Ensure system audio sharing is enabled for transcriptions of the other party.</p>
        </div>
      </div>
    </div>
  );
};

export default RecorderView;
