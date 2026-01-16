
import React from 'react';
import { Recording } from '../types';

interface SidebarProps {
  recordings: Recording[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ recordings, activeId, onSelect, onNew }) => {
  return (
    <aside className="w-72 border-r bg-white flex flex-col h-full">
      <div className="p-6 border-b">
        <button 
          onClick={onNew}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Recording
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Recent Records</h3>
        {recordings.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No recordings yet.</p>
        ) : (
          recordings.map((rec) => (
            <button
              key={rec.id}
              onClick={() => onSelect(rec.id)}
              className={`w-full text-left p-3 rounded-lg transition-all group ${
                activeId === rec.id ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="font-medium truncate">{rec.name || 'Untitled Meeting'}</div>
              <div className="text-xs opacity-60 flex justify-between mt-1">
                <span>{new Date(rec.timestamp).toLocaleDateString()}</span>
                <span className={`px-1.5 py-0.5 rounded ${rec.status === 'processing' ? 'bg-amber-100 text-amber-700' : ''}`}>
                  {rec.status}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
