import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeScreen } from './components/HomeScreen';
import { RoomLobbyScreen } from './components/RoomLobbyScreen';
import { GameScreen } from './components/GameScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { TypingBasketGameScreen } from './components/TypingBasketGameScreen';
import { TypingBasketGameOverScreen } from './components/TypingBasketGameOverScreen';
import { WordChainVsComputerScreen } from './components/WordChainVsComputerScreen';
import { TypingBasketVsComputerScreen } from './components/TypingBasketVsComputerScreen';
import { TypingSchoolScreen } from './components/TypingSchoolScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { HowToPlayScreen } from './components/HowToPlayScreen';
import { AccessibilityInfoScreen } from './components/AccessibilityInfoScreen';

type Screen = 'welcome' | 'home' | 'lobby' | 'game' | 'gameover' | 'word-chain-vs-computer' | 'typing-basket-vs-computer' | 'typing-school' | 'settings' | 'how-to-play' | 'accessibility-info';

interface Player {
  id: string;
  name: string;
  lives: number;
  isHost: boolean;
  eliminated: boolean;
  stats: { wordsPlayed: number; correctWords: number; invalidAttempts: number };
}

interface Room {
  code: string;
  hostId: string;
  hostIp?: string;
  players: Player[];
  status: 'lobby' | 'playing' | 'gameover';
  gameType: 'word-chain' | 'typing-basket';
  category: string;
  gameConfig: {
    totalGameTime: number;
    turnTime: number;
    audioAssistance: boolean;
    soundEffects: boolean;
  };
  currentTurnPlayerIndex: number;
  currentLetter: string;
  currentTargetWord: string;
  scores: Record<string, number>;
  baskets: Record<string, string[]>;
  timerRemaining: number;
  totalGameTimerRemaining: number;
  winner: string | null;
  history: { playerName: string; word: string; valid: boolean; reason?: string }[];
}

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [screen, setScreen] = useState<Screen>('welcome');
  const [room, setRoom] = useState<Room | null>(null);
  const [vsComputerConfig, setVsComputerConfig] = useState({
    gameType: 'word-chain' as 'word-chain' | 'typing-basket',
    totalGameTime: 300,
    turnTime: 30,
    category: 'fruits'
  });
  const [config, setConfig] = useState({
    audioAssistance: false,
    soundEffects: false
  });
  const [connectionError, setConnectionError] = useState('');

  // Global Alt + Left Arrow shortcut to return to menu
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        setScreen('home');
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, []);

  const attachSocketListeners = (s: Socket) => {
    s.on('connect', () => {
      setConnectionError('');
    });

    s.on('connect_error', () => {
      setConnectionError('Unable to connect to LAN server. Please make sure the server is running.');
    });

    s.on('room-updated', (updatedRoom: Room) => {
      setRoom(updatedRoom);
      setScreen('lobby');
    });

    s.on('game-started', (startedRoom: Room) => {
      setRoom(startedRoom);
      setScreen('game');
    });

    s.on('game-state-updated', (updatedRoom: Room) => {
      setRoom(updatedRoom);
      setScreen('game');
    });

    s.on('typing-state-updated', (updatedRoom: Room) => {
      setRoom(updatedRoom);
      setScreen('game');
    });

    s.on('timer-tick', ({ timerRemaining, totalGameTimerRemaining }: { timerRemaining: number; totalGameTimerRemaining?: number }) => {
      setRoom(prev => prev ? {
        ...prev,
        timerRemaining,
        totalGameTimerRemaining: totalGameTimerRemaining ?? prev.totalGameTimerRemaining
      } : null);
    });

    s.on('game-over', (gameOverRoom: Room) => {
      setRoom(gameOverRoom);
      setScreen('gameover');
    });

    s.on('player-disconnected', ({ room: updatedRoom }) => {
      setRoom(updatedRoom);
    });
  };

  useEffect(() => {
    const onlineServerUrl = (import.meta as any).env.VITE_WORDARENA_SERVER_URL || undefined;
    const newSocket = onlineServerUrl ? io(onlineServerUrl) : io();
    setSocket(newSocket);
    attachSocketListeners(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleCreateRoom = (playerName: string, totalGameTime: number, turnTime: number, gameType: 'word-chain' | 'typing-basket', category: string) => {
    if (!socket) return;
    socket.emit('create-room', { playerName, totalGameTime, turnTime, gameType, category, config }, (response: { success: boolean; code?: string; room?: Room; hostIp?: string; message?: string }) => {
      if (response.success && response.room) {
        const fullRoom = { ...response.room, hostIp: response.hostIp };
        setRoom(fullRoom);
        setScreen('lobby');
      } else {
        alert(response.message || 'Failed to create room');
      }
    });
  };

  const handleJoinRoom = (hostIpOrUrl: string, code: string, playerName: string) => {
    let targetUrl: string | undefined = undefined;
    const trimmed = hostIpOrUrl ? hostIpOrUrl.trim() : '';

    if (trimmed) {
      if (trimmed === 'localhost' || trimmed === '127.0.0.1') {
        targetUrl = (import.meta as any).env.VITE_WORDARENA_SERVER_URL || undefined;
      } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        targetUrl = trimmed;
      } else {
        // assume LAN IP address on port 3000
        targetUrl = `http://${trimmed}:3000`;
      }
    } else {
      targetUrl = (import.meta as any).env.VITE_WORDARENA_SERVER_URL || undefined;
    }
    
    if (socket) {
      socket.disconnect();
    }
    const newSocket = targetUrl ? io(targetUrl) : io();
    setSocket(newSocket);
    attachSocketListeners(newSocket);

    newSocket.on('connect', () => {
      setConnectionError('');
      newSocket.emit('join-room', { code, playerName }, (response: { success: boolean; room?: Room; message?: string }) => {
        if (response.success && response.room) {
          setRoom(response.room);
          setScreen('lobby');
        } else {
          alert(response.message || 'Failed to join room. Please check Host IP / Server URL and Room Code.');
        }
      });
    });

    newSocket.on('connect_error', () => {
      alert(`Unable to connect to server at ${targetUrl || 'local server'}. Please verify network connection and server URL.`);
    });
  };

  const handleStartVsComputer = (gameType: 'word-chain' | 'typing-basket', totalGameTime: number, turnTime: number, category: string) => {
    setVsComputerConfig({ gameType, totalGameTime, turnTime, category });
    if (gameType === 'word-chain') {
      setScreen('word-chain-vs-computer');
    } else {
      setScreen('typing-basket-vs-computer');
    }
  };

  const handleUpdateConfig = (newConfig: { audioAssistance?: boolean; soundEffects?: boolean }) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    if (room && socket) {
      socket.emit('update-config', { code: room.code, config: updated });
    }
  };

  const handleStartGame = () => {
    if (!socket || !room) return;
    socket.emit('start-game', { code: room.code });
  };

  const handleSubmitWord = (word: string) => {
    if (!socket || !room) return;
    socket.emit('submit-word', { code: room.code, word });
  };

  const handleSubmitTypingWord = (word: string) => {
    if (!socket || !room) return;
    socket.emit('submit-typing-word', { code: room.code, word });
  };

  const isHost = Boolean(room && socket && room.hostId === socket.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
      {connectionError && (
        <div className="bg-rose-900/80 text-rose-200 px-4 py-2 text-center text-sm font-medium z-50 sticky top-0">
          {connectionError}
        </div>
      )}

      {screen === 'welcome' && (
        <WelcomeScreen
          onEnter={() => setScreen('home')}
          onNavigate={(s) => setScreen(s)}
          soundEffects={config.soundEffects}
        />
      )}

      {screen === 'home' && (
        <HomeScreen
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onStartVsComputer={handleStartVsComputer}
          onNavigate={(s) => setScreen(s)}
          soundEffects={config.soundEffects}
        />
      )}

      {screen === 'lobby' && room && (
        <RoomLobbyScreen
          room={room}
          isHost={isHost}
          onStartGame={handleStartGame}
          onLeaveRoom={() => window.location.reload()}
          soundEffects={config.soundEffects}
        />
      )}

      {screen === 'game' && room && socket && (
        room.gameType === 'typing-basket' ? (
          <TypingBasketGameScreen
            room={room}
            socketId={socket.id || ''}
            onSubmitTypingWord={handleSubmitTypingWord}
          />
        ) : (
          <GameScreen
            room={room}
            socketId={socket.id || ''}
            onSubmitWord={handleSubmitWord}
          />
        )
      )}

      {screen === 'gameover' && room && (
        room.gameType === 'typing-basket' ? (
          <TypingBasketGameOverScreen
            room={room}
            onPlayAgain={() => setScreen('lobby')}
            onHome={() => window.location.reload()}
            soundEffects={config.soundEffects}
          />
        ) : (
          <GameOverScreen
            room={room}
            onPlayAgain={() => setScreen('lobby')}
            onHome={() => window.location.reload()}
            soundEffects={config.soundEffects}
          />
        )
      )}

      {screen === 'word-chain-vs-computer' && (
        <WordChainVsComputerScreen
          totalGameTime={vsComputerConfig.totalGameTime}
          turnTime={vsComputerConfig.turnTime}
          soundEffects={config.soundEffects}
          audioAssistance={config.audioAssistance}
          onBackToHome={() => setScreen('home')}
        />
      )}

      {screen === 'typing-basket-vs-computer' && (
        <TypingBasketVsComputerScreen
          category={vsComputerConfig.category}
          gameTime={vsComputerConfig.totalGameTime}
          soundEffects={config.soundEffects}
          audioAssistance={config.audioAssistance}
          onBackToHome={() => setScreen('home')}
        />
      )}

      {screen === 'typing-school' && (
        <TypingSchoolScreen
          onBackToHome={() => setScreen('home')}
          soundEffects={config.soundEffects}
          audioAssistance={config.audioAssistance}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          config={config}
          onUpdateConfig={handleUpdateConfig}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'how-to-play' && (
        <HowToPlayScreen onBack={() => setScreen('home')} />
      )}

      {screen === 'accessibility-info' && (
        <AccessibilityInfoScreen onBack={() => setScreen('home')} />
      )}
    </div>
  );
}
