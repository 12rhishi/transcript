
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import RecorderView from './components/RecorderView';
import ResultView from './components/ResultView';
import { Recording } from './types';
import { analyzeMedia } from './services/geminiService';
import { blobToBase64 } from './utils/mediaUtils';

const App: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'recording' | 'result'>('home');

  const handleNewRecording = () => {
    setActiveRecordingId(null);
    setView('recording');
  };

  const onRecordingComplete = useCallback(async (videoBlob: Blob, audioBlob: Blob, duration: number) => {
    const id = crypto.randomUUID();
    const videoUrl = URL.createObjectURL(videoBlob);
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const newRecording: Recording = {
      id,
      name: `Meeting - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      timestamp: new Date(),
      duration,
      videoUrl,
      audioUrl,
      status: 'processing'
    };

    setRecordings(prev => [newRecording, ...prev]);
    setActiveRecordingId(id);
    setView('result');

    try {
      // Process with Gemini
      const base64Audio = await blobToBase64(audioBlob);
      const analysis = await analyzeMedia(base64Audio, audioBlob.type);
      
      setRecordings(prev => prev.map(rec => 
        rec.id === id ? { ...rec, analysis, status: 'completed' as const } : rec
      ));
    } catch (err) {
      console.error("AI Analysis error:", err);
      setRecordings(prev => prev.map(rec => 
        rec.id === id ? { ...rec, status: 'failed' as const } : rec
      ));
    }
  }, []);

  const activeRecording = recordings.find(r => r.id === activeRecordingId);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        recordings={recordings} 
        activeId={activeRecordingId}
        onSelect={(id) => {
          setActiveRecordingId(id);
          setView('result');
        }}
        onNew={handleNewRecording}
      />
      
      <main className="flex-1 relative overflow-hidden">
        {view === 'home' && (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-blue-200 mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">MeetingInsight Pro</h1>
            <p className="text-slate-500 max-w-md text-lg leading-relaxed mb-10">
              The ultimate Windows-inspired assistant for recording and analyzing your video calls. Get instant summaries, transcripts, and action items.
            </p>
            <button 
              onClick={handleNewRecording}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all shadow-xl shadow-blue-100 flex items-center gap-3 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Start New Recording
            </button>
          </div>
        )}

        {view === 'recording' && (
          <div className="h-full p-6">
            <RecorderView onRecordingComplete={onRecordingComplete} />
          </div>
        )}

        {view === 'result' && activeRecording && (
          <ResultView recording={activeRecording} />
        )}
      </main>
    </div>
  );
};

export default App;
