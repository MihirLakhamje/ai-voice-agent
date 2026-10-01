import React from 'react';
import { VoiceStatus, CounselorType } from '../hooks/useLiveVoice';

interface ControlBarProps {
  status: VoiceStatus;
  counselor: CounselorType;
  isMuted: boolean;
  showTranscript: boolean;
  showKeyboard: boolean;
  onToggleCall: () => void;
  onToggleMute: () => void;
  onInterrupt: () => void;
  onSelectCounselor: (counselor: CounselorType) => void;
  onToggleTranscript: () => void;
  onToggleKeyboard: () => void;
  onOpenHelpline: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  status,
  counselor,
  isMuted,
  showTranscript,
  showKeyboard,
  onToggleCall,
  onToggleMute,
  onInterrupt,
  onSelectCounselor,
  onToggleTranscript,
  onToggleKeyboard,
  onOpenHelpline,
}) => {
  const isConnected = status === 'connected' || status === 'listening' || status === 'speaking';
  const isSpeaking = status === 'speaking';

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-4 px-4">
      {/* Top Counselor Switcher & Auxiliary Actions */}
      <div className="flex items-center justify-between w-full px-2">
        {/* Counselor Selector */}
        <div className="inline-flex p-1 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-800 shadow-inner">
          <button
            type="button"
            disabled={status === 'connecting'}
            onClick={() => onSelectCounselor('Aarav')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 ${
              counselor === 'Aarav'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Aarav (Male)</span>
          </button>
          <button
            type="button"
            disabled={status === 'connecting'}
            onClick={() => onSelectCounselor('Ananya')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 ${
              counselor === 'Ananya'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Ananya (Female)</span>
          </button>
        </div>

        {/* Helpline & Utility buttons */}
        <div className="flex items-center space-x-2">
          {/* Subtitles Toggle */}
          <button
            type="button"
            onClick={onToggleTranscript}
            aria-label="Toggle live subtitles"
            title="Toggle live captions & history"
            className={`p-2 rounded-full border transition-colors ${
              showTranscript
                ? 'bg-indigo-950/70 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </button>

          {/* Keyboard input toggle */}
          <button
            type="button"
            onClick={onToggleKeyboard}
            aria-label="Toggle text input"
            title="Type questions manually"
            className={`p-2 rounded-full border transition-colors ${
              showKeyboard
                ? 'bg-indigo-950/70 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>

          {/* National Helpline Info */}
          <button
            type="button"
            onClick={onOpenHelpline}
            aria-label="View Helpline Numbers"
            title="Helpline & Grievance Contact"
            className="p-2 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Primary Action Controls */}
      <div className="flex items-center justify-center space-x-6 py-2">
        {/* Mic Mute / Unmute Button (Only active when connected) */}
        {isConnected ? (
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
              isMuted
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-400 shadow-rose-950/50 shadow-md'
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>
        ) : (
          <div className="w-12 h-12" />
        )}

        {/* Giant Main Call / End Button */}
        <button
          type="button"
          onClick={onToggleCall}
          disabled={status === 'connecting'}
          aria-label={isConnected ? 'End voice call' : 'Start voice call'}
          className={`relative group flex items-center justify-center rounded-full transition-all duration-300 transform active:scale-95 ${
            isConnected
              ? 'w-18 h-18 bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-900/40 ring-4 ring-rose-500/20'
              : status === 'connecting'
              ? 'w-18 h-18 bg-amber-600 text-white opacity-80 cursor-wait'
              : 'w-18 h-18 bg-gradient-to-tr from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-white shadow-xl shadow-indigo-900/40 ring-4 ring-indigo-500/20'
          }`}
        >
          {isConnected ? (
            <svg
              className="w-7 h-7 transform rotate-135"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          ) : status === 'connecting' ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </button>

        {/* Interrupt / Barge-in Button (Active when model is speaking) */}
        {isConnected ? (
          <button
            type="button"
            onClick={onInterrupt}
            disabled={!isSpeaking}
            aria-label="Interrupt counselor"
            title="Interrupt & speak"
            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
              isSpeaking
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 hover:bg-amber-900/80 shadow-amber-950/40 shadow-md animate-pulse'
                : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            </svg>
          </button>
        ) : (
          <div className="w-12 h-12" />
        )}
      </div>

      {/* Status Description pill */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        {status === 'disconnected' && (
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Ready • Click to talk with {counselor}</span>
          </span>
        )}
        {status === 'connecting' && (
          <span className="flex items-center space-x-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Establishing live voice connection...</span>
          </span>
        )}
        {status === 'connected' && (
          <span className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Connected to Gemini 3.8 Live</span>
          </span>
        )}
        {status === 'listening' && (
          <span className="flex items-center space-x-1.5 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {isMuted ? 'Microphone muted (tap mic to speak)' : 'Listening... speak at any time'}
            </span>
          </span>
        )}
        {status === 'speaking' && (
          <span className="flex items-center space-x-1.5 text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>{counselor} is speaking... (tap Interrupt to stop)</span>
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center space-x-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Connection issue • Tap to retry</span>
          </span>
        )}
      </div>
    </div>
  );
};
