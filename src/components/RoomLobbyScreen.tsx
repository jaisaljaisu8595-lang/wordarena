import React from 'react';
import { Users, Play, ArrowLeft, Copy, Shield, Gamepad2, Layers } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface RoomLobbyScreenProps {
  room: {
    code: string;
    hostIp?: string;
    gameType: 'word-chain' | 'typing-basket';
    category?: string;
    players: { id: string; name: string; isHost: boolean }[];
    gameConfig: { turnTime: number; audioAssistance: boolean; soundEffects: boolean };
  };
  isHost: boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  soundEffects: boolean;
}

export const RoomLobbyScreen: React.FC<RoomLobbyScreenProps> = ({
  room,
  isHost,
  onStartGame,
  onLeaveRoom,
  soundEffects
}) => {
  const [copied, setCopied] = React.useState(false);
  const [ipCopied, setIpCopied] = React.useState(false);

  const displayIp = room.hostIp || (typeof window !== 'undefined' && window.location.hostname !== '' ? window.location.hostname : '127.0.0.1');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyIp = () => {
    navigator.clipboard.writeText(displayIp);
    setIpCopied(true);
    setTimeout(() => setIpCopied(false), 2000);
  };

  const isTypingBasket = room.gameType === 'typing-basket';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Leave Room
          </button>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold">
            <Users className="w-5 h-5" />
            <span>LAN Multiplayer Lobby</span>
          </div>
        </div>

        {/* Connection Info (Host IP & Room Code) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Host IP Card */}
          <div className="flex flex-col items-center bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Host IP Address
            </span>
            <span className="text-xl font-extrabold font-mono text-white mb-2">
              {displayIp}:3000
            </span>
            <button
              onClick={handleCopyIp}
              className="text-xs py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg transition-all flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              {ipCopied ? 'Copied IP!' : 'Copy Host IP'}
            </button>
          </div>

          {/* Room Code Card */}
          <div className="flex flex-col items-center bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Room Code
            </span>
            <span className="text-3xl font-extrabold font-mono tracking-widest text-indigo-400 mb-2">
              {room.code}
            </span>
            <button
              onClick={handleCopyCode}
              className="text-xs py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg transition-all flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied Code!' : 'Copy Room Code'}
            </button>
          </div>
        </div>

        {/* Multiplayer Help & Connection Section */}
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 mb-6 text-xs text-indigo-200 leading-relaxed flex flex-col gap-1.5">
          <div className="font-bold text-indigo-300 flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            LAN Connection Instructions for Other Players:
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            <li>All players must be connected to the <strong className="text-white">same Wi-Fi or LAN network</strong>.</li>
            <li>Other players should click &quot;Join Room with Code&quot; on their screen, enter Host IP (<strong className="text-indigo-300">{displayIp}</strong>) and Room Code (<strong className="text-indigo-300">{room.code}</strong>).</li>
            <li>Make sure Windows Firewall allows WordArena / Node.js on private networks if connection is blocked.</li>
          </ul>
        </div>

        {/* Game Mode & Config summary */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 flex flex-col gap-2 text-sm text-slate-300">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <span className="flex items-center gap-2 font-semibold text-white">
              <Gamepad2 className="w-4 h-4 text-indigo-400" />
              Game Mode:
            </span>
            <span className="text-indigo-300 font-bold">
              {isTypingBasket ? 'Typing Basket Challenge' : 'Word Chain Battle'}
            </span>
          </div>
          {isTypingBasket && room.category && (
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="flex items-center gap-2 font-semibold text-white">
                <Layers className="w-4 h-4 text-indigo-400" />
                Category:
              </span>
              <span className="text-white capitalize font-medium">{room.category}</span>
            </div>
          )}
          <div className="flex justify-around pt-1 text-xs text-slate-400">
            <div>{isTypingBasket ? 'Game Duration:' : 'Turn Time:'} <strong className="text-white">{room.gameConfig.turnTime}s</strong></div>
            <div>Audio Assistance: <strong className="text-white">{room.gameConfig.audioAssistance ? 'ON' : 'OFF'}</strong></div>
            <div>Sound Effects: <strong className="text-white">{room.gameConfig.soundEffects ? 'ON' : 'OFF'}</strong></div>
          </div>
        </div>

        {/* Players List */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
            <span>Players Connected ({room.players.length}/4)</span>
            <span className="text-xs text-slate-400 font-normal">Minimum 2 required to start</span>
          </h2>
          <ul className="space-y-3" aria-label="Connected players list">
            {room.players.map((player, index) => (
              <li
                key={player.id}
                className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-white text-lg">{player.name}</span>
                </div>
                {player.isHost && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-indigo-600/30 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-500/30">
                    <Shield className="w-3.5 h-3.5" />
                    Host
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Start Game Action */}
        {isHost ? (
          <button
            onClick={() => {
              if (soundEffects) soundManager.play('turn');
              onStartGame();
            }}
            disabled={room.players.length < 2}
            className={`w-full flex items-center justify-center gap-3 py-4 px-6 font-bold rounded-xl text-lg transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 ${
              room.players.length >= 2
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-lg shadow-emerald-900/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Play className="w-6 h-6 fill-current" />
            {room.players.length >= 2 ? 'Start Game' : 'Waiting for at least 2 players...'}
          </button>
        ) : (
          <div className="text-center py-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-medium">
            Waiting for host to start the game...
          </div>
        )}

      </div>
    </main>
  );
};
