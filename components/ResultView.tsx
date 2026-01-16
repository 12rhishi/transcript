
import React, { useState } from 'react';
import { Recording } from '../types';
import { downloadBlob, formatDuration } from '../utils/mediaUtils';

interface ResultViewProps {
  recording: Recording;
}

const ResultView: React.FC<ResultViewProps> = ({ recording }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'details'>('summary');

  if (recording.status === 'processing') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="w-24 h-24 mb-6 relative">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing your meeting...</h2>
        <p className="text-slate-500 max-w-md">Our AI is transcribing audio, summarizing the key points, and extracting action items. This usually takes less than a minute.</p>
      </div>
    );
  }

  if (recording.status === 'failed') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Analysis Failed</h2>
        <p className="text-slate-500 mb-6">Something went wrong while processing the media.</p>
        <button className="bg-slate-800 text-white px-6 py-2 rounded-lg font-medium">Try Again</button>
      </div>
    );
  }

  const { analysis } = recording;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Header Info */}
      <div className="p-6 border-b flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{recording.name}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
            <span>{new Date(recording.timestamp).toLocaleString()}</span>
            <span>•</span>
            <span>{formatDuration(recording.duration)}</span>
            {analysis && (
              <>
                <span>•</span>
                <span className="capitalize font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{analysis.sentiment} Tone</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => fetch(recording.videoUrl).then(res => res.blob()).then(b => downloadBlob(b, `${recording.name}.webm`))}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Video
          </button>
          {recording.audioUrl && (
            <button 
              onClick={() => fetch(recording.audioUrl!).then(res => res.blob()).then(b => downloadBlob(b, `${recording.name}_audio.webm`))}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Audio
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Video Player Section */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-xl ring-1 ring-slate-200">
              <video controls className="w-full h-full" src={recording.videoUrl}></video>
            </div>

            {/* Content Tabs */}
            <div className="bg-white rounded-xl border p-1 shadow-sm flex">
              {(['summary', 'transcript', 'details'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                    activeTab === tab ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Panes */}
            <div className="bg-white rounded-xl border p-8 shadow-sm min-h-[400px]">
              {activeTab === 'summary' && analysis && (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Meeting Summary</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">{analysis.summary}</p>
                  </section>
                  <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Key Discussion Points</h3>
                    <ul className="grid grid-cols-1 gap-3">
                      {analysis.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-slate-700">
                          <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-bold shrink-0">{i + 1}</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              )}

              {activeTab === 'transcript' && analysis && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Full Transcript</h3>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {analysis.transcript || "No transcript available."}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'details' && analysis && (
                <div className="space-y-8">
                   <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Action Items</h3>
                    <div className="space-y-2">
                      {analysis.actionItems.length > 0 ? (
                        analysis.actionItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 border rounded-xl hover:border-blue-300 transition-all cursor-pointer group">
                            <div className="w-5 h-5 rounded border-2 border-slate-300 group-hover:border-blue-500 transition-colors"></div>
                            <span className="text-slate-700 font-medium">{item}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic">No action items identified.</p>
                      )}
                    </div>
                  </section>
                  <section className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-2">Meta Analysis</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Sentiment</p>
                        <p className="text-lg font-bold text-blue-600 capitalize">{analysis.sentiment}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Speaker Flow</p>
                        <p className="text-lg font-bold text-slate-700">Collaborative</p>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
