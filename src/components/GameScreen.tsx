import React, { useState, useEffect, useRef } from 'react';
import { Clock, Heart, Send, AlertCircle, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface Player {
  id: string;
  name: string;
  lives: number;
  isHost: boolean;
  eliminated: boolean;
  stats: { wordsPlayed: number; correctWords: number; invalidAttempts: number };
}

interface HistoryItem {
  playerName: string;
  word: string;
  valid: boolean;
  reason?: string;
}

interface GameScreenProps {
  room: {
    code: string;
    players: Player[];
    currentTurnPlayerIndex: number;
    currentLetter: string;
    timerRemaining: number;
    history: HistoryItem[];
    gameConfig: { turnTime: number; audioAssistance: boolean; soundEffects: boolean };
  };
  socketId: string;
  onSubmitWord: (word: string) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  room,
  socketId,
  onSubmitWord
}) => {
  const [wordInput, setWordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPlayer = room.players[room.currentTurnPlayerIndex];
  const isMyTurn = currentPlayer && currentPlayer.id === socketId && !currentPlayer.eliminated;
  const myPlayer = room.players.find(p => p.id === socketId);

  // Auto focus input when it becomes my turn
  useEffect(() => {
    if (isMyTurn && inputRef.current) {
      inputRef.current.focus();
      if (room.gameConfig.audioAssistance) {
        soundManager.speak(`Your turn. Start with letter ${room.currentLetter}`);
      }
      if (room.gameConfig.soundEffects) {
        soundManager.play('turn');
      }
    }
  }, [room.currentTurnPlayerIndex, isMyTurn, room.currentLetter, room.gameConfig]);

  // F2 key handler to repeat current turn instruction if it is my turn
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        if (isMyTurn && room.currentLetter) {
          const announcement = `Your turn. Start with letter ${room.currentLetter}`;
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(announcement);
              window.speechSynthesis.speak(utterance);
            } catch {
              // fallback
            }
          }
          soundManager.speak(announcement);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMyTurn, room.currentLetter]);

  // Timer warning announcements
  useEffect(() => {
    if (room.timerRemaining === 10 || room.timerRemaining === 5 || room.timerRemaining === 3) {
      if (room.gameConfig.audioAssistance) {
        soundManager.speak(`${room.timerRemaining} seconds remaining`);
      }
      if (room.gameConfig.soundEffects && isMyTurn) {
        soundManager.play('warning');
      }
    }
  }, [room.timerRemaining, room.gameConfig, isMyTurn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMyTurn) return;
    if (!wordInput.trim()) {
      setErrorMessage('Please enter a word.');
      return;
    }
    setErrorMessage('');
    onSubmitWord(wordInput.trim());
    setWordInput('');
  };

  const totalGameTimer = (room as any).totalGameTimerRemaining || 300;
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col p-3 md:p-6 selection:bg-indigo-600">
      
      {/* Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isMyTurn ? `Your turn. Start with letter ${room.currentLetter}. Turn time ${room.timerRemaining} seconds.` : `Waiting for ${currentPlayer?.name || 'next player'}. Current letter is ${room.currentLetter}.`}
      </div>

      {/* Top HUD */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 mb-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-indigo-600/20 text-indigo-400 font-bold rounded-xl border border-indigo-500/30 text-xs">
            Room: {room.code}
          </div>
          <div className="text-xs md:text-sm font-medium text-slate-300">
            Word Chain Battle (LAN)
          </div>
        </div>

        {/* Timer display */}
        <div className="flex items-center gap-4">
          <div className="text-xs font-semibold text-indigo-400 hidden md:block">
            Total: <span className="font-mono text-white font-bold">{formatTime(totalGameTimer)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
            <Clock className={`w-4 h-4 ${room.timerRemaining <= 5 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
            <span className="font-mono text-sm md:text-base font-bold tracking-wider text-amber-400">
              {room.timerRemaining}s
            </span>
          </div>
        </div>
      </header>

      {/* Main Game Layout */}
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-4 flex-1">
        
        {/* Side-by-Side / Grid Player Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
          {room.players.map((p, idx) => {
            const isCurrent = idx === room.currentTurnPlayerIndex && !p.eliminated;
            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                  isCurrent
                    ? 'bg-indigo-950/80 border-indigo-500 shadow-lg ring-2 ring-indigo-500/50'
                    : p.eliminated
                    ? 'bg-rose-950/20 border-rose-900/30 opacity-60'
                    : 'bg-slate-900/95 border-slate-800'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${isCurrent ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-white text-base truncate block">{p.name}</span>
                    {p.id === socketId && <span className="text-[10px] text-indigo-400 font-medium">(You)</span>}
                  </div>
                  {p.eliminated ? (
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded">ELIMINATED</span>
                  ) : isCurrent ? (
                    <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full animate-pulse">YOUR TURN</span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Waiting</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 justify-center mt-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-5 h-5 ${
                        i < p.lives ? 'text-rose-500 fill-rose-500 drop-shadow' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center: Current Letter & Word Input Area */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl md:rounded-3xl p-6 shadow-xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 block">
            {isMyTurn ? 'Your Turn — Start With Letter (Press F2 to Repeat)' : `Waiting for ${currentPlayer?.name || 'Player'}`}
          </span>
          <div className="text-5xl md:text-7xl font-black text-amber-300 tracking-widest uppercase bg-gradient-to-r from-slate-950 to-indigo-950 border border-indigo-500/40 py-5 px-4 rounded-2xl shadow-inner drop-shadow mb-4">
            {room.currentLetter}
          </div>
          <p className="text-slate-400 text-xs md:text-sm mb-4">
            {isMyTurn
              ? `Enter an English word starting with "${room.currentLetter}". Press Submit or Enter.`
              : `${currentPlayer?.name} is thinking of a word starting with "${room.currentLetter}"...`}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
            <input
              ref={inputRef}
              type="text"
              value={wordInput}
              onChange={(e) => {
                setWordInput(e.target.value);
                setErrorMessage('');
              }}
              disabled={!isMyTurn || (myPlayer?.eliminated ?? false)}
              placeholder={isMyTurn ? `Type word starting with ${room.currentLetter}...` : 'Waiting for your turn...'}
              className={`flex-1 px-5 py-4 bg-slate-950 border-2 rounded-xl md:rounded-2xl text-xl text-white font-bold text-center placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500 shadow-inner ${
                !isMyTurn ? 'opacity-50 cursor-not-allowed border-slate-800' : 'border-indigo-500/60'
              }`}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!isMyTurn || (myPlayer?.eliminated ?? false)}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl md:rounded-2xl shadow-xl text-lg transition-all cursor-pointer flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              Submit
            </button>
          </form>

          {errorMessage && (
            <p className="text-rose-400 text-xs font-bold text-center mt-3 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </p>
          )}
        </div>

        {/* Word Chain History Stream */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Recent Word History
          </h3>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
            {room.history.slice(0, 10).map((item, idx) => (
              <div
                key={idx}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                  item.valid
                    ? 'bg-slate-950 border-slate-800 text-slate-200'
                    : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                }`}
              >
                <span className="text-slate-400">{item.playerName}:</span>
                <span className="font-bold text-white">{item.word}</span>
                {!item.valid && <span className="text-rose-400 text-[10px]">({item.reason})</span>}
              </div>
            ))}
            {room.history.length === 0 && (
              <p className="text-xs text-slate-500 italic">No words played yet. Be the first!</p>
            )}
          </div>
        </div>

      </div>

    </main>
  );
};
