import React, { useState, useEffect } from 'react';
import { Gamepad2, HelpCircle, Info, Settings, XCircle, ArrowRight, User, Sparkles, ShieldCheck } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface WelcomeScreenProps {
  onEnter: () => void;
  onNavigate: (screen: 'how-to-play' | 'accessibility-info' | 'settings') => void;
  soundEffects: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onEnter,
  onNavigate,
  soundEffects
}) => {
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('wordarena_player_name') || 'Player 1';
  });

  useEffect(() => {
    localStorage.setItem('wordarena_player_name', playerName);
  }, [playerName]);

  const handleEnterGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (soundEffects) soundManager.play('turn');
    onEnter();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-indigo-600 selection:text-white">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col items-center text-center">
        
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-indigo-300 text-sm font-semibold mb-6 shadow-inner">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Fully Accessible for NVDA & Windows Narrator</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
          WORD ARENA
        </h1>
        <p className="text-xl font-medium text-indigo-400 mb-6">
          Accessible Multiplayer & Word Games
        </p>

        {/* Introduction */}
        <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
          Welcome to WordArena. Play fun typing and word games with friends or against the computer. Built with full screen reader support and keyboard navigation for all students.
        </p>

        {/* Player Name Persistent Input */}
        <form onSubmit={handleEnterGame} className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl p-5 mb-8 text-left shadow-inner">
          <label htmlFor="welcomePlayerName" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            Your Player Name
          </label>
          <input
            id="welcomePlayerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
            required
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-medium"
            placeholder="Enter your name"
          />
          <p className="text-xs text-slate-500 mt-2">
            Your name is automatically remembered for future visits.
          </p>

          <button
            type="submit"
            className="mt-5 w-full flex items-center justify-center gap-3 py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xl rounded-xl shadow-xl transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 cursor-pointer"
          >
            <span>Enter WordArena</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </form>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-lg">
          <button
            onClick={() => onNavigate('how-to-play')}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <span className="text-sm">How to Play</span>
          </button>

          <button
            onClick={() => onNavigate('how-to-play')}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
          >
            <Gamepad2 className="w-5 h-5 text-indigo-400" />
            <span className="text-sm">Game Rules</span>
          </button>

          <button
            onClick={() => onNavigate('accessibility-info')}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="text-sm">Accessibility</span>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
          >
            <Settings className="w-5 h-5 text-indigo-400" />
            <span className="text-sm">Settings</span>
          </button>
        </div>

        {/* Exit Button */}
        <div className="mt-6">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to exit WordArena?')) {
                window.close();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 text-sm font-medium rounded-xl border border-rose-900/50 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            Exit Application
          </button>
        </div>

      </div>
    </main>
  );
};
