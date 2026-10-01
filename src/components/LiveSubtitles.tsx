import React, { useRef, useEffect } from 'react';
import { TranscriptItem, CounselorType } from '../hooks/useLiveVoice';

interface LiveSubtitlesProps {
  transcripts: TranscriptItem[];
  activeModelText: string;
  activeUserText: string;
  counselor: CounselorType;
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export const LiveSubtitles: React.FC<LiveSubtitlesProps> = ({
  transcripts,
  activeModelText,
  activeUserText,
  counselor,
  isOpen,
  onClose,
  onClear,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcripts, activeModelText, activeUserText]);

  // Current real-time floating strip (always visible if speaking or listening, or if transcripts are toggled)
  const hasActiveText = activeModelText || activeUserText;

  return (
    <>
      {/* Floating Minimal Subtitle Banner when closed but actively speaking */}
      {!isOpen && hasActiveText && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-11/12 max-w-lg z-30 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl transition-all animate-fade-in">
            {activeModelText && (
              <div className="flex items-start space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mt-0.5 shrink-0">
                  {counselor}:
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-snug line-clamp-3">
                  {activeModelText}
                </p>
              </div>
            )}
            {activeUserText && (
              <div className="flex items-start space-x-2 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mt-0.5 shrink-0">
                  You:
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-snug italic line-clamp-2">
                  {activeUserText}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expanded Transcript Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-xl max-h-[85vh] sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="text-sm font-semibold text-white">Live Consultation Transcript</h3>
              </div>
              <div className="flex items-center space-x-2">
                {transcripts.length > 0 && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="text-xs text-slate-400 hover:text-rose-400 transition-colors px-2 py-1 rounded"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat / Transcript Stream */}
            <div
              ref={containerRef}
              className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[240px] max-h-[55vh] text-xs sm:text-sm leading-relaxed"
            >
              {transcripts.length === 0 && !hasActiveText && (
                <div className="text-center py-10 text-slate-500">
                  <p>No conversation yet.</p>
                  <p className="text-xs mt-1">Start speaking with {counselor} to see real-time subtitles.</p>
                </div>
              )}

              {transcripts.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col ${
                    item.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <span className="text-[10px] font-semibold text-slate-500 mb-0.5 px-1 uppercase tracking-wide">
                    {item.role === 'user' ? 'You' : counselor}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      item.role === 'user'
                        ? 'bg-emerald-950/70 border border-emerald-700/60 text-emerald-100 rounded-br-none'
                        : 'bg-slate-800/80 border border-slate-700/80 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))}

              {/* Streaming active items */}
              {activeUserText && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-semibold text-emerald-400 mb-0.5 px-1 uppercase tracking-wide">
                    You (Speaking...)
                  </span>
                  <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 rounded-br-none italic">
                    {activeUserText}
                  </div>
                </div>
              )}

              {activeModelText && (
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-semibold text-purple-400 mb-0.5 px-1 uppercase tracking-wide">
                    {counselor} (Speaking...)
                  </span>
                  <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 bg-purple-950/40 border border-purple-500/40 text-purple-100 rounded-bl-none">
                    {activeModelText}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 text-center">
              Responses are streamed via Gemini 3.8 Live API in real-time.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
