import React from 'react';
import { ArrowLeft, HelpCircle, CheckCircle, Zap, ShieldAlert } from 'lucide-react';

interface HowToPlayScreenProps {
  onBack: () => void;
}

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({ onBack }) => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-lg">
            <HelpCircle className="w-5 h-5" />
            <span>How to Play</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-slate-300">
          <section>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              Word Chain Battle Rules
            </h2>
            <p className="leading-relaxed">
              WordArena is an engaging English word-chain game designed for 2 to 4 players over a Local Area Network (LAN).
            </p>
          </section>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <h3 className="font-semibold text-white mb-1">1. The Word Chain</h3>
              <p className="text-sm text-slate-400">
                Player 1 enters a word (e.g., <strong className="text-white">APPLE</strong>). The next player must enter a word starting with the last letter of that word (<strong className="text-indigo-400">E</strong> for <strong className="text-white">ELEPHANT</strong>).
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <h3 className="font-semibold text-white mb-1">2. Lives & Elimination</h3>
              <p className="text-sm text-slate-400">
                Each player starts with <strong className="text-rose-400">3 lives</strong>. You lose 1 life if time expires, if your word is invalid, if it doesn't start with the required letter, or if it was already used. When lives reach zero, you are eliminated. Last player standing wins!
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <h3 className="font-semibold text-white mb-1">3. Keyboard Navigation</h3>
              <p className="text-sm text-slate-400">
                Designed for 100% keyboard and screen-reader accessibility. Use <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded text-xs font-mono">Tab</kbd> to navigate, <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded text-xs font-mono">Enter</kbd> to submit or activate buttons.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};
