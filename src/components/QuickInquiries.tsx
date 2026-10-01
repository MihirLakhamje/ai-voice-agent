import React from 'react';

interface QuickInquiriesProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

const PROMPTS = [
  {
    icon: '⚡',
    title: 'Value vs Degree',
    query: 'Is an ITI qualification as valuable as a regular degree or diploma?',
  },
  {
    icon: '🎯',
    title: '10th Marks & Eligibility',
    query: 'I have average marks in 10th standard. Can I still get admission in ITI?',
  },
  {
    icon: '🛠️',
    title: 'Electrician vs Fitter',
    query: 'I am confused about trade selection. Should I choose Electrician or Fitter?',
  },
  {
    icon: '💰',
    title: 'Fees & Scholarships',
    query: 'What is the fee structure for Government ITIs, and are scholarships available?',
  },
  {
    icon: '📄',
    title: 'Required Documents',
    query: 'What documents do I need for online registration and verification?',
  },
  {
    icon: '🏢',
    title: 'NCVT vs SCVT',
    query: 'What is the difference between NCVT and SCVT certification?',
  },
];

export const QuickInquiries: React.FC<QuickInquiriesProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 mt-6">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Quick Inquiries (Tap to Ask)
        </span>
        <span className="text-[10px] text-slate-500">Instant AI Counselor Answer</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PROMPTS.map((item) => (
          <button
            key={item.title}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(item.query)}
            className="group relative flex flex-col text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-sm">{item.icon}</span>
              <span className="font-medium text-slate-200 group-hover:text-white line-clamp-1">
                {item.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-400/90 group-hover:text-slate-300 line-clamp-2 leading-relaxed">
              "{item.query}"
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
