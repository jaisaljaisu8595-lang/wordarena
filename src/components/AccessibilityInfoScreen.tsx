import React from 'react';
import { ArrowLeft, Info, CheckCircle2 } from 'lucide-react';

interface AccessibilityInfoScreenProps {
  onBack: () => void;
}

export const AccessibilityInfoScreen: React.FC<AccessibilityInfoScreenProps> = ({ onBack }) => {
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
            <Info className="w-5 h-5" />
            <span>Accessibility Information</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-slate-300">
          <section>
            <h2 className="text-xl font-bold text-white mb-2">Designed for Blind & Visually Impaired Students</h2>
            <p className="leading-relaxed">
              WordArena is built from the ground up for seamless compatibility with standard screen readers such as <strong className="text-white">NVDA</strong> and <strong className="text-white">Microsoft Narrator</strong>.
            </p>
          </section>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white">No Interfering Screen Reader Settings</h3>
                <p className="text-sm text-slate-400">
                  WordArena never alters your screen reader speed, pitch, or voice. Your personal accessibility configuration remains untouched.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white">Keyboard-First Navigation</h3>
                <p className="text-sm text-slate-400">
                  A mouse is never required. Logical tab orders, visible focus indicators, and automatic focus routing on your turn ensure smooth gameplay.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white">Optional Audio Assistance</h3>
                <p className="text-sm text-slate-400">
                  Audio assistance is OFF by default so it does not conflict with NVDA. You can toggle it ON in Settings for synthesized turn prompts.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};
