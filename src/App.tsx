/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLiveVoice, CounselorType } from './hooks/useLiveVoice';
import { VoiceOrb } from './components/VoiceOrb';
import { ControlBar } from './components/ControlBar';
import { QuickInquiries } from './components/QuickInquiries';
import { LiveSubtitles } from './components/LiveSubtitles';
import { HelplineModal } from './components/HelplineModal';
import { TextFallbackInput } from './components/TextFallbackInput';

export default function App() {
  const {
    status,
    counselor,
    isMuted,
    errorMessage,
    userVolume,
    counselorVolume,
    transcripts,
    activeModelText,
    activeUserText,
    startSession,
    endSession,
    toggleMute,
    interrupt,
    sendTextMessage,
    setCounselor,
  } = useLiveVoice();

  const [showTranscript, setShowTranscript] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showHelpline, setShowHelpline] = useState(false);

  const isConnected = status === 'connected' || status === 'listening' || status === 'speaking';

  const handleToggleCall = () => {
    if (isConnected) {
      endSession();
    } else {
      startSession();
    }
  };

  const handleSelectCounselor = (newCounselor: CounselorType) => {
    if (newCounselor === counselor) return;
    if (isConnected) {
      // Reconnect with new counselor voice
      startSession(newCounselor);
    } else {
      setCounselor(newCounselor);
    }
  };

  const handleSelectPrompt = (promptText: string) => {
    if (isConnected) {
      sendTextMessage(promptText);
    } else {
      // Start session and send once connected
      startSession().then(() => {
        setTimeout(() => {
          sendTextMessage(promptText);
        }, 1200);
      });
    }
  };

  const handleSendTextMessage = (text: string) => {
    if (isConnected) {
      sendTextMessage(text);
    } else {
      startSession().then(() => {
        setTimeout(() => {
          sendTextMessage(text);
        }, 1200);
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 font-sans relative overflow-x-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-indigo-900/20 via-slate-900/0 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-t from-violet-900/15 via-slate-900/0 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-5 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-950/60 ring-1 ring-white/10">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                ITI Admission Voice Counselor
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full">
                NCVT / SCVT Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Official Voice Assistant • Directorate General of Training
            </p>
          </div>
        </div>

        {/* Live Model Badge */}
        <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-full px-3 py-1 text-xs shadow-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-emerald-400 animate-pulse'
                : status === 'connecting'
                ? 'bg-amber-400 animate-ping'
                : 'bg-slate-500'
            }`}
          />
          <span className="text-[11px] font-medium text-slate-300 hidden sm:inline">
            gemini-3.8-live
          </span>
          <span className="text-[11px] font-medium text-slate-300 sm:hidden">Live API</span>
        </div>
      </header>

      {/* Main Center Area: Distraction-free Audio Visualizer */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-2 z-10 w-full max-w-2xl mx-auto">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="w-full max-w-md mb-4 p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-center justify-between shadow-lg animate-fade-in">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={handleToggleCall}
              className="text-xs font-semibold underline hover:text-white px-2 py-0.5"
            >
              Retry
            </button>
          </div>
        )}

        {/* Voice Visualizer Orb */}
        <div className="my-2 sm:my-4 flex flex-col items-center">
          <VoiceOrb
            status={status}
            userVolume={userVolume}
            counselorVolume={counselorVolume}
            counselorName={counselor}
            isMuted={isMuted}
            onClick={handleToggleCall}
          />
        </div>

        {/* Tactile Control Bar */}
        <ControlBar
          status={status}
          counselor={counselor}
          isMuted={isMuted}
          showTranscript={showTranscript}
          showKeyboard={showKeyboard}
          onToggleCall={handleToggleCall}
          onToggleMute={toggleMute}
          onInterrupt={interrupt}
          onSelectCounselor={handleSelectCounselor}
          onToggleTranscript={() => setShowTranscript((prev) => !prev)}
          onToggleKeyboard={() => setShowKeyboard((prev) => !prev)}
          onOpenHelpline={() => setShowHelpline(true)}
        />

        {/* Minimal Quick Inquiry Chips */}
        <QuickInquiries
          onSelectPrompt={handleSelectPrompt}
          disabled={status === 'connecting'}
        />
      </main>

      {/* Floating Subtitles & Conversation History */}
      <LiveSubtitles
        transcripts={transcripts}
        activeModelText={activeModelText}
        activeUserText={activeUserText}
        counselor={counselor}
        isOpen={showTranscript}
        onClose={() => setShowTranscript(false)}
        onClear={() => {}}
      />

      {/* Text Fallback Input Bar */}
      <TextFallbackInput
        isOpen={showKeyboard}
        onClose={() => setShowKeyboard(false)}
        onSend={handleSendTextMessage}
        disabled={status === 'connecting'}
      />

      {/* National ITI Admissions Helpline Modal */}
      <HelplineModal
        isOpen={showHelpline}
        onClose={() => setShowHelpline(false)}
      />

      {/* Clean Distraction-Free Footer */}
      <footer className="w-full py-3 text-center text-[11px] text-slate-500 z-10 border-t border-slate-900/80">
        <p>
          ITI Admissions Portal Voice Assistant • Powered by Gemini 3.8 Live API • Low-latency voice interaction
        </p>
      </footer>
    </div>
  );
}
