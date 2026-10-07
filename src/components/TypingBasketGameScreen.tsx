import React, { useState, useEffect, useRef } from 'react';
import { Clock, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { getItemIcon } from '../games/typing-basket/items';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  eliminated: boolean;
}

interface TypingBasketGameScreenProps {
  room: {
    code: string;
    players: Player[];
    category: string;
    currentTargetWord: string;
    timerRemaining: number;
    scores: Record<string, number>;
    baskets: Record<string, string[]>;
    gameConfig: { turnTime: number; audioAssistance: boolean; soundEffects: boolean };
  };
  socketId: string;
  onSubmitTypingWord: (word: string) => void;
}

export const TypingBasketGameScreen: React.FC<TypingBasketGameScreenProps> = ({
  room,
  socketId,
  onSubmitTypingWord
}) => {
  const [wordInput, setWordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input on mount and word change
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [room.currentTargetWord]);

  // Immediate target word announcement
  useEffect(() => {
    if (room.currentTargetWord) {
      const speech = `Type ${room.currentTargetWord}.`;
      setAnnouncement(speech);
      if (room.gameConfig.audioAssistance) {
        soundManager.speak(speech);
      }
    }
  }, [room.currentTargetWord, room.gameConfig.audioAssistance]);

  // F2 key handler to repeat current target word without interfering with input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        e.stopPropagation();
        if (room.currentTargetWord) {
          const speech = `Type ${room.currentTargetWord}.`;
          setAnnouncement(speech);
          soundManager.speak(speech);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [room.currentTargetWord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordInput.trim()) return;

    const trimmed = wordInput.trim();
    if (trimmed.toLowerCase() === room.currentTargetWord.toLowerCase()) {
      if (room.gameConfig.soundEffects) soundManager.play('correct');
      const msg = `Correct. ${room.currentTargetWord} added to your basket.`;
      setSuccessMessage(msg);
      setAnnouncement(msg);
      if (room.gameConfig.audioAssistance) soundManager.speak(msg);
      setTimeout(() => setSuccessMessage(''), 1000);

      onSubmitTypingWord(trimmed);
      setWordInput('');
      setErrorMessage('');
    } else {
      if (room.gameConfig.soundEffects) soundManager.play('wrong');
      const err = 'Incorrect. Try again.';
      setErrorMessage(err);
      setAnnouncement(err);
      if (room.gameConfig.audioAssistance) soundManager.speak(err);
      setWordInput('');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-3 md:p-6 selection:bg-indigo-600">
      
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {announcement}
      </div>

      {/* Top HUD */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 mb-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-indigo-600/20 text-indigo-400 font-bold rounded-xl border border-indigo-500/30 text-xs capitalize">
            {room.category}
          </div>
          <div className="text-xs md:text-sm font-medium text-slate-300">
            Typing Basket (LAN)
          </div>
        </div>

        {/* Timer display */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
          <Clock className={`w-4 h-4 ${room.timerRemaining <= 10 ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`} />
          <span className="font-mono text-base font-bold tracking-wider">
            {room.timerRemaining}s
          </span>
        </div>
      </header>

      {/* Main Game Layout */}
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-4 flex-1">
        
        {/* Target Word Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 block">
            Type This Word (Press F2 to Repeat)
          </span>
          <div className="text-4xl md:text-6xl font-extrabold text-white tracking-widest uppercase mb-2 bg-slate-950 border border-slate-800 px-6 py-4 rounded-xl text-indigo-400">
            {room.currentTargetWord}
          </div>
          <div className="flex items-center justify-center gap-2 text-lg">
            <span>Item:</span>
            <span className="text-2xl">{getItemIcon(room.currentTargetWord, room.category)}</span>
          </div>
        </div>

        {/* Typing Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
            <input
              ref={inputRef}
              type="text"
              value={wordInput}
              onChange={(e) => {
                setWordInput(e.target.value);
                setErrorMessage('');
              }}
              placeholder="Type target word here..."
              className="flex-1 px-5 py-4 bg-slate-950 border border-slate-700 rounded-xl text-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center font-bold"
              autoComplete="off"
              autoFocus
            />
            <button
              type="submit"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 font-bold text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-indigo-400 cursor-pointer text-lg"
            >
              <Send className="w-5 h-5" />
              Submit
            </button>
          </form>
          {errorMessage && (
            <p className="text-rose-400 text-xs font-medium text-center mt-3">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p className="text-emerald-400 text-xs font-medium text-center mt-3">
              {successMessage}
            </p>
          )}
        </div>

        {/* Player Baskets Grid (Side-by-side / Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
          {room.players.map((p) => {
            const score = room.scores[p.id] || 0;
            const basketItems = room.baskets[p.id] || [];
            const isMe = p.id === socketId;
            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isMe
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-white text-base block truncate">{p.name}</span>
                    {isMe && <span className="text-[10px] text-indigo-400 font-medium">(You)</span>}
                  </div>
                  <div className="px-2.5 py-0.5 bg-indigo-600/30 text-indigo-300 text-xs font-bold rounded-full">
                    Score: {score}
                  </div>
                </div>

                {/* Basket Item Preview */}
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center gap-1.5 flex-wrap min-h-[48px] max-h-24 overflow-y-auto justify-center">
                  {basketItems.map((word, idx) => (
                    <span
                      key={idx}
                      className="text-2xl drop-shadow"
                      title={word}
                    >
                      {getItemIcon(word, room.category)}
                    </span>
                  ))}
                  {basketItems.length === 0 && (
                    <span className="text-[10px] text-slate-500 italic">Empty basket</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </main>
  );
};
