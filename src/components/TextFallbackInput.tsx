import React, { useState } from 'react';

interface TextFallbackInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const TextFallbackInput: React.FC<TextFallbackInputProps> = ({
  isOpen,
  onClose,
  onSend,
  disabled = false,
}) => {
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-11/12 max-w-lg z-30 animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="flex items-center space-x-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 shadow-2xl"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Aarav / Ananya a question about ITI admissions..."
          disabled={disabled}
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
          autoFocus
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          aria-label="Send question"
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close text input"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </form>
    </div>
  );
};
