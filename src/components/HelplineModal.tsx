import React, { useState } from 'react';

interface HelplineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelplineModal: React.FC<HelplineModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('1800-200-5566');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">ITI Admissions Helpdesk</h3>
              <p className="text-[11px] text-slate-400">Directorate General of Training (DGT)</p>
            </div>
          </div>
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          {/* Toll Free Helpline Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-400">
                National Toll-Free Helpline
              </span>
              <p className="text-lg font-bold text-white tracking-wide mt-0.5">1800-200-5566</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Mon – Sat, 9:00 AM to 6:00 PM IST</p>
            </div>
            <button
              type="button"
              onClick={handleCopyNumber}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Grievance & Payment Disputes Info */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200">When to contact the Helpdesk:</h4>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-400 text-[11px]">
              <li>Fee deducted but application payment status shows 'Pending' or 'Failed'</li>
              <li>Discrepancies in category certificates, marks sheet, or domicile verification</li>
              <li>Technical errors during choice locking or merit allotment download</li>
              <li>Special reservation verification (EWS, PwD, Ex-Servicemen)</li>
            </ul>
          </div>

          {/* Required details banner */}
          <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-[11px] text-indigo-300">
            <p className="font-medium">Have these ready before calling:</p>
            <p className="text-indigo-300/80 mt-0.5">
              Online Application ID, Aadhaar Number, and Payment Transaction Ref ID.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
