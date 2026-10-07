import React from 'react';
import { Trophy, RotateCcw, Home, ShoppingBag } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface Player {
  id: string;
  name: string;
}

interface TypingBasketGameOverScreenProps {
  room: {
    code: string;
    players: Player[];
    winner: string | null;
    scores: Record<string, number>;
    baskets: Record<string, string[]>;
  };
  onPlayAgain: () => void;
  onHome: () => void;
  soundEffects: boolean;
}

export const TypingBasketGameOverScreen: React.FC<TypingBasketGameOverScreenProps> = ({
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

  // Sort players by score descending
  const sortedPlayers = [...room.players].sort((a, b) => {
    const scA = room.scores[a.id] || 0;
    const scB = room.scores[b.id] || 0;
    return scB - scA;
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
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
            Final Scores & Baskets
          </h2>
          <ul className="space-y-3" aria-label="Final standings list">
            {sortedPlayers.map((player, index) => {
              const score = room.scores[player.id] || 0;
              const basketItems = room.baskets[player.id] || [];
              return (
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
                      <div className="text-xs text-slate-400 mt-1">
                        Words Completed: <strong className="text-emerald-400">{basketItems.length}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-300 font-bold text-lg">
                    {score} pts
                  </div>
                </li>
              );
            })}
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
