import React from 'react';
import { ArrowLeft, Settings as SettingsIcon, Volume2, Music } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SettingsScreenProps {
  config: {
    audioAssistance: boolean;
    soundEffects: boolean;
  };
  onUpdateConfig: (newConfig: { audioAssistance?: boolean; soundEffects?: boolean }) => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  config,
  onUpdateConfig,
  onBack
}) => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col">
        
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
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
          </div>
        </div>

        {/* Audio Assistance Setting */}
        <div className="mb-6 flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="block font-semibold text-white">Audio Assistance</span>
              <span className="text-xs text-slate-400">Spoken announcements for turn changes and time warnings (OFF by default)</span>
            </div>
          </div>
          <button
            role="switch"
            aria-checked={config.audioAssistance}
            onClick={() => {
              const newState = !config.audioAssistance;
              onUpdateConfig({ audioAssistance: newState });
              soundManager.setSpeechEnabled(newState);
              if (newState) soundManager.speak('Audio assistance enabled');
            }}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer ${
              config.audioAssistance
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {config.audioAssistance ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Sound Effects Setting */}
        <div className="mb-4 flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="block font-semibold text-white">Sound Effects</span>
              <span className="text-xs text-slate-400">Retro sound effects for correct/wrong answers and game events</span>
            </div>
          </div>
          <button
            role="switch"
            aria-checked={config.soundEffects}
            onClick={() => {
              const newState = !config.soundEffects;
              onUpdateConfig({ soundEffects: newState });
              soundManager.setSoundEnabled(newState);
              if (newState) soundManager.play('correct');
            }}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer ${
              config.soundEffects
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {config.soundEffects ? 'ON' : 'OFF'}
          </button>
        </div>

      </div>
    </main>
  );
};
