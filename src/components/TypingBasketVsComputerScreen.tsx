import React, { useState, useEffect, useRef } from 'react';
import { Clock, Send, AlertCircle, Trophy, ArrowLeft, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { TYPING_CATEGORIES, shuffleArray } from '../games/typing-basket/categories';
import { getItemIcon } from '../games/typing-basket/items';

interface TypingBasketVsComputerScreenProps {
  category: string;
  gameTime: number;
  soundEffects: boolean;
  audioAssistance: boolean;
  playerName?: string;
  onBackToHome: () => void;
}

export const TypingBasketVsComputerScreen: React.FC<TypingBasketVsComputerScreenProps> = ({
  category,
  gameTime,
  soundEffects,
  audioAssistance,
  playerName = 'You',
  onBackToHome
}) => {
  const catData = TYPING_CATEGORIES[category] || TYPING_CATEGORIES.fruits;
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTargetWord, setCurrentTargetWord] = useState('');
  const [studentScore, setStudentScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [studentBasket, setStudentBasket] = useState<string[]>([]);
  const [computerBasket, setComputerBasket] = useState<string[]>([]);
  const [timerRemaining, setTimerRemaining] = useState(gameTime);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [wordInput, setWordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [announcement, setAnnouncement] = useState('');
  
  // Falling animation state
  const [fallingItem, setFallingItem] = useState<{ word: string; target: 'student' | 'computer' } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Keep ref for latest scores and timer for F3 listener
  const stateRef = useRef({
    studentScore,
    computerScore,
    timerRemaining,
    gameOver,
    winner,
    currentTargetWord
  });

  useEffect(() => {
    stateRef.current = {
      studentScore,
      computerScore,
      timerRemaining,
      gameOver,
      winner,
      currentTargetWord
    };
  });

  // Initialize randomized sequence & immediate target word announcement
  useEffect(() => {
    const shuffled = shuffleArray(catData.words);
    setShuffledWords(shuffled);
    setCurrentIndex(0);
    const initialWord = shuffled[0] || 'apple';
    setCurrentTargetWord(initialWord);
    
    const speech = `Type ${initialWord}.`;
    setAnnouncement(speech);
    if (audioAssistance) {
      soundManager.speak(speech);
    }
  }, [category, audioAssistance]);

  // When currentTargetWord changes during play
  useEffect(() => {
    if (!currentTargetWord || gameOver) return;
    const speech = `Type ${currentTargetWord}.`;
    setAnnouncement(speech);
    if (audioAssistance) {
      soundManager.speak(speech);
    }
  }, [currentTargetWord, audioAssistance, gameOver]);

  // Focus input
  useEffect(() => {
    if (!gameOver && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, gameOver]);

  // Global F2 (Repeat Target), F3 (Repeat Status), and Alt + Left Arrow handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const st = stateRef.current;
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        onBackToHome();
        return;
      }
      if (e.key === 'F2') {
        e.preventDefault();
        e.stopPropagation();
        if (st.currentTargetWord && !st.gameOver) {
          const speech = `Type ${st.currentTargetWord}.`;
          setAnnouncement(speech);
          soundManager.speak(speech);
        }
      } else if (e.key === 'F3') {
        e.preventDefault();
        e.stopPropagation();
        let statusSpeech = '';
        if (st.gameOver) {
          statusSpeech = `Game over. ${st.winner || 'Game over'}. Your score is ${st.studentScore}. Computer score is ${st.computerScore}.`;
        } else {
          statusSpeech = `Your score is ${st.studentScore}. Computer score is ${st.computerScore}. Time remaining ${st.timerRemaining} seconds.`;
        }
        setAnnouncement(statusSpeech);
        soundManager.speak(statusSpeech);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onBackToHome]);

  // Timer countdown & Computer AI interval (every 7 seconds)
  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setTimerRemaining(prev => {
        if (prev <= 1) {
          setGameOver(true);
          const st = stateRef.current;
          const res = st.studentScore > st.computerScore ? 'You win' : st.studentScore < st.computerScore ? 'Computer wins' : 'Draw';
          setWinner(res);
          const finalAnnouncement = `Game over. ${res}. Your score is ${st.studentScore}. Computer score is ${st.computerScore}.`;
          setAnnouncement(finalAnnouncement);
          if (audioAssistance) soundManager.speak(finalAnnouncement);
          if (soundEffects) soundManager.play('win');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Computer AI attempts to score on the current target word every 7 seconds
    const aiInterval = setInterval(() => {
      const st = stateRef.current;
      if (st.gameOver || !st.currentTargetWord) return;
      
      const targetWordToScore = st.currentTargetWord;
      
      // Trigger animation towards computer basket
      setFallingItem({ word: targetWordToScore, target: 'computer' });
      if (soundEffects) soundManager.play('correct');

      setTimeout(() => {
        setComputerScore(s => {
          const newCompScore = s + 1;
          const updatedAnnouncement = `Computer scored. Computer score is now ${newCompScore}.`;
          setAnnouncement(updatedAnnouncement);
          if (audioAssistance) {
            soundManager.speak(updatedAnnouncement);
          }
          return newCompScore;
        });
        setComputerBasket(b => [...b, targetWordToScore]);
        setFallingItem(null);

        // Advance to next word
        setCurrentIndex(idx => {
          const nextIdx = idx + 1;
          if (nextIdx < shuffledWords.length) {
            setCurrentTargetWord(shuffledWords[nextIdx]);
            return nextIdx;
          } else {
            setGameOver(true);
            const stNow = stateRef.current;
            const finalRes = stNow.studentScore >= stNow.computerScore + 1 ? 'You win' : 'Computer wins';
            setWinner(finalRes);
            const finalAnnouncement = `Game over. ${finalRes}. Your score is ${stNow.studentScore}. Computer score is ${stNow.computerScore + 1}.`;
            setAnnouncement(finalAnnouncement);
            if (audioAssistance) soundManager.speak(finalAnnouncement);
            return idx;
          }
        });
      }, 700);

    }, 7000);

    return () => {
      clearInterval(timer);
      clearInterval(aiInterval);
    };
  }, [gameOver, shuffledWords, soundEffects, audioAssistance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameOver || !wordInput.trim()) return;

    const trimmed = wordInput.trim().toLowerCase();
    if (trimmed === currentTargetWord.toLowerCase()) {
      const correctWord = currentTargetWord;
      if (soundEffects) soundManager.play('correct');
      
      const newStudentScore = studentScore + 1;
      const msg = `Correct. ${correctWord} added to your basket. Your score is now ${newStudentScore}.`;
      setSuccessMessage(msg);
      setAnnouncement(msg);
      if (audioAssistance) soundManager.speak(msg);
      setTimeout(() => setSuccessMessage(''), 1500);

      // Trigger animation towards student basket
      setFallingItem({ word: correctWord, target: 'student' });
      setTimeout(() => {
        setStudentScore(newStudentScore);
        setStudentBasket(b => [...b, correctWord]);
        setFallingItem(null);

        // Advance to next word
        const nextIdx = currentIndex + 1;
        if (nextIdx < shuffledWords.length) {
          setCurrentIndex(nextIdx);
          setCurrentTargetWord(shuffledWords[nextIdx]);
        } else {
          setGameOver(true);
          const finalRes = newStudentScore >= computerScore ? 'You win' : 'Computer wins';
          setWinner(finalRes);
          const finalAnnouncement = `Game over. ${finalRes}. Your score is ${newStudentScore}. Computer score is ${computerScore}.`;
          setAnnouncement(finalAnnouncement);
          if (audioAssistance) soundManager.speak(finalAnnouncement);
        }
      }, 700);

      setWordInput('');
      setErrorMessage('');
    } else {
      if (soundEffects) soundManager.play('wrong');
      const err = 'Incorrect. Try again.';
      setErrorMessage(err);
      setAnnouncement(err);
      if (audioAssistance) soundManager.speak(err);
      setWordInput('');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col p-3 md:p-6 selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {announcement}
      </div>

      {/* Falling Item Animation Overlay */}
      {fallingItem && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="flex flex-col items-center animate-bounce transition-all duration-700 transform scale-150">
            <span className="text-5xl md:text-6xl drop-shadow-2xl">{getItemIcon(fallingItem.word, category)}</span>
            <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black rounded-full text-xs shadow mt-2 uppercase">
              falling to {fallingItem.target} basket!
            </span>
          </div>
        </div>
      )}

      {/* 1. GAME HEADER */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 mb-4 shadow-xl">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg md:rounded-xl text-xs md:text-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Menu
        </button>
        <div className="text-center">
          <h1 className="text-xs md:text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
            TYPING BASKET (VS COMPUTER)
          </h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-slate-950 border border-slate-800 rounded-lg md:rounded-xl">
          <Clock className="w-4 h-4 md:w-5 md:h-5 text-amber-400 animate-pulse" />
          <span className="font-mono text-sm md:text-xl font-bold text-amber-400">
            {formatTime(timerRemaining)}
          </span>
        </div>
      </header>

      {!gameOver ? (
        <div className="max-w-4xl w-full mx-auto flex flex-col gap-4 flex-1">
          
          {/* 2. TARGET WORD SECTION */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1 block">
              Target Word (Press F2 to Repeat Word, F3 for Status)
            </span>
            <div className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase bg-gradient-to-r from-slate-950 to-indigo-950 border border-indigo-500/40 py-4 px-4 rounded-xl md:rounded-2xl shadow-inner text-amber-300 drop-shadow mb-2">
              {currentTargetWord}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm md:text-lg">
              <span className="text-slate-400 font-medium">Target Item:</span>
              <span className="text-2xl">{getItemIcon(currentTargetWord, category)}</span>
              <span className="text-xs text-slate-400 capitalize">({currentTargetWord})</span>
            </div>
          </div>

          {/* 3. INPUT + SUBMIT SECTION */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl">
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
                className="flex-1 px-5 py-4 bg-slate-950 border-2 border-indigo-500/60 rounded-xl md:rounded-2xl text-xl text-white font-bold text-center placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500 shadow-inner"
                autoComplete="off"
                autoFocus
              />
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl md:rounded-2xl shadow-xl text-lg transition-all cursor-pointer flex items-center justify-center gap-2 transform active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
                SUBMIT
              </button>
            </form>

            {errorMessage && (
              <div className="mt-3 py-2 px-4 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold text-center animate-shake">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mt-3 py-2 px-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold text-center animate-bounce">
                {successMessage}
              </div>
            )}
          </div>

          {/* 4. SIDE-BY-SIDE BASKETS AT THE BOTTOM */}
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            
            {/* YOU (STUDENT) BASKET */}
            <div className="bg-slate-900/95 border-2 border-indigo-500/60 rounded-2xl md:rounded-3xl p-4 flex flex-col items-center shadow-xl relative overflow-hidden justify-between">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500" />
              <div className="w-full text-center mb-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">YOU</span>
                <span className="text-sm md:text-lg font-black text-white truncate block">{playerName || 'You'}</span>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-500 text-slate-950 font-black rounded-full text-xs shadow">
                  Score: {studentScore}
                </span>
              </div>

              {/* Graphical Basket */}
              <div className="w-full h-24 md:h-32 bg-amber-800/40 border-2 border-amber-600 rounded-b-2xl md:rounded-b-3xl rounded-t-md flex flex-col items-center justify-end p-2 relative shadow-inner my-1">
                <div className="absolute inset-x-0 top-0 h-2 border-b border-amber-600/60" />
                <div className="flex flex-wrap gap-1 items-end justify-center max-h-16 md:max-h-24 overflow-y-auto w-full px-1">
                  {studentBasket.map((word, i) => (
                    <span key={i} className="text-2xl md:text-3xl animate-fade-in drop-shadow-md" title={word}>
                      {getItemIcon(word, category)}
                    </span>
                  ))}
                </div>
                {studentBasket.length === 0 && (
                  <span className="text-[10px] text-amber-300/60 font-semibold mb-2">Empty Basket</span>
                )}
              </div>
              
              <span className="text-[10px] text-slate-400 font-medium">Items: {studentBasket.length}</span>
            </div>

            {/* COMPUTER AI BASKET */}
            <div className="bg-slate-900/95 border-2 border-rose-500/60 rounded-2xl md:rounded-3xl p-4 flex flex-col items-center shadow-xl relative overflow-hidden justify-between">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />
              <div className="w-full text-center mb-2">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">OPPONENT</span>
                <span className="text-sm md:text-lg font-black text-white truncate block">Computer AI</span>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-rose-500 text-slate-950 font-black rounded-full text-xs shadow">
                  Score: {computerScore}
                </span>
              </div>

              {/* Graphical Basket */}
              <div className="w-full h-24 md:h-32 bg-amber-800/40 border-2 border-amber-600 rounded-b-2xl md:rounded-b-3xl rounded-t-md flex flex-col items-center justify-end p-2 relative shadow-inner my-1">
                <div className="absolute inset-x-0 top-0 h-2 border-b border-amber-600/60" />
                <div className="flex flex-wrap gap-1 items-end justify-center max-h-16 md:max-h-24 overflow-y-auto w-full px-1">
                  {computerBasket.map((word, i) => (
                    <span key={i} className="text-2xl md:text-3xl animate-fade-in drop-shadow-md" title={word}>
                      {getItemIcon(word, category)}
                    </span>
                  ))}
                </div>
                {computerBasket.length === 0 && (
                  <span className="text-[10px] text-amber-300/60 font-semibold mb-2">Empty Basket</span>
                )}
              </div>

              <span className="text-[10px] text-slate-400 font-medium">Items: {computerBasket.length}</span>
            </div>

          </div>

        </div>
      ) : (
        /* Game Over Screen */
        <div className="max-w-md w-full mx-auto my-auto bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-8 text-center shadow-2xl">
          <Trophy className="w-20 h-20 text-amber-400 mx-auto mb-4 animate-bounce" />
          <h1 className="text-4xl font-black text-white mb-2">GAME OVER</h1>
          <p className="text-3xl font-extrabold text-amber-400 mb-6">{winner}</p>
          <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
            <div>
              <span className="block text-xs text-slate-400 font-semibold mb-1">Your Score</span>
              <strong className="text-2xl text-emerald-400">{studentScore}</strong>
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-semibold mb-1">Computer</span>
              <strong className="text-2xl text-rose-400">{computerScore}</strong>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-2xl shadow-xl text-xl transition-all cursor-pointer"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

    </main>
  );
};
