import React from 'react';
import { Trophy, Award, RotateCcw, Home, CheckCircle2, XCircle, Heart } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface Player {
  id: string;
  name: string;
  lives: number;
  eliminated: boolean;
  stats: { wordsPlayed: number; correctWords: number; invalidAttempts: number };
}

interface GameOverScreenProps {
  room: {
    code: string;
    players: Player[];
    winner: string | null;
  };
  onPlayAgain: () => void;
  onHome: () => void;
  soundEffects: boolean;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  room,
  onPlayAgain,
  onHome,
  soundEffects
}) => {
  React.useEffect(() => {
    if (soundEffects) {
      soundManager.play('win');
    }
  }, [soundEffects]);

  // Sort players by elimination status and lives
  const sortedPlayers = [...room.players].sort((a, b) => {
    if (!a.eliminated && b.eliminated) return -1;
    if (a.eliminated && !b.eliminated) return 1;
    return b.lives - a.lives;
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        
        {/* Trophy Icon & Title */}
        <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400 mb-4">
          <Trophy className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
          GAME OVER
        </h1>
        <p className="text-xl font-semibold text-amber-400 mb-8">
          WINNER: {room.winner || 'No Winner'}
        </p>

        {/* Final Standings */}
        <div className="w-full mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Final Standings
          </h2>
          <ul className="space-y-3" aria-label="Final standings list">
            {sortedPlayers.map((player, index) => (
              <li
                key={player.id}
                className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-white text-lg">{player.name}</span>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                      <span>Correct: <strong className="text-emerald-400">{player.stats.correctWords}</strong></span>
                      <span>Invalid: <strong className="text-rose-400">{player.stats.invalidAttempts}</strong></span>
                      <span>Total: <strong className="text-white">{player.stats.wordsPlayed}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-4 h-4 ${
                        i < player.lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full">
          <button
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 cursor-pointer text-lg"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
          <button
            onClick={onHome}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 cursor-pointer text-lg"
          >
            <Home className="w-5 h-5 text-indigo-400" />
            Main Menu
          </button>
        </div>

      </div>
    </main>
  );
};
