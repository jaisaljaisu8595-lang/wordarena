import React, { useState, useEffect } from 'react';
import { Users, PlusCircle, LogIn, HelpCircle, Settings, Info, XCircle, Clock, Gamepad2, Layers, Cpu, Globe, ArrowLeft, Keyboard } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { TYPING_CATEGORIES } from '../games/typing-basket/categories';

interface HomeScreenProps {
  onCreateRoom: (playerName: string, totalGameTime: number, turnTime: number, gameType: 'word-chain' | 'typing-basket', category: string) => void;
  onJoinRoom: (hostIp: string, code: string, playerName: string) => void;
  onStartVsComputer: (gameType: 'word-chain' | 'typing-basket', totalGameTime: number, turnTime: number, category: string) => void;
  onNavigate: (screen: 'home' | 'lobby' | 'game' | 'settings' | 'how-to-play' | 'accessibility-info' | 'typing-school') => void;
  soundEffects: boolean;
}

type HomeStep = 'games-list' | 'mode-select' | 'friends-setup' | 'computer-setup' | 'join-room';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onCreateRoom,
  onJoinRoom,
  onStartVsComputer,
  onNavigate,
  soundEffects
}) => {
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('wordarena_player_name') || 'Player 1';
  });

  useEffect(() => {
    localStorage.setItem('wordarena_player_name', playerName);
  }, [playerName]);

  const [hostIp, setHostIp] = useState(() => {
    return localStorage.getItem('wordarena_host_ip') || 'localhost';
  });

  useEffect(() => {
    localStorage.setItem('wordarena_host_ip', hostIp);
  }, [hostIp]);

  const [joinCode, setJoinCode] = useState('');
  const [step, setStep] = useState<HomeStep>('games-list');
  const [gameType, setGameType] = useState<'word-chain' | 'typing-basket'>('word-chain');
  const [selectedCategory, setSelectedCategory] = useState('fruits');
  
  // Timers
  const [totalGameTime, setTotalGameTime] = useState(300); // 5 minutes default
  const [turnTime, setTurnTime] = useState(30); // 30 seconds default
  const [errorMessage, setErrorMessage] = useState('');

  const totalGameTimeOptions = [
    { label: '1 minute', value: 60 },
    { label: '2 minutes', value: 120 },
    { label: '3 minutes', value: 180 },
    { label: '5 minutes', value: 300 },
    { label: '10 minutes', value: 600 }
  ];

  const turnTimeOptions = [15, 30, 45, 60];
  const typingBasketTimeOptions = [10, 20, 30, 45, 60, 90, 120];

  const handleLanCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (soundEffects) soundManager.play('turn');
    onCreateRoom(playerName.trim() || 'Player 1', totalGameTime, turnTime, gameType, selectedCategory);
  };

  const handleVsComputerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (soundEffects) soundManager.play('turn');
    onStartVsComputer(gameType, totalGameTime, turnTime, selectedCategory);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setErrorMessage('Please enter a valid 4-digit room code.');
      return;
    }
    if (soundEffects) soundManager.play('turn');
    onJoinRoom(hostIp.trim() || 'localhost', joinCode.trim(), playerName.trim() || 'Player 2');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-indigo-600 selection:text-white">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        
        {/* App Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            WordArena
          </h1>
        </div>
        <p className="text-slate-400 text-center mb-6">
          Accessible Multiplayer & Solo Word Games
        </p>

        {/* Player Name Input */}
        <div className="w-full mb-6">
          <label htmlFor="playerNameInput" className="block text-sm font-medium text-slate-300 mb-2">
            Your Player Name
          </label>
          <input
            id="playerNameInput"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
            placeholder="Enter your name"
          />
        </div>

        {/* STEP 1: GAMES LIST */}
        {step === 'games-list' && (
          <div className="w-full flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Select a Game
            </h2>

            <button
              onClick={() => {
                setGameType('word-chain');
                setTotalGameTime(300);
                setTurnTime(30);
                setStep('mode-select');
              }}
              className="w-full flex items-center justify-between p-5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-white font-bold text-xl transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 cursor-pointer shadow-lg"
            >
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-7 h-7 text-indigo-400" />
                <span>Word Chain Battle</span>
              </div>
              <span className="text-sm font-normal text-indigo-300 bg-indigo-600/30 px-3 py-1 rounded-lg">Play →</span>
            </button>

            <button
              onClick={() => {
                setGameType('typing-basket');
                setTotalGameTime(60);
                setTurnTime(60);
                setStep('mode-select');
              }}
              className="w-full flex items-center justify-between p-5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-white font-bold text-xl transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 cursor-pointer shadow-lg"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-7 h-7 text-indigo-400" />
                <span>Typing Basket Challenge</span>
              </div>
              <span className="text-sm font-normal text-indigo-300 bg-indigo-600/30 px-3 py-1 rounded-lg">Play →</span>
            </button>

            <button
              onClick={() => onNavigate('typing-school')}
              className="w-full flex items-center justify-between p-5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-white font-bold text-xl transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 cursor-pointer shadow-lg"
            >
              <div className="flex items-center gap-3">
                <Keyboard className="w-7 h-7 text-indigo-400" />
                <span>Typing School</span>
              </div>
              <span className="text-sm font-normal text-indigo-300 bg-indigo-600/30 px-3 py-1 rounded-lg">Play →</span>
            </button>

            <div className="border-t border-slate-800 my-2" />

            <button
              onClick={() => setStep('join-room')}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 cursor-pointer"
            >
              <LogIn className="w-5 h-5 text-indigo-400" />
              Join Room with Code
            </button>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <button
                onClick={() => onNavigate('how-to-play')}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              >
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                How to Play
              </button>
              <button
                onClick={() => onNavigate('settings')}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              >
                <Settings className="w-5 h-5 text-indigo-400" />
                Settings
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onNavigate('accessibility-info')}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              >
                <Info className="w-5 h-5 text-indigo-400" />
                Accessibility Info
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to exit WordArena?')) {
                    window.close();
                  }
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 font-medium rounded-xl border border-rose-900/50 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
                Exit
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MODE SELECT ("How do you want to play?") */}
        {step === 'mode-select' && (
          <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setStep('games-list')}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <span className="text-sm font-bold text-indigo-400">
                {gameType === 'word-chain' ? 'Word Chain Battle' : 'Typing Basket Challenge'}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-4">
              How do you want to play?
            </h2>

            <button
              onClick={() => setStep('friends-setup')}
              className="w-full flex items-center justify-center gap-3 py-5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded-xl shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 cursor-pointer"
            >
              <Users className="w-6 h-6" />
              Play with Friends
            </button>

            <button
              onClick={() => setStep('computer-setup')}
              className="w-full flex items-center justify-center gap-3 py-5 px-6 bg-slate-800 hover:bg-slate-700 text-indigo-200 font-bold text-lg rounded-xl border border-indigo-500/30 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 cursor-pointer"
            >
              <Cpu className="w-6 h-6 text-indigo-400" />
              Play with Computer
            </button>
          </div>
        )}

        {/* STEP 3A: FRIENDS SETUP */}
        {step === 'friends-setup' && (
          <form onSubmit={handleLanCreateSubmit} className="w-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('mode-select')}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <span className="text-sm font-bold text-indigo-400">Play with Friends</span>
            </div>

            {gameType === 'typing-basket' && (
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Word Category
                </label>
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Category">
                  {Object.values(TYPING_CATEGORIES).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      role="radio"
                      aria-checked={selectedCategory === cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`py-2.5 px-3 rounded-xl font-medium border transition-all text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameType === 'word-chain' ? (
              <>
                <div>
                  <fieldset>
                    <legend className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      Total Game Time
                    </legend>
                    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Total Game Time">
                      {totalGameTimeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={totalGameTime === opt.value}
                          onClick={() => setTotalGameTime(opt.value)}
                          className={`py-2.5 px-2 rounded-xl text-sm font-semibold border transition-all text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer ${
                            totalGameTime === opt.value
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div>
                  <fieldset>
                    <legend className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      Individual Turn Time
                    </legend>
                    <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Turn Time">
                      {turnTimeOptions.map((t) => (
                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={turnTime === t}
                          onClick={() => setTurnTime(t)}
                          className={`py-2.5 px-2 rounded-xl text-sm font-semibold border transition-all text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer ${
                            turnTime === t
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                          }`}
                        >
                          {t}s
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </>
            ) : (
              <div>
                <fieldset>
                  <legend className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    Game Duration
                  </legend>
                  <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Timer Option">
                    {typingBasketTimeOptions.map((time) => (
                      <button
                        key={time}
                        type="button"
                        role="radio"
                        aria-checked={totalGameTime === time}
                        onClick={() => setTotalGameTime(time)}
                        className={`py-3 px-3 rounded-xl font-semibold border transition-all text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer ${
                          totalGameTime === time
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        {time}s
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all text-lg cursor-pointer"
            >
              Create Room & Start Lobby
            </button>
          </form>
        )}

        {/* STEP 3B: COMPUTER SETUP */}
        {step === 'computer-setup' && (
          <form onSubmit={handleVsComputerSubmit} className="w-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('mode-select')}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <span className="text-sm font-bold text-indigo-400">Play with Computer</span>
            </div>

            {gameType === 'typing-basket' && (
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Word Category
                </label>
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Category">
                  {Object.values(TYPING_CATEGORIES).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      role="radio"
                      aria-checked={selectedCategory === cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`py-2.5 px-3 rounded-xl font-medium border transition-all text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameType === 'word-chain' ? (
              <>
                <div>
                  <fieldset>
                    <legend className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      Total Game Time
                    </legend>
                    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Total Game Time">
                      {totalGameTimeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={totalGameTime === opt.value}
                          onClick={() => setTotalGameTime(opt.value)}
                          className={`py-2.5 px-2 rounded-xl text-sm font-semibold border transition-all text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer ${
                            totalGameTime === opt.value
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div>
                  <fieldset>
                    <legend className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      Individual Turn Time
                    </legend>
                    <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Turn Time">
                      {turnTimeOptions.map((t) => (
                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={turnTime === t}
                          onClick={() => setTurnTime(t)}
                          className={`py-2.5 px-2 rounded-xl text-sm font-semibold border transition-all text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer ${
                            turnTime === t
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                          }`}
                        >
                          {t}s
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </>
            ) : (
              <div>
                <fieldset>
                  <legend className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    Game Duration
                  </legend>
                  <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Timer Option">
                    {typingBasketTimeOptions.map((time) => (
                      <button
                        key={time}
                        type="button"
                        role="radio"
                        aria-checked={totalGameTime === time}
                        onClick={() => setTotalGameTime(time)}
                        className={`py-3 px-3 rounded-xl font-semibold border transition-all text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer ${
                          totalGameTime === time
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        {time}s
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all text-lg cursor-pointer"
            >
              Start Solo Game
            </button>
          </form>
        )}

        {/* JOIN ROOM SCREEN */}
        {step === 'join-room' && (
          <form onSubmit={handleJoinSubmit} className="w-full flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('games-list')}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <span className="text-sm font-bold text-indigo-400">Join Room (LAN or Online)</span>
            </div>

            <div className="bg-indigo-950/30 border border-indigo-500/30 p-3.5 rounded-xl text-xs text-indigo-200 leading-relaxed">
              <strong>Multiplayer Connection:</strong> Enter either a <strong>LAN Host IP</strong> (for same Wi-Fi/network) OR a <strong>Public Online Server URL</strong> (e.g. <code>https://wordarena-server.onrender.com</code>), along with the 4-digit Room Code.
            </div>

            <div>
              <label htmlFor="hostIpInput" className="block text-sm font-medium text-slate-300 mb-1.5">
                Host IP or Online Server URL (leave blank for default)
              </label>
              <input
                id="hostIpInput"
                type="text"
                value={hostIp}
                onChange={(e) => setHostIp(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="192.168.1.50 or https://server.onrender.com"
              />
            </div>

            <div>
              <label htmlFor="roomCodeInput" className="block text-sm font-medium text-slate-300 mb-1.5">
                Enter 4-Digit Room Code
              </label>
              <input
                id="roomCodeInput"
                type="text"
                maxLength={4}
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.replace(/\D/g, ''));
                  setErrorMessage('');
                }}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-center text-3xl font-mono tracking-widest placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="5832"
              />
            </div>
            {errorMessage && (
              <p className="text-rose-400 text-sm">{errorMessage}</p>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all text-lg cursor-pointer"
            >
              Connect to Room
            </button>
          </form>
        )}

      </div>
    </main>
  );
};
